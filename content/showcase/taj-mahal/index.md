---
title: "Taj Mahal"
description: "The Taj Mahal drawn as an axonometric on drafting paper: white marble on the charbagh axis — the great onion dome over a chamfered block of iwans, four minarets leaning a degree outward, and the reflecting channel running down the garden to the gate."
contenttype: article
tool: taj-mahal
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

The tomb Shah Jahan built for Mumtaz Mahal, drawn on its garden axis so the famous symmetry does the compositional work: plinth, mausoleum, dome, four minarets, and the charbagh running away in front with the mosque and its mirror jawab in red sandstone at the sides.

## What was drawn

- The mausoleum block with chamfered corners: a large central iwan on each face — a framed arch bay with a teal jali screen set into the recess — flanked by two-storey niche bays that wrap around the chamfers, with slender guldasta pinnacles standing along the roofline.
- The great dome as a bulbous profile lofted on its ringed drum: swelling past the drum, an inverted lotus collar at the neck, and a tall finial. Four chhatris sit at the roof corners, each a miniature of the same drum-and-dome idea.
- Four freestanding minarets at the plinth corners, built as stacked drums with balcony rings and chhatri caps on octagonal bases — each tilted 1.4° outward, as built, so that a falling minaret would fall clear of the tomb. The tilt runs through every course and ring, not just the silhouette.
- The charbagh: the raised reflecting channel on the axis with its fountain ticks, the central marble tank, double-bordered parterre beds, and a cypress avenue. At the terrace's flanks, the mosque and its mirror jawab modelled in red sandstone — pishtaq toward the tomb, three white marble domes each — where the first build of this plate left blank blocks.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.
