#!/usr/bin/env python3
"""Package a self-contained Three.js artifact as a hostable Showcase page.

Copies --src to static/<slug>/index.html and adds the site chrome that
scripts/check_tools.py requires, while repointing any CDN copy of three.js at
the vendored r128 under static/vendor/three/.

  python3 package_artifact.py --slug colosseum \
      --src ~/path/index.html --name "Colosseum" --desc "..."

Then: add the data/tools.yaml row (category: showcase), write the page at
content/showcase/<slug>/index.md with `tool: <slug>`, and shoot the two
thumbnails. check_tools.py enforces all of it.

Idempotence guard: refuses a file that is already packaged (it would inject the
chrome block twice), so re-packaging is always from the original source.
"""
import argparse
import os
import re
import sys

REPO_DEFAULT = os.path.expanduser("~/hermes/repos/Theblackcat98/TheBlackCat")
BASE = "https://theblackcat98.github.io/TheBlackCat"

# The artifacts arrive built against the r128 CDN; one vendored copy serves all
# of them (static/vendor/three/, MIT). Keyed by the exact src attribute value.
CDN = {
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js":
        "../vendor/three/three.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js":
        "../vendor/three/OrbitControls.js",
}


def chrome(slug, name, desc):
    """The block check_tools.py insists on, plus the toolkit bar that draws the
    breadcrumb and a Write-up button from the registry."""
    ld = (
        '{"@context": "https://schema.org", "@type": "VisualArtwork", '
        f'"name": "{name}", "description": "{desc}", '
        f'"url": "{BASE}/{slug}/", '
        f'"image": "{BASE}/toolkit/thumbs/{slug}-light.webp" }}'
    )
    return f'''<meta name="description" content="{desc}">
<link rel="canonical" href="{BASE}/{slug}/">
<meta property="og:title" content="{name}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{BASE}/toolkit/thumbs/{slug}-light.webp">
<script type="application/ld+json" data-tk-ld>{ld}</script>
<link rel="stylesheet" href="../toolkit/toolkit.css?v=1">
<script src="../toolkit/toolkit.js?v=1" defer data-tool="{slug}"></script>
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True, help="serves at /<slug>/")
    ap.add_argument("--src", required=True, help="the built, self-contained html")
    ap.add_argument("--name", required=True)
    ap.add_argument("--desc", required=True)
    ap.add_argument("--repo", default=REPO_DEFAULT)
    a = ap.parse_args()

    txt = open(os.path.expanduser(a.src), encoding="utf-8").read()

    if "data-tk-ld" in txt or "toolkit/toolkit.js" in txt:
        sys.exit(f"{a.src} is already packaged — re-run against the original build")
    if "</head>" not in txt:
        sys.exit(f"{a.src} has no </head>")

    for cdn, local in CDN.items():
        txt = txt.replace(cdn, local)
    txt = txt.replace("</head>", chrome(a.slug, a.name, a.desc) + "</head>", 1)

    # no-JS fallback, same shape as every other hosted page
    txt = re.sub(r"(<body[^>]*>)",
                 r'\1\n<a class="back tk-fallback" href="../tools/">&#8592; All tools</a>',
                 txt, count=1)

    out_dir = os.path.join(a.repo, "static", a.slug)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "index.html")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(txt)

    remote = [u for u in re.findall(r'(?:src|href)="(https?://[^"]+)"', txt)
              if not u.startswith((BASE, "https://schema.org"))]
    print(f"{out}  {len(txt) // 1024} KB  remote refs: {len(remote)}")
    for u in remote:
        print("  LEAK " + u)
    if remote:
        sys.exit("third-party references remain — the site allows none")
    print("next: registry row, content/showcase/%s/index.md, thumbnails, then "
          "python3 scripts/check_tools.py" % a.slug)


if __name__ == "__main__":
    main()
