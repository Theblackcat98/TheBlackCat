---
name: theblackcat-site
description: "Operate Nik's TheBlackCat site: save bookmarks, write blog posts (draft-flag flow), weekly triage, and maintain the Hugo repo safely."
version: 1.1.0
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

**The repo's own `AGENTS.md` is the canon** (contract + how the site works +
recipes). This skill is the operating procedure on top of it: triggers,
approval boundaries, and the verify-after-push loop. If they disagree,
`AGENTS.md` wins — read it at the start of any task that touches the repo.

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
| Anything in the repo | `AGENTS.md` (repo root) |
| Save a URL as a bookmark | `references/bookmark-workflow.md` |
| Weekly inbox triage / promote inbox items | `references/content-model.md` (triage section) |
| Write or publish a blog post | `references/blog-workflow.md` |
| Site facts: layouts, config, visibility rules, CSS, deploy | `references/site-model.md` |
| Front matter recipes, reserved keys, statuses, dates | `references/content-model.md` |
| Past build/rendering incidents (context for debugging) | `references/theblackcat-*.md` |
| Generic Hugo debugging on any site (local builds, bisect) | `hugo-site-maintenance` skill |

## Hard rules (every task)

1. **Sync first**: `git -C ~/hermes/repos/Theblackcat98/TheBlackCat pull --ff-only`
2. **Never push fixes without Nik's approval** — diagnose read-only, propose,
   wait. Pre-authorized exceptions: bookmark saves, blog draft/publish per
   workflow, triage per its section. Everything else (`layouts/`, `assets/`,
   `static/`, `hugo.yaml`, menu, `.github/`, `scripts/`, `docs/`, deletions,
   renames, mass edits) needs an explicit OK. For an *approved* code change,
   prefer a branch + pull request: CI runs the full checks on PRs, while a
   push to `main` deploys immediately. Push straight to `main` only if Nik says so.
3. **Reserved front matter**: the field is `source` NOT `url`; `contenttype`
   NOT `type`; `draft: true` silently hides a page; dates from `date +%F`,
   never invented. `source` must be an absolute http(s) URL or be omitted.
   Full table: `references/content-model.md`.
4. Reuse existing tags/topics case-insensitively; write lowercase kebab-case.
   List what exists with `python3 scripts/lint_content.py --vocab`.
5. New items start in `content/inbox/` with `status: inbox` — promotion is
   triage's job (unless Nik asks to file directly). Inbox pages are public
   but unlisted (noindex, not in search/home/library/tags), so the
   public-info rule still applies.
6. Commit only touched files; never mix content + template/config commits.
7. **Lint before you push content**: `python3 scripts/lint_content.py <files>`
   (pure Python + PyYAML, fine on the Pi). Fix every ERROR; don't add warnings.
8. **Verify after every push**: commit on `origin/main` → CI run `success`
   (poll `gh run list -L 1`) → live URL 200 (draft posts: 404). Template/CSS
   changes additionally need `make check` (build, CSS coverage, contrast) and,
   for visual changes, `make test` / `make shots` where Playwright is available.
9. Run `hugo` locally only where it installs cleanly (same version as CI:
   0.147.4 extended); otherwise CI is the build. CI owns deploys.
10. Never commit `public/` or `resources/` (gitignored 2026-09-04 — CI builds
    fresh; tracked build output shipped stale hextra-era files until purged).

## Repo facts at a glance

- Custom layouts only; `hugo.yaml` has NO theme key; `themes/hextra` was
  removed 2026-09-04. Since the Sep 2026 redesign the CSS/JS live in `assets/`
  (Hugo Pipes) and section views in `layouts/partials/lists/`.
  Details: `references/site-model.md`.
- Project site → every URL carries the `/TheBlackCat/` prefix (relURL trap).
  Root-absolute Markdown links (`/library/…`) are prefixed automatically.
- Taxonomies: `tag`, `topic`, `contenttype` (singular=plural mapping, see
  rendering-incident reference for why).
- Dates: `created`/`updated` are mapped to Hugo's date/lastmod in `hugo.yaml`;
  git history is not used for dates.
- Checks: `make check` / `make test` / `make help`; CI (`pages.yaml`) runs
  lint (changed files), CSS coverage, contrast and a build on every PR, and
  deploys on push to `main`. `links.yaml` reports dead links weekly.
