"use client";

import { useState } from "react";
import {
  EVENT_META,
  type CalendarEvent,
  type EventType,
} from "@/lib/events";

const TYPES = Object.keys(EVENT_META) as EventType[];

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

function Tags({ type }: { type: EventType }) {
  return (
    <>
      <TypeTag type={type} />
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
  // Today's events, or else the next upcoming date, get the violet highlight.
  const nextDate = visible[0]?.date;
  const nextUp = visible.filter((e) => e.date === nextDate);

  // Group the rest by month.
  const months = new Map<string, CalendarEvent[]>();
  for (const event of visible) {
    const key = event.date.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(event);
  }

  return (
    <div className="space-y-10">
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
              <span className="text-primary">{relative(daysBetween(today, nextDate))}</span>
            </p>
          </div>
          <div className="mt-5 space-y-6">
            {nextUp.map((event) => (
              <div key={event.type}>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="mr-1 text-xl font-semibold tracking-tight sm:text-2xl">
                    {event.title}
                  </h2>
                  <Tags type={event.type} />
                </div>
                <p className="mt-1.5 text-sm text-muted">{event.detail}</p>
                <p className="num mt-1 text-sm text-muted">{event.time}</p>
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
              const highlighted = event.date === nextDate;
              return (
                <li
                  key={`${event.date}-${event.type}`}
                  className={`flex items-center gap-5 border-l-4 px-5 py-4 transition-colors ${
                    highlighted
                      ? "border-l-accent bg-accent-soft"
                      : "border-l-transparent hover:bg-surface-hover"
                  }`}
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
                      <Tags type={event.type} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">{event.detail}</p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="num text-sm">{event.time}</div>
                    <div className={`text-xs ${highlighted ? "text-accent-hover" : "text-muted"}`}>
                      {relative(days)}
                    </div>
                  </div>
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
