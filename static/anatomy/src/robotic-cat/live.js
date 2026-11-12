// Interactive animation loop, 4-phase predatory tour, spring dynamics, and DOM updates
// for FELIS-09 v2. Inlined into the built SVG figure by build.mjs.

(() => {
  const stage = document.querySelector("[data-live]");
  if (!stage) return;
  const svg = stage.querySelector("svg");
  const plate = stage.closest(".iso-plate");
  const readoutEl = plate ? plate.querySelector("[data-readout]") : null;
  if (!svg) return;

  const P = DATA.P;
  const legsEl = {
    FL: svg.querySelector('[data-leg="FL"]'),
    FR: svg.querySelector('[data-leg="FR"]'),
    RL: svg.querySelector('[data-leg="RL"]'),
    RR: svg.querySelector('[data-leg="RR"]'),
  };
  const spineEl = svg.querySelector('[data-part="spine"]');
  const thoraxEl = svg.querySelector('[data-part="thorax"]');
  const pelvisEl = svg.querySelector('[data-part="pelvis"]');
  const batLEl = svg.querySelector('[data-part="battery-L"]');
  const batREl = svg.querySelector('[data-part="battery-R"]');
  const headEl = svg.querySelector('[data-part="head"]');
  const tailEl = svg.querySelector('[data-part="tail"]');
  const targetEl = svg.querySelector('[data-part="target"]');
  const sightEl = svg.querySelector('[data-part="sight-beam"]');
  const needleEl = svg.querySelector('[data-part="gauge-needle"]');
  const barEls = [0, 1, 2, 3].map((i) => svg.querySelector(`[data-bar="${i}"]`));
  const BAR_YS = [-6.4, -2.6, 1.2, 5.0];

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spring = (value) => ({ x: value, v: 0, target: value });
  const stepSpring = (s, dt, k = 150, d = 17) => {
    const a = -k * (s.x - s.target) - d * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
  };

  const yawS = spring(0);
  const pitchS = spring(0);
  const crouchS = spring(0);

  let mode = reduced ? "manual" : "tour";
  let tourTime = 0;
  let lastT = performance.now();
  let visible = true;
  let pounceTimer = null;
  let lastDigest = "";

  const PRESETS = {
    "1": { yaw: 0, pitch: 0, crouch: 0.12 },
    "2": { yaw: -0.82, pitch: 0.25, crouch: 0.22 },
    "3": { yaw: 0.78, pitch: -0.30, crouch: 0.58 },
    "4": { yaw: 0.18, pitch: -0.48, crouch: 0.92 },
  };

  function tourAt(t) {
    const u = t % 16.0;
    if (u < 4.5) {
      // Phase 1: Optical stalk scan
      const ph = u / 4.5;
      return {
        yaw: 0.82 * Math.sin(ph * Math.PI * 2),
        pitch: 0.14 * Math.sin(ph * Math.PI * 3),
        crouch: 0.14,
        tracking: true,
      };
    }
    if (u < 8.5) {
      // Phase 2: Low ambush crouch & ear flatten
      const s = (u - 4.5) / 4.0;
      const e = s * s * (3 - 2 * s);
      return {
        yaw: 0.58 * (1 - 0.55 * e),
        pitch: -0.38 * e,
        crouch: 0.14 + 0.78 * e,
        tracking: true,
      };
    }
    if (u < 11.5) {
      // Phase 3: Explosive pounce impulse & lunge extension
      const s = (u - 8.5) / 3.0;
      const punch = Math.min(1, s * 2.2);
      return {
        yaw: 0.26 * (1 - punch),
        pitch: -0.38 + 0.82 * Math.sin(punch * Math.PI * 0.8),
        crouch: Math.max(0.08, 0.92 * (1 - Math.pow(punch, 0.65))),
        tracking: true,
      };
    }
    // Phase 4: Tail-whip counterbalance sweep & reset
    const s = (u - 11.5) / 4.5;
    return {
      yaw: -0.72 * Math.sin(s * Math.PI),
      pitch: 0.45 * Math.sin(s * Math.PI),
      crouch: 0.10 + 0.04 * (1 - s),
      tracking: true,
    };
  }

  function applyState(st) {
    const digest = `${st.yaw.toFixed(3)}|${st.pitch.toFixed(3)}|${st.crouch.toFixed(3)}|${st.crouchMm.toFixed(1)}|${st.tailNodes[7][1].toFixed(2)}`;
    if (digest === lastDigest) return;
    lastDigest = digest;

    for (const leg of st.legs) {
      const el = legsEl[leg.id];
      if (el) el.innerHTML = legSvg(leg, P);
    }
    if (spineEl) spineEl.innerHTML = spineSvg(st, P);
    if (thoraxEl) thoraxEl.setAttribute("transform", translateAlong(P, [st.torsoDx, st.torsoDy * 0.45, st.thoraxDz]));
    if (pelvisEl) pelvisEl.setAttribute("transform", translateAlong(P, [st.torsoDx, st.torsoDy * 0.45, st.pelvisDz]));
    if (batLEl) batLEl.setAttribute("transform", translateAlong(P, [st.torsoDx, st.torsoDy * 0.45, st.torsoDz]));
    if (batREl) batREl.setAttribute("transform", translateAlong(P, [st.torsoDx, st.torsoDy * 0.45, st.torsoDz]));
    if (headEl) headEl.innerHTML = headSvg(st, P);
    if (tailEl) tailEl.innerHTML = tailSvg(st.tailNodes, P);
    if (targetEl) targetEl.innerHTML = targetSvg(st.targetY, st.targetDz, st.lureWhip, P);
    if (sightEl) sightEl.innerHTML = sightBeamSvg(st, P);
    if (needleEl) needleEl.innerHTML = gaugeNeedleSvg(st.kneeTorqueNm, P);

    barEls.forEach((el, idx) => {
      if (el) el.setAttribute("d", barPath(-115.2, 26 + BAR_YS[idx], 9.28, 2.5, st.forces[idx] / 52, P));
    });

    if (readoutEl) {
      readoutEl.textContent = `yaw ${st.yawDeg.toFixed(1)}° · crouch ${Math.round(st.crouchMm)}mm · ${st.strainEnergyJ.toFixed(1)}J · ${st.kneeTorqueNm.toFixed(1)}N·m`;
    }
  }

  function triggerPounce() {
    mode = "manual";
    if (pounceTimer) {
      clearTimeout(pounceTimer);
      pounceTimer = null;
    }
    if (crouchS.x < 0.45) {
      crouchS.target = 0.92;
      pitchS.target = -0.45;
      pounceTimer = setTimeout(() => {
        crouchS.target = 0.08;
        crouchS.v = -4.2;
        pitchS.target = 0.45;
        pounceTimer = null;
      }, 220);
    } else {
      crouchS.target = 0.06;
      crouchS.v = -4.6;
      pitchS.target = 0.48;
    }
  }

  function setFromPointer(ev) {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((ev.clientY - rect.top) / rect.height) * 2 - 1;
    mode = "manual";
    yawS.target = Math.max(-1, Math.min(1, nx * 1.15));
    pitchS.target = Math.max(-1, Math.min(1, -ny * 1.15));
    crouchS.target = Math.max(0.05, Math.min(0.95, Math.max(0, ny * 0.85)));
  }

  stage.addEventListener("pointermove", setFromPointer);
  stage.addEventListener("pointerdown", (ev) => {
    setFromPointer(ev);
    triggerPounce();
  });

  stage.addEventListener("keydown", (ev) => {
    const key = ev.key;
    if (PRESETS[key]) {
      ev.preventDefault();
      mode = "manual";
      const p = PRESETS[key];
      yawS.target = p.yaw;
      pitchS.target = p.pitch;
      crouchS.target = p.crouch;
      if (reduced) applyState(computeState({ yaw: p.yaw, pitch: p.pitch, crouch: p.crouch, tailPhase: 0.4, tracking: true }));
      return;
    }
    if (key === " " || key === "Enter") {
      ev.preventDefault();
      triggerPounce();
      return;
    }
    if (key === "ArrowLeft") {
      ev.preventDefault();
      mode = "manual";
      yawS.target = Math.max(-1, yawS.target - 0.25);
      return;
    }
    if (key === "ArrowRight") {
      ev.preventDefault();
      mode = "manual";
      yawS.target = Math.min(1, yawS.target + 0.25);
      return;
    }
    if (key === "ArrowUp") {
      ev.preventDefault();
      mode = "manual";
      crouchS.target = Math.max(0, crouchS.target - 0.18);
      return;
    }
    if (key === "ArrowDown") {
      ev.preventDefault();
      mode = "manual";
      crouchS.target = Math.min(1, crouchS.target + 0.18);
      return;
    }
    if (key === "Escape" || key === "Home") {
      ev.preventDefault();
      if (pounceTimer) {
        clearTimeout(pounceTimer);
        pounceTimer = null;
      }
      yawS.target = 0;
      pitchS.target = 0;
      crouchS.target = 0;
      mode = reduced ? "manual" : "tour";
      tourTime = 0;
      if (reduced) applyState(computeState({}));
    }
  });

  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    }).observe(stage);
  }

  function tick(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
    lastT = now;

    if (visible) {
      if (mode === "tour") {
        tourTime += dt;
        const g = tourAt(tourTime);
        yawS.target = g.yaw;
        pitchS.target = g.pitch;
        crouchS.target = g.crouch;
      }
      stepSpring(yawS, dt, 145, 16);
      stepSpring(pitchS, dt, 155, 17);
      stepSpring(crouchS, dt, 170, 16);

      const st = computeState({
        yaw: yawS.x,
        pitch: pitchS.x,
        crouch: crouchS.x,
        crouchVel: crouchS.v,
        tailPhase: now * 0.0024,
        tracking: mode === "tour" || Math.abs(yawS.x) > 0.1 || crouchS.x > 0.2,
      });
      applyState(st);
    }
    requestAnimationFrame(tick);
  }

  // Initial synchronous render & loop start
  applyState(computeState({}));
  if (!reduced) requestAnimationFrame(tick);
})();
