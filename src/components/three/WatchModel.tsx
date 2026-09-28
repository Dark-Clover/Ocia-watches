"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { appliedMarkers } from "@/lib/watch/markers";
import { renderDialFace } from "@/lib/watch/render";
import { STRAP_PALETTE, type CaseFinish, type WatchSpec } from "@/lib/watch/spec";
import {
  bentStrap,
  buckleGeometry,
  curvePoints,
  dauphineHand,
  domeGeometry,
  lathe,
  leatherTexture,
  lugGeometry,
  markerGeometry,
  meshTexture,
  onCurve,
  sunrayAnisotropyMap,
} from "./geometry";

/**
 * Procedural OCIA watch. Built along +Y (dial up) and turned to face the
 * camera by the root group. `explode` (0–1) separates the layers for the
 * anatomy view. Hands keep the visitor's local time.
 *
 * Detail that sells it: circular-brushed case flank (anisotropic), polished
 * bezel, sculpted lugs, diamond-cut applied indices that cast shadows, a
 * sunray dial whose highlight sweeps as it turns, a domed crystal, knurled
 * crown, padded strap with keeper and buckle.
 */

const METAL: Record<CaseFinish, { color: string; brushed: number; polished: number; metalness: number }> = {
  steel: { color: "#dcdcd8", brushed: 0.34, polished: 0.08, metalness: 1 },
  ink: { color: "#34322f", brushed: 0.42, polished: 0.18, metalness: 0.85 },
  sand: { color: "#dcc9b0", brushed: 0.34, polished: 0.1, metalness: 1 },
};

const WRIST = 1.25;
const STRAP_START = 0.93;
const DIAL_R = 0.86;
const DIAL_Y = 0.1;

function useDialTexture(spec: WatchSpec) {
  const key = `${spec.dial}-${spec.indices}-${spec.complication}-${spec.minuteTrack}-${spec.finish}`;
  const texture = useMemo(() => {
    const svg = renderDialFace(spec, 2048);
    const tex = new THREE.TextureLoader().load(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures every field that changes the face
  }, [key]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** The visitor's local time, as fractional hours/minutes/seconds for smooth hands. */
export function localTime() {
  const now = new Date();
  const s = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  return { h: (s / 3600) % 12, m: (s / 60) % 60, s: s % 60 };
}

export function WatchModel({
  spec,
  explode,
  frozenTime,
}: {
  spec: WatchSpec;
  /** Returns explode amount 0–1 each frame */
  explode?: () => number;
  /** Fixed time instead of live (e.g. 10:09 for product shots) */
  frozenTime?: { h: number; m: number; s: number };
}) {
  const scale = spec.sizeMm / 40;
  const dialTex = useDialTexture(spec);
  const m = METAL[spec.finish];
  const darkDial = spec.dial === "ink";

  const materials = useMemo(() => {
    // Circular brushing on the flank: anisotropy runs around the case.
    const brushed = new THREE.MeshPhysicalMaterial({
      color: m.color,
      metalness: m.metalness,
      roughness: m.brushed,
      anisotropy: 0.65,
    });
    const polished = new THREE.MeshPhysicalMaterial({
      color: m.color,
      metalness: m.metalness,
      roughness: m.polished,
      clearcoat: 0.3,
      clearcoatRoughness: 0.05,
    });
    const hand = new THREE.MeshStandardMaterial({
      color: darkDial ? "#f1efea" : spec.finish === "ink" ? "#2a2826" : m.color,
      metalness: darkDial ? 0.75 : 1,
      roughness: darkDial ? 0.26 : 0.14,
    });
    const second = new THREE.MeshStandardMaterial({ color: darkDial ? "#beb4a7" : "#171615", metalness: 0.2, roughness: 0.5 });
    // Sapphire: a clear, faintly reflective dome. Real transmission is costly
    // and inconsistent on mobile GPUs, so this is a tuned stand-in.
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      metalness: 0,
      roughness: 0,
      clearcoat: 1,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      envMapIntensity: 2.6,
    });
    const movement = new THREE.MeshStandardMaterial({ color: "#c9c7c1", metalness: 1, roughness: 0.22 });
    const jewel = new THREE.MeshStandardMaterial({ color: "#171615", metalness: 0.4, roughness: 0.1 });
    return { brushed, polished, hand, second, glass, movement, jewel };
  }, [m, darkDial, spec.finish]);

  // Sunray dial: the colour comes from the rendered face; anisotropy pointing
  // away from the centre makes light fan across it as the watch turns.
  const dialMaterial = useMemo(() => {
    const anisotropyMap = sunrayAnisotropyMap();
    return new THREE.MeshPhysicalMaterial({
      map: dialTex,
      metalness: darkDial ? 0.45 : 0.25,
      roughness: darkDial ? 0.3 : 0.38,
      anisotropy: 0.9,
      anisotropyMap,
    });
  }, [dialTex, darkDial]);

  const strapMaterial = useMemo(() => {
    if (spec.strap === "mesh") {
      const bump = meshTexture();
      return new THREE.MeshStandardMaterial({ color: m.color, metalness: 1, roughness: 0.42, bumpMap: bump, bumpScale: 0.6 });
    }
    if (spec.strap === "bracelet") return null;
    const p = STRAP_PALETTE[spec.strap];
    const map = leatherTexture(p.base, p.stitch, spec.strap !== "taupe-suede");
    map.repeat.set(1, 4);
    return new THREE.MeshPhysicalMaterial({
      map,
      roughness: spec.strap === "taupe-suede" ? 0.95 : 0.55,
      metalness: 0,
      sheen: spec.strap === "taupe-suede" ? 0.6 : 0.15,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(p.hi),
    });
  }, [spec.strap, m.color]);

  useEffect(
    () => () => {
      Object.values(materials).forEach((mat) => mat.dispose());
      dialMaterial.anisotropyMap?.dispose();
      dialMaterial.dispose();
      strapMaterial?.dispose();
    },
    [materials, dialMaterial, strapMaterial],
  );

  const markers = useMemo(() => appliedMarkers(spec), [spec]);

  const geo = useMemo(
    () => ({
      caseBody: lathe([
        [0.8, -0.13],
        [0.9, -0.118],
        [0.965, -0.085],
        [0.995, -0.035],
        [1.0, 0.02],
        [0.995, 0.07],
        [0.975, 0.1],
        [0.94, 0.118],
        [0.9, 0.12],
      ]),
      // polished chamfer between the flank and the caseback
      chamfer: lathe([
        [0.78, -0.128],
        [0.88, -0.126],
        [0.91, -0.114],
      ]),
      bezel: lathe([
        [0.895, 0.112],
        [0.955, 0.118],
        [0.968, 0.14],
        [0.955, 0.166],
        [0.915, 0.178],
        [0.878, 0.176],
        [0.862, 0.162],
        [0.86, 0.105],
      ]),
      rehaut: new THREE.CylinderGeometry(0.862, 0.862, 0.06, 128, 1, true),
      dial: new THREE.CircleGeometry(DIAL_R, 128),
      crystal: domeGeometry(0.876, 0.035),
      caseback: lathe([
        [0, -0.162],
        [0.55, -0.162],
        [0.72, -0.155],
        [0.8, -0.14],
        [0.81, -0.125],
      ]),
      lug: lugGeometry(0.1),
      hour: dauphineHand(0.46, 0.075, 0.05),
      minute: dauphineHand(0.72, 0.058, 0.05),
      strap: bentStrap({ width: 1.0, thickness: 0.06, length: 2.5, wrist: WRIST, pad: 0.03 }),
      buckle: buckleGeometry(1.02, 0.24),
      keeper: new THREE.TorusGeometry(0.54, 0.018, 8, 48),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const markerGeos = useMemo(
    () =>
      markers.map((mk) =>
        mk.kind === "bar"
          ? markerGeometry(mk.w * DIAL_R, mk.len * DIAL_R, 0.022)
          : new THREE.CylinderGeometry(mk.size * DIAL_R, mk.size * DIAL_R * 1.05, 0.02, 32),
      ),
    [markers],
  );
  useEffect(() => () => markerGeos.forEach((g) => g.dispose()), [markerGeos]);

  // Layer refs for explode + hands
  const crystalRef = useRef<THREE.Group>(null);
  const bezelRef = useRef<THREE.Group>(null);
  const handsRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Group>(null);
  const movementRef = useRef<THREE.Group>(null);
  const backRef = useRef<THREE.Group>(null);
  const strapARef = useRef<THREE.Group>(null);
  const strapBRef = useRef<THREE.Group>(null);
  const hourRef = useRef<THREE.Group>(null);
  const minuteRef = useRef<THREE.Group>(null);
  const secondRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const e = explode ? explode() : 0;
    const set = (r: React.RefObject<THREE.Object3D | null>, y: number) => r.current && (r.current.position.y = y);
    set(crystalRef, 1.25 * e);
    set(bezelRef, 0.9 * e);
    set(handsRef, 0.62 * e);
    set(dialRef, 0.36 * e);
    set(movementRef, -0.55 * e);
    set(backRef, -1.05 * e);
    if (strapARef.current) strapARef.current.position.z = STRAP_START + 1.4 * e;
    if (strapBRef.current) strapBRef.current.position.z = -STRAP_START - 1.4 * e;
    if (movementRef.current) movementRef.current.visible = e > 0.02;

    const t = frozenTime ?? localTime();
    const H = ((t.h % 12) + (frozenTime ? t.m / 60 : 0)) * (Math.PI / 6);
    const M = (t.m + (frozenTime ? t.s / 60 : 0)) * (Math.PI / 30);
    const S = t.s * (Math.PI / 30);
    if (hourRef.current) hourRef.current.rotation.y = -H;
    if (minuteRef.current) minuteRef.current.rotation.y = -M;
    if (secondRef.current) secondRef.current.rotation.y = -S;
    if (rotorRef.current) rotorRef.current.rotation.y += delta * 0.6;
  });

  const showSeconds = spec.complication !== "small-seconds";
  const pushers = spec.complication === "chrono";

  return (
    <group scale={scale}>
      {/* Case, chamfer, lugs */}
      <mesh geometry={geo.caseBody} material={materials.brushed} castShadow receiveShadow />
      <mesh geometry={geo.chamfer} material={materials.polished} />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            geometry={geo.lug}
            material={materials.brushed}
            position={[sx * 0.565, 0, 0]}
            rotation={[0, sz > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            castShadow
          />
        )),
      )}

      {/* Crown: neck, knurled body, polished cap */}
      <group position={[1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh position={[0, -0.03, 0]} material={materials.polished}>
          <cylinderGeometry args={[0.045, 0.045, 0.07, 32]} />
        </mesh>
        <mesh position={[0, -0.11, 0]} material={materials.brushed}>
          <cylinderGeometry args={[0.094, 0.094, 0.11, 48]} />
        </mesh>
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i / 32) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.097, -0.11, Math.sin(a) * 0.097]} rotation={[0, -a, 0]} material={materials.polished}>
              <boxGeometry args={[0.012, 0.1, 0.012]} />
            </mesh>
          );
        })}
        <mesh position={[0, -0.17, 0]} material={materials.polished}>
          <cylinderGeometry args={[0.08, 0.098, 0.014, 48]} />
        </mesh>
        <mesh position={[0, -0.178, 0]} rotation={[Math.PI, 0, 0]} material={materials.polished}>
          <sphereGeometry args={[0.08, 32, 8, 0, Math.PI * 2, 0, 0.35]} />
        </mesh>
      </group>
      {pushers &&
        [-0.52, 0.52].map((a) => (
          <group key={a} position={[Math.cos(a) * 0.99, 0, Math.sin(a) * 0.99]} rotation={[0, -a, Math.PI / 2]}>
            <mesh position={[0, -0.06, 0]} material={materials.polished}>
              <cylinderGeometry args={[0.055, 0.055, 0.12, 24]} />
            </mesh>
          </group>
        ))}

      <group ref={backRef}>
        <mesh geometry={geo.caseback} material={materials.polished} />
      </group>

      {/* Movement — only visible when exploded */}
      <group ref={movementRef} visible={false}>
        <mesh position={[0, -0.02, 0]} material={materials.movement}>
          <cylinderGeometry args={[0.78, 0.78, 0.07, 96]} />
        </mesh>
        <mesh ref={rotorRef} position={[0, -0.06, 0]} material={materials.polished}>
          <cylinderGeometry args={[0.74, 0.74, 0.02, 64, 1, false, 0, Math.PI]} />
        </mesh>
        {[
          [0.35, 0.2],
          [-0.3, 0.32],
          [0.1, -0.42],
          [-0.42, -0.2],
          [0.45, -0.25],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.02, z]} material={materials.jewel}>
            <sphereGeometry args={[0.028, 16, 16]} />
          </mesh>
        ))}
        {[0.22, 0.34, 0.5].map((r, i) => (
          <mesh key={r} position={[Math.cos(i * 2.1) * 0.3, 0.02, Math.sin(i * 2.1) * 0.3]} material={materials.brushed}>
            <cylinderGeometry args={[r * 0.4, r * 0.4, 0.015, 40]} />
          </mesh>
        ))}
      </group>

      {/* Dial with applied indices */}
      <group ref={dialRef}>
        <mesh geometry={geo.dial} position={[0, DIAL_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={dialMaterial} receiveShadow />
        <mesh geometry={geo.rehaut} position={[0, 0.13, 0]} material={materials.brushed} />
        {markers.map((mk, i) => (
          <group key={i} rotation={[0, (-mk.deg * Math.PI) / 180, 0]}>
            {mk.kind === "bar" ? (
              <mesh
                geometry={markerGeos[i]}
                position={[mk.dx * DIAL_R, DIAL_Y, -(mk.r - mk.len / 2) * DIAL_R]}
                material={i % 2 ? materials.polished : materials.brushed}
                castShadow
              />
            ) : (
              <mesh geometry={markerGeos[i]} position={[0, DIAL_Y + 0.01, -mk.r * DIAL_R]} material={materials.polished} castShadow />
            )}
          </group>
        ))}
      </group>

      <group ref={handsRef}>
        <group ref={hourRef} position={[0, 0.118, 0]}>
          <mesh geometry={geo.hour} rotation={[-Math.PI / 2, 0, 0]} material={materials.hand} castShadow />
        </group>
        <group ref={minuteRef} position={[0, 0.13, 0]}>
          <mesh geometry={geo.minute} rotation={[-Math.PI / 2, 0, 0]} material={materials.hand} castShadow />
        </group>
        {showSeconds && (
          <group ref={secondRef} position={[0, 0.143, 0]}>
            <mesh position={[0, 0, -0.3]} material={materials.second} castShadow>
              <boxGeometry args={[0.007, 0.004, 0.96]} />
            </mesh>
            <mesh position={[0, 0, 0.12]} material={materials.second} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.005, 24]} />
            </mesh>
          </group>
        )}
        <mesh position={[0, 0.148, 0]} material={materials.polished}>
          <cylinderGeometry args={[0.028, 0.034, 0.022, 32]} />
        </mesh>
      </group>

      <group ref={bezelRef}>
        <mesh geometry={geo.bezel} material={materials.polished} castShadow />
      </group>

      <group ref={crystalRef}>
        <mesh geometry={geo.crystal} position={[0, 0.162, 0]} material={materials.glass} renderOrder={2} />
      </group>

      {/* Straps: the 6 o'clock side carries the keeper, 12 o'clock the buckle */}
      <group ref={strapARef} position={[0, -0.04, STRAP_START]}>
        <Strap spec={spec} material={strapMaterial} geometry={geo.strap} metal={materials} keeper={geo.keeper} />
      </group>
      <group ref={strapBRef} position={[0, -0.04, -STRAP_START]} rotation={[0, Math.PI, 0]}>
        <Strap spec={spec} material={strapMaterial} geometry={geo.strap} metal={materials} buckle={geo.buckle} />
      </group>
    </group>
  );
}

function Strap({
  spec,
  material,
  geometry,
  metal,
  keeper,
  buckle,
}: {
  spec: WatchSpec;
  material: THREE.Material | null;
  geometry: THREE.BufferGeometry;
  metal: { brushed: THREE.Material; polished: THREE.Material };
  keeper?: THREE.BufferGeometry;
  buckle?: THREE.BufferGeometry;
}) {
  const links = useMemo(() => curvePoints(11, 0.22, WRIST), []);
  if (spec.strap === "bracelet") {
    return (
      <group>
        {links.map((l, i) => {
          const taper = 1 - 0.12 * (i / links.length);
          return (
            <group key={i} position={l.position} rotation={[l.rotationX, 0, 0]}>
              <RoundedBox args={[1.0 * taper, 0.075, 0.205]} radius={0.025} smoothness={3} material={metal.brushed} castShadow />
              <RoundedBox args={[0.34 * taper, 0.085, 0.2]} radius={0.028} smoothness={3} position={[0, 0.006, 0]} material={metal.polished} />
            </group>
          );
        })}
      </group>
    );
  }
  const leather = spec.strap !== "mesh";
  const k = onCurve(0.85, WRIST);
  const b = onCurve(2.25, WRIST);
  return (
    <group>
      <mesh geometry={geometry} material={material ?? undefined} castShadow receiveShadow />
      {leather && keeper && (
        <group position={k.position} rotation={[k.rotationX, 0, 0]}>
          <mesh geometry={keeper} material={material ?? undefined} rotation={[0, 0, 0]} scale={[1, 0.13, 1]} position={[0, 0.02, 0]} />
        </group>
      )}
      {leather && buckle && (
        <group position={b.position} rotation={[b.rotationX, 0, 0]}>
          <mesh geometry={buckle} material={metal.polished} position={[0, 0.05, 0]} scale={[0.9, 1, 1]} castShadow />
          <mesh material={metal.polished} position={[0, 0.07, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 12]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
