---
title: "Resolving Merge Conflicts"
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
contenttype: skill
source: "https://www.aihero.dev/skills-resolving-merge-conflicts"
topics:
  - ai
tags:
  - skills
  - agents
  - workflows
status: filed
created: 2026-08-28
updated: 2026-10-20
---

> **Archived upstream.** Matt Pocock removed this skill in v1.3.0 — nothing
> replaces it, because the agent handles a merge or rebase conflict without a
> dedicated skill. The `source` now points at the archived docs page; the text
> below is kept as the historical loop.

1. **See the current state** of the merge/rebase. Check git history, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

4. Discover the project's **automated checks** and run them — typically typecheck, then tests, then format. Fix anything the merge broke.

5. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase process until all commits are rebased.
