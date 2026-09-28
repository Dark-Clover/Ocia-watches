"use client";

import NextImage from "next/image";
import { ClipReveal, Parallax } from "@/components/ui/motion";
import type { EditorialPhoto } from "@/lib/editorial";
import { cn } from "@/lib/utils";

/** Editorial photo with the site's clip reveal, a slow parallax, and a credit line underneath. */
export function EditorialFigure({
  photo,
  sizes,
  aspect,
  speed = 30,
  priority,
  className,
  captionClassName,
}: {
  photo: EditorialPhoto;
  sizes: string;
  /** Tailwind aspect class for the frame, e.g. "aspect-[4/5]". Defaults to the photo's own shape. */
  aspect?: string;
  speed?: number;
  /** Set for a photo that is visible on first paint. */
  priority?: boolean;
  className?: string;
  captionClassName?: string;
}) {
  return (
    <figure className={className}>
      <ClipReveal className="bg-ivory-deep">
        <div className={cn("relative", aspect)} style={aspect ? undefined : { aspectRatio: `${photo.width} / ${photo.height}` }}>
          {/* oversized so the parallax never shows an edge */}
          <div className="absolute inset-x-0 -inset-y-[15%]">
            <Parallax speed={speed} className="h-full">
              <NextImage src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
            </Parallax>
          </div>
        </div>
      </ClipReveal>
      <figcaption className={cn("eyebrow mt-4 text-[0.5625rem] text-stone", captionClassName)}>{photo.credit}</figcaption>
    </figure>
  );
}
