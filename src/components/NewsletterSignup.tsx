"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { subscribe, type SubscribeState } from "@/app/actions/subscribe";

const initialState: SubscribeState = { status: "idle", message: "" };

// Newsletter signup form. "card" = full block (Newsletter page);
// "inline" = compact prompt at the bottom of other pages.
export default function NewsletterSignup({
  source,
  variant = "card",
}: {
  source: string; // which page the signup came from, for beehiiv stats
  variant?: "card" | "inline";
}) {
  const [state, formAction, pending] = useActionState(subscribe, initialState);
  const id = useId();
  const done = state.status === "success";

  const form = done ? (
    <p role="status" className="rounded-lg bg-accent-soft px-4 py-3 text-sm font-medium text-accent-hover">
      ✓ {state.message}
    </p>
  ) : (
    <form action={formAction} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={state.status === "error"}
          aria-describedby={`${id}-message`}
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-4 text-sm text-primary outline-none placeholder:text-muted focus:border-accent focus-visible:outline-none"
        />
        <input type="hidden" name="source" value={source} />
        {/* Spam trap: hidden from people, filled in by bots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button
          type="submit"
          disabled={pending}
          className="h-11 shrink-0 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p id={`${id}-message`} aria-live="polite" className="min-h-5 text-xs">
        {state.status === "error" ? (
          <span className="text-primary">{state.message}</span>
        ) : (
          <span className="text-muted">
            One email a week. Free, unsubscribe anytime, and we never sell your email.
          </span>
        )}
      </p>
    </form>
  );

  if (variant === "inline") {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <div className="gap-8 md:flex md:items-center">
          <div className="md:w-2/5">
            <h2 className="font-semibold tracking-tight">Get the Week Ahead in your inbox</h2>
            <p className="mt-1 text-sm text-muted">
              The dates and data that move markets, in plain English.{" "}
              <Link href="/newsletter" className="text-accent hover:text-accent-hover">
                Learn more
              </Link>
            </p>
          </div>
          <div className="mt-4 flex-1 md:mt-0">{form}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">Free weekly briefing</p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight">The Theta Decay Week Ahead</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Every week: the economic calendar for the days ahead, what the latest inflation,
        jobs and rates data mean, and any warning signs from the market risk gauges.
      </p>
      <div className="mt-5">{form}</div>
    </section>
  );
}
