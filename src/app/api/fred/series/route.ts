import { type NextRequest } from "next/server";
import { hasFredKey } from "@/lib/fred";
import { getCustomChart } from "@/lib/series";

// FRED series IDs are short codes like "HOUST" or "A191RL1Q225SBEA".
const SERIES_ID = /^[A-Z0-9_.]{1,40}$/;

// GET /api/fred/series?id=HOUST
// Returns one FRED series (from 2000 on) plus its details, ready to chart.
export async function GET(request: NextRequest) {
  const id = (request.nextUrl.searchParams.get("id") ?? "").trim().toUpperCase();
  if (!SERIES_ID.test(id)) {
    return Response.json({ error: "That isn't a valid FRED series ID." }, { status: 400 });
  }
  if (!hasFredKey()) {
    return Response.json({ error: "FRED data isn't available right now." }, { status: 503 });
  }
  try {
    return Response.json({ chart: await getCustomChart(id) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // FRED answers 400 "series does not exist" for unknown IDs.
    const notFound = /does not exist|\(400\)/.test(message);
    if (!notFound) console.error(`FRED series ${id} failed:`, err);
    return Response.json(
      { error: notFound ? `FRED has no series called ${id}.` : "Couldn't load that series. Please try again." },
      { status: notFound ? 404 : 502 },
    );
  }
}
