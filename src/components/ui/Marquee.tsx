"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, type ReactNode } from "react";

/** Endless horizontal band that speeds up and reverses with scroll velocity. */
export function Marquee({ children, speed = 3, className }: { children: ReactNode; speed?: number; className?: string }) {
  const base = useMotionValue(0);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const direction = useRef(1);
  // wrap into [-50%, 0%) — the track holds two copies of the content
  const x = useTransform(base, (v) => `${((((v % 50) + 50) % 50) - 50).toFixed(3)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    const move = direction.current * speed * (delta / 1000) * (1 + Math.abs(f));
    base.set(base.get() - move);
  });

  return (
    <div className={className} aria-hidden>
      <div className="overflow-hidden whitespace-nowrap">
        <motion.div className="flex w-max" style={{ x }}>
          <div className="flex shrink-0">{children}</div>
          <div className="flex shrink-0">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
