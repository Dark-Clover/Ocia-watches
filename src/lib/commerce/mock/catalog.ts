import type { WatchStyle } from "@/lib/watch/spec";
import type { Gender, ProductSpec } from "../types";

/**
 * Mock catalogue source — shaped like what a merchant would enter in Shopify
 * admin: product, options, variant pricing, tags and metafields.
 * `buildProducts()` in ./data.ts expands this into full `Product` objects.
 */

export type OptionDef = { name: string; values: { name: string; swatch?: string }[] };

export type MockProductDef = {
  handle: string;
  title: string;
  subtitle: string;
  gender: Gender;
  description: string[];
  price: number;
  /** Per option-value price adjustments, e.g. { "Link bracelet": 9000 } */
  surcharge?: Record<string, number>;
  options: OptionDef[];
  /** Option-value combinations that are sold out, e.g. ["Ink", "Taupe"] */
  soldOut?: string[][];
  style: WatchStyle;
  /** Second watch for paired sets */
  pairStyle?: WatchStyle;
  specs: ProductSpec[];
  notes: string[];
  tags: string[];
  createdAt: string;
  bestSellingRank: number;
};

export const CURRENCY = "PKR";

const SW = {
  Steel: "#c9c7c1",
  Ink: "#1f1d1b",
  Sand: "#cdbda8",
  Ivory: "#ece5d8",
  Taupe: "#b3a898",
  White: "#f7f6f2",
  "Ivory leather": "#e4dccd",
  "Ink leather": "#1f1d1b",
  "Taupe suede": "#a89c8d",
  "Milanese mesh": "#bdbbb5",
  "Link bracelet": "#9d9b96",
} as const;

const opt = (name: string, values: (keyof typeof SW | string)[]): OptionDef => ({
  name,
  values: values.map((v) => ({ name: v, swatch: (SW as Record<string, string>)[v] })),
});

export const MOCK_PRODUCTS: MockProductDef[] = [
  {
    handle: "deodar",
    title: "Deodar",
    subtitle: "Three hands, date. The everyday piece.",
    gender: "men",
    description: [
      "A 40 mm case with a brushed flank and polished bezel, applied batons and a date window set flush at three.",
      "Built to be worn without thinking about it — then noticed, quietly, every time you check the hour.",
    ],
    price: 58000,
    surcharge: { "Link bracelet": 9000, "40 mm": 2000 },
    options: [
      opt("Case", ["Steel", "Ink"]),
      opt("Dial", ["Ink", "Ivory"]),
      opt("Size", ["36 mm", "40 mm"]),
      opt("Strap", ["Ink leather", "Ivory leather", "Link bracelet"]),
    ],
    soldOut: [["Ink", "Ivory", "36 mm"]],
    style: { indices: "baton", complication: "date", sizeMm: 40, minuteTrack: true },
    specs: [
      { label: "Case", value: "316L stainless steel, brushed and polished" },
      { label: "Diameter", value: "36 or 40 mm" },
      { label: "Thickness", value: "9.8 mm" },
      { label: "Crystal", value: "Sapphire, anti-reflective inner coating" },
      { label: "Movement", value: "Automatic, 38-hour power reserve" },
      { label: "Water resistance", value: "5 ATM" },
      { label: "Strap width", value: "20 mm, quick-release" },
    ],
    notes: ["Applied indices, hand-finished", "Date set flush at three", "Signed crown"],
    tags: ["gender:men", "new", "automatic", "date"],
    createdAt: "2026-08-02",
    bestSellingRank: 1,
  },
  {
    handle: "nathia",
    title: "Nathia",
    subtitle: "Slim, 32 mm. Four markers and nothing more.",
    gender: "women",
    description: [
      "A slim 32 mm case that sits close to the wrist and slides under a cuff. Only the quarters are marked; the rest is left to the dial.",
      "Nathia is the piece we reach for most: light, precise, and at ease with everything else you wear.",
    ],
    price: 46500,
    surcharge: { "Milanese mesh": 4500 },
    options: [
      opt("Case", ["Sand", "Steel"]),
      opt("Dial", ["Ivory", "White", "Taupe"]),
      opt("Strap", ["Ivory leather", "Taupe suede", "Milanese mesh"]),
    ],
    soldOut: [["Steel", "Taupe", "Taupe suede"]],
    style: { indices: "minimal", complication: "none", sizeMm: 32, minuteTrack: false },
    specs: [
      { label: "Case", value: "316L stainless steel, Sand PVD or natural" },
      { label: "Diameter", value: "32 mm" },
      { label: "Thickness", value: "6.9 mm" },
      { label: "Crystal", value: "Sapphire" },
      { label: "Movement", value: "Swiss quartz, 3-year battery" },
      { label: "Water resistance", value: "3 ATM" },
      { label: "Strap width", value: "16 mm, quick-release" },
    ],
    notes: ["6.9 mm case height", "Quarter markers only", "Pairs with Deodar"],
    tags: ["gender:women", "quartz", "slim"],
    createdAt: "2026-07-18",
    bestSellingRank: 2,
  },
  {
    handle: "patriata",
    title: "Patriata",
    subtitle: "Two registers, 40 mm. Measured, not loud.",
    gender: "men",
    description: [
      "Two sunken registers balance the dial; the pushers sit close to the case so the profile stays clean.",
      "A chronograph for timing what matters, and otherwise for being worn.",
    ],
    price: 72000,
    surcharge: { "Link bracelet": 9000 },
    options: [
      opt("Case", ["Ink", "Steel"]),
      opt("Dial", ["Ink", "White"]),
      opt("Strap", ["Link bracelet", "Ink leather"]),
    ],
    style: { indices: "numerals", complication: "chrono", sizeMm: 40, minuteTrack: true },
    specs: [
      { label: "Case", value: "316L stainless steel, Ink DLC or natural" },
      { label: "Diameter", value: "40 mm" },
      { label: "Thickness", value: "11.4 mm" },
      { label: "Crystal", value: "Sapphire, anti-reflective" },
      { label: "Movement", value: "Meca-quartz chronograph" },
      { label: "Water resistance", value: "10 ATM" },
      { label: "Strap width", value: "20 mm, quick-release" },
    ],
    notes: ["Sunken registers", "Screw-down caseback", "Low-profile pushers"],
    tags: ["gender:men", "chronograph"],
    createdAt: "2026-06-30",
    bestSellingRank: 4,
  },
  {
    handle: "ayubia",
    title: "Ayubia",
    subtitle: "Roman numerals, small seconds. For her or him.",
    gender: "unisex",
    description: [
      "A classical dial — Roman numerals and a small seconds register at six — in a 36 mm case that suits any wrist.",
      "It is the most traditional watch we make, and the one we expect to last longest in style.",
    ],
    price: 54000,
    options: [
      opt("Case", ["Sand", "Steel"]),
      opt("Dial", ["Ivory", "Taupe"]),
      opt("Size", ["34 mm", "36 mm"]),
      opt("Strap", ["Taupe suede", "Ink leather"]),
    ],
    style: { indices: "roman", complication: "small-seconds", sizeMm: 36, minuteTrack: false },
    specs: [
      { label: "Case", value: "316L stainless steel, Sand PVD or natural" },
      { label: "Diameter", value: "34 or 36 mm" },
      { label: "Thickness", value: "8.6 mm" },
      { label: "Crystal", value: "Domed sapphire" },
      { label: "Movement", value: "Automatic, small seconds" },
      { label: "Water resistance", value: "5 ATM" },
      { label: "Strap width", value: "18 mm, quick-release" },
    ],
    notes: ["Printed Roman numerals", "Small seconds at six", "Domed sapphire"],
    tags: ["gender:unisex", "automatic"],
    createdAt: "2026-05-12",
    bestSellingRank: 3,
  },
  {
    handle: "bhurban",
    title: "Bhurban",
    subtitle: "Polished dot markers, 34 mm on mesh.",
    gender: "women",
    description: [
      "Polished dots catch the light between the quarters. A fine Milanese mesh closes with a sliding clasp, so the fit is exact.",
      "Bright enough for evening, simple enough for every day.",
    ],
    price: 49000,
    options: [
      opt("Case", ["Steel", "Sand"]),
      opt("Dial", ["White", "Taupe", "Ink"]),
      opt("Strap", ["Milanese mesh", "Ivory leather"]),
    ],
    soldOut: [["Sand", "Ink"]],
    style: { indices: "dot", complication: "none", sizeMm: 34, minuteTrack: false },
    specs: [
      { label: "Case", value: "316L stainless steel" },
      { label: "Diameter", value: "34 mm" },
      { label: "Thickness", value: "7.4 mm" },
      { label: "Crystal", value: "Sapphire" },
      { label: "Movement", value: "Swiss quartz" },
      { label: "Water resistance", value: "3 ATM" },
      { label: "Strap width", value: "16 mm" },
    ],
    notes: ["Polished applied dots", "Adjustable mesh clasp", "7.4 mm case height"],
    tags: ["gender:women", "quartz", "new"],
    createdAt: "2026-08-20",
    bestSellingRank: 5,
  },
  {
    handle: "galyat",
    title: "Galyat",
    subtitle: "Legible, 38 mm. Made for moving.",
    gender: "unisex",
    description: [
      "Large quarter numerals, a railway minute track and a case sized to sit between classic and contemporary.",
      "Galyat is the watch for long walks and early starts: easy to read at a glance, easy to forget you are wearing.",
    ],
    price: 52000,
    options: [
      opt("Case", ["Steel", "Ink"]),
      opt("Dial", ["White", "Ink"]),
      opt("Strap", ["Taupe suede", "Ink leather"]),
    ],
    style: { indices: "numerals", complication: "none", sizeMm: 38, minuteTrack: true },
    specs: [
      { label: "Case", value: "316L stainless steel" },
      { label: "Diameter", value: "38 mm" },
      { label: "Thickness", value: "10.2 mm" },
      { label: "Crystal", value: "Sapphire" },
      { label: "Movement", value: "Automatic, 38-hour power reserve" },
      { label: "Water resistance", value: "10 ATM" },
      { label: "Strap width", value: "20 mm, quick-release" },
    ],
    notes: ["Railway minute track", "10 ATM", "Quick-release straps"],
    tags: ["gender:unisex", "automatic"],
    createdAt: "2026-04-02",
    bestSellingRank: 6,
  },
  {
    handle: "changla",
    title: "Changla",
    subtitle: "No markers. Ink on ink. 250 pieces.",
    gender: "unisex",
    description: [
      "A dial without indices, in Ink on Ink. Only the wordmark and the hands — the hour read by feel as much as by sight.",
      "Changla is numbered on the caseback and made in a single run of 250.",
    ],
    price: 64000,
    options: [
      opt("Case", ["Ink"]),
      opt("Dial", ["Ink"]),
      opt("Size", ["36 mm", "40 mm"]),
      opt("Strap", ["Ink leather"]),
    ],
    style: { indices: "none", complication: "none", sizeMm: 38, minuteTrack: false },
    specs: [
      { label: "Case", value: "316L stainless steel, Ink DLC" },
      { label: "Diameter", value: "36 or 40 mm" },
      { label: "Thickness", value: "8.9 mm" },
      { label: "Crystal", value: "Sapphire, anti-reflective" },
      { label: "Movement", value: "Automatic" },
      { label: "Edition", value: "250 numbered pieces" },
      { label: "Water resistance", value: "5 ATM" },
    ],
    notes: ["Numbered caseback", "Indexless dial", "Edition of 250"],
    tags: ["gender:unisex", "limited", "automatic"],
    createdAt: "2026-09-10",
    bestSellingRank: 7,
  },
  {
    handle: "ocia-pair",
    title: "The Pair",
    subtitle: "Deodar 40 and Nathia 32, boxed together.",
    gender: "unisex",
    description: [
      "Our two most-worn pieces, matched and presented in one box. Choose the finish; we pair the dials.",
      "Made for two people who share a home, a date, or simply a sense of what is enough.",
    ],
    price: 98000,
    options: [opt("Case", ["Steel", "Sand"]), opt("Dial", ["Ink", "Ivory"])],
    style: { indices: "baton", complication: "date", sizeMm: 40, minuteTrack: true },
    pairStyle: { indices: "minimal", complication: "none", sizeMm: 32, minuteTrack: false },
    specs: [
      { label: "Includes", value: "Deodar 40 mm and Nathia 32 mm" },
      { label: "Presentation", value: "Double watch box in ivory linen" },
      { label: "Engraving", value: "Casebacks may be engraved on request" },
      { label: "Warranty", value: "Two years, international" },
    ],
    notes: ["Double presentation box", "Complimentary engraving", "Gift-wrapped"],
    tags: ["gender:unisex", "pair", "gift"],
    createdAt: "2026-09-01",
    bestSellingRank: 8,
  },
];

export type MockCollectionDef = {
  handle: string;
  title: string;
  kicker: string;
  description: string;
  /** Tag filter; empty = all products */
  match: (p: MockProductDef) => boolean;
  heroHandle: string;
};

export const MOCK_COLLECTIONS: MockCollectionDef[] = [
  {
    handle: "all",
    title: "All watches",
    kicker: "The collection",
    description: "Eight watches for women and men. Considered details, everyday presence.",
    match: () => true,
    heroHandle: "deodar",
  },
  {
    handle: "women",
    title: "For her",
    kicker: "Women",
    description: "Slim cases, quiet dials, and straps that fit as if they were measured.",
    match: (p) => p.gender === "women" || p.gender === "unisex",
    heroHandle: "nathia",
  },
  {
    handle: "men",
    title: "For him",
    kicker: "Men",
    description: "Measured proportions and legible dials, built for every day.",
    match: (p) => p.gender === "men" || p.gender === "unisex",
    heroHandle: "deodar",
  },
  {
    handle: "pairs",
    title: "Pairs & gifts",
    kicker: "Together",
    description: "Watches chosen to be given, and to be worn side by side.",
    match: (p) => p.tags.includes("pair") || p.tags.includes("limited"),
    heroHandle: "ocia-pair",
  },
];
