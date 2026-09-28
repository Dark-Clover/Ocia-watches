import { Anatomy } from "@/components/home/Anatomy";
import { Closing } from "@/components/home/Closing";
import { CollectionRail } from "@/components/home/CollectionRail";
import { Details } from "@/components/home/Details";
import { GenderSplit } from "@/components/home/GenderSplit";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Origin } from "@/components/home/Origin";
import { Values } from "@/components/home/Values";
import { EditorialFigure } from "@/components/ui/EditorialFigure";
import { TestimonialsMinimal, type Testimonial } from "@/components/ui/minimal-testimonial";
import { commerce } from "@/lib/commerce";
import { defaultVariant, imagesForVariant } from "@/lib/commerce/images";
import type { Image, Product } from "@/lib/commerce/types";
import { editorial } from "@/lib/editorial";
import { heroWatch } from "@/lib/hero";
import { DEFAULT_STYLE, specFromOptions } from "@/lib/watch/spec";

/** Variant with all of these option values, else the default. */
function variantWith(product: Product, values: string[]) {
  return (
    product.variants.find((v) => values.every((val) => v.selectedOptions.some((o) => o.value === val))) ?? defaultVariant(product)
  );
}

/** A view from a variant's image set, matched by a word in the alt text ("dial detail", "caseback"…). */
function view(product: Product, values: string[], word: string): Image {
  const set = imagesForVariant(product, variantWith(product, values));
  return set.find((i) => i.altText.toLowerCase().includes(word)) ?? set[0];
}

export default async function Home() {
  const [products, women, men] = await Promise.all([
    commerce.getProducts({ sortKey: "BEST_SELLING" }),
    commerce.getCollectionProducts({ handle: "women" }),
    commerce.getCollectionProducts({ handle: "men" }),
  ]);
  const byHandle = (h: string) => products.find((p) => p.handle === h)!;
  const deodar = byHandle("deodar");
  const nathia = byHandle("nathia");
  const ayubia = byHandle("ayubia");
  const patriata = byHandle("patriata");
  // PLACEHOLDER quotes — replace with real, attributed customer words before launch.
  const testimonials: Testimonial[] = [
    {
      quote: "I stopped taking it off. It sits flat under a cuff and I only notice it when I want to know the time.",
      name: "Ayesha",
      place: "Lahore",
      watch: "Nathia",
      image: view(nathia, ["Sand", "Ivory", "Ivory leather"], "dial detail"),
    },
    {
      quote: "Plain in the right way. The dial is easy to read at a glance, and the strap has softened nicely.",
      name: "Hamza",
      place: "Islamabad",
      watch: "Deodar",
      image: view(deodar, ["Steel", "Ink", "Ink leather"], "dial detail"),
    },
    {
      quote: "Bought it for a wedding and have worn it every day since. It goes with everything I own.",
      name: "Sana",
      place: "Karachi",
      watch: "Ayubia",
      image: view(ayubia, ["Sand", "Ivory", "Taupe suede"], "dial detail"),
    },
  ];

  // The hero watch is chosen in lib/hero.ts
  const heroProduct = products.find((p) => p.handle === heroWatch.product) ?? deodar;
  const heroVariant = variantWith(heroProduct, heroWatch.options);
  const heroSpec = specFromOptions(heroProduct.watchStyle ?? DEFAULT_STYLE, heroVariant.selectedOptions);
  const heroSize = heroVariant.selectedOptions.find((o) => o.name === "Size")?.value.replace(/\s*mm$/, "");
  const anatomySpec = specFromOptions(deodar.watchStyle ?? DEFAULT_STYLE, variantWith(deodar, ["Steel", "Ivory", "40 mm", "Ivory leather"]).selectedOptions);

  return (
    <>
      <Hero
        spec={heroSpec}
        model={heroWatch.model}
        poster={heroVariant.image ?? heroProduct.featuredImage}
        product={{
          title: heroSize ? `${heroProduct.title} ${heroSize}` : heroProduct.title,
          handle: heroProduct.handle,
          caption: heroWatch.caption,
        }}
      />
      <Values />
      <Manifesto images={[view(nathia, ["Sand", "Ivory", "Ivory leather"], "linen"), view(deodar, ["Steel", "Ink"], "dial detail")]} />
      <GenderSplit
        panels={[
          {
            label: "Women",
            title: "For her",
            href: "/collections/women",
            count: women.length,
            image: view(nathia, ["Sand", "Ivory", "Ivory leather"], "linen"),
            line: "Slim cases from 32 mm, quiet dials, and straps that sit close.",
          },
          {
            label: "Men",
            title: "For him",
            href: "/collections/men",
            count: men.length,
            image: view(deodar, ["Steel", "Ink", "Ink leather"], "linen"),
            line: "Measured proportions from 36 mm, built for every day.",
          },
        ]}
      />
      <CollectionRail products={products} />
      <Anatomy spec={anatomySpec} />
      <Details
        details={[
          {
            image: view(patriata, ["Ink", "Ink"], "dial detail"),
            title: "Sunken registers",
            text: "On Patriata the counters are set below the dial surface, so they read clearly without adding height.",
          },
          {
            image: view(deodar, ["Steel", "Ivory"], "crown"),
            title: "A signed crown",
            text: "Knurled for grip, sized to sit close to the case so it never presses into the wrist.",
          },
          {
            image: view(ayubia, ["Sand", "Ivory"], "caseback"),
            title: "Engraved and numbered",
            text: "Every caseback carries the OCIA name, Islamabad, and a serial number of its own.",
          },
        ]}
      />
      <section data-theme="light" className="bg-ivory py-32 md:py-48" aria-label="Worn by">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="eyebrow text-stone">Worn every day</p>
            <EditorialFigure photo={editorial.wrist} sizes="(min-width: 768px) 22vw, 60vw" aspect="aspect-square" className="mt-10 w-3/5 md:w-full" />
          </div>
          <TestimonialsMinimal items={testimonials} className="self-center md:col-span-7 md:col-start-6" />
        </div>
      </section>
      <section data-theme="light" className="bg-ivory pb-32 md:pb-48" aria-label="Presentation">
        <EditorialFigure photo={editorial.presentation} sizes="100vw" aspect="aspect-[4/5] md:aspect-[21/9]" speed={60} captionClassName="container-x" />
      </section>
      <Origin />
      <Closing />
    </>
  );
}
