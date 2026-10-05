"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartFrame, { type ChartDetails } from "./ChartFrame";
import RangeToggle, { RANGES, type Range } from "../RangeToggle";
import { useSettings } from "../SettingsProvider";
import { formatPeriod, formatTick, lineColor, pickTicks, yearsAgo } from "@/lib/chartFormat";
import type { Point } from "@/lib/fred";

type Row = { date: string; sp: number; fed?: number };

// One row per S&P trading day, carrying that month's average fed funds rate.
function buildRows(sp: Point[], fed: Point[], cutoff: string): Row[] {
  const fedByMonth = new Map(fed.map((p) => [p.date.slice(0, 7), p.value]));
  return sp
    .filter((p) => !cutoff || p.date >= cutoff)
    .map((p) => ({ date: p.date, sp: p.value, fed: fedByMonth.get(p.date.slice(0, 7)) }));
}

function PanelTooltip({
  active,
  payload,
  field,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
  field: "sp" | "fed";
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const value = row[field];
  if (value === undefined) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <div className="text-xs text-muted">
        {field === "sp" ? formatPeriod(row.date, "day") : `${formatPeriod(row.date, "month")} avg`}
      </div>
      <div className="num text-sm font-semibold text-primary">
        {field === "sp"
          ? value.toLocaleString("en-US", { maximumFractionDigits: 0 })
          : `${value.toFixed(2)}%`}
      </div>
    </div>
  );
}

const axisTick = { fill: "var(--chart-axis)", fontSize: 11 };

export default function SpFedChart({ sp, fed, details }: { sp: Point[]; fed: Point[]; details: ChartDetails }) {
  const { settings } = useSettings();
  // Until the visitor picks a range here, follow their default from Settings.
  const [picked, setPicked] = useState<Range | null>(null);
  const range = picked ?? RANGES.find((r) => r.label === settings.defaultRange) ?? RANGES[2];
  const cutoff = yearsAgo(range.years);
  const rows = useMemo(() => buildRows(sp, fed, cutoff), [sp, fed, cutoff]);
  const spanYears = range.years || 10;
  const ticks = pickTicks(rows, spanYears);
  const latestSp = sp.at(-1);
  const latestFed = fed.at(-1);

  return (
    <ChartFrame
      id="chart-sp-fed"
      title="S&P 500 vs. Fed Funds Rate"
      description="Daily S&P 500 close (top) and the monthly average fed funds rate (bottom), on the same timeline"
      controls={<RangeToggle value={range} onChange={setPicked} />}
      details={details}
      asOf={
        latestSp && latestFed
          ? `${formatPeriod(latestSp.date, "day")} (S&P 500), ${formatPeriod(latestFed.date, "month")} (fed funds)`
          : "—"
      }
      source="FRED, Federal Reserve Bank of St. Louis. S&P 500 © S&P Dow Jones Indices LLC."
    >
      {rows.length === 0 ? (
        <div className="mt-5 grid h-80 place-items-center rounded-lg bg-surface-hover text-sm text-muted">
          No data yet
        </div>
      ) : (
        <div className="mt-5">
          <PanelLabel color={lineColor(0)} label="S&P 500" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} syncId="sp-fed" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="date" hide />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) => v.toLocaleString("en-US")}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  content={<PanelTooltip field="sp" />}
                  cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
                />
                <Line
                  type="linear"
                  dataKey="sp"
                  stroke={lineColor(0)}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4">
            <PanelLabel color={lineColor(1)} label="Fed funds rate" />
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} syncId="sp-fed" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="date"
                  ticks={ticks}
                  interval={0}
                  tickFormatter={(d: string) => formatTick(d, spanYears)}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, "auto"]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  content={<PanelTooltip field="fed" />}
                  cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
                />
                <Line
                  type="stepAfter"
                  dataKey="fed"
                  stroke={lineColor(1)}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartFrame>
  );
}

function PanelLabel({ color, label }: { color: string; label: string }) {
  return (
    <div className="mb-1 flex items-center gap-2 text-xs text-muted">
      <span className="h-0.5 w-4 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
