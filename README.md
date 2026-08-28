# The BlackCat

**The BlackCat is Nick's personal, Git-native knowledge library.**

It is a place to keep bookmarks, research, notes, projects, references, and other things worth remembering — with a simple Markdown repository underneath and a static website on top.

The important distinction is that **the repository is the archive; the website is only a view of it.**

That makes the content easy to read, edit, search, version, back up, and maintain with an agent.

## What it is

The BlackCat is not primarily a blog and it is not meant to behave like a traditional documentation site.

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
- **Tags and topics** handle cross-cutting concepts.
- **Git** provides version history and a durable backup.
- **Hugo** generates the static site.
- **An agent** can maintain and enrich the archive without needing to understand a complicated application stack.

## Content lifecycle

New material begins in the inbox and becomes part of the permanent library only after it has been classified and enriched.

```text
Saved URL
   ↓
 inbox/
   ↓
 agent triage
   ↓
 classify / summarize / tag / deduplicate
   ↓
 permanent content
   ↓
 library / collections / notes / projects
```

The agent is intentionally allowed to be conservative. When it is uncertain, it should leave material in the inbox rather than inventing a taxonomy or creating duplicate content.

## Content types

### Bookmarks

A saved external resource with a canonical URL and notes about why it matters.

### Articles

Substantial researched or authored material. These are more developed than ordinary bookmarks.

### Notes

Personal thoughts, working notes, observations, hypotheses, and other material that does not need to become a formal article.

### Collections

Curated views across the library. A collection can bring together material from multiple domains around a common subject.

### Projects

Project-specific documentation, research, references, and other knowledge associated with a project.

## Repository structure

```text
TheBlackCat/
│
├── content/
│   ├── inbox/          # New material awaiting triage
│   ├── library/        # Permanent knowledge archive
│   ├── collections/    # Curated cross-library views
│   ├── notes/          # Personal and working notes
│   └── projects/       # Project knowledge
│
├── docs/               # Repository design and maintenance documentation
├── archetypes/         # Templates for new content
├── layouts/            # Minimal Hugo presentation layer
├── static/             # Static site assets
├── .github/workflows/  # GitHub Pages deployment
├── AGENTS.md           # Rules for automated content maintenance
└── hugo.yaml           # Hugo configuration
```

The library itself uses broad domains rather than an aggressively deep hierarchy. For example:

```text
library/
├── ai/
├── programming/
├── psychology/
├── engineering/
├── design/
├── science/
├── business/
└── philosophy/
```

A directory answers **"what broad area does this belong to?"** while tags and topics answer **"what concepts does this relate to?"**.

## Machine-readable content

A typical bookmark looks roughly like this:

```yaml
---
title: "Example Resource"
type: bookmark
url: "https://example.com"
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
- fetching metadata
- summarizing resources
- suggesting tags and topics
- finding duplicates
- enriching existing bookmarks
- creating related-content links
- maintaining collections
- moving processed items out of the inbox
- identifying stale or broken resources

The agent's rules live in [`AGENTS.md`](AGENTS.md). The content model is documented in [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md).

The central rule is simple:

> **When uncertain, do less.**

The goal is not to maximize the number of entries. The goal is to build an archive that becomes more useful and more trustworthy over time.

## Website

The public website is generated from the repository with Hugo and deployed through GitHub Pages.

The site is intentionally lightweight. The current presentation layer is custom and minimal rather than relying on a large documentation theme. That keeps the publishing stack easy to understand and means the content model can evolve independently of the visual design.

## Philosophy

The BlackCat is built around a few ideas:

1. **The archive should outlive the interface.**
2. **Plain text is a feature.**
3. **Structure should help retrieval, not become bureaucracy.**
4. **Automation should enrich knowledge, not manufacture noise.**
5. **Uncertainty should lead to review, not confident guesses.**
6. **Git history is part of the memory of the system.**

The long-term goal is a personal knowledge base that can grow for years without becoming difficult to maintain — something closer to a living digital library than a collection of bookmarks.
