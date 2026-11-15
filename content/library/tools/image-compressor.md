---
title: "Image Studio"
contenttype: reference
description: "Compress, convert and crop images in the browser, with an aspect-ratio calculator, interactive crop, before/after comparison and EXIF/GPS stripping."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - image-processing
status: filed
created: 2026-10-30
updated: 2026-11-14
tool: image-compressor
aliases:
  - /library/tools/aspect-ratio-calculator/
---

Shrink photos and graphics, crop them to a chosen aspect ratio, switch formats, and drop camera and location metadata without uploading anything. (Formerly the Image Compressor; it absorbed the Aspect Ratio & Resize Calculator on 2026-11-14.)

## Open it

[Open Image Studio](/image-compressor/)

## Features

- **Formats**: output WebP, AVIF, JPEG or PNG. AVIF is offered only where the browser can encode it.
- **Quality and size**: a quality slider (ignored for lossless PNG) plus optional max width and height that keep the aspect ratio.
- **Crop to a ratio**: each loaded image has a Crop panel — pick a ratio (16:9, 4:3, 1:1, custom, and more), drag the crop window or resize it from a corner, and apply. The cropped region feeds the same compress/convert pipeline, so downloads come out cropped, resized and re-encoded in one step.
- **Ratio calculator**: a standalone calculator (dimension presets included) that simplifies any width × height to its ratio and megapixels, with an optional aspect-ratio lock.
- **Before and after**: each result shows the new size and percent saved, flags files that came out larger than the original, and has a draggable comparison view.
- **Metadata removal**: re-encoding strips EXIF, GPS and other metadata. For JPEGs the tool reports how much metadata was removed and whether GPS was present. EXIF rotation is applied first so photos stay upright.
- **Batch**: drop or paste several images, download one at a time or all as a zip.

## Notes

- The page is a static HTML file served straight from the site: `static/image-compressor/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Images are decoded and re-encoded with `createImageBitmap` and canvas, on your device. Nothing is uploaded.
- Animated GIFs keep only their first frame.
- Format, quality, size and calculator settings persist in `localStorage`; images do not. Settings saved by the old Aspect Ratio tool (its `arc-state` key) are imported on first load.
