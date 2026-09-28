"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartFrame from "./ChartFrame";
import { PctChange } from "./StatCards";
import RangeToggle, { RANGES, type Range } from "../RangeToggle";
import type { Asset } from "@/lib/assets";
import { formatPeriod, formatTick, lineColor, pickTicks, yearsAgo } from "@/lib/chartFormat";
import type { AssetSeries } from "@/lib/markets";

// Each value is an index where 100 = the starting date, so +50% = 150.
type Row = { date: string; values: Partial<Record<Asset["key"], number>> };

// Index levels that read as round percent changes (e.g. 1100 = +1,000%).
const LOG_TICKS = [25, 50, 75, 100, 150, 200, 300, 500, 1100, 2100, 5100, 10100, 20100, 50100];

const asChange = (index: number, decimals = 0) => {
  const pct = index - 100;
  return `${pct > 0 ? "+" : ""}${pct.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
};

function buildRows(assets: Asset[], series: AssetSeries[], cutoff: string) {
  const inRange = assets.map((a) => ({
    key: a.key,
    points: (series.find((s) => s.key === a.key)?.points ?? []).filter(
      (p) => !cutoff || p.date >= cutoff,
    ),
  }));
  const withData = inRange.filter((s) => s.points.length > 0);
  if (withData.length === 0) return { rows: [], start: "" };

  // Start everyone on the first date that all of them have data.
  const start = withData.map((s) => s.points[0].date).sort().at(-1)!;
  const byDate = new Map<string, Row>();
  for (const s of withData) {
    const pts = s.points.filter((p) => p.date >= start);
    const base = pts[0]?.value;
    if (!base) continue;
    for (const p of pts) {
      const row = byDate.get(p.date) ?? { date: p.date, values: {} };
      row.values[s.key] = (p.value / base) * 100;
      byDate.set(p.date, row);
    }
  }
  const rows = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  return { rows, start };
}

function lastValue(rows: Row[], key: Asset["key"]) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = rows[i].values[key];
    if (v !== undefined) return v;
  }
  return undefined;
}

function PerfTooltip({
  active,
  payload,
  assets,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
  assets: Asset[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <div className="text-xs text-muted">{formatPeriod(row.date, "day")}</div>
      {assets.map((a, i) => {
        const v = row.values[a.key];
        if (v === undefined) return null;
        return (
          <div key={a.key} className="num flex items-center gap-2 text-sm">
            <span className="h-0.5 w-3 rounded-full" style={{ background: lineColor(i) }} />
            <span className="text-muted">{a.name}</span>
            <span className="ml-auto pl-3 font-semibold text-primary">{asChange(v, 1)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PerformanceChart({
  assets,
  series,
}: {
  assets: Asset[];
  series: AssetSeries[];
}) {
  const [range, setRange] = useState<Range>(RANGES[0]);
  const [log, setLog] = useState(false);
  const cutoff = yearsAgo(range.years);
  const { rows, start } = useMemo(() => buildRows(assets, series, cutoff), [assets, series, cutoff]);
  const spanYears = range.years || 10;
  const asOf = rows.at(-1)?.date;

  // Log scale needs explicit, evenly-spaced ticks.
  const allValues = rows.flatMap((r) => Object.values(r.values) as number[]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const logTicks = LOG_TICKS.filter((t) => t >= min * 0.9 && t <= max * 1.1);

  return (
    <ChartFrame
      title="Performance Comparison"
      description={
        start
          ? `Percent change since ${formatPeriod(start, "day")}, daily closes`
          : "Percent change from the start of the period, daily closes"
      }
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLog((v) => !v)}
            aria-pressed={log}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              log
                ? "border-transparent bg-accent-soft font-medium text-accent-hover"
                : "border-border text-muted hover:text-primary"
            }`}
          >
            Log scale
          </button>
          <RangeToggle value={range} onChange={setRange} />
        </div>
      }
      insight="Starting every asset at 0% on the same day shows which one actually grew your money the most over the period, while the size of each line's swings shows how bumpy the ride was."
      asOf={asOf ? formatPeriod(asOf, "day") : "—"}
      source={
        <>
          FRED, Federal Reserve Bank of St. Louis (Bitcoin: Coinbase). S&amp;P 500 and Dow
          Jones © S&amp;P Dow Jones Indices LLC.
          {range.years === 0 && " Max = the period all four share (FRED carries 10 years of S&P and Dow data)."}
        </>
      }
    >
      {/* Legend with each asset's return over the selected period */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {assets.map((a, i) => {
          const v = lastValue(rows, a.key);
          return (
            <div key={a.key}>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="h-0.5 w-4 rounded-full" style={{ background: lineColor(i) }} />
                {a.name}
              </div>
              <div className="mt-0.5 text-sm">
                <PctChange value={v === undefined ? null : v - 100} />
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 grid h-72 place-items-center rounded-lg bg-surface-hover text-sm text-muted">
          No data yet
        </div>
      ) : (
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 4, right: 16, bottom: 0, left: -4 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="date"
                ticks={pickTicks(rows, spanYears)}
                interval={0}
                tickFormatter={(d: string) => formatTick(d, spanYears)}
                tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                scale={log ? "log" : "linear"}
                domain={log ? ["dataMin", "dataMax"] : ["auto", "auto"]}
                ticks={log ? logTicks : undefined}
                allowDataOverflow={log}
                tickFormatter={(v: number) => asChange(v)}
                tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <ReferenceLine y={100} stroke="var(--chart-axis)" strokeDasharray="3 3" />
              <Tooltip
                content={<PerfTooltip assets={assets} />}
                cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
              />
              {assets.map((a, i) => (
                <Line
                  key={a.key}
                  type="linear"
                  dataKey={(row: Row) => row.values[a.key]}
                  name={a.name}
                  stroke={lineColor(i)}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartFrame>
  );
}
