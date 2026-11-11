# Bookmark Workflow

Trigger: "bookmark this", "add to my bookmarks/library/BlackCat", "save this
link/URL". Not for research digests (→ `~/hermes/knowledge/research/`) or
private notes — BlackCat is public.

## Steps

1. **Sync**: `git -C ~/hermes/repos/Theblackcat98/TheBlackCat pull --ff-only`
2. **Dedupe by URL**:
   `grep -rl '<url>' ~/hermes/repos/Theblackcat98/TheBlackCat/content --include='*.md'`
   Found → update that file's `updated:` + enrich Notes. Done.
   Match is on the exact URL in `source`; a name/slug mention inside another
   item's body is NOT a duplicate — save the new URL as its own bookmark and
   cross-link the existing item from Notes.
3. **Fetch metadata** (real title + description) via web_extract or
   `curl -sL <url>`. For GitHub repos fetch facts with `gh api repos/<owner>/<repo>`
   (description, stars, license, language, `pushed_at`, homepage) and read the
   README for what it does. Before publishing a surprising star count, cross-
   check it against the repo page (the HTML embeds `stargazerCount`) — the repo
   is public. On failure: URL-derived title + note "page fetch failed".
   **Client-routed galleries and SPA demo sites return only the shell to
   `web_extract`** — a root-page extract yields the headline tagline and
   nothing about what is actually inside, which makes a useless bookmark (the
   description just repeats the `<title>`). Enumerate the routes from the
   served HTML, then read each route's own meta:

   ```bash
   curl -sL <url> | tr '>' '>\n' | grep -oiE 'href="[^"]+"' | sort -u   # routes
   for p in <routes>; do
     d=$(curl -sL "<host>/$p" | tr -d '\n' \
         | grep -oE 'name="description"[^>]*content="[^"]*"' | sed -e 's/.*content="//' -e 's/"$//')
     echo "$p :: $d"
   done
   ```

   Per-route tags are wrapped across lines in the HTML, so `tr -d '\n'`
   before grepping — otherwise every description comes back empty. Then write
   the `description:` from the whole route list (what the site *is*, in one
   line) and enumerate the individual demos/tools under `## Notes`; a gallery
   saved without its contents listed is a link Nik has to re-open to
   remember.

   **The served-HTML route list is still a subset.** Client-rendered card
   grids, paid tiers (`/library`, `/pricing`, `/premium`) and ad/sponsor
   surfaces only exist after JS runs, so the shell's `href`s miss them. Render
   the page once and read `document.body.innerText` plus the footer links;
   then `## Notes` must carry three things — what it is, what is inside, and
   how it is monetised or distributed (paid unlock, ads, one npm package per
   component). A bookmark that lists routes but not the model gets re-opened
   the moment Nik asks a follow-up, and the enrichment is a second commit.
4. **Topics/tags**: check existing
   (`git -C <repo> grep -h -A2 '^tags:' -- 'content/*.md'`), reuse
   case-insensitively, lowercase kebab-case.
5. **Create** `content/inbox/<slug>.md` — front matter recipe in
   `references/content-model.md` (`contenttype: bookmark`, `source:` NOT
   `url:`, `description:`, `status: inbox`, real dates via `date +%F`).
   Body: `## Why I saved this` (user's reason or obvious factual one) +
   `## Notes` (short factual summary of the page).
   ⚠️ Reserved keys: `contenttype` not `type`, `source` not `url`.
   Verify every external URL cited in the body:
   `curl -sL -o /dev/null -w '%{http_code}' <url>`; use the final redirect
   target when one redirects — the weekly links job reports dead external
   links, so don't feed it new ones.
6. **Commit the files you touched** — stage explicit paths (`git add <paths>`);
   message `bookmark: <title>` (a batch may ship as one commit listing the
   titles). Never `git add -A`/`commit -a`: the checkout can carry uncommitted
   edits from another session — leave them alone and flag them in the report.
7. **Push**. On rejection: `git pull --rebase`, push again.
8. **Verify**: commit on `origin/main`
   (`git log origin/main -1 --oneline`) + file exists on origin
   (`gh api repos/Theblackcat98/TheBlackCat/contents/<path> --jq .path`).
9. **CI**: poll `gh run list -L 8 --json headSha,status,conclusion,databaseId`
   until the run whose `headSha` matches YOUR pushed commit (compare by
   prefix — `jq` gives the full sha) is `completed` (~3 min). Never gate on
   `-L 1` alone: right after a push the newest visible run can still be the
   previous commit's green one — a false pass (hit 2026-10-07).
   Treat `queued`/`in_progress` as *pending*, never as failure: a poll loop
   that breaks on "conclusion != success" exits on the first empty conclusion
   before CI has even started, and reads as a red build that never existed.
   `failure` → `gh run view <id> --log-failed`,
   diagnose, fix (with approval for anything beyond the new file), re-verify.
   Never report success with a red build.
10. **Live check — prove it rendered, not just that it returned 200**:
    `curl -s -o /dev/null -w '%{http_code}'` on the item's page (inbox items at
    `/TheBlackCat/inbox/<slug>/`), then grep the HTML body for a distinctive
    string from your Notes (`curl -s <url> | grep -c 'frame-capture'`) and for
    the rendered `<title>`. A page can be 200 and still be the previous build,
    a bare shell, or emptied by a front-matter key Hugo ate — the status code
    cannot tell those apart.
11. **Report**: file path, GitHub blob URL, CI status.

## Pitfalls

- Repo is PUBLIC — page title + description of a public page are fine;
  personal context needs confirmation first.
- Don't run `hugo` locally (Pi constraints; CI builds on push).
- Don't write into `public/`, `docs/`, `blog/`, or legacy sections — new
  bookmarks only go to `content/inbox/` (or `content/library/` when Nik
  asks to file directly).
- Existing legacy content has capitalized tags; write lowercase, match
  case-insensitively when reusing.
- Quote titles containing `:` or `"` in YAML.
- A route list scraped from served HTML is a subset, not an inventory —
  client-rendered grids and paid/sponsor pages are invisible to it, so a
  route-only bookmark under-describes the site.
- Lint before committing: `scripts/lint_content.py <files>` needs PyYAML — if
  system `python3` lacks it, run it with a Python that has it (on this host,
  the Hermes venv python: `~/.hermes/hermes-agent/venv/bin/python`). CI
  re-lints on push, but never push a known failure.

## Inbox triage (weekly, cron 95f72348ff15)

Covered in `references/content-model.md` § Triage — classify `content/inbox/`
into the library, dedupe by source URL, `status: filed`, CI-gate, report.
