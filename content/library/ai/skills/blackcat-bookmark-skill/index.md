---
title: "BlackCat Bookmark Skill"
type: skill
source: "https://github.com/Theblackcat98/TheBlackCat"
topics:
  - ai
tags:
  - knowledge-management
  - automation
  - tools
status: filed
created: 2026-08-28
updated: 2026-08-28
---

## Why I saved this

The Hermes Agent skill that automates adding bookmarks to this very library — the agent-side half of the Git-native workflow this repo is built around.

## Notes

A Hermes Agent skill (`blackcat-bookmark`) that saves URLs into this repository. Triggered by phrases like "bookmark this", it runs the full pipeline:

1. `git pull --ff-only` to sync the clone
2. Dedupe by URL against existing content (enrich instead of duplicating)
3. Fetch real page title/description
4. Reuse existing tags/topics (lowercase kebab-case)
5. Create `content/inbox/<slug>.md` following the bookmark archetype front matter
6. Commit only that file, push, verify on origin via `gh api`

Design constraints: the repo is public so only public info is written; new items always start in `content/inbox/` with `status: filed` per AGENTS.md; never modifies unrelated files. Weekly triage then moves inbox items into `content/library/<domain>/` (Sundays 23:00, automated).

The skill lives in the agent's skill store; this entry documents its behavior as part of the library's own operating manual.
