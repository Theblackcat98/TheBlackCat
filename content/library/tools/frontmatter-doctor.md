---
title: "Hugo Frontmatter Doctor"
contenttype: reference
description: "A tool to validate and auto-fix Hugo Markdown frontmatter against the specific lint rules used by The BlackCat."
topics:
  - tools
tags:
  - web
  - html
  - agent
status: filed
created: 2026-10-30
updated: 2026-10-30
---

A client-side tool to validate Markdown frontmatter against The BlackCat's content model and lint rules, explaining why each rule matters and providing a one-click auto-fixed version.

## Use it

[Open the Frontmatter Doctor](/frontmatter-doctor/) — paste your Markdown or frontmatter to check it.

## What it checks

The doctor encodes the rules from `AGENTS.md` and `scripts/lint_content.py`:

- **Required fields**: `title` and `contenttype`.
- **Reserved fields**: prevents the use of Hugo reserved fields like `url` and `type`, which break routing when used for other purposes.
- **Data formats**: enforces `YYYY-MM-DD` dates, arrays for lists, and absolute HTTP(S) URLs for `source`.
- **Taxonomy**: ensures tags and topics are lowercase-kebab-case.
- **Completeness**: warns if descriptions are missing (used heavily for cards and agent retrieval).

## Features

- **Rule validation**: Lists errors (things that break the build or violate hard rules) and warnings (drift worth fixing).
- **Auto-fix**: Generates a valid version by fixing dates, ensuring arrays, kebab-casing tags, and reordering the fields to a consistent logical order.
- **Generator**: A small form to generate a valid starting frontmatter block for any supported content type.
- **Privacy**: The tool runs entirely in the browser using Vanilla JS and `js-yaml`. No data is sent to a server.
