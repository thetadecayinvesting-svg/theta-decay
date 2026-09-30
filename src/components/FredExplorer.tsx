"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SearchIcon } from "./SearchBox";
import type { SeriesSearchResult } from "@/lib/fred";

// Search box for adding any FRED series to the page as a chart.
export default function FredExplorer({
  addedIds,
  onAdd,
  disabled,
}: {
  addedIds: string[];
  onAdd: (id: string) => void;
  disabled?: boolean; // e.g. the visitor has reached the chart limit
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SeriesSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const latest = useRef(0);

  // Search FRED once typing pauses for a moment.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const requestId = ++latest.current;
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/fred/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (requestId !== latest.current) return; // a newer search has started
        if (!res.ok) throw new Error(data.error ?? "Search failed.");
        setResults(data.results);
        setActive(0);
        setStatus("idle");
        setMessage(data.results.length ? "" : `No FRED series match "${q}".`);
      } catch (err) {
        if (requestId !== latest.current) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Search failed.");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = query.trim().length >= 2;
  const shown = hasQuery ? results : [];

  const add = (id: string) => {
    if (disabled || addedIds.includes(id)) return;
    onAdd(id);
    setQuery("");
    setResults([]);
    setMessage("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (shown.length ? (i + 1) % shown.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (shown.length ? (i - 1 + shown.length) % shown.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = shown[active];
      // Also accept an exact series ID typed directly, e.g. "HOUST".
      if (pick) add(pick.id);
      else if (/^[A-Za-z0-9_.]{2,40}$/.test(query.trim())) add(query.trim().toUpperCase());
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 focus-within:border-accent">
        <span className="text-muted">
          <SearchIcon />
        </span>
        <input
          type="search"
          role="combobox"
          aria-label="Search all FRED data series"
          aria-expanded={shown.length > 0}
          aria-controls={listId}
          aria-activedescendant={shown[active] ? `${listId}-${shown[active].id}` : undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={
            disabled ? "Chart limit reached. Remove one to add another." : 'Search FRED, e.g. "housing starts", "oil prices" or "M2"'
          }
          className="h-11 w-full min-w-0 bg-transparent text-sm text-primary outline-none placeholder:text-muted focus-visible:outline-none disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden"
        />
        {status === "loading" && hasQuery && <span className="shrink-0 text-xs text-muted">Searching…</span>}
      </div>

      {hasQuery && message && (
        <p role="status" className="text-sm text-muted">
          {message}
        </p>
      )}

      {shown.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="FRED search results"
          className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface"
        >
          {shown.map((r, i) => {
            const added = addedIds.includes(r.id);
            return (
              <li
                key={r.id}
                id={`${listId}-${r.id}`}
                role="option"
                aria-selected={i === active}
                aria-disabled={added}
                onMouseEnter={() => setActive(i)}
                onClick={() => add(r.id)}
                className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-3 ${
                  i === active ? "bg-accent-soft" : ""
                } ${added ? "cursor-default opacity-60" : ""}`}
              >
                <div className="min-w-0">
                  <div className={`truncate text-sm font-medium ${i === active ? "text-accent-hover" : "text-primary"}`}>
                    {r.title}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {r.id} · {r.frequency} · {r.units}
                    {r.seasonalAdjustment && r.seasonalAdjustment !== "NA" ? ` · ${r.seasonalAdjustment}` : ""} ·{" "}
                    {r.start.slice(0, 4)}–{r.end.slice(0, 4)}
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-accent">{added ? "Added" : "+ Add"}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
