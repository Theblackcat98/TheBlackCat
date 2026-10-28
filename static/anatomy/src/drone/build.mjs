import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/nick/.gemini/config/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/home/nick/.gemini/config/skills/anatomy/kit/lathe.mjs";
import * as A from "/home/nick/.gemini/config/skills/anatomy/kit/audit.mjs";
import { turning } from "/home/nick/.gemini/config/skills/anatomy/kit/turn-build.mjs";
import * as TA from "/home/nick/.gemini/config/skills/anatomy/kit/turn-audit.mjs";
import { tubePieces, tubeSvg } from "/home/nick/.gemini/config/skills/anatomy/kit/tube.mjs";
import { turnScript, kitScript } from "/home/nick/.gemini/config/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const theme = argv.includes("--light") ? "light" : "dark";

const WIDTH = 680;
const HEIGHT = 500;
const AZIMUTH = 38;
const ELEVATION = 30;
const D2R = Math.PI / 180;

// ── World plan (units ≈ px; a 450 mm frame is drawn about 92 units motor to motor) ──
const BASE = { x: -112, y: -96, w: 224, d: 192, r: 9 };
const BASE_H = 12;
const FOOT_H = 5;
const POST_TOP = 62; // top of the static post; everything above it lives on the gimbal
const PIVOT_Z = 73; // both gimbal axes cross here
const BODY_Z = 85; // underside of the bottom plate
const ARM_Z0 = BODY_Z + 1.4;
const ARM_Z1 = ARM_Z0 + 2.8;
const TOP_Z1 = ARM_Z1 + 1.4;
const MOTOR_R = 46; // centre of each motor from the frame centre
const PROP_R = 22.5;
const TILT = M.MAX_TILT;

const VERT = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const frameOf = (o, a, u) => {
  const axis = G.unit3(a);
  const uu = u ? G.unit3(G.sub3(u, G.mul3(axis, G.dot3(u, axis)))) : G.frameAlong(o, axis).u;
  return { o, a: axis, u: uu, v: G.cross3(axis, uu) };
};
const FLAT = { o: [0, 0, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] };
const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

const MOTOR_AT = M.MOTORS.map((m) => {
  const a = Math.atan2(m.y, m.x);
  return { ...m, a, c: [MOTOR_R * Math.cos(a), MOTOR_R * Math.sin(a)] };
});

// The transmitter and the load-cell gauge sit on the bench in front.
const TX = { x: 40, y: 40, w: 50, d: 32, r: 7 };
const TX_Z0 = 1.2;
const TX_Z1 = 9.5;
const STICKS = { left: [TX.x + 13, TX.y + 17], right: [TX.x + TX.w - 13, TX.y + 17] };
const STICK_Z = TX_Z1 + 1.2;
const STICK_L = 7.5;
const SCREEN = { x: TX.x + 19.5, y: TX.y + 6, w: 11, d: 18, r: 1 };
const GAUGE = [-48, 62];
const GAUGE_R = 17;
const GAUGE_Z = 9;
const GAUGE_SPAN = 10; // ± newtons full scale
const GAUGE_SWEEP = 135; // degrees either side of zero

export const P = k.fitProjection(
  [...k.boxCorners(BASE, -BASE_H - FOOT_H, 0), [0, 0, 112], [MOTOR_R * 0.72 + PROP_R, MOTOR_R * 0.72 + PROP_R, 97], [-MOTOR_R * 0.72 - PROP_R, -MOTOR_R * 0.72 - PROP_R, 97], [MOTOR_R * 0.72 + PROP_R, -MOTOR_R * 0.72 - PROP_R, 97], [-MOTOR_R * 0.72 - PROP_R, MOTOR_R * 0.72 + PROP_R, 97]],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: AZIMUTH, elevation: ELEVATION },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

export const R = A.recorder(P);
const put = (item) => R.put({ ...item, layer: item.layer ?? "back", shapes: item.shapes.map((shape, index) => R.solid(Object.assign(shape, { name: shape.name ?? (index ? `${item.name}#${index + 1}` : item.name) }))) });

// ─────────────────────────────── static bench ───────────────────────────────
function bench() {
  for (const [x, y] of k.corners(BASE, 20)) {
    const svg = S(k.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }) + S(k.cylinder(x, y, 6.2, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" });
    put({ name: `stand.foot.${x}.${y}`, at: [x, y, -BASE_H - FOOT_H], svg, shapes: [A.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.6, { ground: true }), A.cylinder(x, y, 6.2, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6)] });
  }
  const screws = k.corners(BASE, 8);
  const strip = { x: BASE.x + 14, y: BASE.y + 7, w: 150, d: 7, r: 1 };
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y, 0.6, [1.8, 3.2], P);
  const label = { x: BASE.x + BASE.w - 52, y: BASE.y + 6, w: 42, d: 13, r: 1.5 };
  const svg = [
    S(k.slabOf(BASE, -BASE_H, BASE_H, P, 9, 1.6), { tone: "mid", inner: L(k.sideSeam(BASE, -BASE_H + 4, P, 9), { tone: "faint" }) }),
    L(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: "faint" }),
    L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }),
    D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }),
    S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }),
    L(ticks.minor, { tone: "lo" }),
    L(ticks.major, { tone: "mid" }),
    D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }),
    S(k.slabOf(label, 0, 0.6, P, 3, 0.3), { tone: "lo" }),
    L([3.6, 6.4, 9.2].map((y, i) => k.lineOnTop([label.x + 4, label.y + y], [label.x + (i ? 30 : 38), label.y + y], 0.6, P)).join(""), { tone: "faint", free: true }),
    D([[label.x + 1.8, label.y + 1.8], [label.x + label.w - 1.8, label.y + 1.8], [label.x + 1.8, label.y + label.d - 1.8], [label.x + label.w - 1.8, label.y + label.d - 1.8]].map(([x, y]) => at([x, y, 0.6])), { size: 0.4 }),
  ].join("");
  put({ name: "stand.base", at: [0, 0, -BASE_H], svg, shapes: [A.slab(BASE, -BASE_H, BASE_H, { ground: true })] });
}

// The post: a flange, an S-beam load cell, a tube, a lock collar and a cap. The
// yaw bearing on top of it belongs to the gimbal.
const LC = { x: -8, y: -6, w: 16, d: 12, r: 1.5 };
const LC_Z0 = 3;
const LC_Z1 = 17;
const LC_PORT = [LC.x + LC.w, 0, 7];
function post() {
  const flange = VERT(0, 0);
  const fl = G.disc(0, LC_Z0, 17, flange, P);
  const flSvg = S(fl, { tone: "mid", inner: L(G.arcOf(flange, 1.2, 17, P, { least: 0 }), { tone: "faint" }) }) + D(G.dotsOf(flange, LC_Z0, 14, 8, P, { all: true, phase: 0.39 }), { size: 0.5 }) + L(G.circleOf(flange, LC_Z0, 11.4, P, 64), { tone: "faint" });
  put({ name: "stand.flange", at: [0, 0, 0], bias: 1, svg: flSvg, shapes: [A.disc(flange, 0, LC_Z0, 17, { name: "stand.flange" })] });
  const lcSvg = [
    S(k.slabOf(LC, LC_Z0, LC_Z1 - LC_Z0, P, 3, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(LC, LC_Z0 + 4.6, P, 3) + k.sideSeam(LC, LC_Z1 - 4.6, P, 3), { tone: "faint" }) }),
    L(k.planOutline(k.insetPlan(LC, 2.4), LC_Z1, P, 3), { tone: "faint" }),
    D([[LC.x + 3, LC.y + 3], [LC.x + LC.w - 3, LC.y + LC.d - 3], [LC.x + 3, LC.y + LC.d - 3], [LC.x + LC.w - 3, LC.y + 3]].map(([x, y]) => at([x, y, LC_Z1])), { size: 0.45 }),
  ].join("");
  put({ name: "stand.loadcell", at: [0, 0, LC_Z0], bias: 2, svg: lcSvg, shapes: [A.slab(LC, LC_Z0, LC_Z1 - LC_Z0, {}, 3)] });
  // The cable gland on the load cell's side.
  const GF = frameOf(LC_PORT, [1, 0, 0], [0, 0, 1]);
  const gland = G.solidOf([[0, 2.2], [1.6, 2.2], [1.6, 1.6], [3.4, 1.4]], GF, P);
  put({ name: "stand.gland", at: G.pointOf(GF, 1.7, 0, 0), bias: 0.5, svg: S(gland, { tone: "mid" }) + L(G.ribsOf(GF, 0.2, 1.4, 2.2, 10, P, { seams: false }), { tone: "lo" }), shapes: [A.solid(GF, [[0, 2.2], [1.6, 2.2], [1.6, 1.6], [3.4, 1.4]], { name: "stand.gland", owner: "stand.cable" })] });
  const tube = VERT(0, 0);
  const tubeSvg_ = S(G.disc(LC_Z1, 52, 5, tube, P), { tone: "mid", crease: "none", inner: L([26, 44].map((z) => G.arcOf(tube, z, 5, P, { least: 0 })).join(""), { tone: "faint" }) });
  put({ name: "stand.tube", at: [0, 0, LC_Z1], bias: 3, svg: tubeSvg_, shapes: [A.disc(tube, LC_Z1, 52, 5, { name: "stand.tube" })] });
  const collar = S(G.disc(52, 58.5, 7, tube, P), { tone: "mid" });
  const ribs = G.ribsOf(tube, 52.8, 57.7, 7, 64, P, { fade: [0.08, 0.5], seams: true });
  const capSvg = S(G.disc(58.5, POST_TOP, 6, tube, P), { tone: "mid" }) + D(G.dotsOf(tube, POST_TOP, 4.4, 4, P, { all: true, phase: 0.78 }), { size: 0.4 });
  put({ name: "stand.collar", at: [0, 0, 52], bias: 4, svg: collar + k.fadedSvg(ribs, { tone: "lo" }), shapes: [A.disc(tube, 52, 58.5, 7, { name: "stand.collar" })] });
  put({ name: "stand.cap", at: [0, 0, 58.5], bias: 5, svg: capSvg, shapes: [A.disc(tube, 58.5, POST_TOP, 6, { name: "stand.cap" })] });
  // Thumb screw on the collar, facing the viewer.
  const toward = k.towardViewer(P);
  const ta = Math.atan2(toward[1], toward[0]) + 0.5;
  const TF = frameOf([7 * Math.cos(ta), 7 * Math.sin(ta), 55.25], [Math.cos(ta), Math.sin(ta), 0], [0, 0, 1]);
  const thumbProfile = [[0, 1.3], [1.8, 1.3], [1.8, 2.8], [4.2, 2.8]];
  put({ name: "stand.thumb", at: G.pointOf(TF, 2, 0, 0), bias: 6, svg: S(G.solidOf(thumbProfile, TF, P), { tone: "mid" }) + k.fadedSvg(G.ribsOf(TF, 2.1, 3.9, 2.8, 18, P, { fade: [0.08, 0.5], seams: true }), { tone: "lo" }), shapes: [A.solid(TF, thumbProfile, { name: "stand.thumb" })] });
}

// The cable from the load cell to the gauge lies on the bench.
const CABLE_R = 1;
function cable() {
  const start = [LC_PORT[0], 0, LC_PORT[2]];
  const end = [GAUGE[0], GAUGE[1] - GAUGE_R - 1, 4.5];
  const route = G.fillet([start, [24, 0, LC_PORT[2]], [24, 18, 4.5], [24, 38, 4.5], [end[0], 38, 4.5], end], 10, 12);
  const total = G.pathLength(route);
  const gaps = [[0, 3.4], [total - 3.2, total]];
  const pieces = tubePieces(route, CABLE_R, P, { maxLength: 14, gaps, caps: [false, false] });
  for (const [index, piece] of pieces.entries()) {
    put({ name: R.nameFor("stand.cable.chunk"), at: piece.mid, route: "stand.cable", chunk: index, svg: tubeSvg(piece, { tone: "mid" }), shapes: [A.tube(piece.points, CABLE_R, { owner: "stand.cable" })] });
  }
  R.route("stand.cable", route, CABLE_R, { owner: "stand.cable", gaps, limp: true, touch: ["stand.base", "stand.gland", "stand.gauge.boot", "stand.loadcell", "stand.gauge.body"] });
}

// A dial gauge on the bench reads what the load cell feels: thrust minus weight.
const gaugeNeedle = (newtons) => {
  const v = Math.max(-GAUGE_SPAN * 1.08, Math.min(GAUGE_SPAN * 1.08, newtons));
  const a = (v / GAUGE_SPAN) * GAUGE_SWEEP * D2R + Math.PI; // zero points away from the viewer
  const [x, y] = GAUGE;
  const dir = [Math.sin(a), -Math.cos(a)];
  return k.lineOnTop([x - dir[0] * 3.6, y - dir[1] * 3.6], [x + dir[0] * (GAUGE_R - 4.6), y + dir[1] * (GAUGE_R - 4.6)], GAUGE_Z + 2.2, P);
};
function gauge() {
  const [x, y] = GAUGE;
  const F = VERT(x, y);
  const z1 = GAUGE_Z + 2;
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - GAUGE_R, y: y - GAUGE_R, w: 2 * GAUGE_R, d: 2 * GAUGE_R, r: GAUGE_R }, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(G.disc(0, 1.6, GAUGE_R + 2.4, F, P), { tone: "lo" }));
  out.push(S(G.disc(1.6, GAUGE_Z, GAUGE_R + 1, F, P), { tone: "mid", inner: L(G.arcOf(F, 4.6, GAUGE_R + 1, P, { least: 0 }), { tone: "faint" }) }));
  out.push(S(G.disc(GAUGE_Z, z1, GAUGE_R, F, P), { tone: "hi", crease: "lo" }));
  out.push(k.fadedSvg(G.ribsOf(F, GAUGE_Z + 0.2, z1 - 0.2, GAUGE_R, 90, P, { fade: [0.08, 0.5], seams: false }), { tone: "lo" }));
  out.push(L(G.circleOf(F, z1, GAUGE_R - 1.6, P, 96), { tone: "lo" }));
  const from = Math.PI - GAUGE_SWEEP * D2R;
  const ticks = k.radialTicks(x, y, GAUGE_R - 2.4, 20, 5, z1, [1.2, 2.6], P, from, 2 * GAUGE_SWEEP * D2R);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const zero = [x + Math.sin(Math.PI) * (GAUGE_R - 2.4), y - Math.cos(Math.PI) * (GAUGE_R - 2.4)];
  out.push(L(k.lineOnTop(zero, [x + Math.sin(Math.PI) * (GAUGE_R - 5.6), y - Math.cos(Math.PI) * (GAUGE_R - 5.6)], z1, P), { tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y - 6.5], z1, P, "x"), "N", { size: 3, tone: "lo", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([x - 7.5, y + 4], z1, P, "x"), "−", { size: 3.2, tone: "lo", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([x + 7.5, y + 4], z1, P, "x"), "+", { size: 3.2, tone: "lo", anchor: "middle" }));
  out.push(L(G.circleOf(F, z1, 1.8, P, 20), { tone: "mid" }));
  put({ name: "stand.gauge", at: [x, y, 0], bias: 0, svg: out.join(""), shapes: [A.disc(F, 0, 1.6, GAUGE_R + 2.4, { name: "stand.gauge.foot", ground: true }), A.disc(F, 1.6, GAUGE_Z, GAUGE_R + 1, { name: "stand.gauge.body" }), A.disc(F, GAUGE_Z, z1, GAUGE_R, { name: "stand.gauge.bezel" })] });
  // A cable boot on the gauge's back edge.
  const BF = frameOf([x, y - GAUGE_R - 1, 4.5], [0, -1, 0], [0, 0, 1]);
  const boot = [[0, 1.8], [1.4, 1.8], [3.2, 1.35]];
  put({ name: "stand.gauge.boot", at: G.pointOf(BF, 1.6, 0, 0), bias: 0, svg: S(G.solidOf(boot, BF, P), { tone: "mid" }), shapes: [A.solid(BF, boot, { name: "stand.gauge.boot", owner: "stand.cable" })] });
}

// The radio: two gimbal sticks (mode 2: throttle and yaw on the left, pitch and roll
// on the right), a telemetry screen with four motor bars, switches and trims.
const stickTip = (side, x, y) => {
  const [cx, cy] = STICKS[side];
  const lean = 24 * D2R;
  const ax = Math.sin(lean * x);
  const ay = Math.sin(lean * y);
  return [cx + STICK_L * ax, cy + STICK_L * ay, STICK_Z + STICK_L * Math.sqrt(Math.max(0, 1 - ax * ax - ay * ay))];
};
const stickPath = (side, x, y) => k.segment([...STICKS[side], STICK_Z], stickTip(side, x, y), P);
// Screen bars: four motor speeds as bars along +x, one row per motor.
const BAR = { x0: SCREEN.x + 2.2, len: SCREEN.w - 4.4, rows: [SCREEN.y + 3.6, SCREEN.y + 7.2, SCREEN.y + 10.8, SCREEN.y + 14.4], w: 1.6 };
const barPath = (i, share) => {
  const f = Math.max(0.02, Math.min(1, (share - 0.55) / 0.9));
  const y = BAR.rows[i];
  return k.onTop([[BAR.x0, y - BAR.w / 2], [BAR.x0 + BAR.len * f, y - BAR.w / 2], [BAR.x0 + BAR.len * f, y + BAR.w / 2], [BAR.x0, y + BAR.w / 2]], TX_Z1 + 0.05, P, true);
};
function transmitter() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(TX, TX_Z0, 0.1, P)}" style="filter:blur(3px)"/>`);
  for (const [x, y] of byDepth(k.corners(TX, 5))) out.push(S(k.cylinder(x, y, 2.4, 0, TX_Z0, P, 16), { tone: "lo" }));
  out.push(S(k.slabOf(TX, TX_Z0, TX_Z1 - TX_Z0, P, 6, 1), { tone: "mid", inner: L(k.sideSeam(TX, TX_Z0 + 3.4, P, 6), { tone: "faint" }) }));
  // Grip ribs along the near edge? No: a lanyard bar across the top face instead.
  out.push(L(k.planOutline(k.insetPlan(TX, 2.6), TX_Z1, P, 6), { tone: "faint" }));
  // Screen: a recessed window.
  out.push(S(k.slabOf(k.insetPlan(SCREEN, -1), TX_Z1, 0.3, P, 3), { tone: "lo", crease: "none" }));
  out.push(`<path class="tx-screen" d="${k.planOutline(SCREEN, TX_Z1 + 0.32, P, 3)}"/>`);
  out.push(...BAR.rows.map((y) => L(k.lineOnTop([BAR.x0, y], [BAR.x0 + BAR.len, y], TX_Z1 + 0.33, P), { tone: "faint", free: true })));
  out.push(BAR.rows.map((_, i) => `<path class="tx-bar" data-bar="${i}" d="${barPath(i, 1)}"/>`).join(""));
  M.MOTORS.forEach((m, i) => out.push(k.faceTextSvg(k.topMatrix([SCREEN.x + 1.1, BAR.rows[i] + 0.55], TX_Z1 + 0.33, P, "x"), String(m.id), { size: 1.5, tone: "lo", anchor: "middle" })));
  // Gimbal bezels and their sticks' boots.
  for (const side of ["left", "right"]) {
    const [x, y] = STICKS[side];
    out.push(S(k.cylinder(x, y, 7.2, TX_Z1, 0.7, P, 40, 0.4), { tone: "mid" }));
    out.push(L(k.ring(x, y, 5.6, TX_Z1 + 0.7, P, 36), { tone: "faint" }));
    out.push(D(k.corners({ x: x - 8.6, y: y - 8.6, w: 17.2, d: 17.2, r: 0 }, 0.9).map(([sx, sy]) => at([sx, sy, TX_Z1])), { size: 0.4 }));
    out.push(S(k.cylinder(x, y, 3, TX_Z1 + 0.7, 0.5, P, 24), { tone: "lo" }));
    out.push(`<g data-stick="${side}"><path class="iso-line tx-shaft" data-tone="mid" data-part="shaft" data-free="" d="${stickPath(side, 0, 0)}"/><g data-part="knob" transform="${k.translateAlong(P, G.sub3(stickTip(side, 0, 0), [x, y, STICK_Z + STICK_L]))}">${S(k.cylinder(x, y, 1.9, STICK_Z + STICK_L - 0.4, 2.6, P, 20), { tone: "hi", crease: "lo" })}${k.knurl(x, y, 1.9, STICK_Z + STICK_L - 0.2, STICK_Z + STICK_L + 2.0, 14, P) ? L(k.knurl(x, y, 1.9, STICK_Z + STICK_L - 0.1, STICK_Z + STICK_L + 2.1, 14, P), { tone: "lo" }) : ""}</g></g>`);
  }
  // Trim slots beside each stick, switches at the back corners, power button.
  for (const side of ["left", "right"]) {
    const [x, y] = STICKS[side];
    const slot = { x: x - 1, y: y - 7, w: 2, d: 14, r: 1 };
    const across = { x: side === "left" ? x - 10.4 : x + 8.4, y: y - 5.5, w: 2, d: 11, r: 1 };
    void across;
    out.push(L(k.planOutline({ x: x - 5.5, y: TX.y + TX.d - 3.6, w: 11, d: 1.8, r: 0.9 }, TX_Z1, P, 3), { tone: "lo" }));
    void slot;
  }
  for (const [sx, sy] of [[TX.x + 7, TX.y + 4.6], [TX.x + TX.w - 7, TX.y + 4.6]]) {
    out.push(S(k.cylinder(sx, sy, 1.6, TX_Z1, 0.8, P, 16), { tone: "lo" }));
    out.push(S(k.cylinder(sx, sy - 0.8, 0.5, TX_Z1 + 0.8, 3.2, P, 10), { tone: "mid", crease: "none" }));
    out.push(D([at([sx, sy - 0.8, TX_Z1 + 4])], { size: 0.55, tone: "hi" }));
  }
  out.push(S(k.cylinder(TX.x + 25, TX.y + TX.d - 4.2, 1.5, TX_Z1, 0.5, P, 16), { tone: "lo" }));
  out.push(D([at([TX.x + 25, TX.y + TX.d - 4.2, TX_Z1 + 0.5])], { size: 0.5, tone: "mid" }));
  // Antenna folded flat along the back edge on a hinge block.
  const HB = { x: TX.x + 4, y: TX.y - 3.2, w: 6, d: 3.2, r: 0.8 };
  out.push(S(k.slabOf(HB, TX_Z0 + 2, 4.2, P, 2, 0.3), { tone: "mid" }));
  const AF = frameOf([HB.x + HB.w, HB.y + 1.6, TX_Z0 + 4.1], [1, 0, 0], [0, 0, 1]);
  const antenna = [[0, 1.3], [26, 1.1, 1], [36, 0.9, 1], [36.6, 0]];
  out.push(S(G.solidOf(antenna, AF, P), { tone: "mid" }));
  out.push(L(G.arcOf(AF, 8, 1.24, P), { tone: "faint" }));
  put({ name: "tx.body", at: [TX.x + TX.w / 2, TX.y + TX.d / 2, TX_Z0], svg: out.join(""), shapes: [A.slab(TX, TX_Z0, TX_Z1 - TX_Z0, {}, 6), A.slab(HB, TX_Z0 + 2, 4.2, { name: "tx.hinge" }, 2), A.solid(AF, antenna, { name: "tx.antenna" }), ...k.corners(TX, 5).map(([x, y], i) => A.cylinder(x, y, 2.4, 0, TX_Z0, { name: `tx.foot.${i}`, ground: true }))] });
}

// ─────────────────────────────── the gimbal and the drone ───────────────────────────────
export const T = turning(P, { recorder: R });
const yaw = T.group("yaw", { turn: { pivot: [0, 0] } });
const pitch = T.group("pitch", { parent: yaw, hinge: { point: [0, 0, PIVOT_Z], axis: [0, 1, 0], range: [-TILT, TILT] } });
const roll = T.group("roll", { parent: pitch, hinge: { point: [0, 0, PIVOT_Z], axis: [1, 0, 0], range: [-TILT, TILT] } });
const props = MOTOR_AT.map((m) => T.group(`prop${m.id}`, { parent: roll, hinge: { point: [m.c[0], m.c[1], 0], axis: [0, 0, 1], range: [0, 180] } }));
const drone = T.layer("drone");
T.stack(["back", "drone", "front"]);

// follow: figure values → group values. heading is clockwise seen from above.
export const follow = (v) => ({ yaw: -(v.heading ?? 0), pitch: v.pitch ?? 0, roll: v.roll ?? 0, prop1: v.prop1 ?? 0, prop2: v.prop2 ?? 0, prop3: v.prop3 ?? 0, prop4: v.prop4 ?? 0 });
const wrap = (x) => ((x % 180) + 180) % 180;
export const poses = () => {
  const out = [];
  for (let i = 0; i < 720; i++) {
    const t = i / 720;
    out.push(follow({ heading: i * 0.5, pitch: TILT * Math.sin(t * Math.PI * 14), roll: TILT * Math.sin(t * Math.PI * 22 + 1), prop1: wrap(i * 7), prop2: wrap(i * 11 + 40), prop3: wrap(-i * 9 + 90), prop4: wrap(-i * 13 + 20) }));
  }
  for (const p of [-TILT, 0, TILT]) for (const r of [-TILT, 0, TILT]) for (let h = 0; h < 360; h += 15) out.push(follow({ heading: h, pitch: p, roll: r, prop1: wrap(h * 3), prop2: wrap(h * 5), prop3: wrap(h * 7), prop4: wrap(h * 9) }));
  return out;
};

const Y = { group: yaw, layer: drone };
const Pg = { group: pitch, layer: drone };
const Rg = { group: roll, layer: drone };

// Yaw: a bearing on the post, a yoke base and two cheeks carrying the pitch axle.
T.round({ name: "gimbal.bearing", ...Y, F: VERT(0, 0), s0: POST_TOP, s1: POST_TOP + 2.5, r: 8, tone: "mid", material: "steel", details: { seams: [POST_TOP + 1.1], bolts: [{ s: POST_TOP + 2.5, r: 6.6, count: 6, size: 0.42, phase: 0.2 }] } });
T.prism({ name: "gimbal.yoke", ...Y, plan: { x: -3.5, y: -9.4, w: 7, d: 18.8, r: 1 }, z: POST_TOP + 2.5, h: 2.5, steps: 3, bevel: 0.4, tone: "mid", material: "steel" });
for (const side of [-1, 1]) {
  const y0 = side > 0 ? 6.2 : -8.6;
  T.prism({ name: `gimbal.cheek${side > 0 ? "+" : "-"}`, ...Y, plan: { x: -3.5, y: y0, w: 7, d: 2.4, r: 0.6 }, z: POST_TOP + 5, h: PIVOT_Z + 4 - POST_TOP - 5, steps: 3, bevel: 0.3, tone: "mid", material: "steel" });
  T.round({ name: `gimbal.pitchcap${side > 0 ? "+" : "-"}`, ...Y, F: frameOf([0, side * 8.6, PIVOT_Z], [0, side, 0], [0, 0, 1]), s0: 0, s1: 0.8, r: 2.4, tone: "mid", material: "brass", details: { dots: [{ at: [0.8, 0, 0], normal: [0, side, 0], size: 0.45 }] } });
}
// Pitch: the spider block and its trunnions in the yaw cheeks.
T.prism({ name: "gimbal.spider", ...Pg, plan: { x: -5, y: -5, w: 10, d: 10, r: 1.4 }, z: PIVOT_Z - 3, h: 6, steps: 3, bevel: 0.4, tone: "hi", crease: "lo", material: "brass" });
for (const side of [-1, 1]) T.round({ name: `gimbal.pitchpin${side > 0 ? "+" : "-"}`, ...Pg, F: frameOf([0, side * 5, PIVOT_Z], [0, side, 0], [0, 0, 1]), s0: 0, s1: 1.2, r: 2.1, tone: "mid", material: "steel" });
// Roll: trunnions on the spider, cheeks hanging from the frame.
for (const side of [-1, 1]) {
  T.round({ name: `gimbal.rollpin${side > 0 ? "+" : "-"}`, ...Rg, F: frameOf([side * 5, 0, PIVOT_Z], [side, 0, 0], [0, 0, 1]), s0: 0, s1: 1.2, r: 2.1, tone: "mid", material: "steel" });
  const x0 = side > 0 ? 6.2 : -8.6;
  T.prism({ name: `gimbal.hanger${side > 0 ? "+" : "-"}`, ...Rg, plan: { x: x0, y: -3.5, w: 2.4, d: 7, r: 0.6 }, z: PIVOT_Z - 4, h: BODY_Z - PIVOT_Z + 4, steps: 3, bevel: 0.3, tone: "mid", material: "steel" });
  T.round({ name: `gimbal.rollcap${side > 0 ? "+" : "-"}`, ...Rg, F: frameOf([side * 8.6, 0, PIVOT_Z], [side, 0, 0], [0, 0, 1]), s0: 0, s1: 0.8, r: 2.4, tone: "mid", material: "brass", details: { dots: [{ at: [0.8, 0, 0], normal: [side, 0, 0], size: 0.45 }] } });
}

// The frame: bottom plate, four arms, top plate, standoffs.
const BOTTOM = { x: -21, y: -13, w: 42, d: 26, r: 4 };
const TOP = { x: -19, y: -12, w: 38, d: 24, r: 4 };
T.prism({ name: "frame.bottom", ...Rg, plan: BOTTOM, z: BODY_Z, h: ARM_Z0 - BODY_Z, steps: 4, bevel: 0.3, tone: "mid", material: "gunmetal" });
const ARM_W = 7;
const ARM_IN = 9;
const ARM_OUT = MOTOR_R + 3.5;
for (const m of MOTOR_AT) {
  const poly = [[ARM_IN, -ARM_W / 2], [ARM_OUT - 3.4, -ARM_W / 2], [ARM_OUT, -1.2], [ARM_OUT, 1.2], [ARM_OUT - 3.4, ARM_W / 2], [ARM_IN, ARM_W / 2]].map((p) => rot(p, m.a));
  const along = (r, side = 0) => [r * Math.cos(m.a) - side * Math.sin(m.a), r * Math.sin(m.a) + side * Math.cos(m.a)];
  const screws = [26, 33].map((r) => along(r));
  T.prism({ name: `frame.arm${m.id}`, ...Rg, F: FLAT, polygon: poly, s0: ARM_Z0, s1: ARM_Z1, round: 0.6, steps: 3, bevel: 0.3, tone: "hi", crease: "lo", material: "gunmetal", details: { dots: [] } });
  void screws;
}
T.prism({ name: "frame.top", ...Rg, plan: TOP, z: ARM_Z1, h: TOP_Z1 - ARM_Z1, steps: 4, bevel: 0.35, tone: "mid", material: "gunmetal", details: { dots: k.corners(TOP, 2.6).map(([x, y]) => ({ at: [TOP_Z1, x, y], normal: [0, 0, 1], size: 0.45 })), rings: k.corners(TOP, 2.6).map(([x, y]) => ({ at: [TOP_Z1, x, y], normal: [0, 0, 1], r: 1.1, tone: "lo" })) } });
for (const [x, y] of [[17, 0], [-17, 0], [0, 10.2], [0, -10.2]]) T.round({ name: `frame.standoff.${x}.${y}`, ...Rg, F: VERT(x, y), s0: ARM_Z0, s1: ARM_Z1, r: 1.3, tone: "mid", material: "steel" });

// Battery on a pad, held by a strap with a buckle.
const PAD = { x: -15, y: -8.6, w: 30, d: 17.2, r: 1.5 };
const BATT = { x: -15, y: -9, w: 30, d: 18, r: 2 };
const BATT_Z0 = TOP_Z1 + 0.6;
const BATT_Z1 = BATT_Z0 + 9;
T.prism({ name: "battery.pad", ...Rg, plan: PAD, z: TOP_Z1, h: 0.6, steps: 2, tone: "lo", material: "rubber" });
const battery = T.prism({ name: "battery.pack", ...Rg, plan: BATT, z: BATT_Z0, h: BATT_Z1 - BATT_Z0, steps: 4, bevel: 0.6, tone: "hi", crease: "lo", details: { seams: [BATT_Z0 + 1.4, BATT_Z1 - 1.4] } });
T.plane({ part: battery, o: [BATT.x + 7, BATT.y + 3.2, BATT_Z1 + 0.01], u: [1, 0, 0], v: [0, 1, 0], svg: [3.2, 6.4, 9.6].map((y, i) => `<path class="iso-line" data-tone="faint" data-free="" d="M0 ${y}L${i ? 9 : 13} ${y}"/>`).join("") + `<text class="iso-face-text" data-tone="lo" font-size="2.4" transform="translate(0 15)">4S · 5200</text>` });
const STRAP_X = 1.5;
T.prism({ name: "battery.strap.top", ...Rg, plan: { x: STRAP_X, y: -9.6, w: 5, d: 19.2, r: 0.3 }, z: BATT_Z1, h: 0.6, steps: 2, tone: "lo", material: "rubber" });
for (const side of [-1, 1]) T.prism({ name: `battery.strap${side > 0 ? "+" : "-"}`, ...Rg, plan: { x: STRAP_X, y: side > 0 ? 9 : -9.6, w: 5, d: 0.6, r: 0.1 }, z: TOP_Z1, h: BATT_Z1 - TOP_Z1, steps: 2, tone: "lo", material: "rubber" });
T.prism({ name: "battery.buckle", ...Rg, plan: { x: STRAP_X + 0.6, y: -3.2, w: 3.8, d: 6.4, r: 0.6 }, z: BATT_Z1 + 0.6, h: 0.9, steps: 2, bevel: 0.2, tone: "mid", material: "steel" });

// GPS mast at the back.
const MAST = [-17.2, 0];
T.round({ name: "gps.foot", ...Rg, F: VERT(...MAST), s0: TOP_Z1, s1: TOP_Z1 + 1.4, r: 1.7, tone: "mid", material: "gunmetal" });
T.round({ name: "gps.mast", ...Rg, F: VERT(...MAST), s0: TOP_Z1 + 1.4, s1: 104, r: 0.75, tone: "mid", material: "steel" });
const puck = T.round({ name: "gps.puck", ...Rg, F: VERT(...MAST), s0: 104, s1: 106.6, r: [5.6, 4.8], tone: "hi", crease: "lo", details: { seams: [104.8] } });
T.plane({ part: puck, o: [MAST[0], MAST[1], 106.61], u: [1, 0, 0], v: [0, 1, 0], svg: `<path class="iso-line" data-tone="lo" d="M-2.2 -1.4L1.8 0L-2.2 1.4L-1.2 0Z"/>` });

// Camera under the nose.
const CAM = { x: 14, y: -4.5, w: 7.5, d: 9, r: 1.2 };
T.prism({ name: "camera.body", ...Rg, plan: CAM, z: BODY_Z - 6.5, h: 6.5, steps: 3, bevel: 0.35, tone: "mid", material: "gunmetal", details: { seams: [BODY_Z - 1.4] } });
T.round({ name: "camera.barrel", ...Rg, F: frameOf([CAM.x + CAM.w, 0, BODY_Z - 3.4], [1, 0, 0], [0, 0, 1]), s0: 0, s1: 2.2, r: 2.9, tone: "mid", material: "gunmetal", details: { seams: [0.8] } });
T.round({ name: "camera.lens", ...Rg, F: frameOf([CAM.x + CAM.w, 0, BODY_Z - 3.4], [1, 0, 0], [0, 0, 1]), s0: 2.2, s1: 2.8, r: 2.1, tone: "hi", material: "chrome", details: { rings: [{ at: [2.8, 0, 0], normal: [1, 0, 0], r: 1.1, tone: "lo" }] } });

// Each arm: an ESC, a leg with a rubber foot, a motor mount, a stator; each prop group
// carries the bell, the prop adapter, the hub, two blades and the nut.
const MOUNT_Z1 = ARM_Z1 + 1.2;
const STATOR_Z1 = MOUNT_Z1 + 1.6;
const BELL_Z1 = STATOR_Z1 + 5.6;
const CAP_Z1 = BELL_Z1 + 0.8;
const ADAPT_Z1 = CAP_Z1 + 0.8;
const HUB_Z1 = ADAPT_Z1 + 1.8;
const BLADE_Z0 = ADAPT_Z1 + 0.5;
const BLADE_Z1 = BLADE_Z0 + 0.7;
export const BLADE_Z = (BLADE_Z0 + BLADE_Z1) / 2;
const LEG_R = 25;
const FOOT_Z = 75;
const BLADE = [[2.6, -1.5], [6, -2.4], [11, -2.65], [17, -2.05], [21.6, -1.1], [PROP_R, 0], [21.9, 0.85], [16.5, 1.55], [10, 1.85], [5, 1.75], [2.6, 1.3]];
for (const [i, m] of MOTOR_AT.entries()) {
  const [cx, cy] = m.c;
  const tag = `arm${m.id}`;
  const dir = [Math.cos(m.a), Math.sin(m.a)];
  const along = (r, side = 0) => [r * dir[0] - side * dir[1], r * dir[1] + side * dir[0]];
  // ESC on the arm.
  const esc = [[20.5, -2.4], [30, -2.4], [30, 2.4], [20.5, 2.4]].map((p) => rot(p, m.a));
  T.prism({ name: `${tag}.esc`, ...Rg, F: FLAT, polygon: esc, s0: ARM_Z1, s1: ARM_Z1 + 1.8, round: 0.5, steps: 2, bevel: 0.25, tone: "mid", details: { seams: [ARM_Z1 + 0.6] } });
  // Leg and foot.
  const [lx, ly] = along(LEG_R);
  T.round({ name: `${tag}.leg`, ...Rg, F: VERT(lx, ly), s0: FOOT_Z + 1.2, s1: ARM_Z0, r: 1, tone: "mid", material: "steel" });
  T.round({ name: `${tag}.foot`, ...Rg, F: VERT(lx, ly), s0: FOOT_Z, s1: FOOT_Z + 1.2, r: 1.8, ends: ["dome", "flat"], tone: "lo", material: "rubber" });
  // Motor mount and stator.
  T.round({ name: `${tag}.mount`, ...Rg, F: VERT(cx, cy), s0: ARM_Z1, s1: MOUNT_Z1, r: 6.4, tone: "mid", material: "gunmetal", details: { bolts: [{ s: MOUNT_Z1, r: 5.8, count: 4, size: 0.42, phase: m.a + Math.PI / 4 }] } });
  T.round({ name: `${tag}.stator`, ...Rg, F: VERT(cx, cy), s0: MOUNT_Z1, s1: STATOR_Z1, r: 5, tone: "lo", material: "gunmetal" });
  // The spinning parts.
  const PG = { group: props[i], layer: drone };
  T.round({ name: `${tag}.bell`, ...PG, F: VERT(cx, cy), s0: STATOR_Z1, s1: BELL_Z1, r: 5.6, tone: "hi", crease: "lo", material: "chrome", details: { ribs: { s0: STATOR_Z1 + 1.2, s1: BELL_Z1 - 1, count: 24, fade: [0.1, 0.55], seams: true, tone: "lo" } } });
  T.round({ name: `${tag}.cap`, ...PG, F: VERT(cx, cy), s0: BELL_Z1, s1: CAP_Z1, r: [5.6, 4.6], tone: "mid", material: "chrome", details: { bolts: [{ s: CAP_Z1, r: 3.4, count: 4, size: 0.4, phase: 0.3 }] } });
  T.round({ name: `${tag}.adapter`, ...PG, F: VERT(cx, cy), s0: CAP_Z1, s1: ADAPT_Z1, r: 1.9, tone: "mid", material: "steel" });
  T.round({ name: `${tag}.hub`, ...PG, F: VERT(cx, cy), s0: ADAPT_Z1, s1: HUB_Z1, r: 2.6, tone: "hi", crease: "lo", lit: true });
  T.round({ name: `${tag}.nut`, ...PG, F: VERT(cx, cy), s0: HUB_Z1, s1: HUB_Z1 + 0.8, r: 1.6, ends: ["flat", "dome"], tone: "mid", material: "chrome" });
  for (const half of [0, 1]) {
    const a = m.a + Math.PI / 2 + half * Math.PI;
    const u = [Math.cos(a), Math.sin(a), 0];
    const v = G.mul3([-Math.sin(a), Math.cos(a), 0], -m.spin);
    T.prism({ name: `${tag}.blade${half}`, ...PG, F: { o: [cx, cy, 0], a: [0, 0, 1], u, v }, polygon: BLADE, s0: BLADE_Z0, s1: BLADE_Z1, round: 0, tone: "hi", crease: "lo", lit: true });
  }
}

bench();
post();
cable();
gauge();
transmitter();
const verify = argv.includes("--verify");
const out = T.build({ statics: R.items, poses, verify });
A.settle(R, P);
const layerOf = (name) => R.items.filter((item) => item.layer === name).sort((a, b) => a.key - b.key).map((item) => item.svg);
const BACK = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`, ...layerOf("back"), `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${gaugeNeedle(0)}" style="stroke-width:1"/>`];
const FRONT = layerOf("front");
if (argv.includes("--audit")) {
  A.auditOrExit(R, P);
  TA.orbitOrExit(T, R, P, {
    sweep: { at: (x) => follow({ heading: x }), from: 0, to: 360, frame: 0.5 },
    clips: [{ name: "tilt", at: (t) => follow({ heading: 30 * t, pitch: TILT * Math.sin(t * 2.1), roll: TILT * Math.sin(t * 1.3 + 0.5), prop1: wrap(t * 300), prop2: wrap(t * 340), prop3: wrap(-t * 320), prop4: wrap(-t * 280) }), from: 0, to: 6, frame: 1 / 30 }],
    quick: argv.includes("--quick"),
    only: argv.find((a) => a.startsWith("--only="))?.slice(7).split(",") ?? null,
    log: argv.includes("--verbose") ? (text) => console.log(`  … ${text}`) : null,
  });
}

const LABEL = "A quadcopter on a two-axis gimbal test stand. A post with a load cell carries a yaw bearing and a universal joint; the drone's carbon frame has four arms, each with a motor and a two-blade propeller, a battery under a strap, a GPS mast and a nose camera. A radio transmitter and a dial gauge sit on the bench. Changing the four motor speeds tilts, turns and lifts the drone.";
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: BACK });
const staticSvg = (list) => `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg iso-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${list.join("")}</svg>`;
const stage = `<div class="iso-stage iso-turn dr-stage" tabindex="0" role="application" aria-label="Quadcopter on a test stand: arrow keys pitch and roll, W and S change throttle, A and D yaw; drag on the figure to tilt it" aria-valuetext="hovering">${backSvg}${out.layerSvg("drone", { width: WIDTH, height: HEIGHT })}${staticSvg(FRONT)}</div>`;

const DATA = {
  turn: out.data,
  P,
  tilt: TILT,
  gauge: { at: GAUGE, r: GAUGE_R, z: GAUGE_Z, span: GAUGE_SPAN, sweep: GAUGE_SWEEP },
  sticks: { at: STICKS, z: STICK_Z, l: STICK_L },
  bar: BAR,
  screenZ: TX_Z1,
};
const modelSrc = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const FUNCS = `const follow = ${follow.toString()};\nconst gaugeNeedle = ${gaugeNeedle.toString()};\nconst stickTip = ${stickTip.toString()};\nconst stickPath = ${stickPath.toString()};\nconst barPath = ${barPath.toString()};\nconst D2R = Math.PI / 180;\nconst GAUGE = DATA.gauge.at, GAUGE_R = DATA.gauge.r, GAUGE_Z = DATA.gauge.z, GAUGE_SPAN = DATA.gauge.span, GAUGE_SWEEP = DATA.gauge.sweep;\nconst STICKS = DATA.sticks.at, STICK_Z = DATA.sticks.z, STICK_L = DATA.sticks.l, BAR = DATA.bar, TX_Z1 = DATA.screenZ;\nconst G = { sub3: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]] };\nconst k = { lineOnTop, segment, onTop, translateAlong };\n`;
const CSS = out.css + "\n" + readFileSync(join(HERE, "drone.css"), "utf8");
const LIVE = `const DATA = ${JSON.stringify(DATA)};\nconst P = DATA.P;\n${modelSrc}\n${FUNCS}\n${readFileSync(join(HERE, "live.js"), "utf8")}`;
const hover = M.state({});
const body = k.plateHtml({
  fig: "Fig 1",
  title: "How a quadcopter flies",
  hint: "Arrows tilt · W/S throttle · A/D yaw",
  readout: `hover · 4 × ${Math.round(hover.rpm[0]).toLocaleString("en-US")} rpm`,
  keys: [
    { mark: "lit", label: "Propellers: four speeds are the only controls" },
    { mark: "raised", label: "Gimbal stand: free to tilt and turn, not to fly away" },
  ],
  caption: `A ${M.MASS} kg quadcopter on a gimbal stand. It has no rudder and no flaps; the flight controller only changes four motor speeds. To hover, each 10-inch prop turns about ${(Math.round(M.HOVER_RPM / 10) * 10).toLocaleString("en-US")} rpm and lifts ${M.HOVER_T.toFixed(1)} N, a quarter of the ${M.WEIGHT.toFixed(1)} N weight. Speed up the rear pair and the nose dips; speed up the left pair and it rolls right; tilted, the thrust pushes it sideways. Diagonal props spin opposite ways so their torques cancel; speed up the two counter-clockwise props and the frame yaws clockwise. The gauge reads thrust minus weight from the load cell under the post.`,
  body: `<style>${CSS}</style>${stage}`,
});
const page = k.pageHtml({ title: "How a quadcopter flies", theme, body, script: kitScript() + turnScript() + LIVE, width: 700 });
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const name = `drone${verify ? "-verify" : ""}${theme === "light" ? "-light" : ""}.html`;
  writeFileSync(join(HERE, name), page);
  console.log(`wrote ${name} · ${(page.length / 1024).toFixed(0)} KB · ${out.report.parts} parts · ${out.report.layers.map((l) => `${l.name}: ${l.planar} planes, ${l.framed} framed, ${l.dynamic} dynamic`).join(" · ")} · build ${out.report.seconds.toFixed(1)} s`);
}
export { out };
