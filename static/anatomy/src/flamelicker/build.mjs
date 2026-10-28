import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/nick/.gemini/config/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/home/nick/.gemini/config/skills/anatomy/kit/lathe.mjs";
import { kitScript } from "/home/nick/.gemini/config/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 680;
const HEIGHT = 440;

// Inspection Bench Surface Plate
const PLATE = { x: -115, y: -55, w: 230, d: 110, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// Machine Geometry Datums
const CYL_AXIS_Y = 0;
const CYL_AXIS_Z = 34;
const CRANK_X = 54;
const CRANK_R = 14;
const CONROD_L = 52;
const HEAD_X = -46;
const BARREL_END_X = -10;
const PISTON_LEN = 24.0;
const PISTON_R = 9.4;

// Camera Projection setup
const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [-112, -50, 75],
    [100, 52, 75],
    [-86, 26, 48],
    [CRANK_X + 28, -26, 72],
    [HEAD_X - 10, -14, 68],
  ],
  WIDTH,
  HEIGHT,
  { pad: 28, azimuth: 46, elevation: 30 }
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// 1. Base Plate & Precision Bench Hardware
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];

  // 4 Leveling feet with knurled lock collars (depth sorted)
  for (const [x, y] of byDepth(k.corners(PLATE, 18))) {
    out.push(S(k.cylinder(x, y, 7.2, -PLATE_H - FOOT_H, 1.8, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.2, -PLATE_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: "mid" }));
    out.push(L(k.knurl(x, y, 5.2, -PLATE_H - FOOT_H + 1.8, -PLATE_H, 20, P), { tone: "lo" }));
  }

  // Heavy milled base slab with chamfered top edge
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));

  // Inset peripheral oil gutter groove
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));

  // 4 Corner socket head cap screws with counterbores
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.52, tone: "mid" }));

  // Front metric ruler strip
  const strip = { x: -95, y: PLATE.y + PLATE.d - 12, w: 190, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45, tone: "mid" }));

  // Specification Plate (Engraved Brass Badge)
  const badge = { x: 38, y: -48, w: 66, d: 18, r: 2 };
  out.push(S(k.slabOf(badge, 0, 0.8, P, 4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(badge, 1.6), 0.8, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([badge.x + 4, badge.y + 4.5], [badge.x + 48, badge.y + 4.5], 0.8, P), { tone: "lo", free: true }));
  out.push(L(k.lineOnTop([badge.x + 4, badge.y + 9], [badge.x + 38, badge.y + 9], 0.8, P), { tone: "lo", free: true }));
  out.push(L(k.lineOnTop([badge.x + 4, badge.y + 13.5], [badge.x + 26, badge.y + 13.5], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([badge.x + 60, badge.y + 5, 0.8]), at([badge.x + 60, badge.y + 13, 0.8])], { size: 0.45, tone: "hi" }));

  return out.join("");
}

// 2. Spirit Burner Assembly (External Heat Source)
function spiritBurner() {
  const out = [];

  // Clamp bracket on base plate
  const clampPlan = { x: -84, y: -11, w: 26, d: 22, r: 2.5 };
  out.push(S(k.slabOf(clampPlan, 0, 2.4, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(clampPlan, 1.8), 2.4, P), { tone: "faint" }));
  out.push(D([at([-80, -7, 2.4]), at([-80, 7, 2.4])], { size: 0.45, tone: "lo" }));

  // Dovetail locking thumb screw
  const knobX = -80, knobY = 14;
  out.push(S(k.cylinder(knobX, knobY, 3.8, 2.4, 4.2, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(knobX, knobY, 3.8, 2.4, 6.6, 20, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([knobX - 3.8, knobY], [knobX + 3.8, knobY], 6.6, P), { tone: "hi" }));
  out.push(D([at([knobX, knobY, 6.6])], { size: 0.5, tone: "hi" }));

  // Machined Brass Alcohol Tank
  const tankX = -70, tankY = 0;
  out.push(S(k.cylinder(tankX, tankY, 11.5, 2.4, 2.0, P, 32), { tone: "mid" }));
  out.push(S(k.cylinder(tankX, tankY, 9.6, 4.4, 17.6, P, 32), { tone: "hi" }));
  out.push(S(k.cylinder(tankX, tankY, 8.4, 22.0, 2.2, P, 32), { tone: "mid" }));
  out.push(L(k.sideArc(tankX, tankY, 9.6, 13.0, P, 24), { tone: "faint" }));

  // Knurled Filler Plug
  const plugX = -74, plugY = -4;
  out.push(S(k.cylinder(plugX, plugY, 3.2, 24.2, 3.0, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(plugX, plugY, 3.2, 24.2, 27.2, 16, P), { tone: "lo" }));
  out.push(D([at([plugX, plugY, 27.2])], { size: 0.45, tone: "hi" }));

  // Vertical Burner Tube & Wick Gland
  const wickX = -60, wickY = 0;
  out.push(S(k.cylinder(wickX, wickY, 2.6, 24.2, 8.0, P, 20), { tone: "hi" }));
  out.push(S(k.cylinder(wickX, wickY, 3.4, 27.2, 2.4, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(wickX, wickY, 3.4, 27.2, 29.6, 16, P), { tone: "lo" }));

  // Braided Cotton Wick
  out.push(S(k.cylinder(wickX, wickY, 1.6, 32.2, 3.6, P, 18), { tone: "faint" }));

  return out.join("");
}

// 3. Finned Cylinder Barrel & Cooling Assembly
function cylinderAssembly() {
  const out = [];

  // Rear Mount Saddle at X = -38
  const rearSaddle = { x: -42, y: -9, w: 8, d: 18, r: 2 };
  out.push(S(k.slabOf(rearSaddle, 0, 22, P, 4, 0.8), { tone: "mid" }));
  out.push(D([at([-38, -6, 22]), at([-38, 6, 22])], { size: 0.48, tone: "lo" }));

  // Front Mount Saddle at X = -16
  const frontSaddle = { x: -20, y: -9, w: 8, d: 18, r: 2 };
  out.push(S(k.slabOf(frontSaddle, 0, 22, P, 4, 0.8), { tone: "mid" }));
  out.push(D([at([-16, -6, 22]), at([-16, 6, 22])], { size: 0.48, tone: "lo" }));

  // Cylinder Head Flange at X = HEAD_X (-46)
  const headPlan = { x: HEAD_X - 2.5, y: -11, w: 2.8, d: 22, r: 3 };
  out.push(S(k.slabOf(headPlan, 20, 28, P, 4, 0.8), { tone: "hi" }));
  out.push(D([
    at([HEAD_X - 1.1, -8, 23]),
    at([HEAD_X - 1.1, 8, 23]),
    at([HEAD_X - 1.1, -8, 45]),
    at([HEAD_X - 1.1, 8, 45]),
  ], { size: 0.5, tone: "mid" }));

  // Flame Intake Aperture Port on cylinder head face
  const port = [
    at([HEAD_X - 2.5, -3.5, 31]),
    at([HEAD_X - 2.5, 3.5, 31]),
    at([HEAD_X - 2.5, 3.5, 37]),
    at([HEAD_X - 2.5, -3.5, 37]),
  ];
  out.push(`<polygon class="iso-fill" points="${port.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ")}" style="fill:var(--anatomy-paper);stroke:none"/>`);
  out.push(`<polygon class="iso-line" points="${port.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ")}" data-tone="hi"/>`);

  // Finned Cylinder Barrel (along X axis from HEAD_X to BARREL_END_X)
  const barrelLength = BARREL_END_X - HEAD_X; // 36 mm
  const F = G.frameAlong([HEAD_X, CYL_AXIS_Y, CYL_AXIS_Z], [1, 0, 0]);
  const finProfile = [
    [0, 12.0],
    [2.0, 12.0],
  ];
  // 8 deep annular cooling fins
  for (let i = 0; i < 8; i++) {
    const s0 = 2.0 + i * 4.0;
    finProfile.push([s0, 10.4]);
    finProfile.push([s0 + 2.2, 10.4]);
    finProfile.push([s0 + 2.2, 15.2]);
    finProfile.push([s0 + 3.6, 15.2]);
    finProfile.push([s0 + 3.6, 10.4]);
  }
  finProfile.push([barrelLength - 2.0, 10.4]);
  finProfile.push([barrelLength - 2.0, 12.0]);
  finProfile.push([barrelLength, 12.0]);

  out.push(S(G.solidOf(finProfile, F, P), { tone: "mid" }));

  // Open rear cylinder bore opening
  const rearFlangeRing = k.sideRing([BARREL_END_X, CYL_AXIS_Y, CYL_AXIS_Z], 12.0, "x", P, 24);
  out.push(L(rearFlangeRing, { tone: "mid" }));
  const boreInnerRing = k.sideRing([BARREL_END_X, CYL_AXIS_Y, CYL_AXIS_Z], 9.8, "x", P, 24);
  out.push(L(boreInnerRing, { tone: "lo" }));

  return out.join("");
}

// 4. Dial Vacuum Gauge on Cylinder Head
function vacuumGauge() {
  const out = [];
  const gx = HEAD_X + 1.0, gy = -8.0;

  // Stalk mounting nipple
  out.push(S(k.cylinder(gx, gy, 1.8, 48.0, 4.0, P, 18), { tone: "mid" }));
  out.push(S(k.cylinder(gx, gy, 2.6, 50.0, 2.0, P, 6), { tone: "hi" }));

  // Gauge Casing Body
  const GAUGE_C = [gx, gy, 56.0];
  const GAUGE_R = 7.6;
  out.push(S(k.cylinder(GAUGE_C[0], GAUGE_C[1], GAUGE_R, 52.0, 4.5, P, 28), { tone: "mid" }));
  out.push(L(k.ring(GAUGE_C[0], GAUGE_C[1], GAUGE_R, 56.5, P, 28), { tone: "hi" }));
  out.push(L(k.ring(GAUGE_C[0], GAUGE_C[1], GAUGE_R - 1.2, 56.5, P, 28), { tone: "lo" }));

  // Dial scale ticks (0 to -0.6 bar vacuum)
  const dialTicks = k.radialTicks(GAUGE_C[0], GAUGE_C[1], GAUGE_R - 1.6, 12, 3, 56.5, [1.0, 2.0], P, Math.PI * 0.2, Math.PI * 1.2);
  out.push(L(dialTicks.minor, { tone: "lo" }));
  out.push(L(dialTicks.major, { tone: "mid" }));

  // Center needle boss
  out.push(D([at([GAUGE_C[0], GAUGE_C[1], 56.5])], { size: 0.55, tone: "lit" }));

  return out.join("");
}

// 5. Crankshaft Bearing Stanchions & Pillow Blocks
function bearingStanchions() {
  const out = [];

  // Rear Bearing Pedestal at Y = -16
  const rearBlock = { x: CRANK_X - 8, y: -18, w: 16, d: 8, r: 2 };
  out.push(S(k.slabOf(rearBlock, 0, 34, P, 4, 1.0), { tone: "mid" }));
  const rearCap = { x: CRANK_X - 7, y: -18, w: 14, d: 8, r: 1.5 };
  out.push(S(k.slabOf(rearCap, 34, 6, P, 3, 0.6), { tone: "hi" }));
  out.push(D([at([CRANK_X - 5, -14, 40]), at([CRANK_X + 5, -14, 40])], { size: 0.45, tone: "lo" }));
  out.push(S(k.cylinder(CRANK_X, -14, 2.2, 40, 4.0, P, 18), { tone: "hi" }));
  out.push(D([at([CRANK_X, -14, 44])], { size: 0.45, tone: "lit" }));

  // Front Bearing Pedestal at Y = +10
  const frontBlock = { x: CRANK_X - 8, y: 10, w: 16, d: 8, r: 2 };
  out.push(S(k.slabOf(frontBlock, 0, 34, P, 4, 1.0), { tone: "mid" }));
  const frontCap = { x: CRANK_X - 7, y: 10, w: 14, d: 8, r: 1.5 };
  out.push(S(k.slabOf(frontCap, 34, 6, P, 3, 0.6), { tone: "hi" }));
  out.push(D([at([CRANK_X - 5, 14, 40]), at([CRANK_X + 5, 14, 40])], { size: 0.45, tone: "lo" }));
  out.push(S(k.cylinder(CRANK_X, 14, 2.2, 40, 4.0, P, 18), { tone: "hi" }));
  out.push(D([at([CRANK_X, 14, 44])], { size: 0.45, tone: "lit" }));

  return out.join("");
}

// 6. Flywheel Heavy Rim & Hub Collar (Axially symmetric solid parts)
function flywheelRim() {
  const out = [];
  const FLY_Y = -22;
  const F = G.frameAlong([CRANK_X, FLY_Y, CYL_AXIS_Z], [0, 1, 0]);

  // Massive 60mm turned inertia rim
  const rimProfile = [
    [0, 24.5],
    [0, 29.5],
    [1.0, 30.0],
    [5.0, 30.0],
    [6.0, 29.5],
    [6.0, 24.5],
    [5.2, 24.0],
    [0.8, 24.0],
  ];
  out.push(S(G.solidOf(rimProfile, F, P), { tone: "hi" }));

  // Central hub collar
  const hubProfile = [
    [-1.0, 3.2],
    [-1.0, 7.5],
    [7.0, 7.5],
    [7.0, 3.2],
  ];
  out.push(S(G.solidOf(hubProfile, F, P), { tone: "mid" }));
  out.push(D([at([CRANK_X, FLY_Y + 7.0, CYL_AXIS_Z + 5.2])], { size: 0.5, tone: "lo" }));

  return out.join("");
}

// 7. Valve Rocker Arm Pivot Stanchion
function valveGearStanchion() {
  const out = [];
  const PIVOT_X = -32, PIVOT_Y = 14;

  out.push(S(k.cylinder(PIVOT_X, PIVOT_Y, 2.4, 30, 18, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(PIVOT_X, PIVOT_Y, 3.6, 46, 3.2, P, 20), { tone: "hi" }));
  out.push(D([at([PIVOT_X, PIVOT_Y, 49.2])], { size: 0.5, tone: "mid" }));

  // Valve Guide Gibs on cylinder head face
  const gibLeft = { x: HEAD_X - 2.8, y: -5.2, w: 1.2, d: 1.6, r: 0.2 };
  out.push(S(k.slabOf(gibLeft, 29, 12, P, 2), { tone: "mid" }));
  const gibRight = { x: HEAD_X - 2.8, y: 3.6, w: 1.2, d: 1.6, r: 0.2 };
  out.push(S(k.slabOf(gibRight, 29, 12, P, 2), { tone: "mid" }));

  return out.join("");
}

// 8. Piston Solid Template (Pre-built turned cylindrical body)
function createPistonTemplate() {
  const F = G.frameAlong([-PISTON_LEN, CYL_AXIS_Y, CYL_AXIS_Z], [1, 0, 0]);
  const profile = [
    [0, PISTON_R],
    [3.0, PISTON_R],
    [3.0, PISTON_R - 1.4], // compression ring groove 1
    [4.2, PISTON_R - 1.4],
    [4.2, PISTON_R],
    [6.0, PISTON_R],
    [6.0, PISTON_R - 1.4], // compression ring groove 2
    [7.2, PISTON_R - 1.4],
    [7.2, PISTON_R],
    [PISTON_LEN - 1.0, PISTON_R],
    [PISTON_LEN, PISTON_R - 0.8],
  ];
  return S(G.solidOf(profile, F, P), { tone: "hi" });
}

// 9. Slide Valve Plate Solid Template (Pre-built ground plate)
function createValvePlateTemplate() {
  const platePlan = { x: HEAD_X - 2.8, y: -4.2, w: 1.2, d: 8.4, r: 0.8 };
  return S(k.slabOf(platePlan, 30.5, 7.5, P, 3, 0.4), { tone: "hi" });
}

// Assemble Static SVG scene
const staticSvg = [
  plate(),
  spiritBurner(),
  flywheelRim(),
  cylinderAssembly(),
  vacuumGauge(),
  bearingStanchions(),
  valveGearStanchion(),
].join("");

// Dynamic SVG Components
const dynamicSvg = `
  <!-- Flywheel Spokes Group -->
  <path id="flywheel-spokes" class="iso-line" data-tone="mid" style="stroke-width:1.5px" data-free="both"/>

  <!-- Crankshaft Throw & Counterweight -->
  <g id="crank-web"></g>

  <!-- Piston Assembly (Translated along X via translateAlong) -->
  <g id="piston-group">
    ${createPistonTemplate()}
    <g id="wrist-pin-dot"></g>
  </g>

  <!-- Connecting Rod (Articulated Dogbone Link) -->
  <g id="conrod">
    <polygon id="conrod-body" class="iso-fill" style="fill:var(--anatomy-face);stroke:none"/>
    <path id="conrod-outline" class="iso-line" data-tone="hi"/>
    <path id="conrod-crease" class="iso-line" data-tone="mid" data-free="both"/>
    <circle id="big-end" r="5.2" class="iso-line" data-tone="mid" fill="none"/>
    <circle id="crank-pin" r="2.4" class="iso-dots" data-tone="lit"/>
    <circle id="small-end" r="3.6" class="iso-line" data-tone="lo" fill="none"/>
  </g>

  <!-- Slide Valve Plate & Stem (Translated in Z via translateAlong) -->
  <g id="slide-valve-group">
    ${createValvePlateTemplate()}
    <path id="valve-stem" class="iso-line" data-tone="mid" style="stroke-width:1.2px"/>
  </g>

  <!-- Slide Valve Return Helical Spring -->
  <g id="valve-spring"></g>

  <!-- Overhead Rocker Arm Linkage -->
  <g id="rocker-arm">
    <path id="rocker-bar" class="iso-line" data-tone="hi" style="stroke-width:1.6px"/>
    <circle id="rocker-pivot" r="2.0" class="iso-dots" data-tone="mid"/>
    <circle id="rocker-rear-dot" r="1.6" class="iso-dots" data-tone="mid"/>
    <path id="pushrod-line" class="iso-line" data-tone="mid"/>
    <circle id="eccentric-dot" r="2.0" class="iso-dots" data-tone="mid"/>
  </g>

  <!-- Vacuum Gauge Live Needle -->
  <g id="gauge-needle">
    <path id="needle-line" class="iso-line" data-tone="lit" style="stroke-width:1.2px" data-free="true"/>
  </g>

  <!-- Dynamic Alcohol Flame (Interactive Flame Ingestion) -->
  <g id="burner-flame">
    <path id="flame-outer" class="iso-flame-outer"/>
    <path id="flame-core" class="iso-flame-core"/>
    <path id="flame-base" class="iso-flame-base"/>
  </g>
`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" class="iso-svg" aria-label="Flame Licker Engine">${staticSvg}${dynamicSvg}</svg>`;

// Interactive client-side simulation script
const live = `
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = window.matchMedia("(prefers-reduced-motion: reduce)");

const P = ${JSON.stringify(P)};
const CRANK_X = ${CRANK_X};
const CRANK_R = ${CRANK_R};
const CONROD_L = ${CONROD_L};
const CYL_AXIS_Y = ${CYL_AXIS_Y};
const CYL_AXIS_Z = ${CYL_AXIS_Z};
const HEAD_X = ${HEAD_X};
const FLY_Y = -22;

const at = (point) => iso(point, P);

// Dynamic DOM Elements
const elSpokes = svg.querySelector("#flywheel-spokes");
const elCrankWeb = svg.querySelector("#crank-web");
const elPistonGroup = svg.querySelector("#piston-group");
const elWristPinDot = svg.querySelector("#wrist-pin-dot");

const elConrodBody = svg.querySelector("#conrod-body");
const elConrodOutline = svg.querySelector("#conrod-outline");
const elConrodCrease = svg.querySelector("#conrod-crease");
const elBigEnd = svg.querySelector("#big-end");
const elCrankPin = svg.querySelector("#crank-pin");
const elSmallEnd = svg.querySelector("#small-end");

const elSlideValveGroup = svg.querySelector("#slide-valve-group");
const elValveStem = svg.querySelector("#valve-stem");
const elValveSpring = svg.querySelector("#valve-spring");

const elRockerBar = svg.querySelector("#rocker-bar");
const elRockerPivot = svg.querySelector("#rocker-pivot");
const elPushrodLine = svg.querySelector("#pushrod-line");

const elNeedleLine = svg.querySelector("#needle-line");
const elFlameOuter = svg.querySelector("#flame-outer");
const elFlameCore = svg.querySelector("#flame-core");
const elFlameBase = svg.querySelector("#flame-base");

// Engine animation state
let deg = 45;       // Current crank angle in degrees
let running = true; // Auto running
let speedRpm = 85;  // Engine RPM
let lastTime = 0;
let dragActive = false;
let dragStartX = 0;
let dragStartDeg = 0;

// Thermodynamic Cycle Computation
function cyclePhysics(angleDeg) {
  const normDeg = ((angleDeg % 360) + 360) % 360;
  const theta = normDeg * Math.PI / 180;

  // Kinematic slider-crank position
  const xw = CRANK_X - CRANK_R * Math.cos(theta) - Math.sqrt(CONROD_L * CONROD_L - CRANK_R * CRANK_R * Math.sin(theta) ** 2);
  const strokeMin = CRANK_X - CRANK_R - CONROD_L; // TDC: -12 mm
  const stroke = xw - strokeMin; // 0 to 28 mm

  const xcp = CRANK_X - CRANK_R * Math.cos(theta);
  const zcp = CYL_AXIS_Z + CRANK_R * Math.sin(theta);

  // Slide Valve Lift (0 to 1, lifts in Z)
  let valve = 0;
  if (normDeg >= 0 && normDeg < 18) valve = normDeg / 18;
  else if (normDeg >= 18 && normDeg < 145) valve = 1.0;
  else if (normDeg >= 145 && normDeg < 165) valve = 1.0 - (normDeg - 145) / 20;
  else if (normDeg >= 315 && normDeg < 355) valve = 0.20 * Math.sin((normDeg - 315) / 40 * Math.PI);

  // Thermodynamics (Pressure & Temperature)
  let P_bar = 1.01, T_C = 220, phaseName = "1. INTAKE";
  if (normDeg < 165) {
    phaseName = "1. INTAKE";
    T_C = 220 + (1150 - 220) * Math.min(1, normDeg / 60);
    P_bar = 1.00;
  } else if (normDeg < 315) {
    const cool = (normDeg - 165) / (315 - 165);
    T_C = 1150 * Math.exp(-cool * 2.3) + 95;
    P_bar = Math.max(0.44, 1.00 - 0.56 * Math.sin(cool * Math.PI * 0.85));
    phaseName = (normDeg < 180) ? "2. SEAL" : "3. VACUUM";
  } else {
    phaseName = "4. EXHAUST";
    T_C = 120 + 100 * (normDeg - 315) / 45;
    P_bar = 1.01;
  }
  const vac_bar = Math.min(0, P_bar - 1.01);

  return { normDeg, theta, xw, stroke, xcp, zcp, valve, P_bar, vac_bar, T_C, phaseName };
}

// Render Engine Frame
function render() {
  const state = cyclePhysics(deg);
  const { normDeg, theta, xw, stroke, xcp, zcp, valve, P_bar, vac_bar, T_C, phaseName } = state;

  // 1. Flywheel Spokes (6 rotating spokes in X-Z plane at FLY_Y)
  const spokePaths = [];
  for (let i = 0; i < 6; i++) {
    const a = theta + i * Math.PI / 3;
    const pHub = at([CRANK_X + 7.5 * Math.cos(a), FLY_Y, CYL_AXIS_Z + 7.5 * Math.sin(a)]);
    const pRim = at([CRANK_X + 24.0 * Math.cos(a), FLY_Y, CYL_AXIS_Z + 24.0 * Math.sin(a)]);
    spokePaths.push("M" + pHub[0].toFixed(1) + " " + pHub[1].toFixed(1) + "L" + pRim[0].toFixed(1) + " " + pRim[1].toFixed(1));
  }
  elSpokes.setAttribute("d", spokePaths.join(""));

  // 2. Crank Web Counterweight
  const pCrankCenter = at([CRANK_X, 0, CYL_AXIS_Z]);
  const pCrankPin = at([xcp, 0, zcp]);
  const pWeight1 = at([CRANK_X + 16 * Math.cos(theta + Math.PI - 0.6), 0, CYL_AXIS_Z + 16 * Math.sin(theta + Math.PI - 0.6)]);
  const pWeight2 = at([CRANK_X + 16 * Math.cos(theta + Math.PI + 0.6), 0, CYL_AXIS_Z + 16 * Math.sin(theta + Math.PI + 0.6)]);
  const webPoly = [pCrankCenter, pWeight1, pWeight2, pCrankCenter, pCrankPin];
  const webD = "M" + pCrankCenter[0].toFixed(1) + " " + pCrankCenter[1].toFixed(1) +
    "L" + pWeight1[0].toFixed(1) + " " + pWeight1[1].toFixed(1) +
    "A 16 16 0 0 1 " + pWeight2[0].toFixed(1) + " " + pWeight2[1].toFixed(1) +
    "L" + pCrankCenter[0].toFixed(1) + " " + pCrankCenter[1].toFixed(1) +
    "L" + pCrankPin[0].toFixed(1) + " " + pCrankPin[1].toFixed(1);
  elCrankWeb.innerHTML = '<path class="iso-fill" style="fill:var(--anatomy-face);stroke:none" d="' + webD + '"/>' +
    '<path class="iso-line" data-tone="hi" style="stroke-width:1.5px" d="' + webD + '"/>';

  // 3. Piston Motion (Exact translation along X via translateAlong)
  elPistonGroup.setAttribute("transform", translateAlong(P, [xw, 0, 0]));
  const pWrist = at([xw, 0, CYL_AXIS_Z]);
  elWristPinDot.innerHTML = '<circle cx="' + pWrist[0].toFixed(1) + '" cy="' + pWrist[1].toFixed(1) + '" r="2.2" class="iso-dots" data-tone="lit"/>';

  // 4. Connecting Rod (Dogbone link between wristpin and crankpin)
  const normPerpX = -(zcp - CYL_AXIS_Z) / CONROD_L * 2.2;
  const normPerpZ = (xcp - xw) / CONROD_L * 2.2;
  const conPts = [
    at([xw + normPerpX, 0, CYL_AXIS_Z + normPerpZ]),
    at([xcp + normPerpX * 1.6, 0, zcp + normPerpZ * 1.6]),
    at([xcp - normPerpX * 1.6, 0, zcp - normPerpZ * 1.6]),
    at([xw - normPerpX, 0, CYL_AXIS_Z - normPerpZ]),
  ];
  const conD = "M" + conPts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
  elConrodBody.setAttribute("points", conPts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" "));
  elConrodOutline.setAttribute("d", conD);
  const mid1 = at([(xw + xcp) * 0.5 + normPerpX * 0.5, 0, (CYL_AXIS_Z + zcp) * 0.5 + normPerpZ * 0.5]);
  const mid2 = at([(xw + xcp) * 0.5 - normPerpX * 0.5, 0, (CYL_AXIS_Z + zcp) * 0.5 - normPerpZ * 0.5]);
  elConrodCrease.setAttribute("d", "M" + mid1[0].toFixed(1) + " " + mid1[1].toFixed(1) + "L" + mid2[0].toFixed(1) + " " + mid2[1].toFixed(1));

  elBigEnd.setAttribute("cx", pCrankPin[0].toFixed(1));
  elBigEnd.setAttribute("cy", pCrankPin[1].toFixed(1));
  elCrankPin.setAttribute("cx", pCrankPin[0].toFixed(1));
  elCrankPin.setAttribute("cy", pCrankPin[1].toFixed(1));
  elSmallEnd.setAttribute("cx", pWrist[0].toFixed(1));
  elSmallEnd.setAttribute("cy", pWrist[1].toFixed(1));

  // 5. Slide Valve Motion (Exact translation in Z via translateAlong)
  const liftZ = valve * 7.5;
  elSlideValveGroup.setAttribute("transform", translateAlong(P, [0, 0, liftZ]));

  // Valve Stem Pin
  const vStemBottom = at([HEAD_X - 2.8, 0, 38.0 + liftZ]);
  const vStemTop = at([HEAD_X - 2.8, 0, 45.0 + liftZ]);
  elValveStem.setAttribute("d", "M" + vStemBottom[0].toFixed(1) + " " + vStemBottom[1].toFixed(1) + "L" + vStemTop[0].toFixed(1) + " " + vStemTop[1].toFixed(1));

  // Valve Spring Coil
  const springCoil = coil(38.0 + liftZ, 44.5 + liftZ, [HEAD_X - 2.8, 0], 1.8, 5, "z", P, 14);
  elValveSpring.innerHTML = '<path class="iso-line" data-tone="lo" data-free="both" d="' + springCoil.back + springCoil.front + '"/>';

  // 6. Rocker Arm & Pushrod
  const pRockerPivot = at([-32, 14, 46]);
  const pRockerFront = at([HEAD_X - 2.8, 0, 45.0 + liftZ]);
  const pRockerRear = at([-22, 14, 43 - valve * 3.5]);
  elRockerBar.setAttribute("d", "M" + pRockerFront[0].toFixed(1) + " " + pRockerFront[1].toFixed(1) +
    "L" + pRockerPivot[0].toFixed(1) + " " + pRockerPivot[1].toFixed(1) +
    "L" + pRockerRear[0].toFixed(1) + " " + pRockerRear[1].toFixed(1));
  elRockerPivot.setAttribute("cx", pRockerPivot[0].toFixed(1));
  elRockerPivot.setAttribute("cy", pRockerPivot[1].toFixed(1));

  const elRockerRearDot = svg.querySelector("#rocker-rear-dot");
  if (elRockerRearDot) {
    elRockerRearDot.setAttribute("cx", pRockerRear[0].toFixed(1));
    elRockerRearDot.setAttribute("cy", pRockerRear[1].toFixed(1));
  }

  // Pushrod line extending to crankshaft eccentric
  const pEccentric = at([CRANK_X - 4 * Math.cos(theta), 14, CYL_AXIS_Z + 4 * Math.sin(theta)]);
  elPushrodLine.setAttribute("d", "M" + pRockerRear[0].toFixed(1) + " " + pRockerRear[1].toFixed(1) +
    "L" + pEccentric[0].toFixed(1) + " " + pEccentric[1].toFixed(1));

  const elEccentricDot = svg.querySelector("#eccentric-dot");
  if (elEccentricDot) {
    elEccentricDot.setAttribute("cx", pEccentric[0].toFixed(1));
    elEccentricDot.setAttribute("cy", pEccentric[1].toFixed(1));
  }

  // 7. Vacuum Gauge Needle
  const GAUGE_C = [HEAD_X + 1.0, -8.0, 56.0];
  const needleAngle = Math.PI * 0.2 + (-vac_bar / 0.6) * (Math.PI * 1.0);
  const pNeedleTip = at([GAUGE_C[0] + 5.2 * Math.sin(needleAngle), GAUGE_C[1] - 5.2 * Math.cos(needleAngle), 56.5]);
  const pNeedleHub = at([GAUGE_C[0], GAUGE_C[1], 56.5]);
  elNeedleLine.setAttribute("d", "M" + pNeedleHub[0].toFixed(1) + " " + pNeedleHub[1].toFixed(1) + "L" + pNeedleTip[0].toFixed(1) + " " + pNeedleTip[1].toFixed(1));

  // 8. Alcohol Burner Flame (Dynamic lick during intake)
  const wickTop = at([-60, 0, 35.8]);
  const flameLick = valve > 0.1 ? (valve * 14.0) : 0;
  const flameTipX = -60 + flameLick * 1.05;
  const flameTipZ = 45.0 - flameLick * 0.5;
  const flameTip = at([flameTipX, 0, flameTipZ]);
  const fLeft = at([-62, -2.5, 38.0 + flameLick * 0.2]);
  const fRight = at([-58 + flameLick * 0.4, 2.5, 38.0 + flameLick * 0.2]);

  const flameOuterD = "M" + wickTop[0].toFixed(1) + " " + wickTop[1].toFixed(1) +
    "Q" + fLeft[0].toFixed(1) + " " + fLeft[1].toFixed(1) + " " + flameTip[0].toFixed(1) + " " + flameTip[1].toFixed(1) +
    "Q" + fRight[0].toFixed(1) + " " + fRight[1].toFixed(1) + " " + wickTop[0].toFixed(1) + " " + wickTop[1].toFixed(1) + "Z";
  elFlameOuter.setAttribute("d", flameOuterD);

  const coreTip = at([-60 + flameLick * 0.8, 0, 42.0 - flameLick * 0.35]);
  const flameCoreD = "M" + wickTop[0].toFixed(1) + " " + wickTop[1].toFixed(1) +
    "L" + coreTip[0].toFixed(1) + " " + coreTip[1].toFixed(1) + "Z";
  elFlameCore.setAttribute("d", flameOuterD);

  const basePt = at([-60, 0, 37.0]);
  elFlameBase.setAttribute("d", "M" + wickTop[0].toFixed(1) + " " + wickTop[1].toFixed(1) + "L" + basePt[0].toFixed(1) + " " + basePt[1].toFixed(1));

  // Live Readout Update (Compact, crisp tabular readout)
  const readoutText = "θ: " + Math.round(normDeg) + "° · " + P_bar.toFixed(2) + " bar · " + Math.round(T_C) + "°C · " + phaseName;
  if (readout.textContent !== readoutText) readout.textContent = readoutText;

  // Update phase button highlights
  document.querySelectorAll("[data-phase-btn]").forEach(btn => {
    const pIdx = Number(btn.getAttribute("data-phase-btn"));
    const active = (pIdx === 1 && normDeg < 165) ||
      (pIdx === 2 && normDeg >= 165 && normDeg < 180) ||
      (pIdx === 3 && normDeg >= 180 && normDeg < 315) ||
      (pIdx === 4 && normDeg >= 315);
    btn.classList.toggle("active", active);
  });
}

// Animation loop
function loop(time) {
  if (lastTime && running && !still.matches) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    const degPerSec = (speedRpm / 60) * 360;
    deg = (deg + degPerSec * dt) % 360;
    render();
  }
  lastTime = time;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Interactive Controls Setup
const btnPlay = document.querySelector("#btn-play");
if (btnPlay) {
  btnPlay.addEventListener("click", () => {
    running = !running;
    btnPlay.textContent = running ? "⏸ Pause" : "▶ Run";
  });
}

const speedSlider = document.querySelector("#speed-slider");
if (speedSlider) {
  speedSlider.addEventListener("input", (e) => {
    speedRpm = Number(e.target.value);
    const lbl = document.querySelector("#speed-val");
    if (lbl) lbl.textContent = speedRpm + " RPM";
  });
}

document.querySelectorAll("[data-phase-btn]").forEach(btn => {
  btn.addEventListener("click", () => {
    running = false;
    if (btnPlay) btnPlay.textContent = "▶ Run";
    const targetDeg = Number(btn.getAttribute("data-target-deg"));
    deg = targetDeg;
    render();
  });
});

// Flywheel manual dragging
stage.addEventListener("pointerdown", (e) => {
  dragActive = true;
  dragStartX = e.clientX;
  dragStartDeg = deg;
  running = false;
  if (btnPlay) btnPlay.textContent = "▶ Run";
  stage.setPointerCapture(e.pointerId);
});

stage.addEventListener("pointermove", (e) => {
  if (!dragActive) return;
  const dx = e.clientX - dragStartX;
  deg = ((dragStartDeg + dx * 0.8) % 360 + 360) % 360;
  render();
});

stage.addEventListener("pointerup", (e) => {
  if (dragActive) {
    dragActive = false;
    stage.releasePointerCapture(e.pointerId);
  }
});

// Keyboard controls
stage.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    running = !running;
    if (btnPlay) btnPlay.textContent = running ? "⏸ Pause" : "▶ Run";
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    running = false;
    if (btnPlay) btnPlay.textContent = "▶ Run";
    deg = (deg + 5) % 360;
    render();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    running = false;
    if (btnPlay) btnPlay.textContent = "▶ Run";
    deg = ((deg - 5) % 360 + 360) % 360;
    render();
  } else if (e.key >= "1" && e.key <= "4") {
    const targets = [60, 170, 240, 335];
    running = false;
    if (btnPlay) btnPlay.textContent = "▶ Run";
    deg = targets[Number(e.key) - 1];
    render();
  }
});

// Theme Selector Support (Addressing "Include all color themes")
document.querySelectorAll("[data-theme-choice]").forEach(btn => {
  btn.addEventListener("click", () => {
    const themeName = btn.getAttribute("data-theme-choice");
    document.body.setAttribute("data-theme", themeName);
    document.querySelectorAll("[data-theme-choice]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

render();
`;

// Additional CSS for Flame Licker controls and multi-theme tokens
const EXTRA_CSS = `
/* Flame styling across themes */
.iso-flame-outer {
  fill: #ff9800;
  fill-opacity: 0.75;
  stroke: #ffb74d;
  stroke-width: 0.8px;
  filter: drop-shadow(0 0 3px #ff980088);
}
.iso-flame-core {
  fill: #fff9c4;
  fill-opacity: 0.95;
  stroke: #ffffff;
  stroke-width: 0.4px;
}
.iso-flame-base {
  stroke: #42a5f5;
  stroke-width: 2.2px;
  stroke-linecap: round;
}

.iso[data-theme="light"] .iso-flame-outer {
  fill: #e65100;
  fill-opacity: 0.82;
  stroke: #bf360c;
  filter: drop-shadow(0 0 2px #e6510066);
}
.iso[data-theme="light"] .iso-flame-core {
  fill: #ffe082;
  fill-opacity: 0.95;
  stroke: #ffb300;
}
.iso[data-theme="light"] .iso-flame-base {
  stroke: #1976d2;
  stroke-width: 2.2px;
}

/* Theme: Vintage Brass & Bronze Workshop */
.iso[data-theme="brass"] {
  --anatomy-page: #181410;
  --anatomy-card: #201a14;
  --anatomy-paper: #201a14;
  --anatomy-face: #2c241c;
  --anatomy-top: #362d22;
  --anatomy-shade-0: #19140f;
  --anatomy-shade-1: #1f1913;
  --anatomy-shade-2: #272018;
  --anatomy-shade-3: #30271e;
  --anatomy-lit-top: #4a3e2a;
  --anatomy-lit-shade: #342b1d;
  --anatomy-hi: #e5c17d;
  --anatomy-mid: #9c7f53;
  --anatomy-lo: #574632;
  --anatomy-faint: #382c1f;
  --anatomy-lit: #ffe49e;
  --anatomy-halo: #080604;
  --anatomy-halo-opacity: 0.95;
}
.iso[data-theme="brass"] .iso-flame-outer {
  fill: #ff8f00;
  stroke: #ffd54f;
}

/* Theme: Blueprint Cyanotype Drafting */
.iso[data-theme="blueprint"] {
  --anatomy-page: #0a192f;
  --anatomy-card: #0d223f;
  --anatomy-paper: #0d223f;
  --anatomy-face: #132f54;
  --anatomy-top: #193d6d;
  --anatomy-shade-0: #0a1b33;
  --anatomy-shade-1: #0e2341;
  --anatomy-shade-2: #122c52;
  --anatomy-shade-3: #173866;
  --anatomy-lit-top: #24518d;
  --anatomy-lit-shade: #1a3f70;
  --anatomy-hi: #a5d8ff;
  --anatomy-mid: #5ea8e6;
  --anatomy-lo: #2b5f94;
  --anatomy-faint: #183e66;
  --anatomy-lit: #e7f5ff;
  --anatomy-halo: #030810;
  --anatomy-halo-opacity: 0.95;
}
.iso[data-theme="blueprint"] .iso-flame-outer {
  fill: #00bcd4;
  stroke: #80deea;
  filter: drop-shadow(0 0 3px #00bcd4aa);
}
.iso[data-theme="blueprint"] .iso-flame-core {
  fill: #e0f7fa;
  stroke: #ffffff;
}
.iso[data-theme="blueprint"] .iso-flame-base {
  stroke: #0288d1;
}

/* Theme: Amber Phosphor CRT */
.iso[data-theme="amber"] {
  --anatomy-page: #120c04;
  --anatomy-card: #1c1306;
  --anatomy-paper: #1c1306;
  --anatomy-face: #261908;
  --anatomy-top: #33220b;
  --anatomy-shade-0: #140d04;
  --anatomy-shade-1: #1a1106;
  --anatomy-shade-2: #221607;
  --anatomy-shade-3: #2b1c09;
  --anatomy-lit-top: #422a0e;
  --anatomy-lit-shade: #311f0a;
  --anatomy-hi: #ffb74d;
  --anatomy-mid: #b27b2c;
  --anatomy-lo: #664619;
  --anatomy-faint: #3d2a0f;
  --anatomy-lit: #ffe082;
  --anatomy-halo: #080401;
  --anatomy-halo-opacity: 0.95;
}

/* Standalone Engine Toolbar (Placed cleanly below card) */
.engine-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  margin-top: 10px;
  margin-bottom: 6px;
  background: var(--anatomy-face);
  border: 1px solid var(--anatomy-lo);
  border-radius: 4px;
  font-family: var(--anatomy-mono);
  font-size: 11.5px;
}
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-control {
  background: var(--anatomy-paper);
  color: var(--anatomy-strong);
  border: 1px solid var(--anatomy-mid);
  padding: 4px 8px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-control:hover {
  border-color: var(--anatomy-lit);
  color: var(--anatomy-lit);
}
.btn-control.active {
  background: var(--anatomy-top);
  border-color: var(--anatomy-lit);
  color: var(--anatomy-lit);
  font-weight: bold;
}
.slider-control {
  accent-color: var(--anatomy-hi);
  cursor: pointer;
}
.theme-pill-group {
  display: flex;
  gap: 4px;
}
.theme-pill {
  padding: 3px 6px;
  border-radius: 3px;
  border: 1px solid var(--anatomy-lo);
  background: var(--anatomy-paper);
  color: var(--anatomy-muted);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.theme-pill:hover, .theme-pill.active {
  border-color: var(--anatomy-hi);
  color: var(--anatomy-strong);
}
`;

const controlBarHtml = `
<div class="engine-toolbar">
  <div class="toolbar-group">
    <button id="btn-play" class="btn-control" aria-label="Toggle engine run state">⏸ Pause</button>
    <label for="speed-slider" style="color:var(--anatomy-muted)">Speed:</label>
    <input type="range" id="speed-slider" class="slider-control" min="30" max="180" value="85" step="5" style="width:70px">
    <span id="speed-val" style="min-width:45px;color:var(--anatomy-strong)">85 RPM</span>
  </div>
  <div class="toolbar-group">
    <span style="color:var(--anatomy-muted)">Steps:</span>
    <button class="btn-control" data-phase-btn="1" data-target-deg="60" title="Piston moves outward, valve open, flame sucked in">1. Intake</button>
    <button class="btn-control" data-phase-btn="2" data-target-deg="168" title="Valve snaps shut at BDC">2. Seal</button>
    <button class="btn-control" data-phase-btn="3" data-target-deg="240" title="Cooling fins collapse pressure, vacuum pulls piston">3. Vacuum</button>
    <button class="btn-control" data-phase-btn="4" data-target-deg="335" title="Pressure equalizes, flywheel carries past TDC">4. Exhaust</button>
  </div>
  <div class="toolbar-group">
    <span style="color:var(--anatomy-muted)">Theme:</span>
    <div class="theme-pill-group">
      <button class="theme-pill ${theme === "dark" ? "active" : ""}" data-theme-choice="dark">Dark</button>
      <button class="theme-pill ${theme === "light" ? "active" : ""}" data-theme-choice="light">Light</button>
      <button class="theme-pill" data-theme-choice="brass">Brass</button>
      <button class="theme-pill" data-theme-choice="blueprint">Blueprint</button>
      <button class="theme-pill" data-theme-choice="amber">Amber</button>
    </div>
  </div>
</div>
`;

const plateCard = k.plateHtml({
  fig: "Fig 1",
  title: "Flame licker engine",
  hint: "Drag flywheel · [Space] run",
  readout: "θ: 45° · 1.00 bar · 888°C · 1. INTAKE",
  keys: [
    { mark: "lit", label: "Spirit burner & slide valve: ingests flame, then snaps shut at bottom dead center" },
    { mark: "raised", label: "8 Annular cooling fins & vacuum gauge: rapid heat sink collapses internal pressure to 0.44 bar" },
    { mark: "mid", label: "Connecting rod & heavy spoked flywheel: atmospheric pressure drives the power stroke into kinetic storage" },
  ],
  caption:
    "How a flame licker engine (vacuum engine) works: Unlike internal combustion or steam engines, it produces power by creating an internal depression. During the outward stroke, the eccentric opens the slide valve, drawing the spirit burner flame into the cylinder. At bottom dead center, the valve snaps shut. The 8 annular cooling fins rapidly cool the trapped gas, collapsing its pressure to a partial vacuum (0.44 bar). Higher atmospheric pressure (1.01 bar) outside the cylinder pushes the piston inward—the vacuum power stroke—driving the heavy flywheel across top dead center.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Flame Licker Engine interactive model: drag flywheel or use arrow keys" aria-valuemin="0" aria-valuemax="360" aria-valuenow="45">${svg}</div>`,
});

// Place the control toolbar cleanly under the plate card
const pageBody = `${plateCard}${controlBarHtml}`;

// Inject EXTRA_CSS into pageHtml styles
const customCss = k.ISO_CSS + EXTRA_CSS;

// Generate target file
const filename = theme === "light" ? "flame-licker-light.html" : "flame-licker.html";
const page = k.pageHtml({
  title: "Flame Licker Engine · Anatomy",
  theme,
  body: pageBody,
  script: kitScript() + live,
}).replace(k.ISO_CSS, customCss);

writeFileSync(join(HERE, filename), page);
console.log("Wrote", filename);
