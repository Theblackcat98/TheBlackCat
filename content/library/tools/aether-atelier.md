---
title: "AETHER — Mathematical & Chromatic Atelier"
contenttype: article
description: "A single-page interactive atelier: a cosine-palette synthesizer driving a Clifford strange-attractor visualizer, Albers simultaneous-contrast studies, and a written codex on the mathematics of generative beauty."
topics:
  - design
  - programming
tags:
  - creative-coding
  - design
  - web
  - html
status: filed
created: 2026-10-27
updated: 2026-10-27
---

An interactive, self-contained page that treats colour as a mathematical object: synthesise a palette from trigonometry, then watch the same palette run through chaos systems, phyllotaxis and reaction–diffusion. Everything on the page is generated in the browser — no images, no server, no build step.

## Read it

[Open the atelier](/aether-atelier/) — the full interactive page, running as-is.

## What is inside

- **Spectral cosine synthesizer** — the Inigo Quilez palette model, `C(t) = a + b · cos(2π(c · t + d))`, with randomisable wave vectors, a live RGB interference plot, and CSS/GLSL export of whatever palette you land on.
- **Curated palettes and chord geometry** — golden-angle (137.5°), triadic (120°), split-complementary (150°), tetradic (90°) and analogous (30°) hue chords, applied to the active visualiser.
- **Albers simultaneous contrast** — nested colour fields that demonstrate how surrounding luminance shifts what a swatch appears to be.
- **Clifford strange attractor** — Pickover's phase-space folding, `x′ = sin(a·y) + c·cos(a·x)`, `y′ = sin(b·x) + d·cos(b·y)`, rendered with adjustable trail persistence, chromatic cycle speed, parameter morphing and orbit/zoom controls.
- **A codex on generative beauty** — short chapters on strange attractors and bifurcation, phyllotaxis and harmonographs, Turing reaction–diffusion and Chladni nodal lines, and spectral cosine synthesis.

## Notes

- The page is a static HTML file served straight from the site: `static/aether-atelier/index.html`. Palette changes propagate into the visualisers within the page; it stores nothing and sends nothing anywhere except its CDN/font/icon requests.
- Built with Tailwind (CDN), Cormorant Garamond / Plus Jakarta Sans / JetBrains Mono, and Phosphor icons. Dark-first.
- Kept byte-identical to the authored file so the demos keep their exact timing and defaults; edits go to the source artefact, not the copy.
