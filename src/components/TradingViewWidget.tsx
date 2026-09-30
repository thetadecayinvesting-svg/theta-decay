"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "./SettingsProvider";

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
  // TradingView rewrites whatever it's given, so it gets its own box (host)
  // that React leaves empty; we rebuild the widget inside it on every load.
  const host = useRef<HTMLDivElement>(null);
  const configJson = JSON.stringify(config);
  // Re-draw with the new colors when the visitor switches theme.
  const { settings, loaded } = useSettings();
  const theme = settings.theme;
  const mode = settings.mode;

  useEffect(() => {
    const el = host.current;
    if (!el || !loaded) return; // wait for saved settings so we load once, in the right colors
    let cancelled = false;
    let idleHandle: number | undefined;

    const inject = () => {
      if (cancelled || el.childElementCount > 0) return;
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
      const box = document.createElement("div");
      box.className = "tradingview-widget-container";
      box.style.minHeight = `${height}px`;
      const widget = document.createElement("div");
      widget.className = "tradingview-widget-container__widget";

      box.append(widget, s);
      el.replaceChildren(box);
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
      el.replaceChildren(); // clear the widget so the next load starts fresh
    };
  }, [script, configJson, theme, mode, loaded, height]);

  return (
    <div>
      <div ref={host} style={{ minHeight: height }} />
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
