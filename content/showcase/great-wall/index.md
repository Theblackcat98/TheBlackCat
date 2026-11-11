---
title: "Great Wall of China"
description: "A Ming-dynasty section of the Great Wall drawn as an axonometric on drafting paper: a two-storey watchtower where the wall turns on the ridge, crenellated parapets on both sides, the walk stepped down the grades, and a beacon terrace on the spur behind."
contenttype: article
tool: great-wall
topics:
  - design
tags:
  - svg
  - isometric
  - creative-coding
  - architecture
created: 2026-11-11
updated: 2026-11-11
---

## What it is

The Ming wall doing the thing it is famous for: not crossing the landscape but riding it, pinned to a ridgeline and following every turn and drop of the ground. The drawing takes one section at the point where the wall changes direction on the ridge — the natural place for a watchtower — and lets it fall away down both grades until it leaves the sheet.

## What was drawn

- The watchtower at the turn: a battered stone podium carrying two brick storeys, arched openings on every face, walk-level door arches where the wall passes through, and an overhanging tiled hip roof with its ridge beam and end ornaments.
- The wall itself as the Ming built it — coursed stone below, a grey-brick band above, crenellated parapets with individual merlons on both sides, and a genuinely stepped walk (treads and risers, not a ramp) wherever the ridge grade steepens.
- A beacon terrace on a spur knob behind the wall: tapered stone platform, low parapet ring, and a brazier with crossed fuel and a faint thread of smoke.
- The ridge as stratified rock in bands, with fall-line hatching, and ink pines — trunk plus tiered canopy fans — scattered over the slopes instead of the usual shrubs.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.
