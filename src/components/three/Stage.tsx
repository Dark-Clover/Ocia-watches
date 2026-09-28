"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Studio lighting built from lightformers — long softboxes that draw clean
 * highlights along polished steel. Nothing is fetched from the network.
 * The key light casts soft shadows: hands and applied indices onto the dial.
 */
export function Stage({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.3 * intensity} />
      <directionalLight
        position={[2.5, 4, 6]}
        intensity={1.7 * intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.015}
        shadow-radius={4}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <directionalLight position={[-4, -2, 3]} intensity={0.4 * intensity} color="#f4f0e8" />
      {/* thin rim light to trace the bezel edge against the background */}
      <spotLight position={[-3, 3, -4]} angle={0.5} penumbra={1} intensity={30 * intensity} color="#ffffff" />
      <Environment resolution={512} frames={1}>
        <color attach="background" args={["#7a756e"]} />
        <Lightformer form="rect" intensity={3.2} position={[0, 4, 5]} scale={[8, 1.4, 1]} rotation-x={Math.PI / 3} />
        <Lightformer form="rect" intensity={2} position={[-5, 0.5, 2]} scale={[1, 6, 1]} rotation-y={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={2.4} position={[5, 1, 1]} scale={[0.8, 6, 1]} rotation-y={-Math.PI / 2.4} />
        <Lightformer form="rect" intensity={4} position={[2, 2, 6]} scale={[0.4, 3, 1]} rotation-y={-0.3} />
        <Lightformer form="ring" intensity={1.2} position={[0, 0, 8]} scale={3} color="#f4f0e8" />
        <Lightformer form="rect" intensity={0.8} position={[0, -5, 2]} scale={[6, 1, 1]} rotation-x={-Math.PI / 3} color="#beb4a7" />
      </Environment>
    </>
  );
}
