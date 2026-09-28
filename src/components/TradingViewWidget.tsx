"use client";

import { useEffect, useRef } from "react";

// Embeds a free TradingView widget (https://www.tradingview.com/widget-docs/).
// The script is only injected once the widget is near the screen and the
// browser is idle, so it never delays the rest of the page. The container
// reserves its height up front to avoid layout shift.
export default function TradingViewWidget({
  script,
  config,
  height,
  attribution,
}: {
  script: string; // e.g. "embed-widget-ticker-tape.js"
  config: Record<string, unknown>;
  height: number;
  attribution: { href: string; label: string };
}) {
  const container = useRef<HTMLDivElement>(null);
  const configJson = JSON.stringify(config);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let cancelled = false;
    let idleHandle: number | undefined;

    const inject = () => {
      if (cancelled || el.querySelector("script")) return;
      // TradingView can't read CSS variables, so swap "var(--token)" values
      // for the actual colors from the theme file (globals.css).
      const root = getComputedStyle(document.documentElement);
      const resolved = configJson.replace(
        /var\((--[\w-]+)\)/g,
        (match, name: string) => root.getPropertyValue(name).trim() || match,
      );
      const s = document.createElement("script");
      s.src = `https://s3.tradingview.com/external-embedding/${script}`;
      s.async = true;
      s.type = "text/javascript";
      s.innerHTML = resolved;
      el.appendChild(s);
    };

    const whenIdle = () => {
      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(inject, { timeout: 2000 });
      } else {
        setTimeout(inject, 200);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          whenIdle();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleHandle !== undefined) window.cancelIdleCallback?.(idleHandle);
      // Clear the widget so a re-render starts fresh.
      el.querySelectorAll("script, iframe").forEach((node) => node.remove());
      const widget = el.querySelector(".tradingview-widget-container__widget");
      if (widget) widget.innerHTML = "";
    };
  }, [script, configJson]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container"
      style={{ minHeight: height }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height }}
      />
      {/* Required TradingView attribution — do not remove. */}
      <div className="tradingview-widget-copyright px-1 pt-1 text-[11px] text-muted">
        <a
          href={attribution.href}
          rel="noopener nofollow"
          target="_blank"
          className="text-accent hover:text-accent-hover"
        >
          {attribution.label}
        </a>{" "}
        by TradingView
      </div>
    </div>
  );
}
