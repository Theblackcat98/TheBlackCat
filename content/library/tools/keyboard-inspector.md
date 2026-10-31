---
title: "Keyboard Event Inspector"
contenttype: reference
description: "Press any key to see key, code, keyCode and modifiers, with a ready-to-paste event handler."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - utilities
status: filed
created: 2026-10-30
updated: 2026-10-30
tool: keyboard-inspector
---

See exactly what the browser reports for a key press.

## Open it

[Open the Keyboard Event Inspector](/keyboard-inspector/)

## Features

- **Live readout**: `key`, `code`, `keyCode`, `location`, modifier state and repeat flag for the last event.
- **Capture**: keydown and keyup can be toggled independently, and the browser's default action is suppressed except for Tab so you can inspect shortcuts.
- **Copy**: the event as JSON, or a handler snippet for the key you pressed.
- **Log**: a scrolling history of recent events.

## Notes

- The page is a static HTML file served straight from the site: `static/keyboard-inspector/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Some keys and shortcuts are reserved by the operating system or browser and never reach the page.
