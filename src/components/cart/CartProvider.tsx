"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import * as actions from "@/lib/cart/actions";
import type { Cart, CartItem, Product, ProductVariant } from "@/lib/commerce/types";

type CartContext = {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  open: () => void;
  close: () => void;
  addItem: (product: Product, variant: ProductVariant) => Promise<void>;
  updateItem: (line: CartItem, quantity: number) => void;
  removeItem: (line: CartItem) => void;
  applyDiscount: (code: string) => Promise<boolean>;
  /** Forget the local cart (after checkout completes) */
  reset: () => void;
};

const Ctx = createContext<CartContext | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

const sum = (lines: CartItem[], pick: (l: CartItem) => number) => lines.reduce((s, l) => s + pick(l), 0);

function recompute(cart: Cart, lines: CartItem[]): Cart {
  const currencyCode = cart.cost.subtotalAmount.currencyCode;
  const subtotal = sum(lines, (l) => Number(l.merchandise.price.amount) * l.quantity);
  return {
    ...cart,
    lines,
    totalQuantity: sum(lines, (l) => l.quantity),
    cost: {
      ...cart.cost,
      subtotalAmount: { amount: subtotal.toFixed(1), currencyCode },
      totalAmount: { amount: subtotal.toFixed(1), currencyCode },
    },
  };
}

const emptyCart = (currencyCode: string): Cart => ({
  id: "optimistic",
  checkoutUrl: "",
  totalQuantity: 0,
  lines: [],
  cost: {
    subtotalAmount: { amount: "0", currencyCode },
    totalAmount: { amount: "0", currencyCode },
    totalTaxAmount: null,
  },
  discountCodes: [],
});

/**
 * Client cart state. The server (mock or Shopify) is the source of truth;
 * the UI updates optimistically and reconciles with each action's response.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    actions.getCart().then(setCart).catch(() => setCart(null));
  }, []);

  const addItem = useCallback(async (product: Product, variant: ProductVariant) => {
    setCart((prev) => {
      const base = prev ?? emptyCart(variant.price.currencyCode);
      const existing = base.lines.find((l) => l.merchandise.id === variant.id);
      const lines = existing
        ? base.lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l))
        : [
            ...base.lines,
            {
              id: `optimistic-${variant.id}`,
              quantity: 1,
              cost: { totalAmount: variant.price },
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
      return recompute(base, lines);
    });
    setOpen(true);
    const next = await actions.addItem(variant.id);
    setCart(next);
  }, []);

  const updateItem = useCallback((line: CartItem, quantity: number) => {
    setCart((prev) =>
      prev ? recompute(prev, prev.lines.flatMap((l) => (l.id !== line.id ? [l] : quantity > 0 ? [{ ...l, quantity }] : []))) : prev,
    );
    startTransition(async () => {
      const next = await actions.updateItem(line.id, line.merchandise.id, quantity);
      if (next) setCart(next);
    });
  }, []);

  const removeItem = useCallback((line: CartItem) => {
    setCart((prev) => (prev ? recompute(prev, prev.lines.filter((l) => l.id !== line.id)) : prev));
    startTransition(async () => {
      const next = await actions.removeItem(line.id);
      if (next) setCart(next);
    });
  }, []);

  const applyDiscount = useCallback(async (code: string) => {
    const next = await actions.applyDiscount(code);
    if (next) setCart(next);
    return !!next?.discountCodes.some((d) => d.applicable);
  }, []);

  const value = useMemo(
    () => ({ cart, isOpen, isPending, open: () => setOpen(true), close: () => setOpen(false), addItem, updateItem, removeItem, applyDiscount, reset: () => setCart(null) }),
    [cart, isOpen, isPending, addItem, updateItem, removeItem, applyDiscount],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
