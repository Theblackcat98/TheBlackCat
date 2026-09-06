# Bookmark Workflow

Trigger: "bookmark this", "add to my bookmarks/library/BlackCat", "save this
link/URL". Not for research digests (→ `~/hermes/knowledge/research/`) or
private notes — BlackCat is public.

## Steps

1. **Sync**: `git -C ~/hermes/repos/Theblackcat98/TheBlackCat pull --ff-only`
2. **Dedupe by URL**:
   `grep -rl '<url>' ~/hermes/repos/Theblackcat98/TheBlackCat/content --include='*.md'`
   Found → update that file's `updated:` + enrich Notes. Done.
3. **Fetch metadata** (real title + description) via web_extract or
   `curl -sL <url>`. On failure: URL-derived title + note "page fetch failed".
4. **Topics/tags**: check existing
   (`git -C <repo> grep -h -A2 '^tags:' -- 'content/*.md'`), reuse
   case-insensitively, lowercase kebab-case.
5. **Create** `content/inbox/<slug>.md` — front matter recipe in
   `references/content-model.md` (`contenttype: bookmark`, `source:` NOT
   `url:`, `description:`, `status: inbox`, real dates via `date +%F`).
   Body: `## Why I saved this` (user's reason or obvious factual one) +
   `## Notes` (short factual summary of the page).
   ⚠️ Reserved keys: `contenttype` not `type`, `source` not `url`.
6. **Commit only that file**: `git commit -m "bookmark: <title>"`.
7. **Push**. On rejection: `git pull --rebase`, push again.
8. **Verify**: commit on `origin/main`
   (`git log origin/main -1 --oneline`) + file exists on origin
   (`gh api repos/Theblackcat98/TheBlackCat/contents/<path> --jq .path`).
9. **CI**: poll `gh run list -L 1 --json status,conclusion,databaseId` until
   `completed` (~3 min). `failure` → `gh run view <id> --log-failed`,
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

## Inbox triage (weekly, cron 95f72348ff15)

Covered in `references/content-model.md` § Triage — classify `content/inbox/`
into the library, dedupe by source URL, `status: filed`, CI-gate, report.
