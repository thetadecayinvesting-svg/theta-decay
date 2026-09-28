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
