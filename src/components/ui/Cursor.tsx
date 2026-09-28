"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * A small point that follows the pointer. Over `[data-cursor]` elements it
 * opens into a disc with a label ("View", "Drag", "Explore").
 * Hidden on touch devices.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with media query on mount
    setEnabled(mq.matches);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button, input, textarea, select, label");
      setLabel(el?.dataset.cursor ?? null);
      setHovering(!!el && !el.dataset.cursor);
    };
    const leave = () => setHidden(true);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95]"
      style={{ x: sx, y: sy, opacity: hidden ? 0 : 1 }}
    >
      <AnimatePresence mode="popLayout">
        {label ? (
          <motion.div
            key="label"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="eyebrow -ml-12 -mt-12 flex h-24 w-24 items-center justify-center rounded-full bg-ink text-[0.625rem] text-ivory"
          >
            {label}
          </motion.div>
        ) : (
          <motion.div
            key="dot"
            initial={{ scale: 0 }}
            animate={{ scale: hovering ? 3.2 : 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="-ml-1 -mt-1 h-2 w-2 rounded-full bg-white mix-blend-difference"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
