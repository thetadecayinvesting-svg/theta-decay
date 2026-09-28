import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, Sora } from "next/font/google";
import Nav from "@/components/Nav";
import TickerTape from "@/components/TickerTape";
import "./globals.css";

// Main UI
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headlines
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// Tables
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Theta Decay Investing — Economic Calendar, Indicators & Markets",
  description:
    "Upcoming FOMC, CPI, jobs, GDP and PCE release dates, plus live macro charts from FRED.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <TickerTape />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted sm:px-6">
            Data: FRED®, Federal Reserve Bank of St. Louis; FINRA Margin
            Statistics; FOMC schedule from
            federalreserve.gov. For information only — not investment advice.
          </div>
        </footer>
      </body>
    </html>
  );
}
