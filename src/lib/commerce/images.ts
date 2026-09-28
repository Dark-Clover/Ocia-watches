import type { Image, Product, ProductVariant } from "./types";

/**
 * Images for a variant: product images whose alt text names every visual
 * option value of the variant ("Steel case", "Ink dial", …). Falls back to the
 * variant image, then all product images. Works with Shopify as long as
 * merchants include option values in image alt text (a common convention).
 */
export function imagesForVariant(product: Product, variant: ProductVariant | undefined): Image[] {
  if (!variant) return product.images;
  const needles = variant.selectedOptions
    .filter((o) => o.name.toLowerCase() !== "size")
    .map((o) => `${o.value} ${o.name}`.toLowerCase());
  const matches = product.images.filter((img) => {
    const alt = img.altText.toLowerCase();
    return needles.every((n) => alt.includes(n));
  });
  if (matches.length) return matches;
  return variant.image ? [variant.image, ...product.images.filter((i) => i.url !== variant.image!.url)] : product.images;
}

export function defaultVariant(product: Product): ProductVariant {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0];
}

/** Second image for hover states on cards. */
export function secondaryImage(product: Product): Image | undefined {
  return imagesForVariant(product, defaultVariant(product))[1];
}
