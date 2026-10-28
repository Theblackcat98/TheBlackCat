import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/nick/.gemini/config/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/home/nick/.gemini/config/skills/anatomy/kit/lathe.mjs";
import * as A from "/home/nick/.gemini/config/skills/anatomy/kit/audit.mjs";
import { tubePieces, tubeSvg } from "/home/nick/.gemini/config/skills/anatomy/kit/tube.mjs";
import { kitScript } from "/home/nick/.gemini/config/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const theme = argv.includes("--light") ? "light" : "dark";

const WIDTH = 720;
const HEIGHT = 500;
const AZIMUTH = 42;
const ELEVATION = 30;
const D2R = Math.PI / 180;

// ── World plan (1 unit ≈ 3.5 mm) ──
const BASE = { x: -136, y: -86, w: 272, d: 172, r: 9 };
const BASE_H = 12;
const FOOT_H = 5;

// Telemetry console at rear-left (+Y, -X)
const CONSOLE = { x: -122, y: 24, w: 44, d: 44, r: 4.5 };
const CON_Z0 = 1.2;
const CON_Z1 = 10.5;
const SCREEN = { x: CONSOLE.x + 7, y: CONSOLE.y + 6, w: 30, d: 20, r: 1.5 };

// Dial torque gauge in the open foreground (+Y, near X = -22)
const GAUGE = [-24, 52];
const GAUGE_R = 16.0;
const GAUGE_Z = 8.6;
const GAUGE_SPAN = M.MAX_TORQUE_NM; // 0..25 N·m
const GAUGE_SWEEP = 240; // total sweep degrees

// Central force-plate manifold
const MANIFOLD = { x: -12, y: -7, w: 16, d: 14, r: 1.8 };
const MAN_H = 4.6;

// Front optical target rail & collimator carriage (+X)
const RAIL_BED = { x: 82, y: -54, w: 14, d: 108, r: 2.2 };
const RAIL_BAR = { x: 85.5, y: -48, w: 7, d: 96, r: 1.0 };
const CARRIAGE = { x: 83.5, y: -9, w: 11, d: 18, r: 1.8 };
const BEACON_X = 83.5;
const BEACON_Z = 34;

export const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [-110, 0, 88],
    [102, -56, 52],
    [102, 56, 52],
    [68, 0, 88],
  ],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: AZIMUTH, elevation: ELEVATION },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const Faded = (list, style) => k.fadedSvg(list, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

const VERT = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const frameOf = (o, a, u) => {
  const axis = G.unit3(a);
  const uu = u ? G.unit3(G.sub3(u, G.mul3(axis, G.dot3(u, axis)))) : G.frameAlong(o, axis).u;
  return { o, a: axis, u: uu, v: G.cross3(axis, uu) };
};

export const R = A.recorder(P);
function put({ name, at: ref, bias = 0, part = null, tailIdx = null, legStage = null, svg, shapes }) {
  const recorded = shapes.map((shape, index) =>
    R.solid(Object.assign(shape, { name: shape.name ?? (index ? `${name}#${index + 1}` : name) })),
  );
  let attrs = "";
  if (part) attrs += ` data-part="${part}"`;
  if (tailIdx !== null) attrs += ` data-tail="${tailIdx}"`;
  if (legStage) attrs += ` data-leg-stage="${legStage}"`;
  return R.put({ name, at: ref, bias, attrs, svg, shapes: recorded });
}

// ─────────────────────── 1. Metrology Base Plate & Feet ───────────────────────
function buildBench() {
  for (const [x, y] of byDepth(k.corners(BASE, 22))) {
    const svg =
      S(k.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.8, P, 28), { tone: "lo" }) +
      S(k.cylinder(x, y, 6.2, -BASE_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: "mid" }) +
      L(k.knurl(x, y, 6.2, -BASE_H - FOOT_H + 1.8, -BASE_H, 20, P), { tone: "lo" });
    put({
      name: `stand.foot.${x}.${y}`,
      at: [x, y, -BASE_H - FOOT_H],
      svg,
      shapes: [
        A.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.8, { ground: true }),
        A.cylinder(x, y, 6.2, -BASE_H - FOOT_H + 1.8, FOOT_H - 1.8),
      ],
    });
  }

  const screws = k.corners(BASE, 9);
  const strip = { x: BASE.x + 18, y: BASE.y + BASE.d - 12, w: 168, d: 6.5, r: 1 };
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  const badge = { x: BASE.x + BASE.w - 72, y: BASE.y + BASE.d - 16, w: 54, d: 11, r: 1.5 };

  const svg = [
    S(k.slabOf(BASE, -BASE_H, BASE_H, P, 9, 1.6), {
      tone: "lo",
      inner: L(k.sideSeam(BASE, -BASE_H + 4, P, 9), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(BASE, 5), 0, P, 9), { tone: "faint" }),
    L(screws.map(([x, y]) => k.ring(x, y, 2.3, 0, P, 16)).join(""), { tone: "lo" }),
    D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }),
    // Ruler strip
    S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }),
    L(ticks.minor, { tone: "lo" }),
    L(ticks.major, { tone: "mid" }),
    D([at([strip.x + 2, strip.y + 3.2, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.2, 0.6])], { size: 0.45 }),
    // Identification plaque
    S(k.slabOf(badge, 0, 0.7, P, 3, 0.3), { tone: "lo" }),
    L(k.planOutline(k.insetPlan(badge, 1.4), 0.7, P, 3), { tone: "faint" }),
    L(
      [3.2, 5.6, 8.0]
        .map((dy, i) => k.lineOnTop([badge.x + 4, badge.y + dy], [badge.x + (i === 0 ? 46 : i === 1 ? 36 : 28), badge.y + dy], 0.7, P))
        .join(""),
      { tone: "lo", free: true },
    ),
    D(
      [
        [badge.x + 2, badge.y + 2],
        [badge.x + badge.w - 2, badge.y + 2],
        [badge.x + 2, badge.y + badge.d - 2],
        [badge.x + badge.w - 2, badge.y + badge.d - 2],
      ].map(([x, y]) => at([x, y, 0.7])),
      { size: 0.4 },
    ),
  ].join("");

  put({
    name: "stand.base",
    at: [0, 0, -BASE_H],
    svg,
    shapes: [A.slab(BASE, -BASE_H, BASE_H, { ground: true })],
  });
}

// ─────────────── 2. Four Strain-Gauge Force Pads & Manifold ───────────────
function buildForcePads() {
  for (const pad of M.PADS) {
    const { id, x, y } = pad;
    const F = VERT(x, y, 0);
    const svg = [
      S(G.disc(0, 1.5, 11.2, F, P), { tone: "lo" }),
      D(G.dotsOf(F, 1.5, 9.4, 6, P, { all: true, phase: 0.3 }), { size: 0.42, tone: "mid" }),
      S(G.disc(1.5, 3.6, 8.6, F, P), {
        tone: "mid",
        inner: L(G.arcOf(F, 2.5, 8.6, P, { least: 0 }), { tone: "faint" }),
      }),
      S(G.disc(3.6, 4.5, 7.2, F, P), { tone: "lo" }),
      L(G.circleOf(F, 4.5, 5.8, P, 36), { tone: "faint" }),
    ].join("");
    put({
      name: `stand.pad.${id}`,
      at: [x, y, 0],
      bias: 0.5,
      svg,
      shapes: [
        A.disc(F, 0, 1.5, 11.2, { name: `stand.pad.${id}.base`, ground: true }),
        A.disc(F, 1.5, 3.6, 8.6, { name: `stand.pad.${id}.cell` }),
        A.disc(F, 3.6, 4.5, 7.2, { name: `stand.pad.${id}.top` }),
      ],
    });
  }

  // Central sensor manifold block + 4 floor sensor bus strips to the 4 force pads
  const manScrews = k.corners(MANIFOLD, 2.2);
  const busChannels = M.PADS.map((p) => {
    const sx = p.fore > 0 ? MANIFOLD.x + MANIFOLD.w : MANIFOLD.x;
    const sy = p.side > 0 ? MANIFOLD.y + MANIFOLD.d - 2.5 : MANIFOLD.y + 2.5;
    const ex = p.x - p.fore * 9.5;
    const ey = p.y - p.side * 6.0;
    return k.wireSvg(at([sx, sy, 0.4]), at([ex, ey, 0.4]), {
      via: [at([(sx + ex) * 0.5, sy, 0.4])],
      tone: "lo",
      ends: "both",
      size: 0.7,
    });
  }).join("");

  const manSvg = [
    busChannels,
    S(k.slabOf(MANIFOLD, 0, MAN_H, P, 4, 0.5), {
      tone: "mid",
      inner: L(k.sideSeam(MANIFOLD, 2.2, P, 4), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(MANIFOLD, 2.0), MAN_H, P, 3), { tone: "faint" }),
    D(manScrews.map(([x, y]) => at([x, y, MAN_H])), { size: 0.45, tone: "hi" }),
    k.faceTextSvg(k.topMatrix([MANIFOLD.x + 8, MANIFOLD.y + 8.2], MAN_H, P, "x"), "LC-4", {
      size: 2.4,
      tone: "lo",
      anchor: "middle",
    }),
  ].join("");
  put({
    name: "stand.manifold",
    at: [-4, 0, 0],
    bias: 0.5,
    svg: manSvg,
    shapes: [
      A.slab(MANIFOLD, 0, MAN_H, { name: "stand.manifold", ground: true }, 4),
      ...M.PADS.map((p) =>
        A.tube(
          [
            [p.fore > 0 ? MANIFOLD.x + MANIFOLD.w : MANIFOLD.x, p.side > 0 ? MANIFOLD.y + MANIFOLD.d - 2.5 : MANIFOLD.y + 2.5, 0.4],
            [p.x - p.fore * 9.5, p.y - p.side * 6.0, 0.4],
          ],
          0.4,
          { name: `stand.bus.${p.id}`, owner: "stand.manifold", ground: true },
        ),
      ),
    ],
  });

  // Two cable glands on the manifold:
  // 1) +X/+Y side (at x = 4, y = 3.5) for gauge in foreground
  // 2) -X face (at x = -12, y = 3.5) for console at rear-left
  const GF1 = frameOf([MANIFOLD.x + MANIFOLD.w, 3.5, 2.6], [1, 0, 0], [0, 0, 1]);
  const GF2 = frameOf([MANIFOLD.x, 3.5, 2.6], [-1, 0, 0], [0, 0, 1]);
  const glandProf = [
    [0, 1.8],
    [1.4, 1.8],
    [1.4, 1.35],
    [2.8, 1.2],
  ];
  put({
    name: "stand.gland.gauge",
    at: G.pointOf(GF1, 1.4, 0, 0),
    bias: 0.6,
    svg: S(G.solidOf(glandProf, GF1, P), { tone: "mid" }),
    shapes: [A.solid(GF1, glandProf, { name: "stand.gland.gauge", owner: "cable.gauge" })],
  });
  put({
    name: "stand.gland.console",
    at: G.pointOf(GF2, 1.4, 0, 0),
    bias: 0.6,
    svg: S(G.solidOf(glandProf, GF2, P), { tone: "mid" }),
    shapes: [A.solid(GF2, glandProf, { name: "stand.gland.console", owner: "cable.console" })],
  });
}

// ─────────────── 3. Dial Torque Indicator Gauge & Console ───────────────
export const gaugeNeedle = (torqueNm) => {
  const v = Math.max(0, Math.min(GAUGE_SPAN * 1.05, torqueNm));
  const startAng = (-120 * Math.PI) / 180 + Math.PI;
  const a = startAng + (v / GAUGE_SPAN) * (GAUGE_SWEEP * D2R);
  const [x, y] = GAUGE;
  const dir = [Math.sin(a), -Math.cos(a)];
  return k.lineOnTop(
    [x - dir[0] * 3.2, y - dir[1] * 3.2],
    [x + dir[0] * (GAUGE_R - 4.4), y + dir[1] * (GAUGE_R - 4.4)],
    GAUGE_Z + 2.2,
    P,
  );
};

function buildGauge() {
  const [x, y] = GAUGE;
  const F = VERT(x, y, 0);
  const z1 = GAUGE_Z + 2.0;
  const from = (-120 * Math.PI) / 180 + Math.PI;
  const ticks = k.radialTicks(x, y, GAUGE_R - 2.4, 25, 5, z1, [1.2, 2.6], P, from, GAUGE_SWEEP * D2R);
  // Flat terminal boss on +X side of gauge body (facing toward x = 14)
  const bossPlan = { x: x + GAUGE_R - 1.5, y: y - 3.2, w: 3.5, d: 6.4, r: 0.6 };

  const svg = [
    `<path class="iso-halo" d="${k.haloOf({ x: x - GAUGE_R, y: y - GAUGE_R, w: 2 * GAUGE_R, d: 2 * GAUGE_R, r: GAUGE_R }, 0, 0.1, P)}" style="filter:blur(3px)"/>`,
    S(G.disc(0, 1.6, GAUGE_R + 2.2, F, P), { tone: "lo" }),
    S(G.disc(1.6, GAUGE_Z, GAUGE_R + 0.8, F, P), {
      tone: "mid",
      inner: L(G.arcOf(F, 4.8, GAUGE_R + 0.8, P, { least: 0 }), { tone: "faint" }),
    }),
    S(k.slabOf(bossPlan, 1.6, 4.2, P, 2, 0.2), { tone: "mid" }),
    S(G.disc(GAUGE_Z, z1, GAUGE_R, F, P), { tone: "hi", crease: "lo" }),
    Faded(G.ribsOf(F, GAUGE_Z + 0.2, z1 - 0.2, GAUGE_R, 84, P, { fade: [0.08, 0.5], seams: false }), { tone: "lo" }),
    L(G.circleOf(F, z1, GAUGE_R - 1.6, P, 84), { tone: "lo" }),
    L(ticks.minor, { tone: "lo" }),
    L(ticks.major, { tone: "mid" }),
    k.faceTextSvg(k.topMatrix([x, y + 6.2], z1, P, "x"), "N·m", { size: 2.8, tone: "lo", anchor: "middle" }),
    L(G.circleOf(F, z1, 1.8, P, 20), { tone: "mid" }),
  ].join("");

  put({
    name: "stand.gauge",
    at: [x, y, 0],
    svg,
    shapes: [
      A.disc(F, 0, 1.6, GAUGE_R + 2.2, { name: "stand.gauge.foot", owner: "stand.gauge", ground: true }),
      A.disc(F, 1.6, GAUGE_Z, GAUGE_R + 0.8, { name: "stand.gauge.body", owner: "stand.gauge" }),
      A.slab(bossPlan, 1.6, 4.2, { name: "stand.gauge.boss", owner: "stand.gauge" }, 2),
      A.disc(F, GAUGE_Z, z1, GAUGE_R, { name: "stand.gauge.bezel", owner: "stand.gauge" }),
    ],
  });

  // Cable boot on the flat +X face of stand.gauge.boss at z = 3.6
  const BF = frameOf([bossPlan.x + bossPlan.w, y, 3.6], [1, 0, 0], [0, 0, 1]);
  const boot = [
    [0, 1.6],
    [1.4, 1.6],
    [3.0, 1.2],
  ];
  put({
    name: "stand.gauge.boot",
    at: G.pointOf(BF, 1.5, 0, 0),
    svg: S(G.solidOf(boot, BF, P), { tone: "mid" }),
    shapes: [A.solid(BF, boot, { name: "stand.gauge.boot", owner: "cable.gauge" })],
  });
}

// Console 4-channel force bar helper
export const BAR = {
  x0: SCREEN.x + 6.5,
  len: SCREEN.w - 9.0,
  rows: [SCREEN.y + 3.6, SCREEN.y + 8.0, SCREEN.y + 12.4, SCREEN.y + 16.8],
  w: 2.0,
};
export const barPath = (i, forceN) => {
  const f = Math.max(0.06, Math.min(1, forceN / 42));
  const y = BAR.rows[i];
  return k.onTop(
    [
      [BAR.x0, y - BAR.w / 2],
      [BAR.x0 + BAR.len * f, y - BAR.w / 2],
      [BAR.x0 + BAR.len * f, y + BAR.w / 2],
      [BAR.x0, y + BAR.w / 2],
    ],
    CON_Z1 + 0.35,
    P,
    true,
  );
};

function buildConsole() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(CONSOLE, CON_Z0, 0.1, P)}" style="filter:blur(3px)"/>`);
  for (const [x, y] of byDepth(k.corners(CONSOLE, 5))) {
    out.push(S(k.cylinder(x, y, 2.4, 0, CON_Z0, P, 16), { tone: "lo" }));
  }
  out.push(
    S(k.slabOf(CONSOLE, CON_Z0, CON_Z1 - CON_Z0, P, 6, 0.9), {
      tone: "mid",
      inner: L(k.sideSeam(CONSOLE, CON_Z0 + 3.2, P, 6), { tone: "faint" }),
    }),
  );
  out.push(L(k.planOutline(k.insetPlan(CONSOLE, 2.4), CON_Z1, P, 5), { tone: "faint" }));
  out.push(D(k.corners(CONSOLE, 4.2).map(([x, y]) => at([x, y, CON_Z1])), { size: 0.45, tone: "lo" }));

  // Recessed OLED telemetry window
  out.push(S(k.slabOf(k.insetPlan(SCREEN, -1), CON_Z1, 0.3, P, 3), { tone: "lo", crease: "none" }));
  out.push(`<path class="rc-screen" d="${k.planOutline(SCREEN, CON_Z1 + 0.32, P, 3)}"/>`);
  out.push(
    ...BAR.rows.map((y) =>
      L(k.lineOnTop([BAR.x0, y], [BAR.x0 + BAR.len, y], CON_Z1 + 0.33, P), { tone: "faint", free: true }),
    ),
  );
  out.push(BAR.rows.map((_, i) => `<path class="rc-bar" data-bar="${i}" d="${barPath(i, 22.5)}"/>`).join(""));
  M.PADS.forEach((pad, i) =>
    out.push(
      k.faceTextSvg(k.topMatrix([SCREEN.x + 3.2, BAR.rows[i] + 0.6], CON_Z1 + 0.34, P, "x"), pad.label, {
        size: 1.9,
        tone: "lo",
        anchor: "middle",
      }),
    ),
  );

  // Knurled gain dial & two toggle switches on front strip of console
  const kx = CONSOLE.x + 13;
  const ky = CONSOLE.y + 34.5;
  out.push(S(k.cylinder(kx, ky, 5.2, CON_Z1, 3.6, P, 28, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(kx, ky, 5.2, CON_Z1 + 0.2, CON_Z1 + 3.4, 24, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([kx, ky], [kx + 4.2, ky], CON_Z1 + 3.6, P), { tone: "hi", free: "start" }));

  for (const sx of [CONSOLE.x + 27, CONSOLE.x + 35]) {
    const sy = CONSOLE.y + 34.5;
    out.push(S(k.cylinder(sx, sy, 1.8, CON_Z1, 1.0, P, 16), { tone: "lo" }));
    out.push(S(k.cylinder(sx, sy, 0.65, CON_Z1 + 1.0, 3.0, P, 12), { tone: "hi", crease: "none" }));
    out.push(D([at([sx, sy, CON_Z1 + 4.0])], { size: 0.55, tone: "hi" }));
  }

  put({
    name: "stand.console",
    at: [CONSOLE.x + CONSOLE.w / 2, CONSOLE.y + CONSOLE.d / 2, CON_Z0],
    svg: out.join(""),
    shapes: [
      A.slab(CONSOLE, CON_Z0, CON_Z1 - CON_Z0, { name: "stand.console.case" }, 6),
      A.cylinder(kx, ky, 5.2, CON_Z1, 3.6, { name: "stand.console.knob" }),
      ...k.corners(CONSOLE, 5).map(([x, y], i) => A.cylinder(x, y, 2.4, 0, CON_Z0, { name: `stand.console.foot.${i}`, ground: true })),
    ],
  });

  // Cable boot on the +X face of the console at z = 3.6
  const BF = frameOf([CONSOLE.x + CONSOLE.w, CONSOLE.y + 18, 3.6], [1, 0, 0], [0, 0, 1]);
  const boot = [
    [0, 1.6],
    [1.4, 1.6],
    [3.0, 1.2],
  ];
  put({
    name: "stand.console.boot",
    at: G.pointOf(BF, 1.5, 0, 0),
    svg: S(G.solidOf(boot, BF, P), { tone: "mid" }),
    shapes: [A.solid(BF, boot, { name: "stand.console.boot", owner: "cable.console" })],
  });
}

function buildCables() {
  const r = 0.9;
  const gaugeBossX = GAUGE[0] + GAUGE_R + 2.0;
  // 1. Manifold (+X gland at [4, 3.5, 2.6]) to Dial Gauge (+X boss at [gaugeBossX, 52, 3.6])
  const r1 = G.fillet(
    [
      [MANIFOLD.x + MANIFOLD.w, 3.5, 2.6],
      [14, 3.5, 3.6],
      [14, GAUGE[1], 3.6],
      [gaugeBossX, GAUGE[1], 3.6],
    ],
    8,
    12,
    { P, tube: r },
  );
  const len1 = G.pathLength(r1);
  const gaps1 = [
    [0, 2.8],
    [len1 - 3.0, len1],
  ];
  tubePieces(r1, r, P, { maxLength: 14, gaps: gaps1, caps: [false, false] }).forEach((piece, idx) => {
    put({
      name: `cable.gauge:${idx}`,
      at: piece.mid,
      svg: tubeSvg(piece, { tone: "mid" }),
      shapes: [A.tube(piece.points, r, { owner: "cable.gauge" })],
    });
  });
  R.route("cable.gauge", r1, r, {
    owner: "cable.gauge",
    gaps: gaps1,
    limp: true,
    touch: ["stand.base", "stand.manifold", "stand.gland.gauge", "stand.gauge.boot", "stand.gauge.boss", "stand.gauge.body", "stand.gauge.foot"],
  });

  // 2. Manifold (-X gland at [-12, 3.5, 2.6]) to Telemetry Console (+X boot at [CONSOLE.x + CONSOLE.w, CONSOLE.y + 18, 3.6])
  const r2 = G.fillet(
    [
      [MANIFOLD.x, 3.5, 2.6],
      [-60, 3.5, 3.6],
      [-60, CONSOLE.y + 18, 3.6],
      [CONSOLE.x + CONSOLE.w, CONSOLE.y + 18, 3.6],
    ],
    5,
    12,
    { P, tube: r },
  );
  const len2 = G.pathLength(r2);
  const gaps2 = [
    [0, 2.8],
    [len2 - 3.0, len2],
  ];
  tubePieces(r2, r, P, {
    maxLength: 14,
    gaps: gaps2,
    caps: [false, false],
    rings: { pitch: 2.2, twist: 0.7, cross: true, fade: [0.1, 0.55] },
  }).forEach((piece, idx) => {
    put({
      name: `cable.console:${idx}`,
      at: piece.mid,
      svg: tubeSvg(piece, { tone: "mid" }),
      shapes: [A.tube(piece.points, r, { owner: "cable.console" })],
    });
  });
  R.route("cable.console", r2, r, {
    owner: "cable.console",
    gaps: gaps2,
    limp: true,
    touch: ["stand.base", "stand.manifold", "stand.gland.console", "stand.console.boot", "stand.console.case"],
  });
}

// ─────────────── 4. Front Optical Target Rail & Collimator ───────────────
function buildTargetRail() {
  const bedSvg = [
    S(k.slabOf(RAIL_BED, 0, 3.2, P, 4, 0.6), {
      tone: "lo",
      inner: L(k.sideSeam(RAIL_BED, 1.6, P, 4), { tone: "faint" }),
    }),
    D(k.corners(RAIL_BED, 3.0).map(([x, y]) => at([x, y, 3.2])), { size: 0.45, tone: "mid" }),
  ].join("");

  put({
    name: "stand.rail.bed",
    at: [89, 0, 0],
    svg: bedSvg,
    shapes: [A.slab(RAIL_BED, 0, 3.2, { name: "stand.rail.bed", ground: true }, 4)],
  });

  const railTicks = k.topTicks(RAIL_BAR.y + 4, RAIL_BAR.y + RAIL_BAR.d - 4, 4, 5, RAIL_BAR.x + 0.6, 5.6, [1.5, 2.8], P, "y");
  const barSvg = [
    S(k.slabOf(RAIL_BAR, 3.2, 2.4, P, 3, 0.35), { tone: "mid" }),
    L(railTicks.minor, { tone: "lo" }),
    L(railTicks.major, { tone: "mid" }),
  ].join("");

  put({
    name: "stand.rail.bar",
    at: [89, 0, 3.2],
    svg: barSvg,
    shapes: [A.slab(RAIL_BAR, 3.2, 2.4, { name: "stand.rail.bar" }, 3)],
  });

  // End stops at y = -52.5..-48 and y = +48..+52.5
  for (const [tag, y0] of [
    ["L", -52.5],
    ["R", 48.0],
  ]) {
    const plan = { x: 83.5, y: y0, w: 11, d: 4.5, r: 1.0 };
    const svg =
      S(k.slabOf(plan, 3.2, 5.2, P, 3, 0.4), { tone: "mid" }) +
      D([at([89, y0 + 2.25, 8.4])], { size: 0.48, tone: "hi" });
    put({
      name: `stand.rail.stop.${tag}`,
      at: [89, y0 + 2.25, 3.2],
      svg,
      shapes: [A.slab(plan, 3.2, 5.2, { name: `stand.rail.stop.${tag}` }, 3)],
    });
  }

  // Sliding Target Collimator Carriage (moves along Y with data-part="target")
  const postX = 89;
  const postY = 0;
  const MF = VERT(postX, postY, 0);
  const BF = frameOf([BEACON_X, 0, BEACON_Z], [-1, 0, 0], [0, 0, 1]);
  const beaconProf = [
    [-7.5, 4.4],
    [-2.0, 4.4],
    [-2.0, 5.8],
    [0, 5.8],
  ];
  const carSvg = [
    S(k.slabOf(CARRIAGE, 5.6, 4.4, P, 4, 0.5), {
      tone: "hi",
      crease: "lo",
      inner: L(k.sideSeam(CARRIAGE, 7.8, P, 4), { tone: "faint" }),
    }),
    D(k.corners(CARRIAGE, 2.2).map(([x, y]) => at([x, y, 10.0])), { size: 0.45, tone: "mid" }),
    // Vertical collimator mast using G.disc so inner seam arcs meet the outline exactly
    S(G.disc(10.0, BEACON_Z - 4.4, 2.2, MF, P), {
      tone: "mid",
      crease: "none",
      inner: L([16, 23].map((z) => G.arcOf(MF, z, 2.2, P, { least: 0 })).join(""), { tone: "faint" }),
    }),
    // Collimator housing pointing at FELIS-09's stereo cameras (-X): rear barrel + front lens hood
    S(G.disc(-7.5, -2.0, 4.4, BF, P), {
      tone: "mid",
      crease: "lo",
      inner: L(G.arcOf(BF, -4.75, 4.4, P), { tone: "faint" }),
    }),
    S(G.disc(-2.0, 0, 5.8, BF, P), {
      tone: "hi",
      crease: "lo",
      lit: true,
    }),
    L(G.circleOf(BF, 0, 3.8, P, 28), { tone: "lit" }),
    D([at([BEACON_X, 0, BEACON_Z])], { size: 0.75, tone: "lit", pulse: true }),
  ].join("");

  put({
    name: "target.carriage",
    at: [89, 0, 5.6],
    part: "target",
    svg: carSvg,
    shapes: [
      A.slab(CARRIAGE, 5.6, 4.4, { name: "target.carriage.block" }, 4),
      A.disc(MF, 10.0, BEACON_Z - 4.4, 2.2, { name: "target.carriage.mast" }),
      A.disc(BF, -7.5, -2.0, 4.4, { name: "target.carriage.barrel" }),
      A.disc(BF, -2.0, 0, 5.8, { name: "target.carriage.hood" }),
    ],
  });
}

// ─────────────── 5. FELIS-09 Quadruped Robot (Legs, Torso, Head, Tail) ───────────────
function buildLegs() {
  for (const pad of M.PADS) {
    const { id, x, y, side } = pad;
    const owner = `leg.${id}`;

    // 1. Compliant paw & ankle clevis sitting flush on force pad at z = 4.5
    const pawPlan = { x: x - 4.8, y: y - 4.4, w: 11.4, d: 8.8, r: 2.2 };
    const anklePlan = { x: x - 3.2, y: y - 3.0, w: 6.4, d: 6.0, r: 1.2 };
    const pawSvg = [
      S(k.slabOf(pawPlan, 4.5, 3.5, P, 4, 0.5), {
        tone: "hi",
        crease: "lo",
        inner: L(k.sideSeam(pawPlan, 5.8, P, 4), { tone: "faint" }),
      }),
      D(
        [
          [pawPlan.x + 2.2, y - 2.2],
          [pawPlan.x + 2.2, y + 2.2],
          [pawPlan.x + pawPlan.w - 2.2, y - 2.2],
          [pawPlan.x + pawPlan.w - 2.2, y + 2.2],
        ].map(([px, py]) => at([px, py, 8.0])),
        { size: 0.42, tone: "mid" },
      ),
      S(k.slabOf(anklePlan, 8.0, 4.0, P, 3, 0.4), { tone: "mid" }),
      D([at([x, y + side * 3.0, 10.0])], { size: 0.5, tone: "hi" }),
    ].join("");

    put({
      name: `cat.${id}.paw`,
      at: [x, y, 4.5],
      svg: pawSvg,
      shapes: [
        A.slab(pawPlan, 4.5, 3.5, { name: `cat.${id}.paw`, owner }, 4),
        A.slab(anklePlan, 8.0, 4.0, { name: `cat.${id}.ankle`, owner }, 3),
      ],
    });

    // 2. Lower leg (Tibia) from z = 12.0 to z = 24.0
    const tibiaPlan = { x: x - 2.5, y: y - 2.2, w: 5.0, d: 4.4, r: 1.0 };
    const tibiaSvg = S(k.slabOf(tibiaPlan, 12.0, 12.0, P, 3, 0.35), {
      tone: "hi",
      crease: "lo",
      inner: L(k.sideSeam(tibiaPlan, 15.0, P, 3) + k.sideSeam(tibiaPlan, 21.0, P, 3), { tone: "faint" }),
    });

    put({
      name: `cat.${id}.tibia`,
      at: [x, y, 18.0],
      legStage: "tibia",
      svg: tibiaSvg,
      shapes: [A.slab(tibiaPlan, 12.0, 12.0, { name: `cat.${id}.tibia`, owner }, 3)],
    });

    // 3a. Knee Joint Housing Block (z = 24.0..30.0)
    const kneePlan = { x: x - 3.8, y: y - 3.0, w: 7.6, d: 6.0, r: 1.4 };
    put({
      name: `cat.${id}.knee.box`,
      at: [x, y, 27.0],
      legStage: "knee",
      svg: S(k.slabOf(kneePlan, 24.0, 6.0, P, 3, 0.4), { tone: "mid" }),
      shapes: [A.slab(kneePlan, 24.0, 6.0, { name: `cat.${id}.knee.box`, owner }, 3)],
    });

    // 3b. Outboard Knee Harmonic Drive Drum along Y axis (separate item so it sorts cleanly!)
    const KF = frameOf([x, y + side * 3.0, 27.0], [0, side, 0], [0, 0, 1]);
    const kneeDrumProf = [
      [0, 4.6],
      [3.4, 4.6],
      [3.4, 3.6],
      [4.2, 3.6],
    ];
    const kneeDrumSvg = [
      S(G.solidOf(kneeDrumProf, KF, P), { tone: "hi", crease: "lo" }),
      Faded(G.ribsOf(KF, 0.4, 3.0, 4.6, 20, P, { fade: [0.08, 0.5], seams: true }), { tone: "lo" }),
      D(G.dotsOf(KF, 4.2, 2.4, 6, P, { fade: [0.06, 0.45] }), { size: 0.4, tone: "mid" }),
    ].join("");

    put({
      name: `cat.${id}.knee.drum`,
      at: [x, y + side * 5.0, 27.0],
      legStage: "knee",
      svg: kneeDrumSvg,
      shapes: [A.solid(KF, kneeDrumProf, { name: `cat.${id}.knee.drum`, owner })],
    });

    // 4. Upper leg (Femur) from z = 30.0 to z = 41.5
    const femurPlan = { x: x - 3.2, y: y - 2.4, w: 6.4, d: 4.8, r: 1.2 };
    const femurSvg = S(k.slabOf(femurPlan, 30.0, 11.5, P, 3, 0.4), {
      tone: "hi",
      crease: "lo",
      inner: L(k.sideSeam(femurPlan, 33.0, P, 3) + k.sideSeam(femurPlan, 38.5, P, 3), { tone: "faint" }),
    });

    put({
      name: `cat.${id}.femur`,
      at: [x, y, 35.8],
      legStage: "femur",
      svg: femurSvg,
      shapes: [A.slab(femurPlan, 30.0, 11.5, { name: `cat.${id}.femur`, owner }, 3)],
    });

    // 5a. Hip Carrier Housing (z = 41.5..51.5) + Inboard Stator Bridge
    const hipPlan = { x: x - 5.2, y: y - 3.0, w: 10.4, d: 6.0, r: 1.6 };
    const SF = frameOf([x, side * 13.0, 46.5], [0, side, 0], [0, 0, 1]);
    const hipBoxSvg = [
      S(G.disc(0, 6.0, 4.8, SF, P), { tone: "lo" }),
      S(k.slabOf(hipPlan, 41.5, 10.0, P, 4, 0.5), { tone: "mid" }),
    ].join("");

    put({
      name: `cat.${id}.hip.box`,
      at: [x, y, 46.5],
      part: "torso",
      svg: hipBoxSvg,
      shapes: [
        A.disc(SF, 0, 6.0, 4.8, { name: `cat.${id}.hip.stator`, owner }),
        A.slab(hipPlan, 41.5, 10.0, { name: `cat.${id}.hip.box`, owner }, 4),
      ],
    });

    // 5b. Outboard Hip QDD Harmonic Actuator Drum (separate item)
    const HF = frameOf([x, y + side * 3.0, 46.5], [0, side, 0], [0, 0, 1]);
    const hipDrumProf = [
      [0, 7.2],
      [4.2, 7.2],
      [4.2, 5.8],
      [5.4, 5.8],
    ];
    const hipDrumSvg = [
      S(G.solidOf(hipDrumProf, HF, P), {
        tone: "hi",
        crease: "lo",
        inner: L(G.arcOf(HF, 2.1, 7.2, P), { tone: "faint" }),
      }),
      Faded(G.ribsOf(HF, 0.5, 3.7, 7.2, 28, P, { fade: [0.08, 0.5], seams: true }), { tone: "lo" }),
      D(G.dotsOf(HF, 5.4, 4.2, 8, P, { fade: [0.06, 0.45] }), { size: 0.45, tone: "mid" }),
    ].join("");

    put({
      name: `cat.${id}.hip.drum`,
      at: [x, y + side * 5.7, 46.5],
      part: "torso",
      svg: hipDrumSvg,
      shapes: [A.solid(HF, hipDrumProf, { name: `cat.${id}.hip.drum`, owner })],
    });
  }
}

export const SPINE_SPRING = { x0: -26, x1: 16, y: 0, z: 52.5, r: 3.4, turns: 8 };

function buildTorso() {
  const owner = "cat.torso";

  // 1. Rear Pelvis Block (x: -54..-26, y: -13..13, z: 40.0..54.5)
  const pelvisPlan = { x: -54, y: -13, w: 28, d: 26, r: 3.0 };
  const pelvisScrews = k.corners(pelvisPlan, 3.2);
  const pelvisSvg = [
    S(k.slabOf(pelvisPlan, 40.0, 14.5, P, 5, 0.8), {
      tone: "hi",
      crease: "lo",
      inner: L(k.sideSeam(pelvisPlan, 44.5, P, 5) + k.sideSeam(pelvisPlan, 50.5, P, 5), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(pelvisPlan, 2.8), 54.5, P, 4), { tone: "faint" }),
    D(pelvisScrews.map(([x, y]) => at([x, y, 54.5])), { size: 0.48, tone: "mid" }),
  ].join("");

  put({
    name: "cat.pelvis",
    at: [-40, 0, 47.2],
    part: "torso",
    svg: pelvisSvg,
    shapes: [A.slab(pelvisPlan, 40.0, 14.5, { name: "cat.pelvis", owner }, 5)],
  });

  // 2. Central Spinal Core Beam (x: -26..16, y: -7.5..7.5, z: 41.5..50.0)
  // + 2 Side LiPo Battery Pods (y: -14.5..-7.5 and y: 7.5..14.5, z: 40.5..50.5)
  const spineCore = { x: -26, y: -7.5, w: 42, d: 15, r: 1.5 };
  const spineRodPlan = { x: -26, y: -2.0, w: 42, d: 4.0, r: 1.2 };
  const coil = k.coil(SPINE_SPRING.x0 + 2, SPINE_SPRING.x1 - 2, [SPINE_SPRING.y, SPINE_SPRING.z], SPINE_SPRING.r, SPINE_SPRING.turns, "x", P);

  const spineSvg = [
    S(k.slabOf(spineCore, 41.5, 8.5, P, 3, 0.4), { tone: "mid" }),
    `<path data-part="spine-coil-back" class="iso-line" data-tone="lo" data-free="both" d="${coil.back}"/>`,
    S(k.slabOf(spineRodPlan, 50.0, 4.2, P, 3, 0.35), { tone: "hi", crease: "lo" }),
    `<path data-part="spine-coil-front" class="iso-line" data-tone="mid" data-free="both" d="${coil.front}"/>`,
  ].join("");

  put({
    name: "cat.spine",
    at: [-5, 0, 46.5],
    part: "torso",
    svg: spineSvg,
    shapes: [
      A.slab(spineCore, 41.5, 8.5, { name: "cat.spine.core", owner }, 3),
      A.slab(spineRodPlan, 50.0, 4.2, { name: "cat.spine.rod", owner }, 3),
    ],
  });

  for (const [tag, y0] of [
    ["L", -14.5],
    ["R", 7.5],
  ]) {
    const podPlan = { x: -23, y: y0, w: 36, d: 7.0, r: 1.8 };
    const podSvg = [
      S(k.slabOf(podPlan, 40.5, 10.5, P, 4, 0.5), {
        tone: "mid",
        inner: L(k.sideSeam(podPlan, 44.0, P, 4) + k.sideSeam(podPlan, 47.5, P, 4), { tone: "faint" }),
      }),
      L(k.planOutline(k.insetPlan(podPlan, 1.4), 51.0, P, 3), { tone: "faint" }),
      D(
        [
          [podPlan.x + 3, y0 + 3.5],
          [podPlan.x + podPlan.w - 3, y0 + 3.5],
        ].map(([px, py]) => at([px, py, 51.0])),
        { size: 0.42, tone: "lo" },
      ),
    ].join("");
    put({
      name: `cat.battery.${tag}`,
      at: [-5, y0 + 3.5, 45.8],
      part: "torso",
      svg: podSvg,
      shapes: [A.slab(podPlan, 40.5, 10.5, { name: `cat.battery.${tag}`, owner }, 4)],
    });
  }

  // 3. Front Thorax & Compute Cage (x: 16..52, y: -13..13, z: 39.5..55.5)
  // + Dorsal IMU / LiDAR Turret at [29, 0, 55.5..59.5]
  const thoraxPlan = { x: 16, y: -13, w: 36, d: 26, r: 3.2 };
  const thoraxScrews = k.corners(thoraxPlan, 3.2);
  const IF = VERT(29, 0, 55.5);
  const imuProf = [
    [0, 6.4],
    [1.6, 6.4],
    [1.6, 5.2],
    [3.8, 5.2],
  ];
  const thoraxSvg = [
    S(k.slabOf(thoraxPlan, 39.5, 16.0, P, 5, 0.9), {
      tone: "hi",
      crease: "lo",
      inner: L(k.sideSeam(thoraxPlan, 44.5, P, 5) + k.sideSeam(thoraxPlan, 50.5, P, 5), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(thoraxPlan, 2.8), 55.5, P, 4), { tone: "faint" }),
    D(thoraxScrews.map(([x, y]) => at([x, y, 55.5])), { size: 0.48, tone: "mid" }),
    k.faceTextSvg(k.topMatrix([29, 9.2], 55.5, P, "x"), "FELIS-09", { size: 2.2, tone: "lo", anchor: "middle" }),
    // IMU turret
    S(G.solidOf(imuProf, IF, P), { tone: "mid", inner: L(G.arcOf(IF, 2.6, 5.2, P, { least: 0 }), { tone: "faint" }) }),
    D(G.dotsOf(IF, 3.8, 3.6, 6, P, { all: true, phase: 0.4 }), { size: 0.42, tone: "hi" }),
    // Cervical neck gimbal collar at [45, 0, 55.5..59.5]
    S(k.cylinder(45, 0, 5.8, 55.5, 4.0, P, 28, 0.4), { tone: "mid" }),
    L(k.knurl(45, 0, 5.8, 56.0, 59.0, 24, P), { tone: "lo" }),
  ].join("");

  put({
    name: "cat.thorax",
    at: [34, 0, 48.0],
    part: "torso",
    svg: thoraxSvg,
    shapes: [
      A.slab(thoraxPlan, 39.5, 16.0, { name: "cat.thorax", owner }, 5),
      A.solid(IF, imuProf, { name: "cat.imu", owner }),
      A.cylinder(45, 0, 5.8, 55.5, 4.0, { name: "cat.neck", owner }),
    ],
  });
}

function buildHead() {
  const owner = "cat.head";
  const craniumPlan = { x: 38, y: -11.5, w: 22, d: 23, r: 3.2 };
  const muzzlePlan = { x: 60, y: -6.5, w: 7.5, d: 13, r: 1.8 };

  // Dual forward-facing stereo optical camera barrels at x = 60, y = ±5.8, z = 68.4
  const eyeBarrels = [-5.8, 5.8].map((ey, idx) => {
    const EF = frameOf([60, ey, 68.4], [1, 0, 0], [0, 0, 1]);
    const prof = [
      [0, 2.7],
      [2.8, 2.7],
      [2.8, 2.2],
      [3.6, 2.2],
    ];
    const pCenter = at([63.65, ey, 68.4]);
    return {
      shape: A.solid(EF, prof, { name: `cat.eye.${idx ? "R" : "L"}`, owner }),
      svg: [
        S(G.solidOf(prof, EF, P), { tone: "hi", crease: "lo", lit: true }),
        L(G.circleOf(EF, 3.6, 1.8, P, 24), { tone: "lit" }),
        `<circle class="rc-pupil" data-part="pupil" cx="${pCenter[0].toFixed(2)}" cy="${pCenter[1].toFixed(2)}" r="1.45"/>`,
      ].join(""),
    };
  });

  // 6 tactile whisker probes with terminal dots at both ends (zero floating ends!)
  const whiskerRoutes = [
    [
      [64.5, -6.5, 64.2],
      [69.5, -18.5, 65.8],
    ],
    [
      [65.5, -6.5, 62.6],
      [71.0, -19.5, 62.4],
    ],
    [
      [64.5, -6.5, 61.0],
      [68.5, -17.5, 59.0],
    ],
    [
      [64.5, 6.5, 64.2],
      [69.5, 18.5, 65.8],
    ],
    [
      [65.5, 6.5, 62.6],
      [71.0, 19.5, 62.4],
    ],
    [
      [64.5, 6.5, 61.0],
      [68.5, 17.5, 59.0],
    ],
  ];
  const whiskers = whiskerRoutes.map(([a, b]) => k.wireSvg(at(a), at(b), { tone: "lo", ends: "both", size: 0.7 })).join("");
  const whiskerShapes = whiskerRoutes.map((pts, i) => A.tube(pts, 0.35, { name: `cat.whisker.${i}`, owner }));

  const headSvg = [
    S(k.slabOf(craniumPlan, 59.5, 12.2, P, 5, 0.8), {
      tone: "hi",
      crease: "lo",
      inner: L(k.sideSeam(craniumPlan, 65.0, P, 5), { tone: "faint" }),
    }),
    L(k.planOutline(k.insetPlan(craniumPlan, 2.4), 71.7, P, 4), { tone: "faint" }),
    D(k.corners(craniumPlan, 2.8).map(([x, y]) => at([x, y, 71.7])), { size: 0.45, tone: "mid" }),
    // Muzzle / LiDAR snout
    S(k.slabOf(muzzlePlan, 59.8, 6.2, P, 3, 0.5), {
      tone: "mid",
      inner: L(k.sideSeam(muzzlePlan, 62.8, P, 3), { tone: "faint" }),
    }),
    S(k.cylinder(65.5, 0, 1.8, 66.0, 1.2, P, 18, 0.2), { tone: "hi" }),
    eyeBarrels[0].svg,
    eyeBarrels[1].svg,
    whiskers,
  ].join("");

  put({
    name: "cat.head",
    at: [51, 0, 65.5],
    part: "head",
    svg: headSvg,
    shapes: [
      A.slab(craniumPlan, 59.5, 12.2, { name: "cat.head.cranium", owner }, 5),
      A.slab(muzzlePlan, 59.8, 6.2, { name: "cat.head.muzzle", owner }, 3),
      A.cylinder(65.5, 0, 1.8, 66.0, 1.2, { name: "cat.head.nose", owner }),
      eyeBarrels[0].shape,
      eyeBarrels[1].shape,
      ...whiskerShapes,
    ],
  });

  // Left & Right Articulated Acoustic Pinnae (Ears) sitting flush on z = 71.7
  for (const [tag, ey, partName] of [
    ["L", -7.2, "ear-l"],
    ["R", 7.2, "ear-r"],
  ]) {
    const earPlan = { x: 41.5, y: ey - 2.6, w: 6.0, d: 5.2, r: 1.2 };
    const earSvg = [
      S(k.cylinder(44.5, ey, 3.4, 71.7, 1.5, P, 20), { tone: "mid" }),
      S(k.slabOf(earPlan, 73.2, 10.5, P, 3, 0.45), {
        tone: "hi",
        crease: "lo",
        inner: L(k.sideSeam(earPlan, 78.4, P, 3), { tone: "faint" }),
      }),
      D([at([44.5, ey, 83.7])], { size: 0.45, tone: "mid" }),
    ].join("");

    put({
      name: `cat.ear.${tag}`,
      at: [44.5, ey, 77.5],
      part: partName,
      svg: earSvg,
      shapes: [
        A.cylinder(44.5, ey, 3.4, 71.7, 1.5, { name: `cat.ear.${tag}.base`, owner }),
        A.slab(earPlan, 73.2, 10.5, { name: `cat.ear.${tag}.blade`, owner }, 3),
      ],
    });
  }
}

// 5-Segment Articulated Counterbalance Tail along a true 3D curve (rim-on-sphere joints!)
function buildTail() {
  const owner = "cat.tail";
  // Root gimbal boss on rear face of pelvis (x = -54..-56.5)
  const RF = frameOf([-54, 0, 48.5], [-1, 0, 0], [0, 0, 1]);
  put({
    name: "cat.tail.root",
    at: [-55.2, 0, 48.5],
    part: "torso",
    svg: S(G.disc(0, 2.5, 4.4, RF, P), { tone: "mid" }),
    shapes: [A.disc(RF, 0, 2.5, 4.4, { name: "cat.tail.root", owner })],
  });

  const nodes = [
    [-59.8, 0, 48.5],
    [-69.5, 0, 51.0],
    [-78.0, 0, 56.0],
    [-85.0, 0, 63.0],
    [-90.2, 0, 71.2],
    [-93.5, 0, 80.2],
  ];
  const ballR = [3.4, 3.1, 2.8, 2.5, 2.3];
  const segR = [2.6, 2.35, 2.1, 1.9, 1.75];

  for (let i = 0; i < 5; i++) {
    const p0 = nodes[i];
    const p1 = nodes[i + 1];
    const diff = G.sub3(p1, p0);
    const len = G.len3(diff);
    const F = frameOf(p0, diff, [0, 1, 0]);
    const R0 = ballR[i];
    const r = segR[i];
    // Tangent contact at s0 = R0 and s1 = len - R1 so sphere and cylinder are 100% disjoint!
    const s0 = R0;
    const isLast = i === 4;
    const R1 = isLast ? 0 : ballR[i + 1];
    const s1 = isLast ? len : len - R1;

    // Joint ball at p0
    put({
      name: `cat.tail.joint.${i}`,
      at: p0,
      tailIdx: i,
      svg: S(G.sphereOf(p0, R0, P, { steps: 28 }), { tone: "mid" }),
      shapes: [A.ball(p0, R0, { name: `cat.tail.joint.${i}`, owner })],
    });

    const prof = [
      [s0, r],
      [s1, r],
    ];

    const segSvg = [
      S(G.solidOf(prof, F, P), {
        tone: "hi",
        crease: "lo",
        inner: L(G.arcOf(F, (s0 + s1) * 0.5, r, P), { tone: "faint" }),
      }),
      isLast ? D([at(p1)], { size: 0.75, tone: "lit" }) : "",
    ].join("");

    put({
      name: `cat.tail.seg.${i}`,
      at: G.lerp3(p0, p1, 0.5),
      tailIdx: i,
      svg: segSvg,
      shapes: [A.solid(F, prof, { name: `cat.tail.seg.${i}`, owner })],
    });
  }
}

buildBench();
buildForcePads();
buildGauge();
buildConsole();
buildCables();
buildTargetRail();
buildLegs();
buildTorso();
buildHead();
buildTail();

A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);

if (argv.includes("--audit")) {
  A.auditOrExit(R, P);
}

// Optical tracking sight line between stereo ocular array and target beacon
const sightStart = at([63.6, 0, 68.4]);
const sightEnd = at([BEACON_X, 0, BEACON_Z]);
const sightInitial = k.wireSvg(sightStart, sightEnd, {
  tone: "lit",
  dashed: true,
  ends: "both",
  size: 0.85,
});

const groups = R.items.map((item) => `<g class="it" data-name="${item.name}"${item.attrs ?? ""}>${item.svg}</g>`);
const bodySvg = [
  `<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`,
  ...groups,
  `<path data-part="gauge-needle" class="iso-line" data-tone="lit" data-free="both" d="${gaugeNeedle(6.8)}" style="stroke-width:1.1px"/>`,
  `<g data-part="sight-beam">${sightInitial}</g>`,
];

const LABEL =
  "FELIS-09 quadruped robotic cat on a four-cell force-plate and optical target test bench. A sliding collimator beacon on the front rail steers the cat's gimbaled stereo camera head, while its five-segment counterbalance tail sweeps the opposite way and its harmonic-drive leg joints flex on four load cells. A dial torque gauge and a four-channel console display ground reaction forces and joint torque.";

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: bodySvg });
const stage = `<div class="iso-stage rc-stage" tabindex="0" role="slider" aria-label="FELIS-09 Robotic Cat on compliance test bench: move pointer or press Left and Right arrows to slide the optical target carriage, Up and Down arrows to adjust posture crouch and pitch, Space to trigger a dynamic pounce impulse, keys 1 to 4 for test presets" aria-valuemin="-26" aria-valuemax="26" aria-valuenow="0" aria-valuetext="idle scan · yaw +0.0° · crouch 0 mm · torque 6.8 N·m">${svg}<span class="rc-sr" role="status" aria-live="polite" data-status></span></div>`;

const DATA = {
  P,
  gauge: { at: GAUGE, r: GAUGE_R, z: GAUGE_Z, span: GAUGE_SPAN, sweep: GAUGE_SWEEP },
  bar: BAR,
  conZ1: CON_Z1,
  beacon: [BEACON_X, 0, BEACON_Z],
  eyes: [63.6, 0, 68.4],
  spine: SPINE_SPRING,
};

const modelSrc = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const FUNCS = `const gaugeNeedle = ${gaugeNeedle.toString()};\nconst barPath = ${barPath.toString()};\nconst D2R = Math.PI / 180;\nconst GAUGE = DATA.gauge.at, GAUGE_R = DATA.gauge.r, GAUGE_Z = DATA.gauge.z, GAUGE_SPAN = DATA.gauge.span, GAUGE_SWEEP = DATA.gauge.sweep;\nconst BAR = DATA.bar, CON_Z1 = DATA.conZ1, SPINE_SPRING = DATA.spine;\nconst k = { lineOnTop, onTop, translateAlong, coil, wireSvg, iso };\n`;
const CSS = readFileSync(join(HERE, "robotic-cat.css"), "utf8");
const LIVE = `const DATA = ${JSON.stringify(DATA)};\nconst P = DATA.P;\n${modelSrc}\n${FUNCS}\n${readFileSync(join(HERE, "live.js"), "utf8")}`;

const init = M.computeState({});
const plate = k.plateHtml({
  fig: "Fig 1",
  title: "FELIS-09 Robotic Cat · Balance Rig",
  hint: "Hover or ←/→ target · ↑/↓ crouch · Space pounce",
  readout: `yaw +0.0° · crouch 0 mm · ${init.kneeTorqueNm.toFixed(1)} N·m · IDLE`,
  keys: [
    { mark: "lit", label: "Optical lock: front collimator beacon, stereo ocular array, and peak knee torque" },
    { mark: "raised", label: "80:1 harmonic-drive actuators, dorsal suspension coil, and 5-link counterbalance tail" },
    { mark: "dim", label: "Four strain-gauge load pads (FL, FR, RL, RR) feeding the bench telemetry console" },
  ],
  caption: `A ${M.MASS_KG} kg quadruped robot (${M.WEIGHT_N.toFixed(1)} N static weight, ~${(M.WEIGHT_N / 4).toFixed(1)} N per foot at rest) standing on four strain-gauge load cells. Moving the optical collimator along the front rail commands up to ±${M.MAX_YAW_DEG}° of cervical gaze yaw; the five-segment ${M.TAIL_MASS_KG} kg tail sweeps in opposition to cancel lateral center-of-mass drift. Crouching or pressing Space compresses the dorsal suspension up to ${M.MAX_CROUCH_MM} mm across the 80:1 harmonic-drive knee actuators, driving peak joint torque on the dial indicator and shifting ground reaction forces across the four console bar meters.`,
  body: `<style>${CSS}</style>${stage}`,
});

const page = k.pageHtml({
  title: "FELIS-09 Cybernetic Feline // Anatomy Figure",
  theme,
  body: plate,
  script: kitScript() + LIVE,
  width: 740,
});

const outName = theme === "light" ? "robotic-cat-light.html" : "robotic-cat.html";
writeFileSync(join(HERE, outName), page);
// Also update the gallery path in ../flamelicker/ so existing links point to the improved build
writeFileSync(join(HERE, "..", "flamelicker", outName), page);
console.log(`wrote ${outName} · ${(page.length / 1024).toFixed(0)} KB · ${R.items.length} items`);
