import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import DashboardView from "@/components/DashboardView";
import KeyNotice from "@/components/KeyNotice";
import { getDashboardData } from "@/lib/series";

export const metadata: Metadata = pageMetadata({
  title: "Economic Indicators",
  description:
    "Live charts of CPI inflation, unemployment, the fed funds rate, 10-year Treasury yield and real GDP growth, updated from FRED.",
  path: "/dashboard",
});

// Refresh FRED data at most once an hour.
export const revalidate = 3600;

export default async function DashboardPage() {
  const { charts, missingKey } = await getDashboardData("economy");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Economic Indicators</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Inflation, jobs, interest rates and growth, updated hourly from FRED. Hover a
          chart for exact readings.
        </p>
      </div>

      {missingKey && <KeyNotice what="The indicator charts" />}

      <DashboardView charts={charts} explore />
    </div>
  );
}
