// Pure physics & mechanism model for a 1/2" twin-hammer pneumatic impact wrench.
// Captures real shop-air pressure (40-110 PSI), rotary vane motor spin-up,
// twin-hammer cam lift/slip under bolt resistance, discrete anvil impact impulses,
// and peak torque bursts measured by the hydraulic bench dynamometer.

export const NOMINAL_PSI = 90;
export const MIN_PSI = 40;
export const MAX_PSI = 110;
export const MAX_FREE_RPM = 8500; // free speed at 90 PSI
export const MAX_TORQUE_NM = 800; // dial gauge full scale (N·m)

export const LOAD_MODES = [
  { id: "free", label: "Free Spin", resistance: 0.08, boltNm: 25 },
  { id: "snug", label: "Snug Bolt", resistance: 0.48, boltNm: 260 },
  { id: "torque", label: "High Torque", resistance: 0.92, boltNm: 580 },
];

export function createInitialState() {
  return {
    trigger: 1, // 0..1 (1 = pulled)
    targetTrigger: 1,
    pressurePsi: NOMINAL_PSI,
    targetPsi: NOMINAL_PSI,
    loadIdx: 2, // default High Torque so impacts are immediately visible
    slowMo: false,
    rpm: 0,
    camAngle: 0, // radians (motor/hammer cage)
    anvilAngle: 0, // radians (output anvil + socket + hex bolt)
    anvilVel: 0, // rad/s visual burst speed
    hammerLift: 0, // 0 = engaged on lug, 1 = cammed outward clearing lug
    torqueNm: 0, // smoothed gauge reading
    peakTorqueNm: 0,
    impactFlash: 0, // 0..1 decaying blow pulse
    blowCount: 0,
    lastHalfTurn: 0,
    bpm: 0,
    airFlowPhase: 0,
  };
}

/**
 * Advance the pneumatic motor, twin-hammer clutch, and anvil dynamometer by dt seconds.
 * Visual angular speed is slowed so the human eye can follow the cam-over and strike,
 * while RPM, BPM, and N·m readouts reflect true 1/2" impact wrench values.
 */
export function stepModel(st, dt) {
  const psiRate = 1 - Math.exp(-dt / 0.14);
  st.pressurePsi += (st.targetPsi - st.pressurePsi) * psiRate;

  const trigRate = 1 - Math.exp(-dt / 0.06);
  st.trigger += (st.targetTrigger - st.trigger) * trigRate;

  const mode = LOAD_MODES[st.loadIdx] || LOAD_MODES[2];
  const pressureScale = st.pressurePsi / NOMINAL_PSI;

  // True free/loaded motor speed (RPM)
  const targetRpm =
    st.trigger > 0.05
      ? MAX_FREE_RPM * pressureScale * (0.45 + 0.55 * st.trigger) * (1 - 0.34 * mode.resistance)
      : 0;
  const rpmTau = st.trigger > 0.05 ? 0.18 : 0.32;
  st.rpm += (targetRpm - st.rpm) * (1 - Math.exp(-dt / rpmTau));
  if (st.rpm < 8 && st.targetTrigger < 0.05) st.rpm = 0;

  // Visual angular velocity (rad/s) scaled for clear human legibility
  const timeScale = st.slowMo ? 0.35 : 1.0;
  const normRpm = st.rpm / MAX_FREE_RPM;
  const visOmega = normRpm * 6.8 * timeScale; // ~6.8 rad/s (~2.1 blows/s) at full throttle

  const prevLag = st.camAngle - st.anvilAngle;
  st.camAngle += visOmega * dt;

  // Air pulse phase through hose and motor vanes
  st.airFlowPhase += (0.5 + 3.5 * st.trigger * pressureScale) * dt * timeScale;

  // Coupled twin-hammer vs anvil behavior
  const resistance = mode.resistance;
  if (resistance < 0.2) {
    // Free spin: hammers stay locked against anvil lugs, anvil turns almost 1:1 with cage
    const slipTarget = 0.18;
    const catchUp = (st.camAngle - slipTarget - st.anvilAngle) * (1 - Math.exp(-dt / 0.06));
    st.anvilAngle += Math.max(0, catchUp);
    st.hammerLift += (0 - st.hammerLift) * (1 - Math.exp(-dt / 0.08));
    const steadyDrag = 18 * pressureScale * normRpm;
    st.torqueNm += (steadyDrag - st.torqueNm) * (1 - Math.exp(-dt / 0.12));
    st.bpm = 0;
  } else {
    // Impact mode: every PI radians of relative slip (cam vs anvil) equals one twin-hammer cycle
    const lag = st.camAngle - st.anvilAngle;
    const cyclePhase = (((lag % Math.PI) + Math.PI) % Math.PI) / Math.PI; // 0..1

    // Cam profile:
    // 0.00..0.14: dwell after impact
    // 0.14..0.52: cam ramps hammer outward to clear anvil lug
    // 0.52..0.82: free acceleration over the lug
    // 0.82..0.96: cam snaps hammer inward to strike the next lug!
    let targetLift = 0;
    if (cyclePhase >= 0.14 && cyclePhase < 0.52) {
      targetLift = Math.sin(((cyclePhase - 0.14) / 0.38) * (Math.PI / 2));
    } else if (cyclePhase >= 0.52 && cyclePhase < 0.82) {
      targetLift = 1;
    } else if (cyclePhase >= 0.82 && cyclePhase < 0.96) {
      targetLift = Math.cos(((cyclePhase - 0.82) / 0.14) * (Math.PI / 2));
    }
    st.hammerLift += (targetLift - st.hammerLift) * (1 - Math.exp(-dt / 0.025));

    // Detect strike crossing (each completed half-turn of slip when motor is spinning)
    const halfTurns = Math.floor(lag / Math.PI);
    if (halfTurns > st.lastHalfTurn && st.rpm > 350) {
      st.lastHalfTurn = halfTurns;
      st.blowCount += 1;
      st.impactFlash = 1.0;

      // Blow energy scales with pressure and rotational speed
      const blowStrength = pressureScale * Math.min(1.15, 0.35 + 0.8 * normRpm);
      const peakBlowNm = Math.min(
        MAX_TORQUE_NM - 20,
        (160 + 460 * resistance) * blowStrength,
      );
      st.torqueNm = Math.max(st.torqueNm, peakBlowNm);
      st.peakTorqueNm = Math.max(st.peakTorqueNm, peakBlowNm);

      // Discrete ratcheting advance of the anvil & socket on impact
      st.anvilVel = (0.45 + 1.8 * (1 - resistance * 0.72)) * blowStrength;
    }

    // Apply discrete anvil burst and rapid rotational arrest by the test bolt
    if (st.anvilVel > 0.001) {
      st.anvilAngle += st.anvilVel * dt * 2.4 * timeScale;
      st.anvilVel *= Math.exp(-dt / 0.055);
    }

    // Torque gauge needle holds briefly then bleeds down between blows
    const floorNm = 35 * resistance * normRpm;
    st.torqueNm += (floorNm - st.torqueNm) * (1 - Math.exp(-dt / 0.24));

    // Real BPM (roughly 1200 BPM at 90 PSI under load)
    st.bpm = st.rpm > 350 ? Math.round(1200 * (st.rpm / MAX_FREE_RPM) * (0.85 + 0.15 * resistance)) : 0;
  }

  // Decay impact flash envelope
  if (st.impactFlash > 0) {
    st.impactFlash = Math.max(0, st.impactFlash - dt * 5.2 * timeScale);
  }

  // Keep lastHalfTurn synced when lag shrinks (e.g. switching to Free Spin)
  const currentHalf = Math.floor((st.camAngle - st.anvilAngle) / Math.PI);
  if (currentHalf < st.lastHalfTurn) {
    st.lastHalfTurn = currentHalf;
  }

  // Phase label
  let phaseLabel = "IDLE";
  if (st.rpm < 120) {
    phaseLabel = "IDLE";
  } else if (resistance < 0.2) {
    phaseLabel = "FREE SPIN";
  } else if (st.impactFlash > 0.35) {
    phaseLabel = "IMPACT BLOW";
  } else if (st.hammerLift > 0.45) {
    phaseLabel = "CAM OVER";
  } else {
    phaseLabel = "WIND UP";
  }

  return {
    psi: Math.round(st.pressurePsi),
    rpm: Math.round(st.rpm),
    bpm: st.bpm,
    torqueNm: Math.round(st.torqueNm),
    peakTorqueNm: Math.round(st.peakTorqueNm),
    phaseLabel,
    trigger: st.trigger,
    camAngle: st.camAngle,
    anvilAngle: st.anvilAngle,
    hammerLift: st.hammerLift,
    impactFlash: st.impactFlash,
    airFlowPhase: st.airFlowPhase,
    resistance,
  };
}
