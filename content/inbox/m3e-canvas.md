---
title: "m3e-canvas"
contenttype: bookmark
description: "Browser sketchpad for Material 3 Expressive screens: drag real components, link screens into a tap-through prototype, export the design as a prompt for your AI coding tool. Static Next.js, no backend, MIT."
source: "https://github.com/lnkiai/m3e-canvas"
topics:
  - ai
tags:
  - design
  - ui
  - tools
status: inbox
created: 2026-09-04
updated: 2026-09-04
---

Sketch Material 3 Expressive UI in the browser and turn the sketch into a vibe-coding prompt. By lnkiai, MIT, static Next.js export — [live demo](https://lnkiai.github.io/m3e-canvas/), no backend, everything in localStorage.

What makes it more than a mockup tool:

- **Real components** — buttons, FABs, chips, app bars, nav bars, cards, dialogs, text fields, sliders — all drawn to M3 Expressive, including the shape-morphing loading indicator ported from material-components-android.
- **Prototype behavior** — magnetic connections fuse parts into groups; screens link via tap/swipe with slide/fade/expand transitions; preview is actually tappable, back plays the transition in reverse.
- **Full theme control** — the four M3 axes (color/shape/type/motion): seed color → generated Material scheme, light/dark, three contrast levels, dynamic color, expressive spring motion.
- **The output is a prompt** — whole design or single screen, in English, Japanese, or Chinese, including your behavior notes per part. Feed it to Claude Code/Cursor/etc. Their demo: habit-tracker sketch → running Android app.
- **Honest about layout** — the prompt explicitly describes overlaps and side-by-side rows so generated layouts keep them.

Design lesson embedded in the tool: humans do the spatial part, the model does the syntax. See the blog post for why that split works.

See also: [matraic/m3e](https://github.com/matraic/m3e) — Material 3 Expressive as Lit web components, "a good home for the screens you sketch here".
