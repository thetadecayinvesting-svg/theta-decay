"use client";

import { useEffect, useRef, useState } from "react";
import { googleCalendarUrl, icsCalendar } from "@/lib/calendarExport";
import type { CalendarEvent } from "@/lib/events";

const CalendarIcon = () => (
  <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 8.5h14M7 3v3M13 3v3M10 11v4M8 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Button + small menu: add one event to Google Calendar, or download an .ics
// file for Apple Calendar / Outlook.
export default function AddToCalendar({
  event,
  compact = false,
}: {
  event: CalendarEvent;
  compact?: boolean; // icon-only (for list rows)
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const downloadIcs = () => {
    const blob = new Blob([icsCalendar([event], event.title)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.type.toLowerCase()}-${event.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div ref={wrapper} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={compact ? `Add ${event.title} to your calendar` : undefined}
        className={
          compact
            ? "grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-primary"
            : "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-hover"
        }
      >
        <CalendarIcon />
        {!compact && "Add to calendar"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-border bg-surface p-1 font-sans shadow-2xl"
        >
          <a
            role="menuitem"
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-primary hover:bg-surface-hover"
          >
            Google Calendar ↗
          </a>
          <button
            role="menuitem"
            onClick={downloadIcs}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-surface-hover"
          >
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
