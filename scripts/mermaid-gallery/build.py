#!/usr/bin/env python3
"""Regenerate static/mermaid-gallery/index.html from mermaid_data.json.

Usage:  python3 scripts/mermaid-gallery/build.py
Stdlib only. The generated page is committed; this script exists so future
edits (new examples, wording, structure) can be made in the data/template
here and regenerated deterministically instead of hand-editing 2.3k lines.
After regenerating, verify with a local server (see PR #9 notes).
"""
import json, html, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "mermaid_data.json")
OUT = os.path.join(HERE, "..", "..", "static", "mermaid-gallery", "index.html")

DATA = json.load(open(DATA))
CATS = DATA["categories"]
DIAGRAMS = DATA["diagrams"]

N = len(DIAGRAMS)
idx_of = {d["id"]: i + 1 for i, d in enumerate(DIAGRAMS)}

def esc(s): return html.escape(s, quote=True)

def code_block(d):
    return f"<pre><code>{esc(d['code'])}</code></pre>"

def card(d):
    i = idx_of[d["id"]]
    search = esc((d["name"] + " " + d["blurb"] + " " + " ".join(d["uses"])).lower())
    uses = "".join(f"<li>{esc(u)}</li>" for u in d["uses"])
    note = f'<div class="curiosity">{esc(d["note"])}</div>' if d.get("note") else ""
    return f'''<article class="diagram-card" id="{d["id"]}" data-name="{esc(d["name"])}" data-search="{search}">
            <header class="card-head">
              <div>
                <div class="title-row"><span class="card-number">{i:02d}</span><h3>{esc(d["name"])}</h3></div>
                <p>{esc(d["blurb"])}</p>
                {note}
              </div>
              <div class="card-actions js-only">
                <button class="mini-btn" type="button" data-copy="{d["id"]}">{ICON_COPY}<span>Copy</span></button>
                <button class="mini-btn" type="button" data-template="{d["id"]}">{ICON_UP}<span>Use as template</span></button>
              </div>
            </header>
            <ul class="good-for">{uses}</ul>
            <div class="diagram-stage" aria-label="Rendered {esc(d["name"])} example">
              <div class="render-target" id="render-{d["id"]}"><span class="rendering">Rendering diagram…</span></div>
              <button class="zoom-btn" type="button" data-zoom="{d["id"]}" aria-label="Zoom {esc(d["name"])}">{ICON_ZOOM}</button>
            </div>
            <details class="source-panel" id="source-{d["id"]}">
              <summary>View source</summary>
              <div class="source-bar js-only">
                <span>mermaid</span>
                <span class="source-actions">
                  <button class="copy-btn" type="button" data-copy="{d["id"]}">{ICON_COPY}<span>Copy</span></button>
                  <button class="copy-btn" type="button" data-svg="{d["id"]}">{ICON_SVG}<span>Copy SVG</span></button>
                  <button class="copy-btn" type="button" data-png="{d["id"]}">{ICON_IMG}<span>PNG</span></button>
                </span>
              </div>
              {code_block(d)}
            </details>
          </article>'''

def cat_block(c):
    items = [d for d in DIAGRAMS if d["category"] == c["id"]]
    cards = "\n".join(card(d) for d in items)
    label = f'{len(items)} {"type" if len(items)==1 else "types"}'
    return f'''<section class="category-block" data-category="{c["id"]}" aria-labelledby="category-{c["id"]}">
          <div class="category-head"><h2 id="category-{c["id"]}">{esc(c["label"])}</h2><span>{label}</span></div>
          {cards}
        </section>'''

def side_group(c):
    items = [d for d in DIAGRAMS if d["category"] == c["id"]]
    links = "".join(
        f'<a class="side-link" href="#{d["id"]}" data-target="{d["id"]}"><span class="side-index">{idx_of[d["id"]]:02d}</span><span>{esc(d["name"])}</span></a>'
        for d in items)
    return f'<div class="side-group" data-nav-category="{c["id"]}"><span class="side-group-title">{esc(c["label"])}</span>{links}</div>'

def mobile_group(c):
    items = [d for d in DIAGRAMS if d["category"] == c["id"]]
    links = "".join(f'<a href="#{d["id"]}">{esc(d["name"])}</a>' for d in items)
    return f'<div><span class="mobile-index-title">{esc(c["label"])}</span>{links}</div>'

ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>'
ICON_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg>'
ICON_ZOOM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path><path d="M11 8v6"></path><path d="M8 11h6"></path></svg>'
ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m8 9-3 3 3 3"></path><path d="m16 9 3 3-3 3"></path><path d="m14 6-4 12"></path></svg>'
ICON_IMG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m5 18 5-5 3 3 3-3 3 3"></path></svg>'

# --- icon templates need defining before card() is called; re-bind by re-running emit ---
def build():
    blocks = "\n".join(cat_block(c) for c in CATS)
    side = "\n".join(side_group(c) for c in CATS)
    mobile = "\n".join(mobile_group(c) for c in CATS)
    start_opts = '<option value="">Pick an example…</option>' + "".join(
        f'<option value="{d["id"]}">{esc(d["name"])}</option>' for d in DIAGRAMS)
    page = TEMPLATE
    for k, v in {"%%LIGHT_VARS%%": LIGHT_VARS, "%%DARK_VARS%%": DARK_VARS,
                 "%%CAT_BLOCKS%%": blocks, "%%SIDENAV%%": side, "%%MOBILE_INDEX%%": mobile,
                 "%%START_OPTS%%": start_opts, "%%N%%": str(N),
                 "%%CAT_FILTERS%%": "".join(f'<button class="filter" type="button" data-filter="{c["id"]}">{esc(c["label"])}</button>' for c in CATS),
                 "%%CAT_OPTIONS%%": "".join(f'<option value="{c["id"]}">{esc(c["label"])}</option>' for c in CATS)}.items():
        page = page.replace(k, v)
    open(OUT, "w").write(page)
    print("wrote", OUT, len(page), "chars,", page.count(chr(10)), "lines")

LIGHT_VARS = """      --bg: #f4f7f8;
      --surface: #ffffff;
      --surface-2: #edf2f3;
      --ink: #172225;
      --muted: #54666b;
      --line: #d7e0e2;
      --accent: #067c72;
      --accent-ink: #ffffff;
      --accent-soft: #d8f1ed;
      --code-bg: #152124;
      --code-ink: #d9e7e8;
      --warning-bg: #fff3d6;
      --warning-ink: #664800;
      --shadow: 0 18px 48px rgba(28, 49, 52, 0.08);
      --diagram-bg: #fbfdfd;
      --focus: #e37726;"""

DARK_VARS = """      --bg: #0f1719;
      --surface: #162124;
      --surface-2: #1e2c2f;
      --ink: #e7eeee;
      --muted: #adbdc0;
      --line: #314145;
      --accent: #58c8bb;
      --accent-ink: #082c28;
      --accent-soft: #173d3a;
      --code-bg: #091113;
      --code-ink: #d5e4e5;
      --warning-bg: #3c321b;
      --warning-ink: #f3d781;
      --shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
      --diagram-bg: #f8fbfb;
      --focus: #ffad66;"""

TEMPLATE = r'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <meta name="description" content="Every Mermaid v11 diagram type — 23 working examples with copyable source, plus a live scratchpad: paste any Mermaid code and render it as you type." />
  <meta property="og:site_name" content="The BlackCat" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Mermaid.js Gallery — every diagram type, with a live scratchpad" />
  <meta property="og:description" content="23 Mermaid v11 diagram types with working examples and copyable source, plus a scratchpad that renders your own code as you type." />
  <meta property="og:url" content="https://theblackcat98.github.io/TheBlackCat/mermaid-gallery/" />
  <meta property="og:image" content="../og.png" />
  <meta name="twitter:card" content="summary" />
  <link rel="icon" href="data:," />
  <title>Mermaid.js Gallery</title>
  <style>
    :root {
      color-scheme: light dark;
%%LIGHT_VARS%%
      --radius-lg: 20px;
      --radius-md: 12px;
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
%%DARK_VARS%%
      }
    }
    :root[data-theme="dark"] {
%%DARK_VARS%%
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; scroll-padding-top: 92px; }
    body {
      margin: 0;
      min-width: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: "Avenir Next", "Segoe UI", Helvetica, sans-serif;
      font-size: 16px;
      line-height: 1.5;
    }
    button, input, select, textarea { font: inherit; }
    button, a { -webkit-tap-highlight-color: transparent; }
    a { color: inherit; }
    :focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }

    .page {
      width: min(1440px, 100%);
      margin: 0 auto;
      padding: 28px clamp(16px, 3vw, 42px) 64px;
    }

    .intro {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 28px;
      align-items: end;
      padding: 20px 0 28px;
      border-bottom: 1px solid var(--line);
    }
    .intro h1 {
      max-width: 760px;
      margin: 0 0 12px;
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 400;
      font-size: clamp(2.35rem, 6vw, 5.4rem);
      line-height: 0.98;
      letter-spacing: -0.045em;
    }
    .intro p {
      max-width: 720px;
      margin: 0;
      color: var(--muted);
      font-size: clamp(1rem, 1.7vw, 1.22rem);
    }
    .counter {
      min-width: 154px;
      padding: 16px 18px;
      border-left: 3px solid var(--accent);
      background: var(--surface);
    }
    .counter strong {
      display: block;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 2.7rem;
      line-height: 1;
      color: var(--accent);
      font-weight: 400;
    }
    .counter span { color: var(--muted); font-size: 0.9rem; }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: grid;
      grid-template-columns: minmax(230px, 1fr) auto auto;
      gap: 12px;
      align-items: center;
      margin: 18px 0 24px;
      padding: 11px;
      background: color-mix(in srgb, var(--bg) 90%, transparent);
      backdrop-filter: blur(14px);
      border: 1px solid var(--line);
      box-shadow: 0 8px 26px rgba(17, 36, 39, 0.08);
    }
    .search-wrap { position: relative; }
    .search-wrap svg {
      position: absolute;
      left: 13px;
      top: 50%;
      width: 18px;
      height: 18px;
      transform: translateY(-50%);
      color: var(--muted);
      pointer-events: none;
    }
    #search {
      width: 100%;
      height: 44px;
      border: 0;
      background: var(--surface);
      color: var(--ink);
      padding: 0 42px 0 40px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 1px var(--line);
    }
    #search::placeholder { color: var(--muted); }
    #search::-webkit-search-cancel-button { display: none; }
    .search-clear {
      position: absolute;
      right: 5px;
      top: 5px;
      width: 34px;
      height: 34px;
      display: none;
      place-items: center;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
    }
    .search-clear:hover { background: var(--surface-2); color: var(--ink); }
    .match-count {
      min-width: 92px;
      text-align: center;
      color: var(--muted);
      font: 0.78rem/1.3 "SFMono-Regular", Consolas, monospace;
      white-space: nowrap;
    }
    .theme-toggle {
      min-height: 40px;
      padding: 6px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .theme-toggle:hover { background: var(--surface-2); }
    .toolbar select {
      display: none;
      width: 100%;
      height: 44px;
      padding: 0 36px 0 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      color: var(--ink);
    }
    .filter-list { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
    .filter {
      min-height: 36px;
      padding: 7px 11px;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      white-space: nowrap;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .filter:hover { background: var(--surface-2); color: var(--ink); }
    .filter.active { background: var(--accent); color: var(--accent-ink); }

    .mobile-index { display: none; }

    /* ---- scratchpad ---- */
    .scratchpad {
      margin: 26px 0 40px;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      overflow: clip;
    }
    .scratch-head {
      display: flex;
      flex-wrap: wrap;
      gap: 14px 24px;
      align-items: end;
      justify-content: space-between;
      padding: clamp(18px, 3vw, 26px) clamp(18px, 3.5vw, 34px) 14px;
    }
    .scratch-head h2 {
      margin: 0 0 6px;
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 400;
      font-size: clamp(1.4rem, 2.6vw, 1.9rem);
      letter-spacing: -0.02em;
    }
    .scratch-head p { margin: 0; color: var(--muted); font-size: 0.92rem; max-width: 560px; }
    .scratch-start { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 0.85rem; white-space: nowrap; }
    .scratch-start select {
      height: 38px;
      padding: 0 8px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      color: var(--ink);
      max-width: 220px;
    }
    #scratch-code {
      display: block;
      width: calc(100% - 2 * clamp(18px, 3.5vw, 34px));
      min-height: 170px;
      max-height: 60vh;
      margin: 0 clamp(18px, 3.5vw, 34px);
      padding: 14px 16px;
      resize: vertical;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--code-bg);
      color: var(--code-ink);
      font: 0.84rem/1.6 "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      tab-size: 2;
    }
    #scratch-code::placeholder { color: #7d9599; }
    .scratch-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 14px;
      align-items: center;
      padding: 12px clamp(18px, 3.5vw, 34px);
      color: var(--muted);
      font-size: 0.84rem;
    }
    .scratch-bar .grow { flex: 1; min-width: 120px; }
    #scratch-status { font-weight: 600; color: var(--accent); }
    .scratch-hint { color: var(--muted); }
    .scratch-bar button {
      min-height: 34px;
      padding: 6px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
      font-weight: 600;
    }
    .scratch-bar button:hover { background: var(--surface-2); }

    .layout {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      gap: clamp(24px, 4vw, 58px);
      align-items: start;
    }
    .sidebar {
      position: sticky;
      top: 90px;
      max-height: calc(100vh - 112px);
      overflow-y: auto;
      padding: 8px 14px 18px 0;
      scrollbar-width: thin;
    }
    .side-heading {
      margin: 0 0 9px;
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.11em;
    }
    .side-group { margin-bottom: 19px; }
    .side-group-title {
      display: block;
      margin-bottom: 5px;
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 700;
    }
    .side-link {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 31px;
      padding: 4px 7px;
      border-radius: 7px;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.88rem;
    }
    .side-link:hover, .side-link.active { background: var(--surface-2); color: var(--ink); }
    .side-link.active { font-weight: 650; }
    .side-index {
      width: 21px;
      flex: 0 0 21px;
      color: var(--accent);
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 0.71rem;
    }

    .gallery { min-width: 0; }
    .category-block { margin-bottom: 52px; }
    .category-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      margin: 2px 0 15px;
    }
    .category-head h2 {
      margin: 0;
      font-size: clamp(1.28rem, 2.5vw, 1.75rem);
      letter-spacing: -0.02em;
    }
    .category-head span { color: var(--muted); font-size: 0.88rem; }

    .diagram-card {
      scroll-margin-top: 96px;
      margin-bottom: 19px;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      overflow: clip;
    }
    .card-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: start;
      padding: clamp(18px, 3vw, 28px) clamp(18px, 3.5vw, 34px) 18px;
    }
    .title-row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
    .card-number {
      color: var(--accent);
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .card-head h3 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(1.45rem, 3vw, 2.12rem);
      line-height: 1.1;
      font-weight: 400;
      letter-spacing: -0.02em;
    }
    .card-head p {
      max-width: 730px;
      margin: 8px 0 0;
      color: var(--muted);
    }
    .card-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .mini-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 36px;
      padding: 6px 11px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .mini-btn:hover { background: var(--surface-2); }
    .mini-btn svg { width: 15px; height: 15px; }

    .good-for {
      display: flex;
      align-items: baseline;
      gap: 9px;
      flex-wrap: wrap;
      margin: 0;
      padding: 0 clamp(18px, 3.5vw, 34px) 22px;
      list-style: none;
    }
    .good-for::before {
      content: "Good for";
      color: var(--muted);
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .good-for li {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: var(--ink);
      font-size: 0.9rem;
    }
    .good-for li:not(:last-child)::after { content: "·"; color: var(--accent); }

    .diagram-stage {
      position: relative;
      min-height: 300px;
      display: grid;
      place-items: center;
      padding: clamp(18px, 4vw, 44px);
      background:
        linear-gradient(var(--diagram-bg), var(--diagram-bg)),
        repeating-linear-gradient(0deg, transparent 0 27px, rgba(6,124,114,.04) 27px 28px);
      border-top: 1px solid var(--line);
      overflow: hidden;
      cursor: zoom-in;
    }
    .diagram-stage .render-target { width: 100%; min-width: 0; text-align: center; }
    .diagram-stage svg { display: block; max-width: 100% !important; height: auto !important; margin: 0 auto; }
    .rendering { color: #51676b; font-size: 0.9rem; }
    .render-error {
      width: min(560px, 100%);
      padding: 16px;
      border: 1px solid #c34a42;
      border-radius: 8px;
      background: #fff0ef;
      color: #74241f;
      text-align: left;
      cursor: default;
    }
    .zoom-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: color-mix(in srgb, var(--surface) 88%, transparent);
      color: var(--ink);
      cursor: zoom-in;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .zoom-btn svg { width: 18px; height: 18px; }
    .diagram-stage:hover .zoom-btn, .diagram-stage:focus-within .zoom-btn, .zoom-btn:focus-visible { opacity: 1; }
    @media (hover: none) { .zoom-btn { opacity: 1; } }

    .source-panel { border-top: 1px solid var(--line); }
    .source-panel summary {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 12px clamp(18px, 3.5vw, 34px);
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
      font-weight: 650;
      font-size: 0.92rem;
      list-style: none;
      user-select: none;
    }
    .source-panel summary::-webkit-details-marker { display: none; }
    .source-panel summary::before {
      content: "";
      width: 0; height: 0;
      border-left: 6px solid var(--accent);
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      transition: transform 0.15s;
    }
    .source-panel[open] summary::before { transform: rotate(90deg); }
    .source-panel[open] summary { border-bottom: 1px solid color-mix(in srgb, var(--line) 45%, transparent); }
    .source-body { background: var(--code-bg); color: var(--code-ink); }
    .source-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding: 11px 14px 0 18px;
      color: #91a9ac;
      font: 0.76rem/1.4 "SFMono-Regular", Consolas, monospace;
    }
    .source-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 34px;
      padding: 6px 10px;
      border: 1px solid #34494d;
      border-radius: 7px;
      background: #203034;
      color: #d9e7e8;
      cursor: pointer;
      font-size: 0.82rem;
    }
    .copy-btn:hover { background: #293d41; }
    .copy-btn svg { width: 14px; height: 14px; }
    pre {
      margin: 0;
      padding: 14px 18px 22px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-break: normal;
      font: 0.82rem/1.62 "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      tab-size: 2;
    }

    /* ---- zoom overlay ---- */
    .zoom-overlay {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: grid;
      grid-template-rows: auto 1fr;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      backdrop-filter: blur(6px);
    }
    .zoom-overlay[hidden] { display: none; }
    .zoom-top {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--line);
      background: var(--surface);
    }
    .zoom-top h2 { margin: 0; font-size: 1.05rem; font-weight: 650; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .zoom-controls { display: flex; align-items: center; gap: 8px; }
    .zoom-controls button {
      min-height: 34px;
      min-width: 34px;
      padding: 4px 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
      font-weight: 650;
    }
    .zoom-controls button:hover { background: var(--surface-2); }
    #zoom-pct { min-width: 52px; text-align: center; color: var(--muted); font: 0.82rem "SFMono-Regular", Consolas, monospace; }
    .zoom-scroll { overflow: auto; padding: 24px; }
    .zoom-scroll svg { max-width: none !important; height: auto !important; display: block; margin: 0 auto; background: var(--diagram-bg); border-radius: 8px; }
    .zoom-overlay .diagram-stage { min-height: 0; }

    .curiosity {
      margin: 20px clamp(18px, 3.5vw, 34px) 0;
      padding: 11px 13px;
      border-radius: 8px;
      background: var(--warning-bg);
      color: var(--warning-ink);
      font-size: 0.88rem;
    }
    .empty-state {
      display: none;
      margin: 48px auto;
      max-width: 520px;
      padding: 30px;
      text-align: center;
      color: var(--muted);
      border: 1px dashed var(--line);
      background: var(--surface);
    }
    .empty-state strong { display: block; color: var(--ink); font-size: 1.15rem; margin-bottom: 4px; }
    .footnote {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 0.86rem;
    }
    .footnote strong { color: var(--ink); }

    @media (max-width: 930px) {
      .intro { grid-template-columns: 1fr; align-items: start; }
      .counter { width: max-content; }
      .layout { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .toolbar { grid-template-columns: minmax(0, 1fr) 180px; }
      .filter-list { display: none; }
      .toolbar select { display: block; }
      .mobile-index {
        display: block;
        margin: 14px 0 22px;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--surface);
      }
      .mobile-index summary {
        padding: 11px 14px;
        cursor: pointer;
        font-weight: 650;
        list-style: none;
      }
      .mobile-index summary::-webkit-details-marker { display: none; }
      .mobile-index summary::before { content: "☰ "; color: var(--accent); }
      .mobile-index[open] summary { border-bottom: 1px solid var(--line); }
      .mobile-index nav { padding: 8px 14px 14px; column-width: 150px; column-gap: 24px; }
      .mobile-index nav > div { break-inside: avoid; margin-bottom: 10px; }
      .mobile-index-title { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
      .mobile-index nav a { display: block; padding: 4px 0; color: var(--muted); text-decoration: none; font-size: 0.9rem; }
      .mobile-index nav a:hover { color: var(--ink); }
    }

    @media (max-width: 620px) {
      html { scroll-padding-top: 142px; }
      .page { padding: 16px 12px 46px; }
      .intro { padding: 14px 4px 22px; gap: 20px; }
      .counter { min-width: 0; padding: 12px 14px; }
      .counter strong { font-size: 2rem; }
      .toolbar {
        top: 0;
        grid-template-columns: 1fr;
        margin: 12px 0 22px;
        padding: 8px;
      }
      .match-count { text-align: left; }
      .category-block { margin-bottom: 38px; }
      .category-head { padding: 0 4px; }
      .category-head span { display: none; }
      .diagram-card { border-radius: 15px; margin-bottom: 14px; }
      .card-head { grid-template-columns: 1fr; gap: 13px; }
      .card-actions { justify-content: flex-start; }
      .good-for { gap: 7px; }
      .good-for::before { width: 100%; }
      .good-for li { width: 100%; }
      .good-for li:not(:last-child)::after { display: none; }
      .good-for li::before { content: "—"; color: var(--accent); }
      .diagram-stage { min-height: 235px; padding: 14px; }
      .diagram-stage svg { max-height: 540px; }
      pre { font-size: 0.75rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
    }
  </style>
  <noscript>
    <style>
      .js-only, .rendering, .zoom-overlay, .zoom-btn { display: none !important; }
      .diagram-stage { cursor: default; min-height: 60px; }
    </style>
  </noscript>
</head>
<body>
  <main class="page">
    <section class="intro" aria-labelledby="page-title">
      <div>
        <h1 id="page-title">Every Mermaid diagram, one page.</h1>
        <p>Twenty-three Mermaid v11 diagram types—from flowcharts and sequence diagrams to architecture, Sankey, radar, and treemap—each with a working example and copyable source. Paste your own code in the scratchpad to render it live.</p>
      </div>
      <div class="counter" aria-label="%%N%% diagram types">
        <strong id="type-count">%%N%%</strong>
        <span>diagram types · Mermaid v11</span>
      </div>
    </section>

    <div class="toolbar" aria-label="Gallery controls">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>
        <label class="sr-only" for="search" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">Search diagram types</label>
        <input id="search" type="search" placeholder="Search diagrams or use cases…  ( / )" autocomplete="off" />
        <button class="search-clear" type="button" aria-label="Clear search">×</button>
      </div>
      <span class="match-count" id="match-count" aria-live="polite">%%N%% / %%N%%</span>
      <button class="theme-toggle" type="button" id="theme-toggle" aria-label="Cycle colour theme">Theme: auto</button>
      <div class="filter-list" aria-label="Filter by category">
        <button class="filter active" type="button" data-filter="all">All %%N%%</button>
%%CAT_FILTERS%%
      </div>
      <select id="mobile-filter" aria-label="Filter by category">
        <option value="all">All %%N%% types</option>
%%CAT_OPTIONS%%
      </select>
    </div>

    <details class="mobile-index" id="mobile-index">
      <summary>Diagram index</summary>
      <nav aria-label="Diagram index (mobile)">
%%MOBILE_INDEX%%
      </nav>
    </details>

    <section class="scratchpad" id="scratchpad" aria-label="Scratchpad">
      <header class="scratch-head">
        <div>
          <h2>Scratchpad</h2>
          <p>Paste or edit any Mermaid code — it renders as you type and is saved in this browser. Ctrl/⌘+Enter forces a re-render, Tab indents.</p>
        </div>
        <label class="scratch-start">Start from
          <select id="scratch-start">%%START_OPTS%%</select>
        </label>
      </header>
      <textarea id="scratch-code" spellcheck="false" rows="8" placeholder="flowchart TD&#10;    A[Paste code] --> B{Renders?}&#10;    B -->|Yes| C[Copy or download]&#10;    B -->|No| D[Fix the syntax]"></textarea>
      <div class="scratch-bar">
        <span id="scratch-status" role="status"></span>
        <span class="scratch-hint">Drag the editor's corner to resize</span>
        <span class="grow"></span>
        <button type="button" id="scratch-copy">Copy code</button>
        <button type="button" id="scratch-clear">Clear</button>
      </div>
      <div class="diagram-stage" id="scratch-stage" aria-label="Scratchpad render">
        <div class="render-target" id="scratch-render"><span class="rendering">Nothing to render yet — paste Mermaid code above.</span></div>
      </div>
    </section>

    <div class="layout">
      <aside class="sidebar" aria-label="Diagram index">
        <p class="side-heading">Diagram index</p>
        <nav id="sidebar-nav">
%%SIDENAV%%
        </nav>
      </aside>
      <div class="gallery" id="gallery">
%%CAT_BLOCKS%%
      </div>
    </div>

    <div class="empty-state" id="empty-state" role="status">
      <strong>No matching diagrams</strong>
      Try a different term or choose another category.
    </div>

    <p class="footnote"><strong>Scope note.</strong> These %%N%% examples were syntax-checked with Mermaid 11.17.2, which is bundled with this page (<code>vendor/mermaid.min.js</code>)—no third-party requests. ZenUML is not included because it requires an experimental configuration; the final “Info” example is a diagnostic that displays the Mermaid version currently running.</p>
  </main>

  <div class="zoom-overlay" id="zoom-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="zoom-title">
    <div class="zoom-top">
      <h2 id="zoom-title">Diagram</h2>
      <div class="zoom-controls">
        <button type="button" id="zoom-out" aria-label="Zoom out">−</button>
        <span id="zoom-pct">100%</span>
        <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
        <button type="button" id="zoom-fit">Fit</button>
        <button type="button" id="zoom-close" aria-label="Close zoom view">✕ Close</button>
      </div>
    </div>
    <div class="zoom-scroll" id="zoom-scroll"></div>
  </div>

  <script src="vendor/mermaid.min.js"></script>
  <script>
    "use strict";
    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const cards = $$(".diagram-card");
    const gallery = $("#gallery");
    const nav = $("#sidebar-nav");
    const filterList = $(".filter-list");
    const mobileFilter = $("#mobile-filter");
    const searchInput = $("#search");
    const searchClear = $(".search-clear");
    const matchCount = $("#match-count");
    const emptyState = $("#empty-state");
    const scratch = $("#scratch-code");
    const scratchTarget = $("#scratch-render");
    const scratchStatus = $("#scratch-status");
    const overlay = $("#zoom-overlay");
    const zoomScroll = $("#zoom-scroll");
    const themeBtn = $("#theme-toggle");
    let activeCategory = "all";
    let scratchTimer = null;
    let scratchCycle = 0;
    let zoomBase = null;
    let zoomScale = 1;

    const escapeHtml = value => String(value).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
    const cardById = id => document.getElementById(id);
    const codeOf = card => card.querySelector("pre code").textContent;
    const flash = (button, message, ms) => {
      const label = button.querySelector("span:not(:empty)");
      if (!label) return;
      const previous = label.textContent;
      label.textContent = message;
      setTimeout(() => { label.textContent = previous; }, ms || 1600);
    };

    function mermaidConfig() {
      return {
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: '"Avenir Next", "Segoe UI", Helvetica, sans-serif',
        themeVariables: {
          background: "#fbfdfd",
          primaryColor: "#d8f1ed",
          primaryTextColor: "#172225",
          primaryBorderColor: "#067c72",
          lineColor: "#506a6e",
          secondaryColor: "#e7eff0",
          tertiaryColor: "#fff3d6",
          clusterBkg: "#edf4f4",
          clusterBorder: "#8da5a8",
          titleColor: "#172225",
          edgeLabelBackground: "#fbfdfd",
          fontSize: "15px",
          pie1: "#087c72",
          pie2: "#e37726",
          pie3: "#5b748d",
          pie4: "#d2ab37",
          pie5: "#9b6b80"
        },
        flowchart: { htmlLabels: true, curve: "basis" },
        sequence: { useMaxWidth: true, diagramMarginX: 20, diagramMarginY: 20 },
        gantt: { useMaxWidth: true },
        c4: { useMaxWidth: true }
      };
    }

    function mermaidDown() {
      $$(".render-target").forEach(el => {
        el.innerHTML = '<div class="render-error"><strong>Mermaid could not load.</strong><br>Check the network connection and reload this page.</div>';
      });
      scratchStatus.textContent = "Mermaid failed to load";
    }

    /* mermaid.render is not concurrency-safe (shared temp state) — serialize */
    let renderQueue = Promise.resolve();
    function renderCard(card) {
      if (card.dataset.rendered || !window.mermaid) return;
      card.dataset.rendered = "1";
      renderQueue = renderQueue.then(async () => {
        const target = $(".render-target", card);
        try {
          const result = await mermaid.render(`mg-card-${card.id}`, codeOf(card));
          target.innerHTML = result.svg;
          if (result.bindFunctions) result.bindFunctions(target);
          const svg = target.querySelector("svg");
          if (svg) {
            svg.removeAttribute("height");
            svg.setAttribute("role", "img");
            svg.setAttribute("aria-label", `${card.dataset.name} example`);
          }
        } catch (error) {
          target.innerHTML = `<div class="render-error"><strong>This diagram did not render.</strong><br>${escapeHtml(String(error.message || error))}</div>`;
        }
      });
      return renderQueue;
    }

    function observeRenders() {
      const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            renderCard(entry.target);
            io.unobserve(entry.target);
          }
        }
      }, { rootMargin: "700px 0px" });
      cards.forEach(card => io.observe(card));
      renderNearViewport();
    }

    /* rect-based fallback: IntersectionObserver delivery is unreliable in
       background/occluded tabs, so independently render anything near the fold */
    function renderNearViewport() {
      const limit = window.innerHeight + 900;
      for (const card of cards) {
        if (card.dataset.rendered || card.hidden) continue;
        const top = card.getBoundingClientRect().top;
        if (top < limit) renderCard(card);
      }
    }
    /* bounded sweep: guarantees near-viewport cards render regardless of
       IntersectionObserver/timer quirks in background or occluded tabs;
       costs one cheap 23-card loop per 700ms and stops when all are done */
    let sweeps = 0;
    const sweep = setInterval(() => {
      renderNearViewport();
      sweeps += 1;
      if (sweeps > 400 || !document.querySelector(".diagram-card:not([data-rendered])")) clearInterval(sweep);
    }, 700);

    /* ---------- scratchpad ---------- */
    function persistScratch() {
      try { localStorage.setItem("mg-scratch", JSON.stringify({ code: scratch.value, h: scratch.style.height })); } catch (_) {}
    }
    async function renderScratch() {
      const code = scratch.value.trim();
      if (!code) {
        scratchTarget.innerHTML = '<span class="rendering">Nothing to render yet — paste Mermaid code above.</span>';
        scratchStatus.textContent = "";
        return;
      }
      scratchStatus.textContent = "Rendering…";
      try {
        const result = await mermaid.render(`mg-scratch-${++scratchCycle}`, code);
        scratchTarget.innerHTML = result.svg;
        const svg = scratchTarget.querySelector("svg");
        if (svg) { svg.removeAttribute("height"); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Scratchpad diagram"); }
        scratchStatus.textContent = "Rendered";
      } catch (error) {
        scratchTarget.innerHTML = `<div class="render-error"><strong>Parse error.</strong><br>${escapeHtml(String(error.message || error))}</div>`;
        scratchStatus.textContent = "Parse error";
      }
    }
    const renderScratchSoon = () => { clearTimeout(scratchTimer); scratchTimer = setTimeout(renderScratch, 400); };

    function loadIntoScratch(code, id) {
      scratch.value = code;
      $("#scratch-start").value = id || "";
      persistScratch();
      renderScratch();
      scratchpad.scrollIntoView({ behavior: "smooth", block: "start" });
      scratch.focus({ preventScroll: true });
    }

    /* ---------- clipboard & export ---------- */
    async function copyText(text, button) {
      let copied = false;
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (_) {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
        area.remove();
      }
      if (copied) { flash(button, "Copied"); return true; }
      const panel = button.closest(".source-panel");
      if (panel) {
        panel.open = true;
        const pre = panel.querySelector("pre");
        const range = document.createRange();
        range.selectNodeContents(pre);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        flash(button, "Press Ctrl+C", 2600);
      }
      return false;
    }

    function svgOf(card) {
      const svg = $(".render-target svg", card);
      if (!svg) return null;
      const clone = svg.cloneNode(true);
      const vb = (svg.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
      const rect = svg.getBoundingClientRect();
      const w = Math.round(vb[2] || rect.width) || 800;
      const h = Math.round(vb[3] || rect.height) || 600;
      clone.setAttribute("width", w);
      clone.setAttribute("height", h);
      clone.removeAttribute("style");
      return { markup: new XMLSerializer().serializeToString(clone), w, h };
    }

    function downloadSvg(card) {
      const s = svgOf(card);
      if (!s) return false;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([s.markup], { type: "image/svg+xml;charset=utf-8" }));
      a.download = `${card.id}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      return true;
    }

    async function downloadPng(card, button) {
      const s = svgOf(card);
      if (!s) { flash(button, "Still rendering"); return; }
      try {
        const url = URL.createObjectURL(new Blob([s.markup], { type: "image/svg+xml;charset=utf-8" }));
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = s.w * scale;
        canvas.height = s.h * scale;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let inked = 0;
        for (let i = 0; i < data.length; i += 4) if (data[i] < 248 || data[i + 1] < 248 || data[i + 2] < 248) inked++;
        if (inked < data.length / 4 * 0.0005) throw new Error("raster came back blank");
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${card.id}.png`;
        a.click();
        flash(button, "PNG saved");
      } catch (_) {
        downloadSvg(card);
        flash(button, "SVG saved", 2200);
      }
    }

    /* ---------- zoom overlay ---------- */
    function applyZoom() {
      if (zoomBase) {
        const svg = zoomScroll.querySelector("svg");
        if (svg) svg.style.width = Math.round(zoomBase * zoomScale) + "px";
      }
      $("#zoom-pct").textContent = Math.round(zoomScale * 100) + "%";
    }
    function openZoom(card) {
      const svg = $(".render-target svg", card);
      if (!svg) { renderCard(card).then(() => openZoom(card)); return; }
      const s = svgOf(card);
      zoomScroll.innerHTML = "";
      const holder = document.createElement("div");
      holder.innerHTML = s.markup;
      const clone = holder.querySelector("svg");
      clone.removeAttribute("id");
      zoomScroll.appendChild(clone);
      $("#zoom-title").textContent = card.dataset.name;
      zoomBase = s.w;
      zoomScale = 1;
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      applyZoom();
      $("#zoom-close").focus();
    }
    function closeZoom() {
      overlay.hidden = true;
      zoomScroll.innerHTML = "";
      document.body.style.overflow = "";
    }
    const nudgeZoom = factor => {
      zoomScale = Math.min(5, Math.max(0.2, zoomScale * factor));
      applyZoom();
    };

    /* ---------- filters, search, url state ---------- */
    function syncUrl() {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("cat", activeCategory);
      const q = searchInput.value.trim();
      if (q) params.set("q", q);
      const s = params.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
    }
    function setFilterUI() {
      $$(".filter").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === activeCategory));
      mobileFilter.value = activeCategory;
    }
    function applyFilters() {
      const query = searchInput.value.trim().toLowerCase();
      let shown = 0;
      $$(".category-block").forEach(section => {
        let categoryShown = 0;
        section.querySelectorAll(".diagram-card").forEach(card => {
          const matchesCategory = activeCategory === "all" || section.dataset.category === activeCategory;
          const matchesSearch = !query || card.dataset.search.includes(query);
          const visible = matchesCategory && matchesSearch;
          card.hidden = !visible;
          if (visible) { shown++; categoryShown++; }
        });
        section.hidden = categoryShown === 0;
      });
      $$(".side-group").forEach(group => {
        const section = $(`.category-block[data-category="${group.dataset.navCategory}"]`);
        group.hidden = !section || section.hidden;
        group.querySelectorAll(".side-link").forEach(link => {
          const card = cardById(link.dataset.target);
          link.hidden = !card || card.hidden;
        });
      });
      emptyState.style.display = shown === 0 ? "block" : "none";
      searchClear.style.display = query ? "grid" : "none";
      matchCount.textContent = `${shown} / ${cards.length}`;
      syncUrl();
    }

    function revealHashTarget() {
      const id = location.hash.slice(1);
      if (!id) return;
      const card = cardById(id);
      if (card && card.hidden) {
        activeCategory = "all";
        searchInput.value = "";
        setFilterUI();
        applyFilters();
      }
    }

    /* ---------- theme ---------- */
    const THEMES = ["auto", "light", "dark"];
    function applyTheme(theme) {
      if (theme === "auto") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = theme;
      try { localStorage.setItem("mg-theme", theme); } catch (_) {}
      themeBtn.textContent = "Theme: " + theme;
    }

    /* ---------- wiring ---------- */
    document.addEventListener("click", event => {
      const filter = event.target.closest(".filter");
      if (filter) {
        activeCategory = filter.dataset.filter;
        setFilterUI();
        applyFilters();
      }

      const copy = event.target.closest("[data-copy]");
      if (copy) {
        const card = copy.closest(".diagram-card");
        if (card) copyText(codeOf(card), copy);
        return;
      }
      if (event.target.closest("#scratch-copy")) {
        copyText(scratch.value, $("#scratch-copy"));
        return;
      }

      const template = event.target.closest("[data-template]");
      if (template) {
        const card = cardById(template.dataset.template);
        if (card) loadIntoScratch(codeOf(card), card.id);
        return;
      }

      const svgCopy = event.target.closest("[data-svg]");
      if (svgCopy) {
        const card = cardById(svgCopy.dataset.svg);
        const s = card && svgOf(card);
        if (s) copyText(s.markup, svgCopy);
        else flash(svgCopy, "Still rendering");
        return;
      }

      const png = event.target.closest("[data-png]");
      if (png) {
        const card = cardById(png.dataset.png);
        if (card) downloadPng(card, png);
        return;
      }

      const zoomBtn = event.target.closest("[data-zoom]");
      if (zoomBtn) {
        const card = cardById(zoomBtn.dataset.zoom);
        if (card) openZoom(card);
        return;
      }
      const stage = event.target.closest(".gallery .diagram-stage, #scratch-stage");
      if (stage && event.target.closest("svg")) {
        const card = stage.closest(".diagram-card");
        if (card) openZoom(card);
        return;
      }
    });

    mobileFilter.addEventListener("change", () => {
      activeCategory = mobileFilter.value;
      setFilterUI();
      applyFilters();
    });

    searchInput.addEventListener("input", applyFilters);
    searchInput.addEventListener("keydown", event => {
      if (event.key === "Escape" && searchInput.value) {
        searchInput.value = "";
        applyFilters();
      }
    });
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      applyFilters();
      searchInput.focus();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        if (!overlay.hidden) { closeZoom(); return; }
        if (document.activeElement === searchInput && searchInput.value) {
          searchInput.value = "";
          applyFilters();
        }
        return;
      }
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const t = event.target;
        const typing = t.closest && (t.closest("input, textarea, select") || t.isContentEditable);
        if (!typing) {
          event.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    scratch.addEventListener("input", () => { persistScratch(); renderScratchSoon(); });
    scratch.addEventListener("keydown", event => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        clearTimeout(scratchTimer);
        renderScratch();
      } else if (event.key === "Tab") {
        event.preventDefault();
        const start = scratch.selectionStart;
        const end = scratch.selectionEnd;
        scratch.value = scratch.value.slice(0, start) + "  " + scratch.value.slice(end);
        scratch.selectionStart = scratch.selectionEnd = start + 2;
      }
    });
    scratch.addEventListener("mouseup", persistScratch);
    $("#scratch-clear").addEventListener("click", () => {
      scratch.value = "";
      persistScratch();
      scratchTarget.innerHTML = '<span class="rendering">Nothing to render yet — paste Mermaid code above.</span>';
      scratchStatus.textContent = "";
      scratch.focus();
    });
    $("#scratch-start").addEventListener("change", event => {
      const card = cardById(event.target.value);
      if (card) loadIntoScratch(codeOf(card), card.id);
    });

    $("#zoom-close").addEventListener("click", closeZoom);
    $("#zoom-in").addEventListener("click", () => nudgeZoom(1.25));
    $("#zoom-out").addEventListener("click", () => nudgeZoom(1 / 1.25));
    $("#zoom-fit").addEventListener("click", () => {
      const svg = zoomScroll.querySelector("svg");
      if (!svg) return;
      const natural = zoomBase || 800;
      zoomScale = Math.min(1, (zoomScroll.clientWidth - 48) / natural);
      applyZoom();
    });
    zoomScroll.addEventListener("wheel", event => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      nudgeZoom(event.deltaY < 0 ? 1.15 : 1 / 1.15);
    }, { passive: false });
    overlay.addEventListener("click", event => {
      if (event.target === overlay || event.target === zoomScroll) closeZoom();
    });

    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "auto";
      applyTheme(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]);
    });

    window.addEventListener("hashchange", revealHashTarget);

    /* ---------- init ---------- */
    (function init() {
      $("#type-count").textContent = cards.length;
      const allBtn = $('.filter[data-filter="all"]');
      if (allBtn) allBtn.textContent = `All ${cards.length}`;
      mobileFilter.options[0].textContent = `All ${cards.length} types`;

      let theme = "auto";
      try { theme = localStorage.getItem("mg-theme") || "auto"; } catch (_) {}
      applyTheme(theme);

      const params = new URLSearchParams(location.search);
      if (params.get("cat")) activeCategory = params.get("cat");
      const q = params.get("q");
      if (q) searchInput.value = q;
      setFilterUI();
      applyFilters();
      revealHashTarget();

      try {
        const saved = JSON.parse(localStorage.getItem("mg-scratch") || "null");
        if (saved && typeof saved.code === "string" && saved.code.trim()) {
          scratch.value = saved.code;
          if (saved.h) scratch.style.height = saved.h;
        }
      } catch (_) {}

      const activeNav = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          $$(".side-link").forEach(link => link.classList.toggle("active", link.dataset.target === entry.target.id));
        });
      }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
      cards.forEach(card => activeNav.observe(card));

      if (!window.mermaid) { mermaidDown(); return; }
      mermaid.initialize(mermaidConfig());
      observeRenders();
      if (scratch.value.trim()) renderScratch();
    })();
  </script>
</body>
</html>
'''

build()
