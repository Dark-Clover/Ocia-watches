"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { EASE_OUT } from "@/components/ui/motion";
import { site } from "@/lib/site";
import { pad2 } from "@/lib/utils";

/** Brand character, one word at a time, pinned on ink — continuing from inside the dial. */
export function Values() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = site.values.length;
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.min(n - 1, Math.floor(p * n * 0.999))));
  const ring = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const current = site.values[active];

  return (
    <section ref={ref} data-theme="dark" className="relative h-[360vh] bg-ink text-ivory" aria-label="Brand character">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden container-x pb-10 pt-28">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-mist">The character</p>
          <p className="eyebrow tabular-nums text-mist">
            {pad2(active + 1)} / {pad2(n)}
          </p>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          {/* dial ring that fills as you scroll */}
          <svg viewBox="0 0 100 100" className="absolute h-[min(78vw,70vh)] w-[min(78vw,70vh)] -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="49.5" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.15" />
            <motion.circle cx="50" cy="50" r="49.5" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.2" pathLength={1} style={{ pathLength: ring }} />
            {Array.from({ length: 60 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="1.8"
                x2="50"
                y2={i % 15 === 0 ? 5 : i % 5 === 0 ? 3.6 : 2.8}
                stroke="currentColor"
                strokeOpacity={i % 15 === 0 ? 0.7 : 0.18}
                strokeWidth="0.2"
                transform={`rotate(${i * 6} 50 50)`}
              />
            ))}
          </svg>
          <div className="relative text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.word}
                initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -60, filter: "blur(12px)" }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
              >
                <h2 className="display text-[clamp(4rem,15vw,14rem)]">{current.word}.</h2>
                <p className="mx-auto mt-8 max-w-sm text-sm leading-relaxed text-mist">{current.line}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <ul className="grid grid-cols-4 gap-4 border-t border-ivory/15 pt-5">
          {site.values.map((v, i) => (
            <li key={v.word} className={i === active ? "text-ivory" : "text-ivory/30"} style={{ transition: "color .6s" }}>
              <span className="eyebrow text-[0.625rem]">{pad2(i + 1)}</span>
              <span className="serif mt-1 hidden text-xl md:block">{v.word}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
