"""Exercise the JS behaviours in a real browser and fail loudly if any is broken."""
import sys, os
from playwright.sync_api import sync_playwright
BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8123/TheBlackCat").rstrip("/")
OUT = sys.argv[2] if len(sys.argv) > 2 else "shots"
os.makedirs(OUT, exist_ok=True)
fails = []
def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))
    if not cond: fails.append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, color_scheme="light")
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE.split("/TheBlackCat")[0])
    pg = ctx.new_page()

    # theme toggle + persistence
    pg.goto(BASE + "/", wait_until="networkidle")
    pg.click("#theme-toggle")
    check("theme toggle sets data-theme=dark", pg.evaluate("document.documentElement.dataset.theme") == "dark")
    pg.reload(wait_until="networkidle")
    check("theme persists after reload", pg.evaluate("document.documentElement.dataset.theme") == "dark")
    bg = pg.evaluate("getComputedStyle(document.body).backgroundColor")
    check("dark background is applied", bg.startswith("rgb(21, 18, 15)"), bg)
    pg.click("#theme-toggle")

    # search: open by button, by shortcut, results, keyboard nav, navigation
    pg.click(".hero-search")
    check("search dialog opens", pg.evaluate("document.getElementById('search').open"))
    pg.keyboard.type("grill")
    pg.wait_for_selector(".search__hit")
    n = pg.locator(".search__hit").count()
    check("search returns hits for 'grill'", n >= 1, n)
    pg.keyboard.press("ArrowDown")
    with pg.expect_navigation():
        pg.keyboard.press("Enter")
    check("Enter navigates to the selected hit", "/library/ai/skills/" in pg.url, pg.url)
    pg.keyboard.press("Escape")
    pg.keyboard.press("Control+k")
    check("Ctrl+K opens search", pg.evaluate("document.getElementById('search').open"))
    pg.keyboard.type("zzzzqq")
    check("no-result message shown", pg.locator(".search__empty").count() == 1)
    pg.keyboard.press("Escape")
    pg.keyboard.press("/")
    check("'/' opens search", pg.evaluate("document.getElementById('search').open"))
    pg.keyboard.press("Escape")

    # library filters
    pg.goto(BASE + "/library/", wait_until="networkidle")
    total = pg.locator("[data-filter-list] > li").count()
    pg.click('[data-filter="type"][data-value="skill"]')
    vis = pg.locator("[data-filter-list] > li:visible").count()
    check("type chip filters to skills", 0 < vis < total, f"{vis}/{total}")
    check("URL reflects filter", "type=skill" in pg.url, pg.url)
    pg.fill("[data-filter-q]", "review")
    vis2 = pg.locator("[data-filter-list] > li:visible").count()
    check("text filter narrows further", 0 < vis2 < vis, f"{vis2}")
    pg.click("[data-filter-reset]") if pg.locator("[data-filter-reset]").is_visible() else pg.fill("[data-filter-q]", "")
    pg.select_option("[data-filter-sort]", "az")
    titles = pg.eval_on_selector_all("[data-filter-list] > li:visible", "els => els.map(e => e.dataset.title)")
    check("A-Z sort orders titles", titles == sorted(titles), titles[:4])
    pg.goto(BASE + "/library/?type=bookmark&q=voice", wait_until="networkidle")
    check("filters restore from URL", 0 < pg.locator("[data-filter-list] > li:visible").count() < total)

    # project filter + sort
    pg.goto(BASE + "/projects/", wait_until="networkidle")
    pg.click('[data-filter="tag"][data-value="python"]')
    check("project tag filter works", 0 < pg.locator("[data-filter-list] > li:visible").count() < 16)

    # code copy + toc spy on a docs chapter
    pg.goto(BASE + "/docs/website-analyzer/02-processing-nodes/", wait_until="networkidle")
    check("code blocks are wrapped", pg.locator(".codeblock").count() >= 1)
    pg.locator(".codeblock__copy").first.click()
    clip = pg.evaluate("navigator.clipboard.readText()")
    check("copy button copies code", len(clip) > 10, clip[:40])
    pg.locator(".codeblock").first.scroll_into_view_if_needed()
    pg.locator(".codeblock").first.screenshot(path=f"{OUT}/codeblock-light.png")
    pg.evaluate("document.getElementById(decodeURIComponent(document.querySelectorAll('.article-aside .toc a')[2].hash.slice(1))).scrollIntoView()")
    pg.wait_for_timeout(400)
    check("TOC scroll-spy marks a section", pg.locator(".article-aside .toc a[aria-current]").count() == 1)
    n_tokens = pg.locator(".chroma span[class]").count()
    check("syntax highlighting emits tokens", n_tokens > 5, n_tokens)
    pg.emulate_media(color_scheme="dark")
    pg.evaluate("document.documentElement.dataset.theme='dark'")
    pg.locator(".codeblock").first.screenshot(path=f"{OUT}/codeblock-dark.png")

    # no-JS fallback: content visible, toolbar hidden
    ctx2 = b.new_context(java_script_enabled=False, viewport={"width": 1280, "height": 900})
    p2 = ctx2.new_page()
    p2.goto(BASE + "/library/", wait_until="load")
    check("no-JS: all library rows visible", p2.locator("[data-filter-list] > li:visible").count() == total)
    check("no-JS: filter toolbar hidden", not p2.locator(".facets").is_visible())
    b.close()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)
