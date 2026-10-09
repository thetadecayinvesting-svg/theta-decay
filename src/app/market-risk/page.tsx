import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import DashboardView from "@/components/DashboardView";
import KeyNotice from "@/components/KeyNotice";
import { getDashboardData } from "@/lib/series";

export const metadata: Metadata = pageMetadata({
  title: "Market Risk",
  description:
    "Is the market getting nervous? Track the VIX \"fear gauge,\" credit spreads, margin debt, the dollar and factory surveys in one free dashboard.",
  path: "/market-risk",
});

// Refresh FRED data at most once an hour (FINRA margin debt: once a day).
export const revalidate = 3600;

export default async function MarketRiskPage() {
  const { charts, missingKey } = await getDashboardData("risk");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Market Risk</h1>
        <p className="mt-2 max-w-2xl text-muted">
          How nervous stock and bond investors are right now: volatility, credit spreads
          and borrowing to buy stocks.
        </p>
      </div>

      {missingKey && <KeyNotice what="The market risk charts" />}

      <DashboardView charts={charts} />
    </div>
  );
}
