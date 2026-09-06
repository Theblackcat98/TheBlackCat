# Content Model & Front Matter Recipes

The repo's own canon: `AGENTS.md` (contract) and `docs/CONTENT_MODEL.md`
(7 contenttypes + metadata rules). This file is the agent-side recipe sheet.

## Reserved front matter keys — the #1 content-push CI killer

| Key | Reserved meaning | Failure mode if misused |
|---|---|---|
| `url` | Page permalink override | Absolute URL → build error "URLs with protocol (http*) not supported". Use `source` for external links. |
| `type` | Hugo content-type/layout routing | Silently breaks the contenttype taxonomy + library nav. Use `contenttype` (hugo.yaml maps `contenttype: contenttype`). Only `type: section` in `_index.md` files. |
| `draft` | Draft flag | `true` → page silently missing from production (this is the blog flow's intended mechanism). |
| `date` | Page date | Garbage strings break ordering silently. Always real time via `date` command. |
| `slug`, `weight` | URL slug / ordering | Unexpected URLs/order. |

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
Body: `## Why I saved this` + `## Notes`.

### Skill item (page bundle `content/library/ai/skills/<slug>/index.md`)
Same as bookmark but `contenttype: skill`, `status: filed` after triage,
body documents the skill's behavior. One skill per folder, never loose files.

### Blog post — see `references/blog-workflow.md`
Page bundle `content/blog/<slug>/index.md`, `draft: true` first push.

### Other types
`article`, `note`, `project` (page bundle), `collection` (points at items,
never duplicates), `reference` — placement rules in AGENTS.md.

## Taxonomy rules

- Hugo indexes front matter by the taxonomy's **plural** name; hugo.yaml maps
  `contenttype: contenttype` so the FM field works. Term pages live at
  `/contenttype/<value>/` (no `/types/` — that era is documented in the
  rendering incident reference).
- Reuse existing terms case-insensitively; write lowercase kebab-case.
- Library domains in use: ai, programming, tools (legacy content also has
  psychology, engineering, design, science, business, philosophy).

## Triage (weekly, cron 95f72348ff15, Sun 23:00)

1. Sync clone; list `content/inbox/`.
2. Classify each item per AGENTS.md: broadest fitting `library/<domain>/`;
   skills → page bundles under `library/ai/skills/<slug>/index.md`.
   Uncertain → leave in inbox and say why.
3. Dedupe by `source:` URL — enrich existing canonical file instead of
   creating duplicates.
4. Promote via `git mv`, set `status: filed`, refresh `updated:` (real date).
5. Normalize front matter: add `description:` if missing; tags lowercase.
6. Commit (only those files), push, CI-gate, spot-check live URLs.
7. Report: filed/left + reasoning + CI status.
