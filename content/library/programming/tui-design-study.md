---
title: "TUI Design Study — llama-deck"
contenttype: article
description: "A design study for llama-deck: ten rules of a convincing TUI, what a survey of 857 starred repositories signals about terminal polish, a code-level critique of llama-deck's UI layer, and an ordered change plan."
topics:
  - design
  - programming
tags:
  - tui
  - design
  - terminal
  - cli
status: filed
created: 2026-10-20
updated: 2026-10-20
tool: tui-design-study
---

A design study for llama-deck, the keyboard-first TUI for discovering and running local llama.cpp models. Its thesis: the strongest TUIs feel dense, calm, and unmistakably native to the character grid — polish comes from hierarchy, alignment, semantic color, and instant response, not from adding more chrome.

## What it covers

- **Ten rules of a convincing TUI** — qualitative patterns distilled from terminal-community discussion: information first, honor the grid, make color mean something, keep chrome quiet.
- **The star signal** — what a local aggregation of 857 starred repositories says about which terminal projects read as "polished."
- **UI critique** — a code-level review of llama-deck's `src/ui` layer: strong bones, too many frames.
- **Change plan** — the fixes, in order, plus a compact design contract for the project.
- **Themes** — how a theme system can change appearance without changing meaning.

## Read it

[Open the interactive study](/tui-design-study/) — the full study as a standalone page, with the evidence and limits stated in it.

## Method and limits

Compiled 2026-09-15 from three streams: terminal-community discussions around r/unixporn aesthetics, the local star aggregation (extracted 2026-09-11), and a static review of llama-deck's UI code (2026-09-15). The application was not run live; the patterns are qualitative synthesis, not a formal survey.
