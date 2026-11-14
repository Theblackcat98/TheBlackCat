---
title: "Helicopter Swashplate & Rotor Hub"
description: "A helicopter swashplate and rotor hub as an interactive Three.js figure: three 120° CCPM servos, a two-part swashplate and pitch links feathering three blades over a cutaway 4:1 bevel gearbox. Drag the swashplate, cyclic stick or collective lever and watch the blades answer."
contenttype: article
tool: helicopter-swashplate
topics:
  - design
tags:
  - threejs
  - isometric
  - creative-coding
  - simulation
created: 2026-11-13
updated: 2026-11-13
---

## What it is

The control head of a small helicopter, built as a working rig: the pilot's collective and cyclic commands travel through servos and a swashplate to become blade pitch — all three blades feathering together for lift, or one at a time around the revolution for tilt.

## What was drawn

- **The two-part swashplate**: a stationary lower ring riding on a uniball, a bearing-mounted rotating upper ring that turns with the mast, anti-rotation scissors to keep the lower ring honest, and three pitch links rising to the blade pitch horns.

- The rotor: three articulated blades on a three-arm hub yoke — flapping hinges, feathering cuffs and cambered airfoil sections under a domed brass mast cap — with a GLSL swept rotor-disc blur that follows the blades' coning.
- The drive: a cutaway gearbox housing with a 4:1 bevel gear pair and input shaft from the electric drive motor on its pedestal beside the bedplate.
- The control runs: three CCPM servo actuators at 120° with pushrods, Bowden conduits routed across the apron from the two-axis cyclic gimbal stick and the collective quadrant lever, and a semicircular Blade 1 pitch protractor whose needle tracks the first blade.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Parts are real solid meshes in a four-tone cel shading with ink crease lines. Drag the swashplate, cyclic stick or collective lever directly in 3D, or use the COLL, PITCH, ROLL and RPM sliders — set RPM to 0 and the feathering can be inspected blade by blade. Drag to orbit, right-drag to pan, scroll to zoom, Shift+drag cranks the rotor by hand, and the theme pills switch between Light, Paper, Dark, Blueprint and Sepia.
