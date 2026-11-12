---
title: "Chichén Itzá — Yucatán Karst & El Castillo"
description: "An interactive ink-and-wash axonometric cutaway of Chichén Itzá: El Castillo centered on the Gran Nivelación limestone plaza alongside the Temple of the Warriors, Great Ball Court, and El Caracol, framed by stratified Yucatán karst bedrock and the Cenote Sagrado."
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
updated: 2026-11-12
---

## What it is

The Temple of Kukulcán sits at the centre of the Gran Nivelación — a vast artificially levelled limestone terrace carved out of the flat Yucatán karst plain, flanked by subterranean freshwater sinkholes (`cenotes`) that sustained the Maya city. Nine terraces, four 91-step stairways, and the summit temple align to the solar calendar across an archaeological precinct spanning ball courts, colonnaded halls, and astronomical observatories.

## What was drawn

- **Yucatán karst terrain block** (`80 × 80` section): terraced Gran Nivelación plaza with whitewashed *sacbe* causeways, cutaway limestone and marl strata skirts along all four sides, topographic contours, and jungle canopy surrounding the clearing.
- **Cenote Sagrado & Cenote Xtoloc**: sheer sinkhole rims dropping down to teal water tables exposed along the geological cutaway.
- **El Castillo**: nine battered *talud-tablero* terraces, four projecting stairways flanked by balustrades and feathered-serpent heads, and the two-column northern summit sanctuary.
- **Surrounding precinct**: the Temple of the Warriors with its Group of a Thousand Columns, the I-shaped Great Ball Court with masonry rings and end temples, the Platform of the Jaguars and Eagles, the Tzompantli, and the circular observatory tower of El Caracol.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Terrain, architecture, water planes, and geological strata are rendered in flat vertex-coloured washes overlaid with six crisp depth-tested ink weights (`bold`, `medium`, `fine`, `rust`, `teal`, `faint`) and a procedural paper-grain overlay. Drag to orbit, scroll to zoom, double-click to reset.
