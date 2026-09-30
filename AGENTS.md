# The BlackCat Agent Contract

The BlackCat is a Git-native personal library. Markdown is the source of truth; the Hugo site is only a presentation layer.

This file is for any agent (or person) that adds, changes, or maintains anything in this repository. Part 1 is the **contract**: what you may and may not do. Part 2 explains **how the site works**, so you know what your changes will do. Part 3 is **how to do the common jobs**. If this file and any other note disagree, this file and `docs/CONTENT_MODEL.md` win.

> ⚠️ **This repository and its website are public.** Only public information belongs here. If a request includes personal or private context, confirm before writing it into the repo. Never commit secrets, tokens, or private URLs.

- Live site: <https://theblackcat98.github.io/TheBlackCat/> (a GitHub Pages *project* site, so every URL starts with `/TheBlackCat/`)
- Repository: `Theblackcat98/TheBlackCat`, default branch `main`. **A push to `main` deploys the site.**
- Hugo **0.147.4 extended** (pinned in CI). No theme; all templates are in `layouts/`.

## Quick start for agents

1. Read the rules below, then look at how a similar existing item is written before adding a new one.
2. Reuse the existing vocabulary: `python3 scripts/lint_content.py --vocab` lists every domain, topic and tag in use.
3. Search for an existing item with the same `source` before creating anything (rule 4).
4. New external material starts in `content/inbox/` with `status: inbox` and is promoted by triage.
5. Front matter: `contenttype` (never `type`), `source` (never `url`), real dates, lowercase kebab-case tags.
6. Check your change: `python3 scripts/lint_content.py <files you touched>`, and `make check` when Hugo is available.
7. Commit only what you touched, push, and confirm the CI run is green (Part 3).
8. Templates, CSS, config, menu, CI and deletions need the owner's explicit approval (see "What needs approval").

---

# Part 1 · The contract

## Rules

1. Prefer existing domains, content types, and tags.
2. Do not create new top-level domains casually.
3. If classification is uncertain, leave the item in `inbox/`.
4. Never create a duplicate resource when an existing canonical item can be updated.
5. Preserve the original source URL in `source` for external material. Never use front-matter `url` for source URLs; Hugo reserves it for page URLs.
6. Keep front matter machine-readable and conservative.
7. Use lowercase kebab-case for tags, topics, slugs, and filenames.
8. Do not delete content unless explicitly instructed or the item is clearly a duplicate.
9. Do not modify unrelated files.
10. Keep the Markdown body useful to a human; front matter is metadata, not prose.
11. Choose `contenttype` based on what the thing **is**, not where it came from. Never set `type` in front matter except `type: section` in `_index.md` files — `type` is a reserved Hugo field and silently breaks the contenttype taxonomy and library nav. Hugo indexes taxonomy front matter by the taxonomy's *plural* name, so `contenttype: <value>` in front matter only works because hugo.yaml maps `contenttype: contenttype` (singular = plural, term pages at `/contenttype/<value>/`). Do not remap it to `types` — nothing in content sets a `types:` field, so terms would silently vanish.
12. Use `description` when a concise summary will improve cards, listings, search, or agent retrieval.

## Content lifecycle

```text
inbox/ -> classify -> enrich -> canonical item -> collections/relationships
```

## Content types

- `bookmark`: saved external resource whose primary value is the link and accompanying notes.
- `skill`: reusable AI/agent skill, workflow, prompt system, or operational procedure. Preserve supporting files when useful.
- `article`: substantial researched or authored prose intended to stand on its own.
- `note`: personal thought, working knowledge, observation, hypothesis, or short-form synthesis.
- `project`: a coherent project and its associated documentation, decisions, references, and implementation knowledge.
- `collection`: curated view of canonical items. Collections organize relationships; they do not duplicate content.
- `reference`: durable factual or technical reference material such as specifications, manuals, standards, glossaries, or cheat sheets.

## Placement rules

- Put canonical knowledge in the broadest appropriate `library/<domain>/...` location.
- Put individual AI skills in `library/ai/skills/<kebab-slug>/index.md` (one skill per folder, Hugo page bundle) when the skill itself is the subject.
- Put projects in `projects/<kebab-slug>/index.md` when the project needs its own page bundle.
- Put personal/working notes in `notes/` unless they clearly belong to a library domain.
- Put curated collections in `collections/`. A collection should point to canonical items rather than copying their content.
- Use `reference` for durable reference material; do not force it into `bookmark` merely because it originated externally.
- Use `bookmark` when the external resource itself is what is being saved and the local content is primarily annotation.

Domains currently in use under `library/`: `ai`, `programming`, `tools` (run `python3 scripts/lint_content.py --vocab` for the live list). Blog posts go in `blog/`, long-form guides in `docs/`.

## Classification examples

- "Save this GitHub repo" -> `contenttype: bookmark` unless the repository is one of Nick's own projects.
- "Add this reusable Claude skill" -> `contenttype: skill`.
- "Write up my research on agent memory" -> `contenttype: article`.
- "Remember this insight about agent memory" -> `contenttype: note`.
- "Add my opencode-workflow project" -> `contenttype: project`.
- "Make a list of my favorite AI skills" -> `contenttype: collection` referencing `skill` items.
- "Save the HTTP specification for future lookup" -> `contenttype: reference`.

## Preferred front matter

```yaml
title: "..."
contenttype: bookmark
description: "..."
source: "https://..."   # external canonical URL; NOT `url`
topics:
  - ai
tags:
  - agents
status: inbox
created: 2026-08-28
updated: 2026-08-28
```

## Front matter reference

Every field the site reads. Anything else is ignored by the templates (harmless, but keep it conservative).

| Field | Meaning | Notes |
| --- | --- | --- |
| `title` | Page title | Required. Quote it if it contains `:` or `"`. Without one the site shows the humanised file name, which is a fallback, not a plan. |
| `contenttype` | What the thing is | Required for library, inbox, notes, collections and projects. One of the seven types above. Drives labels, the type filter and `/contenttype/<value>/`. |
| `description` | One-sentence summary | Recommended. Used on cards, in search, and in link previews. If missing the site uses the first paragraph, which is rarely as good. |
| `source` | Canonical external URL | Absolute `http(s)` only. Omit it (or leave it empty) when there is none. Never `local://…` or a file path. Shows as "Visit <host>" and as the domain on cards. |
| `topics` | Broad subject areas | Small vocabulary (currently about seven). Reuse. |
| `tags` | Concepts | Lowercase kebab-case. Reuse before inventing. |
| `status` | Lifecycle | `inbox`, `filed`, `active`, `draft`. Only `inbox` changes how the site behaves (see "What is visible where"). |
| `created` / `updated` | Added / last touched | `YYYY-MM-DD`, **real dates** (`date +%F`), never guessed. `created` is the sort date. |
| `related` | Hand-picked related items | List of content paths, e.g. `/library/ai/skills/grill-me`. Listed before the automatic tag-based suggestions. |
| `excludesearch` | `true` hides the page from site search | Use for scratch or boilerplate pages. |
| `draft` | `true` = not built at all | The page is missing from the live site (that is the point). |
| `weight` | Manual ordering | Chapters in a docs guide or blog series sort by `weight`, then by the first number in the file name. |
| `language`, `stars`, `github` | Project facts | `language` like `Python` or `Python / Shell` (first one shown), `stars` a number, `github` a repo URL. |
| `pinned` / `featured` | `true` puts a project on the home page | Otherwise the home page shows the six most-starred projects. |
| `collect` | Live members of a collection | See "Collections" below. |

Reserved by Hugo (a wrong value is the most common way a content push breaks CI): `url` (permalink override), `type` (layout routing), `draft`, `date`, `slug`, `weight`. If a build fails right after a content push, check the changed files for these first.

The lint script encodes these rules: `python3 scripts/lint_content.py` (needs `pip install pyyaml`).

---

# Part 2 · How the site works

## The pipeline

```text
content/**/*.md ──┐
hugo.yaml         ├─ Hugo 0.147.4 ─→ public/ ─→ GitHub Pages
layouts/ assets/ ─┘   (CI, on push to main)
static/ (fonts, favicon, og.png, mermaid-gallery)
```

Nothing is stored anywhere but the repo. There is no database and no CMS. `public/` and `resources/` are build output; never commit them.

## Where things live

| Path | What it is |
| --- | --- |
| `content/` | The archive. See "Placement rules". |
| `content/inbox/` | Untriaged material. Public but unlisted (see below). |
| `hugo.yaml` | Site config, menu, taxonomies, and the **copy that is data**: `params.hero` (home page text) and `params.contenttypes` (labels and blurbs for each type). |
| `layouts/` | Templates. `_default/` = base, page, list dispatcher, term pages, render hooks. `partials/` = shell, components and helpers. `partials/lists/<section>.html` = the view for each section. `index.html` = home. `index.json` = the search index. |
| `assets/css/` | Six files, concatenated in order: tokens, base, layout, components, code, pages. |
| `assets/js/site.js` | All client behaviour (search, filters, theme, copy buttons, TOC, diagrams). No dependencies. |
| `static/` | Copied as-is: self-hosted fonts, favicon, `og.png` (social card), `mermaid-gallery/`. |
| `archetypes/` | Front matter templates for `hugo new`. |
| `scripts/` | Content lint, design checks, browser tests, the OG card generator. |
| `docs/` | `CONTENT_MODEL.md` (the model), `DESIGN.md` (design system), `REVIEW.md` (audit and open issues). |

## What is visible where

- **Home**: the newest eight dated items across library, collections, notes, projects and blog (never inbox, never docs), live counts per type, and the pinned/most-starred projects. An item without a date never appears here, which is one more reason to set `created`.
- **Library** (`/library/`): every non-inbox item as a row, filterable by type, domain (the folder under `library/`), tag and text, with the filter state in the URL. Rows show the type, the source's domain, the created date, the title, the description and tags.
- **Search** (Ctrl/⌘-K, `/`, or the header button): built from `/index.json`. It includes title, description, tags, topics, type, source domain and the first ~300 characters of the body. It **excludes** drafts, `status: inbox` items, and anything with `excludesearch: true`.
- **Tag, topic and type pages** (`/tags/x/`, `/topics/x/`, `/contenttype/x/`): non-inbox items only.
- **Projects** (`/projects/`): cards, sortable and filterable by tag.
- **Collections** (`/collections/`): a card per collection. A collection page lists its members automatically.
- **Blog and docs**: a guide or series (a folder with `_index.md` plus chapter files) gets a chapter list, and previous/next links. Chapters sort by `weight`, then by the first number in the file name (`chapter_2` before `chapter_10`).
- **Article pages**: breadcrumbs mirroring the folders, a table of contents when there are three or more headings, a facts sidebar for projects, related items, and "Edit this page / History / View source" links.

### Inbox and drafts

- `status: inbox` (or anything under `content/inbox/`) is **published** at `/inbox/<slug>/` but marked `noindex`, left out of search, home, the library, tag pages and collections, and not linked from the menu. It is unlisted, not private.
- `draft: true` is not built at all. A draft URL must return 404 on the live site.

## Dates

`created` and `updated` are the canonical dates. `hugo.yaml` maps them to Hugo's date and last-modified fields (`frontmatter: date: [date, created, publishDate]`, `lastmod: [lastmod, updated, date]`), so sorting, "recently added", RSS and the "Updated …" line all work from them. Git history is deliberately not used (`enableGitInfo: false`), so a bulk reformat does not make everything look freshly updated. Blog posts conventionally use `date` (with a time) instead of `created`; either works. Update `updated` when you change an item's substance.

## Bundles and attachments

- A folder with an `index.md` is a **page bundle** (a skill, a project, a blog post). Other files in it, including other `.md` files such as `references/…` or `SKILL.md`, are **resources**: they ship with the page but are not pages and are not listed or searched. Put images for a page in its bundle and reference them relatively.
- A folder with an `_index.md` is a **section or guide**. Other `.md` files in it are pages (chapters).
- Every `_index.md` must contain `type: section` (rule 11). Section views are chosen by the section name from `layouts/partials/lists/`, so a new top-level section needs a matching partial or it falls back to the generic list.

## Writing the body

- Standard Markdown plus attribute blocks. Raw HTML is allowed but should be rare.
- Fenced code blocks get syntax colours, a language label and a copy button; give every fence a language. A ` ```mermaid ` fence renders as a diagram in the browser.
- Callout shortcode: `{{< callout type="tip" title="Optional" >}}text{{< /callout >}}` (`type` is `note`, `tip` or `warning`).
- Links: external links open in a new tab automatically. Internal links can be written `/library/ai/…` or relatively; the site adds the `/TheBlackCat/` prefix. Do not hard-code the prefix in new content.
- Headings: start at `##`; the page title is the `h1`. Headings get anchor links and feed the table of contents.
- Bookmarks: keep the body to `## Why I saved this` and `## Notes`, factual and short.

## Collections

A collection lists its members from front matter, so nothing is retyped:

```yaml
collect:
  items:                       # explicit picks, in order (content paths)
    - /library/ai/skills/grill-me
  contenttype: skill           # and/or a live query; all filters given must match
  tag: agents
  topic: ai
```

Explicit `items` come first, then query matches (newest first). Inbox items are never included. The body of the collection page is intro text only.

---

# Part 3 · Doing the work

## Working locally

```bash
python3 scripts/lint_content.py --vocab     # tags, topics and domains in use
python3 scripts/lint_content.py <files>     # check the files you touched
make serve                                  # dev server with drafts, live reload
make check                                  # build (warnings = errors) + lint of changed content + CSS coverage + contrast
make test                                   # + browser tests and accessibility scan (needs playwright, axe-core)
make help                                   # everything else
```

The linter needs only Python and PyYAML, so it works on small machines that cannot run Hugo. Whole-tree `make lint` reports existing debt (see `docs/REVIEW.md`); new work should not add to it.

## What CI does

`.github/workflows/pages.yaml`:

- **Pull request:** lints the content files you changed, checks CSS coverage and colour contrast, and builds with warnings as errors. Never deploys.
- **Push to `main`:** the same checks (the build does not fail on warnings), then deploys.
- `.github/workflows/links.yaml` opens a weekly issue listing dead external links.

## Recipes

**Save a bookmark**
1. Check for an existing item: search `content/` for the URL (`grep -rl '<url>' content`). If found, enrich that item and bump `updated`; do not create another.
2. Fetch the real title and a one-line description. If the fetch fails, say so in the notes rather than inventing content.
3. Create `content/inbox/<kebab-slug>.md` from `archetypes/bookmark.md`: `contenttype: bookmark`, `source`, `description`, reused `topics`/`tags`, `status: inbox`, real `created`/`updated`.
4. Lint, commit `bookmark: <title>`, push, confirm CI is green.

**Triage the inbox**
1. For each item choose the broadest fitting `library/<domain>/` (skills go to `library/ai/skills/<slug>/index.md`). If unsure, leave it and say why.
2. Deduplicate by `source`; enrich the existing item instead of adding a second.
3. Move with `git mv`, set `status: filed`, refresh `updated`, add a `description` if missing, normalise tags to lowercase kebab-case.
4. Commit only those files and confirm CI is green.

**Add a skill**: a folder `library/ai/skills/<slug>/` with `index.md` (`contenttype: skill`, `source` if it came from elsewhere, body describing what it does and how) and any support files beside it. One skill per folder, never loose files.

**Add a project**: `projects/<slug>/index.md` with `contenttype: project`, `language`, `stars`, `github`, tags, and a short body. Add `pinned: true` only if asked.

**Add a collection**: `collections/<slug>.md` with `contenttype: collection` and a `collect:` block. Point at canonical items; never copy their content.

**Write a blog post** (draft-flag flow): create `blog/<slug>/index.md` with `title`, `description`, `date` (real time), `tags`, and `draft: true`; push it, then confirm the live URL returns **404**. Set `draft: false` only on an explicit "publish" instruction or in-chat approval, and confirm the live URL returns 200 afterwards. Write in first person, plainly, with real and tested code; never invent facts.

**Edit an existing item**: change only what was asked, keep the front matter valid, bump `updated`.

## Commits and verification

- Commit only the files you touched. Do not mix content changes with template, CSS or config changes in one commit.
- Messages: `bookmark: <title>`, `post: <title> (draft)`, `post: publish <slug>`, `triage: <what>`, or a plain imperative sentence for code.
- After pushing to `main`: the newest run of "Deploy The BlackCat" (`gh run list -L 1`) must reach `success`, and the changed page must return 200 at its live URL (inbox items at `/TheBlackCat/inbox/<slug>/`; drafts must be 404). Never report success on a red build. Pages can lag a minute after CI finishes.
- If CI fails after a content push: read `gh run view <id> --log-failed`, check for reserved front matter keys first, fix, and re-verify.
- Never commit `public/` or `resources/`.

## What needs approval

Pre-authorised: saving bookmarks to the inbox, blog draft and publish per the flow above, weekly triage, and enriching individual items.

Ask the owner first (diagnose, propose, wait): changes to `layouts/`, `assets/`, `static/`, `hugo.yaml`, the menu, `.github/`, `scripts/`, or `docs/`; deleting, renaming or mass-editing existing content; creating a new top-level domain or section; anything that changes what a public URL is.

## Changing the site itself

Only with approval. Read `docs/DESIGN.md` first. The short version:

- One accent colour, two font families (Newsreader, JetBrains Mono, self-hosted), no third-party requests, no framework, no theme (do not re-add one).
- Colours, spacing and type sizes come from the tokens in `assets/css/00-tokens.css`. No hard-coded colours in components; both light and dark must work.
- Every class a template or the script emits must exist in the CSS: `make css` fails otherwise. Every colour pair must pass contrast: `make contrast`.
- Every list must be complete HTML without JavaScript; scripts only enhance.
- Section views live in `layouts/partials/lists/`. Copy that is data (hero text, type labels) lives in `hugo.yaml`, not in templates.
- Use `relURL` (no leading slash) or `.RelPermalink` for internal URLs, never a bare `/path`, or the site breaks under `/TheBlackCat/`.
- Do not upgrade the pinned Hugo version casually; CI, the Makefile and `docs/` all assume 0.147.4.
- When behaviour changes, update this file, `docs/CONTENT_MODEL.md`, and `docs/DESIGN.md` in the same change.

## Known traps

- `url:` in front matter is a permalink override; an absolute URL there fails the build ("URLs with protocol not supported"). Use `source`.
- `type:` silently breaks the type taxonomy and library navigation. Use `contenttype`.
- `draft: true` silently hides a page; that is intended for blog drafts and a mistake anywhere else.
- Tags in older content are capitalised (`AI`, `Guide`); do not imitate them.
- Dates typed by hand go stale or wrong. Take them from the system clock.
- A skill's `references/` files and other non-index `.md` files in a page bundle are resources, not pages. To make one a page, it needs its own folder with an `index.md`.
- `local://…` and similar non-web values in `source` render as dead links. Omit `source` and say where the item came from in the body.

## Related documents

- `README.md`: what the project is and why.
- `docs/CONTENT_MODEL.md`: the formal content model (types, metadata, dates, collections).
- `docs/DESIGN.md`: the design system and the checks that guard it.
- `docs/REVIEW.md`: audit of the site and the known content debt.
- `content/library/ai/skills/theblackcat-site/`: the operating skill for the owner's automation agent (bookmark pipeline, blog flow, weekly triage). It follows this file.

When uncertain, do less. The archive should become more trustworthy over time, not merely more populated.
