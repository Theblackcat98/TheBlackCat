# The BlackCat Design System & Redesign Roadmap

Design direction agreed with Nick, Aug 2026. This document is the source of
truth for all presentation-layer work. The repo is the archive; this file
governs how the archive *looks*.

## Visual thesis

A quiet, dense, beautifully typeset **personal digital library** with
technical details underneath — knowledge base + technical library + developer
portfolio hybrid. Deliberate, quiet, dense, intellectually oriented.

The site must communicate: *"There is a lot of information here, but I can
always figure out where I am."* Navigation beats decoration.

**Never look like:** corporate docs site, résumé, blog, Notion clone, generic
Tailwind landing page, neon "AI dashboard."

Aesthetic keywords: dark room · paper · terminal · library.

## Core rules

1. **One accent color.** Everything else exists to support hierarchy.
   Current palette ("Oatmeal & Slate", see `:root` in `static/css/blackcat.css`).
   Light = warm paper (`#f7f7f5`-ish), Dark = soft charcoal (`#101216`-ish,
   never pure black). Both themes designed explicitly, dark is not an inversion.
2. **Typography does the heavy lifting.** UI = clean sans (Plus Jakarta Sans),
   body = serif (Newsreader), display = Playfair Display (sparingly),
   code = Fira Code. Two faces + mono is the maximum.
3. **Spacing scale:** 4/8/12/16/24/32/48/64/96px — nothing off-scale.
4. **Borders sparingly.** Prefer whitespace, typography, background contrast,
   subtle separators, occasional cards. Editorial, not dashboard.
5. **Tags are metadata, not decorations.** `ai · agents · harnesses` beats
   twenty colorful pills.
6. **Motion: almost none.** Card hover 2px elevation, link underline,
   150ms fades for search/theme. No parallax, scroll animations, glass.
7. **Mobile is designed, not deferred.** Priority order: brand → search →
   current section → content → metadata → related → navigation.

## Content-type vocabularies (the big opportunity)

The front matter already distinguishes types; the UI must reflect it:

- **Bookmark** — compact, metadata-heavy. Type label, title, source domain,
  tags, one-line why-it-matters.
- **Article** — editorial. Large title, readable measure (~68ch), prominent
  headings, three-column desktop layout (nav | article | on-this-page),
  collapses to single column on mobile.
- **Project** — technical. Name, language · GitHub, description, ★ stars,
  updated date, `[View on GitHub ↗]`, related links. Filterable by tag
  (All / AI / Developer Tools / CLI / Web / Experiments).

## Agent-compatible presentation (stable primitives)

Templates should expose predictable components so the agent can add content
without inventing presentation:

```
layouts/
├── _default/        baseof, single, list
├── components/      card, project-card, bookmark-card, metadata,
│                    tags, breadcrumbs, related, search-result
└── shortcodes/      callout, figure, ...

static/css/
├── reset.css  variables.css  typography.css
├── layout.css components.css  responsive.css
```

Flow: agent writes Markdown + front matter → stable Hugo templates →
consistent UI. This is why we keep a small custom theme, not a framework.

## Feature specs

- **Search (top priority after foundation):** input on homepage + `⌘K`/`Ctrl-K`
  command palette. Searches titles, descriptions, tags, topics, content, URLs.
  Results grouped by type with metadata rows. More important than any animation.
- **Breadcrumbs everywhere:** `Library / AI / Agents / Agent Memory` — mirrors
  the filesystem domains; scales to thousands of docs.
- **Metadata as UI, not leaking YAML:** small rows like
  `ARTICLE · Agent Architecture · AI·Agents·SE · Updated Aug 28, 2026 · 12 min`.
- **Code treatment:** syntax highlighting, copy button, filename label,
  language indicator, horizontal scroll, line numbers where useful,
  terminal blocks, good inline code.
- **Homepage = front desk of the library:** hero + search, domain explorer
  with counts, recently added (dated, typed), featured collections,
  project highlights.

## Status snapshot — as of e9919ac (Aug 28, 2026)

Done in the current implementation:

- ✅ Custom typography loaded (Plus Jakarta Sans / Newsreader / Playfair / Fira Code)
- ✅ Header with brand block, nav, GitHub link; footer
- ✅ Homepage: hero + vault pillars (dynamic counts) + featured projects
  (pinned/stars fallback) + recently cataloged (cross-section)
- ✅ Split-pane library view with shelf sidebar, client-side filter search,
  bookmark cards with type/status badges
- ✅ 17 project entries with language/stars/github front matter; project cards
- ✅ Prose typography, article detail view, notes/collections grids
- ✅ Permalink fix for GitHub Pages subpath baseURL

Remaining gaps (in recommended order):

1. ⌘K / Ctrl-K global search palette (search is the #1 missing interaction)
2. Breadcrumbs on all pages
3. Article template: three-column layout with on-this-page TOC + related
4. Designed light/dark theme pair (currently one designed theme; verify dark
   is designed, not inverted) + theme toggle
5. Code block treatment (copy button, filename, language label, line numbers)
6. Mobile refinement pass (nav collapse, priority order above)
7. Component decomposition (layouts/components/*) + CSS split into
   tokens/typography/layout/components/responsive files
8. Accessibility & keyboard navigation polish

## Implementation order (original roadmap)

Visual identity → design tokens → global shell → homepage → project template
→ bookmark template → article template → search → collections/discovery →
polish/accessibility.

**Design the system once, then let the content multiply it.**
