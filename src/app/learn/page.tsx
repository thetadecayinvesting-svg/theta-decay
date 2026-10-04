import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_TOPICS, learnHref } from "@/lib/learnTopics";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Learn: Economic Indicators Explained",
  description:
    "Plain-English guides to the economic data that moves markets: CPI, PCE, the jobs report, GDP, the fed funds rate, the VIX and the PMI.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Learn</h1>
        <p className="mt-2 text-muted">
          Plain-English guides to the economic reports and indicators that move markets: what each
          one measures, why investors care, and when the next release is.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_TOPICS.map((t) => (
          <Link
            key={t.slug}
            href={learnHref(t.slug)}
            className="flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-accent">{t.category}</span>
            <span className="mt-2 font-semibold">{t.title}</span>
            <span className="mt-1 flex-1 text-sm text-muted">{t.short}</span>
            <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary">
              <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M10 5.5C8.5 4.3 6.3 4 3.5 4v11.5c2.8 0 5 .3 6.5 1.5m0-11.5c1.5-1.2 3.7-1.5 6.5-1.5v11.5c-2.8 0-5 .3-6.5 1.5m0-11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Read the guide
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
