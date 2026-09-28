"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { Suspense, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { HeroModel } from "@/lib/hero";
import type { WatchSpec } from "@/lib/watch/spec";
import { CustomWatch, ModelBoundary } from "./CustomWatch";
import { Stage } from "./Stage";
import { WatchModel } from "./WatchModel";

const ease = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOut = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/**
 * Hero choreography, driven by scroll progress 0–1. Works on any watch placed
 * inside it (dial facing +Y):
 *   intro   the watch descends from above and settles (after the preloader)
 *   0–0.45  turns from a three-quarter view to face you
 *   0.4–1   the camera travels into the dial
 */
function Choreography({ progress, started, children }: { progress: MotionValue<number>; started: () => boolean; children: ReactNode }) {
  const root = useRef<THREE.Group>(null);
  const intro = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!root.current) return;
    if (started()) intro.current = Math.min(1, intro.current + delta / 2.6);
    const i = ease(intro.current);
    const p = progress.get();
    const turn = easeInOut(range(p, 0, 0.45));
    const dive = easeInOut(range(p, 0.38, 1));
    const t = state.clock.elapsedTime;

    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;
    const settle = 1 - turn;

    // Descend from the sky with a slow half-turn, then idle.
    root.current.position.y = (1 - i) * 5.5 + Math.sin(t * 0.8) * 0.04 * settle;
    root.current.rotation.x = Math.PI / 2 - 0.42 * settle + (1 - i) * 0.6 - pointer.current.y * 0.12 * settle;
    root.current.rotation.y = -0.1 * settle + pointer.current.x * 0.18 * settle;
    root.current.rotation.z = 0.5 * settle - (1 - i) * 1.4 + Math.sin(t * 0.5) * 0.02 * settle;

    const { camera, size } = state;
    const start = size.width < size.height ? 14 : 8.2;
    camera.position.z = THREE.MathUtils.lerp(start, 1.7, dive);
    camera.lookAt(0, 0, 0);
  });

  return <group ref={root}>{children}</group>;
}

export default function HeroCanvas({
  spec,
  model,
  progress,
  started,
  active,
  onReady,
}: {
  /** Built-in watch configuration (also the fallback for a custom model) */
  spec: WatchSpec;
  /** Your own .glb, if configured in lib/hero.ts */
  model: HeroModel | null;
  progress: MotionValue<number>;
  started: () => boolean;
  active: boolean;
  onReady: () => void;
}) {
  const builtIn = <WatchModel spec={spec} />;
  return (
    <Canvas
      shadows="percentage"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 28, position: [0, 0, 7], near: 0.05, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        // A custom model reports ready once its file has loaded instead.
        if (!model) requestAnimationFrame(onReady);
      }}
    >
      <Stage />
      <Choreography progress={progress} started={started}>
        {model ? (
          <ModelBoundary fallback={<Ready onReady={onReady}>{builtIn}</Ready>}>
            <Suspense fallback={null}>
              <CustomWatch model={model} onLoaded={onReady} />
            </Suspense>
          </ModelBoundary>
        ) : (
          builtIn
        )}
      </Choreography>
    </Canvas>
  );
}

function Ready({ onReady, children }: { onReady: () => void; children: ReactNode }) {
  useFrame(() => onReady());
  return <>{children}</>;
}
