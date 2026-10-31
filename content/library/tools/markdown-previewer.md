---
title: "Markdown & Shortcode Previewer"
contenttype: reference
description: "Live Markdown preview that understands this site's callout and anatomy shortcodes and checks front matter against the content rules."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - markdown
  - hugo
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: markdown-previewer
---

Draft a post and see roughly how it will look on this site before committing it.

## Open it

[Open the Markdown Previewer](/markdown-previewer/)

## Features

- **Live preview**: headings with anchors, lists, task lists, tables, code fences, blockquotes, links and images, styled like the site's prose, plus an on-this-page contents list.
- **Shortcodes**: the `callout` shortcode renders with Markdown inside, and `anatomy` shows its thumbnail with a link to the full figure.
- **Checks**: flags `type:` instead of `contenttype:`, `url:` instead of `source:`, a body `h1`, skipped heading levels, code fences with no language, missing alt text, hard-coded `/TheBlackCat/` links, unknown shortcode types, and an `anatomy` shortcode without a slug.
- **Tools**: sample document, word count and reading time, and download as `draft.md`.

## Notes

- The page is a static HTML file served straight from the site: `static/markdown-previewer/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- The preview is an approximation. Raw HTML is shown as text and code is not syntax-highlighted; the real site build is the source of truth.
- Your draft is kept in `localStorage` and never sent anywhere.
