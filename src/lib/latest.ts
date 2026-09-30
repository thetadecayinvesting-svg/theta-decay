// Plain-English summaries of the most recent Fed decision and data releases,
// written from the latest official FRED numbers (shown at the top of the calendar).

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

const START = new Date(Date.now() - 2 * 365 * 86_400_000).toISOString().slice(0, 10);

const monthName = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
const quarterName = (date: string) =>
  `Q${Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1} ${date.slice(0, 4)}`;
const pct = (v: number, digits = 2) => `${v.toFixed(digits)}%`;
const lastTwo = (points: Point[]) => [points.at(-1), points.at(-2)] as const;

// "rose to 3.35% in August, up from 3.30% in July" / "held steady at 3.35% in August"
function movement(label: string, now: Point, before: Point, digits = 2) {
  const diff = now.value - before.value;
  if (Math.abs(diff) < 0.5 * 10 ** -digits) {
    return `${label} held steady at ${pct(now.value, digits)} in ${monthName(now.date)}.`;
  }
  const verb = diff > 0 ? "rose" : "fell";
  const dir = diff > 0 ? "up" : "down";
  return `${label} ${verb} to ${pct(now.value, digits)} in ${monthName(now.date)}, ${dir} from ${pct(before.value, digits)} in ${monthName(before.date)}.`;
}

// Latest reading on or before a date.
function valueOnOrBefore(points: Point[], date: string) {
  let found: Point | undefined;
  for (const p of points) if (p.date <= date) found = p;
  return found;
}

async function summarize(type: EventType, date: string, detail: { start?: string }): Promise<LatestRelease | null> {
  switch (type) {
    case "CPI": {
      const [now, before] = lastTwo(await getSeries("CPIAUCSL", { start: START, units: "pc1" }));
      if (!now || !before) return null;
      return {
        type, date, title: "CPI Report", href: "/dashboard#chart-cpi",
        headline: pct(now.value), headlineLabel: `Inflation, ${monthName(now.date)}`,
        summary: movement("Annual consumer price inflation", now, before),
      };
    }
    case "PCE": {
      const [headlinePts, corePts] = await Promise.all([
        getSeries("PCEPI", { start: START, units: "pc1" }),
        getSeries("PCEPILFE", { start: START, units: "pc1" }),
      ]);
      const [now, before] = lastTwo(headlinePts);
      const core = corePts.at(-1);
      if (!now || !before) return null;
      return {
        type, date, title: "PCE Inflation", href: "/dashboard#chart-pce",
        headline: pct(now.value), headlineLabel: `PCE inflation, ${monthName(now.date)}`,
        summary: `${movement("PCE inflation, the Fed's preferred gauge,", now, before)}${
          core ? ` Core PCE, which excludes food and energy, was ${pct(core.value)}.` : ""
        }`,
      };
    }
    case "Jobs": {
      const [payrolls, unrate] = await Promise.all([
        getSeries("PAYEMS", { start: START, units: "chg" }),
        getSeries("UNRATE", { start: START }),
      ]);
      const jobs = payrolls.at(-1);
      const [rate, prevRate] = lastTwo(unrate);
      if (!jobs || !rate || !prevRate) return null;
      const count = Math.round(Math.abs(jobs.value) * 1000).toLocaleString("en-US");
      const jobsText =
        jobs.value >= 0
          ? `Employers added ${count} jobs in ${monthName(jobs.date)}`
          : `Employers cut ${count} jobs in ${monthName(jobs.date)}`;
      const rateDiff = rate.value - prevRate.value;
      const rateText =
        Math.abs(rateDiff) < 0.05
          ? `the unemployment rate held at ${pct(rate.value, 1)}`
          : `the unemployment rate ${rateDiff > 0 ? "rose" : "fell"} to ${pct(rate.value, 1)} from ${pct(prevRate.value, 1)}`;
      return {
        type, date, title: "Jobs Report", href: "/dashboard#chart-unrate",
        headline: `${jobs.value >= 0 ? "+" : "−"}${Math.round(Math.abs(jobs.value))}K`,
        headlineLabel: `Jobs added, ${monthName(jobs.date)}`,
        summary: `${jobsText}, and ${rateText}.`,
      };
    }
    case "GDP": {
      const [now, before] = lastTwo(await getSeries("A191RL1Q225SBEA", { start: START }));
      if (!now || !before) return null;
      const growth = now.value >= 0 ? `grew at a ${pct(now.value, 1)} annual rate` : `shrank at a ${pct(Math.abs(now.value), 1)} annual rate`;
      const pace =
        Math.abs(now.value - before.value) < 0.05 ? "the same pace as" : now.value > before.value ? "faster than" : "slower than";
      return {
        type, date, title: "GDP Report", href: "/dashboard#chart-gdp",
        headline: pct(now.value, 1), headlineLabel: `Real GDP growth, ${quarterName(now.date)}`,
        summary: `The U.S. economy ${growth} in ${quarterName(now.date)}, ${pace} the ${pct(before.value, 1)} pace in ${quarterName(before.date)}.`,
      };
    }
    case "FOMC": {
      const [upper, lower] = await Promise.all([
        getSeries("DFEDTARU", { start: START }),
        getSeries("DFEDTARL", { start: START }),
      ]);
      // Compare the target range before the meeting began with today's.
      const dayBefore = new Date(`${detail.start ?? date}T12:00:00Z`);
      dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
      const prevUpper = valueOnOrBefore(upper, dayBefore.toISOString().slice(0, 10));
      const nowUpper = upper.at(-1);
      const nowLower = lower.at(-1);
      if (!prevUpper || !nowUpper || !nowLower) return null;
      const range = `${pct(nowLower.value)}–${pct(nowUpper.value)}`;
      const diff = nowUpper.value - prevUpper.value;
      const size = `${Math.abs(diff).toFixed(2)} percentage point`;
      const summary =
        Math.abs(diff) < 0.01
          ? `The Federal Reserve held its benchmark federal funds rate steady at ${range}.`
          : `The Federal Reserve ${diff < 0 ? "cut" : "raised"} its benchmark federal funds rate by ${size} to ${range}.`;
      return {
        type, date, title: "FOMC Rate Decision", href: "/dashboard#chart-fedfunds",
        headline: range, headlineLabel: "Fed funds target range", summary,
      };
    }
  }
}

// Newest first; any release whose numbers can't be loaded is simply left out.
export async function getLatestReleases(): Promise<LatestRelease[]> {
  if (!hasFredKey()) return [];
  const recent = await getRecentEvents();
  const results = await Promise.allSettled(
    recent.map((e) => summarize(e.type, e.date, { start: e.meetingStart })),
  );
  return results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}
