import { renderProductImage } from "@/lib/commerce/mock/data";

/**
 * Serves mock product imagery as real image URLs, so components consume
 * `product.images[].url` exactly as they will with Shopify's CDN.
 */
export async function GET(_req: Request, ctx: RouteContext<"/renders/[handle]/[key]/[view]">) {
  const { handle, key, view } = await ctx.params;
  const svg = renderProductImage(handle, key, view.replace(/\.svg$/, ""));
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
