---
title: "Semantic Token Mapper"
contenttype: "reference"
description: "A utility for mapping and testing design system colors against WCAG contrast rules in bulk."
created: 2024-10-29
updated: 2024-10-29
---

## What it is

The Semantic Token Mapper is a client-side visual testing tool. You pair background and foreground colors (like a button background and its label text), and it automatically calculates the relative luminance and determines if the combination passes WCAG AA or AAA contrast thresholds.

## Why it's useful

When building a design system or CSS token file (`assets/css/00-tokens.css`), ensuring accessibility across light and dark modes is difficult.

- **Instant math:** Calculates exact contrast ratios instantly as you adjust color pickers.
- **Visual proof:** Shows a live preview of the text on the background.
- **Bulk testing:** Add as many semantic pairs as you need and evaluate your entire palette on one screen.

[Open the Semantic Token Mapper](/semantic-token-mapper/)
