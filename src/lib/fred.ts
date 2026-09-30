// Server-only helpers for the FRED API (https://fred.stlouisfed.org/docs/api/fred/).
// The API key is read from the FRED_API_KEY environment variable (.env.local)
// and never reaches the browser.

const BASE_URL = "https://api.stlouisfed.org/fred";
const PLACEHOLDER_KEY = "paste-your-key-here";

// Refresh FRED data at most once an hour.
const REVALIDATE_SECONDS = 3600;

export class MissingKeyError extends Error {
  constructor() {
    super("FRED_API_KEY is not set");
  }
}

export function hasFredKey() {
  const key = process.env.FRED_API_KEY?.trim();
  return Boolean(key && key !== PLACEHOLDER_KEY);
}

async function fredRequest<T>(
  path: string,
  params: Record<string, string | undefined>,
): Promise<T> {
  if (!hasFredKey()) throw new MissingKeyError();

  const url = new URL(`${BASE_URL}/${path}`);
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(name, value);
  }
  url.searchParams.set("api_key", process.env.FRED_API_KEY!.trim());
  url.searchParams.set("file_type", "json");

  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    // FRED explains errors in JSON; never echo the URL, since it contains the key.
    const body = (await res.json().catch(() => null)) as {
      error_message?: string;
    } | null;
    throw new Error(
      `FRED ${path} failed (${res.status})${body?.error_message ? `: ${body.error_message}` : ""}`,
    );
  }
  return res.json() as Promise<T>;
}

export type Point = { date: string; value: number };

export async function getSeries(
  seriesId: string,
  options: { start?: string; units?: string; frequency?: string } = {},
): Promise<Point[]> {
  const data = await fredRequest<{
    observations: { date: string; value: string }[];
  }>("series/observations", {
    series_id: seriesId,
    observation_start: options.start,
    units: options.units,
    frequency: options.frequency,
    aggregation_method: options.frequency ? "avg" : undefined,
  });

  // FRED uses "." for missing values.
  return data.observations
    .filter((obs) => obs.value !== ".")
    .map((obs) => ({ date: obs.date, value: Number(obs.value) }));
}

// Scheduled (including future) publication dates for a FRED release.
export async function getReleaseDates(
  releaseId: number,
  from: string,
): Promise<string[]> {
  const data = await fredRequest<{ release_dates: { date: string }[] }>(
    "release/dates",
    {
      release_id: String(releaseId),
      realtime_start: from,
      realtime_end: "9999-12-31",
      include_release_dates_with_no_data: "true",
      sort_order: "asc",
      limit: "1000",
    },
  );
  return data.release_dates.map((r) => r.date);
}

// Descriptive details for a series (like the "Notes" box on a FRED series page).
export type SeriesInfo = {
  id: string;
  title: string;
  units: string;
  frequency: string;
  seasonalAdjustment: string;
  notes: string;
  lastUpdated: string; // e.g. "2026-07-30 10:09:19-05"
  release: { name: string; link?: string } | null;
  sources: { name: string; link?: string }[];
};

export async function getSeriesInfo(seriesId: string): Promise<SeriesInfo> {
  const [seriesData, releaseData] = await Promise.all([
    fredRequest<{
      seriess: {
        id: string;
        title: string;
        units: string;
        frequency: string;
        seasonal_adjustment: string;
        notes?: string;
        last_updated: string;
      }[];
    }>("series", { series_id: seriesId }),
    fredRequest<{ releases: { id: number; name: string; link?: string }[] }>("series/release", {
      series_id: seriesId,
    }),
  ]);
  const s = seriesData.seriess[0];
  const release = releaseData.releases[0] ?? null;
  const sources = release
    ? (
        await fredRequest<{ sources: { name: string; link?: string }[] }>("release/sources", {
          release_id: String(release.id),
        })
      ).sources
    : [];

  return {
    id: s.id,
    title: s.title,
    units: s.units,
    frequency: s.frequency,
    seasonalAdjustment: s.seasonal_adjustment,
    notes: (s.notes ?? "").trim(),
    lastUpdated: s.last_updated,
    release: release ? { name: release.name, link: release.link } : null,
    sources: sources.map((src) => ({ name: src.name, link: src.link })),
  };
}

// FRED's own search (powers "Explore any FRED series"): the 25 most relevant
// matches, re-ordered so the most widely used series come first.
export type SeriesSearchResult = {
  id: string;
  title: string;
  frequency: string;
  units: string;
  seasonalAdjustment: string;
  start: string;
  end: string;
};

export async function searchSeries(text: string, limit = 10): Promise<SeriesSearchResult[]> {
  const data = await fredRequest<{
    seriess: {
      id: string;
      title: string;
      frequency: string;
      units_short: string;
      seasonal_adjustment_short: string;
      observation_start: string;
      observation_end: string;
      popularity: number;
    }[];
  }>("series/search", {
    search_text: text,
    limit: "25",
    order_by: "search_rank",
  });
  const ranked = [...data.seriess].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
  return ranked.map((s) => ({
    id: s.id,
    title: s.title,
    frequency: s.frequency,
    units: s.units_short,
    seasonalAdjustment: s.seasonal_adjustment_short,
    start: s.observation_start,
    end: s.observation_end,
  }));
}
