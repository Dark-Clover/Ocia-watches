"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccordionItem = { title: string; content: ReactNode };

export function Accordion({ items, className, defaultOpen = -1 }: { items: AccordionItem[]; className?: string; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn("border-t border-current/15", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title} className="border-b border-current/15">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between py-5 text-left eyebrow"
              >
                {item.title}
                <span className="relative block h-3 w-3" aria-hidden>
                  <span className="absolute left-0 top-1/2 h-px w-3 bg-current" />
                  <span
                    className={cn(
                      "absolute left-1/2 top-0 h-3 w-px bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]",
                      isOpen && "rotate-90 scale-y-0",
                    )}
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-7 text-sm leading-relaxed text-current/75">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
