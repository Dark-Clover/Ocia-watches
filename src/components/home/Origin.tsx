"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef } from "react";
import { TextLink } from "@/components/ui/Button";
import { LiveClock, VisitorCity, VisitorCoordinates } from "@/components/ui/LiveClock";
import { Reveal, SplitReveal, useRange } from "@/components/ui/motion";
import { site } from "@/lib/site";

/** Deterministic, slightly irregular concentric rings — a guilloché-like field. */
function useContours(count = 16) {
  return useMemo(() => {
    const paths: string[] = [];
    for (let i = 0; i < count; i++) {
      const base = 30 + i * 26;
      let d = "";
      for (let s = 0; s <= 180; s++) {
        const t = (s / 180) * Math.PI * 2;
        const r =
          base +
          Math.sin(t * 2 + i * 0.35) * (8 + i * 1.6) +
          Math.sin(t * 3 - i * 0.2) * (5 + i * 0.9) +
          Math.cos(t * 5 + i * 0.5) * (2 + i * 0.4);
        const x = 500 + r * Math.cos(t) * 1.25;
        const y = 500 + r * Math.sin(t);
        d += `${s === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      paths.push(d + "Z");
    }
    return paths;
  }, [count]);
}

export function Origin() {
  const ref = useRef<HTMLElement>(null);
  const contours = useContours();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const draw = useRange(scrollYProgress, [0.1, 0.6], [0, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 0.95]);

  return (
    <section ref={ref} data-theme="dark" className="relative overflow-hidden bg-ink py-32 text-ivory md:py-48" aria-label="The studio">
      <motion.svg
        viewBox="0 0 1000 1000"
        style={{ rotate, scale }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[150vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        {contours.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="#f4f0e8"
            strokeOpacity={i % 4 === 0 ? 0.22 : 0.09}
            strokeWidth={i % 4 === 0 ? 1 : 0.7}
            style={{ pathLength: draw }}
          />
        ))}
        <circle cx="500" cy="500" r="3" fill="#f4f0e8" />
      </motion.svg>

      <div className="relative container-x grid gap-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-mist">The studio</p>
          <SplitReveal as="h2" text={"Designed in\nIslamabad.\nWorn anywhere."} className="display mt-6 text-[clamp(3rem,7.5vw,8rem)]" />
        </div>
        <div className="flex flex-col justify-end gap-12 lg:pb-4">
          <Reveal>
            <p className="serif max-w-lg text-[clamp(1.4rem,2.2vw,2rem)] leading-snug text-ivory/85">
              Every OCIA watch is drawn, tested and finished by a small team in Islamabad who wear them every day. What we make here is meant for
              wherever you are.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="grid grid-cols-3 gap-6 border-t border-ivory/15 pt-6">
              <div>
                <dt className="eyebrow text-[0.625rem] text-mist">Islamabad</dt>
                <dd className="mt-2 text-sm">{site.origin.coordinates}</dd>
              </div>
              <div>
                <dt className="eyebrow text-[0.625rem] text-mist">
                  <VisitorCity fallback="You" />
                </dt>
                <dd className="mt-2 text-sm">
                  <VisitorCoordinates />
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-[0.625rem] text-mist">Your time</dt>
                <dd className="mt-2 text-sm">
                  <LiveClock />
                </dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.15}>
            <TextLink href="/contact?topic=viewing">Visit the studio</TextLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
