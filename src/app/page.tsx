import type { Metadata } from "next";
import CalendarView from "@/components/CalendarView";
import KeyNotice from "@/components/KeyNotice";
import LatestReleases from "@/components/LatestReleases";
import NewsletterSignup from "@/components/NewsletterSignup";
import { hasBeehiiv } from "@/lib/beehiiv";
import { getCalendar, todayET } from "@/lib/calendar";
import { getLatestReleases } from "@/lib/latest";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  description:
    "Economic calendar with upcoming FOMC rate decisions, CPI inflation, jobs reports, GDP and PCE release dates, plus live macro and market charts.",
  alternates: { canonical: "/" },
};

// Tells Google the site's name ("Theta Decay Investing") for search results.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: ["Theta Decay", "thetadecayinvesting.com"],
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
};

// Rebuild the page at most once an hour so "today" and FRED dates stay fresh.
export const revalidate = 3600;

export default async function Home() {
  const [{ events, errors, missingKey }, latest] = await Promise.all([
    getCalendar(),
    getLatestReleases(),
  ]);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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

      <LatestReleases releases={latest} today={todayET()} />

      <CalendarView events={events} today={todayET()} />

      {hasBeehiiv() && <NewsletterSignup source="calendar" variant="inline" />}
    </div>
  );
}
