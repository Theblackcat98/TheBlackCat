# The BlackCat Agent Contract

The BlackCat is a Git-native personal library. Markdown is the source of truth; the Hugo site is only a presentation layer.

## Content lifecycle

`inbox/` -> classify -> enrich -> canonical item -> collections/relationships

## Rules

1. Prefer existing domains, content types, and tags.
2. Do not create new top-level domains casually.
3. If classification is uncertain, leave the item in `inbox/`.
4. Never create a duplicate resource when an existing canonical item can be updated.
5. Preserve the original source URL in `source` for external material. Never use front-matter `url` for source URLs; Hugo reserves it for page URLs.
6. Keep front matter machine-readable and conservative.
7. Use lowercase kebab-case for tags, topics, slugs, and filenames.
8. Do not delete content unless explicitly instructed or the item is clearly a duplicate.
9. Do not modify unrelated files.
10. Keep the Markdown body useful to a human; front matter is metadata, not prose.
11. Choose `contenttype` based on what the thing **is**, not where it came from. Never set `type` in front matter except `type: section` in `_index.md` files — `type` is a reserved Hugo field and silently breaks the contenttype taxonomy and library nav. Hugo indexes taxonomy front matter by the taxonomy's *plural* name, so `contenttype: <value>` in front matter only works because hugo.yaml maps `contenttype: contenttype` (singular = plural, term pages at `/contenttype/<value>/`). Do not remap it to `types` — nothing in content sets a `types:` field, so terms would silently vanish.
12. Use `description` when a concise summary will improve cards, listings, search, or agent retrieval.

## Content types

- `bookmark`: saved external resource whose primary value is the link and accompanying notes.
- `skill`: reusable AI/agent skill, workflow, prompt system, or operational procedure. Preserve supporting files when useful.
- `article`: substantial researched or authored prose intended to stand on its own.
- `note`: personal thought, working knowledge, observation, hypothesis, or short-form synthesis.
- `project`: a coherent project and its associated documentation, decisions, references, and implementation knowledge.
- `collection`: curated view of canonical items. Collections organize relationships; they do not duplicate content.
- `reference`: durable factual or technical reference material such as specifications, manuals, standards, glossaries, or cheat sheets.

## Placement rules

- Put canonical knowledge in the broadest appropriate `library/<domain>/...` location.
- Put individual AI skills in `library/ai/skills/<kebab-slug>/index.md` (one skill per folder, Hugo page bundle) when the skill itself is the subject.
- Put projects in `projects/<kebab-slug>/index.md` when the project needs its own page bundle.
- Put personal/working notes in `notes/` unless they clearly belong to a library domain.
- Put curated collections in `collections/`. A collection should point to canonical items rather than copying their content.
- Use `reference` for durable reference material; do not force it into `bookmark` merely because it originated externally.
- Use `bookmark` when the external resource itself is what is being saved and the local content is primarily annotation.

## Classification examples

- "Save this GitHub repo" -> `contenttype: bookmark` unless the repository is one of Nick's own projects.
- "Add this reusable Claude skill" -> `contenttype: skill`.
- "Write up my research on agent memory" -> `contenttype: article`.
- "Remember this insight about agent memory" -> `contenttype: note`.
- "Add my opencode-workflow project" -> `contenttype: project`.
- "Make a list of my favorite AI skills" -> `contenttype: collection` referencing `skill` items.
- "Save the HTTP specification for future lookup" -> `contenttype: reference`.

## Preferred front matter

```yaml
title: "..."
contenttype: bookmark
description: "..."
source: "https://..."   # external canonical URL; NOT `url`
topics:
  - ai
tags:
  - agents
status: inbox
created: 2026-08-28
updated: 2026-08-28
```

When uncertain, do less. The archive should become more trustworthy over time, not merely more populated.
