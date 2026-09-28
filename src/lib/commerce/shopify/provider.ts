import "server-only";
import type { CommerceProvider } from "../provider";
import type { ProductSortKey } from "../types";
import { flatten, normalizeCart, normalizeCollection, normalizeCustomer, normalizeProduct } from "./normalize";
import * as Q from "./queries";

/**
 * Shopify Storefront API provider.
 * Enable with COMMERCE_PROVIDER=shopify plus SHOPIFY_STORE_DOMAIN and
 * SHOPIFY_STOREFRONT_ACCESS_TOKEN (see .env.example).
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const version = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-10";
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
const endpoint = `https://${domain.replace(/^https?:\/\//, "")}/api/${version}/graphql.json`;

type Options = { cache?: RequestCache; tags?: string[] };

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}, opts: Options = {}): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: opts.cache ?? "force-cache",
    next: { tags: opts.tags ?? ["shopify"], revalidate: opts.cache === "no-store" ? undefined : 300 },
  });
  const body = await res.json();
  if (!res.ok || body.errors) {
    throw new Error(`Shopify: ${body.errors?.[0]?.message ?? res.statusText}`);
  }
  return body.data as T;
}

const productSort = (k?: ProductSortKey) => k ?? "RELEVANCE";
const collectionSort = (k?: ProductSortKey) => (k === "CREATED_AT" ? "CREATED" : k ?? "COLLECTION_DEFAULT");

/* eslint-disable @typescript-eslint/no-explicit-any -- raw API payloads */
export const shopifyProvider: CommerceProvider = {
  name: "shopify",

  async getProducts(q = {}) {
    const data = await shopifyFetch<any>(Q.getProductsQuery, {
      query: q.query,
      sortKey: productSort(q.sortKey),
      reverse: q.reverse,
      first: q.first ?? 100,
    }, { tags: ["products"] });
    return flatten<any>(data.products).map(normalizeProduct);
  },
  async getProduct(handle) {
    const data = await shopifyFetch<any>(Q.getProductQuery, { handle }, { tags: ["products"] });
    return data.product ? normalizeProduct(data.product) : undefined;
  },
  async getProductRecommendations(productId) {
    const data = await shopifyFetch<any>(Q.getProductRecommendationsQuery, { productId }, { tags: ["products"] });
    return (data.productRecommendations ?? []).map(normalizeProduct);
  },
  async getCollections() {
    const data = await shopifyFetch<any>(Q.getCollectionsQuery, {}, { tags: ["collections"] });
    return flatten<any>(data.collections).map(normalizeCollection);
  },
  async getCollection(handle) {
    const data = await shopifyFetch<any>(Q.getCollectionQuery, { handle }, { tags: ["collections"] });
    return data.collection ? normalizeCollection(data.collection) : undefined;
  },
  async getCollectionProducts({ handle, sortKey, reverse, first }) {
    const data = await shopifyFetch<any>(Q.getCollectionProductsQuery, {
      handle,
      sortKey: collectionSort(sortKey),
      reverse,
      first: first ?? 100,
    }, { tags: ["collections", "products"] });
    return flatten<any>(data.collection?.products).map(normalizeProduct);
  },

  async createCart() {
    const data = await shopifyFetch<any>(Q.createCartMutation, { lines: [] }, { cache: "no-store" });
    return normalizeCart(data.cartCreate.cart);
  },
  async getCart(cartId) {
    const data = await shopifyFetch<any>(Q.getCartQuery, { cartId }, { cache: "no-store" });
    return data.cart ? normalizeCart(data.cart) : undefined;
  },
  async addToCart(cartId, lines) {
    const data = await shopifyFetch<any>(Q.addToCartMutation, { cartId, lines }, { cache: "no-store" });
    return normalizeCart(data.cartLinesAdd.cart);
  },
  async updateCart(cartId, lines) {
    const data = await shopifyFetch<any>(Q.updateCartMutation, { cartId, lines }, { cache: "no-store" });
    return normalizeCart(data.cartLinesUpdate.cart);
  },
  async removeFromCart(cartId, lineIds) {
    const data = await shopifyFetch<any>(Q.removeFromCartMutation, { cartId, lineIds }, { cache: "no-store" });
    return normalizeCart(data.cartLinesRemove.cart);
  },
  async applyDiscountCodes(cartId, codes) {
    const data = await shopifyFetch<any>(Q.applyDiscountMutation, { cartId, codes }, { cache: "no-store" });
    return normalizeCart(data.cartDiscountCodesUpdate.cart);
  },

  async getCustomer(accessToken) {
    const data = await shopifyFetch<any>(Q.customerQuery, { token: accessToken }, { cache: "no-store" });
    return data.customer ? normalizeCustomer(data.customer) : undefined;
  },
  async subscribeToNewsletter(email) {
    const data = await shopifyFetch<any>(Q.subscribeMutation, { email }, { cache: "no-store" });
    const errors = data.customerCreate?.customerUserErrors ?? [];
    // TAKEN means they're already a customer — treat as subscribed
    return { ok: errors.length === 0 || errors.every((e: any) => e.code === "TAKEN") };
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */
