# SPOT — truth sheet (sources: Boston Dynamics official)
Sources: dev.bostondynamics.com "About Spot" (Spot 5.x docs), BD Spot product spec sheet, BD Support "How Spot Avoids Obstacles".

## The robot (base Spot, no Arm, no payloads)
- Length 1100 mm, width 500 mm, height (sitting) 191 mm
- Default walking body height 610 mm; walking height range roughly 520–700 mm in older spec summaries — treat 610 as the nominal readout anchor, do not quote a range unless hedged
- Net mass 32.5 kg (with battery, product spec) → weight 319 N (32.5 × 9.81)
- Degrees of freedom: 12 — 3 per leg: 2 actuators in each hip + 1 in each knee (BD docs, verbatim structure)
- Actuation: all-electric custom actuators; joint position + force sensing in the limbs (proprioception)
- Max speed 1.6 m/s; max slope ±30°; max step height 300 mm
- Payload capacity 14 kg; payload mounting rails on the back, 2× DB25 ports
- Battery: 564 Wh swappable pack (product spec sheet), ~90 min typical runtime, ~180 min standby, ~60 min recharge
- IP54; operating −20 °C to 55 °C

## Sensing / how it perceives
- 5 pairs of stereo cameras (BD docs) = five depth cameras: 2 front, 1 rear, 1 on each side
- 360° horizontal field of view, terrain-sensing range 4 m, obstacle avoidance keeps ~7.5 cm minimum cushion by default
- Body IMU (accelerometers + gyros) for orientation / balance
- Joint encoders + force sensing: knows where each foot is and when it is loaded / in contact

## How it walks (the explanation the figure must carry)
1. SENSE — depth cameras build a local terrain/obstacle picture out to 4 m; IMU reports body pitch/roll; encoders report every joint.
2. ESTIMATE — body pose + terrain are fused continuously; centre of mass tracked over the support polygon of the feet in stance.
3. PLAN — footholds are chosen on reachable, sensed ground (step up to 300 mm, slopes to 30°); gait is a dynamic trot: diagonal pairs (front-left + rear-right, front-right + rear-left) move together.
4. ACTUATE — 12 electric actuators drive hip/knee joints; a stance foot pushes, a swing foot lifts, places, loads.
5. REPEAT at control-loop speed — if pushed, feet re-place to catch the body (dynamic balance, not static tripod stability).
