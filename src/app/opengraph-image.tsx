import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// The preview image shown when a link to the site is shared (X, LinkedIn, iMessage…).
// Colors match the Deep Violet theme in globals.css.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0f0d1a",
          color: "#e6eaf2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              width: "104px",
              height: "104px",
              borderRadius: "20px",
              background: "#8b7cf6",
              color: "#0f0d1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "64px",
              fontWeight: 700,
            }}
          >
            Θ
          </div>
          <div style={{ fontSize: "72px", fontWeight: 700, letterSpacing: "-2px" }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: "40px", fontSize: "40px", color: "#a597fa" }}>{SITE_TAGLINE}</div>
        <div style={{ marginTop: "20px", fontSize: "30px", color: "#9a96b0" }}>
          FOMC · CPI · Jobs · GDP · VIX · Credit spreads · Live markets
        </div>
      </div>
    ),
    size,
  );
}
