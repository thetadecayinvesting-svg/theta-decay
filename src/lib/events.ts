// Shared by server and browser code — keep this file free of FRED/server imports.

export type EventType = "FOMC" | "SEP" | "CPI" | "Jobs" | "GDP" | "PCE" | "ISM";

export type CalendarEvent = {
  date: string; // YYYY-MM-DD, the day the news hits
  type: EventType;
  title: string;
  detail: string;
  timeET: string; // official release time, 24-hour Eastern Time, e.g. "08:30"
  meetingStart?: string; // FOMC only: first day of the two-day meeting
  withSep?: boolean; // FOMC only: the Summary of Economic Projections comes out the same day
};

// highImpact events get the violet "High impact" badge on the calendar.
export const EVENT_META: Record<EventType, { label: string; highImpact: boolean }> = {
  FOMC: { label: "FOMC", highImpact: true },
  SEP: { label: "SEP", highImpact: true },
  CPI: { label: "CPI", highImpact: true },
  Jobs: { label: "Jobs", highImpact: true },
  GDP: { label: "GDP", highImpact: false },
  PCE: { label: "PCE", highImpact: false },
  ISM: { label: "ISM PMI", highImpact: false },
};

// One-line explainers for each event type, with a link to the full Learn guide.
export const EVENT_GUIDES: Record<EventType, { summary: string; href: string }> = {
  FOMC: {
    summary:
      "The Federal Reserve's rate-setting committee announces its decision on the federal funds rate, which shapes borrowing costs across the economy.",
    href: "/learn/fed-funds-rate",
  },
  SEP: {
    summary:
      "Fed officials' forecasts for interest rates, growth, unemployment and inflation, including the \"dot plot\".",
    href: "/learn/fed-funds-rate",
  },
  CPI: {
    summary:
      "The most widely followed U.S. inflation report: how much consumer prices have changed over the past year.",
    href: "/learn/cpi",
  },
  Jobs: {
    summary:
      "The monthly jobs report: how many jobs employers added and the unemployment rate, a key input for Fed decisions.",
    href: "/learn/jobs-report",
  },
  GDP: {
    summary: "The broadest measure of how fast the U.S. economy is growing, reported each quarter.",
    href: "/learn/gdp",
  },
  PCE: {
    summary:
      "The Federal Reserve's preferred inflation gauge, used for its 2% target.",
    href: "/learn/pce",
  },
  ISM: {
    summary:
      "A survey of purchasing managers; readings above 50 mean the sector is expanding, below 50 that it's contracting.",
    href: "/learn/pmi",
  },
};
