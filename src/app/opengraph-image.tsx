import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCalendar } from "@/lib/calendar";
import { EVENT_META, type CalendarEvent } from "@/lib/events";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// The preview image shown when a link to the site is shared (X, LinkedIn, iMessage…):
// the logo plus the next economic events from the calendar, rebuilt hourly. Pages
// with their own image (the Learn guides) override it.
export const revalidate = 3600;
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#000000";
const SURFACE = "#1a1729";
const BORDER = "#2e2a45";
const TEXT = "#ece9f8";
const MUTED = "#9a96b0";
const ACCENT = "#8b7cf6";
const ACCENT_TEXT = "#a597fa";

const asDate = (d: string) => new Date(`${d}T12:00:00Z`);
const dayLabel = (d: string, weekday: "short" | "long") =>
  asDate(d).toLocaleDateString("en-US", { weekday, month: "short", day: "numeric", timeZone: "UTC" });

// "08:30" → "8:30 AM ET"
function timeLabel(timeET: string) {
  const [h, m] = timeET.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"} ET`;
}

const eventLabel = (e: CalendarEvent) => (e.withSep ? "FOMC + SEP" : EVENT_META[e.type].label);

export default async function OpengraphImage() {
  const logoSvg = await readFile(join(process.cwd(), "public", "logo.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logoSvg.toString("base64")}`;
  const events = (await getCalendar().catch(() => null))?.events ?? [];
  const [next, ...later] = events;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "52px 80px",
          background: BG,
          color: TEXT,
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
        <img src={logoSrc} width={412} height={120} alt="" />
        <div style={{ marginTop: "20px", fontSize: "34px", color: ACCENT_TEXT }}>{SITE_TAGLINE}</div>

        {next ? (
          <div style={{ marginTop: "40px", display: "flex", gap: "24px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "24px 32px",
                background: SURFACE,
                border: `2px solid ${BORDER}`,
                borderLeft: `8px solid ${ACCENT}`,
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: "22px", letterSpacing: "3px", color: ACCENT_TEXT }}>NEXT UP</div>
              <div style={{ marginTop: "8px", fontSize: "46px", fontWeight: 700 }}>{eventLabel(next)}</div>
              <div style={{ marginTop: "4px", fontSize: "26px", color: MUTED }}>
                {`${dayLabel(next.date, "long")} · ${timeLabel(next.timeET)}`}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "420px",
                padding: "24px 32px",
                background: SURFACE,
                border: `2px solid ${BORDER}`,
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: "22px", letterSpacing: "3px", color: MUTED }}>COMING UP</div>
              {later.slice(0, 3).map((e) => (
                <div
                  key={`${e.date}-${e.type}`}
                  style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "26px" }}
                >
                  <div style={{ fontWeight: 700 }}>{eventLabel(e)}</div>
                  <div style={{ color: MUTED }}>{dayLabel(e.date, "short")}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "40px", fontSize: "30px", color: MUTED }}>
            FOMC · CPI · Jobs · GDP · VIX · Credit spreads · Live markets
          </div>
        )}

        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "22px", color: MUTED }}>
          <div>Free · Updated automatically</div>
          <div>thetadecayinvesting.com</div>
        </div>
      </div>
    ),
    size,
  );
}
