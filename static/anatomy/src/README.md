# Anatomy · source and screenshots

The five figures one level up are built artefacts, not hand-written pages. This
folder keeps the source and the screenshots that produced them, so the shipped
HTML can be traced back to something editable.

```
src/drone/                     build.mjs, model.mjs, live.js, drone.css, shots/
src/bookshelf-speaker/         build.mjs, shots/
src/limited-slip-differential/ build.mjs, shots/
src/flamelicker/               build.mjs, marks.png, shots/
src/robotic-cat/               build.mjs, model.mjs, live.js, robotic-cat.css, shots/
```

## How a figure is published

Each project's `build.mjs` writes two files, one per theme, into the folder above:

| Built file (in the project folder) | Published as |
| --- | --- |
| `<figure>.html` | `<slug>/index.html` (dark) |
| `<figure>-light.html` | `<slug>/light.html` (light) |

`index.html` and `light.html` are byte-for-byte copies. The `anatomy` shortcode
and the gallery both link to those two names, and `site.js` §8 swaps between them
when the reader changes theme.

### Shipped UX layer (2026-10-28)

The kit is not in this repository, so the build cannot be re-run from here.
The shipped pages therefore carry a hand-applied UX layer on top of the last
kit build: `index.html` is the single themed page (it resolves `?theme=`,
then `localStorage "bc-theme"`, then the OS preference, and switches theme
in-page); `light.html` is a small redirect alias to `index.html?theme=light`,
kept under that name because the `anatomy` shortcode and `site.js` §8 still
reference it. The layer also adds figure navigation, on-screen controls,
metadata and deep-link state. A future kit rebuild restores the two-file
output and drops this layer — reapply it before publishing such a rebuild.

## Rebuilding

```bash
node build.mjs            # dark  -> <figure>.html
node build.mjs --light    # light -> <figure>-light.html
```

The scripts import an isometric drawing kit (solids, lathes, tubes, turned
parts, shading, and the page shell) that lives outside this repository, in the
`anatomy` skill's `kit/` directory. Without that kit the build fails; the
committed HTML is the artefact and does not need it at runtime.

Every figure is a single self-contained file: inline SVG, inline CSS, inline
module script, no network requests. That is what makes it safe to embed.
