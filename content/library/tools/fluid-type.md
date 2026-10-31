---
title: "Fluid Type Calculator"
contenttype: reference
description: "Generate clamp() font sizes that scale smoothly between two viewport widths, with a modular scale and a WCAG zoom check."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - design
  - calculator
status: filed
created: 2026-10-30
updated: 2026-10-30
---

Work out `clamp()` values so type grows with the viewport instead of jumping at breakpoints.

## Open it

[Open the Fluid Type Calculator](/fluid-type/)

## Features

- **clamp() output**: give a minimum and maximum size in px and the viewport range; get `clamp(rem, rem + vw, rem)` ready to paste.
- **Type scale**: generate a whole modular scale with fluid steps and copy it as `--step-N` custom properties.
- **Accessibility check**: warns when the maximum is more than 2.5 times the minimum, since that can fail WCAG zoom requirements.
- **Live preview**: drag a viewport slider and see the computed size.

## Notes

- The page is a static HTML file served straight from the site: `static/fluid-type/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Values are computed in `rem` from a root font size you can set (default 16 px), so they respect user font-size settings.
