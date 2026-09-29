"use client";

import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import { searchIndex, type SearchItem } from "@/lib/searchIndex";

// Go to a search result. For "/page#chart-id" links, wait for the element to
// appear (it may be on another page), scroll to it and flash it briefly.
function useJumpTo() {
  const router = useRouter();
  return (href: string) => {
    const [path, hash] = href.split("#");
    if (!hash) {
      router.push(path);
      return;
    }
    router.push(href, { scroll: false });
    const started = performance.now();
    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (el && window.location.pathname === (path || "/")) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.remove("flash-target");
        void el.offsetWidth; // restart the animation if it's already applied
        el.classList.add("flash-target");
        setTimeout(() => el.classList.remove("flash-target"), 1700);
      } else if (performance.now() - started < 5000) {
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
  };
}

const SearchIcon = () => (
  <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="m13.5 13.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const SearchBox = forwardRef<
  HTMLInputElement,
  {
    items: SearchItem[];
    autoFocus?: boolean;
    showShortcutHint?: boolean;
    onDone?: () => void; // called after a result is chosen or Escape is pressed
  }
>(function SearchBox({ items, autoFocus, showShortcutHint, onDone }, ref) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const listId = useId();
  const jumpTo = useJumpTo();

  const groups = useMemo(() => searchIndex(items, query), [items, query]);
  const flat = groups.flatMap((g) => g.items);
  const showPanel = open && query.trim().length > 0;

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const choose = (item: SearchItem) => {
    setOpen(false);
    setQuery("");
    (document.activeElement as HTMLElement | null)?.blur();
    jumpTo(item.href);
    onDone?.();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      const item = flat[active] ?? flat[0];
      if (item) {
        e.preventDefault();
        choose(item);
      }
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else {
        e.currentTarget.blur();
        onDone?.();
      }
      setOpen(false);
    }
  };

  let index = -1;
  return (
    <div ref={wrapper} className="relative w-full">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 focus-within:border-accent">
        <span className="text-muted">
          <SearchIcon />
        </span>
        <input
          ref={ref}
          type="search"
          role="combobox"
          aria-label="Search charts, data and events"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && flat[active] ? `${listId}-${flat[active].id}` : undefined}
          autoFocus={autoFocus}
          value={query}
          placeholder="Search charts, data, events…"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-9 w-full min-w-0 bg-transparent text-sm text-primary outline-none focus-visible:outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {showShortcutHint && !query && (
          <kbd className="hidden rounded border border-border px-1.5 text-[11px] text-muted lg:block">
            /
          </kbd>
        )}
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-surface p-2 shadow-2xl md:min-w-[26rem]"
        >
          {groups.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">
              No matches for &ldquo;{query}&rdquo;. Try &ldquo;inflation&rdquo;, &ldquo;VIX&rdquo;
              or &ldquo;FOMC&rdquo;.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.group} role="group" aria-label={group.group} className="py-1">
                <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  index += 1;
                  const i = index;
                  const isActive = i === active;
                  return (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                      onClick={() => choose(item)}
                      className={`cursor-pointer rounded-lg px-3 py-2 ${isActive ? "bg-accent-soft" : ""}`}
                    >
                      <div
                        className={`text-sm font-medium ${isActive ? "text-accent-hover" : "text-primary"}`}
                      >
                        {item.title}
                      </div>
                      <div className="truncate text-xs text-muted">{item.subtitle}</div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

export default SearchBox;
export { SearchIcon };
