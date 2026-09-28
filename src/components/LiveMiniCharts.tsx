import TradingViewWidget from "./TradingViewWidget";
import { ASSETS } from "@/lib/assets";

// Four live TradingView mini charts: 2×2 on phones, a row of four on desktop.
export default function LiveMiniCharts() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {ASSETS.map((asset) => (
        <div key={asset.key} className="rounded-lg border border-border bg-surface p-3">
          <p className="mb-2 px-1 text-xs font-medium text-muted">{asset.tvLabel}</p>
          <TradingViewWidget
            script="embed-widget-mini-symbol-overview.js"
            height={180}
            attribution={{
              href: `https://www.tradingview.com/symbols/${asset.tvSymbol.replace(":", "-")}/`,
              label: `${asset.tvSymbol.split(":")[1]} chart`,
            }}
            config={{
              symbol: asset.tvSymbol,
              width: "100%",
              height: 180,
              locale: "en",
              dateRange: "1M",
              colorTheme: "dark",
              isTransparent: true,
              autosize: false,
              chartOnly: false,
              noTimeScale: false,
              // Theme colors, filled in from globals.css at load time
              trendLineColor: "var(--tv-line)",
              underLineColor: "var(--tv-area-top)",
              underLineBottomColor: "var(--tv-area-bottom)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
