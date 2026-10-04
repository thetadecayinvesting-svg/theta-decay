// One "release dates" page per economic report, at /release-dates/[slug]. Each
// page lists this year's schedule and answers "when is the next ... report?".
// Shared by server and browser code (search, calendar links) — data only.

import type { EventType } from "./events";

export type ReleasePage = {
  slug: string;
  type: EventType;
  name: string; // short name used in headings, e.g. "CPI"
  metaTitle: string; // "{year}" is replaced; keep under ~46 characters
  h1: string; // "{year}" is replaced
  metaDescription: string; // "{year}" is replaced; keep under ~155 characters
  publisher: string;
  coversLagMonths?: number; // data month = release month minus this; omit when irregular
  fullYearKnown?: boolean; // false when only some of the year's dates are published
  guideSlug: string; // Learn guide
  keywords: string[]; // for site search
  intro: string;
  details: { title: string; paragraphs: string[] };
  faqs: { q: string; a: string }[]; // added after "When is the next ... ?"
};

export const RELEASE_PAGES: ReleasePage[] = [
  {
    slug: "cpi",
    type: "CPI",
    name: "CPI",
    metaTitle: "CPI Release Dates {year}: Next CPI Report",
    h1: "CPI Release Dates {year}",
    metaDescription:
      "When is the next CPI report? The full {year} Consumer Price Index release schedule, release time, the latest inflation reading and what to watch.",
    publisher: "U.S. Bureau of Labor Statistics (BLS)",
    coversLagMonths: 1,
    guideSlug: "cpi",
    keywords: ["cpi release date", "cpi schedule", "next cpi report", "cpi date", "inflation report date"],
    intro:
      "The Consumer Price Index is the most closely watched measure of U.S. inflation. The Bureau of Labor Statistics publishes it once a month at 8:30 AM Eastern Time, usually in the second week of the month, covering prices from the month before.",
    details: {
      title: "What to know about CPI day",
      paragraphs: [
        "Markets react to how the numbers compare with economists' forecasts, not just whether inflation went up or down. A reading even 0.1 percentage point above expectations can move stocks, bonds and the dollar within seconds of the 8:30 AM release.",
        "Traders pay the most attention to core CPI, which leaves out volatile food and energy prices, and to the monthly change as well as the change from a year earlier.",
        "CPI comes out before the PCE price index, the Federal Reserve's preferred inflation measure, so it is the first big read each month on whether inflation is heading toward the Fed's 2% goal.",
      ],
    },
    faqs: [
      {
        q: "What time is the CPI report released?",
        a: "The CPI report is released at 8:30 AM Eastern Time, an hour before the U.S. stock market opens.",
      },
      {
        q: "Who publishes the CPI report?",
        a: "The U.S. Bureau of Labor Statistics (BLS), part of the Department of Labor, publishes the Consumer Price Index every month.",
      },
    ],
  },
  {
    slug: "fomc",
    type: "FOMC",
    name: "FOMC",
    metaTitle: "FOMC Meeting Dates {year}: Next Fed Meeting",
    h1: "FOMC Meeting Dates {year}",
    metaDescription:
      "When is the next Fed meeting? All {year} FOMC meeting dates, rate decision times, which meetings include the dot plot, and the current fed funds rate.",
    publisher: "Federal Reserve",
    guideSlug: "fed-funds-rate",
    keywords: ["fomc meeting dates", "fed meeting dates", "next fed meeting", "fomc schedule", "fed calendar", "rate decision date"],
    intro:
      "The Federal Open Market Committee (FOMC), the Federal Reserve's rate-setting committee, holds eight scheduled meetings a year. Each meeting runs two days, and the interest rate decision is announced at 2:00 PM Eastern Time on the second day, followed by the Fed Chair's press conference at 2:30 PM.",
    details: {
      title: "What happens at an FOMC meeting",
      paragraphs: [
        "At the end of each meeting the committee releases a statement with its decision on the federal funds rate target range and a short explanation of how it sees the economy. Markets read the wording closely for hints about future moves.",
        "Four meetings a year, in March, June, September and December, also include the Summary of Economic Projections. It contains officials' forecasts for growth, unemployment and inflation, plus the \"dot plot\" showing where each official expects interest rates to go.",
        "Detailed minutes of each meeting are published three weeks later. The Fed can also hold unscheduled meetings and change rates between regular meetings, though this is rare and usually happens during a crisis.",
      ],
    },
    faqs: [
      {
        q: "What time is the FOMC rate decision announced?",
        a: "The FOMC statement and rate decision are released at 2:00 PM Eastern Time on the second day of the meeting. The Fed Chair's press conference begins at 2:30 PM ET.",
      },
      {
        q: "Which FOMC meetings include the dot plot?",
        a: "The dot plot is part of the Summary of Economic Projections, published at four meetings a year: March, June, September and December. Those meetings are marked in the schedule above.",
      },
    ],
  },
  {
    slug: "jobs-report",
    type: "Jobs",
    name: "Jobs Report",
    metaTitle: "Jobs Report Dates {year}: Next Jobs Report",
    h1: "Jobs Report Release Dates {year}",
    metaDescription:
      "When is the next jobs report? The full {year} Employment Situation release schedule, release time, the latest payrolls and unemployment rate.",
    publisher: "U.S. Bureau of Labor Statistics (BLS)",
    coversLagMonths: 1,
    guideSlug: "jobs-report",
    keywords: ["jobs report date", "jobs report schedule", "nfp date", "nonfarm payrolls date", "employment report date", "next jobs report"],
    intro:
      "The Employment Situation report, better known as the jobs report, shows how many jobs the U.S. economy added and the unemployment rate. The Bureau of Labor Statistics usually releases it on the first Friday of the month at 8:30 AM Eastern Time, covering the previous month.",
    details: {
      title: "What to know about jobs report day",
      paragraphs: [
        "The headline number is nonfarm payrolls, the change in the number of jobs, compared with economists' forecasts. The unemployment rate comes from a separate survey of households, so the two numbers can sometimes point in different directions.",
        "Each report also revises the previous two months, and big revisions can matter as much as the new number. Average hourly earnings are watched for signs of wage pressure that could feed inflation.",
        "The release usually falls on the first Friday, but it moves when that Friday is too early in the month for the data to be ready or lands near a holiday.",
      ],
    },
    faqs: [
      {
        q: "What time is the jobs report released?",
        a: "The jobs report is released at 8:30 AM Eastern Time, before the U.S. stock market opens.",
      },
      {
        q: "Why isn't the jobs report always on the first Friday?",
        a: "The BLS needs enough time after the survey week to collect and process the data. When the first Friday comes too early in the month, or falls near a holiday such as July 4, the report moves to a different day.",
      },
    ],
  },
  {
    slug: "gdp",
    type: "GDP",
    name: "GDP",
    metaTitle: "GDP Release Dates {year}: Next GDP Report",
    h1: "GDP Release Dates {year}",
    metaDescription:
      "When is the next GDP report? Every {year} U.S. GDP release date, including advance, second and third estimates, release time and the latest growth rate.",
    publisher: "U.S. Bureau of Economic Analysis (BEA)",
    guideSlug: "gdp",
    keywords: ["gdp release date", "gdp schedule", "next gdp report", "gdp date", "advance gdp estimate"],
    intro:
      "Gross domestic product (GDP) is the broadest measure of the U.S. economy. The Bureau of Economic Analysis reports it every quarter at 8:30 AM Eastern Time, then updates each quarter's figure in later releases as more complete data comes in.",
    details: {
      title: "Advance, second and third estimates",
      paragraphs: [
        "Each quarter's GDP is normally reported three times. The advance estimate comes out about a month after the quarter ends, followed by the second and third estimates a month apart. The advance estimate usually moves markets the most because it's the first look.",
        "This schedule lists every GDP release date, including the later estimates and annual updates, so you may see a release almost every month.",
        "The schedule can shift from its usual pattern, for example when a federal government shutdown delays data collection.",
      ],
    },
    faqs: [
      {
        q: "What time is the GDP report released?",
        a: "GDP reports are released at 8:30 AM Eastern Time, before the U.S. stock market opens.",
      },
      {
        q: "What is the advance GDP estimate?",
        a: "The advance estimate is the first official reading of a quarter's GDP, normally released about a month after the quarter ends. It is revised in the second and third estimates as more data becomes available.",
      },
    ],
  },
  {
    slug: "pce",
    type: "PCE",
    name: "PCE",
    metaTitle: "PCE Release Dates {year}: Next PCE Report",
    h1: "PCE Release Dates {year}",
    metaDescription:
      "When is the next PCE inflation report? The full {year} PCE price index release schedule, release time and the latest core PCE reading.",
    publisher: "U.S. Bureau of Economic Analysis (BEA)",
    guideSlug: "pce",
    keywords: ["pce release date", "pce schedule", "next pce report", "core pce date", "personal income and outlays date"],
    intro:
      "The personal consumption expenditures (PCE) price index is the Federal Reserve's preferred measure of inflation. The Bureau of Economic Analysis publishes it in its monthly Personal Income and Outlays report at 8:30 AM Eastern Time, usually near the end of the month.",
    details: {
      title: "What to know about PCE day",
      paragraphs: [
        "The Fed's 2% inflation target is defined using PCE, and core PCE, which leaves out food and energy, is the number officials watch most closely.",
        "Because PCE arrives after the CPI and producer price reports, forecasters can predict it quite accurately, so big surprises are less common than on CPI day.",
        "The same report also shows personal income, consumer spending and the saving rate, which together give a picture of how households are doing.",
      ],
    },
    faqs: [
      {
        q: "What time is the PCE report released?",
        a: "The PCE price index is released at 8:30 AM Eastern Time as part of the Personal Income and Outlays report.",
      },
      {
        q: "Why does the Fed prefer PCE over CPI?",
        a: "PCE covers a wider range of spending, including purchases made on people's behalf such as employer-paid health insurance, and it adjusts more quickly when people switch between products as prices change.",
      },
    ],
  },
  {
    slug: "ism-pmi",
    type: "ISM",
    name: "ISM PMI",
    metaTitle: "ISM PMI Release Dates {year}: Next PMI Report",
    h1: "ISM PMI Release Dates {year}",
    metaDescription:
      "When is the next ISM PMI report? Upcoming ISM Manufacturing and Services PMI release dates for {year}, release time and how to read the numbers.",
    publisher: "Institute for Supply Management (ISM)",
    coversLagMonths: 1,
    fullYearKnown: false,
    guideSlug: "pmi",
    keywords: ["ism release date", "pmi release date", "ism manufacturing date", "ism services date", "next pmi report"],
    intro:
      "The ISM Purchasing Managers' Indexes are monthly surveys of U.S. businesses. The Manufacturing PMI usually comes out on the first business day of the month and the Services PMI on the third business day, both at 10:00 AM Eastern Time, covering the previous month.",
    details: {
      title: "How to read the PMI",
      paragraphs: [
        "A reading above 50 means more businesses reported growth than decline; below 50 signals contraction. The further from 50, the stronger the signal.",
        "Beyond the headline number, investors watch the new orders index as a hint of future activity and the prices index for inflation pressure.",
        "Manufacturing is a smaller part of the economy but swings more with the business cycle, while the Services PMI covers the much larger service sector.",
      ],
    },
    faqs: [
      {
        q: "What time is the ISM PMI released?",
        a: "Both the ISM Manufacturing and Services PMI reports are released at 10:00 AM Eastern Time.",
      },
      {
        q: "What's the difference between the Manufacturing and Services PMI?",
        a: "The Manufacturing PMI surveys factories, while the Services PMI covers businesses such as retail, healthcare, finance and hospitality. Services make up most of the U.S. economy, but manufacturing often turns first when the economy changes direction.",
      },
    ],
  },
];

export const releaseHref = (slug: string) => `/release-dates/${slug}`;

// The release-dates page for a calendar event type (SEP is part of FOMC).
export function releasePageFor(type: EventType) {
  return RELEASE_PAGES.find((p) => p.type === (type === "SEP" ? "FOMC" : type));
}
