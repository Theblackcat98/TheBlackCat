---
title: "Content Security Policy Builder"
description: "A directive-by-directive CSP builder with presets, warnings, and a parser mode."
contenttype: "reference"
status: filed
created: 2026-10-30
updated: 2026-10-30
tags:
  - web
  - tools
topics:
  - programming
  - tools
---

The CSP Builder is a client-side tool for constructing, parsing, and verifying Content-Security-Policy rules.

## Features

- **Builder Mode**: A directive-by-directive form to create policies safely.
- **Parse Mode**: Paste an existing CSP string to see it explained directive-by-directive.
- **Safety Warnings**: Live flagging of high-risk directives like `'unsafe-inline'` and `'unsafe-eval'`.
- **Output Formats**: Generate policies for HTML Meta tags, generic HTTP headers, Nginx, or Apache.
