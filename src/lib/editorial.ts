/**
 * Licensed editorial photography in /public/editorial. These show other houses'
 * watches, so every use carries a `credit` naming the maker and model — they are
 * never presented as OCIA pieces.
 */
export type EditorialPhoto = { src: string; width: number; height: number; alt: string; credit: string };

export const editorial = {
  wrist: {
    src: "/editorial/wrist-submariner.jpg",
    width: 554,
    height: 554,
    alt: "A steel diver's watch on a wrist, hand in a trouser pocket, in black and white",
    credit: "Rolex Submariner",
  },
  travertine: {
    src: "/editorial/travertine-classic-fusion.jpg",
    width: 1536,
    height: 1024,
    alt: "A steel skeleton chronograph on a tan strap, resting on travertine in low sun",
    credit: "Hublot Classic Fusion",
  },
  nautilus: {
    src: "/editorial/travertine-nautilus.jpg",
    width: 1145,
    height: 1374,
    alt: "A steel watch with a green dial and green leather strap, standing on travertine",
    credit: "Patek Philippe Nautilus",
  },
  presentation: {
    src: "/editorial/box-deepsea.jpg",
    width: 1536,
    height: 1024,
    alt: "A two-tone diver's watch in an open green presentation box, beside an OCIA booklet",
    credit: "Rolex Deepsea",
  },
  boxed: {
    src: "/editorial/box-submariner.jpg",
    width: 1024,
    height: 1024,
    alt: "A steel diver's watch on an ivory cushion inside an open green box",
    credit: "Rolex Submariner",
  },
} satisfies Record<string, EditorialPhoto>;
