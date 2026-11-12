import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC_HTML = path.join(DIR, "pneumatic-impact-gun.html");
const OUT_HTML = path.resolve(DIR, "../../pneumatic-impact-gun/index.html");

const META_HEAD = `<meta name="description" content="A pneumatic impact wrench cutaway on a test bench: FRL air prep feeds a six-vane air motor and twin-hammer clutch delivering high-torque blows to an anvil, impact socket, and hydraulic load-cell dyno.">
<meta property="og:title" content="Pneumatic impact wrench · Anatomy">
<meta property="og:description" content="A pneumatic impact wrench cutaway on a test bench: FRL air prep feeds a six-vane air motor and twin-hammer clutch delivering high-torque blows to an anvil, impact socket, and hydraulic load-cell dyno.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://theblackcat98.github.io/TheBlackCat/anatomy/pneumatic-impact-gun/">
<meta property="og:image" content="https://theblackcat98.github.io/TheBlackCat/anatomy/thumbs/pneumatic-impact-gun.webp">`;

const UX_STYLE = `<style data-anatomy-ux>
body.iso[data-theme="light"]{color-scheme:light}
body.iso .iso-page{width:min(720px,100% - 32px);margin:40px auto 72px}
body.iso .iso-plate-corner{font-size:11px}
@media (max-width:560px){body.iso .iso-plate-corner{font-size:10px}}
body.iso .iso-legend{font-size:14px;line-height:1.6}
body.iso .iso-stage{touch-action:none}
.anatomy-head{margin:0 0 18px;font-family:var(--anatomy-mono)}
.anatomy-nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;padding:10px 0;border-bottom:1px solid var(--anatomy-faint);font-size:13px}
.anatomy-nav a{color:var(--anatomy-strong);text-decoration:none;display:inline-flex;align-items:center;min-height:44px}
.anatomy-nav a:hover{text-decoration:underline}
.anatomy-nav__brand{color:var(--anatomy-muted);font-size:12.5px;letter-spacing:.06em;text-transform:uppercase}
.anatomy-nav__pager{display:inline-flex;gap:16px}
.anatomy-intro h1{font-size:22px;line-height:1.25;color:var(--anatomy-strong);margin:14px 0 6px}
.anatomy-intro p{margin:0;color:var(--anatomy-text);font-size:14px;line-height:1.55;max-width:62ch}
.anatomy-theme{display:flex;align-items:center;gap:6px;margin-top:12px;color:var(--anatomy-muted);font-size:12.5px}
.anatomy-theme button{min-height:44px;padding:8px 16px;border:1px solid var(--anatomy-lo);border-radius:999px;background:var(--anatomy-paper);color:var(--anatomy-text);font:inherit;cursor:pointer}
.anatomy-theme button[aria-pressed="true"]{background:var(--anatomy-strong);color:var(--anatomy-paper);border-color:var(--anatomy-strong)}
.anatomy-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px;font-family:var(--anatomy-mono)}
.anatomy-controls__label{color:var(--anatomy-muted);font-size:12.5px;margin-right:2px}
.anatomy-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 14px;border:1px solid var(--anatomy-lo);border-radius:8px;background:var(--anatomy-paper);color:var(--anatomy-strong);font-family:var(--anatomy-mono);font-size:13px;cursor:pointer}
.anatomy-btn:hover{border-color:var(--anatomy-mid)}
.anatomy-btn[aria-pressed="true"]{background:var(--anatomy-strong);color:var(--anatomy-paper);border-color:var(--anatomy-strong)}
.anatomy-range{display:inline-flex;align-items:center;gap:8px;color:var(--anatomy-muted);font-size:12.5px;min-height:44px;padding:0 4px}
.anatomy-range input[type="range"]{width:min(180px,46vw);min-height:44px;accent-color:var(--anatomy-hi)}
.anatomy-range output,.anatomy-range span[data-anatomy-psi-out]{min-width:52px;color:var(--anatomy-strong)}
.anatomy-status{flex-basis:100%;margin:2px 0 0;color:var(--anatomy-muted);font-size:12.5px;min-height:1.2em}
.anatomy-btn:focus-visible,.anatomy-theme button:focus-visible,.anatomy-nav a:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:2px}
html.anatomy-embedded .anatomy-head{display:none}
</style>`;

const THEME_INIT = `<script data-anatomy-theme-init>
(function () {
  try {
    var q = new URLSearchParams(location.search).get("theme");
    var t = (q === "light" || q === "dark") ? q : null;
    if (!t) { try { t = localStorage.getItem("bc-theme"); } catch (e) {} }
    if (t !== "light" && t !== "dark") {
      t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.body.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-anatomy-theme", t);
    document.documentElement.style.colorScheme = t;
    if (window.self !== window.top) document.documentElement.classList.add("anatomy-embedded");
  } catch (e) {}
})();
</script>`;

const ANATOMY_HEAD = `<header class="anatomy-head">
  <nav class="anatomy-nav" aria-label="Anatomy figures">
    <a href="../">← All machines</a>
    <span class="anatomy-nav__brand">Anatomy · Fig 6 of 6</span>
    <span class="anatomy-nav__pager"><a href="../robotic-cat/" rel="prev">← Robotic cat</a><a href="../drone/" rel="next">Quadcopter →</a></span>
  </nav>
  <div class="anatomy-intro">
    <h1>Pneumatic impact wrench</h1>
    <p>Compressed air from the FRL regulator spins a six-vane rotary motor; a cam-driven twin-hammer clutch accelerates freely and strikes the anvil in rapid bursts into a hydraulic load-cell dyno.</p>
  </div>
  <div class="anatomy-theme" role="group" aria-label="Theme">
    <span>Theme</span>
    <button type="button" data-anatomy-theme="dark" aria-pressed="false">Dark</button>
    <button type="button" data-anatomy-theme="light" aria-pressed="false">Light</button>
  </div>
</header>`;

const CONTROLS_HTML = `<div class="anatomy-controls" role="group" aria-label="Impact wrench controls">
  <button type="button" class="anatomy-btn" data-anatomy-cmd="trigger" aria-pressed="true">Trigger: Pulled</button>
  <span class="anatomy-controls__label">Load</span>
  <button type="button" class="anatomy-btn" data-anatomy-cmd="load" data-value="0" aria-pressed="false">1 Free</button>
  <button type="button" class="anatomy-btn" data-anatomy-cmd="load" data-value="1" aria-pressed="false">2 Snug</button>
  <button type="button" class="anatomy-btn" data-anatomy-cmd="load" data-value="2" aria-pressed="true">3 High</button>
  <label class="anatomy-range">Air <input type="range" min="40" max="110" step="5" value="90" data-anatomy-psi aria-label="Supply air pressure (PSI)"><span data-anatomy-psi-out>90 PSI</span></label>
  <button type="button" class="anatomy-btn" data-anatomy-cmd="slow" aria-pressed="false">Slow 0.25×</button>
  <button type="button" class="anatomy-btn" data-anatomy-cmd="reset">Reset</button>
  <p class="anatomy-status" role="status" aria-live="polite" data-anatomy-status></p>
</div>`;

const UX_SCRIPT = `<script type="module" data-anatomy-ux>
(() => {
  const body = document.body;
  const stage = document.querySelector(".iw-stage") || document.querySelector(".iso-stage");
  const status = document.querySelector("[data-anatomy-status]");
  const readout = document.querySelector("[data-readout]");

  const themeButtons = [...document.querySelectorAll("[data-anatomy-theme]")];
  const syncThemeButtons = () => {
    const current = body.getAttribute("data-theme");
    themeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.anatomyTheme === current)));
  };
  const setTheme = (t) => {
    body.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-anatomy-theme", t);
    document.documentElement.style.colorScheme = t;
    try { localStorage.setItem("bc-theme", t); } catch (e) {}
    const u = new URL(location.href);
    u.searchParams.set("theme", t);
    history.replaceState(null, "", u);
    syncThemeButtons();
  };
  themeButtons.forEach((b) => b.addEventListener("click", () => setTheme(b.dataset.anatomyTheme)));
  syncThemeButtons();

  if (!stage) return;

  const triggerBtn = document.querySelector('[data-anatomy-cmd="trigger"]');
  const loadBtns = [...document.querySelectorAll('[data-anatomy-cmd="load"]')];
  const slowBtn = document.querySelector('[data-anatomy-cmd="slow"]');
  const resetBtn = document.querySelector('[data-anatomy-cmd="reset"]');
  const psiInput = document.querySelector("[data-anatomy-psi]");
  const psiOut = document.querySelector("[data-anatomy-psi-out]");

  let announceUntil = 0;
  let statusTimer = 0;
  const markInteracted = () => { announceUntil = Date.now() + 6000; };
  stage.addEventListener("pointerdown", markInteracted);
  stage.addEventListener("keydown", markInteracted);

  if (readout && status) {
    new MutationObserver(() => {
      if (Date.now() > announceUntil) return;
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { status.textContent = readout.textContent; }, 650);
    }).observe(readout, { characterData: true, childList: true, subtree: true });
  }

  const sendCmd = (detail) => {
    markInteracted();
    stage.dispatchEvent(new CustomEvent("iw:command", { detail }));
  };

  let curTrigger = true;
  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => {
      curTrigger = !curTrigger;
      sendCmd({ type: "trigger", value: curTrigger ? 1 : 0 });
    });
  }
  loadBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sendCmd({ type: "load", value: Number(btn.dataset.value) });
    });
  });
  if (slowBtn) {
    slowBtn.addEventListener("click", () => sendCmd({ type: "slow" }));
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => sendCmd({ type: "reset" }));
  }
  if (psiInput) {
    psiInput.addEventListener("input", () => {
      sendCmd({ type: "psi", value: Number(psiInput.value) });
    });
  }

  stage.addEventListener("iw:state", (ev) => {
    const s = ev.detail || {};
    curTrigger = (s.trigger ?? 0) > 0.5;
    if (triggerBtn) {
      triggerBtn.setAttribute("aria-pressed", String(curTrigger));
      triggerBtn.textContent = curTrigger ? "Trigger: Pulled" : "Trigger: Released";
    }
    loadBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(Number(btn.dataset.value) === Number(s.loadIdx)));
    });
    if (slowBtn) {
      slowBtn.setAttribute("aria-pressed", String(Boolean(s.slowMo)));
    }
    const psi = Math.round(s.psi ?? 90);
    if (psiInput && document.activeElement !== psiInput) {
      psiInput.value = String(psi);
    }
    if (psiOut) psiOut.textContent = psi + " PSI";
  });

  const q = new URLSearchParams(location.search);
  const qLoad = q.get("load");
  if (qLoad === "0" || qLoad === "1" || qLoad === "2") {
    stage.dispatchEvent(new CustomEvent("iw:command", { detail: { type: "load", value: Number(qLoad) } }));
  } else if (qLoad === "3") {
    stage.dispatchEvent(new CustomEvent("iw:command", { detail: { type: "load", value: 2 } }));
  }
  const qPsi = Number(q.get("psi"));
  if (qPsi >= 40 && qPsi <= 110) {
    stage.dispatchEvent(new CustomEvent("iw:command", { detail: { type: "psi", value: qPsi } }));
  }
  if (q.get("trigger") === "0") {
    stage.dispatchEvent(new CustomEvent("iw:command", { detail: { type: "trigger", value: 0 } }));
  }
  if (q.get("slow") === "1") {
    stage.dispatchEvent(new CustomEvent("iw:command", { detail: { type: "slow", value: true } }));
  }
})();
</script>`;

let html = fs.readFileSync(SRC_HTML, "utf8");

function replaceOnce(str, marker, replacement, fromEnd = false) {
  const idx = fromEnd ? str.lastIndexOf(marker) : str.indexOf(marker);
  if (idx < 0) throw new Error(`Marker not found: ${marker}`);
  return str.slice(0, idx) + replacement + str.slice(idx + marker.length);
}

html = replaceOnce(html, "</title>", `</title>\n${META_HEAD}`);
html = replaceOnce(html, "</style></head>", `</style>\n${UX_STYLE}\n</head>`);
html = replaceOnce(html, '<main class="iso-page">', `${THEME_INIT}<main class="iso-page">${ANATOMY_HEAD}`);
html = replaceOnce(html, '<figcaption class="iso-legend">', `${CONTROLS_HTML}\n<figcaption class="iso-legend">`);
html = replaceOnce(html, "</body></html>", `\n${UX_SCRIPT}\n</body></html>`, true);

const SEPIA_DARK = `.iso{
  --anatomy-page:#14100c;--anatomy-card:#1c1712;--anatomy-text:#c2b39a;--anatomy-strong:#ede0c8;--anatomy-muted:#96846d;
  --anatomy-paper:#1c1712;--anatomy-face:#262019;--anatomy-top:#2a231b;
  --anatomy-shade-0:#15110d;--anatomy-shade-1:#1a1510;--anatomy-shade-2:#201a14;--anatomy-shade-3:#241e17;
  --anatomy-lit-top:#362d22;--anatomy-lit-shade:#29221a;
  --anatomy-hi:#dccab0;--anatomy-mid:#806f59;--anatomy-lo:#524536;--anatomy-faint:#362d23;--anatomy-lit:#fbf1dd;
  --anatomy-halo:#080604;--anatomy-halo-opacity:.9;--anatomy-dot:#e6d7bd;
  --anatomy-red:#e07a5f;--anatomy-green:#8ab87c;--anatomy-blue:#7ca1bd;
  --anatomy-weight:.6px;--anatomy-ease:cubic-bezier(.32,.72,0,1);
  --anatomy-mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --anatomy-lift:inset 0 1px 0 0 #f5e6c80f,inset 0 0 0 1px #f5e6c808,0 0 0 1px #00000033,0 1px 1px -.5px #0000001a,0 3px 3px -1.5px #0000001a,0 6px 6px -3px #0000001a,0 12px 12px -6px #0000001a;
}`;

const SEPIA_LIGHT = `.iso[data-theme="light"]{
  --anatomy-page:#efe5d0;--anatomy-card:#f7efe0;--anatomy-text:#52402f;--anatomy-strong:#2c1e12;--anatomy-muted:#6b5743;
  --anatomy-paper:#f7efe0;--anatomy-face:#fbf6ea;--anatomy-top:#fdf9ef;
  --anatomy-shade-0:#cfc0a3;--anatomy-shade-1:#ddd0b6;--anatomy-shade-2:#e9dec7;--anatomy-shade-3:#f2e9d6;
  --anatomy-lit-top:#fffdf7;--anatomy-lit-shade:#eadec5;
  --anatomy-hi:#3f2c1b;--anatomy-mid:#8a7359;--anatomy-lo:#b59e81;--anatomy-faint:#d8cbb2;--anatomy-lit:#23170c;
  --anatomy-halo:#786145;--anatomy-halo-opacity:.32;--anatomy-dot:#4a3623;
  --anatomy-red:#a93e28;--anatomy-green:#3f6a3c;--anatomy-blue:#355b78;
  --anatomy-lift:inset 0 1px 0 0 #fffdf7,0 0 0 1px #2c1e1212,0 1px 1px -.5px #2c1e120d,0 3px 3px -1.5px #2c1e120d,0 6px 6px -3px #2c1e120d,0 12px 12px -6px #2c1e120d;
}`;

html = html
  .replace(/\.iso\{\s*--anatomy-page:#0b0b0b;[\s\S]*?--anatomy-lift:[^;]+;\s*\}/g, SEPIA_DARK)
  .replace(/\.iso\[data-theme="light"\]\{\s*--anatomy-page:#f2f2ef;[\s\S]*?--anatomy-lift:[^;]+;\s*\}/g, SEPIA_LIGHT);

fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
fs.writeFileSync(OUT_HTML, html, "utf8");
console.log(`published ${path.relative(process.cwd(), OUT_HTML)} · ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
