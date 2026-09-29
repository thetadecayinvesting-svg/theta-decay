import { lineColor } from "@/lib/chartFormat";
import type { LineConfig, SeriesDetails } from "@/lib/charts";

// Drop-down "Details" for a chart: source, release, units, frequency, notes and
// a suggested citation for each data series, like the Notes box on FRED.
export default function SeriesDetailsPanel({
  id,
  lines,
  details,
}: {
  id: string;
  lines: LineConfig[];
  details: (SeriesDetails | null)[];
}) {
  const multi = lines.length > 1;

  return (
    <div id={id} className="mt-4 space-y-6 border-t border-border pt-5 text-sm">
      {lines.map((line, i) => {
        const d = details[i];
        if (!d) {
          return (
            <p key={line.key} className="text-muted">
              Details for {line.label} couldn&apos;t load right now. Please try again later.
            </p>
          );
        }
        return (
          <div key={line.key}>
            <div className="mb-3 flex items-start gap-2">
              {multi && (
                <span aria-hidden className="mt-2 h-0.5 w-4 shrink-0 rounded-full" style={{ background: lineColor(i) }} />
              )}
              <p className="font-medium text-primary">
                {d.title}{" "}
                {d.seriesId.startsWith("FINRA") ? null : (
                  <span className="font-normal text-muted">({d.seriesId})</span>
                )}
              </p>
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
              <Row label="Source">
                {d.sources.length > 0
                  ? d.sources.map((src, j) => (
                      <span key={src.name}>
                        {j > 0 && "; "}
                        <ExternalLink href={src.link}>{src.name}</ExternalLink>
                      </span>
                    ))
                  : "—"}
              </Row>
              <Row label="Release">
                {d.release ? <ExternalLink href={d.release.link}>{d.release.name}</ExternalLink> : "—"}
              </Row>
              <Row label="Units">{d.units}</Row>
              <Row label="Frequency">{d.frequency}</Row>
              {d.lastUpdated && <Row label="Last updated">{formatUpdated(d.lastUpdated)}</Row>}
            </dl>

            {d.notes && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-primary">Notes</h4>
                <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-line pr-2 leading-relaxed text-muted">
                  {d.notes}
                </p>
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-xs font-medium text-primary">Suggested citation</h4>
              <p className="mt-1 break-words text-xs leading-relaxed text-muted">{d.citation}</p>
            </div>

            <p className="mt-3 text-xs">
              <ExternalLink href={d.url}>
                {d.seriesId.startsWith("FINRA") ? "View on FINRA" : "View on FRED"}
              </ExternalLink>
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs font-medium leading-5 text-primary">{label}</dt>
      <dd className="leading-5 text-muted">{children}</dd>
    </>
  );
}

function ExternalLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
    >
      {children}
      <span aria-hidden> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

// "2026-07-30 10:09:19-05" → "Jul 30, 2026"
function formatUpdated(value: string) {
  const date = value.slice(0, 10);
  const d = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
