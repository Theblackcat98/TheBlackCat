const stage = document.querySelector(".rc-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const statusEl = stage.querySelector("[data-status]");
const needleEl = svg.querySelector('[data-part="gauge-needle"]');
const sightEl = svg.querySelector('[data-part="sight-beam"]');
const coilBackEl = svg.querySelector('[data-part="spine-coil-back"]');
const coilFrontEl = svg.querySelector('[data-part="spine-coil-front"]');
const barEls = [0, 1, 2, 3].map((i) => svg.querySelector(`[data-bar="${i}"]`));

const targetEls = svg.querySelectorAll('[data-part="target"]');
const torsoEls = svg.querySelectorAll('[data-part="torso"]');
const headEls = svg.querySelectorAll('[data-part="head"]');
const earLEls = svg.querySelectorAll('[data-part="ear-l"]');
const earREls = svg.querySelectorAll('[data-part="ear-r"]');
const pupilEls = svg.querySelectorAll('[data-part="pupil"]');
const tibiaEls = svg.querySelectorAll('[data-leg-stage="tibia"]');
const kneeEls = svg.querySelectorAll('[data-leg-stage="knee"]');
const femurEls = svg.querySelectorAll('[data-leg-stage="femur"]');
const tailEls = Array.from(svg.querySelectorAll("[data-tail]")).map((el) => ({
  el,
  idx: Number(el.getAttribute("data-tail")),
}));

const still = matchMedia("(prefers-reduced-motion: reduce)");

let visible = false;
let frame = 0;
let last = 0;
let clock = 0;
let idleTimer = 0;
let announceTimer = 0;
let touring = !still.matches;

let targetYaw = 0;
let targetPitch = 0;
let targetCrouch = 0;

let curYaw = 0;
let curPitch = 0;
const crouchSpring = { x: 0, v: 0 };
let tailPhase = 0;

function stepSpring(state, target, dt, stiffness, damping, calm) {
  if (calm) {
    state.x = target;
    state.v = 0;
    return true;
  }
  const steps = 4;
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    const a = stiffness * (target - state.x) - damping * state.v;
    state.v += a * h;
    state.x += state.v * h;
  }
  if (Math.abs(target - state.x) < 1e-3 && Math.abs(state.v) < 1e-3) {
    state.x = target;
    state.v = 0;
    return true;
  }
  return false;
}

function tourAt(t) {
  const c = t % 16;
  if (c < 4.5) {
    // Smooth lateral optical tracking sweep
    const phase = (c / 4.5) * Math.PI * 2;
    return {
      yaw: Math.sin(phase) * 0.78,
      pitch: Math.cos(phase * 0.5) * 0.22,
      crouch: 0.05,
    };
  } else if (c < 8.0) {
    // Low stalk crouch while tracking right
    const u = Math.sin(((c - 4.5) / 3.5) * Math.PI);
    return {
      yaw: 0.45 * u,
      pitch: -0.35 * u,
      crouch: 0.72 * u,
    };
  } else if (c < 11.5) {
    // Counter-sweep left and elevate gaze
    const u = Math.sin(((c - 8.0) / 3.5) * Math.PI);
    return {
      yaw: -0.68 * u,
      pitch: 0.55 * u,
      crouch: 0.12 * u,
    };
  } else {
    // Pounce readiness cycle
    const u = Math.sin(((c - 11.5) / 4.5) * Math.PI);
    return {
      yaw: Math.sin((c - 11.5) * 1.6) * 0.3,
      pitch: -0.2 * u,
      crouch: 0.55 * Math.pow(u, 2),
    };
  }
}

function describeA11y(st) {
  const ySign = st.yawDeg >= 0 ? "+" : "";
  const text = `${st.modeLabel} · yaw ${ySign}${st.yawDeg.toFixed(1)}° · crouch ${Math.round(st.crouchMm)} mm · knee torque ${st.kneeTorqueNm.toFixed(1)} N·m`;
  stage.setAttribute("aria-valuenow", String(Math.round(st.yawDeg)));
  stage.setAttribute("aria-valuetext", text);
  if (statusEl) statusEl.textContent = text;
}

function scheduleAnnounce(st) {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => describeA11y(st), 450);
}

function draw(st) {
  // 1. Target collimator carriage along front rail
  const targetTr = k.translateAlong(P, [0, st.targetY, st.targetDz * 0.25]);
  targetEls.forEach((el) => el.setAttribute("transform", targetTr));

  // 2. Torso & hip assembly crouch + lean
  const torsoTr = k.translateAlong(P, [st.torsoDx, st.torsoDy, st.torsoDz]);
  torsoEls.forEach((el) => el.setAttribute("transform", torsoTr));

  // 3. Articulated leg stages (paws remain planted at 0 on force pads!)
  const tibiaTr = k.translateAlong(P, [st.torsoDx * 0.22, st.torsoDy * 0.2, st.torsoDz * 0.25]);
  tibiaEls.forEach((el) => el.setAttribute("transform", tibiaTr));

  const kneeTr = k.translateAlong(P, [st.torsoDx * 0.5 + st.crouch * 1.4, st.torsoDy * 0.45, st.torsoDz * 0.52]);
  kneeEls.forEach((el) => el.setAttribute("transform", kneeTr));

  const femurTr = k.translateAlong(P, [st.torsoDx * 0.78 + st.crouch * 0.7, st.torsoDy * 0.75, st.torsoDz * 0.78]);
  femurEls.forEach((el) => el.setAttribute("transform", femurTr));

  // 4. Dorsal spine suspension spring compression
  const springShift = st.crouch * 2.2;
  const sp = k.coil(
    SPINE_SPRING.x0 + 2 + springShift * 0.4,
    SPINE_SPRING.x1 - 2 - springShift * 0.4,
    [SPINE_SPRING.y, SPINE_SPRING.z],
    SPINE_SPRING.r,
    SPINE_SPRING.turns,
    "x",
    P,
  );
  if (coilBackEl) coilBackEl.setAttribute("d", sp.back);
  if (coilFrontEl) coilFrontEl.setAttribute("d", sp.front);

  // 5. Gimbaled head, stereo ocular pupils & differential acoustic pinnae (ears)
  const headTr = k.translateAlong(P, [st.headDx, st.headDy, st.headDz]);
  headEls.forEach((el) => el.setAttribute("transform", headTr));

  const earLTr = k.translateAlong(P, [
    st.headDx - st.yaw * 0.9,
    st.headDy + st.yaw * 0.8,
    st.headDz + Math.max(0, -st.yaw) * 0.8,
  ]);
  earLEls.forEach((el) => el.setAttribute("transform", earLTr));

  const earRTr = k.translateAlong(P, [
    st.headDx + st.yaw * 0.9,
    st.headDy + st.yaw * 0.8,
    st.headDz + Math.max(0, st.yaw) * 0.8,
  ]);
  earREls.forEach((el) => el.setAttribute("transform", earRTr));

  const pupilOx = st.yaw * 1.4;
  const pupilOy = -st.pitch * 1.1;
  pupilEls.forEach((el) => {
    el.setAttribute("transform", `translate(${pupilOx.toFixed(2)} ${pupilOy.toFixed(2)})`);
  });

  // 6. 5-Segment Counterbalance Tail (progressive multi-link 3D bending curve)
  tailEls.forEach(({ el, idx }) => {
    const u = (idx + 1) / 5;
    const bend = Math.pow(u, 1.55);
    const wave = Math.sin(tailPhase - idx * 0.55) * 1.8 * bend;
    const dx = st.torsoDx - Math.abs(st.yaw) * 1.5 * bend;
    const dy = st.torsoDy + st.counterYaw * bend + wave;
    const dz = st.torsoDz + st.counterLift * bend;
    el.setAttribute("transform", k.translateAlong(P, [dx, dy, dz]));
  });

  // 7. Optical sight lock line between stereo cameras and target beacon
  const eyeWorld = [DATA.eyes[0] + st.headDx, DATA.eyes[1] + st.headDy, DATA.eyes[2] + st.headDz];
  const beaconWorld = [DATA.beacon[0], DATA.beacon[1] + st.targetY, DATA.beacon[2] + st.targetDz * 0.25];
  if (sightEl) {
    sightEl.innerHTML = k.wireSvg(k.iso(eyeWorld, P), k.iso(beaconWorld, P), {
      tone: "lit",
      dashed: true,
      ends: "both",
      size: 0.85,
    });
  }

  // 8. Dial torque indicator needle & 4-channel load-cell console bars
  if (needleEl) {
    needleEl.setAttribute("d", gaugeNeedle(st.kneeTorqueNm));
  }
  for (let i = 0; i < 4; i++) {
    if (barEls[i]) barEls[i].setAttribute("d", barPath(i, st.forces[i]));
  }

  // 9. Live corner readout
  const ySign = st.yawDeg >= 0 ? "+" : "";
  const statusTag = touring ? "SCAN" : st.crouch > 0.35 ? "CROUCH" : "LOCK";
  const text = `yaw ${ySign}${st.yawDeg.toFixed(1)}° · crouch ${Math.round(st.crouchMm)} mm · ${st.kneeTorqueNm.toFixed(1)} N·m · ${statusTag}`;
  if (readout.textContent !== text) readout.textContent = text;
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;

  const calm = still.matches;
  if (touring && !calm) {
    const t = tourAt(clock);
    targetYaw = t.yaw;
    targetPitch = t.pitch;
    targetCrouch = t.crouch;
    tailPhase = clock * 1.85;
  } else if (!calm) {
    tailPhase += dt * 1.35;
  }

  const rate = calm ? 1 : 1 - Math.exp(-dt / 0.15);
  curYaw += (targetYaw - curYaw) * rate;
  curPitch += (targetPitch - curPitch) * rate;
  const springSettled = stepSpring(crouchSpring, targetCrouch, dt, 180, 16, calm);

  const st = computeState({
    yaw: curYaw,
    pitch: curPitch,
    crouch: crouchSpring.x,
    crouchVel: crouchSpring.v,
    tailPhase,
    tracking: !touring,
  });

  draw(st);

  const settled =
    !touring &&
    springSettled &&
    Math.abs(targetYaw - curYaw) < 0.003 &&
    Math.abs(targetPitch - curPitch) < 0.003 &&
    calm;

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
    run();
  }, 3600);
};

const steer = (ny, np, nc = targetCrouch) => {
  hold();
  targetYaw = Math.max(-1, Math.min(1, ny));
  targetPitch = Math.max(-1, Math.min(1, np));
  targetCrouch = Math.max(0, Math.min(1, nc));
  run();
  scheduleAnnounce(
    computeState({
      yaw: targetYaw,
      pitch: targetPitch,
      crouch: targetCrouch,
      tracking: true,
    }),
  );
};

const triggerPounce = () => {
  hold();
  targetCrouch = 0.85;
  crouchSpring.v = 3.2;
  setTimeout(() => {
    targetCrouch = 0;
    run();
  }, 260);
  run();
  scheduleAnnounce(
    computeState({
      yaw: targetYaw,
      pitch: targetPitch,
      crouch: 0.85,
      tracking: true,
    }),
  );
};

stage.addEventListener("pointermove", (e) => {
  const box = svg.getBoundingClientRect();
  const nx = ((e.clientX - box.left) / box.width - 0.5) * 2.2;
  const ny = -((e.clientY - box.top) / box.height - 0.5) * 2.2;
  const crouchCmd = Math.max(0, -ny * 0.65);
  steer(nx, ny, crouchCmd);
});

stage.addEventListener("pointerdown", () => {
  triggerPounce();
});

stage.addEventListener("pointerleave", () => {
  steer(0, 0, 0);
});

stage.addEventListener("keydown", (e) => {
  const step = e.shiftKey ? 0.35 : 0.18;
  let handled = true;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    steer(targetYaw - step, targetPitch, targetCrouch);
  } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    steer(targetYaw + step, targetPitch, targetCrouch);
  } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
    steer(targetYaw, targetPitch + step, Math.max(0, targetCrouch - step));
  } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
    steer(targetYaw, targetPitch - step, Math.min(1, targetCrouch + step));
  } else if (e.key === " " || e.key === "Enter") {
    triggerPounce();
  } else if (e.key === "Escape" || e.key === "Home") {
    steer(0, 0, 0);
  } else if (e.key === "1" || e.code === "Digit1") {
    steer(0, 0, 0);
  } else if (e.key === "2" || e.code === "Digit2") {
    steer(-0.8, 0.25, 0.1);
  } else if (e.key === "3" || e.code === "Digit3") {
    steer(0.8, -0.2, 0.45);
  } else if (e.key === "4" || e.code === "Digit4") {
    steer(0.2, -0.45, 0.9);
  } else {
    handled = false;
  }
  if (handled) e.preventDefault();
});

new IntersectionObserver(
  (entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
  },
  { rootMargin: "120px 0px" },
).observe(stage);

draw(computeState({}));
