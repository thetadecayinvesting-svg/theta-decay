import { getMarginDebt } from "./finra";
import { getSeries, hasFredKey } from "./fred";

// One line on a chart = one FRED series, or FINRA's margin debt spreadsheet.
export type LineConfig = {
  key: string;
  fredId?: string;
  finra?: "marginDebt";
  label: string;
  units?: string; // FRED transformation, e.g. "pc1" = % change from a year ago
  frequency?: string; // FRED aggregation, e.g. "w" = weekly average
};

export type ChartConfig = {
  key: string;
  section: "economy" | "risk";
  title: string;
  description: string;
  insight?: string; // one sentence on what it means for investors
  note?: string; // caveat about the data itself
  unit: string; // shown after values, e.g. "%"
  prefix?: string; // shown before values, e.g. "$"
  period: "day" | "week" | "month" | "quarter"; // how often a new reading arrives
  lines: LineConfig[]; // colored --chart-1, --chart-2, … in this order
  zeroLine?: boolean;
  zeroBased?: boolean; // start the y-axis at 0 (for amounts, not rates)
};

export const CHARTS: ChartConfig[] = [
  // ---- Economy -------------------------------------------------------
  {
    key: "cpi",
    section: "economy",
    title: "CPI Inflation",
    description: "Consumer prices, % change from a year ago",
    unit: "%",
    period: "month",
    lines: [{ key: "cpi", fredId: "CPIAUCSL", label: "CPI", units: "pc1" }],
  },
  {
    key: "unrate",
    section: "economy",
    title: "Unemployment Rate",
    description: "Share of the labor force without a job",
    unit: "%",
    period: "month",
    lines: [{ key: "unrate", fredId: "UNRATE", label: "Unemployment" }],
  },
  {
    key: "fedfunds",
    section: "economy",
    title: "Fed Funds Rate",
    description: "Effective federal funds rate, monthly average",
    unit: "%",
    period: "month",
    lines: [{ key: "fedfunds", fredId: "FEDFUNDS", label: "Fed funds" }],
  },
  {
    key: "dgs10",
    section: "economy",
    title: "10-Year Treasury Yield",
    description: "Market yield on 10-year Treasuries, weekly average",
    unit: "%",
    period: "week",
    lines: [{ key: "dgs10", fredId: "DGS10", label: "10Y yield", frequency: "w" }],
  },
  {
    key: "gdp",
    section: "economy",
    title: "Real GDP Growth",
    description: "Quarterly change, seasonally adjusted annual rate",
    unit: "%",
    period: "quarter",
    zeroLine: true,
    lines: [{ key: "gdp", fredId: "A191RL1Q225SBEA", label: "Real GDP" }],
  },

  // ---- Market Risk ---------------------------------------------------
  {
    key: "vix",
    section: "risk",
    title: "VIX Volatility Index",
    description: "Expected 30-day S&P 500 volatility, daily close",
    insight:
      "A rising VIX means traders expect bigger stock swings ahead: readings above 30 usually signal fear, while readings below 15 signal calm or even complacency.",
    unit: "",
    period: "day",
    lines: [{ key: "vix", fredId: "VIXCLS", label: "VIX" }],
  },
  {
    key: "oas",
    section: "risk",
    title: "Corporate Credit Spreads",
    description: "Extra yield over Treasuries (option-adjusted), daily close",
    insight:
      "Widening spreads mean lenders are demanding more pay to take on corporate risk, an early warning of economic stress that often shows up before stocks fall.",
    note: "FRED only provides the most recent 3 years of ICE BofA data.",
    unit: "%",
    period: "day",
    lines: [
      { key: "hy", fredId: "BAMLH0A0HYM2", label: "High yield" },
      { key: "ig", fredId: "BAMLC0A0CM", label: "Investment grade" },
    ],
  },
  {
    key: "baa10y",
    section: "risk",
    title: "Baa Corporate Spread",
    description: "Moody's Baa corporate bond yield minus 10-year Treasury, daily",
    insight:
      "This long-running gauge of corporate credit risk tends to jump heading into recessions, so a steady climb suggests the bond market sees trouble coming.",
    unit: "%",
    period: "day",
    lines: [{ key: "baa10y", fredId: "BAA10Y", label: "Baa − 10Y" }],
  },
  {
    key: "margin",
    section: "risk",
    title: "Margin Debt",
    description: "Money investors have borrowed from brokers to buy securities, monthly",
    insight:
      "Rising margin debt means investors are borrowing more to bet on stocks, and record highs can signal overconfidence that turns into forced selling when markets drop.",
    unit: "T",
    prefix: "$",
    zeroBased: true,
    period: "month",
    lines: [{ key: "margin", finra: "marginDebt", label: "Margin debt" }],
  },
];

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

// Load every dashboard chart from FRED in parallel, starting in 2000.
// Results are cached and re-checked with FRED at most once an hour (see fred.ts).
export async function getDashboardData(): Promise<{
  charts: ChartResult[];
  missingKey: boolean;
}> {
  if (!hasFredKey()) {
    return { charts: CHARTS.map((c) => ({ ...c, rows: [] })), missingKey: true };
  }

  const charts = await Promise.all(
    CHARTS.map(async (chart): Promise<ChartResult> => {
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
