// The Learn guides: names, search keywords and which chart / calendar event
// each one belongs to. Kept small and browser-safe (the menu and site search use
// it); the full guide text lives in learnContent.ts.

import type { EventType } from "./events";

export type LearnTopic = {
  slug: string; // /learn/<slug>
  title: string; // card and search title
  short: string; // one-line description
  category: string;
  keywords: string[];
  chartKey: string; // chart shown on the guide (see charts.ts)
  eventType?: EventType; // calendar event for "next release"
};

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: "cpi",
    title: "Consumer Price Index (CPI)",
    short: "The most widely followed measure of U.S. inflation.",
    category: "Inflation",
    keywords: ["what is cpi", "consumer price index", "inflation", "core cpi", "cpi report"],
    chartKey: "cpi",
    eventType: "CPI",
  },
  {
    slug: "pce",
    title: "PCE Price Index",
    short: "The Federal Reserve's preferred inflation gauge.",
    category: "Inflation",
    keywords: ["what is pce", "personal consumption expenditures", "core pce", "fed inflation target", "inflation"],
    chartKey: "pce",
    eventType: "PCE",
  },
  {
    slug: "jobs-report",
    title: "The Jobs Report",
    short: "Monthly payrolls and the unemployment rate.",
    category: "Employment",
    keywords: ["jobs report", "employment situation", "nonfarm payrolls", "nfp", "unemployment rate", "jobs"],
    chartKey: "unrate",
    eventType: "Jobs",
  },
  {
    slug: "gdp",
    title: "Gross Domestic Product (GDP)",
    short: "The broadest measure of the U.S. economy's growth.",
    category: "Growth",
    keywords: ["what is gdp", "gross domestic product", "real gdp", "economic growth", "recession"],
    chartKey: "gdp",
    eventType: "GDP",
  },
  {
    slug: "fed-funds-rate",
    title: "The Fed Funds Rate & FOMC",
    short: "How the Federal Reserve sets interest rates.",
    category: "Interest rates",
    keywords: ["fed funds rate", "federal funds rate", "fomc", "fomc meeting", "interest rates", "dot plot", "sep", "fed"],
    chartKey: "fedfunds",
    eventType: "FOMC",
  },
  {
    slug: "vix",
    title: "The VIX (Volatility Index)",
    short: "Wall Street's \"fear gauge\" for the stock market.",
    category: "Market risk",
    keywords: ["what is the vix", "vix", "volatility index", "fear index", "fear gauge", "volatility"],
    chartKey: "vix",
  },
  {
    slug: "pmi",
    title: "Purchasing Managers' Index (PMI)",
    short: "Monthly surveys of whether business is expanding or shrinking.",
    category: "Growth",
    keywords: ["what is pmi", "purchasing managers index", "ism", "ism manufacturing", "ism services", "manufacturing", "philly fed", "empire state"],
    chartKey: "fedsurveys",
    eventType: "ISM",
  },
];

export const learnHref = (slug: string) => `/learn/${slug}`;
