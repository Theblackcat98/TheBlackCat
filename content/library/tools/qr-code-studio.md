---
title: "QR Code Studio"
contenttype: reference
description: "Generate customizable QR codes (text, URL, Wi-Fi, vCard) and decode QR codes from images entirely in the browser."
topics:
  - tools
tags:
  - web
  - html
  - javascript
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: qr-code-studio
---

A browser-based studio for working with QR codes, supporting both generation and decoding in a completely offline, privacy-respecting client-side environment.

## Read it

[Open QR Code Studio](/qr-code-studio/) — the full studio application, running as-is.

## Features

- **Generate**: Create QR codes with custom text, URLs, Wi-Fi credentials, or vCards. Controls are provided for setting size, error correction level, foreground and background colors, and the quiet zone (margin). It features a contrast warning if the colors chosen are not scannable, and allows downloading as PNG or SVG.
- **Decode**: Upload or drag-and-drop an image to extract its QR code payload. It includes automatic type detection for URLs, Wi-Fi credentials, and plain text.
- **Privacy**: Client-side only. No data, files, or strings are sent to any server.

## Notes

- The page is a static HTML file served straight from the site: `static/qr-code-studio/index.html`.
- Generation is powered by the [qrcode](https://www.npmjs.com/package/qrcode) library via jsDelivr CDN.
- Decoding is powered by the [jsQR](https://github.com/cozmo/jsQR) library via jsDelivr CDN.
