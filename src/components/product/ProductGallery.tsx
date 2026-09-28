"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/components/providers/SmoothScroll";
import { Close, Expand, Rotate3D } from "@/components/ui/icons";
import { EASE_IN_OUT, EASE_OUT } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/ProductImage";
import type { Image } from "@/lib/commerce/types";
import type { WatchSpec } from "@/lib/watch/spec";
import { cn, pad2 } from "@/lib/utils";

const ViewerCanvas = dynamic(() => import("@/components/three/ViewerCanvas"), { ssr: false });

/**
 * Desktop: full-height images stacked in a scrolling column with a live index.
 * Mobile: a native swipe gallery. Any image opens a zoomable lightbox;
 * the 3D viewer shows the selected configuration.
 */
export function ProductGallery({ images, spec, title }: { images: Image[]; spec: WatchSpec | null; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [viewer, setViewer] = useState(false);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { threshold: 0.55 },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [images]);

  return (
    <div className="relative">
      {/* Mobile swipe */}
      <div ref={strip} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:hidden">
        {images.map((img, i) => (
          <div
            key={img.url}
            data-index={i}
            ref={(el) => {
              items.current[i] = el;
            }}
            className="relative aspect-[4/5] w-full shrink-0 snap-center bg-ivory-deep"
            onClick={() => setLightbox(i)}
          >
            <ProductImage image={img} priority={i === 0} sizes="100vw" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between container-x py-4 lg:hidden">
        <span className="eyebrow text-[0.625rem] tabular-nums text-stone">
          {pad2(active + 1)} / {pad2(images.length)}
        </span>
        <div className="flex gap-1.5">
          {images.map((_, i) => (
            <span key={i} className={cn("h-px w-5 transition-colors", i === active ? "bg-ink" : "bg-ink/20")} />
          ))}
        </div>
      </div>

      {/* Desktop stack */}
      <div className="hidden grid-cols-[48px_1fr] gap-6 lg:grid">
        <div className="sticky top-28 flex h-fit flex-col gap-3 pt-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              aria-label={`Show image ${i + 1}`}
              onClick={() => items.current[i + images.length]?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className={cn("relative aspect-[4/5] w-12 overflow-hidden bg-ivory-deep transition-opacity", i === active ? "opacity-100 ring-1 ring-ink" : "opacity-50 hover:opacity-100")}
            >
              <ProductImage image={img} sizes="48px" />
            </button>
          ))}
          {spec && (
            <button
              onClick={() => setViewer(true)}
              aria-label="View in 3D"
              className="mt-2 flex aspect-square w-12 items-center justify-center border border-ink/20 transition-colors hover:bg-ink hover:text-ivory"
            >
              <Rotate3D className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="space-y-3">
          {images.map((img, i) => (
            <motion.div
              key={img.url}
              data-index={i}
              ref={(el) => {
                items.current[i + images.length] = el;
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="group relative aspect-[4/5] overflow-hidden bg-ivory-deep"
              data-cursor="Zoom"
              onClick={() => setLightbox(i)}
            >
              <div className="absolute inset-0 transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]">
                <ProductImage image={img} priority={i === 0} sizes="(min-width: 1024px) 55vw, 100vw" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {spec && (
        <button
          onClick={() => setViewer(true)}
          className="eyebrow absolute right-4 top-4 flex items-center gap-2 bg-ivory/90 px-3 py-2.5 text-[0.625rem] lg:hidden"
        >
          <Rotate3D className="h-4 w-4" /> 3D
        </button>
      )}

      <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
      <AnimatePresence>{viewer && spec && <Viewer spec={spec} title={title} onClose={() => setViewer(false)} />}</AnimatePresence>
    </div>
  );
}

function Lightbox({ images, index, onClose, onIndex }: { images: Image[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null;
  const [zoom, setZoom] = useState(false);
  const ox = useMotionValue(0);
  const oy = useMotionValue(0);
  const x = useSpring(ox, { stiffness: 200, damping: 30 });
  const y = useSpring(oy, { stiffness: 200, damping: 30 });
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(((index ?? 0) + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex(((index ?? 0) - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, images.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[78] bg-ivory"
          initial={{ clipPath: "inset(50% 0% 50% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(50% 0% 50% 0%)" }}
          transition={{ duration: 0.8, ease: EASE_IN_OUT }}
        >
          <div
            className={cn("absolute inset-0 overflow-hidden", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
            onClick={() => {
              setZoom((z) => !z);
              ox.set(0);
              oy.set(0);
            }}
            onPointerMove={(e) => {
              if (!zoom) return;
              const r = e.currentTarget.getBoundingClientRect();
              ox.set(-((e.clientX - r.left) / r.width - 0.5) * r.width * 0.9);
              oy.set(-((e.clientY - r.top) / r.height - 0.5) * r.height * 0.9);
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: zoom ? 2 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
                style={{ x, y }}
              >
                <ProductImage image={images[index]} sizes="100vw" fit="contain" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between container-x py-6">
            <span className="eyebrow tabular-nums text-stone">
              {pad2(index + 1)} / {pad2(images.length)}
            </span>
            <button onClick={onClose} className="pointer-events-auto p-2" aria-label="Close">
              <Close className="h-6 w-6" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 pb-8">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => onIndex(i)}
                aria-label={`Image ${i + 1}`}
                className={cn("relative aspect-[4/5] w-10 overflow-hidden bg-ivory-deep transition-opacity", i === index ? "ring-1 ring-ink" : "opacity-50")}
              >
                <ProductImage image={img} sizes="40px" />
              </button>
            ))}
          </div>
          <p className="eyebrow pointer-events-none absolute bottom-24 left-1/2 hidden -translate-x-1/2 text-[0.625rem] text-stone md:block">
            <Expand className="mr-2 inline h-3 w-3" />
            Click to zoom · Arrow keys to browse
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Viewer({ spec, title, onClose }: { spec: WatchSpec; title: string; onClose: () => void }) {
  useScrollLock(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} in 3D`}
      className="fixed inset-0 z-[78] bg-ivory-deep"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      data-cursor="Drag"
      data-lenis-prevent
    >
      <ViewerCanvas spec={spec} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between container-x py-6">
        <div>
          <p className="eyebrow text-stone">In three dimensions</p>
          <p className="serif mt-2 text-4xl">{title}</p>
        </div>
        <button onClick={onClose} className="pointer-events-auto p-2" aria-label="Close 3D viewer" data-cursor="">
          <Close className="h-6 w-6" />
        </button>
      </div>
      <p className="eyebrow pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.625rem] text-stone">
        Drag to turn · Scroll to look closer · The hands show your local time
      </p>
    </motion.div>
  );
}
