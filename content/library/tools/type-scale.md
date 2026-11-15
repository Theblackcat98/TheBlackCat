---
title: "Typography Studio"
contenttype: reference
description: "A typography studio with two modes: Scale builds a modular type scale with curated font pairings, and Fluid generates clamp() font sizes that scale smoothly between viewport widths. Both export CSS custom properties."
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
updated: 2026-11-15
tool: type-scale
aliases:
  - /library/tools/fluid-type/
---

A typography studio with two modes, entirely client-side. **Scale** mode explores modular scales and font pairings; **Fluid** mode (the former standalone Fluid Type Calculator, merged in November 2026) works out `clamp()` values so type grows with the viewport instead of jumping at breakpoints.

## Read it

[Open the tool](/type-scale/) — a standalone page to experiment with type scales, pair fonts, generate fluid sizes, and export the resulting CSS variables and utility classes.

## Scale mode

- **Modular Scale:** Choose from standard scales like Major Third (1.25) or Golden Ratio (1.618), or define a custom ratio.
- **Font Pairings:** Select from curated pairings or construct custom pairings from a library of Google Fonts.
- **Real-time Preview:** See the calculated scale and applied fonts instantly.
- **Export:** Generate CSS custom properties (`--step-N`) and font utility classes ready to be dropped into a stylesheet.

## Fluid mode

- **clamp() output**: give a minimum and maximum size in px and the viewport range; get `clamp(rem, rem + vw, rem)` ready to paste.
- **Type scale**: generate a whole modular scale with fluid steps and copy it as `--step-N` custom properties, with an editable per-step table.
- **Accessibility check**: warns when the maximum is more than 2.5 times the minimum, since that can fail WCAG zoom requirements.
- **Live preview**: drag a viewport slider and see the computed size at that width.

## Notes

- The tool is a static HTML page relying solely on Vanilla JS, served from `static/type-scale/index.html`.
- Scale mode loads fonts at runtime from the Google Fonts CDN; Fluid mode makes no third-party requests. Values there are computed in `rem` from a root font size you can set (default 16 px), so they respect user font-size settings.
- State is preserved locally using `localStorage`. Settings saved by the old standalone Fluid Type tool are imported into Fluid mode on first load.
