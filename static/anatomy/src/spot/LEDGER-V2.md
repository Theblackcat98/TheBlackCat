# SPOT v2 — Research Ledger (replaces v1 proportions entirely)
Owner verdict on v1: "maybe 5% there. Wrong scale/dimensions, missing the top arm, many more details missing, shapes need improvement."
v1's core error: it made the 1100 mm the CHASSIS length and hung short stick legs off a slab.
In reality the legs dominate and the chassis is short. Study the reference drawings in research/ BEFORE any geometry:
- research/spotanatomy.png  (BD official anatomy, 3/4 view — labels: hip, upper leg, knee, lower leg, foot, top, bottom, mounting rail x2, payload port x2)
- research/sideview.png      (BD official side elevation)
- research/frontview.png     (BD official front elevation)
- research/arm-diagram-02.png (BD official Arm link lengths, dimensioned)
- research/arm-diagram-03.png (BD official Arm 3/4 view)

## Anchors (official, Boston Dynamics)
- Total length 1100 mm / width 500 mm / height standing 840 mm / sitting 191 mm
- Default walking height 610 mm, min 520, max 700 (this is the body-height control range; v1's readout idling at ~660 with a 610 "nominal" was sloppy — anchor the model to 610 default)
- Net mass base robot 32.5 kg; WITH Spot Arm 40.5 kg total → weight 397 N. v2 includes the Arm, so force plates sum to ~397 N, NOT 319 N.
- Battery (current Gamma docs): 605 Wh, 90 min typical. (v1 used the older 564 Wh sheet — use 605 Wh and say Gamma.)
- Legs: 12 DoF, HX ±45°, HY +91/−91 with 50° bias, knee 14–160° from straight
- Foot size ≈ 70 mm long × 40 mm wide (BD Choreography docs estimate)
- Payload mounting area 850 × 240 mm, 2 rails, 2 payload ports

## Spot Arm (official — BD docs + dimensioned diagram 02)
- 6 DoF + gripper, 8 kg, full extension 984 mm, max reach height on robot 1800 mm, lift 11 kg, gripper aperture 175 mm, grip depth 90 mm, clamp 130 N, gripper has ToF + 4K RGB camera + LED
- LINK LENGTHS (measured on BD's own dimensioned drawing, they sum to 984):
  shoulder pivot → elbow 338.50 mm · elbow → wrist 403.30 mm · wrist → gripper pivot 117.45 mm · gripper pivot → tip 124.82 mm
- Form (diagram 03): turret base plate on the deck's FRONT payload port; a large round ribbed shoulder motor housing; upper arm a long tapered dark link; elbow housing; forearm a smooth CYLINDER (the fat tube segment); wrist ring (knurled); gripper = two flat opposing jaws/fingers with a camera window between the roots.
- Pose for the figure: raised working pose, elbow bent, forearm roughly horizontal pointing forward over the front face, gripper open — the BD product-photo pose. Static pose is fine; joints are solids.

## Derived proportions (from BD's side/front elevations — DERIVED, mark as such in model.mjs)
Pixel-reading the side elevation (total height 840 = ground to deck top in that standing pose):
- Body/chassis (face to face, excl. leg splay): ≈ 0.68–0.72 of total length → ~760 mm. The 1100 total INCLUDES the splayed legs in the standing drawing. Hip pivots sit ~±290 mm from centre.
- Body thickness (deck top to belly): ≈ 0.27 of standing height → ~225 mm. Belly at default walk sits ~610−225 ≈ 385?? — no: treat walking height 610 as ground→belly underside is WRONG too; BD "height standing 840" vs "default walking 610": walking height is the BODY height setting (hip height). Use: hip pivot height at default walk ≈ 610 mm is NOT right either — hip pivots are at body mid-height. Simplest true anchor set for the model: feet→deck top at default walk ≈ 790–840; hip pivot ≈ 560; upper leg ≈ 400; lower leg ≈ 420 (leg links ≈ equal, sum ≈ 820, bent at knee so vertical reach < sum). Builder: pixel-measure the two elevations yourself, write the numbers you used in BUILD_NOTES as derived.
- Upper leg: THICK tapered shell — wide (~110 mm) at hip, stays wide, rounded end at knee; it is a cover over the actuator, angled ~40–50° from vertical at rest. NOT a thin rod, NOT a disc on a stick.
- Lower leg: LONG slender BOWED strut, slightly curved (convex forward), thin (~35 mm), with a flared treaded foot pad. Length ≈ upper leg.
- Hip housing: large smooth rounded cover protruding outboard of the chassis at each corner (front view: hips are the widest visual masses at top corners, chassis face is NARROWER than the hip-to-hip width). Chassis face width ≈ 0.56 of total width (~280 mm of 500).
- Knee: at the BOTTOM of the upper-leg shell, a vented band/grille wraps the joint (visible in front view under each hip, and the knee label in the anatomy drawing points low on the upper shell).
- Front AND rear faces: one large recessed rectangular panel each — central dark mesh grille flanked by 3 sensor windows per side (the stereo cameras live in these faces). This panel is Spot's "face" — v1's tiny round eyes were wrong. Face panel ≈ 200 mm wide × 180 mm tall on the front view.
- Top deck: flat plate, 2 mounting rails running the length (850 mm), 2 payload-port plates (small rounded rectangles w/ 2 screws), a separate angled cover plate at the FRONT of the deck with 4 screw dots.
- Side of chassis: a long horizontal vent/mesh strip mid-side, a small 3-window button panel ahead of it, handles at each hip (manual: "Spot has a handle at each hip joint").
- Underside: longitudinal belly skid rail + battery door panel.
- The yellow: real Spot is yellow+black, but the Anatomy kit is ink/paper monochrome — keep kit tones (colour is not the subject here); recognisability must come from FORM.

## Signature roll-call (v2 must have ALL, count them in BUILD_NOTES)
1. Spot Arm complete (turret, shoulder housing, upper link, elbow, cylindrical forearm, wrist ring, 2-jaw gripper) at true link lengths
2. Front + rear recessed sensor faces w/ mesh grille + window rows
3. Hip covers (4, large, rounded, protruding)
4. Upper-leg shells (4, thick, tapered)
5. Knee vent bands (4)
6. Lower-leg bowed struts (4) + treaded foot pads (4)
7. Deck: 2 rails + 2 payload ports + front cover plate w/ screws
8. Side vent strip + 3-button panel (both sides)
9. Belly skid rail + battery panel
10. Hip handles (4)

## World / bench (keep from v1 ONLY the plumbing, redesign the look if needed)
Force pads, step block, console may stay as concepts but the ROBOT is the subject and must fill more of the frame — v1's robot was small on a big empty plate. Bring the camera/scale so Spot+Arm fill ~65% of the card. Step block: add tread grooves + side panel seams (v1's was a bare cube).
