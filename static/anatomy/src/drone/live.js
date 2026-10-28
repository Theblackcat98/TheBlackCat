const stage = document.querySelector(".dr-stage");
const readout = document.querySelector("[data-readout]");
const needleEl = stage.querySelector('[data-part="needle"]');
const barEls = [0, 1, 2, 3].map((i) => stage.querySelector(`[data-bar="${i}"]`));
const stickLeftShaft = stage.querySelector('[data-stick="left"] [data-part="shaft"]');
const stickLeftKnob = stage.querySelector('[data-stick="left"] [data-part="knob"]');
const stickRightShaft = stage.querySelector('[data-stick="right"] [data-part="shaft"]');
const stickRightKnob = stage.querySelector('[data-stick="right"] [data-part="knob"]');

const still = matchMedia("(prefers-reduced-motion: reduce)");

let visible = false;
let frame = 0;
let last = 0;
let clock = 0;
let idleTimer = 0;
let touring = !still.matches;

// Current and target control stick inputs [-1..1]
const targetSticks = { throttle: 0, pitch: 0, roll: 0, yaw: 0 };
const curSticks = { throttle: 0, pitch: 0, roll: 0, yaw: 0 };

let heading = 0;
const propAngles = [0, 0, 0, 0];

// Tour steps
function tourAt(t) {
  const cycle = t % 18;
  if (cycle < 2.5) {
    // Hover
    return { throttle: 0, pitch: 0, roll: 0, yaw: 0, label: "hover" };
  } else if (cycle < 6.0) {
    // Pitch forward (rear motors speed up)
    const p = Math.sin(((cycle - 2.5) / 3.5) * Math.PI) * 0.75;
    return { throttle: 0, pitch: p, roll: 0, yaw: 0, label: "pitch forward · nose down" };
  } else if (cycle < 9.5) {
    // Roll right (left motors speed up)
    const r = Math.sin(((cycle - 6.0) / 3.5) * Math.PI) * 0.75;
    return { throttle: 0, pitch: 0, roll: r, yaw: 0, label: "roll right" };
  } else if (cycle < 13.0) {
    // Yaw clockwise (CCW motors speed up, reaction torque turns frame CW)
    const y = Math.sin(((cycle - 9.5) / 3.5) * Math.PI) * 0.8;
    return { throttle: 0, pitch: 0, roll: 0, yaw: y, label: "yaw clockwise" };
  } else if (cycle < 16.0) {
    // Climb (all motors speed up)
    const th = Math.sin(((cycle - 13.0) / 3.0) * Math.PI) * 0.6;
    return { throttle: th, pitch: 0, roll: 0, yaw: 0, label: "throttle climb" };
  } else {
    return { throttle: 0, pitch: 0, roll: 0, yaw: 0, label: "settle to hover" };
  }
}

const controller = TURN.mount(stage, DATA.turn, {
  follow,
  onHold: () => {
    touring = false;
    clearTimeout(idleTimer);
  },
  onFrame: () => {},
});

function draw(st, tourLabel) {
  // Update 3D drone attitude and prop spins
  const pitchDeg = curSticks.pitch * DATA.tilt;
  const rollDeg = curSticks.roll * DATA.tilt;

  controller.set({
    heading,
    pitch: pitchDeg,
    roll: rollDeg,
    prop1: propAngles[0],
    prop2: propAngles[1],
    prop3: propAngles[2],
    prop4: propAngles[3],
  });

  // Gauge needle: net force
  needleEl.setAttribute("d", gaugeNeedle(st.net));

  // Sticks on transmitter
  stickLeftShaft.setAttribute("d", stickPath("left", curSticks.yaw, curSticks.throttle));
  const lTip = stickTip("left", curSticks.yaw, curSticks.throttle);
  stickLeftKnob.setAttribute(
    "transform",
    k.translateAlong(P, G.sub3(lTip, [STICKS.left[0], STICKS.left[1], STICK_Z + STICK_L])),
  );

  stickRightShaft.setAttribute("d", stickPath("right", curSticks.roll, curSticks.pitch));
  const rTip = stickTip("right", curSticks.roll, curSticks.pitch);
  stickRightKnob.setAttribute(
    "transform",
    k.translateAlong(P, G.sub3(rTip, [STICKS.right[0], STICKS.right[1], STICK_Z + STICK_L])),
  );

  // Screen bars for 4 motors
  for (let i = 0; i < 4; i++) {
    barEls[i].setAttribute("d", barPath(i, st.shares[i]));
  }

  // Live readout
  let modeDesc = tourLabel || "hover";
  if (!touring) {
    if (Math.abs(curSticks.pitch) > 0.15) modeDesc = curSticks.pitch > 0 ? "pitch forward" : "pitch back";
    else if (Math.abs(curSticks.roll) > 0.15) modeDesc = curSticks.roll > 0 ? "roll right" : "roll left";
    else if (Math.abs(curSticks.yaw) > 0.15) modeDesc = curSticks.yaw > 0 ? "yaw clockwise" : "yaw counter-cw";
    else if (Math.abs(curSticks.throttle) > 0.15) modeDesc = curSticks.throttle > 0 ? "climb" : "descend";
    else modeDesc = "hover";
  }

  const avgRpm = Math.round(st.rpm.reduce((a, b) => a + b, 0) / 4);
  const sign = st.net >= 0 ? "+" : "−";
  const absNet = Math.abs(st.net).toFixed(1);
  const text = `${modeDesc} · ${avgRpm.toLocaleString("en-US")} rpm · net ${sign}${absNet} N`;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;

  let tourLabel = "";
  if (touring) {
    clock += dt;
    const tour = tourAt(clock);
    targetSticks.throttle = tour.throttle;
    targetSticks.pitch = tour.pitch;
    targetSticks.roll = tour.roll;
    targetSticks.yaw = tour.yaw;
    tourLabel = tour.label;
  }

  const calm = still.matches;
  const easeRate = calm ? 1 : 1 - Math.exp(-dt / 0.16);
  curSticks.throttle += (targetSticks.throttle - curSticks.throttle) * easeRate;
  curSticks.pitch += (targetSticks.pitch - curSticks.pitch) * easeRate;
  curSticks.roll += (targetSticks.roll - curSticks.roll) * easeRate;
  curSticks.yaw += (targetSticks.yaw - curSticks.yaw) * easeRate;

  const tilt = { pitch: curSticks.pitch * DATA.tilt, roll: curSticks.roll * DATA.tilt };
  const st = state(curSticks, tilt);

  // Yaw rate integration
  heading = ((heading + curSticks.yaw * YAW_RATE * dt) % 360 + 360) % 360;

  // Propeller spin integration
  for (let i = 0; i < 4; i++) {
    const revPerSec = st.rpm[i] / 60;
    const dDeg = MOTORS[i].spin * revPerSec * 360 * dt;
    propAngles[i] = ((propAngles[i] + dDeg) % 180 + 180) % 180;
  }

  draw(st, tourLabel);

  const settled =
    !touring &&
    Math.abs(targetSticks.throttle - curSticks.throttle) < 0.005 &&
    Math.abs(targetSticks.pitch - curSticks.pitch) < 0.005 &&
    Math.abs(targetSticks.roll - curSticks.roll) < 0.005 &&
    Math.abs(targetSticks.yaw - curSticks.yaw) < 0.005 &&
    Math.abs(curSticks.yaw) < 0.005;

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

// Pointer interaction on stage: dragging tilts drone (pitch & roll)
let dragging = false;
let dragOrigin = null;

stage.addEventListener("pointerdown", (e) => {
  hold();
  dragging = true;
  dragOrigin = [e.clientX, e.clientY];
  stage.setPointerCapture(e.pointerId);
  stage.setAttribute("data-drag", "");
});

stage.addEventListener("pointermove", (e) => {
  if (!dragging || !dragOrigin) return;
  const dx = (e.clientX - dragOrigin[0]) / 80;
  const dy = (e.clientY - dragOrigin[1]) / 80;
  targetSticks.roll = Math.max(-1, Math.min(1, dx));
  targetSticks.pitch = Math.max(-1, Math.min(1, -dy));
  run();
});

const endDrag = (e) => {
  if (!dragging) return;
  dragging = false;
  dragOrigin = null;
  stage.removeAttribute("data-drag");
  targetSticks.pitch = 0;
  targetSticks.roll = 0;
  hold();
  run();
};

stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);

// Keyboard interaction
stage.addEventListener("keydown", (e) => {
  let handled = true;
  hold();
  switch (e.key) {
    case "ArrowUp":
      targetSticks.pitch = Math.min(1, targetSticks.pitch + 0.35);
      break;
    case "ArrowDown":
      targetSticks.pitch = Math.max(-1, targetSticks.pitch - 0.35);
      break;
    case "ArrowLeft":
      targetSticks.roll = Math.max(-1, targetSticks.roll - 0.35);
      break;
    case "ArrowRight":
      targetSticks.roll = Math.min(1, targetSticks.roll + 0.35);
      break;
    case "w":
    case "W":
      targetSticks.throttle = Math.min(1, targetSticks.throttle + 0.25);
      break;
    case "s":
    case "S":
      targetSticks.throttle = Math.max(-1, targetSticks.throttle - 0.25);
      break;
    case "a":
    case "A":
      targetSticks.yaw = Math.max(-1, targetSticks.yaw - 0.35);
      break;
    case "d":
    case "D":
      targetSticks.yaw = Math.min(1, targetSticks.yaw + 0.35);
      break;
    case " ":
    case "Enter":
      targetSticks.throttle = 0;
      targetSticks.pitch = 0;
      targetSticks.roll = 0;
      targetSticks.yaw = 0;
      break;
    default:
      handled = false;
  }
  if (handled) {
    e.preventDefault();
    run();
  }
});

new IntersectionObserver(
  (entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
  },
  { rootMargin: "120px 0px" },
).observe(stage);

// Initial draw
const initTilt = { pitch: 0, roll: 0 };
draw(state(curSticks, initTilt), "hover");
