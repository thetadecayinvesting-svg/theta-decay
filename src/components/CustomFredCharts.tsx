"use client";

import { useCallback, useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import FredExplorer from "./FredExplorer";
import type { ChartResult } from "@/lib/series";

const STORAGE_KEY = "theta-decay:custom-series";
const MAX_CHARTS = 8;

type Entry =
  | { id: string; status: "loading" }
  | { id: string; status: "ready"; chart: ChartResult }
  | { id: string; status: "error"; error: string };

function readSaved(): string[] {
  try {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string").slice(0, MAX_CHARTS) : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked: the charts just won't be remembered.
  }
}

async function fetchChart(id: string): Promise<Entry> {
  try {
    const res = await fetch(`/api/fred/series?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) return { id, status: "error", error: data.error ?? "Couldn't load this series." };
    return { id, status: "ready", chart: data.chart };
  } catch {
    return { id, status: "error", error: "Couldn't load this series. Check your connection." };
  }
}

// "Explore any FRED series": the visitor's added charts, remembered in this browser.
export function useCustomCharts() {
  const [entries, setEntries] = useState<Entry[]>([]);

  const load = useCallback(async (id: string) => {
    const entry = await fetchChart(id);
    setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)));
  }, []);

  // Bring back the charts this visitor added last time.
  useEffect(() => {
    const restore = async () => {
      const saved = readSaved();
      if (saved.length === 0) return;
      setEntries(saved.map((id) => ({ id, status: "loading" })));
      await Promise.all(saved.map(load));
    };
    void restore();
  }, [load]);

  const add = (id: string) => {
    setEntries((prev) => {
      if (prev.some((e) => e.id === id) || prev.length >= MAX_CHARTS) return prev;
      const next: Entry[] = [...prev, { id, status: "loading" }];
      save(next.map((e) => e.id));
      return next;
    });
    void load(id);
  };

  const remove = (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next.map((e) => e.id));
      return next;
    });
  };

  return { entries, add, remove };
}

type CustomCharts = ReturnType<typeof useCustomCharts>;

// Heading + search box (shown at the top of Economic Indicators).
export function FredSearchSection({ custom }: { custom: CustomCharts }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Explore any FRED series</h2>
        <p className="mt-1 text-sm text-muted">
          Search more than 800,000 data series from the Federal Reserve Bank of St. Louis and
          add them as charts. Charts you add are saved in this browser.
        </p>
      </div>
      <FredExplorer
        addedIds={custom.entries.map((e) => e.id)}
        onAdd={custom.add}
        disabled={custom.entries.length >= MAX_CHARTS}
      />
    </section>
  );
}

// The added charts, following the page's time range.
export function CustomChartsGrid({
  custom,
  cutoff,
  spanYears,
}: {
  custom: CustomCharts;
  cutoff: string; // "" = show everything loaded
  spanYears: number;
}) {
  const { entries, remove } = custom;
  if (entries.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Your charts</h2>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {entries.map((entry) =>
          entry.status === "ready" ? (
            <ChartCard
              key={entry.id}
              chart={entry.chart}
              rows={cutoff ? entry.chart.rows.filter((r) => r.date >= cutoff) : entry.chart.rows}
              spanYears={spanYears}
              onRemove={() => remove(entry.id)}
            />
          ) : (
            <div
              key={entry.id}
              className="flex min-h-40 flex-col justify-between rounded-lg border border-border bg-surface p-6"
            >
              <div>
                <h3 className="font-medium">{entry.id}</h3>
                <p className="mt-2 text-sm text-muted">
                  {entry.status === "loading" ? "Loading from FRED…" : entry.error}
                </p>
              </div>
              <button
                onClick={() => remove(entry.id)}
                className="mt-4 self-start text-xs font-medium text-muted hover:text-primary"
              >
                Remove
              </button>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
