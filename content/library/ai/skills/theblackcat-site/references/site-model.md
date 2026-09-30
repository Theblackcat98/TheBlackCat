# Site Model (verified 2026-09-29, after the Sep 2026 redesign)

The repo's own `AGENTS.md` ("How the site works") is the fuller, authoritative
version of this page; keep the two consistent.

## Rendering: custom layouts only

The site has been on fully custom templates since commit b7661b6 (Sept 2026),
redesigned again on branch `redesign/2026-09`. `hugo.yaml` has **no `theme:`
key**. `themes/hextra` was a broken submodule gitlink (mode 160000, no
`.gitmodules`) referenced by nothing — removed 2026-09-04 together with the
stale tracked `public/` output (98 hextra-era files; CI checks them out and
`hugo --gc --minify` does NOT clean the dir first, so dead pages + "Powered by
Hextra" assets shipped in every deploy artifact until purged; `public/` +
`resources/` are gitignored).

**Do not re-add a theme, and do not trust `themes/` content if it reappears.**

### Templates (`layouts/`)

- `_default/baseof.html` (shell), `single.html` (any page), `list.html`
  (dispatcher), `taxonomy.html` (ONE term page — legacy Hugo naming),
  `terms.html` (list of terms), `_markup/render-*.html` (code blocks, headings,
  links, images, tables), `index.html` (home), `index.json` (search index),
  `404.html`, `shortcodes/callout.html`.
- `list.html` dispatches by section name to `partials/lists/<section>.html`
  (`library`, `projects`, `blog`, `docs`, `collections`, else `default`) via
  `templates.Exists`. This is needed because every `_index.md` sets
  `type: section`, which makes Hugo skip `layouts/<section>/`.
- `single.html` renders ANY page: breadcrumbs → type kicker (`contenttype`
  falling back to section name) → title → description → "Visit <host>" button
  (`source`, http(s) only) and GitHub button (`github`) → meta line (source
  host, dates, reading time) → TOC (≥3 headings) + facts (projects) → `.prose`
  body → topics + tags → related (explicit `related:` first, then similarity)
  → edit/history/source links. Docs/blog series (two levels deep) also get a
  chapter list and prev/next.
- Helper partials return values: `type-of`, `type-label`, `domain`,
  `source-host`, `description`, `title` (humanised file name when `title:` is
  missing), `sort-natural` (weight, then first number in the file name).
  `return` must be the single final statement of a partial and is not allowed
  in render hooks.

### Styles and scripts

- `assets/css/00-tokens … 50-pages.css`, concatenated, minified and
  fingerprinted by Hugo Pipes. Colours use `light-dark()` tokens; both themes
  are designed. **Every class a template or `site.js` emits must have a
  selector** — that gap caused the 2026-09-02 incident (see rendering
  reference) and is now enforced by `python3 scripts/check_css.py`
  (`make css`). `make contrast` checks every colour pair (WCAG AA).
- `assets/js/site.js`: search palette, library filters (state in URL), theme
  toggle, copy buttons, TOC scroll-spy, lazy Mermaid. Everything is
  progressive enhancement; lists are complete HTML without JS.
- `static/`: self-hosted fonts (Newsreader, JetBrains Mono), `favicon.svg`,
  `og.png` (regenerate with `python3 scripts/og.py`), `mermaid-gallery/`.
  There are no third-party requests except Mermaid from jsDelivr on pages
  that contain a diagram.

## Config (hugo.yaml)

- `baseURL: https://theblackcat98.github.io/TheBlackCat/` — **project site**:
  every URL carries `/TheBlackCat/`. Root-absolute paths in templates don't
  get the prefix from `relURL` (see rendering incident, defect 2): use
  `relURL` with no leading slash or `.RelPermalink`. Markdown links and
  images with a leading `/` are prefixed by the render hooks.
- `enableGitInfo: false`. Dates come from front matter:
  `frontmatter: date: [date, created, publishDate]`,
  `lastmod: [lastmod, updated, date]`.
- goldmark `unsafe: true` (raw HTML allowed in md); `highlight.noClasses:
  false` (token colours are in `40-code.css`).
- Taxonomies: `tag: tags`, `topic: topics`, `contenttype: contenttype`
  (singular=plural — Hugo indexes FM by the plural name; see incident).
- `outputs.home: [HTML, RSS, JSON]` (JSON = `/index.json`, the search index).
- `params.hero` and `params.contenttypes` hold copy and labels as data.
- `menu.main` order: Library (10), Collections (20), Projects (30), Notes
  (40), Blog (45), Docs (48), GitHub (50).

## Content sections and visibility

- `content/library/<domain>/` — canonical library (domains: ai, programming,
  tools). Skills as page bundles under `library/ai/skills/<slug>/index.md`.
- `content/inbox/` — everything starts here (except blog posts). **Public but
  unlisted**: `noindex`, and excluded from search, home, library, tag/topic/
  type pages and collections; not in the menu.
- `content/blog/` — page bundles per post (`<slug>/index.md`). Legacy flat
  files + a manuscript bundle exist; leave them alone. `draft: true` = not built.
- `content/collections/` (members from a `collect:` block), `projects/`,
  `notes/`, `docs/`.
- Non-index `.md` files inside a page bundle (like this skill's `references/`)
  are resources, not pages: they are not rendered, listed or searched.
- Repo docs: `AGENTS.md` (contract + site guide) + `docs/CONTENT_MODEL.md`
  (types) + `docs/DESIGN.md` (design system) + `docs/REVIEW.md` (audit and
  known content debt) — keep them in sync with reality.

## Deploy

`.github/workflows/pages.yaml`:

- **pull_request:** lint changed content files (`scripts/lint_content.py`),
  `check_css.py`, `contrast.py`, `hugo --gc --minify --panicOnWarning`. No deploy.
- **push to main:** the same checks (build without `--panicOnWarning`, so a
  content push can't be blocked by a warning) → upload `./public` →
  deploy-pages. Hugo 0.147.4 extended (apt .deb).
- Build ≈30–40 s; Pages serve lags ~1 min. Pages build_type = `workflow`.
- `.github/workflows/links.yaml`: weekly lychee run, opens/updates one issue.
