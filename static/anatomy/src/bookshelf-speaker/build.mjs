import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/nick/.gemini/config/skills/anatomy/kit/iso-kit.mjs";
import * as l from "/home/nick/.gemini/config/skills/anatomy/kit/lathe.mjs";
import * as t from "/home/nick/.gemini/config/skills/anatomy/kit/tube.mjs";
import { kitScript } from "/home/nick/.gemini/config/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 960;
const HEIGHT = 620;

// Base plate / test bench
const BASE_PLATE = { x: -142, y: -142, w: 284, d: 284, r: 14 };
const PLATE_H = 12;
const FOOT_H = 7;

// Speaker 1 (Left, 1.5" Dome Tweeter + 5.5" Woofer)
const SP1_CX = -70;
const SP1_CY = 45;
const SP_W = 68;
const SP_D = 78;
const SP_H = 126;
const SP1_BOX = { x: SP1_CX - SP_W / 2, y: SP1_CY - SP_D / 2, w: SP_W, d: SP_D, r: 3 };

// Speaker 2 (Right, AMT Tweeter + 5.5" Woofer)
const SP2_CX = 70;
const SP2_CY = -45;
const SP2_BOX = { x: SP2_CX - SP_W / 2, y: SP2_CY - SP_D / 2, w: SP_W, d: SP_D, r: 3 };

// Center console (Signal generator / crossover analyzer)
const CONSOLE_BOX = { x: -28, y: -28, w: 56, d: 56, r: 4 };
const CONSOLE_H = 11;

// Drivers Z coordinates
const WOOFER_CZ = 44;
const TWEETER_CZ = 98;

// Driver dimensions (in world units, 1 unit ≈ 3 mm)
const WOOFER_R_OUTER = 22;
const WOOFER_R_SURROUND = 18;
const WOOFER_R_CONE_BASE = 7.2;
const WOOFER_R_DUST = 6.5;
const WOOFER_R_MAG = 15;

const DOME_R_OUTER = 13;
const DOME_R_DOME = 6.5;
const DOME_R_MAG = 9.5;

const AMT_W = 26;
const AMT_H = 32;
const AMT_AP_W = 16;
const AMT_AP_H = 24;

const P = k.fitProjection(
  [
    ...k.boxCorners(BASE_PLATE, -PLATE_H - FOOT_H, 0),
    ...k.boxCorners(SP1_BOX, 0, SP_H),
    ...k.boxCorners(SP2_BOX, 0, SP_H),
    ...k.boxCorners(CONSOLE_BOX, 0, CONSOLE_H),
  ],
  WIDTH,
  HEIGHT,
  { pad: 40, azimuth: 45, elevation: 30 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const W = (from, to, opts) => k.wireSvg(from, to, opts);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// -------------------------------------------------------------
// Base bench plate and isolation feet
// -------------------------------------------------------------
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE_PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];

  const footPositions = [
    [-115, -115],
    [-115, 115],
    [115, -115],
    [115, 115],
  ];
  for (const [x, y] of byDepth(footPositions)) {
    out.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, 2.5, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H + 2.5, FOOT_H - 2.5, P, 28), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 5, -PLATE_H - FOOT_H, 1, P, 20), { tone: "hi" }));
  }

  out.push(S(k.slabOf(BASE_PLATE, -PLATE_H, PLATE_H, P, 8, 1.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE_PLATE, 6), 0, P), { tone: "faint" }));

  const screws = k.corners(BASE_PLATE, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.5, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }));

  const strip = { x: -90, y: 122, w: 180, d: 7, r: 1.2 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45, tone: "lo" }));

  const specPlate = { x: -44, y: 100, w: 88, d: 15, r: 1.5 };
  out.push(S(k.slabOf(specPlate, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(specPlate, 1.6), 0.8, P), { tone: "faint" }));
  out.push(
    L(
      [58, 44, 32].map((w, i) => k.lineOnTop([specPlate.x + 6, specPlate.y + 3 + i * 3.6], [specPlate.x + 6 + w, specPlate.y + 3 + i * 3.6], 0.8, P)).join(""),
      { tone: "lo", free: true }
    )
  );
  out.push(
    D(
      [
        at([specPlate.x + 3.5, specPlate.y + 3.5, 0.8]),
        at([specPlate.x + specPlate.w - 3.5, specPlate.y + 3.5, 0.8]),
        at([specPlate.x + 3.5, specPlate.y + specPlate.d - 3.5, 0.8]),
        at([specPlate.x + specPlate.w - 3.5, specPlate.y + specPlate.d - 3.5, 0.8]),
      ],
      { size: 0.45, tone: "mid" }
    )
  );

  return out.join("");
}

// -------------------------------------------------------------
// Central Signal Generator & Crossover Analyzer Console
// -------------------------------------------------------------
function consoleDeck() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(CONSOLE_BOX, 0, 5, P)}"/>`);

  out.push(S(k.slabOf(CONSOLE_BOX, 0, CONSOLE_H, P, 6, 1.2), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(CONSOLE_BOX, 3), CONSOLE_H, P), { tone: "faint" }));

  const screws = k.corners(CONSOLE_BOX, 5);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.8, CONSOLE_H, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, CONSOLE_H])), { size: 0.45, tone: "lo" }));

  const dialX = 0, dialY = 0;
  out.push(S(k.cylinder(dialX, dialY, 13, CONSOLE_H, 1.5, P, 32), { tone: "lo" }));
  out.push(S(k.cylinder(dialX, dialY, 11, CONSOLE_H + 1.5, 6, P, 36), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(dialX, dialY, 11, CONSOLE_H + 1.5, CONSOLE_H + 7.5, 40, P), { tone: "lo" }));
  out.push(L(k.sideArc(dialX, dialY, 11, CONSOLE_H + 7.5, P, 24), { tone: "faint" }));
  out.push(L(k.ring(dialX, dialY, 9, CONSOLE_H + 7.5, P, 32), { tone: "lo" }));
  out.push(S(k.cylinder(dialX, dialY, 4, CONSOLE_H + 7.5, 1, P, 20), { tone: "mid" }));
  out.push(D([at([dialX, dialY, CONSOLE_H + 8.5])], { size: 0.6, tone: "hi" }));

  const radTicks = k.radialTicks(dialX, dialY, 15, 36, 6, CONSOLE_H, [1.5, 3], P);
  out.push(L(radTicks.minor, { tone: "lo" }));
  out.push(L(radTicks.major, { tone: "mid" }));

  out.push(
    `<g data-part="freq-pointer"><path class="iso-line" data-tone="lit" data-free="" d="${k.lineOnTop([dialX, dialY], [dialX + 9.5, dialY], CONSOLE_H + 7.6, P)}" style="stroke-width:1.4"/></g>`
  );

  const togX = -16, togY = 14;
  out.push(S(k.cylinder(togX, togY, 3.5, CONSOLE_H, 1.2, P, 18), { tone: "lo" }));
  out.push(S(k.cylinder(togX, togY, 2, CONSOLE_H + 1.2, 3, P, 16), { tone: "mid" }));
  out.push(S(k.cylinder(togX - 1.2, togY + 1.2, 1.4, CONSOLE_H + 4.2, 4.5, P, 14), { tone: "hi", lit: true }));
  out.push(D([at([togX - 1.2, togY + 1.2, CONSOLE_H + 8.7])], { size: 0.6, tone: "lit" }));

  const post1 = [-16, -14];
  out.push(S(k.cylinder(post1[0], post1[1], 2.8, CONSOLE_H, 4, P, 16), { tone: "hi" }));
  out.push(L(k.knurl(post1[0], post1[1], 2.8, CONSOLE_H, CONSOLE_H + 4, 16, P), { tone: "lo" }));

  const post2 = [16, -14];
  out.push(S(k.cylinder(post2[0], post2[1], 2.8, CONSOLE_H, 4, P, 16), { tone: "hi" }));
  out.push(L(k.knurl(post2[0], post2[1], 2.8, CONSOLE_H, CONSOLE_H + 4, 16, P), { tone: "lo" }));

  const meterPlan = { x: 8, y: 7, w: 14, d: 14, r: 1.5 };
  out.push(S(k.slabOf(meterPlan, CONSOLE_H, 0.6, P, 2), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(meterPlan, 1), CONSOLE_H + 0.6, P), { tone: "faint" }));

  for (let i = 0; i < 4; i++) {
    const barW = { x: 10, y: 9 + i * 2.8, w: 4.5, d: 1.8, r: 0.5 };
    const barT = { x: 16, y: 9 + i * 2.8, w: 4.5, d: 1.8, r: 0.5 };
    out.push(
      `<path class="iso-line meter-bar-woof" data-tone="${i < 2 ? "hi" : "lo"}" data-index="${i}" d="${k.planOutline(barW, CONSOLE_H + 0.7, P)}"/>`
    );
    out.push(
      `<path class="iso-line meter-bar-tweet" data-tone="${i >= 2 ? "hi" : "lo"}" data-index="${i}" d="${k.planOutline(barT, CONSOLE_H + 0.7, P)}"/>`
    );
  }

  const sp1Terminal = [SP1_BOX.x + SP_W, SP1_BOX.y + 16, 20];
  const sp2Terminal = [SP2_BOX.x, SP2_BOX.y + 16, 20];
  out.push(
    W(at([post1[0], post1[1], CONSOLE_H + 4]), at(sp1Terminal), {
      via: [at([-30, -5, 4]), at([-42, 10, 8])],
      tone: "mid",
      size: 0.8,
    })
  );
  out.push(
    W(at([post2[0], post2[1], CONSOLE_H + 4]), at(sp2Terminal), {
      via: [at([30, -25, 4]), at([42, -20, 8])],
      tone: "mid",
      size: 0.8,
    })
  );

  return out.join("");
}

// -------------------------------------------------------------
// Front Face Driver Mechanics (Mounted flush on front baffle)
// -------------------------------------------------------------
function wooferFront(cx, frontY) {
  const out = [];
  const F = l.frameAlong([cx, frontY, WOOFER_CZ], [0, -1, 0]);

  // 1. Curvilinear mineral-damped cone going inward from s=0.8 to s=14
  out.push(`<g data-part="woofer-cone" class="woofer-cone-active">`);
  const coneProfile = [
    [0.8, 18],
    [4, 15],
    [8, 12],
    [11, 9.5],
    [14, 7.2],
  ];
  out.push(S(l.solidOf(coneProfile, F, P), { tone: "hi", crease: "lo" }));
  out.push(L(l.circleOf(5, 14.5, F, P), { tone: "faint" }));
  out.push(L(l.circleOf(10, 10.5, F, P), { tone: "faint" }));

  // 2. Dust cap: convex dome in the center of the cone
  const dustProfile = [
    [10.5, 0],
    [11.5, 2.8],
    [12.8, 4.8],
    [14, 6.5],
  ];
  out.push(S(l.solidOf(dustProfile, F, P), { tone: "hi", lit: true }));
  out.push(L(l.circleOf(14, 6.5, F, P), { tone: "faint" }));
  out.push(`</g>`); // end woofer-cone-active

  // 3. Compliant half-roll rubber surround (convex roll between r=18 and r=21.5)
  const surroundProfile = [
    [0, 21.5],
    [-1.2, 20.8],
    [-2, 19.8],
    [-1.2, 18.8],
    [0.8, 18],
  ];
  out.push(S(l.solidOf(surroundProfile, F, P), { tone: "mid", crease: "none" }));

  // 4. Outer cast basket flange rim: an open ring band (rIn=18, rOut=22, thickness 2)
  out.push(S(l.ringBand(0, 2, 18, WOOFER_R_OUTER, F, P), { tone: "mid" }));
  out.push(L(l.circleOf(0, WOOFER_R_OUTER, F, P), { tone: "lo" }));
  out.push(L(l.circleOf(0, 18, F, P), { tone: "lo" }));

  // 6 hex mounting socket screws on outer flange rim
  const screwAngles = [0, 60, 120, 180, 240, 300];
  const screwRadius = WOOFER_R_OUTER - 2;
  const screwPoints = screwAngles.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return l.add3(
      F.o,
      l.add3(l.mul3(F.u, Math.cos(rad) * screwRadius), l.mul3(F.v, Math.sin(rad) * screwRadius))
    );
  });
  out.push(L(screwPoints.map((pt) => k.ring(pt[0], pt[1], 1.1, pt[2], P, 12)).join(""), { tone: "lo" }));
  out.push(D(screwPoints.map((pt) => at(pt)), { size: 0.45, tone: "lo" }));

  return out.join("");
}

function domeTweeterFront(cx, frontY) {
  const out = [];
  const F = l.frameAlong([cx, frontY, TWEETER_CZ], [0, -1, 0]);

  // 1. Waveguide shallow exponential horn flare
  const waveguideProfile = [
    [0, 13],
    [0.8, 11],
    [1.6, 8.5],
    [2.2, 6.5],
  ];
  out.push(S(l.solidOf(waveguideProfile, F, P), { tone: "hi", crease: "none" }));
  out.push(L(l.circleOf(2.2, 6.5, F, P), { tone: "faint" }));

  // 2. 1.5" Silk Dome diaphragm (convex spherical dome bulging forward)
  const domeProfile = [
    [-3.2, 0],
    [-2.8, 2.5],
    [-1.6, 4.8],
    [0.5, 6.2],
    [2.2, 6.5],
  ];
  out.push(
    `<g data-part="dome-diaphragm" class="dome-active">${S(l.solidOf(domeProfile, F, P), { tone: "hi", lit: true })}`
  );
  out.push(L(l.circleOf(-1.6, 4.8, F, P), { tone: "faint" }));
  out.push(`</g>`);

  // 3. Round aluminum outer flange ring (rIn=6.5, rOut=13, thickness 2)
  out.push(S(l.ringBand(0, 2, 6.5, DOME_R_OUTER, F, P), { tone: "mid" }));
  out.push(L(l.circleOf(0, DOME_R_OUTER, F, P), { tone: "lo" }));

  // 4 mounting screws at 90° intervals
  const screwAngles = [45, 135, 225, 315];
  const screwPoints = screwAngles.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return l.add3(
      F.o,
      l.add3(l.mul3(F.u, Math.cos(rad) * (DOME_R_OUTER - 2)), l.mul3(F.v, Math.sin(rad) * (DOME_R_OUTER - 2)))
    );
  });
  out.push(L(screwPoints.map((pt) => k.ring(pt[0], pt[1], 1, pt[2], P, 12)).join(""), { tone: "lo" }));
  out.push(D(screwPoints.map((pt) => at(pt)), { size: 0.4, tone: "lo" }));

  return out.join("");
}

function amtTweeterFront(cx, frontY) {
  const out = [];
  const plateX0 = cx - AMT_W / 2;
  const plateX1 = cx + AMT_W / 2;
  const plateZ0 = TWEETER_CZ - AMT_H / 2;
  const plateZ1 = TWEETER_CZ + AMT_H / 2;

  // Faceplate slab
  const fpPlan = { x: plateX0, y: frontY, w: AMT_W, d: 2, r: 1.5 };
  out.push(S(k.slabOf(fpPlan, plateZ0, AMT_H, P, 3, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(fpPlan, 1.2), plateZ1, P), { tone: "faint" }));

  // 4 corner hex screws
  const screws = [
    [plateX0 + 2.5, frontY + 2, plateZ0 + 2.5],
    [plateX1 - 2.5, frontY + 2, plateZ0 + 2.5],
    [plateX0 + 2.5, frontY + 2, plateZ1 - 2.5],
    [plateX1 - 2.5, frontY + 2, plateZ1 - 2.5],
  ];
  out.push(L(screws.map((pt) => k.ring(pt[0], pt[1], 1, pt[2], P, 12)).join(""), { tone: "lo" }));
  out.push(D(screws.map((pt) => at(pt)), { size: 0.4, tone: "lo" }));

  // Aperture opening (16 × 24 mm)
  const apX0 = cx - AMT_AP_W / 2;
  const apX1 = cx + AMT_AP_W / 2;
  const apZ0 = TWEETER_CZ - AMT_AP_H / 2;
  const apZ1 = TWEETER_CZ + AMT_AP_H / 2;

  out.push(
    L(
      k.pathOf([
        at([apX0, frontY + 2, apZ0]),
        at([apX1, frontY + 2, apZ0]),
        at([apX1, frontY + 2, apZ1]),
        at([apX0, frontY + 2, apZ1]),
      ], true),
      { tone: "lo" }
    )
  );

  // ACCORDION PLEATED DIAPHRAGM
  const pleatZ0 = apZ0 + 1;
  const pleatZ1 = apZ1 - 1;
  const pleatsCount = 6;
  const pleatSpanX = AMT_AP_W - 2;
  const pleatPitch = pleatSpanX / pleatsCount;

  out.push(`<g data-part="amt-pleats" class="amt-pleats-active">`);

  for (let p = 0; p < pleatsCount; p++) {
    const px0 = apX0 + 1 + p * pleatPitch;
    const pxMid = px0 + pleatPitch / 2;
    const px1 = px0 + pleatPitch;

    const pFront0 = [px0, frontY - 2, pleatZ0];
    const pFront0Top = [px0, frontY - 2, pleatZ1];
    const pDeep = [pxMid, frontY - 9, pleatZ0];
    const pDeepTop = [pxMid, frontY - 9, pleatZ1];
    const pFront1 = [px1, frontY - 2, pleatZ0];
    const pFront1Top = [px1, frontY - 2, pleatZ1];

    const leftQuad = [at(pFront0), at(pDeep), at(pDeepTop), at(pFront0Top)];
    out.push(`<polygon class="iso-fill amt-kapton" points="${leftQuad.map((p) => p.join(",")).join(" ")}"/>`);
    const traceLeft = [
      at([px0 * 0.4 + pxMid * 0.6, frontY - 5.5, pleatZ0 + 1]),
      at([px0 * 0.4 + pxMid * 0.6, frontY - 5.5, pleatZ1 - 1]),
    ];
    out.push(L(k.pathOf(traceLeft), { tone: "lit" }));

    const rightQuad = [at(pDeep), at(pFront1), at(pFront1Top), at(pDeepTop)];
    out.push(`<polygon class="iso-fill amt-kapton" points="${rightQuad.map((p) => p.join(",")).join(" ")}"/>`);
    const traceRight = [
      at([pxMid * 0.6 + px1 * 0.4, frontY - 5.5, pleatZ0 + 1]),
      at([pxMid * 0.6 + px1 * 0.4, frontY - 5.5, pleatZ1 - 1]),
    ];
    out.push(L(k.pathOf(traceRight), { tone: "lit" }));

    out.push(L(k.pathOf([at(pDeep), at(pDeepTop)]), { tone: "lo" }));
    out.push(L(k.pathOf([at(pFront0), at(pFront0Top)]), { tone: "hi" }));
  }
  out.push(`</g>`);

  // 5 horizontal precision slotted grille vanes across aperture
  for (let i = 0; i < 5; i++) {
    const vz = apZ0 + 3.5 + i * 4.2;
    const vanePlan = { x: apX0, y: frontY + 1.2, w: AMT_AP_W, d: 0.8, r: 0.3 };
    out.push(S(k.slabOf(vanePlan, vz - 0.5, 1, P, 2), { tone: "hi", crease: "none" }));
  }

  return out.join("");
}

// -------------------------------------------------------------
// Speaker Cabinet with Cutaway Interior & Drivers
// -------------------------------------------------------------
function speakerCabinet(box, cx, cy, isAMT = false) {
  const out = [];
  const frontY = box.y + box.d;
  const rightX = box.x + box.w;

  // 4 isolation spike feet under speaker cabinet base
  const spikes = [
    [box.x + 8, box.y + 8],
    [box.x + box.w - 8, box.y + 8],
    [box.x + 8, frontY - 8],
    [box.x + box.w - 8, frontY - 8],
  ];
  for (const [sx, sy] of byDepth(spikes)) {
    out.push(S(k.cylinder(sx, sy, 3, 0, 4, P, 18), { tone: "hi" }));
    out.push(D([at([sx, sy, 0])], { size: 0.45, tone: "mid" }));
  }

  // Cabinet plinth base (z = 4 to 8)
  const plinth = { x: box.x + 2, y: box.y + 2, w: box.w - 4, d: box.d - 4, r: 2.5 };
  out.push(S(k.slabOf(plinth, 4, 4, P, 4), { tone: "lo" }));

  // Top cap (z = SP_H - 4 to SP_H)
  const topCap = { x: box.x - 0.5, y: box.y - 0.5, w: box.w + 1, d: box.d + 1, r: 3 };

  // -----------------------------------------------------------
  // 1. ASSEMBLED EXTERIOR VIEW GROUP (shown when Cutaway is off)
  // -----------------------------------------------------------
  const assembledOut = [];
  assembledOut.push(S(k.slabOf(box, 8, SP_H - 12, P, 6, 1.2), { tone: "mid" }));
  assembledOut.push(S(k.slabOf(topCap, SP_H - 4, 4, P, 6, 1.4), { tone: "hi", crease: "lo" }));
  assembledOut.push(L(k.planOutline(k.insetPlan(topCap, 2.5), SP_H, P), { tone: "faint" }));

  assembledOut.push(
    L(
      k.pathOf([
        at([box.x + 2, frontY, 10]),
        at([rightX - 2, frontY, 10]),
        at([rightX - 2, frontY, SP_H - 6]),
        at([box.x + 2, frontY, SP_H - 6]),
      ], true),
      { tone: "faint" }
    )
  );

  assembledOut.push(
    L(
      k.pathOf([
        at([rightX, box.y + 4, 10]),
        at([rightX, frontY - 2, 10]),
        at([rightX, frontY - 2, SP_H - 6]),
        at([rightX, box.y + 4, SP_H - 6]),
      ], true),
      { tone: "faint" }
    )
  );
  out.push(`<g class="spk-assembled">${assembledOut.join("")}</g>`);

  // -----------------------------------------------------------
  // 2. CUTAWAY INTERIOR VIEW GROUP (shown when Cutaway is on)
  // -----------------------------------------------------------
  const cutawayOut = [];

  // Bottom MDF panel
  const mdfBottom = { x: box.x, y: box.y, w: box.w, d: box.d, r: 3 };
  cutawayOut.push(S(k.slabOf(mdfBottom, 8, 6, P, 5), { tone: "mid" }));

  // Rear MDF wall
  const mdfRear = { x: box.x, y: box.y, w: box.w, d: 6, r: 2 };
  cutawayOut.push(S(k.slabOf(mdfRear, 14, SP_H - 18, P, 4), { tone: "mid" }));

  // Top MDF panel
  const mdfTop = { x: box.x, y: box.y, w: box.w, d: box.d, r: 3 };
  cutawayOut.push(S(k.slabOf(mdfTop, SP_H - 10, 6, P, 5), { tone: "mid" }));

  // Front MDF baffle
  const mdfFront = { x: box.x, y: frontY - 6, w: box.w, d: 6, r: 2.5 };
  cutawayOut.push(S(k.slabOf(mdfFront, 14, SP_H - 24, P, 4), { tone: "mid" }));

  // Section cut edge outline
  const sectionCutEdge = [
    at([rightX, box.y + 6, 14]),
    at([rightX, frontY - 6, 14]),
    at([rightX, frontY - 6, SP_H - 10]),
    at([rightX, box.y + 6, SP_H - 10]),
  ];
  cutawayOut.push(L(k.pathOf(sectionCutEdge, true), { tone: "hi" }));

  // Top cap
  cutawayOut.push(S(k.slabOf(topCap, SP_H - 4, 4, P, 6, 1.4), { tone: "hi", crease: "lo" }));

  // Acoustic cavity dark shading background
  const cavityPoints = [
    at([rightX - 6, box.y + 6, 14]),
    at([rightX - 6, frontY - 6, 14]),
    at([rightX - 6, frontY - 6, SP_H - 10]),
    at([rightX - 6, box.y + 6, SP_H - 10]),
  ];
  cutawayOut.push(`<polygon class="iso-fill cavity-dark" points="${cavityPoints.map((p) => p.join(",")).join(" ")}"/>`);

  // Internal shelf brace at z = 64 to 68
  const brace = { x: box.x + 6, y: box.y + 6, w: box.w - 12, d: box.d - 12, r: 1.5 };
  cutawayOut.push(S(k.slabOf(brace, 64, 4, P, 3), { tone: "mid" }));
  cutawayOut.push(L(k.ring(cx, cy, 14, 68, P, 24), { tone: "faint" }));

  // Acoustic damping pads & closed waffle tiles
  const dampingBack = { x: box.x + 8, y: box.y + 6, w: box.w - 16, d: 4, r: 1 };
  cutawayOut.push(S(k.slabOf(dampingBack, 16, 44, P, 3), { tone: "lo", crease: "none" }));
  for (let lz = 22; lz < 56; lz += 8) {
    for (let lx = box.x + 14; lx <= rightX - 22; lx += 12) {
      const tile = [
        at([lx, box.y + 10, lz]),
        at([lx + 8, box.y + 10, lz]),
        at([lx + 8, box.y + 10, lz + 5]),
        at([lx, box.y + 10, lz + 5]),
      ];
      cutawayOut.push(L(k.pathOf(tile, true), { tone: "faint" }));
    }
  }

  // Bass reflex port tube on rear wall
  const portZ = 88;
  const F_PORT = l.frameAlong([cx, box.y + 2, portZ], [0, 1, 0]);
  cutawayOut.push(S(l.disc(0, 32, 7.2, F_PORT, P), { tone: "mid" }));
  cutawayOut.push(S(l.disc(0, 32.2, 5.8, F_PORT, P), { tone: "lo" }));
  cutawayOut.push(S(l.solidOf([[30, 7.2], [32, 8.5], [34, 10]], F_PORT, P), { tone: "hi", crease: "none" }));
  cutawayOut.push(S(l.disc(-2, 0, 9, F_PORT, P), { tone: "mid" }));
  cutawayOut.push(L(l.circleOf(0, 9, F_PORT, P), { tone: "lo" }));

  // Rear bi-wire terminal cup at z = 24
  const termZ = 24;
  const F_TERM = l.frameAlong([cx, box.y, termZ], [0, 1, 0]);
  cutawayOut.push(S(l.disc(-3, 1, 9, F_TERM, P), { tone: "lo" }));
  for (let [dx, dz] of [[-3.5, -3], [-3.5, 3], [3.5, -3], [3.5, 3]]) {
    const postPt = [cx + dx, box.y - 4, termZ + dz];
    cutawayOut.push(S(k.cylinder(postPt[0], postPt[1], 1.4, postPt[2], 3, P, 12), { tone: "hi", lit: true }));
  }

  // 2-Way Passive Crossover Network PCB on internal floor
  const pcbPlan = { x: box.x + 8, y: cy - 12, w: box.w - 16, d: 24, r: 1.5 };
  cutawayOut.push(S(k.slabOf(pcbPlan, 14, 1.6, P, 3), { tone: "lo", crease: "none" }));
  cutawayOut.push(L(k.planOutline(k.insetPlan(pcbPlan, 1.2), 15.6, P), { tone: "faint" }));

  const indW = [box.x + 18, cy - 2];
  cutawayOut.push(S(k.cylinder(indW[0], indW[1], 6.5, 15.6, 7, P, 24), { tone: "hi" }));
  for (let iz = 17; iz < 22; iz += 1.8) {
    cutawayOut.push(L(k.sideArc(indW[0], indW[1], 6.5, iz, P, 16), { tone: "hi" }));
  }

  const indT = [box.x + 36, cy - 4];
  cutawayOut.push(S(k.cylinder(indT[0], indT[1], 4.5, 15.6, 5, P, 20), { tone: "mid" }));

  const capPlan = { x: box.x + 26, y: cy + 4, w: 12, d: 5, r: 2 };
  cutawayOut.push(S(k.slabOf(capPlan, 15.6, 5, P, 3), { tone: "hi", lit: true }));
  cutawayOut.push(L(k.lineOnTop([capPlan.x + 2, capPlan.y + 2.5], [capPlan.x + 10, capPlan.y + 2.5], 20.6, P), { tone: "lo", free: true }));

  const resPlan = { x: box.x + 12, y: cy + 5, w: 10, d: 4, r: 0.8 };
  cutawayOut.push(S(k.slabOf(resPlan, 15.6, 4, P, 2), { tone: "mid", crease: "none" }));

  // Internal wiring harness
  const wfrSolderLugs = [cx, frontY - 14, WOOFER_CZ - 12];
  const twtSolderLugs = [cx, frontY - 10, TWEETER_CZ - 10];
  cutawayOut.push(
    W(at([indW[0], indW[1], 22.6]), at(wfrSolderLugs), {
      via: [at([box.x + 20, cy + 8, 26]), at([cx - 8, frontY - 18, 32])],
      tone: "hi",
      size: 0.7,
    })
  );
  cutawayOut.push(
    W(at([capPlan.x + 6, capPlan.y + 2.5, 20.6]), at(twtSolderLugs), {
      via: [at([box.x + 28, cy + 6, 45]), at([rightX - 10, cy, 75]), at([cx, frontY - 16, 88])],
      tone: "hi",
      size: 0.7,
    })
  );

  // WOOFER MOTOR ASSEMBLY INSIDE CUTAWAY
  const F_W_MOTOR = l.frameAlong([cx, frontY, WOOFER_CZ], [0, -1, 0]);
  cutawayOut.push(S(l.disc(16, 18, 12, F_W_MOTOR, P), { tone: "lo" }));
  cutawayOut.push(S(l.disc(16, 28, 7.2, F_W_MOTOR, P), { tone: "hi", lit: true }));
  cutawayOut.push(L(l.circleOf(20, 7.4, F_W_MOTOR, P), { tone: "hi" }));
  cutawayOut.push(L(l.circleOf(23, 7.4, F_W_MOTOR, P), { tone: "hi" }));
  cutawayOut.push(S(l.disc(18, 21, WOOFER_R_MAG, F_W_MOTOR, P), { tone: "mid" }));
  cutawayOut.push(S(l.disc(21, 32, WOOFER_R_MAG, F_W_MOTOR, P), { tone: "lo" }));
  cutawayOut.push(L(l.circleOf(26, WOOFER_R_MAG, F_W_MOTOR, P), { tone: "faint" }));
  cutawayOut.push(S(l.disc(32, 35, WOOFER_R_MAG, F_W_MOTOR, P), { tone: "mid" }));
  cutawayOut.push(S(l.disc(32, 35.2, 3.2, F_W_MOTOR, P), { tone: "lo" }));
  cutawayOut.push(L(l.circleOf(35, 3.2, F_W_MOTOR, P), { tone: "hi" }));

  // TWEETER MOTOR ASSEMBLY INSIDE CUTAWAY
  if (isAMT) {
    const apX0 = cx - AMT_AP_W / 2;
    const apX1 = cx + AMT_AP_W / 2;
    const apZ0 = TWEETER_CZ - AMT_AP_H / 2;
    const magL = { x: apX0 - 4, y: frontY - 12, w: 3.5, d: 11, r: 0.8 };
    cutawayOut.push(S(k.slabOf(magL, apZ0 - 1, AMT_AP_H + 2, P, 3), { tone: "hi" }));
    const magR = { x: apX1 + 0.5, y: frontY - 12, w: 3.5, d: 11, r: 0.8 };
    cutawayOut.push(S(k.slabOf(magR, apZ0 - 1, AMT_AP_H + 2, P, 3), { tone: "hi" }));
    const rearCavity = { x: apX0 - 3, y: frontY - 15, w: AMT_AP_W + 6, d: 3, r: 1 };
    cutawayOut.push(S(k.slabOf(rearCavity, apZ0 - 2, AMT_AP_H + 4, P, 3), { tone: "lo" }));
  } else {
    const F_D_MOTOR = l.frameAlong([cx, frontY, TWEETER_CZ], [0, -1, 0]);
    cutawayOut.push(S(l.disc(2.5, 14, DOME_R_MAG, F_D_MOTOR, P), { tone: "mid" }));
    cutawayOut.push(S(l.disc(14, 18, 8, F_D_MOTOR, P), { tone: "lo" }));
    cutawayOut.push(L(l.circleOf(18, 8, F_D_MOTOR, P), { tone: "faint" }));
  }

  out.push(`<g class="spk-cutaway">${cutawayOut.join("")}</g>`);

  // -----------------------------------------------------------
  // 3. FRONT DRIVERS (Mounted flush on front baffle)
  // -----------------------------------------------------------
  out.push(wooferFront(cx, frontY));

  if (isAMT) {
    out.push(amtTweeterFront(cx, frontY));
  } else {
    out.push(domeTweeterFront(cx, frontY));
  }

  // -----------------------------------------------------------
  // 4. ACOUSTIC EMISSION SOUND WAVES (Radiating forward into room)
  // -----------------------------------------------------------
  // Woofer low frequency wave arcs
  const waveWoofer = [];
  for (const R of [16, 28, 40]) {
    const pts = [];
    for (let a = -45; a <= 45; a += 15) {
      const rad = (a * Math.PI) / 180;
      const x = cx + R * Math.sin(rad) * 0.75;
      const y = frontY + R * Math.cos(rad);
      pts.push(at([x, y, WOOFER_CZ]));
    }
    waveWoofer.push(k.pathOf(pts));
  }
  out.push(
    `<g data-part="wave-woofer" class="wave-woofer-active"><path class="iso-line acoustic-wave-woof" data-tone="lit" data-free="" d="${waveWoofer.join("")}" style="stroke-width:1.3;opacity:0.8"/></g>`
  );

  // Tweeter sound waves
  if (isAMT) {
    // AMT directional high-velocity air jets and wavefronts
    const waveAMT = [];
    for (const R of [14, 26, 38]) {
      const pts = [];
      for (let a = -35; a <= 35; a += 12) {
        const rad = (a * Math.PI) / 180;
        const x = cx + R * Math.sin(rad) * 0.55;
        const y = frontY + R * Math.cos(rad);
        pts.push(at([x, y, TWEETER_CZ]));
      }
      waveAMT.push(k.pathOf(pts));
    }
    // High-velocity ejection arrows (5:1 acceleration vectors)
    const arrow1 = k.pathOf([at([cx - 4, frontY + 8, TWEETER_CZ]), at([cx - 4, frontY + 24, TWEETER_CZ])]);
    const arrow2 = k.pathOf([at([cx + 4, frontY + 8, TWEETER_CZ]), at([cx + 4, frontY + 24, TWEETER_CZ])]);
    out.push(
      `<g data-part="wave-amt" class="wave-amt-active"><path class="iso-line acoustic-wave-amt" data-tone="lit" data-free="" d="${waveAMT.join("") + arrow1 + arrow2}" style="stroke-width:1.4;opacity:0.8"/></g>`
    );
  } else {
    // 1.5" Dome 1:1 spherical direct radiating waves
    const waveDome = [];
    for (const R of [14, 26, 38]) {
      const pts = [];
      for (let a = -45; a <= 45; a += 15) {
        const rad = (a * Math.PI) / 180;
        const x = cx + R * Math.sin(rad) * 0.75;
        const y = frontY + R * Math.cos(rad);
        pts.push(at([x, y, TWEETER_CZ]));
      }
      waveDome.push(k.pathOf(pts));
    }
    out.push(
      `<g data-part="wave-dome" class="wave-dome-active"><path class="iso-line acoustic-wave-dome" data-tone="lit" data-free="" d="${waveDome.join("")}" style="stroke-width:1.2;opacity:0.8"/></g>`
    );
  }

  return out.join("");
}

// -------------------------------------------------------------
// Assembly of complete figure SVG
// -------------------------------------------------------------
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Anatomy of bookshelf speakers: comparing a classic 1.5-inch silk dome tweeter against an Air Motion Transformer (AMT) folded tweeter, paired with matching 5.5-inch curvilinear woofers in tuned bass reflex enclosures.",
  body: [
    plate(),
    consoleDeck(),
    `<g data-part="speaker-dome">${speakerCabinet(SP1_BOX, SP1_CX, SP1_CY, false)}</g>`,
    `<g data-part="speaker-amt">${speakerCabinet(SP2_BOX, SP2_CX, SP2_CY, true)}</g>`,
  ],
});

// -------------------------------------------------------------
// Live Interactive Script (Frequency sweep, Crossover, Motion)
// -------------------------------------------------------------
const live = `
const P = ${JSON.stringify(P)};
const SP1_CX = ${SP1_CX}, SP2_CX = ${SP2_CX};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const pointerEl = svg.querySelector('[data-part="freq-pointer"]');
const meterWoofBars = svg.querySelectorAll(".meter-bar-woof");
const meterTweetBars = svg.querySelectorAll(".meter-bar-tweet");
const woofCones = svg.querySelectorAll('[data-part="woofer-cone"]');
const domeDiaphragm = svg.querySelector('[data-part="dome-diaphragm"]');
const amtPleats = svg.querySelector('[data-part="amt-pleats"]');
const waveWoofers = svg.querySelectorAll('[data-part="wave-woofer"]');
const waveDome = svg.querySelector('[data-part="wave-dome"]');
const waveAMT = svg.querySelector('[data-part="wave-amt"]');

const still = matchMedia("(prefers-reduced-motion: reduce)");

const PRESETS = [
  { freq: 45, label: "45 Hz · Deep Bass / Port Helmholtz Resonance" },
  { freq: 800, label: "800 Hz · Vocal Midrange Band" },
  { freq: 2800, label: "2,800 Hz · Crossover Transition Point (50/50)" },
  { freq: 12000, label: "12,000 Hz · High Treble & Air (Dome 1:1 vs AMT 5:1)" }
];

let targetFreq = 2800;
let currentFreq = 2800;
let isCutaway = true;
stage.setAttribute("data-cutaway", "true");

let frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0;

const minLog = Math.log10(40);
const maxLog = Math.log10(20000);
const freqToShare = (f) => (Math.log10(Math.min(20000, Math.max(40, f))) - minLog) / (maxLog - minLog);
const shareToFreq = (s) => Math.pow(10, minLog + Math.min(1, Math.max(0, s)) * (maxLog - minLog));

function updateCrossover(f) {
  const fc = 2800;
  const ratio = Math.pow(f / fc, 4);
  const woofPwr = 1 / (1 + ratio);
  const tweetPwr = ratio / (1 + ratio);
  return { woofPwr, tweetPwr };
}

function draw(now) {
  const { woofPwr, tweetPwr } = updateCrossover(currentFreq);
  const share = freqToShare(currentFreq);

  const pointerAngle = (share * 280 - 140) * Math.PI / 180;
  const pLen = 9.5;
  const px = Math.cos(pointerAngle) * pLen;
  const py = Math.sin(pointerAngle) * pLen;
  const ptrPath = lineOnTop([0, 0], [px, py], 18.5, P);
  if (pointerEl) {
    const pathTag = pointerEl.querySelector("path");
    if (pathTag) pathTag.setAttribute("d", ptrPath);
  }

  const woofActive = Math.round(woofPwr * 4);
  const tweetActive = Math.round(tweetPwr * 4);
  meterWoofBars.forEach((bar, i) => {
    bar.setAttribute("data-tone", i < woofActive ? "lit" : "faint");
  });
  meterTweetBars.forEach((bar, i) => {
    bar.setAttribute("data-tone", i < tweetActive ? "lit" : "faint");
  });

  const t = now / 1000;
  const excursionScale = Math.min(3.2, 3.2 * Math.pow(80 / Math.max(40, currentFreq), 0.75)) * Math.sqrt(woofPwr);
  const woofOffset = Math.sin(t * Math.min(24, currentFreq / 8)) * excursionScale;

  woofCones.forEach(cone => {
    cone.setAttribute("transform", translateAlong(P, [0, woofOffset, 0]));
  });

  const domeOffset = Math.sin(t * 36) * (0.8 * tweetPwr);
  if (domeDiaphragm) {
    domeDiaphragm.setAttribute("transform", translateAlong(P, [0, domeOffset, 0]));
  }

  const pleatSqueeze = 1 + Math.sin(t * 40) * (0.18 * tweetPwr);
  if (amtPleats) {
    amtPleats.setAttribute("transform", "scale(" + pleatSqueeze.toFixed(3) + " 1)");
  }

  waveWoofers.forEach(w => {
    const pulse = (0.3 + 0.7 * Math.abs(Math.sin(t * 12))) * woofPwr;
    w.style.opacity = pulse > 0.05 ? pulse.toFixed(2) : "0";
  });
  if (waveDome) {
    const pulse = (0.3 + 0.7 * Math.abs(Math.sin(t * 28))) * tweetPwr;
    waveDome.style.opacity = pulse > 0.05 ? pulse.toFixed(2) : "0";
  }
  if (waveAMT) {
    const pulse = (0.4 + 0.6 * Math.abs(Math.sin(t * 32))) * tweetPwr;
    waveAMT.style.opacity = pulse > 0.05 ? pulse.toFixed(2) : "0";
  }

  const woofPct = Math.round(woofPwr * 100);
  const tweetPct = Math.round(tweetPwr * 100);
  let statusText = Math.round(currentFreq) + " Hz · ";

  if (currentFreq < 120) {
    statusText += "Port tuned · Woofer 100% · ±" + excursionScale.toFixed(1) + " mm";
  } else if (currentFreq >= 2400 && currentFreq <= 3200) {
    statusText += "Crossover 50/50 · Phase-aligned";
  } else if (currentFreq > 5000) {
    statusText += "Tweeter 100% · AMT 5:1 vs Dome 1:1";
  } else {
    statusText += "Midrange · Woofer " + woofPct + "% / Tweeter " + tweetPct + "%";
  }

  if (readout && readout.textContent !== statusText) {
    readout.textContent = statusText;
  }
  stage.setAttribute("aria-valuenow", String(Math.round(currentFreq)));
  stage.setAttribute("aria-valuetext", statusText);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;

  if (touring) {
    clock += dt;
    const tourIndex = Math.floor(clock / 3.4) % PRESETS.length;
    targetFreq = PRESETS[tourIndex].freq;
  }

  currentFreq = calm ? targetFreq : currentFreq + (targetFreq - currentFreq) * (1 - Math.exp(-dt / 0.32));
  if (Math.abs(targetFreq - currentFreq) < 2) currentFreq = targetFreq;

  draw(now);

  const settled = !touring && Math.abs(currentFreq - targetFreq) < 1;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}

const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };

const steer = (nextFreq) => {
  touring = false;
  targetFreq = Math.min(20000, Math.max(40, nextFreq));
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4000);
  run();
};

const toggleCutaway = () => {
  isCutaway = !isCutaway;
  stage.setAttribute("data-cutaway", isCutaway ? "true" : "false");
};

new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) run();
}, { rootMargin: "120px 0px" }).observe(stage);

if (still.matches) touring = false;

stage.addEventListener("pointermove", (event) => {
  if (event.buttons > 0) {
    const box = svg.getBoundingClientRect();
    const share = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    steer(shareToFreq(share));
  }
});

stage.addEventListener("click", (event) => {
  const clickedToggle = event.target.closest('[data-part="speaker-dome"], [data-part="speaker-amt"]');
  if (clickedToggle) {
    toggleCutaway();
  }
});

stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();
    steer(currentFreq * 1.25);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();
    steer(currentFreq / 1.25);
  } else if (event.key === "1") {
    steer(45);
  } else if (event.key === "2") {
    steer(800);
  } else if (event.key === "3") {
    steer(2800);
  } else if (event.key === "4") {
    steer(12000);
  } else if (event.key === " " || event.key.toLowerCase() === "c") {
    event.preventDefault();
    toggleCutaway();
  }
});

draw(0);
run();
`;

// -------------------------------------------------------------
// Component Styles
// -------------------------------------------------------------
const css = `<style>
.amt-kapton {
  fill: #d48e28;
  opacity: 0.92;
}
.iso[data-theme="light"] .amt-kapton {
  fill: #b36b12;
}
.cavity-dark {
  fill: var(--anatomy-shade-0);
  opacity: 0.85;
}
.spk-cutaway {
  display: contents;
}
.spk-assembled {
  display: none;
}
.iso-stage[data-cutaway="false"] .spk-cutaway {
  display: none;
}
.iso-stage[data-cutaway="false"] .spk-assembled {
  display: contents;
}
.acoustic-wave-woof, .acoustic-wave-dome, .acoustic-wave-amt {
  transition: opacity 0.15s ease-out;
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

// -------------------------------------------------------------
// Card & Page Template
// -------------------------------------------------------------
const body =
  css +
  k.plateHtml({
    fig: "Fig 1",
    title: "Bookshelf speakers · 1.5″ Dome vs AMT Tweeter",
    hint: "Drag to tune · Space toggles cutaway",
    readout: "2,800 Hz · Crossover 50/50 · Phase-aligned",
    keys: [
      { mark: "lit", label: "Active audio current, voice coil in magnetic gap, and sound waves" },
      { mark: "raised", label: "5.5″ mineral cone, half-roll rubber surround, and 2-way crossover PCB" },
      { mark: "edge", label: "Speaker 1: 1.5″ silk dome (1:1 piston) · Speaker 2: AMT folded pleats (5:1 velocity)" },
    ],
    caption:
      "Comparison of two reference 2-way bookshelf monitors. Both share a 5.5-inch curvilinear woofer, rear-flared bass reflex port, internal bracing, and 2,800 Hz Linkwitz-Riley crossover. Speaker 1 (left) employs a traditional 1.5-inch silk dome tweeter acting as a 1:1 direct radiator piston. Speaker 2 (right) features an Oskar Heil Air Motion Transformer (AMT): an accordion-pleated Kapton diaphragm with etched aluminum traces that squeezes adjacent folds, expelling air with a 5:1 velocity transformation ratio.",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Bookshelf speaker analyzer: drag or arrow keys to tune audio frequency, Space toggles internal acoustic cutaway" aria-valuemin="40" aria-valuemax="20000" aria-valuenow="2800">${svg}</div>`,
  });

const outName = theme === "light" ? "bookshelf-speaker-light.html" : "bookshelf-speaker.html";
writeFileSync(join(HERE, outName), k.pageHtml({ title: "Bookshelf speakers · Dome vs AMT", theme, body, script: kitScript() + live }));
console.log("wrote", outName);
