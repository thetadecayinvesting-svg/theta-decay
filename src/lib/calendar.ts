import type { CalendarEvent, EventType } from "./events";
import { getReleaseDates, hasFredKey } from "./fred";

// Official FOMC schedule (federalreserve.gov/monetarypolicy/fomccalendars.htm).
// [first day, decision day, has Summary of Economic Projections]
// Update this list when the Fed publishes the next year's calendar.
const FOMC_MEETINGS: [string, string, boolean][] = [
  ["2026-01-27", "2026-01-28", false],
  ["2026-03-17", "2026-03-18", true],
  ["2026-04-28", "2026-04-29", false],
  ["2026-06-16", "2026-06-17", true],
  ["2026-07-28", "2026-07-29", false],
  ["2026-09-15", "2026-09-16", true],
  ["2026-10-27", "2026-10-28", false],
  ["2026-12-08", "2026-12-09", true],
  ["2027-01-26", "2027-01-27", false],
  ["2027-03-16", "2027-03-17", true],
  ["2027-04-27", "2027-04-28", false],
  ["2027-06-08", "2027-06-09", true],
  ["2027-07-27", "2027-07-28", false],
  ["2027-09-14", "2027-09-15", true],
  ["2027-10-26", "2027-10-27", false],
  ["2027-12-07", "2027-12-08", true],
];

// FRED release IDs for the data releases we track.
const FRED_RELEASES: {
  id: number;
  type: EventType;
  title: string;
  detail: string;
}[] = [
  {
    id: 10,
    type: "CPI",
    title: "CPI Report",
    detail: "Consumer Price Index — BLS",
  },
  {
    id: 50,
    type: "Jobs",
    title: "Jobs Report",
    detail: "Employment Situation: payrolls & unemployment — BLS",
  },
  {
    id: 53,
    type: "GDP",
    title: "GDP Report",
    detail: "Gross Domestic Product — BEA",
  },
  {
    id: 54,
    type: "PCE",
    title: "PCE Inflation",
    detail: "Personal Income & Outlays, the Fed's preferred inflation gauge — BEA",
  },
];

function formatShortRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return `${fmt(start)}–${fmt(end).replace(/^\w+ /, "")}`;
}

// ISM Report On Business release dates (Institute for Supply Management), 10:00 AM ET.
// ISM data isn't on FRED, so these come from ISM's published schedule. Add the
// next year's dates when ISM publishes them (ismworld.org, "Report On Business").
const ISM_RELEASES: { date: string; kind: "Manufacturing" | "Services" }[] = [
  { date: "2026-10-01", kind: "Manufacturing" },
  { date: "2026-10-05", kind: "Services" },
  { date: "2026-11-02", kind: "Manufacturing" },
  { date: "2026-11-04", kind: "Services" },
  { date: "2026-12-01", kind: "Manufacturing" },
  { date: "2026-12-03", kind: "Services" },
];

function ismEvents(): CalendarEvent[] {
  return ISM_RELEASES.map(({ date, kind }) => ({
    date,
    type: "ISM",
    title: `ISM ${kind} PMI`,
    detail:
      kind === "Manufacturing"
        ? "Purchasing Managers' Index for U.S. manufacturing; above 50 means expansion — ISM"
        : "Purchasing Managers' Index for U.S. services; above 50 means expansion — ISM",
    timeET: "10:00",
  }));
}

// Summary of Economic Projections: published with the statement at four of the
// eight FOMC meetings (the ones marked in FOMC_MEETINGS).
function sepEvents(): CalendarEvent[] {
  return FOMC_MEETINGS.filter(([, , sep]) => sep).map(([start, end]) => ({
    date: end,
    meetingStart: start,
    type: "SEP",
    title: "Summary of Economic Projections",
    detail: "Fed officials' forecasts for rates, growth, unemployment and inflation, including the \"dot plot\"",
    timeET: "14:00",
  }));
}

function fomcEvents(): CalendarEvent[] {
  return FOMC_MEETINGS.map(([start, end, sep]) => ({
    date: end,
    meetingStart: start,
    withSep: sep,
    type: "FOMC",
    title: "FOMC Rate Decision",
    detail: `Two-day meeting ${formatShortRange(start, end)}${
      sep ? " · with Summary of Economic Projections" : ""
    } · Press conference follows the statement`,
    timeET: "14:00",
  }));
}

// Today's date in New York, as YYYY-MM-DD.
export function todayET() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

export async function getCalendar(): Promise<{
  events: CalendarEvent[];
  errors: string[];
  missingKey: boolean;
}> {
  const today = todayET();
  // SEP releases are shown as part of their FOMC meeting (withSep), not separately.
  const events = [...fomcEvents(), ...ismEvents()];
  const errors: string[] = [];
  const missingKey = !hasFredKey();

  if (!missingKey) {
    const results = await Promise.allSettled(
      FRED_RELEASES.map((r) => getReleaseDates(r.id, today)),
    );
    results.forEach((result, i) => {
      const release = FRED_RELEASES[i];
      if (result.status === "fulfilled") {
        for (const date of result.value) {
          events.push({
            date,
            type: release.type,
            title: release.title,
            detail: release.detail,
            timeET: "08:30",
          });
        }
      } else {
        errors.push(`${release.title}: ${String(result.reason?.message ?? result.reason)}`);
      }
    });
  }

  const nowMinutes = minutesNowET();
  const upcoming = events
    .filter((e) => !hasHappened(e, today, nowMinutes))
    .sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type));

  return { events: upcoming, errors, missingKey };
}

// Minutes since midnight in New York right now.
function minutesNowET() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return get("hour") * 60 + get("minute");
}

// True once an event's release time (plus 30 minutes) has passed, in New York time.
function hasHappened(e: CalendarEvent, today: string, nowMinutes: number) {
  if (e.date < today) return true;
  if (e.date > today) return false;
  const [h, m] = e.timeET.split(":").map(Number);
  return nowMinutes >= h * 60 + m + 30;
}

// The most recent event of each type that has already happened (newest first).
// Same-day releases count once their time has passed, plus a short buffer for
// FRED to publish the new numbers.
export async function getRecentEvents(): Promise<CalendarEvent[]> {
  const today = todayET();
  const nowMinutes = minutesNowET();
  const from = new Date(Date.now() - 150 * 86_400_000).toISOString().slice(0, 10);
  const events = [...fomcEvents(), ...sepEvents(), ...ismEvents()];

  if (hasFredKey()) {
    const results = await Promise.allSettled(FRED_RELEASES.map((r) => getReleaseDates(r.id, from)));
    results.forEach((result, i) => {
      if (result.status !== "fulfilled") return;
      const release = FRED_RELEASES[i];
      for (const date of result.value) {
        events.push({ date, type: release.type, title: release.title, detail: release.detail, timeET: "08:30" });
      }
    });
  }

  const happened = (e: CalendarEvent) => hasHappened(e, today, nowMinutes);

  const latest = new Map<EventType, CalendarEvent>();
  for (const e of events.filter(happened)) {
    const current = latest.get(e.type);
    if (!current || e.date > current.date) latest.set(e.type, e);
  }
  return [...latest.values()].sort((a, b) => b.date.localeCompare(a.date));
}
