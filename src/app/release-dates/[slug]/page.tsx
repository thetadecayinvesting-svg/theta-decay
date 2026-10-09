import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCalendar from "@/components/AddToCalendar";
import NewsletterSignup from "@/components/NewsletterSignup";
import { hasBeehiiv } from "@/lib/beehiiv";
import { getSchedule, todayET } from "@/lib/calendar";
import { yearsAgo } from "@/lib/chartFormat";
import type { CalendarEvent } from "@/lib/events";
import { GUIDES } from "@/lib/learnContent";
import { loadStat } from "@/lib/learnStats";
import { learnHref } from "@/lib/learnTopics";
import { RELEASE_PAGES, releaseHref, type ReleasePage } from "@/lib/releasePages";
import { fomcDecision, fomcLinks, fomcResults } from "@/lib/latest";
import { jsonLdScript, pageMetadata, SITE_URL } from "@/lib/site";

// Link to an official page, styled like the site's other small buttons.
function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-hover"
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M11 4h5v5M16 4l-7 7M14 11.5V16H4V6h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </a>
  );
}

// Refresh hourly so "next release" moves on as soon as a report comes out.
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return RELEASE_PAGES.map((p) => ({ slug: p.slug }));
}

const year = () => todayET().slice(0, 4);
const withYear = (s: string) => s.replaceAll("{year}", year());

export async function generateMetadata({ params }: PageProps<"/release-dates/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = RELEASE_PAGES.find((p) => p.slug === slug);
  if (!page) return {};
  return pageMetadata({
    title: withYear(page.metaTitle),
    description: (await liveDescription(page).catch(() => null)) ?? withYear(page.metaDescription),
    path: releaseHref(slug),
  });
}

// Search-result description that answers the question directly: the next date
// (and, for the FOMC, the last decision). Null when no upcoming date is known.
async function liveDescription(page: ReleasePage) {
  const schedule = await getSchedule(page.type);
  const next = schedule.find((e) => !e.happened);
  if (!next) return null;
  const when = `${fmt(next.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${timeLabel(next.timeET)}`;

  if (page.type === "FOMC") {
    // "October 27–28, 2026" (or "April 30–May 1, 2026" across a month end)
    const start = next.meetingStart ?? next.date;
    const sameMonth = start.slice(0, 7) === next.date.slice(0, 7);
    const meeting = `${fmt(start, { month: "long", day: "numeric" })}–${fmt(next.date, sameMonth ? { day: "numeric" } : { month: "long", day: "numeric" })}, ${next.date.slice(0, 4)}`;
    const last = schedule.findLast((e) => e.happened);
    const decision = last ? await fomcDecision(last.date, last.meetingStart).catch(() => null) : null;
    const lastText = decision
      ? decision.action === "held"
        ? ` Last decision: rates held at ${decision.range}.`
        : ` Last decision: rates ${decision.action} by ${decision.bp} basis points to ${decision.range}.`
      : "";
    return `Next FOMC meeting: ${meeting}, decision at ${timeLabel(next.timeET)}.${lastText} Full ${year()} schedule.`;
  }

  const detail =
    page.type === "ISM" ? ` (${next.title.replace(/^ISM /, "")})` : coversLabel(next.date, page) ? `, covering ${coversLabel(next.date, page)}` : "";
  const scheduleText = page.fullYearKnown === false ? "Upcoming release dates" : `Full ${year()} release schedule`;
  return `Next ${reportLabel(page)}: ${when}${detail}. ${scheduleText}, latest reading and FAQs.`;
}

// "CPI report", but "Jobs Report" (not "Jobs Report report").
const reportLabel = (page: ReleasePage) => (page.name.endsWith("Report") ? page.name : `${page.name} report`);

const asDate = (d: string) => new Date(`${d}T12:00:00Z`);
const fmt = (d: string, opts: Intl.DateTimeFormatOptions) => asDate(d).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

// "08:30" → "8:30 AM ET"
function timeLabel(timeET: string) {
  const [h, m] = timeET.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"} ET`;
}

// The month of data a release covers, e.g. a mid-October CPI report covers September.
function coversLabel(date: string, page: ReleasePage) {
  if (page.coversLagMonths === undefined) return null;
  const d = asDate(date);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - page.coversLagMonths);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

// "Oct 27–28" for a two-day FOMC meeting.
function meetingLabel(e: CalendarEvent) {
  if (!e.meetingStart) return fmt(e.date, { month: "short", day: "numeric" });
  const start = fmt(e.meetingStart, { month: "short", day: "numeric" });
  const end = fmt(e.date, { month: "short", day: "numeric" });
  return `${start}–${end.slice(0, 3) === start.slice(0, 3) ? end.slice(4) : end}`;
}

// "October 27–28" for a two-day FOMC meeting (full month names, for sentences).
function meetingDays(e: CalendarEvent) {
  const start = e.meetingStart ?? e.date;
  const sameMonth = start.slice(0, 7) === e.date.slice(0, 7);
  return `${fmt(start, { month: "long", day: "numeric" })}–${fmt(e.date, sameMonth ? { day: "numeric" } : { month: "long", day: "numeric" })}`;
}

type FomcResult = { action: "held" | "raised" | "lowered"; bp: number; range: string };

// One year's release schedule. For the FOMC, `results` adds what each past meeting decided.
function ScheduleTable({
  page,
  rows,
  next,
  results,
}: {
  page: ReleasePage;
  rows: (CalendarEvent & { happened: boolean })[];
  next: CalendarEvent | undefined;
  results: Record<string, FomcResult> | null;
}) {
  const isFomc = page.type === "FOMC";
  const isIsm = page.type === "ISM";
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            {isFomc && <th className="px-4 py-3 font-medium">Meeting</th>}
            <th className="px-4 py-3 font-medium">{isFomc ? "Decision day" : "Release date"}</th>
            <th className="px-4 py-3 font-medium">Time</th>
            {isIsm && <th className="px-4 py-3 font-medium">Report</th>}
            {page.coversLagMonths !== undefined && <th className="px-4 py-3 font-medium">Data for</th>}
            {isFomc && <th className="px-4 py-3 font-medium">Projections</th>}
            {results && <th className="px-4 py-3 font-medium">Result</th>}
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((e) => {
            const isNext = e === next;
            const result = results?.[e.date];
            return (
              <tr key={`${e.date}-${e.title}`} className={isNext ? "bg-accent-soft" : e.happened ? "text-muted" : ""}>
                {isFomc && <td className="px-4 py-3 whitespace-nowrap">{meetingLabel(e)}</td>}
                <td className="px-4 py-3 font-medium whitespace-nowrap">{fmt(e.date, { weekday: "short", month: "short", day: "numeric" })}</td>
                <td className="px-4 py-3 whitespace-nowrap">{timeLabel(e.timeET)}</td>
                {isIsm && <td className="px-4 py-3">{e.title.replace(/^ISM | PMI$/g, "")}</td>}
                {page.coversLagMonths !== undefined && <td className="px-4 py-3 whitespace-nowrap">{coversLabel(e.date, page)}</td>}
                {isFomc && <td className="px-4 py-3">{e.withSep ? "Dot plot" : "—"}</td>}
                {results && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {result ? (
                      <>
                        <div className="text-primary">
                          {result.action === "held" ? "Held steady" : `${result.action === "raised" ? "Raised" : "Lowered"} by ${result.bp} basis points`}
                        </div>
                        <div className="num text-xs text-muted">{result.range}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  {isNext ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-on-accent">Next</span>
                  ) : e.happened ? (
                    "Released"
                  ) : (
                    "Upcoming"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function ReleaseDatesPage({ params }: PageProps<"/release-dates/[slug]">) {
  const { slug } = await params;
  const page = RELEASE_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const guide = GUIDES[page.guideSlug];
  const [schedule, stats] = await Promise.all([
    getSchedule(page.type).catch(() => []),
    Promise.all((guide?.stats ?? []).map((s) => loadStat(s, yearsAgo(2)))),
  ]);
  const thisYear = year();
  const isFomc = page.type === "FOMC";
  const isIsm = page.type === "ISM";
  const fullYear = page.fullYearKnown !== false;
  const next = schedule.find((e) => !e.happened);
  const rows = schedule.filter((e) => e.date.startsWith(thisYear));
  const later = schedule.filter((e) => e.date > `${thisYear}-12-31`);
  const reportName = isFomc ? "FOMC meeting" : reportLabel(page);

  // FOMC only: what the Fed decided last time, with links to the official pages.
  const lastMeeting = isFomc ? schedule.findLast((e) => e.happened) : undefined;
  const decision = lastMeeting ? await fomcDecision(lastMeeting.date, lastMeeting.meetingStart).catch(() => null) : null;
  const links = lastMeeting ? fomcLinks(lastMeeting.date, lastMeeting.withSep) : null;
  const lastDate = lastMeeting ? fmt(lastMeeting.date, { month: "long", day: "numeric", year: "numeric" }) : "";
  // Every past 2026 meeting's outcome, for the Result column.
  const results = isFomc ? await fomcResults(rows.filter((e) => e.happened)).catch(() => ({})) : null;
  const nextYear = String(Number(thisYear) + 1);
  const nextYearRows = later.filter((e) => e.date.startsWith(nextYear));
  // The decision box already shows the target range, so don't repeat it as a stat card.
  const shownStats = stats.filter((st, i) => st && !(decision && guide?.stats[i]?.format === "range"));

  const nextText = next
    ? `The next ${reportName} ${isFomc ? "decision is" : "comes out"} on ${fmt(next.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${timeLabel(next.timeET)}${
        isIsm ? ` (${next.title.replace(/^ISM /, "")})` : coversLabel(next.date, page) ? `, covering ${coversLabel(next.date, page)}` : ""
      }.`
    : `The next ${reportName} date hasn't been published yet. Check back soon.`;

  const faqs = [
    { q: `When is the next ${reportName}?`, a: nextText },
    ...(decision
      ? [
          {
            q: "What did the Fed decide at its last meeting?",
            a: `At its meeting on ${lastDate}, the Fed ${
              decision.action === "held"
                ? `kept the federal funds rate target range at ${decision.range}`
                : `${decision.action} the federal funds rate target range by ${decision.bp} basis points to ${decision.range}`
            }. The full FOMC statement is published on the Federal Reserve's website.`,
          },
        ]
      : []),
    ...(nextYearRows.length > 0
      ? [
          isFomc
            ? {
                q: `When are the FOMC meetings in ${nextYear}?`,
                a: `The FOMC has scheduled ${nextYearRows.length} meetings in ${nextYear}: ${nextYearRows
                  .map((e) => meetingDays(e))
                  .join(", ")}. Each rate decision is announced at 2:00 PM ET on the second day.`,
              }
            : {
                q: `When are the ${reportLabel(page)}s in ${nextYear}?`,
                a: `The ${page.publisher} has scheduled ${nextYearRows.length} ${page.name} releases in ${nextYear}: ${nextYearRows
                  .map((e) => fmt(e.date, { month: "long", day: "numeric" }))
                  .join(", ")}, each at ${timeLabel(nextYearRows[0].timeET)}.`,
              },
        ]
      : []),
    ...page.faqs,
    ...(fullYear
      ? [
          {
            q: `How many ${isFomc ? "FOMC meetings" : `${reportLabel(page)}s`} are there in ${thisYear}?`,
            a: `There are ${rows.length} scheduled ${isFomc ? "FOMC meetings" : `${page.name} releases`} in ${thisYear}. The full schedule is listed above.`,
          },
        ]
      : []),
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Release dates", item: `${SITE_URL}/release-dates` },
        { "@type": "ListItem", position: 2, name: withYear(page.h1), item: `${SITE_URL}${releaseHref(slug)}` },
      ],
    },
  ];

  return (
    <div className="max-w-3xl space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }} />

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          <Link href="/" className="hover:text-accent-hover">Economic Calendar</Link> ·{" "}
          <Link href="/release-dates" className="hover:text-accent-hover">Release dates</Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{withYear(page.h1)}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{page.intro}</p>
      </div>

      {/* Next release + latest reading */}
      <section className={`grid gap-4 ${shownStats.length === 1 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <div className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-5">
          <div className="text-xs text-muted">Next {reportName}</div>
          {next ? (
            <>
              <div className="mt-1 text-2xl font-semibold">{fmt(next.date, { month: "short", day: "numeric" })}</div>
              <div className="text-xs text-muted">
                {fmt(next.date, { weekday: "long" })} · {timeLabel(next.timeET)}
              </div>
              <div className="mt-3">
                <AddToCalendar event={next} />
              </div>
            </>
          ) : (
            <div className="mt-1 text-lg font-semibold">To be announced</div>
          )}
        </div>
        {shownStats.map(
          (s) =>
            s && (
              <div key={s.label} className="rounded-lg border border-border bg-surface p-5">
                <div className="text-xs text-muted">Latest: {s.label}</div>
                <div className="num mt-1 text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted">{s.when}</div>
              </div>
            ),
        )}
      </section>

      {decision && links && (
        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-accent">Latest decision · {lastDate}</div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {decision.action === "held" ? "Rates held steady" : `Rates ${decision.action} by ${decision.bp} basis points`}
            </h2>
            <div className="text-right">
              <div className="num text-2xl font-semibold leading-tight">{decision.range}</div>
              <div className="text-xs text-muted">Fed funds target range</div>
            </div>
          </div>
          <p className="mt-3 leading-relaxed text-muted">{decision.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ExternalButton href={links.statement}>Read the FOMC statement</ExternalButton>
            <ExternalButton href={links.pressConference}>Press conference</ExternalButton>
            {links.projections && <ExternalButton href={links.projections}>Projections (dot plot)</ExternalButton>}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          {fullYear ? `${thisYear} ${isFomc ? "FOMC meeting" : `${page.name} release`} schedule` : `Upcoming ${page.name} release dates`}
        </h2>
        <ScheduleTable page={page} rows={rows} next={next} results={results} />
        {nextYearRows.length > 0 ? (
          <div className="space-y-3 pt-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {nextYear} {isFomc ? "FOMC meeting" : `${page.name} release`} schedule
            </h2>
            <ScheduleTable page={page} rows={nextYearRows} next={next} results={null} />
          </div>
        ) : (
          later.length > 0 && (
            <p className="text-sm text-muted">
              Already scheduled for {nextYear}:{" "}
              {nextYearRows
                .slice(0, 3)
                .map((e) => fmt(e.date, { month: "short", day: "numeric" }))
                .join(", ")}
              .
            </p>
          )
        )}
        <p className="text-xs text-muted">
          {fullYear ? `Dates from the ${page.publisher}.` : `Dates from the ${page.publisher}; new dates are added as they're published.`} See every
          report on the{" "}
          <Link href="/" className="text-accent hover:text-accent-hover">economic calendar</Link>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{page.details.title}</h2>
        {page.details.paragraphs.map((p) => (
          <p key={p.slice(0, 40)} className="leading-relaxed text-muted">{p}</p>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Common questions</h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {faqs.map((f) => (
            <div key={f.q} className="p-5">
              <h3 className="font-medium">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {hasBeehiiv() && (
        <NewsletterSignup
          source={`release-${slug}`}
          variant="inline"
          heading={`Never miss ${isFomc ? "a Fed meeting" : `a ${reportLabel(page)}`}`}
          blurb={`Get the week's release dates${next ? `, like the next ${reportName} on ${fmt(next.date, { month: "long", day: "numeric" })},` : ""} plus what the numbers mean, in one free email a week.`}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={learnHref(page.guideSlug)}
          className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
        >
          <div className="text-xs text-muted">New to {page.name}?</div>
          <div className="mt-1 font-semibold">Read the guide →</div>
        </Link>
        <Link href="/release-dates" className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover">
          <div className="text-xs text-muted">Other reports</div>
          <div className="mt-1 font-semibold">All release dates →</div>
        </Link>
      </div>
    </div>
  );
}
