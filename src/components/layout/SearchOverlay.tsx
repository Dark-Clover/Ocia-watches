"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useScrollLock } from "@/components/providers/SmoothScroll";
import { EASE_IN_OUT, EASE_OUT } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { TLink } from "@/components/ui/TLink";
import { searchProducts } from "@/lib/actions/site";
import type { Product } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/utils";

const SUGGESTIONS = ["Slim", "Automatic", "Ink", "Mesh", "Chronograph", "Gift"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus(), 500);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      startTransition(async () => setResults(await searchProducts(query)));
    }, 180);
    return () => clearTimeout(t);
  }, [query, open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close search"
            className="fixed inset-0 z-[70] bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: EASE_IN_OUT }}
            className="fixed inset-x-0 top-0 z-[71] max-h-[92vh] overflow-y-auto bg-ivory text-ink"
            data-lenis-prevent
          >
            <div className="container-x pb-12 pt-28">
              <label htmlFor="site-search" className="eyebrow text-stone">Search the collection</label>
              <div className="mt-4 flex items-center gap-6 border-b border-ink/20">
                <input
                  ref={input}
                  id="site-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try “slim” or “ink”"
                  autoComplete="off"
                  className="display w-full bg-transparent py-4 text-[clamp(2.5rem,6vw,5.5rem)] placeholder:text-ink/20 focus:outline-none"
                />
                <span className="eyebrow shrink-0 text-stone">{isPending ? "…" : `${results.length} results`}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="border border-ink/15 px-4 py-2 text-xs transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="eyebrow mt-12 text-stone">{query ? "Results" : "Most worn"}</p>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
                {results.map((p, i) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 + i * 0.05 }}
                  >
                    <TLink href={`/products/${p.handle}`} onClick={onClose} className="group block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">
                        <ProductImage
                          image={p.featuredImage}
                          sizes="25vw"
                          className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <p className="serif text-2xl">{p.title}</p>
                        <p className="text-xs text-stone">{formatMoney(p.priceRange.minVariantPrice)}</p>
                      </div>
                    </TLink>
                  </motion.li>
                ))}
              </ul>
              {!isPending && query && results.length === 0 && (
                <p className="serif mt-4 text-2xl text-stone">Nothing matches “{query}”. Try a finish, like steel or sand.</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
