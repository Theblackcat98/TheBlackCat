---
title: "Point a camera at reality, get a mesh"
description: "ahujasid's camera-to-blender: photo → background removal → image-to-3D → into your open Blender scene in under a minute. No new models, just plumbing."
date: 2026-09-04T13:52:00-07:00
draft: true
authors:
  - name: theblackcat98
    link: https://github.com/theblackcat98
    image: https://github.com/theblackcat98.png
tags:
  - ai
  - blender
  - tools
---

Siddharth Ahuja — who built [blender-mcp](https://github.com/ahujasid/blender-mcp), the plugin that lets LLMs drive Blender — has a new toy: [camera-to-blender](https://github.com/ahujasid/camera-to-blender). Point your phone at an object, tap the shutter, and about 30 to 60 seconds later the 3D model lands in your open Blender scene.

<!--more-->

## The pipeline

Nothing here is a new model. That's the point:

1. **Photo** — a web app built for phone (laptop webcam works too).
2. **Background removal** — Gemini, optional. Skip it and the photo goes in as-is.
3. **Image-to-3D** — [Tripo3D](https://platform.tripo3d.ai/), the required key. This is what makes the mesh.
4. **Delivery** — a FastAPI relay server pushes the model over WebSocket to a Blender add-on ("WS Import"), which imports it into whatever scene you have open.

The phone needs ngrok because mobile cameras require HTTPS, and the WebSocket URL swaps to `wss://…/ws?client=blender`. One commit in the repo, MIT licensed, 103 stars at the time of writing.

## Glue-ware is the genre now

The individual pieces all existed last year: image-to-3D APIs, background removal, Blender's Python add-on API. Ahuja's work — both this and blender-mcp — is a study in the same move: don't train anything, don't fine-tune anything, find the two systems with an API gap between them and build the bridge. blender-mcp wired LLMs to Blender over its plugin socket; this wires your camera to Blender over a WebSocket.

It's the same shape as the best agent tooling this year. The magic isn't in the model, it's in the plumbing that makes the model's output land somewhere useful with zero friction. Shutter to scene in under a minute is a UX claim, not a research claim — and UX claims compound faster.

## The honest caveat

Image-to-3D from a single photo is where the quality ceiling sits: these meshes are good enough for blocking out scenes, previz, and play — not production assets. The failure modes in the README tell you what the system really is: quota errors, ngrok URLs rotating on restart, a disconnected add-on. It's a weekend-scale tool. That's fine. Most of what feels like the future does, at first.
