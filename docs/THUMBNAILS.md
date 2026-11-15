# Thumbnails

Every card on the site carries an image, and each image family is made a
different way. This document is the standing recipe for all of them. It is a
list, not a closed set: when a new category or type of thumbnail appears, add
its recipe here as a new subsection (see §4) in the same change that ships the
first example.

Unless a section says otherwise, a recipe below is **evidenced** — taken from
the script, source files or git history named in it. Anything that could only
be read back off the shipped files is marked *convention inferred from shipped
files*.

## 0. Overview

| Family | Location | Size | Format | Naming | Consumed by | Checked by |
| --- | --- | --- | --- | --- | --- | --- |
| Toolkit cards | `static/toolkit/thumbs/` | 640 × 400 | WebP, one file per scheme | `<id>-light.webp`, `<id>-dark.webp` | `layouts/partials/tool-card.html` (Tools hub and Showcase grids) | `scripts/check_tools.py`: a pair is required for every `data/tools.yaml` id |
| Anatomy gallery | `static/anatomy/thumbs/` | 1200 wide, height varies | WebP, single light image | `<slug>.webp` | Cards in `static/anatomy/index.html` | Nothing automated; the `<img>` carries the true `width`/`height` |
| Anatomy in Three.js gallery | `static/anatomy-threejs/thumbs/` | 1200 × 750 | WebP, single light image | `<slug>.webp` | Cards in `static/anatomy-threejs/index.html` | Nothing automated; the `<img>` carries the true `width`/`height` |
| Project cards | `static/projects/thumbs/` | 640 × 400 | WebP, one file per scheme | `<id>-light.webp`, `<id>-dark.webp` | `layouts/partials/project-card.html`, behind a `fileExists` check (a project without art renders as before) | Nothing automated |

Two cross-cutting rules:

- **Verify both schemes by eye.** A thumbnail named `-dark` that shows the
  light theme is a shipped bug, not a style choice. Several families below
  historically shipped one identical file in both slots; that is recorded
  where it happened, not recommended. The one designed exception is the
  Showcase exhibit banner (§1.1): a single composed banner deliberately
  serves both scheme slots, byte-identical.
- **No third-party requests.** Thumbnails are local files like everything
  else on the site; the pages they depict must also load without network
  calls (Showcase artifacts use the vendored Three.js in `static/vendor/`).

## 1. Toolkit card thumbnails

`static/toolkit/thumbs/<id>-{light,dark}.webp`, 640 × 400, one per entry in
`data/tools.yaml`. `scripts/check_tools.py` fails if either file is missing
or empty.

One rule governs this family before any recipe: **a Showcase exhibit's card
image is a composed banner, never a page screenshot** (§1.1). Full-page
screenshots (§1.0) are for tools, apps and non-exhibit cards only.

### 1.0 The generic route (tools, apps and non-exhibit cards)

`python3 scripts/shoot_tools.py <id>` is the repeatable path:

1. Builds the site with Hugo into a temporary directory and serves it
   locally under the `/TheBlackCat` prefix.
2. Opens each registered page in Playwright at 1280 × 800, once per colour
   scheme, with `bc-theme` set in `localStorage` before load and the
   matching `color_scheme` on the browser context, then sets
   `document.documentElement.dataset.theme` and dispatches `themechange`.
3. Screenshots the viewport and downscales to 640 × 400 WebP, quality 82
   (Pillow `save_webp` in the script).

This works for anything whose theme follows the site's `bc-theme` mechanism.
It does not work for subjects that keep their own theme state — the exhibit
galleries' figures are captured by the §2 recipes instead, and exhibit cards
themselves are banners (§1.1).

### 1.1 Showcase exhibits: composed banners

Every Showcase exhibit — the SVG Anatomy set, the eleven axonometric
plates, the Anatomy in Three.js collection — takes a **composed banner**,
not a screenshot of its page:

- **Composition:** a typographic panel on the left (kicker
  `THE BLACKCAT · SHOWCASE`, the title in Newsreader, a one-line
  description, `EXHIBIT NN / TT`) over a dotted drafting ground on cream
  paper, with a render of the exhibit's cover subject filling the right of
  the frame and bleeding off the edges.
- **Numbering:** `NN / TT` is the cover item's position within its own
  series — the Anatomy banner's quadcopter is `EXHIBIT 01 / 06`, the
  Colosseum is `EXHIBIT 01 / 11`, the Three.js collection's Wankel is
  `EXHIBIT 01 / 06`.
- **One file, both slots:** the same banner is installed as both
  `<id>-light.webp` and `<id>-dark.webp`; the two files are byte-identical.
  This is the designed exception to the §0 verify-both-schemes rule.
- **Build:** compose as HTML at 1280 × 800 with the site's own fonts
  (`static/fonts/`), screenshot, downscale to 640 × 400 WebP, quality 82.
  Match the paper to the subject render's background so the subject blends
  with no visible rectangle edge — the Anatomy in Three.js banner uses
  `#faf9f5`, the Wankel canvas's own ground, with the subject's left edge
  faded into the dotted ground.

The plates' banners are covered in §1.2; the Anatomy (SVG) banner follows
the same recipe with the quadcopter as cover subject. An exhibit's own
gallery cards use a different family entirely; see §2.

**Correction, 2026-11-14.** The three Three.js figures first shipped on
2026-11-13 as three loose Showcase cards whose thumbnails were full-page
screenshots (made by driving each figure's own theme pills, since the
figures ignore `bc-theme`). The owner rejected that the next day: exhibits
are banners, and the figures belong in one collection, not three cards.
The loose entries were removed; the collection ships as the single
`anatomy-threejs` entry with the banner above, and the per-figure captures
moved to the collection's own gallery (§2). Do not resurrect the screenshot
route for an exhibit card.

### 1.2 Axonometric plates

The eleven plates (`colosseum`, `pisa`, `petra`, …) are not screenshotted
from their pages either. Two generations of card image exist in git history:

- **Current: banner stills.** Each plate has a composed banner — the same
  typographic panel as §1.1 (kicker, title, one-line description, `EXHIBIT
  NN / 11`) with a panned render of the plate on its drafting sheet filling
  the right of the frame. The animated versions of these banners are the
  `banner-*.gif` files in the `axonometric-plates` repository's `assets/`;
  the card images are stills of the same artwork (commits `775969c`,
  `e575fa2`: "card images from the rebuilt banners"). One still serves both
  slots: every plate's `-light` and `-dark` files are byte-identical.
- **First generation: frame captures.** Before a plate had a banner, its
  card image was a direct 640 × 400 capture of the plate itself with the
  toolkit bar stripped (commit `17dd1ec`), taken per scheme — the framing
  rule for that route: the subject centred, the drafting-sheet frame
  visible, light as the day sheet and dark as the dusk sheet.

A new plate therefore needs a banner, not a screenshot (the standing rule
is §1.1): compose the frame
with the plate's number (`EXHIBIT NN / 11` at the time of writing; the count
changes as plates are added), export a 640 × 400 WebP still, and install it
under both scheme names — or, if it must ship before its banner exists, use
the frame-capture route and replace it when the banner lands.

## 2. Exhibit gallery thumbnails

`static/anatomy/thumbs/<slug>.webp` — one image per figure in the Anatomy
exhibit, used by the hand-written cards in `static/anatomy/index.html`.

- **Size:** 1200 px wide; the height keeps the capture's aspect (the shipped
  set runs 856–1000 px). The card's `<img>` states the true dimensions.
- **Recipe:** a screenshot of the figure's **light** build — there is no
  dark variant; the gallery is a light page. The captures the figures were
  built from are kept in `static/anatomy/src/<slug>/shots/`. Evidenced for
  the most recent figure: `spot.webp` (1200 × 977) is the Spot figure's v3
  light desktop capture, resized to 1200 wide and saved as WebP; the earlier
  figures follow the same pattern (*convention inferred from shipped files*
  for those).
- **Framing:** the whole figure card — bench, controls and caption strip —
  recognisable at card size. Shoot the opening state of the figure, not a
  mid-animation frame that hides the subject.

The **Anatomy in Three.js gallery** (`static/anatomy-threejs/thumbs/`,
cards in `static/anatomy-threejs/index.html`) follows the same
single-light-image pattern, with its own recipe:

- **Size:** 1200 × 750 — the figures are 16:10 plates, unlike the SVG
  figures' varying heights.
- **Recipe:** serve `static/` (or the built site) and open the figure at
  1280 × 800. The figures keep their own theme state: they ignore
  `bc-theme` and honour no URL theme parameter (no `?theme=`), and they
  open in Light by default — confirm the Light pill is the active one (the
  figure's `--anatomy-bg` custom property reads `#f3f2ee`; the Dark pill
  flips it to `#0c0e10`, a reliable programmatic check). Hide the site
  chrome before shooting (the toolkit bar and the `← All tools` fallback
  link) so the capture is the bare figure, like `spot.webp` above.
  Screenshot the viewport, resize to 1200 × 750, save WebP quality 82.
- **Framing:** as above — the whole figure card, opening state.

## 3. Project thumbnails

`static/projects/thumbs/<id>-{light,dark}.webp`, 640 × 400, for the project
grid. Unlike §1.2 these are genuine per-scheme pairs: the same composition
rendered on the light and dark palettes.

- **Sources are not in this repo.** The artwork lives in
  `~/workspace/your_files/project-thumb-pilot/`: `build_pilot.py`,
  `build_pilot_v2.py`, `build_batch2.py`, `build_batch3.py` and
  `build_rest.py` hold a `MOTIFS` dictionary of hand-drawn inline SVG
  fragments, one per project, and compose them into batch HTML pages
  (`batch2.html`, `batch3.html`, …) that are screenshotted to the WebP pairs
  (contact sheets in the same folder record the review pass). If that folder
  is unavailable, redraw from the shipped WebPs — they are the fallback
  source of truth.
- **Composition** (from the build scripts): a 640 × 400 banner on a
  graph-paper ground. Header `THE BLACKCAT · PROJECTS` and the project's
  running count (`NN / 38`); a short italic Newsreader tagline written for
  the project; a footer line of facts (primary language · ★ stars ·
  category). The motif occupies a 400 × 400 panel on the right
  (`viewBox="0 0 400 400"`).
- **Motif rules**, evidenced across the shipped set:
  - One simple geometric motif that stands for the project — an object or
    glyph drawn from what the project is (config files for `agentconfigs`,
    a phone running a terminal for `opencode-android`, an image becoming a
    solid for `image-to-stl`).
  - Letterforms only when the motif *is* letterforms or text — file-type
    glyphs, a `</>` mark, small labels that are part of the depicted object
    (folder names on the config files). Never the project's name as a title:
    the card prints the name; the artwork does not.
  - Drawn in the site's ink/paper tones with a single accent, using the
    shared stroke classes of the build scripts (`thin`, `faint`, `soft`,
    `acc`, …), so a new motif sits naturally beside the existing 38.
- **Adding one:** write the motif fragment, add the project to a batch
  script's project list with its tagline and footer facts, render both
  palettes, export the 640 × 400 WebP pair, and check the grid with the
  `fileExists` gate in mind — a missing pair is silent, not an error.

## 4. Adding a new category or type

When a thumbnail appears that none of §1–§3 covers:

1. **Write its recipe here first** — a new subsection under the family it
   belongs to (toolkit, gallery, projects), or a new §-level family if it
   lives somewhere new — in the same change that ships the first example.
2. **Fix the contract in the recipe:** directory, filename pattern, exact
   size, format and quality, one file per scheme or a single file (and if a
   single file serves both scheme slots, say so plainly, as §1.2 does).
3. **Name the consumer:** the partial or page that renders it, so a future
   reader can find every place the image appears.
4. **Get it checked, or say it isn't:** if the family is registered in
   `data/tools.yaml`, `scripts/check_tools.py` already requires the toolkit
   pair. Anywhere else, state in the recipe that nothing automated guards it
   (as §2 and §3 do) — or extend the checker in the same change.
5. **Verify by eye, both schemes,** at final size: right theme, subject
   framed and recognisable, no site chrome that should have been stripped
   and no missing chrome that siblings carry.
