"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Where the visitor is: city, coordinates and time zone. Starts from the
 * browser's time zone (instant, offline) and is refined by the platform's IP
 * geolocation via /api/visitor when available. Fetched once per session.
 */
export type Visitor = {
  city: string;
  latitude: number | null;
  longitude: number | null;
  timeZone: string;
};

const KEY = "ocia:visitor";
let state: Visitor | null = null;
let requested = false;
const listeners = new Set<() => void>();

function set(next: Visitor) {
  state = next;
  listeners.forEach((l) => l());
}

/** "America/New_York" → "New York" */
function cityFromTimeZone(tz: string) {
  const last = tz.split("/").pop() ?? tz;
  return last.replace(/_/g, " ");
}

function fromBrowser(): Visitor {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  return { city: cityFromTimeZone(timeZone), latitude: null, longitude: null, timeZone };
}

function load() {
  if (requested) return;
  requested = true;
  try {
    const cached = sessionStorage.getItem(KEY);
    if (cached) {
      set(JSON.parse(cached) as Visitor);
      return;
    }
  } catch {
    /* storage unavailable */
  }
  set(fromBrowser());
  fetch("/api/visitor")
    .then((r) => (r.ok ? r.json() : null))
    .then((geo: { city: string | null; latitude: number | null; longitude: number | null; timeZone: string | null } | null) => {
      const base = fromBrowser();
      const next: Visitor = {
        city: geo?.city || base.city,
        latitude: geo?.latitude ?? null,
        longitude: geo?.longitude ?? null,
        // The device clock is the visitor's truth; the IP zone is only a fallback.
        timeZone: base.timeZone || geo?.timeZone || "UTC",
      };
      set(next);
      try {
        sessionStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
    })
    .catch(() => {});
}

export function useVisitor(): Visitor | null {
  const v = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => null,
  );
  useEffect(load, []);
  return v;
}

export function formatCoordinates(lat: number, lon: number) {
  const f = (n: number, pos: string, neg: string) => `${Math.abs(n).toFixed(4)}° ${n >= 0 ? pos : neg}`;
  return `${f(lat, "N", "S")}, ${f(lon, "E", "W")}`;
}

/** "GMT+5" style offset, used when coordinates aren't known. */
export function formatOffset(timeZone: string) {
  try {
    const part = new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return part?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}
