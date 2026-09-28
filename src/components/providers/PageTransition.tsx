"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Cinematic route change: an ink curtain rises with the wordmark, the route
 * swaps underneath, and the curtain lifts away. Query-only changes skip it.
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"idle" | "covering" | "covered">("idle");
  const progress = useMotionValue(0); // 0 hidden below → 1 covering → 2 lifted above
  const y = useTransform(progress, [0, 1, 2], ["100%", "0%", "-100%"]);
  const innerY = useTransform(progress, [0, 1, 2], ["-60%", "0%", "60%"]);
  const target = useRef<string | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname || reduced.current) {
        router.push(href);
        return;
      }
      target.current = url.pathname;
      setPhase("covering");
      progress.set(0);
      animate(progress, 1, { duration: 0.7, ease: EASE }).then(() => {
        setPhase("covered");
        startTransition(() => router.push(href));
      });
    },
    [router, progress],
  );

  // Lift the curtain once the new route has rendered.
  useEffect(() => {
    if (phase !== "covered" || isPending) return;
    if (target.current && pathname !== target.current) return;
    const t = setTimeout(() => {
      animate(progress, 2, { duration: 0.9, ease: EASE }).then(() => {
        setPhase("idle");
        progress.set(0);
      });
    }, 120);
    return () => clearTimeout(t);
  }, [phase, isPending, pathname, progress]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <motion.div
        aria-hidden
        style={{ y, visibility: phase === "idle" ? "hidden" : "visible" }}
        className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-ink"
      >
        <motion.div style={{ y: innerY }} className="flex flex-col items-center gap-6">
          <Image src="/brand/wordmark-white.png" alt="" width={696} height={165} className="h-auto w-40 opacity-90" priority />
          <span className="eyebrow text-mist">Lifestyle Essentials</span>
        </motion.div>
      </motion.div>
    </TransitionContext.Provider>
  );
}
