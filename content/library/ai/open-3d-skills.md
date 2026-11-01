---
title: "Open 3D Skills — eight agent skills for 3D and animated websites"
contenttype: bookmark
description: "Eight agent skills covering the whole 3D-website pipeline from code-built three.js scenes and scroll films to browser checks and frame-exact 60 fps capture, each shipped with the scripts that were run on real footage."
source: "https://github.com/Moh4696/open-3d-skills"
topics:
  - ai
  - web
tags:
  - agents
  - skills
  - threejs
  - javascript
  - web
  - motion-graphics
  - video
status: filed
created: 2026-11-01
updated: 2026-11-01
related:
  - /library/programming/twelve-free-open-source-motion-effects-repos
---

## Why I saved this

Most "agent skills" repos are prompt collections. This one ships the scripts
that did the work: every technique was used to build a real site first and every
script was run on real footage before it landed. It also covers the two ends
people skip — checking the result in actual browsers, and recording it as a
smooth 60 fps video — so one install closes the loop from concept to shipped
demo. Everything is plain ES modules with no build step and no theme, so it
plugs into any stack.

## Notes

Eight skills, installed with `npx skills add Moh4696/open-3d-skills` (Node
22.20+); Claude Code, Codex, Cursor and Gemini CLI each get a plugin or
extension path, and a plain shell installer works without Node.

- **threejs-scene** — real-time scenes built from code rather than model files:
  sky/sun presets that blend, soft fitted shadows, ambient occlusion, bloom,
  instancing, profile sweeps, camera flights, quality tiers. Ships a complete
  60 fps starter scene.
- **scroll-film** — scroll-scrubbed films from generated clips: start/end frame
  chaining, hold beats for captions, phone versions, loading order, reduced
  motion. Ships the `scroll-film.js` engine plus a frame/video prep script and a
  seam checker.
- **motion-assets** — plans the AI image and clip work before spending: asset
  list with prompts and costs up front, one consistent look, model choice by
  capability, rate limits, logging. Ships a loop checker and an outpaint
  paste-back tool.
- **alpha-cutout** — transparent video from clips shot on a key plate:
  per-frame plate measurement, edge unmixing, output for every browser
  including Safari (stacked-alpha MP4, VP9 alpha, WebP frames) plus a WebGL
  alpha video player.
- **cursor-rig** — a painted character whose head follows the cursor, built as
  a grid of poses on one fixed body with live blinks; ships the rig builder and
  a spring-driven canvas player.
- **exploded-view** — machine explainers: staged explode, x-ray, section cut,
  leader-line labels, picking. Ships `explode.js` and the electric-motor demo.
- **site-check** — headless Chromium and WebKit at three viewport sizes;
  reports frame time, draw calls, console errors, blank canvases, overflow and
  reduced-motion behaviour.
- **frame-capture** — frame-exact 60 fps recording of any page by running it on
  a virtual clock, plus labelled side-by-side or stacked comparisons.

Requirements: Node 22.20+ for the installer and the repo's own checks, Python
3.9+ with Playwright/Pillow/NumPy/OpenCV for the scripts, ffmpeg on PATH, and an
image or video generation service for `motion-assets`, `alpha-cutout`,
`cursor-rig` and `scroll-film`. `threejs-scene`, `exploded-view`, `site-check`
and `frame-capture` need no generation service at all. No API keys are stored by
the skills.

MIT licensed, 117 stars (checked 2026-11-01), active (last push 2026-10-31), and
it names the services its observations came from (Higgsfield, MiniMax, Kling, Seedance,
Nano Banana) without depending on any of them. Same territory as the
[free motion-effects repo list](/library/programming/twelve-free-open-source-motion-effects-repos),
but this one is the workflow layer rather than a library list.
