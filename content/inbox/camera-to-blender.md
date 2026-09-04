---
title: "camera-to-blender"
contenttype: bookmark
description: "Photo of a real object → background removal (Gemini) → image-to-3D (Tripo3D) → auto-imported into Blender via a WebSocket relay, in under a minute."
source: "https://github.com/ahujasid/camera-to-blender"
topics:
  - ai
tags:
  - blender
  - computer-vision
  - tools
status: inbox
created: 2026-09-04
updated: 2026-09-04
---

## Why I saved this

A clean example of glue-ware: no new models, just Tripo3D + Gemini + a WebSocket relay into Blender — and the result feels like magic.

## Notes

By Siddharth Ahuja (@sidahuj) — also the author of blender-mcp, the community plugin that lets LLMs drive Blender. Pipeline: phone photo (web app built for phone; laptop webcam works too) → optional Gemini background removal → Tripo3D generates the mesh (~30–60 s) → relay server (`relay_server.py`, FastAPI/uvicorn) pushes it over WebSocket to a Blender add-on ("WS Import") that imports it into the open scene.

- **Stack**: Python 3.10+, Blender 3.0+, Tripo3D API key (required), Gemini key (optional), ngrok for phone use (mobile cameras need HTTPS, and the WebSocket URL swaps to `wss://…/ws?client=blender`).
- **Shape**: 1 commit, 103★ / 16 forks at save time, MIT.
- **Lesson**: the individual pieces (image-to-3D APIs, background removal, Blender's Python add-on API) all existed; the value is the plumbing that makes them one gesture — shutter → model in scene.
