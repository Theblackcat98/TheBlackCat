---
title: "Text Diff Viewer"
contenttype: reference
description: "Compare two texts line by line with word-level highlighting, side-by-side or unified output, entirely in the browser."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - text
status: filed
created: 2026-10-30
updated: 2026-10-30
---

A browser-based viewer for comparing two versions of a text — code, prose, config, anything line-oriented — without sending either version anywhere.

## Read it

[Open the Text Diff Viewer](/text-diff-viewer/) — the full diff application, running as-is.

## Features

- **Line diff**: A hand-rolled longest-common-subsequence diff in vanilla JavaScript (no library, no network calls) compares the two panes line by line and updates live as you type.
- **Word-level highlighting**: Inside a changed line pair, the exact words that differ are highlighted on both sides, so a one-word edit does not light up the whole line.
- **Two views**: Side-by-side (original and revised in paired columns, each with its own line numbers) or unified (one column with `+` / `−` markers and both line-number columns), switchable with a segmented control.
- **Compare options**: Ignore leading/trailing whitespace, ignore case, and ignore blank lines — each recomputes the diff instantly.
- **Stats and actions**: Added / removed / changed line counts in a stats bar, plus Swap panes, Clear, Load sample, and Copy unified diff (a `---` / `+++` / `@@` patch-style rendering of the current comparison).
- **Persistence**: Both inputs, the compare options, and the chosen view are kept in `localStorage`, so a refresh does not lose the comparison.

## Notes

- The page is a static HTML file served straight from the site: `static/text-diff-viewer/index.html`.
- Client-side only: the diff engine is implemented in the page itself, so the tool works offline once loaded and no text ever leaves the browser.
