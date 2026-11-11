---
title: "Chichén Itzá — El Castillo"
description: "El Castillo at Chichén Itzá drawn as an axonometric on drafting paper: a nine-terrace stepped pyramid with four stairways — ninety-one steps each in the real stone, 365 with the platform — a temple on top, and serpent heads at the foot of the northern balustrades."
contenttype: article
tool: chichen-itza
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

The Temple of Kukulcán is a calendar built as a pyramid: nine terraces for the levels of the underworld, four stairways for the four directions, and ninety-one steps up each one — 4 × 91 plus the summit platform makes 365. The drawing is built around those numbers; they are the reason the building exists.

## What was drawn

- Nine terraces, each drawn as the real construction reads: a battered talud slope, a recessed ledge, and a vertical tablero panel with its inset rectangle — the stepped silhouette carried by bold corner profiles.
- Four stairways, one centred on each face, as stepped ramps with sloped balustrade slabs (the drawn flights are representative; the file's own notes record the real 91 per face).
- Serpent heads at the foot of both northern balustrades — skull block, thrust lower jaw, dark mouth — the heads the equinox shadow-body climbs to.
- The summit temple: a rectangular block under a flat overhanging roof slab, a dark doorway per face, the northern doorway wider and split by two columns. Pale Yucatán limestone throughout, low scrub on the plaza instead of shrubs.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.
