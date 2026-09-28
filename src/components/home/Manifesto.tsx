"use client";

import { ClipReveal, Parallax, Reveal, ScrollText } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { TextLink } from "@/components/ui/Button";
import type { Image } from "@/lib/commerce/types";

export function Manifesto({ images }: { images: [Image, Image] }) {
  return (
    <section data-theme="light" className="relative overflow-hidden bg-ivory py-32 md:py-48" aria-label="About OCIA">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <p className="eyebrow text-stone">Islamabad</p>
          <p className="mt-4 max-w-[16rem] text-xs leading-relaxed text-stone">
            A small studio making minimal luxury for everyday life. Watches first; more to follow.
          </p>
        </Reveal>
        <div className="lg:col-span-9">
          <ScrollText
            className="display text-[clamp(2.1rem,4.6vw,4.75rem)] leading-[1.02]"
            text="We make watches for women and men who would rather be noticed slowly. Fewer parts on the dial, better materials beneath it, and proportions that will still feel right in twenty years."
          />
          <Reveal delay={0.1} className="mt-12">
            <TextLink href="/about">Read our story</TextLink>
          </Reveal>
        </div>
      </div>

      <div className="container-x mt-28 grid grid-cols-12 items-end gap-4 md:mt-40">
        <div className="col-span-7 md:col-span-5 md:col-start-2">
          <Parallax speed={60}>
            <ClipReveal className="relative aspect-[4/5]">
              <ProductImage image={images[0]} sizes="(min-width: 768px) 40vw, 60vw" />
            </ClipReveal>
          </Parallax>
          <p className="mt-4 text-xs text-stone">Nathia 32 — Sand, ivory dial</p>
        </div>
        <div className="col-span-5 md:col-span-3 md:col-start-9">
          <Parallax speed={-40}>
            <ClipReveal className="relative aspect-[4/5]" delay={0.15}>
              <ProductImage image={images[1]} sizes="(min-width: 768px) 25vw, 40vw" />
            </ClipReveal>
          </Parallax>
          <p className="mt-4 text-xs text-stone">Deodar 40 — Dial detail</p>
        </div>
      </div>
    </section>
  );
}
