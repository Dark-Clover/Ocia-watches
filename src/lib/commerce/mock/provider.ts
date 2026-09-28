import "server-only";
import { cookies } from "next/headers";
import type { CommerceProvider } from "../provider";
import type { Cart, CartItem, Product, ProductQuery } from "../types";
import { CURRENCY, MOCK_PRODUCTS } from "./catalog";
import { COLLECTIONS, PRODUCTS, collectionMatches } from "./data";

/**
 * Mock commerce backend. Catalogue is in-memory; the cart is persisted in a
 * cookie (the mock's "database"), so it survives serverless cold starts.
 */

const CART_COOKIE = "ocia_mock_cart";
const latency = () => new Promise((r) => setTimeout(r, 120));

type StoredCart = {
  id: string;
  lines: { id: string; merchandiseId: string; quantity: number }[];
  codes: string[];
};

const DISCOUNTS: Record<string, number> = { OCIA10: 0.1 };

function sortProducts(list: Product[], q: ProductQuery = {}) {
  const meta = new Map(MOCK_PRODUCTS.map((d) => [d.handle, d]));
  const sorted = [...list];
  switch (q.sortKey) {
    case "PRICE":
      sorted.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount));
      break;
    case "CREATED_AT":
      sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
      break;
    case "BEST_SELLING":
      sorted.sort((a, b) => meta.get(a.handle)!.bestSellingRank - meta.get(b.handle)!.bestSellingRank);
      break;
  }
  if (q.reverse) sorted.reverse();
  return q.first ? sorted.slice(0, q.first) : sorted;
}

function search(list: Product[], query?: string) {
  if (!query) return list;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((p) => {
    const hay = [p.title, p.subtitle, p.description, p.gender, ...p.tags, ...p.options.flatMap((o) => o.values.map((v) => v.name))]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

function findVariant(merchandiseId: string) {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === merchandiseId);
    if (variant) return { product, variant };
  }
  return undefined;
}

const money = (n: number) => ({ amount: n.toFixed(1), currencyCode: CURRENCY });

function hydrate(stored: StoredCart): Cart {
  const lines: CartItem[] = stored.lines.flatMap((line) => {
    const hit = findVariant(line.merchandiseId);
    if (!hit) return [];
    const { product, variant } = hit;
    return [
      {
        id: line.id,
        quantity: line.quantity,
        cost: { totalAmount: money(Number(variant.price.amount) * line.quantity) },
        merchandise: {
          id: variant.id,
          title: variant.title,
          selectedOptions: variant.selectedOptions,
          image: variant.image,
          price: variant.price,
          product: { id: product.id, handle: product.handle, title: product.title, featuredImage: product.featuredImage },
        },
      },
    ];
  });
  const subtotal = lines.reduce((s, l) => s + Number(l.cost.totalAmount.amount), 0);
  const rate = stored.codes.reduce((r, c) => Math.max(r, DISCOUNTS[c] ?? 0), 0);
  return {
    id: stored.id,
    checkoutUrl: `/checkout?cart=${encodeURIComponent(stored.id)}`,
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
    lines,
    cost: {
      subtotalAmount: money(subtotal),
      totalAmount: money(subtotal * (1 - rate)),
      totalTaxAmount: null,
    },
    discountCodes: stored.codes.map((code) => ({ code, applicable: code in DISCOUNTS })),
  };
}

async function read(cartId: string): Promise<StoredCart> {
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredCart;
      if (parsed.id === cartId) return parsed;
    } catch {
      /* fall through to a fresh cart */
    }
  }
  return { id: cartId, lines: [], codes: [] };
}

async function write(cart: StoredCart) {
  (await cookies()).set(CART_COOKIE, JSON.stringify(cart), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return hydrate(cart);
}

export const mockProvider: CommerceProvider = {
  name: "mock",

  async getProducts(q = {}) {
    await latency();
    return sortProducts(search(PRODUCTS, q.query), q);
  },
  async getProduct(handle) {
    return PRODUCTS.find((p) => p.handle === handle);
  },
  async getProductRecommendations(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return [];
    const others = PRODUCTS.filter((p) => p.id !== productId);
    // prefer the opposite gender first — recommend a partner piece
    return others
      .sort((a, b) => Number(a.gender === product.gender) - Number(b.gender === product.gender))
      .slice(0, 4);
  },
  async getCollections() {
    return COLLECTIONS;
  },
  async getCollection(handle) {
    return COLLECTIONS.find((c) => c.handle === handle);
  },
  async getCollectionProducts({ handle, ...q }) {
    await latency();
    return sortProducts(search(PRODUCTS.filter((p) => collectionMatches(handle, p.handle)), q.query), q);
  },

  async createCart() {
    return write({ id: `gid://ocia/Cart/${crypto.randomUUID()}`, lines: [], codes: [] });
  },
  async getCart(cartId) {
    return hydrate(await read(cartId));
  },
  async addToCart(cartId, lines) {
    const cart = await read(cartId);
    for (const input of lines) {
      if (!findVariant(input.merchandiseId)?.variant.availableForSale) continue;
      const existing = cart.lines.find((l) => l.merchandiseId === input.merchandiseId);
      if (existing) existing.quantity = Math.min(10, existing.quantity + input.quantity);
      else cart.lines.push({ id: `gid://ocia/CartLine/${crypto.randomUUID()}`, merchandiseId: input.merchandiseId, quantity: input.quantity });
    }
    return write(cart);
  },
  async updateCart(cartId, lines) {
    const cart = await read(cartId);
    for (const input of lines) {
      const line = cart.lines.find((l) => l.id === input.id);
      if (line) line.quantity = Math.max(0, Math.min(10, input.quantity));
    }
    cart.lines = cart.lines.filter((l) => l.quantity > 0);
    return write(cart);
  },
  async removeFromCart(cartId, lineIds) {
    const cart = await read(cartId);
    cart.lines = cart.lines.filter((l) => !lineIds.includes(l.id));
    return write(cart);
  },
  async applyDiscountCodes(cartId, codes) {
    const cart = await read(cartId);
    cart.codes = codes.map((c) => c.trim().toUpperCase()).filter(Boolean);
    return write(cart);
  },

  async getCustomer() {
    return undefined;
  },
  async subscribeToNewsletter(email) {
    await latency();
    return { ok: /.+@.+\..+/.test(email) };
  },
};
