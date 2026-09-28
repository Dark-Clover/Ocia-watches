import { renderPair, renderWatch, RENDER_VIEWS, type RenderView } from "@/lib/watch/render";
import { parseSpecKey, specFromOptions, specKey, type WatchSpec } from "@/lib/watch/spec";
import type { Collection, Image, Money, Product, ProductVariant, SelectedOption } from "../types";
import { CURRENCY, MOCK_COLLECTIONS, MOCK_PRODUCTS, type MockProductDef } from "./catalog";

/** Expands the merchant-style catalogue into normalised `Product` objects. */

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const money = (n: number): Money => ({ amount: n.toFixed(1), currencyCode: CURRENCY });

function cartesian(options: MockProductDef["options"]): SelectedOption[][] {
  return options.reduce<SelectedOption[][]>(
    (acc, o) => acc.flatMap((combo) => o.values.map((v) => [...combo, { name: o.name, value: v.name }])),
    [[]],
  );
}

const VIEW_LABEL: Record<RenderView, string> = {
  front: "front view",
  flatlay: "resting on linen",
  dial: "dial detail",
  crown: "crown and case profile",
  back: "caseback",
};

function renderUrl(handle: string, spec: WatchSpec, view: RenderView) {
  return `/renders/${handle}/${specKey(spec)}/${view}.svg`;
}

function image(def: MockProductDef, spec: WatchSpec, view: RenderView, options: SelectedOption[]): Image {
  const optionText = options
    .filter((o) => o.name !== "Size")
    .map((o) => `${o.value} ${o.name.toLowerCase()}`)
    .join(", ");
  return {
    url: renderUrl(def.handle, spec, view),
    altText: `OCIA ${def.title} — ${optionText} — ${VIEW_LABEL[view]}`,
    width: 1600,
    height: 2000,
  };
}

function buildProduct(def: MockProductDef): Product {
  const combos = cartesian(def.options);
  const variants: ProductVariant[] = combos.map((selectedOptions, i) => {
    const values = selectedOptions.map((o) => o.value);
    const surcharge = values.reduce((sum, v) => sum + (def.surcharge?.[v] ?? 0), 0);
    const soldOut = def.soldOut?.some((combo) => combo.every((v) => values.includes(v))) ?? false;
    const spec = specFromOptions(def.style, selectedOptions);
    return {
      id: `gid://ocia/ProductVariant/${def.handle}-${slug(values.join(" "))}`,
      title: values.join(" / "),
      sku: `OC-${def.handle.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
      availableForSale: !soldOut,
      quantityAvailable: soldOut ? 0 : 3 + ((i * 7) % 11),
      selectedOptions,
      price: money(def.price + surcharge),
      compareAtPrice: null,
      image: image(def, spec, "front", selectedOptions),
    };
  });

  // One image set per visual appearance (size doesn't change the look), the
  // default variant's set first. The gallery filters these by option values in
  // the alt text — the same convention used for variant images in Shopify.
  const first = variants.find((v) => v.availableForSale) ?? variants[0];
  const ordered = [first, ...variants.filter((v) => v !== first)];
  const seen = new Set<string>();
  const images = ordered.flatMap((v) => {
    const look = v.selectedOptions.filter((o) => o.name !== "Size");
    const key = look.map((o) => o.value).join("|");
    if (seen.has(key)) return [];
    seen.add(key);
    const spec = { ...specFromOptions(def.style, v.selectedOptions), sizeMm: def.style.sizeMm };
    return RENDER_VIEWS.map((view) => image(def, spec, view, v.selectedOptions));
  });
  for (const v of variants) {
    const spec = { ...specFromOptions(def.style, v.selectedOptions), sizeMm: def.style.sizeMm };
    v.image = image(def, spec, "front", v.selectedOptions);
  }
  const prices = variants.map((v) => Number(v.price.amount));

  return {
    id: `gid://ocia/Product/${def.handle}`,
    handle: def.handle,
    title: def.title,
    subtitle: def.subtitle,
    description: def.description.join("\n\n"),
    descriptionHtml: def.description.map((p) => `<p>${p}</p>`).join(""),
    vendor: "OCIA",
    productType: "Watch",
    tags: def.tags,
    gender: def.gender,
    availableForSale: variants.some((v) => v.availableForSale),
    options: def.options.map((o) => ({ id: `gid://ocia/ProductOption/${def.handle}-${slug(o.name)}`, name: o.name, values: o.values })),
    variants,
    featuredImage: images[0],
    images,
    priceRange: { minVariantPrice: money(Math.min(...prices)), maxVariantPrice: money(Math.max(...prices)) },
    specs: def.specs,
    notes: def.notes,
    watchStyle: def.style,
    pairStyle: def.pairStyle ?? null,
    seo: { title: `${def.title} — OCIA`, description: def.subtitle },
    updatedAt: def.createdAt,
  };
}

export const PRODUCTS: Product[] = MOCK_PRODUCTS.map(buildProduct);

export const PRODUCT_META = new Map(MOCK_PRODUCTS.map((d) => [d.handle, d]));

export const COLLECTIONS: Collection[] = MOCK_COLLECTIONS.map((c) => {
  const hero = PRODUCTS.find((p) => p.handle === c.heroHandle)!;
  return {
    id: `gid://ocia/Collection/${c.handle}`,
    handle: c.handle,
    title: c.title,
    kicker: c.kicker,
    description: c.description,
    image: hero.images.find((i) => i.url.endsWith("flatlay.svg")) ?? hero.featuredImage,
    seo: { title: `${c.title} — OCIA`, description: c.description },
    path: `/collections/${c.handle}`,
    updatedAt: "2026-09-01",
  };
});

export function collectionMatches(handle: string, productHandle: string) {
  const def = MOCK_COLLECTIONS.find((c) => c.handle === handle);
  const p = PRODUCT_META.get(productHandle);
  return !!def && !!p && def.match(p);
}

/**
 * Renders a mock product image. Returns null for unknown products/specs so the
 * route can 404. With Shopify connected this is unused — images come from the CDN.
 */
export function renderProductImage(handle: string, key: string, view: string): string | null {
  const def = PRODUCT_META.get(handle);
  if (!def || !(RENDER_VIEWS as string[]).includes(view)) return null;
  const spec = parseSpecKey(def.style, key);
  if (!spec) return null;
  if (def.pairStyle) {
    const partner: WatchSpec = {
      ...def.pairStyle,
      finish: spec.finish,
      dial: spec.dial === "ink" ? "ivory" : "taupe",
      strap: "ivory-leather",
    };
    return renderPair(spec, partner, view as RenderView);
  }
  return renderWatch(spec, view as RenderView);
}
