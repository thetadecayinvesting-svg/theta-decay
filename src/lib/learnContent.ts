// Full text of each Learn guide (server-only use). Each guide plugs into the
// shared page at /learn/[slug]. "Live" numbers come from FRED via `stats`, and
// `{next}` in an FAQ answer is replaced with the next release date.

export type GuideStat = {
  label: string;
  fredId: string;
  units?: string; // FRED transformation, e.g. "pc1"
  format: "pct2" | "pct1" | "jobsK" | "index" | "range";
  upperFredId?: string; // for "range": the upper bound series
};

export type GuideContent = {
  metaTitle: string;
  metaDescription: string; // keep under ~155 characters
  h1: string;
  intro: string;
  stats: GuideStat[];
  releaseTime?: string; // shown with the next release date
  sections: { title: string; paragraphs: string[] }[];
  faqs: { q: string; a: string; aNoDate?: string }[]; // "{next}" = next release date
  source: string;
};

export const GUIDES: Record<string, GuideContent> = {
  cpi: {
    metaTitle: "What Is CPI? Consumer Price Index Explained",
    metaDescription:
      "What the Consumer Price Index (CPI) measures, why inflation moves markets, core vs. headline CPI, the latest reading and the next CPI release date.",
    h1: "What Is the Consumer Price Index (CPI)?",
    intro:
      "The Consumer Price Index measures how the prices of everyday goods and services change over time. It is the most widely followed measure of inflation in the United States.",
    stats: [
      { label: "Annual CPI inflation", fredId: "CPIAUCSL", units: "pc1", format: "pct2" },
      { label: "Core CPI (ex food & energy)", fredId: "CPILFESL", units: "pc1", format: "pct2" },
    ],
    releaseTime: "8:30 AM ET",
    sections: [
      {
        title: "What CPI measures",
        paragraphs: [
          "Each month, the U.S. Bureau of Labor Statistics (BLS) tracks the prices of a large \"basket\" of goods and services that households buy, from food and rent to gasoline, clothing, cars and medical care. The CPI compares the cost of that basket over time. When the index rises, prices are going up on average: that's inflation.",
          "The headline number most people quote is the change from a year earlier. Housing costs (shelter) are the largest single part of the index, at roughly a third of the total.",
        ],
      },
      {
        title: "Headline vs. core CPI",
        paragraphs: [
          "Headline CPI includes everything. Core CPI leaves out food and energy, whose prices can jump or fall sharply from month to month because of weather, supply shocks or oil markets. Economists and the Federal Reserve watch core CPI to see the underlying trend.",
        ],
      },
      {
        title: "Why CPI moves markets",
        paragraphs: [
          "Inflation is central to the Federal Reserve's interest rate decisions. When CPI comes in hotter than expected, investors expect the Fed to keep rates higher for longer, which tends to push bond yields up and can weigh on stock prices. A cooler reading can do the opposite. That's why markets often move sharply at 8:30 AM ET on CPI day.",
          "The Fed aims for inflation of about 2% over time. Its official target uses the PCE price index, but CPI comes out earlier each month and is followed just as closely.",
        ],
      },
    ],
    faqs: [
      { q: "What does CPI stand for?", a: "CPI stands for Consumer Price Index. It is published monthly by the U.S. Bureau of Labor Statistics (BLS)." },
      {
        q: "When is the next CPI report?",
        a: "The next CPI report is scheduled for {next}, at 8:30 AM Eastern Time.",
        aNoDate: "CPI is released monthly at 8:30 AM Eastern Time; see the economic calendar for the next date.",
      },
      {
        q: "What is the difference between headline and core CPI?",
        a: "Headline CPI includes all items. Core CPI excludes food and energy, whose prices swing sharply from month to month, so it gives a clearer view of the underlying inflation trend.",
      },
      {
        q: "Is CPI the Federal Reserve's inflation target?",
        a: "Not exactly. The Fed's 2% goal is defined using the personal consumption expenditures (PCE) price index, but the Fed and markets watch CPI closely because it is released earlier and moves similarly.",
      },
    ],
    source: "U.S. Bureau of Labor Statistics via FRED, Federal Reserve Bank of St. Louis.",
  },

  pce: {
    metaTitle: "What Is PCE? The Fed's Inflation Gauge",
    metaDescription:
      "What the personal consumption expenditures (PCE) price index measures, how it differs from CPI, why the Fed targets it, and the next PCE release date.",
    h1: "What Is the PCE Price Index?",
    intro:
      "The personal consumption expenditures (PCE) price index measures how prices change for the goods and services Americans buy. It is the inflation measure the Federal Reserve uses for its 2% target.",
    stats: [
      { label: "Annual PCE inflation", fredId: "PCEPI", units: "pc1", format: "pct2" },
      { label: "Core PCE (ex food & energy)", fredId: "PCEPILFE", units: "pc1", format: "pct2" },
    ],
    releaseTime: "8:30 AM ET",
    sections: [
      {
        title: "What PCE measures",
        paragraphs: [
          "The PCE price index is published monthly by the Bureau of Economic Analysis (BEA) as part of its Personal Income and Outlays report. Like CPI, it tracks how much prices have risen, and it's usually quoted as the change from a year earlier.",
        ],
      },
      {
        title: "How PCE differs from CPI",
        paragraphs: [
          "PCE covers a broader range of spending than CPI, including purchases made on households' behalf, such as employer-provided health insurance. Its weights also update as people shift their spending, for example buying more chicken when beef gets expensive.",
          "Because of these differences, PCE inflation usually runs a little below CPI inflation, and housing makes up a smaller share of it.",
        ],
      },
      {
        title: "Why the Fed watches PCE",
        paragraphs: [
          "The Federal Reserve defines its inflation goal as 2% annual PCE inflation over the longer run. Fed officials pay particular attention to core PCE, which excludes food and energy, as a guide to where inflation is heading.",
          "PCE comes out after CPI each month, so markets often have a good idea of what to expect. Surprises in core PCE can still move expectations for interest rates.",
        ],
      },
    ],
    faqs: [
      { q: "What does PCE stand for?", a: "PCE stands for personal consumption expenditures. The PCE price index is published by the U.S. Bureau of Economic Analysis (BEA)." },
      {
        q: "When is the next PCE report?",
        a: "The next PCE report (Personal Income and Outlays) is scheduled for {next}, at 8:30 AM Eastern Time.",
        aNoDate: "PCE is released monthly at 8:30 AM Eastern Time; see the economic calendar for the next date.",
      },
      {
        q: "Why does the Fed prefer PCE over CPI?",
        a: "PCE covers a broader range of spending and adjusts as consumers change what they buy, which the Fed considers a more complete picture of inflation.",
      },
      {
        q: "What is core PCE?",
        a: "Core PCE is the PCE price index excluding food and energy, whose prices are volatile. It is the Fed's favorite gauge of the underlying inflation trend.",
      },
    ],
    source: "U.S. Bureau of Economic Analysis via FRED, Federal Reserve Bank of St. Louis.",
  },

  "jobs-report": {
    metaTitle: "What Is the Jobs Report? Payrolls Explained",
    metaDescription:
      "How the monthly jobs report works: nonfarm payrolls, the unemployment rate, why markets react, and the next jobs report release date.",
    h1: "What Is the Jobs Report?",
    intro:
      "The jobs report, officially the Employment Situation, is the U.S. government's monthly snapshot of the labor market. It is one of the most market-moving economic releases.",
    stats: [
      { label: "Jobs added (nonfarm payrolls)", fredId: "PAYEMS", units: "chg", format: "jobsK" },
      { label: "Unemployment rate", fredId: "UNRATE", format: "pct1" },
    ],
    releaseTime: "8:30 AM ET",
    sections: [
      {
        title: "What's in the jobs report",
        paragraphs: [
          "The Bureau of Labor Statistics (BLS) publishes the report at 8:30 AM ET, usually on the first Friday of the month. It combines two surveys.",
          "The establishment survey of employers produces nonfarm payrolls: how many jobs the economy added or lost. It also reports average hourly earnings, a key measure of wage growth. The household survey produces the unemployment rate: the share of people in the labor force who want a job but don't have one.",
        ],
      },
      {
        title: "Why markets care",
        paragraphs: [
          "The Federal Reserve has a dual mandate: maximum employment and stable prices. A strong jobs report can mean the economy is running hot, which may keep interest rates higher; a weak one can raise hopes of rate cuts but also fears of a slowdown.",
          "Payroll numbers are revised in the following months as more data comes in, so traders watch revisions as well as the headline number.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is the next jobs report?",
        a: "The next jobs report is scheduled for {next}, at 8:30 AM Eastern Time.",
        aNoDate: "The jobs report is usually released on the first Friday of the month at 8:30 AM Eastern Time.",
      },
      { q: "What are nonfarm payrolls?", a: "Nonfarm payrolls are the number of jobs added or lost in the U.S. economy in a month, excluding farm workers, private household employees and a few other groups." },
      { q: "How is the unemployment rate calculated?", a: "It is the number of unemployed people actively looking for work divided by the labor force (everyone working or looking for work), based on a monthly survey of households." },
    ],
    source: "U.S. Bureau of Labor Statistics via FRED, Federal Reserve Bank of St. Louis.",
  },

  gdp: {
    metaTitle: "What Is GDP? Gross Domestic Product Explained",
    metaDescription:
      "What gross domestic product (GDP) measures, how real GDP growth is reported, what it says about recessions, and the next GDP release date.",
    h1: "What Is Gross Domestic Product (GDP)?",
    intro:
      "Gross domestic product is the total value of all the goods and services produced in the United States. Its growth rate is the broadest measure of how the economy is doing.",
    stats: [{ label: "Real GDP growth (annualized)", fredId: "A191RL1Q225SBEA", format: "pct1" }],
    releaseTime: "8:30 AM ET",
    sections: [
      {
        title: "How GDP is reported",
        paragraphs: [
          "The Bureau of Economic Analysis (BEA) measures GDP each quarter. The headline figure is real GDP growth, which is adjusted for inflation, expressed as an annualized rate: how fast the economy would grow over a full year if that quarter's pace continued.",
          "Each quarter is reported three times, as an advance estimate about a month after the quarter ends, followed by second and third estimates as more data arrives.",
        ],
      },
      {
        title: "What drives GDP",
        paragraphs: [
          "GDP adds up consumer spending, business investment, government spending and net exports (exports minus imports). Consumer spending is by far the largest part, at roughly two-thirds of the U.S. economy.",
        ],
      },
      {
        title: "GDP and recessions",
        paragraphs: [
          "Two quarters in a row of shrinking GDP is a common rule of thumb for a recession. Officially, U.S. recessions are dated by the National Bureau of Economic Research (NBER), which looks at a wider range of data, including jobs and income.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is the next GDP report?",
        a: "The next GDP report is scheduled for {next}, at 8:30 AM Eastern Time.",
        aNoDate: "GDP estimates are released at 8:30 AM Eastern Time; see the economic calendar for the next date.",
      },
      { q: "What is the difference between real and nominal GDP?", a: "Nominal GDP is measured in current dollars. Real GDP removes the effect of inflation, so it shows how much the economy actually produced." },
      { q: "Why is GDP growth annualized?", a: "Quarterly growth is converted to an annual rate so it can be compared easily across quarters and with yearly figures." },
    ],
    source: "U.S. Bureau of Economic Analysis via FRED, Federal Reserve Bank of St. Louis.",
  },

  "fed-funds-rate": {
    metaTitle: "What Is the Fed Funds Rate? FOMC Explained",
    metaDescription:
      "How the Federal Reserve sets the federal funds rate, what happens at FOMC meetings, the dot plot, and the date of the next FOMC decision.",
    h1: "What Is the Federal Funds Rate?",
    intro:
      "The federal funds rate is the interest rate banks charge each other for overnight loans. The Federal Reserve sets a target range for it, and that decision ripples through borrowing costs across the economy.",
    stats: [
      { label: "Fed funds target range", fredId: "DFEDTARL", upperFredId: "DFEDTARU", format: "range" },
      { label: "Effective fed funds rate", fredId: "FEDFUNDS", format: "pct2" },
    ],
    releaseTime: "2:00 PM ET",
    sections: [
      {
        title: "Who sets it: the FOMC",
        paragraphs: [
          "The Federal Open Market Committee (FOMC) sets the target range for the federal funds rate. It holds eight scheduled meetings a year and announces its decision at 2:00 PM ET on the final day, followed by a press conference with the Fed Chair.",
          "The committee has 12 voting members: the seven members of the Federal Reserve Board, the president of the New York Fed, and four of the other eleven regional Fed presidents, who rotate each year.",
        ],
      },
      {
        title: "How it affects you and markets",
        paragraphs: [
          "Changes in the fed funds rate influence interest rates on credit cards, car loans, savings accounts and, indirectly, mortgages. Higher rates make borrowing more expensive and tend to slow the economy and inflation; lower rates do the opposite.",
          "Markets react not just to the decision but to the Fed's statement and press conference, which hint at what the committee might do next.",
        ],
      },
      {
        title: "The Summary of Economic Projections and dot plot",
        paragraphs: [
          "At four meetings a year, in March, June, September and December, the Fed also releases its Summary of Economic Projections (SEP). It shows officials' forecasts for growth, unemployment and inflation, plus the \"dot plot\": each official's view of where the fed funds rate should be in the coming years.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is the next FOMC meeting?",
        a: "The next FOMC rate decision is scheduled for {next}, at 2:00 PM Eastern Time.",
        aNoDate: "The FOMC holds eight scheduled meetings a year; see the economic calendar for the next date.",
      },
      { q: "What is the difference between the target range and the effective rate?", a: "The FOMC sets a target range, such as 3.75%–4.00%. The effective federal funds rate is the actual average rate on overnight loans between banks, which normally stays inside that range." },
      { q: "What is the dot plot?", a: "The dot plot is a chart in the Summary of Economic Projections showing where each Fed official expects the federal funds rate to be at the end of the next few years." },
    ],
    source: "Board of Governors of the Federal Reserve System via FRED, Federal Reserve Bank of St. Louis.",
  },

  vix: {
    metaTitle: "What Is the VIX? The Market's Fear Gauge",
    metaDescription:
      "What the Cboe Volatility Index (VIX) measures, how to read its levels, why it's called the fear gauge, and today's latest reading.",
    h1: "What Is the VIX?",
    intro:
      "The Cboe Volatility Index, known as the VIX, measures how much the stock market expects the S&P 500 to swing over the next 30 days. It's often called Wall Street's \"fear gauge\".",
    stats: [{ label: "VIX (latest close)", fredId: "VIXCLS", format: "index" }],
    sections: [
      {
        title: "How the VIX works",
        paragraphs: [
          "The VIX is calculated from the prices of S&P 500 options. When investors are willing to pay more for options, often to protect against a drop, the VIX rises. It reflects expected volatility, not the direction the market will move.",
        ],
      },
      {
        title: "How to read VIX levels",
        paragraphs: [
          "As a rough guide, readings below about 15 suggest calm markets, readings around 20 are close to the long-run average, and readings above 30 signal fear and big expected swings. During crises the VIX has spiked far higher, reaching about 80 in 2008 and again in 2020.",
          "The VIX tends to rise when stocks fall sharply, which is why it's used as a measure of market stress.",
        ],
      },
    ],
    faqs: [
      { q: "Who publishes the VIX?", a: "The VIX is published by Cboe Global Markets and calculated in real time during the trading day." },
      { q: "Is a high VIX bad?", a: "A high VIX means investors expect large price swings, usually during periods of fear or market declines. It does not predict which way stocks will move." },
      { q: "What is a normal VIX level?", a: "Over the long run, the VIX has averaged around 20. Readings well below that indicate calm markets; readings above 30 indicate elevated fear." },
    ],
    source: "Cboe Global Markets via FRED, Federal Reserve Bank of St. Louis.",
  },

  pmi: {
    metaTitle: "What Is the PMI? Purchasing Managers' Index",
    metaDescription:
      "What the Purchasing Managers' Index (PMI) measures, how to read the 50 line, ISM manufacturing vs. services, and regional Fed manufacturing surveys.",
    h1: "What Is the Purchasing Managers' Index (PMI)?",
    intro:
      "The Purchasing Managers' Index is a monthly survey of business conditions. It's one of the earliest signals each month of whether the economy is expanding or contracting.",
    stats: [
      { label: "Philadelphia Fed manufacturing", fredId: "GACDFSA066MSFRBPHI", format: "index" },
      { label: "New York Fed (Empire State)", fredId: "GACDISA066MSFRBNY", format: "index" },
    ],
    releaseTime: "10:00 AM ET",
    sections: [
      {
        title: "How the PMI works",
        paragraphs: [
          "The best-known U.S. PMIs come from the Institute for Supply Management (ISM). Each month, ISM asks purchasing managers whether conditions such as new orders, production, employment, supplier deliveries and inventories are improving, staying the same or getting worse.",
          "The answers are combined into a diffusion index. A reading above 50 means the sector is expanding; below 50 means it is contracting.",
        ],
      },
      {
        title: "Manufacturing vs. services",
        paragraphs: [
          "The ISM Manufacturing PMI is released at 10:00 AM ET on the first business day of the month, and the ISM Services PMI on the third business day. Services make up most of the U.S. economy, while manufacturing tends to swing more with the business cycle.",
        ],
      },
      {
        title: "Regional Fed surveys",
        paragraphs: [
          "ISM's data is licensed, so our chart shows two free, PMI-style surveys from the Federal Reserve Banks of Philadelphia and New York (Empire State). They ask manufacturers similar questions and come out earlier in the month, giving an early read on the ISM report.",
          "These surveys are scored differently: readings above zero mean more firms see conditions improving than worsening, and below zero signals contraction.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is the next ISM PMI report?",
        a: "The next ISM PMI report is scheduled for {next}, at 10:00 AM Eastern Time.",
        aNoDate: "The ISM Manufacturing PMI is released on the first business day of the month, and the Services PMI on the third, at 10:00 AM Eastern Time.",
      },
      { q: "What does a PMI above 50 mean?", a: "For ISM's PMIs, a reading above 50 means the sector is expanding compared with the previous month; below 50 means it is contracting." },
      { q: "Why does the chart show Fed surveys instead of the ISM PMI?", a: "ISM's PMI data is licensed and not freely available, so we show the Philadelphia and New York Fed manufacturing surveys, which measure similar conditions." },
    ],
    source: "Federal Reserve Banks of Philadelphia and New York via FRED; release schedule from the Institute for Supply Management.",
  },
};
