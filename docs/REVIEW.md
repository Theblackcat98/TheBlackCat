# The BlackCat: site review and redesign notes

Reviewed Sep 2026 against `main` @ `3cdb35b`. This covers what was wrong, what
this branch changes, what I would still do, and what I would do if starting
from scratch. Numbers come from building both versions and from
`scripts/lint_content.py`.

## Summary

The idea is right and rare: a plain-text archive with a written contract for
agents, and a site that is only a view of it. The weak point was not the
concept but the seam between the two. The content model said `created:`, Hugo
only understood `date:`; the docs said "search is the #1 missing interaction",
and there was none; the model promised typed presentation, and every type
rendered as the same card. The redesign closes those seams and adds guard-rails
so they stay closed.

## What was broken (found by building and reading the output)

| # | Finding | Effect | Fixed here |
| - | --- | --- | --- |
| 1 | `created:`/`updated:` are not Hugo date fields | Every bookmark and skill was undated; "Recently cataloged" on the home page was effectively arbitrary and every list sorted by chance | ✅ `frontmatter:` mapping in `hugo.yaml` |
| 2 | No CSS for Chroma tokens | Code was highlighted in the HTML and invisible on screen (26 pages) | ✅ `40-code.css`, light + dark |
| 3 | Mermaid ships as fenced blocks, nothing renders them | Diagrams on 19 pages showed as raw source | ✅ lazy-loaded, re-themes with the site |
| 4 | No search | The archive's main promise (retrieval) had no interface | ✅ ⌘K palette + library filters |
| 5 | One theme, no toggle, no `prefers-color-scheme` | Dark-mode users got a light page | ✅ designed light + dark, persisted toggle |
| 6 | One generic `list.html` for every section | Library, projects, blog and docs all rendered as the same card grid, so the type model never reached the UI | ✅ per-section views (note: `type: section` bypasses `layouts/<section>/`, so they are dispatched from `list.html` via `templates.Exists`) |
| 7 | Docs/blog series had no chapter navigation and no natural ordering | No next/prev; `chapter_10_final` sorts before `chapter_2_final` | ✅ natural sort, sidebar, pager |
| 8 | 4 Google font families, 18 weight/style variants, render-blocking | Third-party requests before first paint | ✅ 2 self-hosted variable families, 3 files (236 KB) |
| 9 | No 404 page, no canonical/OG/Twitter tags, no skip link | SEO and a11y gaps | ✅ (`static/og.png` is one site-wide card) |
| 10 | `.hugo_build.lock` committed | Noise in every diff | ✅ removed, ignored |
| 11 | CI had no pull-request run, no checks, `fetch-depth: 0` for nothing | Content mistakes were found in production | ✅ see Workflow |

## UI

- **Voice.** Newsreader for reading, JetBrains Mono for the "label voice"
  (metadata, kickers, controls). Cat-eye amber is the only accent; everything
  else is paper and ink, with hairlines instead of boxes. Dark is warm
  charcoal, not an inversion. All colour pairs are machine-checked
  (`scripts/contrast.py`; AA in both themes).
- **Type-specific presentation.** Bookmarks/skills are dense rows (type ·
  source domain · date, title, why-it-matters, tags; whole row clickable);
  projects are cards; articles are a reading column with a scroll-spy TOC; docs
  are chapters. Same content, but the page now says what the thing *is*.
- **Home = front desk.** Hero + search launcher, live counts per type, shelves,
  newest eight items (now truly newest), top projects by stars. Hero copy lives
  in `hugo.yaml`, not in a template.
- **Details that matter:** anchor links on headings, external-link arrow,
  language label + copy button on code, scrollable tables, `text-wrap: balance`
  on headings, print stylesheet, reduced-motion respected.

## UX

- Search is available from every page (`⌘K`, `Ctrl-K`, `/`, or the header
  button; the keyboard hint disappears on touch devices).
- Library filtering by type, domain, tag and text with URL state, so a filtered
  view can be bookmarked, and a no-JS fallback that shows everything.
- Breadcrumbs mirror the folder structure, so "where am I" always has an
  answer.
- Mobile: brand + search + theme in one row, a scrollable nav rail with a
  fade, chips that scroll horizontally, TOC as a collapsed `<details>`.
- Prev/next and "Related" (shared tags first, then topics) keep readers moving.

## Information architecture

Keep the three axes; they are good: **directory** = broad domain, **contenttype**
= what it is, **tags/topics** = concepts. Two suggestions:

1. **Make `topics` the small, controlled vocabulary (≤ 15) and `tags` the free
   one.** Today there are 82 distinct tags, 47 used once, and 43 tag entries
   with capital letters (`AI`, `Project`, `Guide`) that violate the repo's own
   kebab-case rule (Hugo folds `AI` into `ai` in URLs, but the two spellings
   make the data inconsistent for agents and for any tool other than Hugo).
2. **Docs vs. projects.** Three projects have both a `projects/<x>/index.md`
   and a `docs/<x>/_index.md` with the same title. Fold the docs into the
   project bundle (`projects/<x>/docs/`) so a project is one thing, or keep
   `docs/` for hand-written manuals only.

## Content model and process

`AGENTS.md` is the best part of the repo, but a contract nothing enforces gets
broken: the reserved-key incident in the skill's own notes is the proof. This
branch makes it executable (`scripts/lint_content.py`). Running it on today's
tree finds:

- **3 errors:** three skills with `source: local://inbox/...` (not a web link;
  the site now hides the "Visit" button for these instead of rendering a dead
  one).
- **79 warnings**, mostly legacy: 43 non-kebab tag entries (`AI`, `Project`,
  `Guide`), 25 pages with no front matter (manuscript chapters and the
  `docs/deep-research-at-home` chapters), 4 non-kebab file names, 3 drafts, 2
  untitled pages, 2 library items without `description`. (Markdown files that
  sit inside a page bundle, such as a skill's `references/`, are resources
  Hugo never renders, so the linter skips them.)

Other things I noticed and deliberately **left alone** (rule 9: don't modify
unrelated content):

- `collections/50-sites-google-doesnt-want-you-to-know-about.md` is typed
  `collection` but is a captured listicle: by rule 11 it is a `reference`
  (or a `bookmark`). It also has `source: ""`.
- `collections/ai-skills.md` ("Favorite AI Skills") is empty. With the new
  `collect:` block it can be populated with three lines of YAML.
- `docs/test.md`, `blog/my-first-post.md`, and three `draft: true` pages look
  like scaffolding.
- The manuscript chapters under `blog/exploring-human-psyche…` have no titles
  (the site now derives one from the file name, but a `title:` is better).
- `content/_index.md` is unused.
- Duplicate titles across docs (e.g. "Processing Nodes" ×2, "Ollama LLM
  Integration" ×2 in `docs/website-analyzer`) look like copy-paste front matter.

## Performance

| | before | after |
| --- | --- | --- |
| CSS | 27 KB, unminified, 1 file | 35 KB minified, fingerprinted (includes dark theme, code colours, search, filters, print) |
| JS | none (search absent) | 7.8 KB minified, deferred; Mermaid loaded only on pages that have a diagram |
| Fonts | 4 Google families, 18 variants, third-party, render-blocking | 3 self-hosted variable WOFF2 (236 KB total, same-origin, `font-display: swap`) |
| Search index | none | `/index.json`, 61 KB, fetched on first open |
| Third-party requests on first paint | Google Fonts CSS + font files | 0 |

## Accessibility

axe-core (WCAG 2.0/2.1 A + AA) on 13 representative pages in light and dark:
**0 violations**. Skip link, visible focus ring, landmark structure, labelled
controls, keyboard-operable search dialog, `aria-pressed` chips, focusable
scrollable regions (code, tables, diagrams), reduced motion.

## Workflow

- `make serve | check | test | shots | lint | css | contrast` (see `make help`).
- `.github/workflows/pages.yaml` now runs on pull requests too: lint (changed
  files only, so old debt doesn't block), CSS coverage, contrast, and a Hugo
  build with `--panicOnWarning` on pull requests only, so a content push to
  `main` is never blocked by a warning. It deploys only on push to `main`.
- `.github/workflows/links.yaml` runs a weekly dead-link check
  (lychee) and opens one issue. **I could not run this one from the review
  sandbox**; trigger it once by hand and tune the accept list.
- Suggested agent flow: agent works on a branch → PR → CI lint + build → merge.
  Direct pushes of agent-triaged content to `main` are the biggest remaining
  process risk. The site's templates already hide `status: inbox` items from
  search and the home page and mark them `noindex`, but they are still
  published; consider `draft: true` (or a build-time exclusion) for inbox
  until triaged.
- Pin Hugo in one place (CI env) and mention it in the README (done).

## If I were coding this from scratch

Same principles, fewer moving parts:

1. **Start from the contract.** Write the front-matter schema as data (JSON
   Schema or the lint script) *first*; the archetypes, the lint, the agent
   rules, and the search index are all generated from it.
2. **One vocabulary file.** Types, labels, blurbs, and section → view mapping
   in `hugo.yaml` (done here for labels; I would also drive nav and shelves).
3. **Tokens first, components second, pages last**, with a coverage check so
   CSS and templates can't drift (done here).
4. **Search from day one.** Small index now; Pagefind when it passes ~250 KB.
5. **Progressive enhancement as a rule.** Every list is complete HTML; JS adds
   filters and search, and the site is usable with it off (tested here).
6. **Bundles for anything with attachments**, flat files for the rest, and a
   rule that a page's URL never depends on its front matter.
7. **PR-only agent writes with CI**, weekly link rot report, and a `status`
   lifecycle (`inbox → filed`) that the build understands.
8. **Per-page social cards** generated at build time (Hugo `images.Text` or a
   small Playwright step), and self-hosted Mermaid.

## Known limits of this branch

- Mermaid loads from jsDelivr at runtime; I verified rendering against a local
  copy because the review sandbox blocks CDNs.
- `static/og.png` is one site-wide card.
- The link-check workflow is untested.
- Cross-browser: verified in Chromium only. `light-dark()` and `color-mix()`
  need Safari 17.5+/Firefox 120+/Chrome 123+ (all ≥ mid-2024).
- I did not touch existing content, only templates, styles, scripts, config,
  CI and docs, plus `.gitignore` and removing the tracked `.hugo_build.lock`.
