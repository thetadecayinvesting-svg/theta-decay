"use client";

import { useState } from "react";
import ChartCard from "./ChartCard";
import RangeToggle, { RANGES, type Range } from "./RangeToggle";
import { yearsAgo } from "@/lib/chartFormat";
import type { ChartConfig, ChartResult } from "@/lib/series";

// The indicators load from 2000, so "Max" is labelled "Since 2000" here.
const DASHBOARD_RANGES: Range[] = [...RANGES.slice(0, 3), { label: "Since 2000", years: 0 }];

const SECTIONS: { key: ChartConfig["section"]; title: string; blurb: string }[] = [
  {
    key: "economy",
    title: "Economy",
    blurb: "Inflation, jobs, interest rates and growth.",
  },
  {
    key: "risk",
    title: "Market Risk",
    blurb: "How nervous stock and bond investors are right now.",
  },
];

export default function DashboardView({ charts }: { charts: ChartResult[] }) {
  const [range, setRange] = useState<Range>(DASHBOARD_RANGES[2]);
  const cutoff = yearsAgo(range.years);
  const spanYears = range.years || new Date().getFullYear() - 2000;

  return (
    <div className="space-y-12">
      <RangeToggle ranges={DASHBOARD_RANGES} value={range} onChange={setRange} />

      {SECTIONS.map((section) => (
        <section key={section.key} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-1 text-sm text-muted">{section.blurb}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {charts
              .filter((c) => c.section === section.key)
              .map((c) => (
                <ChartCard
                  key={c.key}
                  chart={c}
                  rows={cutoff ? c.rows.filter((r) => r.date >= cutoff) : c.rows}
                  spanYears={spanYears}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
