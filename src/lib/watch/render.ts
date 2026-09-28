import {
  CASE_PALETTE,
  DIAL_PALETTE,
  STRAP_PALETTE,
  type WatchSpec,
} from "./spec";
import { appliedMarkers, skippedHours } from "./markers";
import { WORDMARK_INK, WORDMARK_RATIO, WORDMARK_WHITE } from "./wordmark-data";

/**
 * Pure SVG renderer for OCIA watches.
 *
 * Produces product "photography" for the mock catalogue, served at real image
 * URLs by `app/renders/[...]/route.ts`. When Shopify is connected, product
 * images come from Shopify's CDN instead and this file is only used as a
 * placeholder generator. All images are 4:5 (800×1000).
 */

export type RenderView = "front" | "dial" | "crown" | "back" | "flatlay";
export const RENDER_VIEWS: RenderView[] = ["front", "flatlay", "dial", "crown", "back"];

export const W = 800;
export const H = 1000;
const CX = 400;
const CY = 500;

const f = (n: number) => (Math.round(n * 100) / 100).toString();
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const polar = (r: number, deg: number, cx = CX, cy = CY) =>
  [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))] as const;

function radiusFor(sizeMm: number) {
  return 150 + (sizeMm - 32) * 5;
}

/* ------------------------------------------------------------------ defs -- */

function defs(spec: WatchSpec, id: string) {
  const c = CASE_PALETTE[spec.finish];
  const d = DIAL_PALETTE[spec.dial];
  const strap = spec.strap in STRAP_PALETTE ? STRAP_PALETTE[spec.strap as keyof typeof STRAP_PALETTE] : null;
  return `
  <defs>
    <linearGradient id="${id}-brushed" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c.hi}"/>
      <stop offset="0.32" stop-color="${c.mid}"/>
      <stop offset="0.52" stop-color="${c.lo}"/>
      <stop offset="0.7" stop-color="${c.mid}"/>
      <stop offset="0.88" stop-color="${c.hi}"/>
      <stop offset="1" stop-color="${c.mid}"/>
    </linearGradient>
    <linearGradient id="${id}-polished" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.edge}"/>
      <stop offset="0.18" stop-color="${c.hi}"/>
      <stop offset="0.4" stop-color="${c.lo}"/>
      <stop offset="0.62" stop-color="${c.hi}"/>
      <stop offset="0.8" stop-color="${c.mid}"/>
      <stop offset="1" stop-color="${c.edge}"/>
    </linearGradient>
    <linearGradient id="${id}-facet-l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c.hi}"/><stop offset="1" stop-color="${c.mid}"/>
    </linearGradient>
    <linearGradient id="${id}-facet-r" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c.lo}"/><stop offset="1" stop-color="${c.edge}"/>
    </linearGradient>
    <radialGradient id="${id}-dial" cx="0.42" cy="0.36" r="0.75">
      <stop offset="0" stop-color="${d.center}"/>
      <stop offset="1" stop-color="${d.base}"/>
    </radialGradient>
    <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.32"/>
      <stop offset="0.38" stop-color="#fff" stop-opacity="0.04"/>
      <stop offset="0.62" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0.08"/>
    </linearGradient>
    ${
      strap
        ? `<linearGradient id="${id}-strap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${strap.lo}"/>
      <stop offset="0.12" stop-color="${strap.base}"/>
      <stop offset="0.42" stop-color="${strap.hi}"/>
      <stop offset="0.8" stop-color="${strap.base}"/>
      <stop offset="1" stop-color="${strap.lo}"/>
    </linearGradient>`
        : `<linearGradient id="${id}-strap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c.lo}"/>
      <stop offset="0.2" stop-color="${c.mid}"/>
      <stop offset="0.45" stop-color="${c.hi}"/>
      <stop offset="0.75" stop-color="${c.mid}"/>
      <stop offset="1" stop-color="${c.lo}"/>
    </linearGradient>`
    }
    <pattern id="${id}-mesh" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="5" height="5" fill="none"/>
      <line x1="0" y1="0" x2="0" y2="5" stroke="${c.edge}" stroke-width="1.2" stroke-opacity="0.35"/>
    </pattern>
    <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
    <filter id="${id}-tight" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <filter id="${id}-leaf" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
  </defs>`;
}

/* ----------------------------------------------------------------- strap -- */

function strapGeometry(R: number) {
  const w0 = R * 1.04; // width at lugs
  const w1 = R * 0.9; // width at the far end
  const yTop = CY - R * 0.9;
  const yBot = CY + R * 0.9;
  return { w0, w1, yTop, yBot };
}

function strapPath(w0: number, w1: number, yA: number, yB: number, roundEnd = false) {
  if (roundEnd) {
    const r = w1 / 2;
    const sweep = yB > yA ? 0 : 1;
    const yEnd = yB > yA ? yB - r : yB + r;
    return `M${f(CX - w0 / 2)} ${f(yA)} L${f(CX - w1 / 2)} ${f(yEnd)} A${f(r)} ${f(r)} 0 0 ${sweep} ${f(CX + w1 / 2)} ${f(yEnd)} L${f(CX + w0 / 2)} ${f(yA)} Z`;
  }
  return `M${f(CX - w0 / 2)} ${f(yA)} L${f(CX - w1 / 2)} ${f(yB)} L${f(CX + w1 / 2)} ${f(yB)} L${f(CX + w0 / 2)} ${f(yA)} Z`;
}

function strap(spec: WatchSpec, id: string, R: number, back = false, ext?: number) {
  const { w0, w1, yTop, yBot } = strapGeometry(R);
  const finished = ext !== undefined;
  const top = finished ? CY - ext : -60;
  const bottom = finished ? CY + ext : H + 60;
  const c = CASE_PALETTE[spec.finish];
  let out = "";

  if (spec.strap === "bracelet") {
    const linkH = R * 0.24;
    const rows = (from: number, to: number, dir: 1 | -1) => {
      let s = "";
      for (let y = from; dir === 1 ? y < to : y > to; y += dir * linkH) {
        const t = Math.min(1, Math.abs(y - from) / (Math.abs(to - from) || 1));
        const w = w0 + (w1 - w0) * t;
        const y0 = dir === 1 ? y : y - linkH;
        const cw = w * 0.36;
        s += `<rect x="${f(CX - w / 2)}" y="${f(y0 + 1.5)}" width="${f(w)}" height="${f(linkH - 3)}" rx="${f(linkH * 0.18)}" fill="url(#${id}-strap)"/>`;
        s += `<rect x="${f(CX - cw / 2)}" y="${f(y0 + 2)}" width="${f(cw)}" height="${f(linkH - 4)}" rx="${f(linkH * 0.16)}" fill="url(#${id}-polished)"/>`;
        s += `<line x1="${f(CX - w / 2)}" y1="${f(y0 + 1)}" x2="${f(CX + w / 2)}" y2="${f(y0 + 1)}" stroke="${c.edge}" stroke-opacity="0.55" stroke-width="2"/>`;
      }
      return s;
    };
    out += rows(yTop, top, -1) + rows(yBot, bottom, 1);
    return out;
  }

  const topPath = strapPath(w0, w1, yTop, top, finished);
  const botPath = strapPath(w0, w1, yBot, bottom, finished);

  if (spec.strap === "mesh") {
    for (const p of [topPath, botPath]) {
      out += `<path d="${p}" fill="url(#${id}-strap)"/><path d="${p}" fill="url(#${id}-mesh)"/>`;
    }
    // polished end caps where the mesh meets the case
    out += `<rect x="${f(CX - w0 / 2)}" y="${f(yTop - R * 0.12)}" width="${f(w0)}" height="${f(R * 0.12)}" fill="url(#${id}-polished)"/>`;
    out += `<rect x="${f(CX - w0 / 2)}" y="${f(yBot)}" width="${f(w0)}" height="${f(R * 0.12)}" fill="url(#${id}-polished)"/>`;
    return out;
  }

  const leather = STRAP_PALETTE[spec.strap];
  const inset = R * 0.06;
  const stitch = (yA: number, yB: number) => {
    const tA = w0 / 2 - inset;
    const tB = w1 / 2 - inset;
    return `<path d="M${f(CX - tA)} ${f(yA)} L${f(CX - tB)} ${f(yB)} M${f(CX + tA)} ${f(yA)} L${f(CX + tB)} ${f(yB)}" stroke="${leather.stitch}" stroke-width="1.6" stroke-dasharray="6 5" stroke-linecap="round" fill="none" opacity="${spec.strap === "ink-leather" ? 0.8 : 0.9}"/>`;
  };
  out += `<path d="${topPath}" fill="url(#${id}-strap)"/>`;
  out += `<path d="${botPath}" fill="url(#${id}-strap)"/>`;
  if (spec.strap === "taupe-suede") {
    // suede has no edge stitching; a faint nap instead
    out += `<path d="${topPath}" fill="url(#${id}-mesh)" opacity="0.18"/><path d="${botPath}" fill="url(#${id}-mesh)" opacity="0.18"/>`;
  } else {
    out += stitch(yTop - inset, top) + stitch(yBot + inset, bottom);
  }
  // keeper loop and holes on the lower strap
  const kY = yBot + R * 0.95;
  const kw = w0 - (w0 - w1) * ((kY - yBot) / (bottom - yBot)) + 6;
  out += `<rect x="${f(CX - kw / 2)}" y="${f(kY)}" width="${f(kw)}" height="${f(R * 0.14)}" rx="3" fill="url(#${id}-strap)" stroke="${leather.lo}" stroke-width="1"/>`;
  for (let i = 0; i < 4; i++) {
    const y = kY + R * 0.42 + i * R * 0.2;
    if (y > (finished ? bottom - w1 * 0.7 : H - 10)) break;
    out += `<ellipse cx="${CX}" cy="${f(y)}" rx="${f(R * 0.028)}" ry="${f(R * 0.036)}" fill="${leather.lo}"/>`;
  }
  // spring-bar shadow under the lugs
  out += `<rect x="${f(CX - w0 / 2)}" y="${f(yTop - R * 0.08)}" width="${f(w0)}" height="${f(R * 0.08)}" fill="#000" opacity="0.18"/>`;
  out += `<rect x="${f(CX - w0 / 2)}" y="${f(yBot)}" width="${f(w0)}" height="${f(R * 0.08)}" fill="#000" opacity="0.18"/>`;
  if (finished) {
    // buckle at the end of the upper strap
    const bw = w1 + R * 0.1;
    const bh = R * 0.3;
    const by = top - bh * 0.35;
    out += `<rect x="${f(CX - bw / 2)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh * 0.22)}" fill="none" stroke="url(#${id}-polished)" stroke-width="${f(R * 0.05)}"/>`;
    out += `<line x1="${CX}" y1="${f(by + bh)}" x2="${CX}" y2="${f(by + bh * 0.1)}" stroke="url(#${id}-brushed)" stroke-width="${f(R * 0.03)}" stroke-linecap="round"/>`;
  }
  if (back) {
    out += `<text x="${CX}" y="${f(yBot + R * 0.55)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${f(R * 0.12)}" letter-spacing="${f(R * 0.03)}" fill="${leather.lo}">OCIA</text>`;
  }
  return out;
}

/* ------------------------------------------------------------ case & lugs -- */

function lugs(id: string, R: number) {
  const { w0 } = strapGeometry(R);
  const lw = R * 0.15;
  const x1 = CX - w0 / 2 - lw + 2;
  const x2 = CX + w0 / 2 - 2;
  const yT = CY - R * 1.12;
  const yB = CY + R * 0.62;
  const h = R * 0.5;
  let out = "";
  for (const x of [x1, x2]) {
    for (const y of [yT, yB]) {
      out += `<rect x="${f(x)}" y="${f(y)}" width="${f(lw)}" height="${f(h)}" rx="${f(lw * 0.45)}" fill="url(#${id}-brushed)"/>`;
      out += `<rect x="${f(x + lw * 0.18)}" y="${f(y + 4)}" width="${f(lw * 0.18)}" height="${f(h - 8)}" rx="${f(lw * 0.09)}" fill="#fff" opacity="0.18"/>`;
    }
  }
  return out;
}

function crown(spec: WatchSpec, id: string, R: number, side: 1 | -1 = 1) {
  const c = CASE_PALETTE[spec.finish];
  const neckW = R * 0.05;
  const cw = R * 0.12;
  const ch = R * 0.3;
  const x0 = side === 1 ? CX + R - 3 : CX - R + 3 - neckW;
  const xc = side === 1 ? x0 + neckW : x0 - cw;
  let out = `<rect x="${f(x0)}" y="${f(CY - ch * 0.22)}" width="${f(neckW)}" height="${f(ch * 0.44)}" fill="url(#${id}-polished)"/>`;
  out += `<rect x="${f(xc)}" y="${f(CY - ch / 2)}" width="${f(cw)}" height="${f(ch)}" rx="${f(cw * 0.28)}" fill="url(#${id}-brushed)"/>`;
  for (let i = 1; i < 12; i++) {
    const y = CY - ch / 2 + (ch / 12) * i;
    out += `<line x1="${f(xc + 2)}" y1="${f(y)}" x2="${f(xc + cw - 2)}" y2="${f(y)}" stroke="${c.edge}" stroke-opacity="0.45" stroke-width="1.1"/>`;
  }
  if (spec.complication === "chrono") {
    for (const a of [60, 120]) {
      const deg = side === 1 ? a : -a;
      const [px, py] = polar(R + R * 0.04, deg);
      out += `<rect x="${f(px - cw * 0.45)}" y="${f(py - ch * 0.2)}" width="${f(cw * 0.9)}" height="${f(ch * 0.4)}" rx="4" fill="url(#${id}-brushed)" transform="rotate(${f(deg - 90)} ${f(px)} ${f(py)})"/>`;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ dial -- */

type DialOpts = { time?: { h: number; m: number; s: number }; faceOnly?: boolean };

function dial(spec: WatchSpec, id: string, R: number, { time = { h: 10, m: 9, s: 36 }, faceOnly = false }: DialOpts = {}) {
  const d = DIAL_PALETTE[spec.dial];
  const c = CASE_PALETTE[spec.finish];
  const D = R * 0.84;
  const darkDial = spec.dial === "ink";
  let out = "";

  // polished bezel + brushed flank
  if (!faceOnly) {
    out += `<circle cx="${CX}" cy="${CY}" r="${f(R)}" fill="url(#${id}-brushed)"/>`;
    out += `<circle cx="${CX}" cy="${CY}" r="${f(R * 0.965)}" fill="url(#${id}-polished)"/>`;
    out += `<circle cx="${CX}" cy="${CY}" r="${f(R * 0.9)}" fill="${c.edge}" opacity="0.55"/>`;
  }
  out += `<circle cx="${CX}" cy="${CY}" r="${f(D)}" fill="url(#${id}-dial)"/>`;

  // sunray finish
  let rays = "";
  for (let i = 0; i < 180; i++) {
    // start away from the centre so the rays don't converge into moiré
    const [x0, y0] = polar(D * 0.16, i * 2);
    const [x, y] = polar(D, i * 2);
    rays += `M${f(x0)} ${f(y0)}L${f(x)} ${f(y)}`;
  }
  out += `<path d="${rays}" stroke="${darkDial ? "#fff" : "#000"}" stroke-opacity="${darkDial ? 0.035 : 0.025}" stroke-width="1"/>`;

  // inner shadow at the dial edge
  out += `<circle cx="${CX}" cy="${CY}" r="${f(D - 2)}" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="5" filter="url(#${id}-tight)"/>`;

  // minute track
  if (spec.minuteTrack) {
    let ticks = "";
    for (let i = 0; i < 60; i++) {
      const long = i % 5 === 0;
      const [x1, y1] = polar(D * 0.955, i * 6);
      const [x2, y2] = polar(D * (long ? 0.895 : 0.925), i * 6);
      ticks += `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
    }
    out += `<path d="${ticks}" stroke="${d.print}" stroke-width="1.3" stroke-opacity="0.75"/>`;
  }

  const skip = skippedHours(spec);

  // Applied metal markers. The 3D model builds these as real geometry, so the
  // flat dial face used as its texture leaves them out.
  if (!faceOnly) {
    appliedMarkers(spec).forEach((m, i) => {
      if (m.kind === "dot") {
        const [x, y] = polar(D * m.r, m.deg);
        out += `<circle cx="${f(x + 1.2)}" cy="${f(y + 2)}" r="${f(D * m.size)}" fill="#000" opacity="0.25"/>`;
        out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(D * m.size)}" fill="url(#${id}-polished)"/>`;
        return;
      }
      const w = D * m.w;
      const len = D * m.len;
      const x = CX - w / 2 + D * m.dx;
      const y = CY - D * m.r;
      const rot = `transform="rotate(${m.deg} ${CX} ${CY})"`;
      out += `<rect x="${f(x + 1.5)}" y="${f(y + 2.5)}" width="${f(w)}" height="${f(len)}" rx="${f(w * 0.3)}" fill="#000" opacity="0.28" ${rot}/>`;
      out += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(len)}" rx="${f(w * 0.3)}" fill="url(#${id}-${i % 2 ? "polished" : "brushed"})" ${rot}/>`;
      out += `<rect x="${f(x + w * 0.15)}" y="${f(y + 1)}" width="${f(w * 0.25)}" height="${f(len - 2)}" fill="#fff" opacity="0.35" ${rot}/>`;
    });
  }

  for (let h = 0; h < 12; h++) {
    const hour = h === 0 ? 12 : h;
    if (skip.has(hour)) continue;
    switch (spec.indices) {
      case "roman": {
        const numerals = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
        const [x, y] = polar(D * 0.72, h * 30);
        const size = D * (hour % 3 === 0 ? 0.15 : 0.12);
        out += `<text x="${f(x)}" y="${f(y + size * 0.35)}" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="${f(size)}" fill="${d.print}" letter-spacing="-1">${numerals[h]}</text>`;
        break;
      }
      case "numerals": {
        if (hour % 3 === 0) {
          const [x, y] = polar(D * 0.7, h * 30);
          const size = D * 0.2;
          out += `<text x="${f(x)}" y="${f(y + size * 0.36)}" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="300" font-size="${f(size)}" fill="${d.print}">${hour}</text>`;
        }
        break;
      }
    }
  }

  // wordmark
  const lw = D * (spec.indices === "none" ? 0.42 : 0.34);
  const lh = lw * WORDMARK_RATIO;
  const ly = CY - D * (spec.indices === "roman" ? 0.38 : 0.44);
  out += `<image href="${darkDial ? WORDMARK_WHITE : WORDMARK_INK}" x="${f(CX - lw / 2)}" y="${f(ly - lh / 2)}" width="${f(lw)}" height="${f(lh)}" opacity="0.95"/>`;

  // complications
  if (spec.complication === "date") {
    const w = D * 0.17;
    const h = D * 0.13;
    const x = CX + D * 0.6;
    out += `<rect x="${f(x - w / 2)}" y="${f(CY - h / 2)}" width="${f(w)}" height="${f(h)}" rx="2" fill="${darkDial ? "#0b0a0a" : "#fbfaf7"}" stroke="url(#${id}-polished)" stroke-width="3"/>`;
    out += `<text x="${f(x)}" y="${f(CY + h * 0.3)}" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${f(h * 0.72)}" fill="${darkDial ? "#f4f0e8" : "#171615"}">28</text>`;
  }
  const subdial = (sx: number, sy: number, sr: number, handDeg: number) => {
    let s = `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="${d.base}" stroke="${d.print}" stroke-opacity="0.25" stroke-width="1.2"/>`;
    for (let k = 1; k < 6; k++) {
      s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f((sr / 6) * k)}" fill="none" stroke="${darkDial ? "#fff" : "#000"}" stroke-opacity="0.06"/>`;
    }
    let t = "";
    for (let k = 0; k < 12; k++) {
      const [x1, y1] = polar(sr * 0.92, k * 30, sx, sy);
      const [x2, y2] = polar(sr * (k % 3 === 0 ? 0.72 : 0.8), k * 30, sx, sy);
      t += `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
    }
    s += `<path d="${t}" stroke="${d.print}" stroke-width="1.2" stroke-opacity="0.8"/>`;
    const [hx, hy] = polar(sr * 0.82, handDeg, sx, sy);
    s += `<line x1="${f(sx)}" y1="${f(sy)}" x2="${f(hx)}" y2="${f(hy)}" stroke="${d.accent}" stroke-width="2" stroke-linecap="round"/>`;
    s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 0.08)}" fill="url(#${id}-polished)"/>`;
    return s;
  };
  if (spec.complication === "small-seconds") out += subdial(CX, CY + D * 0.46, D * 0.21, 236);
  if (spec.complication === "chrono") {
    out += subdial(CX - D * 0.44, CY, D * 0.19, 300) + subdial(CX + D * 0.44, CY, D * 0.19, 140);
  }

  if (faceOnly) return out;
  out += hands(spec, id, D, time);

  // crystal
  out += `<circle cx="${CX}" cy="${CY}" r="${f(R * 0.9)}" fill="url(#${id}-glass)"/>`;
  out += `<path d="M${f(CX - R * 0.78)} ${f(CY - R * 0.2)} A${f(R * 0.86)} ${f(R * 0.86)} 0 0 1 ${f(CX + R * 0.2)} ${f(CY - R * 0.8)} A${f(R * 0.95)} ${f(R * 0.95)} 0 0 0 ${f(CX - R * 0.78)} ${f(CY - R * 0.2)} Z" fill="#fff" opacity="0.14"/>`;
  return out;
}

function dauphine(id: string, len: number, width: number, deg: number, tail: number) {
  const l = `M0 ${f(tail)} L${f(-width / 2)} ${f(-len * 0.12)} L0 ${f(-len)} Z`;
  const r = `M0 ${f(tail)} L${f(width / 2)} ${f(-len * 0.12)} L0 ${f(-len)} Z`;
  return `<g transform="translate(${CX} ${CY}) rotate(${f(deg)})"><path d="${l}" fill="url(#${id}-facet-l)"/><path d="${r}" fill="url(#${id}-facet-r)"/></g>`;
}

function hands(spec: WatchSpec, id: string, D: number, t: { h: number; m: number; s: number }) {
  const d = DIAL_PALETTE[spec.dial];
  const hDeg = ((t.h % 12) + t.m / 60) * 30;
  const mDeg = (t.m + t.s / 60) * 6;
  const sDeg = t.s * 6;
  const hourHand = dauphine(id, D * 0.55, D * 0.085, hDeg, D * 0.06);
  const minHand = dauphine(id, D * 0.86, D * 0.066, mDeg, D * 0.06);
  const secColor = spec.dial === "ink" ? "#beb4a7" : spec.dial === "taupe" ? "#171615" : "#171615";
  const showSeconds = spec.complication !== "small-seconds";
  const sec = showSeconds
    ? `<g transform="translate(${CX} ${CY}) rotate(${f(sDeg)})"><line x1="0" y1="${f(D * 0.2)}" x2="0" y2="${f(-D * 0.9)}" stroke="${secColor}" stroke-width="1.8" stroke-linecap="round"/><circle cx="0" cy="${f(D * 0.14)}" r="${f(D * 0.028)}" fill="${secColor}"/></g>`
    : "";
  const shadow = `<g opacity="0.3" filter="url(#${id}-tight)" transform="translate(4 7)">${hourHand}${minHand}</g>`;
  const cap = `<circle cx="${CX}" cy="${CY}" r="${f(D * 0.04)}" fill="url(#${id}-polished)"/><circle cx="${CX}" cy="${CY}" r="${f(D * 0.012)}" fill="${d.base}"/>`;
  return shadow + hourHand + minHand + sec + cap;
}

/* ------------------------------------------------------------------ back -- */

function caseback(spec: WatchSpec, id: string, R: number) {
  const c = CASE_PALETTE[spec.finish];
  let out = `<circle cx="${CX}" cy="${CY}" r="${f(R)}" fill="url(#${id}-polished)"/>`;
  out += `<circle cx="${CX}" cy="${CY}" r="${f(R * 0.92)}" fill="url(#${id}-brushed)"/>`;
  for (let k = 0; k < 40; k++) {
    out += `<circle cx="${CX}" cy="${CY}" r="${f(R * 0.3 + k * R * 0.0155)}" fill="none" stroke="${k % 2 ? "#fff" : c.edge}" stroke-opacity="0.07"/>`;
  }
  out += `<circle cx="${CX}" cy="${CY}" r="${f(R * 0.62)}" fill="none" stroke="${c.edge}" stroke-opacity="0.45" stroke-width="1.5"/>`;
  const pr = R * 0.76;
  out += `<path id="${id}-ring" d="M${f(CX - pr)} ${CY} A${f(pr)} ${f(pr)} 0 1 1 ${f(CX + pr)} ${CY} A${f(pr)} ${f(pr)} 0 1 1 ${f(CX - pr)} ${CY}" fill="none"/>`;
  out += `<text font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${f(R * 0.065)}" letter-spacing="${f(R * 0.035)}" fill="${c.edge}" fill-opacity="0.7"><textPath href="#${id}-ring" startOffset="2%">OCIA · LIFESTYLE ESSENTIALS · ISLAMABAD · SAPPHIRE CRYSTAL · 5 ATM ·</textPath></text>`;
  const lines = [
    ["OCIA", 0.16, "Georgia, 'Times New Roman', serif", 0.1],
    [`${spec.sizeMm} MM · 316L`, 0.056, "'Helvetica Neue', Helvetica, Arial, sans-serif", 0.1],
    ["N° 0001 / 0250", 0.05, "'Helvetica Neue', Helvetica, Arial, sans-serif", 0.24],
  ] as const;
  lines.forEach(([txt, size, family, dy], i) => {
    out += `<text x="${CX}" y="${f(CY - R * 0.05 + (i === 0 ? 0 : R * dy + (i === 2 ? R * 0.02 : 0)))}" text-anchor="middle" font-family="${family}" font-size="${f(R * size)}" letter-spacing="${f(R * (i === 0 ? 0.03 : 0.022))}" fill="${c.edge}" fill-opacity="0.75">${txt}</text>`;
  });
  for (const a of [45, 135, 225, 315]) {
    const [x, y] = polar(R * 0.955, a);
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.03)}" fill="url(#${id}-polished)" stroke="${c.edge}" stroke-opacity="0.5"/>`;
    out += `<line x1="${f(x - R * 0.02)}" y1="${f(y)}" x2="${f(x + R * 0.02)}" y2="${f(y)}" stroke="${c.edge}" stroke-width="1.5" transform="rotate(${a} ${f(x)} ${f(y)})"/>`;
  }
  return out;
}

/* ------------------------------------------------------------- assembly -- */

function silhouetteShadow(id: string, R: number, ext?: number, dx = 18, dy = 26, opacity = 0.26) {
  const { w0, w1, yTop, yBot } = strapGeometry(R);
  const top = ext !== undefined ? CY - ext : -60;
  const bottom = ext !== undefined ? CY + ext : H + 60;
  return `<g filter="url(#${id}-soft)" opacity="${opacity}" transform="translate(${dx} ${dy})">
    <circle cx="${CX}" cy="${CY}" r="${f(R * 1.02)}" fill="#1a1510"/>
    <path d="${strapPath(w0, w1, yTop, top, ext !== undefined)}" fill="#1a1510" opacity="0.6"/>
    <path d="${strapPath(w0, w1, yBot, bottom, ext !== undefined)}" fill="#1a1510" opacity="0.6"/>
  </g>`;
}

type BodyOpts = { back?: boolean; time?: { h: number; m: number; s: number }; strapExt?: number };

function watchBody(spec: WatchSpec, id: string, opts: BodyOpts = {}) {
  const R = radiusFor(spec.sizeMm);
  const back = opts.back ?? false;
  return [
    silhouetteShadow(id, R, opts.strapExt),
    strap(spec, id, R, back, opts.strapExt),
    lugs(id, R),
    crown(spec, id, R, back ? -1 : 1),
    back ? caseback(spec, id, R) : dial(spec, id, R, { time: opts.time }),
  ].join("");
}

function leafShadows(id: string) {
  const leaves = [
    [120, 140, 260, 38, -32],
    [260, 60, 300, 30, -24],
    [640, 180, 280, 34, 28],
    [700, 420, 240, 26, 40],
    [80, 620, 300, 36, -40],
    [560, 860, 320, 40, 18],
    [300, 930, 220, 28, -12],
  ];
  return `<g filter="url(#${id}-leaf)" opacity="0.13" fill="#4d4235">${leaves
    .map(([x, y, rx, ry, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})"/>`)
    .join("")}</g>`;
}

const svgOpen = (viewBox = `0 0 ${W} ${H}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">`;

export function renderWatch(spec: WatchSpec, view: RenderView, idPrefix = "w"): string {
  const id = `${idPrefix}${spec.finish[0]}${spec.dial[0]}`;
  const R = radiusFor(spec.sizeMm);
  const D = R * 0.84;
  switch (view) {
    case "front":
      return `${svgOpen()}${defs(spec, id)}${watchBody(spec, id)}</svg>`;
    case "back":
      return `${svgOpen()}${defs(spec, id)}${watchBody(spec, id, { back: true })}</svg>`;
    case "dial": {
      const w = D * 1.5;
      const h = w * 1.25;
      return `${svgOpen(`${f(CX - w / 2)} ${f(CY - h / 2)} ${f(w)} ${f(h)}`)}${defs(spec, id)}<rect x="0" y="0" width="${W}" height="${H}" fill="${DIAL_PALETTE[spec.dial].base}"/>${watchBody(spec, id, { time: { h: 10, m: 10, s: 42 } })}</svg>`;
    }
    case "crown": {
      const w = R * 1.1;
      const h = w * 1.25;
      return `${svgOpen(`${f(CX + R * 0.55 - w / 2)} ${f(CY - h * 0.5)} ${f(w)} ${f(h)}`)}${defs(spec, id)}${watchBody(spec, id)}</svg>`;
    }
    case "flatlay":
      return `${svgOpen()}${defs(spec, id)}<rect width="${W}" height="${H}" fill="#e7e0d4"/>${leafShadows(id)}<g transform="translate(${CX} ${CY}) rotate(-24) scale(1.1) translate(${-CX} ${-CY})">${watchBody(spec, id)}</g></svg>`;
  }
}

/**
 * Flat, square dial face (no hands, no bezel) for texturing the 3D model.
 * The 3D hands tell the real time over it.
 */
export function renderDialFace(spec: WatchSpec, px = 2048): string {
  const id = "face";
  const R = radiusFor(spec.sizeMm);
  const D = R * 0.84;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(CX - D)} ${f(CY - D)} ${f(D * 2)} ${f(D * 2)}" width="${px}" height="${px}">${defs(spec, id)}${dial(spec, id, R, { faceOnly: true })}</svg>`;
}

/** Two watches composed together — used for the His & Hers pairing. */
export function renderPair(a: WatchSpec, b: WatchSpec, view: RenderView): string {
  if (view === "dial" || view === "crown" || view === "back") return renderWatch(a, view, "pa");
  const bg = view === "flatlay" ? `<rect width="${W}" height="${H}" fill="#e7e0d4"/>` : "";
  const leaves = view === "flatlay" ? leafShadows("pa") : "";
  const place = (spec: WatchSpec, pid: string, x: number, y: number, s: number, rot: number) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(${-CX} ${-CY})">${defs(spec, pid)}${watchBody(spec, pid, { strapExt: radiusFor(spec.sizeMm) * 2.55 })}</g>`;
  return `${svgOpen()}${defs(a, "pa")}${bg}${leaves}${place(a, "pa", 262, 480, 0.62, view === "flatlay" ? -10 : 0)}${place(b, "pb", 560, 540, 0.62, view === "flatlay" ? 14 : 0)}</svg>`;
}
