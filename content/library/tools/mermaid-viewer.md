---
title: "Mermaid Viewer"
contenttype: reference
description: "Write Mermaid diagram source in a line-numbered editor, render it live with pan and zoom, browse a built-in gallery of every diagram type, and export SVG or PNG — entirely in the browser."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - mermaid
  - svg
status: filed
created: 2026-11-14
updated: 2026-11-14
tool: mermaid-viewer
---

A browser-based viewer and editor for Mermaid diagrams, running completely client-side: write source, see the rendered diagram, and export it without anything leaving the page.

## Read it

[Open Mermaid Viewer](/mermaid-viewer/) — the full viewer application, running as-is.

## Features

- **Editor**: Line-numbered code editor with Tab support, adjustable font size, optional word wrap, and a draggable split between code and preview. Syntax errors are reported inline with the offending line highlighted in the gutter.
- **Preview**: Live rendering with drag-pan, pinch and wheel zoom, zoom controls, fit-to-view, and fullscreen. Five Mermaid themes.
- **Gallery**: Every Mermaid diagram type built in — 23 types with working examples, search and category filters, and one-click load into the editor.
- **Export**: Download the diagram as SVG or as a 3x PNG, save the source as a `.mmd` file, or copy the code or SVG markup.
- **Persistence**: Your code and preferences are kept in the browser's local storage, so the viewer reopens where you left off.

## Notes

- The page is a static HTML file served straight from the site: `static/mermaid-viewer/index.html`.
- Rendering is powered by [Mermaid](https://mermaid.js.org/) 12.2.0 via the jsDelivr CDN.
- The viewer was previously hosted in the Online-Tools repository and moved here on 2026-11-14. Both sites live on the same origin, and the storage keys are unchanged, so saved code and preferences carry over.
