// Converts official Eastern Time release times into the visitor's chosen zone.

// Minutes the zone is ahead of UTC at a given instant (e.g. New York in summer: -240).
function zoneOffsetMinutes(timeZone: string, instant: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - instant) / 60_000);
}

// The instant an Eastern Time wall-clock time happens ("2026-10-14", "08:30").
export function easternToInstant(date: string, timeET: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = timeET.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, hh, mm);
  // Use the offset in effect on that day (handles daylight saving).
  const offset = zoneOffsetMinutes("America/New_York", wall + 5 * 3_600_000);
  return wall - offset * 60_000;
}

// "8:30 AM EDT" in the chosen zone, plus a note if it lands on a different day.
export function formatReleaseTime(date: string, timeET: string, timeZone: string) {
  const instant = new Date(easternToInstant(date, timeET));
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(instant);
  const localDate = instant.toLocaleDateString("en-CA", { timeZone });
  const dayShift = localDate > date ? "next day" : localDate < date ? "previous day" : null;
  return { time, dayShift };
}
