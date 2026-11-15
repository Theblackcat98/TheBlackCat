---
title: "Anatomy in Three.js"
description: "Six machines as interactive Three.js figures: a Wankel rotary engine, a helicopter swashplate and rotor hub, a Shuttle RS-25 main engine, a twin-turbo flat-six boxer, a Porsche M64/60 twin-turbo flat-six and a sailing yacht winch and rigging — cutaway solid models on test rigs, with section planes, exploded views and hand cranks."
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

Tools are things that run. This is the other half of the workshop: artifacts built to be looked at. The [Anatomy](/anatomy/) set draws its machines as isometric SVG, where the projection is the drawing and the camera never moves. This set asks what the same idea looks like in real 3D: six machines modelled as solid meshes in Three.js, still sitting on test rigs with the mechanism live underneath — but now you can orbit them, slide a section plane through them and pull them apart. The whole set lives at [Anatomy in Three.js](/anatomy-threejs/).

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

## The twin-turbo flat-six boxer

A flat-six boxer engine on a dynamometer bench: two opposed banks of three cylinders lying flat either side of the crankshaft, so opposing pistons mirror in and out together and cancel each other's shake — the layout Porsche and Subaru built their names on, here with a turbocharger on each bank.

The crankshaft carries three throw pairs at 120°, and the firing order runs 1-6-2-4-3-5, one power stroke every 120° of crank rotation. The twin turbochargers sit aft and outboard of the banks, their compressor and turbine wheels spinning up with boost, while a shader shades each cylinder's charge through its four strokes and heats the exhaust headers toward incandescence as load rises — fire the ANTILAG trigger and a spool pulse spikes the boost and lights the headers at low rpm. On the bench sit a brass specification plaque, a ruler strip, a throttle lever and a boost dial, and a diegetic dyno screen reading rpm, boost pressure, exhaust temperature and horsepower.

Drag the throttle lever, boost dial or front crank pulley directly in 3D, or use the sliders: RPM runs to 7,200, THROT opens the throttles and BOOST sets the target boost from 0.4 to 2.0 bar. Shift+drag cranks by hand, E blows the engine apart and SECT slices it along the crankshaft.

[Open the full figure](/anatomy-threejs/flat-six-boxer/)

## The Porsche M64/60

The Porsche Type M64/60 — the twin-turbo flat-six of the 993-generation 911 Turbo — on a dyno cradle: the last of Porsche's air-cooled engines, drawn with the hardware that defines it.

The cranktrain is built to the engine's real dimensions: 100.0 mm bore × 76.4 mm stroke, six throws with the opposing pairs (1,4), (2,5) and (3,6) sharing TDC at 0°, 240° and 120°, firing 1-6-2-4-3-5. Air cooling means the 11-blade fan on top, belt-driven at 1.62 times crank speed, with the charge-air intercooler mounted above it. Twin KKK K16 turbochargers sit under the banks at the rear, one for each bank, with dual wastegates; the controls run a 74 mm central throttle plate and Bosch Motronic M5.2 ignition advance against a 6,800 rpm redline, and the triggers fire a 1.1 bar overboost surge or dump both wastegates. A diegetic screen on the cradle carries the telemetry. There is no exploded view — the section plane does the opening instead.

Drag the crank pulley, cooling fan, pistons or boost dial directly in 3D, or use the RPM, BOOST, THROTTLE and IGN ADV sliders. SECT slices longitudinally through fan, cylinders, crankcase and intercooler, and Shift+drag cranks by hand.

[Open the full figure](/anatomy-threejs/m64-twin-turbo/)

## The yacht winch and rigging

A sailing yacht cut through as a deck section: mast, boom and standing rigging above the deck, and on the cockpit coaming the hero of the piece — a two-speed self-tailing winch whose planetary gearbox is the whole explanation.

The winch's gears are exact involute pitch math: a 12-tooth sun, 15-tooth planets and a 42-tooth ring gear, and 12 + 2 × 15 = 42, so the planets mesh. Crank the handle clockwise and a ratchet locks carrier and drum together for 1:1 direct drive; reverse to counter-clockwise and the base ratchet holds the carrier still, the planets walk inside the ring, and the drum turns at 3.5:1 for power. Around it the rig is alive: forestay and backstay, shrouds led over a spreader, a mainsail whose camber deepens as the wind rises, and a traveler car that follows the sheet trim — the readouts give apparent wind in knots and windward shroud and sheet loads in kilonewtons, and the GUST trigger adds 14 knots and spikes them all.

Drag the winch handle, boom or wind vane directly in 3D, or use the CRANK, WIND and SHEET sliders. E explodes the winch's planetary stack and SECT slices through winch housing, coaming and mast partner.

[Open the full figure](/anatomy-threejs/yacht-winch-rigging/)

## How they are built

Every figure is a single self-contained HTML file. The only library is Three.js, vendored on this site under `static/vendor/three/`, so a figure makes no network calls of its own and works the same embedded, standalone or saved to disk. The figures are built in the separate anatomy-threejs repository and shipped here as finished artifacts.

- The parts are real solid meshes, shaded with the same four-tone cel shading and ink crease lines as the SVG set, so the two collections read as one family.
- Interaction is written per figure, in the same file: direct dragging of the controls in 3D, sliders for speed, throttle and section depth, exploded views, and a hand crank on Shift+drag.
- Where a flat material cannot say what is happening, a GLSL shader does: the Wankel's chamber gas changes colour through its stroke, the helicopter's rotor disc blurs with coning, and the RS-25's plume shows its Mach diamonds.
- Each figure carries five drawing themes — Light, Paper, Dark, Blueprint and Sepia — on its own pills, and always opens in Light.

## What they are not

They are not engineering models. Nothing here is solved: the motion is authored so the mechanism reads correctly, the proportions are chosen for legibility, and the numbers in the readouts are illustrative. Unlike the SVG set, the camera here is yours — which is the point of building them twice. The drawing tells you what the part does; the model lets you check it from the side the drawing could not show.

What they are is a way to see a mechanism work before you commit to a paragraph about it — which is the part a static diagram cannot do.
