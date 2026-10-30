---
title: "Time & ID Toolkit"
contenttype: reference
description: "A dual-function utility: a Timestamp Toolkit for epoch/ISO conversions, relative math, and timezone shifts, paired with a UUID/ULID Studio for bulk generation and deep inspection of modern IDs."
topics:
  - tools
  - programming
tags:
  - tools
  - web
  - html
status: filed
created: 2026-10-30
updated: 2026-10-30
---

A completely client-side toolkit that helps decipher time and identity structures commonly encountered when debugging logs, databases, or API responses.

## Read it

[Open the Time & ID Toolkit](/time-id-toolkit/) — the full interactive page, running as-is.

## What is inside

### Timestamp Toolkit

- **Epoch Converter**: Bidirectional conversion between Unix epochs (seconds, milliseconds, nanoseconds) and human-readable dates.
- **Timezone Shifts**: View localized times in any IANA timezone.
- **Relative Time Math**: Calculate offsets like `+3d -12h` or understand how far away a timestamp is (`in 3h 20m`).
- **Live Clock**: A running Unix epoch and ISO 8601 clock.

### UUID/ULID Studio

- **Bulk Generator**: Produce 1 to 100 identifiers at a time. Supports UUID v4 (random), UUID v7 (time-sortable), ULID, and NanoID.
- **ID Inspector**: Paste an identifier to decode its type, version, validity, and any embedded timestamp data (useful for v7 and ULID). Flags malformed IDs with specific reasons.

## Notes

- The page is a static HTML file served straight from the site: `static/time-id-toolkit/index.html`. It stores preferences (like your selected timezone and last viewed tab) in `localStorage`.
- All ID generation uses pure JavaScript implementations within the page, keeping the payload small without relying on external CDNs or network calls.
- Designed with Outfit and JetBrains Mono fonts, and matching the site's dark/light token system.
