// The four market assets, shared by server and browser code.
// Free TradingView widgets can't show the real Nasdaq/S&P/Dow indices, so the
// live widgets use ETFs that track them (labelled as such). The long-term
// charts use the real index levels from FRED.

export type Asset = {
  key: "nasdaq" | "sp500" | "dow" | "btc";
  name: string;
  fredId: string;
  source: string; // who publishes the FRED series
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
    key: "btc",
    name: "Bitcoin",
    fredId: "CBBTCUSD",
    source: "FRED, Federal Reserve Bank of St. Louis; Coinbase",
    tvSymbol: "COINBASE:BTCUSD",
    tvLabel: "Bitcoin · BTC/USD",
  },
];
