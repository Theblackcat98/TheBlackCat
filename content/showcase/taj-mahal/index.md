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

- The mausoleum block with chamfered corners: a large central iwan — pointed-arch recess in its pishtaq frame, teal inlay line, dark doorway — on each face, with two tiers of blind niches flanking it and a blind-arch frieze around the plinth.
- The great onion dome as a lofted profile on its drum, kept to a few latitude lines so it reads as a dome and not a cage, with four small chhatris at the roof corners and a lotus finial with a crescent on top.
- Four freestanding minarets at the plinth corners — three balcony rings, chhatri caps, square bases — each leaning about a degree outward, as built, so a falling minaret would fall clear of the tomb. At plate scale the lean is honest rather than visible.
- The charbagh: four lawn quadrants, cross paths, cypress pairs, and the raised reflecting channel on the axis interrupted by the octagonal tank platform at the garden's centre; the mosque and jawab in quiet red sandstone, deliberately kept below the marble in ink weight.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.
