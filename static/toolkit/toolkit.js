/* The BlackCat · Workshop Toolkit (static/toolkit/toolkit.js)
   Shared top bar, tool switcher (⌘K / Ctrl+K), prev/next in category,
   related tools footer, recently-used tracking, and bc-theme sync. */
(() => {
  "use strict";
  const root = document.documentElement;
  const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");

  /* ---- 1 · Theme sync (bc-theme) -------------------------------------- */
  const getSavedTheme = () => {
    try { return localStorage.getItem("bc-theme"); } catch (_) { return null; }
  };
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : darkMQ.matches);
  const applyTheme = (t) => {
    if (t === "light" || t === "dark") {
      root.dataset.theme = t;
      root.classList.toggle("dark", t === "dark");
    }
  };
  const savedTheme = getSavedTheme();
  if (savedTheme) applyTheme(savedTheme);

  /* ---- 2 · Resolve paths & current tool ------------------------------- */
  const scriptEl = document.currentScript || document.querySelector("script[data-tool]");
  const toolId = (scriptEl && scriptEl.dataset.tool) || location.pathname.replace(/\/+$/, "").split("/").pop();
  if (toolId) root.dataset.tool = toolId;

  const srcUrl = scriptEl && scriptEl.src ? new URL(scriptEl.src, location.href) : new URL("../toolkit/toolkit.js", location.href);
  const siteRoot = new URL("../", srcUrl).pathname; // e.g. "/TheBlackCat/" or "/"
  const registryUrl = new URL("./registry.json", srcUrl).href;
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");
  const resolveUrl = (u) => (!u ? siteRoot : /^https?:\/\//i.test(u) ? u : siteRoot + u.replace(/^\/+/, ""));

  /* ---- 3 · Record recently used (bc:recent-tools) --------------------- */
  const RECENT_KEY = "bc:recent-tools";
  const getRecent = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch (_) { return []; }
  };
  const recordRecent = (id) => {
    if (!id) return;
    try {
      const next = [id, ...getRecent().filter((x) => x !== id)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch (_) {}
  };
  recordRecent(toolId);

  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const CAT_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="1" y="1" width="30" height="30" rx="8" fill="var(--tk-paper-3)" stroke="var(--tk-rule-2)" stroke-width="1"/><path d="M6.5 5.5 12 9.6q4-1.2 8 0l5.5-4.1.9 8.3q1.6 2.4 1.6 5.2C28 25 22.5 28 16 28S4 25 4 19.5q0-2.8 1.6-5.2z" fill="#1c1915"/><ellipse cx="11.6" cy="18" rx="2.3" ry="2.9" fill="var(--tk-accent)"/><ellipse cx="20.4" cy="18" rx="2.3" ry="2.9" fill="var(--tk-accent)"/><rect x="10.9" y="15.7" width="1.4" height="4.6" rx=".7" fill="#1c1915"/><rect x="19.7" y="15.7" width="1.4" height="4.6" rx=".7" fill="#1c1915"/></svg>';
  const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>';

  /* ---- 4 · Mount UI once DOM + registry are ready --------------------- */
  const mount = (reg) => {
    const categories = (reg && reg.categories) || [];
    const tools = (reg && reg.tools) || [];
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    const toolMap = Object.fromEntries(tools.map((t) => [t.id, t]));
    const cur = toolMap[toolId] || { id: toolId, name: document.title.split("·")[0].trim() };
    const cat = catMap[cur.category];
    const siblings = cur.category ? tools.filter((t) => t.category === cur.category) : [];
    const curIdx = siblings.findIndex((t) => t.id === cur.id);
    const prevTool = siblings.length > 1 && curIdx >= 0 ? siblings[(curIdx - 1 + siblings.length) % siblings.length] : null;
    const nextTool = siblings.length > 1 && curIdx >= 0 ? siblings[(curIdx + 1) % siblings.length] : null;

    /* -- Top Bar -- */
    const bar = document.createElement("nav");
    bar.className = "tk-bar";
    bar.setAttribute("aria-label", "Workshop navigation");
    bar.innerHTML = `
      <div class="tk-bar__inner">
        <div class="tk-crumbs">
          <a class="tk-crumbs__brand" href="${esc(siteRoot)}">${CAT_SVG}<span>The BlackCat</span></a>
          <span class="tk-crumbs__sep" aria-hidden="true">/</span>
          <a href="${esc(siteRoot + "tools/")}">Tools</a>
          ${cat ? `<span class="tk-crumbs__sep" aria-hidden="true">/</span><a href="${esc(siteRoot + "tools/#" + cat.id)}">${esc(cat.name)}</a>` : ""}
        </div>
        <div class="tk-actions">
          ${prevTool && nextTool ? `
            <div class="tk-pager" role="group" aria-label="Previous and next in ${esc(cat ? cat.name : "category")}">
              <a href="${esc(resolveUrl(prevTool.url))}" title="Previous: ${esc(prevTool.name)}" aria-label="Previous tool: ${esc(prevTool.name)}">&lsaquo;</a>
              <a href="${esc(resolveUrl(nextTool.url))}" title="Next: ${esc(nextTool.name)}" aria-label="Next tool: ${esc(nextTool.name)}">&rsaquo;</a>
            </div>
          ` : ""}
          <button type="button" class="tk-btn" data-tk-switch aria-label="Switch tool">
            <span>Switch</span>
            <kbd aria-hidden="true">${isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          ${cur.writeup ? `<a class="tk-btn" href="${esc(resolveUrl(cur.writeup))}">Write-up</a>` : ""}
          <button type="button" class="tk-btn tk-btn--icon" data-tk-theme title="Toggle light/dark theme" aria-label="Toggle color theme">◐</button>
        </div>
      </div>
    `;
    document.body.prepend(bar);
    root.dataset.tkReady = "true";

    /* -- Theme toggle -- */
    const themeBtn = bar.querySelector("[data-tk-theme]");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const next = isDark() ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem("bc-theme", next); } catch (_) {}
        window.dispatchEvent(new Event("themechange"));
      });
    }

    /* -- Bottom Related Strip -- */
    const pairs = (cur.related || []).map((id) => toolMap[id]).filter(Boolean);
    const pairIds = new Set(pairs.map((t) => t.id));
    const moreInCat = siblings.filter((t) => t.id !== cur.id && !pairIds.has(t.id)).slice(0, 3);

    if (moreInCat.length || pairs.length) {
      const renderLinks = (arr) => arr.map((t) => {
        const ext = /^https?:\/\//i.test(t.url);
        return `<a href="${esc(resolveUrl(t.url))}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(t.name)}</a>`;
      }).join('<span class="tk-foot__dot" aria-hidden="true">&middot;</span>');

      const foot = document.createElement("footer");
      foot.className = "tk-foot";
      foot.setAttribute("aria-label", "Related tools");
      foot.innerHTML = `
        <div class="tk-foot__inner">
          <div class="tk-foot__groups">
            ${moreInCat.length && cat ? `
              <div class="tk-foot__row">
                <span class="tk-foot__label">More in ${esc(cat.name)}:</span>
                <div class="tk-foot__links">${renderLinks(moreInCat)}</div>
              </div>
            ` : ""}
            ${pairs.length ? `
              <div class="tk-foot__row">
                <span class="tk-foot__label">Pairs well with:</span>
                <div class="tk-foot__links">${renderLinks(pairs)}</div>
              </div>
            ` : ""}
          </div>
          <a class="tk-foot__all" href="${esc(siteRoot + "tools/")}">All tools &rarr;</a>
        </div>
      `;
      document.body.appendChild(foot);
    }

    /* -- Tool Switcher Dialog -- */
    if (!tools.length) return;
    const dlg = document.createElement("dialog");
    dlg.className = "tk-switcher";
    dlg.id = "tk-switcher";
    dlg.setAttribute("aria-label", "Switch tool");
    dlg.innerHTML = `
      <div class="tk-switcher__bar">
        ${SEARCH_SVG}
        <input type="search" class="tk-switcher__input" id="tk-switcher-input" placeholder="Switch to any tool…" autocomplete="off" spellcheck="false" aria-label="Search tools">
        <button type="button" class="tk-switcher__esc" data-tk-close>Esc</button>
      </div>
      <div class="tk-switcher__list" id="tk-switcher-list" role="listbox" aria-label="Tools"></div>
      <div class="tk-switcher__foot">
        <span>↑↓ navigate &middot; ↵ open</span>
        <span>${tools.length} tools in ${categories.length} categories</span>
      </div>
    `;
    document.body.appendChild(dlg);

    const input = dlg.querySelector("#tk-switcher-input");
    const listEl = dlg.querySelector("#tk-switcher-list");
    let sel = 0;

    const selectIdx = (n) => {
      const items = Array.from(listEl.querySelectorAll(".tk-switcher__item"));
      if (!items.length) { sel = -1; return; }
      sel = (n + items.length) % items.length;
      items.forEach((el, i) => el.setAttribute("aria-selected", String(i === sel)));
      items[sel].scrollIntoView({ block: "nearest" });
    };

    const renderList = () => {
      const q = input.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      let html = "";
      let idx = 0;

      const renderRow = (t) => {
        const ext = /^https?:\/\//i.test(t.url);
        const i = idx++;
        return `<a class="tk-switcher__item" role="option" data-i="${i}" aria-selected="${i === 0}" href="${esc(resolveUrl(t.url))}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>
          <span class="tk-switcher__name">${esc(t.name)}</span>
          <span class="tk-switcher__short">${esc(t.short || t.desc || "")}</span>
        </a>`;
      };

      if (!words.length) {
        const recent = getRecent().filter((id) => id !== cur.id && toolMap[id]).slice(0, 5).map((id) => toolMap[id]);
        if (recent.length) {
          html += `<div class="tk-switcher__group">Recently used</div>` + recent.map(renderRow).join("");
        }
        categories.forEach((c) => {
          const groupTools = tools.filter((t) => t.category === c.id);
          if (groupTools.length) {
            html += `<div class="tk-switcher__group">${esc(c.name)}</div>` + groupTools.map(renderRow).join("");
          }
        });
      } else {
        const matched = tools.filter((t) => {
          const hay = [t.name, t.short, t.desc, ...(t.tags || []), (catMap[t.category] && catMap[t.category].name) || ""].join(" ").toLowerCase();
          return words.every((w) => hay.includes(w));
        });
        if (!matched.length) {
          listEl.innerHTML = `<div class="tk-switcher__empty">No tools matching “${esc(input.value.trim())}”.</div>`;
          sel = -1;
          return;
        }
        categories.forEach((c) => {
          const groupTools = matched.filter((t) => t.category === c.id);
          if (groupTools.length) {
            html += `<div class="tk-switcher__group">${esc(c.name)}</div>` + groupTools.map(renderRow).join("");
          }
        });
      }
      listEl.innerHTML = html;
      selectIdx(0);
    };

    const openSwitcher = () => {
      if (dlg.open) return;
      dlg.showModal();
      input.value = "";
      renderList();
      input.focus();
    };
    const closeSwitcher = () => {
      if (dlg.open) dlg.close();
    };

    bar.querySelector("[data-tk-switch]")?.addEventListener("click", openSwitcher);
    dlg.querySelector("[data-tk-close]")?.addEventListener("click", closeSwitcher);
    dlg.addEventListener("click", (ev) => { if (ev.target === dlg) closeSwitcher(); });
    input.addEventListener("input", renderList);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") { ev.preventDefault(); closeSwitcher(); }
      else if (ev.key === "ArrowDown") { ev.preventDefault(); selectIdx(sel + 1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); selectIdx(sel - 1); }
      else if (ev.key === "Enter") {
        const items = listEl.querySelectorAll(".tk-switcher__item");
        if (items[sel]) { ev.preventDefault(); items[sel].click(); }
      }
    });
    listEl.addEventListener("mousemove", (ev) => {
      const a = ev.target.closest(".tk-switcher__item");
      if (a && +a.dataset.i !== sel) selectIdx(+a.dataset.i);
    });

    document.addEventListener("keydown", (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        const t = ev.target;
        const inField = t && t !== input && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable);
        if (inField && !dlg.open) return;
        ev.preventDefault();
        dlg.open ? closeSwitcher() : openSwitcher();
      }
    });
  };

  const init = () => {
    fetch(registryUrl)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((reg) => mount(reg || { categories: [], tools: [] }));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
