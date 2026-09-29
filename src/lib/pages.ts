// The site's main pages, in menu order. Used by the side panel and search.

export type SitePage = {
  href: string;
  label: string;
  description: string;
  keywords: string[];
};

export const PAGES: SitePage[] = [
  {
    href: "/dashboard",
    label: "Economic Indicators",
    description: "Dashboard: inflation, jobs, rates and growth",
    keywords: ["dashboard", "indicators", "economy", "macro", "charts", "data"],
  },
  {
    href: "/",
    label: "Economic Calendar",
    description: "Upcoming Fed, inflation, jobs and GDP dates",
    keywords: ["calendar", "schedule", "events", "dates", "releases", "home", "upcoming"],
  },
  {
    href: "/markets",
    label: "Markets",
    description: "Live prices and long-term trends",
    keywords: ["markets", "stocks", "prices", "indices", "crypto", "performance"],
  },
  {
    href: "/market-risk",
    label: "Market Risk",
    description: "Volatility, credit spreads and margin debt",
    keywords: ["risk", "market risk", "fear", "volatility", "credit", "spreads"],
  },
  {
    href: "/newsletter",
    label: "Newsletter",
    description: "Weekly briefing (coming soon)",
    keywords: ["newsletter", "email", "subscribe", "weekly"],
  },
  {
    href: "/about",
    label: "About",
    description: "What's here and where the data comes from",
    keywords: ["about", "sources", "data sources", "disclaimer", "contact"],
  },
];
