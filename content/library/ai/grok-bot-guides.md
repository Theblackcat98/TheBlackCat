---
title: "Grok Bot Guides"
contenttype: bookmark
description: "x.ai's official guide series for Grok Bot: nine field reports on running teams of persistent cloud-computer agents, with copy-paste prompts and org patterns."
source: "https://x.ai/bot/guides"
topics: [ai, programming]
tags: [ai, agents, workflows, chatbots, automation, prompts]
status: filed
created: 2026-09-15
updated: 2026-09-20
---

## Why I saved this

Not for the Grok bot itself — for the patterns. Nine practitioner write-ups on
organizing long-lived computer-use agents into specialist teams (roles, memory
scopes, handoffs, routines, shared boards), with literal system prompts and
routine schedules to steal. Maps directly onto any multi-agent setup.

## Notes

Nine guides (Aug–Sep 2026), each by a different practitioner:

- **Grok Bot 101** — anatomy of a bot (Name/Title/Description), bots-as-specialists, permission rules written as natural-language prompts checked by a separate review agent; four starter workflows: personal CRM from X follows in Notion, "Arnold" fitness coach (app decomposed into a bot), outer-loop prompt prep for Cursor cloud agents, cross-tool search (Slack/Notion/GitHub).
- **For Engineering** — five named engineer bots with scoped domains + an ops bot ("Jenny") that runs daily 1:1s, postmortems, and onboarding; fleet manages 200+ Cursor cloud agents via a shared Notion PR database (30-min reviews: Bugbot findings, CI, conflicts; auto-merge on high confidence + low blast radius); nightly audit bots (dead code, security, i18n, parity, catch-up); P0 urgency routine (5-min transcript polling).
- **For Support** — five jobs: release tracking, bug reproduction with recorded video proof, churn clustering, refund triage against policy, custom per-team metric reports; convert any workflow into an hourly/daily routine.
- **Templates** — share a bot as a recipe: instructions + memories + skills + plugins, no secrets or custom code; evaluate templates like software before installing.
- **Multiple teams** — one project = one channel + a Notion Projects/Tasks board; a "projects" manager bot staffs channels (reuse bots first, max five per channel, new bots only after approval); blocked tasks ping the human.
- **Mobile app development** — six seats run a shipped game (Rank'em): Orchestrator, Analytics (only bot allowed to declare findings), Creatives (never buys media), Engineer, GCS, Bug-fix; includes the full Analytics bot config (job description, connections, routines, recorded skills, handoffs). Recorded a Meta Ads web-UI flow once when the API failed. ROI: 15x lower cost per install, 4x D7 retention.
- **Designing with Grok Bot** — Figma Bro (production Figma work via MCP with exact coordinates), Motion God (prototypes around real production animation files; feedback by feel), Experiments (make ideas tangible before judging); bot huddles + delegation.
- **For GTM** — Chief of Staff, daily meeting-prep routine, overnight prospecting, one agent per strategic account (weekly media rundown prompt included, with a state file so only new items get reported), slides bot that live-updates decks from call transcripts, sales coach; tips: record skills by demonstration, build an anti-slop skill.
- **For PMs** — "attention list" (emergent priorities derived hourly from Slack/email/meetings, used as an attention filter); team: Chief of Staff, non-coding EM, five IC eng agents, data analyst, PM Pete, recruiter; why many scoped agents beat one omniscient one: referenceability, parallelism, scoped memory; keep final review on external sends, purchases, deletes.
