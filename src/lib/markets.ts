import { FRED_ASSETS, type Asset } from "./assets";
import { getSeries, hasFredKey, type Point } from "./fred";

// FRED only carries the last 10 years of S&P 500 and Dow data (licensing),
// so there's no point loading the other series from further back.
const START = "2016-01-01";

export type AssetSeries = { key: Asset["key"]; points: Point[]; error?: string };

async function load(fredId: string) {
  try {
    return { points: await getSeries(fredId, { start: START }) };
  } catch (err) {
    return { points: [], error: err instanceof Error ? err.message : String(err) };
  }
}

// Daily closes for the stock indices plus the monthly fed funds rate.
// Cached and re-checked with FRED at most once an hour (see fred.ts).
export async function getMarketData(): Promise<{
  assets: AssetSeries[];
  fedFunds: { points: Point[]; error?: string };
  missingKey: boolean;
}> {
  if (!hasFredKey()) {
    return {
      assets: FRED_ASSETS.map((a) => ({ key: a.key, points: [] })),
      fedFunds: { points: [] },
      missingKey: true,
    };
  }

  const [fedFunds, ...assets] = await Promise.all([
    load("FEDFUNDS"),
    ...FRED_ASSETS.map((a) => load(a.fredId)),
  ]);

  return {
    assets: FRED_ASSETS.map((a, i) => ({ key: a.key, ...assets[i] })),
    fedFunds,
    missingKey: false,
  };
}
