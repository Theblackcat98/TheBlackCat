---
title: "SQL Formatter"
contenttype: reference
description: "Format and minify SQL across eight dialects with keyword-case and indent controls, entirely in the browser."
topics:
  - tools
tags:
  - sql
  - database
  - web
  - javascript
status: filed
created: 2026-10-30
updated: 2026-10-30
---

A browser-based SQL formatter and minifier. Paste a query, pick the dialect and house style, and get it back laid out readably — or collapsed to one line for embedding in code and config.

## Read it

[Open the SQL Formatter](/sql-formatter/) — the full tool, running as-is.

## Features

- **Dialects**: Standard SQL, PostgreSQL, MySQL, MariaDB, SQLite, BigQuery, Snowflake and Transact-SQL. The dialect list is checked against the loaded library at runtime; anything the build does not support is disabled in the picker.
- **Style controls**: keyword case (upper, lower, or preserve the original) and indentation (2 spaces, 4 spaces, or tabs), plus an auto-format toggle that reformats as you type.
- **Minify**: a hand-rolled pass that collapses whitespace outside string literals and comments, so a query can be shrunk without changing what it means.
- **Safe round-trips**: formatting only moves whitespace. String literals, quoted identifiers and comments survive a format untouched.
- **Workflow**: live line/character counts for both panes, one-click copy, download as a `.sql` file, a loadable sample query, and `Ctrl`/`⌘` + `Enter` to format. Input and settings persist in `localStorage`.
- **Errors in the open**: parser errors from the library are shown with their message instead of failing silently. If the library cannot be loaded (offline, CDN blocked), the page says so and Minify, Copy and Download still work.

## Notes

- The page is a static HTML file served straight from the site: `static/sql-formatter/index.html`.
- Formatting is powered by the [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) library (v15) via jsDelivr CDN.
- Client-side only. No SQL, files, or strings are sent to any server.
