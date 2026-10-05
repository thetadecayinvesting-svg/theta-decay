"use client";

import { useId, useState, type ReactNode } from "react";
import SeriesDetailsPanel from "../SeriesDetailsPanel";
import type { LineConfig, SeriesDetails } from "@/lib/charts";

// The FRED series behind a chart, for its Details panel (one entry per line).
export type ChartDetails = { lines: LineConfig[]; details: (SeriesDetails | null)[] };

// Card wrapper for the Market Trends charts: title, controls, chart, then the
// "Data as of" date, source credit and a Details button like the other charts.
export default function ChartFrame({
  id,
  title,
  description,
  controls,
  children,
  details,
  asOf,
  source,
}: {
  id: string; // jump-to address used by search, e.g. "chart-performance"
  title: string;
  description: string;
  controls?: ReactNode;
  children: ReactNode;
  details: ChartDetails;
  asOf: string;
  source: ReactNode;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const detailsId = useId();

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
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-xs text-muted">
        <p>
          Data as of {asOf} · Source: {source}
        </p>
        <button
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          aria-controls={detailsId}
          className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-hover ${
            showDetails ? "bg-surface-hover" : ""
          }`}
        >
          <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <rect x="3.5" y="3.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 7.5h6M7 10h6M7 12.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Details
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
            fill="none"
          >
            <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {showDetails && <SeriesDetailsPanel id={detailsId} lines={details.lines} details={details.details} />}
    </section>
  );
}
