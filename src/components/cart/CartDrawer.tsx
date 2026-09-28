"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useScrollLock } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/Button";
import { Close, Minus, Plus } from "@/components/ui/icons";
import { EASE_IN_OUT, EASE_OUT } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { TLink } from "@/components/ui/TLink";
import { cn, formatMoney } from "@/lib/utils";
import { useCart } from "./CartProvider";

const FREE_DELIVERY = 50000;

export function CartDrawer() {
  const { cart, isOpen, close, updateItem, removeItem, applyDiscount } = useCart();
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<"idle" | "ok" | "bad">("idle");
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const lines = cart?.lines ?? [];
  const subtotal = Number(cart?.cost.subtotalAmount.amount ?? 0);
  const total = cart?.cost.totalAmount;
  const remaining = Math.max(0, FREE_DELIVERY - subtotal);
  const currency = cart?.cost.subtotalAmount.currencyCode ?? "PKR";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[77]" role="dialog" aria-modal="true" aria-label="Your bag">
          <motion.button
            aria-label="Close bag"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={close}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.9, ease: EASE_IN_OUT }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col bg-ivory text-ink"
            data-lenis-prevent
          >
            <header className="flex items-center justify-between px-8 pb-6 pt-8">
              <div className="flex items-baseline gap-3">
                <h2 className="serif text-4xl">Your bag</h2>
                <span className="eyebrow text-stone">({cart?.totalQuantity ?? 0})</span>
              </div>
              <button onClick={close} className="group -mr-2 p-2" aria-label="Close">
                <Close className="h-6 w-6 transition-transform duration-500 group-hover:rotate-90" />
              </button>
            </header>

            {lines.length > 0 && (
              <div className="px-8 pb-6">
                <p className="text-xs text-stone">
                  {remaining > 0
                    ? `${formatMoney({ amount: String(remaining), currencyCode: currency })} from complimentary express delivery`
                    : "Complimentary express delivery included"}
                </p>
                <div className="mt-3 h-px w-full bg-ink/10">
                  <motion.div
                    className="h-px bg-ink"
                    initial={false}
                    animate={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY) * 100)}%` }}
                    transition={{ duration: 1, ease: EASE_OUT }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-8">
              {lines.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.9, ease: EASE_OUT }}
                  className="flex h-full flex-col items-start justify-center gap-6 pb-24"
                >
                  <p className="serif text-3xl leading-tight">Nothing here yet.<br />The right watch takes a moment.</p>
                  <div className="flex flex-col gap-3">
                    <TLink href="/collections/women" onClick={close} className="eyebrow link-draw pb-1">Shop for her</TLink>
                    <TLink href="/collections/men" onClick={close} className="eyebrow link-draw pb-1">Shop for him</TLink>
                  </div>
                </motion.div>
              ) : (
                <ul className="divide-y divide-ink/10 border-t border-ink/10">
                  <AnimatePresence initial={false}>
                    {lines.map((line, i) => (
                      <motion.li
                        key={line.merchandise.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.2 + i * 0.06, duration: 0.8, ease: EASE_OUT } }}
                        exit={{ opacity: 0, height: 0, transition: { duration: 0.5, ease: EASE_IN_OUT } }}
                        className="flex gap-5 py-6"
                      >
                        <TLink
                          href={`/products/${line.merchandise.product.handle}`}
                          onClick={close}
                          className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-ivory-deep"
                        >
                          <ProductImage image={line.merchandise.image ?? line.merchandise.product.featuredImage} sizes="96px" />
                        </TLink>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="serif text-2xl leading-none">{line.merchandise.product.title}</p>
                              <p className="mt-2 text-xs leading-relaxed text-stone">
                                {line.merchandise.selectedOptions.map((o) => o.value).join(" · ")}
                              </p>
                            </div>
                            <p className="text-sm whitespace-nowrap">{formatMoney(line.cost.totalAmount)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-4">
                            <div className="flex items-center border border-ink/15">
                              <button className="p-2.5 hover:bg-ink/5" aria-label="Decrease quantity" onClick={() => updateItem(line, line.quantity - 1)}>
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs tabular-nums">{line.quantity}</span>
                              <button className="p-2.5 hover:bg-ink/5" aria-label="Increase quantity" onClick={() => updateItem(line, line.quantity + 1)}>
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button onClick={() => removeItem(line)} className="eyebrow text-[0.625rem] text-stone link-draw pb-0.5 hover:text-ink">
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && cart && (
              <footer className="border-t border-ink/10 px-8 pb-8 pt-6">
                <form
                  className="mb-6 flex items-center gap-3 border-b border-ink/20"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCodeState((await applyDiscount(code)) ? "ok" : "bad");
                  }}
                >
                  <label htmlFor="discount" className="sr-only">Discount code</label>
                  <input
                    id="discount"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeState("idle");
                    }}
                    placeholder="Discount code"
                    className="flex-1 bg-transparent py-3 text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-stone focus:outline-none"
                  />
                  <button className="eyebrow py-3 text-[0.625rem]" disabled={!code}>Apply</button>
                </form>
                {codeState !== "idle" && (
                  <p className={cn("-mt-4 mb-5 text-xs", codeState === "ok" ? "text-ink" : "text-stone")}>
                    {codeState === "ok" ? "Code applied." : "That code isn't valid. Try OCIA10."}
                  </p>
                )}
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone">
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(cart.cost.subtotalAmount)}</dd>
                  </div>
                  <div className="flex justify-between text-stone">
                    <dt>Delivery</dt>
                    <dd>{remaining > 0 ? "Calculated at checkout" : "Complimentary"}</dd>
                  </div>
                  <div className="flex justify-between pt-2 text-base">
                    <dt>Total</dt>
                    <dd>{total && formatMoney(total)}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-6 w-full"
                  arrow
                  onClick={() => {
                    window.location.href = cart.checkoutUrl;
                  }}
                  disabled={!cart.checkoutUrl}
                >
                  Checkout
                </Button>
                <p className="mt-4 text-center text-[0.6875rem] text-stone">Duties and taxes included. Complimentary gift wrapping.</p>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
