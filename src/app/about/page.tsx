import type { Metadata } from "next";
import Image from "next/image";
import { Origin } from "@/components/home/Origin";
import { ButtonLink } from "@/components/ui/Button";
import { EditorialFigure } from "@/components/ui/EditorialFigure";
import FlexCarousel, { type FlexCarouselItem } from "@/components/ui/FlexCarousel";
import { ClipReveal, Parallax, Reveal, ScrollText, SplitReveal } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { commerce } from "@/lib/commerce";
import { imagesForVariant } from "@/lib/commerce/images";
import { editorial } from "@/lib/editorial";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The house",
  description: "OCIA is a minimal luxury house based in Islamabad, Pakistan. Watches for women and men, designed for everyday life.",
};

/** Which pieces appear in the gallery, and the view of each. */
const GALLERY: { handle: string; values: string[]; view: string }[] = [
  { handle: "deodar", values: ["Steel", "Ink", "Ink leather"], view: "linen" },
  { handle: "nathia", values: ["Sand", "Ivory", "Ivory leather"], view: "linen" },
  { handle: "patriata", values: ["Ink", "Ink", "Link bracelet"], view: "dial detail" },
  { handle: "ayubia", values: ["Sand", "Ivory", "Taupe suede"], view: "linen" },
  { handle: "bhurban", values: ["Steel", "White", "Milanese mesh"], view: "linen" },
  { handle: "changla", values: ["Ink", "Ink"], view: "dial detail" },
  { handle: "galyat", values: ["Steel", "White", "Taupe suede"], view: "linen" },
  { handle: "ocia-pair", values: ["Steel", "Ink"], view: "linen" },
];

const NEXT = [
  { name: "Watches", note: "For women and men", status: "Now" },
  { name: "Jewellery", note: "Rings, cuffs and chains", status: "2027" },
  { name: "Wallets", note: "Leather, cut to be carried", status: "2027" },
  { name: "Footwear", note: "A small, considered edit", status: "Later" },
];

export default async function AboutPage() {
  const products = await commerce.getProducts();
  const byHandle = (h: string) => products.find((p) => p.handle === h);
  const ayubia = byHandle("ayubia")!;
  const deodar = byHandle("deodar")!;
  const a = imagesForVariant(ayubia, ayubia.variants[0]);
  const d = imagesForVariant(deodar, deodar.variants[0]);

  const gallery: FlexCarouselItem[] = GALLERY.flatMap(({ handle, values, view }) => {
    const product = byHandle(handle);
    if (!product) return [];
    const variant =
      product.variants.find((v) => values.every((val) => v.selectedOptions.some((o) => o.value === val))) ?? product.variants[0];
    const set = imagesForVariant(product, variant);
    const image = set.find((i) => i.altText.includes(view)) ?? set[0];
    const look = variant.selectedOptions.filter((o) => o.name === "Case" || o.name === "Dial");
    return [
      {
        src: image.url,
        alt: image.altText,
        title: product.title,
        subtitle: look.map((o) => (o.name === "Dial" ? `${o.value} dial` : o.value)).join(" · "),
      },
    ];
  });

  return (
    <div data-theme="light" className="bg-ivory">
      <section className="container-x pb-24 pt-40 md:pb-40 md:pt-52">
        <Reveal>
          <p className="eyebrow text-stone">The house</p>
        </Reveal>
        <SplitReveal as="h1" text={"Made in Islamabad.\nDesigned for\neveryday life."} className="display mt-8 text-[clamp(3.5rem,10vw,11rem)]" />
      </section>

      <section className="container-x grid gap-12 pb-32 md:grid-cols-12 md:pb-48">
        <div className="md:col-span-5">
          <Parallax speed={60}>
            <ClipReveal className="relative aspect-[4/5]">
              <ProductImage image={a.find((i) => i.altText.includes("linen")) ?? a[0]} sizes="(min-width: 768px) 40vw, 100vw" priority />
            </ClipReveal>
          </Parallax>
        </div>
        <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
          <ScrollText
            className="serif text-[clamp(1.6rem,2.6vw,2.5rem)] leading-snug"
            text="OCIA is a small house based in Islamabad, making minimal luxury for everyday life. What we make is contemporary, restrained, and meant to be worn every day."
          />
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-md text-sm leading-relaxed text-stone">
              We began with watches because a watch is the most personal thing most of us wear. It is with you in every meeting, every
              journey, every quiet morning. It should be good enough to forget about, and good enough to notice again.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-32 md:pb-48" aria-label="In the light">
        <EditorialFigure photo={editorial.travertine} sizes="100vw" aspect="aspect-[4/5] md:aspect-[21/9]" speed={60} captionClassName="container-x" />
      </section>

      <section className="pb-32 md:pb-48" aria-label="The collection">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-stone">The collection</p>
            <SplitReveal as="h2" text="Eight watches, one hand." className="display mt-6 text-[clamp(2.75rem,6vw,6rem)]" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-stone">Hover to look closer, click to bring a piece forward. Arrow keys work too.</p>
        </div>
        <div className="container-x mt-14">
          <div className="relative h-[560px] w-full md:h-[640px]">
            <FlexCarousel items={gallery} preset="liquid" intro="rise" cardHeight={0.5} gap={12} squeeze={0.2} focusOnClick captions />
          </div>
        </div>
      </section>

      <section data-theme="dark" className="bg-ink py-32 text-ivory md:py-48">
        <div className="container-x">
          <p className="eyebrow text-mist">What we hold to</p>
          <div className="mt-16 grid gap-px bg-ivory/10 md:grid-cols-4">
            {site.values.map((v, i) => (
              <Reveal key={v.word} delay={i * 0.08} className="bg-ink p-0 pb-10 md:p-8 md:pb-16">
                <span className="eyebrow text-[0.625rem] text-mist">0{i + 1}</span>
                <h2 className="display mt-10 text-6xl md:text-7xl">{v.word}</h2>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">{v.line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-16 py-32 md:grid-cols-2 md:py-48">
        <div>
          <p className="eyebrow text-stone">Voice</p>
          <SplitReveal as="h2" text={"Calm, assured,\ndirect."} className="display mt-6 text-[clamp(3rem,6vw,6rem)]" />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-stone">
              We lead with design, materials and use. No exaggerated claims, no noise. Short headlines, and product photography that is
              given room to breathe.
            </p>
          </Reveal>
        </div>
        <Parallax speed={-40}>
          <ClipReveal className="relative aspect-[4/5]">
            <ProductImage image={d.find((i) => i.altText.includes("dial detail")) ?? d[0]} sizes="(min-width: 768px) 50vw, 100vw" />
          </ClipReveal>
        </Parallax>
      </section>

      <section className="container-x pb-32 md:pb-48">
        <p className="eyebrow text-stone">Beyond the watch</p>
        <SplitReveal as="h2" text="Minimal luxury, across categories." className="display mt-6 max-w-5xl text-[clamp(2.75rem,6vw,6rem)]" />
        <ul className="mt-16 border-t border-ink/15">
          {NEXT.map((n, i) => (
            <Reveal as="li" key={n.name} delay={i * 0.05} className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-ink/15 py-8 md:grid-cols-[6rem_1fr_1fr_auto]">
              <span className="eyebrow text-[0.625rem] text-stone">0{i + 1}</span>
              <span className="display text-5xl transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 md:text-6xl">{n.name}</span>
              <span className="hidden text-sm text-stone md:block">{n.note}</span>
              <span className={`eyebrow text-[0.625rem] ${n.status === "Now" ? "text-ink" : "text-stone"}`}>{n.status}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      <Origin />

      <section className="container-x flex flex-col items-center py-32 text-center md:py-48">
        <Image src="/brand/lockup-ink.png" alt="OCIA — Lifestyle Essentials" width={696} height={228} className="h-auto w-56 md:w-72" />
        <p className="serif mt-12 text-3xl">{site.line}</p>
        <ButtonLink href="/collections/all" className="mt-12">
          Explore the collection
        </ButtonLink>
      </section>
    </div>
  );
}
