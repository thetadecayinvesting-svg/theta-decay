import CalendarView from "@/components/CalendarView";
import KeyNotice from "@/components/KeyNotice";
import { getCalendar, todayET } from "@/lib/calendar";

// Rebuild the page at most once an hour so "today" and FRED dates stay fresh.
export const revalidate = 3600;

export default async function Home() {
  const { events, errors, missingKey } = await getCalendar();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Economic Calendar</h1>
        <p className="mt-2 max-w-2xl text-muted">
          The market-moving dates ahead: Fed rate decisions, inflation prints,
          jobs reports and GDP.
        </p>
      </div>

      {missingKey && (
        <KeyNotice what="CPI, jobs, GDP and PCE release dates" />
      )}
      {errors.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">
          <p className="font-medium text-primary">Some release dates couldn&apos;t load</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <CalendarView events={events} today={todayET()} />
    </div>
  );
}
