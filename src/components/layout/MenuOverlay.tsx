"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useScrollLock } from "@/components/providers/SmoothScroll";
import { LiveClock, VisitorCity } from "@/components/ui/LiveClock";
import { EASE_IN_OUT, EASE_OUT } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import { TLink } from "@/components/ui/TLink";
import type { Collection } from "@/lib/commerce/types";
import { nav, site } from "@/lib/site";
import { cn, pad2 } from "@/lib/utils";

export function MenuOverlay({
  open,
  onClose,
  onSearch,
  collections,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  collections: Collection[];
}) {
  const [active, setActive] = useState(0);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const imageFor = (href: string) => collections.find((c) => c.path === href)?.image ?? null;
  const current = nav.primary[active];
  const preview = imageFor(current.href);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.8, ease: EASE_IN_OUT, delay: 0.15 } }}
          transition={{ duration: 0.9, ease: EASE_IN_OUT }}
          className="fixed inset-0 z-[72] overflow-hidden bg-ink text-ivory"
          data-theme="dark"
          data-lenis-prevent
        >
          <div className="container-x grid h-full grid-rows-[1fr_auto] pb-8 pt-28 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <nav aria-label="Site" className="flex flex-col justify-center">
              <ul className="space-y-1 md:space-y-0">
                {nav.primary.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={{ y: "0%", transition: { duration: 1, ease: EASE_OUT, delay: 0.35 + i * 0.06 } }}
                      exit={{ y: "-110%", transition: { duration: 0.5, ease: EASE_IN_OUT, delay: i * 0.03 } }}
                    >
                      <TLink
                        href={item.href}
                        onClick={onClose}
                        onPointerEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        className="group flex items-baseline gap-5 py-1 md:gap-8"
                      >
                        <span className="eyebrow w-6 text-mist tabular-nums">{pad2(i + 1)}</span>
                        <span
                          className={cn(
                            "display text-[clamp(2.75rem,7.5vw,7.25rem)] transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-4",
                            active === i ? "opacity-100" : "opacity-35",
                          )}
                        >
                          {item.label}
                        </span>
                      </TLink>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6, duration: 1 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="relative hidden items-center justify-center lg:flex"
            >
              <div className="relative aspect-[4/5] h-[min(62vh,640px)] overflow-hidden bg-ink-soft">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={current.href}
                    initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: EASE_OUT }}
                    className="absolute inset-0"
                  >
                    {preview ? (
                      <ProductImage image={preview} sizes="40vw" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-10 p-12 text-center">
                        <Image src="/brand/lockup-white.png" alt="" width={696} height={228} className="h-auto w-56 opacity-90" />
                        <p className="serif text-2xl text-ivory/70">{site.line}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.9, ease: EASE_OUT } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="col-span-full flex flex-wrap items-end justify-between gap-6 border-t border-ivory/15 pt-6 text-mist"
            >
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <button onClick={onSearch} className="eyebrow link-draw pb-0.5 text-ivory">Search</button>
                <a href={`mailto:${site.email}`} className="eyebrow link-draw pb-0.5">{site.email}</a>
                {site.social.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="eyebrow link-draw pb-0.5">
                    {s.label}
                  </a>
                ))}
              </div>
              <p className="eyebrow">
                <VisitorCity /> <LiveClock className="ml-2 text-ivory" />
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
