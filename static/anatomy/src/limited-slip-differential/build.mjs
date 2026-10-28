import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/nick/.gemini/config/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/home/nick/.gemini/config/skills/anatomy/kit/lathe.mjs";
import * as t from "/home/nick/.gemini/config/skills/anatomy/kit/tube.mjs";
import { kitScript } from "/home/nick/.gemini/config/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 960;
const HEIGHT = 580;

// Base plate / test dynamometer bed
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 12 };
const PLATE_H = 12;
const FOOT_H = 6;

// Center positions of the two differentials
// Centerline height Z = 38
const DIFF1_CX = -65;
const DIFF2_CX = 65;
const DIFF_Y = 0;
const DIFF_Z = 38;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [DIFF1_CX - 56, -35, DIFF_Z + 36],
    [DIFF1_CX + 56, 35, DIFF_Z + 36],
    [DIFF2_CX - 56, -35, DIFF_Z + 36],
    [DIFF2_CX + 56, 35, DIFF_Z + 36],
    [-24, -58, 20], [24, -20, 20]
  ],
  WIDTH,
  HEIGHT,
  { pad: 28, azimuth: 42, elevation: 32 }
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// Frames for Differential 1 and Differential 2
// Along X-axis: axis = [1, 0, 0], u = [0, 1, 0] (+Y), v = [0, 0, 1] (+Z)
const F1 = G.frameAlong([DIFF1_CX, DIFF_Y, DIFF_Z], [1, 0, 0]);
const F2 = G.frameAlong([DIFF2_CX, DIFF_Y, DIFF_Z], [1, 0, 0]);

// =========================================================================
// 1. BASE PLATE & MACHINE FOUNDATION
// =========================================================================
function drawBasePlate() {
  const out = [];
  // Soft halo underneath
  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);

  // Four leveling feet at corners
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7.5, -PLATE_H - FOOT_H, 2, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.8, -PLATE_H - FOOT_H + 2, FOOT_H - 2, P, 28), { tone: "mid" }));
  }

  // Main precision ground bedplate
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "lo" }));
  // Perimeter oil / coolant drainage groove
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4.5), 0, P, 8), { tone: "faint" }));

  // Corner T-slot hold-down studs
  const corners = k.corners(PLATE, 10);
  out.push(L(corners.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(corners.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }));

  // Front millimeter alignment ruler strip
  const strip = { x: -128, y: PLATE.y + PLATE.d - 13, w: 256, d: 6.5, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.2, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.2, 0.6])], { size: 0.45, tone: "mid" }));

  // Center engraved technical rating plaque
  const plaque = { x: -44, y: PLATE.y + PLATE.d - 25, w: 88, d: 9, r: 1.2 };
  out.push(S(k.slabOf(plaque, 0, 0.8, P, 3), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(plaque, 1.4), 0.8, P, 2), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([-38, plaque.y + 3], 0.8, P, "x"), "DYNAMOMETER TEST RIG · CLUTCH-PACK LSD VS TORSEN LSD", { size: 1.8, tone: "mid" }));
  out.push(L(k.lineOnTop([-38, plaque.y + 5.5], [38, plaque.y + 5.5], 0.8, P), { tone: "faint", free: true }));
  out.push(D([at([plaque.x + 2.5, plaque.y + 4.5, 0.8]), at([plaque.x + plaque.w - 2.5, plaque.y + 4.5, 0.8])], { size: 0.4, tone: "lo" }));

  return out.join("");
}

// =========================================================================
// 2. MODULAR BEARING PEDESTALS
// =========================================================================
function drawPedestal(bx) {
  const out = [];
  const basePlan = { x: bx - 7, y: -16, w: 14, d: 32, r: 2.2 };

  // Lower pedestal casting (height 0 to 36)
  out.push(S(k.slabOf(basePlan, 0, 36, P, 4, 0.8), { tone: "mid" }));
  out.push(L(k.sideSeam(basePlan, 18, P, 4), { tone: "faint" }));

  // Bottom hold-down anchor bolts
  for (const ay of [-12, 12]) {
    out.push(L(k.ring(bx, ay, 1.8, 36, P, 14), { tone: "lo" }));
    out.push(D([at([bx, ay, 36])], { size: 0.45, tone: "mid" }));
  }

  // Split bearing cap on top (from Z = 36 to Z = 47)
  const capPlan = { x: bx - 6.5, y: -12, w: 13, d: 24, r: 2 };
  out.push(S(k.slabOf(capPlan, 36, 11, P, 4, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.sideSeam(capPlan, 36.5, P, 4), { tone: "lo" }));

  // Two heavy cap studs on top
  for (const cy of [-7, 7]) {
    out.push(S(k.cylinder(bx, cy, 1.8, 47, 2.2, P, 16), { tone: "mid" }));
    out.push(D([at([bx, cy, 49.2])], { size: 0.4, tone: "hi" }));
  }

  // Center grease zerk fitting
  out.push(S(k.cylinder(bx, 0, 1.4, 47, 2.2, P, 16), { tone: "mid" }));
  out.push(S(k.cylinder(bx, 0, 0.9, 49.2, 1.4, P, 12), { tone: "hi", crease: "none" }));
  out.push(D([at([bx, 0, 50.6])], { size: 0.35, tone: "mid" }));

  return out.join("");
}

// =========================================================================
// 3. MODULAR BRAKE ROTOR & CALIPER ASSEMBLY
// =========================================================================
function drawBrakeAssembly(bx) {
  const out = [];
  const FB = G.frameAlong([bx, 0, DIFF_Z], [1, 0, 0]);

  // 1. Caliper mounting bracket down to bedplate (Y = -15, drawn first behind disc)
  out.push(S(k.slabOf({ x: bx - 3, y: -15, w: 6, d: 6, r: 1.2 }, 0, DIFF_Z + 10, P, 3, 0.5), { tone: "lo" }));

  // 2. Twin-Piston Brake Caliper (gripping top-rear quadrant of the rotor at Y = -16 to -3)
  const calPlan = { x: bx - 4, y: -16, w: 8, d: 13, r: 2 };
  out.push(S(k.slabOf(calPlan, DIFF_Z + 10, 14, P, 4, 0.6), { tone: "mid" }));
  // Caliper dual cylinder bosses
  out.push(S(k.cylinder(bx, -12, 3.2, DIFF_Z + 24, 2.5, P, 18), { tone: "mid" }));
  out.push(S(k.cylinder(bx, -6, 3.2, DIFF_Z + 24, 2.5, P, 18), { tone: "mid" }));
  // Hydraulic fluid banjo bolt
  out.push(S(k.cylinder(bx + 2, -14, 1.4, DIFF_Z + 24, 2.8, P, 14), { tone: "mid" }));
  out.push(D([at([bx + 2, -14, DIFF_Z + 26.8])], { size: 0.35, tone: "mid" }));

  // 3. Ventilated Brake Disc (Rotor track outer radius 20, thickness 3.6 at Y = 0)
  out.push(S(G.solidOf([[-1.8, 11], [-1.8, 20.5], [1.8, 20.5], [1.8, 11]], FB, P), { tone: "hi", crease: "lo" }));
  // Cross-drilled cooling hole pattern on disc face
  out.push(D(G.dotsOf(FB, 1.8, 14, 8, P, { least: 0.05 }), { size: 0.35, tone: "lo" }));
  out.push(D(G.dotsOf(FB, 1.8, 17.5, 10, P, { least: 0.05 }), { size: 0.35, tone: "lo" }));

  // 4. Rotor central mounting hat & 5 wheel lug nuts (on front face of rotor)
  out.push(S(G.solidOf([[-2.5, 7], [-2.5, 11], [2.5, 11], [2.5, 7]], FB, P), { tone: "mid" }));
  out.push(D(G.dotsOf(FB, 2.5, 8.8, 5, P, { all: true }), { size: 0.45, tone: "lit" }));

  return out.join("");
}

// Axle shaft segment
function drawShaftSegment(x0, x1) {
  const FS = G.frameAlong([0, 0, DIFF_Z], [1, 0, 0]);
  return S(G.solidOf([[x0, 6], [x1, 6]], FS, P), { tone: "hi" });
}

// Inner stub axle with companion drive flange
function drawInnerShaft(isLeft) {
  const out = [];
  const FS = G.frameAlong([0, 0, DIFF_Z], [1, 0, 0]);
  if (isLeft) {
    // Shaft from -34 to -26, flange from -26 to -24
    out.push(S(G.solidOf([[-34, 6], [-26, 6], [-26, 10], [-24, 10], [-24, 0]], FS, P), { tone: "hi", crease: "lo" }));
    out.push(D(G.dotsOf(G.frameAlong([-24, 0, DIFF_Z], [1, 0, 0]), 0, 8, 4, P, { all: true }), { size: 0.45, tone: "mid" }));
  } else {
    // Flange from 24 to 26, shaft from 26 to 34
    out.push(S(G.solidOf([[24, 0], [24, 10], [26, 10], [26, 6], [34, 6]], FS, P), { tone: "hi", crease: "lo" }));
    out.push(D(G.dotsOf(G.frameAlong([24, 0, DIFF_Z], [-1, 0, 0]), 0, 8, 4, P, { all: true }), { size: 0.45, tone: "mid" }));
  }
  return out.join("");
}

// =========================================================================
// 4. REAR INPUT DRIVESHAFTS & ELECTRIC DYNAMOMETER MOTORS
// =========================================================================
function drawRearDriveshafts() {
  const out = [];

  // Pinion input driveshafts entering ring gears from the rear (Y = -48 to Y = -14)
  for (const cx of [DIFF1_CX - 15, DIFF2_CX - 15]) {
    // Pinion shaft along Y-axis
    const FY = G.frameAlong([cx, -14, DIFF_Z], [0, -1, 0]);
    out.push(S(G.solidOf([[0, 5], [32, 5]], FY, P), { tone: "mid" }));
    // Universal Joint / Flexible Cardan Coupling at Y = -30
    out.push(S(G.solidOf([[14, 7.5], [18, 7.5]], FY, P), { tone: "hi" }));
    out.push(L(G.arcOf(FY, 16, 7.5, P), { tone: "faint" }));
    out.push(D(G.dotsOf(FY, 18, 6, 4, P, { all: true }), { size: 0.4, tone: "lit" }));
  }

  // Rear Dynamometer Motor Casing (at Y = -65, spanning center)
  const motorPlan = { x: -90, y: -74, w: 180, d: 18, r: 4 };
  out.push(S(k.slabOf(motorPlan, 0, 32, P, 6, 1.2), { tone: "lo" }));
  // Motor cooling ribs
  for (let z = 6; z <= 26; z += 4) {
    out.push(L(k.sideSeam(motorPlan, z, P, 6), { tone: "faint" }));
  }
  // Terminal connection box on motor
  const termPlan = { x: -16, y: -72, w: 32, d: 14, r: 2 };
  out.push(S(k.slabOf(termPlan, 32, 7, P, 4, 0.5), { tone: "mid" }));
  out.push(D([at([-10, -65, 39]), at([10, -65, 39])], { size: 0.45, tone: "hi" }));

  return out.join("");
}

// =========================================================================
// 5. DIFFERENTIAL 1: CLUTCH-PACK LSD (SALISBURY 1.5-WAY)
// =========================================================================
function drawDiff1ClutchLSD() {
  const out = [];

  // 1. Crown Ring Gear (Spiral Bevel Gear at s = -18 to -11)
  const ringProfile = [
    [-18, 16],
    [-18, 26],
    [-14, 32.5],
    [-10, 32.5],
    [-10, 24],
    [-10, 16]
  ];
  out.push(S(G.solidOf(ringProfile, F1, P), { tone: "hi", crease: "lo" }));
  // Spiral bevel teeth pattern on the angled crown face
  out.push(L(G.spokesOf(F1, -12, 17, 31, 24, P, { sweep: 0.35 }), { tone: "mid", free: true }));
  // Flange mounting bolt circle (8 hex bolts)
  out.push(D(G.dotsOf(F1, -10, 20.5, 8, P, { least: 0.05 }), { size: 0.5, tone: "lit" }));

  // 2. Differential Carrier Housing (Cutaway)
  // Left carrier journal: s = -22 to -16, radius 13
  out.push(S(G.solidOf([[-23, 13], [-16, 13]], F1, P), { tone: "mid" }));
  // Right carrier journal: s = 14 to 21, radius 13
  out.push(S(G.solidOf([[14, 13], [22, 13]], F1, P), { tone: "mid" }));

  // Carrier Back Housing Shell (dark interior cavity, drawn behind internal parts)
  // Outer radius 21.5, inner radius 18, seam passed as inner
  const shellSeam1 = L(G.arcOf(F1, 0, 21.5, P), { tone: "faint" });
  out.push(S(G.solidOf([[-12, 14], [-12, 21.5], [14, 21.5], [14, 14]], F1, P), { tone: "lo", inner: shellSeam1 }));

  // 3. Left Axle Side Bevel Gear (s = -8 to -3, radius 13.5)
  const leftSideGear = G.solidOf([
    [-8, 7], [-8, 13.5], [-5, 13.5], [-3, 7]
  ], F1, P);
  out.push(S(leftSideGear, { tone: "hi", crease: "lo" }));
  // Bevel gear teeth lines
  out.push(L(G.spokesOf(F1, -4.5, 7.5, 13, 16, P, { sweep: 0.1 }), { tone: "faint", free: true }));

  // 4. Right Axle Side Bevel Gear (s = 3 to 8, radius 13.5)
  const rightSideGear = G.solidOf([
    [3, 7], [5, 13.5], [8, 13.5], [8, 7]
  ], F1, P);
  out.push(S(rightSideGear, { tone: "hi", crease: "lo" }));
  out.push(L(G.spokesOf(F1, 4.5, 7.5, 13, 16, P, { sweep: -0.1 }), { tone: "faint", free: true }));

  // 5. Left Clutch Pack (Multi-Plate stack: 4 friction discs + 4 drive plates + Belleville spring)
  // Located at s = -13 to -8.5
  out.push(`<g data-part="diff1-left-clutch">`);
  // Belleville conical disc spring washer at s = -12.8
  out.push(S(G.solidOf([[-13, 11], [-13, 17.5], [-12.2, 17.5], [-12.2, 11]], F1, P), { tone: "mid", crease: "none" }));
  // Interleaved friction discs (radius 16.5) and drive plates (radius 17.8)
  for (let s = -12; s <= -9; s += 0.8) {
    const isDrivePlate = Math.round((s + 12) / 0.8) % 2 === 0;
    const r = isDrivePlate ? 17.8 : 16.5;
    const tone = isDrivePlate ? "hi" : "mid";
    out.push(S(G.solidOf([[s, 11], [s, r], [s + 0.5, r], [s + 0.5, 11]], F1, P), { tone }));
  }
  // Active friction contact glow zone (animated via CSS opacity on torque)
  out.push(`<path data-part="diff1-left-glow" class="clutch-friction-glow" d="${G.arcOf(F1, -10.5, 17.2, P)}" style="stroke:var(--anatomy-lit);stroke-width:2.2;opacity:0.25;"/>`);
  out.push(`</g>`);

  // 6. Right Clutch Pack (Multi-Plate stack)
  // Located at s = 8.5 to 13
  out.push(`<g data-part="diff1-right-clutch">`);
  for (let s = 9; s <= 12; s += 0.8) {
    const isDrivePlate = Math.round((s - 9) / 0.8) % 2 === 0;
    const r = isDrivePlate ? 17.8 : 16.5;
    const tone = isDrivePlate ? "hi" : "mid";
    out.push(S(G.solidOf([[s, 11], [s, r], [s + 0.5, r], [s + 0.5, 11]], F1, P), { tone }));
  }
  // Belleville conical disc spring washer at s = 12.5
  out.push(S(G.solidOf([[12.4, 11], [12.4, 17.5], [13.2, 17.5], [13.2, 11]], F1, P), { tone: "mid", crease: "none" }));
  out.push(`<path data-part="diff1-right-glow" class="clutch-friction-glow" d="${G.arcOf(F1, 10.5, 17.2, P)}" style="stroke:var(--anatomy-lit);stroke-width:2.2;opacity:0.25;"/>`);
  out.push(`</g>`);

  // 7. Left Pressure Ring (Cam Ring) with 45° Drive / 60° Coast V-Notches
  // Encased at s = -8.5 to -2.5
  // Dynamic group that translates axially outward under torque!
  out.push(`<g data-part="diff1-left-cam">`);
  out.push(S(G.solidOf([[-8.5, 11], [-8.5, 18], [-2.5, 18], [-2.5, 11]], F1, P), { tone: "mid", crease: "lo" }));
  // Machined V-cam ramp profile visible on front face
  out.push(L(G.arcOf(F1, -2.5, 18, P, { from: 0, to: Math.PI * 0.7 }), { tone: "hi" }));
  // Drive ramp (45° angle)
  out.push(L(k.segment(G.pointOf(F1, -2.5, 18, 0.2), G.pointOf(F1, -5.5, 18, 0.45), P), { tone: "lit", free: true }));
  // Coast ramp (60° angle)
  out.push(L(k.segment(G.pointOf(F1, -2.5, 18, 0.2), G.pointOf(F1, -4.8, 18, -0.05), P), { tone: "mid", free: true }));
  out.push(`</g>`);

  // 8. Right Pressure Ring (Cam Ring)
  // Encased at s = 2.5 to 8.5
  out.push(`<g data-part="diff1-right-cam">`);
  out.push(S(G.solidOf([[2.5, 11], [2.5, 18], [8.5, 18], [8.5, 11]], F1, P), { tone: "mid", crease: "lo" }));
  out.push(L(G.arcOf(F1, 2.5, 18, P, { from: 0, to: Math.PI * 0.7 }), { tone: "hi" }));
  // Drive ramp (45° angle)
  out.push(L(k.segment(G.pointOf(F1, 2.5, 18, 0.2), G.pointOf(F1, 5.5, 18, 0.45), P), { tone: "lit", free: true }));
  // Coast ramp (60° angle)
  out.push(L(k.segment(G.pointOf(F1, 2.5, 18, 0.2), G.pointOf(F1, 4.8, 18, -0.05), P), { tone: "mid", free: true }));
  out.push(`</g>`);

  // 9. Central Cross-Pin (Spider Pinion Shaft)
  // Aligned along Y: length 32, diameter 5.6
  // Seated directly at the apex of the V-ramps
  out.push(`<g data-part="diff1-crosspin">`);
  const pinFrame = G.frameAlong([DIFF1_CX, 0, DIFF_Z], [0, 1, 0]);
  out.push(S(G.solidOf([[-15, 2.8], [15, 2.8]], pinFrame, P), { tone: "lit" }));
  out.push(L(G.arcOf(pinFrame, 0, 2.8, P), { tone: "faint" }));

  // 10. Spider Bevel Pinions (Upper and Lower Pinions meshing between side gears)
  // Upper pinion at Z = DIFF_Z + 7.5
  const F_up = G.frameAlong([DIFF1_CX, 0, DIFF_Z + 8], [0, 0, 1]);
  out.push(S(G.solidOf([[-3.5, 3.5], [-3.5, 8.5], [1.5, 8.5], [3.5, 3.5]], F_up, P), { tone: "hi", crease: "lo" }));
  out.push(L(G.spokesOf(F_up, -1, 3.8, 8.2, 12, P, { sweep: 0.1 }), { tone: "faint", free: true }));

  // Lower pinion at Z = DIFF_Z - 7.5
  const F_dn = G.frameAlong([DIFF1_CX, 0, DIFF_Z - 8], [0, 0, -1]);
  out.push(S(G.solidOf([[-3.5, 3.5], [-3.5, 8.5], [1.5, 8.5], [3.5, 3.5]], F_dn, P), { tone: "hi", crease: "lo" }));
  out.push(`</g>`);

  // 11. Carrier Front Cut Lip (shows section wall thickness)
  // Front cut face of carrier housing at angle = 0
  const cutFaceLeft = [
    G.pointOf(F1, -12, 18, 0),
    G.pointOf(F1, -12, 21.5, 0),
    G.pointOf(F1, 14, 21.5, 0),
    G.pointOf(F1, 14, 18, 0)
  ].map((p) => at(p));
  out.push(`<polygon class="iso-solid" points="${cutFaceLeft.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}" data-tone="mid" style="fill:var(--anatomy-shade-2);stroke:var(--anatomy-edge);stroke-width:0.6;"/>`);

  return out.join("");
}

// =========================================================================
// 6. DIFFERENTIAL 2: TORSEN TYPE 2 (HELICAL / PARALLEL PLANET PINION)
// =========================================================================
function drawDiff2TorsenLSD() {
  const out = [];

  // 1. Crown Ring Gear (matching input drive)
  const ringProfile = [
    [-18, 16],
    [-18, 26],
    [-14, 32.5],
    [-10, 32.5],
    [-10, 24],
    [-10, 16]
  ];
  out.push(S(G.solidOf(ringProfile, F2, P), { tone: "hi", crease: "lo" }));
  out.push(L(G.spokesOf(F2, -12, 17, 31, 24, P, { sweep: 0.35 }), { tone: "mid", free: true }));
  out.push(D(G.dotsOf(F2, -10, 20.5, 8, P, { least: 0.05 }), { size: 0.5, tone: "lit" }));

  // 2. Monolithic Carrier Housing with Precision Cylindrical Pocket Bores
  // Carrier journals:
  out.push(S(G.solidOf([[-23, 13], [-16, 13]], F2, P), { tone: "mid" }));
  out.push(S(G.solidOf([[14, 13], [22, 13]], F2, P), { tone: "mid" }));

  // Carrier Back Shell with seam passed as inner
  const shellSeam2 = L(G.arcOf(F2, 0, 21.5, P), { tone: "faint" });
  out.push(S(G.solidOf([[-12, 13], [-12, 21.5], [14, 21.5], [14, 13]], F2, P), { tone: "lo", inner: shellSeam2 }));

  // 3. Central Helical Sun Gears (Side Gears on Axles)
  // Left Sun Gear: s = -9.5 to -1.5, radius 12.5, +35° RH helical teeth
  out.push(S(G.solidOf([[-9.5, 6], [-9.5, 12.5], [-1.5, 12.5], [-1.5, 6]], F2, P), { tone: "hi", crease: "lo" }));
  // Helical teeth pattern (+35° angle)
  out.push(L(G.ribsOf(F2, -9.5, -1.5, 12.5, 14, P, { twist: 0.65, least: 0.05 }), { tone: "mid" }));
  // Bronze thrust washer behind Left Sun Gear
  out.push(S(G.solidOf([[-11, 7], [-11, 13], [-9.5, 13], [-9.5, 7]], F2, P), { tone: "mid", crease: "none" }));

  // Right Sun Gear: s = 1.5 to 9.5, radius 12.5, -35° LH helical teeth
  out.push(S(G.solidOf([[1.5, 6], [1.5, 12.5], [9.5, 12.5], [9.5, 6]], F2, P), { tone: "hi", crease: "lo" }));
  // Helical teeth pattern (-35° angle)
  out.push(L(G.ribsOf(F2, 1.5, 9.5, 12.5, 14, P, { twist: -0.65, least: 0.05 }), { tone: "mid" }));
  // Bronze thrust washer behind Right Sun Gear
  out.push(S(G.solidOf([[9.5, 7], [9.5, 13], [11, 13], [11, 7]], F2, P), { tone: "mid", crease: "none" }));

  // 4. Paired Helical Planet Pinions in Housing Pockets
  // Pocket 1 (Upper-front pocket at Y = 8.5, Z = DIFF_Z + 7.5)
  // Pinion 1: spans s = -9 to 5.5, radius 5.2.
  // Meshes with Left Sun Gear (-9 to -1.5), and meshes with Pinion 2 (-1.5 to 5.5)
  const F_p1 = G.frameAlong([DIFF2_CX, 8.5, DIFF_Z + 7.5], [1, 0, 0]);
  out.push(S(G.solidOf([[-9, 2.2], [-9, 5.2], [5.5, 5.2], [5.5, 2.2]], F_p1, P), { tone: "lit", crease: "lo" }));
  out.push(L(G.ribsOf(F_p1, -9, 5.5, 5.2, 8, P, { twist: 0.55, least: 0.1 }), { tone: "hi" }));
  // Bronze pocket end thrust buttons
  out.push(S(G.solidOf([[-10.2, 2.2], [-10.2, 5.4], [-9, 5.4], [-9, 2.2]], F_p1, P), { tone: "mid", crease: "none" }));
  out.push(S(G.solidOf([[5.5, 2.2], [5.5, 5.4], [6.7, 5.4], [6.7, 2.2]], F_p1, P), { tone: "mid", crease: "none" }));

  // Pocket 2 (Lower-front pocket at Y = 11.5, Z = DIFF_Z - 5)
  // Pinion 2: spans s = -5.5 to 9, radius 5.2.
  // Meshes with Pinion 1 (-5.5 to 1.5), and meshes with Right Sun Gear (1.5 to 9)
  const F_p2 = G.frameAlong([DIFF2_CX, 11.5, DIFF_Z - 5], [1, 0, 0]);
  out.push(S(G.solidOf([[-5.5, 2.2], [-5.5, 5.2], [9, 5.2], [9, 2.2]], F_p2, P), { tone: "lit", crease: "lo" }));
  out.push(L(G.ribsOf(F_p2, -5.5, 9, 5.2, 8, P, { twist: -0.55, least: 0.1 }), { tone: "hi" }));
  out.push(S(G.solidOf([[-6.7, 2.2], [-6.7, 5.4], [-5.5, 5.4], [-5.5, 2.2]], F_p2, P), { tone: "mid", crease: "none" }));
  out.push(S(G.solidOf([[9, 2.2], [9, 5.4], [10.2, 5.4], [10.2, 2.2]], F_p2, P), { tone: "mid", crease: "none" }));

  // Pocket Bore Cylindrical Wall Highlights (shows tight bore pocket wrapping the pinions)
  out.push(L(G.arcOf(F_p1, -2, 5.6, P, { from: 0, to: Math.PI * 0.8 }), { tone: "lo" }));
  out.push(L(G.arcOf(F_p2, 2, 5.6, P, { from: 0, to: Math.PI * 0.8 }), { tone: "lo" }));

  // Active Helical Pocket Thrust Contact Glow (animated via CSS opacity on torque)
  out.push(`<path data-part="diff2-thrust-glow" class="torsen-thrust-glow" d="${G.arcOf(F_p1, -5, 5.5, P, { from: 0.1, to: Math.PI * 0.6 })}" style="stroke:var(--anatomy-lit);stroke-width:2.4;opacity:0.3;"/>`);
  out.push(`<path data-part="diff2-thrust-glow2" class="torsen-thrust-glow" d="${G.arcOf(F_p2, 5, 5.5, P, { from: 0.1, to: Math.PI * 0.6 })}" style="stroke:var(--anatomy-lit);stroke-width:2.4;opacity:0.3;"/>`);

  // Carrier Front Cut Section Face
  const cutFaceRight = [
    G.pointOf(F2, -12, 18, 0),
    G.pointOf(F2, -12, 21.5, 0),
    G.pointOf(F2, 14, 21.5, 0),
    G.pointOf(F2, 14, 18, 0)
  ].map((p) => at(p));
  out.push(`<polygon class="iso-solid" points="${cutFaceRight.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}" data-tone="mid" style="fill:var(--anatomy-shade-2);stroke:var(--anatomy-edge);stroke-width:0.6;"/>`);

  return out.join("");
}

// =========================================================================
// 7. CENTRAL CONTROL & TELEMETRY CONSOLE (FRONT FOREGROUND)
// =========================================================================
function drawCenterConsole() {
  const out = [];

  // Foreground position: Y = 28 to 54, X = -24 to 24, Z = 0 to 12
  const CONSOLE = { x: -24, y: 26, w: 48, d: 26, r: 3 };
  const CON_H = 12;

  // Main console housing
  out.push(S(k.slabOf(CONSOLE, 0, CON_H, P, 4, 0.8), { tone: "mid" }));
  out.push(L(k.sideSeam(CONSOLE, 6, P, 4), { tone: "faint" }));
  // Top beveled control deck
  out.push(L(k.planOutline(k.insetPlan(CONSOLE, 1.6), CON_H, P, 3), { tone: "faint" }));

  // LEFT SIDE: Knurled Input Throttle Dial (0-200 Nm)
  const dialX = -11;
  const dialY = 38;
  out.push(S(k.cylinder(dialX, dialY, 6.5, CON_H, 4, P, 32), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(dialX, dialY, 6.5, CON_H, CON_H + 4, 32, P), { tone: "lo" }));
  out.push(L(k.ring(dialX, dialY, 6.2, CON_H + 4, P, 32), { tone: "mid" }));
  out.push(L(k.ring(dialX, dialY, 4.2, CON_H + 4, P, 24), { tone: "faint" }));
  // Radial calibration ticks (rooted on the bezel ring)
  const radTicks = k.radialTicks(dialX, dialY, 6.2, 20, 5, CON_H + 4, [-1.0, -1.8], P);
  out.push(L(radTicks.minor, { tone: "lo" }), L(radTicks.major, { tone: "mid" }));
  // Throttle Dial Needle (animated in client live code)
  out.push(`<g data-part="throttle-needle">`);
  out.push(L(k.lineOnTop([dialX, dialY], [dialX + 3.8, dialY], CON_H + 4.2, P), { tone: "lit", free: true }));
  out.push(D([at([dialX, dialY, CON_H + 4.2])], { size: 0.5, tone: "lit" }));
  out.push(`</g>`);
  out.push(k.faceTextSvg(k.topMatrix([dialX - 7, dialY - 8.5], CON_H, P, "x"), "THROTTLE", { size: 1.6, tone: "lo" }));

  // RIGHT SIDE: Traction Split Balance Slider (L ICE <-> 50:50 <-> R ICE)
  const sliderX = 11;
  const sliderY = 38;
  // Slider track groove
  const track = { x: sliderX - 8, y: sliderY - 2, w: 16, d: 4, r: 1.5 };
  out.push(S(k.slabOf(track, CON_H, 0.4, P, 2), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(track, CON_H + 0.4, P, 2), { tone: "lo" }));
  // Slider knob (animated along X in client code)
  out.push(`<g data-part="traction-slider">`);
  out.push(S(k.slabOf({ x: sliderX - 2.5, y: sliderY - 3, w: 5, d: 6, r: 1.2 }, CON_H + 0.4, 3, P, 2, 0.4), { tone: "lit" }));
  out.push(L(k.lineOnTop([sliderX, sliderY - 3], [sliderX, sliderY + 3], CON_H + 3.4, P), { tone: "hi", free: true }));
  out.push(`</g>`);
  out.push(k.faceTextSvg(k.topMatrix([sliderX - 7, sliderY - 8.5], CON_H, P, "x"), "TRACTION", { size: 1.6, tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([sliderX - 8.5, sliderY + 7.5], CON_H, P, "x"), "L:ICE  50:50  R:ICE", { size: 1.2, tone: "faint" }));

  // Braided sensor harnesses routed neatly from bearing load cells into console side ports
  const wireL = t.tubePieces(
    [[-34, 4, 8], [-38, 20, 2], [-32, 34, 2], [-24, 34, 4]],
    0.65,
    P,
    { maxLength: 16, rings: { pitch: 2.0, twist: 0.25 } }
  );
  for (const piece of wireL) out.push(t.tubeSvg(piece, { tone: "mid" }));

  const wireR = t.tubePieces(
    [[34, 4, 8], [38, 20, 2], [32, 34, 2], [24, 34, 4]],
    0.65,
    P,
    { maxLength: 16, rings: { pitch: 2.0, twist: -0.25 } }
  );
  for (const piece of wireR) out.push(t.tubeSvg(piece, { tone: "mid" }));

  return out.join("");
}

// =========================================================================
// SVG ASSEMBLY (TRUE DEPTH ORDER FROM FAR TO NEAR)
// =========================================================================
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Cutaway dynamometer test bench comparing two limited slip differentials. Left: Salisbury clutch-pack LSD with 45°/60° ramp pressure rings, spider cross-pin, bevel side gears, and multi-plate clutch packs. Right: Torsen Type 2 differential with central helical sun gears and parallel planet pinions nested in cylindrical pocket bores.",
  body: [
    // 1. Bedplate & leveling feet foundation
    drawBasePlate(),

    // 2. Leftmost outer brake rotor & caliper assembly (depth -50.4)
    drawBrakeAssembly(-112),
    drawShaftSegment(-120, -96),

    // 3. Left outer bearing pedestal (depth -40.4)
    drawPedestal(-96),

    // 4. Rear dynamometer drive motor & input pinion shafts (depth -28.4)
    drawRearDriveshafts(),

    // 5. Differential 1: Clutch-Pack Salisbury LSD (depth -20.8)
    drawShaftSegment(-96, -65 - 23),
    drawDiff1ClutchLSD(),
    drawShaftSegment(-65 + 22, -34),

    // 6. Left inner bearing pedestal (depth -1.3)
    drawPedestal(-34),
    drawInnerShaft(true),

    // 7. Central instrumentation console (foreground depth 27.9)
    drawCenterConsole(),

    // 8. Right inner bearing pedestal (depth 41.6)
    drawInnerShaft(false),
    drawPedestal(34),
    drawShaftSegment(34, 65 - 23),

    // 9. Differential 2: Torsen Helical Diff (depth 61.1)
    drawDiff2TorsenLSD(),
    drawShaftSegment(65 + 22, 96),

    // 10. Right outer bearing pedestal (depth 80.6)
    drawPedestal(96),

    // 11. Rightmost outer brake assembly (depth 90.7)
    drawShaftSegment(96, 120),
    drawBrakeAssembly(112),
  ],
});

// =========================================================================
// INTERACTIVE CLIENT-SIDE PHYSICS & ANIMATION SCRIPT
// =========================================================================
const live = `
const P = ${JSON.stringify(P)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

// Interactive Elements
const leftCam = svg.querySelector('[data-part="diff1-left-cam"]');
const rightCam = svg.querySelector('[data-part="diff1-right-cam"]');
const crosspin = svg.querySelector('[data-part="diff1-crosspin"]');
const leftGlow = svg.querySelector('[data-part="diff1-left-glow"]');
const rightGlow = svg.querySelector('[data-part="diff1-right-glow"]');
const torsenGlow1 = svg.querySelector('[data-part="diff2-thrust-glow"]');
const torsenGlow2 = svg.querySelector('[data-part="diff2-thrust-glow2"]');
const throttleNeedle = svg.querySelector('[data-part="throttle-needle"]');
const tractionSlider = svg.querySelector('[data-part="traction-slider"]');

// Simulation state
let throttle = 120; // Input torque in Nm (0 to 200)
let split = -0.7;   // Traction split: -1 (Left on Ice) to 0 (50/50 Dry) to +1 (Right on Ice)
let scenario = 3;   // Active scenario (1: Dry 50/50, 2: Cornering, 3: Ice Split-Mu, 4: Coast)
let clock = 0;
let touring = true;
let visible = false;
let idleTimer = 0;
let frame = 0;
let last = 0;

// Current dynamic outputs
let currentDx = 0;
let currentLeftTorque = 0;
let currentRightTorque = 0;
let currentLockPct = 0;
let currentTbr = 3.5;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function setScenario(num) {
  scenario = num;
  touring = false;
  if (num === 1) {
    // 50:50 Dry Acceleration
    throttle = 160;
    split = 0.0;
  } else if (num === 2) {
    // High-speed Cornering
    throttle = 90;
    split = -0.3;
  } else if (num === 3) {
    // Ice Split-Mu (Left wheel zero grip)
    throttle = 140;
    split = -0.85;
  } else if (num === 4) {
    // Decel / Engine Braking
    throttle = 60;
    split = 0.2;
  }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    touring = !still.matches;
    clock = 0;
    run();
  }, 4500);
  run();
}

function updatePhysics(dt) {
  // Traction coefficients on Left and Right wheels
  // Grip capacity: dry asphalt ~ 180 Nm, wet ice ~ 15 Nm
  const gripLeft = clamp(100 - split * 90, 10, 190);
  const gripRight = clamp(100 + split * 90, 10, 190);

  // 1. CLUTCH-PACK LSD (Salisbury 1.5-Way)
  // Preload torque: 45 Nm baseline
  // Ramp angle: 45 deg drive
  const rampAngle = scenario === 4 ? (60 * Math.PI / 180) : (45 * Math.PI / 180);
  const rampForce = (throttle * 0.5) / (0.025 * Math.tan(rampAngle)); // Axial thrust in N
  const totalClamping = 600 + rampForce; // 600 N Belleville preload + dynamic ramp force

  // Axial ramp displacement in world units (mm)
  const targetDx = clamp(totalClamping / 2800, 0, 1.4);
  currentDx += (targetDx - currentDx) * (1 - Math.exp(-dt / 0.15));

  // Locking capacity
  const clutchCapacity = 0.12 * 8 * totalClamping * 0.035; // Friction torque capacity in Nm
  currentLockPct = clamp(Math.round((clutchCapacity / (throttle || 1)) * 100), 15, 100);

  // Torque distribution
  const lowGrip = Math.min(gripLeft, gripRight);
  const transferred = Math.min(clutchCapacity, throttle * 0.5);
  currentLeftTorque = clamp(Math.round(gripLeft < gripRight ? lowGrip : (throttle - lowGrip)), 5, throttle);
  currentRightTorque = clamp(Math.round(throttle - currentLeftTorque), 5, throttle);

  // 2. TORSEN TYPE 2 HELICAL DIFFERENTIAL
  // Torque Bias Ratio (TBR) = ~3.5:1
  currentTbr = 3.5;
  const torsenHigh = Math.min(190, (lowGrip + 5) * currentTbr);
}

function draw() {
  // 1. Move Salisbury pressure rings axially along X
  if (leftCam && rightCam) {
    leftCam.setAttribute("transform", translateAlong(P, [-currentDx, 0, 0]));
    rightCam.setAttribute("transform", translateAlong(P, [currentDx, 0, 0]));
  }

  // 2. Adjust friction clamp glow intensity
  const glowAlpha = clamp(currentDx / 1.4, 0.15, 0.95);
  if (leftGlow) leftGlow.style.opacity = glowAlpha.toFixed(2);
  if (rightGlow) rightGlow.style.opacity = glowAlpha.toFixed(2);

  // 3. Adjust Torsen pocket thrust contact glow intensity
  const torsenAlpha = clamp(throttle / 200, 0.2, 0.95);
  if (torsenGlow1) torsenGlow1.style.opacity = torsenAlpha.toFixed(2);
  if (torsenGlow2) torsenGlow2.style.opacity = torsenAlpha.toFixed(2);

  // 4. Update Throttle Dial Pointer
  if (throttleNeedle) {
    const angle = (throttle / 200) * Math.PI * 1.5 - Math.PI * 0.75;
    const dialX = -11, dialY = 38, dialZ = 12 + 4.2;
    const px = dialX + Math.sin(angle) * 3.8;
    const py = dialY - Math.cos(angle) * 3.8;
    const p1 = lineOnTop([dialX, dialY], [px, py], dialZ, P);
    throttleNeedle.querySelector("path")?.setAttribute("d", p1);
  }

  // 5. Update Traction Slider Knob Position
  if (tractionSlider) {
    const sx = split * 7;
    tractionSlider.setAttribute("transform", translateAlong(P, [sx, 0, 0]));
  }

  // 6. Update Card Readout Telemetry
  let modeName = "Split-Mu";
  if (scenario === 1) modeName = "Dry 50:50";
  else if (scenario === 2) modeName = "Cornering";
  else if (scenario === 4) modeName = "Coast Decel";

  const text = modeName + " · " + Math.round(throttle) + " Nm · Lock " + currentLockPct + "% · TBR " + currentTbr + ":1";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(throttle)));
  stage.setAttribute("aria-valuetext", text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;

  if (touring) {
    clock += dt;
    const tourIndex = Math.floor(clock / 3.8) % 4 + 1;
    if (tourIndex !== scenario) {
      scenario = tourIndex;
      if (scenario === 1) { throttle = 160; split = 0.0; }
      else if (scenario === 2) { throttle = 90; split = -0.35; }
      else if (scenario === 3) { throttle = 140; split = -0.85; }
      else if (scenario === 4) { throttle = 60; split = 0.25; }
    }
  }

  updatePhysics(dt);
  draw();

  frame = visible ? requestAnimationFrame(tick) : 0;
}

const run = () => {
  if (!frame && visible) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
};

new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) run();
}, { rootMargin: "120px 0px" }).observe(stage);

if (still.matches) touring = false;

// Interactive Pointer handling on Stage
stage.addEventListener("pointerdown", (event) => {
  touring = false;
  const box = svg.getBoundingClientRect();
  const relX = (event.clientX - box.left) / box.width;
  if (relX < 0.45) {
    // Adjust throttle
    throttle = clamp(Math.round(relX / 0.45 * 200), 20, 200);
  } else if (relX > 0.55) {
    // Adjust traction split
    split = clamp((relX - 0.55) / 0.4 * 2 - 1, -1, 1);
  }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 5000);
  run();
});

stage.addEventListener("pointermove", (event) => {
  if (event.buttons > 0) {
    touring = false;
    const box = svg.getBoundingClientRect();
    const relX = (event.clientX - box.left) / box.width;
    if (relX < 0.48) {
      throttle = clamp(Math.round(relX / 0.45 * 200), 20, 200);
    } else {
      split = clamp((relX - 0.55) / 0.4 * 2 - 1, -1, 1);
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 5000);
    run();
  }
});

// Keyboard controls
stage.addEventListener("keydown", (event) => {
  if (event.key === "1") setScenario(1);
  else if (event.key === "2") setScenario(2);
  else if (event.key === "3") setScenario(3);
  else if (event.key === "4") setScenario(4);
  else if (event.key === " ") {
    event.preventDefault();
    setScenario((scenario % 4) + 1);
  } else if (event.key === "ArrowUp" || event.key === "ArrowRight") {
    event.preventDefault();
    touring = false;
    throttle = clamp(throttle + 15, 20, 200);
    run();
  } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
    event.preventDefault();
    touring = false;
    throttle = clamp(throttle - 15, 20, 200);
    run();
  }
});

draw();
run();
`;

// =========================================================================
// CUSTOM COMPONENT STYLES
// =========================================================================
const css = `<style>
.clutch-friction-glow, .torsen-thrust-glow {
  transition: opacity 0.12s ease-out;
}
.iso-stage {
  touch-action: pan-y;
  cursor: ew-resize;
}
.iso-stage:focus {
  outline: none;
}
.iso-stage:focus-visible {
  outline: 1px solid var(--anatomy-muted);
  outline-offset: 6px;
}
</style>`;

// =========================================================================
// CARD & PAGE HTML
// =========================================================================
const body =
  css +
  k.plateHtml({
    fig: "Fig 1",
    title: "Limited Slip Differentials · Clutch-Pack (Salisbury) vs Torsen (Helical)",
    hint: "Keys 1–4 · Drag dial/slider to tune",
    readout: "Split-Mu · 140 Nm · Lock 84% · TBR 3.5:1",
    keys: [
      { mark: "lit", label: "Salisbury: Ramped cross-pin & clutch packs · Torsen: Helical planet pinions in pocket bores" },
      { mark: "raised", label: "Spiral bevel ring gears, axle side/sun gears, and bearing pillow blocks" },
      { mark: "edge", label: "Left: Multi-plate friction discs with 45°/60° ramps · Right: Gear-separation pocket friction (3.5:1 TBR)" },
    ],
    caption:
      "Comparison of two mechanical limited slip differential architectures on an instrumented dynamometer bench. On an open differential, if one wheel encounters ice, torque to both wheels collapses to zero. Left: Salisbury 1.5-way clutch LSD uses a cross-pin that rides up 45° drive ramps, axially separating two pressure rings to compress multi-plate clutch packs against baseline Belleville preload. Right: Torsen Type 2 differential uses crossed-axis helical planet pinions nested in cylindrical housing pockets; drive torque forces the pinions radially against the pocket walls and axially into bronze thrust washers, generating instant mechanical torque biasing (3.5:1 TBR) with zero clutch wear.",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Limited slip differential dynamometer: 1 for dry launch, 2 for cornering, 3 for split-mu ice, 4 for decel coast; arrow keys tune throttle torque" aria-valuemin="20" aria-valuemax="200" aria-valuenow="140">${svg}</div>`,
  });

const outName = theme === "light" ? "limited-slip-differential-light.html" : "limited-slip-differential.html";
writeFileSync(
  join(HERE, outName),
  k.pageHtml({
    title: "Limited Slip Differential · Clutch vs Torsen",
    theme,
    body,
    script: kitScript() + live,
    width: 650,
  })
);
console.log("wrote", outName);
