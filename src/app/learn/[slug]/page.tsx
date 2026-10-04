import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChartCard from "@/components/ChartCard";
import { getCalendar } from "@/lib/calendar";
import { yearsAgo } from "@/lib/chartFormat";
import { GUIDES } from "@/lib/learnContent";
import { loadStat } from "@/lib/learnStats";
import { LEARN_TOPICS, learnHref } from "@/lib/learnTopics";
import { releaseHref, releasePageFor } from "@/lib/releasePages";
import { CHARTS, getDashboardData } from "@/lib/series";
import { jsonLdScript, pageMetadata } from "@/lib/site";

// Refresh hourly so the live numbers and next release date stay current.
export const revalidate = 3600;

export function generateStaticParams() {
  return LEARN_TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) return {};
  return pageMetadata({ title: guide.metaTitle, description: guide.metaDescription, path: learnHref(slug) });
}

const asDate = (d: string) => new Date(`${d}T12:00:00Z`);
const longDate = (d: string) =>
  asDate(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const shortDate = (d: string) => asDate(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default async function LearnGuidePage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const guide = GUIDES[slug];
  const topic = LEARN_TOPICS.find((t) => t.slug === slug);
  if (!guide || !topic) notFound();

  const section = CHARTS.find((c) => c.key === topic.chartKey)?.section ?? "economy";
  const start = yearsAgo(2);
  const [{ charts }, { events }, stats] = await Promise.all([
    getDashboardData(section),
    getCalendar(),
    Promise.all(guide.stats.map((s) => loadStat(s, start))),
  ]);
  const chart = charts.find((c) => c.key === topic.chartKey);
  const next = topic.eventType ? events.find((e) => e.type === topic.eventType) : undefined;
  const releasePage = topic.eventType ? releasePageFor(topic.eventType) : undefined;
  const tenYearsAgo = yearsAgo(10);

  const faqs = guide.faqs.map((f) => ({
    q: f.q,
    a: f.a.includes("{next}") ? (next ? f.a.replace("{next}", longDate(next.date)) : (f.aNoDate ?? f.a)) : f.a,
  }));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const related = LEARN_TOPICS.filter((t) => t.slug !== slug).slice(0, 4);

  return (
    <div className="max-w-3xl space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }} />

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          <Link href="/learn" className="hover:text-accent-hover">Learn</Link> · {topic.category}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{guide.h1}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{guide.intro}</p>
      </div>

      {/* At a glance: live numbers from FRED and the calendar */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(
          (s) =>
            s && (
              <div key={s.label} className="rounded-lg border border-border bg-surface p-5">
                <div className="text-xs text-muted">{s.label}</div>
                <div className="num mt-1 text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted">{s.when}</div>
              </div>
            ),
        )}
        {topic.eventType && (
          <Link
            href={releasePage ? releaseHref(releasePage.slug) : "/"}
            className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-5 transition-colors hover:bg-surface-hover"
          >
            <div className="text-xs text-muted">Next release</div>
            <div className="mt-1 text-lg font-semibold">{next ? shortDate(next.date) : "See calendar"}</div>
            <div className="text-xs text-muted">{next && guide.releaseTime ? guide.releaseTime : ""}</div>
            <div className="mt-2 text-xs font-medium text-accent">All release dates →</div>
          </Link>
        )}
      </section>

      {guide.sections.map((s) => (
        <section key={s.title} className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
          {s.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="leading-relaxed text-muted">{p}</p>
          ))}
        </section>
      ))}

      {chart && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">{chart.title} over time</h2>
          <ChartCard chart={chart} rows={chart.rows.filter((r) => r.date >= tenYearsAgo)} spanYears={10} />
        </section>
      )}

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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Keep learning</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {related.map((t) => (
            <Link
              key={t.slug}
              href={learnHref(t.slug)}
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
            >
              <div className="font-medium">{t.title}</div>
              <div className="mt-0.5 text-sm text-muted">{t.short}</div>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted">Source: {guide.source} For information only, not investment advice.</p>
      </section>
    </div>
  );
}
