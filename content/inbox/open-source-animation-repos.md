---
title: "18 open-source animation repos for AI coding agents"
contenttype: bookmark
description: "Wasim's listicle of animation libraries and engines that an AI coding agent can drive — Remotion skills, Motion Canvas, Motion, anime.js, Manim, Lottie, Konva, three.js, Godot, Blender and more."
source: "https://x.com/WasimShips/status/2126356476700610837"
topics:
  - design
  - web
  - ai
tags:
  - motion-graphics
  - creative-coding
  - javascript
  - agents
  - open-source
  - video
status: inbox
created: 2026-11-28
updated: 2026-11-28
---

## Why I saved this

A single post that indexes the animation stack an agent can actually code
against: declarative React video, a TypeScript scene studio, tweening engines,
math animation, 2D canvas, and two full 3D engines. Useful as a menu when a
"make it move" request arrives and the right tool is not obvious.

## Notes

Posted 2026-11-27 by [@WasimShips](https://x.com/WasimShips) (≈1.9k likes,
≈3.4k bookmarks — bookmarks outnumbering likes says people filed it for later
rather than just applauding). The post is a bare numbered list of 18 GitHub
links plus a demo video; the descriptions and facts below are read from each
repo, not from the post.

**Agent-skill / code-first video**

1. [remotion-dev/skills](https://github.com/remotion-dev/skills) — ★8.2k,
   TypeScript. Official Agent Skills for Remotion: programmatic video in React,
   so an agent writes components and renders MP4. 14 skills (`remotion-create`,
   `remotion-render`, `remotion-captions`, `remotion-markup`, `remotion-maps`,
   `remotion-license`…), installed with `npx skills add remotion-dev/skills` and
   aimed explicitly at Claude Code, Codex, Cursor, Kimi Code and OpenCode.
   Caveat: the repo root carries **no license file** — fine to read, not to
   vendor.
2. [motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas)
   — ★20.4k, MIT. "Visualize your ideas with code": a browser-based animation
   studio where scenes are TypeScript generators, so a timeline is a program.
3. [ManimCommunity/manim](https://github.com/ManimCommunity/manim) — ★43k, MIT,
   Python. The 3Blue1Brown-style mathematical animation framework. Still the
   best answer for explanatory math and diagram motion.

**Web animation libraries**

4. [motiondivision/motion](https://github.com/motiondivision/motion) — ★35.7k,
   MIT. The library formerly called Framer Motion; declarative animation for
   React and plain JS, layout and gesture animation included.
5. [juliangarnier/anime](https://github.com/juliangarnier/anime) — ★75.2k, MIT.
   anime.js, the general-purpose JS animation engine (v4 is modular, ESM-first).
6. [franciscop/ola](https://github.com/franciscop/ola) — ★1.9k, MIT. Tiny
   library that smoothly interpolates a *number* (or array of numbers) to a
   target — the physics-y primitive other libraries wrap.
7. [jeremyckahn/shifty](https://github.com/jeremyckahn/shifty) — ★1.6k, MIT,
   TypeScript. Tweening engine: the interpolation core under a renderer,
   portable to canvas/WebGL/DOM.
8. [CreateJS/TweenJS](https://github.com/CreateJS/TweenJS) — ★3.6k, MIT. The
   classic CreateJS tweening library. **Last push 2023** — listed for
   completeness and for reading old tutorials, not for new work.
9. [airbnb/lottie-web](https://github.com/airbnb/lottie-web) — ★32.6k, MIT.
   Plays After Effects animations exported as Bodymovin JSON, natively on web,
   Android, iOS and React Native. Design-tool output → code without a rewrite;
   **last push 2025-09**, so treat as stable-but-quiet.

**Drawing, 2D and particles**

10. [jonobr1/two.js](https://github.com/jonobr1/two.js) — ★8.8k, MIT. Renderer-
    agnostic 2D drawing API: one scene graph over SVG, canvas or WebGL.
11. [konvajs/konva](https://github.com/konvajs/konva) — ★15k, MIT (GitHub's
    detector says "Other" because the file carries the KineticJS lineage
    notice; the LICENSE text is plain MIT). Canvas scene graph with events,
    drag/drop, transforms and animation — the usual base for editors,
    whiteboards and diagram tools.
12. [lume/lume](https://github.com/lume/lume) — ★1.6k, MIT. "GPU-powered 3D
    HTML": Three.js objects as `<lume-*>` custom elements, so a 3D scene is
    markup an agent can edit declaratively.
13. [drawcall/Proton](https://github.com/drawcall/Proton) — ★2.5k, MIT. Particle
    engine for canvas and WebGL: emitters, behaviours, sprites.
14. [mattdesl/gifenc](https://github.com/mattdesl/gifenc) — ★395, MIT. Fast GIF
    encoder in JS — the export step when the deliverable has to be a looping
    file rather than a page.

**3D engines and suites**

15. [mrdoob/three.js](https://github.com/mrdoob/three.js) — ★119.6k, MIT. The
    default WebGL/WebGPU 3D library; the scene-graph base under most of the
    visual work already on this site.
16. [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js) — ★26.5k,
    Apache-2.0, TypeScript. Fuller "engine" than three.js: built-in physics,
    inspector, animation system, WebGPU and XR paths.
17. [godotengine/godot](https://github.com/godotengine/godot) — ★121k, MIT. 2D/3D
    game engine with a real animation tree — the right choice when the motion
    is interactive and stateful rather than a timeline.
18. [blender/blender](https://github.com/blender/blender) — ★22.6k, GNU GPL
    (per its `COPYING` file; the repo is the official mirror). Scriptable
    through `bpy`, which is how an agent drives renders headlessly.

Facts (stars, language, license, last push) read from the GitHub API on
2026-11-28. Star counts move; the licenses and the two stale-looking entries
(TweenJS 2023, lottie-web 2025) are the parts worth remembering.
