// Short, factual summaries of the most recent Fed decision / data release(s),
// written from official FRED numbers (shown at the top of the calendar), e.g.
// "The Bureau of Economic Analysis reported that real GDP growth was 1.5% in Q2 2026."

import { getRecentEvents } from "./calendar";
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

// Only the latest readings are needed; a short window keeps requests small.
const START = new Date(Date.now() - 2 * 365 * 86_400_000).toISOString().slice(0, 10);

const asDate = (d: string) => new Date(`${d}T12:00:00Z`);
const monthName = (d: string) => asDate(d).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
const quarterName = (d: string) => `Q${Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1} ${d.slice(0, 4)}`;
const pct = (v: number, digits = 2) => `${v.toFixed(digits)}%`;

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
): Promise<LatestRelease | null> {
  switch (type) {
    case "CPI": {
      const [cpi, core] = await Promise.all([
        getSeries("CPIAUCSL", { start: START, units: "pc1" }),
        getSeries("CPILFESL", { start: START, units: "pc1" }),
      ]);
      const now = cpi.at(-1);
      const coreNow = core.at(-1);
      if (!now) return null;
      return {
        type, date, title: "CPI Report", href: "/dashboard#chart-cpi",
        headline: pct(now.value), headlineLabel: `Annual inflation, ${monthName(now.date)}`,
        summary:
          `The Bureau of Labor Statistics reported that annual CPI inflation was ${pct(now.value)} in ${monthName(now.date)}` +
          (coreNow ? `, with core CPI at ${pct(coreNow.value)}.` : "."),
      };
    }

    case "PCE": {
      const [pce, core] = await Promise.all([
        getSeries("PCEPI", { start: START, units: "pc1" }),
        getSeries("PCEPILFE", { start: START, units: "pc1" }),
      ]);
      const now = pce.at(-1);
      const coreNow = core.at(-1);
      if (!now) return null;
      return {
        type, date, title: "PCE Inflation", href: "/dashboard#chart-pce",
        headline: pct(now.value), headlineLabel: `PCE inflation, ${monthName(now.date)}`,
        summary:
          `The Bureau of Economic Analysis reported that annual PCE inflation was ${pct(now.value)} in ${monthName(now.date)}` +
          (coreNow ? `, with core PCE at ${pct(coreNow.value)}.` : "."),
      };
    }

    case "Jobs": {
      const [payrolls, unrate] = await Promise.all([
        getSeries("PAYEMS", { start: START, units: "chg" }),
        getSeries("UNRATE", { start: START }),
      ]);
      const jobs = payrolls.at(-1);
      const rate = unrate.at(-1);
      if (!jobs || !rate) return null;
      const count = Math.round(Math.abs(jobs.value) * 1000).toLocaleString("en-US");
      return {
        type, date, title: "Jobs Report", href: "/dashboard#chart-unrate",
        headline: `${jobs.value >= 0 ? "+" : "−"}${Math.round(Math.abs(jobs.value))}K`,
        headlineLabel: `Jobs added, ${monthName(jobs.date)}`,
        summary:
          `The Bureau of Labor Statistics reported that employers ${jobs.value >= 0 ? "added" : "cut"} ${count} jobs ` +
          `in ${monthName(jobs.date)} and the unemployment rate was ${pct(rate.value, 1)}.`,
      };
    }

    case "GDP": {
      const now = (await getSeries("A191RL1Q225SBEA", { start: START })).at(-1);
      if (!now) return null;
      return {
        type, date, title: "GDP Report", href: "/dashboard#chart-gdp",
        headline: pct(now.value, 1), headlineLabel: `Real GDP growth, ${quarterName(now.date)}`,
        summary: `The Bureau of Economic Analysis reported that real GDP growth was ${pct(now.value, 1)} (annualized) in ${quarterName(now.date)}.`,
      };
    }

    case "FOMC": {
      const [upper, lower] = await Promise.all([
        getSeries("DFEDTARU", { start: START }),
        getSeries("DFEDTARL", { start: START }),
      ]);
      const nowUpper = upper.at(-1);
      const nowLower = lower.at(-1);
      // The range before this meeting began, to tell a hike, cut or hold apart.
      const dayBefore = asDate(meetingStart ?? date);
      dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
      const prevUpper = valueOn(upper, dayBefore.toISOString().slice(0, 10));
      if (!nowUpper || !nowLower || !prevUpper) return null;

      const range = `${pct(nowLower.value)}–${pct(nowUpper.value)}`;
      const diff = nowUpper.value - prevUpper.value;
      const bp = Math.round(Math.abs(diff) * 100);
      const summary =
        Math.abs(diff) < 0.001
          ? `The Federal Reserve held the federal funds rate target range at ${range}.`
          : `The Federal Reserve ${diff > 0 ? "raised" : "lowered"} the federal funds rate target range by ${bp} basis points to ${range}.`;
      return {
        type, date, title: "FOMC Rate Decision", href: "/dashboard#chart-fedfunds",
        headline: range, headlineLabel: "Fed funds target range", summary,
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
  const results = await Promise.allSettled(sameDay.map((e) => summarize(e.type, e.date, e.meetingStart)));
  return results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}
