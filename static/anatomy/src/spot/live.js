const stage = document.querySelector(".sp-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const statusEl = stage.querySelector("[data-status]");
const needleEl = svg.querySelector('[data-part="needle"]');
const bodyEls = svg.querySelectorAll('[data-part="body"]');
const targetEls = svg.querySelectorAll('[data-part="target"]');
const barEls = [0, 1, 2, 3].map((i) => svg.querySelector(`[data-bar="${i}"]`));
const legEls = {};
for (const leg of LEGS) legEls[leg.id] = svg.querySelector(`[data-leg="${leg.id}"]`);
const gripperEl = svg.querySelector('[data-gripper="1"]');

const still = matchMedia("(prefers-reduced-motion: reduce)");

let visible = false;
let frame = 0;
let last = 0;
let clock = 0;
let idleTimer = 0;
let announceTimer = 0;
let touring = !still.matches;

let targetSpeed = 0.9;
let targetHeight = 610;
let curSpeed = 0.9;
let curHeight = 610;
// Opening phase (v3): at 0.275 the FL+RR pair is mid-stance with its feet
// centred on their force pads and the FR+RL pair is at peak swing lift,
// also centred — the figure opens on this clean diagonal exchange.
let phase = 0.275;
let targetOff = 0;
let curTargetOff = 0;
let lastPair = "";

function tourAt(t) {
  return {
    speed: clamp(0.9 + 0.6 * Math.sin(t * 0.45), 0.25, 1.55),
    // The tour idles at the 610 mm default height (BD); the 520-700 range
    // is visited only when the user drags vertically or uses the arrow keys.
    height: 610,
    off: 8 * Math.sin(t * 0.3),
  };
}

function describe(st) {
  const text =
    st.speed <= 0.01
      ? `standing · body ${st.bodyHeightMm} millimetres · ${Math.round(st.totalForce)} newtons over four feet · gripper aperture ${st.gripperMm} millimetres`
      : `trotting at ${st.speed.toFixed(2)} metres per second · body ${st.bodyHeightMm} millimetres · stance pair ${st.stancePair} · gripper aperture ${st.gripperMm} millimetres`;
  stage.setAttribute("aria-valuenow", String(Math.round(st.speed * 100)));
  stage.setAttribute("aria-valuetext", text);
}

function draw(st) {
  const dz = st.legs[0].hip[2] - DATA.hipZ0;
  const dx = st.pitchDeg * 0.35;
  const bodyTr = translateAlong(P, [dx, 0, dz]);
  bodyEls.forEach((el) => el.setAttribute("transform", bodyTr));
  for (const leg of st.legs) {
    if (legEls[leg.id]) legEls[leg.id].innerHTML = legSvg(leg);
  }
  if (gripperEl) gripperEl.innerHTML = gripperSvg(st.gripperMm);
  const targetTr = translateAlong(P, [0, curTargetOff, 0]);
  targetEls.forEach((el) => el.setAttribute("transform", targetTr));
  if (needleEl) needleEl.setAttribute("d", gaugeNeedle(st.phase));
  for (let i = 0; i < 4; i++) {
    if (barEls[i]) barEls[i].setAttribute("d", barPath(i, st.legs[i].force));
  }
  const f = (id) => Math.round(st.legs.find((l) => l.id === id).force);
  const text =
    st.speed <= 0.01
      ? `standing · FL${f("FL")} FR${f("FR")} RL${f("RL")} RR${f("RR")} N · ${st.bodyHeightMm}mm · grip ${st.gripperMm}`
      : `${parseFloat(st.speed.toFixed(2))} m/s · FL${f("FL")} FR${f("FR")} RL${f("RL")} RR${f("RR")} N · ${st.bodyHeightMm}mm · grip ${st.gripperMm}`;
  if (readout.textContent !== text) readout.textContent = text;
  if (statusEl && st.stancePair !== lastPair) {
    lastPair = st.stancePair;
    statusEl.textContent = st.speed <= 0.01 ? "standing on all four feet" : `stance: ${st.stancePair.replaceAll("+", " and ")}`;
  }
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring && !calm) {
    clock += dt;
    const t = tourAt(clock);
    targetSpeed = t.speed;
    targetHeight = t.height;
    targetOff = t.off;
  }
  const rate = calm ? 1 : 1 - Math.exp(-dt / 0.3);
  curSpeed += (targetSpeed - curSpeed) * rate;
  curHeight += (targetHeight - curHeight) * rate;
  curTargetOff += (targetOff - curTargetOff) * rate;
  if (Math.abs(targetSpeed - curSpeed) < 0.002) curSpeed = targetSpeed;
  if (Math.abs(targetHeight - curHeight) < 0.05) curHeight = targetHeight;
  if (!calm) phase += dt * freqHz(curSpeed);
  const st = computeState({ speed: curSpeed, bodyHeight: curHeight, phase });
  draw(st);
  const settled = !touring && curSpeed === targetSpeed && curHeight === targetHeight && curSpeed <= 0.01;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}

const run = () => {
  if (!frame && visible) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
};

const hold = () => {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    touring = !still.matches;
    clock = 0;
    run();
  }, 3600);
};

const steer = (speed, height) => {
  hold();
  targetSpeed = clamp(speed, 0, SPEED_MAX);
  targetHeight = clamp(height, 520, 700);
  run();
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => describe(computeState({ speed: targetSpeed, bodyHeight: targetHeight, phase })), 450);
};

// Pointer drag: horizontal = commanded speed, vertical = body height
let drag = null;
stage.addEventListener("pointerdown", (e) => {
  const box = svg.getBoundingClientRect();
  drag = { x: e.clientX, y: e.clientY, speed: targetSpeed, height: targetHeight, w: box.width, h: box.height };
  stage.setPointerCapture(e.pointerId);
  hold();
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  steer(drag.speed + ((e.clientX - drag.x) / drag.w) * 2.4, drag.height - ((e.clientY - drag.y) / drag.h) * 280);
});
const endDrag = () => {
  drag = null;
};
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);

stage.addEventListener("keydown", (e) => {
  const stepS = e.shiftKey ? 0.4 : 0.2;
  const stepH = e.shiftKey ? 40 : 20;
  let handled = true;
  if (e.key === "ArrowRight") steer(targetSpeed + stepS, targetHeight);
  else if (e.key === "ArrowLeft") steer(targetSpeed - stepS, targetHeight);
  else if (e.key === "ArrowUp") steer(targetSpeed, targetHeight + stepH);
  else if (e.key === "ArrowDown") steer(targetSpeed, targetHeight - stepH);
  else if (e.key === "Home") steer(0.9, 610);
  else if (e.key === "Escape") steer(0, targetHeight);
  else handled = false;
  if (handled) e.preventDefault();
});

new IntersectionObserver(
  (entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
  },
  { rootMargin: "120px 0px" },
).observe(stage);

draw(computeState({ speed: 0.9, bodyHeight: 610, phase: 0.275 }));
