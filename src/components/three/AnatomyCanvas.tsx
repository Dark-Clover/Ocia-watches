"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import * as THREE from "three";
import type { WatchSpec } from "@/lib/watch/spec";
import { Stage } from "./Stage";
import { WatchModel } from "./WatchModel";

const smooth = (t: number) => t * t * (3 - 2 * t);

function Rig({ spec, progress }: { spec: WatchSpec; progress: MotionValue<number> }) {
  const root = useRef<THREE.Group>(null);
  const e = useRef(0);
  useFrame((state) => {
    const p = progress.get();
    // explode in over the first 60%, hold, then gently reassemble at the end
    const target = p < 0.6 ? smooth(Math.min(1, p / 0.6)) : p > 0.9 ? 1 - smooth((p - 0.9) / 0.1) : 1;
    e.current += (target - e.current) * 0.08;
    if (root.current) {
      root.current.rotation.x = Math.PI / 2 - 1.2 + state.pointer.y * 0.05;
      root.current.rotation.y = -0.35;
      root.current.rotation.z = 0.9 + p * 0.4 + state.pointer.x * 0.06;
    }
  });
  return (
    <group ref={root} position={[0, -0.1, 0]}>
      <WatchModel spec={spec} explode={() => e.current} />
    </group>
  );
}

export default function AnatomyCanvas({ spec, progress, active }: { spec: WatchSpec; progress: MotionValue<number>; active: boolean }) {
  return (
    <Canvas
      shadows="percentage"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 26, position: [0, 0, 9.4], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <Stage intensity={1.1} />
      <Rig spec={spec} progress={progress} />
    </Canvas>
  );
}
