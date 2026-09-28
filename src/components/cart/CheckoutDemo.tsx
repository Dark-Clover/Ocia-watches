"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EASE_OUT } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { completeDemoOrder } from "@/lib/cart/actions";
import type { Cart } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/utils";
import { useCart } from "./CartProvider";

export function CheckoutDemo({ cart }: { cart: Cart | null }) {
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const { reset } = useCart();

  if (done || !cart || cart.lines.length === 0) {
    return (
      <section className="container-x flex min-h-[80vh] flex-col items-start justify-center pb-24 pt-40">
        <p className="eyebrow text-stone">{done ? "Order confirmed" : "Checkout"}</p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE_OUT }} className="display mt-8 text-[clamp(3.5rem,9vw,9rem)]">
          {done ? "Thank you." : "Your bag is empty."}
        </motion.h1>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-stone">
          {done
            ? "This was a demonstration order — nothing was charged. Once Shopify is connected, customers complete payment on Shopify Checkout and receive a confirmation email."
            : "Choose a watch and it will wait for you here."}
        </p>
        <ButtonLink href="/collections/all" className="mt-12">Continue browsing</ButtonLink>
      </section>
    );
  }

  return (
    <section className="container-x grid gap-16 pb-32 pt-40 md:pt-48 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <p className="eyebrow text-stone">Checkout · Demo</p>
        <h1 className="display mt-8 text-[clamp(3rem,7vw,7rem)]">Almost yours.</h1>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-stone">
          In production this step is Shopify Checkout — payments, shipping rates, taxes and order creation are handled there. This page stands in for it while the storefront runs on mock data.
        </p>
        <Button
          className="mt-12"
          arrow
          disabled={pending}
          onClick={async () => {
            setPending(true);
            await completeDemoOrder();
            reset();
            setDone(true);
          }}
        >
          {pending ? "Placing order" : "Place demo order"}
        </Button>
      </div>
      <div className="lg:col-span-5 lg:col-start-8">
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {cart.lines.map((l) => (
            <li key={l.id} className="flex gap-5 py-5">
              <div className="relative aspect-[4/5] w-20 shrink-0 bg-ivory-deep">
                <ProductImage image={l.merchandise.image ?? l.merchandise.product.featuredImage} sizes="80px" />
              </div>
              <div className="flex flex-1 justify-between gap-4">
                <div>
                  <p className="serif text-2xl">{l.merchandise.product.title}</p>
                  <p className="mt-1 text-xs text-stone">{l.merchandise.selectedOptions.map((o) => o.value).join(" · ")} · ×{l.quantity}</p>
                </div>
                <p className="text-sm">{formatMoney(l.cost.totalAmount)}</p>
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-stone"><dt>Subtotal</dt><dd>{formatMoney(cart.cost.subtotalAmount)}</dd></div>
          {cart.discountCodes.filter((d) => d.applicable).map((d) => (
            <div key={d.code} className="flex justify-between text-stone"><dt>Code {d.code}</dt><dd>Applied</dd></div>
          ))}
          <div className="flex justify-between pt-2 text-lg"><dt>Total</dt><dd>{formatMoney(cart.cost.totalAmount)}</dd></div>
        </dl>
      </div>
    </section>
  );
}
