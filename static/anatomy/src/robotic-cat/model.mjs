// Pure kinematics, statics, and counterbalance physics model for FELIS-09.
// World units: 1 unit ≈ 3.5 mm (wheelbase 92 units = 322 mm, track 44 units = 154 mm).

export const MASS_KG = 9.2;
export const GRAVITY = 9.81;
export const WEIGHT_N = MASS_KG * GRAVITY; // 90.25 N total static weight
export const TAIL_MASS_KG = 0.88; // 5-segment counterbalance tail mass
export const GEAR_RATIO = 80; // Harmonic drive reduction ratio 80:1
export const MAX_YAW_DEG = 26;
export const MAX_PITCH_DEG = 16;
export const MAX_CROUCH_MM = 38;
export const MAX_TORQUE_NM = 25; // Full scale on the dial torque indicator

// Four load-cell force pad centers [x, y] on the inspection plate
export const PADS = [
  { id: "FL", label: "FL", x: 46, y: -22, fore: 1, side: -1 },
  { id: "FR", label: "FR", x: 46, y: 22, fore: 1, side: 1 },
  { id: "RL", label: "RL", x: -46, y: -22, fore: -1, side: -1 },
  { id: "RR", label: "RR", x: -46, y: 22, fore: -1, side: 1 },
];

/**
 * Compute full robot state from normalized inputs:
 * - yaw: [-1..1] target carriage lateral position along front rail
 * - pitch: [-1..1] target elevation / gaze pitch (-1 crouch/low, +1 high)
 * - crouch: [0..1] postural suspension compression (0 standing, 1 deep crouch)
 * - crouchVel: velocity of crouch spring (for dynamic inertial load spike)
 * - tailPhase: continuous radian phase for harmonic tail stabilization
 */
export function computeState({
  yaw = 0,
  pitch = 0,
  crouch = 0,
  crouchVel = 0,
  tailPhase = 0,
  tracking = false,
} = {}) {
  const clampedYaw = Math.max(-1, Math.min(1, yaw));
  const clampedPitch = Math.max(-1, Math.min(1, pitch));
  const clampedCrouch = Math.max(0, Math.min(1, crouch));

  const yawDeg = clampedYaw * MAX_YAW_DEG;
  const pitchDeg = clampedPitch * MAX_PITCH_DEG;
  const crouchMm = clampedCrouch * MAX_CROUCH_MM;

  // Target carriage world Y offset along the front collimator rail (-36..+36 units)
  const targetY = clampedYaw * 36;
  // Target beacon Z offset (-5..+5 units)
  const targetDz = clampedPitch * 4.5;

  // Torso 3D translation in world units
  const torsoDx = clampedPitch * 2.2 + clampedCrouch * 3.0;
  const torsoDy = clampedYaw * 1.8;
  const torsoDz = -clampedCrouch * 7.2 + clampedPitch * 1.2;

  // Cervical gimbal + head translation relative to world rest
  const headDx = torsoDx + clampedPitch * 2.4;
  const headDy = torsoDy + clampedYaw * 5.2;
  const headDz = torsoDz + clampedPitch * 3.2;

  // Counterbalance tail lateral whip: sweeps opposite to head yaw to cancel CoM shift,
  // plus a calm harmonic stabilization wave.
  const counterYaw = -clampedYaw * 9.5 + Math.sin(tailPhase) * 2.8;
  const counterLift = clampedCrouch * 5.5 - clampedPitch * 2.4 + Math.cos(tailPhase * 0.75) * 1.4;

  // Fore-aft and lateral Center-of-Mass shift (in mm)
  const comXmm = (torsoDx + clampedPitch * 3.5 - clampedCrouch * 2.1) * 3.5;
  const comYmm = (torsoDy * 0.4) * 3.5; // Mostly cancelled by counter-sweeping tail

  // Dynamic vertical acceleration term from pounce/crouch spring
  const dynFactor = 1 - crouchVel * 0.35;

  // 4-corner load-cell ground reaction forces (N)
  const baseForce = (WEIGHT_N / 4) * Math.max(0.45, Math.min(1.65, dynFactor));
  const foreShift = (comXmm / 160) * (WEIGHT_N * 0.28);
  const latShift = (clampedYaw * 0.16) * (WEIGHT_N * 0.22);

  const forces = PADS.map((pad) => {
    const f = baseForce + pad.fore * (foreShift * 0.5) + pad.side * (latShift * 0.5);
    return Math.max(4, Math.min(48, f));
  });

  // Peak knee harmonic-drive actuator torque (N·m)
  // Increases with crouch lever arm and dynamic vertical load
  const momentArmM = 0.068 + clampedCrouch * 0.085;
  const maxPadForce = Math.max(...forces);
  const kneeTorqueNm = Math.min(
    MAX_TORQUE_NM,
    Math.max(3.2, maxPadForce * momentArmM * (1 + clampedCrouch * 0.95)),
  );

  let modeLabel = tracking ? "tracking" : "idle scan";
  if (clampedCrouch > 0.45) modeLabel = "pounce crouch";
  else if (Math.abs(clampedYaw) > 0.55) modeLabel = clampedYaw > 0 ? "track right" : "track left";
  else if (Math.abs(clampedPitch) > 0.5) modeLabel = clampedPitch > 0 ? "elevate gaze" : "low stalk";

  return {
    yaw: clampedYaw,
    pitch: clampedPitch,
    crouch: clampedCrouch,
    yawDeg,
    pitchDeg,
    crouchMm,
    targetY,
    targetDz,
    torsoDx,
    torsoDy,
    torsoDz,
    headDx,
    headDy,
    headDz,
    counterYaw,
    counterLift,
    comXmm,
    comYmm,
    forces,
    kneeTorqueNm,
    modeLabel,
  };
}
