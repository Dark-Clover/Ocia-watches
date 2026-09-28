"use client";

import { ClipReveal, Parallax, Reveal, SplitReveal } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import type { Image } from "@/lib/commerce/types";

type Detail = { image: Image; title: string; text: string };

/** Macro details at different depths — the page moves like a camera slider. */
export function Details({ details }: { details: [Detail, Detail, Detail] }) {
  const [a, b, c] = details;
  return (
    <section data-theme="light" className="overflow-hidden bg-ivory py-32 md:py-48" aria-label="Details">
      <div className="container-x">
        <p className="eyebrow text-stone">In the details</p>
        <SplitReveal as="h2" text={"Look closer.\nIt holds up."} className="display mt-5 text-[clamp(3rem,8vw,8.5rem)]" />
      </div>

      <div className="container-x mt-20 grid grid-cols-12 gap-x-4 gap-y-20 md:mt-32">
        <div className="col-span-12 md:col-span-6">
          <Parallax speed={40}>
            <ClipReveal className="relative aspect-[4/5]">
              <ProductImage image={a.image} sizes="(min-width: 768px) 50vw, 100vw" />
            </ClipReveal>
          </Parallax>
          <Caption {...a} n="01" />
        </div>
        <div className="col-span-8 col-start-5 md:col-span-4 md:col-start-9 md:mt-72">
          <Parallax speed={-60}>
            <ClipReveal className="relative aspect-[4/5]" delay={0.1}>
              <ProductImage image={b.image} sizes="(min-width: 768px) 33vw, 66vw" />
            </ClipReveal>
          </Parallax>
          <Caption {...b} n="02" />
        </div>
        <div className="col-span-10 md:col-span-5 md:col-start-3 md:-mt-40">
          <Parallax speed={30}>
            <ClipReveal className="relative aspect-[4/5]" delay={0.1}>
              <ProductImage image={c.image} sizes="(min-width: 768px) 42vw, 83vw" />
            </ClipReveal>
          </Parallax>
          <Caption {...c} n="03" />
        </div>
      </div>
    </section>
  );
}

function Caption({ title, text, n }: Detail & { n: string }) {
  return (
    <Reveal className="mt-6 flex gap-6">
      <span className="eyebrow pt-2 text-[0.625rem] text-stone">{n}</span>
      <div>
        <h3 className="serif text-3xl">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone">{text}</p>
      </div>
    </Reveal>
  );
}
