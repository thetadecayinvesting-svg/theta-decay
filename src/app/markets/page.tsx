import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import KeyNotice from "@/components/KeyNotice";
import NewsletterSignup from "@/components/NewsletterSignup";
import LiveMiniCharts from "@/components/LiveMiniCharts";
import PerformanceChart from "@/components/markets/PerformanceChart";
import SpFedChart from "@/components/markets/SpFedChart";
import StatCards from "@/components/markets/StatCards";
import TickerTape from "@/components/TickerTape";
import { ASSETS } from "@/lib/assets";
import { formatPeriod } from "@/lib/chartFormat";
import { hasBeehiiv } from "@/lib/beehiiv";
import { getMarketData } from "@/lib/markets";

export const metadata: Metadata = pageMetadata({
  title: "Markets",
  description:
    "Live Nasdaq, S&P 500, Dow Jones and Bitcoin prices, plus long-term performance and S&P 500 vs. fed funds rate charts.",
  path: "/markets",
});

// Refresh FRED data at most once an hour.
export const revalidate = 3600;

export default async function MarketsPage() {
  const { assets, fedFunds, missingKey } = await getMarketData();
  const sp = assets.find((a) => a.key === "sp500")?.points ?? [];
  const latestDates = assets.map((a) => a.points.at(-1)?.date).filter(Boolean) as string[];
  const errors = [
    ...assets.filter((a) => a.error).map((a) => `${ASSETS.find((x) => x.key === a.key)?.name}: ${a.error}`),
    ...(fedFunds.error ? [`Fed funds: ${fedFunds.error}`] : []),
  ];

  return (
    <div className="space-y-12">
      <TickerTape />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Markets</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Live prices for stocks and Bitcoin, plus the long-term trends behind them.
        </p>
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Live Prices</h2>
          <p className="mt-1 text-sm text-muted">
            Delayed quotes from TradingView. Free widgets can&apos;t show the indices
            themselves, so stocks are shown through ETFs that track them.
          </p>
        </div>
        <LiveMiniCharts />
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Market Trends</h2>
          <p className="mt-1 text-sm text-muted">
            Official index closes from FRED, updated hourly.
          </p>
        </div>

        {missingKey && <KeyNotice what="The market trend charts" />}
        {errors.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">
            <p className="font-medium text-primary">Some market data couldn&apos;t load</p>
            <ul className="mt-1 list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <StatCards assets={ASSETS} series={assets} />
        {latestDates.length > 0 && (
          <p className="text-xs text-muted">
            Data as of {formatPeriod(latestDates.sort()[0], "day")}
            {latestDates.some((d) => d !== latestDates[0]) &&
              ` (Bitcoin trades daily: ${formatPeriod(latestDates.at(-1)!, "day")})`}{" "}
            · Source: FRED, Federal Reserve Bank of St. Louis (Bitcoin: Coinbase). S&amp;P 500 and
            Dow Jones © S&amp;P Dow Jones Indices LLC.
          </p>
        )}

        {/* Stock indices only: Bitcoin's swings would dwarf them on this chart. */}
        <PerformanceChart assets={ASSETS.filter((a) => a.key !== "btc")} series={assets} />
        <SpFedChart sp={sp} fed={fedFunds.points} />
      </section>

      {hasBeehiiv() && <NewsletterSignup source="markets" variant="inline" />}
    </div>
  );
}
