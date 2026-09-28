/**
 * The watch in the home-page hero. The animation (descend, turn, dive into
 * the dial) is the same whichever watch you choose.
 *
 * Option A — one of your catalogue watches: set `product` (its handle) and the
 * option values to show. Works with mock data and with Shopify.
 *
 * Option B — your own 3D model: export the real watch as .glb (from CAD, a 3D
 * artist, or a scan), put it in /public/models and set `model.src`. The
 * catalogue product still supplies the name, link and caption.
 */

export type HeroModel = {
  /** e.g. "/models/deodar.glb" */
  src: string;
  /**
   * Turns the model so its dial faces up (+Y), the pose the animation expects.
   * Most exports face the dial towards +Z, which the default handles.
   */
  rotation?: [number, number, number];
  /** Size multiplier, if the auto-fit looks too big or small */
  scale?: number;
  /**
   * Node names of the hands in your model, so they can tell live time.
   * Leave out if the hands are fused into the dial mesh.
   */
  hands?: { hour?: string; minute?: string; second?: string; axis?: "x" | "y" | "z"; reverse?: boolean };
};

export const heroWatch: {
  product: string;
  options: string[];
  caption: string;
  model: HeroModel | null;
} = {
  product: "deodar",
  options: ["Steel", "Ink", "40 mm", "Ink leather"],
  caption: "Steel · Ink dial · Ink leather",
  model: null,
  // model: {
  //   src: "/models/your-watch.glb",
  //   hands: { hour: "HourHand", minute: "MinuteHand", second: "SecondHand" },
  // },
};
