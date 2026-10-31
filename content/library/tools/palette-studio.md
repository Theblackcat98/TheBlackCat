---
title: "Palette Studio"
contenttype: reference
description: "Extract a palette from a photo, build multi-stop gradients, and simulate how both read under color-vision deficiencies — entirely in the browser."
topics:
  - tools
tags:
  - color
  - design
  - web
  - photo
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: palette-studio
---

A browser-based studio for working with color: pull a palette out of an image, turn colors into a gradient, and check how the result reads to a viewer with a color-vision deficiency.

## Open it

[Open Palette Studio](/palette-studio/) — the full studio application, running as-is.

## The three modes

- **Photo Palette**: Upload or drag-and-drop an image (a built-in sample scene is loaded by default, so the tool works with no upload) and extract a palette of 3–10 colors. Extraction is a median-cut quantization over sampled pixels, implemented in the page itself — no library, no server. Each swatch shows its hex, RGB and HSL values plus its share of the image; click a swatch to copy its hex.
- **Gradient Studio**: A multi-stop linear or radial gradient builder. Add, remove and reorder stops, set each stop's position with a slider or a numeric input, and control the linear angle. A large preview and a text-sample preview update live, and the finished gradient can be copied as a CSS `background` declaration. A "Stops from palette" shortcut seeds the gradient from the extracted palette.
- **Color Blindness Simulator**: Runs the current palette — and the source image, rendered to a canvas — through standard 3×3 simulation matrices for protanopia, deuteranopia and tritanopia (Machado-style), plus achromatopsia via ITU-R BT.601 luminance. Original and simulated swatches sit side by side. The matrices are approximations of how the colors read under each deficiency, not a medical model.

## Export formats

- **CSS custom properties**: `--palette-1` … `--palette-N` in a `:root` block, ready to paste into a stylesheet (copy or download as `palette.css`).
- **JSON**: the palette as named colors with `hex`, `rgb`, `hsl` and image `share` per color (copy or download as `palette.json`).
- **Workshop tokens JSON**: a token-group object whose entries are `{ value, hex }` per token name (`palette-1`, `palette-2`, …), mirroring the per-token entry shape the Color Token Workshop exports, so a Palette Studio palette can be dropped into the same token pipelines.
- **Gradient CSS**: the current gradient as a single `background:` declaration.

## Notes

- The page is a static HTML file served straight from the site: `static/palette-studio/index.html`. Vanilla JavaScript and Canvas only — the palette extraction has no CDN dependency.
- Client-side only: uploaded images are drawn to a local canvas and never sent anywhere.
- The current palette and gradient stops persist in `localStorage`, so a refresh keeps your work.
