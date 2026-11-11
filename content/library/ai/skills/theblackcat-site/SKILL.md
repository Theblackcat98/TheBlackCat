---
name: theblackcat-site
description: "Operate Nik's TheBlackCat site: save bookmarks, write blog posts (draft-flag flow), weekly triage, and maintain the Hugo repo safely."
version: 1.8.0
author: Hermes Agent
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [GitHub, bookmarks, blog, Hugo, TheBlackCat, knowledge-base]
    related_skills: [hugo-site-maintenance, github]
---

# The BlackCat Site

Operates Nik's public knowledge library **Theblackcat98/TheBlackCat** —
local clone at `~/hermes/repos/Theblackcat98/TheBlackCat` (branch `main`).
Hugo site, deployed by GitHub Actions (`.github/workflows/pages.yaml`)
on every push to `main`. Live at https://theblackcat98.github.io/TheBlackCat/

⚠️ **The repo is PUBLIC.** Only public information goes in. If the user
includes personal/private context, confirm before writing it into the repo.

## Triggers

- "bookmark this" / "add to my bookmarks/library/BlackCat" → bookmark workflow
- "add this to my website" / "put this on the site" **with an HTML file** →
  live artifact page (static page + library entry), see router below
- "add this tool to my website" **with a URL to someone else's interactive
  tool** → hosted copy: build our own page under `static/<slug>/`, never a
  vendored bundle — see `references/static-tool-pages.md`
- "write a blog post about X" / "blog this" → blog workflow (draft)
- "publish X" / "publish <slug>" → blog workflow (publish step)
- Editing this skill itself (SKILL.md or any reference) → do the edit in the
  skill store AND refresh the in-repo mirror (see "Standing: repo mirror")
- Weekly triage (cron 95f72348ff15, Sun 23:00) → triage section
- Site bugs, rendering issues, config/menu changes → site-model reference,
  then **propose, never push fixes without Nik's approval**

## Router — load the reference before acting

| Task | Load |
|---|---|
| Save a URL as a bookmark | `references/bookmark-workflow.md` |
| Weekly inbox triage / promote inbox items | `references/bookmark-workflow.md` (triage section) |
| Write or publish a blog post | `references/blog-workflow.md` |
| Site facts: layouts, config, taxonomy, CSS, menu, deploy, data pages (dashboard + its nightly sync) | `references/site-model.md` |
| Front matter recipes, reserved keys, placement rules | `references/content-model.md` |
| Dead links, the weekly link-check issue, lychee/CI link checking | `references/link-check.md` |
| Projects section, GitHub-repo sync, generated project pages | `references/projects-sync.md` |
| Publish an HTML artifact as a live page (sent file → `static/<slug>/`) | `references/live-artifact-pages.md` |
| Build a static tool page — a new tool, a reimplementation of a third-party tool, or a rework (registry, thumbs, generator, local test loop) | `references/static-tool-pages.md` |
| Past build/rendering incidents (context for debugging) | `references/theblackcat-*.md` |
| Generic Hugo debugging on any site (local builds, bisect) | `hugo-site-maintenance` skill |

## Hard rules (every task)

1. **Sync first**: `git -C ~/hermes/repos/Theblackcat98/TheBlackCat pull --ff-only`
2. **Never push fixes without Nik's approval** — diagnose read-only, propose,
   wait. Pre-authorized exceptions: bookmark saves, blog draft/publish per
   workflow, triage per its section, skill-mirror refreshes per the standing
   section below. Everything else (templates, CSS, config,
   menu, deletions) needs an explicit OK.
3. **Reserved front matter**: the field is `source` NOT `url`; `contenttype`
   NOT `type`; `draft: true` silently hides a page; dates from `date +%F`,
   never invented. Full table: `references/content-model.md`.
4. Reuse existing tags/topics case-insensitively; write lowercase kebab-case.
5. New items start in `content/inbox/` with `status: inbox` — promotion is
   triage's job (unless Nik asks to file directly).
6. Commit only files you touched — stage explicit paths (`git add <paths>`),
   never `git add -A`/`commit -a`. The checkout can carry uncommitted edits
   from another session; leave those alone and out of your commit. Never mix
   content and non-content (layouts/CSS/config/scripts) commits.
7. **Verify after every push**: CI run whose `headSha` matches YOUR commit →
   `success`, then live URL 200. Never gate on `gh run list -L 1` alone — right
   after a push the newest visible run can still be the previous commit's green
   one, a false pass (hit 2026-10-07). Template/CSS changes additionally
   need `css_coverage.py` + pixel screenshots (see hugo-site-maintenance).
8. Don't run `hugo` locally except for debugging per hugo-site-maintenance
   (same version as CI, extracted without root). CI owns deploys.
9. Never commit `public/` or `resources/` (gitignored 2026-09-04 — CI builds
   fresh; tracked build output shipped stale hextra-era files until purged).
10. **Dead references are content debt, not issue debt.** When Nik says "amend
   the issues" about a link-check report, fix the links in `content/`; the
   issue list is the symptom. One dead URL in two entries is two edits, and a
   report that reappears every Monday is a workflow bug, not a backlog item.
   Procedure, rot classes and the verified local lychee recipe:
   `references/link-check.md`.
11. **The remote can move between your sync and your push** (another agent
   pushes `main` too). Integrate with `git -c rebase.autoStash=true rebase
   origin/main` — plain `rebase` refuses on the dirty tree another session left
   behind, and `git stash`/`checkout` would disturb that session's work. Then
   re-gate on CI for the NEW `headSha` (rule 7).
12. **Long verification loops need a visible pulse.** After several minutes of
   tool calls with nothing said (hugo builds, lychee sweeps, CI waits), send one
   line: what is verified, what is left. Silence reads as a stall and Nik will
   ask what is taking so long.
13. **`content/projects/` is generated, not curated.** `scripts/sync_projects.py`
   owns it; a page it created is rewritten every run and deleted when the repo
   stops qualifying, while a hand-written page keeps its body and only has
   `stars` refreshed. Never hand-add a page for a public repo (the sync will
   make one), and never rewrite a curated `language` with GitHub's value.
   Rules, manifest and verification ladder: `references/projects-sync.md`.
14. **A standalone HTML artifact becomes `static/<slug>/index.html` plus a
   `contenttype: article` entry in one commit** — the asset is the content, so
   the content/non-content split (rule 6) does not apply to that pair, and
   two commits would ship a live page whose link 404s. Copy it byte-identical,
   keep the md5 to prove what Pages serves, and never tidy the artifact itself.
   Recipe, browser-render checks and the unquoted-attribute grep trap:
   `references/live-artifact-pages.md`.
15. **A tool URL is not a bookmark.** When Nik sends a link to someone else's
   interactive tool and says "add this to my website", the default is a page
   under `static/<slug>/`, not an inbox entry. But "host the tool" and "save
   the link" differ by hours, so settle which with ONE question before
   building — unless the request names the destination outright ("add this to
   my bookmarks"), which is an answer, not an ambiguity: run the bookmark
   workflow and do not make Nik re-confirm it. Never copy a production bundle — no license and no public repo
   means no right to the code; read the original for behaviour, then write our
   own implementation on the site's tokens. When the ask is a whole suite
   ("add all these tools"), the host-versus-bookmark question is already
   settled — don't re-ask it, plan instead: catalogue the modules, phase the
   build (engine first, then cheap high-traffic tools, dependency-heavy ones
   last) per `references/static-tool-pages.md` § Porting a whole tool suite,
   and put a dependency that would break the site's no-third-party rule
   (an AI model from a CDN, say) to Nik as a decision instead of absorbing it.
   A new tool is additive and ships
   direct to `main` in ONE commit (page + write-up + `data/tools.yaml` row +
   both thumbnails) because `scripts/check_tools.py` fails on any missing
   piece. Contract, checks and the Hugo-less thumbnail fallback:
   `references/static-tool-pages.md`.

16. **A "synced nightly" line on a page is a claim, not a fact.** Before you
   trust or extend a generated page, prove the producer runs
   (`gh run list --workflow=<file>`) and that its input can see what it claims
   to see — cross-check the summary fields against ground truth
   (`gh api /user/repos`, `gh api repos/...`). A committed JSON plus a green
   deploy only proves the file was committed. Mechanism, file map and the
   token trap: `references/site-model.md` § Data-driven pages.

## Repo facts at a glance

- **Two hubs, one registry.** `/tools/` (the workshop) is for things you *use*;
  `/showcase/` is for art and visual artifacts, figures built to be *looked at*.
  Both read `data/tools.yaml` — a showcase item is a normal entry with
  `category: showcase`, which `layouts/partials/lists/tools.html` filters out of
  every chip, count, featured strip and grid. `scripts/check_tools.py` still
  requires the entry, its thumbnails and its `static/<slug>/` page, so never
  "unregister" an artifact to move it. The showcase section is written as an
  article: the prose lives in `content/showcase/_index.md`, and
  `layouts/partials/lists/showcase.html` adds a card grid only past one item.
  New art → showcase. Anything with a job to do → tools.

- Custom layouts only (b7661b6 redesign); `hugo.yaml` has NO theme key;
  `themes/hextra` was removed 2026-09-04. Details: `references/site-model.md`.
- Project site → every URL carries the `/TheBlackCat/` prefix (relURL trap).
- Taxonomies: `tag`, `topic`, `contenttype` (singular=plural mapping, see
  rendering-incident reference for why).

## Standing: repo mirror of this skill (since 2026-09-05, commit 6614d7f)

This skill is mirrored **verbatim** into the repo at
`content/library/ai/skills/theblackcat-site/` (SKILL.md + every file in
`references/`, byte-for-byte; md5-checked at commit time), with a
human-readable `index.md` catalog page. Mirror the whole `references/`
directory, not a remembered count — the set grows, and a stale count in a
remembered list is how a reference silently stops shipping. The older
`library/ai/skills/blackcat-bookmark-skill/` entry points to it as the
current, full version. So:

- **Any future edit to this SKILL.md or a reference file must be followed by
  a mirror refresh in the same pass**: copy the changed file(s) into the
  bundle, commit, push, CI-gate, live-check — the standard verify loop.
  This counts as pre-authorized under hard rule 2 (it was Nik's explicit
  request, 2026-09-05) as long as ONLY the mirror changes. It binds edits made
  in ANY session, including a one-line `related_skills` change made while
  tidying up unrelated skills — the mirror does not care why the file changed.
  A tree carrying another session's uncommitted edits is not a reason to skip
  the refresh: stage only the mirror file (hard rule 6).
- **Drift check**: this skill can be edited outside a BlackCat session (skills
  reviews, curator). At the start of any BlackCat task, compare md5s of the
  skill files against the in-repo bundle; if they differ, refresh the mirror
  first — same verify loop (commit, push, CI-gate, live-check). Run this exact
  shape, from inside the skill dir:

  ```bash
  SK=~/.hermes/skills/theblackcat-site
  REPO=~/hermes/repos/Theblackcat98/TheBlackCat/content/library/ai/skills/theblackcat-site
  cd "$SK" && for f in SKILL.md references/*.md; do
    if [ -f "$REPO/$f" ]; then
      [ "$(md5sum <"$f")" = "$(md5sum <"$REPO/$f")" ] || echo "DRIFT: $f"
    else echo "MISSING: $f"; fi
  done
  ```

  Two traps, both hit for real: the glob `references/*.md` expands against the
  **current** directory, so running the loop from the repo reports a bogus
  `MISSING: references/*.md` while silently checking nothing — `cd` into the
  skill dir first. And a `MISSING` line means the reference is newer than the
  bundle (a version gap, not a corrupt file), so copy with
  `cp "$SK"/references/*.md "$REPO/references/"` — the whole directory, then
  re-run the loop and require zero output before committing. Cheapest tripwire
  when you only want a yes/no: the `version:` line in each SKILL.md — a gap
  there means the whole bundle is stale, so mirror before writing any content,
  otherwise the refresh forces a second verify loop after your content commit.

- **Refreshing the mirror is a three-file-class change, not a one-file copy**:
  every new or renamed reference needs a row in the bundle's `index.md` table
  plus a dated version line in its `## Notes` changelog, and the bundle's own
  `updated:` bumped. A reference that ships without an `index.md` row is
  invisible to a reader browsing the catalog — the same silent-loss shape the
  whole-directory copy rule exists to prevent.

- **Commit the mirror separately from content work** (`skill mirror: refresh …`
  vs `bookmark: …`) even when both land in one push. The mirror is
  pre-authorized; a mixed commit makes that claim harder to audit, and rule 6
  already forbids mixing kinds. One push for both is fine — gate CI on the
  final `headSha`, which covers every commit in it.
- **Hugo page bundles do not serve non-index `.md`** (verified 2026-09-05 —
  see hugo-site-maintenance `references/page-bundle-markdown-not-served.md`):
  the mirror's SKILL.md/references are browsable on GitHub only. Never
  "fix" the index.md's GitHub-blob links into site-relative links — that
  ships live 404s.
