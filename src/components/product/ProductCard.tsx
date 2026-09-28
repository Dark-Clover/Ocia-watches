"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { EASE_OUT } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { TLink } from "@/components/ui/TLink";
import { defaultVariant, imagesForVariant } from "@/lib/commerce/images";
import type { Product } from "@/lib/commerce/types";
import { cn, formatMoney } from "@/lib/utils";

/**
 * Product card. Hovering the case swatches previews that finish; hovering the
 * image reveals the flat-lay. Prices show "from" when variants differ.
 */
export function ProductCard({
  product,
  index,
  size = "default",
  sizes = "(min-width: 1024px) 30vw, 50vw",
  priority,
}: {
  product: Product;
  index?: number;
  size?: "default" | "wide";
  sizes?: string;
  priority?: boolean;
}) {
  const base = defaultVariant(product);
  const caseOption = product.options.find((o) => o.name === "Case");
  const [finish, setFinish] = useState<string | null>(null);
  const variant =
    (finish &&
      product.variants.find(
        (v) => v.availableForSale && v.selectedOptions.some((o) => o.name === "Case" && o.value === finish),
      )) ||
    base;
  const images = imagesForVariant(product, variant);
  const primary = size === "wide" ? images.find((i) => i.url.includes("flatlay")) ?? images[0] : images[0];
  const secondary = size === "wide" ? images[0] : images.find((i) => i.url.includes("flatlay")) ?? images[1];
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const from = minVariantPrice.amount !== maxVariantPrice.amount;
  const limited = product.tags.includes("limited");
  const isNew = product.tags.includes("new");

  return (
    <article className="group relative">
      <TLink href={`/products/${product.handle}`} data-cursor="View" className="block">
        <div className={cn("relative overflow-hidden bg-ivory-deep", size === "wide" ? "aspect-[4/5] md:aspect-[16/11]" : "aspect-[4/5]")}>
          <motion.div
            key={primary.url}
            initial={{ opacity: 0.4, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="absolute inset-0 transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          >
            <ProductImage image={primary} sizes={sizes} priority={priority} fit={size === "wide" ? "cover" : "cover"} />
          </motion.div>
          {secondary && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] [@media(hover:hover)]:group-hover:opacity-100">
              <ProductImage image={secondary} sizes={sizes} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-5">
            {typeof index === "number" && <span className="eyebrow text-[0.625rem] text-stone">{String(index + 1).padStart(2, "0")}</span>}
            {(limited || isNew || !product.availableForSale) && (
              <span className="eyebrow bg-ivory/90 px-2.5 py-1.5 text-[0.5625rem]">
                {!product.availableForSale ? "Sold out" : limited ? "Edition of 250" : "New"}
              </span>
            )}
          </div>
        </div>
      </TLink>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="serif text-[1.75rem] leading-none md:text-3xl">
            <TLink href={`/products/${product.handle}`}>{product.title}</TLink>
          </h3>
          <p className="mt-2 line-clamp-1 text-xs text-stone">{product.subtitle}</p>
        </div>
        <p className="shrink-0 pt-1 text-xs">
          {from && <span className="text-stone">From </span>}
          {formatMoney(minVariantPrice)}
        </p>
      </div>
      {caseOption && caseOption.values.length > 1 && (
        <div className="mt-4 flex items-center gap-2" onPointerLeave={() => setFinish(null)}>
          {caseOption.values.map((v) => (
            <button
              key={v.name}
              type="button"
              aria-label={`Preview ${v.name} case`}
              onPointerEnter={() => setFinish(v.name)}
              onFocus={() => setFinish(v.name)}
              onClick={() => setFinish(v.name)}
              className={cn(
                "h-3.5 w-3.5 rounded-full ring-1 ring-offset-2 ring-offset-ivory transition-all duration-300",
                (finish ?? base.selectedOptions.find((o) => o.name === "Case")?.value) === v.name ? "ring-ink" : "ring-transparent",
              )}
              style={{ background: v.swatch }}
            />
          ))}
          <span className="ml-2 text-[0.6875rem] text-stone">{caseOption.values.length} finishes</span>
        </div>
      )}
    </article>
  );
}
