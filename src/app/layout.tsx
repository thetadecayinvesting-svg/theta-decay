import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, Sora } from "next/font/google";
import SettingsProvider from "@/components/SettingsProvider";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { getCalendar } from "@/lib/calendar";
import { buildSearchIndex } from "@/lib/searchIndex";
import { THEME_BOOT_SCRIPT } from "@/lib/settings";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Main UI
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headlines
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// Tables
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`, // e.g. "Markets | Theta Decay Investing"
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Search engine ownership checks (public codes).
  verification: {
    other: { "msvalidate.01": "F05DD3B7EDC36212395380C0D9FA774E" }, // Bing Webmaster Tools
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The search bar needs the next date of each calendar event (cached FRED data).
  const { events } = await getCalendar();
  const searchItems = buildSearchIndex(events);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${plexSans.variable} h-full antialiased`}
      suppressHydrationWarning // the theme script below may set data-theme before React loads
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          <SiteHeader searchItems={searchItems} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            {children}
          </main>
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted sm:px-6">
            Data: FRED®, Federal Reserve Bank of St. Louis; FINRA Margin
            Statistics; FOMC schedule from
            federalreserve.gov. VIX® data © Cboe Global Markets; Nasdaq Composite © Nasdaq, Inc.;
            S&amp;P 500® and Dow Jones® © S&amp;P Dow Jones Indices LLC; ICE BofA index data © ICE Data
            Indices, LLC; used with permission via FRED. ISM® and PMI® are registered trademarks of
            the Institute for Supply Management. For information only — not investment advice.
            <nav aria-label="Footer" className="mt-2 flex gap-4">
              <Link href="/release-dates" className="hover:text-primary">Release Dates</Link>
              <Link href="/about" className="hover:text-primary">About</Link>
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            </nav>
          </div>
        </footer>
        </SettingsProvider>
        {/* Vercel Web Analytics: visitors and page views (no cookies) */}
        <Analytics />
      </body>
    </html>
  );
}
