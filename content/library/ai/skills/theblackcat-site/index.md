---
title: "TheBlackCat Site Skill"
description: "The agent-side operating manual for this library: bookmark pipeline, blog draft-flag flow, weekly triage, and the Hugo site model — mirrored verbatim from the Hermes skill."
contenttype: skill
source: "https://github.com/Theblackcat98/TheBlackCat/tree/main/content/library/ai/skills/theblackcat-site"
topics:
  - ai
tags:
  - skills
  - agents
  - automation
  - workflows
  - knowledge-management
  - hugo
status: filed
created: 2026-09-05
updated: 2026-09-05
---

# TheBlackCat Site Skill

## Why I saved this

The full Hermes Agent skill that operates this site, mirrored into the library
itself so the operating manual lives next to the thing it operates. The older
[BlackCat Bookmark Skill](/TheBlackCat/library/ai/skills/blackcat-bookmark-skill/)
entry documented an early, bookmark-only version; this bundle is the current
skill in full — `SKILL.md` plus every reference file, byte-for-byte.

The verbatim files are browsable in the repo:
[SKILL.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/SKILL.md)
and the
[references/](https://github.com/Theblackcat98/TheBlackCat/tree/main/content/library/ai/skills/theblackcat-site/references)
folder. Hugo page bundles don't publish non-index Markdown to the built site,
so the links below point at the repo copies. The gist is inline here.

## Hard rules (from SKILL.md)

1. **Sync first**: `git pull --ff-only` the clone before any work.
2. **Never push fixes without Nik's approval** — diagnose read-only, propose,
   wait. Pre-authorized exceptions: bookmark saves, blog draft/publish per
   workflow, weekly triage. Everything else (templates, CSS, config, menu,
   deletions) needs an explicit OK.
3. **Reserved front matter**: `source` NOT `url`; `contenttype` NOT `type`;
   `draft: true` silently hides a page; dates from `date +%F`, never invented.
4. Reuse existing tags/topics case-insensitively; write lowercase kebab-case.
5. New items start in `content/inbox/` with `status: inbox` — promotion is
   triage's job.
6. Commit only touched files; never mix content + template/config commits.
7. **Verify after every push**: commit on `origin/main` → CI run `success` →
   live URL 200. Template/CSS changes additionally need CSS coverage +
   pixel screenshots.
8. CI owns deploys; local `hugo` builds are for debugging only.
9. Never commit `public/` or `resources/` (gitignored — CI builds fresh).

## What's in the bundle

| File | Purpose |
|---|---|
| [SKILL.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/SKILL.md) | Router, hard rules, repo facts at a glance |
| [bookmark-workflow.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/references/bookmark-workflow.md) | 11-step bookmark pipeline: dedupe by URL, real metadata, inbox placement, CI-gated verify |
| [blog-workflow.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/references/blog-workflow.md) | Draft-flag publishing (`draft: true` on push, "publish X" flips live) + Willison-voice style guide |
| [content-model.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/references/content-model.md) | Front matter recipes, reserved-key table, taxonomy rules, weekly triage procedure |
| [site-model.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/references/site-model.md) | Custom layouts, config, sections, deploy pipeline (verified 2026-09-04) |
| [theblackcat-rendering-incident.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/references/theblackcat-rendering-incident.md) | Case study: four rendering defects, minimal-site bisection technique |
| [theblackcat-reserved-key-incident.md](https://github.com/Theblackcat98/TheBlackCat/blob/main/content/library/ai/skills/theblackcat-site/references/theblackcat-reserved-key-incident.md) | Case study: the `url:` reserved-key build failure that produced the `source:` rule |

## Notes

The live copy of this skill is maintained in the agent's skill store; this
mirror is refreshed whenever the skill changes. It is `contenttype: skill`
per the repo contract: reusable agent skill plus its supporting files,
preserved in one page bundle.
