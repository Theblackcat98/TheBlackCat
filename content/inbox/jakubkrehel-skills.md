---
title: "jakubkrehel/skills — Agent Skills for Building Great Interfaces"
contenttype: bookmark
description: "Collection of 11 agent skills (5.5k★) covering UI polish, typography, color systems, accessibility, layout, and product writing — installable in Claude Code, Hermes, and opencode."
source: "https://github.com/jakubkrehel/skills"
topics:
  - design
  - ai
tags:
  - agents
  - skills
  - web
  - design
status: inbox
created: 2026-09-04
updated: 2026-09-04
---

## Why I saved this

Popular, well-crafted skill collection that turns an agent into a design reviewer — directly useful for Hermes/Claude Code frontend work.

## Notes

By Jakub Krehel, design engineer and author of the [Interfaces](https://interfaces.dev/) magazine. Skills encode the design principles he writes about; each is a SKILL.md that loads into any agent that reads the format (Claude Code, Hermes, opencode — repo ships `.claude-plugin`, `opencode.json`, and a skills.sh entry).

**The 11 skills** (all MIT, 100 commits, actively maintained — last push 2026-08-29):

| Skill | What it does |
|---|---|
| better-interface | Combines all `better-*` skills into one review |
| better-ui | Concentric border radius, optical alignment, contextual icons, hit areas, animation |
| better-typography | Type scale, spacing, variable fonts, OpenType features, wrapping, truncation |
| better-colors | Palette generation, semantic tokens, format conversion, contrast checks |
| better-accessibility | Standards compliance and a11y best practices |
| better-layout | Grouping, alignment, reading order |
| better-writing | Product copy consistency |
| interface-review | User-invoked multi-category review with detailed findings |
| explain-interface | User-invoked: reverse-engineers how a piece of web UI/animation was built |
| break | Stress-tests a component in every state on a temp page |
| variant | Builds multiple variants of a component for iteration |

**Install:** `npx skills add jakubkrehel/skills` · Claude Code plugin marketplace: `jakubkrehel/skills` · works as a Hermes skills tap source too.

Initial commit (2026-07) consolidated his earlier `great-typography`, `make-interfaces-feel-better`, and `oklch-skill` repos into one skills.sh-compatible collection.
