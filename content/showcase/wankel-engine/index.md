---
title: "Wankel Rotary Engine"
description: "A Wankel rotary engine as an interactive Three.js figure: a triangular apex-sealed rotor orbiting an epitrochoid housing on a 34:51 phasing gearset, with a cutaway cover ring, dual spark plugs, a chamber-pressure gauge and the four-stroke cycle shaded inside the chambers."
contenttype: article
tool: wankel-engine
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

A Mazda 13B-style Wankel rotary engine on an instrument bench: one triangular rotor turning inside a two-lobe epitrochoid housing, so each of its three faces runs a full four-stroke cycle — intake, compression, ignition, exhaust — once per revolution of the rotor.

## What was drawn

- **The epitrochoid stator housing**: cooling-fin loops around its perimeter, an intake manifold on the upper-left lobe, an exhaust manifold below it, perimeter tie rods with front hex nuts, and dual leading and trailing spark plugs fed by routed cables from the ignition coil pack.

- The rotor: a triangular casting with a 51-tooth internal phasing gear, three apex seal blades with corner seal pins and side-seal arcs, turning on the eccentric output shaft with its counterweights and timing pulley — locked by the fixed 34-tooth reaction gear to exactly one third of shaft speed.
- The cutaway: the front cover ring is sliced away to expose the rotor, and a section slider slides the cutting plane through stator and endplates; an exploded view separates housing, rotor and shaft along the axis.
- The bench: a heavy instrument bedplate with turned corner feet, a brass specification plaque (13B · R 105 · e 15 · 34:51), a ruler strip, a throttle knob, and a Bourdon chamber-pressure gauge on a capillary tube whose needle tracks the shaded cycle.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Parts are real solid meshes in a four-tone cel shading with ink crease lines, and a GLSL shader colours the gas inside each working chamber through its stroke. Drag to orbit, right-drag to pan, scroll to zoom; Shift+drag cranks the shaft by hand, E blows the engine apart and R returns to the isometric view. RPM sets the shaft speed, SECT slides the cutaway plane, and the theme pills switch between Light, Paper, Dark, Blueprint and Sepia.
