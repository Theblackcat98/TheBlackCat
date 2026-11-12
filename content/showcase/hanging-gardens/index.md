---
title: "Hanging Gardens of Babylon"
description: "Two interactive axonometric reconstructions unified with an in-canvas switch: a closed six-tier vaulted ziggurat with cascading corner channels and an earlier stepped-pass terrace study with front arcades and water rills."
contenttype: article
tool: hanging-gardens
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

Two architectural hypotheses for the Hanging Gardens of Babylon unified into one interactive drawing plate (`II · Vaulted Ziggurat` and `I · Earlier Stepped Pass`, toggled via the selector at top-left). Both explore terraced stonework, water-lifting cisterns, and planting spilling past parapets without fabricating an archaeological topography: because the Gardens have never been conclusively located — either on Babylon's flat Euphrates floodplain or at an alternative site near Nineveh — both views remain grounded on a clean drafting plate rather than a geological cutaway.

## What was drawn

- **II · Vaulted Ziggurat**: Six planted tiers built closed on every face — solid rubble cores, four arcaded walls per level, hedged parapets, overhanging palms and cypresses, a double cascade down the near corner into walled basins, and a summit brick cistern within a crenellated precinct wall.
- **I · Earlier Stepped Pass**: The earlier stepped-arcade composition featuring polychrome glazed-brick and limestone bays, diagonal ceremonial stairs with cheek walls, stepped cascades down the central axis, date palms, and forecourt water rills framed by ghosted mud-brick city enclosures.

## How it works

Both reconstructions compile into independent `THREE.Group` wash-and-ink hierarchies inside a single Three.js scene. Switching between them toggles group visibility and resets the camera frustum and polar orbit bounds cleanly without reloading the page. Drag to orbit, scroll to zoom, double-click to reset.
