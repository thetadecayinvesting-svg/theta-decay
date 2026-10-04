// Everything the search bar can find: pages, charts and calendar events,
// each with the other names people use for it ("inflation" → CPI and PCE,
// "fed" → FOMC and the fed funds rate). Shared by server and browser code.

import { ASSETS } from "./assets";
import { CHARTS } from "./charts";
import type { CalendarEvent, EventType } from "./events";
import { LEARN_TOPICS, learnHref } from "./learnTopics";
import { PAGES } from "./pages";
import { RELEASE_PAGES, releaseHref } from "./releasePages";

export type SearchGroup = "Charts" | "Calendar" | "Pages";
export const SEARCH_GROUPS: SearchGroup[] = ["Charts", "Calendar", "Pages"];

export type SearchItem = {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string; // "/page" or "/page#element-id"
  keywords: string[];
};

const PAGE_FOR_SECTION = { economy: "/dashboard", risk: "/market-risk" } as const;

// Charts on the Markets page (not part of CHARTS, which feed the other two pages).
const MARKET_CHARTS: Omit<SearchItem, "group">[] = [
  {
    id: "chart-live",
    title: "Live Prices",
    subtitle: "Markets · TradingView mini charts",
    href: "/markets#chart-live",
    keywords: ["live", "ticker", "quotes", "real time", "tradingview", "etf"],
  },
  {
    id: "chart-performance",
    title: "Performance Comparison",
    subtitle: "Markets · Nasdaq, S&P 500 and Dow since the same date",
    href: "/markets#chart-performance",
    keywords: ["performance", "returns", "compare", "comparison", "growth"],
  },
  {
    id: "chart-sp-fed",
    title: "S&P 500 vs. Fed Funds Rate",
    subtitle: "Markets · How stocks react to rate changes",
    href: "/markets#chart-sp-fed",
    keywords: ["fed", "fed funds", "interest rates", "rates", "s&p 500", "sp500", "stocks"],
  },
];

const ASSET_KEYWORDS: Record<(typeof ASSETS)[number]["key"], string[]> = {
  nasdaq: ["nasdaq", "ixic", "tech stocks", "oneq", "qqq", "stocks"],
  sp500: ["s&p", "s&p 500", "sp500", "spx", "spy", "stocks"],
  dow: ["dow", "dow jones", "djia", "dia", "stocks"],
  btc: ["bitcoin", "btc", "crypto", "cryptocurrency", "coinbase"],
};

const EVENT_SEARCH: Record<EventType, { title: string; keywords: string[] }> = {
  FOMC: {
    title: "FOMC Rate Decision",
    keywords: ["fomc", "fed", "federal reserve", "rate decision", "interest rates", "rates", "powell", "fed meeting"],
  },
  SEP: {
    title: "Summary of Economic Projections",
    keywords: ["sep", "summary of economic projections", "dot plot", "fed projections", "fed forecasts", "fomc", "fed"],
  },
  ISM: {
    title: "ISM Manufacturing & Services PMI",
    keywords: ["ism", "pmi", "purchasing managers index", "manufacturing", "services", "ism manufacturing", "ism services"],
  },
  CPI: {
    title: "CPI Report",
    keywords: ["cpi", "inflation", "consumer price index", "prices"],
  },
  Jobs: {
    title: "Jobs Report",
    keywords: ["jobs", "jobs report", "employment situation", "nfp", "nonfarm payrolls", "payrolls", "unemployment", "labor"],
  },
  GDP: {
    title: "GDP Report",
    keywords: ["gdp", "growth", "economy", "gross domestic product", "recession"],
  },
  PCE: {
    title: "PCE Inflation",
    keywords: ["pce", "inflation", "core pce", "personal income", "spending", "outlays"],
  },
};

function shortDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Build the full index. `upcoming` = the calendar's future events (soonest first).
export function buildSearchIndex(upcoming: CalendarEvent[]): SearchItem[] {
  const charts: SearchItem[] = [
    ...CHARTS.map((c) => ({
      id: `chart-${c.key}`,
      group: "Charts" as const,
      title: c.title,
      subtitle: `${c.section === "risk" ? "Market Risk" : "Economic Indicators"} · ${c.description}`,
      href: `${PAGE_FOR_SECTION[c.section]}#chart-${c.key}`,
      keywords: [...c.keywords, ...c.lines.flatMap((l) => (l.fredId ? [l.fredId.toLowerCase()] : []))],
    })),
    ...MARKET_CHARTS.map((c) => ({ ...c, group: "Charts" as const })),
    ...ASSETS.map((a) => ({
      id: `stat-${a.key}`,
      group: "Charts" as const,
      title: a.name,
      subtitle: "Markets · Latest close, 1-month and year-to-date change",
      href: "/markets#chart-stats",
      keywords: [...ASSET_KEYWORDS[a.key], a.fredId.toLowerCase()],
    })),
  ];

  const calendar: SearchItem[] = (Object.keys(EVENT_SEARCH) as EventType[]).map((type) => {
    // SEP comes out with an FOMC meeting, so link to that meeting.
    const next =
      type === "SEP"
        ? upcoming.find((e) => e.type === "FOMC" && e.withSep)
        : upcoming.find((e) => e.type === type);
    return {
      id: `event-${type}`,
      group: "Calendar",
      title: EVENT_SEARCH[type].title,
      subtitle: next ? `Next: ${shortDate(next.date)}` : "Economic calendar",
      href: next ? `/#event-${next.date}-${next.type}` : "/",
      keywords: EVENT_SEARCH[type].keywords,
    };
  });

  const pages: SearchItem[] = PAGES.map((p) => ({
    id: `page-${p.href}`,
    group: "Pages",
    title: p.label,
    subtitle: p.description,
    href: p.href,
    keywords: p.keywords,
  }));

  // Learn guides are listed with the pages ("what is cpi" → the CPI guide).
  const guides: SearchItem[] = LEARN_TOPICS.map((t) => ({
    id: `guide-${t.slug}`,
    group: "Pages",
    title: `Guide: ${t.title}`,
    subtitle: t.short,
    href: learnHref(t.slug),
    keywords: t.keywords,
  }));

  // Release-date pages ("cpi release date" → the CPI schedule).
  const releaseDates: SearchItem[] = [
    ...RELEASE_PAGES.map((p) => ({
      id: `release-${p.slug}`,
      group: "Pages" as const,
      title: `${p.name} ${p.type === "FOMC" ? "Meeting" : "Release"} Dates`,
      subtitle: `Full schedule · ${p.publisher}`,
      href: releaseHref(p.slug),
      keywords: [...p.keywords, "release dates", "schedule"],
    })),
    {
      id: "release-all",
      group: "Pages" as const,
      title: "All Release Dates",
      subtitle: "Schedules for CPI, FOMC, jobs, GDP, PCE and PMI",
      href: "/release-dates",
      keywords: ["release dates", "schedule", "economic calendar", "data release schedule"],
    },
  ];

  return [...charts, ...calendar, ...pages, ...guides, ...releaseDates];
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9&]+/g, " ")
    .trim();

// Rank matches: exact name > name starts with > nickname starts with > contains.
// Every word typed must appear somewhere in the item.
export function searchIndex(items: SearchItem[], query: string, perGroup = 5) {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(" ");

  const scored = items.flatMap((item) => {
    const title = normalize(item.title);
    const keywords = item.keywords.map(normalize);
    const haystack = [title, normalize(item.subtitle), ...keywords].join(" | ");
    if (!words.every((w) => haystack.includes(w))) return [];
    let score = 1;
    if (title === q || keywords.includes(q)) score += 100;
    if (title.startsWith(q)) score += 50;
    if (keywords.some((k) => k.startsWith(q))) score += 40;
    if (title.includes(q)) score += 20;
    if (keywords.some((k) => k.includes(q))) score += 10;
    return [{ item, score }];
  });

  scored.sort((a, b) => b.score - a.score);
  return SEARCH_GROUPS.map((group) => ({
    group,
    items: scored.filter((s) => s.item.group === group).slice(0, perGroup).map((s) => s.item),
  })).filter((g) => g.items.length > 0);
}
