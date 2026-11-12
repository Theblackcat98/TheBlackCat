import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const theme = argv.includes("--light") ? "light" : "dark";

// Resolve the anatomy skill kit across Windows and Linux installs
function findSkillDir() {
  const candidates = [
    process.env.ANATOMY_SKILL,
    join(homedir(), ".gemini", "config", "skills", "anatomy"),
    join(homedir(), ".config", "opencode", "skills", "anatomy"),
    "/home/nick/.gemini/config/skills/anatomy",
  ].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(join(dir, "kit", "iso-kit.mjs"))) return dir;
  }
  throw new Error("Could not locate anatomy skill kit directory. Set ANATOMY_SKILL.");
}

const SKILL_DIR = findSkillDir();
const k = await import(pathToFileURL(join(SKILL_DIR, "kit", "iso-kit.mjs")).href);
const G = await import(pathToFileURL(join(SKILL_DIR, "kit", "lathe.mjs")).href);
const A = await import(pathToFileURL(join(SKILL_DIR, "kit", "audit.mjs")).href);
const { tubePieces, tubeSvg } = await import(pathToFileURL(join(SKILL_DIR, "kit", "tube.mjs")).href);
const { kitScript } = await import(pathToFileURL(join(SKILL_DIR, "scripts", "inline-kit.mjs")).href);
const M = await import(pathToFileURL(join(HERE, "model.mjs")).href);

const WIDTH = 720;
const HEIGHT = 450;
const AZIMUTH = 46;
const ELEVATION = 30;
const D2R = Math.PI / 180;

// ── World Plan (1 unit ≈ 2 mm) ──────────────────────────────────────────────
const BASE = { x: -136, y: -74, w: 278, d: 156, r: 9 };
const BASE_H = 11;
const FOOT_H = 5;

// Barrel axis along +X at y = -14, z = 62
const BARREL_Y = -14;
const BARREL_Z = 62;
const F_BARREL = G.frameOf([0, BARREL_Y, BARREL_Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const VERT = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

// Bench FRL Air Regulator Station (back-left)
const FRL_PLINTH = { x: -118, y: 12, w: 34, d: 30, r: 3 };
const FRL_MANIFOLD = { x: -114, y: 17, w: 26, d: 20, r: 2.5 };
const FRL_BOWL_XY = [-105, 27];
const FRL_REG_XY = [-94, 27];
const PSI_GAUGE = [-70, 44];
const PSI_GAUGE_R = 12.5;
const PSI_GAUGE_Z = 9.0;

// Bench Torque Dial Gauge (foreground open area)
const TORQUE_GAUGE = [46, 42];
const TORQUE_GAUGE_R = 16.5;
const TORQUE_GAUGE_Z = 10.0;

// Torque-Reaction Bolt Dynamometer (front-right, +X)
const DYNO_BASE = { x: 88, y: -32, w: 38, d: 36, r: 3.5 };
const DYNO_BLOCK = { x: 93, y: -27, w: 28, d: 26, r: 3 };

// Fit camera
export const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [-48, BARREL_Y, BARREL_Z + 22],
    [122, BARREL_Y, BARREL_Z + 20],
    [FRL_REG_XY[0], FRL_REG_XY[1], 52],
    [TORQUE_GAUGE[0], TORQUE_GAUGE[1] + TORQUE_GAUGE_R, TORQUE_GAUGE_Z + 2],
  ],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: AZIMUTH, elevation: ELEVATION },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

const R = A.recorder(P);
function put({ name, at: ref, bias = 0, part = null, cls = null, svg, shapes }) {
  const recorded = shapes.map((shape, index) =>
    R.solid(Object.assign(shape, { name: shape.name ?? (index ? `${name}#${index + 1}` : name) })),
  );
  let attrs = "";
  if (part) attrs += ` data-part="${part}"`;
  if (cls) attrs += ` class="it ${cls}"`;
  return R.put({ name, at: ref, bias, attrs, svg, shapes: recorded });
}

// ── Helper: build a curved cutaway cylindrical shell along F_BARREL ───────────
// Renders true visible inner bore, outer surface, end ring, and machined cut faces
// in exact isometric tone buckets with zero concave-hull artifacts.
function buildCutawayShell({
  name,
  owner,
  s0,
  s1,
  rIn,
  rOut,
  a0Deg,
  a1Deg,
  steps = 18,
  capA0 = false,
  capA1 = false,
  tone = "mid",
  cavity = false,
  bias = 0,
  touch = [],
}) {
  const V = G.viewOf(P);
  const Ldir = G.lightOf(P);
  const a0 = a0Deg * D2R;
  const a1 = a1Deg * D2R;
  const poly = (pts) => k.pathOf(pts, true);

  const buckets = [[], [], [], [], []]; // 0..3 = shades, 4 = top
  const fillPaths = [];
  const outlines = [];
  const creases = [];

  const pt = (s, r, ang) => at(G.pointOf(F_BARREL, s, r, ang));

  for (let i = 0; i < steps; i++) {
    const t0 = a0 + ((a1 - a0) * i) / steps;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
    const tm = (t0 + t1) * 0.5;

    // Outer face
    const nOut = G.radialOf(F_BARREL, tm);
    if (G.dot3(nOut, V) > 1e-4) {
      const q = poly([pt(s0, rOut, t0), pt(s0, rOut, t1), pt(s1, rOut, t1), pt(s1, rOut, t0)]);
      buckets[G.toneOf(nOut, P)].push(q);
      fillPaths.push(q);
    }

    // Inner bore face
    const nIn = G.mul3(nOut, -1);
    if (G.dot3(nIn, V) > 1e-4) {
      const q = poly([pt(s0, rIn, t0), pt(s1, rIn, t0), pt(s1, rIn, t1), pt(s0, rIn, t1)]);
      buckets[G.toneOf(nIn, P)].push(q);
      fillPaths.push(q);
    }

    // End ring at s1 (+X faces viewer)
    if (G.dot3(F_BARREL.a, V) > 1e-4) {
      const q = poly([pt(s1, rIn, t0), pt(s1, rOut, t0), pt(s1, rOut, t1), pt(s1, rIn, t1)]);
      buckets[G.toneOf(F_BARREL.a, P)].push(q);
      fillPaths.push(q);
    }
  }

  // Machined longitudinal cut faces (a0 and a1)
  const addCutWall = (ang, inwardSign) => {
    const nCut = G.mul3(G.tangentOf(F_BARREL, ang), inwardSign);
    if (G.dot3(nCut, V) > 1e-4) {
      const q = poly([pt(s0, rIn, ang), pt(s0, rOut, ang), pt(s1, rOut, ang), pt(s1, rIn, ang)]);
      buckets[G.toneOf(nCut, P)].push(q);
      fillPaths.push(q);
      outlines.push(q);
    }
  };
  if (capA0) addCutWall(a0, -1);
  if (capA1) addCutWall(a1, +1);

  // Clean outer arcs & end rims without dangling ends
  const arcPts = (s, r, fromA, toA, n) =>
    Array.from({ length: n + 1 }, (_, i) => pt(s, r, fromA + ((toA - fromA) * i) / n));

  // Visible outer rim arcs at s0 & s1 and outer limb generator
  const visOut = [];
  for (let i = 0; i <= steps * 2; i++) {
    const ang = a0 + ((a1 - a0) * i) / (steps * 2);
    if (G.dot3(G.radialOf(F_BARREL, ang), V) > 0) visOut.push(ang);
  }
  if (visOut.length >= 2) {
    const va0 = visOut[0];
    const va1 = visOut[visOut.length - 1];
    outlines.push(k.pathOf(arcPts(s1, rOut, va0, va1, steps), false));
    // Limb edge(s) where radial·V crosses 0
    const uV = G.dot3(F_BARREL.u, V);
    const vV = G.dot3(F_BARREL.v, V);
    const viewAng = Math.atan2(vV, uV);
    for (const limb of [viewAng + Math.PI / 2, viewAng - Math.PI / 2]) {
      // normalize into [a0, a1]
      let la = limb;
      while (la < a0) la += Math.PI * 2;
      while (la > a1) la -= Math.PI * 2;
      if (la >= a0 && la <= a1) {
        outlines.push(k.pathOf([pt(s0, rOut, la), pt(s1, rOut, la)], false));
        // Connect s0 outer arc from cut edge or other limb
        const fromLimb = la;
        const toEdge = Math.abs(la - va0) < Math.abs(la - va1) ? va0 : va1;
        outlines.push(k.pathOf(arcPts(s0, rOut, fromLimb, toEdge, Math.max(4, Math.round(steps / 2))), false));
      }
    }
  }

  // Visible inner bore arcs at s0 & s1
  const visIn = [];
  for (let i = 0; i <= steps * 2; i++) {
    const ang = a0 + ((a1 - a0) * i) / (steps * 2);
    if (G.dot3(G.radialOf(F_BARREL, ang), V) < 0) visIn.push(ang);
  }
  if (visIn.length >= 2) {
    const ia0 = visIn[0];
    const ia1 = visIn[visIn.length - 1];
    creases.push(k.pathOf(arcPts(s0, rIn, ia0, ia1, steps), false));
    if (G.dot3(F_BARREL.a, V) > 1e-4) {
      outlines.push(k.pathOf(arcPts(s1, rIn, a0, a1, steps), false));
    }
  }

  const paths = {
    fill: fillPaths.join(""),
    shades: buckets.slice(0, 4).map((b) => b.join("")),
    top: buckets[4].join(""),
    crease: creases.join(""),
    outline: outlines.join(""),
  };

  // Audit shapes: split into fine convex angular wedge prisms (<= 18 deg each)
  const wedgeCount = Math.max(2, Math.ceil(Math.abs(a1 - a0) / (18 * D2R)));
  const shapes = [];
  for (let w = 0; w < wedgeCount; w++) {
    const w0 = a0 + ((a1 - a0) * w) / wedgeCount;
    const w1 = a0 + ((a1 - a0) * (w + 1)) / wedgeCount;
    const wm = (w0 + w1) * 0.5;
    const poly2 = [
      [rIn * Math.cos(w0), rIn * Math.sin(w0)],
      [rOut * Math.cos(w0), rOut * Math.sin(w0)],
      [rOut * Math.cos(wm), rOut * Math.sin(wm)],
      [rOut * Math.cos(w1), rOut * Math.sin(w1)],
      [rIn * Math.cos(w1), rIn * Math.sin(w1)],
    ];
    shapes.push(A.prism(F_BARREL, poly2, s0, s1, { name: `${name}.w${w}`, owner, touch }));
  }

  const midA = (a0 + a1) * 0.5;
  const ref = G.pointOf(F_BARREL, (s0 + s1) * 0.5, (rIn + rOut) * 0.5, midA);

  put({
    name,
    at: ref,
    bias,
    cls: cavity ? "iw-cavity" : null,
    svg: S(paths, { tone, crease: "faint" }),
    shapes,
  });
}

// ── 1. Metrology Base Plate, Feet, Ruler & Label ────────────────────────────
function buildBench() {
  for (const [x, y] of byDepth(k.corners(BASE, 20))) {
    const svg =
      S(k.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.8, P, 28), { tone: "lo" }) +
      S(k.cylinder(x, y, 6.0, -BASE_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: "mid" }) +
      L(k.knurl(x, y, 6.0, -BASE_H - FOOT_H + 1.8, -BASE_H, 18, P), { tone: "lo" });
    put({
      name: `stand.foot.${x}.${y}`,
      at: [x, y, -BASE_H - FOOT_H],
      svg,
      shapes: [
        A.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.8, { ground: true }),
        A.cylinder(x, y, 6.0, -BASE_H - FOOT_H + 1.8, FOOT_H - 1.8),
      ],
    });
  }

  const screws = k.corners(BASE, 10);
  const strip = { x: BASE.x + 18, y: BASE.y + BASE.d - 14, w: 186, d: 6.5, r: 1 };
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.7, 0.6, [1.8, 3.4], P);
  const badge = { x: BASE.x + BASE.w - 64, y: BASE.y + BASE.d - 16, w: 48, d: 10, r: 1.4 };

  const svg = [
    S(k.slabOf(BASE, -BASE_H, BASE_H, P, 9, 1.6), {
      tone: "lo",
      inner: L(k.sideSeam(BASE, -BASE_H + 4, P, 9), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(BASE, 5), 0, P, 9), { tone: "faint" }),
    L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }),
    D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }),
    // Ruler strip
    S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }),
    L(ticks.minor, { tone: "lo" }),
    L(ticks.major, { tone: "mid" }),
    D([at([strip.x + 2.5, strip.y + 3.2, 0.6]), at([strip.x + strip.w - 2.5, strip.y + 3.2, 0.6])], { size: 0.45 }),
    // Engraved badge plate
    S(k.slabOf(badge, 0, 0.8, P, 4), { tone: "lo", crease: "none" }),
    L(k.planOutline(k.insetPlan(badge, 1.6), 0.8, P, 4), { tone: "faint" }),
    D(
      [
        at([badge.x + 3.2, badge.y + badge.d * 0.5, 0.8]),
        at([badge.x + badge.w - 3.2, badge.y + badge.d * 0.5, 0.8]),
      ],
      { size: 0.45 },
    ),
    L(k.lineOnTop([badge.x + 8, badge.y + 3.1], [badge.x + 34, badge.y + 3.1], 0.8, P), { tone: "mid", free: true }),
    L(k.lineOnTop([badge.x + 8, badge.y + 5.1], [badge.x + 26, badge.y + 5.1], 0.8, P), { tone: "lo", free: true }),
    L(k.lineOnTop([badge.x + 8, badge.y + 7.1], [badge.x + 39, badge.y + 7.1], 0.8, P), { tone: "lo", free: true }),
  ].join("");

  put({
    name: "stand.plate",
    at: [0, 0, -BASE_H],
    bias: -200,
    svg,
    shapes: [A.slab(BASE, -BASE_H, BASE_H, { name: "stand.plate", ground: true }, 9)],
  });
}

// ── 2. Bench FRL Air Filter-Regulator & PSI Pressure Gauge ──────────────────
function psiNeedle(psi) {
  const frac = Math.max(0, Math.min(1, (psi - 20) / 100)); // 20..120 PSI span
  const ang = (-130 + frac * 260) * D2R;
  const cx = PSI_GAUGE[0];
  const cy = PSI_GAUGE[1];
  const z = PSI_GAUGE_Z + 0.3;
  const tip = [cx + Math.sin(ang) * (PSI_GAUGE_R - 4.2), cy - Math.cos(ang) * (PSI_GAUGE_R - 4.2)];
  const tail = [cx - Math.sin(ang) * 2.8, cy + Math.cos(ang) * 2.8];
  return k.lineOnTop(tail, tip, z, P);
}

function knobPointer(psi) {
  const frac = Math.max(0, Math.min(1, (psi - M.MIN_PSI) / (M.MAX_PSI - M.MIN_PSI)));
  const ang = (-135 + frac * 270) * D2R;
  const [kx, ky] = FRL_REG_XY;
  const z = 48.2;
  return k.lineOnTop([kx - Math.sin(ang) * 2.0, ky + Math.cos(ang) * 2.0], [kx + Math.sin(ang) * 4.8, ky - Math.cos(ang) * 4.8], z, P);
}

function buildFRL() {
  const owner = "frl";
  const ps = k.corners(FRL_PLINTH, 3.5);
  const plinthSvg = [
    S(k.slabOf(FRL_PLINTH, 0, 4, P, 4, 0.5), { tone: "mid" }),
    L(ps.map(([x, y]) => k.ring(x, y, 1.5, 4, P, 12)).join(""), { tone: "lo" }),
    D(ps.map(([x, y]) => at([x, y, 4])), { size: 0.42 }),
  ].join("");
  put({
    name: "frl.plinth",
    at: [-101, 27, 2],
    svg: plinthSvg,
    shapes: [A.slab(FRL_PLINTH, 0, 4, { name: "frl.plinth", owner }, 4)],
  });

  // Polycarbonate filter bowl + drain valve on left side of FRL
  const [bx, by] = FRL_BOWL_XY;
  const bowlProf = [
    [4, 2.2],
    [7, 2.2],
    [7, 4.5],
    [8.5, 6.2],
    [10, 7.2, 1],
    [22, 7.2, 1],
    [24, 6.5],
  ];
  const bowlF = VERT(bx, by, 0);
  const bowlSvg = [
    S(G.solidOf(bowlProf, bowlF, P), {
      tone: "mid",
      inner:
        L(G.arcOf(bowlF, 13, 7.2, P), { tone: "faint" }) +
        L(G.arcOf(bowlF, 18, 7.2, P), { tone: "faint" }),
    }),
    L(k.knurl(bx, by, 4.5, 7, 8.5, 16, P), { tone: "lo" }),
  ].join("");
  put({
    name: "frl.bowl",
    at: [bx, by, 14],
    svg: bowlSvg,
    shapes: [A.solid(bowlF, bowlProf, { name: "frl.bowl", owner })],
  });

  // Right support pillar under regulator side of manifold
  const [rx, ry] = FRL_REG_XY;
  const legF = VERT(rx, ry, 0);
  put({
    name: "frl.leg",
    at: [rx, ry, 14],
    svg: S(k.cylinder(rx, ry, 4.2, 4, 20, P, 24), { tone: "mid" }),
    shapes: [A.cylinder(rx, ry, 4.2, 4, 20, { name: "frl.leg", owner })],
  });

  // Upper manifold block
  const manSvg = [
    S(k.slabOf(FRL_MANIFOLD, 24, 10, P, 5, 0.7), {
      tone: "mid",
      inner: L(k.sideSeam(FRL_MANIFOLD, 29, P, 5), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(FRL_MANIFOLD, 2.2), 34, P, 5), { tone: "faint" }),
    // Port boss on front (+Y) toward PSI gauge
    S(k.cylinder(rx, FRL_MANIFOLD.y + FRL_MANIFOLD.d, 3.2, 26, 2, P, 18), { tone: "hi" }),
  ].join("");
  // Wait: instead of floating horizontal cylinder on +Y face, put a proper Y-axis disc port!
  const portF = G.frameOf([rx, FRL_MANIFOLD.y + FRL_MANIFOLD.d, 29], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const portSvg = S(G.disc(0, 2.2, 3.0, portF, P), { tone: "hi" });
  const manCleanSvg = [
    S(k.slabOf(FRL_MANIFOLD, 24, 10, P, 5, 0.7), {
      tone: "mid",
      inner: L(k.sideSeam(FRL_MANIFOLD, 29, P, 5), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(FRL_MANIFOLD, 2.2), 34, P, 5), { tone: "faint" }),
  ].join("");
  put({
    name: "frl.manifold",
    at: [-101, 27, 29],
    svg: manCleanSvg,
    shapes: [A.slab(FRL_MANIFOLD, 24, 10, { name: "frl.manifold", owner }, 5)],
  });
  put({
    name: "frl.port",
    at: [rx, FRL_MANIFOLD.y + FRL_MANIFOLD.d + 1.1, 29],
    svg: portSvg,
    shapes: [A.disc(portF, 0, 2.2, 3.0, { name: "frl.port", owner })],
  });

  // Regulator bonnet + knurled pressure knob
  const regProf = [
    [34, 6.8],
    [36, 6.8],
    [37, 5.2],
    [42, 4.8],
  ];
  const regF = VERT(rx, ry, 0);
  put({
    name: "frl.bonnet",
    at: [rx, ry, 38],
    svg: S(G.solidOf(regProf, regF, P), { tone: "mid" }),
    shapes: [A.solid(regF, regProf, { name: "frl.bonnet", owner })],
  });

  const knobSvg = [
    S(k.cylinder(rx, ry, 6.4, 42, 6, P, 32, 0.5), { tone: "hi" }),
    L(k.knurl(rx, ry, 6.4, 42, 48, 28, P), { tone: "lo" }),
    L(k.ring(rx, ry, 4.8, 48, P, 24), { tone: "faint" }),
  ].join("");
  put({
    name: "frl.knob",
    at: [rx, ry, 45],
    svg: knobSvg,
    shapes: [A.cylinder(rx, ry, 6.4, 42, 6, { name: "frl.knob", owner })],
  });

  // Bench PSI Gauge Pod
  const [gx, gy] = PSI_GAUGE;
  const gTicks = k.radialTicks(gx, gy, PSI_GAUGE_R - 2.2, 36, 6, PSI_GAUGE_Z, [1.1, 2.3], P, -130 * D2R, 260 * D2R);
  const gSvg = [
    S(k.cylinder(gx, gy, PSI_GAUGE_R + 1.4, 0, 3.0, P, 48), { tone: "lo" }),
    S(k.cylinder(gx, gy, PSI_GAUGE_R, 3.0, PSI_GAUGE_Z - 3.0, P, 48, 0.6), { tone: "hi", crease: "lo" }),
    L(k.knurl(gx, gy, PSI_GAUGE_R, PSI_GAUGE_Z - 2.8, PSI_GAUGE_Z, 56, P, 0.3), { tone: "lo" }),
    L(k.sideArc(gx, gy, PSI_GAUGE_R, PSI_GAUGE_Z - 2.8, P, 32), { tone: "faint" }),
    L(k.ring(gx, gy, PSI_GAUGE_R - 1.8, PSI_GAUGE_Z, P, 48), { tone: "lo" }),
    L(gTicks.minor, { tone: "lo" }),
    L(gTicks.major, { tone: "mid" }),
    L(k.ring(gx, gy, 1.5, PSI_GAUGE_Z, P, 16), { tone: "hi" }),
    k.faceTextSvg(k.topMatrix([gx, gy + 4.8], PSI_GAUGE_Z, P), "PSI", { size: 2.8, tone: "mid", anchor: "middle" }),
  ].join("");
  put({
    name: "frl.psiGauge",
    at: [gx, gy, 4.5],
    svg: gSvg,
    shapes: [
      A.cylinder(gx, gy, PSI_GAUGE_R + 1.4, 0, 3.0, { name: "frl.psiGauge.base", owner }),
      A.cylinder(gx, gy, PSI_GAUGE_R, 3.0, PSI_GAUGE_Z - 3.0, { name: "frl.psiGauge.body", owner }),
    ],
  });

  // Short rigid brass sense tube from FRL port to PSI gauge side boss
  const gPortF = G.frameOf([gx - PSI_GAUGE_R, gy, 5.5], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  put({
    name: "frl.psiPort",
    at: [gx - PSI_GAUGE_R - 0.8, gy, 5.5],
    svg: S(G.disc(0, 1.8, 2.2, gPortF, P), { tone: "mid" }),
    shapes: [A.disc(gPortF, 0, 1.8, 2.2, { name: "frl.psiPort", owner })],
  });

  const psiRaw = [
    [rx, FRL_MANIFOLD.y + FRL_MANIFOLD.d + 2.2, 29],
    [rx, FRL_MANIFOLD.y + FRL_MANIFOLD.d + 7.0, 29],
    [rx, FRL_MANIFOLD.y + FRL_MANIFOLD.d + 7.0, 5.5],
    [gx - PSI_GAUGE_R - 1.8, gy, 5.5],
  ];
  const psiPts = G.fillet(psiRaw, 3.6, 7, { P, tube: 1.0 });
  const psiTotal = G.pathLength(psiPts);
  const psiPieces = tubePieces(psiPts, 1.0, P, { maxLength: 14 });
  psiPieces.forEach((piece, idx) => {
    put({
      name: `frl.psiLine.${idx}`,
      at: piece.mid,
      svg: tubeSvg(piece, { tone: "mid" }),
      shapes: [
        A.tube(piece.points, piece.radii, {
          name: `frl.psiLine.${idx}`,
          owner: "frl.psiLine",
          joined: idx > 0 ? [`frl.psiLine.${idx - 1}`] : [],
          tips: [idx === 0 ? psiPts[0] : null, idx === psiPieces.length - 1 ? psiPts[psiPts.length - 1] : null],
          tipAxes: [
            idx === 0 ? G.tangentAlong(psiPts, 0) : null,
            idx === psiPieces.length - 1 ? G.tangentAlong(psiPts, psiTotal) : null,
          ],
          tipRims: [1.5, 1.5],
        }),
      ],
    });
  });
}

// ── 3. Torque-Reaction Stanchions & Pistol Grip ─────────────────────────────
function buildStanchionsAndGrip() {
  const owner = "wrench.body";

  // Rear cradle pedestal (x = -38..-28, y = -28..0)
  const rearBase = { x: -43, y: -30, w: 18, d: 32, r: 3 };
  const rbc = k.corners(rearBase, 3);
  put({
    name: "stand.rearBase",
    at: [-34, -14, 2],
    svg:
      S(k.slabOf(rearBase, 0, 4, P, 4, 0.5), { tone: "mid" }) +
      L(rbc.map(([x, y]) => k.ring(x, y, 1.4, 4, P, 12)).join(""), { tone: "lo" }) +
      D(rbc.map(([x, y]) => at([x, y, 4])), { size: 0.42 }),
    shapes: [A.slab(rearBase, 0, 4, { name: "stand.rearBase", owner: "stand.rear" }, 4)],
  });

  // Two side uprights cradling motor housing at y = -29..-25 and y = -3..1? Wait: grip is at x = -25..-9, y = -21..-7
  // Put rear cradle at x = -38..-30 (behind the grip!) so it clears the grip completely!
  const postBack = { x: -38, y: -27, w: 8, d: 5, r: 1.5 };
  const postFront = { x: -38, y: -6, w: 8, d: 5, r: 1.5 };
  const saddle = { x: -39, y: -28, w: 10, d: 28, r: 2.5 };
  put({
    name: "stand.rearBackPost",
    at: [-34, -24.5, 25],
    svg: S(k.slabOf(postBack, 4, 40, P, 3, 0.4), { tone: "mid" }),
    shapes: [A.slab(postBack, 4, 40, { name: "stand.rearBackPost", owner: "stand.rear" }, 3)],
  });
  put({
    name: "stand.rearSaddle",
    at: [-34, -14, 42],
    svg: S(k.slabOf(saddle, 40, 4.0, P, 4, 0.5), { tone: "mid" }),
    shapes: [A.slab(saddle, 40, 4.0, { name: "stand.rearSaddle", owner: "stand.rear" }, 4)],
  });
  put({
    name: "stand.rearFrontPost",
    at: [-34, -3.5, 22],
    svg: S(k.slabOf(postFront, 4, 36, P, 3, 0.4), { tone: "mid" }),
    shapes: [A.slab(postFront, 4, 36, { name: "stand.rearFrontPost", owner: "stand.rear" }, 3)],
  });

  // Front torque-reaction collar pedestal at x = 35..43 (clamps the nose-case transition)
  const frontBase = { x: 29, y: -30, w: 20, d: 32, r: 3 };
  const fbc = k.corners(frontBase, 3);
  put({
    name: "stand.frontBase",
    at: [39, -14, 2],
    svg:
      S(k.slabOf(frontBase, 0, 4, P, 4, 0.5), { tone: "mid" }) +
      L(fbc.map(([x, y]) => k.ring(x, y, 1.4, 4, P, 12)).join(""), { tone: "lo" }) +
      D(fbc.map(([x, y]) => at([x, y, 4])), { size: 0.42 }),
    shapes: [A.slab(frontBase, 0, 4, { name: "stand.frontBase", owner: "stand.front" }, 4)],
  });
  const frontPost = { x: 35, y: -19, w: 8, d: 10, r: 2 };
  put({
    name: "stand.frontPost",
    at: [39, -14, 22.7],
    svg: S(k.slabOf(frontPost, 4, 37.4, P, 3, 0.5), { tone: "mid" }),
    shapes: [A.slab(frontPost, 4, 37.4, { name: "stand.frontPost", owner: "stand.front" }, 3)],
  });

  // Split torque-reaction collar ring around barrel at x = 35.5..42.5 (seamless at limb angles 128.75 / 308.75)
  buildCutawayShell({
    name: "stand.collarBack",
    owner: "stand.front",
    s0: 35.5,
    s1: 42.5,
    rIn: 18.1,
    rOut: 20.8,
    a0Deg: 128.75,
    a1Deg: 308.75,
    steps: 14,
    tone: "mid",
    bias: -1.2,
    touch: ["stand.frontPost"],
  });
  buildCutawayShell({
    name: "stand.collarFront",
    owner: "stand.front",
    s0: 35.5,
    s1: 42.5,
    rIn: 18.1,
    rOut: 20.8,
    a0Deg: 308.75,
    a1Deg: 488.75,
    steps: 14,
    tone: "mid",
    bias: 1.2,
    touch: ["stand.frontPost"],
  });

  // Pistol grip body (x = -26..-8, y = -22..-6, z = 18..45)
  const gripPlan = { x: -25, y: -21, w: 17, d: 14, r: 4.2 };
  const gripSvg = [
    S(k.slabOf(gripPlan, 18, 26.5, P, 5, 0.7), {
      tone: "mid",
      inner:
        L(k.sideSeam(gripPlan, 25, P, 5), { tone: "faint" }) +
        L(k.sideSeam(gripPlan, 32, P, 5), { tone: "faint" }) +
        L(k.sideSeam(gripPlan, 39, P, 5), { tone: "faint" }),
    }),
    // Forward/reverse shuttle button on upper grip side
    S(k.slabOf({ x: -15, y: -22.5, w: 5, d: 17, r: 1.5 }, 39, 3.5, P, 3, 0.3), { tone: "hi" }),
  ].join("");
  put({
    name: "wrench.grip",
    at: [-16.5, -14, 31],
    svg: gripSvg,
    shapes: [A.slab(gripPlan, 18, 26.5, { name: "wrench.grip", owner }, 5)],
  });

  // 1/4" NPT Swivel air-inlet fitting at bottom of grip (z = 11..18)
  const inletF = VERT(-17, -14, 0);
  const inletProf = [
    [11, 2.8],
    [13, 3.6],
    [15, 3.6],
    [15, 4.4],
    [18, 4.4],
  ];
  put({
    name: "wrench.inlet",
    at: [-17, -14, 14.5],
    svg:
      S(G.solidOf(inletProf, inletF, P), { tone: "hi" }) +
      L(k.knurl(-17, -14, 4.4, 15, 18, 18, P), { tone: "lo" }),
    shapes: [A.solid(inletF, inletProf, { name: "wrench.inlet", owner })],
  });

  // Rear exhaust muffler block at base of grip
  const exhPlan = { x: -29, y: -19, w: 4, d: 10, r: 1.5 };
  put({
    name: "wrench.exhaust",
    at: [-27, -14, 21],
    svg: S(k.slabOf(exhPlan, 18.5, 5, P, 3, 0.4), { tone: "lo" }),
    shapes: [A.slab(exhPlan, 18.5, 5, { name: "wrench.exhaust", owner }, 3)],
  });

  // Trigger (animated in live.js via data-part="trigger")
  const trigPlan = { x: -8.5, y: -17.5, w: 7.5, d: 7, r: 2.0 };
  const trigSvg = [
    S(k.slabOf(trigPlan, 34, 8.5, P, 3, 0.5), { tone: "hi", lit: true }),
    L(k.sideSeam(trigPlan, 38.2, P, 3), { tone: "lo" }),
  ].join("");
  put({
    name: "wrench.trigger",
    at: [-4.5, -14, 38.2],
    part: "trigger",
    svg: trigSvg,
    shapes: [A.slab(trigPlan, 34, 8.5, { name: "wrench.trigger", owner }, 3)],
  });
}

// ── 4. Braided Pneumatic Air Hose (FRL → Clamp → Grip Swivel Inlet) ──────────
function buildAirHose() {
  // Hose clamp mounted solidly on base plate at (-60, 4)
  const clampBase = { x: -66, y: -3, w: 12, d: 14, r: 2 };
  const clampTop = { x: -64, y: 0, w: 8, d: 8, r: 1.8 };
  put({
    name: "hose.clamp",
    at: [-60, 4, 4],
    svg:
      S(k.slabOf(clampBase, 0, 3.5, P, 3, 0.4), { tone: "mid" }) +
      S(k.slabOf(clampTop, 3.5, 5.5, P, 3, 0.4), { tone: "mid" }) +
      D([at([-63.5, 4, 3.5]), at([-56.5, 4, 3.5])], { size: 0.45 }),
    shapes: [
      A.slab(clampBase, 0, 3.5, { name: "hose.clamp.base", owner: "hose.clamp" }, 3),
      A.slab(clampTop, 3.5, 5.5, { name: "hose.clamp.cap", owner: "hose.clamp" }, 3),
    ],
  });

  // Outlet boss on FRL (-X/+X side of manifold at x = -88, y = 27, z = 29)
  const outF = G.frameOf([-88, 27, 29], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  put({
    name: "frl.outlet",
    at: [-86.8, 27, 29],
    svg: S(G.disc(0, 2.6, 3.4, outF, P), { tone: "hi" }),
    shapes: [A.disc(outF, 0, 2.6, 3.4, { name: "frl.outlet", owner: "frl" })],
  });

  // Braided hose route from FRL outlet (-85.4, 27, 29) down through clamp saddle (-60, 4, 11.2) to grip inlet (-17, -14, 11)
  const rawHose = [
    [-85.4, 27, 29],
    [-75, 24, 29],
    [-70, 16, 11.2],
    [-60, 4, 11.2],
    [-40, -10, 8],
    [-17, -14, 8],
    [-17, -14, 11],
  ];
  const pts = G.fillet(rawHose, 7.2, 8, { P, tube: 2.2 });
  const total = G.pathLength(pts);
  const pieces = tubePieces(pts, 2.2, P, {
    maxLength: 16,
    rings: { pitch: 3.2, cross: true, fade: [0.12, 0.55], tone: "lo" },
  });
  pieces.forEach((piece, idx) => {
    put({
      name: `hose.seg.${idx}`,
      at: piece.mid,
      svg: tubeSvg(piece, { tone: "mid" }),
      shapes: [
        A.tube(piece.points, piece.radii, {
          name: `hose.seg.${idx}`,
          owner: "hose",
          limp: true,
          touch: ["hose.clamp.cap"],
          joined: idx > 0 ? [`hose.seg.${idx - 1}`] : [],
          tips: [idx === 0 ? pts[0] : null, idx === pieces.length - 1 ? pts[pts.length - 1] : null],
          tipAxes: [
            idx === 0 ? G.tangentAlong(pts, 0) : null,
            idx === pieces.length - 1 ? G.tangentAlong(pts, total) : null,
          ],
          tipRims: [2.8, 2.6],
        }),
      ],
    });
  });
}

// ── 5. Wrench Barrel: Rear Cap, Cutaway Motor, Cutaway Twin-Hammer, Nose & Socket
function buildWrenchBarrel() {
  const owner = "wrench.body";

  // Rear motor end cap (x = -48..-36)
  const capProf = [
    [-48, 11],
    [-46, 15.5, 1],
    [-42, 17.5, 1],
    [-36, 18],
  ];
  put({
    name: "wrench.rearCap",
    at: [-42, BARREL_Y, BARREL_Z],
    svg: S(G.solidOf(capProf, F_BARREL, P), {
      tone: "mid",
      inner: L(G.arcOf(F_BARREL, -40, 17.8, P), { tone: "faint" }),
    }),
    shapes: [A.solid(F_BARREL, capProf, { name: "wrench.rearCap", owner })],
  });

  // Power selector thumb knob on top of rear cap
  put({
    name: "wrench.powerKnob",
    at: [-41, BARREL_Y, BARREL_Z + 19.6],
    bias: 1.5,
    svg:
      S(k.cylinder(-41, BARREL_Y, 4.2, BARREL_Z + 17.6, 4.0, P, 24, 0.3), { tone: "hi" }) +
      L(k.knurl(-41, BARREL_Y, 4.2, BARREL_Z + 17.6, BARREL_Z + 21.6, 16, P), { tone: "lo" }),
    shapes: [
      A.cylinder(-41, BARREL_Y, 4.2, BARREL_Z + 17.6, 4.0, {
        name: "wrench.powerKnob",
        owner,
        touch: ["wrench.rearCap"],
      }),
    ],
  });

  // Cutaway Rotary Vane Motor Housing (x = -36..-2, rIn = 14.5, rOut = 18)
  // Split at silhouette limb angles (129° and 309°) so shellBack is 100% behind rotorSlot
  // and shellTop + shellFront sit cleanly in front!
  buildCutawayShell({
    name: "motor.shellBack",
    owner,
    s0: -36,
    s1: -2,
    rIn: 14.5,
    rOut: 18,
    a0Deg: 129,
    a1Deg: 309,
    tone: "mid",
    cavity: true,
    bias: -0.6,
  });

  // Live Rotor + 6 Sliding Vanes container (inserted right between back and front motor shells!)
  put({
    name: "motor.rotorSlot",
    at: [-19, BARREL_Y, BARREL_Z],
    part: "rotor-slot",
    cls: "iw-cavity",
    svg: `<g data-part="rotor-live"></g>`,
    shapes: [
      A.disc(
        G.frameOf([0, BARREL_Y - 1.0, BARREL_Z - 1.0], [1, 0, 0], [0, 1, 0], [0, 0, 1]),
        -36,
        -2,
        12.6,
        { name: "motor.rotor", owner: "motor.rotor" },
      ),
    ],
  });

  buildCutawayShell({
    name: "motor.shellTop",
    owner,
    s0: -36,
    s1: -2,
    rIn: 14.5,
    rOut: 18,
    a0Deg: 94,
    a1Deg: 129,
    steps: 8,
    capA0: true,
    tone: "mid",
    bias: 0.6,
    touch: ["motor.shellBack"],
  });

  buildCutawayShell({
    name: "motor.shellFront",
    owner,
    s0: -36,
    s1: -2,
    rIn: 14.5,
    rOut: 18,
    a0Deg: 309,
    a1Deg: 348,
    steps: 8,
    capA1: true,
    tone: "mid",
    bias: 0.6,
    touch: ["motor.shellBack"],
  });

  // Inter-chamber bulkhead flange separating motor and twin-hammer clutch (x = -2..3)
  put({
    name: "wrench.midBulkhead",
    at: [0.5, BARREL_Y, BARREL_Z],
    svg: S(G.ringBand(-2, 3, 4.0, 19.2, F_BARREL, P, { bevel: 0.4 }), {
      tone: "mid",
      inner: L(G.arcOf(F_BARREL, 0.5, 19.2, P), { tone: "faint" }),
    }),
    shapes: [A.ring(F_BARREL, -2, 3, 4.0, 19.2, { name: "wrench.midBulkhead", owner })],
  });

  // Cutaway Twin-Hammer Impact Clutch Housing (x = 3..35, rIn = 15.5, rOut = 19)
  buildCutawayShell({
    name: "clutch.shellBack",
    owner,
    s0: 3,
    s1: 35,
    rIn: 15.5,
    rOut: 19,
    a0Deg: 129,
    a1Deg: 309,
    tone: "mid",
    cavity: true,
    bias: -0.6,
  });

  // Live Twin-Hammer + Cam + Two-Lug Anvil container
  put({
    name: "clutch.hammerSlot",
    at: [19, BARREL_Y, BARREL_Z],
    part: "clutch-slot",
    cls: "iw-cavity",
    svg: `<g data-part="clutch-live"></g><path data-part="impact-flash" class="iw-impact-flash" d=""/>`,
    shapes: [A.disc(F_BARREL, 3, 35, 13.6, { name: "clutch.hammers", owner: "clutch.hammers" })],
  });

  buildCutawayShell({
    name: "clutch.shellTop",
    owner,
    s0: 3,
    s1: 35,
    rIn: 15.5,
    rOut: 19,
    a0Deg: 94,
    a1Deg: 129,
    steps: 8,
    capA0: true,
    tone: "mid",
    bias: 0.6,
    touch: ["clutch.shellBack"],
  });

  buildCutawayShell({
    name: "clutch.shellFront",
    owner,
    s0: 3,
    s1: 35,
    rIn: 15.5,
    rOut: 19,
    a0Deg: 309,
    a1Deg: 348,
    steps: 8,
    capA1: true,
    tone: "mid",
    bias: 0.6,
    touch: ["clutch.shellBack"],
  });

  // Clamping neck (x = 35..43, cylindrical land inside reaction collar) + tapered Nose Cone (x = 43..60)
  const neckProf = [
    [35, 17.6],
    [43, 17.6],
  ];
  put({
    name: "wrench.noseNeck",
    at: [39, BARREL_Y, BARREL_Z],
    svg: S(G.solidOf(neckProf, F_BARREL, P), { tone: "mid" }),
    shapes: [A.solid(F_BARREL, neckProf, { name: "wrench.noseNeck", owner })],
  });

  const noseProf = [
    [43, 17.6],
    [46, 15.4, 1],
    [55, 11.2, 1],
    [58, 9.8],
    [60, 8.6],
  ];
  put({
    name: "wrench.noseCone",
    at: [51.5, BARREL_Y, BARREL_Z],
    svg: S(G.solidOf(noseProf, F_BARREL, P), {
      tone: "mid",
      inner:
        L(G.arcOf(F_BARREL, 46, 15.4, P), { tone: "faint" }) +
        L(G.arcOf(F_BARREL, 58, 9.8, P), { tone: "faint" }),
    }),
    shapes: [A.solid(F_BARREL, noseProf, { name: "wrench.noseCone", owner })],
  });

  // 1/2" Square Drive Anvil protruding from nose cone (x = 60..69)
  const sqHalf = 4.3;
  const sqPoly = [
    [-sqHalf, -sqHalf],
    [sqHalf, -sqHalf],
    [sqHalf, sqHalf],
    [-sqHalf, sqHalf],
  ];
  put({
    name: "wrench.anvilDrive",
    at: [64.5, BARREL_Y, BARREL_Z],
    svg: S(G.prismOf(F_BARREL, sqPoly, 60, 69, P), { tone: "hi" }),
    shapes: [A.prism(F_BARREL, sqPoly, 60, 69, { name: "wrench.anvilDrive", owner: "clutch.anvil" })],
  });

  // Deep 6-point Impact Socket (x = 67..86.5) with machined retention groove & live rotating spline bands
  const sockProf = [
    [67, 8.6],
    [70, 9.8],
    [73, 9.8],
    [74, 11.2],
    [81.4, 11.2],
    [82.0, 10.8],
    [82.6, 11.2],
    [85.5, 11.2],
    [86.5, 10.2],
  ];
  put({
    name: "wrench.socket",
    at: [76.8, BARREL_Y, BARREL_Z],
    svg:
      S(G.solidOf(sockProf, F_BARREL, P), {
        tone: "hi",
        crease: "lo",
      }) + `<g data-part="socket-mark"></g>`,
    shapes: [A.solid(F_BARREL, sockProf, { name: "wrench.socket", owner: "clutch.anvil" })],
  });
}

// ── 6. Hex Test Bolt, Hydraulic Load Cell & Dial Torque Gauge ────────────────
function torqueNeedle(nm) {
  const frac = Math.max(0, Math.min(1, nm / M.MAX_TORQUE_NM));
  const ang = (-130 + frac * 260) * D2R;
  const cx = TORQUE_GAUGE[0];
  const cy = TORQUE_GAUGE[1];
  const z = TORQUE_GAUGE_Z + 0.3;
  const tip = [cx + Math.sin(ang) * (TORQUE_GAUGE_R - 4.8), cy - Math.cos(ang) * (TORQUE_GAUGE_R - 4.8)];
  const tail = [cx - Math.sin(ang) * 3.5, cy + Math.cos(ang) * 3.5];
  return k.lineOnTop(tail, tip, z, P);
}

function buildDynoAndTorqueGauge() {
  const owner = "dyno";

  // Hex test bolt head (x = 86.0..93.2) clearly visible between socket mouth and dyno block
  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return [9.2 * Math.cos(a), 9.2 * Math.sin(a)];
  });
  put({
    name: "dyno.testBolt",
    at: [89.6, BARREL_Y, BARREL_Z],
    part: "test-bolt",
    svg: `<g data-part="bolt-live">${S(G.prismOf(F_BARREL, hexPts, 86.0, 93.2, P), { tone: "hi" })}</g>`,
    shapes: [A.prism(F_BARREL, hexPts, 86.0, 93.2, { name: "dyno.testBolt", owner })],
  });

  // Dyno stanchion base plate & pedestal
  const dbc = k.corners(DYNO_BASE, 4);
  put({
    name: "dyno.base",
    at: [107, -14, 2],
    svg:
      S(k.slabOf(DYNO_BASE, 0, 4.5, P, 4, 0.5), { tone: "mid" }) +
      L(dbc.map(([x, y]) => k.ring(x, y, 1.5, 4.5, P, 12)).join(""), { tone: "lo" }) +
      D(dbc.map(([x, y]) => at([x, y, 4.5])), { size: 0.45 }),
    shapes: [A.slab(DYNO_BASE, 0, 4.5, { name: "dyno.base", owner }, 4)],
  });

  // Main hydraulic torque-reaction load block (z = 4.5..77)
  put({
    name: "dyno.block",
    at: [107, -14, 41],
    svg: [
      S(k.slabOf(DYNO_BLOCK, 4.5, 72.5, P, 4, 0.8), {
        tone: "mid",
        inner:
          L(k.sideSeam(DYNO_BLOCK, 42, P, 4), { tone: "faint" }) +
          L(k.sideSeam(DYNO_BLOCK, 56, P, 4), { tone: "faint" }),
      }),
      L(k.planOutline(k.insetPlan(DYNO_BLOCK, 2.5), 77, P, 4), { tone: "faint" }),
      D([at([97, -23, 77]), at([117, -23, 77]), at([97, -5, 77]), at([117, -5, 77])], { size: 0.5 }),
    ].join(""),
    shapes: [A.slab(DYNO_BLOCK, 4.5, 72.5, { name: "dyno.block", owner }, 4)],
  });

  // Top hydraulic preload bleed cap on dyno block
  put({
    name: "dyno.bleedCap",
    at: [107, -14, 80],
    svg:
      S(k.cylinder(107, -14, 5.5, 77, 5, P, 28, 0.4), { tone: "hi" }) +
      L(k.knurl(107, -14, 5.5, 77, 82, 20, P), { tone: "lo" }),
    shapes: [A.cylinder(107, -14, 5.5, 77, 5, { name: "dyno.bleedCap", owner })],
  });

  // Hydraulic port boss on front (+Y) face of dyno block (y = -1, z = 18)
  const dPortF = G.frameOf([107, -1, 18], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  put({
    name: "dyno.port",
    at: [107, 0.2, 18],
    svg: S(G.disc(0, 2.5, 3.0, dPortF, P), { tone: "hi" }),
    shapes: [A.disc(dPortF, 0, 2.5, 3.0, { name: "dyno.port", owner })],
  });

  // Foreground Dial Torque Gauge (0..800 N·m)
  const [tx, ty] = TORQUE_GAUGE;
  const tTicks = k.radialTicks(
    tx,
    ty,
    TORQUE_GAUGE_R - 2.6,
    40,
    5,
    TORQUE_GAUGE_Z,
    [1.3, 2.8],
    P,
    -130 * D2R,
    260 * D2R,
  );
  const tSvg = [
    S(k.cylinder(tx, ty, TORQUE_GAUGE_R + 1.8, 0, 3.2, P, 56), { tone: "lo" }),
    S(k.cylinder(tx, ty, TORQUE_GAUGE_R, 3.2, TORQUE_GAUGE_Z - 3.2, P, 56, 0.7), { tone: "hi", crease: "lo" }),
    L(k.knurl(tx, ty, TORQUE_GAUGE_R, TORQUE_GAUGE_Z - 3.2, TORQUE_GAUGE_Z, 72, P, 0.3), { tone: "lo" }),
    L(k.sideArc(tx, ty, TORQUE_GAUGE_R, TORQUE_GAUGE_Z - 3.2, P, 36), { tone: "faint" }),
    L(k.ring(tx, ty, TORQUE_GAUGE_R - 2.0, TORQUE_GAUGE_Z, P, 56), { tone: "lo" }),
    L(tTicks.minor, { tone: "lo" }),
    L(tTicks.major, { tone: "mid" }),
    L(k.ring(tx, ty, 1.8, TORQUE_GAUGE_Z, P, 18), { tone: "hi" }),
    k.faceTextSvg(k.topMatrix([tx, ty + 6.2], TORQUE_GAUGE_Z, P), "N·m", { size: 3.1, tone: "mid", anchor: "middle" }),
  ].join("");
  put({
    name: "dyno.torqueGauge",
    at: [tx, ty, 5],
    svg: tSvg,
    shapes: [
      A.cylinder(tx, ty, TORQUE_GAUGE_R + 1.8, 0, 3.2, { name: "dyno.torqueGauge.base", owner: "gauge" }),
      A.cylinder(tx, ty, TORQUE_GAUGE_R, 3.2, TORQUE_GAUGE_Z - 3.2, { name: "dyno.torqueGauge.body", owner: "gauge" }),
    ],
  });

  // Port on +X side of torque gauge
  const gSideF = G.frameOf([tx + TORQUE_GAUGE_R, ty, 6], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  put({
    name: "dyno.gaugePort",
    at: [tx + TORQUE_GAUGE_R + 1.0, ty, 6],
    svg: S(G.disc(0, 2.0, 2.4, gSideF, P), { tone: "mid" }),
    shapes: [A.disc(gSideF, 0, 2.0, 2.4, { name: "dyno.gaugePort", owner: "gauge" })],
  });

  // Hydraulic sense tube clamp on plate at (84, 32) — sits flush under tube z=5.0
  const tClamp = { x: 80, y: 28, w: 8, d: 8, r: 1.5 };
  put({
    name: "dyno.tubeClamp",
    at: [84, 32, 2.45],
    svg:
      S(k.slabOf(tClamp, 0, 4.9, P, 3, 0.4), { tone: "mid" }) +
      D([at([81.8, 30, 4.9]), at([86.2, 34, 4.9])], { size: 0.42 }),
    shapes: [A.slab(tClamp, 0, 4.9, { name: "dyno.tubeClamp", owner: "dyno.tubeClamp" }, 3)],
  });

  // Rigid hydraulic sense tube from dyno port (107, 1.5, 18) -> clamp -> gauge port
  const rawHyd = [
    [107, 1.5, 18],
    [107, 16, 18],
    [107, 32, 6.2],
    [84, 32, 6.2],
    [72, 42, 6.2],
    [tx + TORQUE_GAUGE_R + 2.0, ty, 6],
  ];
  const hydPts = G.fillet(rawHyd, 4.5, 7, { P, tube: 1.2 });
  const hydTotal = G.pathLength(hydPts);
  const hydPieces = tubePieces(hydPts, 1.2, P, { maxLength: 16 });
  hydPieces.forEach((piece, idx) => {
    put({
      name: `dyno.hydLine.${idx}`,
      at: piece.mid,
      svg: tubeSvg(piece, { tone: "mid" }),
      shapes: [
        A.tube(piece.points, piece.radii, {
          name: `dyno.hydLine.${idx}`,
          owner: "dyno.hydLine",
          touch: ["dyno.tubeClamp"],
          joined: idx > 0 ? [`dyno.hydLine.${idx - 1}`] : [],
          tips: [idx === 0 ? hydPts[0] : null, idx === hydPieces.length - 1 ? hydPts[hydPts.length - 1] : null],
          tipAxes: [
            idx === 0 ? G.tangentAlong(hydPts, 0) : null,
            idx === hydPieces.length - 1 ? G.tangentAlong(hydPts, hydTotal) : null,
          ],
          tipRims: [1.8, 1.8],
        }),
      ],
    });
  });
}

buildBench();
buildFRL();
buildStanchionsAndGrip();
buildAirHose();
buildWrenchBarrel();
buildDynoAndTorqueGauge();

A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);

if (argv.includes("--audit")) {
  A.auditOrExit(R, P);
}

const groups = R.items.map((item) => `<g ${item.attrs?.includes("class=") ? "" : 'class="it" '}data-name="${item.name}"${item.attrs ?? ""}>${item.svg}</g>`);

const bodySvg = [
  `<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`,
  ...groups,
  `<path data-part="psi-needle" class="iso-line" data-tone="lit" data-free="both" d="${psiNeedle(M.NOMINAL_PSI)}" style="stroke-width:1.05px"/>`,
  `<path data-part="knob-pointer" class="iso-line" data-tone="hi" data-free="both" d="${knobPointer(M.NOMINAL_PSI)}" style="stroke-width:1.0px"/>`,
  `<path data-part="torque-needle" class="iso-line" data-tone="lit" data-free="both" d="${torqueNeedle(0)}" style="stroke-width:1.15px"/>`,
];

const LABEL =
  "A 1/2-inch pneumatic twin-hammer impact wrench clamped on a bench torque dynamometer. Shop air passes through a filter-regulator station and braided hose into the pistol grip trigger valve, driving a cutaway 6-vane rotary motor and twin-hammer clutch that strikes a two-lug anvil in bursts to tighten a test bolt and spike a hydraulic dial torque gauge.";

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: bodySvg });
const stage = `<div class="iso-stage iw-stage" tabindex="0" role="group" aria-label="Pneumatic impact wrench test bench: move pointer or press Left and Right arrows to adjust air pressure, Up and Down or 1 to 3 for bolt load, Space to pull or release trigger, S for slow motion">${svg}<span class="iw-sr" role="status" aria-live="polite" data-status></span></div>`;

const DATA = {
  P,
  F_BARREL,
  barrelY: BARREL_Y,
  barrelZ: BARREL_Z,
  psiGauge: { at: PSI_GAUGE, r: PSI_GAUGE_R, z: PSI_GAUGE_Z },
  frlReg: FRL_REG_XY,
  torqueGauge: { at: TORQUE_GAUGE, r: TORQUE_GAUGE_R, z: TORQUE_GAUGE_Z },
};

const modelSrc = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const FUNCS = `
const D2R = Math.PI / 180;
const M = { NOMINAL_PSI, MIN_PSI, MAX_PSI, MAX_TORQUE_NM };
const PSI_GAUGE = DATA.psiGauge.at, PSI_GAUGE_R = DATA.psiGauge.r, PSI_GAUGE_Z = DATA.psiGauge.z;
const FRL_REG_XY = DATA.frlReg;
const TORQUE_GAUGE = DATA.torqueGauge.at, TORQUE_GAUGE_R = DATA.torqueGauge.r, TORQUE_GAUGE_Z = DATA.torqueGauge.z;
const psiNeedle = ${psiNeedle.toString()};
const knobPointer = ${knobPointer.toString()};
const torqueNeedle = ${torqueNeedle.toString()};
const k = { iso, depthOf, lineOnTop, translateAlong, solidSvg, lineSvg, pathOf };
`;
const CSS = readFileSync(join(HERE, "impact-wrench.css"), "utf8");
const LIVE = `const DATA = ${JSON.stringify(DATA)};\nconst P = DATA.P;\nconst F_BARREL = DATA.F_BARREL;\n${modelSrc}\n${FUNCS}\n${readFileSync(join(HERE, "live.js"), "utf8")}`;

const plate = k.plateHtml({
  fig: "Fig 6",
  title: "Pneumatic Impact Wrench",
  hint: "Drag air · Space · 1–3",
  readout: "90 PSI · 5840 RPM · 0 N·m · WIND UP",
  keys: [
    { mark: "lit", label: "Trigger valve, twin-hammer clutch jaws, and impact torque spike" },
    { mark: "raised", label: "Cutaway 6-vane air motor, two-lug anvil, and 1/2\" impact socket" },
    { mark: "dim", label: "FRL air regulator station, braided hose, and hydraulic bolt dyno" },
  ],
  caption:
    "Shop air at 40–110 PSI passes through the bench FRL regulator into the pistol grip's trigger valve, spinning a 6-vane rotary air motor. Inside the cutaway nose clutch, a spinning cam forces two opposing forged hammers outward to clear the stalled anvil lugs, then snaps them inward to deliver sharp rotational impacts (up to ~1,200 blows/min) that index the socket and bolt while keeping reaction torque off the operator's wrist.",
  body: `<style>${CSS}</style>${stage}`,
});

const page = k.pageHtml({
  title: "Pneumatic impact wrench",
  theme,
  body: plate,
  script: kitScript() + LIVE,
  width: 720,
});

const outName = theme === "light" ? "pneumatic-impact-gun-light.html" : "pneumatic-impact-gun.html";
writeFileSync(join(HERE, outName), page);
console.log(`wrote ${outName} · ${(page.length / 1024).toFixed(0)} KB · ${R.items.length} items`);
