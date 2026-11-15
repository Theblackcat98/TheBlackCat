---
title: "Color Token Workshop"
contenttype: reference
description: "OKLCH palette builder with WCAG 2.1 and APCA contrast checks, auto-fix suggestions, light and dark palettes, and CSS/JSON export."
topics:
  - tools
tags:
  - color
  - design
  - web
  - accessibility
status: filed
created: 2026-11-14
updated: 2026-11-14
tool: color-token-workshop
aliases: [/library/tools/semantic-token-mapper/]
---

The Color & Token Studio: one browser app for building a color system and checking it. It pairs the Color Token Workshop — previously hosted with the Online-Tools collection and moved here on 2026-11-14 — with the Semantic Token Mapper, which was merged into it as the final **Token Mapper** step on the same day. The standalone mapper's page now redirects here.

## The Workshop

Start from a single brand hue and a harmony rule, and the Workshop generates matched light and dark palettes in OKLCH, so lightness steps stay perceptually even. Guided steps walk the token groups — foundation, text and links, brand and actions, semantic colors — with a live preview and a per-pair contrast audit against WCAG 2.1 and APCA (the WCAG 3 draft metric). Failing pairs can be fixed in place: the fixer moves OKLCH lightness only, foreground first, and reports honestly when lightness alone cannot get a pair to AA.

Work autosaves to the browser, every change is undoable, and a seed can be shared as a link that recreates it. Export is both palettes as CSS variables (dark behind `[data-theme="dark"]` or a `prefers-color-scheme` media query) or as JSON — the JSON shape is the one Palette Studio imports.

## The Token Mapper

The last step covers colors that are not part of the generated palettes: a partner's brand color, a legacy token, a one-off component. Name a pair, set its background and text colors, and it gets a live preview and an exact WCAG ratio with an AA / AAA verdict, using the same contrast math as the audit. Add as many pairs as you need; they autosave alongside the palettes.

[Open the Color Token Workshop](/color-token-workshop/)
