---
title: "Hermes Harness Flow"
contenttype: article
description: "A live, SCADA-style flow view of the Hermes agent harness: one message followed from input to output through the gateway, prompt, agent loop and tools, with memory, skills and history read in and written back."
source: "https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/"
topics:
  - ai
  - agents
tags:
  - agents
  - ai
  - simulation
  - svg
  - architecture
status: filed
created: 2026-10-31
updated: 2026-10-31
tool: hermes-harness-flow
related:
  - /library/ai/muse-harness-flow
---

An industrial control-room view of an AI agent harness. Plants use SCADA mimic diagrams to show a silo filling or a digester's pressure in real time; this does the same for Nous Research's open-source Hermes agent, so you can watch a single message travel from the chat app it came from, through the harness, and back.

## Open it

[Open the flow view](/hermes-harness-flow/) — a standalone page with its own controls.

## How to read it

- **One straight path, numbered 1–7.** Inputs on the left, the reply on the right. The CLI, IDE and cron visibly skip the gateway, because they talk to the agent directly.
- **The agent loop hangs under the model.** Tool calls go down to "Run tools", results come back up, and the context gauge in the middle fills on every pass until compression kicks in at 85%.
- **Read-in lane above, write-out lane below.** Context files, memory, skills and history feed the prompt; the session database, memory and skills are written after the reply. That pair is the harness's learning loop.
- **Follow the packet.** Everything not involved in the current step dims, the caption bar says what is happening in plain words with the code path underneath, and a journey log lists every step the message took.

Use **Pause** then **Next step** to walk through a message one stage at a time. "Long conversation" shows compression; "Risky command" shows the terminal approval hold.

## Notes

- Structure follows the Hermes developer docs: entry points, gateway, prompt assembly, the AIAgent loop, provider resolution, the tool registry, compression, session storage, memory, skills and cron.
- All values are simulated; nothing connects to a real Hermes install.
- The page is a static HTML file served from the site: `static/hermes-harness-flow/index.html`.
