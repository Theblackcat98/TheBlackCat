---
title: "Web Metadata & PWA Studio"
contenttype: reference
description: "One studio for a page's head and PWA presence: HTML meta tags, social-card previews, a favicon and app-icon generator, and a unified Web Manifest builder."
topics:
  - web
  - tools
tags:
  - html
  - seo
  - pwa
  - icons
status: filed
created: 2026-10-30
updated: 2026-11-14
tool: meta-generator
aliases:
  - /library/tools/og-previewer/
  - /library/tools/favicon-generator/
---

One client-side studio for everything that describes a page to browsers, search engines, social platforms and home screens. It merges the former Meta Tag & Web Manifest Generator, the OpenGraph Social Card Previewer and the Favicon & App Icon Generator into a single page with three tabs.

## Read it

[Open the studio](/meta-generator/) — the tool runs entirely in the browser without any backend dependencies.

## What is inside

- **Meta tags:** Generate title, description, canonical URL, OpenGraph elements, Twitter cards, and robots indexing directives, with length meters for SERP truncation, as-you-type validation, and a missing-recommendations checklist.
- **Social preview:** Live mock previews driven by the meta tab's values — a search-result approximation plus the platform cards from the old OpenGraph Previewer (X/Twitter summary card with large image, and LinkedIn), so truncation and cropping are visible before you publish.
- **Icons & manifest:** The full favicon generator — a letter, emoji or uploaded image (PNG, JPEG, WebP or SVG) rendered to `favicon.ico` (16, 32 and 48 px), 16 and 32 px PNGs, a 180 px Apple touch icon, 192 and 512 px Android icons and a 512 px maskable icon, with background, padding and corner-radius controls, a browser-tab preview and a one-zip download. Beside it, one unified `site.webmanifest` builder: the manifest fields (name, short name, description, display mode, start URL, colors) with icon entries that point at the real files the generator produces. The zip ships that same manifest.
- **Data Persistence:** Uses `localStorage` to save your work, preventing data loss on accidental page refreshes. Settings saved by the retired Favicon Generator are imported on first load.
- **Zero Dependencies:** Built with Vanilla HTML, CSS, and JavaScript. No build steps, APIs, or external libraries. The ICO file is written by hand with PNG-compressed entries, and the zip by a small built-in writer.

## Notes

- The tool is served directly as a static file at `static/meta-generator/index.html`. The retired `/og-previewer/` and `/favicon-generator/` tools were merged into it on 2026-11-14; their write-up URLs redirect here via the aliases above.
- The live mock previews are layout approximations. Real-world renderers (like X, LinkedIn, or Google) frequently update their visual designs and truncation thresholds.
