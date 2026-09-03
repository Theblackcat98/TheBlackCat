---
title: "tokscale — token usage tracker for AI coding agents"
type: bookmark
description: "Rust CLI/TUI that parses local session files from 50+ AI coding agents (Claude Code, Codex, OpenCode, Cursor…) and reports token usage & cost — dense ratatui terminal dashboard, 2D/3D web contribution graph, optional global leaderboard."
source: "https://github.com/junhoyeo/tokscale"
topics:
  - programming
  - tools
tags:
  - rust
  - cli
  - tui
  - token-usage
  - ai
status: inbox
created: 2026-09-03
updated: 2026-09-03
---

## Why I saved this

The UI is exactly the terminal aesthetic I like — dense, color-coded, everything on one screen. Worth studying (and maybe imitating).

## Notes

By Junho Yeo (@_junhoyeo). MIT, ~5.3k stars, very active. Reads the local
session/ledger files your agents already write (JSONL + SQLite), never
needs API keys. Optional `tokscale submit` → global leaderboard.

**Stack** (from the repo's Cargo.tomls / package layout):
- Rust core (`tokscale-core`): `simd-json` for fast parsing, `rusqlite` for agents' SQLite DBs, `rayon` parallel scans, `bincode`+`zstd` cache, `reqwest` for LiteLLM pricing (OpenRouter fallback).
- CLI + TUI (`tokscale-cli`): **ratatui + crossterm** — that's the dashboard in the viral screenshots; `comfy-table`/`colored` for plain output; `image`/`imageproc`/`ab_glyph` render shareable PNG summary cards.
- Distribution: per-platform native binaries via npm (`npx tokscale`), no Rust toolchain needed.
- Web frontend: GitHub-Primer-styled contribution graph, 2D calendar + isometric 3D (height = tokens), palettes, tooltips, per-day/model breakdowns.

**UI takeaways:** monospace tabular density, numbers color-coded by magnitude, box-drawing grid, per-model + per-session rows — "Bloomberg terminal" style. Full write-up: `~/hermes/knowledge/research/tokscale/2026-09-03-stack.md`.

Seen via Jeffrey Emanuel's "My 2T Token Life" post. Install: `npm i -g tokscale`.
