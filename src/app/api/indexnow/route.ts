import { type NextRequest } from "next/server";
import { getRecentEvents, todayET } from "@/lib/calendar";
import { submitToIndexNow } from "@/lib/indexnow";
import { learnHref } from "@/lib/learnTopics";
import { releaseHref, releasePageFor } from "@/lib/releasePages";
import { PUBLIC_URLS, siteUrl } from "@/lib/siteUrls";

// Pages whose data changes every day (calendar, charts, prices).
const DAILY_PATHS = ["/", "/dashboard", "/markets", "/market-risk"];

// Which pages actually changed today: the daily data pages, plus the release-date
// page and guide for any report that came out since yesterday. Search engines ask
// for changed pages only, so the full list goes out just once a week (Mondays),
// which also covers pages that were edited.
async function changedUrls() {
  const today = todayET();
  if (new Date(`${today}T12:00:00Z`).getUTCDay() === 1) return PUBLIC_URLS;

  const yesterday = new Date(`${today}T12:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const since = yesterday.toISOString().slice(0, 10);

  const paths = new Set(DAILY_PATHS);
  const recent = await getRecentEvents().catch(() => []);
  for (const e of recent.filter((e) => e.date >= since)) {
    const page = releasePageFor(e.type);
    if (!page) continue;
    paths.add(releaseHref(page.slug));
    paths.add(learnHref(page.guideSlug));
  }
  return [...paths].map(siteUrl);
}

// GET /api/indexnow — run once a day by a Vercel cron job (see vercel.json),
// shortly after the morning data releases. Vercel sends
// "Authorization: Bearer <CRON_SECRET>"; anything else is turned away so strangers
// can't trigger submissions.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const urls = await changedUrls();
  const result = await submitToIndexNow(urls);
  if (!result.ok) console.error(`IndexNow submission failed (${result.status})`);
  return Response.json({ submitted: urls.length, urls, ...result }, { status: result.ok ? 200 : 502 });
}
