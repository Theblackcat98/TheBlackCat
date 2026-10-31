---
title: "SVG Optimizer & Previewer"
contenttype: reference
description: "An in-browser SVG optimizer and previewer. Strip metadata, fix precision, minify IDs, and preview on multiple backgrounds."
topics:
  - tools
  - web
tags:
  - svg
  - html
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: svg-optimizer
---

An in-browser SVG optimizer and previewer. It allows you to paste or upload an SVG and see it rendered on light, dark, and checkerboard backgrounds to quickly spot visual issues.

## Read it

[Open the optimizer](/svg-optimizer/) — the full tool as a standalone page.

## What it does

All optimization runs client-side in the browser.
- **Safety**: Automatically strips `<script>` tags.
- **Cleans Metadata**: Removes `<metadata>`, comments, and editor-specific namespaces (e.g., Inkscape, Sodipodi).
- **Prunes**: Removes empty groups (`<g>`).
- **Precision**: Truncates geometric coordinates to a configurable decimal precision to save space without visible distortion.
- **ID Minification**: Optionally minifies IDs and safely remaps internal `url(#...)` and `href="#..."` references.
- **Previews**: Renders the optimized output immediately against multiple background types.

## Notes

- The tool is a single static HTML file located at `static/svg-optimizer/index.html`.
- External references (like fonts or images loaded via HTTP/HTTPS) are flagged with a warning, as they can break or cause mixed-content issues in some contexts.
