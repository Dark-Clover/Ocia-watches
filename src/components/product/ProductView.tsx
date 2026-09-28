"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { EASE_OUT } from "@/components/ui/motion";
import { TLink } from "@/components/ui/TLink";
import { imagesForVariant } from "@/lib/commerce/images";
import type { Product, ProductVariant } from "@/lib/commerce/types";
import { cn, formatMoney } from "@/lib/utils";
import { specFromOptions } from "@/lib/watch/spec";
import { ProductGallery } from "./ProductGallery";

type Selection = Record<string, string>;

const toSelection = (v: ProductVariant): Selection => Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value]));

function match(product: Product, sel: Selection) {
  return product.variants.find((v) => v.selectedOptions.every((o) => sel[o.name] === o.value));
}

/** Product page body: gallery on the left, configuration on the right. */
export function ProductView({ product, initial }: { product: Product; initial: ProductVariant }) {
  const [selection, setSelection] = useState<Selection>(() => toSelection(initial));
  const variant = match(product, selection);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const images = useMemo(() => imagesForVariant(product, variant ?? initial), [product, variant, initial]);
  const spec = product.watchStyle && variant ? specFromOptions(product.watchStyle, variant.selectedOptions) : null;

  const choose = (name: string, value: string) => {
    let next = { ...selection, [name]: value };
    // If the exact combination doesn't exist, keep the new choice and take the closest variant.
    if (!match(product, next)) {
      const fallback = product.variants.find((v) => v.selectedOptions.some((o) => o.name === name && o.value === value));
      if (fallback) next = toSelection(fallback);
    }
    setSelection(next);
    const params = new URLSearchParams(Object.entries(next).map(([k, v]) => [k.toLowerCase(), v]));
    window.history.replaceState(null, "", `?${params}`);
  };

  const available = (name: string, value: string) =>
    product.variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) => (o.name === name ? o.value === value : selection[o.name] === o.value)),
    );

  const price = variant?.price ?? product.priceRange.minVariantPrice;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:container-x">
      <ProductGallery images={images} spec={spec} title={product.title} />

      <div className="container-x lg:px-0">
        <div className="lg:sticky lg:top-28 lg:pb-16">
          <nav aria-label="Breadcrumb" className="eyebrow flex gap-2 text-[0.625rem] text-stone">
            <TLink href="/collections/all" className="link-draw">Watches</TLink>
            <span>/</span>
            <TLink href={`/collections/${product.gender === "women" ? "women" : product.gender === "men" ? "men" : "all"}`} className="link-draw">
              {product.gender === "women" ? "For her" : product.gender === "men" ? "For him" : "For her & him"}
            </TLink>
          </nav>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.2 }}
            className="display mt-6 text-[clamp(3.5rem,7vw,7rem)]"
          >
            {product.title}
          </motion.h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">{product.subtitle}</p>

          <div className="mt-8 flex items-baseline gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={price.amount}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="text-lg"
              >
                {formatMoney(price)}
              </motion.p>
            </AnimatePresence>
            <span className="text-xs text-stone">Duties included</span>
          </div>

          <div className="mt-10 space-y-8 border-t border-ink/10 pt-8">
            {product.options.map((option) => {
              const current = selection[option.name];
              const swatches = option.values.every((v) => v.swatch) && option.name !== "Size";
              return (
                <fieldset key={option.id}>
                  <legend className="flex w-full justify-between eyebrow text-[0.625rem]">
                    <span className="text-stone">{option.name}</span>
                    <span>{current}</span>
                  </legend>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {option.values.map((v) => {
                      const selected = current === v.name;
                      const ok = available(option.name, v.name);
                      return swatches ? (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => choose(option.name, v.name)}
                          aria-pressed={selected}
                          aria-label={`${option.name}: ${v.name}${ok ? "" : " (sold out)"}`}
                          title={v.name}
                          className={cn(
                            "relative h-9 w-9 rounded-full ring-1 ring-offset-4 ring-offset-ivory transition-all duration-500",
                            selected ? "ring-ink" : "ring-transparent hover:ring-ink/30",
                          )}
                        >
                          <span className="absolute inset-0 rounded-full border border-ink/10" style={{ background: v.swatch }} />
                          {!ok && <span className="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink/50" />}
                        </button>
                      ) : (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => choose(option.name, v.name)}
                          aria-pressed={selected}
                          className={cn(
                            "min-w-20 border px-4 py-3 text-xs transition-colors duration-300",
                            selected ? "border-ink bg-ink text-ivory" : "border-ink/15 hover:border-ink",
                            !ok && "text-stone line-through",
                          )}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="mt-10">
            <Button
              className="w-full"
              arrow={!!variant?.availableForSale}
              disabled={!variant?.availableForSale}
              onClick={async () => {
                if (!variant) return;
                await addItem(product, variant);
                setAdded(true);
                setTimeout(() => setAdded(false), 2400);
              }}
            >
              {!variant ? "Unavailable" : !variant.availableForSale ? "Sold out" : added ? "Added to your bag" : "Add to bag"}
            </Button>
            <div className="mt-4 flex justify-between text-[0.6875rem] text-stone">
              <span>
                {variant?.availableForSale
                  ? variant.quantityAvailable && variant.quantityAvailable < 5
                    ? `Only ${variant.quantityAvailable} left in this configuration`
                    : "In stock · Ships within 48 hours"
                  : "Notify me when available"}
              </span>
              <TLink href="/contact?topic=viewing" className="link-draw">Book a viewing</TLink>
            </div>
          </div>

          <ul className="mt-10 grid grid-cols-3 gap-4 border-y border-ink/10 py-6">
            {product.notes.map((n) => (
              <li key={n} className="text-xs leading-relaxed">{n}</li>
            ))}
          </ul>

          <Accordion
            className="mt-10"
            defaultOpen={0}
            items={[
              { title: "Description", content: <div className="space-y-3" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} /> },
              {
                title: "Specifications",
                content: (
                  <dl className="divide-y divide-ink/10">
                    {product.specs.map((s) => (
                      <div key={s.label} className="grid grid-cols-[1fr_1.4fr] gap-4 py-2.5">
                        <dt className="text-stone">{s.label}</dt>
                        <dd className="text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                ),
              },
              {
                title: "Delivery & returns",
                content: (
                  <p>
                    Insured express delivery across Pakistan in 48 hours, complimentary above PKR 50,000. International delivery in 3–6 working days.
                    Returns accepted within 14 days, unworn and in original packaging.
                  </p>
                ),
              },
              {
                title: "Warranty & care",
                content: (
                  <p>
                    Two-year international warranty. We recommend a service every four to five years for automatic movements. Complimentary strap
                    changes at the studio.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
