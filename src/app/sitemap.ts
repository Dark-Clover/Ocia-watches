import type { MetadataRoute } from "next";
import { commerce } from "@/lib/commerce";
import { INFO } from "@/lib/content/info";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([commerce.getProducts(), commerce.getCollections()]);
  const url = (p: string) => new URL(p, site.url).toString();
  return [
    ...["/", "/about", "/contact"].map((p) => ({ url: url(p) })),
    ...collections.map((c) => ({ url: url(c.path), lastModified: c.updatedAt })),
    ...products.map((p) => ({ url: url(`/products/${p.handle}`), lastModified: p.updatedAt })),
    ...Object.keys(INFO).map((s) => ({ url: url(`/info/${s}`) })),
  ];
}
