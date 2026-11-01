# Live artifact pages

How to publish a self-contained HTML artifact (interactive demo, visualiser,
design study, single-file app) as a page on TheBlackCat, rather than as a
bookmark pointing somewhere else.

## When this route applies

- The thing is **an HTML file, not a URL** — Nik sent a document or a file he
  authored/generated and said "add this to my website", "put this on the site".
- If instead it is a URL to someone else's work, that is the bookmark workflow
  (`references/bookmark-workflow.md`). If it is his own repo, `content/projects/`
  is generated (`references/projects-sync.md`) — do not hand-add it.

## Finding the artifact

A file sent in another Telegram topic is not in this session's context; the
message "add this to my website" arrives with no payload. Resolve it instead of
asking:

1. `session_search()` with no args → most recent session.
2. Read that session; the document line names a cached path like
   `/home/agent/.hermes/cache/documents/doc_<hash>_<filename>`.
3. Confirm it is the intended file — a re-sent attachment gets a NEW hash path
   for the SAME bytes, so compare with `md5sum` on both paths.

## Procedure

1. **Probe the artifact before writing anything.** Strip `<script>`/`<style>` and
   list the headings, title, and external hosts. You need the real section list
   for the entry text, and the host list for the "third-party deps" note in the
   report:

   ```bash
   python3 - "$F" <<'PY'
   import re,sys,html
   s=open(sys.argv[1],encoding='utf-8').read()
   print(re.findall(r'<title>(.*?)</title>',s,re.S))
   for tag,txt in re.findall(r'<(h[1-3])[^>]*>(.*?)</\1>',s,re.S):
       print(tag, html.unescape(re.sub(r'<[^>]+>','',txt)).strip()[:100])
   print(sorted(set(re.findall(r'https?://([^/"\']+)',s))))
   PY
   ```

2. **Copy it byte-identical** into its own static directory, directory name =
   the slug:

   ```bash
   mkdir -p static/<slug> && cp "$F" static/<slug>/index.html && md5sum static/<slug>/index.html
   ```

   Keep the md5 — it is how you prove later that GitHub Pages serves the
   authored bytes and not a mangled copy.

3. **Check the slug is free.** `ls content/` sections, `static/`, and
   `grep -rl '<slug>' content/` — the static page lands at `/<slug>/`, so a
   collision shadows a real content page.

4. **Write the library entry**: `content/library/<domain>/<slug>.md`,
   `contenttype: article` (it is a standalone authored piece, not an external
   resource — `bookmark` implies a `source` URL it does not have). Reuse the
   live tag/topic vocabulary (`python3 scripts/lint_content.py --vocab`), real
   dates from `date +%F`. Body shape that works:

   - one-paragraph lead: what the artifact *is*, mechanically;
   - `## Read it` — `[Open the <thing>](/<slug>/) — <one clause>`. Leading
     slash, **no `/TheBlackCat/` prefix** (the site adds it);
   - `## What is inside` — one bullet per real section/studio/feature, named as
     the page names them;
   - `## Notes` — how it is served (`static/<slug>/index.html`), what it stores
     or sends (usually nothing beyond CDN/font/icon requests), and that it is
     kept byte-identical to the source artifact.

5. **Lint, then commit both paths in ONE commit** — `static/<slug>/index.html`
   and the entry. This is the deliberate exception to the content/non-content
   split (hard rule 6): the asset *is* the content here, and two commits would
   put a live page whose `Read it` link 404s between them. Fetch (`pull
   --ff-only`) first, stage explicit paths only, leave another session's dirty
   files alone.

6. **Verify the whole ladder, not just the first rung:**

   ```bash
   # CI for YOUR sha
   gh run list -L 8 --json databaseId,headSha,status,conclusion,name
   # both URLs, and the served size matches the source size
   curl -s -o /dev/null -w "%{http_code} %{size_download}b\n" <static-url> <entry-url>
   ```

   Then load the static page in the browser and assert computed state, because
   a raw artifact inherits nothing from the site and a 200 says nothing about
   styling:

   ```python
   js("""(() => { const h=document.querySelector('h1');
     return {bg:getComputedStyle(document.body).backgroundColor,
             font:getComputedStyle(document.body).fontFamily,
             h1:h&&h.textContent.trim().slice(0,40),
             canvases:document.querySelectorAll('canvas').length}); })()""")
   ```

   Screenshot it and look at the pixels — fonts applied, canvases actually
   drawing, no bare unstyled text. Then confirm the entry's link resolves to the
   prefixed URL.

## Pitfalls

- **Hugo minifies rendered HTML with unquoted attributes.** `grep 'href="…slug…"'`
  returns nothing on a perfectly healthy page (real link:
  `href=/TheBlackCat/<slug>/`). Search for the slug or the link text, never the
  quoted attribute, before concluding the body did not render.
- **`document.body.scrollHeight == viewport height` is not evidence of a broken
  page.** Single-file artifacts are often single-screen apps whose panels are
  toggled. Assert fonts, colours and canvas presence instead.
- **The artifact brings its own third-party requests** (Tailwind CDN, Google
  Fonts, icon packs). The site's no-third-party design rules govern layouts and
  assets, not a standalone page — do not silently rewrite or vendor someone's
  artifact. Ship it as-is and report the dependency list with an offer to vendor.
- **Do not "clean up" the artifact as you add it** — odd `<title>` prefixes,
  emoji, inline data. Report the oddity and let Nik decide; byte-identical is the
  contract that makes the copy trustworthy.
- **`static/` normally needs approval, but "add this to my website" is that
  approval** for adding the file. The approval line sits at changing the site's
  own layouts/CSS/config/menu, not at adding one static page plus its entry.
- **Report, don't silently fix, what you did not touch**: uncommitted files from
  another session in the tree, the artifact's own quirks, unpinned CDNs.
