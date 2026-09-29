"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "./SettingsProvider";
import { RANGE_IDS, THEMES, TIME_ZONES } from "@/lib/settings";

// Gear button + dropdown with the visitor's settings (saved in this browser).
// When accounts are added, a "Sign in" row can go at the top of this panel;
// the settings themselves already save through a swappable store.
export default function SettingsMenu() {
  const { settings, update } = useSettings();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      <button
        ref={button}
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="settings-panel"
        className={`grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-surface-hover hover:text-primary ${
          open ? "bg-surface-hover text-primary" : "text-muted"
        }`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>

      {open && (
        <div
          id="settings-panel"
          role="dialog"
          aria-label="Settings"
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] space-y-5 rounded-lg border border-border bg-surface p-5 shadow-2xl"
        >
          <h2 className="font-semibold tracking-tight">Settings</h2>

          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              Theme
            </legend>
            <div role="radiogroup" className="space-y-1.5">
              {THEMES.map((theme) => {
                const selected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ theme: theme.id })}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "border-accent bg-accent-soft font-medium text-accent-hover"
                        : "border-border text-primary hover:bg-surface-hover"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-4 w-4 rounded-full ring-2 ring-border"
                      style={{ background: theme.swatch }}
                    />
                    {theme.label}
                    {selected && <span className="ml-auto text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              Default chart range
            </legend>
            <div role="radiogroup" className="grid grid-cols-4 gap-1 rounded-lg border border-border p-1">
              {RANGE_IDS.map((range) => {
                const selected = settings.defaultRange === range;
                return (
                  <button
                    key={range}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ defaultRange: range })}
                    className={`num rounded-lg py-1.5 text-sm transition-colors ${
                      selected
                        ? "bg-accent-soft font-medium text-accent-hover"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="settings-timezone"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted"
            >
              Time zone for release times
            </label>
            <select
              id="settings-timezone"
              value={settings.timeZone}
              onChange={(e) => update({ timeZone: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
            >
              {TIME_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>

          <p className="border-t border-border pt-4 text-xs text-muted">
            Saved in this browser. No account needed.
          </p>
        </div>
      )}
    </div>
  );
}
