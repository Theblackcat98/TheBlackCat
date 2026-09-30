"""Render key pages of the built site to PNGs (light/dark, desktop/mobile) so layout bugs are visible.
curl cannot see a CSS gap; pixels can. Usage: python3 scripts/shots.py [outdir] [base]"""
import sys, os
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else "shots"
BASE = (sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:8123/TheBlackCat").rstrip("/")
os.makedirs(OUT, exist_ok=True)

PAGES = {
    "home": "/",
    "library": "/library/",
    "skill": "/library/ai/skills/grill-me/",
    "bookmark": "/library/ai/opencontext/",
    "projects": "/projects/",
    "project": "/projects/quickdash/",
    "blog": "/blog/",
    "docs": "/docs/",
    "chapter": "/docs/website-analyzer/02-processing-nodes/",
    "collections": "/collections/",
    "tags": "/tags/",
    "notfound": "/nope/",
}

def shoot(page, name, full=True):
    page.wait_for_timeout(350)
    page.screenshot(path=f"{OUT}/{name}.png", full_page=full)

with sync_playwright() as p:
    b = p.chromium.launch()
    for scheme, vp, tag in [("light", (1280, 900), "d"), ("dark", (1280, 900), "d"), ("light", (390, 844), "m"), ("dark", (390, 844), "m")]:
        ctx = b.new_context(viewport={"width": vp[0], "height": vp[1]}, color_scheme=scheme, device_scale_factor=1 if tag == "d" else 2)
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        for name, path in PAGES.items():
            if tag == "m" and scheme == "dark" and name not in ("home", "chapter", "library"):
                continue
            pg.goto(BASE + path, wait_until="networkidle")
            shoot(pg, f"{name}-{scheme}-{tag}")
        # interactive states (light only, desktop + mobile)
        if scheme == "light":
            pg.goto(BASE + "/", wait_until="networkidle")
            pg.keyboard.press("Control+k")
            pg.keyboard.type("agent")
            shoot(pg, f"search-{scheme}-{tag}", full=False)
            pg.keyboard.press("Escape")
            pg.goto(BASE + "/library/", wait_until="networkidle")
            pg.click('[data-filter="type"][data-value="skill"]')
            shoot(pg, f"library-skills-{scheme}-{tag}", full=False)
        if errs:
            print(scheme, tag, "JS/console errors:", errs[:5])
        ctx.close()
    b.close()
print("ok")
