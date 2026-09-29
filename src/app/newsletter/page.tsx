import type { Metadata } from "next";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import { hasBeehiiv } from "@/lib/beehiiv";
import { NEWSLETTER_NAME, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Newsletter",
  description:
    `${NEWSLETTER_NAME}: a free, plain-English weekly briefing on the economic data and events that move markets.`,
  path: "/newsletter",
});

const WHATS_INSIDE = [
  {
    title: "The week ahead",
    body: "Every Fed decision, inflation report, jobs number and GDP release coming up, with what to watch for.",
  },
  {
    title: "What the data says",
    body: "The latest inflation, unemployment, rates and growth readings, explained in plain English.",
  },
  {
    title: "Risk check",
    body: "Whether volatility, credit spreads or margin debt are flashing any warning signs.",
  },
];

export default function NewsletterPage() {
  const signupsOpen = hasBeehiiv();

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Newsletter</h1>
        <p className="mt-2 text-muted">
          A short weekly briefing on the dates and data that move markets.
        </p>
      </div>

      {signupsOpen ? (
        <NewsletterSignup source="newsletter-page" />
      ) : (
        <section className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Coming soon</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            {NEWSLETTER_NAME} is on its way
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            In the meantime, the{" "}
            <Link href="/" className="font-medium text-accent hover:text-accent-hover">
              economic calendar
            </Link>{" "}
            shows everything coming up.
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">What&apos;s inside each issue</h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {WHATS_INSIDE.map((item) => (
            <li key={item.title} className="rounded-lg border border-border bg-surface p-5">
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          For information and education only, not investment advice.
        </p>
      </section>
    </div>
  );
}
