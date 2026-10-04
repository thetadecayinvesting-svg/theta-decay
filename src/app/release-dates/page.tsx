import type { Metadata } from "next";
import Link from "next/link";
import { getSchedule, todayET } from "@/lib/calendar";
import { RELEASE_PAGES, releaseHref } from "@/lib/releasePages";
import { pageMetadata } from "@/lib/site";

// Refresh hourly so each "next" date moves on once a report comes out.
export const revalidate = 3600;

const year = () => todayET().slice(0, 4);

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: `Economic Data Release Dates ${year()}`,
    description: `${year()} release schedules for the reports that move markets: CPI, FOMC meetings, the jobs report, GDP, PCE inflation and the ISM PMI.`,
    path: "/release-dates",
  });
}

const fmt = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

export default async function ReleaseDatesIndex() {
  const nextDates = await Promise.all(
    RELEASE_PAGES.map((p) =>
      getSchedule(p.type)
        .then((s) => s.find((e) => !e.happened)?.date)
        .catch(() => undefined),
    ),
  );

  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Economic Data Release Dates {year()}</h1>
        <p className="mt-2 text-muted">
          Full release schedules for the reports that move markets, with the next date for each. For everything
          coming up this week, see the <Link href="/" className="text-accent hover:text-accent-hover">calendar</Link>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RELEASE_PAGES.map((p, i) => (
          <Link
            key={p.slug}
            href={releaseHref(p.slug)}
            className="flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
          >
            <span className="font-semibold">{p.h1.replace("{year}", year())}</span>
            <span className="mt-1 flex-1 text-sm text-muted">{p.publisher}</span>
            <span className="mt-4 text-sm">
              <span className="text-muted">Next: </span>
              <span className="font-medium">{nextDates[i] ? fmt(nextDates[i]) : "To be announced"}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
