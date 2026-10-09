// Short, factual summaries of the most recent Fed decision / data release(s),
// written from official FRED numbers (shown at the top of the calendar), e.g.
// "The Bureau of Economic Analysis reported that real gross domestic product (GDP)
// in the United States increased at an annualized rate of 2.2% in Q2 2026."

import { getRecentEvents } from "./calendar";
import type { EventType } from "./events";
import { getSeries, hasFredKey, type Point } from "./fred";

export type LatestRelease = {
  type: EventType;
  title: string;
  date: string; // when it was announced / released (YYYY-MM-DD)
  headline?: string; // e.g. "3.35%" or "+162,000"; none when there's no data source (ISM)
  headlineLabel?: string; // what the headline number is
  summary: string;
  href: string; // chart with more detail, or the publisher's report
  external?: boolean; // href is the publisher's own site
  guideHref?: string; // Learn guide, shown as a second button
};

const ISM_REPORTS_URL = "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/";

// Only the latest readings are needed; a short window keeps requests small.
const START = new Date(Date.now() - 2 * 365 * 86_400_000).toISOString().slice(0, 10);

const asDate = (d: string) => new Date(`${d}T12:00:00Z`);
const monthName = (d: string) => asDate(d).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
// The first of the previous month, e.g. "2026-10-05" → "2026-09-01".
function monthBefore(d: string) {
  const x = asDate(d);
  x.setUTCDate(1);
  x.setUTCMonth(x.getUTCMonth() - 1);
  return x.toISOString().slice(0, 10);
}
const quarterName = (d: string) => `Q${Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1} ${d.slice(0, 4)}`;
const pct = (v: number, digits = 2) => `${v.toFixed(digits)}%`;
// "increased 3.42%" / "decreased 0.40%" (uses the absolute value).
const change = (v: number, digits = 2) => `${v >= 0 ? "increased" : "decreased"} ${pct(Math.abs(v), digits)}`;

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
  title: string,
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
          `The Bureau of Labor Statistics reported that the Consumer Price Index (CPI) ${change(now.value)} ` +
          `over the 12 months ending in ${monthName(now.date)}` +
          (coreNow
            ? `, while core CPI, which excludes food and energy, ${change(coreNow.value)}.`
            : "."),
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
          `The Bureau of Economic Analysis reported that the personal consumption expenditures (PCE) price index ` +
          `${change(now.value)} over the 12 months ending in ${monthName(now.date)}` +
          (coreNow
            ? `, while the core PCE price index, which excludes food and energy, ${change(coreNow.value)}.`
            : "."),
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
        headline: `${jobs.value >= 0 ? "+" : "−"}${(Math.round(Math.abs(jobs.value)) * 1000).toLocaleString("en-US")}`,
        headlineLabel: `Jobs added, ${monthName(jobs.date)}`,
        summary:
          `The Bureau of Labor Statistics reported that total nonfarm payroll employment ` +
          `${jobs.value >= 0 ? "increased" : "decreased"} by ${count} in ${monthName(jobs.date)}, ` +
          `and the unemployment rate was ${pct(rate.value, 1)}.`,
      };
    }

    case "GDP": {
      const now = (await getSeries("A191RL1Q225SBEA", { start: START })).at(-1);
      if (!now) return null;
      return {
        type, date, title: "GDP Report", href: "/dashboard#chart-gdp",
        headline: pct(now.value, 1), headlineLabel: `Real GDP growth, ${quarterName(now.date)}`,
        summary:
          `The Bureau of Economic Analysis reported that real gross domestic product (GDP) in the United States ` +
          `${now.value >= 0 ? "increased" : "decreased"} at an annualized rate of ${pct(Math.abs(now.value), 1)} in ${quarterName(now.date)}.`,
      };
    }

    case "SEP": {
      // Fed officials' median projections, one value per year (FRED, from the latest SEP).
      const ids = ["FEDTARMD", "GDPC1MD", "UNRATEMD", "PCECTPIMD"];
      const series = await Promise.all(ids.map((id) => getSeries(id, { start: "2000-01-01" })));
      const year = date.slice(0, 4);
      const [rate, gdp, unemployment, pce] = series.map((pts) => pts.find((p) => p.date.startsWith(year)));
      if (!rate) return null;
      const parts = [
        `${pct(rate.value, 1)} for the federal funds rate`,
        gdp && `${pct(gdp.value, 1)} real GDP growth`,
        unemployment && `${pct(unemployment.value, 1)} unemployment`,
        pce && `${pct(pce.value, 1)} PCE inflation`,
      ].filter(Boolean) as string[];
      const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
      return {
        type, date, title: "Summary of Economic Projections", href: "/dashboard#chart-fedfunds",
        headline: pct(rate.value, 1), headlineLabel: `Median fed funds projection, end of ${year}`,
        summary:
          `The Federal Open Market Committee (FOMC) released its Summary of Economic Projections (SEP), ` +
          `with median projections for the end of ${year} of ${list}.`,
      };
    }

    case "ISM": {
      // ISM's numbers aren't on FRED, so the card announces the release and links to
      // ISM's own report instead of showing a reading.
      const services = title.includes("Services");
      return {
        type, date, title, href: ISM_REPORTS_URL, external: true, guideHref: "/learn/pmi",
        summary:
          `The Institute for Supply Management (ISM) released its ${services ? "Services" : "Manufacturing"} PMI for ${monthName(monthBefore(date))}, ` +
          `a monthly survey of purchasing managers at U.S. ${services ? "service businesses" : "manufacturers"}.`,
      };
    }

    case "FOMC": {
      const decision = await fomcDecision(date, meetingStart);
      if (!decision) return null;
      return {
        type, date, title: "FOMC Rate Decision", href: "/dashboard#chart-fedfunds",
        headline: decision.range, headlineLabel: "Fed funds target range", summary: decision.summary,
      };
    }
  }
}

// What the FOMC decided at its most recent meeting (ending on `date`): the current
// target range, and whether it was a hike, cut or hold. Null if FRED's data is missing.
export async function fomcDecision(date: string, meetingStart: string | undefined) {
  const [upper, lower] = await Promise.all([
    getSeries("DFEDTARU", { start: START }),
    getSeries("DFEDTARL", { start: START }),
  ]);
  // FRED records a new range from the day after the decision, so read the latest
  // value (this is only used for the most recent meeting).
  const nowUpper = upper.at(-1)?.value;
  const nowLower = lower.at(-1)?.value;
  // The range before this meeting began, to tell a hike, cut or hold apart.
  const dayBefore = asDate(meetingStart ?? date);
  dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
  const prevUpper = valueOn(upper, dayBefore.toISOString().slice(0, 10))?.value;
  if (nowUpper === undefined || nowLower === undefined || prevUpper === undefined) return null;

  const range = `${nowLower.toFixed(2)}–${pct(nowUpper)}`; // "3.75–4.00%"
  const diff = nowUpper - prevUpper;
  const bp = Math.round(Math.abs(diff) * 100);
  const action = Math.abs(diff) < 0.001 ? "held" : diff > 0 ? "raised" : "lowered";
  const summary =
    action === "held"
      ? `The Federal Open Market Committee (FOMC) maintained the target range for the federal funds rate at ${range}.`
      : `The Federal Open Market Committee (FOMC) ${action} the target range for the federal funds rate by ${bp} basis points to ${range}.`;
  return { range, action, bp, summary };
}

// The outcome of each past FOMC meeting (keyed by decision date): the range before
// the meeting vs. the range the day after the decision, when FRED has that day yet.
export async function fomcResults(meetings: { date: string; meetingStart?: string }[]) {
  const [upper, lower] = await Promise.all([
    getSeries("DFEDTARU", { start: START }),
    getSeries("DFEDTARL", { start: START }),
  ]);
  const lastDate = upper.at(-1)?.date ?? "";
  const shift = (d: string, days: number) => {
    const x = asDate(d);
    x.setUTCDate(x.getUTCDate() + days);
    return x.toISOString().slice(0, 10);
  };
  const results: Record<string, { action: "held" | "raised" | "lowered"; bp: number; range: string }> = {};
  for (const m of meetings) {
    const dayAfter = shift(m.date, 1);
    if (dayAfter > lastDate) continue; // FRED hasn't recorded the new range yet
    const before = valueOn(upper, shift(m.meetingStart ?? m.date, -1))?.value;
    const afterUpper = valueOn(upper, dayAfter)?.value;
    const afterLower = valueOn(lower, dayAfter)?.value;
    if (before === undefined || afterUpper === undefined || afterLower === undefined) continue;
    const diff = afterUpper - before;
    results[m.date] = {
      action: Math.abs(diff) < 0.001 ? "held" : diff > 0 ? "raised" : "lowered",
      bp: Math.round(Math.abs(diff) * 100),
      range: `${afterLower.toFixed(2)}–${pct(afterUpper)}`,
    };
  }
  return results;
}

// Official Federal Reserve pages for the meeting decided on `date` (YYYY-MM-DD).
export function fomcLinks(date: string, withSep?: boolean) {
  const d = date.replaceAll("-", "");
  return {
    statement: `https://www.federalreserve.gov/newsevents/pressreleases/monetary${d}a.htm`,
    pressConference: `https://www.federalreserve.gov/monetarypolicy/fomcpresconf${d}.htm`,
    projections: withSep ? `https://www.federalreserve.gov/monetarypolicy/fomcprojtabl${d}.htm` : undefined,
  };
}

// The most recent release date's event(s) — several reports can share a day.
// Anything whose numbers can't be loaded is left out.
export async function getLatestReleases(): Promise<LatestRelease[]> {
  if (!hasFredKey()) return [];
  const recent = await getRecentEvents();
  const latestDate = recent[0]?.date;
  const sameDay = recent.filter((e) => e.date === latestDate);
  const results = await Promise.allSettled(sameDay.map((e) => summarize(e.type, e.date, e.meetingStart, e.title)));
  return results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}
