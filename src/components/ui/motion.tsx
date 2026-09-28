"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Children, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

/** Fade and rise into view, once. */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, ease: EASE_OUT, delay }}
    >
      {children}
    </Comp>
  );
}

/**
 * Masked word-by-word reveal. Pass a string; `\n` forces a line break.
 * Renders real text for SEO/screen readers.
 */
export function SplitReveal({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 0.06,
  animate: play,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  delay?: number;
  stagger?: number;
  /** Control playback manually; otherwise plays on view */
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");
  let i = 0;
  const trigger =
    play === undefined
      ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -8% 0px" } }
      : { animate: play ? "show" : "hide" };
  return (
    <Tag className={className} aria-label={text.replace(/\n/g, " ")}>
      <motion.span initial={reduce ? "show" : "hide"} {...trigger} aria-hidden className="block">
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.split(" ").map((word, wi) => {
              const idx = i++;
              return (
                <span key={wi} className="inline-block overflow-hidden pb-[0.22em] -mb-[0.22em] align-top">
                  <motion.span
                    className="inline-block will-change-transform"
                    variants={{
                      hide: { y: "110%", rotate: 4 },
                      show: {
                        y: "0%",
                        rotate: 0,
                        transition: { duration: 1.1, ease: EASE_OUT, delay: delay + idx * stagger },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                  {wi < line.split(" ").length - 1 && " "}
                </span>
              );
            })}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** Moves children against the scroll for depth. `speed` in px of travel. */
export function Parallax({
  children,
  speed = 80,
  className,
  scale,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  scale?: [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const s = useTransform(scrollYProgress, [0, 1], scale ?? [1, 1]);
  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={reduce ? undefined : { y, scale: s }} className="relative h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Image mask that opens from the bottom as it enters the viewport. */
export function ClipReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.4, ease: EASE_IN_OUT, delay }}
    >
      <motion.div
        className="relative h-full w-full"
        initial={reduce ? false : { scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.8, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Stagger direct children on view. */
export function Stagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => (
        <Reveal delay={i * gap}>{child}</Reveal>
      ))}
    </div>
  );
}

/** Words fade from faint to full as the paragraph scrolls through. */
export function ScrollText({ text, className, progress }: { text: string; className?: string; progress?: MotionValue<number> }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const p = progress ?? scrollYProgress;
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} progress={p} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useRange(progress, range, [0.14, 1]);
  return (
    <motion.span aria-hidden style={{ opacity }} className="inline-block pr-[0.25em]">
      {children}
    </motion.span>
  );
}

/**
 * Clamped, JS-driven range mapping. Motion can hand plain `useTransform`
 * mappings to native ScrollTimeline, which doesn't clamp outside the input
 * range in every browser — this keeps ranged fades exact.
 */
export function useRange(value: MotionValue<number>, input: number[], output: number[]) {
  return useTransform(value, (v) => {
    if (v <= input[0]) return output[0];
    for (let i = 1; i < input.length; i++) {
      if (v <= input[i]) {
        const t = (v - input[i - 1]) / (input[i] - input[i - 1]);
        return output[i - 1] + (output[i] - output[i - 1]) * t;
      }
    }
    return output[output.length - 1];
  });
}

export function useSmooth(value: MotionValue<number>, stiffness = 120, damping = 30) {
  return useSpring(value, { stiffness, damping, mass: 0.4 });
}
