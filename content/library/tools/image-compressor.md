---
title: "Image Compressor & Converter"
contenttype: reference
description: "Compress and convert images to WebP, AVIF, JPEG or PNG in the browser, with before/after comparison and EXIF/GPS stripping."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - image-processing
status: filed
created: 2026-10-30
updated: 2026-10-30
---

Shrink photos and graphics, switch formats, and drop camera and location metadata without uploading anything.

## Open it

[Open the Image Compressor](/image-compressor/)

## Features

- **Formats**: output WebP, AVIF, JPEG or PNG. AVIF is offered only where the browser can encode it.
- **Quality and size**: a quality slider (ignored for lossless PNG) plus optional max width and height that keep the aspect ratio.
- **Before and after**: each result shows the new size and percent saved, flags files that came out larger than the original, and has a draggable comparison view.
- **Metadata removal**: re-encoding strips EXIF, GPS and other metadata. For JPEGs the tool reports how much metadata was removed and whether GPS was present. EXIF rotation is applied first so photos stay upright.
- **Batch**: drop or paste several images, download one at a time or all as a zip.

## Notes

- The page is a static HTML file served straight from the site: `static/image-compressor/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Images are decoded and re-encoded with `createImageBitmap` and canvas, on your device. Nothing is uploaded.
- Animated GIFs keep only their first frame.
- Format, quality and size settings persist in `localStorage`; images do not.
