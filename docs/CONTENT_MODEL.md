# Content Model

The BlackCat stores knowledge as Markdown documents with YAML front matter.

## Types

| Type | Purpose | Typical location |
| --- | --- | --- |
| `bookmark` | Saved external resource with a canonical source URL and notes | `library/<domain>/...` |
| `skill` | Reusable AI/agent skill or workflow, including its operational content and source | `library/ai/skills/<slug>/` |
| `article` | Substantial researched or authored material | `library/<domain>/...` |
| `note` | Personal thought, working knowledge, observation, or hypothesis | `notes/...` or `library/<domain>/...` |
| `project` | A project and its associated knowledge | `projects/...` |
| `collection` | Curated view of canonical items; contains relationships, not duplicated content | `collections/...` |
| `reference` | Durable reference material such as specifications, manuals, glossaries, or reference sheets | `library/<domain>/...` |

## Type vs. source

`contenttype` describes **what the content is**. It should not describe where it came from.

Use `source` to record an external canonical URL when one exists. A personal article can have no source; a skill can have an external source; a reference can be imported from a specification. These are independent properties.

## Metadata

Required:

- `title`
- `contenttype`

Recommended:

- `description`
- `source` (external canonical URL; Hugo reserves `url` for permalinks, so never use `url` for this)
- `topics`
- `tags`
- `status`
- `created`
- `updated`
- `related`

## Type guidance

### Bookmark

Use when the primary thing being preserved is an external resource. Keep the canonical URL in `source` and explain why it is worth keeping.

### Skill

Use when the primary thing being preserved is an operational AI/agent skill, workflow, prompt system, or reusable procedure. Preserve its supporting files when needed; record its original source separately.

### Article

Use for substantial authored or researched prose intended to stand on its own.

### Note

Use for smaller pieces of personal or working knowledge. Notes can mature into articles without changing the underlying principle of the archive.

### Project

Use for a coherent project and its associated documentation, decisions, references, and implementation knowledge.

### Collection

Use for a deliberate curated view such as `Favorite AI Skills`, `Local AI`, or `Tools I Actually Use`. Collections should reference canonical content rather than copy it.

### Reference

Use for durable factual or technical reference material: specifications, manuals, API references, cheat sheets, glossaries, standards, and similar material whose value is primarily as a reference.

## Canonical resource

Every substantive item should have one canonical document or page bundle. If the same source or concept is encountered again, enrich or update the existing item rather than creating another copy.

## Taxonomy philosophy

Directories represent broad domains. Tags and topics represent cross-cutting concepts. Content type describes the nature of the item. Collections describe useful relationships between items. Do not encode all four concepts into the directory tree.
