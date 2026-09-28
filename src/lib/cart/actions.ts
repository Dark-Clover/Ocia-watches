"use server";

import { cookies } from "next/headers";
import { commerce } from "@/lib/commerce";
import type { Cart } from "@/lib/commerce/types";

/**
 * Cart server actions. Provider-agnostic: the cart id lives in a cookie and
 * every mutation goes through `commerce`, so Shopify's cart becomes the source
 * of truth the moment the provider is switched.
 */

const CART_ID = "ocia_cart_id";

async function cartId(create: boolean): Promise<string | undefined> {
  const jar = await cookies();
  const existing = jar.get(CART_ID)?.value;
  if (existing || !create) return existing;
  const cart = await commerce.createCart();
  jar.set(CART_ID, cart.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return cart.id;
}

export async function getCart(): Promise<Cart | null> {
  const id = await cartId(false);
  if (!id) return null;
  return (await commerce.getCart(id)) ?? null;
}

export async function addItem(merchandiseId: string, quantity = 1): Promise<Cart> {
  const id = (await cartId(true))!;
  return commerce.addToCart(id, [{ merchandiseId, quantity }]);
}

export async function updateItem(lineId: string, merchandiseId: string, quantity: number): Promise<Cart | null> {
  const id = await cartId(false);
  if (!id) return null;
  if (quantity <= 0) return commerce.removeFromCart(id, [lineId]);
  return commerce.updateCart(id, [{ id: lineId, merchandiseId, quantity }]);
}

export async function removeItem(lineId: string): Promise<Cart | null> {
  const id = await cartId(false);
  if (!id) return null;
  return commerce.removeFromCart(id, [lineId]);
}

export async function applyDiscount(code: string): Promise<Cart | null> {
  const id = await cartId(false);
  if (!id) return null;
  return commerce.applyDiscountCodes(id, code ? [code] : []);
}

/**
 * Mock checkout only: "places" the order by starting a fresh cart.
 * With Shopify, checkout happens on Shopify's hosted checkoutUrl instead.
 */
export async function completeDemoOrder(): Promise<void> {
  (await cookies()).delete(CART_ID);
}
