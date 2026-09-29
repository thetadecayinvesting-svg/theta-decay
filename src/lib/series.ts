import { CHARTS, type ChartConfig } from "./charts";
import { getMarginDebt } from "./finra";
import { getSeries, hasFredKey } from "./fred";

export * from "./charts";

// One date on a chart, with a value for each line that has data that day.
export type Row = { date: string; values: Record<string, number> };

export type ChartResult = ChartConfig & {
  rows: Row[];
  error?: string;
};

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
    return { charts: pageCharts.map((c) => ({ ...c, rows: [] })), missingKey: true };
  }

  const charts = await Promise.all(
    pageCharts.map(async (chart): Promise<ChartResult> => {
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
        return { ...chart, rows: mergeLines(lines) };
      } catch (err) {
        return { ...chart, rows: [], error: err instanceof Error ? err.message : String(err) };
      }
    }),
  );

  return { charts, missingKey: false };
}
