---
title: "Pithos: a C inference engine for Liquid AI's LFM models"
contenttype: bookmark
description: "David Hendrickson's post on Pithos, a dependency-free open-source C inference engine for Liquid AI's LFM models, reporting roughly double llama.cpp's speed on modest hardware."
source: "https://x.com/TeksEdge/status/2117081763944026592"
topics:
  - ai
  - programming
tags:
  - ai
  - llm
  - local-llm
  - open-source
status: inbox
created: 2026-11-02
updated: 2026-11-02
---

## Why I saved this

Another custom, per-model inference engine — this one for Liquid AI's LFM models — saved from an X post by David Hendrickson (@TeksEdge, posted Nov 1, 2026). Relevant to the local-inference comparisons tracked here.

## Notes

- Project: [Pithos](https://github.com/benmaster82/Pithos) — open-source, dependency-free C inference engine for Liquid AI's LFM models. The GitHub link was in the attached image's description, not in the post text itself.
- Test setup reported in the post: LFM2.5-24B-A2B Q4_K_M on an Intel i5-10500H, 16GB RAM, and a GTX 1650 Max-Q with 4GB VRAM.
- Reported generation speeds: llama.cpp CUDA ~11 tok/s vs Pithos CUDA ~17–22 tok/s; llama.cpp CPU ~2.5 tok/s vs Pithos CPU ~5 tok/s.

The post carried one image: a screenshot of the Pithos README.
