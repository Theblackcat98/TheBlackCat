# The BlackCat Agent Contract

The BlackCat is a Git-native personal library. Markdown is the source of truth; the Hugo site is only a presentation layer.

## Content lifecycle

`inbox/` -> classify -> enrich -> canonical library item -> collections/relationships

## Rules

1. Prefer existing domains and tags.
2. Do not create new top-level domains casually.
3. If classification is uncertain, leave the item in `inbox/`.
4. Never create a duplicate resource when an existing canonical item can be updated.
5. Preserve the original source URL for bookmarks and external references.
6. Keep front matter machine-readable and conservative.
7. Use lowercase kebab-case for tags, topics, slugs, and filenames.
8. Do not delete content unless explicitly instructed or the item is clearly a duplicate.
9. Do not modify unrelated files.
10. Keep the Markdown body useful to a human; front matter is metadata, not prose.

## Content types

- `bookmark`: saved external resource with URL and notes.
- `article`: substantial researched or authored material.
- `note`: first-person or working knowledge.
- `collection`: curated cross-library view.
- `project`: project documentation or project reference.

## Placement rules

- Put a resource in the broadest appropriate `library/<domain>/...` location.
- Put an individual AI skill in `library/ai/skills/<kebab-slug>/index.md` (one skill per folder, Hugo page bundle) when the skill itself is the subject. Give each skill a one-line `description:` in front matter — the site's cards and search use it.
- Use `collections/` for curated subsets such as `Favorite AI Skills` rather than creating a new taxonomy branch for the adjective "favorite".
- A collection should point to canonical library items; do not duplicate their content inside the collection.

## Preferred front matter

```yaml
title: "..."
type: bookmark
source: "https://..."   # NOT `url` — reserved Hugo key, breaks the build
topics:
  - ai
tags:
  - agents
status: inbox
created: 2026-08-28
updated: 2026-08-28
```

When uncertain, do less. The archive should become more trustworthy over time, not merely more populated.
