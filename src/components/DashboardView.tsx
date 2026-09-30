"use client";

import { useState } from "react";
import ChartCard from "./ChartCard";
import CustomFredCharts from "./CustomFredCharts";
import RangeToggle, { RANGES, type Range } from "./RangeToggle";
import { useSettings } from "./SettingsProvider";
import { yearsAgo } from "@/lib/chartFormat";
import type { ChartResult } from "@/lib/series";

// These charts load from 2000, so "Max" is labelled "Since 2000" here.
const DASHBOARD_RANGES: Range[] = [...RANGES.slice(0, 3), { label: "Since 2000", years: 0 }];

export default function DashboardView({
  charts,
  explore = false,
}: {
  charts: ChartResult[];
  explore?: boolean; // show "Explore any FRED series" below the charts
}) {
  const { settings } = useSettings();
  // Until the visitor picks a range here, follow their default from Settings.
  const [picked, setPicked] = useState<Range | null>(null);
  const fromSettings =
    DASHBOARD_RANGES[RANGES.findIndex((r) => r.label === settings.defaultRange)] ??
    DASHBOARD_RANGES[2];
  const range = picked ?? fromSettings;
  const cutoff = yearsAgo(range.years);
  const spanYears = range.years || new Date().getFullYear() - 2000;

  return (
    <div className="space-y-6">
      <RangeToggle ranges={DASHBOARD_RANGES} value={range} onChange={setPicked} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {charts.map((c) => (
          <ChartCard
            key={c.key}
            chart={c}
            rows={cutoff ? c.rows.filter((r) => r.date >= cutoff) : c.rows}
            spanYears={spanYears}
          />
        ))}
      </div>
      {explore && <CustomFredCharts cutoff={cutoff} spanYears={spanYears} />}
    </div>
  );
}
