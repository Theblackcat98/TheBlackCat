---
title: "Git & Repo Toolkit"
contenttype: reference
description: "Combine .gitignore templates, fill in a license, and compose conventional commit messages, using the upstream GitHub gitignore and choosealicense.com texts."
topics:
  - tools
tags:
  - web
  - html
  - javascript
  - github
  - config
status: filed
created: 2026-10-30
updated: 2026-11-14
tool: gitignore-license
aliases:
  - /library/tools/commit-formatter/
---

Start a repository with the right ignore rules and a correctly filled-in license, then write its commits in Conventional Commits format. The commit message builder is the former standalone Commit Formatter, merged in November 2026.

## Open it

[Open the Git & Repo Toolkit](/gitignore-license/)

## Features

- **.gitignore**: choose from about 60 language, framework, editor and OS templates, add your own patterns, skip duplicate lines and copy or download the result.
- **License**: 22 common licenses (MIT, Apache 2.0, GPL, BSD, MPL, ISC, Unlicense, CC0 and more) with the year, copyright holder and email filled in, plus the permissions, conditions and limitations summary.
- **Snippets**: an SPDX header for source files and the `package.json` license field.
- **Download**: each file alone or both together as a zip.
- **Commit message**: a Conventional Commits builder with the standard types (`feat`, `fix`, `chore`, …), optional scope, a breaking-change flag that appends `!` and a `BREAKING CHANGE:` footer, a subject counter against the 50-character soft and 72-character hard limits, and a body that word-wraps at 72 characters. Consistent messages keep `git log` readable and feed automated changelogs such as Semantic Release.

## Notes

- The page is a static HTML file served straight from the site: `static/gitignore-license/index.html`. Vanilla JavaScript, no libraries and no third-party requests.
- Template texts are embedded verbatim from github/gitignore and choosealicense.com as of 2026-10-30, so the page works offline. This is general information, not legal advice.
