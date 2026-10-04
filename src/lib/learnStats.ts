// Live numbers for the Learn guides, shared by the guide page and its social
// preview image.

import { getSeries, type Point } from "./fred";
import type { GuideStat } from "./learnContent";

const asDate = (d: string) => new Date(`${d}T12:00:00Z`);

// "August 2026" for monthly data, "Sep 30, 2026" for daily, "Q2 2026" for quarterly.
function periodLabel(points: Point[]) {
  const last = points.at(-1);
  const prev = points.at(-2);
  if (!last) return "";
  const gapDays = prev ? (asDate(last.date).getTime() - asDate(prev.date).getTime()) / 86_400_000 : 30;
  if (gapDays < 20) return asDate(last.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  if (gapDays > 80) return `Q${Math.floor(asDate(last.date).getUTCMonth() / 3) + 1} ${last.date.slice(0, 4)}`;
  return asDate(last.date).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export type LoadedStat = { label: string; value: string; when: string; points: Point[] };

export async function loadStat(stat: GuideStat, start: string): Promise<LoadedStat | null> {
  try {
    const points = await getSeries(stat.fredId, { start, units: stat.units });
    const last = points.at(-1);
    if (!last) return null;
    let value: string;
    if (stat.format === "range" && stat.upperFredId) {
      const upper = (await getSeries(stat.upperFredId, { start })).at(-1);
      value = upper ? `${last.value.toFixed(2)}–${upper.value.toFixed(2)}%` : `${last.value.toFixed(2)}%`;
    } else if (stat.format === "jobsK") {
      value = `${last.value >= 0 ? "+" : "−"}${Math.round(Math.abs(last.value))}K`;
    } else if (stat.format === "pct1") {
      value = `${last.value.toFixed(1)}%`;
    } else if (stat.format === "pct2") {
      value = `${last.value.toFixed(2)}%`;
    } else {
      value = last.value.toFixed(2);
    }
    return { label: stat.label, value, when: periodLabel(points), points };
  } catch {
    return null;
  }
}
