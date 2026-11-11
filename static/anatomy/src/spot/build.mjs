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

const WIDTH = 700;
const HEIGHT = 500;
const AZIMUTH = 45;
const ELEVATION = 30;

// ── World plan (1 unit = 10 mm, see model.mjs) ─────────────────────────────
// Robot build pose = default walk: body-height reference 61 (610 mm),
// belly 50, deck top 72.5, hip pivots 67. Chassis 76 long x 28 face-wide;
// hip covers reach the full 50 total width. Spot Arm on the front deck port,
// raised working pose, gripper forward over the front face.
const REF_Z = 61;
const BELLY_Z = 50;
const DECK_Z = 72.5;
const DECK_TOP = DECK_Z + 1.2; // deck plate top, 73.7

// Bench layout (v3, tightened): the plate shrank and the furniture moved
// in, so the robot, the 300 mm step and the depth target read as one
// station — robot centre, step 165 mm ahead of its face, target just past
// the step on its rail, console close behind the rear-left hip.
const PLATE = { x: -92, y: -56, w: 192, d: 116, r: 9 };
const PLATE_H = 10;
const FOOT_H = 5;

const CONSOLE = { x: -90, y: 26, w: 40, d: 30, r: 4 };
const CON_H = 15;
const SCREEN = { x: -87, y: 29.5, w: 23, d: 23, r: 1.5 };
const DIAL = [-61, 41];
const DIAL_R = 8.5;
const DIAL_Z = CON_H;
const DIAL_H = 3.6;
const DIAL_TOP = DIAL_Z + DIAL_H;

const JUNCTION = { x: -2, y: 38, w: 13, d: 11, r: 1.8 };
const JUN_H = 5;

const STEP = { x: 56, y: -30, w: 28, d: 30, r: 2 };
const STEP_H = 30; // 300 mm: Spot's max step height (BD), at scale
const TREAD = { x: 58, y: -28, w: 24, d: 26, r: 1.5 };

const RAIL_BED = { x: 88, y: -6, w: 10, d: 44, r: 2 };
const RAIL_BAR = { x: 90.5, y: 0, w: 6, d: 32, r: 1 };
const CARRIAGE = { x: 89, y: 8, w: 9, d: 13, r: 1.8 };
const TARGET = [82.4, 14.5, 35]; // depth-target lens point

const BODY = { x: -38, y: -14.3, w: 76, d: 28.6, r: 5 }; // upper shell
const BODY_LO = { x: -37, y: -13.5, w: 74, d: 27, r: 5 }; // lower shell

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [CONSOLE.x, CONSOLE.y + CONSOLE.d, DIAL_TOP + 2],
    [TARGET[0] - 4, TARGET[1], TARGET[2] + 7],
    [104, 0, 101], // gripper tip
    [40, 0, 118], // elbow top
    [STEP.x + STEP.w, 0, STEP_H + 3],
  ],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: AZIMUTH, elevation: ELEVATION },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const VERT = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const frameOf = (o, a, u) => {
  const axis = G.unit3(a);
  const uu = u ? G.unit3(G.sub3(u, G.mul3(axis, G.dot3(u, axis)))) : G.frameAlong(o, axis).u;
  return { o, a: axis, u: uu, v: G.cross3(axis, uu) };
};
// Cartesian point in a frame: o + a*s + u*x + v*y. (G.pointOf is POLAR —
// s along the axis, r radial, angle around — do not pass it x/y coords.)
const framePt = (F, s, x, y) => [
  F.o[0] + F.a[0] * s + F.u[0] * x + F.v[0] * y,
  F.o[1] + F.a[1] * s + F.u[1] * x + F.v[1] * y,
  F.o[2] + F.a[2] * s + F.u[2] * x + F.v[2] * y,
];
// Rounded-rectangle polygon in (u, v) coords, centred on the origin.
const roundedRect = (hw, hh, r, seg = 3) => {
  const pts = [];
  const corners = [
    [hw - r, hh - r, 0],
    [-hw + r, hh - r, Math.PI / 2],
    [-hw + r, -hh + r, Math.PI],
    [hw - r, -hh + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return pts;
};

export const R = A.recorder(P);
function put({ name, at: ref, bias = 0, attrs = "", svg, shapes }) {
  const recorded = shapes.map((shape, i) => R.solid(Object.assign(shape, { name: shape.name ?? (i ? `${name}#${i + 1}` : name) })));
  return R.put({ name, at: ref, bias, attrs, svg, shapes: recorded });
}

// ─────────────────────── 1. Gait bench: plate, feet, ruler, label ─────────
function buildBench() {
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    put({
      name: `stand.foot.${x}.${y}`,
      at: [x, y, -PLATE_H - FOOT_H],
      svg:
        S(k.cylinder(x, y, 8, -PLATE_H - FOOT_H, 1.8, P, 28), { tone: "lo" }) +
        S(k.cylinder(x, y, 6.2, -PLATE_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: "mid" }),
      shapes: [
        A.cylinder(x, y, 8, -PLATE_H - FOOT_H, 1.8, { ground: true }),
        A.cylinder(x, y, 6.2, -PLATE_H - FOOT_H + 1.8, FOOT_H - 1.8),
      ],
    });
  }

  const screws = k.corners(PLATE, 9);
  put({
    name: "stand.base",
    at: [0, 0, -PLATE_H],
    svg: [
      S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 9, 1.6), {
        tone: "lo",
        inner: L(k.sideSeam(PLATE, -PLATE_H + 4, P, 9), { tone: "faint" }),
      }),
      L(k.planOutline(k.insetPlan(PLATE, 5), 0, P, 9), { tone: "faint" }),
      L(screws.map(([x, y]) => k.ring(x, y, 2.3, 0, P, 16)).join(""), { tone: "lo" }),
      D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }),
    ].join(""),
    shapes: [A.slab(PLATE, -PLATE_H, PLATE_H, { ground: true })],
  });

  const strip = { x: -40, y: PLATE.y + PLATE.d - 8, w: 118, d: 6, r: 1 };
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.15, 0.6, [1.8, 6.6], P);
  put({
    name: "stand.ruler",
    at: [strip.x + strip.w / 2, strip.y + 3, 0],
    svg: [
      S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }),
      L(ticks.minor, { tone: "lo" }),
      L(ticks.major, { tone: "mid" }),
      D([at([strip.x + 2, strip.y + 3.2, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.2, 0.6])], { size: 0.45 }),
    ].join(""),
    shapes: [A.slab(strip, 0, 0.6)],
  });

  const badge = { x: 28, y: 40, w: 48, d: 10, r: 1.5 };
  put({
    name: "stand.label",
    at: [badge.x + badge.w / 2, badge.y + badge.d / 2, 0],
    svg: [
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
    ].join(""),
    shapes: [A.slab(badge, 0, 0.7)],
  });
}

// ─────────────────────── 2. Four force plates + junction box ──────────────
function buildForcePlates() {
  for (const leg of M.LEGS) {
    const cx = leg.hipX;
    const cy = leg.side * leg.footY;
    const F = VERT(cx, cy, 0);
    put({
      name: `stand.pad.${leg.id}`,
      at: [cx, cy, 0],
      bias: 0.4,
      svg: [
        S(G.disc(0, 1.5, 10.5, F, P), { tone: "lo" }),
        D(G.dotsOf(F, 1.5, 8.8, 6, P, { all: true, phase: 0.3 }), { size: 0.42, tone: "mid" }),
        S(G.disc(1.5, 3.2, 8.2, F, P), {
          tone: "mid",
          inner: L(G.arcOf(F, 2.4, 8.2, P, { least: 0 }), { tone: "faint" }),
        }),
        S(G.disc(3.2, M.PAD_TOP, 7.2, F, P), { tone: "lo" }),
        L(G.circleOf(F, M.PAD_TOP, 5.8, P, 36), { tone: "faint" }),
      ].join(""),
      shapes: [
        A.disc(F, 0, 1.5, 10.5, { name: `stand.pad.${leg.id}.base`, ground: true }),
        A.disc(F, 1.5, 3.2, 8.2, { name: `stand.pad.${leg.id}.cell` }),
        A.disc(F, 3.2, M.PAD_TOP, 7.2, { name: `stand.pad.${leg.id}.top` }),
      ],
    });
  }

  const junScrews = k.corners(JUNCTION, 2.2);
  put({
    name: "stand.junction",
    at: [JUNCTION.x + JUNCTION.w / 2, JUNCTION.y + JUNCTION.d / 2, 0],
    bias: 0.4,
    svg: [
      S(k.slabOf(JUNCTION, 0, JUN_H, P, 4, 0.5), {
        tone: "mid",
        inner: L(k.sideSeam(JUNCTION, 2.4, P, 4), { tone: "faint" }),
      }),
      L(k.planOutline(k.insetPlan(JUNCTION, 2), JUN_H, P, 3), { tone: "faint" }),
      D(junScrews.map(([x, y]) => at([x, y, JUN_H])), { size: 0.45, tone: "hi" }),
    ].join(""),
    shapes: [A.slab(JUNCTION, 0, JUN_H, { ground: true }, 4)],
  });

  const glandProf = [
    [0, 1.7],
    [1.3, 1.7],
    [1.3, 1.3],
    [2.5, 1.15],
  ];
  const GF1 = frameOf([JUNCTION.x, 43.5, 2.5], [-1, 0, 0], [0, 0, 1]);
  put({
    name: "stand.gland.junction",
    at: G.pointOf(GF1, 1.2, 0, 0),
    bias: 0.5,
    svg: S(G.solidOf(glandProf, GF1, P), { tone: "mid" }),
    shapes: [A.solid(GF1, glandProf, { owner: "cable.console" })],
  });
  const GF2 = frameOf([CONSOLE.x + CONSOLE.w, 43.5, 2.5], [1, 0, 0], [0, 0, 1]);
  put({
    name: "stand.gland.console",
    at: G.pointOf(GF2, 1.2, 0, 0),
    bias: 0.5,
    svg: S(G.solidOf(glandProf, GF2, P), { tone: "mid" }),
    shapes: [A.solid(GF2, glandProf, { owner: "cable.console" })],
  });
}

function buildCable() {
  const r = 0.9;
  const route = G.fillet(
    [
      [JUNCTION.x, 43.5, 2.5],
      [-16, 43.5, 2.5],
      [-27, 45.5, 1.8],
      [-38, 43.5, 2.5],
      [CONSOLE.x + CONSOLE.w, 43.5, 2.5],
    ],
    6,
    12,
    { P, tube: r },
  );
  const len = G.pathLength(route);
  const gaps = [
    [0, 2.5],
    [len - 2.5, len],
  ];
  tubePieces(route, r, P, { maxLength: 12, gaps, caps: [false, false] }).forEach((piece, i) => {
    put({
      name: `cable.console:${i}`,
      at: piece.mid,
      svg: tubeSvg(piece, { tone: "mid" }),
      shapes: [A.tube(piece.points, r, { owner: "cable.console" })],
    });
  });
  R.route("cable.console", route, r, {
    owner: "cable.console",
    gaps,
    limp: true,
    touch: ["stand.base", "stand.junction", "stand.gland.junction", "stand.gland.console", "stand.console.case"],
  });
}

// ─────────────────────── 3. Telemetry console: screen + gait dial ─────────
export const BAR = {
  x0: SCREEN.x + 7,
  len: SCREEN.w - 10,
  rows: [SCREEN.y + 4, SCREEN.y + 9.2, SCREEN.y + 14.4, SCREEN.y + 19.6],
  w: 2.2,
  max: 280,
};
export const barPath = (i, forceN) => {
  const f = Math.max(0.04, Math.min(1, forceN / BAR.max));
  const y = BAR.rows[i];
  return k.onTop(
    [
      [BAR.x0, y - BAR.w / 2],
      [BAR.x0 + BAR.len * f, y - BAR.w / 2],
      [BAR.x0 + BAR.len * f, y + BAR.w / 2],
      [BAR.x0, y + BAR.w / 2],
    ],
    CON_H + 0.45,
    P,
    true,
  );
};

function buildConsole() {
  const feet = byDepth(k.corners(CONSOLE, 5)).map(([x, y]) => S(k.cylinder(x, y, 2.4, 0, 1.2, P, 16), { tone: "lo" })).join("");
  put({
    name: "stand.console",
    at: [CONSOLE.x + CONSOLE.w / 2, CONSOLE.y + CONSOLE.d / 2, 0],
    svg: [
      feet,
      S(k.slabOf(CONSOLE, 1.2, CON_H - 1.2, P, 6, 0.9), {
        tone: "mid",
        inner: L(k.sideSeam(CONSOLE, 5.4, P, 6), { tone: "faint" }),
      }),
      L(k.planOutline(k.insetPlan(CONSOLE, 2.4), CON_H, P, 5), { tone: "faint" }),
      D(k.corners(CONSOLE, 4.2).map(([x, y]) => at([x, y, CON_H])), { size: 0.45, tone: "lo" }),
    ].join(""),
    shapes: [
      A.slab(CONSOLE, 1.2, CON_H - 1.2, { name: "stand.console.case" }, 6),
      ...k.corners(CONSOLE, 5).map(([x, y], i) => A.cylinder(x, y, 2.4, 0, 1.2, { name: `stand.console.foot.${i}`, ground: true })),
    ],
  });

  const init = M.computeState({ speed: 0, bodyHeight: 610, phase: 0 });
  const screenSvg = [
    S(k.slabOf(k.insetPlan(SCREEN, -1), CON_H, 0.35, P, 3), { tone: "lo", crease: "none" }),
    `<path class="sp-screen" d="${k.planOutline(SCREEN, CON_H + 0.37, P, 3)}"/>`,
    ...BAR.rows.map((y) => L(k.lineOnTop([BAR.x0, y], [BAR.x0 + BAR.len, y], CON_H + 0.38, P), { tone: "faint", free: true })),
    ...M.LEGS.map(
      (leg, i) =>
        k.faceTextSvg(k.topMatrix([SCREEN.x + 3.4, BAR.rows[i] + 0.7], CON_H + 0.39, P, "x"), leg.id, {
          size: 1.9,
          tone: "lo",
          anchor: "middle",
        }),
    ),
    M.LEGS.map((_, i) => `<path class="sp-bar" data-bar="${i}" d="${barPath(i, init.legs[i].force)}"/>`).join(""),
  ].join("");
  put({
    name: "stand.console.screen",
    at: [SCREEN.x + SCREEN.w / 2, SCREEN.y + SCREEN.d / 2, CON_H],
    bias: 0.6,
    svg: screenSvg,
    shapes: [A.slab(k.insetPlan(SCREEN, -1), CON_H, 0.35, { name: "stand.console.screen" }, 3)],
  });

  const [dx, dy] = DIAL;
  const F = VERT(dx, dy, DIAL_Z);
  const ticks = k.radialTicks(dx, dy, DIAL_R - 2.2, 24, 6, DIAL_TOP, [1.2, 2.6], P);
  put({
    name: "stand.console.dial",
    at: [dx, dy, DIAL_Z],
    bias: 0.6,
    svg: [
      S(G.disc(0, 1.2, DIAL_R + 1.8, F, P), { tone: "lo" }),
      S(G.disc(1.2, DIAL_H, DIAL_R, F, P), { tone: "hi", crease: "lo" }),
      L(G.circleOf(F, DIAL_H, DIAL_R - 1.5, P, 56), { tone: "lo" }),
      L(ticks.minor, { tone: "lo" }),
      L(ticks.major, { tone: "mid" }),
      L(G.circleOf(F, DIAL_H, 1.7, P, 20), { tone: "mid" }),
    ].join(""),
    shapes: [
      A.disc(F, 0, 1.2, DIAL_R + 1.8, { name: "stand.console.dial.base", owner: "stand.console.dial" }),
      A.disc(F, 1.2, DIAL_H, DIAL_R, { name: "stand.console.dial.puck", owner: "stand.console.dial" }),
    ],
  });

  const kx = -85;
  const ky = 52;
  put({
    name: "stand.console.knob",
    at: [kx, ky, CON_H],
    bias: 0.6,
    svg: [
      S(k.cylinder(kx, ky, 3.2, CON_H, 2.4, P, 24, 0.3), { tone: "hi", crease: "lo" }),
      L(k.lineOnTop([kx, ky], [kx + 2.6, ky], CON_H + 2.4, P), { tone: "hi", free: "start" }),
      D([at([kx, ky, CON_H + 2.4])], { size: 0.45, tone: "hi" }),
    ].join(""),
    shapes: [A.cylinder(kx, ky, 3.2, CON_H, 2.4)],
  });
}

export const gaugeNeedle = (phase) => {
  const a = Math.PI + phase * Math.PI * 2;
  const [x, y] = DIAL;
  const dir = [Math.sin(a), -Math.cos(a)];
  return k.lineOnTop(
    [x - dir[0] * 3, y - dir[1] * 3],
    [x + dir[0] * (DIAL_R - 3.4), y + dir[1] * (DIAL_R - 3.4)],
    DIAL_TOP + 0.2,
    P,
  );
};

// ─────────────────────── 4. Step block (300 mm), detailed ─────────────────
function buildStepBlock() {
  put({
    name: "stand.step.block",
    at: [STEP.x + STEP.w / 2, 0, 0],
    svg: S(k.slabOf(STEP, 0, STEP_H, P, 5, 0.9), {
      tone: "mid",
      inner: L(
        k.sideSeam(STEP, 9, P, 5) + k.sideSeam(STEP, 19, P, 5) + k.sideSeam(STEP, 26.5, P, 5),
        { tone: "faint" },
      ),
    }),
    shapes: [A.slab(STEP, 0, STEP_H, { ground: true }, 5)],
  });
  // Tread plate on top: panel outline, corner screws, and five tread
  // grooves running front-to-back, each ending on the tread's outline.
  const grooves = [61.5, 66, 70.5, 75, 79.5]
    .map((x) => k.lineOnTop([x, TREAD.y + 0.4], [x, TREAD.y + TREAD.d - 0.4], STEP_H + 1.55, P))
    .join("");
  put({
    name: "stand.step.tread",
    at: [TREAD.x + TREAD.w / 2, 0, STEP_H],
    bias: 0.3,
    svg: [
      S(k.slabOf(TREAD, STEP_H, 1.5, P, 4, 0.4), { tone: "hi", crease: "lo" }),
      L(k.planOutline(k.insetPlan(TREAD, 2), STEP_H + 1.5, P, 3), { tone: "faint" }),
      L(grooves, { tone: "lo" }),
      D(k.corners(TREAD, 3).map(([x, y]) => at([x, y, STEP_H + 1.5])), { size: 0.42, tone: "mid" }),
    ].join(""),
    shapes: [A.slab(TREAD, STEP_H, 1.5, {}, 4)],
  });
  const strip = { x: 61, y: -6, w: 18, d: 3.6, r: 1 };
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 3.5, 5, strip.y + 0.6, STEP_H + 2.1, [1.6, 3], P);
  put({
    name: "stand.step.ruler",
    at: [strip.x + strip.w / 2, strip.y + 2.5, STEP_H + 1.5],
    bias: 0.4,
    svg: [
      S(k.slabOf(strip, STEP_H + 1.5, 0.6, P, 3), { tone: "lo", crease: "none" }),
      L(ticks.minor, { tone: "lo" }),
      L(ticks.major, { tone: "mid" }),
    ].join(""),
    shapes: [A.slab(strip, STEP_H + 1.5, 0.6)],
  });
}

// ─────────────────────── 5. Depth target on its rail ───────────────────────
function buildTarget() {
  put({
    name: "stand.rail.bed",
    at: [RAIL_BED.x + RAIL_BED.w / 2, RAIL_BED.y + RAIL_BED.d / 2, 0],
    svg: [
      S(k.slabOf(RAIL_BED, 0, 3, P, 4, 0.6), {
        tone: "lo",
        inner: L(k.sideSeam(RAIL_BED, 1.5, P, 4), { tone: "faint" }),
      }),
      D(k.corners(RAIL_BED, 3).map(([x, y]) => at([x, y, 3])), { size: 0.45, tone: "mid" }),
    ].join(""),
    shapes: [A.slab(RAIL_BED, 0, 3, { ground: true }, 4)],
  });
  const ticks = k.topTicks(RAIL_BAR.y + 4, RAIL_BAR.y + RAIL_BAR.d - 4, 4, 5, RAIL_BAR.x + 0.6, 5.4, [1.5, 2.8], P, "y");
  put({
    name: "stand.rail.bar",
    at: [RAIL_BAR.x + RAIL_BAR.w / 2, RAIL_BAR.y + RAIL_BAR.d / 2, 3],
    svg: [
      S(k.slabOf(RAIL_BAR, 3, 2.4, P, 3, 0.35), { tone: "mid" }),
      L(ticks.minor, { tone: "lo" }),
      L(ticks.major, { tone: "mid" }),
    ].join(""),
    shapes: [A.slab(RAIL_BAR, 3, 2.4, {}, 3)],
  });
  for (const [tag, y0] of [
    ["a", -3.5],
    ["b", 33],
  ]) {
    const plan = { x: 89, y: y0, w: 9, d: 4, r: 1 };
    put({
      name: `stand.rail.stop.${tag}`,
      at: [93.5, y0 + 2, 3],
      svg: S(k.slabOf(plan, 3, 5.2, P, 3, 0.4), { tone: "mid" }) + D([at([93.5, y0 + 2, 8.2])], { size: 0.48, tone: "hi" }),
      shapes: [A.slab(plan, 3, 5.2, {}, 3)],
    });
  }

  put({
    name: "target.carriage",
    at: [93.5, 14.5, 5.4],
    attrs: ` data-part="target"`,
    svg: [
      S(k.slabOf(CARRIAGE, 5.4, 4.6, P, 4, 0.5), {
        tone: "hi",
        crease: "lo",
        inner: L(k.sideSeam(CARRIAGE, 7.7, P, 4), { tone: "faint" }),
      }),
      D(k.corners(CARRIAGE, 2.2).map(([x, y]) => at([x, y, 10])), { size: 0.45, tone: "mid" }),
    ].join(""),
    shapes: [A.slab(CARRIAGE, 5.4, 4.6, {}, 4)],
  });
  const MF = VERT(93.5, 14.5, 0);
  put({
    name: "target.mast",
    at: [93.5, 14.5, 10],
    attrs: ` data-part="target"`,
    svg: S(G.disc(10, 29, 2.1, MF, P), {
      tone: "mid",
      crease: "none",
      inner: L([16, 23].map((z) => G.arcOf(MF, z, 2.1, P, { least: 0 })).join(""), { tone: "faint" }),
    }),
    shapes: [A.disc(MF, 10, 29, 2.1)],
  });
  const head = { x: 85, y: 8.5, w: 13, d: 12, r: 1.5 };
  const HF = frameOf([85, 14.5, TARGET[2]], [-1, 0, 0], [0, 0, 1]);
  put({
    name: "target.head",
    at: [91.5, 14.5, TARGET[2]],
    attrs: ` data-part="target"`,
    svg: [
      S(k.slabOf(head, 29, 11, P, 4, 0.6), {
        tone: "hi",
        crease: "lo",
        inner: L(k.sideSeam(head, 34.5, P, 4), { tone: "faint" }),
      }),
      S(G.disc(0, 2.6, 5.2, HF, P), { tone: "mid", crease: "lo" }),
      L(G.circleOf(HF, 2.6, 3.9, P, 32), { tone: "lo" }),
      L(G.circleOf(HF, 2.6, 2.4, P, 28), { tone: "faint" }),
      D([at([TARGET[0], 14.5, TARGET[2]])], { size: 0.7, tone: "hi", pulse: true }),
    ].join(""),
    shapes: [A.slab(head, 29, 11, {}, 4), A.disc(HF, 0, 2.6, 5.2, { name: "target.head.face" })],
  });
}

// ─────────────────────── 6. Spot: body ─────────────────────────────────────
// One recessed sensor face (front or rear): housing prism, recessed panel,
// central mesh grille (dot grid) and three sensor windows per side — the
// stereo depth cameras live in these faces (LEDGER-V2).
function buildFace(tag, front) {
  const sx = front ? 1 : -1;
  const F = frameOf([sx * 38, 0, REF_Z], [sx, 0, 0], [0, sx, 0]);
  const housing = roundedRect(10.6, 9.6, 2.2);
  const recess = roundedRect(8.6, 7.8, 1.6);
  const winPolys = [];
  const winShapes = [];
  // BD front elevation: each side of the grille carries three windows —
  // two small squares stacked above one tall window.
  for (const sideSign of [1, -1]) {
    const cols = [
      [-3.7, 2.75],
      [0.95, 1.3],
      [3.85, 1.3],
    ];
    for (const [vc, hHalf] of cols) {
      const poly = roundedRect(1.5, hHalf, 0.6, 2).map(([u, v]) => [u + sideSign * 5.7, v + vc]);
      winPolys.push(poly);
      winShapes.push(A.prism(F, poly, 1.15, 1.62, { owner: "spot.body" }));
    }
  }
  // Denser, wider mesh: a staggered dot grid filling the recess centre.
  const grilleDots = [];
  let row = 0;
  for (let gz = -6.1; gz <= 5.21; gz += 0.92, row++) {
    for (let gy = -3.2 + (row % 2) * 0.44; gy <= 3.21; gy += 0.88) {
      grilleDots.push(at(framePt(F, 1.52, gy, gz)));
    }
  }
  put({
    name: `spot.face.${tag}`,
    at: [sx * 39, 0, REF_Z],
    attrs: ` data-part="body"`,
    svg: [
      S(G.prismOf(F, housing, 0, 1.15, P), { tone: "mid", crease: "lo" }),
      S(G.prismOf(F, recess, 1.15, 1.5, P), { tone: "lo", crease: "none" }),
      D(grilleDots, { size: 0.3, tone: "lo" }),
      ...winPolys.map((poly) => S(G.prismOf(F, poly, 1.15, 1.62, P), { tone: "hi", crease: "lo" })),
    ].join(""),
    shapes: [
      A.prism(F, housing, 0, 1.15, { name: `spot.face.${tag}.housing`, owner: "spot.body" }),
      A.prism(F, recess, 1.15, 1.5, { name: `spot.face.${tag}.recess`, owner: "spot.body" }),
      ...winShapes,
    ],
  });
}

// One chassis side: long vent/mesh strip with dot mesh, the 3-window button
// panel ahead of it, and the round side depth camera near the front.
function buildSide(side) {
  const tag = side > 0 ? "L" : "R";
  // Frame v axis = cross(a, u): for side +1 it points DOWN, for -1 UP.
  // fv converts a world +z offset into this frame's v coordinate.
  const fv = -side;
  const VF = frameOf([0, side * 14.3, 60], [0, side, 0], [1, 0, 0]);
  const vent = roundedRect(15, 1.7, 0.8, 2).map(([u, v]) => [u - 1, v * fv]);
  const panel = roundedRect(4.6, 2.0, 0.9, 2).map(([u, v]) => [u + 19, (v + 3.1) * fv]);
  const winPolys = [];
  const winShapes = [];
  for (const [uc, wHalf] of [
    [16.2, 0.85],
    [18.6, 0.85],
    [21.6, 1.4],
  ]) {
    const poly = roundedRect(wHalf, 1.05, 0.5, 2).map(([u, v]) => [u + uc, (v + 3.1) * fv]);
    winPolys.push(poly);
    winShapes.push(A.prism(VF, poly, 0.75, 1.25, { owner: "spot.body" }));
  }
  // Dense staggered mesh across the whole vent band, on both sides.
  const meshDots = [];
  let mrow = 0;
  for (const gz of [58.6, 59.9, 61.2]) {
    for (let gx = -14.5 + (mrow % 2) * 0.8; gx <= 12.6; gx += 1.6) {
      meshDots.push(at([gx, side * 15.02, gz]));
    }
    mrow++;
  }
  put({
    name: `spot.side.${tag}`,
    at: [10, side * 14.3, 60],
    attrs: ` data-part="body"`,
    svg: [
      S(G.prismOf(VF, vent, 0, 0.7, P), { tone: "lo", crease: "none" }),
      D(meshDots, { size: 0.27, tone: "lo" }),
      S(G.prismOf(VF, panel, 0, 0.75, P), { tone: "mid", crease: "lo" }),
      ...winPolys.map((poly) => S(G.prismOf(VF, poly, 0.75, 1.25, P), { tone: "hi", crease: "lo" })),
    ].join(""),
    shapes: [
      A.prism(VF, vent, 0, 0.7, { name: `spot.side.${tag}.vent`, owner: "spot.body" }),
      A.prism(VF, panel, 0, 0.75, { name: `spot.side.${tag}.panel`, owner: "spot.body" }),
      ...winShapes,
    ],
  });

  const CF = frameOf([36.5, side * 14.3, 62], [0, side, 0], [0, 0, 1]);
  const boss = roundedRect(2.2, 2.2, 0.5);
  put({
    name: `spot.sidecam.${tag}`,
    at: [36.5, side * 15, 62],
    attrs: ` data-part="body"`,
    svg: [
      S(G.prismOf(CF, boss, -0.45, 0.25, P), { tone: "lo", crease: "lo" }),
      S(G.disc(0, 1.1, 2.1, CF, P), { tone: "mid", crease: "lo" }),
      D([at(G.pointOf(CF, 1.1, 0, 0))], { size: 0.5, tone: "hi" }),
    ].join(""),
    shapes: [
      A.prism(CF, boss, -0.45, 0.25, { owner: "spot.body" }),
      A.disc(CF, 0, 1.1, 2.1, { owner: "spot.body" }),
    ],
  });
}

// Hip covers + handles are part of each leg assembly (see legFrames):
// a smooth dome on the chassis side face, so the leg root can sit inside
// its cover without two recorded items interpenetrating.

function buildBody() {
  put({
    name: "spot.chassis.lower",
    at: [0, 0, BELLY_Z],
    attrs: ` data-part="body"`,
    svg: S(k.slabOf(BODY_LO, BELLY_Z, REF_Z - BELLY_Z, P, 6, 0.8), {
      tone: "mid",
      inner: L(k.sideSeam(BODY_LO, 54.5, P, 6), { tone: "faint" }),
    }),
    shapes: [A.slab(BODY_LO, BELLY_Z, REF_Z - BELLY_Z, { owner: "spot.body" }, 6)],
  });
  put({
    name: "spot.chassis.upper",
    at: [0, 0, REF_Z],
    attrs: ` data-part="body"`,
    svg: [
      S(k.slabOf(BODY, REF_Z, DECK_Z - REF_Z, P, 6, 0.8), {
        tone: "hi",
        crease: "lo",
        inner: L(k.sideSeam(BODY, 64, P, 6), { tone: "faint" }),
      }),
      L(k.planOutline(k.insetPlan(BODY, 2.6), DECK_Z, P, 5), { tone: "faint" }),
    ].join(""),
    shapes: [A.slab(BODY, REF_Z, DECK_Z - REF_Z, { owner: "spot.body" }, 6)],
  });

  const deck = { x: -36, y: -13, w: 72, d: 26, r: 4 };
  put({
    name: "spot.deck",
    at: [0, 0, DECK_Z],
    attrs: ` data-part="body"`,
    svg: [
      S(k.slabOf(deck, DECK_Z, 1.2, P, 5, 0.4), { tone: "mid" }),
      D(k.corners(deck, 3.2).map(([x, y]) => at([x, y, DECK_TOP])), { size: 0.42, tone: "lo" }),
    ].join(""),
    shapes: [A.slab(deck, DECK_Z, 1.2, { owner: "spot.body" }, 5)],
  });

  for (const side of [1, -1]) {
    const rail = { x: -34, y: side * 7 - 1.2, w: 68, d: 2.4, r: 0.8 };
    put({
      name: `spot.rail.${side > 0 ? "L" : "R"}`,
      at: [0, side * 7, DECK_TOP],
      attrs: ` data-part="body"`,
      svg: [
        S(k.slabOf(rail, DECK_TOP, 1.3, P, 3, 0.3), { tone: "hi", crease: "lo" }),
        L(k.planOutline(k.insetPlan(rail, 0.8), DECK_TOP + 1.3, P, 2), { tone: "lo" }),
        D([-30, -10, 10, 30].map((x) => at([x, side * 7, DECK_TOP + 1.3])), { size: 0.36, tone: "mid" }),
      ].join(""),
      shapes: [A.slab(rail, DECK_TOP, 1.3, { owner: "spot.body" }, 3)],
    });
  }

  for (const [tag, cx] of [
    ["front", 18],
    ["rear", -28],
  ]) {
    const port = { x: cx - 6, y: -6, w: 12, d: 12, r: 2 };
    put({
      name: `spot.port.${tag}`,
      at: [cx, 0, DECK_TOP],
      attrs: ` data-part="body"`,
      svg: [
        S(k.slabOf(port, DECK_TOP, 0.9, P, 3, 0.3), { tone: "lo" }),
        D(k.corners(port, 2).map(([x, y]) => at([x, y, DECK_TOP + 0.9])), { size: 0.38, tone: "mid" }),
      ].join(""),
      shapes: [A.slab(port, DECK_TOP, 0.9, { owner: "spot.body" }, 3)],
    });
  }

  // Front cover plate on the deck, between the payload rails, with its
  // four screw dots (BD anatomy drawing). Flat on the deck plate so it
  // meets the chassis corner cleanly instead of sinking into it.
  const cover = { x: 25, y: -5.5, w: 11, d: 11, r: 1.5 };
  put({
    name: "spot.deckcover",
    at: [30.5, 0, DECK_TOP],
    attrs: ` data-part="body"`,
    svg: [
      S(k.slabOf(cover, DECK_TOP, 0.8, P, 3, 0.3), { tone: "hi", crease: "lo" }),
      D(
        [
          [27.5, -3.5],
          [27.5, 3.5],
          [33.5, -3.5],
          [33.5, 3.5],
        ].map(([x, y]) => at([x, y, DECK_TOP + 0.8])),
        { size: 0.42, tone: "mid" },
      ),
    ].join(""),
    shapes: [A.slab(cover, DECK_TOP, 0.8, { owner: "spot.body" }, 3)],
  });

  buildFace("front", true);
  buildFace("rear", false);
  buildSide(1);
  buildSide(-1);

  // Belly: battery pan, battery door panel, longitudinal skid rail.
  const pan = { x: -30, y: -11, w: 60, d: 22, r: 3 };
  put({
    name: "spot.belly.pan",
    at: [0, 0, BELLY_Z - 2.5],
    attrs: ` data-part="body"`,
    svg: S(k.slabOf(pan, BELLY_Z - 2.5, 2.5, P, 5, 0.5), { tone: "lo" }),
    shapes: [A.slab(pan, BELLY_Z - 2.5, 2.5, { owner: "spot.body" }, 5)],
  });
  const door = { x: -14, y: -8.5, w: 28, d: 17, r: 2 };
  put({
    name: "spot.belly.battery",
    at: [0, 0, BELLY_Z - 3.4],
    attrs: ` data-part="body"`,
    svg: [
      S(k.slabOf(door, BELLY_Z - 3.4, 0.9, P, 4, 0.3), { tone: "mid" }),
      L(k.planOutline(k.insetPlan(door, 1.6), BELLY_Z - 3.4, P, 3), { tone: "faint" }),
    ].join(""),
    shapes: [A.slab(door, BELLY_Z - 3.4, 0.9, { owner: "spot.body" }, 4)],
  });
  const skid = { x: -24, y: -1.6, w: 48, d: 3.2, r: 1.2 };
  put({
    name: "spot.belly.skid",
    at: [0, 0, BELLY_Z - 4.6],
    attrs: ` data-part="body"`,
    svg: S(k.slabOf(skid, BELLY_Z - 4.6, 1.2, P, 3, 0.3), { tone: "lo" }),
    shapes: [A.slab(skid, BELLY_Z - 4.6, 1.2, { owner: "spot.body" }, 3)],
  });

  const imu = { x: -6, y: -5, w: 12, d: 10, r: 2 };
  put({
    name: "spot.imu",
    at: [0, 0, DECK_TOP],
    attrs: ` data-part="body"`,
    svg: [
      S(k.slabOf(imu, DECK_TOP, 1.6, P, 3, 0.4), { tone: "mid" }),
      L(k.planOutline(k.insetPlan(imu, 1.6), DECK_TOP + 1.6, P, 2), { tone: "faint" }),
    ].join(""),
    shapes: [A.slab(imu, DECK_TOP, 1.6, { owner: "spot.body" }, 3)],
  });

  put({
    name: "spot.estop",
    at: [-14, 0, DECK_TOP],
    attrs: ` data-part="body"`,
    svg: [
      S(k.cylinder(-14, 0, 2.7, DECK_TOP, 1.4, P, 24), { tone: "lo" }),
      S(k.cylinder(-14, 0, 1.9, DECK_TOP + 1.4, 1.2, P, 24, 0.3), { tone: "mid" }),
    ].join(""),
    shapes: [
      A.cylinder(-14, 0, 2.7, DECK_TOP, 1.4, { owner: "spot.body" }),
      A.cylinder(-14, 0, 1.9, DECK_TOP + 1.4, 1.2, { owner: "spot.body" }),
    ],
  });

  // Status lamp: the figure's one lit accent (mounted on the cover plate)
  put({
    name: "spot.lamp",
    at: [30.5, 0, DECK_TOP + 0.8],
    attrs: ` data-part="body"`,
    svg: [
      S(k.cylinder(30.5, 0, 1.8, DECK_TOP + 0.8, 1.4, P, 20), { tone: "mid" }),
      S(k.cylinder(30.5, 0, 1.2, DECK_TOP + 2.2, 1.1, P, 20), { tone: "hi", lit: true }),
      D([at([30.5, 0, DECK_TOP + 3.3])], { size: 0.6, tone: "lit", pulse: true }),
    ].join(""),
    shapes: [
      A.cylinder(30.5, 0, 1.8, DECK_TOP + 0.8, 1.4, { owner: "spot.body" }),
      A.cylinder(30.5, 0, 1.2, DECK_TOP + 2.2, 1.1, { owner: "spot.body" }),
    ],
  });
}

// ─────────────────────── 7. Spot Arm (static raised working pose) ─────────
// Link lengths at scale from BD's dimensioned drawing (LEDGER-V2):
// shoulder->elbow 33.85, elbow->wrist 40.33, wrist->gripper pivot 11.75,
// gripper pivot->tip 12.48. Pose: upper arm up-forward at 50 degrees,
// forearm near-horizontal forward, gripper open over the front face.
const ARM_S = [18, 0, 86]; // shoulder pivot (turret + housing above the front port)
const ARM_E = [39.8, 0, 111.9]; // elbow: S + 33.85 at 50 degrees
const ARM_W = [79.5, 0, 104.9]; // wrist: E + 40.33 at -10 degrees
const ARM_DIR = G.unit3(G.sub3(ARM_W, ARM_E));
const ARM_G = [
  ARM_W[0] + ARM_DIR[0] * 11.75,
  ARM_W[1] + ARM_DIR[1] * 11.75,
  ARM_W[2] + ARM_DIR[2] * 11.75,
]; // gripper pivot

function buildArm() {
  put({
    name: "spot.arm.turret",
    at: [18, 0, DECK_TOP + 0.9],
    attrs: ` data-part="body"`,
    svg: [
      S(k.cylinder(18, 0, 6, DECK_TOP + 0.9, 2.2, P, 32), { tone: "lo" }),
      S(k.cylinder(18, 0, 4.8, DECK_TOP + 3.1, 2.2, P, 32, 0.4), { tone: "mid", crease: "lo" }),
      L(k.ring(18, 0, 6, DECK_TOP + 3.1, P, 32), { tone: "faint" }),
    ].join(""),
    shapes: [
      A.cylinder(18, 0, 6, DECK_TOP + 0.9, 2.2, { owner: "spot.arm" }),
      A.cylinder(18, 0, 4.8, DECK_TOP + 3.1, 2.2, { owner: "spot.arm" }),
    ],
  });

  // The arm links are ONE recorded item: each link root sits inside its
  // joint drum, as built, so the joints and links are one assembly. The
  // gripper FINGERS are the exception — a separate live item (buildGripper)
  // so the live layer can cycle the aperture; everything else of the
  // gripper (head, camera, pins) stays in this static item.
  const SF = frameOf(ARM_S, [0, 1, 0], [0, 0, 1]);
  const upF = G.frameAlong(ARM_S, G.sub3(ARM_E, ARM_S));
  const upProf = [
    [0, 3.2],
    [2, 4.3],
    [10, 4.0],
    [28, 3.3],
    [33.85, 2.5],
  ];
  const EF = frameOf(ARM_E, [0, 1, 0], [0, 0, 1]);
  // Forearm: the fat smooth cylinder, flared at the elbow root (BD's
  // elbow knuckle), with two moulded slot windows as real shallow solids
  // on its upper surface and panel seam rings fore and aft.
  const foF = G.frameAlong(ARM_E, G.sub3(ARM_W, ARM_E));
  const foProf = [
    [0, 4.3],
    [2.5, 5.05, 1],
    [6, 4.95, 1],
    [36, 4.6, 1],
    [40.33, 3.8],
  ];
  const foRadiusAt = (s) => {
    for (let i = 1; i < foProf.length; i++) {
      if (s <= foProf[i][0]) {
        const [sa, ra] = foProf[i - 1];
        const [sb, rb] = foProf[i];
        return ra + ((rb - ra) * (s - sa)) / (sb - sa);
      }
    }
    return foProf[foProf.length - 1][1];
  };
  const slotUp = G.angleToward(foF, [0, 0, 1]);
  const slotRadial = G.radialOf(foF, slotUp);
  const slotAt = (s) => {
    const F = frameOf(G.pointOf(foF, s, foRadiusAt(s) - 0.12, slotUp), slotRadial, G.sub3(ARM_W, ARM_E));
    const poly = G.stadium(0.55, 0.55, 3.3, 10).map(([x, y]) => [x - 1.65, y]);
    return { F, poly };
  };
  const slotA = slotAt(13);
  const slotB = slotAt(22.5);
  const wristProf = [
    [43.2, 3.9],
    [52.08, 3.0],
  ];
  // Gripper head (static): pivot drum at the gripper pivot, a chunky head
  // block growing out of the wrist end, the 4K camera window centred on
  // its front face with the ToF window below and an LED above. The finger
  // pivot pin caps are drawn with the gripper item (see gripperFrames).
  // jawF: axis is lateral, u runs along the forearm axis, v points
  // DOWN — so a world-up offset q is polygon coordinate -q.
  const GF = frameOf(ARM_G, [0, 1, 0], [0, 0, 1]);
  const jawF = frameOf(ARM_G, [0, 1, 0], ARM_DIR);
  const headPoly = roundedRect(3.35, 2.5, 0.7).map(([x, y]) => [x + 1.15, y]);
  const camC = framePt(jawF, 0, 4.5, 0);
  const camF = frameOf(camC, ARM_DIR, [0, 0, 1]);
  const tofC = framePt(jawF, 0, 4.5, 1.95);
  const tofF = frameOf(tofC, ARM_DIR, [0, 0, 1]);
  const ledC = framePt(jawF, 1.5, 4.5, -1.95);
  const ledF = frameOf(ledC, ARM_DIR, [0, 0, 1]);
  put({
    name: "spot.arm",
    at: ARM_S,
    attrs: ` data-part="body"`,
    svg: [
      // Shoulder motor housing: a large round drum on the lateral axis,
      // with cooling rings around its rim (BD's finned housing)
      S(G.disc(-3.6, -2, 6.3, SF, P), { tone: "lo" }),
      S(G.disc(-2, 2, 7.2, SF, P), { tone: "mid", crease: "lo" }),
      S(G.disc(2, 3.6, 6.3, SF, P), { tone: "lo" }),
      S(G.disc(3.6, 4.4, 4.4, SF, P), { tone: "hi", crease: "lo" }),
      L([-1.5, -0.5, 0.5, 1.5].map((s) => G.arcOf(SF, s, 7.22, P, { slope: 0 })).join(""), { tone: "lo" }),
      L(G.circleOf(SF, 4.4, 3.1, P, 32), { tone: "lo" }),
      D([at(G.pointOf(SF, 4.4, 0, 0))], { size: 0.5, tone: "mid" }),
      // Upper arm: long tapered link
      S(G.solidOf(upProf, upF, P, { steps: 28 }), { tone: "hi", crease: "lo" }),
      // Elbow housing
      S(G.disc(-3.2, 3.2, 5.7, EF, P), { tone: "mid", crease: "lo" }),
      S(G.disc(3.2, 4, 3.6, EF, P), { tone: "hi", crease: "lo" }),
      L(G.circleOf(EF, 4, 2.4, P, 28), { tone: "lo" }),
      // Forearm cylinder + seam rings + slot windows
      S(G.solidOf(foProf, foF, P, { steps: 36 }), { tone: "hi", crease: "lo" }),
      L([6.5, 33].map((s) => G.arcOf(foF, s, foRadiusAt(s) + 0.03, P, { slope: 0 })).join(""), { tone: "faint" }),
      S(G.prismOf(slotA.F, slotA.poly, 0, 0.3, P), { tone: "lo", crease: "none" }),
      S(G.prismOf(slotB.F, slotB.poly, 0, 0.3, P), { tone: "lo", crease: "none" }),
      // Wrist: knurled ring slices, then the wrist body to the gripper pivot
      S(G.disc(40.33, 41.8, 4.5, foF, P), { tone: "lo" }),
      S(G.disc(41.8, 43.2, 4.1, foF, P), { tone: "mid", crease: "lo" }),
      S(G.solidOf(wristProf, foF, P, { steps: 28 }), { tone: "mid", crease: "lo" }),
      // Gripper head: pivot drum, head block, camera / ToF / LED, pin caps
      S(G.disc(-2.6, 2.6, 3.4, GF, P), { tone: "mid", crease: "lo" }),
      S(G.prismOf(jawF, headPoly, -1.85, 1.85, P), { tone: "mid", crease: "lo" }),
      S(G.disc(0, 0.5, 1.05, camF, P), { tone: "lo", crease: "none" }),
      L(G.circleOf(camF, 0.5, 0.62, P, 24), { tone: "faint" }),
      D([at(G.pointOf(camF, 0.5, 0, 0))], { size: 0.5, tone: "hi" }),
      S(G.disc(0, 0.45, 0.52, tofF, P), { tone: "mid", crease: "none" }),
      S(G.disc(0, 0.4, 0.42, ledF, P), { tone: "hi", crease: "none" }),
      D([at(G.pointOf(ledF, 0.4, 0, 0))], { size: 0.45, tone: "hi" }),
    ].join(""),
    shapes: [
      A.disc(SF, -3.6, -2, 6.3, { name: "spot.arm.shoulder.a", owner: "spot.arm" }),
      A.disc(SF, -2, 2, 7.2, { name: "spot.arm.shoulder.b", owner: "spot.arm" }),
      A.disc(SF, 2, 3.6, 6.3, { name: "spot.arm.shoulder.c", owner: "spot.arm" }),
      A.disc(SF, 3.6, 4.4, 4.4, { name: "spot.arm.shoulder.cap", owner: "spot.arm" }),
      A.solid(upF, upProf, { name: "spot.arm.upper", owner: "spot.arm" }),
      A.disc(EF, -3.2, 3.2, 5.7, { name: "spot.arm.elbow.drum", owner: "spot.arm" }),
      A.disc(EF, 3.2, 4, 3.6, { name: "spot.arm.elbow.cap", owner: "spot.arm" }),
      A.solid(foF, foProf, { name: "spot.arm.forearm", owner: "spot.arm" }),
      A.prism(slotA.F, slotA.poly, 0, 0.3, { name: "spot.arm.forearm.slotA", owner: "spot.arm" }),
      A.prism(slotB.F, slotB.poly, 0, 0.3, { name: "spot.arm.forearm.slotB", owner: "spot.arm" }),
      A.disc(foF, 40.33, 41.8, 4.5, { name: "spot.arm.wrist.ring1", owner: "spot.arm" }),
      A.disc(foF, 41.8, 43.2, 4.1, { name: "spot.arm.wrist.ring2", owner: "spot.arm" }),
      A.solid(foF, wristProf, { name: "spot.arm.wrist.body", owner: "spot.arm" }),
      A.disc(GF, -2.6, 2.6, 3.4, { name: "spot.arm.gripper.pivot", owner: "spot.arm" }),
      A.prism(jawF, headPoly, -1.85, 1.85, { name: "spot.arm.gripper.head", owner: "spot.arm" }),
      A.disc(camF, 0, 0.5, 1.05, { name: "spot.arm.gripper.cam", owner: "spot.arm" }),
      A.disc(tofF, 0, 0.45, 0.52, { name: "spot.arm.gripper.tof", owner: "spot.arm" }),
      A.disc(ledF, 0, 0.4, 0.42, { name: "spot.arm.gripper.led", owner: "spot.arm" }),
    ],
  });
}

// ─────────────────────── 7b. Gripper fingers (live: aperture cycles) ─────
// The two fingers pivot on pins at (4.9, ±1.45) in the gripper frame —
// 4.9 along the forearm axis from the gripper pivot, ±1.45 up/down — and
// open like a beak. gripperFrames/gripperSvg are shared verbatim with the
// page; the aperture comes from the pure model (model.mjs gripperMm).
export const gripperFrames = (apertureMm) => {
  const jawF = frameOf(ARM_G, [0, 1, 0], ARM_DIR);
  const A = Math.max(20, Math.min(160, apertureMm)) / 10;
  const theta = 0.0408 + Math.asin(Math.max(-1, Math.min(1, (A / 2 - 1.45) / 7.356)));
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const fin = [
    [0.85, -1.05],
    [3.4, -0.62],
    [5.9, -0.42],
    [7.35, -0.32],
    [7.58, 0.02],
    [7.3, 0.5],
    [5.6, 0.8],
    [4.2, 0.95],
    [3.4, 1.35],
    [1.6, 1.45],
    [0.35, 1.55],
    [0.1, 0.9],
    [-0.25, -0.15],
  ];
  const pad = [
    [1.3, -0.9],
    [3.4, -0.55],
    [6.3, -0.33],
    [6.3, -0.52],
    [3.4, -0.74],
    [1.3, -1.09],
  ];
  const rot = ([x, y], sgn) => {
    const p = 4.9 + x * cos - y * sin;
    const q = sgn * (1.45 + x * sin + y * cos);
    return [p, -q];
  };
  // Pivot pin caps: static discs on the pin axis, outboard of the finger
  // faces. They live in the gripper item (not the arm item) because as arm
  // geometry they interleave with the finger roots on screen and no
  // painter order can sort the pair.
  const caps = [1, -1].map((sgn) => frameOf(framePt(jawF, 0, 4.9, -1.45 * sgn), [0, 1, 0], [0, 0, 1]));
  return {
    jawF,
    upPoly: fin.map((pt) => rot(pt, 1)),
    loPoly: fin.map((pt) => rot(pt, -1)),
    upPad: pad.map((pt) => rot(pt, 1)),
    loPad: pad.map((pt) => rot(pt, -1)),
    theta,
    caps,
  };
};
export const gripperSvg = (apertureMm) => {
  const f = gripperFrames(apertureMm);
  return [
    S(G.prismOf(f.jawF, f.upPoly, -1.3, 1.3, P), { tone: "hi", crease: "lo" }),
    S(G.prismOf(f.jawF, f.loPoly, -1.3, 1.3, P), { tone: "hi", crease: "lo" }),
    S(G.prismOf(f.jawF, f.upPad, -1.02, 1.02, P), { tone: "lo", crease: "none" }),
    S(G.prismOf(f.jawF, f.loPad, -1.02, 1.02, P), { tone: "lo", crease: "none" }),
    ...f.caps.flatMap((F) =>
      [
        [1.3, 1.52],
        [-1.52, -1.3],
      ].map(([s0, s1]) => S(G.disc(s0, s1, 0.55, F, P), { tone: "mid", crease: "lo" })),
    ),
  ].join("");
};

function buildGripper(init) {
  const f = gripperFrames(init.gripperMm);
  put({
    name: "spot.arm.gripper",
    at: ARM_G,
    attrs: ` data-part="body" data-gripper="1"`,
    svg: gripperSvg(init.gripperMm),
    shapes: [
      A.prism(f.jawF, f.upPoly, -1.3, 1.3, { name: "spot.arm.gripper.up", owner: "spot.arm" }),
      A.prism(f.jawF, f.loPoly, -1.3, 1.3, { name: "spot.arm.gripper.lo", owner: "spot.arm" }),
      A.prism(f.jawF, f.upPad, -1.02, 1.02, { name: "spot.arm.gripper.uppad", owner: "spot.arm" }),
      A.prism(f.jawF, f.loPad, -1.02, 1.02, { name: "spot.arm.gripper.lopad", owner: "spot.arm" }),
      ...f.caps.flatMap((F, i) =>
        [
          [1.3, 1.52],
          [-1.52, -1.3],
        ].map(([s0, s1], j) => A.disc(F, s0, s1, 0.55, { name: `spot.arm.gripper.pin${i}cap${j}`, owner: "spot.arm" })),
      ),
    ],
  });
}

// ─────────────────────── 8. Spot: legs (rebuilt live from the model) ──────
// Shapes (v3, per BD's elevations): upper leg = a SMOOTH rounded tapered
// shell — the outline is a Catmull-Rom sample of the cover profile, and
// the lateral thickness is built from slices whose width falls off toward
// the faces, so the shell is rounded across its thickness as well as along
// its length. The knee is a hinge drum the lower leg emerges from, centred;
// the lower leg is a bowed blade with real width (bow toward the rear of
// the robot, as in BD's side elevation); the foot is a rounded ball pad,
// 70 x 40 mm, with tread ribs wrapping its bottom, on a ball ankle. The
// hip cover is one smooth lathe dome; the hip handle is a flat bar on two
// feet standing on the dome; a vented plate sits under each hip.
// legFrames / legSvg are shared verbatim with the page.
export const legFrames = (leg) => {
  const H = leg.hip;
  const K = leg.knee;
  const F = leg.foot;
  const crSample = (ctrl, sub) => {
    const pts = [];
    const atI = (i) => ctrl[Math.max(0, Math.min(ctrl.length - 1, i))];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const p0 = atI(i - 1);
      const p1 = atI(i);
      const p2 = atI(i + 1);
      const p3 = atI(i + 2);
      for (let j = 0; j < sub; j++) {
        const t = j / sub;
        const t2 = t * t;
        const t3 = t2 * t;
        pts.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        ]);
      }
    }
    pts.push(ctrl[ctrl.length - 1]);
    return pts;
  };
  const rr = (hw, hh, r) => {
    const pts = [];
    const corners = [
      [hw - r, hh - r, 0],
      [-hw + r, hh - r, Math.PI / 2],
      [-hw + r, -hh + r, Math.PI],
      [hw - r, -hh + r, (3 * Math.PI) / 2],
    ];
    for (const [cx, cy, a0] of corners) {
      for (let i = 0; i <= 2; i++) {
        const a = a0 + (i / 2) * (Math.PI / 2);
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    }
    return pts;
  };

  // Hip cover: one smooth dome (lathe profile with soft points), based
  // flush on the chassis side face at |y| = 14.3, reaching |y| = 25.25.
  const coverF = frameOf([H[0], leg.side * 14.3, H[2]], [0, leg.side, 0], [0, 0, 1]);
  const coverProf = [
    [0, 2.2],
    [0.7, 4.6, 1],
    [1.8, 6.0, 1],
    [3.4, 6.75, 1],
    [5.2, 6.9, 1],
    [7.0, 6.55, 1],
    [8.6, 5.5, 1],
    [9.8, 3.9, 1],
    [10.6, 2.0, 1],
    [10.95, 0.15],
  ];
  // Hip handle: a flat bar on two feet, standing on the dome along the
  // body line (the manual's carry handle at each hip joint).
  const handleF = frameOf([H[0], leg.side * 19, 0], [0, 0, 1], [1, 0, 0]);
  const handleFeet = [-2.8, 2.8].map((dx) => rr(0.85, 0.85, 0.3).map(([x, y]) => [x + dx, y]));
  const handleBar = rr(4.3, 0.95, 0.45);
  const handleZ = [H[2] + 6.1, H[2] + 7.9];
  // Under-hip vent plate (BD front elevation): a slotted grille plate on
  // the underside of the hip assembly, facing forward and down.
  const ventF = frameOf([H[0] + leg.fore * 2, leg.side * 17.5, H[2] - 9], [leg.fore, 0, -0.45], [0, 0, 1]);
  const ventPoly = rr(1.8, 4.4, 0.5);
  const ventSlots = [-3.2, -1.6, 0, 1.6, 3.2].map((vv) => [framePt(ventF, 0.57, -1.1, vv), framePt(ventF, 0.57, 1.1, vv)]);

  // Upper shell: smooth outline from the half-width control profile. The
  // shell lies in the KNEE's lateral plane (front pair inboard of the rear
  // pair), so its end lands centred on the knee drum; its root stays
  // buried in the hip dome either way.
  const upF = frameOf([H[0], K[1], H[2]], [0, leg.side, 0], [K[0] - H[0], 0, K[2] - H[2]]);
  const upCtrl = [
    [-2, 2.6],
    [0, 4.9],
    [3, 5.45],
    [8, 5.6],
    [16, 5.35],
    [24, 5.0],
    [30, 4.65],
    [34, 4.35],
    [37, 3.8],
    [39.5, 3.1],
    [41, 2.2],
    [42.3, 0.9],
  ];
  const upEdge = crSample(upCtrl, 3);
  const upOutline = [...upEdge, [43.1, 0], ...upEdge.slice().reverse().map(([x, y]) => [x, -y]), [-2.9, 0]];
  const upSlices = [
    [-2.45, -1.65, 0.8],
    [-1.65, -0.8, 0.93],
    [-0.8, 0.8, 1],
    [0.8, 1.65, 0.93],
    [1.65, 2.45, 0.8],
  ].map(([s0, s1, sc]) => [s0, s1, upOutline.map(([x, y]) => [x, y * sc])]);

  // Knee: a hinge drum on the lateral axis at the knee point; the lower
  // leg starts at the drum centre, so it emerges centred from the housing.
  const kneeF = frameOf(K, [0, leg.side, 0], [0, 0, 1]);
  const kneeDots = G.dotsOf(kneeF, 2.42, 2.6, 9, P, { phase: 0.2 });

  // Lower leg: bowed blade. The bow displaces the blade toward the rear
  // of the robot (world -x), per BD's side elevation, for every leg.
  const loDir = G.sub3(F, K);
  const loLen = G.len3(loDir);
  const loF = frameOf(K, [0, leg.side, 0], loDir);
  const midPlus = framePt(loF, 0, loLen / 2, 1);
  const midMinus = framePt(loF, 0, loLen / 2, -1);
  const bowSign = midPlus[0] < midMinus[0] ? 1 : -1;
  const bowAt = (s) => bowSign * 2.0 * Math.sin((Math.PI * s) / loLen);
  const loCtrl = [
    [0, 2.3],
    [8, 1.95],
    [20, 1.6],
    [32, 1.55],
    [loLen - 4, 1.7],
    [loLen, 1.95],
  ];
  const loSpine = crSample(loCtrl, 3).map(([s, w]) => [s, bowAt(s), w]);
  const loSlices = [
    [-1.4, -0.85, 0.82],
    [-0.85, 0.85, 1],
    [0.85, 1.4, 0.82],
  ].map(([s0, s1, sc]) => [
    s0,
    s1,
    [
      ...loSpine.map(([s, b, w]) => [s, b + w * sc]),
      [loLen + 1.0, bowAt(loLen)],
      ...loSpine.slice().reverse().map(([s, b, w]) => [s, b - w * sc]),
    ],
  ]);

  // Foot: a rounded ball pad (70 x 40) whose bottom rests on the force
  // plate top when the leg is in stance, tilted toe-down while swinging.
  const tilt = leg.stance ? 0 : Math.sin(Math.min(1, Math.max(0, leg.swing)) * Math.PI) * -0.38;
  const footF = frameOf([F[0], F[1], F[2] - 1.6], [0, -1, 0], [Math.cos(tilt), 0, Math.sin(tilt)]);
  const footBase = [
    [-3.3, 1.15],
    [-3.45, 0.62],
    [-3.05, 0.18],
    [-1.6, 0.02],
    [0, 0],
    [1.6, 0.02],
    [3.05, 0.18],
    [3.45, 0.62],
    [3.3, 1.3],
    [2.6, 1.95],
    [1.2, 2.3],
    [-1.2, 2.3],
    [-2.6, 1.95],
  ];
  const footSlices = [
    [-2.0, -1.05, 0.84],
    [-1.05, 1.05, 1],
    [1.05, 2.0, 0.84],
  ].map(([s0, s1, sc]) => [s0, s1, footBase.map(([x, y]) => [x, 1.15 + (y - 1.15) * sc])]);
  const ankle = [F[0], F[1], F[2] + 0.55];
  const tread = [-2.4, -1.2, 0, 1.2, 2.4].map((uu) => {
    const vb = 0.18 * Math.pow(Math.abs(uu) / 3.4, 3);
    return [-2, -1.3, -0.6, 0, 0.6, 1.3, 2].map((lat) => {
      const liftSide = Math.max(0, Math.abs(lat) - 1.05) * 0.38;
      return framePt(footF, lat, uu, vb + liftSide + 0.04);
    });
  });
  return {
    coverF, coverProf, handleF, handleFeet, handleBar, handleZ,
    ventF, ventPoly, ventSlots,
    upF, upSlices, kneeF, kneeDots, loF, loSlices, footF, footSlices, ankle, tread,
  };
};
export const legSvg = (leg) => {
  const f = legFrames(leg);
  return [
    S(G.solidOf(f.coverProf, f.coverF, P, { steps: 44 }), { tone: "hi", crease: "lo" }),
    ...f.handleFeet.map((poly) => S(G.prismOf(f.handleF, poly, f.handleZ[0], f.handleZ[1], P), { tone: "lo", crease: "none" })),
    S(G.prismOf(f.handleF, f.handleBar, f.handleZ[1], f.handleZ[1] + 1.15, P), { tone: "mid", crease: "lo" }),
    S(G.prismOf(f.ventF, f.ventPoly, 0, 0.55, P), { tone: "lo", crease: "none" }),
    L(f.ventSlots.map(([a, b]) => k.pathOf([at(a), at(b)])).join(""), { tone: "faint" }),
    ...f.upSlices.map(([s0, s1, poly]) => S(G.prismOf(f.upF, poly, s0, s1, P), { tone: "hi", crease: "lo" })),
    S(G.disc(-2.4, 2.4, 3.9, f.kneeF, P), { tone: "mid", crease: "lo" }),
    L(G.arcOf(f.kneeF, 0, 3.92, P, { slope: 0, least: 0 }), { tone: "faint" }),
    D(f.kneeDots, { size: 0.32, tone: "lo" }),
    ...f.loSlices.map(([s0, s1, poly]) => S(G.prismOf(f.loF, poly, s0, s1, P), { tone: "hi", crease: "lo" })),
    S(G.sphereOf(f.ankle, 1.9, P, { steps: 20 }), { tone: "mid" }),
    ...f.footSlices.map(([s0, s1, poly]) => S(G.prismOf(f.footF, poly, s0, s1, P), { tone: "lo", crease: "lo" })),
    L(f.tread.map((pts) => k.pathOf(pts.map((p) => at(p)))).join(""), { tone: "faint" }),
  ].join("");
};

function buildLegs(init) {
  for (const leg of init.legs) {
    const f = legFrames(leg);
    const owner = `leg.${leg.id}`;
    put({
      name: `spot.leg.${leg.id}`,
      at: leg.hip,
      attrs: ` data-leg="${leg.id}"`,
      svg: legSvg(leg),
      shapes: [
        A.solid(f.coverF, f.coverProf, { name: `leg.${leg.id}.cover`, owner }),
        ...f.handleFeet.map((poly, i) => A.prism(f.handleF, poly, f.handleZ[0], f.handleZ[1], { name: `leg.${leg.id}.handlefoot${i}`, owner })),
        A.prism(f.handleF, f.handleBar, f.handleZ[1], f.handleZ[1] + 1.15, { name: `leg.${leg.id}.handle`, owner }),
        A.prism(f.ventF, f.ventPoly, 0, 0.55, { name: `leg.${leg.id}.hipvent`, owner }),
        ...f.upSlices.map(([s0, s1, poly], i) => A.prism(f.upF, poly, s0, s1, { name: `leg.${leg.id}.upper${i}`, owner })),
        A.disc(f.kneeF, -2.4, 2.4, 3.9, { name: `leg.${leg.id}.knee`, owner }),
        ...f.loSlices.map(([s0, s1, poly], i) => A.prism(f.loF, poly, s0, s1, { name: `leg.${leg.id}.lower${i}`, owner })),
        A.ball(f.ankle, 1.9, { name: `leg.${leg.id}.ankle`, owner }),
        ...f.footSlices.map(([s0, s1, poly], i) => A.prism(f.footF, poly, s0, s1, { name: `leg.${leg.id}.foot${i}`, owner })),
      ],
    });
  }
}

// ─────────────────────── Assemble ──────────────────────────────────────────
// The recorded build pose is the OPENING frame (v3): a clean trot phase
// (0.275) — FL+RR mid-stance with feet centred on their pads, FR+RL at
// peak swing lift — at the 610 mm default height.
const init = M.computeState({ speed: 0.9, bodyHeight: 610, phase: 0.275 });
buildBench();
buildForcePlates();
buildCable();
buildConsole();
buildStepBlock();
buildTarget();
buildBody();
buildArm();
buildGripper(init);
buildLegs(init);

A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
A.auditOrExit(R, P);

const groups = R.items.map((item) => `<g class="it" data-name="${item.name}"${item.attrs ?? ""}>${item.svg}</g>`);
const bodySvg = [
  `<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`,
  ...groups,
  `<path data-part="needle" class="iso-line" data-tone="lit" data-free="both" d="${gaugeNeedle(init.phase)}" style="stroke-width:1.1px"/>`,
];

const LABEL =
  "Spot, Boston Dynamics' quadruped robot with the Spot Arm, trotting in place on an instrumented gait bench. Four force plates under its feet read each foot's load live; diagonal leg pairs move together in a trot while the body stays level. The arm rides on the front payload port in a raised working pose. A 300 millimetre step block and a depth-camera target on a rail stand in front of it, and a bench console shows the four foot forces and a dial turning once per gait cycle.";

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: bodySvg });
const stage = `<div class="iso-stage sp-stage" tabindex="0" role="slider" aria-label="Spot gait bench: drag left and right to command speed, up and down for body height, or use the arrow keys" aria-valuemin="0" aria-valuemax="160" aria-valuenow="90" aria-valuetext="trotting at 0.9 metres per second, body height 610 millimetres">${svg}<span class="sp-sr" role="status" aria-live="polite" data-status></span></div>`;

const DATA = { P, dial: DIAL, dialR: DIAL_R, dialTop: DIAL_TOP, bar: BAR, conH: CON_H, targetY: 14.5, hipZ0: init.legs[0].hip[2] };

const MODEL = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const LATHE = readFileSync(join(HERE, "/home/nick/.gemini/config/skills/anatomy/kit/lathe.mjs"), "utf8")
  .replace(/^import .*$/gm, "")
  .replace(/^export /gm, "")
  .replaceAll("runsOf", "latheRunsOf")
  .replaceAll("signedArea", "latheSignedArea")
  .replaceAll("oriented", "latheOriented")
  .replaceAll("frameOf", "latheFrameOf");
const FUNCS = `const framePt = ${framePt.toString()};\nconst legFrames = ${legFrames.toString().replaceAll("G.", "")};\nconst legSvg = ${legSvg.toString().replaceAll("G.", "").replaceAll("k.", "").replaceAll("M.", "")};\nconst ARM_G = ${JSON.stringify(ARM_G)};\nconst ARM_DIR = ${JSON.stringify(ARM_DIR)};\nconst gripperFrames = ${gripperFrames.toString().replaceAll("G.", "")};\nconst gripperSvg = ${gripperSvg.toString().replaceAll("G.", "").replaceAll("k.", "").replaceAll("M.", "")};\nconst barPath = ${barPath.toString().replaceAll("k.", "")};\nconst gaugeNeedle = ${gaugeNeedle.toString().replaceAll("k.", "")};\nconst DIAL = DATA.dial, DIAL_R = DATA.dialR, DIAL_TOP = DATA.dialTop, BAR = DATA.bar, CON_H = DATA.conH;\nconst S = (paths, style) => solidSvg(paths, style);\nconst L = (d, style) => lineSvg(d, style);\nconst D = (points, style) => dotsSvg(points, style);\nconst at = (p) => iso(p, P);\nconst frameOf = (o, a, u) => { const axis = unit3(a); const uu = u ? unit3(sub3(u, mul3(axis, dot3(u, axis)))) : frameAlong(o, axis).u; return { o, a: axis, u: uu, v: cross3(axis, uu) }; };\n`;
const CSS = readFileSync(join(HERE, "spot.css"), "utf8");
const LIVE = `const DATA = ${JSON.stringify(DATA)};\nconst P = DATA.P;\n${MODEL}\n${LATHE}\n${FUNCS}\n${readFileSync(join(HERE, "live.js"), "utf8")}`;

const f = (leg) => Math.round(init.legs.find((l) => l.id === leg).force);
const plate = k.plateHtml({
  fig: "Fig 7",
  title: "How Spot works",
  hint: "Drag ↔ speed · ↕ height",
  readout: `${parseFloat(init.speed.toFixed(2))} m/s · FL${f("FL")} FR${f("FR")} RL${f("RL")} RR${f("RR")} N · ${init.bodyHeightMm}mm · grip ${init.gripperMm}`,
  keys: [
    { mark: "lit", label: "Status lamp: the live part — watch the trot, the dial and the force bars" },
    { mark: "raised", label: "Spot with Spot Arm: 40.5 kg all-in, 12 leg actuators + a 6-DoF arm with gripper" },
    { mark: "dim", label: "Force plates read each foot: stance feet share ~397 N, swing feet read 0 N" },
    { mark: "edge", label: "Step block 300 mm — the tallest step Spot plans for; depth target on its rail" },
  ],
  caption:
    "Spot trots in place on a gait bench, and the trot cycle is the whole explanation. 1 · Sense: five stereo depth cameras in its front and rear faces and on its sides give 360° terrain sensing out to 4 m, while the body IMU and the joint encoders report pose and contact. 2 · Estimate: pose and terrain are fused continuously and the centre of mass is tracked over the feet in stance. 3 · Plan: footholds are chosen on sensed ground — steps up to 300 mm (the block in front), slopes to ±30°. 4 · Actuate: the 12 electric leg actuators drive a dynamic trot, diagonal pairs (front-left + rear-right, front-right + rear-left) moving together; a stance foot pushes and loads its force plate, a swing foot lifts, places and loads in turn. 5 · Repeat: the loop never stops, so a push is answered by re-placed feet — dynamic balance, not static stability. On its back rides the Spot Arm: 6 degrees of freedom plus a gripper, 984 mm at full extension, with its own camera in the gripper — shown here raised off the front payload port, its gripper slowly cycling open and closed (the readout tracks the aperture, up to 175 mm). The pack is a swappable 605 Wh battery (Gamma), the all-in mass with the Arm is 40.5 kg, and the top speed is 1.6 m/s.",
  body: `<style>${CSS}</style>${stage}`,
});

const page = k.pageHtml({ title: "How Spot works — Anatomy figure", theme, body: plate, script: kitScript() + LIVE, width: 720 });
const outName = theme === "light" ? "spot-light.html" : "spot.html";
writeFileSync(join(HERE, outName), page);
console.log(`wrote ${outName} · ${(page.length / 1024).toFixed(0)} KB · ${R.items.length} items · ${R.solids.length} solids`);
