---
title: "Number Base & Bitwise Converter"
contenttype: reference
description: "Convert between binary, octal, decimal and hex at 8 to 64 bits, try bitwise operations, and work out chmod and umask values."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - calculator
  - utilities
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: number-base
---

Move between bases at a fixed bit width and see exactly which bits are set.

## Open it

[Open the Number Base Converter](/number-base/)

## Features

- **Conversion**: binary, octal, decimal and hex at 8, 16, 32 or 64 bits, with signed and unsigned readings and overflow warnings. Uses `BigInt`, so 64-bit values are exact.
- **Bit grid**: click bits to flip them and watch every base update.
- **Bitwise operations**: AND, OR, XOR, NOT, shifts including arithmetic shift, and rotates.
- **chmod and umask**: toggle permissions or type octal, see the symbolic form including setuid, setgid and sticky, and turn a umask into the resulting file and directory modes.

## Notes

- The page is a static HTML file served straight from the site: `static/number-base/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Everything is computed locally; there are no inputs to send anywhere.
