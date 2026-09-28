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

function fomcEvents(): CalendarEvent[] {
  return FOMC_MEETINGS.map(([start, end, sep]) => ({
    date: end,
    type: "FOMC",
    title: "FOMC Rate Decision",
    detail: `Two-day meeting ${formatShortRange(start, end)}${
      sep ? " · with Summary of Economic Projections" : ""
    } · Press conference 2:30 PM`,
    time: "2:00 PM ET",
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
  const events = fomcEvents();
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
            time: "8:30 AM ET",
          });
        }
      } else {
        errors.push(`${release.title}: ${String(result.reason?.message ?? result.reason)}`);
      }
    });
  }

  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type));

  return { events: upcoming, errors, missingKey };
}
