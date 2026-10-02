import Link from "next/link";
import { EVENT_META } from "@/lib/events";
import type { LatestRelease } from "@/lib/latest";

// "Latest releases": the most recent Fed decision or data release — or all of
// them, if several came out on the same day — summarized in plain English.
export default function LatestReleases({ releases }: { releases: LatestRelease[] }) {
  if (releases.length === 0) return null;
  const date = new Date(`${releases[0].date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Latest releases</h2>
        <p className="mt-1 text-sm text-muted">
          What the most recent {releases.length > 1 ? "reports" : "report"} showed · {date}
        </p>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border border-l-4 border-l-accent bg-surface">
        {releases.map((r) => (
          <article key={r.type} className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-border px-2 py-0.5 font-medium text-muted">
                {EVENT_META[r.type].label}
              </span>
              {EVENT_META[r.type].highImpact && (
                <span className="rounded-lg bg-accent-soft px-2 py-0.5 font-medium text-accent-hover">
                  High impact
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
              <h3 className="text-xl font-semibold tracking-tight">{r.title}</h3>
              <div className="text-right">
                <div className="num text-3xl font-semibold leading-tight">{r.headline}</div>
                <div className="text-xs text-muted">{r.headlineLabel}</div>
              </div>
            </div>

            <p className="mt-4 max-w-3xl leading-relaxed text-muted">{r.summary}</p>

            <Link
              href={r.href}
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
            >
              See the chart →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
