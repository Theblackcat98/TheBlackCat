---
title: "Meta Tag & Web Manifest Generator"
contenttype: reference
description: "A client-side tool to generate HTML meta tags and PWA Web Manifest JSON with live previews and validations."
topics:
  - web
  - tools
tags:
  - html
  - seo
  - pwa
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: meta-generator
---

A single-page, client-side utility to help author full HTML meta tag blocks and PWA `site.webmanifest` JSON files. It includes length meters for SERP truncations and live mock previews of how a page unfurls on social media platforms.

## Read it

[Open the generator](/meta-generator/) — the tool runs entirely in the browser without any backend dependencies.

## What is inside

- **Meta Tags:** Generate title, description, canonical URL, OpenGraph elements, Twitter cards, and robots indexing directives.
- **Web Manifest:** Define PWA parameters like app name, short name, display mode, background colors, and expected icon sizes.
- **Live Validations & Previews:** See length constraint warnings as you type, catch missing recommended tags, and view generic approximations of SERP and social card unfurling.
- **Data Persistence:** Uses `localStorage` to save your work, preventing data loss on accidental page refreshes.
- **Zero Dependencies:** Built with Vanilla HTML, CSS, and JavaScript. No build steps, APIs, or external libraries.

## Notes

- The tool is served directly as a static file at `static/meta-generator/index.html`.
- The live mock previews are layout approximations. Real-world renderers (like X, Slack, or Google) frequently update their visual designs and truncation thresholds.
