"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import NavDrawer from "./NavDrawer";
import SearchBox, { SearchIcon } from "./SearchBox";
import SettingsMenu from "./SettingsMenu";
import type { SearchItem } from "@/lib/searchIndex";

// Top bar on every page: menu (left), logo + search (center), settings (right).
// On phones the search collapses to an icon that opens a full-width search row.
export default function SiteHeader({ searchItems }: { searchItems: SearchItem[] }) {
  const [mobileSearch, setMobileSearch] = useState(false);
  const desktopInput = useRef<HTMLInputElement>(null);

  // Pressing "/" anywhere (outside a text field) jumps to search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      const input = desktopInput.current;
      if (input && input.offsetParent !== null) input.focus();
      else setMobileSearch(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:gap-4">
        <div className="justify-self-start">
          <NavDrawer />
        </div>

        <div className="flex min-w-0 items-center justify-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-semibold text-on-accent">
              Θ
            </span>
            <span className="whitespace-nowrap font-display text-[15px] font-semibold tracking-tight sm:text-base">
              Theta Decay Investing
            </span>
          </Link>
          <div className="hidden w-80 md:block lg:w-96">
            <SearchBox ref={desktopInput} items={searchItems} showShortcutHint />
          </div>
        </div>

        <div className="flex items-center gap-1 justify-self-end">
          <button
            onClick={() => setMobileSearch((v) => !v)}
            aria-label={mobileSearch ? "Close search" : "Search"}
            aria-expanded={mobileSearch}
            className={`grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-surface-hover hover:text-primary md:hidden ${
              mobileSearch ? "bg-surface-hover text-primary" : "text-muted"
            }`}
          >
            <SearchIcon />
          </button>
          <SettingsMenu />
        </div>
      </div>

      {mobileSearch && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <SearchBox items={searchItems} autoFocus onDone={() => setMobileSearch(false)} />
        </div>
      )}
    </header>
  );
}
