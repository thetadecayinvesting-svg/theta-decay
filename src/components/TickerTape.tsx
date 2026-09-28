import TradingViewWidget from "./TradingViewWidget";
import { ASSETS } from "@/lib/assets";

// Scrolling live-price strip shown under the navigation bar on every page.
export default function TickerTape() {
  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
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
            colorTheme: "dark",
            locale: "en",
          }}
        />
      </div>
    </div>
  );
}
