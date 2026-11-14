---
title: "Shuttle RS-25 Main Engine"
description: "The Shuttle RS-25 main engine as an interactive Three.js figure on a static-fire gantry: powerhead, twin high-pressure turbopumps and a regeneratively cooled 77.5:1 bell on a ±10.5° TVC gimbal. Drag the nozzle, throttle quadrant or TVC stick from 67% to 109% power."
contenttype: article
tool: rs25-engine
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

The RS-25 — the Space Shuttle's main engine, still flying on SLS — mounted in a static-fire test stand: a staged-combustion cycle engine whose whole powerhead exists to feed one combustion chamber at 20.6 MPa, and whose bell steers the vehicle by gimbaling ±10.5° on two axes.

## What was drawn

- **The powerhead**: hot-gas manifold with twin lateral transfer ducts and front-mounted oxidizer and preburner control valves, feeding the fuel-rich preburners that drive the turbopumps.

- The twin high-pressure turbopumps — fuel (HPFTP) and oxidizer (HPOTP) — with cutaway windows, spinning in their true 35,130 : 28,120 rpm ratio, flanking the main injector plate with its coaxial swirl elements.
- The chamber and bell: a NARloy-Z-lined main combustion chamber with its coolant manifold ring, and the 77.5:1 regeneratively cooled nozzle with stiffening hatbands, exit coolant manifold, LH₂ downcomer pipes and a plume shader showing Mach shock diamonds.
- The test stand: an instrument bedplate and gantry — twin columns, crossbeam and cantilever thrust beams meeting at the gimbal thrust ring with its two-axis cross bearing — plus pitch and yaw hydraulic TVC actuators, cryogenic LH₂ and LOX supply plumbing, a chamber-pressure dial gauge on its sense line, a notched throttle quadrant, a two-axis TVC stick and a gimbal deflection protractor.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Parts are real solid meshes in a four-tone cel shading with ink crease lines. Drag the nozzle, throttle quadrant or TVC stick directly in 3D, or use the sliders: THR runs the power level from 67% to 109% RPL, PITCH and YAW deflect the gimbal, PUMP sets the turbopump spin and SECT slices the section plane through powerhead, chamber and bell. Drag to orbit, right-drag to pan, scroll to zoom, Shift+drag cranks by hand, and the theme pills switch between Light, Paper, Dark, Blueprint and Sepia.
