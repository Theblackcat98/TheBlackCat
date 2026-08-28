# The BlackCat

**The BlackCat is Nick's personal, Git-native knowledge library.**

It is a place to keep bookmarks, AI skills, research, notes, projects, references, and other things worth remembering — with a simple Markdown repository underneath and a static website on top.

The important distinction is that **the repository is the archive; the website is only a view of it.**

That makes the content easy to read, edit, search, version, back up, and maintain with an agent.

## What it is

The BlackCat is not primarily a blog, bookmark manager, or documentation site.

It is closer to a personal digital library:

```text
                 The BlackCat
                      │
          ┌───────────┴───────────┐
          │                       │
       Archive                Presentation
          │                       │
   Markdown + YAML            Hugo + HTML/CSS
          │                       │
          └───────────┬───────────┘
                      │
                 Git repository
```

Everything important lives in ordinary text files. Git provides history and portability. Hugo turns those files into a static site.

## Why it is structured this way

A personal archive should survive changes in software.

The content should not depend on a particular CMS, database, JavaScript application, or documentation theme. The archive should remain useful even if the website is completely redesigned later.

For that reason, The BlackCat deliberately keeps the underlying model simple:

- **Markdown** is the source of truth.
- **Front matter** stores machine-readable metadata.
- **Directories** represent broad domains.
- **Content types** describe what an item actually is.
- **Tags and topics** describe cross-cutting concepts.
- **Collections** describe relationships between canonical items.
- **Git** provides version history and a durable backup.
- **Hugo** generates the static site.
- **An agent** can maintain and enrich the archive without needing to understand a complicated application stack.

## Content lifecycle

New material begins in the inbox and becomes part of the permanent library only after it has been classified and enriched.

```text
Saved material
      ↓
   inbox/
      ↓
  agent triage
      ↓
 classify / summarize / tag / deduplicate
      ↓
 canonical content
      ↓
 library / collections / notes / projects
```

The agent is intentionally allowed to be conservative. When it is uncertain, it should leave material in the inbox rather than inventing a taxonomy or creating duplicate content.

## Content types

The type describes **what something is**, not where it came from.

### `bookmark`

A saved external resource whose primary value is the resource itself and the annotations attached to it.

### `skill`

A reusable AI or agent skill, workflow, prompt system, or operational procedure. Supporting files can live beside the main record.

### `article`

Substantial researched or authored material intended to stand on its own.

### `note`

Personal thoughts, observations, hypotheses, working knowledge, and short-form synthesis. A note can later grow into an article.

### `project`

A coherent project and its associated documentation, decisions, references, and implementation knowledge.

### `collection`

A curated view across canonical items. Collections organize relationships without duplicating the underlying content.

### `reference`

Durable factual or technical material intended primarily for future lookup: specifications, manuals, standards, API references, glossaries, cheat sheets, and similar material.

This distinction prevents the archive from collapsing everything into “bookmarks.” For example, an external AI skill can have an external `source` while still being a `skill`, and a specification can have an external `source` while still being a `reference`.

## Repository structure

```text
TheBlackCat/
│
├── content/
│   ├── inbox/          # New material awaiting triage
│   ├── library/        # Permanent knowledge archive
│   │   └── ai/skills/  # Reusable AI/agent skills
│   ├── collections/    # Curated cross-library views
│   ├── notes/          # Personal and working notes
│   └── projects/       # Project knowledge
│
├── docs/               # Repository design and maintenance documentation
├── archetypes/         # Templates for each content type
├── layouts/            # Hugo presentation layer
├── static/             # Static site assets
├── .github/workflows/  # GitHub Pages deployment
├── AGENTS.md           # Rules for automated content maintenance
└── hugo.yaml           # Hugo configuration
```

The library uses broad domains rather than an aggressively deep hierarchy. A directory answers **“what broad area does this belong to?”** while the content type answers **“what kind of thing is it?”** and tags/topics answer **“what concepts does this relate to?”**.

## Machine-readable content

A typical bookmark might look like:

```yaml
---
title: "Example Resource"
type: bookmark
description: "A concise explanation of why this is worth keeping."
source: "https://example.com"
topics:
  - ai
tags:
  - agents
status: inbox
created: 2026-08-28
updated: 2026-08-28
---

## Why I saved this

A short explanation of why the resource is worth keeping.

## Notes

Useful observations, excerpts, or conclusions.
```

The exact schema can evolve, but the principle is stable: **metadata belongs in front matter; human-readable knowledge belongs in Markdown.**

## Agent-maintained by design

The repository is designed so an agent can safely perform routine maintenance such as:

- importing saved URLs
- identifying the correct content type
- fetching metadata
- summarizing resources
- suggesting tags and topics
- finding duplicates
- enriching existing items
- preserving supporting files
- creating related-content links
- maintaining collections
- moving processed items out of the inbox
- identifying stale or broken resources

The agent's rules live in [`AGENTS.md`](AGENTS.md). The formal content model is documented in [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md).

The central rule is simple:

> **When uncertain, do less.**

The goal is not to maximize the number of entries. The goal is to build an archive that becomes more useful and more trustworthy over time.

## Website

The public website is generated from the repository with Hugo and deployed through GitHub Pages.

The presentation layer is intentionally custom and lightweight. The site recognizes content types and can present bookmarks, skills, articles, notes, projects, collections, and references according to their role instead of treating every page as the same kind of document.

The visual interface can therefore evolve independently of the archive itself.

## Philosophy

The BlackCat is built around a few ideas:

1. **The archive should outlive the interface.**
2. **Plain text is a feature.**
3. **Content type should describe the thing, not its source.**
4. **Structure should help retrieval, not become bureaucracy.**
5. **Collections should create relationships, not copies.**
6. **Automation should enrich knowledge, not manufacture noise.**
7. **Uncertainty should lead to review, not confident guesses.**
8. **Git history is part of the memory of the system.**

The long-term goal is a personal knowledge base that can grow for years without becoming difficult to maintain — something closer to a living digital library than a collection of bookmarks.
