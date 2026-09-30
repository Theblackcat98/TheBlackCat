"""Render static/og.png (1200x630), the fallback social-preview card. Usage: python3 scripts/og.py
Edit the copy below (or hugo.yaml params.hero) and re-run; the PNG is committed."""
import pathlib, re
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
fonts = (root / "static/fonts").as_uri()
svg = (root / "static/favicon.svg").read_text()
title = "A quiet library of things worth keeping."
sub = "Bookmarks · Skills · Research · Projects"

html = f"""<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:N;src:url({fonts}/newsreader-latin-opsz-normal.woff2);font-weight:200 800}}
@font-face{{font-family:M;src:url({fonts}/jetbrains-mono-latin-wght-normal.woff2);font-weight:100 800}}
*{{margin:0;box-sizing:border-box}}
body{{width:1200px;height:630px;background:#f7f3ea;color:#1c1915;font-family:N,serif;position:relative;overflow:hidden;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}}
body:before{{content:"";position:absolute;inset:28px;border:1px solid #d9d0bb;border-radius:20px}}
.top{{display:flex;align-items:center;gap:20px;position:relative}}
.top svg{{width:64px;height:64px}}
.top b{{font:600 30px/1 M,monospace;letter-spacing:-.01em}}
h1{{font-weight:500;font-size:96px;line-height:1.02;letter-spacing:-.03em;max-width:930px;position:relative;text-wrap:balance}}
.foot{{display:flex;justify-content:space-between;white-space:nowrap;font:500 22px/1 M,monospace;letter-spacing:.06em;text-transform:uppercase;color:#6b6252;position:relative}}
.foot i{{font-style:normal;color:#9a4707}}
</style>
<div class=top>{svg}<b>The BlackCat</b></div>
<h1>{title}</h1>
<div class=foot><span>{sub}</span><i>theblackcat98.github.io/TheBlackCat</i></div>"""

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.set_content(html, wait_until="load")
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(300)
    pg.screenshot(path=str(root / "static/og.png"))
    b.close()
print("wrote static/og.png")
