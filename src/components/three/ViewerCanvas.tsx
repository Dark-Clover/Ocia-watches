"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { WatchSpec } from "@/lib/watch/spec";
import { Stage } from "./Stage";
import { WatchModel } from "./WatchModel";

/** Free-orbit product viewer: drag to turn, scroll or pinch to look closer. */
export default function ViewerCanvas({ spec }: { spec: WatchSpec }) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 26, position: [0, 0.6, 7.2], near: 0.05, far: 50 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <Stage />
      <group rotation={[Math.PI / 2 - 0.25, 0, 0.35]}>
        <WatchModel spec={spec} />
      </group>
      <OrbitControls
        enablePan={false}
        minDistance={2.2}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
