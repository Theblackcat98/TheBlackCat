---
title: "Five machines, drawn to be taken apart"
description: "A quadcopter on a gimbal rig, a pair of monitor speakers, a limited-slip differential, a flame-licker engine and a quadruped robot: five interactive isometric figures, running inline in this post."
date: 2026-10-27
topics:
  - design
  - tools
tags:
  - svg
  - simulation
  - design
  - web
  - creative-coding
  - vector-graphics
---

Most diagrams of a mechanism are a picture of a mechanism. They show you the parts and then stop, because a picture cannot answer the question you actually have: what happens when this moves.

These five figures answer it. Each one is a machine drawn in isometric SVG, sitting on a test rig, with the mechanism live underneath. They run below in this page: no plugin, no install, and no request to anyone else's server. Each is also a standalone file if you would rather have it full width: the whole set lives at [Anatomy](/anatomy/).

## How a quadcopter flies

A quadcopter has no control surfaces. It steers by changing the speed of four fixed rotors, and it yaws by letting the motors fight each other: two spin one way, two the other, and the reaction torque does the turning. The figure puts a class 450 airframe on a two-axis gimbal rig with a universal joint and a load-cell sensor, so the airframe can tilt without leaving the bench. The transmitter is the control: throttle, pitch, roll, and the yaw reaction torques.

{{< anatomy slug="drone" title="How a quadcopter flies" height="884" >}}

Raise the throttle and watch the load cell; the four rotor columns are the only thing holding the airframe up. Then pitch forward and see what the rig has to absorb to keep the frame from simply leaving.

## Bookshelf speakers: dome against AMT

A dome tweeter moves a small stiff diaphragm with a voice coil. An air-motion transformer folds a pleated diaphragm and squeezes air out of the folds, so it couples to the room differently at the same drive level. The difference is easiest to hear as a difference in dispersion rather than in output.

The figure sets a pair of reference monitors on a slate inspection bench, with an acoustic probe on a traverse, a laser interferometry beam reading diaphragm travel, and a frequency generator sweeping the pair.

{{< anatomy slug="bookshelf-speaker" title="Bookshelf speakers: dome against AMT" height="846" >}}

Sweep the generator through the crossover region and watch the two drivers hand over. The probe trace and the laser trace disagree in exactly the way the two motor designs differ.

## A differential that refuses to spin one wheel

An open differential always sends torque to the wheel with less grip, which is why a car with one wheel on ice goes nowhere. A limited-slip differential biases torque back towards the wheel that can use it, and there are two common ways to do it: a clutch pack loaded by preload and by the separation forces of the side gears, or a set of worm gears that resist being driven backwards.

The figure is a bench dynamometer with twin roller dynos and a cross-shaft drive, plus a cutaway carrier you can look inside.

{{< anatomy slug="limited-slip-differential" title="Limited-slip differential: clutch against Torsen" height="861" >}}

Run the four scenarios — dry, cornering, ice, coast — and compare the two carriers under the same load. The clutch pack answers preload; the Torsen answers the ratio between the two output speeds, which is why it behaves differently on a coast.

## The flame-licker engine

A flame-licker engine has no boiler and no compressed air. A spirit lamp heats the outside of a brass cylinder; the flame consumes the oxygen inside, a partial vacuum forms, and atmospheric pressure pushes the piston in. A slide valve then opens the cylinder to fresh air, the pressure equalises, and the flywheel carries the piston back out for the next cycle.

{{< anatomy slug="flame-licker" title="Flame-licker engine" height="1034" >}}

The flywheel is not decoration. It is the only thing that gets the engine through the part of the cycle where the cylinder is doing no work at all.

## FELIS-09, and where the weight goes

A robot standing still is a statics problem, and a quadruped is an awkward one: the mass sits high, the feet are four small points, and anything that moves up top has to be paid for down below. FELIS-09 is a 9.2 kg machine — about 22.6 N on each foot at rest — standing on four strain-gauge load cells, with the readings fed to a bench console.

The optical collimator runs along a front rail and commands up to ±26° of gaze yaw. Move it and the centre of mass moves with it, so the five-link, 0.88 kg tail sweeps the other way to cancel the lateral drift while the bar meters show which feet take the difference. Crouching compresses the dorsal suspension up to 38 mm against the 80:1 harmonic-drive knees, and the dial reads the peak joint torque that the stance is asking for.

{{< anatomy slug="robotic-cat" title="FELIS-09 robotic cat" height="938" >}}

Hover the rail and watch the load pads trade force between the front feet. Then crouch and watch all four climb at once — the tail can cancel a drift, but it cannot take weight off the ground.

## How they are built

Every figure is generated by a small build script into a single self-contained HTML file: the SVG, the stylesheet and the interaction script are all inlined. There is no framework, no font request, no CDN, and no `fetch` at runtime. That is why the same file works embedded in this page and opened on its own.

- The geometry comes from an isometric drawing kit: solids, lathes, tubes and turned parts, each projected to a fixed camera and shaded with four tones so the painter's order reads correctly.
- Interaction is written per figure, in the same file, against the SVG it just drew.
- Each figure is built twice — a dark build and a light build — and the embed picks the one that matches the theme you are reading in.
- The build needs that drawing kit, which lives outside this repository, so the shipped HTML is the artefact. The source and the screenshots ship beside it under `static/anatomy/src/`.

## What they are not

They are not engineering models. Nothing here is solved: the motion is authored so the mechanism reads correctly, the proportions are chosen for legibility, and the numbers in the readouts are illustrative. The camera is fixed, because the isometric projection is the drawing, and the point is what the part does rather than what it looks like from behind.

What they are is a way to see a mechanism work before you commit to a paragraph about it — which is the part a static diagram cannot do.
