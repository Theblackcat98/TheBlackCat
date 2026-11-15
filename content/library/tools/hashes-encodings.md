---
title: "Hashes & Encodings"
contenttype: "reference"
description: "Hash text or files with MD5, SHA-1, SHA-224/256/384/512, SHA3 and Keccak plus CRC checksums, and convert between Base64, Base32, Base58, hex, URL and HTML entity encodings — all in the browser."
topics:
  - tools
tags:
  - web
  - html
  - javascript
status: filed
created: 2026-11-14
updated: 2026-11-14
tool: hashes-encodings
---

## What it is

Hashes & Encodings is a single-page workbench for the two jobs that used to mean a trip to the legacy Online-Tools site: digesting text or files, and converting between text encodings. It now lives on this site as a self-contained page — no server, no external libraries, nothing uploaded.

## Hashes

Type text (hashed as UTF-8) or pick a file (hashed as its raw bytes) and every digest updates at once, each with its own copy button:

- MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512
- SHA3-256, SHA3-512 and Keccak-256
- CRC32 and CRC-16/MODBUS checksums

SHA-1 and the larger SHA-2 digests use the browser's WebCrypto API. MD5, SHA-224, the SHA3/Keccak family and both CRCs are computed by small implementations built into the page itself.

## Encodings

A second tab converts in both directions, live as you type:

- Base64 (Unicode-safe), Base32 (RFC 4648) and Base58 (Bitcoin alphabet)
- Hex, URL encoding (encodeURIComponent semantics) and HTML entities

Invalid input on the decode side gets a plain-language error instead of a broken page.

## Privacy

Everything runs locally in the browser. Files are read into memory on your machine only — closing the tab discards them.
