#!/usr/bin/env python3
"""Verify the tools workshop registry (data/tools.yaml) against static/, content/, and thumbnails:
  - Every registry entry has valid fields, write-up, and light/dark WebP thumbnails.
  - Every hosted tool has static/<id>/index.html, loads toolkit.css + toolkit.js, and has SEO metadata.
  - Every static/<slug>/index.html folder is registered in data/tools.yaml.

Usage: python3 scripts/check_tools.py"""
import glob, os, re, sys
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

errors = []
def err(msg):
    errors.append(msg)

for req in (
    "data/tools.yaml",
    "static/toolkit/toolkit.css",
    "static/toolkit/toolkit.js",
    "static/fonts/outfit-latin-wght-normal.woff2",
    "static/fonts/LICENSE-outfit.txt",
):
    if not os.path.exists(req):
        err(f"missing required file: {req}")
if os.path.exists("static/toolkit/registry.json"):
    err("static/toolkit/registry.json should not exist; Hugo generates /toolkit/registry.json from data/tools.yaml")

reg = yaml.safe_load(open("data/tools.yaml", encoding="utf-8"))
cats = {c["id"]: c for c in reg.get("categories") or []}
tools = reg.get("tools") or []
tool_ids = {t["id"] for t in tools}
KINDS = {"app", "utility", "exhibit"}

for t in tools:
    tid = t.get("id", "<missing>")
    for field in ("id", "name", "url", "writeup", "category", "kind", "short", "desc", "tags", "added"):
        if not t.get(field):
            err(f"{tid}: missing `{field}` in data/tools.yaml")
    if t.get("category") not in cats:
        err(f"{tid}: unknown category {t.get('category')!r}")
    if t.get("kind") not in KINDS:
        err(f"{tid}: unknown kind {t.get('kind')!r} (expected one of {sorted(KINDS)})")
    for rel in t.get("related") or []:
        if rel not in tool_ids:
            err(f"{tid}: unknown related tool id {rel!r}")

    # Write-up existence + `tool: <id>` front matter
    w = (t.get("writeup") or "").strip("/")
    cands = [f"content/{w}.md", f"content/{w}/index.md"]
    w_file = next((c for c in cands if os.path.exists(c)), None)
    if not w_file:
        err(f"{tid}: writeup {w!r} not found (checked {cands})")
    elif not t.get("url", "").startswith("http"):
        w_txt = open(w_file, encoding="utf-8").read()
        if not re.search(rf"^tool:\s*{re.escape(tid)}\b", w_txt, re.M):
            err(f"{tid}: writeup {w_file} is missing `tool: {tid}` in front matter")

    # Thumbnails
    for scheme in ("light", "dark"):
        thumb = f"static/toolkit/thumbs/{tid}-{scheme}.webp"
        if not os.path.exists(thumb) or os.path.getsize(thumb) == 0:
            err(f"{tid}: missing or empty thumbnail {thumb}")

    # Hosted tool HTML checks
    url = t.get("url", "")
    if not url.startswith("http"):
        html_path = f"static/{url.strip('/')}/index.html"
        if not os.path.exists(html_path):
            err(f"{tid}: missing static HTML {html_path}")
        else:
            txt = open(html_path, encoding="utf-8").read()
            if "toolkit/toolkit.css" not in txt:
                err(f"{tid}: {html_path} does not load toolkit.css")
            if f'data-tool="{tid}"' not in txt or "toolkit/toolkit.js" not in txt:
                err(f"{tid}: {html_path} does not load toolkit.js with data-tool=\"{tid}\"")
            if "../tools/" not in txt:
                err(f"{tid}: {html_path} is missing no-JS fallback link to ../tools/")
            if t.get("kind") != "exhibit" and re.search(r'<link[^>]*fonts\.googleapis\.com', txt, re.I):
                err(f"{tid}: {html_path} still loads fonts from Google Fonts")
            if re.search(r'id=["\']theme-(?:btn|toggle)["\']|class=["\'][^"\']*\btheme-toggle\b', txt, re.I):
                err(f"{tid}: {html_path} still contains a duplicate theme-toggle button")
            for sm in re.finditer(r"<style[^>]*>(.*?)</style>", txt, re.S | re.I):
                css = re.sub(r"/\*.*?\*/", "", sm.group(1), flags=re.S)
                if css.count("{") != css.count("}"):
                    err(f"{tid}: {html_path} has unbalanced CSS braces ({css.count('{')} '{{' vs {css.count('}')} '}}')")
                if t.get("kind") != "exhibit" and re.search(r"@media\s*\(\s*prefers-color-scheme", css, re.I):
                    err(f"{tid}: {html_path} uses @media (prefers-color-scheme) instead of light-dark() / toolkit tokens")
            for meta_pat, label in (
                (r'<meta\s+name=["\']description["\']', "meta description"),
                (r'<link\s+rel=["\']canonical["\']', "canonical link"),
                (r'<meta\s+property=["\']og:image["\']', "og:image"),
                (r'application/ld\+json', "WebApplication JSON-LD"),
            ):
                if not re.search(meta_pat, txt, re.I):
                    err(f"{tid}: {html_path} is missing {label}")

# Every static/<slug>/index.html must be in data/tools.yaml
hosted_ids = {t["url"].strip("/") for t in tools if not t.get("url", "").startswith("http")}
for p in sorted(glob.glob("static/*/index.html")):
    slug = p.split("/")[1]
    if slug not in hosted_ids:
        err(f"static/{slug}/index.html has no entry in data/tools.yaml")

print(f"checked {len(tools)} tools ({len(hosted_ids)} hosted, {len(tools) - len(hosted_ids)} external) across {len(cats)} categories")
if errors:
    for e in errors:
        print("ERROR " + e)
    sys.exit(1)
print("ok")
