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

A browser-based workbench for formatting, viewing, querying, and converting between JSON, YAML, and TOML.

## Read it

[Open Data Format Workbench](/data-format-workbench/) — the full application, running as-is.

## Features

- **Convert**: Paste JSON, YAML, or TOML and the format is auto-detected (with a manual override). Conversion runs live as you type, into a collapsible tree view, JSON (2- or 4-space indent, or minified), YAML, or TOML. Values a format cannot represent — a top-level array or scalar as TOML, nulls inside TOML output — produce an explicit explanation instead of garbage. Parse errors are reported with line/position information wherever the parser provides it.
- **Inspect**: The tree view is collapsible node by node; clicking any node shows its JSONPath in the bar at the bottom (for example `$.store.book[0].author`).
- **Query**: A JSONPath field runs queries (JSONPath-Plus) against the parsed document and shows the matches as JSON, with a clear error for an invalid query.
- **Work comfortably**: Upload a file or load the built-in sample, reformat the input in place, copy or download the output, and drag the pane divider — or focus it and use the arrow keys. Your input and format choices persist in `localStorage`, so a refresh loses nothing.
- **Privacy**: Client-side only. No data is sent to a server.

## Notes

- The page is a static HTML file served straight from the site: `static/data-format-workbench/index.html`.
- YAML parsing/formatting is powered by [js-yaml](https://github.com/nodeca/js-yaml), TOML by [smol-toml](https://github.com/squirrelchat/smol-toml), and JSONPath queries by [JSONPath-Plus](https://github.com/JSONPath-Plus/JSONPath-Plus), all loaded from the jsDelivr CDN. The conversion logic itself is hand-written JavaScript in the page — including a syntax check before each query, because JSONPath-Plus silently returns empty results for most malformed queries instead of throwing.
- TOML datetimes are normalised to ISO strings in JSON/YAML output; JSON and YAML round-trip everything the input formats can express, TOML output is the constrained direction (top-level table, no nulls).
