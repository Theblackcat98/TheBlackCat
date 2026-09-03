---
title: "TinyFish MCP — Web Infrastructure for AI Agents"
contenttype: bookmark
source: "https://agent.tinyfish.ai/mcp"
topics:
  - ai
tags:
  - agents
  - ai
  - tools
  - web
status: filed
created: 2026-08-28
updated: 2026-08-28
---

## Why I saved this

Useful MCP server for agents, and the core endpoints are free.

## Notes

TinyFish (https://tinyfish.ai) exposes web infrastructure for AI agents through a single MCP endpoint at `agent.tinyfish.ai/mcp`:

- **Search API** — browser-rendered web search returning structured JSON from live (never cached) pages. Free.
- **Fetch API** — renders a page in a real browser and returns clean markdown/JSON/HTML. Free.
- **Web Agent** — completes production tasks (navigate, fill forms, authenticate, extract). Metered: $0.016/step. 89.9% on Mind2Web.
- **Browser API** — stealth browser sessions for login walls and anti-bot protection. Metered: $0.002/minute.

Search and Fetch never draw from the wallet balance, which makes it a good default web-access layer for agents. One API key, one wallet, no routing code — the platform decides which layer a task needs.
