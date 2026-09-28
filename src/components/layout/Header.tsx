"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Collection } from "@/lib/commerce/types";
import { TLink } from "@/components/ui/TLink";
import { cn } from "@/lib/utils";
import { MenuOverlay } from "./MenuOverlay";
import { SearchOverlay } from "./SearchOverlay";

type Tone = "light" | "dark";

/** Reads the theme of whatever section is currently beneath the header. */
function useToneBelow(offset = 40): Tone {
  const [tone, setTone] = useState<Tone>("light");
  const pathname = usePathname();
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const stack = document.elementsFromPoint(window.innerWidth / 2, offset);
      const el = stack.find((n) => !n.closest("[data-header]"))?.closest<HTMLElement>("[data-theme]");
      setTone(el?.dataset.theme === "dark" ? "dark" : "light");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    const t = setTimeout(check, 1400); // after page transitions settle
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, offset]);
  return tone;
}

export function Header({ collections }: { collections: Collection[] }) {
  const { cart, open: openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const below = useToneBelow();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 80);
    setHidden(y > 240 && y > prev + 2 ? true : y < prev - 2 ? false : hidden);
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close overlays on route change
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const overlay = menuOpen;
  const tone: Tone = overlay ? "dark" : below;
  const dark = tone === "dark";
  const count = cart?.totalQuantity ?? 0;

  return (
    <>
      <motion.header
        data-header
        initial={false}
        animate={{ y: hidden && !overlay && !searchOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-[75] transition-colors duration-700",
          dark ? "text-ivory" : "text-ink",
          scrolled && !overlay && !searchOpen && (dark ? "bg-ink" : "bg-ivory"),
        )}
      >
        <div className="container-x grid h-[72px] grid-cols-[1fr_auto_1fr] items-center md:h-20">
          <nav className="flex items-center gap-8" aria-label="Primary">
            <button
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen((o) => !o);
              }}
              aria-expanded={menuOpen}
              className="group flex items-center gap-3 eyebrow"
            >
              <span className="relative block h-2.5 w-6" aria-hidden>
                <span
                  className={cn(
                    "absolute left-0 h-px w-6 bg-current transition-all duration-500 ease-[var(--ease-out-expo)]",
                    menuOpen ? "top-1/2 rotate-45" : "top-0 group-hover:w-4",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-px w-6 bg-current transition-all duration-500 ease-[var(--ease-out-expo)]",
                    menuOpen ? "top-1/2 -rotate-45" : "top-full",
                  )}
                />
              </span>
              <span className="relative hidden overflow-hidden sm:block">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={menuOpen ? "close" : "menu"}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="block"
                  >
                    {menuOpen ? "Close" : "Menu"}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
            <div className={cn("hidden items-center gap-7 transition-opacity duration-500 lg:flex", overlay && "pointer-events-none opacity-0")}>
              <TLink href="/collections/women" className="eyebrow link-draw pb-0.5">For her</TLink>
              <TLink href="/collections/men" className="eyebrow link-draw pb-0.5">For him</TLink>
            </div>
          </nav>

          <TLink href="/" aria-label="OCIA — home" className="relative block h-5 w-[84px] md:h-6 md:w-[101px]">
            <Image
              src="/brand/wordmark-ink.png"
              alt="OCIA"
              fill
              priority
              sizes="101px"
              className={cn("object-contain transition-opacity duration-700", dark ? "opacity-0" : "opacity-100")}
            />
            <Image
              src="/brand/wordmark-white.png"
              alt=""
              fill
              priority
              sizes="101px"
              className={cn("object-contain transition-opacity duration-700", dark ? "opacity-100" : "opacity-0")}
            />
          </TLink>

          <div className="flex items-center justify-end gap-6 md:gap-8">
            <button
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen((o) => !o);
              }}
              className="eyebrow link-draw hidden pb-0.5 sm:block"
            >
              {searchOpen ? "Close" : "Search"}
            </button>
            <TLink href="/account" className="eyebrow link-draw hidden pb-0.5 lg:block">
              Account
            </TLink>
            <button onClick={openCart} className="eyebrow flex items-center gap-2" aria-label={`Bag, ${count} items`}>
              <span className="link-draw pb-0.5">Bag</span>
              <span className="relative inline-flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full border border-current/40 px-1 text-[0.625rem] tracking-normal">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={count}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <MenuOverlay
        open={menuOpen}
        collections={collections}
        onClose={() => setMenuOpen(false)}
        onSearch={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
