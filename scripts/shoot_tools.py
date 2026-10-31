#!/usr/bin/env python3
"""Capture 1280x800 light and dark screenshots of every tool in data/tools.yaml
and resize them to 640x400 WebP thumbnails in static/toolkit/thumbs/<id>-{light,dark}.webp.

Usage: python3 scripts/shoot_tools.py [tool-id ...]"""
import io, os, sys, subprocess, tempfile, time
import yaml
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

OUT_DIR = os.path.join(ROOT, "static", "toolkit", "thumbs")
os.makedirs(OUT_DIR, exist_ok=True)

reg = yaml.safe_load(open("data/tools.yaml", encoding="utf-8"))
only = set(sys.argv[1:])
tools = [t for t in reg["tools"] if not only or t["id"] in only]

PORT = int(os.environ.get("PORT", "8129"))
BASE = f"http://127.0.0.1:{PORT}/TheBlackCat"


def save_webp(png_bytes, out_path):
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    img = img.resize((640, 400), Image.Resampling.LANCZOS)
    img.save(out_path, format="WEBP", quality=82, method=4)


with tempfile.TemporaryDirectory() as tmp:
    build_dir = os.path.join(tmp, "TheBlackCat")
    subprocess.run(
        ["hugo", "--gc", "--minify", "--baseURL", f"{BASE}/", "-d", build_dir],
        check=True,
        stdout=subprocess.DEVNULL,
    )
    srv = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1", "-d", tmp],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(0.8)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for scheme in ("light", "dark"):
                ctx = browser.new_context(
                    viewport={"width": 1280, "height": 800},
                    color_scheme=scheme,
                    device_scale_factor=1,
                )
                page = ctx.new_page()
                page.add_init_script(f"try {{ localStorage.setItem('bc-theme', '{scheme}'); }} catch (_) {{}}")
                for t in tools:
                    tid = t["id"]
                    url = t["url"]
                    target = url if url.startswith("http") else f"{BASE}/{url.lstrip('/')}"
                    out_file = os.path.join(OUT_DIR, f"{tid}-{scheme}.webp")
                    try:
                        page.goto(target, wait_until="load", timeout=8000)
                    except Exception:
                        try:
                            page.goto(target, wait_until="domcontentloaded", timeout=5000)
                        except Exception:
                            pass
                    page.evaluate(
                        f"document.documentElement.dataset.theme = '{scheme}'; "
                        f"document.documentElement.classList.toggle('dark', '{scheme}' === 'dark'); "
                        f"window.dispatchEvent(new Event('themechange'));"
                    )
                    page.wait_for_timeout(180)
                    png = page.screenshot(full_page=False)
                    save_webp(png, out_file)
                    print(f"shot {tid}-{scheme}.webp")
                ctx.close()
            browser.close()
    finally:
        srv.terminate()
        srv.wait()
print(f"done: {len(tools) * 2} thumbnails in static/toolkit/thumbs/")
