import type { ReactNode } from "react";

// Card wrapper for the Market Trends charts: title, controls, chart, then the
// plain-English takeaway, "Data as of" date and source credit.
export default function ChartFrame({
  id,
  title,
  description,
  controls,
  children,
  insight,
  asOf,
  source,
}: {
  id: string; // jump-to address used by search, e.g. "chart-performance"
  title: string;
  description: string;
  controls?: ReactNode;
  children: ReactNode;
  insight: string;
  asOf: string;
  source: ReactNode;
}) {
  return (
    <section id={id} className="rounded-lg border border-border bg-surface p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-medium">{title}</h3>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
        {controls}
      </header>
      {children}
      <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted">
        <span className="font-medium text-primary">What it means: </span>
        {insight}
      </p>
      <p className="mt-3 text-xs text-muted">
        Data as of {asOf} · Source: {source}
      </p>
    </section>
  );
}
