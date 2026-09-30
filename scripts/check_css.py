#!/usr/bin/env python3
"""Every class a template emits must have a CSS rule (the 2026-09-02 "unstyled page" incident),
and CSS should not accumulate rules nothing uses (the old sheet carried ~30 dead ones).

Exit 1 on missing rules. Unused selectors are reported as warnings unless --strict.
Usage: python3 scripts/check_css.py [--strict]"""
import re, sys, glob

def strip_comments(s): return re.sub(r"/\*.*?\*/", "", s, flags=re.S)

css = strip_comments("".join(open(f).read() for f in sorted(glob.glob("assets/css/*.css"))))
# drop url(...), numbers like .5rem, and attribute selectors' values before harvesting class names
css_nourl = re.sub(r"url\([^)]*\)|\[[^\]]*\]|\"[^\"]*\"|'[^']*'", "", css)
defined = set(re.findall(r"\.(-?[_a-zA-Z][\w-]*)", re.sub(r"\d+\.\d+|\.\d+", "", css_nourl)))

emitted, dynamic = set(), set()
files = glob.glob("layouts/**/*.html", recursive=True) + glob.glob("assets/js/*.js")
for f in files:
    txt = open(f, encoding="utf-8").read()
    if f.startswith("layouts/"):
        # blank out {{ ... }} actions first: they contain quotes that break attribute parsing
        flat = re.sub(r"\{\{.*?\}\}", "\x00", txt, flags=re.S)
        for m in re.findall(r'class="([^"]*)"', flat):
            for c in re.split(r"\s+", m):
                if not c: continue
                if "\x00" in c: dynamic.add(c.split("\x00")[0])      # e.g. "callout--<type>", "kind-<kind>"
                else: emitted.add(c)
    else:
        for m in re.findall(r"classList\.(?:add|toggle|remove|contains)\(\"([\w-]+)\"", txt): emitted.add(m)

# classes JS or Hugo/markdown/Chroma inject at runtime
runtime = {"js", "no-js", "ext", "anchor", "chroma", "highlight", "line", "cl", "hl", "ln", "lnt", "mermaid",
           "search__hit", "search__title", "search__meta", "search__desc", "search__group", "search__empty"}
# Chroma token classes are emitted by Hugo, not by templates
chroma = {c for c in defined if re.fullmatch(r"[a-z]{1,3}\d?", c)}
used = emitted | runtime

# body/page classes are built from kind/section names and are hooks for future styling, not rules
missing = sorted(c for c in emitted if c not in defined)
unused = sorted(c for c in defined if c not in used and c not in chroma
                and not any(c.startswith(d) for d in dynamic if d))

print(f"classes emitted by templates/JS: {len(emitted)}   defined in CSS: {len(defined)}")
if missing: print("\nMISSING CSS (emitted but no rule):\n  " + "\n  ".join(missing))
if unused:  print("\nPossibly unused CSS (defined, never emitted):\n  " + "\n  ".join(unused))
sys.exit(1 if missing or (unused and "--strict" in sys.argv) else 0)
