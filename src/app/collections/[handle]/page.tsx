import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionView } from "@/components/product/CollectionView";
import { EditorialFigure } from "@/components/ui/EditorialFigure";
import { Reveal, SplitReveal } from "@/components/ui/motion";
import { commerce } from "@/lib/commerce";
import type { ProductSortKey } from "@/lib/commerce/types";
import { editorial } from "@/lib/editorial";

const SORT_MAP: Record<string, { sortKey: ProductSortKey; reverse?: boolean }> = {
  featured: { sortKey: "BEST_SELLING" },
  new: { sortKey: "CREATED_AT", reverse: true },
  "price-asc": { sortKey: "PRICE" },
  "price-desc": { sortKey: "PRICE", reverse: true },
};

export async function generateStaticParams() {
  const collections = await commerce.getCollections();
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = await commerce.getCollection(handle);
  return c ? { title: c.title, description: c.description } : {};
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const { sort: rawSort } = await searchParams;
  const sort = typeof rawSort === "string" && rawSort in SORT_MAP ? rawSort : "featured";
  const [collection, collections] = await Promise.all([commerce.getCollection(handle), commerce.getCollections()]);
  if (!collection) notFound();
  const products = await commerce.getCollectionProducts({ handle, ...SORT_MAP[sort] });

  return (
    <div data-theme="light" className="bg-ivory">
      <header className="container-x grid gap-10 pb-16 pt-36 md:grid-cols-12 md:pb-24 md:pt-48">
        <div className="flex flex-col justify-end md:col-span-8">
          <Reveal>
            <p className="eyebrow text-stone">{collection.kicker}</p>
          </Reveal>
          <SplitReveal as="h1" text={collection.title} className="display mt-6 text-[clamp(4rem,12vw,12rem)]" />
          <Reveal delay={0.2} className="mt-8 max-w-sm">
            <p className="text-sm leading-relaxed text-stone">{collection.description}</p>
          </Reveal>
        </div>
        <EditorialFigure
          photo={editorial.nautilus}
          sizes="(min-width: 768px) 25vw, 1px"
          aspect="aspect-[4/5]"
          priority
          className="hidden md:col-span-3 md:col-start-10 md:block"
        />
      </header>
      <CollectionView collection={collection} collections={collections} products={products} sort={sort} />
    </div>
  );
}
