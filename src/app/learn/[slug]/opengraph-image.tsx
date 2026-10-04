import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCalendar } from "@/lib/calendar";
import { yearsAgo } from "@/lib/chartFormat";
import type { Point } from "@/lib/fred";
import { GUIDES } from "@/lib/learnContent";
import { loadStat } from "@/lib/learnStats";
import { LEARN_TOPICS } from "@/lib/learnTopics";
import { SITE_NAME } from "@/lib/site";

// The preview image shown when a guide is shared (X, LinkedIn, iMessage…): the
// topic, its latest numbers, a two-year sparkline and the next release date.
// Rebuilt hourly along with the page.
export const revalidate = 3600;
export const alt = `Economic indicator guide | ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LEARN_TOPICS.map((t) => ({ slug: t.slug }));
}

const BG = "#000000";
const SURFACE = "#17151f";
const BORDER = "#2a2735";
const TEXT = "#ece9f8";
const MUTED = "#9a96b0";
const ACCENT = "#8b7cf6";
const ACCENT_TEXT = "#a597fa";

const SPARK_W = 1040;
const SPARK_H = 120;

// SVG path for a simple line through the points, scaled to the sparkline box.
function sparkPath(points: Point[]) {
  if (points.length < 2) return "";
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * SPARK_W;
      const y = SPARK_H - 6 - ((p.value - min) / range) * (SPARK_H - 12);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default async function LearnOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = LEARN_TOPICS.find((t) => t.slug === slug);
  const guide = GUIDES[slug];

  const logoSvg = await readFile(join(process.cwd(), "public", "logo.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logoSvg.toString("base64")}`;

  const start = yearsAgo(2);
  const [stats, calendar] = await Promise.all([
    Promise.all((guide?.stats ?? []).slice(0, 2).map((s) => loadStat(s, start))),
    topic?.eventType ? getCalendar().catch(() => null) : null,
  ]);
  const shown = stats.filter((s) => s !== null);
  const next = topic?.eventType ? calendar?.events.find((e) => e.type === topic.eventType) : undefined;
  const nextLabel = next
    ? new Date(`${next.date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    : null;
  const path = shown[0] ? sparkPath(shown[0].points) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 80px",
          background: BG,
          color: TEXT,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
          <img src={logoSrc} width={240} height={70} alt="" />
          <div style={{ fontSize: "24px", letterSpacing: "3px", color: ACCENT_TEXT }}>
            {`LEARN · ${(topic?.category ?? "Guide").toUpperCase()}`}
          </div>
        </div>

        <div style={{ marginTop: "28px", fontSize: "54px", fontWeight: 700, lineHeight: 1.1 }}>
          {topic?.title ?? SITE_NAME}
        </div>

        <div style={{ marginTop: "28px", height: "160px", flexShrink: 0, display: "flex", gap: "24px" }}>
          {shown.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "20px 28px",
                background: SURFACE,
                border: `2px solid ${BORDER}`,
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: "22px", color: MUTED }}>{s.label}</div>
              <div style={{ fontSize: "46px", fontWeight: 700, marginTop: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "20px", color: MUTED }}>{s.when}</div>
            </div>
          ))}
          {nextLabel && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: "240px",
                padding: "20px 28px",
                background: SURFACE,
                border: `2px solid ${BORDER}`,
                borderLeft: `8px solid ${ACCENT}`,
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: "22px", color: MUTED }}>Next release</div>
              <div style={{ fontSize: "46px", fontWeight: 700, marginTop: "4px" }}>{nextLabel}</div>
              <div style={{ fontSize: "20px", color: MUTED }}>{next ? `${new Date(`${next.date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}${guide?.releaseTime ? ` · ${guide.releaseTime}` : ""}` : ""}</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "flex-end" }}>
          {path && (
            <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}>
              <path d={path} fill="none" stroke={ACCENT} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "20px", color: MUTED }}>
          <div>Last 2 years · Source: FRED</div>
          <div>{`thetadecayinvesting.com/learn/${slug}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
