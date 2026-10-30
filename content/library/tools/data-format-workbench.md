---
title: "Data Format Workbench"
contenttype: reference
description: "Data-format workbench: combining a JSON workbench with a YAML/TOML/JSON converter."
topics:
  - tools
tags:
  - web
  - json
  - yaml
  - toml
status: filed
created: 2026-10-30
updated: 2026-10-30
---

A browser-based workbench for formatting, viewing, and converting between JSON, YAML, and TOML.

## Read it

[Open Data Format Workbench](/data-format-workbench/) — the full application, running as-is.

## Features

- **Convert**: Auto-detects input format and converts losslessly between JSON, YAML, and TOML.
- **Inspect**: Provides a collapsible tree view of the data structure.
- **Query**: Allows JSONPath queries to highlight specific nodes.
- **Privacy**: Client-side only. No data is sent to a server.

## Notes

- The page is a static HTML file served from `static/data-format-workbench/index.html`.
- Powered by `js-yaml` and `smol-toml`.
