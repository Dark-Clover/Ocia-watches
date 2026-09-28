"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveClock, VisitorCity } from "@/components/ui/LiveClock";
import { EASE_OUT, useRange } from "@/components/ui/motion";
import { TLink } from "@/components/ui/TLink";
import type { Image } from "@/lib/commerce/types";
import type { HeroModel } from "@/lib/hero";
import { useSiteReady } from "@/lib/ready";
import type { WatchSpec } from "@/lib/watch/spec";
import { cn } from "@/lib/utils";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

type Props = {
  spec: WatchSpec;
  /** Your own 3D watch, if set in lib/hero.ts */
  model: HeroModel | null;
  poster: Image;
  product: { title: string; handle: string; caption: string };
};

/**
 * Cinematic hero. A pinned stage 320vh tall: the watch descends, turns to
 * face you, and the camera travels into the ink dial — which becomes the
 * ink of the next section.
 */
export function Hero({ spec, model, poster, product }: Props) {
  const ref = useRef<HTMLElement>(null);
  const ready = useSiteReady();
  const reduce = useReducedMotion();
  const readyRef = useRef(false);
  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);
  const started = useCallback(() => readyRef.current, []);
  const [canvasReady, setCanvasReady] = useState(false);
  const inView = useInView(ref, { margin: "0px 0px 0px 0px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const spread = useRange(scrollYProgress, [0, 0.4], [0, 18]);
  const leftX = useTransform(spread, (v) => `${-v}vw`);
  const rightX = useTransform(spread, (v) => `${v}vw`);
  const titleOpacity = useRange(scrollYProgress, [0.08, 0.4], [1, 0]);
  const metaOpacity = useRange(scrollYProgress, [0, 0.12], [1, 0]);
  const ink = useRange(scrollYProgress, [0.62, 0.9], [0, 1]);
  const line = useRange(scrollYProgress, [0.66, 0.8, 0.92, 1], [0, 1, 1, 0]);
  const lineY = useRange(scrollYProgress, [0.66, 1], [40, -40]);

  const show = ready ? "show" : "hide";

  return (
    <section ref={ref} className="relative h-[320vh]" data-theme="light" aria-label="Introduction">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ivory">
        {/* soft pool of light behind the watch */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
          style={{ background: "radial-gradient(closest-side, #fbf9f5 0%, rgba(244,240,232,0) 100%)" }}
        />

        {/* Headline sits behind the watch */}
        <h1 className="sr-only">OCIA — Considered details. Everyday presence.</h1>
        <motion.div
          aria-hidden
          style={reduce ? undefined : { opacity: titleOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col justify-center container-x"
        >
          <motion.div style={reduce ? undefined : { x: leftX }} className="overflow-hidden">
            <motion.p
              initial="hide"
              animate={show}
              variants={{ hide: { y: "105%" }, show: { y: "0%", transition: { duration: 1.6, ease: EASE_OUT, delay: 0.9 } } }}
              className="display text-[clamp(3.6rem,13.5vw,15rem)] text-ink"
            >
              Considered
            </motion.p>
          </motion.div>
          <motion.div style={reduce ? undefined : { x: rightX }} className="self-end overflow-hidden text-right">
            <motion.p
              initial="hide"
              animate={show}
              variants={{ hide: { y: "105%" }, show: { y: "0%", transition: { duration: 1.6, ease: EASE_OUT, delay: 1.05 } } }}
              className="display text-[clamp(3.6rem,13.5vw,15rem)] italic text-ink"
            >
              details.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Poster while WebGL spins up; the canvas fades in over it */}
        <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-1000", canvasReady ? "opacity-0" : "opacity-100")}>
          <div className="relative aspect-[4/5] h-[68vh]">
            <NextImage src={poster.url} alt={poster.altText} fill priority unoptimized sizes="60vh" className="object-contain" />
          </div>
        </div>
        <div className={cn("absolute inset-0 transition-opacity duration-1000", canvasReady ? "opacity-100" : "opacity-0")}>
          <HeroCanvas spec={spec} model={model} progress={scrollYProgress} started={started} active={inView} onReady={() => setCanvasReady(true)} />
        </div>

        {/* Meta */}
        <motion.div style={{ opacity: metaOpacity }} className="pointer-events-none absolute inset-x-0 top-24 container-x md:top-28">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ delay: 1.6, duration: 1.2 }}
            className="eyebrow text-stone"
          >
            Edition 01 — Autumn / Winter 2026
          </motion.p>
        </motion.div>

        <motion.div
          style={{ opacity: metaOpacity }}
          className="absolute inset-x-0 bottom-0 container-x flex items-end justify-between gap-6 pb-8 md:pb-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.8, duration: 1.2, ease: EASE_OUT }}
          >
            <p className="serif text-2xl leading-none md:text-3xl">{product.title}</p>
            <p className="mt-2 text-xs text-stone">{product.caption}</p>
            <TLink href={`/products/${product.handle}`} className="eyebrow link-draw mt-4 inline-block pb-1">
              Discover
            </TLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ delay: 2.1, duration: 1.2 }}
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:bottom-10 md:flex"
          >
            <span className="eyebrow text-[0.625rem] text-stone">Scroll</span>
            <span className="relative block h-12 w-px overflow-hidden bg-ink/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_cubic-bezier(0.76,0,0.24,1)_infinite] bg-ink" />
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.9, duration: 1.2, ease: EASE_OUT }}
            className="text-right"
          >
            <VisitorCity className="eyebrow block text-stone" />
            <LiveClock className="serif mt-1 block text-2xl md:text-3xl" />
          </motion.div>
        </motion.div>

        {/* Inside the dial */}
        <motion.div style={{ opacity: ink }} className="pointer-events-none absolute inset-0 bg-ink" />
        <motion.div
          style={{ opacity: line, y: lineY }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center container-x text-center"
        >
          <p className="display text-[clamp(2.4rem,6vw,6rem)] text-ivory">
            Time, kept <em>quietly.</em>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
