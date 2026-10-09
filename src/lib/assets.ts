// The four market assets, shared by server and browser code.
// Free TradingView widgets can't show the real Nasdaq/S&P/Dow indices, so the
// live widgets use ETFs that track them (labelled as such). The long-term
// charts use the real index levels from FRED.

export type Asset = {
  key: "nasdaq" | "sp500" | "dow" | "btc";
  name: string;
  fredId?: string; // FRED series for the long-term charts; none = live widget only
  source: string; // who publishes the data
  tvSymbol: string;
  tvLabel: string;
};

export const ASSETS: Asset[] = [
  {
    key: "nasdaq",
    name: "Nasdaq Composite",
    fredId: "NASDAQCOM",
    source: "FRED, Federal Reserve Bank of St. Louis",
    tvSymbol: "NASDAQ:ONEQ",
    tvLabel: "Nasdaq Composite · ONEQ ETF",
  },
  {
    key: "sp500",
    name: "S&P 500",
    fredId: "SP500",
    source: "FRED, Federal Reserve Bank of St. Louis",
    tvSymbol: "AMEX:SPY",
    tvLabel: "S&P 500 · SPY ETF",
  },
  {
    key: "dow",
    name: "Dow Jones",
    fredId: "DJIA",
    source: "FRED, Federal Reserve Bank of St. Louis",
    tvSymbol: "AMEX:DIA",
    tvLabel: "Dow Jones · DIA ETF",
  },
  {
    // Live TradingView widget only: Coinbase doesn't allow its FRED data to be
    // reproduced without written permission, so there's no long-term Bitcoin data.
    key: "btc",
    name: "Bitcoin",
    source: "TradingView",
    tvSymbol: "COINBASE:BTCUSD",
    tvLabel: "Bitcoin · BTC/USD",
  },
];

// Assets with FRED data, for the stat cards and long-term charts.
export const FRED_ASSETS = ASSETS.filter((a): a is Asset & { fredId: string } => Boolean(a.fredId));
