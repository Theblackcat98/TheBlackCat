import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/nick/.config/opencode/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/home/nick/.config/opencode/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 720;
const HEIGHT = 440;

const PLATE = { x: -150, y: -90, w: 300, d: 180, r: 10 };
const PLATE_H = 12;
const FOOT_H = 6;

const HOUSING = { x: -70, y: -40, w: 140, d: 80, r: 8 };
const MOTOR_Z = 18;
const MOTOR_H = 28;
const HAMMER_Z = MOTOR_Z + MOTOR_H;
const HAMMER_H = 16;
const ANVIL_Z = HAMMER_Z + HAMMER_H;
const ANVIL_H = 14;
const NOSE_Z = ANVIL_Z + ANVIL_H;
const NOSE_H = 10;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [HOUSING.x + HOUSING.w, HOUSING.y + HOUSING.d, NOSE_Z + NOSE_H + 4],
    [HOUSING.x, HOUSING.y, MOTOR_Z + MOTOR_H + 6],
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 48 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 26))) {
    out.push(S(k.cylinder(x, y, 8, -PLATE_H - FOOT_H, 1.8, P, 32), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 32), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 10, 1.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.6, 0, P, 18)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  const strip = { x: -145, y: PLATE.y + PLATE.d - 16, w: 290, d: 8, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 6, strip.x + strip.w - 6, 5, 6, strip.y + 0.9, 0.7, [2.2, 4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 3, strip.y + 4, 0.7]), at([strip.x + strip.w - 3, strip.y + 4, 0.7])], { size: 0.5 }));
  return out.join("");
}

function housing() {
  const out = [];
  out.push(S(k.slabOf(HOUSING, MOTOR_Z - 4, 6, P, 6, 0.8), { tone: "mid" }));
  out.push(S(k.slabOf(k.insetPlan(HOUSING, 4), MOTOR_Z + 2, MOTOR_H - 6, P, 6, 0.7), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(HOUSING, 6), MOTOR_Z + MOTOR_H, P), { tone: "faint" }));
  out.push(S(k.slabOf({ x: HOUSING.x + 8, y: HOUSING.y + 6, w: HOUSING.w - 16, d: HOUSING.d - 12, r: 6 }, HAMMER_Z, HAMMER_H, P, 6, 0.7), { tone: "mid" }));
  out.push(S(k.slabOf({ x: HOUSING.x + 12, y: HOUSING.y + 10, w: HOUSING.w - 24, d: HOUSING.d - 20, r: 4 }, ANVIL_Z, ANVIL_H, P, 5, 0.6), { tone: "mid" }));
  const nose = { x: HOUSING.x + 20, y: HOUSING.y + 16, w: HOUSING.w - 40, d: HOUSING.d - 32, r: 3 };
  out.push(S(k.slabOf(nose, NOSE_Z, NOSE_H, P, 4, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(HOUSING.x + HOUSING.w - 8, HOUSING.y + HOUSING.d / 2, 5, NOSE_Z + 2, NOSE_H - 4, P, 28), { tone: "hi" }));
  out.push(L(k.sideArc(HOUSING.x + HOUSING.w - 8, HOUSING.y + HOUSING.d / 2, 5, NOSE_Z + 4, P, 16), { tone: "faint" }));
  const handle = { x: HOUSING.x - 26, y: HOUSING.y + 12, w: 30, d: 56, r: 6 };
  out.push(S(k.slabOf(handle, MOTOR_Z + 2, 42, P, 6, 0.8), { tone: "mid" }));
  out.push(S(k.slabOf(k.insetPlan(handle, 4), MOTOR_Z + 6, 34, P, 5, 0.7), { tone: "mid" }));
  const trigger = { x: HOUSING.x - 8, y: HOUSING.y + 18, w: 10, d: 16, r: 2 };
  out.push(S(k.slabOf(trigger, MOTOR_Z + 10, 8, P, 3, 0.4), { tone: "hi", lit: true }));
  out.push(D([at([HOUSING.x + 16, HOUSING.y + 16, MOTOR_Z + MOTOR_H]), at([HOUSING.x + HOUSING.w - 16, HOUSING.y + HOUSING.d - 16, HAMMER_Z + HAMMER_H])], { size: 0.5, tone: "lo" }));
  return out.join("");
}

function internals() {
  const out = [];
  out.push(S(k.cylinder(HOUSING.x + 50, HOUSING.y + 40, 16, MOTOR_Z + 4, 20, P, 48), { tone: "mid", crease: "lo" }));
  out.push(L(k.sideArc(HOUSING.x + 50, HOUSING.y + 40, 16, MOTOR_Z + 10, P, 28), { tone: "faint" }));
  out.push(D([at([HOUSING.x + 50, HOUSING.y + 40, MOTOR_Z + 4]), at([HOUSING.x + 50, HOUSING.y + 40, MOTOR_Z + 24])], { size: 0.45 }));
  out.push(S(k.cylinder(HOUSING.x + 56, HOUSING.y + 40, 14, HAMMER_Z + 2, 12, P, 40), { tone: "mid" }));
  out.push(S(k.cylinder(HOUSING.x + 62, HOUSING.y + 40, 10, HAMMER_Z + 4, 10, P, 36), { tone: "hi" }));
  out.push(L(k.knurl(HOUSING.x + 62, HOUSING.y + 40, 10, HAMMER_Z + 4, HAMMER_Z + 14, 28, P), { tone: "lo" }));
  out.push(S(k.cylinder(HOUSING.x + 70, HOUSING.y + 40, 8, ANVIL_Z + 2, 10, P, 32), { tone: "mid" }));
  out.push(L(k.ring(HOUSING.x + 70, HOUSING.y + 40, 6, ANVIL_Z + 10, P, 28), { tone: "lo" }));
  out.push(S(k.cylinder(HOUSING.x + 78, HOUSING.y + 40, 6, NOSE_Z + 2, 6, P, 28), { tone: "hi", lit: true }));
  out.push(L(k.lineOnTop([HOUSING.x + 78, HOUSING.y + 40], [HOUSING.x + HOUSING.w - 4, HOUSING.y + 40], NOSE_Z + 8, P), { tone: "lit" }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A pneumatic impact wrench. Compressed air drives a rotary vane motor that spins a flywheel/hammer assembly. A cam and hammer mechanism stores energy and delivers short, powerful impacts to the anvil. The hammer strikes the anvil in rapid bursts, converting rotational energy into high torque with minimal reaction on the user.",
  body: [
    plate(),
    housing(),
    internals(),
  ],
});

const live = `
const readout = document.querySelector("[data-readout]");
let frame = 0, last = 0, clock = 0, touring = true, visible = false;
const stage = document.querySelector(".iso-stage");
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) clock += dt;
  const phase = Math.sin(clock * 2.2);
  const impacts = Math.floor(clock * 6) % 4;
  const text = phase > 0.3 
    ? "Impact mode: " + impacts + " strikes/cycle · High torque bursts" 
    : "Idle: Motor running · Hammer disengaged";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", () => { touring = false; });
stage.addEventListener("pointerleave", () => { touring = true; clock = 0; run(); });
`;


const body = k.plateHtml({
  fig: "Fig 1",
  title: "Pneumatic impact wrench",
  hint: "Hover to pause the animation",
  readout: "Idle: Motor running · Hammer disengaged",
  keys: [
    { mark: "lit", label: "Trigger and anvil/output: active during impact" },
    { mark: "raised", label: "Motor, hammer assembly, and impact mechanism" },
  ],
  caption:
    "Compressed air spins a vane motor connected to the hammer assembly. A cam mechanism allows the hammer to accelerate freely, then strike the anvil in rapid bursts. Each impact delivers high torque to the socket with minimal user reaction.",
  body: `<div class="iso-stage" tabindex="0" role="region" aria-label="Pneumatic impact wrench cutaway">${svg}</div>`,
});

writeFileSync(join(HERE, theme === "light" ? "pneumatic-impact-gun-light.html" : "pneumatic-impact-gun.html"), k.pageHtml({ title: "Pneumatic impact wrench", theme, body, script: kitScript() + live }));
console.log("wrote", theme === "light" ? "pneumatic-impact-gun-light.html" : "pneumatic-impact-gun.html");
