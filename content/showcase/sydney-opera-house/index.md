---
title: "Sydney Opera House — Bennelong Point"
description: "An interactive ink-and-wash axonometric cutaway of the Sydney Opera House on Bennelong Point: Jørn Utzon's spherical-geometry precast concrete sail vaults above the monumental granite podium, set on stratified Sydney sandstone rising out of Sydney Harbour and Farm Cove."
contenttype: article
tool: sydney-opera-house
topics:
  - design
tags:
  - svg
  - isometric
  - creative-coding
  - architecture
created: 2026-11-12
updated: 2026-11-12
---

## What it is

On Bennelong Point, Jørn Utzon anchored a sequence of spherical precast concrete roof shells atop a heavy stepped granite podium projecting directly into Sydney Harbour. Three overlapping groups of glazed-tile sails house the Concert Hall, the Joan Sutherland Theatre, and the Bennelong restaurant while the monumental south concourse stairs climb straight off Circular Quay.

## What was drawn

- **Bennelong Point & Sydney Harbour terrain block**: Hawkesbury sandstone headland and Tarpeian Rock escarpment with cutaway geological strata, Farm Cove seawall and Botanic Gardens trees, harbour water with wakes and sliced waterlines, ghosted Circular Quay wharves, and passing harbour sailboats.
- **Monumental Podium**: the broad ceremonial southern concourse stairway, forecourt terrace, harbour boardwalks, seawall pilings, and concrete substructure under-crofts.
- **Precast Sail Vaults**: all three vaulted clusters (`Concert Hall`, `Opera Theatre`, and `Bennelong Restaurant`) constructed on a consistent spherical shell rib geometry with stepped tile seams, glazed mullion curtain walls beneath the shell mouths, and copper-bronze accents.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Terrain, water, and concrete shell washes are paired with six depth-tested ink weights (`bold`, `medium`, `fine`, `rust`, `teal`, `faint`) and a procedural paper texture. Drag to orbit, scroll to zoom, double-click to reset.
