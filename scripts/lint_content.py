#!/usr/bin/env python3
"""Lint content/ against the contract in AGENTS.md and docs/CONTENT_MODEL.md.

The contract used to be prose only, and its first real use broke the build
(2026-08-28: `url:` is reserved by Hugo). This makes the rules executable, so
agents and humans get the same feedback in CI, in `make check`, or as a pre-commit hook.

  errors   (exit 1)  things that break Hugo or violate a hard rule
  warnings (exit 0)  drift worth fixing; `--strict` promotes them to errors

Usage: python3 scripts/lint_content.py [--strict] [--verbose] [paths...]
  paths   report only on these files (duplicate-source detection still sees everything),
          so CI can hold *changed* files to the contract without failing on old debt.
  --verbose  list every warning instead of one summary line per rule."""
import re, sys, glob, datetime, collections
from urllib.parse import urlparse

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is required: pip install pyyaml")

TYPES = {"bookmark", "skill", "article", "note", "project", "collection", "reference"}
ARCHIVE = ("library", "inbox", "notes", "collections", "projects")   # sections governed by the content model
KEBAB = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
strict, verbose = "--strict" in sys.argv, "--verbose" in sys.argv
every = sorted(glob.glob("content/**/*.md", recursive=True))
scope = {a for a in sys.argv[1:] if not a.startswith("--")}
paths = every        # everything is parsed (duplicate detection needs it); reporting is filtered below

errors, warns = [], []
def err(f, m): errors.append(f"{f}: {m}")
def warn(f, m): warns.append(f"{f}: {m}")

def norm_url(u):
    p = urlparse(u.strip())
    host = p.netloc.lower().removeprefix("www.")
    return host + p.path.rstrip("/") + (("?" + p.query) if p.query and "utm_" not in p.query else "")

seen_src = collections.defaultdict(list)
tag_use = collections.Counter()

for f in paths:
    txt = open(f, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n?", txt, re.S)
    is_index = f.endswith("_index.md")
    parts = f.split("/")
    section = parts[1] if len(parts) > 2 else ""
    if not m:
        warn(f, "no front matter (renders, but has no title, tags or type)")
        continue
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        err(f, f"front matter is not valid YAML ({str(e).splitlines()[0]})"); continue
    if not isinstance(fm, dict):
        err(f, "front matter must be a mapping"); continue

    # --- hard rules -----------------------------------------------------
    if "url" in fm: err(f, "`url` is reserved by Hugo (permalink override); use `source`")
    if "type" in fm and not (is_index and fm["type"] == "section"):
        err(f, "`type` is reserved by Hugo; use `contenttype` (only `type: section` is allowed, in _index.md)")
    src = fm.get("source")
    if src not in (None, ""):
        if not isinstance(src, str) or urlparse(src).scheme not in ("http", "https") or not urlparse(src).netloc:
            err(f, f"`source` must be an absolute http(s) URL, got {src!r}")
        else:
            seen_src[norm_url(src)].append(f)
    ct = fm.get("contenttype")
    if ct is not None and ct not in TYPES:
        err(f, f"unknown contenttype {ct!r} (allowed: {', '.join(sorted(TYPES))})")
    for k in ("tags", "topics", "related"):
        v = fm.get(k)
        if v is not None and (not isinstance(v, list) or not all(isinstance(x, (str, int)) for x in v)):
            err(f, f"`{k}` must be a list")
    for k in ("created", "updated"):
        v = fm.get(k)
        if v is not None and not isinstance(v, (datetime.date, datetime.datetime)):
            err(f, f"`{k}` must be a YYYY-MM-DD date, got {v!r}")
    c, u = fm.get("created"), fm.get("updated")
    if isinstance(c, datetime.date) and isinstance(u, datetime.date) and u < c:
        err(f, f"`updated` ({u}) is before `created` ({c})")

    if is_index: continue

    # --- the content model applies to the archive sections -----------------
    if section in ARCHIVE:
        if not fm.get("title"): err(f, "missing `title`")
        if not ct: err(f, "missing `contenttype`")
        if section == "library" and not fm.get("description"): warn(f, "no `description` (cards, search and agents use it)")
        if section == "library" and not fm.get("created"): warn(f, "no `created` date")
    else:
        if not fm.get("title"): warn(f, "no `title` (the site falls back to the file name)")
    if fm.get("draft") is True: warn(f, "draft: true (hidden from the site)")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*\.md", parts[-1]): warn(f, "file name is not lowercase-kebab-case (AGENTS.md rule 7)")
    for k in ("tags", "topics"):
        for t in fm.get(k) or []:
            t = str(t)
            if k == "tags": tag_use[t.lower()] += 1
            if not KEBAB.match(t): warn(f, f"{k[:-1]} {t!r} is not lowercase-kebab-case")

for s, fs in seen_src.items():
    if len(fs) > 1:
        err(fs[0], f"duplicate source {s!r} also in: {', '.join(fs[1:])} (enrich the existing item instead)")

def in_scope(line): return not scope or line.split(":", 1)[0] in scope
errors, warns = [e for e in errors if in_scope(e)], [w for w in warns if in_scope(w)]

print(f"checked {len(every)} files · {len(tag_use)} distinct tags ({sum(1 for v in tag_use.values() if v == 1)} used once)")
for e in errors: print("ERROR " + e)
if verbose:
    for w in warns: print("warn  " + w)
else:                                    # one line per rule, not per file
    groups = collections.defaultdict(list)
    for w in warns:
        f, msg = w.split(": ", 1)
        groups[re.sub(r"'[^']*'", "'…'", re.sub(r"\(.*\)", "", msg)).strip()].append(f)
    for msg, fs in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        print(f"warn  {len(fs):>3} × {msg}   e.g. {fs[0]}")
print(f"\n{len(errors)} error(s), {len(warns)} warning(s)" + ("" if verbose or not warns else "   (--verbose lists every warning)"))
sys.exit(1 if errors or (strict and warns) else 0)
