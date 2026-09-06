# Site Model (verified 2026-09-04)

## Rendering: custom layouts only

Commit b7661b6 (Sept 2026 redesign) moved the site OFF the Hextra theme onto
fully custom templates. `hugo.yaml` has **no `theme:` key**. `themes/hextra`
was a broken submodule gitlink (mode 160000, no `.gitmodules`) referenced by
nothing — removed 2026-09-04 together with the stale tracked `public/` output
(98 hextra-era files; CI checks them out and `hugo --gc --minify` does NOT
clean the dir first, so dead pages + "Powered by Hextra" assets shipped in
every deploy artifact until purged; `public/` + `resources/` now gitignored).

**Do not re-add a theme, and do not trust `themes/` content if it reappears.**

- Templates: `layouts/_default/{baseof,single,list,taxonomy,index}.html`
- Styles: `static/css/blackcat.css` (v2 card system, `.library-type-nav`,
  `.tag-pill`, etc. — every class emitted by layouts must have a selector;
  that gap caused the 2026-09-02 incident, see rendering reference)
- `single.html` renders ANY page: breadcrumbs → type badge
  (`.Params.contenttype` falling back to section name) → status badge →
  "Open Canonical Source" button (`.Params.source`) → GitHub button
  (`.Params.github`) → ★ stars → reading time → "Updated <date>" → `.prose`
  content → topics + tags pills.
- `list.html` renders cards by date desc; card class
  `type-<contenttype|type|page>`. Blog cards show type `blog`
  (no accent color yet — optional 1-line CSS polish, needs approval).

## Config (hugo.yaml)

- `baseURL: https://theblackcat98.github.io/TheBlackCat/` — **project site**:
  every URL carries `/TheBlackCat/`. Root-absolute paths don't get the prefix
  from `relURL` (see rendering incident, defect 2).
- `enableGitInfo: true`; goldmark `unsafe: true` (raw HTML allowed in md);
  `highlight.noClasses: false`.
- Taxonomies: `tag: tags`, `topic: topics`, `contenttype: contenttype`
  (singular=plural — Hugo indexes FM by the plural name; see incident).
- `menu.main` order: Library (10), Collections (20), Projects (30), Notes
  (40), **Blog (45, added 2026-09-04, pageRef /blog)**, GitHub (50).

## Content sections

- `content/library/<domain>/` — canonical library (domains: ai, programming,
  tools). Skills as page bundles under `library/ai/skills/<slug>/index.md`.
- `content/inbox/` — everything starts here (except blog posts).
- `content/blog/` — page bundles per post (`<slug>/index.md`). Legacy flat
  files + a manuscript bundle exist; leave them alone.
- `content/collections/`, `content/projects/`, `content/notes/`, `content/docs/`.
- Repo docs: `AGENTS.md` (contract) + `docs/CONTENT_MODEL.md` (types) +
  `docs/DESIGN.md` — the repo's own canon; keep them in sync with reality.

## Deploy

`.github/workflows/pages.yaml`: push to main → checkout (fetch-depth 0) →
Hugo 0.147.4 extended (apt .deb) → `hugo --gc --minify --baseURL <pages
base_url>` → upload `./public` → deploy-pages. Build ≈30–40 s; Pages serve
lags ~1 min. Pages build_type = `workflow` (actions/verify-pages fine).
