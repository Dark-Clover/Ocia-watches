"use client";

import { motion, useInView, useMotionValueEvent, useScroll } from "motion/react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { SplitReveal } from "@/components/ui/motion";
import type { WatchSpec } from "@/lib/watch/spec";
import { cn, pad2 } from "@/lib/utils";

const AnatomyCanvas = dynamic(() => import("@/components/three/AnatomyCanvas"), { ssr: false });

const LAYERS = [
  { name: "Sapphire crystal", note: "Scratch-resistant, with an anti-reflective coating on the inside." },
  { name: "Polished bezel", note: "Turned and hand-polished to a mirror finish." },
  { name: "Dauphine hands", note: "Faceted so one side always catches the light." },
  { name: "Sunray dial", note: "Applied indices set into a brushed sunray surface." },
  { name: "Brushed case", note: "316L steel, brushed on the flank and polished at the edges." },
  { name: "Movement", note: "Automatic or Swiss quartz, chosen for how each watch is worn." },
  { name: "Caseback", note: "Engraved and numbered. Screwed down for water resistance." },
];

/** The watch comes apart as you scroll, layer by layer, then closes again. */
export function Anatomy({ spec }: { spec: WatchSpec }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "20% 0px 20% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.max(0, Math.min(LAYERS.length - 1, Math.floor(((p - 0.05) / 0.8) * LAYERS.length))));
  });

  return (
    <section ref={ref} data-theme="light" className="relative h-[380vh] bg-ivory-deep" aria-label="Anatomy of a watch">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">{inView && <AnatomyCanvas spec={spec} progress={scrollYProgress} active={inView} />}</div>

        <div className="pointer-events-none relative flex h-full flex-col justify-between container-x pb-10 pt-28">
          <div className="max-w-md">
            <p className="eyebrow text-stone">Anatomy</p>
            <SplitReveal as="h2" text={"Seven layers,\nnothing extra."} className="display mt-5 text-[clamp(2.5rem,5vw,5rem)]" />
          </div>

          <ol className="ml-auto w-full max-w-xs space-y-3 md:absolute md:right-[clamp(1.25rem,4vw,3.5rem)] md:top-1/2 md:-translate-y-1/2">
            {LAYERS.map((l, i) => (
              <li key={l.name} className={cn("transition-all duration-700", i === active ? "opacity-100" : "opacity-30")}>
                <div className="flex items-baseline gap-4">
                  <span className="eyebrow w-5 text-[0.625rem] tabular-nums">{pad2(i + 1)}</span>
                  <span className={cn("serif transition-all duration-700", i === active ? "text-2xl" : "text-lg")}>{l.name}</span>
                </div>
                <motion.p
                  initial={false}
                  animate={{ height: i === active ? "auto" : 0, opacity: i === active ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden pl-9 text-xs leading-relaxed text-stone"
                >
                  {l.note}
                </motion.p>
              </li>
            ))}
          </ol>

          <p className="eyebrow hidden text-[0.625rem] text-stone md:block">Deodar 40 · Steel · Ivory dial</p>
        </div>
      </div>
    </section>
  );
}
