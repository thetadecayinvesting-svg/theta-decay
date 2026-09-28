import type { Metadata } from "next";
import DashboardView from "@/components/DashboardView";
import KeyNotice from "@/components/KeyNotice";
import { getDashboardData } from "@/lib/series";

export const metadata: Metadata = {
  title: "Economic Indicators — Theta Decay Investing",
};

// Refresh FRED data at most once an hour.
export const revalidate = 3600;

export default async function DashboardPage() {
  const { charts, missingKey } = await getDashboardData();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Economic Indicators</h1>
        <p className="mt-2 max-w-2xl text-muted">
          The economy and market risk, updated hourly from FRED. Hover a chart
          for exact readings.
        </p>
      </div>

      {missingKey && <KeyNotice what="The dashboard charts" />}

      <DashboardView charts={charts} />
    </div>
  );
}
