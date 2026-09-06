# The BlackCat reserved-key incident (2026-08-28) — session detail

First real bookmark push to Theblackcat98/TheBlackCat broke the Pages build.

## Error

```
Error: error building site: assemble: URLs with protocol (http*) not
supported: "https://github.com/Theblackcat98/TheBlackCat".
In page "content/inbox/blackcat-bookmark-skill.md"
```

## Why it happened

The repo's own contract (AGENTS.md, docs/CONTENT_MODEL.md,
archetypes/bookmark.md) prescribed `url:` for the external link — but `url`
is a reserved Hugo key (permalink override). No bookmark had ever been pushed,
so the trap had never fired. Lesson: a content contract that was never
exercised is unvalidated; expect first-use breakage and fix the contract, not
just the instance.

## Fix pattern (7 files, one commit 79959e4)

1. Content files: `url:` → `source:` (2 inbox bookmarks)
2. `archetypes/bookmark.md`: `url: ""` → `source: ""`
3. Templates: `.Params.url` → `.Params.source` (layouts/_default/single.html,
   list.html — grep `layouts/` for `Params.url` to find all)
4. Docs: AGENTS.md + CONTENT_MODEL.md updated with explicit "NOT url" warning

Verification: `gh run list` poll → success (~30s), then
`curl -w '%{http_code}'` on the site root + the new section page → 200/200.

## Repo-specific facts (TheBlackCat)

- Library domains: `ai` (only one populated so far); others reserved in README
- Existing lowercase tags worth reusing: agents, ai, tools, web, terminal, cli,
  automation, knowledge-management, machine-learning, typescript, python, go,
  javascript, hugo, scraping, tui, experiments...
- Weekly inbox triage cron (Sun 23:00, job 95f72348ff15) owns inbox → library
  promotion; design contract lives in docs/DESIGN.md
- Agent git identity set repo-local: Theblackcat98 + ID-based noreply email
