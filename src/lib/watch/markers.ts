import type { WatchSpec } from "./spec";

/**
 * Applied (metal) hour markers, in units of the dial radius. Shared by the SVG
 * renderer and the 3D model so both place them identically.
 */
export type Marker =
  | { kind: "bar"; deg: number; r: number; len: number; w: number; dx: number }
  | { kind: "dot"; deg: number; r: number; size: number };

/** Hours whose marker is replaced by a complication. */
export function skippedHours(spec: WatchSpec) {
  const skip = new Set<number>();
  if (spec.complication === "date") skip.add(3);
  if (spec.complication === "small-seconds") skip.add(6);
  if (spec.complication === "chrono") {
    skip.add(3);
    skip.add(9);
  }
  return skip;
}

export function appliedMarkers(spec: WatchSpec): Marker[] {
  const skip = skippedHours(spec);
  const r = spec.minuteTrack ? 0.86 : 0.9;
  const out: Marker[] = [];
  for (let h = 0; h < 12; h++) {
    const hour = h === 0 ? 12 : h;
    if (skip.has(hour)) continue;
    const deg = h * 30;
    const bar = (len: number, w: number, dx = 0) => out.push({ kind: "bar", deg, r, len, w, dx });
    switch (spec.indices) {
      case "baton":
        if (hour === 12) {
          bar(0.2, 0.034, -0.028);
          bar(0.2, 0.034, 0.028);
        } else bar(0.16, 0.036);
        break;
      case "minimal":
        if (hour % 3 === 0) bar(hour === 12 ? 0.18 : 0.12, 0.03);
        break;
      case "dot":
        if (hour % 3 === 0) bar(0.12, 0.04);
        else out.push({ kind: "dot", deg, r: r - 0.04, size: 0.032 });
        break;
      case "numerals":
        if (hour % 3 !== 0) bar(0.1, 0.026);
        break;
    }
  }
  return out;
}
