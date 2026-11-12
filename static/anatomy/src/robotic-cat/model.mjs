// Pure biomimetic kinematics, 3-link digitigrade pantograph IK, spinal arch,
// 7-segment 3D spline whip tail, and elastic pounce energetics for FELIS-09 v2.
// World scale: 1 unit = 4.0 mm (wheelbase 86 units = 344 mm).

export const SCALE_MM = 4.0;
export const MASS_KG = 9.6;
export const GRAVITY = 9.81;
export const WEIGHT_N = MASS_KG * GRAVITY; // 94.18 N total static weight
export const TAIL_MASS_KG = 0.92;
export const GEAR_RATIO = 80; // 80:1 harmonic-drive actuators
export const MAX_YAW_DEG = 28;
export const MAX_PITCH_DEG = 18;
export const MAX_CROUCH_MM = 44; // 11.0 world units vertical hip drop
export const MAX_TORQUE_NM = 25; // Dial gauge full scale
export const MAX_ENERGY_J = 18.5; // Peak elastic strain energy in Achilles + spine coils

export const PAD_TOP = 4.5;
export const PAW_ANKLE_Z = PAD_TOP + 1.6; // Distal metatarsal pivot height (z = 6.1)

// Digitigrade 3-link leg lengths in world units (1 unit = 4.0 mm):
// Forelimbs bend elbow-rearward + carpus-forward; hindlimbs bend stifle-forward + hock-rearward.
export const FORE_FEMUR = 18.0;
export const FORE_TIBIA = 18.5;
export const FORE_META = 10.5;

export const HIND_FEMUR = 19.5;
export const HIND_TIBIA = 19.5;
export const HIND_META = 11.5;

// Forelegs sit inboard (|y| = 17.0..18.0) of hindlegs (|y| = 21.0..21.6) so limb planes stay clear.
export const PADS = [
  { id: "FL", label: "FL", x: 45, y: -18.0, hipX: 36, hipY: -17.0, fore: 1, side: -1 },
  { id: "FR", label: "FR", x: 45, y: 18.0, hipX: 36, hipY: 17.0, fore: 1, side: 1 },
  { id: "RL", label: "RL", x: -41, y: -21.6, hipX: -38, hipY: -21.0, fore: -1, side: -1 },
  { id: "RR", label: "RR", x: -41, y: 21.6, hipX: -38, hipY: 21.0, fore: -1, side: 1 },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Solve 2D sagittal digitigrade pantograph leg (Hip/Shoulder -> Middle Joint -> Wrist/Hock -> Paw).
 * - Forelimbs (pad.fore > 0): elbow points rearward (-X), carpus/wrist sits above-behind paw.
 * - Hindlimbs (pad.fore < 0): stifle/knee points forward (+X), calcaneal hock points rearward (-X)
 *   with a protruding heel spur bridged to the femur by an Achilles parallel elastic spring.
 */
function solveDigitigradeLeg(pad, hipWorld, crouch, pitch) {
  const paw = [pad.x, pad.y, PAW_ANKLE_Z];
  const isFore = pad.fore > 0;
  const L1 = isFore ? FORE_FEMUR : HIND_FEMUR;
  const L2 = isFore ? FORE_TIBIA : HIND_TIBIA;
  const L3 = isFore ? FORE_META : HIND_META;

  // Pastern / metatarsus folds flatter during crouch
  const baseMetaDeg = isFore ? 62 : 60;
  const metaDeg = baseMetaDeg - crouch * 26 + (isFore ? pitch * 4 : -pitch * 4);
  const metaRad = metaDeg * (Math.PI / 180);

  // Wrist (fore) / Hock (hind) sits behind (-X) and above (+Z) the planted paw pivot
  const hockX = paw[0] - L3 * Math.cos(metaRad);
  const hockZ = paw[2] + L3 * Math.sin(metaRad);
  const hock = [hockX, pad.hipY, hockZ];

  // Solve middle joint (Elbow for foreleg, Stifle/Knee for hindleg) via 2-circle IK
  const dx = hock[0] - hipWorld[0];
  const dz = hock[2] - hipWorld[2];
  const rawDist = Math.hypot(dx, dz) || 1e-6;
  const dist = clamp(rawDist, Math.abs(L1 - L2) + 0.8, L1 + L2 - 0.8);
  const ux = dx / rawDist;
  const uz = dz / rawDist;

  const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));

  // Perpendicular to hip->hock chord: since uz < 0, (-uz, ux) points +X (forward)
  const px = -uz;
  const pz = ux;
  const jointSign = isFore ? -1 : 1; // Fore elbow points rearward (-1); hind knee points forward (+1)

  const kneeX = hipWorld[0] + L1 * (ux * cosA + px * sinA * jointSign);
  const kneeZ = hipWorld[2] + L1 * (uz * cosA + pz * sinA * jointSign);
  const knee = [kneeX, pad.hipY, kneeZ];

  // Calcaneal heel spur on hindlegs (and olecranon spur on forelegs)
  const tdX = hock[0] - knee[0];
  const tdZ = hock[2] - knee[2];
  const tdLen = Math.hypot(tdX, tdZ) || 1;
  const heelLen = isFore ? 2.4 : 4.2;
  const heel = [
    hock[0] + (tdX / tdLen) * heelLen * (isFore ? -0.4 : 1.0),
    pad.hipY,
    hock[2] + (tdZ / tdLen) * heelLen * (isFore ? 0.2 : 1.0) + (isFore ? 1.8 : 0.8),
  ];

  // Upper tendon/damper anchor on rear of femur/humerus
  const tendonTop = isFore
    ? [hipWorld[0] - 2.6, pad.hipY, hipWorld[2] - 2.2]
    : [knee[0] - 3.4, pad.hipY, knee[2] + 3.0];
  const tendonBottom = isFore ? [knee[0] - 1.2, pad.hipY, knee[2] + 0.8] : heel;
  const tendonLen = Math.hypot(
    tendonBottom[0] - tendonTop[0],
    tendonBottom[2] - tendonTop[2],
  );

  return {
    id: pad.id,
    fore: pad.fore,
    side: pad.side,
    isFore,
    padX: pad.x,
    padY: pad.y,
    hip: hipWorld,
    knee,
    hock,
    heel,
    tendonTop,
    tendonBottom,
    tendonLen,
    paw,
  };
}

/**
 * Compute full biomimetic robot state from normalized inputs:
 * - yaw: [-1..1] prey lure lateral position along front linear stage
 * - pitch: [-1..1] gaze elevation (-1 low stalk, +1 elevated alert)
 * - crouch: [0..1] digitigrade suspension compression (0 standing, 1 deep ambush coil)
 * - crouchVel: spring velocity (for dynamic pounce load spike)
 * - tailPhase: continuous radian phase for counterbalance whip wave
 */
export function computeState({
  yaw = 0,
  pitch = 0,
  crouch = 0,
  crouchVel = 0,
  tailPhase = 0,
  tracking = false,
} = {}) {
  const clampedYaw = clamp(yaw, -1, 1);
  const clampedPitch = clamp(pitch, -1, 1);
  const clampedCrouch = clamp(crouch, 0, 1);

  const yawDeg = clampedYaw * MAX_YAW_DEG;
  const pitchDeg = clampedPitch * MAX_PITCH_DEG;
  const crouchMm = clampedCrouch * MAX_CROUCH_MM;

  // 1. Prey lure carriage position along front rail (-38..+38 Y)
  const targetY = clampedYaw * 38;
  const targetDz = clampedPitch * 4.0;
  const lureWhip = Math.sin(tailPhase * 2.1) * 2.2 - clampedYaw * 2.8;

  // 2. Torso & spinal arch kinematics
  const torsoDx = clampedPitch * 1.8 - clampedCrouch * 2.0;
  const torsoDy = clampedYaw * 1.4;
  const torsoDz = -clampedCrouch * 11.0;

  const thoraxDz = torsoDz + clampedPitch * 2.0;
  const pelvisDz = torsoDz - clampedPitch * 1.2;
  // Lumbar spine arches upward (+Z) relative to the thorax-pelvis chord during crouch
  const spineArchZ = clampedCrouch * 4.2;

  // 3. Solve all 4 digitigrade pantograph legs in world space
  const legs = PADS.map((pad) => {
    const hipZ = (pad.fore > 0 ? 45.5 + thoraxDz : 46.0 + pelvisDz);
    const hipX = pad.hipX + torsoDx + (pad.fore < 0 ? -clampedCrouch * 1.6 : 0);
    const hipY = pad.hipY + torsoDy * 0.45;
    return solveDigitigradeLeg(pad, [hipX, hipY, hipZ], clampedCrouch, clampedPitch);
  });

  // 4. Cervical gimbal & sculpted feline skull pose
  const headDx = torsoDx + clampedPitch * 2.2 + clampedCrouch * 1.8;
  const headDy = torsoDy + clampedYaw * 5.2;
  const headDz = thoraxDz + clampedPitch * 3.2 + clampedCrouch * 1.4;

  // Acoustic pinnae swivel toward target and flatten backward ("airplane ears") on pounce coil
  const earFlatten = clamp((clampedCrouch - 0.25) / 0.75, 0, 1);
  const earSwivelL = clampedYaw * 0.85 - earFlatten * 0.55;
  const earSwivelR = clampedYaw * 0.85 + earFlatten * 0.55;

  // Cat-eye vertical slit pupil dilation (0.36 narrow slit at idle -> 0.92 dilated in pounce coil)
  const pupilDilate = 0.36 + clampedCrouch * 0.56;

  // 5. 7-Segment 3D Spline Counterbalance Whip Tail (8 nodes from pelvis root to inertial tip)
  const root = [-54 + torsoDx, torsoDy * 0.5, 47.0 + pelvisDz];
  const counterYaw = -clampedYaw * 15.5;
  const counterLift = clampedCrouch * 8.5 - clampedPitch * 3.0;
  const tailNodes = [root];
  const segLengths = [8.2, 8.0, 7.6, 7.2, 6.8, 6.4, 6.0];
  let cur = root;
  for (let i = 0; i < 7; i++) {
    const u = (i + 1) / 7;
    const bend = Math.pow(u, 1.45);
    const waveY = Math.sin(tailPhase - i * 0.6) * (2.4 * bend);
    const waveZ = Math.cos(tailPhase * 0.8 - i * 0.5) * (1.1 * bend);
    const dirX = -1.0 + 0.36 * Math.pow(u, 1.75);
    const dirY = counterYaw * 0.085 * u + waveY * 0.14;
    const dirZ = 0.22 + 0.68 * u + counterLift * 0.04 * u + waveZ * 0.08;
    const norm = Math.hypot(dirX, dirY, dirZ) || 1;
    const L = segLengths[i];
    cur = [
      cur[0] + (dirX / norm) * L,
      cur[1] + (dirY / norm) * L,
      cur[2] + (dirZ / norm) * L,
    ];
    tailNodes.push(cur);
  }

  // 6. Ground Reaction Forces (N), Elastic Strain Energy (J), and Peak Joint Torque (N·m)
  const comXmm = (torsoDx + clampedPitch * 3.0 - clampedCrouch * 3.4) * SCALE_MM;
  const comYmm = torsoDy * 0.35 * SCALE_MM;
  const dynFactor = clamp(1 - crouchVel * 0.36, 0.44, 1.72);
  const baseForce = (WEIGHT_N / 4) * dynFactor;
  const foreShift = (comXmm / 176) * (WEIGHT_N * 0.32);
  const latShift = clampedYaw * 0.16 * (WEIGHT_N * 0.24);

  const forces = PADS.map((pad) => {
    const f = baseForce + pad.fore * (foreShift * 0.5) + pad.side * (latShift * 0.5);
    return clamp(f, 4, 52);
  });

  // Stored elastic strain energy across Achilles tendons + dorsal spinal coil (0.8..18.5 J)
  const strainEnergyJ = clamp(
    0.8 + Math.pow(clampedCrouch, 1.6) * 16.4 + Math.max(0, -crouchVel) * 2.0,
    0.8,
    MAX_ENERGY_J,
  );

  // Peak knee/hock harmonic-drive actuator torque (N·m)
  const momentArmM = 0.064 + clampedCrouch * 0.088;
  const maxPadForce = Math.max(...forces);
  const kneeTorqueNm = clamp(
    maxPadForce * momentArmM * (1 + clampedCrouch * 0.92),
    3.4,
    MAX_TORQUE_NM,
  );

  let modeLabel = tracking ? "stalk lock" : "prowl scan";
  if (clampedCrouch > 0.65) modeLabel = "coiled pounce";
  else if (clampedCrouch > 0.3) modeLabel = "ambush crouch";
  else if (Math.abs(clampedYaw) > 0.55) modeLabel = clampedYaw > 0 ? "track right" : "track left";

  return {
    yaw: clampedYaw,
    pitch: clampedPitch,
    crouch: clampedCrouch,
    yawDeg,
    pitchDeg,
    crouchMm,
    targetY,
    targetDz,
    lureWhip,
    torsoDx,
    torsoDy,
    torsoDz,
    thoraxDz,
    pelvisDz,
    spineArchZ,
    headDx,
    headDy,
    headDz,
    earFlatten,
    earSwivelL,
    earSwivelR,
    pupilDilate,
    legs,
    tailNodes,
    comXmm,
    comYmm,
    forces,
    strainEnergyJ,
    kneeTorqueNm,
    modeLabel,
  };
}
