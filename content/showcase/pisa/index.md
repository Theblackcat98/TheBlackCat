---
title: "Leaning Tower of Pisa"
description: "An interactive ink-and-wash axonometric cutaway of the Leaning Tower of Pisa on Piazza dei Miracoli: eight masonry tiers with the curve carried cleanly through every gallery over the sunken catino basin and compressible Pancone clay strata below."
contenttype: article
tool: pisa
topics:
  - design
tags:
  - svg
  - isometric
  - creative-coding
  - architecture
created: 2026-11-11
updated: 2026-11-12
---

## What it is

The campanile of Pisa, drawn the way a mason would have wanted to see it: every tier in place, the arcades open, the gradual construction-correction curve carried through every gallery, and the Arno marine clay strata exposed right beneath Piazza dei Miracoli.

## What was drawn

- **Piazza dei Miracoli terrain cutaway**: stone courtyard walkways, the sunken circular *catino* basin, Prato greensward with Tuscan cypresses, the battlemented northern medieval city wall, ghosted Duomo apse massing, and a four-sided subsurface section exposing the dipping compressible *Pancone* clay horizon beneath the south-east leaning side.

- The ground tier is a blind arcade — fifteen engaged columns against a solid drum, with lozenge intarsia between them, because at ground level the arches are wall, not opening.
- Six open colonnades above it, each with its own cornice, its own setback and its own count of columns, so the silhouette narrows as it rises.
- The belfry at the top, smaller than the tiers below it, with the stair turret and the banner mast.
- The lean is not one angle. The spine is a table sampled every few centimetres: 5.65° for the lower tiers, easing to 3.65° in the upper galleries where the masons corrected as they went — which is why the tower reads as slightly curved rather than simply tipped.

## How it works

A single HTML file, no dependencies, no network. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.
