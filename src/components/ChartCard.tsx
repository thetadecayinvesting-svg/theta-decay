"use client";

import { useId, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPeriod, formatTick, lineColor, pickTicks, type Period } from "@/lib/chartFormat";
import type { ChartResult, LineConfig, Row } from "@/lib/series";
import Link from "next/link";
import { EXPLAINERS } from "@/lib/explainers";
import SeriesDetailsPanel from "./SeriesDetailsPanel";

// 3.35 stays "3.35"; big values like 1,412.3 become "1,412" so they stay readable.
function formatValue(v: number, decimals = 2) {
  return Math.abs(v) >= 1000
    ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : v.toFixed(decimals);
}

// Axis labels: compact for large numbers (e.g. 25,000,000 → "25M").
function formatTickValue(v: number) {
  return Math.abs(v) >= 10000
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v)
    : String(v);
}

// Most recent value for a line, and its change from the reading before.
function latestReading(rows: Row[], key: string) {
  const withValue = rows.filter((r) => r.values[key] !== undefined);
  const latest = withValue.at(-1);
  const previous = withValue.at(-2);
  if (!latest) return null;
  return {
    date: latest.date,
    value: latest.values[key],
    change: previous ? latest.values[key] - previous.values[key] : null,
  };
}

// "FRED: VIXCLS" or "FINRA Margin Statistics", for the card footer.
function sourceLabel(lines: LineConfig[]) {
  const fredIds = lines.flatMap((l) => (l.fredId ? [l.fredId] : []));
  const parts = [];
  if (fredIds.length) parts.push(`FRED: ${fredIds.join(", ")}`);
  if (lines.some((l) => l.finra)) parts.push("FINRA Margin Statistics");
  return parts.join(" · ");
}

function Change({ change, decimals }: { change: number | null; decimals?: number }) {
  if (change === null) return null;
  // Market data only: green = rising, red = falling.
  const cls = change > 0 ? "text-up" : change < 0 ? "text-down" : "text-muted";
  return (
    <span className={cls}>
      {change > 0 ? "▲" : change < 0 ? "▼" : "■"} {formatValue(Math.abs(change), decimals)}
    </span>
  );
}

function ChartTooltip({
  active,
  payload,
  period,
  unit,
  prefix = "",
  lines,
  contributions = false,
  decimals,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
  period: Period;
  unit: string;
  prefix?: string;
  lines: LineConfig[];
  contributions?: boolean;
  decimals?: number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  if (contributions) {
    const total = lines.at(-1)!;
    return (
      <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
        <div className="text-xs text-muted">{formatPeriod(row.date, period)}</div>
        {lines.slice(0, -1).map((line, i) =>
          row.values[line.key] === undefined ? null : (
            <div key={line.key} className="num flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: lineColor(i) }} />
              <span className="text-muted">{line.label}</span>
              <span className="ml-auto pl-4 font-semibold text-primary">{signed(row.values[line.key])}</span>
            </div>
          ),
        )}
        {row.values[total.key] !== undefined && (
          <div className="num mt-1 flex items-center gap-2 border-t border-border pt-1 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-primary)]" />
            <span className="text-muted">{total.label}</span>
            <span className="ml-auto pl-4 font-semibold text-primary">{formatValue(row.values[total.key])}%</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <div className="text-xs text-muted">{formatPeriod(row.date, period)}</div>
      {lines.map((line, i) =>
        row.values[line.key] === undefined ? null : (
          <div key={line.key} className="num flex items-center gap-2 text-sm">
            {lines.length > 1 && (
              <>
                <span className="h-0.5 w-3 rounded-full" style={{ background: lineColor(i) }} />
                <span className="text-muted">{line.label}</span>
              </>
            )}
            <span className="ml-auto font-semibold text-primary">
              {prefix}{formatValue(row.values[line.key], decimals)}
              {unit}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

// "+2.51" / "−1.10": contributions read as adding to or subtracting from growth.
const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(2)}`;

// Same look as the "Add to calendar" button; highlighted while its panel is open.
const actionButton = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-hover ${
    active ? "bg-surface-hover" : ""
  }`;

export default function ChartCard({
  chart,
  rows: rangeRows,
  spanYears: rangeSpanYears,
  onRemove,
}: {
  chart: ChartResult;
  rows: Row[]; // already trimmed to the selected range
  spanYears: number;
  onRemove?: () => void; // shown for charts the visitor added from FRED search
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const explainer = EXPLAINERS[chart.key];
  const detailsId = useId();
  const multi = chart.lines.length > 1;
  const readings = chart.lines.map((line) => latestReading(chart.rows, line.key));
  const contributions = chart.kind === "contributions";
  // Some charts always show a fixed recent window instead of the selected range.
  const rows = chart.lastPoints ? chart.rows.slice(-chart.lastPoints) : rangeRows;
  const spanYears = chart.lastPoints
    ? Math.max(1, Math.round(chart.lastPoints / (chart.period === "quarter" ? 4 : 12)))
    : rangeSpanYears;

  return (
    <section
      id={`chart-${chart.key}`}
      className={`flex flex-col rounded-lg border border-border bg-surface p-6 ${chart.wide ? "lg:col-span-2" : ""}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-medium">{chart.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{chart.description}</p>
        </div>
        {!multi && readings[0] && (
          <div className="shrink-0 text-right">
            <div className="num text-2xl font-semibold leading-tight">
              {chart.prefix}{formatValue(readings[0].value, chart.decimals)}
              <span className="text-base text-muted">{chart.unit}</span>
            </div>
            <div className="num text-xs text-muted">
              <Change change={readings[0].change} decimals={chart.decimals} /> · {formatPeriod(readings[0].date, chart.period)}
            </div>
          </div>
        )}
      </header>

      {/* Legend with latest values, for charts with more than one line */}
      {multi && (
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {chart.lines.map((line, i) => {
            const r = readings[i];
            return (
              <div key={line.key}>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {contributions ? (
                    i === chart.lines.length - 1 ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-primary)]" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: lineColor(i) }} />
                    )
                  ) : (
                    <span className="h-0.5 w-4 rounded-full" style={{ background: lineColor(i) }} />
                  )}
                  {line.label}
                </div>
                {r && contributions && (
                  <div className="num mt-0.5 text-xl font-semibold">
                    {i === chart.lines.length - 1 ? `${formatValue(r.value)}%` : signed(r.value)}
                  </div>
                )}
                {r && !contributions && (
                  <div className="num mt-0.5 flex items-baseline gap-2">
                    <span className="text-xl font-semibold">
                      {chart.prefix}{formatValue(r.value, chart.decimals)}
                      <span className="text-sm text-muted">{chart.unit}</span>
                    </span>
                    <span className="text-xs">
                      <Change change={r.change} decimals={chart.decimals} />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {readings[0] && (
            <div className="num self-end text-xs text-muted">
              {formatPeriod(readings[0].date, chart.period)}
            </div>
          )}
        </div>
      )}

      {chart.error ? (
        <p className="mt-6 rounded-lg bg-surface-hover p-4 text-sm text-muted">
          Couldn&apos;t load this chart: {chart.error}
        </p>
      ) : rows.length === 0 ? (
        <div className="mt-5 grid h-60 place-items-center rounded-lg bg-surface-hover text-sm text-muted">
          No data yet
        </div>
      ) : contributions ? (
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} stackOffset="sign" margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
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
                tickFormatter={(v: number) => String(v)}
                tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <ReferenceLine y={0} stroke="var(--chart-axis)" />
              <Tooltip
                content={<ChartTooltip period={chart.period} unit="" lines={chart.lines} contributions />}
                cursor={{ fill: "var(--surface-hover)", opacity: 0.6 }}
              />
              {chart.lines.slice(0, -1).map((line, i) => (
                <Bar
                  key={line.key}
                  stackId="parts"
                  dataKey={(row: Row) => row.values[line.key]}
                  name={line.label}
                  fill={lineColor(i)}
                  stroke="var(--surface)"
                  strokeWidth={1}
                  maxBarSize={28}
                  isAnimationActive={false}
                />
              ))}
              <Line
                type="linear"
                dataKey={(row: Row) => row.values[chart.lines.at(-1)!.key]}
                name={chart.lines.at(-1)!.label}
                stroke="none"
                dot={{ r: 4, fill: "var(--text-primary)", stroke: "var(--surface)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "var(--text-primary)", stroke: "var(--surface)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-5 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
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
                domain={chart.zeroBased ? [0, "auto"] : ["auto", "auto"]}
                tickFormatter={(v: number) => `${chart.prefix ?? ""}${formatTickValue(v)}${chart.unit}`}
                tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={chart.prefix ? 60 : 52}
              />
              {chart.zeroLine && (
                <ReferenceLine y={0} stroke="var(--chart-axis)" strokeDasharray="3 3" />
              )}
              <Tooltip
                content={
                  <ChartTooltip period={chart.period} unit={chart.unit} prefix={chart.prefix} lines={chart.lines} decimals={chart.decimals} />
                }
                cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
              />
              {chart.lines.map((line, i) => (
                <Line
                  key={line.key}
                  type="linear"
                  dataKey={(row: Row) => row.values[line.key]}
                  name={line.label}
                  stroke={lineColor(i)}
                  strokeWidth={multi ? 1.5 : 2}
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

      {!chart.error && rows.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-xs text-muted">
          <span>
            {sourceLabel(chart.lines)}
            {onRemove && (
              <>
                {" · "}
                <button onClick={onRemove} className="font-medium text-muted hover:text-primary">
                  Remove
                </button>
              </>
            )}
            {chart.note && <> · {chart.note}</>}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {explainer && (
              <button
                onClick={() => setShowExplainer((v) => !v)}
                aria-expanded={showExplainer}
                className={actionButton(showExplainer)}
              >
                <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8.2 8a1.9 1.9 0 0 1 3.6.8c0 1.2-1.8 1.5-1.8 2.7M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                What is this?
              </button>
            )}
            <button
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              aria-controls={detailsId}
              className={actionButton(showDetails)}
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
        </div>
      )}

      {explainer && showExplainer && (
        <div className="mt-4 space-y-3 rounded-lg bg-accent-soft p-4 text-sm leading-relaxed">
          <p>
            <span className="font-medium text-primary">What it is: </span>
            <span className="text-muted">{explainer.what}</span>
          </p>
          <p>
            <span className="font-medium text-primary">Why markets care: </span>
            <span className="text-muted">{explainer.whyItMatters}</span>
          </p>
          <p>
            <span className="font-medium text-primary">What to watch: </span>
            <span className="text-muted">{explainer.watch}</span>
          </p>
          {explainer.learnHref && (
            <Link href={explainer.learnHref} className="inline-block font-medium text-accent-hover hover:underline">
              Read the full guide →
            </Link>
          )}
        </div>
      )}

      {showDetails && <SeriesDetailsPanel id={detailsId} lines={chart.lines} details={chart.details} />}
    </section>
  );
}
