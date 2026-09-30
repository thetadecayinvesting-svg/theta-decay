// Plain-English summaries of the most recent Fed decision / data release(s),
// written from official FRED numbers (shown at the top of the calendar).
// Adds historical context, e.g. "the first increase since December 2018" or
// "the highest reading since March 2024".

import { getRecentEvents, todayET } from "./calendar";
import type { EventType } from "./events";
import { getSeries, hasFredKey, type Point } from "./fred";

export type LatestRelease = {
  type: EventType;
  title: string;
  date: string; // when it was announced / released (YYYY-MM-DD)
  headline: string; // e.g. "3.35%" or "+162K"
  headlineLabel: string; // what the headline number is
  summary: string;
  href: string; // chart with more detail
};

const HISTORY_START = "2000-01-01";
const TARGET_RANGE_START = "2008-12-16"; // when the Fed began setting a range

const asDate = (d: string) => new Date(`${d}T12:00:00Z`);
const fmt = (d: string, options: Intl.DateTimeFormatOptions) =>
  asDate(d).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
const monthName = (d: string) => fmt(d, { month: "long" });
const monthYear = (d: string) => fmt(d, { month: "long", year: "numeric" });
const fullDate = (d: string) => fmt(d, { month: "long", day: "numeric", year: "numeric" });
const quarterName = (d: string) => `Q${Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1} ${d.slice(0, 4)}`;
const pct = (v: number, digits = 2) => `${v.toFixed(digits)}%`;

// "13 days ago, on September 16, 2026," / "Yesterday, September 29, 2026,"
function lead(date: string, today: string) {
  const days = Math.round((asDate(today).getTime() - asDate(date).getTime()) / 86_400_000);
  if (days <= 0) return `Today, ${fullDate(date)},`;
  if (days === 1) return `Yesterday, ${fullDate(date)},`;
  return `${days} days ago, on ${fullDate(date)},`;
}

// "rose to" / "fell to" / "held steady at", given two readings.
function verb(now: number, before: number, tolerance: number) {
  const diff = now - before;
  if (Math.abs(diff) < tolerance) return "held steady at";
  return diff > 0 ? "rose to" : "fell to";
}

// If the latest reading is the highest (or lowest) in a while, say since when.
// Returns the date of the last reading at least as extreme, or "record" if none
// exists in the data. Only reported when it's been at least 3 readings.
function extremeSince(points: Point[]): { kind: "high" | "low"; since: string | "record" } | null {
  const i = points.length - 1;
  if (i < 1) return null;
  const now = points[i].value;
  const before = points[i - 1].value;
  if (now === before) return null;
  const kind = now > before ? "high" : "low";
  for (let j = i - 1; j >= 0; j--) {
    const matches = kind === "high" ? points[j].value >= now : points[j].value <= now;
    if (matches) return i - j >= 3 ? { kind, since: points[j].date } : null;
  }
  return { kind, since: "record" };
}

function extremePhrase(
  points: Point[],
  words: { high: string; low: string },
  when: (d: string) => string = monthYear,
) {
  const e = extremeSince(points);
  if (!e) return "";
  const word = e.kind === "high" ? words.high : words.low;
  return e.since === "record"
    ? `, the ${word} since at least ${points[0].date.slice(0, 4)}`
    : `, the ${word} since ${when(e.since)}`;
}

// Value on or before a date.
function valueOn(points: Point[], date: string) {
  let found: Point | undefined;
  for (const p of points) if (p.date <= date) found = p;
  return found;
}

async function summarize(
  type: EventType,
  date: string,
  meetingStart: string | undefined,
  today: string,
): Promise<LatestRelease | null> {
  const intro = lead(date, today);

  switch (type) {
    case "CPI": {
      const [cpi, core] = await Promise.all([
        getSeries("CPIAUCSL", { start: HISTORY_START, units: "pc1" }),
        getSeries("CPILFESL", { start: HISTORY_START, units: "pc1" }),
      ]);
      const now = cpi.at(-1);
      const before = cpi.at(-2);
      if (!now || !before) return null;
      const coreNow = core.at(-1);
      return {
        type, date, title: "CPI Report", href: "/dashboard#chart-cpi",
        headline: pct(now.value), headlineLabel: `Annual inflation, ${monthName(now.date)}`,
        summary:
          `${intro} the Bureau of Labor Statistics reported that annual consumer price inflation ` +
          `${verb(now.value, before.value, 0.005)} ${pct(now.value)} in ${monthName(now.date)}, ` +
          `from ${pct(before.value)} in ${monthName(before.date)}` +
          `${extremePhrase(cpi, { high: "highest reading", low: "lowest reading" })}.` +
          (coreNow ? ` Core inflation, which excludes food and energy, was ${pct(coreNow.value)}.` : ""),
      };
    }

    case "PCE": {
      const [pce, core] = await Promise.all([
        getSeries("PCEPI", { start: HISTORY_START, units: "pc1" }),
        getSeries("PCEPILFE", { start: HISTORY_START, units: "pc1" }),
      ]);
      const now = pce.at(-1);
      const before = pce.at(-2);
      if (!now || !before) return null;
      const coreNow = core.at(-1);
      return {
        type, date, title: "PCE Inflation", href: "/dashboard#chart-pce",
        headline: pct(now.value), headlineLabel: `PCE inflation, ${monthName(now.date)}`,
        summary:
          `${intro} the Bureau of Economic Analysis reported that PCE inflation, the Federal Reserve's ` +
          `preferred gauge, ${verb(now.value, before.value, 0.005)} ${pct(now.value)} in ${monthName(now.date)}, ` +
          `from ${pct(before.value)} in ${monthName(before.date)}` +
          `${extremePhrase(pce, { high: "highest reading", low: "lowest reading" })}.` +
          (coreNow ? ` Core PCE, which excludes food and energy, was ${pct(coreNow.value)}.` : ""),
      };
    }

    case "Jobs": {
      const [payrolls, unrate] = await Promise.all([
        getSeries("PAYEMS", { start: HISTORY_START, units: "chg" }),
        getSeries("UNRATE", { start: HISTORY_START }),
      ]);
      const jobs = payrolls.at(-1);
      const rate = unrate.at(-1);
      const prevRate = unrate.at(-2);
      if (!jobs || !rate || !prevRate) return null;
      const count = Math.round(Math.abs(jobs.value) * 1000).toLocaleString("en-US");
      const jobsText =
        jobs.value >= 0
          ? `employers added ${count} jobs in ${monthName(jobs.date)}` +
            extremePhrase(payrolls, { high: "most", low: "fewest" })
          : `employers cut ${count} jobs in ${monthName(jobs.date)}`;
      const rateVerb = verb(rate.value, prevRate.value, 0.05);
      const rateText =
        rateVerb === "held steady at"
          ? `the unemployment rate held steady at ${pct(rate.value, 1)}`
          : `the unemployment rate ${rateVerb} ${pct(rate.value, 1)} from ${pct(prevRate.value, 1)}` +
            extremePhrase(unrate, { high: "highest", low: "lowest" });
      return {
        type, date, title: "Jobs Report", href: "/dashboard#chart-unrate",
        headline: `${jobs.value >= 0 ? "+" : "−"}${Math.round(Math.abs(jobs.value))}K`,
        headlineLabel: `Jobs added, ${monthName(jobs.date)}`,
        summary: `${intro} the Bureau of Labor Statistics reported that ${jobsText}, and ${rateText}.`,
      };
    }

    case "GDP": {
      const gdp = await getSeries("A191RL1Q225SBEA", { start: HISTORY_START });
      const now = gdp.at(-1);
      const before = gdp.at(-2);
      if (!now || !before) return null;
      const growth =
        now.value >= 0
          ? `grew at a ${pct(now.value, 1)} annual rate`
          : `shrank at a ${pct(Math.abs(now.value), 1)} annual rate`;
      const pace =
        Math.abs(now.value - before.value) < 0.05
          ? "matching"
          : now.value > before.value
            ? "faster than"
            : "slower than";
      return {
        type, date, title: "GDP Report", href: "/dashboard#chart-gdp",
        headline: pct(now.value, 1), headlineLabel: `Real GDP growth, ${quarterName(now.date)}`,
        summary:
          `${intro} the Bureau of Economic Analysis estimated that the U.S. economy ${growth} in ` +
          `${quarterName(now.date)}, ${pace} the ${pct(before.value, 1)} pace in ${quarterName(before.date)}` +
          `${extremePhrase(gdp, { high: "fastest growth", low: "slowest growth" }, quarterName)}.`,
      };
    }

    case "FOMC": {
      const [upper, lower] = await Promise.all([
        getSeries("DFEDTARU", { start: TARGET_RANGE_START }),
        getSeries("DFEDTARL", { start: TARGET_RANGE_START }),
      ]);
      const nowUpper = upper.at(-1);
      const nowLower = lower.at(-1);
      if (!nowUpper || !nowLower) return null;

      // Every date the target range changed, and in which direction.
      const changes = upper
        .map((p, i) => (i > 0 && p.value !== upper[i - 1].value ? { date: p.date, diff: p.value - upper[i - 1].value } : null))
        .filter((c): c is { date: string; diff: number } => c !== null);

      // The range before this meeting began vs. now.
      const dayBefore = asDate(meetingStart ?? date);
      dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
      const beforeDate = dayBefore.toISOString().slice(0, 10);
      const prevUpper = valueOn(upper, beforeDate);
      const prevLower = valueOn(lower, beforeDate);
      if (!prevUpper || !prevLower) return null;

      const newRange = `${pct(nowLower.value)}–${pct(nowUpper.value)}`;
      const oldRange = `${pct(prevLower.value)}–${pct(prevUpper.value)}`;
      const diff = nowUpper.value - prevUpper.value;
      const bp = Math.round(Math.abs(diff) * 100);

      let summary: string;
      if (Math.abs(diff) < 0.001) {
        const lastChange = changes.filter((c) => c.date <= beforeDate).at(-1);
        summary =
          `${intro} the Federal Reserve left the federal funds rate unchanged, keeping its target range at ${newRange}` +
          (lastChange ? `, where it has stood since ${monthYear(lastChange.date)}.` : ".");
      } else {
        const up = diff > 0;
        const earlier = changes.filter((c) => c.date <= beforeDate);
        const previousChange = earlier.at(-1);
        const previousSameWay = [...earlier].reverse().find((c) => (c.diff > 0) === up);
        const action = up ? "raised" : "cut";
        const moving = up ? "increasing" : "lowering";
        const history =
          previousChange && (previousChange.diff > 0) === up
            ? `again, following its ${monthYear(previousChange.date)} ${up ? "increase" : "cut"}`
            : previousSameWay
              ? `for the first time since ${monthYear(previousSameWay.date)}`
              : `for the first time since at least 2008`;
        summary =
          `${intro} the Federal Reserve ${action} the federal funds rate ${history}, ${moving} its target ` +
          `range by ${bp} basis points from ${oldRange} to ${newRange}.`;
      }
      return {
        type, date, title: "FOMC Rate Decision", href: "/dashboard#chart-fedfunds",
        headline: newRange, headlineLabel: "Fed funds target range", summary,
      };
    }
  }
}

// The most recent release date's event(s) — several reports can share a day.
// Anything whose numbers can't be loaded is left out.
export async function getLatestReleases(): Promise<LatestRelease[]> {
  if (!hasFredKey()) return [];
  const recent = await getRecentEvents();
  const latestDate = recent[0]?.date;
  const sameDay = recent.filter((e) => e.date === latestDate);
  const today = todayET();
  const results = await Promise.allSettled(
    sameDay.map((e) => summarize(e.type, e.date, e.meetingStart, today)),
  );
  return results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}
