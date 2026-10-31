---
title: "Robots.txt & Sitemap Builder"
contenttype: reference
description: "Build robots.txt with crawler presets and a rule tester, and generate sitemap.xml from a list of URLs."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - seo
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: robots-sitemap
---

Write crawl rules and a sitemap in one place, and test the rules before shipping them.

## Open it

[Open the Robots.txt & Sitemap Builder](/robots-sitemap/)

## Features

- **Rule groups**: per-user-agent allow and disallow rules, crawl-delay and sitemap lines, with presets for allow-all, block-all, static sites and blocking AI crawlers.
- **Import and lint**: paste an existing robots.txt to edit it and get warnings about common mistakes.
- **Tester**: check a URL against the rules using the RFC 9309 matching order (longest match wins, `*` and `$` supported).
- **Sitemap**: build `sitemap.xml` from a list of URLs with optional lastmod, properly escaped, with duplicate and host-mismatch warnings, and add its location to robots.txt.

## Notes

- The page is a static HTML file served straight from the site: `static/robots-sitemap/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Robots.txt is advisory. It asks well-behaved crawlers to stay out and is not access control.
