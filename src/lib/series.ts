import { CHARTS, type ChartConfig, type LineConfig, type SeriesDetails } from "./charts";
import { getMarginDebt } from "./finra";
import { getSeries, getSeriesInfo, hasFredKey, type SeriesInfo } from "./fred";

export * from "./charts";

// One date on a chart, with a value for each line that has data that day.
export type Row = { date: string; values: Record<string, number> };

export type ChartResult = ChartConfig & {
  rows: Row[];
  details: (SeriesDetails | null)[]; // one per line; null if it couldn't load
  error?: string;
};

// "September 29, 2026": the retrieval date used in citations.
function citationDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

const FINRA_MARGIN_URL =
  "https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics";

// Details for one chart line, from FRED's series information (or FINRA's page).
async function lineDetails(line: LineConfig): Promise<SeriesDetails | null> {
  if (line.finra) {
    return {
      seriesId: "FINRA margin statistics",
      title: "Debit Balances in Customers' Securities Margin Accounts",
      sources: [{ name: "FINRA", link: "https://www.finra.org/" }],
      release: { name: "Margin Statistics", link: FINRA_MARGIN_URL },
      units: "Millions of Dollars (shown here in trillions), Not Seasonally Adjusted",
      frequency: "Monthly",
      notes:
        "FINRA collects these figures from its member firms under FINRA Rule 4521(d) and generally publishes each month's data in the third week of the following month.\n\nThrough January 2010, the NYSE and FINRA collected similar margin data separately. Month-to-month changes can partly reflect firms changing how they calculate the balances they report.",
      citation: `FINRA, Margin Statistics: Debit Balances in Customers' Securities Margin Accounts, retrieved from ${FINRA_MARGIN_URL}, ${citationDate()}.`,
      url: FINRA_MARGIN_URL,
    };
  }
  try {
    return detailsFromInfo(await getSeriesInfo(line.fredId!), line);
  } catch (err) {
    console.error(`Couldn't load details for ${line.fredId}:`, err);
    return null;
  }
}

// Turn FRED's series information into the Details panel contents.
function detailsFromInfo(info: SeriesInfo, line: Pick<LineConfig, "units" | "frequency">): SeriesDetails {
  const units =
    line.units === "pc1"
      ? `Percent Change from Year Ago (calculated by FRED from ${info.units}, ${info.seasonalAdjustment})`
      : `${info.units}, ${info.seasonalAdjustment}`;
  const frequency =
    line.frequency === "w" ? `Weekly average of ${info.frequency.toLowerCase()} data` : info.frequency;
  const sourceNames = info.sources.map((src) => src.name).join("; ") || "FRED";
  const url = `https://fred.stlouisfed.org/series/${info.id}`;
  return {
    seriesId: info.id,
    title: info.title,
    sources: info.sources,
    release: info.release,
    units,
    frequency,
    notes: info.notes,
    citation: `${sourceNames}, ${info.title} [${info.id}], retrieved from FRED, Federal Reserve Bank of St. Louis; ${url}, ${citationDate()}.`,
    url,
    lastUpdated: info.lastUpdated,
  };
}

// Join each line's observations into one row per date.
function mergeLines(lines: { key: string; points: { date: string; value: number }[] }[]): Row[] {
  const byDate = new Map<string, Row>();
  for (const line of lines) {
    for (const p of line.points) {
      let row = byDate.get(p.date);
      if (!row) {
        row = { date: p.date, values: {} };
        byDate.set(p.date, row);
      }
      row.values[line.key] = p.value;
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// Load one page's charts ("economy" or "risk") in parallel, starting in 2000.
// Results are cached and re-checked with FRED at most once an hour (see fred.ts).
export async function getDashboardData(section: ChartConfig["section"]): Promise<{
  charts: ChartResult[];
  missingKey: boolean;
}> {
  const pageCharts = CHARTS.filter((c) => c.section === section);
  if (!hasFredKey()) {
    return {
      charts: pageCharts.map((c) => ({ ...c, rows: [], details: c.lines.map(() => null) })),
      missingKey: true,
    };
  }

  const charts = await Promise.all(
    pageCharts.map(async (chart): Promise<ChartResult> => {
      // Details load alongside the data; a failure there never hides the chart.
      const detailsPromise = Promise.all(chart.lines.map(lineDetails));
      try {
        const lines = await Promise.all(
          chart.lines.map(async (line) => ({
            key: line.key,
            points: line.finra
              ? await getMarginDebt("2000-01-01")
              : await getSeries(line.fredId!, {
                  start: "2000-01-01",
                  units: line.units,
                  frequency: line.frequency,
                }),
          })),
        );
        return { ...chart, rows: mergeLines(lines), details: await detailsPromise };
      } catch (err) {
        return {
          ...chart,
          rows: [],
          details: await detailsPromise,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  return { charts, missingKey: false };
}

// FRED's frequency ("Daily, Close", "Weekly, Ending Friday", "Annual"…) → chart period.
function periodFor(frequency: string): ChartConfig["period"] {
  const f = frequency.toLowerCase();
  if (f.startsWith("daily")) return "day";
  if (f.startsWith("weekly") || f.startsWith("biweekly")) return "week";
  if (f.startsWith("monthly")) return "month";
  if (f.startsWith("quarterly")) return "quarter";
  return "year";
}

// Any FRED series as a chart (for "Explore any FRED series"), from 2000 on.
export async function getCustomChart(seriesId: string): Promise<ChartResult> {
  const [info, points] = await Promise.all([
    getSeriesInfo(seriesId),
    getSeries(seriesId, { start: "2000-01-01" }),
  ]);
  const hasNegative = points.some((p) => p.value < 0);
  const hasPositive = points.some((p) => p.value > 0);
  return {
    key: `custom-${info.id}`,
    section: "economy",
    title: info.title,
    keywords: [],
    description: `${info.units} · ${info.frequency}`,
    unit: info.units.startsWith("Percent") ? "%" : "",
    period: periodFor(info.frequency),
    lines: [{ key: "value", fredId: info.id, label: info.title }],
    zeroLine: hasNegative && hasPositive,
    rows: points.map((p) => ({ date: p.date, values: { value: p.value } })),
    details: [detailsFromInfo(info, {})],
  };
}
