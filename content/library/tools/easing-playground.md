---
title: "Easing & Animation Playground"
contenttype: reference
description: "Edit cubic-bezier curves or springs, preview them live, and copy transition or keyframe CSS."
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
tool: easing-playground
---

Tune motion by dragging a curve instead of guessing numbers.

## Open it

[Open the Easing Playground](/easing-playground/)

## Features

- **Curve editor**: drag the handles or use the arrow keys; 29 named presets to start from.
- **Springs**: a spring mode that produces a `linear()` easing from stiffness and damping, with a suggested duration.
- **Preview**: the Web Animations API runs the easing against a linear baseline on a preview track.
- **CSS output**: a `transition` declaration or a `@keyframes` block, ready to copy.

## Notes

- The page is a static HTML file served straight from the site: `static/easing-playground/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Animation starts paused when the system asks for reduced motion.
