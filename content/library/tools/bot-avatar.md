---
title: "Bot Avatar Studio"
contenttype: reference
description: "Design a silhouette bot avatar with moods and cursor-tracking eyes, then export SVG, JSON, a share link or an image prompt."
topics:
  - design
  - tools
tags:
  - svg
  - design
  - javascript
  - color
  - image-generation
status: filed
created: 2026-11-01
updated: 2026-11-01
tool: bot-avatar
---

A mascot generator that produces something you can actually ship: a flat
silhouette with a body, a colour and a mood, drawn as SVG in the browser.

## Open it

[Open the Bot Avatar Studio](/bot-avatar/)

## Features

- **Eight bodies**: bot, controller, blob, bulb, chat, bunny, fish, heart — each a hand-authored silhouette rather than a stretched preset.
- **Four moods**: idle (blinks), thinking (squint plus an orbiting dot), happy (crescent eyes and a hop), sleepy (flat lids, a breathing body and a drifting z).
- **Eyes that follow the cursor**, smoothed with a lerp so they glide instead of snapping; the whole thing settles when you stop moving.
- **Eleven colours** that survive both light and dark themes, with a hairline outline added automatically to the pale ones so they stay visible on cream paper.
- **Exports**: a flat SVG still, a portable JSON definition (geometry and colour only), a share link that carries the whole avatar in the query string, and a written image-generation prompt for the same character.
- **Import**: paste a definition or load a JSON file; unknown bodies or colours are rejected with a message instead of a broken render.

## Notes

- The page is a static HTML file served straight from the site: `static/bot-avatar/index.html`. Vanilla JavaScript, no libraries, no third-party requests, no uploads — nothing leaves the browser.
- The SVG export is a still in the current colour and mood, not an animation; the JSON is the portable form. Cut-out eyes are resolved to the theme's actual surface colour at export time so the file looks right outside the page.
- Motion follows the system reduced-motion setting by default; the Motion control overrides it either way.
- Self-contained enough to be the start of a small set: the shape table is data, so adding a ninth body is one array entry.
