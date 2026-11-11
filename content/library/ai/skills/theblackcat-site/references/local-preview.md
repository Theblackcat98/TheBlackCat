# Local preview and Hugo debugging

CI owns deploys, but a template, section view or CSS change needs eyes before
you push it. This is the whole loop, verified on this host.

## Get CI's exact version, without root

CI pins **Hugo 0.147.4 extended**. A different minor renders differently and
raises deprecation warnings that `--panicOnWarning` turns into a failed build on
an otherwise healthy tree, so match it exactly.

```bash
cd ~/.hermes/cache/scratch
df -h / | tail -1                     # ~18 MB tarball, ~90 MB extracted
curl -sL -o hugo.tgz \
  https://github.com/gohugoio/hugo/releases/download/v0.147.4/hugo_extended_0.147.4_linux-amd64.tar.gz
mkdir -p ~/.hermes/tools/hugo-0.147.4
tar xzf hugo.tgz -C ~/.hermes/tools/hugo-0.147.4 hugo
~/.hermes/tools/hugo-0.147.4/hugo version      # must say "+extended"
```

Keep it out of `~/.local/bin` so nothing shadows a real install, and always call
it by full path so it is obvious which binary built the page.

## Build and serve — the baseURL trap

```bash
~/.hermes/tools/hugo-0.147.4/hugo --gc --minify --panicOnWarning \
  -b "http://127.0.0.1:8901/" -d /tmp/preview
python3 -m http.server 8901 --bind 127.0.0.1     # background=true, no notify
```

**Without `-b`, the build keeps `baseURL` = the project site**, so every asset
URL comes out as `/TheBlackCat/css/...`. Served from the build directory at
`/`, those all 404 and the page renders unstyled: an oversized unstyled nav,
blue underlined links, transparent body, and a giant black rectangle where the
hero is. That reads exactly like a catastrophic CSS regression and is not one.

Diagnose it in one call instead of rebuilding: `document.styleSheets.length === 0`
means the stylesheet never loaded; `getComputedStyle(document.body).backgroundColor`
returning `rgba(0, 0, 0, 0)` says the same thing. A stylesheet that loaded but is
wrong gives you a non-zero count and a real colour.

`--panicOnWarning` locally is deliberate: the PR job builds that way, so a
warning that would fail CI fails here first, where you can read it.

## Grep traps in the built HTML

- **`--minify` strips attribute quotes.** `grep 'data-id="anatomy"'` returns 0
  on a page that has the element and you conclude the filter broke. Grep
  `data-id=anatomy` (no quotes), or better, assert the thing you actually care
  about from the DOM: `document.querySelectorAll('[data-id=anatomy]').length`.
- **`--minify` collapses inline `<style>` and whitespace**, so CSS-source greps
  are unreliable. Read the source file under `assets/css/`, never the build.
- **Count from the DOM, not the markup.** Chip counts, section lists, card
  totals: read `.tool-card`, `.tools-cat h2`, `.chips [data-filter=domain]`
  `innerText` in the browser. That is the number the user sees, and it catches an
  off-by-one in a `where` filter that a raw grep cannot.

## Checks that need no Hugo at all

Run these first — they catch most registry and template-class mistakes in a
second:

```bash
python3 scripts/check_tools.py          # registry vs static/ vs thumbnails
python3 scripts/check_css.py            # every class a template emits has a selector
python3 scripts/lint_content.py <files> # front matter rules
```

- `check_tools.py` resolves `writeup:` only as `content/<w>.md` or
  `content/<w>/index.md`. A section `_index.md` is **not** a valid writeup
  target; the error prints the doubled path (`content/showcase/_index.md.md`),
  which is the tell — point `writeup:` at a page, not at a section index.
- `check_tools.py` requires every `static/<slug>/index.html` to be registered in
  `data/tools.yaml`, so nothing can be dropped into `static/` unregistered. To
  park an artifact outside the registry, nest it (`static/art/<slug>/`) and
  link it from content instead.
- `check_css.py` fails on any emitted class with no selector. Build a new section
  view out of existing classes (`page-head`, `kicker`, `h-page`, `lede`, `prose`,
  `section`, `section__head`, `h-section`, `count`, `tool-grid` + `tool-card`)
  and you avoid touching `assets/css/` at all.

## After the preview

Screenshot the page at 1400x900 and read it with vision before committing — the
build being green says nothing about whether the new section looks like the rest
of the site. Then commit, push, and gate on the CI run whose `headSha` is yours
(hard rule 7); the local preview proves the change is *right*, CI proves it
*shipped*.
