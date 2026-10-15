---
title: "ZeroPointRepo/youtube-skills — YouTube transcripts, search and channel data for any agent"
contenttype: bookmark
description: "Skill pack (1.1k★, MIT) giving agents YouTube transcripts, video search, channel and playlist data through the TranscriptAPI backend — no yt-dlp, no headless browser, and it ships a Hermes install path."
source: "https://github.com/ZeroPointRepo/youtube-skills"
topics:
  - ai
  - tools
tags:
  - agents
  - skills
  - video
status: inbox
created: 2026-10-15
updated: 2026-10-15
---

## Why I saved this

Reliable YouTube reads from an agent without yt-dlp or cloud-IP blocking — transcripts are the missing input for the youtube-content workflow. Ships an explicit `hermes skills install` path.

## Notes

12 skills; the main one (`youtube-full`) bundles transcripts + search + channels + playlists. Backed by a paid service — [TranscriptAPI](https://transcriptapi.com) (free tier: 100 credits on signup) — so full use needs an API key; the repo itself is just the skill definitions. MIT, active (pushed 2026-10-14).

Install: `hermes skills install skills-sh/ZeroPointRepo/youtube-skills/skills/youtube-full` — or `npx skills add ZeroPointRepo/youtube-skills` for other agents.
