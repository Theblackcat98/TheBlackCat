// FELIS-09 v2 · Bionic Feline Quadruped anatomy figure builder.
// Run:
//   node static/anatomy/src/robotic-cat/build.mjs --audit
//   node static/anatomy/src/robotic-cat/build.mjs --light

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
function findSkillDir() {
  const candidates = [
    process.env.ANATOMY_SKILL,
    join(homedir(), ".gemini", "config", "skills", "anatomy"),
    "/home/nick/.gemini/config/skills/anatomy",
  ].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(join(dir, "kit", "iso-kit.mjs"))) return dir;
  }
  throw new Error("Could not locate anatomy skill kit directory.");
}

const SKILL_DIR = findSkillDir();
const k = await import(pathToFileURL(join(SKILL_DIR, "kit", "iso-kit.mjs")).href);
const G = await import(pathToFileURL(join(SKILL_DIR, "kit", "lathe.mjs")).href);
const A = await import(pathToFileURL(join(SKILL_DIR, "kit", "audit.mjs")).href);
const { tubePieces, tubeSvg } = await import(pathToFileURL(join(SKILL_DIR, "kit", "tube.mjs")).href);
const { kitScript } = await import(pathToFileURL(join(SKILL_DIR, "scripts", "inline-kit.mjs")).href);
const M = await import(pathToFileURL(join(HERE, "model.mjs")).href);

const WIDTH = 720;
const HEIGHT = 500;
const AZIMUTH = 43;
const ELEVATION = 30;

// Bounding envelope covering console [-122, 40] through front rail [+92, -58..+74] and head/ears [z=78].
const WORLD_CORNERS = k.boxCorners({ x: -122, y: -58, w: 214, d: 132 }, 0, 78);
const P = k.fitProjection(WORLD_CORNERS, WIDTH, HEIGHT, {
  azimuth: AZIMUTH,
  elevation: ELEVATION,
  pad: 18,
  headroom: 10,
});

const FIG = "FIG. 05";
const TITLE = "FELIS-09 · Bionic Feline Quadruped";
const HINT = "drag to aim · click or space to pounce · keys 1–4";
const MODEL_PATH = join(HERE, "model.mjs");
const CSS_PATH = join(HERE, "robotic-cat.css");
const LIVE_PATH = join(HERE, "live.js");
const OUT_DARK = join(HERE, "robotic-cat.html");
const OUT_LIGHT = join(HERE, "robotic-cat-light.html");

const ORDER = [
  "stand.pad.RL",
  "stand.pad.RR",
  "stand.console",
  "stand.manifold",
  "stand.gauge",
  "stand.pad.FL",
  "stand.pad.FR",
  "stand.rail",
  "cable.console",
  "cable.gauge",
  "cat.tail",
  "cat.leg.RL",
  "cat.pelvis",
  "cat.leg.RR",
  "cat.battery.L",
  "cat.spine",
  "cat.battery.R",
  "cat.thorax",
  "cat.leg.FL",
  "cat.leg.FR",
  "cat.head",
  "target.carriage",
  "sight.beam",
];

// ---------------------------------------------------------------------------
// Shared Pure Helpers (serialized into the interactive browser bundle)
// ---------------------------------------------------------------------------

export const frameOf = (o, a, u) => {
  const axis = G.unit3(a);
  const uu = u
    ? G.unit3(G.sub3(u, G.mul3(axis, G.dot3(u, axis))))
    : G.frameAlong(o, axis).u;
  return { o, a: axis, u: uu, v: G.cross3(axis, uu) };
};

export const framePt = (F, s, x, y) => [
  F.o[0] + F.a[0] * s + F.u[0] * x + F.v[0] * y,
  F.o[1] + F.a[1] * s + F.u[1] * x + F.v[1] * y,
  F.o[2] + F.a[2] * s + F.u[2] * x + F.v[2] * y,
];

export const crSample = (pts, segs = 5, closed = true) => {
  const out = [];
  const n = pts.length;
  const at = (i) =>
    closed
      ? pts[((i % n) + n) % n]
      : pts[Math.max(0, Math.min(n - 1, i))];
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    for (let s = 0; s < segs; s++) {
      const t = s / segs;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
};

const D = (pts, { size = 0.28, tone = "lo" } = {}) =>
  pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="var(--anatomy-${tone === "lo" ? "ink" : "face-" + tone})" stroke="none"/>`).join("");

const solidPart = (res, { hi = "hi", edge = null, crease = "faint", lit = false, halo = false, inner = "" } = {}) =>
  k.solidSvg(res, { tone: edge ?? hi, crease, lit, halo, inner });

// ---------------------------------------------------------------------------
// Live-Rebuildable Assembly 1: 3-Link Digitigrade Pantograph Leg + Achilles
// ---------------------------------------------------------------------------

export const legSvg = (leg, P) => {
  const H = leg.hip;
  const K = leg.knee;
  const HK = leg.hock;
  const HL = leg.heel;
  const PW = leg.paw;
  const side = leg.side; // -1 = left (-Y), +1 = right (+Y)
  const fore = leg.fore; // +1 = fore, -1 = hind

  const upDir = G.sub3(K, H);
  const upLen = G.len3(upDir);
  const upF = frameOf(H, [0, 1, 0], upDir);

  const loDir = G.sub3(HK, K);
  const loLen = G.len3(loDir);
  const loF = frameOf(K, [0, 1, 0], loDir);

  const metaDir = G.sub3(PW, HK);
  const metaLen = G.len3(metaDir);
  const metaF = frameOf(HK, [0, 1, 0], metaDir);

  const heelDir = G.sub3(HL, HK);
  const heelLen = G.len3(heelDir);
  const heelF = frameOf(HK, [0, 1, 0], heelDir);

  const tVec = G.sub3(HL, leg.tendonTop);
  const tLen = G.len3(tVec);
  const tendonF = G.frameAlong(leg.tendonTop, tVec);

  // 1. Outboard Hip QDD Harmonic Actuator Dome
  const coverOrigin = [H[0], side * 12.2, H[2]];
  const coverF = frameOf(coverOrigin, [0, side, 0], [1, 0, 0]);
  const domeProf = [
    [0, 2.2],
    [0.9, 5.2, 1],
    [2.5, 6.4, 1],
    [4.4, 6.5, 1],
    [6.0, 5.1, 1],
    [6.9, 2.8, 1],
    [7.2, 0.2],
  ];
  const hipDome = G.solidOf(domeProf, coverF, P);
  const hipBolts = G.dotsOf(coverF, 6.95, 3.6, 6, P, { fade: [0.05, 0.45] });
  const hipSeam = G.arcOf(coverF, 3.5, 6.52, P, { least: 0.01, trim: 0 });

  // 2. Sculpted 5-slice Biomimetic Femur
  const bulgeF = fore > 0 ? -3.4 : -3.8;
  const bulgeB = fore > 0 ? 3.2 : 3.6;
  const upPoly = crSample([
    [-1.2, 0.0],
    [1.8, bulgeF * 0.92],
    [upLen * 0.36, bulgeF * 1.1],
    [upLen * 0.72, bulgeF * 0.72],
    [upLen + 0.8, -1.5],
    [upLen + 0.8, 1.5],
    [upLen * 0.68, bulgeB * 0.68],
    [upLen * 0.30, bulgeB * 1.0],
    [1.2, bulgeB * 0.86],
  ], 3, true);
  const femurSlices = [
    [-1.9, -1.2, 0.78],
    [-1.2, -0.5, 0.94],
    [-0.5, 0.5, 1.0],
    [0.5, 1.2, 0.94],
    [1.2, 1.9, 0.78],
  ];
  const femurParts = femurSlices.map(([s0, s1, sc]) =>
    solidPart(G.prismOf(upF, upPoly.map(([x, y]) => [x, y * sc]), s0, s1, P), { hi: "hi", mid: "mid", lo: "lo" })
  );

  // Tendon clevis lug behind knee
  const clevisPts = crSample([
    [upLen - 2.6, 0.8],
    [upLen - 1.2, 3.4],
    [upLen + 0.4, 3.2],
    [upLen + 0.6, 1.2],
  ], 2, true);
  const kneeClevis = solidPart(G.prismOf(upF, clevisPts, -0.9, 0.9, P), { hi: "mid", mid: "mid", lo: "lo" });

  // 3. Stifle (Knee) Harmonic Drum
  const kneeF = frameOf(K, [0, 1, 0], [1, 0, 0]);
  const kneeDrum = solidPart(G.disc(-2.1, 2.1, 3.2, kneeF, P), { hi: "mid", mid: "mid", lo: "lo" });
  const kneeCapDots = G.dotsOf(kneeF, side > 0 ? 2.12 : -2.12, 1.9, 6, P, { fade: [0.04, 0.45] });

  // 4. Bowed Tibia Blade (3 slices) + Calcaneal Heel Spur
  const bow = fore > 0 ? 1.8 : -2.1;
  const loPoly = crSample([
    [-0.5, -2.0],
    [loLen * 0.42, -1.8 + bow * 0.55],
    [loLen + 0.4, -1.35],
    [loLen + 0.4, 1.35],
    [loLen * 0.45, 2.2 + bow * 0.35],
    [-0.5, 2.1],
  ], 3, true);
  const tibiaParts = [
    [-1.45, -0.55, 0.84],
    [-0.55, 0.55, 1.0],
    [0.55, 1.45, 0.84],
  ].map(([s0, s1, sc]) => solidPart(G.prismOf(loF, loPoly.map(([x, y]) => [x, y * sc]), s0, s1, P)));

  const heelPoly = [
    [-0.8, -1.6],
    [heelLen + 0.9, -1.1],
    [heelLen + 0.9, 1.1],
    [-0.8, 1.6],
  ];
  const heelSpur = solidPart(G.prismOf(heelF, heelPoly, -1.0, 1.0, P), { hi: "mid", mid: "mid", lo: "lo" });

  // 5. Achilles Parallel Elastic Tendon Spring-Damper + Rod-End Balls
  const topBall = solidPart(G.sphereOf(leg.tendonTop, 1.15, P, { steps: 24 }), { hi: "mid", mid: "lo", lo: "lo" });
  const botBall = solidPart(G.sphereOf(HL, 1.15, P, { steps: 24 }), { hi: "mid", mid: "lo", lo: "lo" });
  const sleeveLen = Math.min(tLen * 0.48, 6.8);
  const damperSleeve = solidPart(G.disc(0.85, sleeveLen, 1.0, tendonF, P), { hi: "mid", mid: "mid", lo: "lo" });
  const innerRod = solidPart(G.disc(sleeveLen - 0.2, tLen - 0.85, 0.56, tendonF, P), { hi: "hi", mid: "hi", lo: "mid" });

  // 6. Hock Joint Drum
  const hockF = frameOf(HK, [0, 1, 0], [1, 0, 0]);
  const hockDrum = solidPart(G.disc(-1.7, 1.7, 2.55, hockF, P), { hi: "mid", mid: "mid", lo: "lo" });

  // 7. Angled Metatarsal Strut
  const metaPoly = crSample([
    [-0.4, -1.45],
    [metaLen * 0.5, -1.35],
    [metaLen + 0.2, -1.05],
    [metaLen + 0.2, 1.05],
    [metaLen * 0.5, 1.55],
    [-0.4, 1.45],
  ], 2, true);
  const metaStrut = solidPart(G.prismOf(metaF, metaPoly, -1.15, 1.15, P));

  // 8. Sculpted 3-Lobed Clawed Paw Pad resting FLUSH at z = PAD_TOP (4.5)
  const pawF = frameOf([PW[0], PW[1], M.PAD_TOP], [0, 0, 1], [1, 0, 0]);
  const ankleBall = solidPart(G.sphereOf(PW, 1.65, P, { steps: 24 }), { hi: "mid", mid: "lo", lo: "lo" });
  const pawCore = solidPart(
    G.prismOf(pawF, crSample([
      [-3.4, -3.2],
      [1.2, -3.8],
      [3.8, -2.5],
      [4.5, 0.0],
      [3.8, 2.5],
      [1.2, 3.8],
      [-3.4, 3.2],
    ], 3, true), 0, 1.7, P),
    { hi: "mid", mid: "lo", lo: "lo" }
  );
  const toeOffsets = [-2.25, 0, 2.25];
  const toes = toeOffsets.map((ty, idx) => {
    const reach = idx === 1 ? 5.6 : 4.7;
    const base = idx === 1 ? 2.6 : 2.1;
    const toePoly = crSample([
      [base, ty - 1.05],
      [reach, ty - 0.85],
      [reach + 0.9, ty],
      [reach, ty + 0.85],
      [base, ty + 1.05],
    ], 2, true);
    const clawPoly = [
      [reach + 0.3, ty - 0.32],
      [reach + 2.1, ty],
      [reach + 0.3, ty + 0.32],
    ];
    return (
      solidPart(G.prismOf(pawF, toePoly, 0, 1.45, P), { hi: "hi", mid: "mid", lo: "lo" }) +
      solidPart(G.prismOf(pawF, clawPoly, 0, 0.75, P), { hi: "hi", mid: "hi", lo: "mid" })
    );
  }).join("");

  const hipDomeSvg = solidPart(hipDome) + (hipSeam ? `<path class="iso-line" data-tone="faint" data-free="both" d="${hipSeam}"/>` : "") + D(hipBolts, { size: 0.3, tone: "lo" });
  const tendonSvg = topBall + botBall + damperSleeve + innerRod;
  const pawSvg = pawCore + toes + ankleBall;
  const kneeSvg = kneeClevis + kneeDrum + D(kneeCapDots, { size: 0.28, tone: "lo" });

  return pawSvg + tendonSvg + metaStrut + hockDrum + heelSpur + tibiaParts.join("") + kneeSvg + femurParts.join("") + hipDomeSvg;
};

// ---------------------------------------------------------------------------
// Live-Rebuildable Assembly 2: 3-Vertebra Lumbar Spine & Dorsal Coil Spring
// ---------------------------------------------------------------------------

export const spineSvg = (st, P) => {
  const dy = st.torsoDy * 0.45;
  const zAt = (u) => {
    const baseZ = 47.0 + st.pelvisDz * (1 - u) + st.thoraxDz * u;
    return baseZ + st.spineArchZ * Math.sin(Math.PI * u);
  };
  const p0 = [-26 + st.torsoDx, dy, zAt(0)];
  const p1 = [-7 + st.torsoDx, dy, zAt(0.5)];
  const p2 = [12 + st.torsoDx, dy, zAt(1)];

  const guideA = solidPart(G.disc(0, G.len3(G.sub3(p1, p0)), 1.9, G.frameAlong(p0, G.sub3(p1, p0)), P), { hi: "mid", mid: "mid", lo: "lo" });
  const guideB = solidPart(G.disc(0, G.len3(G.sub3(p2, p1)), 1.9, G.frameAlong(p1, G.sub3(p2, p1)), P), { hi: "mid", mid: "mid", lo: "lo" });

  const vertUs = [0.22, 0.50, 0.78];
  const verts = vertUs.map((u) => {
    const vx = -26 + u * 38 + st.torsoDx;
    const vz = zAt(u);
    const vf = frameOf([vx, dy, vz], [1, 0, 0], [0, 1, 0]);
    const vDisc = solidPart(G.disc(-2.3, 2.3, 4.4, vf, P), { hi: "hi", mid: "mid", lo: "lo" });
    const collar = solidPart(G.disc(-1.1, 1.1, 5.1, vf, P), { hi: "mid", mid: "lo", lo: "lo" });
    const finF = frameOf([vx, dy, vz + 2.2], [0, 1, 0], [1, 0, 0]);
    const finPoly = [[-1.6, 0], [1.4, 0], [0.8, 3.8], [-2.2, 3.4]];
    const fin = solidPart(G.prismOf(finF, finPoly, -0.7, 0.7, P), { hi: "hi", mid: "mid", lo: "lo" });
    return vDisc + collar + fin;
  }).join("");

  const cMidZ = zAt(0.5) + 6.5;
  const coilStart = [-23 + st.torsoDx, dy, zAt(0.08) + 6.2];
  const coilEnd = [9 + st.torsoDx, dy, zAt(0.92) + 6.2];
  const rodVec = G.sub3(coilEnd, coilStart);
  const rodF = G.frameAlong(coilStart, rodVec);
  const rodLen = G.len3(rodVec);
  const rodRearCollar = solidPart(G.disc(-1.6, 0.2, 2.6, rodF, P), { hi: "mid", mid: "lo", lo: "lo" });
  const rodFrontCollar = solidPart(G.disc(rodLen - 0.2, rodLen + 1.6, 2.6, rodF, P), { hi: "mid", mid: "lo", lo: "lo" });
  const innerRod = solidPart(G.disc(0, rodLen, 0.85, rodF, P), { hi: "hi", mid: "mid", lo: "lo" });
  const springCoil = k.coil(-23 + st.torsoDx, 9 + st.torsoDx, [dy, (coilStart[2] + cMidZ) * 0.5], 2.2, 8.5, "x", P, 14);
  const coilBack = springCoil.back ? k.lineSvg(springCoil.back, { tone: "lo", free: true }) : "";
  const coilFront = springCoil.front ? k.lineSvg(springCoil.front, { tone: "hi", free: true }) : "";

  return guideA + guideB + verts + coilBack + rodRearCollar + innerRod + rodFrontCollar + coilFront;
};

// ---------------------------------------------------------------------------
// Live-Rebuildable Assembly 3: Feline Wedge Skull, Slit Pupils, Pinnae & Whiskers
// ---------------------------------------------------------------------------

export const headSvg = (st, P) => {
  const o = [48.5 + st.headDx, st.headDy, 62.5 + st.headDz];
  const yawRad = st.yaw * 0.22;
  const pitchRad = -st.pitch * 0.16;
  const fwd = G.unit3([
    Math.cos(yawRad) * Math.cos(pitchRad),
    Math.sin(yawRad) * Math.cos(pitchRad),
    Math.sin(pitchRad),
  ]);
  const lat = G.unit3([-Math.sin(yawRad), Math.cos(yawRad), 0]);
  const HF = frameOf(o, G.mul3(lat, -1), fwd);

  // Articulated cervical neck gimbal collar
  const neckBase = [43 + st.torsoDx, st.torsoDy * 0.45, 54.0 + st.thoraxDz];
  const neckTop = framePt(HF, 0, 0, -2.5);
  const neckVec = G.sub3(neckTop, neckBase);
  const neckF = G.frameAlong(neckBase, neckVec);
  const neckCol = solidPart(G.disc(0, G.len3(neckVec), 3.6, neckF, P), { hi: "mid", mid: "lo", lo: "lo" });
  const neckRing = solidPart(G.disc(1.2, 3.2, 4.4, neckF, P), { hi: "hi", mid: "mid", lo: "lo" });

  // Multi-slice Wedge Cranium & Tapered Muzzle
  const skullPoly = crSample([
    [-5.5, -3.5],
    [-4.0, 5.8],
    [1.8, 7.6],
    [7.2, 5.8],
    [12.4, 2.2],
    [15.6, -0.4],
    [14.2, -3.2],
    [6.5, -4.4],
    [-2.0, -4.4],
  ], 3, true);
  const cranium = [
    [-7.6, -4.2, 0.76],
    [-4.2, 4.2, 1.0],
    [4.2, 7.6, 0.76],
  ].map(([s0, s1, sc]) =>
    solidPart(G.prismOf(HF, skullPoly.map(([x, y]) => [x, y * sc]), s0, s1, P), { hi: "hi", mid: "mid", lo: "lo" })
  ).join("");

  const jawDrop = st.crouch * 1.1;
  const jawPoly = [
    [1.5, -4.2 - jawDrop],
    [13.4, -3.0 - jawDrop],
    [14.0, -4.8 - jawDrop],
    [3.5, -5.8 - jawDrop],
  ];
  const mandible = solidPart(G.prismOf(HF, jawPoly, -4.4, 4.4, P), { hi: "mid", mid: "lo", lo: "lo" });

  const nosePoly = [
    [13.5, 1.2],
    [16.2, 0.4],
    [16.0, -1.3],
    [13.2, -1.1],
  ];
  const noseTip = solidPart(G.prismOf(HF, nosePoly, -1.9, 1.9, P), { hi: "mid", mid: "mid", lo: "lo" });

  const buildEye = (sideLat) => {
    const eyePos = framePt(HF, -sideLat * 4.4, 9.2, 2.3);
    const eyeFwd = G.unit3(G.add3(fwd, G.mul3(lat, sideLat * 0.20)));
    const EF = frameOf(eyePos, eyeFwd, HF.v);
    const barrel = solidPart(G.disc(-2.2, 0.8, 2.55, EF, P), { hi: "mid", mid: "lo", lo: "lo" });
    const glowCenter = k.iso(framePt(EF, 0.84, 0, 0), P);
    const glowRing = `<circle cx="${glowCenter[0].toFixed(1)}" cy="${glowCenter[1].toFixed(1)}" r="${(1.92 * G.scaleOf(P)).toFixed(2)}" fill="var(--anatomy-lit)" stroke="var(--anatomy-ink)" stroke-width="0.65"/>`;
    const pw = 0.32 + 1.05 * st.pupilDilate;
    const ph = 1.65;
    const slitPts = [
      framePt(EF, 0.88, ph, 0),
      framePt(EF, 0.88, 0, pw),
      framePt(EF, 0.88, -ph, 0),
      framePt(EF, 0.88, 0, -pw),
    ].map((pt) => k.iso(pt, P));
    const pupil = `<path class="rc-pupil" d="${k.pathOf(slitPts, true)}"/>`;
    return barrel + glowRing + pupil;
  };

  const buildEar = (sideLat) => {
    const swivel = sideLat < 0 ? st.earSwivelL : st.earSwivelR;
    const flatRad = st.earFlatten * 0.56;
    const basePos = framePt(HF, -sideLat * 5.0, -0.6, 6.2);
    const earUp = G.unit3(G.add3(
      G.mul3(HF.v, Math.cos(flatRad)),
      G.add3(G.mul3(fwd, -Math.sin(flatRad) * 0.92 - 0.10), G.mul3(lat, sideLat * (0.34 + st.earFlatten * 0.24)))
    ));
    const openFwd = G.unit3(G.add3(
      G.mul3(fwd, Math.cos(swivel)),
      G.mul3(lat, sideLat * Math.sin(swivel) + sideLat * 0.20)
    ));
    const baseTurret = solidPart(G.disc(-0.6, 0.9, 2.0, frameOf(basePos, earUp, openFwd), P), { hi: "mid", mid: "lo", lo: "lo" });
    // Sleek pointed triangular feline pinna blade extruded along openFwd (thin ear dish!)
    const bladeF = frameOf(basePos, openFwd, earUp);
    const pinnaTri = [
      [0.6, -2.7],
      [9.4, -0.35],
      [9.4, 0.35],
      [0.6, 2.7],
    ];
    const outerPinna = solidPart(G.prismOf(bladeF, pinnaTri, -1.6, 0.6, P), { hi: "hi", mid: "mid", lo: "lo" });
    const dishTri = [
      [1.4, -1.6],
      [7.4, -0.15],
      [7.4, 0.15],
      [1.4, 1.6],
    ];
    const innerDish = solidPart(G.prismOf(bladeF, dishTri, 0.6, 1.45, P), { hi: "mid", mid: "lo", lo: "lo" });
    return baseTurret + outerPinna + innerDish;
  };

  const whiskers = [-1, 1].map((sideLat) => {
    const angles = [-0.22, 0.0, 0.24];
    const boss = framePt(HF, -sideLat * 4.5, 11.4, -1.8);
    const bossF = frameOf(boss, G.mul3(lat, sideLat), fwd);
    const bossCap = solidPart(G.disc(-0.4, 0.65, 1.0, bossF, P), { hi: "mid", mid: "lo", lo: "lo" });
    const hairs = angles.map((a, idx) => {
      const tip = framePt(
        HF,
        -sideLat * (10.5 + idx * 1.1),
        12.5 - idx * 0.6,
        -1.5 + a * 5.2
      );
      return k.wireSvg(k.iso(boss, P), k.iso(tip, P), { tone: "lo", ends: "both", size: 0.45 });
    }).join("");
    return bossCap + hairs;
  });

  const leftSide = whiskers[0] + buildEye(-1) + buildEar(-1);
  const rightSide = whiskers[1] + buildEye(1) + buildEar(1);
  return neckCol + neckRing + mandible + cranium + noseTip + leftSide + rightSide;
};

// ---------------------------------------------------------------------------
// Live-Rebuildable Assembly 4: 7-Link 3D Spline Whip Tail
// ---------------------------------------------------------------------------

export const tailFrames = (nodes) => {
  const ballR = [3.0, 2.75, 2.5, 2.25, 2.0, 1.75, 1.55];
  const segR0 = [2.4, 2.2, 2.0, 1.8, 1.62, 1.45, 1.28];
  const segR1 = [2.2, 2.0, 1.8, 1.62, 1.45, 1.28, 1.08];
  const links = [];
  for (let i = 0; i < 7; i++) {
    const p0 = nodes[i];
    const p1 = nodes[i + 1];
    const diff = G.sub3(p1, p0);
    const len = G.len3(diff);
    const F = G.frameAlong(p0, diff);
    const R0 = ballR[i];
    const isLast = i === 6;
    const R1 = isLast ? 0 : ballR[i + 1];
    const s0 = R0 * 0.92;
    const s1 = isLast ? Math.max(s0 + 1.2, len) : Math.max(s0 + 1.2, len - R1 * 0.92);
    const prof = [[s0, segR0[i]], [s1, segR1[i]]];
    links.push({ p0, p1, R0, F, prof, sMid: (s0 + s1) * 0.5, rMid: (segR0[i] + segR1[i]) * 0.5, isLast });
  }
  return links;
};

export const tailSvg = (nodes, P) => {
  const links = tailFrames(nodes);
  const V = G.viewOf(P);
  const ordered = links.map((lk, i) => ({
    lk,
    i,
    depth: G.dot3(lk.p0, V),
  })).sort((a, b) => a.depth - b.depth);

  return ordered.map(({ lk }) => {
    const ball = solidPart(G.sphereOf(lk.p0, lk.R0, P, { steps: 26 }), { hi: "mid", mid: "lo", lo: "lo" });
    const seg = solidPart(G.solidOf(lk.prof, lk.F, P, { rims: "all" }), { hi: "hi", mid: "mid", lo: "lo" });
    const band = G.arcOf(lk.F, lk.sMid, lk.rMid + 0.04, P, { least: 0.01, trim: 0 });
    const ring = band ? `<path class="iso-line" data-tone="faint" data-free="both" d="${band}"/>` : "";
    let tip = "";
    if (lk.isLast) {
      const tipS = k.iso(lk.p1, P);
      tip = `<circle class="rc-beacon" cx="${tipS[0].toFixed(1)}" cy="${tipS[1].toFixed(1)}" r="${(1.55 * G.scaleOf(P)).toFixed(2)}" stroke="var(--anatomy-ink)" stroke-width="0.65"/>`;
    }
    return ball + seg + ring + tip;
  }).join("");
};

// ---------------------------------------------------------------------------
// Live-Rebuildable Target Carriage, Decoy Whip Lure, Bars & Dial Needle
// ---------------------------------------------------------------------------

export const targetSvg = (y, dz, whip, P) => {
  const cx = 84;
  const zBase = 7.5;
  const blockF = frameOf([cx, y, zBase], [0, 0, 1], [1, 0, 0]);
  const block = solidPart(G.prismOf(blockF, [[-3.6, -4.6], [3.6, -4.6], [3.6, 4.6], [-3.6, 4.6]], 0, 3.4, P), { hi: "mid", mid: "mid", lo: "lo" });

  const mastH = 7.5 + dz;
  const mastF = frameOf([cx, y, zBase + 3.4], [0, 0, 1], [1, 0, 0]);
  const mast = solidPart(G.disc(0, mastH, 1.35, mastF, P), { hi: "mid", mid: "lo", lo: "lo" });

  const colCenter = [cx, y, zBase + 3.4 + mastH + 1.8];
  const colF = frameOf(colCenter, [-1, 0, 0], [0, 0, 1]);
  const hood = solidPart(G.disc(-2.4, 3.0, 2.5, colF, P), { hi: "hi", mid: "mid", lo: "lo" });
  const emitter = k.iso(framePt(colF, 3.05, 0, 0), P);
  const glow = `<circle cx="${emitter[0].toFixed(1)}" cy="${emitter[1].toFixed(1)}" r="${(1.8 * G.scaleOf(P)).toFixed(2)}" fill="var(--anatomy-lit)" stroke="var(--anatomy-ink)" stroke-width="0.65"/>`;

  const baseA = [cx + 0.5, y, colCenter[2] + 2.2];
  const midA = [cx + 2.5, y + whip * 0.45, colCenter[2] + 7.2];
  const tipA = [cx + 0.2, y + whip, colCenter[2] + 11.4];
  const whipWire = k.wireSvg(k.iso(baseA, P), k.iso(tipA, P), {
    via: [k.iso(midA, P)],
    tone: "hi",
    ends: "from",
    size: 0.7,
  });
  const tipP = k.iso(tipA, P);
  const lureBall = `<circle cx="${tipP[0].toFixed(1)}" cy="${tipP[1].toFixed(1)}" r="${(2.2 * G.scaleOf(P)).toFixed(2)}" fill="var(--anatomy-lit)" stroke="var(--anatomy-ink)" stroke-width="0.7"/>`;

  return block + mast + hood + glow + whipWire + lureBall;
};

export const sightBeamSvg = (st, P) => {
  const from = [81.0, st.targetY, 19.6 + st.targetDz];
  const to = [59.0 + st.headDx, st.headDy, 63.5 + st.headDz];
  const d = k.pathOf([k.iso(from, P), k.iso(to, P)]);
  return k.lineSvg(d, { tone: "lit", dashed: true, dotted: true, free: "both" });
};

export const barPath = (ox, oy, oz, width, frac, P) => {
  const maxH = 9.2;
  const h = Math.max(0.8, Math.min(1, frac) * maxH);
  const p = [
    [ox, oy, oz],
    [ox + h, oy, oz],
    [ox + h, oy + width, oz],
    [ox, oy + width, oz],
  ].map((pt) => k.iso(pt, P));
  return k.pathOf(p, true);
};

export const gaugeNeedleSvg = (torqueNm, P) => {
  const cx = -24;
  const cy = 58;
  const z = 7.45;
  const frac = Math.max(0, Math.min(1, torqueNm / 25));
  const ang = -Math.PI * 0.78 + frac * Math.PI * 1.56;
  const tip = [cx + Math.cos(ang) * 11.2, cy + Math.sin(ang) * 11.2, z];
  const tail = [cx - Math.cos(ang) * 3.2, cy - Math.sin(ang) * 3.2, z];
  const d = k.pathOf([k.iso(tail, P), k.iso(tip, P)]);
  const pivot = k.iso([cx, cy, z], P);
  return (
    `<path class="iso-line" data-tone="lit" data-free="both" d="${d}"/>` +
    `<circle cx="${pivot[0].toFixed(1)}" cy="${pivot[1].toFixed(1)}" r="2.2" fill="var(--anatomy-lit)" stroke="var(--anatomy-ink)" stroke-width="0.65"/>`
  );
};

// ---------------------------------------------------------------------------
// Scene Assembly & Audit
// ---------------------------------------------------------------------------

function buildScene(theme) {
  const R = A.recorder(P, { order: ORDER });
  const initSt = M.computeState({});

  const putSolid = (piece, name, spec, svgStr, attrs = "") => {
    const shapes = Array.isArray(spec) ? spec : [spec];
    for (const s of shapes) R.solid(s);
    return R.put({ piece, name, shapes, svg: svgStr, attrs });
  };

  // 1. 4× Machined Piezo Force Plates
  for (const pad of M.PADS) {
    const id = pad.id;
    const owner = `stand.pad.${id}`;
    const pf = frameOf([pad.x, pad.y, 0], [0, 0, 1], [1, 0, 0]);
    const basePoly = [[-9.2, -9.2], [9.2, -9.2], [9.2, 9.2], [-9.2, 9.2]];
    const topPoly = [[-7.6, -7.6], [7.6, -7.6], [7.6, 7.6], [-7.6, 7.6]];
    const basePr = G.prismOf(pf, basePoly, 0, 3.2, P);
    const topPr = G.prismOf(pf, topPoly, 3.2, M.PAD_TOP, P);
    const bolts = [[-6.0, -6.0], [6.0, -6.0], [6.0, 6.0], [-6.0, 6.0]].map(([bx, by]) =>
      k.iso([pad.x + bx, pad.y + by, M.PAD_TOP + 0.04], P)
    );
    const padLabel = k.faceTextSvg(k.topMatrix([pad.x + 1.8, pad.y + 5.8], M.PAD_TOP + 0.05, P, "x"), id, {
      size: 4.2,
      tone: "faint",
    });
    const svg =
      solidPart(basePr, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(topPr, { hi: "hi", mid: "mid", lo: "lo" }) +
      D(bolts, { size: 0.34, tone: "lo" }) +
      padLabel;
    putSolid(owner, owner, [
      A.prism(pf, basePoly, 0, 3.2, { owner, name: `${owner}.base`, ground: true }),
      A.prism(pf, topPoly, 3.2, M.PAD_TOP, { owner, name: `${owner}.top`, top: true }),
    ], svg);
  }

  // 2. Front Motorized Prey-Lure Linear Rail + Stepper Motor + Target Carriage
  {
    const bedF = frameOf([84, 0, 0], [0, 0, 1], [1, 0, 0]);
    const bedPoly = [[-5.6, -54], [5.6, -54], [5.6, 54], [-5.6, 54]];
    const barPoly = [[-3.1, -48], [3.1, -48], [3.1, 48], [-3.1, 48]];
    const bedPr = G.prismOf(bedF, bedPoly, 0, 4.5, P);
    const barPr = G.prismOf(bedF, barPoly, 4.5, 7.5, P);

    const pedF = frameOf([84, -57.5, 0], [0, 0, 1], [1, 0, 0]);
    const pedPoly = [[-4.8, -3.5], [4.8, -3.5], [4.8, 3.5], [-4.8, 3.5]];
    const pedPr = G.prismOf(pedF, pedPoly, 0, 4.4, P);
    const motorF = frameOf([84, -61.0, 8.2], [0, 1, 0], [1, 0, 0]);
    const motorProf = [[0, 3.8], [7.0, 3.8], [7.4, 2.2], [10.0, 2.2], [10.0, 0.2]];
    const motorSolid = G.solidOf(motorProf, motorF, P);
    const cradleF = frameOf([84, -57.5, 4.4], [0, 0, 1], [1, 0, 0]);
    const cradlePr = G.prismOf(cradleF, [[-3.4, -3.0], [3.4, -3.0], [3.4, 3.0], [-3.4, 3.0]], 0, 3.8, P);
    const rt = k.topTicks(-44, 44, 4, 4, 80.9, 7.53, [1.2, 2.0], P, "y");
    const railTicks =
      `<path class="iso-line" data-tone="faint" data-free="both" d="${rt.minor}"/>` +
      `<path class="iso-line" data-tone="lo" data-free="both" d="${rt.major}"/>`;
    const railText = k.faceTextSvg(k.topMatrix([80.8, 30], 4.55, P, "y"), "PREY LURE STAGE", { size: 4.5, tone: "faint" });

    const svg =
      solidPart(bedPr, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(pedPr, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(cradlePr, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(barPr, { hi: "hi", mid: "mid", lo: "lo" }) +
      solidPart(motorSolid, { hi: "mid", mid: "lo", lo: "lo" }) +
      railTicks +
      railText;

    putSolid("stand.rail", "stand.rail", [
      A.prism(bedF, bedPoly, 0, 4.5, { owner: "stand.rail", name: "stand.rail.bed", ground: true }),
      A.prism(bedF, barPoly, 4.5, 7.5, { owner: "stand.rail", name: "stand.rail.bar", top: true }),
      A.prism(pedF, pedPoly, 0, 4.4, { owner: "stand.rail", name: "stand.rail.ped", ground: true }),
      A.solid(motorF, motorProf, { owner: "stand.rail", name: "stand.rail.motor" }),
    ], svg);

    const tgF = frameOf([84, initSt.targetY, 7.5], [0, 0, 1], [1, 0, 0]);
    const mastF = frameOf([84, initSt.targetY, 10.9], [0, 0, 1], [1, 0, 0]);
    const colF = frameOf([84, initSt.targetY, 20.2], [-1, 0, 0], [0, 0, 1]);
    putSolid("target.carriage", "target.carriage", [
      A.prism(tgF, [[-3.6, -4.6], [3.6, -4.6], [3.6, 4.6], [-3.6, 4.6]], 0, 3.4, { owner: "target.carriage", name: "target.carriage.block" }),
      A.disc(mastF, 0, 7.5, 1.35, { owner: "target.carriage", name: "target.carriage.mast" }),
      A.disc(colF, -2.4, 3.0, 2.5, { owner: "target.carriage", name: "target.carriage.hood" }),
      A.disc(frameOf([84.2, initSt.targetY, 22.4], [0, 0, 1], [1, 0, 0]), 0, 9.2, 0.7, { owner: "target.carriage", name: "target.carriage.whip" }),
      A.ball([84.2, initSt.targetY + initSt.lureWhip, 31.6], 2.2, { owner: "target.carriage", name: "target.carriage.lure" }),
    ], targetSvg(initSt.targetY, initSt.targetDz, initSt.lureWhip, P), ' data-part="target"');
  }

  // 3. Central Strain Manifold Junction (stand.manifold)
  {
    const mf = frameOf([-2, 42, 0], [0, 0, 1], [1, 0, 0]);
    const poly = [[-7.2, -5.8], [7.2, -5.8], [7.2, 5.8], [-7.2, 5.8]];
    const pr = G.prismOf(mf, poly, 0, 5.2, P);
    const turret = G.disc(5.2, 6.6, 2.0, frameOf([-5.2, 40.5, 0], [0, 0, 1], [1, 0, 0]), P);
    const portAF = frameOf([-2, 47.8, 2.8], [0, 1, 0], [1, 0, 0]);
    const portBF = frameOf([-9.2, 42, 2.8], [-1, 0, 0], [0, 1, 0]);
    const portA = G.disc(0, 1.2, 1.4, portAF, P);
    const portB = G.disc(0, 1.2, 1.4, portBF, P);
    const lbl = k.faceTextSvg(k.topMatrix([-2.8, 44.6], 5.25, P, "x"), "LC-4", { size: 4.0, tone: "lo" });
    const svg =
      solidPart(pr, { hi: "hi", mid: "mid", lo: "lo" }) +
      solidPart(turret, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(portA, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(portB, { hi: "mid", mid: "lo", lo: "lo" }) +
      lbl;
    putSolid("stand.manifold", "stand.manifold", [
      A.prism(mf, poly, 0, 5.2, { owner: "stand.manifold", name: "stand.manifold.box", ground: true }),
      A.disc(portAF, 0, 1.2, 1.4, { owner: "stand.manifold", name: "stand.manifold.portA" }),
      A.disc(portBF, 0, 1.2, 1.4, { owner: "stand.manifold", name: "stand.manifold.portB" }),
    ], svg);
  }

  // 4. Foreground Torque & Elastic Energy Dial Gauge (stand.gauge)
  {
    const gf = frameOf([-24, 58, 0], [0, 0, 1], [1, 0, 0]);
    const puck = G.solidOf([[0, 15.8], [5.8, 15.8], [7.2, 14.2], [7.2, 0.2]], gf, P);
    const bezel = G.disc(5.6, 7.2, 13.8, gf, P);
    const face = G.disc(7.15, 7.32, 12.2, gf, P);
    const portGF = frameOf([-8.2, 58, 2.8], [1, 0, 0], [0, 1, 0]);
    const portG = G.disc(0, 1.2, 1.4, portGF, P);
    const rTicks = k.radialTicks(-24, 58, 11.6, 10, 2, 7.36, [1.2, 2.2], P, -Math.PI * 0.78, Math.PI * 1.56);
    const ticks =
      `<path class="iso-line" data-tone="faint" data-free="both" d="${rTicks.minor}"/>` +
      `<path class="iso-line" data-tone="lo" data-free="both" d="${rTicks.major}"/>`;
    const unitLbl = k.faceTextSvg(k.topMatrix([-24, 62.6], 7.38, P, "x"), "N·m·J", { size: 3.8, tone: "lo", anchor: "middle" });
    const needle = `<g data-part="gauge-needle">${gaugeNeedleSvg(initSt.kneeTorqueNm, P)}</g>`;
    const svg =
      solidPart(puck, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(portG, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(bezel, { hi: "hi", mid: "mid", lo: "lo" }) +
      solidPart(face, { hi: "hi", mid: "hi", lo: "mid" }) +
      ticks +
      unitLbl +
      needle;
    putSolid("stand.gauge", "stand.gauge", [
      A.disc(gf, 0, 7.3, 15.8, { owner: "stand.gauge", name: "stand.gauge.puck", ground: true }),
      A.disc(portGF, 0, 1.2, 1.4, { owner: "stand.gauge", name: "stand.gauge.port" }),
    ], svg);
  }

  // 5. Rear-Left 4-Channel GRF & CoM Telemetry Console (stand.console)
  {
    const cf = frameOf([-106, 26, 0], [0, 0, 1], [1, 0, 0]);
    const casePoly = [[-16, -12], [16, -12], [16, 12], [-16, 12]];
    const casePr = G.prismOf(cf, casePoly, 0, 8.2, P);
    const topBezel = G.prismOf(cf, [[-14.5, -10.5], [14.5, -10.5], [14.5, 10.5], [-14.5, 10.5]], 8.2, 9.2, P);
    const portCF = frameOf([-90.0, 28, 2.8], [1, 0, 0], [0, 1, 0]);
    const portC = G.disc(0, 1.2, 1.4, portCF, P);

    const scrPts = [[-11.5, -8.5], [6.5, -8.5], [6.5, 8.5], [-11.5, 8.5]].map(([x, y]) =>
      k.iso([-106 + x, 26 + y, 9.24], P)
    );
    const screen = `<path class="rc-screen" d="${k.pathOf(scrPts, true)}"/>`;

    const barYs = [-6.4, -2.6, 1.2, 5.0];
    const bars = barYs.map((by, idx) =>
      `<path class="rc-bar" data-bar="${idx}" d="${barPath(-115.2, 26 + by, 9.28, 2.5, initSt.forces[idx] / 52, P)}"/>`
    ).join("");
    const chLabels = ["FL", "FR", "RL", "RR"].map((lb, idx) =>
      k.faceTextSvg(k.topMatrix([-105.2, 26 + barYs[idx] + 1.8], 9.3, P, "x"), lb, { size: 3.4, tone: "lo" })
    ).join("");

    const dialF = frameOf([-94.5, 29.0, 9.2], [0, 0, 1], [1, 0, 0]);
    const dial = solidPart(G.disc(0, 1.8, 2.8, dialF, P), { hi: "hi", mid: "mid", lo: "lo" });
    const titleLbl = k.faceTextSvg(k.topMatrix([-118.5, 36.5], 9.26, P, "x"), "GRF · 4CH", { size: 3.6, tone: "lo" });

    const svg =
      solidPart(casePr, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(portC, { hi: "mid", mid: "lo", lo: "lo" }) +
      solidPart(topBezel, { hi: "hi", mid: "mid", lo: "lo" }) +
      screen +
      bars +
      chLabels +
      dial +
      titleLbl;
    putSolid("stand.console", "stand.console", [
      A.prism(cf, casePoly, 0, 9.2, { owner: "stand.console", name: "stand.console.case", ground: true }),
      A.disc(portCF, 0, 1.2, 1.4, { owner: "stand.console", name: "stand.console.port" }),
    ], svg);
  }

  // 6. Braided Cables: Manifold -> Gauge & Manifold -> Console
  {
    const ptsGauge = G.fillet([
      [-2, 49.0, 2.8],
      [-2, 51.4, 2.8],
      [-2, 56.8, 0.72],
      [-4.2, 58, 0.72],
      [-5.0, 58, 2.8],
      [-7.0, 58, 2.8],
    ], 1.2, 5, { P, tube: 0.72 });
    const piecesGauge = tubePieces(ptsGauge, 0.72, P, { rings: { step: 5.5, tone: "faint" } });
    R.route("cable.gauge", ptsGauge, 0.72, { owner: "cable.gauge", piece: "cable.gauge", limp: true });
    R.put({
      piece: "cable.gauge",
      name: "cable.gauge",
      shapes: [A.tube(ptsGauge, 0.72, { owner: "cable.gauge", name: "cable.gauge" })],
      svg: piecesGauge.map((pc) => tubeSvg(pc, { tone: "mid" })).join(""),
    });

    const ptsConsole = G.fillet([
      [-10.4, 42, 2.8],
      [-12.6, 42, 2.8],
      [-24, 37.5, 0.72],
      [-72, 32.5, 0.72],
      [-86.6, 28, 2.8],
      [-88.8, 28, 2.8],
    ], 2.5, 5, { P, tube: 0.72 });
    const piecesConsole = tubePieces(ptsConsole, 0.72, P, { rings: { step: 6.5, tone: "faint" } });
    R.route("cable.console", ptsConsole, 0.72, { owner: "cable.console", piece: "cable.console", limp: true });
    R.put({
      piece: "cable.console",
      name: "cable.console",
      shapes: [A.tube(ptsConsole, 0.72, { owner: "cable.console", name: "cable.console" })],
      svg: piecesConsole.map((pc) => tubeSvg(pc, { tone: "mid" })).join(""),
    });
  }

  // 7. Static Keeled Thoracic Ribcage (cat.thorax)
  {
    const x0 = 12, x1 = 46;
    const txF = frameOf([x0, 0, 0], [1, 0, 0], [0, 1, 0]);
    const chestPoly = crSample([
      [-6.8, 38.0],
      [-11.8, 43.2],
      [-12.2, 51.5],
      [-7.4, 54.8],
      [7.4, 54.8],
      [12.2, 51.5],
      [11.8, 43.2],
      [6.8, 38.0],
    ], 2, true);
    const mainChest = solidPart(G.prismOf(txF, chestPoly, 0, x1 - x0, P), { hi: "hi", mid: "mid", lo: "lo" });

    const ribs = [5, 12, 19, 26].map((rx) =>
      solidPart(G.prismOf(txF, chestPoly.map(([y, z]) => [y * 1.05, z === 38 ? 37.5 : z + (z > 46 ? 0.55 : -0.45)]), rx, rx + 1.8, P), {
        hi: "mid",
        mid: "lo",
        lo: "lo",
      })
    ).join("");

    const lidarF = frameOf([28, 0, 54.8], [0, 0, 1], [1, 0, 0]);
    const lidarProf = [[0, 5.2], [1.4, 5.2], [2.4, 4.4, 1], [3.4, 2.2, 1], [3.7, 0.2]];
    const lidarDome = solidPart(G.solidOf(lidarProf, lidarF, P), { hi: "mid", mid: "lo", lo: "lo" });
    const lidarRing = k.faceTextSvg(k.topMatrix([14.0, -4.5], 54.9, P, "x"), "IMU·360", { size: 3.6, tone: "lo" });

    const gillPts = [];
    for (let gx = 19; gx <= 34; gx += 3.0) {
      for (let gz = 43.5; gz <= 49.0; gz += 2.2) {
        gillPts.push(k.iso([gx, 12.3, gz], P));
      }
    }
    const gills = D(gillPts, { size: 0.34, tone: "lo" });

    putSolid("cat.thorax", "cat.thorax", [
      A.prism(txF, chestPoly, 0, x1 - x0, { owner: "cat.thorax", name: "cat.thorax.chest" }),
      A.solid(lidarF, lidarProf, { owner: "cat.thorax", name: "cat.thorax.lidar" }),
    ], mainChest + ribs + gills + lidarDome + lidarRing, ' data-part="thorax"');
  }

  // 8. Left & Right Tapered Chamfered LiPo Battery Saddle Pods (cat.battery.L / .R)
  for (const [sideName, sy] of [["L", -1], ["R", 1]]) {
    const owner = `cat.battery.${sideName}`;
    const bf = frameOf([-7, sy * 8.2, 44.8], [1, 0, 0], [0, 1, 0]);
    const bPoly = [[-2.6, -2.8], [2.6, -2.8], [3.2, 1.8], [1.8, 3.0], [-1.8, 3.0], [-3.2, 1.8]];
    const pr = G.prismOf(bf, bPoly, -12.0, 12.0, P);
    const bolts = [[-8.5, -1.2], [8.5, -1.2], [8.5, 1.2], [-8.5, 1.2]].map(([dx, dz]) =>
      k.iso([-7 + dx, sy * 11.4, 44.8 + dz], P)
    );
    const svg = solidPart(pr, { hi: "mid", mid: "lo", lo: "lo" }) + (sy > 0 ? D(bolts, { size: 0.28, tone: "lo" }) : "");
    putSolid(owner, owner, [
      A.prism(bf, bPoly, -12.0, 12.0, { owner, name: `${owner}.pod` }),
      A.disc(frameOf([-7, sy * 4.2, 44.8], [0, sy, 0], [1, 0, 0]), 0, 1.8, 1.8, { owner, name: `${owner}.strut` }),
    ], svg, ` data-part="battery-${sideName}"`);
  }

  // 9. Canted Haunch Pelvis (cat.pelvis) + Rear Caudal Tail Gimbal Housing
  {
    const pf = frameOf([-54, 0, 0], [1, 0, 0], [0, 1, 0]);
    const pelPoly = crSample([
      [-8.5, 39.5],
      [-12.5, 44.5],
      [-11.8, 51.8],
      [-6.5, 53.8],
      [6.5, 53.8],
      [11.8, 51.8],
      [12.5, 44.5],
      [8.5, 39.5],
    ], 2, true);
    const hull = solidPart(G.prismOf(pf, pelPoly, 0, 28, P), { hi: "hi", mid: "mid", lo: "lo" });
    const hatchF = frameOf([-40, 0, 53.8], [0, 0, 1], [1, 0, 0]);
    const hatchPoly = [[-7.2, -5.2], [7.2, -5.2], [7.2, 5.2], [-7.2, 5.2]];
    const hatch = solidPart(G.prismOf(hatchF, hatchPoly, 0, 0.9, P), { hi: "mid", mid: "lo", lo: "lo" });
    const bolts = [[-5.6, -3.6], [5.6, -3.6], [5.6, 3.6], [-5.6, 3.6]].map(([dx, dy]) =>
      k.iso([-40 + dx, dy, 54.75], P)
    );
    const gimbalF = frameOf([-54, 0, 47.0], [-1, 0, 0], [0, 0, 1]);
    const gimbal = solidPart(G.disc(-1.2, 2.2, 3.9, gimbalF, P), { hi: "mid", mid: "lo", lo: "lo" });
    const badge = k.faceTextSvg(k.topMatrix([-45.8, 3.8], 54.78, P, "x"), "FELIS·09", { size: 3.6, tone: "lo" });

    putSolid("cat.pelvis", "cat.pelvis", [
      A.prism(pf, pelPoly, 0, 28, { owner: "cat.pelvis", name: "cat.pelvis.hull" }),
      A.disc(gimbalF, 0, 2.2, 3.9, { owner: "cat.pelvis", name: "cat.pelvis.gimbal" }),
    ], hull + hatch + D(bolts, { size: 0.3, tone: "lo" }) + badge + gimbal, ' data-part="pelvis"');
  }

  // 10. Live-Rebuildable Assemblies
  putSolid("cat.spine", "cat.spine", [
    A.disc(frameOf([-26, 0, 47.0], [1, 0, 0], [0, 1, 0]), 0, 38, 4.4, { owner: "cat.spine", name: "cat.spine.core" }),
  ], spineSvg(initSt, P), ' data-part="spine"');

  for (const leg of initSt.legs) {
    const owner = `cat.leg.${leg.id}`;
    const upDir = G.sub3(leg.knee, leg.hip);
    const loDir = G.sub3(leg.hock, leg.knee);
    const metaDir = G.sub3(leg.paw, leg.hock);
    const fH = frameOf(leg.hip, [0, 1, 0], upDir);
    const fK = frameOf(leg.knee, [0, 1, 0], loDir);
    const fM = frameOf(leg.hock, [0, 1, 0], metaDir);
    const pawBoxF = frameOf([leg.padX, leg.padY, M.PAD_TOP], [0, 0, 1], [1, 0, 0]);
    const wallY = leg.isFore ? 12.2 : 12.5;
    const hipBridgeF = frameOf([leg.hip[0], leg.side * wallY, leg.hip[2]], [0, leg.side, 0], [1, 0, 0]);
    putSolid(owner, owner, [
      A.prism(pawBoxF, [[-3.4, -3.6], [4.5, -3.6], [4.5, 3.6], [-3.4, 3.6]], 0, 1.7, { owner, name: `${owner}.paw` }),
      A.prism(fM, [[0, -1.2], [G.len3(metaDir), -1.0], [G.len3(metaDir), 1.0], [0, 1.2]], -1.1, 1.1, { owner, name: `${owner}.meta` }),
      A.prism(fK, [[0, -1.6], [G.len3(loDir), -1.2], [G.len3(loDir), 1.2], [0, 1.6]], -1.4, 1.4, { owner, name: `${owner}.tibia` }),
      A.prism(fH, [[0, -2.4], [G.len3(upDir), -1.4], [G.len3(upDir), 1.4], [0, 2.4]], -1.8, 1.8, { owner, name: `${owner}.femur` }),
      A.disc(hipBridgeF, 0, Math.abs(leg.hip[1]) - wallY + 0.5, 3.5, { owner, name: `${owner}.hipBridge` }),
    ], legSvg(leg, P), ` data-leg="${leg.id}"`);
  }

  putSolid("cat.tail", "cat.tail", initSt.tailNodes.slice(0, 7).map((n, idx) => {
    const p1 = initSt.tailNodes[idx + 1];
    const startPt = idx === 0 ? [-56.2, 0, 47.0] : n;
    const diff = G.sub3(p1, startPt);
    return A.disc(G.frameAlong(startPt, diff), idx === 0 ? 1.2 : 0, G.len3(diff), 2.5 - idx * 0.18, {
      owner: "cat.tail",
      name: `cat.tail.s${idx}`,
    });
  }), tailSvg(initSt.tailNodes, P), ' data-part="tail"');

  putSolid("cat.head", "cat.head", [
    A.disc(frameOf([43, 0, 54.8], [0, 0, 1], [1, 0, 0]), 0, 3.5, 3.6, { owner: "cat.head", name: "cat.head.neck" }),
    A.prism(frameOf([48.5, 0, 62.5], [0, -1, 0], [1, 0, 0]), [[-5.5, -4.4], [15.5, -4.4], [15.5, 7.6], [-5.5, 7.6]], -7.6, 7.6, { owner: "cat.head", name: "cat.head.skull" }),
  ], headSvg(initSt, P), ' data-part="head"');

  R.settled = A.settle(R, P);
  A.auditOrExit(R, P);

  const bodyGroups =
    R.items
      .slice()
      .sort((a, b) => a.key - b.key)
      .map((item) => `<g data-piece="${item.piece}"${item.attrs || ""}>${item.svg}</g>`)
      .join("") +
    `<g data-piece="sight.beam" data-part="sight-beam">${sightBeamSvg(initSt, P)}</g>`;

  const readoutText = `yaw ${initSt.yawDeg.toFixed(1)}° · crouch ${Math.round(initSt.crouchMm)}mm · ${initSt.strainEnergyJ.toFixed(1)}J · ${initSt.kneeTorqueNm.toFixed(1)}N·m`;

  const svg = `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${TITLE}">${bodyGroups}</svg>`;
  const stage = `<div class="rc-stage" tabindex="0" data-live>${svg}</div>`;
  const body = k.plateHtml({
    fig: FIG,
    title: TITLE,
    hint: HINT,
    readout: readoutText,
    keys: [
      { mark: "lit", label: "Optics · Prey Lure · Torque" },
      { mark: "hi", label: "Ribcage · Skull · Tendons" },
      { mark: "mid", label: "Harmonic QDDs · Spine · Tail" },
    ],
    body: stage,
  });

  const LATHE = readFileSync(join(SKILL_DIR, "kit", "lathe.mjs"), "utf8")
    .replace(/^import .*$/gm, "")
    .replace(/^export /gm, "")
    .replaceAll("runsOf", "latheRunsOf")
    .replaceAll("signedArea", "latheSignedArea")
    .replaceAll("oriented", "latheOriented")
    .replaceAll("frameOf", "latheFrameOf");

  const MODEL_SRC = readFileSync(MODEL_PATH, "utf8").replace(/^export /gm, "");
  const stripNS = (fn) =>
    fn.toString().replace(/\b(?:G|k|M)\./g, "");

  const FUNCS = [
    `const frameOf = ${stripNS(frameOf)};`,
    `const framePt = ${stripNS(framePt)};`,
    `const crSample = ${stripNS(crSample)};`,
    `const D = ${stripNS(D)};`,
    `const solidPart = ${stripNS(solidPart)};`,
    `const legSvg = ${stripNS(legSvg)};`,
    `const spineSvg = ${stripNS(spineSvg)};`,
    `const headSvg = ${stripNS(headSvg)};`,
    `const tailFrames = ${stripNS(tailFrames)};`,
    `const tailSvg = ${stripNS(tailSvg)};`,
    `const targetSvg = ${stripNS(targetSvg)};`,
    `const sightBeamSvg = ${stripNS(sightBeamSvg)};`,
    `const barPath = ${stripNS(barPath)};`,
    `const gaugeNeedleSvg = ${stripNS(gaugeNeedleSvg)};`,
  ].join("\n");

  const DATA = JSON.stringify({ P });
  const LIVE_SRC = existsSync(LIVE_PATH) ? readFileSync(LIVE_PATH, "utf8") : "";

  const script = [
    `const DATA = ${DATA};`,
    kitScript(),
    LATHE,
    MODEL_SRC,
    FUNCS,
    LIVE_SRC,
  ].join("\n");

  const css = readFileSync(CSS_PATH, "utf8");
  const wrappedBody = `<style>${css}</style>${body}`;
  return k.pageHtml({ title: TITLE, theme, body: wrappedBody, script, width: WIDTH });
}

const isLight = process.argv.includes("--light");
const outPath = isLight ? OUT_LIGHT : OUT_DARK;
writeFileSync(outPath, buildScene(isLight ? "light" : "dark"), "utf8");
console.log(`wrote ${outPath}`);
