// Pure gait model for Spot (Boston Dynamics) with the Spot Arm, on an
// instrumented gait bench. Constants printed in the figure (readout, caption,
// legend) come from LEDGER-V2.md / TRUTH.md (Boston Dynamics official docs)
// and are cited inline. Proportions marked DERIVED were pixel-measured by the
// builder from BD's own side/front elevations in research/ (see BUILD_NOTES).
//
// World scale: 1 unit = 10 mm.

// ── Truth constants (LEDGER-V2 / TRUTH) ────────────────────────────────────
export const SCALE_MM = 10; // 1 world unit = 10 mm (drawing choice)
export const TOTAL_MM = [1100, 500]; // total length x width incl. leg splay (BD)
export const MASS_KG = 40.5; // net mass WITH Spot Arm (LEDGER-V2)
export const MASS_BASE_KG = 32.5; // base robot alone (BD spec)
export const ARM_MASS_KG = 8; // Spot Arm (BD docs)
export const GRAVITY = 9.81;
export const WEIGHT_N = MASS_KG * GRAVITY; // 397.3 N, quoted as ~397 N
export const DOF = 12; // legs: 3 per leg, 2 hip + 1 knee (BD docs)
export const ARM_DOF = 6; // Spot Arm: 6 DoF + gripper (BD docs)
export const ARM_LINKS_MM = [338.5, 403.3, 117.45, 124.82]; // BD dimensioned drawing 02
export const ARM_REACH_MM = 984; // full extension (BD docs) = sum of links
export const SPEED_MAX = 1.6; // m/s (BD spec)
export const SLOPE_MAX_DEG = 30; // ±30° (BD spec)
export const STEP_MAX_MM = 300; // max step height (BD spec)
export const BATTERY_WH = 605; // Gamma pack (LEDGER-V2, current docs)
export const HEIGHT_NOM_MM = 610; // default walking body height (BD docs)
export const HEIGHT_MIN_MM = 520; // body-height control range (BD docs)
export const HEIGHT_MAX_MM = 700;
export const CAMERAS = 5; // five depth cameras: 2 front, 1 rear, 1 each side
export const CAMERA_FOV_DEG = 360; // horizontal field of view (BD docs)
export const TERRAIN_RANGE_M = 4; // terrain sensing range (BD docs)
export const GRIP_MAX_MM = 175; // gripper max aperture (BD docs)
export const GRIP_DEPTH_MM = 90; // gripper finger depth (BD docs)
// Gripper animation (drawing): the aperture cycles slowly — one open/close
// per six gait cycles — between 33 and 117 mm, inside the 0..175 truth range.
export const GRIP_CYCLE_BASE_MM = 75;
export const GRIP_CYCLE_AMP_MM = 42;
export const GRIP_CYCLE_GAIT = 6;

// ── DERIVED proportions (pixel-measured from BD elevations, BUILD_NOTES) ──
// Side elevation: upper and lower leg silhouettes measure equal within ~3%
// (upper 679–721 px, lower 673–702 px); front elevation: the recessed face
// panel measures ~0.41 of total width (~205 mm) and the chassis face ~0.58
// (~290 mm). Combined with the LEDGER anchors:
export const CHASSIS_MM = [760, 280]; // DERIVED: face-to-face length x face width
export const BODY_THICK_MM = 225; // DERIVED: deck top to belly
export const HIP_X_MM = 290; // DERIVED: hip pivots ±290 from centre
export const L1_MM = 400; // DERIVED: upper leg link
export const L2_MM = 420; // DERIVED: lower leg link
export const FOOT_MM = [70, 40]; // foot pad length x width (BD Choreography est.)

// ── Drawing geometry in world units (mm / 10) ──────────────────────────────
export const PAD_TOP = 4.2; // force-plate top surface, world z
export const FOOT_Z = PAD_TOP + 1.6; // ankle centre; foot pad bottom rests on the plate
export const HIP_PIVOT_DZ = 6; // hip pivot sits 60 mm above the body-height reference
export const HIP_Z0 = HEIGHT_NOM_MM / SCALE_MM + HIP_PIVOT_DZ; // 67 at the 610 default
export const L1 = L1_MM / SCALE_MM; // 40
export const L2 = L2_MM / SCALE_MM; // 42
export const DUTY = 0.55; // stance share of the cycle (drawing)

// Legs: fore +1 = front, side +1 = left (+y, the side facing the viewer).
// Trot: diagonal pairs move together — FL with RR, FR with RL (TRUTH §4).
// Front and rear leg planes are offset in y (front pair inboard of the rear
// pair, as in BD's front elevation), so the blades pass side by side.
// Stance width (v3): feet track close under the hips — |y| 17.9 front /
// 22.5 rear — toward real Spot's narrow stance, not the v2 splay. The
// front leg planes run inboard of the rear planes (BD front elevation);
// at the trot exchange the two knees on a side pass within ~40 mm, and
// the 46 mm plane separation is what keeps their housings clear.
export const LEGS = [
  { id: "FL", fore: 1, side: 1, hipX: 29, hipY: 19, kneeY: 18.1, footY: 17.9, phase: 0 },
  { id: "FR", fore: 1, side: -1, hipX: 29, hipY: 19, kneeY: 18.1, footY: 17.9, phase: 0.5 },
  { id: "RL", fore: -1, side: 1, hipX: -29, hipY: 19, kneeY: 22.7, footY: 22.5, phase: 0.5 },
  { id: "RR", fore: -1, side: -1, hipX: -29, hipY: 19, kneeY: 22.7, footY: 22.5, phase: 0 },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const frac = (v) => v - Math.floor(v);

// Stride frequency of the trot (drawing curve, Hz): still at rest, then
// rising with commanded speed. Never printed as a spec.
export const freqHz = (speed) => (speed <= 0.01 ? 0 : 1.1 + 0.75 * speed);

/**
 * Full gait state.
 * - speed: commanded forward speed, 0..1.6 m/s (input is clamped)
 * - bodyHeight: commanded body height in mm, clamped 520..700, anchored to
 *   the 610 mm default (LEDGER-V2); the hip pivot rides 60 mm above it
 * - phase: gait phase in cycles (any real number, wraps)
 * Returns per-leg hip / knee / foot (ankle) positions in world units, stance
 * flags, swing lift (0..1) and foot forces in newtons. Swing feet carry 0 N;
 * stance feet are normalised so the total is the robot's weight with the
 * Arm, ~397 N, with a small dynamic term from the body bob while trotting.
 * Also returns the Spot Arm gripper aperture in mm — a pure function of
 * phase like the gait (one slow open/close per GRIP_CYCLE_GAIT cycles).
 */
export function computeState({ speed = 0, bodyHeight = HEIGHT_NOM_MM, phase = 0 } = {}) {
  const v = clamp(speed, 0, SPEED_MAX);
  const hMm = clamp(bodyHeight, HEIGHT_MIN_MM, HEIGHT_MAX_MM);
  const moving = v > 0.01;
  const ph = frac(phase);

  // Body bob and pitch from the trot: two stance exchanges per cycle.
  const bobZ = moving ? 0.7 * Math.sin(4 * Math.PI * ph + 0.6) : 0;
  const pitchDeg = moving ? 1.6 * Math.sin(2 * Math.PI * ph) : 0;
  const hipZ = HIP_Z0 + (hMm - HEIGHT_NOM_MM) / SCALE_MM + bobZ;

  const stride = moving ? 4.5 + 7 * v : 0; // foot travel per half cycle, units (drawing)
  const lift = moving ? 5 : 0; // swing clearance, units (drawing)

  const legs = LEGS.map((leg) => {
    const hip = [leg.hipX, leg.side * leg.hipY, hipZ];
    const u = frac(ph + leg.phase);
    const stance = !moving || u < DUTY;
    let fx, fz, swing = 0;
    if (!moving) {
      fx = leg.hipX + leg.fore * 8;
      fz = FOOT_Z;
    } else if (stance) {
      // Stance: the foot is planted and travels backward relative to the body.
      fx = leg.hipX + stride * (0.5 - u / DUTY);
      fz = FOOT_Z;
    } else {
      // Swing: the foot lifts, swings forward and comes down ahead.
      const s = (u - DUTY) / (1 - DUTY);
      swing = s;
      fx = leg.hipX + stride * (-0.5 + s);
      fz = FOOT_Z + lift * Math.sin(Math.PI * s);
    }
    const foot = [fx, leg.side * leg.footY, fz];

    // 2D sagittal IK: hip -> knee -> foot with the DERIVED link lengths.
    // Front knees point backward, rear knees forward (the Spot way).
    const dx = foot[0] - hip[0];
    const dz = foot[2] - hip[2];
    const dist = clamp(Math.hypot(dx, dz), Math.abs(L2 - L1) + 1, L1 + L2 - 0.5);
    const ux = dx / Math.hypot(dx, dz);
    const uz = dz / Math.hypot(dx, dz);
    const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
    const sinA = Math.sqrt(1 - cosA * cosA);
    const kneeDir = -leg.fore;
    const px = -uz;
    const pz = ux;
    const kx = hip[0] + L1 * (ux * cosA + px * sinA * kneeDir);
    const kz = hip[2] + L1 * (uz * cosA + pz * sinA * kneeDir);
    const knee = [kx, leg.side * leg.kneeY, kz];

    return { id: leg.id, fore: leg.fore, side: leg.side, hip, knee, foot, stance, swing, force: 0 };
  });

  // Foot forces: stance feet share the weight (robot + Arm) with a travelling
  // shift of the centre of mass; swing feet carry nothing. Total stays ~397 N.
  const dyn = moving ? 1 + 0.03 * Math.sin(4 * Math.PI * ph) : 1;
  const shiftX = moving ? 0.22 * Math.sin(2 * Math.PI * ph) : 0;
  const shiftY = moving ? 0.12 * Math.sin(2 * Math.PI * ph + 1.3) : 0;
  const stanceLegs = legs.filter((leg) => leg.stance);
  const weights = stanceLegs.map((leg) => Math.max(0.2, 1 + leg.fore * shiftX + leg.side * shiftY));
  const wSum = weights.reduce((a, b) => a + b, 0);
  stanceLegs.forEach((leg, i) => {
    leg.force = (WEIGHT_N * dyn * weights[i]) / wSum;
  });

  // Gripper aperture: a slow sinusoid of phase (never of wall-clock time),
  // so any captured frame is reproducible from computeState alone.
  const gripperMm = Math.round(
    GRIP_CYCLE_BASE_MM + GRIP_CYCLE_AMP_MM * Math.sin((2 * Math.PI * phase) / GRIP_CYCLE_GAIT + 0.8),
  );

  return {
    speed: v,
    bodyHeightMm: Math.round(hMm + bobZ * SCALE_MM),
    phase: ph,
    bobZ,
    pitchDeg,
    gripperMm,
    legs,
    totalForce: legs.reduce((a, leg) => a + leg.force, 0),
    stancePair: stanceLegs.map((leg) => leg.id).join("+"),
  };
}
