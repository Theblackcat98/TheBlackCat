---
title: "Muse Harness Flow"
contenttype: article
description: "A live flow view of the Muse agent harness, built from the agent's own description of itself: context assembly from files, the model and tools loop with its approval gate, the proactivity gate for background work, and the self-improvement loop."
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
tool: muse-harness-flow
related:
  - /library/ai/hermes-harness-flow
---

The same control-room flow view as the [Hermes Harness Flow](/library/ai/hermes-harness-flow/), applied to the Muse agent. Muse is not open source, so this one is built from the harness write-up the Muse agent produced about itself: its components, lifecycle diagrams and file-routing tables.

## Open it

[Open the flow view](/muse-harness-flow/) — a standalone page with its own controls.

## How it differs from Hermes

- **No gateway.** A message is stamped with a time tag and device ID, then the whole context is rebuilt from files on disk every turn. The model itself holds nothing between turns.
- **Three ways a file reaches the model.** Standing files are injected whole every turn, the deep memory store is searched, and skill, connector, goal and product-doc files are read only when the task needs them.
- **An approval gate inside the loop.** Sending, buying, publishing or deleting pauses on a card until a human taps approve or decline.
- **A proactivity gate for background work.** Heartbeat, cron and hook workers run the same pipeline, but their results are delivered, held for the Feed, or dropped silently, which is the common case.
- **A self-improvement loop between conversations.** Hourly memory upkeep, nightly "dreaming", a daily skill review and a quiet-moment pass. While each runs, the files it updates light up in the top lane, showing what feeds the next turn.

Try **Buy something** for the approval gate, **Heartbeat** for the proactivity gate, and **Self-improvement** for the background loop.

## Notes

- This is the harness as the agent describes it, not verified against source code. Product counts (skills, connectors, docs) come from that description; everything live is simulated.
- Account-specific details from the original write-up were left out.
- The page is a static HTML file served from the site: `static/muse-harness-flow/index.html`.
