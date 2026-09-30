# Content Model & Front Matter Recipes

The repo's own canon: `AGENTS.md` (contract, front matter reference, how the
site works) and `docs/CONTENT_MODEL.md` (7 contenttypes + metadata rules). This
file is the agent-side recipe sheet. Check any file you touch with
`python3 scripts/lint_content.py <file>`; it enforces the rules below.

## Reserved front matter keys — the #1 content-push CI killer

| Key | Reserved meaning | Failure mode if misused |
|---|---|---|
| `url` | Page permalink override | Absolute URL → build error "URLs with protocol (http*) not supported". Use `source` for external links. |
| `type` | Hugo content-type/layout routing | Silently breaks the contenttype taxonomy + library nav. Use `contenttype` (hugo.yaml maps `contenttype: contenttype`). Only `type: section` in `_index.md` files. |
| `draft` | Draft flag | `true` → page silently missing from production (this is the blog flow's intended mechanism). |
| `date` | Page date | Garbage strings break ordering silently. Always real time via `date` command. |
| `slug`, `weight` | URL slug / ordering | Unexpected URLs/order. (`weight` is also how docs/blog chapters are ordered, after which the first number in the file name decides.) |
| `source` | Canonical external URL (ours, not Hugo's) | Absolute http(s) only. `local://…` or a path renders a dead link: omit `source` instead. |

## Status and dates

- `status`: `inbox` (published but unlisted: noindex, hidden from search, home,
  library, tag pages and collections), `filed` (triaged), `active`, `draft`.
  Only `inbox` changes site behaviour; `draft: true` (the Hugo flag) is what
  hides a page entirely.
- `created` / `updated`: `YYYY-MM-DD`, real (`date +%F`). `hugo.yaml` maps
  them to Hugo's date/lastmod, so `created` is the sort date and the home page
  ("Recently added") and RSS use it. An item with no date never appears on
  the home page. Blog posts use `date:` with a time instead; either works.

If a build fails right after a content push: grep the changed files' front
matter for reserved keys first. Case study: `references/theblackcat-reserved-key-incident.md`.

## Recipes

### Bookmark (goes to `content/inbox/<slug>.md`)
```yaml
title: "<Page Title>"
contenttype: bookmark
description: "<one-line summary>"
source: "<url>"          # NOT url
topics: [<domain>]       # ai, programming, psychology, engineering, design,
tags: [<kebab-tags>]     # science, business, philosophy — reuse, lowercase
status: inbox
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
```
Body: `## Why I saved this` + `## Notes`. Optional extras the site understands:
`related: [/library/…]` (hand-picked related items), `excludesearch: true`.

### Skill item (page bundle `content/library/ai/skills/<slug>/index.md`)
Same as bookmark but `contenttype: skill`, `status: filed` after triage,
body documents the skill's behavior. One skill per folder, never loose files.

### Blog post — see `references/blog-workflow.md`
Page bundle `content/blog/<slug>/index.md`, `draft: true` first push.

### Other types
`article`, `note`, `project` (page bundle), `collection` (points at items,
never duplicates), `reference` — placement rules in AGENTS.md.

- **Project**: add `language: Python`, `stars: 12`, `github: <repo url>` (shown
  on the card and in the facts sidebar). `pinned: true` puts it on the home page.
- **Collection**: members come from front matter, not from the body:
  ```yaml
  collect:
    items: [/library/ai/skills/grill-me]   # explicit picks, in order
    contenttype: skill                      # and/or a live query
    tag: agents
    topic: ai
  ```

## Taxonomy rules

- Hugo indexes front matter by the taxonomy's **plural** name; hugo.yaml maps
  `contenttype: contenttype` so the FM field works. Term pages live at
  `/contenttype/<value>/` (no `/types/` — that era is documented in the
  rendering incident reference).
- Reuse existing terms case-insensitively; write lowercase kebab-case.
  `python3 scripts/lint_content.py --vocab` prints every domain, topic and tag
  in use with counts.
- Library domains in use: ai, programming, tools (run `--vocab` for the live
  list; don't create a new domain casually).

## Triage (weekly, cron 95f72348ff15, Sun 23:00)

1. Sync clone; list `content/inbox/`.
2. Classify each item per AGENTS.md: broadest fitting `library/<domain>/`;
   skills → page bundles under `library/ai/skills/<slug>/index.md`.
   Uncertain → leave in inbox and say why.
3. Dedupe by `source:` URL — enrich existing canonical file instead of
   creating duplicates.
4. Promote via `git mv`, set `status: filed`, refresh `updated:` (real date).
5. Normalize front matter: add `description:` if missing; tags lowercase;
   drop any `local://` `source`.
6. Lint the moved files (`python3 scripts/lint_content.py <files>`), commit
   (only those files), push, CI-gate, spot-check live URLs.
7. Report: filed/left + reasoning + CI status.
