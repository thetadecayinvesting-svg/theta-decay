"use client";

export type Range = { label: string; years: number }; // years 0 = all data

export const RANGES: Range[] = [
  { label: "1Y", years: 1 },
  { label: "5Y", years: 5 },
  { label: "10Y", years: 10 },
  { label: "Max", years: 0 },
];

// Segmented 1Y / 5Y / 10Y / Max buttons.
export default function RangeToggle({
  ranges = RANGES,
  value,
  onChange,
}: {
  ranges?: Range[];
  value: Range;
  onChange: (range: Range) => void;
}) {
  return (
    <div className="flex w-fit items-center gap-1 rounded-lg border border-border bg-surface p-1 text-sm">
      {ranges.map((r) => (
        <button
          key={r.label}
          onClick={() => onChange(r)}
          aria-pressed={value.label === r.label}
          className={`num rounded-lg px-3.5 py-1.5 transition-colors ${
            value.label === r.label
              ? "bg-accent-soft font-medium text-accent-hover"
              : "text-muted hover:text-primary"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
