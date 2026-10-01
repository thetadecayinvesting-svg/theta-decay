import type { Metadata } from "next";

// The site's public identity, used for search engines and link previews.
export const SITE_URL = "https://thetadecayinvesting.com";
export const SITE_NAME = "Theta Decay Investing";
export const NEWSLETTER_NAME = "Out of the Money Weekly";
export const CONTACT_EMAIL = "hello@thetadecayinvesting.com"; // forwards to Gmail via ImprovMX
export const SITE_TAGLINE = "Economic Calendar, Indicators & Markets";
export const SITE_DESCRIPTION =
  "Free economic calendar, macro indicators and market risk dashboard: FOMC, CPI, jobs, GDP and PCE dates, plus live charts from FRED.";

// Title, description, canonical address and link-preview text for one page.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description },
  };
}

// Structured data (JSON-LD) for a <script type="application/ld+json"> tag.
// "<" is written as its escaped unicode form so the JSON can't close the tag early.
const ESCAPED_LESS_THAN = String.fromCharCode(92) + "u003c";
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, ESCAPED_LESS_THAN);
}
