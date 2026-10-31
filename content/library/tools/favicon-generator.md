---
title: "Favicon & App Icon Generator"
contenttype: reference
description: "Make every favicon and app icon size from one image or a letter, with the web manifest, HTML link tags and a zip download."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - pwa
  - design
status: filed
created: 2026-10-30
updated: 2026-10-30
---

Generate a complete icon set from a single source, then paste the tags into your page head.

## Open it

[Open the Favicon Generator](/favicon-generator/)

## Features

- **Sources**: a letter or emoji with font and color choices, or an uploaded PNG, JPEG, WebP or SVG. An SVG is also included unchanged as `favicon.svg`.
- **Output set**: `favicon.ico` (16, 32 and 48 px), 16 and 32 px PNGs, a 180 px Apple touch icon, 192 and 512 px Android icons, and a 512 px maskable icon.
- **Style controls**: background fill, padding and corner radius. The Apple and maskable icons are always filled, and the maskable icon keeps artwork inside the safe zone.
- **Copy-ready code**: the `<link>` and theme-color tags and a `site.webmanifest`, with a path prefix field for project sites that live under a subpath.
- **Download**: everything as one zip, with a live browser tab preview.

## Notes

- The page is a static HTML file served straight from the site: `static/favicon-generator/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- The ICO file is written by hand with PNG-compressed entries, and the zip by a small built-in writer.
- Settings persist in `localStorage`; uploaded images do not.
