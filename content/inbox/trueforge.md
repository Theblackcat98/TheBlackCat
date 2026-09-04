---
title: "TrueForge — the open-source agent harness"
contenttype: bookmark
description: "Self-hostable runtime that turns any LLM into a working agent — MCP tools, skills, sandboxing, approvals, subagents — exposed as a chat UI, HTTP API, and embeddable SDK."
source: "https://github.com/truefoundry/trueforge"
topics:
  - ai
  - agents
tags:
  - agents
  - mcp
  - self-hosted
  - open-source
  - typescript
status: inbox
created: 2026-09-03
updated: 2026-09-03
---

## Why I saved this

Key reference in the agent-harness layer: a vendor-neutral, self-hostable
alternative to managed agent runtimes, worth tracking as the ecosystem
standardizes on harness concepts (skills, MCP, approvals).

## Notes

[TrueForge](https://github.com/truefoundry/trueforge) (by TrueFoundry) is an
open-source **agent harness** — the runtime layer that turns a raw LLM into a
working agent. It runs the whole execution loop for you: model calls, MCP
tools, skills, sandboxing, approvals, context management, and session state.
One harness, three surfaces: a bundled **chat UI**, an **HTTP API** with a
generated TypeScript SDK, and an embeddable **React UI SDK**
(`@truefoundry/trueforge-ui`).

### What makes it unique

- **Vendor-neutral by design.** Claude Managed Agents runs Claude on
  Anthropic's cloud; TrueForge runs whatever model you route to, on your own
  infrastructure. TrueFoundry claims ~50% lower cost per run vs Claude
  Managed Agents on the same benchmark — *vendor's own numbers, verify
  before relying on them*.
- **Git-backed skills.** A skill is a `SKILL.md` instruction pack loaded on
  demand — enable from the built-in catalog or import from any public GitHub
  repo (same convention Claude/Hermes skills use).
- **Personal → production in one artifact.** `npx @truefoundry/trueforge`
  gives a single-process local mode on SQLite; the identical feature set
  scales to hosted mode (Postgres + Redis, multi-replica) via Docker
  Compose, Helm, or Railway, with optional OIDC login for teams.
- **Harness depth usually reserved for managed platforms:** sandbox-as-tool,
  subagents, deferred tools, Code Mode, context compaction, tool approvals,
  Generative UI, and a built-in agent benchmarking page (cost/accuracy vs
  Claude Managed Agents and deepagents).

### Quick facts

MIT license · TypeScript monorepo (`trueforge` server + bundled UI,
`trueforge-core` library, `trueforge-ui`, `trueforge-sdk`) · ~5.1k stars,
352 forks since 2026-07-23 · docs: [trueforge.dev](https://trueforge.dev) ·
quickstart: `npx @truefoundry/trueforge`.
