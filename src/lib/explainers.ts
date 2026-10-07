// Beginner-friendly explainers shown with "What is this?" on each chart, keyed
// by chart key (see charts.ts). Shared by server and browser code.

export type Explainer = {
  what: string; // what the indicator measures
  whyItMatters: string; // why markets and investors care
  watch: string; // what to look for
  learnHref?: string; // full guide page
};

export const EXPLAINERS: Record<string, Explainer> = {
  cpi: {
    what:
      "The Consumer Price Index (CPI) measures how much the prices people pay for everyday goods and services, such as groceries, rent, gasoline and medical care, have changed. This chart shows the change from a year earlier, which is how inflation is usually quoted.",
    whyItMatters:
      "Inflation drives the Federal Reserve's interest rate decisions. Hotter-than-expected CPI can mean rates stay higher for longer, which often weighs on stock and bond prices; cooler readings can do the opposite.",
    watch:
      "The Fed aims for inflation of about 2% over time. Core CPI, which excludes volatile food and energy prices, is the better guide to the underlying trend.",
    learnHref: "/learn/cpi",
  },
  pce: {
    what:
      "The personal consumption expenditures (PCE) price index measures how prices change for the goods and services Americans buy, including spending made on their behalf, such as employer-paid health insurance.",
    whyItMatters:
      "PCE is the inflation measure the Federal Reserve uses for its 2% target, so it directly shapes expectations for interest rates.",
    watch:
      "Core PCE, which excludes food and energy, is the Fed's favorite gauge. A steady move toward 2% supports rate cuts; a rebound can keep rates high.",
    learnHref: "/learn/pce",
  },
  unrate: {
    what:
      "The unemployment rate is the share of people in the labor force who want a job but don't have one. It comes from the monthly jobs report.",
    whyItMatters:
      "A strong job market supports consumer spending, but a very tight one can push up wages and inflation. Rising unemployment can signal a slowing economy and raise the odds of rate cuts.",
    watch:
      "Sharp, sustained increases in unemployment have historically come before or during recessions.",
    learnHref: "/learn/jobs-report",
  },
  fedfunds: {
    what:
      "The federal funds rate is the interest rate banks charge each other for overnight loans. The Federal Reserve's FOMC sets a target range for it at eight meetings a year.",
    whyItMatters:
      "It's the starting point for borrowing costs across the economy, from credit cards and car loans to business loans, and it influences stock and bond prices.",
    watch:
      "Watch the direction of travel: a series of hikes slows the economy and inflation, while cuts aim to support growth.",
    learnHref: "/learn/fed-funds-rate",
  },
  dgs10: {
    what:
      "The 10-year Treasury yield is the interest rate the U.S. government pays to borrow for 10 years. It is set by investors trading Treasury bonds every day.",
    whyItMatters:
      "It's a benchmark for long-term borrowing, especially mortgage rates, and a key input for valuing stocks. Higher yields make bonds more attractive compared with stocks.",
    watch:
      "Yields tend to rise when investors expect stronger growth or higher inflation, and fall when they expect a slowdown or rate cuts.",
  },
  gdp: {
    what:
      "Gross domestic product (GDP) is the total value of goods and services the U.S. produces. This chart shows real (inflation-adjusted) growth each quarter, expressed as an annual rate.",
    whyItMatters:
      "GDP is the broadest measure of economic health. Strong growth supports corporate earnings; weak or negative growth raises recession fears.",
    watch:
      "Two consecutive quarters of shrinking GDP is a common rule of thumb for a recession, though recessions are officially dated by the NBER.",
    learnHref: "/learn/gdp",
  },
  gdpdrivers: {
    what:
      "This chart splits each quarter's GDP growth into the four parts of the economy that produced it: consumer spending, business investment, government, and trade. Bars above zero added to growth; bars below zero subtracted from it. The dot is total GDP growth, which equals the bars added together.",
    whyItMatters:
      "The headline GDP number tells you how fast the economy grew; this shows why. Growth led by consumer spending and business investment is usually seen as healthier than growth from swings in trade or inventories, which often reverse the next quarter.",
    watch:
      "Consumer spending is about two-thirds of the economy, so it's the bar to watch. Large trade swings often come from businesses importing goods early (for example ahead of tariffs) and tend to even out over time.",
    learnHref: "/learn/gdp",
  },
  vix: {
    what:
      "The VIX measures how much investors expect the S&P 500 to swing over the next 30 days, based on stock option prices. It's often called the \"fear gauge\".",
    whyItMatters:
      "The VIX usually jumps when stocks fall sharply, so it's a quick read on how nervous the market is.",
    watch:
      "Readings below about 15 suggest calm, around 20 is roughly average, and above 30 signals fear.",
    learnHref: "/learn/vix",
  },
  oas: {
    what:
      "Credit spreads are the extra yield investors demand to lend to companies instead of the U.S. government. High-yield (\"junk\") bonds carry more risk than investment-grade bonds, so their spread is larger.",
    whyItMatters:
      "Bond investors are often quick to sense trouble. Widening spreads mean lenders are getting nervous about companies' ability to repay.",
    watch:
      "A sudden jump in the high-yield spread has often come before or alongside stock market declines and recessions.",
  },
  baa10y: {
    what:
      "This spread compares the yield on Baa-rated corporate bonds, the lowest tier of investment grade, with the 10-year Treasury yield. It has been tracked for decades.",
    whyItMatters:
      "Like other credit spreads, it rises when investors demand more compensation for corporate credit risk, a sign of growing caution about the economy.",
    watch:
      "A steady climb from low levels has historically been an early warning of economic stress.",
  },
  margin: {
    what:
      "Margin debt is money investors borrow from their brokers to buy stocks and other securities, as reported monthly by FINRA.",
    whyItMatters:
      "Borrowing magnifies both gains and losses. High margin debt shows investors are confident, but if prices fall, forced selling to repay loans can make declines worse.",
    watch:
      "Record highs signal heavy leverage and optimism; sharp drops often come during sell-offs.",
  },
  sentiment: {
    what:
      "The University of Michigan's consumer sentiment index is based on a monthly survey asking Americans how they feel about their finances and the economy.",
    whyItMatters:
      "Consumer spending is the biggest part of the U.S. economy, so how households feel can hint at how much they'll spend.",
    watch:
      "Very low readings show widespread pessimism; a sustained rebound can signal improving spending ahead.",
  },
  fedsurveys: {
    what:
      "These PMI-style surveys from the Philadelphia and New York Federal Reserve Banks ask manufacturers whether business conditions are improving or getting worse.",
    whyItMatters:
      "They come out before the national ISM PMI each month, giving an early read on whether factories are expanding or contracting.",
    watch:
      "Readings above zero mean more firms see improvement than decline; falling below zero often signals a manufacturing slowdown.",
    learnHref: "/learn/pmi",
  },
};
