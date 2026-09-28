"use client";

import { useState } from "react";
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
import { formatPeriod, formatTick, lineColor, pickTicks, type Period } from "@/lib/chartFormat";
import type { ChartResult, LineConfig, Row } from "@/lib/series";

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

function Change({ change }: { change: number | null }) {
  if (change === null) return null;
  // Market data only: green = rising, red = falling.
  const cls = change > 0 ? "text-up" : change < 0 ? "text-down" : "text-muted";
  return (
    <span className={cls}>
      {change > 0 ? "▲" : change < 0 ? "▼" : "■"} {Math.abs(change).toFixed(2)}
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
}: {
  active?: boolean;
  payload?: { payload: Row }[];
  period: Period;
  unit: string;
  prefix?: string;
  lines: LineConfig[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
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
              {prefix}{row.values[line.key].toFixed(2)}
              {unit}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

export default function ChartCard({
  chart,
  rows,
  spanYears,
}: {
  chart: ChartResult;
  rows: Row[]; // already trimmed to the selected range
  spanYears: number;
}) {
  const [showTable, setShowTable] = useState(false);
  const multi = chart.lines.length > 1;
  const readings = chart.lines.map((line) => latestReading(chart.rows, line.key));

  return (
    <section className="flex flex-col rounded-lg border border-border bg-surface p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-medium">{chart.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{chart.description}</p>
        </div>
        {!multi && readings[0] && (
          <div className="shrink-0 text-right">
            <div className="num text-2xl font-semibold leading-tight">
              {chart.prefix}{readings[0].value.toFixed(2)}
              <span className="text-base text-muted">{chart.unit}</span>
            </div>
            <div className="num text-xs text-muted">
              <Change change={readings[0].change} /> · {formatPeriod(readings[0].date, chart.period)}
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
                  <span className="h-0.5 w-4 rounded-full" style={{ background: lineColor(i) }} />
                  {line.label}
                </div>
                {r && (
                  <div className="num mt-0.5 flex items-baseline gap-2">
                    <span className="text-xl font-semibold">
                      {chart.prefix}{r.value.toFixed(2)}
                      <span className="text-sm text-muted">{chart.unit}</span>
                    </span>
                    <span className="text-xs">
                      <Change change={r.change} />
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
      ) : showTable ? (
        <div className="mt-5 h-60 overflow-y-auto">
          <table className="w-full font-table text-sm">
            <thead className="sticky top-0 bg-surface text-left text-xs text-muted">
              <tr>
                <th className="py-2 font-medium">Date</th>
                {chart.lines.map((line) => (
                  <th key={line.key} className="py-2 text-right font-medium">
                    {multi ? line.label : "Value"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="num">
              {[...rows].reverse().map((row) => (
                <tr key={row.date} className="border-t border-border">
                  <td className="py-2 text-muted">{formatPeriod(row.date, chart.period)}</td>
                  {chart.lines.map((line) => (
                    <td key={line.key} className="py-2 text-right">
                      {row.values[line.key] === undefined
                        ? "—"
                        : `${chart.prefix ?? ""}${row.values[line.key].toFixed(2)}${chart.unit}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
                tickFormatter={(v: number) => `${chart.prefix ?? ""}${v}${chart.unit}`}
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
                  <ChartTooltip period={chart.period} unit={chart.unit} prefix={chart.prefix} lines={chart.lines} />
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

      {chart.insight && (
        <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted">
          <span className="font-medium text-primary">What it means: </span>
          {chart.insight}
        </p>
      )}

      {!chart.error && rows.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted">
          <span>
            {sourceLabel(chart.lines)}
            {chart.note && <> · {chart.note}</>}
          </span>
          <button
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 font-medium text-accent hover:text-accent-hover"
          >
            {showTable ? "Show chart" : "Show table"}
          </button>
        </div>
      )}
    </section>
  );
}
