import * as THREE from "three";

/** Geometry builders for the procedural watch. Watch axis is +Y (dial faces up). */

export function lathe(points: [number, number][], segments = 128) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

/**
 * A strap that leaves the lug along +Z and curves down around an imaginary
 * wrist of radius `wrist`. Tapers towards the tip.
 */
export function bentStrap({
  width,
  thickness,
  length,
  wrist,
  taper = 0.14,
  segments = 64,
  pad = 0,
}: {
  width: number;
  thickness: number;
  length: number;
  wrist: number;
  taper?: number;
  segments?: number;
  /** Cushion height on the upper face, falling to zero at the edges */
  pad?: number;
}) {
  const g = new THREE.BoxGeometry(width, thickness, length, 20, 1, segments);
  g.translate(0, 0, length / 2);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = v.z / length;
    // Padded top: a soft crown across the width, flattening towards the tip
    if (pad && v.y > 0) v.y += pad * (1 - Math.pow((2 * v.x) / width, 4)) * (1 - 0.6 * t);
    const theta = v.z / wrist;
    const r = wrist + v.y;
    pos.setXYZ(i, v.x * (1 - taper * t), r * Math.cos(theta) - wrist, r * Math.sin(theta));
  }
  g.computeVertexNormals();
  return g;
}

/** Positions + tilt along the same wrist curve, for bracelet links. */
export function curvePoints(count: number, step: number, wrist: number) {
  return Array.from({ length: count }, (_, i) => {
    const s = i * step + step / 2;
    const theta = s / wrist;
    return {
      position: [0, wrist * Math.cos(theta) - wrist, wrist * Math.sin(theta)] as [number, number, number],
      rotationX: theta,
    };
  });
}

/** A point and tilt on the wrist curve at arc length `s` from the lug. */
export function onCurve(s: number, wrist: number) {
  const theta = s / wrist;
  return {
    position: [0, wrist * Math.cos(theta) - wrist, wrist * Math.sin(theta)] as [number, number, number],
    rotationX: theta,
  };
}

/**
 * Sculpted lug, seen from the side: it leaves the case flank and sweeps down
 * towards the wrist. Built in the shape's XY plane (x = outward, y = up) and
 * extruded for its thickness, with a small bevel to catch light.
 */
export function lugGeometry(thickness = 0.1) {
  const s = new THREE.Shape();
  s.moveTo(0.55, -0.1);
  s.lineTo(1.02, -0.12);
  s.quadraticCurveTo(1.1, -0.115, 1.1, -0.06);
  s.lineTo(1.09, -0.03);
  s.quadraticCurveTo(0.98, 0.09, 0.62, 0.1);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 24,
  });
  g.translate(0, 0, -thickness / 2);
  return g;
}

/** Applied index with a ridged, diamond-cut top. Length along Z, centred. */
export function markerGeometry(width: number, length: number, height: number) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  s.lineTo(width / 2, height * 0.45);
  s.lineTo(0, height);
  s.lineTo(-width / 2, height * 0.45);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 1,
  });
  g.translate(0, 0, -length / 2);
  return g;
}

/** Slightly domed sapphire: a shallow spherical cap of the given base radius and rise. */
export function domeGeometry(radius: number, rise: number) {
  const sphere = (radius * radius + rise * rise) / (2 * rise);
  const theta = Math.asin(radius / sphere);
  const g = new THREE.SphereGeometry(sphere, 128, 12, 0, Math.PI * 2, 0, theta);
  g.translate(0, -(sphere - rise), 0);
  return g;
}

/** Rectangular buckle frame in the XZ plane. */
export function buckleGeometry(width: number, depth: number, bar = 0.035) {
  const s = new THREE.Shape();
  const r = 0.03;
  const w = width / 2;
  const d = depth / 2;
  s.moveTo(-w + r, -d);
  s.lineTo(w - r, -d);
  s.quadraticCurveTo(w, -d, w, -d + r);
  s.lineTo(w, d - r);
  s.quadraticCurveTo(w, d, w - r, d);
  s.lineTo(-w + r, d);
  s.quadraticCurveTo(-w, d, -w, d - r);
  s.lineTo(-w, -d + r);
  s.quadraticCurveTo(-w, -d, -w + r, -d);
  const hole = new THREE.Path();
  hole.moveTo(-w + bar, -d + bar);
  hole.lineTo(w - bar, -d + bar);
  hole.lineTo(w - bar, d - bar);
  hole.lineTo(-w + bar, d - bar);
  hole.closePath();
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
  g.rotateX(-Math.PI / 2);
  return g;
}

/**
 * Anisotropy direction map for a sunray dial: every texel points away from
 * the centre, so highlights sweep across the dial as it turns.
 */
export function sunrayAnisotropyMap(size = 256) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x / (size - 1) - 0.5;
      const dy = y / (size - 1) - 0.5;
      const len = Math.hypot(dx, dy) || 1;
      const i = (y * size + x) * 4;
      data[i] = Math.round(((dx / len) * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      data[i + 2] = 255; // full strength
      data[i + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
}

/** Faceted dauphine hand in the XY plane pointing +Y, extruded along +Z. */
export function dauphineHand(length: number, width: number, tail: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -tail);
  s.lineTo(width / 2, length * 0.12);
  s.lineTo(0, length);
  s.lineTo(-width / 2, length * 0.12);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
}

/** Leather texture: base colour with stitching running down both edges. */
export function leatherTexture(base: string, stitch: string, stitched: boolean) {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, c.width, c.height);
  // subtle grain
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * 128, Math.random() * 512, 1.5, 1.5);
  }
  if (stitched) {
    ctx.strokeStyle = stitch;
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    for (const x of [14, 114]) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Fine diagonal weave for Milanese mesh, used as a bump map. */
export function meshTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  for (let i = -64; i < 128; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 64, 64);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 24);
  return t;
}
