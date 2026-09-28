import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductView } from "@/components/product/ProductView";
import { TextLink } from "@/components/ui/Button";
import { ClipReveal, Parallax, Reveal, SplitReveal } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { commerce } from "@/lib/commerce";
import { defaultVariant, imagesForVariant } from "@/lib/commerce/images";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const products = await commerce.getProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await commerce.getProduct(handle);
  if (!product) return {};
  return {
    title: product.title,
    description: product.seo.description,
    openGraph: { title: product.seo.title, description: product.seo.description },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const query = await searchParams;
  const product = await commerce.getProduct(handle);
  if (!product) notFound();

  // Pre-select from ?case=steel&dial=ink… (shareable configurations)
  const wanted = Object.fromEntries(Object.entries(query).map(([k, v]) => [k.toLowerCase(), String(v).toLowerCase()]));
  const initial =
    product.variants.find((v) => v.selectedOptions.every((o) => !wanted[o.name.toLowerCase()] || wanted[o.name.toLowerCase()] === o.value.toLowerCase())) ??
    defaultVariant(product);

  const related = await commerce.getProductRecommendations(product.id);
  const set = imagesForVariant(product, initial);
  const macro = set.find((i) => i.altText.includes("dial detail")) ?? set[0];
  const flat = set.find((i) => i.altText.includes("linen")) ?? set[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `OCIA ${product.title}`,
    description: product.description,
    brand: { "@type": "Brand", name: "OCIA" },
    image: product.images.slice(0, 5).map((i) => new URL(i.url, site.url).toString()),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div data-theme="light" className="bg-ivory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-[72px] md:pt-28">
        <ProductView key={product.id} product={product} initial={initial} />
      </div>

      {/* Editorial band */}
      <section className="mt-32 overflow-hidden md:mt-48">
        <div className="container-x grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-stone">Up close</p>
            <SplitReveal as="h2" text={`${product.title},\nat arm's length.`} className="display mt-5 text-[clamp(2.75rem,5.5vw,5.5rem)]" />
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-stone">{product.description.split("\n\n")[1] ?? product.description}</p>
            </Reveal>
          </div>
          <div className="grid grid-cols-5 items-end gap-4 md:col-span-7">
            <Parallax speed={50} className="col-span-3">
              <ClipReveal className="relative aspect-[4/5]">
                <ProductImage image={flat} sizes="35vw" />
              </ClipReveal>
            </Parallax>
            <Parallax speed={-30} className="col-span-2">
              <ClipReveal className="relative aspect-[4/5]" delay={0.1}>
                <ProductImage image={macro} sizes="25vw" />
              </ClipReveal>
            </Parallax>
          </div>
        </div>
      </section>

      <section className="py-32 md:py-48" aria-label="You may also like">
        <div className="container-x flex items-end justify-between gap-6">
          <SplitReveal as="h2" text="Worn alongside" className="display text-[clamp(2.5rem,5vw,5rem)]" />
          <TextLink href="/collections/all" className="hidden md:inline-flex">All watches</TextLink>
        </div>
        <div className="container-x mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
          {related.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <ProductCard product={p} sizes="(min-width: 768px) 25vw, 50vw" />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
