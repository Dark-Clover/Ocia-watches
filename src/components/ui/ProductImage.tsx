"use client";

import NextImage from "next/image";
import { useState } from "react";
import type { Image } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

/**
 * Commerce image. Shopify CDN images go through next/image optimisation;
 * vector renders (mock catalogue) are served as-is.
 */
export function ProductImage({
  image,
  sizes = "(min-width: 1024px) 40vw, 90vw",
  priority,
  className,
  fit = "cover",
}: {
  image: Image;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <NextImage
      src={image.url}
      alt={image.altText}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={image.url.endsWith(".svg")}
      onLoad={() => setLoaded(true)}
      className={cn(
        "transition-[opacity,filter] duration-1000 ease-[var(--ease-out-expo)]",
        fit === "cover" ? "object-cover" : "object-contain",
        loaded || priority ? "opacity-100 blur-0" : "opacity-0 blur-md",
        className,
      )}
    />
  );
}
