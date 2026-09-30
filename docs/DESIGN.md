# The BlackCat Design System

This document governs how the archive *looks*. The repo is the archive; the
site is a view of it. Rewritten Sep 2026 to match the implementation (the
Aug 2026 roadmap it replaces was almost entirely delivered, and its
"remaining gaps" list had gone stale).

## Visual thesis

A quiet, dense, beautifully typeset **personal digital library** with
technical details underneath. Knowledge base + technical library + developer
portfolio. The site should say: *"There is a lot here, but I can always
figure out where I am."* Navigation beats decoration.

**Never look like:** corporate docs site, résumé, Notion clone, generic
landing page, neon "AI dashboard."

Aesthetic keywords: paper · ink · terminal · library.

## Core rules

1. **One accent.** Cat-eye amber (`--accent`: `#9a4707` on paper, `#eba74f`
   in the dark room). Everything else is paper and ink. Light and dark are
   both designed, not inverted, and every text/background pair is checked by
   `scripts/contrast.py` (WCAG AA, both themes).
2. **Two faces, no more.** *Newsreader* (serif) for reading and headings;
   *JetBrains Mono* for the "label voice": metadata, kickers, controls, code.
   Self-hosted variable WOFF2 in `static/fonts` (3 files, ~236 KB total, no
   third-party requests, `font-display: swap`).
3. **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px
   (`--s-1 … --s-9`). Nothing off-scale.
4. **Borders sparingly.** Hairline rules and paper-tone contrast instead of
   boxes; cards only where a thing is a *thing* (projects, collections).
5. **Tags are metadata, not decorations.** Plain `#agents  #harnesses`, not
   coloured pills. Filter *chips* are controls and look like controls.
6. **Motion: almost none.** 2 px card lift, underline fades, 150 ms colour
   transitions. All of it off under `prefers-reduced-motion`.
7. **Mobile is designed.** Header collapses to brand + search + theme with a
   scrollable nav rail; the library toolbar collapses to search + chips;
   article TOC becomes a `<details>`; metadata "facts" move inline.
8. **Works without JavaScript.** Every list is fully rendered HTML. JS adds
   search, filters, theme toggle, copy buttons, TOC spy, diagrams.

## Content-type vocabularies

The front matter says what a thing *is* (`contenttype`); the UI follows.
Labels and blurbs come from `params.contenttypes` in `hugo.yaml`.

| Type | Presentation |
| --- | --- |
| Bookmark, reference | Dense **row**: type, source domain, date, title, one-line why, tags. Whole row clickable. Detail page leads with a "Visit source" button. |
| Skill | Row in listings; detail page with source + facts sidebar (domain, added/updated, tags). |
| Article, note | Reading page: 40 rem measure, left-aligned, TOC rail (≥ 64 rem) with scroll-spy, "Related" from shared tags. |
| Project | **Card** with language, ★ stars, updated date, GitHub link; filterable by tag on `/projects/`. |
| Collection | Curated page whose members are listed automatically from `collect:` front matter (see `CONTENT_MODEL.md`). |
| Docs / blog series | Chapter navigation (sidebar `details` on mobile, prev/next pager), natural-sort ordering (`02-…` before `10-…`). |

## Architecture

```
assets/css/   00-tokens  10-base  20-layout  30-components  40-code  50-pages
              (concatenated + minified + fingerprinted by Hugo Pipes, ~35 KB)
assets/js/    site.js   (one file, ~8 KB minified, no dependencies; Mermaid is lazy-loaded)
layouts/
  _default/   baseof, list (dispatcher), single, taxonomy (term page), terms
              _markup/  code blocks (copy + language), headings (anchors),
                        links (external ↗, base-path-safe), images (lazy, base-path-safe), tables (scroll)
  partials/   shell (head, header, footer, search-dialog), components
              (item-row, project-card, tag-list, breadcrumbs, chapters,
              collected), helpers (type-of, domain, title, description …),
              lists/<section>.html
  shortcodes/ callout
  index.json  the client-side search index
```

Two Hugo details that will bite you again:

- `_index.md` files set `type: section`, so Hugo skips `layouts/<section>/`.
  `_default/list.html` therefore dispatches to `partials/lists/<section>.html`
  with `templates.Exists`. Add a section view by adding a partial.
- Term/terms templates use Hugo's *legacy* names: `taxonomy.html` is the
  single-term page, `terms.html` the list of terms.

Flow: agent writes Markdown + front matter → stable templates → consistent
UI. That is why this stays a small custom theme and not a framework.

## Search

`⌘K` / `Ctrl-K` / `/` opens a native `<dialog>` palette. It fetches
`/index.json` once (title, description, tags, topics, type, domain, source
host; inbox items excluded), scores matches (title > tags > description),
groups by type, and is fully keyboard-driven. The library page has its own
filters (type, domain, tag, text, sort) with state in the URL, so a filtered
view is a shareable link.

## Checks

| Command | What it guards |
| --- | --- |
| `make build` | Hugo with `--panicOnWarning` |
| `make lint` | front-matter contract from `AGENTS.md` |
| `make css` | every class emitted by a template/JS exists in the CSS |
| `make contrast` | WCAG contrast for all token pairs, light + dark |
| `make test` | Playwright behaviour tests + axe-core (0 violations expected) |
| `make shots` | screenshots (light/dark × desktop/mobile) for eyeballing |

## Status

Delivered: shell, tokens, both themes, search palette, breadcrumbs,
type-aware pages, TOC + scroll-spy, code treatment, Mermaid, docs/blog chapter
navigation, 404, canonical/Open Graph/Twitter metadata, RSS, print styles,
keyboard and screen-reader pass.

Open, in order:

1. Per-page social cards (only the site-wide `static/og.png` exists).
2. Pagefind (or similar) if `index.json` grows past ~250 KB; today it is ~60 KB.
3. Self-host Mermaid (currently jsDelivr at runtime, loaded only on pages that
   contain a diagram).
4. The library renders all ~90 rows as plain HTML (good for no-JS and search
   engines, but ~20,000 px on a phone). Filters make it navigable; if it keeps
   growing, add `content-visibility: auto` on rows or paginate by domain.
5. Content clean-up listed in `docs/REVIEW.md` (untitled chapters, tag sprawl,
   local-only sources).

**Design the system once, then let the content multiply it.**
