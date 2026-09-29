import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Newsletter",
  description:
    "A plain-English weekly briefing on the economic data and events that move markets. Coming soon.",
  path: "/newsletter",
});

// Placeholder until an email service (e.g. Buttondown, ConvertKit, Beehiiv) is chosen.
export default function NewsletterPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Newsletter</h1>
        <p className="mt-2 text-muted">
          A short weekly briefing on the dates and data that move markets.
        </p>
      </div>

      <section className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Coming soon</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          The Theta Decay weekly is on its way
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Each issue will cover the week&apos;s economic calendar, what the latest
          inflation, jobs and rates data mean, and any warning signs from the market risk
          gauges, all in plain English.
        </p>
        <p className="mt-4 text-sm text-muted">
          In the meantime, the{" "}
          <Link href="/" className="font-medium text-accent hover:text-accent-hover">
            economic calendar
          </Link>{" "}
          shows everything coming up.
        </p>
      </section>
    </div>
  );
}
