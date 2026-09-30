import { type NextRequest } from "next/server";
import { hasFredKey, searchSeries } from "@/lib/fred";

// GET /api/fred/search?q=housing+starts
// Searches FRED on the server so the API key never reaches the browser.
// FRED responses are cached for an hour (see fred.ts), so repeat searches are cheap.
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2 || q.length > 80) {
    return Response.json({ error: "Search for 2 to 80 characters." }, { status: 400 });
  }
  if (!hasFredKey()) {
    return Response.json({ error: "FRED search isn't available right now." }, { status: 503 });
  }
  try {
    return Response.json({ results: await searchSeries(q) });
  } catch (err) {
    console.error("FRED search failed:", err);
    return Response.json({ error: "FRED search failed. Please try again." }, { status: 502 });
  }
}
