"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86_400), h: Math.floor((s % 86_400) / 3600), m: Math.floor((s % 3600) / 60), sec: s % 60 };
}

// Live countdown to an event, e.g. "1d 4h 12m" (seconds shown in the final hour).
// Until it mounts in the browser it shows `fallback`, so server and browser match.
export default function Countdown({ target, fallback }: { target: number; fallback: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  if (now === null) return <>{fallback}</>;
  const left = target - now;
  if (left <= 0) return <>Now</>;
  const { d, h, m, sec } = parts(left);
  const text =
    d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m ${String(sec).padStart(2, "0")}s`;
  return (
    <span className="num" role="timer" aria-label={`Starts in ${text}`}>
      in {text}
    </span>
  );
}
