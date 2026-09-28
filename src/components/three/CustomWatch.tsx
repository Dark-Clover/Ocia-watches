"use client";

import { Center, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { HeroModel } from "@/lib/hero";
import { localTime } from "./WatchModel";

/** Target size of the model's longest side, matching the built-in watch with straps. */
const FIT = 4.6;

/**
 * Your own watch, loaded from a .glb. Auto-centred and sized to the same
 * footprint as the built-in model so the hero choreography frames it the same.
 */
export function CustomWatch({ model, onLoaded }: { model: HeroModel; onLoaded?: () => void }) {
  const { scene } = useGLTF(model.src);
  const object = useMemo(() => scene.clone(true), [scene]);

  const fit = useMemo(() => {
    const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z) || 1;
    return (FIT / longest) * (model.scale ?? 1);
  }, [object, model.scale]);

  // Hand nodes live in a ref: they're animated every frame, outside React.
  const hands = useRef<{ hour: THREE.Object3D | null; minute: THREE.Object3D | null; second: THREE.Object3D | null }>({
    hour: null,
    minute: null,
    second: null,
  });

  useEffect(() => {
    const find = (name?: string) => (name ? object.getObjectByName(name) ?? null : null);
    hands.current = { hour: find(model.hands?.hour), minute: find(model.hands?.minute), second: find(model.hands?.second) };
  }, [object, model.hands]);

  useEffect(() => {
    onLoaded?.();
  }, [onLoaded]);

  useFrame(() => {
    if (!model.hands) return;
    const axis = model.hands.axis ?? "z";
    const dir = model.hands.reverse ? 1 : -1;
    const t = localTime();
    const { hour, minute, second } = hands.current;
    if (hour) hour.rotation[axis] = dir * t.h * (Math.PI / 6);
    if (minute) minute.rotation[axis] = dir * t.m * (Math.PI / 30);
    if (second) second.rotation[axis] = dir * t.s * (Math.PI / 30);
  });

  return (
    <group rotation={model.rotation ?? [-Math.PI / 2, 0, 0]} scale={fit}>
      <Center>
        <primitive object={object} />
      </Center>
    </group>
  );
}

/** If the model file is missing or broken, show the built-in watch instead. */
export class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[OCIA] Hero model failed to load; using the built-in watch.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
