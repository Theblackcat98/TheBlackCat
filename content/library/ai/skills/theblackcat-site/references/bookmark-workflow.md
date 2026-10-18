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
9. **CI**: poll `gh run list -L 1 --json headSha,status,conclusion,databaseId`
   until the run whose `headSha` matches YOUR pushed commit is `completed`
   (~3 min). Never gate on `-L 1` alone: right after a push the newest visible
   run can still be the previous commit's green one — a false pass (hit
   2026-10-07).
   `failure` → `gh run view <id> --log-failed`,
   diagnose, fix (with approval for anything beyond the new file), re-verify.
   Never report success with a red build.
10. **Live check**: `curl -s -o /dev/null -w '%{http_code}'` on the item's
    page (inbox items appear at `/TheBlackCat/inbox/<slug>/`).
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
- Lint before committing: `scripts/lint_content.py <files>` needs PyYAML — if
  system `python3` lacks it, run it with a Python that has it (on this host,
  the Hermes venv python: `~/.hermes/hermes-agent/venv/bin/python`). CI
  re-lints on push, but never push a known failure.

## Inbox triage (weekly, cron 95f72348ff15)

Covered in `references/content-model.md` § Triage — classify `content/inbox/`
into the library, dedupe by source URL, `status: filed`, CI-gate, report.
