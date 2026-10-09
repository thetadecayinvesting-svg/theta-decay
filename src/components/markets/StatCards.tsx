import type { Asset } from "@/lib/assets";
import { formatPeriod } from "@/lib/chartFormat";
import type { Point } from "@/lib/fred";
import type { AssetSeries } from "@/lib/markets";

// Last value on or before a given date.
function valueOnOrBefore(points: Point[], date: string) {
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].date <= date) return points[i].value;
  }
  return undefined;
}

function monthBefore(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export function assetStats(points: Point[]) {
  const latest = points.at(-1);
  if (!latest) return null;
  const monthAgo = valueOnOrBefore(points, monthBefore(latest.date));
  // YTD is measured from the last close of the previous year.
  const yearEnd = valueOnOrBefore(points, `${Number(latest.date.slice(0, 4)) - 1}-12-31`);
  const pct = (base?: number) => (base ? (latest.value / base - 1) * 100 : null);
  return { latest, month: pct(monthAgo), ytd: pct(yearEnd) };
}

export function formatPrice(value: number, asset: Asset) {
  return `${asset.key === "btc" ? "$" : ""}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function PctChange({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted">—</span>;
  // Market data only: green = up, red = down.
  const cls = value > 0 ? "text-up" : value < 0 ? "text-down" : "text-muted";
  return (
    <span className={`num font-medium ${cls}`}>
      {value > 0 ? "▲ +" : value < 0 ? "▼ −" : ""}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export default function StatCards({
  assets,
  series,
}: {
  assets: Asset[];
  series: AssetSeries[];
}) {
  return (
    <div id="chart-stats" className="grid gap-4 sm:grid-cols-3">
      {assets.map((asset) => {
        const data = series.find((s) => s.key === asset.key);
        const stats = data ? assetStats(data.points) : null;
        return (
          <div key={asset.key} className="rounded-lg border border-border bg-surface p-4 sm:p-5">
            <h3 className="text-sm font-medium">{asset.name}</h3>
            {stats ? (
              <>
                <div className="num mt-2 text-xl font-semibold sm:text-2xl">
                  {formatPrice(stats.latest.value, asset)}
                </div>
                <dl className="mt-3 space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2 whitespace-nowrap">
                    <dt className="text-muted">1 month</dt>
                    <dd>
                      <PctChange value={stats.month} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 whitespace-nowrap">
                    <dt className="text-muted" title="Year to date">YTD</dt>
                    <dd>
                      <PctChange value={stats.ytd} />
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-muted">
                  Close · {formatPeriod(stats.latest.date, "day")}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {data?.error ? `Couldn't load: ${data.error}` : "No data yet"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
