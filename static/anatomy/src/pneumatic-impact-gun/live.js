(() => {
  const stage = document.querySelector(".iw-stage");
  const svg = stage?.querySelector("svg.iso-svg, svg.iso");
  if (!stage || !svg) return;

  const plate = stage.closest(".iso-plate, .plate");
  const readoutEl = plate?.querySelector("[data-readout]");
  const statusEl = stage.querySelector("[data-status]");

  const triggerEl = svg.querySelector('[data-part="trigger"]');
  const psiNeedleEl = svg.querySelector('[data-part="psi-needle"]');
  const knobPointerEl = svg.querySelector('[data-part="knob-pointer"]');
  const torqueNeedleEl = svg.querySelector('[data-part="torque-needle"]');
  const rotorLiveEl = svg.querySelector('[data-part="rotor-live"]');
  const clutchLiveEl = svg.querySelector('[data-part="clutch-live"]');
  const impactFlashEl = svg.querySelector('[data-part="impact-flash"]');
  const socketMarkEl = svg.querySelector('[data-part="socket-mark"]');

  // ── Lightweight 3D Isometric Helpers (matching lathe.mjs lighting) ──────────
  const CAM = cameraOf(P);
  const V = [CAM.cosA * CAM.cosE, CAM.sinA * CAM.cosE, CAM.sinE];
  const L_RAW = [-CAM.sinA, CAM.cosA, 1.2];
  const L_LEN = Math.hypot(L_RAW[0], L_RAW[1], L_RAW[2]) || 1;
  const L_VEC = [L_RAW[0] / L_LEN, L_RAW[1] / L_LEN, L_RAW[2] / L_LEN];
  const BANDS = [0, 0.2, 0.42, 0.62];

  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const unit3 = (a) => {
    const m = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / m, a[1] / m, a[2] / m];
  };
  const toneOf = (n) => {
    const u = unit3(n);
    const s = dot3(u, L_VEC);
    let t = 0;
    while (t < BANDS.length && s >= BANDS[t]) t++;
    return t;
  };
  const depth3 = (p) => k.depthOf(p, P);

  function framePt(F, s, u, v) {
    return [
      F.o[0] + F.a[0] * s + F.u[0] * u + F.v[0] * v,
      F.o[1] + F.a[1] * s + F.u[1] * u + F.v[1] * v,
      F.o[2] + F.a[2] * s + F.u[2] * u + F.v[2] * v,
    ];
  }

  function frameRad(F, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [c * F.u[0] + s * F.v[0], c * F.u[1] + s * F.v[1], c * F.u[2] + s * F.v[2]];
  }

  function hull2(pts) {
    if (pts.length < 3) return pts;
    const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [];
    for (const p of s) {
      while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 1e-6) lo.pop();
      lo.push(p);
    }
    const hi = [];
    for (let i = s.length - 1; i >= 0; i--) {
      const p = s[i];
      while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 1e-6) hi.pop();
      hi.push(p);
    }
    return [...lo.slice(0, -1), ...hi.slice(0, -1)];
  }

  function prismSolidSvg(F, poly2, s0, s1, tone = "mid", crease = "faint") {
    const n = poly2.length;
    let area2 = 0;
    for (let i = 0; i < n; i++) {
      const [u0, v0] = poly2[i];
      const [u1, v1] = poly2[(i + 1) % n];
      area2 += u0 * v1 - u1 * v0;
    }
    const sign = area2 >= 0 ? 1 : -1;

    const p0w = poly2.map(([u, v]) => framePt(F, s0, u, v));
    const p1w = poly2.map(([u, v]) => framePt(F, s1, u, v));
    const p0s = p0w.map((p) => k.iso(p, P));
    const p1s = p1w.map((p) => k.iso(p, P));

    const buckets = [[], [], [], [], []];
    const fillFaces = [];
    const visFaces = [];

    const addFace = (ptsS, normal) => {
      if (dot3(normal, V) <= 1e-4) return;
      const d = k.pathOf(ptsS, true);
      buckets[toneOf(normal)].push(d);
      fillFaces.push(d);
      visFaces.push(ptsS);
    };

    addFace(p0s, [-F.a[0], -F.a[1], -F.a[2]]);
    addFace(p1s, F.a);

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const du = poly2[j][0] - poly2[i][0];
      const dv = poly2[j][1] - poly2[i][1];
      const nu = sign * dv;
      const nv = -sign * du;
      const norm = unit3([
        nu * F.u[0] + nv * F.v[0],
        nu * F.u[1] + nv * F.v[1],
        nu * F.u[2] + nv * F.v[2],
      ]);
      addFace([p0s[i], p0s[j], p1s[j], p1s[i]], norm);
    }

    const outlineHull = hull2([...p0s, ...p1s]);
    const outlineD = k.pathOf(outlineHull, true);
    const creaseD = visFaces.map((f) => k.pathOf(f, true)).join("");

    return {
      depth: depth3(framePt(F, (s0 + s1) * 0.5, 0, 0)),
      svg: k.solidSvg(
        {
          fill: fillFaces.join(""),
          shades: buckets.slice(0, 4).map((b) => b.join("")),
          top: buckets[4].join(""),
          outline: outlineD,
          crease: creaseD,
        },
        { tone, crease },
      ),
    };
  }

  function rotorCylinderSvg(F, r, s0, s1, angle, sides = 16, tone = "mid") {
    const poly = [];
    for (let i = 0; i < sides; i++) {
      const a = angle + (i / sides) * Math.PI * 2;
      poly.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return prismSolidSvg(F, poly, s0, s1, tone, "faint");
  }

  function vanePoly(ang, rIn, rOut, halfThick) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const nx = -s, ny = c;
    return [
      [rIn * c - halfThick * nx, rIn * s - halfThick * ny],
      [rOut * c - halfThick * nx, rOut * s - halfThick * ny],
      [rOut * c + halfThick * nx, rOut * s + halfThick * ny],
      [rIn * c + halfThick * nx, rIn * s + halfThick * ny],
    ];
  }

  function eccentricTipRadius(ang, ex = -1.0, ey = -1.0, rBore = 14.0) {
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const b = ex * ux + ey * uy;
    const c = ex * ex + ey * ey - rBore * rBore;
    return -b + Math.sqrt(Math.max(0.01, b * b - c));
  }

  function sectorBlockPoly(ang, halfAng, rIn, rOut) {
    const a0 = ang - halfAng;
    const am = ang;
    const a1 = ang + halfAng;
    return [
      [rIn * Math.cos(a0), rIn * Math.sin(a0)],
      [rOut * Math.cos(a0), rOut * Math.sin(a0)],
      [rOut * Math.cos(am), rOut * Math.sin(am)],
      [rOut * Math.cos(a1), rOut * Math.sin(a1)],
      [rIn * Math.cos(a1), rIn * Math.sin(a1)],
    ];
  }

  // Rotor frame (eccentric inside bore by -1.0 in Y and -1.0 in Z)
  const F_ROTOR = {
    o: [0, DATA.barrelY - 1.0, DATA.barrelZ - 1.0],
    a: F_BARREL.a,
    u: F_BARREL.u,
    v: F_BARREL.v,
  };

  // ── Simulation State & Input Binding ────────────────────────────────────────
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const state = createInitialState();
  state.rpm = 5840;
  if (reducedMotion) {
    state.targetTrigger = 1;
    state.trigger = 1;
    state.rpm = 5400;
    state.camAngle = 0.85;
    state.anvilAngle = 0.35;
    state.hammerLift = 0.35;
    state.impactFlash = 0.72;
    state.torqueNm = 485;
  }

  let running = !reducedMotion;
  let visible = true;
  let lastT = performance.now();
  let lastStatusT = 0;
  let userOverrideUntil = 0;
  let tourClock = 0;
  let simOut = {
    psi: Math.round(state.pressurePsi),
    rpm: Math.round(state.rpm),
    bpm: state.bpm,
    torqueNm: Math.round(state.torqueNm),
    peakTorqueNm: Math.round(state.peakTorqueNm),
    phaseLabel: reducedMotion ? "IMPACT BLOW" : "WIND UP",
  };

  function markManual(holdMs = 8000) {
    userOverrideUntil = performance.now() + holdMs;
  }

  function announce(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function emitState() {
    stage.dispatchEvent(
      new CustomEvent("iw:state", {
        detail: {
          psi: Math.round(state.targetPsi),
          trigger: state.targetTrigger,
          loadIdx: state.loadIdx,
          slowMo: state.slowMo,
          rpm: simOut.rpm,
          bpm: simOut.bpm,
          torqueNm: simOut.torqueNm,
          phaseLabel: simOut.phaseLabel,
        },
      }),
    );
  }

  // ── Per-Frame Rendering ─────────────────────────────────────────────────────
  function render() {
    // 1. Trigger axial slide (-X when pulled)
    if (triggerEl) {
      triggerEl.setAttribute("transform", k.translateAlong(P, [-state.trigger * 2.8, 0, 0]));
    }

    // 2. Gauges & regulator knob
    const dynamicPsi = Math.max(MIN_PSI, state.pressurePsi - state.trigger * 3.2);
    if (psiNeedleEl) psiNeedleEl.setAttribute("d", psiNeedle(dynamicPsi));
    if (knobPointerEl) knobPointerEl.setAttribute("d", knobPointer(state.pressurePsi));
    if (torqueNeedleEl) torqueNeedleEl.setAttribute("d", torqueNeedle(state.torqueNm));

    // 3. 6-Vane Rotary Air Motor (inside motor.rotorSlot)
    const rotorAngle = state.camAngle * 2.2;
    if (rotorLiveEl) {
      const rotorParts = [];
      const rearShaft = rotorCylinderSvg(F_ROTOR, 3.3, -35.2, -31.8, rotorAngle, 10, "hi");
      const drum = rotorCylinderSvg(F_ROTOR, 8.2, -32.0, -5.0, rotorAngle, 16, "mid");
      const frontShaft = rotorCylinderSvg(F_ROTOR, 3.6, -5.2, -1.6, rotorAngle, 10, "hi");

      const backVanes = [];
      const frontVanes = [];
      for (let i = 0; i < 6; i++) {
        const ang = rotorAngle + (i / 6) * Math.PI * 2;
        const tipR = eccentricTipRadius(ang, -1.0, -1.0, 14.0);
        const vp = vanePoly(ang, 4.8, tipR, 0.72);
        const vs = prismSolidSvg(F_ROTOR, vp, -31.5, -5.5, "hi", "lo");
        const rad = frameRad(F_ROTOR, ang);
        const ptMid = framePt(F_ROTOR, -18.5, rad[1] * 9.5, rad[2] * 9.5);
        vs.depth = depth3(ptMid);
        if (dot3(rad, V) < 0) backVanes.push(vs);
        else frontVanes.push(vs);
      }
      backVanes.sort((a, b) => a.depth - b.depth);
      frontVanes.sort((a, b) => a.depth - b.depth);

      for (const p of backVanes) rotorParts.push(p.svg);
      rotorParts.push(rearShaft.svg);
      rotorParts.push(drum.svg);
      for (const p of frontVanes) rotorParts.push(p.svg);
      rotorParts.push(frontShaft.svg);
      rotorLiveEl.innerHTML = rotorParts.join("");
    }

    // 4. Twin-Hammer Clutch + Two-Lug Anvil (inside clutch.hammerSlot)
    if (clutchLiveEl) {
      const clutchParts = [];
      const camHub = rotorCylinderSvg(F_BARREL, 5.4, 5.0, 15.0, state.camAngle, 12, "mid");
      const anvilShaft = rotorCylinderSvg(F_BARREL, 4.1, 13.0, 35.0, state.anvilAngle, 12, "hi");

      const pieces = [];
      for (let i = 0; i < 2; i++) {
        const lugA = state.anvilAngle + i * Math.PI;
        const lugPoly = sectorBlockPoly(lugA, 0.36, 4.0, 9.1);
        const lugSolid = prismSolidSvg(F_BARREL, lugPoly, 17.5, 29.5, "hi", "lo");
        const lRad = frameRad(F_BARREL, lugA);
        lugSolid.depth = depth3([23.5, DATA.barrelY + lRad[1] * 6.8, DATA.barrelZ + lRad[2] * 6.8]);
        pieces.push(lugSolid);

        const hamA = state.camAngle + i * Math.PI;
        const lift = state.hammerLift * 3.1;
        const hamPoly = sectorBlockPoly(hamA, 0.44, 6.0 + lift, 11.4 + lift);
        const hamSolid = prismSolidSvg(F_BARREL, hamPoly, 8.5, 31.5, "lit", "lo");
        const hRad = frameRad(F_BARREL, hamA);
        hamSolid.depth = depth3([20.0, DATA.barrelY + hRad[1] * (9.0 + lift), DATA.barrelZ + hRad[2] * (9.0 + lift)]);
        pieces.push(hamSolid);
      }

      const allClutch = [
        { depth: depth3([10, DATA.barrelY, DATA.barrelZ]) - 2, svg: camHub.svg },
        { depth: depth3([24, DATA.barrelY, DATA.barrelZ]), svg: anvilShaft.svg },
        ...pieces,
      ].sort((a, b) => a.depth - b.depth);

      for (const item of allClutch) clutchParts.push(item.svg);
      clutchLiveEl.innerHTML = clutchParts.join("");
    }

    // 5. Impact flash closed dart around contact lugs (x = 20..26)
    if (impactFlashEl) {
      if (state.impactFlash > 0.04) {
        const flashD = [];
        for (let i = 0; i < 2; i++) {
          const a = state.anvilAngle + i * Math.PI;
          const rA = 9.4;
          const rB = 13.8;
          const p1 = k.iso(framePt(F_BARREL, 21, rA * Math.cos(a - 0.14), rA * Math.sin(a - 0.14)), P);
          const p2 = k.iso(framePt(F_BARREL, 23, rB * Math.cos(a), rB * Math.sin(a)), P);
          const p3 = k.iso(framePt(F_BARREL, 21, rA * Math.cos(a + 0.14), rA * Math.sin(a + 0.14)), P);
          flashD.push(k.pathOf([p1, p2, p3], true));
        }
        impactFlashEl.setAttribute("d", flashD.join(""));
        impactFlashEl.style.opacity = String(Math.min(1, state.impactFlash * 0.95).toFixed(2));
      } else {
        impactFlashEl.setAttribute("d", "");
        impactFlashEl.style.opacity = "0";
      }
    }

    // 6. Rotating index spline bands on deep socket (x = 74.5..84.5)
    if (socketMarkEl) {
      const marks = [];
      for (let i = 0; i < 3; i++) {
        const a = state.anvilAngle + (i / 3) * Math.PI * 2;
        const rad = frameRad(F_BARREL, a);
        if (dot3(rad, V) <= 0.08) continue;
        const da = 0.09;
        const p0 = k.iso(framePt(F_BARREL, 74.5, 11.32 * Math.cos(a - da), 11.32 * Math.sin(a - da)), P);
        const p1 = k.iso(framePt(F_BARREL, 84.5, 11.32 * Math.cos(a - da), 11.32 * Math.sin(a - da)), P);
        const p2 = k.iso(framePt(F_BARREL, 84.5, 11.32 * Math.cos(a + da), 11.32 * Math.sin(a + da)), P);
        const p3 = k.iso(framePt(F_BARREL, 74.5, 11.32 * Math.cos(a + da), 11.32 * Math.sin(a + da)), P);
        marks.push(`<path class="iso-faint" d="${k.pathOf([p0, p1, p2, p3], true)}" style="fill:var(--anatomy-hi);fill-opacity:0.4;stroke:none"/>`);
      }
      socketMarkEl.innerHTML = marks.join("");
    }

    // 7. Readout strip
    if (readoutEl) {
      const psiDisp = Math.round(state.pressurePsi);
      const rpmDisp = Math.round(state.rpm);
      const nmDisp = Math.round(state.torqueNm);
      const modeShort = (LOAD_MODES[state.loadIdx]?.label ?? "").split(" ")[0];
      const slowTag = state.slowMo ? " · SLOW" : "";
      readoutEl.textContent = `${psiDisp} PSI · ${rpmDisp} RPM · ${nmDisp} N·m · ${simOut.phaseLabel}${slowTag}${modeShort ? " · " + modeShort : ""}`;
    }
  }

  // ── Interaction Handlers ────────────────────────────────────────────────────
  function setPsi(nextPsi, announceChange = true) {
    state.targetPsi = Math.max(MIN_PSI, Math.min(MAX_PSI, Math.round(nextPsi)));
    if (reducedMotion) state.pressurePsi = state.targetPsi;
    if (announceChange) announce(`Air pressure ${state.targetPsi} PSI`);
    emitState();
    if (reducedMotion) render();
  }

  function setLoadIdx(idx) {
    state.loadIdx = Math.max(0, Math.min(LOAD_MODES.length - 1, idx));
    announce(`Bolt load set to ${LOAD_MODES[state.loadIdx].label}`);
    emitState();
    if (reducedMotion) {
      simOut = stepModel(state, 0.016);
      render();
    }
  }

  function toggleTrigger(force) {
    state.targetTrigger = force !== undefined ? (force ? 1 : 0) : state.targetTrigger > 0.5 ? 0 : 1;
    if (reducedMotion) state.trigger = state.targetTrigger;
    announce(state.targetTrigger > 0.5 ? "Trigger pulled" : "Trigger released");
    emitState();
    if (reducedMotion) render();
  }

  function toggleSlowMo(force) {
    state.slowMo = force !== undefined ? Boolean(force) : !state.slowMo;
    announce(state.slowMo ? "Slow motion speed" : "Real-time speed");
    emitState();
    if (reducedMotion) render();
  }

  function resetBench() {
    Object.assign(state, createInitialState());
    tourClock = 0;
    userOverrideUntil = 0;
    simOut = stepModel(state, 0.016);
    announce("Reset bench to 90 PSI");
    emitState();
    render();
  }

  // Pointer scrubbing for PSI + click to toggle trigger
  let dragStart = null;
  let moved = false;

  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragStart = { x: e.clientX, psi: state.targetPsi };
    moved = false;
    stage.setPointerCapture?.(e.pointerId);
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    if (Math.abs(dx) > 4) moved = true;
    if (moved) {
      markManual();
      const rect = stage.getBoundingClientRect();
      const deltaPsi = (dx / Math.max(200, rect.width * 0.45)) * (MAX_PSI - MIN_PSI);
      setPsi(dragStart.psi + deltaPsi, false);
    }
  });

  stage.addEventListener("pointerup", (e) => {
    if (!dragStart) return;
    if (!moved) {
      markManual();
      toggleTrigger();
    } else {
      announce(`Air pressure ${Math.round(state.targetPsi)} PSI`);
    }
    dragStart = null;
    stage.releasePointerCapture?.(e.pointerId);
  });

  stage.addEventListener("keydown", (e) => {
    const kKey = e.key;
    if (kKey === " ") {
      e.preventDefault();
      markManual();
      toggleTrigger();
    } else if (kKey === "ArrowLeft") {
      e.preventDefault();
      markManual();
      setPsi(state.targetPsi - 5);
    } else if (kKey === "ArrowRight") {
      e.preventDefault();
      markManual();
      setPsi(state.targetPsi + 5);
    } else if (kKey === "ArrowUp") {
      e.preventDefault();
      markManual();
      setLoadIdx((state.loadIdx + 1) % LOAD_MODES.length);
    } else if (kKey === "ArrowDown") {
      e.preventDefault();
      markManual();
      setLoadIdx((state.loadIdx + LOAD_MODES.length - 1) % LOAD_MODES.length);
    } else if (kKey === "1" || kKey === "2" || kKey === "3") {
      e.preventDefault();
      markManual();
      setLoadIdx(Number(kKey) - 1);
    } else if (kKey === "s" || kKey === "S") {
      e.preventDefault();
      markManual();
      toggleSlowMo();
    } else if (kKey === "Escape" || kKey === "Home") {
      e.preventDefault();
      resetBench();
    }
  });

  // External UX control bar hook
  stage.addEventListener("iw:command", (e) => {
    const { type, value } = e.detail ?? {};
    markManual();
    if (type === "trigger") toggleTrigger(value);
    else if (type === "psi") setPsi(Number(value));
    else if (type === "load") setLoadIdx(Number(value));
    else if (type === "slow") toggleSlowMo(value);
    else if (type === "reset") resetBench();
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && running) lastT = performance.now();
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(stage);
  }

  function tick(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
    lastT = now;

    if (running && visible) {
      if (now > userOverrideUntil) {
        tourClock += dt;
        const cycle = tourClock % 9.0;
        state.targetTrigger = cycle < 6.5 ? 1 : 0;
        if (cycle < 0.04) {
          state.loadIdx = (2 - (Math.floor(tourClock / 9.0) % LOAD_MODES.length) + LOAD_MODES.length) % LOAD_MODES.length;
        }
      }
      simOut = stepModel(state, dt);
      render();

      if (now - lastStatusT > 1800 && statusEl) {
        lastStatusT = now;
        emitState();
      }
    }
    if (running) requestAnimationFrame(tick);
  }

  render();
  emitState();
  if (running) requestAnimationFrame(tick);
})();
