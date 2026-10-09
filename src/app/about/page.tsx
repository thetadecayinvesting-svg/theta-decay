import type { Metadata } from "next";
import Link from "next/link";
import { getCalendar } from "@/lib/calendar";
import type { CalendarEvent, EventType } from "@/lib/events";
import { NEWSLETTER_NAME, SITE_NAME, SITE_URL, jsonLdScript, pageMetadata } from "@/lib/site";

const MISSION =
  "We're on a mission to make retail investors more informed, by providing our users with a central platform where important economic dates and graphs are accessible.";

export const metadata: Metadata = pageMetadata({
  title: "About Us: Our Mission",
  description:
    "Making economic data and Fed meetings accessible to every investor. Find the next FOMC meeting, jobs report, CPI, GDP and PCE release dates.",
  path: "/about",
});

// Rebuild hourly so the "next meeting / next report" answers stay current.
export const revalidate = 3600;

const SOURCES = [
  {
    name: "FRED®, Federal Reserve Bank of St. Louis",
    href: "https://fred.stlouisfed.org/",
    what: "Economic indicators, market risk gauges, index closes and release dates",
  },
  {
    name: "Federal Reserve Board",
    href: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    what: "FOMC meeting schedule",
  },
  {
    name: "U.S. Bureau of Economic Analysis (BEA, via FRED)",
    href: "https://www.bea.gov/",
    what: "GDP, GDP contributions and PCE inflation",
  },
  {
    name: "U.S. Bureau of Labor Statistics (BLS, via FRED)",
    href: "https://www.bls.gov/",
    what: "CPI inflation, payrolls and the unemployment rate",
  },
  {
    name: "Institute for Supply Management (ISM)",
    href: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/",
    what: "ISM Manufacturing and Services PMI release schedule",
  },
  {
    name: "FINRA",
    href: "https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics",
    what: "Monthly margin statistics",
  },
  { name: "TradingView", href: "https://www.tradingview.com/", what: "Live price widgets" },
];

const SECTIONS = [
  {
    href: "/",
    name: "Economic Calendar",
    body: "Every scheduled FOMC rate decision and major U.S. data release (CPI, jobs, GDP and PCE), with release times in your time zone.",
  },
  {
    href: "/dashboard",
    name: "Economic Indicators",
    body: "Long-run charts of inflation, unemployment, the fed funds rate, the 10-year Treasury yield and real GDP growth.",
  },
  {
    href: "/market-risk",
    name: "Market Risk",
    body: "Gauges of investor stress: the VIX, high-yield and investment-grade credit spreads, the Baa corporate spread and margin debt.",
  },
  {
    href: "/markets",
    name: "Markets",
    body: "Live prices for stocks and Bitcoin, long-term performance for the Nasdaq, S&P 500 and Dow Jones, and how stocks respond to Fed policy.",
  },
  {
    href: "/newsletter",
    name: NEWSLETTER_NAME,
    body: "A free weekly briefing on the week ahead, what the latest data says and any warning signs worth watching.",
  },
];

const PRINCIPLES = [
  {
    title: "Official sources",
    body: "Data comes directly from the Federal Reserve, FRED, the BEA, the BLS, FINRA and other primary sources, never from estimates or rumors.",
  },
  {
    title: "Fully transparent",
    body: "Every chart links to its source, release, units and notes, with a suggested citation, so you can verify anything you see.",
  },
  {
    title: "Always current",
    body: "Release dates and economic data refresh hourly, margin debt daily, and live prices continuously.",
  },
  {
    title: "Independent",
    body: "We explain the data; we don't tell you what to buy or sell. Everything here is for information and education.",
  },
];

// "Wednesday, October 28, 2026"
function longDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const FALLBACK = "See the economic calendar for the latest schedule.";

// Questions investors ask most, answered with live dates from the calendar.
function buildFaqs(events: CalendarEvent[]) {
  const next = (type: EventType) => events.find((e) => e.type === type);
  const fomc = next("FOMC");
  const jobs = next("Jobs");
  const cpi = next("CPI");
  const gdp = next("GDP");
  const pce = next("PCE");

  return [
    {
      q: "When is the next FOMC meeting?",
      a: fomc
        ? `The next FOMC rate decision is on ${longDate(fomc.date)}, at 2:00 PM ET, followed by the Fed Chair's press conference. The Federal Open Market Committee holds eight scheduled meetings a year to set the federal funds rate.`
        : `The Federal Open Market Committee holds eight scheduled meetings a year to set the federal funds rate. ${FALLBACK}`,
      href: fomc ? `/#event-${fomc.date}-FOMC` : "/",
    },
    {
      q: "When is the next jobs report?",
      a: jobs
        ? `The next jobs report (the Bureau of Labor Statistics' Employment Situation report) is scheduled for ${longDate(jobs.date)}, at 8:30 AM ET. It covers nonfarm payrolls, the unemployment rate and wage growth, and is usually released on the first Friday of the month.`
        : `The Employment Situation report from the Bureau of Labor Statistics is usually released on the first Friday of the month. ${FALLBACK}`,
      href: jobs ? `/#event-${jobs.date}-Jobs` : "/",
    },
    {
      q: "When is the next CPI inflation report?",
      a: cpi
        ? `The next Consumer Price Index (CPI) report is scheduled for ${longDate(cpi.date)}, at 8:30 AM ET. Published monthly by the Bureau of Labor Statistics, CPI is the most widely followed measure of consumer inflation.`
        : `The Consumer Price Index is published monthly by the Bureau of Labor Statistics. ${FALLBACK}`,
      href: cpi ? `/#event-${cpi.date}-CPI` : "/",
    },
    {
      q: "When is the next GDP report?",
      a: gdp
        ? `The next Gross Domestic Product (GDP) report from the Bureau of Economic Analysis is scheduled for ${longDate(gdp.date)}, at 8:30 AM ET. GDP is measured quarterly and released in advance, second and third estimates.`
        : `Gross Domestic Product is measured quarterly by the Bureau of Economic Analysis. ${FALLBACK}`,
      href: gdp ? `/#event-${gdp.date}-GDP` : "/",
    },
    {
      q: "When is the next PCE inflation report?",
      a: pce
        ? `The next PCE report (Personal Income and Outlays, from the Bureau of Economic Analysis) is scheduled for ${longDate(pce.date)}, at 8:30 AM ET. PCE inflation is the Federal Reserve's preferred measure of inflation.`
        : `PCE inflation, the Federal Reserve's preferred inflation measure, is published monthly by the Bureau of Economic Analysis. ${FALLBACK}`,
      href: pce ? `/#event-${pce.date}-PCE` : "/",
    },
    {
      q: "Where does the data come from?",
      a: "All economic data comes from official sources: FRED (Federal Reserve Bank of St. Louis), the Federal Reserve Board, the Bureau of Economic Analysis (BEA), the Bureau of Labor Statistics (BLS), the Institute for Supply Management (ISM) and FINRA. Live prices are provided by TradingView. Each chart's Details panel lists its exact source and a suggested citation.",
      href: "#data-sources",
    },
    {
      q: "How often is the data updated?",
      a: "Economic data and release dates refresh hourly, FINRA margin debt is checked daily, and live market prices update continuously. Each chart shows the date of its latest reading.",
    },
    {
      q: "Is Theta Decay Investing free?",
      a: `Yes. The calendar, indicators, market risk gauges, market data and the ${NEWSLETTER_NAME} newsletter are all free to use, with no account required.`,
    },
    {
      q: "Is this investment advice?",
      a: "No. Theta Decay Investing provides information and education only. Nothing on the site is a recommendation to buy or sell any security. Data can be delayed or revised, so confirm important figures with the official source.",
    },
  ];
}

export default async function AboutPage() {
  const { events } = await getCalendar();
  const faqs = buildFaqs(events);

  // Structured data: who we are and the questions this page answers.
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `About ${SITE_NAME}`,
      url: `${SITE_URL}/about`,
      description: MISSION,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      description: MISSION,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="max-w-2xl space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }} />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">About {SITE_NAME}</h1>
        <p className="mt-3 leading-relaxed text-muted">
          {SITE_NAME} brings the economic data, Federal Reserve meetings and market signals
          that move markets together in one place, so you always know what&apos;s coming,
          what the latest numbers say and how investors are positioned.
        </p>
      </div>

      <section className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-6 sm:p-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-accent">Our mission</h2>
        <p className="mt-3 text-lg leading-relaxed">{MISSION}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Who we serve</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="font-medium">Retail investors</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Know what&apos;s coming and why it matters. A clear calendar of Fed meetings and
              data releases, plain-English explanations of every indicator, and a free weekly
              newsletter, without the jargon or the paywall.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="font-medium">Experienced investors</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Analyze the market in one place. Decades of official data, market risk gauges,
              cross-asset performance comparisons and source-level detail with citations,
              built for fast, informed analysis.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Questions we answer</h2>
        <p className="text-sm leading-relaxed text-muted">
          Investors ask the same questions every month. We answer them with live, sourced
          information. All times are Eastern Time; the calendar can show them in your own
          time zone.
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {faqs.map((f) => (
            <div key={f.q} className="p-5">
              <h3 className="font-medium">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {f.a}
                {f.href && (
                  <>
                    {" "}
                    <Link href={f.href} className="font-medium text-accent hover:text-accent-hover">
                      {f.href === "#data-sources" ? "See data sources" : "View on the calendar"}
                    </Link>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">What you&apos;ll find here</h2>
        <ul className="space-y-3">
          {SECTIONS.map((s) => (
            <li key={s.href} className="text-sm leading-relaxed text-muted">
              <Link href={s.href} className="font-medium text-accent hover:text-accent-hover">
                {s.name}
              </Link>
              : {s.body}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Our approach</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-surface p-5">
              <h3 className="text-sm font-medium">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="data-sources" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Data sources</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface font-table text-sm">
          {SOURCES.map((s) => (
            <li key={s.name} className="px-5 py-3">
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-accent-hover"
              >
                {s.name}
                <span aria-hidden className="text-muted"> ↗</span>
              </a>
              <div className="text-muted">{s.what}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-muted">
        <h2 className="font-medium text-primary">Not investment advice</h2>
        <p className="mt-1">
          Everything on this site is for information and education only. It isn&apos;t a
          recommendation to buy or sell any security. Data can be delayed or revised, so check
          official sources before making decisions.
        </p>
      </section>
    </div>
  );
}
