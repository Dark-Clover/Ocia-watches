import type { WatchStyle } from "@/lib/watch/spec";
import type { Cart, Collection, Customer, Gender, Image, Product, ProductSpec } from "../types";

/** Converts raw Storefront API payloads into the storefront's domain types. */

type Edges<T> = { edges: { node: T }[] };
export const flatten = <T>(c: Edges<T> | null | undefined): T[] => c?.edges.map((e) => e.node) ?? [];

type Metafield = { key: string; value: string } | null;

const parseJson = <T>(value: string | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const PLACEHOLDER: Image = { url: "/brand/lockup-ink.png", altText: "OCIA", width: 696, height: 228 };

const withAlt = (img: Image | null, fallback: string): Image | null =>
  img ? { ...img, altText: img.altText || fallback } : null;

function genderFromTags(tags: string[]): Gender {
  if (tags.includes("gender:women")) return "women";
  if (tags.includes("gender:men")) return "men";
  return "unisex";
}

/* eslint-disable @typescript-eslint/no-explicit-any -- raw API payloads */
export function normalizeProduct(raw: any): Product {
  const meta = new Map<string, string>(
    (raw.metafields as Metafield[]).filter(Boolean).map((m) => [m!.key, m!.value]),
  );
  const images = flatten<Image>(raw.images).map((i) => withAlt(i, raw.title)!);
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    subtitle: meta.get("subtitle") ?? "",
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    vendor: raw.vendor,
    productType: raw.productType,
    tags: raw.tags,
    gender: genderFromTags(raw.tags),
    availableForSale: raw.availableForSale,
    options: raw.options.map((o: any) => ({
      id: o.id,
      name: o.name,
      values: o.optionValues.map((v: any) => ({ name: v.name, swatch: v.swatch?.color ?? undefined })),
    })),
    variants: flatten<any>(raw.variants).map((v) => ({ ...v, image: withAlt(v.image, raw.title) })),
    featuredImage: withAlt(raw.featuredImage, raw.title) ?? images[0] ?? PLACEHOLDER,
    images: images.length ? images : [PLACEHOLDER],
    priceRange: raw.priceRange,
    specs: parseJson<ProductSpec[]>(meta.get("specs"), []),
    notes: parseJson<string[]>(meta.get("notes"), []),
    watchStyle: parseJson<WatchStyle | null>(meta.get("watch_style"), null),
    pairStyle: parseJson<WatchStyle | null>(meta.get("pair_style"), null),
    seo: { title: raw.seo?.title || raw.title, description: raw.seo?.description || raw.description },
    updatedAt: raw.updatedAt,
  };
}

export function normalizeCollection(raw: any): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    kicker: raw.kicker?.value ?? raw.title,
    description: raw.description,
    image: withAlt(raw.image, raw.title),
    seo: { title: raw.seo?.title || raw.title, description: raw.seo?.description || raw.description },
    path: `/collections/${raw.handle}`,
    updatedAt: raw.updatedAt,
  };
}

export function normalizeCart(raw: any): Cart {
  return {
    ...raw,
    lines: flatten<any>(raw.lines),
    cost: { ...raw.cost, totalTaxAmount: raw.cost.totalTaxAmount ?? null },
  };
}

export function normalizeCustomer(raw: any): Customer {
  return {
    ...raw,
    addresses: flatten(raw.addresses),
    orders: flatten(raw.orders),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
