import TradingViewWidget from "./TradingViewWidget";
import { ASSETS } from "@/lib/assets";

// Scrolling live-price strip at the top of the Markets page.
export default function TickerTape() {
  return (
    <div className="rounded-lg border border-border bg-surface px-2 pt-1 sm:px-3">
      <div>
        <TradingViewWidget
          script="embed-widget-ticker-tape.js"
          height={46}
          attribution={{
            href: "https://www.tradingview.com/markets/",
            label: "Track all markets",
          }}
          config={{
            symbols: ASSETS.map((a) => ({ proName: a.tvSymbol, title: a.tvLabel })),
            showSymbolLogo: true,
            isTransparent: true,
            displayMode: "adaptive",
            colorTheme: "var(--tv-color-theme)", // dark or light, from globals.css
            locale: "en",
          }}
        />
      </div>
    </div>
  );
}
