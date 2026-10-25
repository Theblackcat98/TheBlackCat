# Dead links and the weekly link-check issue

`.github/workflows/links.yaml` runs `content/**/*.md` through lychee every
Monday, keeps ONE open issue up to date (updates it, closes it when a run is
clean). When that issue lands — or Nik says "amend these issues" — the work is
in `content/`, not in the issue thread.

## Procedure

1. Read every report body. On this repo `gh issue view` is broken, use REST:
   `gh api repos/Theblackcat98/TheBlackCat/issues/<n> --jq '.title, .body'`.
2. Classify each URL before touching content — *moved*, *removed upstream*,
   *auth-walled*, *domain dead*, or *Nik's own repo now private/gone*. Only
   `gh api repos/Theblackcat98/<repo> --jq .private` tells private from deleted:
   `gh api` 404 = deleted/renamed; anonymous `curl` 404 + `private=true` = private.
3. Fix the content entry (bump `updated` with `date +%F`), never the issue text.
4. Reproduce the CI check locally (recipe below) and get `0 Errors`.
5. Commit content only, push, gate on CI for YOUR `headSha`, then curl the live
   page (`/TheBlackCat/<path>/` → 200).
6. Issue hygiene: close older duplicate reports pointing at the surviving one;
   let the workflow close the clean report itself (it comments as the bot).

## Fixing each kind of rot

- **Upstream path moved** (repos reorganise `skills/<x>/` → `skills/<y>/`): find
  the real path (`gh api repos/<o>/<r>/git/trees/main?recursive=1 --jq '.tree[].path'`),
  repoint `source`, verify 200.
- **Skill removed upstream**: use the archived docs page as `source` and add a
  one-line "archived upstream, removed in v<X>" note. If no page survives
  anywhere, DELETE `source` and say in the body that the local bundle is the
  canonical copy — a `local://`-style or invented URL is worse than none.
- **Auth-walled endpoint** (an MCP `/mcp` that answers 401 by design): `source`
  is the project's site root; the endpoint stays documented in the body.
- **Renamed/dead domain**: `getent hosts <host>` plus `curl -L` both; point at
  the live successor (`nosignups.net` for the old fucksignups host).
- **Nik's own repo private or deleted**: drop `github:` AND `stars:` front
  matter and the `[View on GitHub]` line, keep the description, add "The GitHub
  repository is no longer public, so there is nothing to link to". Unlinking is
  a normal content edit; deleting the whole entry needs Nik's explicit OK.
- **`content/_index.md` project list** is not rendered on the site
  (`layouts/index.html` renders no `.Content`), so dead links there are
  invisible to readers but still reported. Fix them anyway.

## Reproduce the check locally (verified recipe)

```bash
# binaries, no root needed; hugo version must match pages.yaml
curl -sL -o /tmp/hugo.tar.gz https://github.com/gohugoio/hugo/releases/download/v0.147.4/hugo_extended_0.147.4_linux-amd64.tar.gz
tar xzf /tmp/hugo.tar.gz -C /tmp hugo
curl -sL https://github.com/lycheeverse/lychee/releases/latest/download/lychee-x86_64-unknown-linux-gnu.tar.gz | tar xz -C /tmp

cd ~/hermes/repos/Theblackcat98/TheBlackCat
/tmp/hugo --gc --minify          # public/ + resources/ are gitignored
/tmp/lychee-x86_64-unknown-linux-gnu/lychee --no-progress --max-concurrency 8 \
  --max-retries 2 --timeout 20 --accept 200,204,206,301,302,403,429 \
  --root-dir public --exclude '^local://' --exclude 'localhost' \
  --exclude '127\.0\.0\.1' --scheme https --scheme http 'content/**/*.md'
```

The local run reports 9–13 errors where CI reported 8: the difference is real
breakage CI could not see (the blind spots below). Push only after `0 Errors`.

## Why naive lychee configs lie (each of these cost a run)

- `--root-dir public` AFTER a build is what makes site-absolute internal links
  (`/library/...`, `/docs/...`) checkable: lychee maps them onto `public/...`
  and accepts `dir/index.html`. Without it every internal link is an "Cannot
  resolve root-relative link" error that says nothing about the link.
- Do NOT reach for `--base-url` instead. On a GitHub Pages *project* site it
  resolves `/library/x/` to `https://host/library/x/` — it drops the
  `/TheBlackCat/` segment — so every internal link 404s and the report becomes
  180 lines of noise.
- `--exclude` cannot silence unresolvable root-relative links: they error
  before the exclude filter runs. No exclude pattern fixes them.
- Relative links to files that don't exist on disk (`[x](AGENT-BRIEF.md)` inside
  a page bundle) come back as "Excluded" under `--scheme https --scheme http`.
  They still 404 live, because Hugo does not publish non-index `.md`/`.sh`
  bundle files. Link the upstream GitHub blob URL instead, or name the file
  without a link. Sweep the whole class with:
  `grep -rnoE '\]\([^)]*\.(md|sh|ya?ml|json|py)\)' content/ | grep -v http`

## Keeping one report instead of a weekly duplicate

- `peter-evans/create-issue-from-file@v5` supports `issue-number`: that is the
  documented way to UPDATE an existing issue. Feed it the number found by
  `gh issue list --state open --json number,title --jq '.[] | select(.title == "<exact title>") | .number'`;
  empty means create (the action's other inputs give no update path).
- Add a close step for the clean case (`if: steps.lychee.outputs.exit_code == 0 && find.outputs.number != ''`),
  otherwise a fixed report stays open forever and the next real regression is
  invisible.
- Run `actionlint` on the workflow before pushing (single binary from
  rhysd/actionlint releases). YAML that parses can still be rejected or
  silently no-op at run time.
- Prove the loop end to end: `gh workflow run links.yaml`, then
  `gh run view <id> --log | grep -E 'Errors|Existing issue'` and confirm the
  bot comment landed on the issue. A green run that never touched the issue is
  a half-fix.
