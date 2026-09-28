"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { TextLink } from "@/components/ui/Button";
import { SplitReveal } from "@/components/ui/motion";
import type { Product } from "@/lib/commerce/types";

/**
 * The collection as a gallery wall: vertical scroll drives a horizontal
 * track on desktop; on touch it becomes a native swipe carousel.
 */
export function CollectionRail({ products }: { products: Product[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      setDesktop(mq.matches);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, -distance]), { stiffness: 140, damping: 30, mass: 0.3 });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const header = (
    <div className="flex items-end justify-between gap-8 container-x">
      <div>
        <p className="eyebrow text-stone">The collection · {products.length} watches</p>
        <SplitReveal as="h2" text="Eight ways to keep time." className="display mt-5 text-[clamp(2.75rem,6vw,6.5rem)]" />
      </div>
      <TextLink href="/collections/all" className="hidden shrink-0 md:inline-flex">View all</TextLink>
    </div>
  );

  const cards = products.map((p, i) => (
    <div key={p.id} className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[26vw]">
      <ProductCard product={p} index={i} sizes="(min-width: 1024px) 26vw, 78vw" />
    </div>
  ));

  if (!desktop) {
    return (
      <section ref={section} data-theme="light" className="bg-ivory py-24" aria-label="The collection">
        {header}
        <div ref={track} className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-4 [scrollbar-width:none]">
          {cards}
        </div>
      </section>
    );
  }

  return (
    <section ref={section} data-theme="light" className="relative bg-ivory" style={{ height: `calc(100vh + ${distance}px)` }} aria-label="The collection">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {header}
        <motion.div ref={track} style={{ x }} className="mt-14 flex w-max gap-6 pl-[clamp(1.25rem,4vw,3.5rem)] pr-[12vw] will-change-transform">
          {cards}
        </motion.div>
        <div className="container-x mt-10">
          <div className="h-px w-full bg-ink/10">
            <motion.div className="h-px bg-ink" style={{ width: bar }} />
          </div>
        </div>
      </div>
    </section>
  );
}
