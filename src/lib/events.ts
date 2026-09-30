// Shared by server and browser code — keep this file free of FRED/server imports.

export type EventType = "FOMC" | "CPI" | "Jobs" | "GDP" | "PCE";

export type CalendarEvent = {
  date: string; // YYYY-MM-DD, the day the news hits
  type: EventType;
  title: string;
  detail: string;
  timeET: string; // official release time, 24-hour Eastern Time, e.g. "08:30"
  meetingStart?: string; // FOMC only: first day of the two-day meeting
};

// highImpact events get the violet "High impact" badge on the calendar.
export const EVENT_META: Record<EventType, { label: string; highImpact: boolean }> = {
  FOMC: { label: "FOMC", highImpact: true },
  CPI: { label: "CPI", highImpact: true },
  Jobs: { label: "Jobs", highImpact: true },
  GDP: { label: "GDP", highImpact: false },
  PCE: { label: "PCE", highImpact: false },
};
