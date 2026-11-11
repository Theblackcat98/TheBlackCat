---
title: "Machu Picchu"
description: "Machu Picchu drawn as an axonometric on drafting paper: the citadel on its ridge saddle — ten agricultural terrace courses, rows of gabled dry-stone houses with trapezoidal doorways, the curved Temple of the Sun, the Intihuatana stone, and Huayna Picchu standing behind."
contenttype: article
tool: machu-picchu
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

The Inca citadel on the saddle between two peaks: a working landscape of agricultural terraces holding up a small stone town. The drawing keeps the site's real organisation — terraces on the flank, houses and temples on the flatter crest, and Huayna Picchu standing behind everything as backdrop, drawn pale so the town stays the subject.

## What was drawn

- Ten terrace courses (andenes) stepping down the front flank, grass treads behind granite retaining walls with fine course lines, plus a second run wrapping the slope below the sacred sector.
- The urban sector: rows of dry-stone houses with steep thatched gables, two left as roofless ruins, every doorway trapezoidal — wider at the base than at the lintel, the signature Inca detail.
- The Torreón, the Temple of the Sun: a battered semicircular wall with fine ashlar courses and one trapezoidal window, and beside the high point the Intihuatana, a carved stone post on its three-step pyramid.
- The Temple of the Three Windows as a long granite wall with three trapezoidal openings, and Huayna Picchu behind as a stepped, faceted crag in the palest wash on the sheet.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.
