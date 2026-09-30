// The site's main pages, in menu order. Used by the side panel and search.

export type SitePage = {
  href: string;
  label: string;
  description: string;
  keywords: string[];
};

export const PAGES: SitePage[] = [
  {
    href: "/",
    label: "Calendar",
    description: "Upcoming Fed, inflation, jobs and GDP dates",
    keywords: ["calendar", "economic calendar", "schedule", "events", "dates", "releases", "home", "upcoming"],
  },
  {
    href: "/dashboard",
    label: "Economic Indicators",
    description: "Dashboard: inflation, jobs, rates and growth",
    keywords: ["dashboard", "indicators", "economy", "macro", "charts", "data"],
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
    description: "Out of the Money Weekly: free weekly briefing",
    keywords: ["newsletter", "out of the money weekly", "out of the money", "otm", "email", "subscribe", "weekly"],
  },
  {
    href: "/about",
    label: "About",
    description: "What's here and where the data comes from",
    keywords: ["about", "mission", "faq", "questions", "next fomc meeting", "next jobs report", "sources", "data sources", "disclaimer", "contact"],
  },
];
