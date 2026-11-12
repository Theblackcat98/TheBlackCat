---
title: "Machu Picchu"
description: "An interactive ink-and-wash axonometric cutaway of Machu Picchu perched above the Urubamba River canyon: detailed battered granite ashlar temples, the curved Torreón, Intihuatana sundial mound, trapezoidal doorways, agricultural andenes, and Huayna Picchu."
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
updated: 2026-11-12
---

## What it is

The Inca citadel of Machu Picchu spans the high mountain saddle above a horseshoe bend of the Urubamba River, framed between Huayna Picchu behind and the agricultural terrace slopes wrapping the flanks. This version pairs the continuous canyon-and-ridge terrain cutaway with detailed Inca ashlar masonry across the Sacred Plaza, residential *kanchas*, and ritual huacas.

## What was drawn

- **Urubamba Gorge & Ridge Saddle (`68 × 68` terrain block)**: carved river canyon with stratified bedrock cutaway skirts, topographic contour lines, stepped agricultural *andenes*, cloud-forest slope trees, drifting valley mist, and projected site labels.
- **Temple of the Sun (*Torreón*) & Sacred Plaza**: horseshoe battered ashlar bastion with solar windows above a stepped outcrop base, alongside the three-walled Principal Temple and the Temple of the Three Windows.
- **Intihuatana & Sacred Rock**: multi-tiered *ushnu* pyramid topped by the monolithic sundial gnomon, plus the Yanantin-profiled Sacred Rock flanked by twin open *wayrana* pavilions.
- **Kancha Compounds & Caretaker's Hut**: battered granite halls with coursed ashlar joints, trapezoidal doorways beneath monolithic lintels, gabled masonry ends, and overhanging layered *ichu* thatch roofs around the sunken Great Plaza.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Terrain, rock strata, masonry, and thatch washes are paired with six depth-tested ink weights (`bold`, `med`, `fine`, `rust`, `teal`, `faint`), SVG callouts projected from 3D world anchors, and a procedural paper-grain overlay. Drag to orbit, scroll to zoom, double-click to reset.
