---
title: "Shadow & Shape Generator"
contenttype: reference
description: "Layered box-shadows, border-radius and blob shapes, and glass effects, with copy-ready CSS."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - design
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: shadow-shape
---

Build soft, natural-looking depth and organic shapes without hand-tuning CSS.

## Open it

[Open the Shadow & Shape Generator](/shadow-shape/)

## Features

- **Shadows**: stack several layers, each with offset, blur, spread, color and opacity, with presets for soft, layered and crisp looks.
- **Shapes**: per-corner border-radius editing, including elliptical blobs and a `clip-path` option.
- **Glass**: a frosted-glass panel using `backdrop-filter` with an `@supports` fallback.
- **Copy**: the generated declaration for each tab.

## Notes

- The page is a static HTML file served straight from the site: `static/shadow-shape/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Several soft layers usually look more natural than one large blur.
