# How Spot Works — Anatomy figure build notes (v2)

Draft for owner approval. Nothing posted or published. Rebuilt 2026-11-11 with the
anatomy skill at `~/workspace/custom-skills/anatomy/` (wheresryan22/anatomy @ 1482e84).
Precedents used: the skill's own shipped examples only (test-rig, raptor-engine,
dial-indicator). The TheBlackCat robotic-cat figure was disregarded entirely, per
the owner's correction.

v2 is a form/proportions rebuild after the owner's verdict on v1 ("maybe 5% there:
wrong scale/dimensions, missing the top arm, many more details missing, shapes need
improvement"). Governing documents: `LEDGER-V2.md` (anchors, Arm link lengths,
signature roll-call) and `TRUTH.md` (overridden by the ledger where they differ:
battery 605 Wh Gamma; mass with Arm 40.5 kg → ~397 N).

## Files

- `model.mjs` — pure gait model, truth constants with sources as comments
- `build.mjs` — the figure build (kit imports relative: `../custom-skills/anatomy/`)
- `live.js` — interaction/motion layer (tour, drag, keys, readout)
- `spot.css` — stage cursor/focus + console screen/bar styling
- `spot.html` (dark), `spot-light.html` — built pages (`node build.mjs [--light]`)
- `shots/v2-*.png` — verification captures (versioned; v1 shots kept alongside)

## Scale and proportions

World scale 1 unit = 10 mm. Official anchors (LEDGER-V2): total footprint
1100 × 500 mm incl. leg splay; standing height 840; default walking body height
610 mm (control range 520–700); 12 leg DoF; Spot Arm 6 DoF + gripper, 8 kg,
links 338.50 / 403.30 / 117.45 / 124.82 mm summing to the 984 mm full extension.

DERIVED (pixel-measured by the builder from BD's elevations in `research/`):

- Side elevation (`sideview.png`, 2075×1424): upper-leg silhouettes measure
  679–721 px, lower-leg 673–702 px → the two links are equal within ~3% in the
  drawing's stretched pose. Combined with the ledger anchors: **upper link
  400 mm, lower link 420 mm**.
- Front elevation (`frontview.png`, 1218×1300): the recessed face panel measures
  ≈0.41 of the robot's width → ≈205 mm; the chassis face ≈0.58 → ≈290 mm.
  Used: face housing 212 mm wide, **chassis face width 280 mm**.
- **Chassis length 760 mm** (0.69 of the 1100 total; the rest is leg splay),
  hip pivots at ±290 mm, **body thickness 225 mm** (deck top to belly),
  foot pad 70 × 40 mm.
- Front and rear leg planes are offset in width (front pair inboard, rear pair
  outboard, as in BD's front elevation) so the leg blades pass side by side.

Model anchors: body height is clamped to 520–700 with the 610 default (the
readout idles at 610 standing, ~99 N per foot); foot forces sum to 397.3 N
(40.5 kg with Arm), swing feet 0 N, diagonal trot pairs FL+RR / FR+RL.
The recorded build pose is standing; the live layer tours the trot.

## What v2 fixed (the v1 faults)

1. Chassis slab 1100 → 760; stick legs → dominant shaped legs (below).
2. Spot Arm added complete at the true link lengths, raised working pose,
   turret on the front payload port, gripper open over the front face.
3. Tiny round eyes → one large recessed sensor face per end: housing,
   recessed panel, central dot-mesh grille, 3 sensor windows per side.
4. Wheel-like hip discs → large rounded hip covers (stepped-disc housings
   flush on the chassis side faces) reaching the full 500 mm width.
5. Robot reframed: Spot + Arm now spans ~50% of the bench-plate width and
   the full height of the scene (v1 sat small on an empty plate).
6. Step block: panel seams + tread plate with grooves, screws, ruler strip.
7. Readout/model re-anchored: 610 mm default height, 397 N total force.

## Shapes (per the owner's "shapes need improvement")

- Upper legs: thick tapered blade prisms (108 mm wide at the hip, rounded
  point at the knee) with a vented band + vent dots at the bottom end.
- Lower legs: slender bowed blade prisms (bow built into the polygon),
  knee and ankle balls, flared treaded foot pads (70 × 40, 3 tread lines).
- Hip covers: 5 stepped discs per hip = a rounded housing; a handle strap
  arcs over each cover (manual: a handle at each hip joint).
- Arm: ribbed shoulder drum, tapered upper link (lathe solid), elbow drum,
  forearm as a smooth lathe cylinder with moulded slot lines, knurled wrist
  rings, gripper = pivot drum + two flat opposing jaws + camera window.
- Deck: 2 payload rails, 2 port plates, front cover plate with 4 screws
  (flat, between the rails), IMU hump, E-stop, status lamp.
- Sides: long vent strip with dot mesh, 3-window button panel, round side
  depth camera — both sides. Belly: battery pan, battery door, skid rail.

## Counts

- **58 items · 159 recorded solids · 1 tube** (audit output).
- Legs: 4 assemblies, each = 5 cover discs + handle strap + upper shell +
  vent band + knee ball + lower strut + ankle ball + foot pad (12 shapes).

## Signature roll-call (LEDGER-V2) — 10/10

1. ✅ Spot Arm complete at true link lengths (338.5/403.3/117.45/124.82)
2. ✅ Front + rear recessed sensor faces, grille + 3 windows per side
3. ✅ Hip covers ×4, large, rounded, protruding (full 500 mm width)
4. ✅ Upper-leg shells ×4, thick and tapered
5. ✅ Knee vent bands ×4 (with vent dots on the near side)
6. ✅ Lower-leg bowed struts ×4 + treaded foot pads ×4
7. ✅ Deck: 2 rails + 2 ports + front cover plate with 4 screws
8. ✅ Side vent strip + 3-button panel, both sides (+ side cameras)
9. ✅ Belly skid rail + battery door panel (underside; built, not visible
   from the camera elevation)
10. ✅ Hip handles ×4, strapped over the covers

## Verification (all run on the final build)

- `node build.mjs --audit` → **audit passed**: clearance 0, terminals 0,
  loose ends 0, screen folds 0, support 0 unsupported / 0 sunk, depth
  order 0, stand-in shapes 0, crowding 0. Geometry fixes only.
- Line check, both themes → **line ends: 0 of 205 ends**, console clean.
- Captures (all read at 1×, zooms at 4×): `shots/v2-light-desktop.png`,
  `v2-dark-desktop.png`, `v2-light-phone.png`, `v2-dark-phone.png`,
  `v2-zoom-arm.png`, `v2-zoom-face.png`, `v2-zoom-hipknee.png`,
  `v2-zoom-foot.png`, line overlays `v2-lines-{dark,light}.png` (no rings).
- Two bugs found by the checks and fixed during the rebuild: `G.pointOf`
  is polar (s, r, angle) — the face grille, knee vent dots and foot tread
  lines now use a Cartesian frame helper; and the live page's serialized
  `legFrames` needed its `G.` prefixes stripped like `legSvg`.

## Ratio comparison vs BD's drawings (honest verdicts)

- **Chassis fraction of total length**: mine 760/1100 = 0.69; BD side
  elevation ≈0.68–0.72. ✅ Match.
- **Leg-to-body ratio**: links 400 + 420 mm against a 225 mm body — the
  legs dominate the silhouette in both the render and `spotanatomy.png`.
  ✅ Match (this was v1's worst miss).
- **Arm presence/proportion**: present, links sum to the true 984 mm;
  forearm is the fattest link, as in `arm-diagram-02/03`. ✅ Match.
- **Face panel**: housing 212 mm wide × 192 tall vs ≈205 mm measured from
  BD's front elevation; grille + window columns land like the drawing.
  ✅ Match.
- **Hip width**: covers reach |y| = 251 mm → 502 mm ≈ the 500 total. ✅
- **Frame fill**: Spot + Arm ≈50% of plate width, full scene height.
  Improved decisively over v1 but short of the 65% aspiration — the frame
  must contain the whole bench (console, step, target). ⚠️ Partial.

## Remaining weak spots (honest)

- Hip covers are stepped discs, not BD's smooth sculptural dome; at 4× the
  steps read as machining bands rather than a moulded cover.
- The deck cover plate is flat between the rails; BD's is a full-width
  plate sloping down over the front deck edge.
- Lower legs are single bowed struts. BD's side drawing shows a twin-strut
  lattice (partly drafting style); the real robot's lower leg is a single
  strut, so this is defensible, but the drawing's look is richer.
- Feet are flat treaded pads; BD's foot is a rounded, tread-wrapped ball.
- Face grille is a square dot grid, not BD's hex mesh.
- Side detail placement is approximate: BD puts the button pod mid-body
  above a long tapered mesh band; mine sits forward of a straight vent.
- During the live trot the near knees pass close under the body (planes
  offset 20 mm front/rear keeps them clear); the audit verifies the
  standing build pose, not animation extremes.
- Dark theme is the kit's light-ink-on-black line style: legible in the
  captures, but the bench plate's fills go near-black.

---

# V3 pass (2026-11-11) — shapes, density, pose

Full v3 work list executed. Counts: **59 items · 196 solids · 1 tube**
(v2: 58 items · 159 solids).

## Verification (final build)

- `node build.mjs --audit` → **passed, every category 0** (clearance,
  terminals, loose ends, screen folds, support 0 unsupported / 0 sunk,
  depth order 0, through-in-mid-flight, self-overlap, wobble, saddles,
  stand-ins, crowding). 202 overlaps · 202 order rules.
- Line check, both themes: **0 of 269 ends on 67 lines float**,
  console clean on every capture.
- Opening-frame readout: `0.9 m/s · FL242 FR0 RL0 RR151 N · 604mm · grip 112`
  — forces sum 393 N (≈ the 397 N of the 40.5 kg all-in mass; per-leg
  rounding), swing legs exactly 0 N, gripper aperture live from the model.
- Captures (opening phase, --reduced, versioned): v3-dark-desktop,
  v3-light-desktop, v3-dark-phone, v3-light-phone, v3-zoom-arm,
  v3-zoom-hipknee, v3-zoom-face, v3-zoom-foot.

## Per-item verdicts (judged from the PNGs, not the code)

1. **Upper-leg shells — FIXED.** Smooth Catmull-Rom outline, five lateral
   slices falling off toward the faces: at 4× (zoom-hipknee) the shells are
   broad rounded blades with no pencil faceting; slice boundaries read as
   moulded contour lines.
2. **Feet — FIXED.** Rounded ball pad (70×40 per ledger) on a ball ankle;
   tread ribs wrap the front/bottom curve (zoom-foot). Foot sits flat and
   centred on its pad's top disc.
3. **Gripper — FIXED, after two iterations.** First v3 build still read
   tweezer-thin at 4×; fingers were then deepened (~26 mm root section)
   and given a two-section profile — deep root link, knuckle step, thinner
   distal link — with inner pads hugging the edge, pin caps outboard of
   the faces, 4K camera window centred between the roots, ToF and LED on
   the head face. At 1× it reads as a small open gripper with substance;
   at 4× (zoom-arm) the two-link finger is clear. Length is ledger-true
   (pivot→tip 124.8 mm), so the fingers stay long and tapered — that is
   the real tool, not a proportion error.
4. **Knees — FIXED.** Hinge drum integrated at the shell end (vent dot
   ring on its face); the lower leg starts at the drum centre and emerges
   centred — no off-centre pin-on-disc look (zoom-hipknee).
5. **Hip covers — FIXED.** One smooth lathe dome per hip (profile of ten
   points, base flush at |y| 14.3, reaching |y| 25.25 ≈ the 500 mm total
   width). Stepped discs and hex knobs gone.
6. **Lower legs — FIXED.** Bowed blade, three lateral slices, real width;
   bow displaces mid-blade toward world −x (rear) for every leg, chosen
   from the frame geometry per BD's side elevation. At 4× the blade edges
   run long and straight between spine samples — structured, not wire,
   but not perfectly organic either. Accepted.
7. **Arm surface detail — FIXED.** Forearm: two slot windows built as
   solid insets tangent to the shell, panel seam rings, end rings, root
   flare; shoulder drum carries cooling-ring arcs; elbow is a proper
   housing drum (zoom-arm).
8. **Chassis sides — FIXED.** Vent is a dense staggered dot-mesh band on
   both sides; a slotted under-hip vent plate sits under each hip (BD
   front elevation); 3-button panel kept.
9. **Face panels — FIXED.** Flatter housing, recessed panel, denser
   staggered grille, windows in the true 3-and-3 flanking arrangement
   (one tall + two small per side) — zoom-face is the cleanest panel on
   the figure.
10. **Hip handles — FIXED.** Flat bar on two feet standing on the dome,
    following the deck line; reads as a handle at 1× and 4×, no arch.
11. **Opening frame — FIXED.** Figure opens at phase 0.275: FL+RR stance
    feet flat and centred on their force pads, FR+RL swing feet visibly
    lifted (RL hovers toe-down over its own pad in the desktop shot).
    Stance narrowed: feet at |y| 17.9 front / 22.5 rear.
12. **Feet track pads — FIXED.** Pads re-centred under the stance sweep
    (centre = hip x, foot y per leg); the stance foot stays on its cell
    through the cycle instead of landing beside a standing-pose pad.
13. **Gripper cycle — FIXED.** Pure model function of phase: aperture
    75 ± 42 mm over six gait cycles (range 33–117, inside 0–175); only
    the fingers move, redrawn from the same serialized gripperSvg.
14. **Idle height — FIXED.** Tour/body height is the 610 default exactly
    (the v2 parked-at-~655 offset is gone). The opening readout shows
    604mm: that is the model's ±6 mm trot bounce on top of the 610 set
    height at phase 0.275, not a park offset.
15. **Bench — FIXED.** Plate shrunk and rearranged: step block's front
    face 165 mm ahead of the robot's face, target rail alongside it,
    console still readable, ruler strip on the tread and along the bench,
    far less empty foreground than v2.
16. **Readout/caption — FIXED.** Readout carries `grip <mm>` from the
    same pure model (112 mm at the opening frame); caption describes the
    Arm and its cycling gripper. Extra fix found by the phone capture:
    the v3 readout was ~10 chars too wide for the phone-width card and
    clipped off its left edge — format tightened (phase % dropped,
    speed trimmed, grip unit dropped) and the phone shot now fits the
    full string inside the card.

## What the audit fight actually was (for the next builder)

- The foot frame's v axis pointed DOWN in the first v3 build (axis
  [0,1,0] with that u gives v = −z): feet rendered through their pads
  and the whole robot failed support. Axis [0,−1,0] fixed it.
- At the trot exchange the two knees on a side pass ~41 mm apart
  (3D distance 4.15 units): the knee drums interpenetrated until the
  leg planes were separated (front knees |y| 18.1, rear 22.7) and the
  drums thinned to ±2.4. The shells now lie in the knee's lateral plane.
- The gripper pin caps, as arm-item geometry, interleaved with the
  finger roots on screen and no painter order could sort the pair
  (2.69 px² cycle). They now live in the gripper item with the fingers.
- Side cameras needed a mounting boss embedded 0.45 into the body slab
  to register support at their new position (36.5, 62).

## Remaining honest caveats

- Frame fill is still ~50–55%, not the 65% aspiration — the bench
  (console, step, target rail) sets the frame, as in v2.
- Dark theme remains low-contrast in the mid-tones (the kit's
  light-ink-on-black style); the light theme shows the new forms
  noticeably better.
- The audit verifies the build pose (opening trot phase) plus the kit's
  uniform states; mid-cycle extremes of the live animation are drawn
  from the same pure model but are not audit-checked frame by frame.
