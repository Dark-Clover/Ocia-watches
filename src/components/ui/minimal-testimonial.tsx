"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import type { Image } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

export type Testimonial = { quote: string; name: string; place: string; watch: string; image: Image };

/**
 * Adapted from 21st.dev "minimal testimonial". One quote at a time; the avatars
 * are the dial each person wears, and picking one brings its quote forward.
 */
export function TestimonialsMinimal({ items, className }: { items: Testimonial[]; className?: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div className="relative mb-12 grid">
        {items.map((t, i) => (
          <blockquote
            key={t.name}
            aria-hidden={active !== i}
            className={cn(
              "serif col-start-1 row-start-1 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-snug transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out-expo)]",
              active === i ? "translate-y-0 opacity-100 blur-0" : "pointer-events-none translate-y-4 opacity-0 blur-sm",
            )}
          >
            &ldquo;{t.quote}&rdquo;
          </blockquote>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex -space-x-2">
          {items.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${t.name}, ${t.watch}`}
              aria-pressed={active === i}
              className={cn(
                "relative h-12 w-12 overflow-hidden rounded-full bg-ivory-deep ring-2 ring-ivory transition-all duration-300 ease-out",
                active === i ? "z-10 scale-110" : "grayscale hover:scale-105 hover:grayscale-0",
              )}
            >
              <ProductImage image={t.image} sizes="48px" />
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-line" />

        <div className="relative grid flex-1">
          {items.map((t, i) => (
            <div
              key={t.name}
              aria-hidden={active !== i}
              className={cn(
                "col-start-1 row-start-1 flex flex-col justify-center transition-all duration-500 ease-out",
                active === i ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0",
              )}
            >
              <span className="text-sm font-medium">
                {t.name}, {t.place}
              </span>
              <span className="eyebrow mt-1 text-[0.625rem] text-stone">Wears {t.watch}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
