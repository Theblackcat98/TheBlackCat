---
title: "ZenNotes tui (zn)"
contenttype: bookmark
description: "Vim-first terminal notes app in one static Go binary: plain-markdown vault, kanban/calendar tasks, CSV databases, command palette — plus an MCP server so coding agents can use the same vault. MIT."
source: "https://github.com/ZenNotes/tui"
topics:
  - ai
tags:
  - tui
  - knowledge-management
  - open-source
status: inbox
created: 2026-09-09
updated: 2026-09-09
---

`zn` — ZenNotes in the terminal: a full CLI plus a Bubble Tea TUI app in one static Go binary (no runtime deps). Notes stay **plain Markdown files in a folder you own**.

Why it's interesting beyond the feature list:

- **One vault, two frontends** — reads the same vault/config as the ZenNotes desktop app, and every command (names, flags, JSON shapes, task ids) is checked against the desktop implementation so scripts work on both. A design contract, not just compat claims.
- **Real Vim at the core** — counts, registers, marks, macros, text objects, visual block, `:g`/`:norm`, heading motions; toggleable if you must.
- **Tasks as list/kanban/calendar, databases as table/board** from `.base` folders and loose CSVs; daily/weekly/monthly note patterns; command palette; `:zen` to drop all chrome.
- **`zn mcp`** — the same MCP tools the desktop offers, so Claude/agents get your notes as first-class tools. (File-based cousin of OpenContext's agent memory.)
- **Honest demos** — the README's recordings are scripted tmux + asciinema keystroke choreography, rendered with agg/ffmpeg. Reproducible demo culture, in a notes app.
- Caveats: brand new (created 2026-09-08, two commits, 50★) — no prebuilt binaries or Homebrew formula yet; `go install github.com/ZenNotes/tui/cmd/zn@latest` for now.
