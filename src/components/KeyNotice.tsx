// Shown when the FRED API key hasn't been added to .env.local yet.
export default function KeyNotice({ what }: { what: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">
      <p className="font-medium text-primary">FRED API key needed</p>
      <p className="mt-1">
        {what} come from FRED. Add your free key to the{" "}
        <code className="rounded-lg bg-surface-hover px-1.5 py-0.5 text-primary">
          .env.local
        </code>{" "}
        file in the project folder as{" "}
        <code className="rounded-lg bg-surface-hover px-1.5 py-0.5 text-primary">
          FRED_API_KEY=your-key
        </code>
        , then restart the site.
      </p>
    </div>
  );
}
