---
name: theblackcat-site
description: "Operate Nik's TheBlackCat site: save bookmarks, write blog posts (draft-flag flow), weekly triage, and maintain the Hugo repo safely."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [GitHub, bookmarks, blog, Hugo, TheBlackCat, knowledge-base]
    related_skills: [hugo-site-maintenance, github-repo-management, github-auth]
---

# The BlackCat Site

Operates Nik's public knowledge library **Theblackcat98/TheBlackCat** —
local clone at `~/hermes/repos/Theblackcat98/TheBlackCat` (branch `main`).
Hugo site, deployed by GitHub Actions (`.github/workflows/pages.yaml`)
on every push to `main`. Live at https://theblackcat98.github.io/TheBlackCat/

⚠️ **The repo is PUBLIC.** Only public information goes in. If the user
includes personal/private context, confirm before writing it into the repo.

## Triggers

- "bookmark this" / "add to my bookmarks/library/BlackCat" → bookmark workflow
- "write a blog post about X" / "blog this" → blog workflow (draft)
- "publish X" / "publish <slug>" → blog workflow (publish step)
- Weekly triage (cron 95f72348ff15, Sun 23:00) → triage section
- Site bugs, rendering issues, config/menu changes → site-model reference,
  then **propose, never push fixes without Nik's approval**

## Router — load the reference before acting

| Task | Load |
|---|---|
| Save a URL as a bookmark | `references/bookmark-workflow.md` |
| Weekly inbox triage / promote inbox items | `references/bookmark-workflow.md` (triage section) |
| Write or publish a blog post | `references/blog-workflow.md` |
| Site facts: layouts, config, taxonomy, CSS, menu, deploy | `references/site-model.md` |
| Front matter recipes, reserved keys, placement rules | `references/content-model.md` |
| Past build/rendering incidents (context for debugging) | `references/theblackcat-*.md` |
| Generic Hugo debugging on any site (local builds, bisect) | `hugo-site-maintenance` skill |

## Hard rules (every task)

1. **Sync first**: `git -C ~/hermes/repos/Theblackcat98/TheBlackCat pull --ff-only`
2. **Never push fixes without Nik's approval** — diagnose read-only, propose,
   wait. Pre-authorized exceptions: bookmark saves, blog draft/publish per
   workflow, triage per its section. Everything else (templates, CSS, config,
   menu, deletions) needs an explicit OK.
3. **Reserved front matter**: the field is `source` NOT `url`; `contenttype`
   NOT `type`; `draft: true` silently hides a page; dates from `date +%F`,
   never invented. Full table: `references/content-model.md`.
4. Reuse existing tags/topics case-insensitively; write lowercase kebab-case.
5. New items start in `content/inbox/` with `status: inbox` — promotion is
   triage's job (unless Nik asks to file directly).
6. Commit only touched files; never mix content + template/config commits.
7. **Verify after every push**: commit on `origin/main` → CI run `success`
   (poll `gh run list -L 1`) → live URL 200. Template/CSS changes additionally
   need `css_coverage.py` + pixel screenshots (see hugo-site-maintenance).
8. Don't run `hugo` locally except for debugging per hugo-site-maintenance
   (same version as CI, extracted without root). CI owns deploys.
9. Never commit `public/` or `resources/` (gitignored 2026-09-04 — CI builds
   fresh; tracked build output shipped stale hextra-era files until purged).

## Repo facts at a glance

- Custom layouts only (b7661b6 redesign); `hugo.yaml` has NO theme key;
  `themes/hextra` was removed 2026-09-04. Details: `references/site-model.md`.
- Project site → every URL carries the `/TheBlackCat/` prefix (relURL trap).
- Taxonomies: `tag`, `topic`, `contenttype` (singular=plural mapping, see
  rendering-incident reference for why).
