import Link from "next/link";
import { EVENT_META } from "@/lib/events";
import type { LatestRelease } from "@/lib/latest";

function releasedLabel(date: string, today: string) {
  const days = Math.round(
    (new Date(`${today}T12:00:00Z`).getTime() - new Date(`${date}T12:00:00Z`).getTime()) / 86_400_000,
  );
  const when = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const ago = days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  return `${when} · ${ago}`;
}

// "Latest results": the most recent Fed decision and data releases, summarized.
export default function LatestReleases({
  releases,
  today,
}: {
  releases: LatestRelease[];
  today: string;
}) {
  if (releases.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Latest results</h2>
        <p className="mt-1 text-sm text-muted">
          What the most recent Fed meeting and economic reports showed, newest first.
          <span className="sm:hidden"> Swipe for more.</span>
        </p>
      </div>
      {/* Phones: a swipeable row. Larger screens: a grid. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {releases.map((r, i) => {
          const featured = i === 0;
          return (
            <article
              key={r.type}
              className={`flex w-[85%] shrink-0 snap-start flex-col rounded-lg border border-border bg-surface p-5 sm:w-auto ${
                featured ? "border-l-4 border-l-accent sm:col-span-2 sm:p-6" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg border border-border px-2 py-0.5 font-medium text-muted">
                  {EVENT_META[r.type].label}
                </span>
                {featured && (
                  <span className="rounded-lg bg-accent-soft px-2 py-0.5 font-medium text-accent-hover">
                    Most recent
                  </span>
                )}
                <span className="text-muted">{releasedLabel(r.date, today)}</span>
              </div>

              <h3 className={`mt-3 font-medium ${featured ? "text-lg" : ""}`}>{r.title}</h3>

              <div className="mt-2">
                <div className={`num font-semibold leading-tight ${featured ? "text-3xl" : "text-2xl"}`}>
                  {r.headline}
                </div>
                <div className="text-xs text-muted">{r.headlineLabel}</div>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{r.summary}</p>

              <Link href={r.href} className="mt-4 self-start text-xs font-medium text-accent hover:text-accent-hover">
                See the chart →
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
