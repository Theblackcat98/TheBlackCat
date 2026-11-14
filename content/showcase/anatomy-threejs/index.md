---
title: "Anatomy in Three.js"
description: "Three machines as interactive Three.js figures: a Wankel rotary engine, a helicopter swashplate and rotor hub, and a Shuttle RS-25 main engine — cutaway solid models on test rigs, with section planes, exploded views and hand cranks."
contenttype: article
tool: anatomy-threejs
topics:
  - design
tags:
  - threejs
  - isometric
  - creative-coding
  - simulation
created: 2026-11-13
updated: 2026-11-14
---

Tools are things that run. This is the other half of the workshop: artifacts built to be looked at. The [Anatomy](/anatomy/) set draws its machines as isometric SVG, where the projection is the drawing and the camera never moves. This set asks what the same idea looks like in real 3D: three machines modelled as solid meshes in Three.js, still sitting on test rigs with the mechanism live underneath — but now you can orbit them, slide a section plane through them and pull them apart. The whole set lives at [Anatomy in Three.js](/anatomy-threejs/).

## The Wankel rotary engine

A Mazda 13B-style Wankel rotary engine on an instrument bench: one triangular rotor turning inside a two-lobe epitrochoid housing, so each of its three faces runs a full four-stroke cycle — intake, compression, ignition, exhaust — once per revolution of the rotor.

The housing carries cooling-fin loops around its perimeter, an intake manifold on the upper-left lobe, an exhaust manifold below it, perimeter tie rods with front hex nuts, and dual leading and trailing spark plugs fed by routed cables from the ignition coil pack. Inside, the rotor is a triangular casting with a 51-tooth internal phasing gear, three apex seal blades with corner seal pins and side-seal arcs, turning on the eccentric output shaft with its counterweights and timing pulley — locked by the fixed 34-tooth reaction gear to exactly one third of shaft speed. The front cover ring is sliced away to expose the rotor, a section slider slides the cutting plane through stator and endplates, and an exploded view separates housing, rotor and shaft along the axis. On the bench sit a brass specification plaque (13B · R 105 · e 15 · 34:51), a ruler strip, a throttle knob, and a Bourdon chamber-pressure gauge on a capillary tube whose needle tracks the shaded cycle, while a GLSL shader colours the gas inside each working chamber through its stroke.

Drag to orbit, right-drag to pan, scroll to zoom; Shift+drag cranks the shaft by hand, E blows the engine apart and R returns to the isometric view. RPM sets the shaft speed and SECT slides the cutaway plane.

[Open the full figure](/anatomy-threejs/wankel-engine/)

## The helicopter swashplate

The control head of a small helicopter, built as a working rig: the pilot's collective and cyclic commands travel through servos and a swashplate to become blade pitch — all three blades feathering together for lift, or one at a time around the revolution for tilt.

The swashplate is in two parts: a stationary lower ring riding on a uniball, and a bearing-mounted rotating upper ring that turns with the mast, with anti-rotation scissors to keep the lower ring honest and three pitch links rising to the blade pitch horns. Above it, three articulated blades sit on a three-arm hub yoke — flapping hinges, feathering cuffs and cambered airfoil sections under a domed brass mast cap — with a GLSL swept rotor-disc blur that follows the blades' coning. Below, a cutaway gearbox housing holds a 4:1 bevel gear pair and the input shaft from the electric drive motor on its pedestal. The control runs are three CCPM servo actuators at 120° with pushrods, Bowden conduits routed across the apron from the two-axis cyclic gimbal stick and the collective quadrant lever, and a semicircular Blade 1 pitch protractor whose needle tracks the first blade.

Drag the swashplate, cyclic stick or collective lever directly in 3D, or use the COLL, PITCH, ROLL and RPM sliders — set RPM to 0 and the feathering can be inspected blade by blade. Shift+drag cranks the rotor by hand.

[Open the full figure](/anatomy-threejs/helicopter-swashplate/)

## The RS-25 main engine

The RS-25 — the Space Shuttle's main engine, still flying on SLS — mounted in a static-fire test stand: a staged-combustion cycle engine whose whole powerhead exists to feed one combustion chamber at 20.6 MPa, and whose bell steers the vehicle by gimbaling ±10.5° on two axes.

The powerhead carries a hot-gas manifold with twin lateral transfer ducts and front-mounted oxidizer and preburner control valves, feeding the fuel-rich preburners that drive the turbopumps. The twin high-pressure turbopumps — fuel (HPFTP) and oxidizer (HPOTP) — have cutaway windows and spin in their true 35,130 : 28,120 rpm ratio, flanking the main injector plate with its coaxial swirl elements. Below them, a NARloy-Z-lined main combustion chamber with its coolant manifold ring feeds the 77.5:1 regeneratively cooled nozzle: stiffening hatbands, exit coolant manifold, LH₂ downcomer pipes and a plume shader showing Mach shock diamonds. The stand itself is an instrument bedplate and gantry — twin columns, crossbeam and cantilever thrust beams meeting at the gimbal thrust ring with its two-axis cross bearing — plus pitch and yaw hydraulic TVC actuators, cryogenic LH₂ and LOX supply plumbing, a chamber-pressure dial gauge on its sense line, a notched throttle quadrant, a two-axis TVC stick and a gimbal deflection protractor.

Drag the nozzle, throttle quadrant or TVC stick directly in 3D, or use the sliders: THR runs the power level from 67% to 109% RPL, PITCH and YAW deflect the gimbal, PUMP sets the turbopump spin and SECT slices the section plane through powerhead, chamber and bell. Shift+drag cranks by hand.

[Open the full figure](/anatomy-threejs/rs25-engine/)

## How they are built

Every figure is a single self-contained HTML file. The only library is Three.js, vendored on this site under `static/vendor/three/`, so a figure makes no network calls of its own and works the same embedded, standalone or saved to disk. The figures are built in the separate anatomy-threejs repository and shipped here as finished artifacts.

- The parts are real solid meshes, shaded with the same four-tone cel shading and ink crease lines as the SVG set, so the two collections read as one family.
- Interaction is written per figure, in the same file: direct dragging of the controls in 3D, sliders for speed, throttle and section depth, exploded views, and a hand crank on Shift+drag.
- Where a flat material cannot say what is happening, a GLSL shader does: the Wankel's chamber gas changes colour through its stroke, the helicopter's rotor disc blurs with coning, and the RS-25's plume shows its Mach diamonds.
- Each figure carries five drawing themes — Light, Paper, Dark, Blueprint and Sepia — on its own pills, and always opens in Light.

## What they are not

They are not engineering models. Nothing here is solved: the motion is authored so the mechanism reads correctly, the proportions are chosen for legibility, and the numbers in the readouts are illustrative. Unlike the SVG set, the camera here is yours — which is the point of building them twice. The drawing tells you what the part does; the model lets you check it from the side the drawing could not show.

What they are is a way to see a mechanism work before you commit to a paragraph about it — which is the part a static diagram cannot do.
