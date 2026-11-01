# Static tool pages (build & rework)

How to author or rework a standalone page under `static/<slug>/` that WE own
(gallery, viewer, calculator) — where we are free to edit, generate and
vendor. For publishing a file Nik sent byte-identical, use
`references/live-artifact-pages.md` instead; its "never touch the artifact"
contract does not apply here.

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
   - Run the whole multi-probe chain in ONE browser_exec block — idle tabs
     recycle and lose state between calls.
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

## Verification ladder

Same ladder as live-artifact-pages: CI run whose headSha matches your commit →
live URL 200 → browser assert on the LIVE url (computed styles, svg/canvas
counts, resource list for the no-third-party claim), not only on localhost.
