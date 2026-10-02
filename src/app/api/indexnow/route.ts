import { type NextRequest } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";
import { PUBLIC_URLS } from "@/lib/siteUrls";

// GET /api/indexnow — run once a day by a Vercel cron job (see vercel.json),
// shortly after the morning data releases, since the calendar and charts change
// daily. Vercel sends "Authorization: Bearer <CRON_SECRET>"; anything else is
// turned away so strangers can't trigger submissions.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await submitToIndexNow(PUBLIC_URLS);
  if (!result.ok) console.error(`IndexNow submission failed (${result.status})`);
  return Response.json({ submitted: PUBLIC_URLS.length, ...result }, { status: result.ok ? 200 : 502 });
}
