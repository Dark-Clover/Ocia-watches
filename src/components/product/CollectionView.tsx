"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { EASE_OUT } from "@/components/ui/motion";
import { TLink } from "@/components/ui/TLink";
import type { Collection, Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

const FILTERS = ["Case", "Strap"] as const;

export function CollectionView({
  collection,
  collections,
  products,
  sort,
}: {
  collection: Collection;
  collections: Collection[];
  products: Product[];
  sort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [dense, setDense] = useState(false);

  const facets = useMemo(
    () =>
      FILTERS.map((name) => ({
        name,
        values: [...new Set(products.flatMap((p) => p.options.find((o) => o.name === name)?.values.map((v) => v.name) ?? []))],
      })),
    [products],
  );

  const visible = products.filter((p) =>
    Object.entries(filters).every(
      ([name, values]) => values.length === 0 || p.options.some((o) => o.name === name && o.values.some((v) => values.includes(v.name))),
    ),
  );
  const active = Object.values(filters).flat().length;

  const toggle = (name: string, value: string) =>
    setFilters((f) => {
      const cur = f[name] ?? [];
      return { ...f, [name]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });

  return (
    <>
      <div className="border-y border-ink/10 bg-ivory">
        <div className="container-x flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
          <LayoutGroup>
            <nav className="flex gap-6 overflow-x-auto [scrollbar-width:none]" aria-label="Collections">
              {collections.map((c) => (
                <TLink key={c.handle} href={c.path} className="eyebrow relative whitespace-nowrap py-1 text-[0.625rem]">
                  <span className={c.handle === collection.handle ? "text-ink" : "text-stone hover:text-ink"}>{c.title}</span>
                  {c.handle === collection.handle && <motion.span layoutId="col-underline" className="absolute -bottom-0.5 left-0 h-px w-full bg-ink" />}
                </TLink>
              ))}
            </nav>
          </LayoutGroup>
          <div className="flex items-center gap-6">
            <label className="eyebrow flex items-center gap-2 text-[0.625rem] text-stone">
              Sort
              <select
                value={sort}
                onChange={(e) =>
                  startTransition(() => router.replace(`${pathname}${e.target.value === "featured" ? "" : `?sort=${e.target.value}`}`, { scroll: false }))
                }
                className="cursor-pointer bg-transparent text-ink normal-case tracking-normal focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={() => setDense((d) => !d)} className="eyebrow hidden text-[0.625rem] text-stone hover:text-ink md:block">
              {dense ? "Editorial view" : "Grid view"}
            </button>
          </div>
        </div>
        <div className="container-x flex flex-wrap gap-x-8 gap-y-3 pb-4">
          {facets.map((facet) => (
            <div key={facet.name} className="flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1 text-[0.5625rem] text-stone">{facet.name}</span>
              {facet.values.map((v) => {
                const on = filters[facet.name]?.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => toggle(facet.name, v)}
                    aria-pressed={on}
                    className={cn(
                      "border px-3 py-1.5 text-[0.6875rem] transition-colors duration-300",
                      on ? "border-ink bg-ink text-ivory" : "border-ink/15 hover:border-ink",
                    )}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          ))}
          {active > 0 && (
            <button onClick={() => setFilters({})} className="eyebrow link-draw text-[0.5625rem]">
              Clear ({active})
            </button>
          )}
        </div>
      </div>

      <div className={cn("container-x pb-32 pt-12 transition-opacity duration-500 md:pb-48", isPending && "opacity-50")}>
        <p className="eyebrow mb-10 text-[0.625rem] text-stone">
          {visible.length} {visible.length === 1 ? "watch" : "watches"}
        </p>
        <motion.ul layout className={cn("grid gap-x-4 gap-y-16 md:gap-y-24", dense ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => {
              // Editorial rhythm: every fifth piece spans two columns with its flat-lay.
              const wide = !dense && i % 5 === 3 && visible.length > 4;
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.9, ease: EASE_OUT, delay: Math.min(i, 6) * 0.05 }}
                  className={cn(wide && "sm:col-span-2", !dense && i % 3 === 1 && !wide && "lg:mt-24")}
                >
                  <ProductCard
                    product={p}
                    index={i}
                    size={wide ? "wide" : "default"}
                    priority={i < 3}
                    sizes={wide ? "(min-width: 1024px) 66vw, 100vw" : dense ? "25vw" : "(min-width: 1024px) 33vw, 50vw"}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
        {visible.length === 0 && (
          <div className="py-24 text-center">
            <p className="serif text-3xl">Nothing in that combination.</p>
            <button onClick={() => setFilters({})} className="eyebrow link-draw mt-6">Clear filters</button>
          </div>
        )}
      </div>
    </>
  );
}
