// Date helpers shared by every chart on the site.

export type Period = "day" | "week" | "month" | "quarter";

// Lines take the theme's chart colors in order: violet, teal, amber, blue.
export const lineColor = (i: number) => `var(--chart-${i + 1})`;

export function parseDate(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

// Label a reading the way it's usually quoted: "Aug 2026", "Q2 2026", "Sep 19, 2026".
export function formatPeriod(date: string, period: Period) {
  const d = parseDate(date);
  if (period === "quarter") {
    return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: period === "week" || period === "day" ? "numeric" : undefined,
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTick(date: string, spanYears: number) {
  const d = parseDate(date);
  if (spanYears <= 2) {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  }
  return String(d.getUTCFullYear());
}

// Place ticks on the first reading of each year (or month, for short ranges),
// thinned out so there are never more than ~5 (they must fit on a phone).
export function pickTicks(rows: { date: string }[], spanYears: number) {
  const bucket = (date: string) => (spanYears <= 2 ? date.slice(0, 7) : date.slice(0, 4));
  const starts = rows.filter((r, i) => i > 0 && bucket(r.date) !== bucket(rows[i - 1].date));
  const step = Math.ceil(starts.length / 5) || 1;
  return starts.filter((_, i) => i % step === 0).map((r) => r.date);
}

// "YYYY-MM-DD" for N years before today (0 = no cutoff).
export function yearsAgo(years: number) {
  if (years <= 0) return "";
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}
