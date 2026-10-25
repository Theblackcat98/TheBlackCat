# The projects section: generated from GitHub

`content/projects/` is no longer maintained by hand. `scripts/sync_projects.py`
keeps a page per repository and `.github/workflows/projects.yaml` runs it daily
(05:40 UTC), lints what changed, commits `projects: sync from GitHub (<date>)`
and pushes — the push is what deploys. Pages appear/disappear from
`/projects/` on their own; do not "fix" a missing project by hand.

Eligibility: public, not a fork, not archived, not disabled, owner from
`PROJECTS_OWNER` (default `Theblackcat98`). Generated fields: `title`,
`contenttype`, `language`, `stars`, `github`, repo topics as `tags` (max 5),
`description`, `created`, `updated`, plus a short body and the GitHub link.

## Two classes of page

| Page | How it is treated |
|---|---|
| Hand-written (exists, slug NOT in `content/projects/.sync-manifest.json`) | Only `stars:` is refreshed. Everything else is never touched. |
| Generated (slug in the manifest) | Regenerated each run; `created` is the repo's `created_at`; `updated` only moves when something else changed. |

`content/projects/.sync-manifest.json` is a **dotfile on purpose** — Hugo skips
dotfiles, so the generated-slug list never reaches the site.

Taking a page over by hand: edit it, then delete its slug from the manifest.
It will never be regenerated or deleted again.

## Invariants

- **Never rewrite a curated metadata field with the API's "more correct"
  value.** GitHub's primary language flattened a hand-written
  `language: "Hugo / HTML / CSS / Markdown"` to `"HTML"`, and the card only
  shows the first segment. Refresh only volatile machine-owned numbers
  (`stars`); leave `language`, title, description, tags and dates alone.
- **Delete only what the generator created.** A generated page whose repo is
  now private/archived/deleted is removed (manifest bookkeeping); hand-written
  pages are never removed, even when their repo no longer qualifies. Removing
  those is a content decision for Nik.
- **`--dry-run` must guard every write**, not just the final manifest save:
  guard `write_text`, `mkdir`, `rmtree` and the manifest together. A dry run
  that only skips the last step still created 18 pages and left the manifest
  empty, so the next real run treated them as hand-written and orphaned them.
- `created` = the repo's `created_at`, not today. Using today dumps every new
  project onto the home page's "newest eight items" in one shot.

Tags come from repo topics; the first run added ~40 one-project tags (real tag
pages, but sprawl). Restricting generation to the existing vocabulary is an
option Nik has not taken yet.

## Why a scheduled commit and not client-side fetching

"Dynamically updated" on this site means a workflow that commits into
`content/`. `docs/DESIGN.md` forbids third-party requests and JS-only lists
(every list must be complete HTML without JavaScript), so a browser-side
fetch of `api.github.com` is off the table without changing the design
contract.

## Verification ladder (all four, in order)

1. `python3 scripts/sync_projects.py --dry-run` twice — the second run must
   report `nothing to do` AND leave `git status content/projects` unchanged.
2. Prove the delete branch locally: `mkdir` a fake `content/projects/zzz-test/`,
   add `"zzz-test"` to the manifest, run — it must be removed, the manifest
   back to N, and no other diff.
3. `/tmp/hugo --gc --minify`, then count cards in `public/projects/index.html`
   and grep one generated page for its description. Minified HTML writes
   attributes unquoted (`data-title=clipway`), so grep for the value, not
   `class="card"`.
4. `gh workflow run projects.yaml` and read the log: expect
   `nothing to do`, `nothing new to lint`, `projects are already up to date`.
   The **no-op path is the only one CI exercises**, so a dispatch that skips it
   proves nothing — the first dispatch failed on the lint step, not the sync.
   Then curl `/projects/` and one generated `/projects/<slug>/` for 200.

Hand-written pages for archived/private repos still render, so `/projects/`
counts MORE than the eligible-repo count. That is expected, not a sync bug.
