"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EVENT_GUIDES,
  EVENT_META,
  type CalendarEvent,
  type EventType,
} from "@/lib/events";
import { releaseHref, releasePageFor } from "@/lib/releasePages";
import { TIME_ZONES } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { easternToInstant, formatReleaseTime } from "@/lib/timezone";
import AddToCalendar from "./AddToCalendar";
import Countdown from "./Countdown";
import { useSettings } from "./SettingsProvider";

// Subscribe links for the whole calendar feed (/calendar.ics).
const FEED_WEBCAL = `${SITE_URL.replace(/^https:/, "webcal:")}/calendar.ics`;
const FEED_GOOGLE = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(FEED_WEBCAL)}`;

// SEP is shown with its FOMC meeting, so it has no filter of its own.
const TYPES = (Object.keys(EVENT_META) as EventType[]).filter((t) => t !== "SEP");

function parse(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

function daysBetween(from: string, to: string) {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000);
}

function relative(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

function format(date: string, options: Intl.DateTimeFormatOptions) {
  return parse(date).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

function TypeTag({ type }: { type: EventType }) {
  return (
    <span className="rounded-lg border border-border px-2 py-0.5 text-xs font-medium text-muted">
      {EVENT_META[type].label}
    </span>
  );
}

function HighImpactBadge() {
  return (
    <span className="rounded-lg bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-hover">
      High impact
    </span>
  );
}

// Matches the "Add to calendar" button next to it.
const ACTION_BUTTON =
  "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-hover";

const BookIcon = () => (
  <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <path d="M10 5.5C8.5 4.3 6.3 4 3.5 4v11.5c2.8 0 5 .3 6.5 1.5m0-11.5c1.5-1.2 3.7-1.5 6.5-1.5v11.5c-2.8 0-5 .3-6.5 1.5m0-11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const ListIcon = () => (
  <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="4" cy="5.5" r="1" fill="currentColor" />
    <circle cx="4" cy="10" r="1" fill="currentColor" />
    <circle cx="4" cy="14.5" r="1" fill="currentColor" />
  </svg>
);

function Tags({ type, withSep }: { type: EventType; withSep?: boolean }) {
  return (
    <>
      <TypeTag type={type} />
      {withSep && <TypeTag type="SEP" />}
      {EVENT_META[type].highImpact && <HighImpactBadge />}
    </>
  );
}

export default function CalendarView({
  events,
  today,
}: {
  events: CalendarEvent[];
  today: string;
}) {
  const { settings } = useSettings();
  const [active, setActive] = useState<Set<EventType>>(new Set(TYPES));

  const toggle = (type: EventType) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const visible = events.filter((e) => active.has(e.type));
  // The soonest date's events go in the "Next up" card; the list shows the rest.
  const nextDate = visible[0]?.date;
  const nextUp = visible.filter((e) => e.date === nextDate);
  const later = visible.filter((e) => e.date !== nextDate);
  const countdownTarget = nextUp[0] ? easternToInstant(nextUp[0].date, nextUp[0].timeET) : 0;

  // Group the rest by month.
  const months = new Map<string, CalendarEvent[]>();
  for (const event of later) {
    const key = event.date.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(event);
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Upcoming events</h2>
        <p className="mt-1 text-sm text-muted">
        Times shown in{" "}
        <span className="text-primary">
          {TIME_ZONES.find((z) => z.id === settings.timeZone)?.label ?? settings.timeZone}
        </span>
        . Change it in Settings.
        </p>
        <p className="mt-2 text-sm text-muted">
          Subscribe to every event, auto-updating:{" "}
          <a href={FEED_GOOGLE} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:text-accent-hover">
            Google Calendar
          </a>{" "}
          ·{" "}
          <a href={FEED_WEBCAL} className="font-medium text-accent hover:text-accent-hover">
            Apple / Outlook
          </a>
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted">
          Show
        </span>
        {TYPES.map((type) => {
          const on = active.has(type);
          return (
            <button
              key={type}
              onClick={() => toggle(type)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm transition-colors ${
                on
                  ? "border-border bg-surface font-medium text-primary hover:bg-surface-hover"
                  : "border-dashed border-border text-muted hover:text-primary"
              }`}
            >
              <span aria-hidden className={`w-3 text-accent ${on ? "" : "invisible"}`}>
                ✓
              </span>
              {EVENT_META[type].label}
            </button>
          );
        })}
        {active.size < TYPES.length && (
          <button
            onClick={() => setActive(new Set(TYPES))}
            className="px-2 text-sm text-accent hover:text-accent-hover hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Next up */}
      {nextDate && (
        <section className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              {nextDate === today ? "Today" : "Next up"}
            </p>
            <p className="num text-sm text-muted">
              {format(nextDate, { weekday: "long", month: "long", day: "numeric" })}
              {" · "}
              <span className="font-medium text-primary">
                <Countdown target={countdownTarget} fallback={relative(daysBetween(today, nextDate))} />
              </span>
            </p>
          </div>
          <div className="mt-5 space-y-6">
            {nextUp.map((event) => (
              <div key={event.type} id={`event-${event.date}-${event.type}`} className="rounded-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="mr-1 text-xl font-semibold tracking-tight sm:text-2xl">
                    {event.title}
                  </h2>
                  <Tags type={event.type} withSep={event.withSep} />
                </div>
                <p className="mt-1.5 text-sm text-muted">{event.detail}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  {EVENT_GUIDES[event.type].summary}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <p className="num mr-1 text-sm text-muted">
                    <ReleaseTime event={event} timeZone={settings.timeZone} />
                  </p>
                  <AddToCalendar event={event} />
                  <Link href={EVENT_GUIDES[event.type].href} className={ACTION_BUTTON}>
                    <BookIcon />
                    Learn more
                  </Link>
                  {releasePageFor(event.type) && (
                    <Link href={releaseHref(releasePageFor(event.type)!.slug)} className={ACTION_BUTTON}>
                      <ListIcon />
                      All release dates
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Month groups */}
      {[...months.entries()].map(([month, items]) => (
        <section key={month}>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            {format(`${month}-01`, { month: "long", year: "numeric" })}
          </h3>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface font-table">
            {items.map((event) => {
              const days = daysBetween(today, event.date);
              return (
                <li
                  key={`${event.date}-${event.type}`}
                  id={`event-${event.date}-${event.type}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-hover sm:gap-5"
                >
                  <div className="w-11 shrink-0 text-center">
                    <div className="text-[11px] font-medium uppercase text-muted">
                      {format(event.date, { weekday: "short" })}
                    </div>
                    <div className="num text-lg font-semibold leading-tight">
                      {format(event.date, { day: "numeric" })}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mr-1 font-medium">{event.title}</span>
                      <Tags type={event.type} withSep={event.withSep} />
                      <Link
                        href={EVENT_GUIDES[event.type].href}
                        aria-label={`What is the ${event.title}?`}
                        title={EVENT_GUIDES[event.type].summary}
                        className="grid h-5 w-5 place-items-center rounded-full border border-border text-[11px] text-muted hover:border-accent hover:text-accent"
                      >
                        ?
                      </Link>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">{event.detail}</p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="num text-sm">
                      <ReleaseTime event={event} timeZone={settings.timeZone} />
                    </div>
                    <div className="text-xs text-muted">{relative(days)}</div>
                  </div>
                  <AddToCalendar event={event} compact />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {visible.length === 0 && (
        <p className="text-sm text-muted">No events match the selected filters.</p>
      )}
    </div>
  );
}

// Release time in the visitor's chosen time zone.
function ReleaseTime({ event, timeZone }: { event: CalendarEvent; timeZone: string }) {
  const { time, dayShift } = formatReleaseTime(event.date, event.timeET, timeZone);
  return (
    <>
      {time}
      {dayShift && <span className="text-muted"> ({dayShift})</span>}
    </>
  );
}
