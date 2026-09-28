"use client";

import { useEffect, useState } from "react";
import { formatCoordinates, formatOffset, useVisitor } from "@/lib/visitor";

/** The visitor's local time, ticking. Renders a stable placeholder until mounted. */
export function LiveClock({ seconds = true, className }: { seconds?: boolean; className?: string }) {
  const visitor = useVisitor();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const text =
    now && visitor
      ? new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: seconds ? "2-digit" : undefined,
          hour12: false,
          timeZone: visitor.timeZone,
        }).format(now)
      : seconds
        ? "--:--:--"
        : "--:--";
  return (
    <time className={className} suppressHydrationWarning style={{ fontVariantNumeric: "tabular-nums" }}>
      {text}
    </time>
  );
}

/** The visitor's city, e.g. "Lahore". */
export function VisitorCity({ className, fallback = "Local time" }: { className?: string; fallback?: string }) {
  const visitor = useVisitor();
  return <span className={className}>{visitor?.city ?? fallback}</span>;
}

/** The visitor's coordinates, or their UTC offset when coordinates aren't available. */
export function VisitorCoordinates({ className }: { className?: string }) {
  const visitor = useVisitor();
  if (!visitor) return <span className={className}>&nbsp;</span>;
  return (
    <span className={className}>
      {visitor.latitude !== null && visitor.longitude !== null
        ? formatCoordinates(visitor.latitude, visitor.longitude)
        : formatOffset(visitor.timeZone)}
    </span>
  );
}
