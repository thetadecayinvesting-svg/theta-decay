import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Theta Decay Investing",
};

const SOURCES = [
  {
    name: "FRED®, Federal Reserve Bank of St. Louis",
    what: "Economic indicators, market risk gauges, index closes and release dates",
  },
  { name: "Federal Reserve", what: "FOMC meeting schedule" },
  { name: "FINRA", what: "Monthly margin statistics" },
  { name: "Coinbase (via FRED)", what: "Bitcoin prices" },
  { name: "TradingView", what: "Live price widgets" },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="mt-2 text-muted">
          Theta Decay Investing puts the economic data that moves markets in one place:
          what&apos;s coming up, what the latest numbers say, and how nervous investors are.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">What&apos;s here</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-primary">Economic Calendar:</span> Fed
            decisions, inflation, jobs and GDP release dates.
          </li>
          <li>
            <span className="font-medium text-primary">Economic Indicators:</span>{" "}
            inflation, unemployment, interest rates and growth.
          </li>
          <li>
            <span className="font-medium text-primary">Market Risk:</span> volatility,
            credit spreads and margin debt.
          </li>
          <li>
            <span className="font-medium text-primary">Markets:</span> live prices and
            long-term performance for stocks and Bitcoin.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Data sources</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface font-table text-sm">
          {SOURCES.map((s) => (
            <li key={s.name} className="px-5 py-3">
              <div className="font-medium">{s.name}</div>
              <div className="text-muted">{s.what}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-muted">
        <p className="font-medium text-primary">Not investment advice</p>
        <p className="mt-1">
          Everything on this site is for information and education only. It isn&apos;t a
          recommendation to buy or sell anything. Data can be delayed or revised, so check
          official sources before making decisions.
        </p>
      </section>
    </div>
  );
}
