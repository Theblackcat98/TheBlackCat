---
title: "Unicode Explorer"
contenttype: reference
description: "Search Unicode characters by name or codepoint, browse blocks, and inspect any string character by character — codepoints, UTF-8/UTF-16 encodings, categories, and scripts, entirely in the browser."
topics:
  - tools
tags:
  - unicode
  - web
  - javascript
status: filed
created: 2026-10-30
updated: 2026-10-30
---

A browser-based explorer for the Unicode character set: find a character by name or codepoint, browse a block visually, or paste a whole string to see exactly what is in it — including the invisible and combining characters that plain text hides.

## Read it

[Open Unicode Explorer](/unicode-explorer/) — the full explorer application, running as-is.

## Features

- **String Inspector**: Paste any string and get a per-character table — glyph, codepoint (`U+XXXX`), decimal value, Unicode name, general category, script, UTF-8 bytes, UTF-16 code units, and HTML entity. Iteration is by code point, so astral-plane characters (most emoji) count once, not as a surrogate pair. Invisible, whitespace, format, and combining characters are shown against a dotted-circle placeholder so they stay legible.
- **Search**: By name substring (`snowman`), by codepoint (`U+2603`, `2603`, `0x2603`, `&#x2603;`, or the decimal `9731`), or by pasting a single character.
- **Browse**: A clickable grid for each covered block — Latin, Greek, Cyrillic, punctuation, currency, arrows, math operators, geometric shapes, dingbats, and the main emoji blocks.
- **Character detail**: Any character from search, browse, or the inspector opens a detail panel with one-click copy buttons for the character itself, its codepoint, and its HTML entity.
- **Persistence**: The inspector restores your last input from `localStorage` on reload.
- **Privacy**: Client-side only. Nothing you paste is sent anywhere.

## Dataset coverage — the honest version

Character names come from a dataset of **4,723 named characters** (Unicode 15.0), generated from Python's `unicodedata` module and committed with the page as `static/unicode-explorer/unicode-data.js` (~141 KB). It covers: Basic Latin through Latin Extended, Greek (including Greek Extended), Cyrillic, general and supplemental punctuation, currency symbols, letterlike symbols, number forms, arrows, mathematical operators, miscellaneous technical symbols, box drawing and block elements, geometric shapes, miscellaneous symbols, dingbats, and the emoji blocks (Miscellaneous Symbols and Pictographs, Emoticons, Ornamental Dingbats, Transport and Map, Supplemental Symbols and Pictographs, and Symbols and Pictographs Extended-A).

That is a useful subset, not all of Unicode: CJK, Hangul, Hebrew, Arabic, Indic scripts, and the historic scripts are **not** in the name dataset. Characters outside it still inspect completely — codepoint, category, script, and encodings are derived live in JavaScript (via Unicode property-escape regular expressions) and need no dataset; only the name lookup comes back empty for them.

## Notes

- The page is a static HTML file served straight from the site: `static/unicode-explorer/index.html`, plus the generated `unicode-data.js` beside it. No build step, no libraries.
- Category and script detection uses the browser's own Unicode tables (`\p{General_Category=…}` and `\p{Script=…}`), so those two fields can be newer than the name dataset.
