"""Run axe-core (WCAG 2 A/AA) over representative pages in light and dark. Usage: python3 scripts/a11y.py AXE_JS [BASE]"""
import sys, json
from playwright.sync_api import sync_playwright
AXE = sys.argv[1]
BASE = (sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:8123/TheBlackCat").rstrip("/")
PAGES = ["/", "/library/", "/library/ai/opencontext/", "/library/ai/skills/grill-me/", "/projects/", "/projects/quickdash/",
         "/blog/", "/docs/", "/docs/website-analyzer/02-processing-nodes/", "/collections/", "/tags/", "/contenttype/skill/", "/404.html"]
total = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for scheme in ("light", "dark"):
        ctx = b.new_context(viewport={"width": 1280, "height": 900}, color_scheme=scheme)
        pg = ctx.new_page()
        for path in PAGES:
            pg.goto(BASE + path, wait_until="networkidle")
            pg.add_script_tag(path=AXE)
            res = pg.evaluate("axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})")
            for v in res["violations"]:
                total += len(v["nodes"])
                print(f"[{scheme}] {path}: {v['id']} ({v['impact']}) x{len(v['nodes'])} - {v['help']}")
                for n in v["nodes"][:2]:
                    print("      ", n["target"], (n.get("failureSummary") or "")[:160].replace("\n", " "))
        ctx.close()
    b.close()
print("violations:", total)
sys.exit(1 if total else 0)
