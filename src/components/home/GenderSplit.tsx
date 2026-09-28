"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { EASE_OUT, Parallax, SplitReveal } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { TLink } from "@/components/ui/TLink";
import type { Image } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

type Panel = { label: string; title: string; href: string; count: number; image: Image; line: string };

/** Two doors, one for her and one for him. The one you lean towards opens wider. */
export function GenderSplit({ panels }: { panels: [Panel, Panel] }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section data-theme="light" className="bg-ivory pb-32 md:pb-48" aria-label="Shop by wearer">
      <div className="container-x mb-12 flex items-end justify-between gap-8 md:mb-16">
        <SplitReveal as="h2" text={"For every\nwrist."} className="display text-[clamp(3rem,8vw,8.5rem)]" />
        <p className="hidden max-w-xs text-sm leading-relaxed text-stone md:block">
          Designed together, sized apart. The same materials and finishing, in proportions made for each.
        </p>
      </div>
      <div className="container-x flex flex-col gap-4 md:h-[88vh] md:flex-row">
        {panels.map((p, i) => (
          <motion.div
            key={p.href}
            className="relative min-h-[70vh] md:min-h-0"
            animate={{ flexGrow: hover === null ? 1 : hover === i ? 1.45 : 0.75 }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
            style={{ flexBasis: 0 }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <TLink href={p.href} data-cursor="Explore" className="group absolute inset-0 block overflow-hidden bg-ivory-deep">
              <div className="absolute inset-[-8%]">
                <Parallax speed={50} className="h-full" scale={[1.08, 1]}>
                  <div className="relative h-full w-full transition-transform duration-[1.8s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
                    <ProductImage image={p.image} sizes="(min-width: 768px) 60vw, 100vw" />
                  </div>
                </Parallax>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-ivory md:p-10">
                <div>
                  <p className="eyebrow">{p.label}</p>
                  <h3 className="display mt-3 text-[clamp(3.5rem,7vw,7rem)]">{p.title}</h3>
                  <p className={cn("mt-4 max-w-xs text-sm text-ivory/80 transition-all duration-700 md:opacity-0 md:group-hover:opacity-100")}>{p.line}</p>
                </div>
                <span className="eyebrow">{p.count} pieces</span>
              </div>
            </TLink>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
