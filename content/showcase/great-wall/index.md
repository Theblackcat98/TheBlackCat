---
title: "Great Wall of China"
description: "An interactive axonometric cutaway remake of a Ming-dynasty section of the Great Wall riding a continuous Yan Mountains ridgeline: mitered grey-brick curtain walls anchored into bedrock, stepped mountain staircases, three two-storey watchtowers, and stratified granite slopes."
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
updated: 2026-11-12
---

## What it is

A full remake of the Great Wall built atop a continuous `80 × 80` Yan Mountains topography block: instead of a flat ridge board, the granite foundation courses root directly into a winding mountain spine, dipping through misty saddles and climbing steep crags flanked by three Ming watchtowers and an outlying peak beacon tower.

## What was drawn

- **Yan Mountains Ridgeline Cutaway**: continuous undulating ridge saddle (`H(x,z)`) with steep rocky flanks, pine-covered slopes filtered by surface slope, topographic contours, and eight stratified granite and dolomite geological bands along all four cutaway sides.
- **Mitered Ming Curtain Wall**: 64-station smoothed wall ribbon anchored deep into bedrock along both faces — battered granite footings, coursed grey kiln-brick brickwork, stepped stone flagstone walk, inner parapet wall, and outer crenellated merlons.
- **Watchtowers & Spur Beacon**: three two-storey fortress watchtowers (`dajiao`) straddling the crest with battered stone bases, embrasure windows, upper timber pavilions, and swept hip-and-gable tile roofs, plus an outlying peak beacon tower (`fengsui`) on the north-west spur.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework uses six depth-tested ink layers and a procedural paper-grain overlay. Drag to orbit, scroll to zoom, double-click to reset.
