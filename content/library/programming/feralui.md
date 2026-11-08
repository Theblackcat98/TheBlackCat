---
title: "FeralUI · playful, physics-driven React elements"
contenttype: bookmark
description: "mortspace's collection of tiny interactive React/TypeScript experiments — real physics, hand-tuned animation: pettable fur, a jelly mascot, a claw-machine captcha, a Verlet pull-cord, holographic foil cards."
source: "https://feralui.dev/"
topics:
  - design
  - programming
tags:
  - design
  - creative-coding
  - typescript
  - react
  - ui
status: filed
created: 2026-11-08
updated: 2026-11-08
---

## Why I saved this

Reference material for UI that is genuinely fun instead of just animated — each demo is a single self-contained component, so the technique can be lifted rather than admired.

## Notes

FeralUI is a showcase of playful, physics-driven React components and experiments by **mortspace** ([GitHub](https://github.com/mortspace)), built in React + TypeScript. Each component lives at its own address on the same site:

- `/fur` — a pettable coat of fur rendered strand by strand on canvas, parting around the cursor and on touch.
- `/pullcord` — a ceiling pull-cord using real Verlet-integration rope physics; tug it to toggle light/dark.
- `/hologram` — a foil trading card that scatters light as you tilt it, Pokemon-style.
- `/blob` — a squishy jelly mascot that wobbles, demoed inside a log-out confirmation modal.
- `/captcha` — a claw-machine captcha: prove you're human by working the claw.
- `/crumple` — delete effect where notes crumple into a paper ball and drop into a waste basket.
- `/vacuum` — bulk-delete where selected tiles get sucked up a hose, with sound and motion.
- `/deskfolio` — a portfolio shaped like a little book, pages turning on spring physics.
- `/scenes` — a shelf of finished mobile app screens, each with its own signature transition.
- `/gradients` — free mesh/grainy/animated gradient generator from traditional Japanese colours, exporting SVG, PNG or MP4, no signup.
- `/animaps` — animated route maps in React, exportable as video.
- `/matchday` — "Letterboxd for football": log and half-star-rate the matches you watched.

Stack detail from the page source: client-side routed single page, self-hosted-ish Google Fonts (Fraunces, Inter, Quicksand, Caveat), plus a couple of standalone tools (`/gradients`, `/matchday`) that are bigger than a component demo.
