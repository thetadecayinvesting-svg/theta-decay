import { getCalendar } from "@/lib/calendar";
import { icsCalendar } from "@/lib/calendarExport";

// /calendar.ics: every upcoming event as a calendar feed people can subscribe
// to in Google Calendar, Apple Calendar or Outlook. Rebuilt at most hourly.
export const revalidate = 3600;

export async function GET() {
  const { events } = await getCalendar();
  return new Response(icsCalendar(events), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="theta-decay-economic-calendar.ics"',
    },
  });
}
