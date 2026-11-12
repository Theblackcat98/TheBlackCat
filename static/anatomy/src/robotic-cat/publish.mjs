// Package static/anatomy/src/robotic-cat/robotic-cat.html into the self-contained
// public site page at static/anatomy/robotic-cat/index.html with navigation,
// theme persistence (bc-theme), interactive control bar, and ?preset= deep links.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const SRC_HTML = join(HERE, "robotic-cat.html");
const OUT_HTML = join(ROOT, "robotic-cat", "index.html");

const META_HEAD = `
<meta name="description" content="FELIS-09: an interactive isometric bionic quadruped with 3-link digitigrade pantograph legs, parallel Achilles tendon springs, an arching vertebral spine, slit-pupil optics, swiveling pinnae, and a 7-segment whip tail.">
<meta property="og:title" content="FELIS-09 · Bionic Feline Quadruped — Anatomy">
<meta property="og:description" content="Interactive isometric cutaway of a 9.6 kg biomimetic robotic cat on a pounce-and-balance rig with 4 piezo force plates and an optical prey lure.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://theblackcat98.github.io/TheBlackCat/anatomy/robotic-cat/">
<meta property="og:image" content="https://theblackcat98.github.io/TheBlackCat/anatomy/thumbs/robotic-cat.webp">
<meta name="twitter:card" content="summary_large_image">`.trim();

const UX_STYLE = `
<style data-anatomy-ux>
.iso-page { width: min(760px, 100% - 32px) !important; margin: 28px auto 72px !important; }
.anatomy-head {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px 16px; margin-bottom: 14px;
  font-size: 13px; color: var(--anatomy-muted);
}
.anatomy-back {
  color: var(--anatomy-ink); text-decoration: none;
  border-bottom: 1px solid var(--anatomy-border); padding-bottom: 1px;
}
.anatomy-back:hover { border-bottom-color: var(--anatomy-lit); color: var(--anatomy-lit); }
.anatomy-pos { font-variant-numeric: tabular-nums; }
.anatomy-nav { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
.anatomy-nav a { color: var(--anatomy-muted); text-decoration: none; }
.anatomy-nav a:hover { color: var(--anatomy-ink); }
.anatomy-themes {
  display: inline-flex; border: 1px solid var(--anatomy-border);
  border-radius: 999px; padding: 2px; gap: 2px;
}
.anatomy-theme {
  background: transparent; color: var(--anatomy-muted); border: 0;
  border-radius: 999px; padding: 3px 10px; font: inherit; font-size: 12px; cursor: pointer;
}
.anatomy-theme[aria-pressed="true"] {
  background: var(--anatomy-surface, rgba(255,255,255,0.08));
  color: var(--anatomy-ink);
}
body[data-theme="light"] .anatomy-theme[aria-pressed="true"] {
  background: rgba(15, 23, 32, 0.08);
}
.anatomy-help { margin: 12px 0 10px; font-size: 13px; color: var(--anatomy-muted); line-height: 1.5; }
.anatomy-controls { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
.anatomy-btn {
  appearance: none; background: transparent; color: var(--anatomy-ink);
  border: 1px solid var(--anatomy-border); border-radius: 6px;
  padding: 5px 10px; font: inherit; font-size: 12px; cursor: pointer;
  line-height: 1.3;
}
.anatomy-btn:hover { border-color: var(--anatomy-lit); color: var(--anatomy-lit); }
.anatomy-btn[aria-pressed="true"] {
  background: var(--anatomy-lit); color: var(--anatomy-page); border-color: var(--anatomy-lit);
  font-weight: 600;
}
.anatomy-sep { width: 1px; height: 18px; background: var(--anatomy-border); margin: 0 2px; }
@media (max-width: 560px) {
  .iso-page { margin: 16px auto 52px !important; }
  .anatomy-head { font-size: 12px; }
}
</style>`.trim();

const THEME_INIT = `
<script data-anatomy-theme-init>
(() => {
  try {
    const q = new URLSearchParams(location.search).get("theme");
    let saved = null;
    try { saved = localStorage.getItem("bc-theme"); } catch {}
    const sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const t = q === "light" || q === "dark" ? q : (saved === "light" || saved === "dark" ? saved : sys);
    document.body.setAttribute("data-theme", t);
  } catch {}
})();
</script>`.trim();

const ANATOMY_HEAD = `
<header class="anatomy-head">
  <a class="anatomy-back" href="../">← All machines</a>
  <span class="anatomy-pos">Anatomy · Fig 5 of 6</span>
  <nav class="anatomy-nav" aria-label="Figures">
    <a href="../flame-licker/" rel="prev">← Flame-licker</a>
    <a href="../pneumatic-impact-gun/" rel="next">Impact wrench →</a>
  </nav>
  <span class="anatomy-themes" role="group" aria-label="Theme">
    <button class="anatomy-theme" type="button" data-set-theme="dark" aria-pressed="false">Dark</button>
    <button class="anatomy-theme" type="button" data-set-theme="light" aria-pressed="false">Light</button>
  </span>
</header>`.trim();

const CONTROLS_HTML = `
<p class="anatomy-help">Live interactive diagram — drag or hover to aim the prey lure, click to pounce, or use the presets below.</p>
<div class="anatomy-controls" role="group" aria-label="Diagram controls">
  <button class="anatomy-btn" type="button" data-anatomy-key="ArrowLeft">Target left</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="ArrowRight">Target right</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="ArrowUp">Crouch −</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="ArrowDown">Crouch +</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="Enter">Pounce</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="Escape">Reset</button>
  <span class="anatomy-sep" aria-hidden="true"></span>
  <button class="anatomy-btn" type="button" data-anatomy-key="1" data-anatomy-group="preset" aria-pressed="false">1 · Prowl Scan</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="2" data-anatomy-group="preset" aria-pressed="false">2 · Stalk Left</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="3" data-anatomy-group="preset" aria-pressed="false">3 · Ambush Right</button>
  <button class="anatomy-btn" type="button" data-anatomy-key="4" data-anatomy-group="preset" aria-pressed="false">4 · Deep Coil</button>
</div>`.trim();

const UX_SCRIPT = `
<script type="module" data-anatomy-ux>
(() => {
  const stage = document.querySelector("[data-live]");
  const themeBtns = [...document.querySelectorAll("[data-set-theme]")];
  const presetBtns = [...document.querySelectorAll('[data-anatomy-group="preset"]')];

  function applyTheme(t, persist = false) {
    document.body.setAttribute("data-theme", t);
    themeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setTheme === t)));
    if (persist) {
      try { localStorage.setItem("bc-theme", t); } catch {}
      const u = new URL(location.href);
      u.searchParams.set("theme", t);
      history.replaceState(null, "", u);
    }
  }
  applyTheme(document.body.getAttribute("data-theme") || "dark", false);
  themeBtns.forEach((b) => b.addEventListener("click", () => applyTheme(b.dataset.setTheme, true)));

  function markPreset(k) {
    presetBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.anatomyKey === k)));
  }

  function press(key) {
    if (!stage) return;
    stage.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    if (/^[1-4]$/.test(key)) {
      markPreset(key);
      const u = new URL(location.href);
      u.searchParams.set("preset", key);
      history.replaceState(null, "", u);
    } else if (key === "Escape" || key === "Home") {
      markPreset("");
      const u = new URL(location.href);
      u.searchParams.delete("preset");
      history.replaceState(null, "", u);
    }
  }

  document.querySelectorAll("[data-anatomy-key]").forEach((btn) => {
    btn.addEventListener("click", () => press(btn.dataset.anatomyKey));
  });

  if (stage) {
    stage.addEventListener("keydown", (ev) => {
      if (/^[1-4]$/.test(ev.key)) markPreset(ev.key);
      else if (ev.key === "Escape" || ev.key === "Home") markPreset("");
    });
  }

  const initPreset = new URLSearchParams(location.search).get("preset");
  if (initPreset && /^[1-4]$/.test(initPreset)) {
    requestAnimationFrame(() => press(initPreset));
  }
})();
</script>`.trim();

let html = readFileSync(SRC_HTML, "utf8");
html = html.replace("</head>", `${META_HEAD}\n${UX_STYLE}\n</head>`);
html = html.replace('<main class="iso-page">', `${THEME_INIT}\n<main class="iso-page">\n${ANATOMY_HEAD}`);
html = html.replace("</figure>", `</figure>\n${CONTROLS_HTML}`);
const bodyClose = html.lastIndexOf("</body>");
if (bodyClose === -1) throw new Error("Missing closing </body> tag in source HTML");
html = `${html.slice(0, bodyClose)}${UX_SCRIPT}\n${html.slice(bodyClose)}`;

mkdirSync(dirname(OUT_HTML), { recursive: true });
writeFileSync(OUT_HTML, html, "utf8");
console.log(`published ${OUT_HTML}`);
