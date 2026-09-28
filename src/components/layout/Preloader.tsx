"use client";

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { markReady } from "@/lib/ready";

const KEY = "ocia:intro";

/**
 * First-visit intro: a bezel draws itself while the count runs to 100, the
 * wordmark rises, and the ivory sheet lifts. Skipped on return visits in the
 * same session and for reduced-motion users.
 */
export function Preloader() {
  const [show, setShow] = useState(true);
  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => String(Math.round(v * 100)).padStart(3, "0"));
  const dash = useTransform(progress, [0, 1], [1, 0]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- skip the intro immediately
      setShow(false);
      markReady();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const controls = animate(progress, 1, { duration: 2.2, ease: [0.65, 0, 0.35, 1] });
    controls.then(() =>
      setTimeout(() => {
        setShow(false);
        document.documentElement.style.overflow = "";
        setTimeout(markReady, 350);
      }, 450),
    );
    return () => controls.stop();
  }, [progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          data-preloader
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory text-ink"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative flex h-[min(56vw,300px)] w-[min(56vw,300px)] items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.25" />
              <motion.circle
                cx="50"
                cy="50"
                r="49"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.35"
                pathLength={1}
                strokeDasharray="1 1"
                style={{ strokeDashoffset: dash }}
              />
              {Array.from({ length: 60 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="3.5"
                  x2="50"
                  y2={i % 5 === 0 ? 6.5 : 4.8}
                  stroke="currentColor"
                  strokeOpacity={i % 5 === 0 ? 0.5 : 0.2}
                  strokeWidth="0.25"
                  transform={`rotate(${i * 6} 50 50)`}
                />
              ))}
            </svg>
            <div className="overflow-hidden">
              <motion.div initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
                <Image src="/brand/wordmark-ink.png" alt="OCIA" width={696} height={165} priority className="h-auto w-[min(30vw,150px)]" />
              </motion.div>
            </div>
          </div>
          <motion.span className="eyebrow absolute bottom-10 left-1/2 -translate-x-1/2 tabular-nums text-stone">{count}</motion.span>
          <span className="eyebrow absolute bottom-10 left-[clamp(1.25rem,4vw,3.5rem)] hidden text-stone sm:block">Lifestyle Essentials</span>
          <span className="eyebrow absolute bottom-10 right-[clamp(1.25rem,4vw,3.5rem)] hidden text-stone sm:block">Edition 01</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
