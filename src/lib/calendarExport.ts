// "Add to calendar" support: Google Calendar links and .ics files (Apple
// Calendar, Outlook, Google). Shared by the browser and the /calendar.ics feed.

import type { CalendarEvent } from "./events";
import { SITE_URL } from "./site";
import { easternToInstant } from "./timezone";

// FOMC decisions run into the press conference; data releases are quick.
const DURATION_MINUTES = { FOMC: 60, default: 30 } as const;

export function eventTimes(event: CalendarEvent) {
  const start = easternToInstant(event.date, event.timeET);
  const minutes = event.type === "FOMC" ? DURATION_MINUTES.FOMC : DURATION_MINUTES.default;
  return { start: new Date(start), end: new Date(start + minutes * 60_000) };
}

// 20261028T180000Z
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const describe = (event: CalendarEvent) =>
  `${event.detail}. Times and history: ${SITE_URL}/ (Theta Decay Investing economic calendar).`;

export function googleCalendarUrl(event: CalendarEvent) {
  const { start, end } = eventTimes(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: describe(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// Text values in .ics files escape backslashes, commas, semicolons and newlines.
const BACKSLASH = String.fromCharCode(92);
function escapeText(value: string) {
  return value
    .split(BACKSLASH).join(BACKSLASH + BACKSLASH)
    .replace(/;/g, BACKSLASH + ";")
    .replace(/,/g, BACKSLASH + ",")
    .replace(/\n/g, BACKSLASH + "n");
}

// Lines longer than 75 characters are "folded" onto continuation lines.
function fold(line: string) {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  parts.push(rest);
  return parts.join("\r\n");
}

export function icsCalendar(events: CalendarEvent[], name = "Theta Decay Economic Calendar") {
  const now = stamp(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Theta Decay Investing//Economic Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "X-PUBLISHED-TTL:PT12H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
  ];
  for (const event of events) {
    const { start, end } = eventTimes(event);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.date}-${event.type}@thetadecayinvesting.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(describe(event))}`,
      `URL:${SITE_URL}/#event-${event.date}-${event.type}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
