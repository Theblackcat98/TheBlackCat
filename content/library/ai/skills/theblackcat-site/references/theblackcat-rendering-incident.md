# Case study: TheBlackCat rendering investigation (2026-09-02/03)

One user report ("pages not rendering — widgets like links to pages and
libraries"), four distinct defects, two agent sessions. Reusable because
every failure mode and every dead-end generalizes.

## The four defects and their fixes

| # | Symptom | Root cause | Fix (commit) |
|---|---|---|---|
| 1 | Library type-nav counts all 0 | `len (where $pages ...)` over section pages only | count over `site.RegularPages` (990d5b7) |
| 2 | Nav links 404 | `printf "/types/%s/" \| relURL` — relURL never prefixes baseURL to root-absolute paths | drop the leading slash (990d5b7) |
| 3 | `/types/<term>/` all 404 | Hugo indexes taxonomy front matter by the PLURAL name (`types:`), never the config key (`contenttype:`) | `taxonomies: contenttype: contenttype` (129e7a1) |
| 4 | Everything renders as unstyled text | b7661b6 template redesign emitted a component vocabulary (`.cards`, `.card-meta`, `.library-type-nav`, ...) that `blackcat.css` never learned | append styles for the v2 classes using existing tokens (fd77858) |

## The decisive technique: minimal-site bisection

When a Hugo feature misbehaves in one repo, rebuild the feature in a
scaffold site and flip ONE variable per build. This turned a day of
theorizing into a 20-minute diagnosis:

```bash
mkdir -p d/content/post d/layouts/_default
# hugo.yaml: only the variable under test
# content/post/one.md: minimal front matter
# layouts: 3-line list/single/index templates so output actually writes
hugo -s d -d d/public
find d/public -name '*.html'   # term pages present or not = the answer
```

Rules learned the hard way:

- **Never trust a test scaffold's plumbing before reading its results.**
  Session 1's bisect failed silently on `-q` (not a Hugo flag — it dumped
  help text and skipped the build), then a broken `find -maxdepth` hid the
  term pages and misdirected a whole session. The fix run started by
  REPRODUCING from scratch, which exposed session 1's harness bugs.
- Hold everything constant except the variable (config key vs front-matter
  key vs value form vs plural name).
- A hypothesis "disproven" under a buggy harness is NOT disproven — re-test
  under a verified-good harness (scalar-vs-list looked dead twice before it
  was cleared properly).
- Positive controls matter: a pair that works (`tag: tags`) alongside a
  failing pair localizes the fault; a run where nothing works means your
  harness is broken.

## The tell that cracked defect 3

"tags work, topics work, types doesn't." Topics is a CUSTOM taxonomy that
works — the only difference from the failing one is that content actually
sets `topics:`. Combined with "term pages generate but contain zero terms,"
the only consistent explanation was plural-name indexing. Proof matrix via
four scaffold sites (config pair × FM key) in one script run.

Also: a local build of the REAL repo (same Hugo version as CI, arm64 .deb
extracted to /tmp with dpkg-deb -x, no root install) reproduced the defect
and then verified the fix — `hugo -d /tmp/out` on a 1GB Pi takes ~3s.
"Let CI build" is for deploys; local builds are fine and essential for
debugging. Use `df -h /` before extracting anything.

## Defect 4: why two sessions of curl could not see it

- HTTP 200 + correct classes in the HTML + data present in the DOM — yet
  the page rendered as raw text because the CSS never styled those classes.
  curl CANNOT catch a stylesheet gap; only pixels can.
- The working page chrome (header/nav/breadcrumbs styled) masked the gap.
- User's phone screenshots were the real bug report — the agent's "verify
  with curl" loop was structurally blind to the actual complaint.
- Fix verification: `scripts/css_coverage.py` + rendered screenshots via
  `scripts/cdp_screenshot.py`, inspected with `vision_analyze` (mobile AND
  desktop viewports, plus the densest data page — not just the landing).

## Timeline / revert path

Commits in fix order: 990d5b7, 17401e4 (session 1), 129e7a1, 9b5ba8e (docs),
fd77858 (CSS). Full revert: `git revert fd77858 9b5ba8e 129e7a1 17401e4
990d5b7`. Investigation record:
`knowledge/research/theblackcat-site/2026-09-03-types-taxonomy-investigation.md`.
