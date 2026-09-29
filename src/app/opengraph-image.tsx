import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// The preview image shown when a link to the site is shared (X, LinkedIn, iMessage…):
// the logo-kit logo on the Deep Violet background.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoSvg = await readFile(join(process.cwd(), "public", "logo.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logoSvg.toString("base64")}`;

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
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
        <img src={logoSrc} width={686} height={200} alt="" />
        <div style={{ marginTop: "48px", fontSize: "40px", color: "#a597fa" }}>{SITE_TAGLINE}</div>
        <div style={{ marginTop: "20px", fontSize: "30px", color: "#9a96b0" }}>
          FOMC · CPI · Jobs · GDP · VIX · Credit spreads · Live markets
        </div>
      </div>
    ),
    size,
  );
}
