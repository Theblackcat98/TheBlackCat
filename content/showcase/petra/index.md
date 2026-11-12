---
title: "Petra — Al-Khazneh (The Treasury)"
description: "Al-Khazneh at Petra drawn inside a geological Nubian sandstone canyon block: the two-storey Treasury carved into living rock beside the winding Al-Siq gorge, exposed Cambrian strata along all four cutaway faces, and desert scrub."
contenttype: article
tool: petra
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

The Treasury at Petra, drawn inside the mountain canyon that holds it: a classical temple facade cut out of living Nubian sandstone where the winding narrow *Siq* gorge opens onto the sandy wadi forecourt.

## What was drawn

- **Nubian sandstone canyon block**: banded rose, ochre, violet, and Um Ishrin sandstone strata carried around all four vertical cutaway faces with topographic plateau contours, the winding Al-Siq gorge approach with caravan trail ticks, sandy wadi floor, and desert scrub.

- The cliff first: seven sandstone strata in rose, ochre, rust and violet, each band's face set at a slightly different depth, with weathering cracks running down the exposed rock and a broken, stepped crest.
- The lower order: six Corinthian columns with a wider central gap for the doorway, the tall door itself in deep shadow, and the Dioscuri relief figures standing between the outer columns.
- The upper order: a pediment broken in the middle, eagles on its outer corners, Amazons in niches, and the round tholos standing in the break — its own ring of small columns, a conical roof, and the urn on top that Bedouin marksmen once shot at, hunting the pharaoh's treasure inside.
- The setting: canyon spurs stepping forward on both flanks, the dark wandering slit of the Siq in the right-hand spur, small tomb niches carved high in the cliff faces, and two visitors on the forecourt for scale against the facade.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.
