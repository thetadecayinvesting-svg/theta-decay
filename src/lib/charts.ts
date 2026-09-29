// The charts on the Economic Indicators and Market Risk pages: what each shows,
// where its data comes from, and the words people might search for it by.
// Shared by server and browser code (the search bar reads it), so keep it free
// of server imports.

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
  keywords: string[]; // other names people search for (see the search bar)
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
    keywords: ["inflation", "consumer price index", "prices", "cost of living", "cpiaucsl"],
    description: "Consumer prices, % change from a year ago",
    unit: "%",
    period: "month",
    lines: [{ key: "cpi", fredId: "CPIAUCSL", label: "CPI", units: "pc1" }],
  },
  {
    key: "unrate",
    section: "economy",
    title: "Unemployment Rate",
    keywords: ["unemployment", "jobless", "jobs", "labor market", "employment", "unrate"],
    description: "Share of the labor force without a job",
    unit: "%",
    period: "month",
    lines: [{ key: "unrate", fredId: "UNRATE", label: "Unemployment" }],
  },
  {
    key: "fedfunds",
    section: "economy",
    title: "Fed Funds Rate",
    keywords: ["fed", "federal reserve", "interest rates", "rates", "fomc", "rate cuts", "rate hikes", "fedfunds"],
    description: "Effective federal funds rate, monthly average",
    unit: "%",
    period: "month",
    lines: [{ key: "fedfunds", fredId: "FEDFUNDS", label: "Fed funds" }],
  },
  {
    key: "dgs10",
    section: "economy",
    title: "10-Year Treasury Yield",
    keywords: ["10 year", "10-year", "treasury", "treasuries", "yield", "bonds", "rates", "interest rates", "dgs10"],
    description: "Market yield on 10-year Treasuries, weekly average",
    unit: "%",
    period: "week",
    lines: [{ key: "dgs10", fredId: "DGS10", label: "10Y yield", frequency: "w" }],
  },
  {
    key: "gdp",
    section: "economy",
    title: "Real GDP Growth",
    keywords: ["growth", "economy", "gross domestic product", "recession", "output"],
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
    keywords: ["volatility", "fear index", "fear gauge", "fear", "options", "vixcls"],
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
    keywords: ["credit spreads", "spreads", "high yield", "junk bonds", "investment grade", "corporate bonds", "oas", "credit risk"],
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
    keywords: ["credit spreads", "spreads", "baa", "moody's", "corporate bonds", "credit risk", "recession"],
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
    keywords: ["margin debt", "leverage", "borrowing", "finra", "brokers"],
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

// The "Details" panel under a chart line (source, release, units, notes…),
// modelled on the Notes box of a FRED series page.
export type SeriesDetails = {
  seriesId: string;
  title: string;
  sources: { name: string; link?: string }[];
  release: { name: string; link?: string } | null;
  units: string; // what the chart shows, including any transformation
  frequency: string;
  notes: string;
  citation: string;
  url: string; // where to see the original series
  lastUpdated?: string;
};
