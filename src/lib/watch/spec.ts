import type { SelectedOption } from "@/lib/commerce/types";

/**
 * Visual description of a watch, used by the image renderer and the 3D model.
 *
 * `WatchStyle` is per product (with Shopify it lives in a `custom.watch_style`
 * JSON metafield). Case / dial / strap / size come from the selected variant's
 * options, so any Shopify variant can be drawn without extra data.
 */

export type CaseFinish = "steel" | "ink" | "sand";
export type DialTone = "ivory" | "ink" | "taupe" | "white";
export type StrapKind = "ivory-leather" | "ink-leather" | "taupe-suede" | "mesh" | "bracelet";
export type IndexStyle = "baton" | "roman" | "dot" | "minimal" | "numerals" | "none";
export type Complication = "none" | "date" | "small-seconds" | "chrono";

export type WatchStyle = {
  indices: IndexStyle;
  complication: Complication;
  /** Default case diameter in mm when there is no Size option */
  sizeMm: number;
  /** Show a 60-minute railway track around the dial edge */
  minuteTrack: boolean;
};

export type WatchSpec = WatchStyle & {
  finish: CaseFinish;
  dial: DialTone;
  strap: StrapKind;
};

export type Palette = { hi: string; mid: string; lo: string; edge: string };

export const CASE_PALETTE: Record<CaseFinish, Palette> = {
  steel: { hi: "#f4f3ef", mid: "#bdbbb5", lo: "#77756f", edge: "#4a4845" },
  ink: { hi: "#5b5854", mid: "#2c2a28", lo: "#121110", edge: "#050505" },
  sand: { hi: "#f1e8da", mid: "#cbbba6", lo: "#8d7d69", edge: "#5d5244" },
};

export const DIAL_PALETTE: Record<DialTone, { base: string; center: string; print: string; accent: string }> = {
  ivory: { base: "#ece5d8", center: "#f6f1e8", print: "#171615", accent: "#8d7d69" },
  ink: { base: "#141312", center: "#26241f", print: "#f4f0e8", accent: "#beb4a7" },
  taupe: { base: "#b3a898", center: "#c9bfb1", print: "#171615", accent: "#f4f0e8" },
  white: { base: "#f0efeb", center: "#ffffff", print: "#171615", accent: "#77756f" },
};

export const STRAP_PALETTE: Record<Exclude<StrapKind, "mesh" | "bracelet">, { base: string; hi: string; lo: string; stitch: string }> = {
  "ivory-leather": { base: "#e4dccd", hi: "#f1ebe0", lo: "#bfb4a3", stitch: "#f8f5ef" },
  "ink-leather": { base: "#1f1d1b", hi: "#35322f", lo: "#0b0a0a", stitch: "#4a4744" },
  "taupe-suede": { base: "#a89c8d", hi: "#bcb1a3", lo: "#857a6d", stitch: "#cfc6ba" },
};

/** Option value → spec token. Keys are lower-cased Shopify option values. */
const FINISH_BY_VALUE: Record<string, CaseFinish> = { steel: "steel", ink: "ink", sand: "sand" };
const DIAL_BY_VALUE: Record<string, DialTone> = { ivory: "ivory", ink: "ink", taupe: "taupe", white: "white" };
const STRAP_BY_VALUE: Record<string, StrapKind> = {
  "ivory leather": "ivory-leather",
  "ink leather": "ink-leather",
  "taupe suede": "taupe-suede",
  "milanese mesh": "mesh",
  "link bracelet": "bracelet",
};

export const DEFAULT_STYLE: WatchStyle = {
  indices: "baton",
  complication: "none",
  sizeMm: 38,
  minuteTrack: false,
};

export function specFromOptions(style: WatchStyle, options: SelectedOption[]): WatchSpec {
  const get = (name: string) =>
    options.find((o) => o.name.toLowerCase() === name)?.value.toLowerCase().trim() ?? "";
  const size = parseInt(get("size"), 10);
  return {
    ...style,
    sizeMm: Number.isFinite(size) ? size : style.sizeMm,
    finish: FINISH_BY_VALUE[get("case")] ?? "steel",
    dial: DIAL_BY_VALUE[get("dial")] ?? "ivory",
    strap: STRAP_BY_VALUE[get("strap")] ?? "ink-leather",
  };
}

/** Stable, URL-safe key for a spec, used in render URLs. */
export function specKey(spec: WatchSpec): string {
  return [spec.finish, spec.dial, spec.strap, spec.sizeMm].join("_");
}

export function parseSpecKey(style: WatchStyle, key: string): WatchSpec | null {
  const [finish, dial, strap, size] = key.split("_");
  if (!(finish in CASE_PALETTE) || !(dial in DIAL_PALETTE)) return null;
  const strapOk = strap === "mesh" || strap === "bracelet" || strap in STRAP_PALETTE;
  if (!strapOk) return null;
  const sizeMm = parseInt(size, 10);
  return {
    ...style,
    finish: finish as CaseFinish,
    dial: dial as DialTone,
    strap: strap as StrapKind,
    sizeMm: Number.isFinite(sizeMm) && sizeMm >= 28 && sizeMm <= 44 ? sizeMm : style.sizeMm,
  };
}
