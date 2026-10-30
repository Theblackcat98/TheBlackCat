---
title: "Type Scale & Font Pairing Playground"
contenttype: reference
description: "A typography studio: pick a modular scale ratio, base size, and see the full scale rendered live; choose from a curated set of font pairings or pick any two fonts, and export the scale as CSS."
topics:
  - tools
  - design
tags:
  - web
  - ui
  - html
  - tools
status: filed
created: 2026-10-30
updated: 2026-10-30
---

A typography studio for exploring modular scales and font pairings, entirely client-side. Allows selection of base sizes, scale ratios, and live previewing with dynamic font loading from Google Fonts.

## Read it

[Open the tool](/type-scale/) — a standalone page to experiment with type scales and export the resulting CSS variables and utility classes.

## Features

- **Modular Scale:** Choose from standard scales like Major Third (1.25) or Golden Ratio (1.618), or define a custom ratio.
- **Font Pairings:** Select from curated pairings or construct custom pairings from a library of Google Fonts.
- **Real-time Preview:** See the calculated scale and applied fonts instantly.
- **Export:** Generate CSS custom properties (`--step-N`) and font utility classes ready to be dropped into a stylesheet.

## Notes

- The tool is a static HTML page relying solely on Vanilla JS, served from `static/type-scale/index.html`.
- Fonts are loaded at runtime from Google Fonts CDN without server-side dependencies.
- State is preserved locally using `localStorage`.
