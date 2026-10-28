// Quadcopter model: a 1.4 kg, 450-class frame with 10 x 4.5 inch props, X layout,
// ArduPilot motor numbering. Everything the figure shows (rotor speeds, tilt, the
// load-cell reading, the telemetry bars) is computed here.
//
// Static thrust of a propeller: T = C_T · ρ · n² · D⁴ (n in rev/s, D in m).
// Reaction torque:              Q = C_Q · ρ · n² · D⁵.
// With C_T ≈ 0.10 and D = 0.254 m, a hover share of 3.43 N needs ≈ 82 rev/s ≈ 4,900 rpm.

export const MASS = 1.4; // kg
export const G0 = 9.81; // m/s²
export const RHO = 1.225; // kg/m³
export const D = 0.254; // m, 10 inch prop
export const CT = 0.1;
export const CQ = 0.0075;
export const WEIGHT = MASS * G0; // 13.73 N
export const KT = CT * RHO * D ** 4; // N per (rev/s)²
export const HOVER_T = WEIGHT / 4; // N per motor
export const HOVER_RPM = Math.sqrt(HOVER_T / KT) * 60; // ≈ 4,920 rpm
export const MAX_TILT = 12; // degrees the stand allows, and the attitude the sticks command
export const YAW_RATE = 60; // degrees per second at full yaw stick

// Motors: position on the frame (x forward, y left), spin seen from above.
// ArduPilot quad X: 1 front-right CCW, 2 rear-left CCW, 3 front-left CW, 4 rear-right CW.
export const MOTORS = [
  { id: 1, x: 1, y: -1, spin: 1 },
  { id: 2, x: -1, y: 1, spin: 1 },
  { id: 3, x: 1, y: 1, spin: -1 },
  { id: 4, x: -1, y: -1, spin: -1 },
];

// The mixer. Sticks are -1..1: throttle (0 = hover), pitch (+ = nose down), roll
// (+ = right side down), yaw (+ = clockwise seen from above). Each output is a
// thrust share relative to hover.
//   pitch forward: the rear pair speeds up, the front pair slows.
//   roll right:    the left pair speeds up.
//   yaw clockwise: the counter-clockwise props speed up; their reaction torque on
//                  the frame is clockwise, and total thrust stays the same.
export function mix({ throttle = 0, pitch = 0, roll = 0, yaw = 0 }) {
  return MOTORS.map((m) => 1 + 0.32 * throttle - 0.14 * pitch * m.x + 0.14 * roll * m.y + 0.18 * yaw * m.spin);
}

export const rpmOf = (share) => Math.sqrt((Math.max(0, share) * HOVER_T) / KT) * 60;
export const thrustOf = (rpm) => KT * (rpm / 60) ** 2;
export const torqueOf = (rpm) => CQ * RHO * (rpm / 60) ** 2 * D ** 5;

// What the stand measures and what free flight would do.
export function state(sticks, tilt = { pitch: 0, roll: 0 }) {
  const shares = mix(sticks);
  const rpm = shares.map(rpmOf);
  const thrust = rpm.map(thrustOf);
  const total = thrust.reduce((a, b) => a + b, 0);
  const rad = Math.PI / 180;
  const vertical = total * Math.cos(tilt.pitch * rad) * Math.cos(tilt.roll * rad);
  const net = vertical - WEIGHT; // N, what the load cell under the post reads
  const yawTorque = rpm.reduce((sum, r, i) => sum + MOTORS[i].spin * torqueOf(r), 0); // + = clockwise
  const tiltAngle = Math.acos(Math.cos(tilt.pitch * rad) * Math.cos(tilt.roll * rad)) / rad;
  const sideways = G0 * Math.tan(tiltAngle * rad); // m/s² if altitude were held
  return { shares, rpm, thrust, total, net, yawTorque, sideways };
}
