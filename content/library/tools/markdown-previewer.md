---
title: "Markdown & Hugo Studio"
contenttype: reference
description: "One studio for the site's Markdown work: live preview with the site's shortcodes, a frontmatter doctor with auto-fix, a JSON-to-Hugo converter, and a Markdown table builder."
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
updated: 2026-11-14
tool: markdown-previewer
aliases:
  - /library/tools/frontmatter-doctor/
  - /library/tools/json-to-hugo/
  - /library/tools/markdown-table-generator/
---

Four of the site's writing tools in one studio. It began as the Markdown & Shortcode Previewer and absorbed the Frontmatter Doctor, JSON-to-Hugo, and the Markdown Table Generator, which used to live at their own URLs.

## Open it

[Open the Markdown & Hugo Studio](/markdown-previewer/)

## The four tabs

- **Preview**: draft a post and see roughly how it will look on this site before committing it. Headings with anchors, lists, task lists, tables, code fences, blockquotes, links and images, styled like the site's prose, plus an on-this-page contents list. The `callout` shortcode renders with Markdown inside, and `anatomy` shows its thumbnail with a link to the full figure. Sample document, word count and reading time, and download as `draft.md`.
- **Frontmatter**: the Frontmatter Doctor. Paste a Markdown file or just its frontmatter to check it against the site's rules — required fields, reserved Hugo fields (`url:`, `type:`), `YYYY-MM-DD` dates, lists for tags/topics/related, kebab-case taxonomy — with a one-click auto-fixed version to copy or download, and a generator for a valid starting block in any of the seven content types.
- **Convert**: JSON-to-Hugo. Paste a JSON object or API response and get Hugo-ready YAML front matter back, converted as you type.
- **Tables**: the Markdown Table Generator as an editable grid — type into the cells, add or remove rows and columns, or import CSV, TSV or an existing Markdown table — and copy the padded, aligned Markdown out.

## One linter, two places

The Preview tab's checks and the Frontmatter tab run the *same* linter: flags `type:` instead of `contenttype:`, `url:` instead of `source:`, a body `h1`, skipped heading levels, code fences with no language, missing alt text, hard-coded `/TheBlackCat/` links, unknown shortcode types, and an `anatomy` shortcode without a slug, alongside the Doctor's full frontmatter rule list. There used to be two copies of the frontmatter rules — the previewer's own and the Doctor's — and they had already drifted apart; now there is one implementation.

## Notes

- The page is a static HTML file served straight from the site: `static/markdown-previewer/index.html`. Vanilla JavaScript, no libraries and no third-party requests — the Doctor's old `js-yaml` CDN dependency went away in the merge, replaced by a small built-in parser for the YAML subset this site's front matter uses.
- The preview is an approximation. Raw HTML is shown as text and code is not syntax-highlighted; the real site build is the source of truth.
- Your work in every tab is kept in `localStorage` and never sent anywhere. A draft saved in the old standalone Frontmatter Doctor is picked up by the Frontmatter tab on first load.
