# Content Model

The BlackCat stores knowledge as Markdown documents with YAML front matter.

## Types

| Type | Purpose |
| --- | --- |
| `bookmark` | Saved external resource, usually with a canonical URL |
| `article` | Substantial researched or authored material |
| `note` | Working thought, observation, or personal synthesis |
| `collection` | Curated set of links to other content |
| `project` | Project-specific knowledge |

## Metadata

Required:

- `title`
- `type`

Recommended:

- `source` (the external URL for bookmarks — Hugo reserves `url` for permalinks, so never use `url` here)
- `topics`
- `tags`
- `status`
- `created`
- `updated`
- `related`

## Taxonomy philosophy

Directories represent broad domains. Tags and topics represent cross-cutting concepts. Do not encode every concept into the directory tree.

## Canonical resource

A bookmark should have one canonical document. If the same URL is encountered again, enrich or update the existing document rather than creating another one.
