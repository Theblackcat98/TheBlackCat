# Static tool pages (build & rework)

How to author or rework a standalone page under `static/<slug>/` that WE own
(gallery, viewer, calculator) — where we are free to edit, generate and
vendor. For publishing a file Nik sent byte-identical, use
`references/live-artifact-pages.md` instead; its "never touch the artifact"
contract does not apply here.

Reimplementing someone else's tool also lands here: a tool URL from Nik is a
brief, not a source of code. Read it for behaviour, then write the page.

## Route and approval

- Small additive change → direct push (after the standard sync + CI gate).
- **A page rework, a new vendored dependency, or a rewrite of page logic →
  branch + draft PR**, even when told to "push when done" — Nik redirects
  finished direct pushes to draft PRs for anything with review surface. After
  opening the PR, `git checkout main` again: other sessions work in that tree.
- Vendoring a CDN dependency: file it under `static/<slug>/vendor/`, reference
  it relatively (`vendor/mermaid.min.js`), pin the version, and put the
  sha256 in the commit message. Prove the no-third-party claim in the browser:
  `performance.getEntriesByType('resource').filter(r => !r.name.includes(location.host))`
  must be `[]`.

## Adding a tool to the registry

`python3 scripts/check_tools.py` is the gate, and it is stricter than
AGENTS.md's four-step recipe. One commit carries all five pieces — page,
write-up, `data/tools.yaml` row, light and dark thumbnails — or the check
fails and a split commit ships a live page whose hub card 404s.

- The page loads `../toolkit/toolkit.css?v=1` and
  `../toolkit/toolkit.js?v=1` with `data-tool="<slug>"` in `<head>`, and keeps
  `<a class="back tk-fallback" href="../tools/">` as the no-JS fallback
  (toolkit.js hides it once it has drawn its own bar).
- SEO block the check requires: `<meta name="description">`,
  `<link rel="canonical">`, `<meta property="og:image">` pointing at
  `toolkit/thumbs/<slug>-light.webp`, and a `WebApplication` JSON-LD script.
- Banned inside the page: Google Fonts, `class="theme-toggle"` /
  `id="theme-btn"`, and `@media (prefers-color-scheme…)` in its `<style>` —
  the workshop themes through `light-dark()` tokens, so a hand-rolled dark
  media query is a second theme that drifts. The check also counts CSS braces,
  so an unbalanced `{` fails the build.
- Write-up `content/library/tools/<slug>.md`, `contenttype: reference`, and
  `tool: <slug>` in the front matter — that key is how the registry check
  matches entry to page.
- `data/tools.yaml` needs every field the check demands (`id, name, url,
  writeup, category, kind, short, desc, tags, added`), `added` from
  `date +%F`, and every `related:` id must already exist.
- Thumbnails: `scripts/shoot_tools.py` builds the site with Hugo first, so it
  only runs where that Hugo is installed. Fallback with the same contract —
  screenshot the page at 1280×800, DPR 1, once per scheme, resize to 640×400,
  save WebP q82 as `static/toolkit/thumbs/<slug>-{light,dark}.webp`, then let
  `check_tools.py` confirm both exist and are non-empty.

## Generator pattern for large pages

- A page past ~1k lines gets a generator: `scripts/<slug>/build.py` plus a
  data JSON beside it, stdlib only, paths derived from the script's own
  directory (`os.path.dirname(os.path.abspath(__file__))`) — never absolute
  scratch paths. The generated page is committed; CI and Pages never run the
  generator.
- **Integrity contract**: with unchanged data, regenerating must reproduce the
  committed page sha256-identically. Check it after every generator edit — a
  diff you did not intend means the template changed semantics, not just
  formatting.

## Local verification loop

1. Serve the directory: `python3 -m http.server <port>` from
   `static/<slug>/` (background terminal), test, kill when done.
2. **Serve from the branch under test.** The server reads the working tree on
   every request — after `git checkout main` (e.g. to open the PR) it silently
   serves the OLD page, and hours of debugging follow a feature that
   "vanished". `git branch --show-current` before blaming the browser.
3. Browser-harness rules that keep the loop honest:
   - Run the whole multi-probe chain in ONE browser_exec block. A call that
     ends loses its tab: the next call's `js()` can land on a fresh blank
     document, where a selector that worked minutes ago is `null` and the
     traceback blames your page. Open every block with `new_tab(url)` +
     `wait_for_load()` and assert a marker count before any click —
     `Cannot read properties of null` on a selector you know exists means
     wrong document, not broken markup.
   - A NEW session name is a fresh isolated browser: `new_tab(url)` the target
     inside that session and assert `location.href` plus a marker id that only
     the new page has BEFORE trusting any result — evaluating against a stale
     tab fails silently and looks like page bugs.
   - `js()` awaits whatever the expression returns, under a ~5s IPC cap.
     Expressions must return strings; kick off long async work (render-all
     queues) without returning the promise, then poll with follow-up
     evaluates.
   - Programmatic scrolling (`window.scrollTo`, `scrollingElement`, hash
     jumps, CDP mouseWheel) can be unavailable in a starved headless tab. Do
     not conclude a page is broken from scroll-driven behavior alone — drive
     the code path with a direct call instead.

## Testing exports without touching the filesystem

Download, copy and share-link features need a real assertion; "the button did
not throw" proves nothing. In the same browser block, stub the sinks, click,
then read the payload back:

```js
HTMLAnchorElement.prototype.click = function(){ window.__lastDl = this.download; };
const orig = URL.createObjectURL.bind(URL);
URL.createObjectURL = (b) => { window.__blobs.push(b); return orig(b); };
// then: await window.__blobs.at(-1).text()   — js() awaits a returned promise
```

- Validate generated SVG/XML with a real parser outside the browser
  (`xml.etree.ElementTree.parse`) and assert on the attributes that carry
  meaning — fills, `viewBox`, text. A string that looks right can parse and
  still draw nothing.
- **Round-trip the share link**: read the URL the page builds, `goto_url` it,
  and assert the restored state, not merely that it loaded.
- `navigator.clipboard` needs a permission grant in headless contexts; assert
  the state the page changed rather than the clipboard contents.

## Page-engine pitfalls (mermaid)

- `mermaid.render` is not concurrency-safe: N parallel calls stall all but the
  first, silently — no errors, no rejections. Serialize every render through
  one promise queue (`queue = queue.then(() => render(card))`).
- Lazy rendering on IntersectionObserver alone is unreliable (occluded or
  background tabs never deliver callbacks). Pair it with a bounded
  `setInterval` sweep (~700ms) that renders cards within viewport + ~900px and
  `clearInterval`s once nothing is left unrendered.
- Progressive enhancement still applies: ship the catalog/list HTML in the
  document, use native `<details>` for source panels, let JS only enhance
  (matches the repo's "complete HTML without JavaScript" rule).

## Generator & visual pitfalls

- **Nothing cut out of a silhouette can resolve to the background.** Eyes or
  holes painted in the page's surface colour look right in place and export as
  floating blobs; paint a background rect of the same resolved colour into the
  export. Resolve `light-dark()` tokens by reading a probe element's computed
  `color` — `getPropertyValue('--token')` returns the unresolved
  `light-dark(…)` string and gives you a wrong hex.
- **A selection ring in the accent colour vanishes on the accent swatch.** Use
  a contrast colour (`--ink`) plus a gap in the surface colour, or the default
  selection is invisible exactly where the user is looking.
- **Judge icon silhouettes at full size, not in the 44px picker grid.** A shape
  that survives the picker can still read as the wrong object when large
  (a tail sitting high, a fin too round); render the chosen shape big and look
  at the pixels before shipping.

## Verification ladder

Same ladder as live-artifact-pages: CI run whose headSha matches your commit →
live URL 200 → browser assert on the LIVE url (computed styles, svg/canvas
counts, resource list for the no-third-party claim), not only on localhost.
Then open the committed 640×400 thumbnails — they are what the hub card shows,
and their byte count says nothing about whether the avatar is legible.
