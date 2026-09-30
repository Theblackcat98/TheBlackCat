/* The BlackCat: site behaviour. No dependencies; every feature degrades to plain HTML.
   1 theme toggle · 2 search palette · 3 list filters · 4 code copy · 5 TOC spy · 6 mermaid · 7 responsive <details> */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const wide = window.matchMedia("(min-width: 62rem)");

  /* ---- 0 · Show Ctrl instead of the Command glyph off macOS/iOS ------- */
  if (!/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)) {
    document.querySelectorAll("kbd").forEach((k) => { if (k.textContent.trim() === "⌘K") k.textContent = "Ctrl K"; });
  }

  /* ---- 1 · Theme ---------------------------------------------------- */
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : dark.matches);
  const themeBtn = $("#theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("bc-theme", next); } catch (_) {}
      window.dispatchEvent(new Event("themechange"));
    });
  }
  dark.addEventListener?.("change", () => window.dispatchEvent(new Event("themechange")));

  /* ---- 2 · Search palette ------------------------------------------- */
  const dlg = $("#search");
  const input = $("#search-input");
  const out = $("#search-results");
  let index = null, loading = null, hits = [], sel = -1;

  const load = () => loading || (loading = fetch(dlg.dataset.index)
    .then((r) => r.json())
    .then((d) => {
      index = d.map((e) => ({
        ...e,
        _t: e.t.toLowerCase(),
        _g: [...(e.g || []), ...(e.o || [])].join(" ").toLowerCase(),
        _d: (e.d || "").toLowerCase(),
        _x: (e.x || "").toLowerCase(),
        _k: (e.l || e.k || "").toLowerCase(),
      }));
    })
    .catch(() => { index = []; }));

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mark = (text, toks) => {
    let html = esc(text);
    toks.forEach((t) => {
      if (!t) return;
      const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![^<]*>)", "ig");
      html = html.replace(re, "<mark>$1</mark>");
    });
    return html;
  };

  const score = (e, toks) => {
    let s = 0;
    for (const t of toks) {
      let m = 0;
      const ti = e._t.indexOf(t);
      if (ti >= 0) m += ti === 0 || /[\s\-_/]/.test(e._t[ti - 1]) ? 14 : 9;
      if (e._g.includes(t)) m += 7;
      if (e._k.includes(t)) m += 4;
      if (e._d.includes(t)) m += 3;
      if (e._x.includes(t)) m += 1;
      if (!m) return 0;            // every word must match somewhere
      s += m;
    }
    if (toks.join(" ") === e._t) s += 25;
    return s;
  };

  const ORDER = ["Skill", "Bookmark", "Article", "Project", "Collection", "Note", "Reference", "Post", "Doc"];
  const rank = (l) => { const i = ORDER.indexOf(l); return i < 0 ? 99 : i; };

  const row = (e, toks, i) => {
    const meta = [e.l, e.h || (e.s && e.s !== "library" ? e.s : ""), e.y].filter(Boolean).join(" · ");
    return `<a class="search__hit" role="option" id="hit-${i}" aria-selected="false" href="${esc(e.u)}" data-i="${i}">
      <div class="search__title">${mark(e.t, toks)}</div>
      <div class="search__meta">${esc(meta)}</div>
      ${e.d ? `<div class="search__desc">${mark(e.d, toks)}</div>` : ""}</a>`;
  };

  const render = () => {
    if (!index) { out.innerHTML = '<div class="search__empty">Loading…</div>'; return; }
    const q = input.value.trim().toLowerCase();
    const toks = q.split(/\s+/).filter(Boolean);
    let list, groupBy = true; const best = {};
    if (!toks.length) {
      list = index.filter((e) => e.y).sort((a, b) => b.y.localeCompare(a.y)).slice(0, 8);
      groupBy = false;
    } else {
      const scored = index.map((e) => [e, score(e, toks)]).filter((p) => p[1] > 0)
        .sort((a, b) => b[1] - a[1] || a[0]._t.localeCompare(b[0]._t)).slice(0, 40);
      scored.forEach(([e, s]) => { best[e.l || "Other"] = Math.max(best[e.l || "Other"] || 0, s); });
      list = scored.map((p) => p[0]);
    }
    hits = list;
    if (!list.length) { out.innerHTML = `<div class="search__empty">No results for “${esc(input.value.trim())}”.</div>`; sel = -1; return; }
    let html = "", i = 0;
    if (!groupBy) {
      html = '<div class="search__group">Recently added</div>' + list.map((e) => row(e, toks, i++)).join("");
    } else {
      const groups = {};
      list.forEach((e) => (groups[e.l || "Other"] ||= []).push(e));
      const order = Object.keys(groups).sort((a, b) => (best[b] - best[a]) || (rank(a) - rank(b)));
      order.forEach((g) => {
        html += `<div class="search__group">${esc(g)}</div>`;
        groups[g].forEach((e) => { html += row(e, toks, i++); });
      });
      // groups reorder results, so remap indices to display order
      hits = order.flatMap((g) => groups[g]);
    }
    out.innerHTML = html;
    select(0);
  };

  const select = (n) => {
    const els = $$(".search__hit", out);
    if (!els.length) { sel = -1; return; }
    sel = (n + els.length) % els.length;
    els.forEach((el, i) => el.setAttribute("aria-selected", String(i === sel)));
    els[sel].scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", els[sel].id);
  };

  const openSearch = () => {
    if (!dlg || dlg.open) return;
    dlg.showModal();
    input.value = "";
    input.focus();
    render();
    load().then(render);
  };
  const closeSearch = () => dlg && dlg.open && dlg.close();

  if (dlg) {
    document.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-search-open]")) { ev.preventDefault(); openSearch(); }
      else if (ev.target.closest("[data-search-close]")) closeSearch();
      else if (ev.target === dlg) closeSearch();            // click on backdrop
    });
    document.addEventListener("keydown", (ev) => {
      const typing = /^(input|textarea|select)$/i.test(ev.target.tagName) || ev.target.isContentEditable;
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); dlg.open ? closeSearch() : openSearch(); }
      else if (ev.key === "/" && !typing && !dlg.open) { ev.preventDefault(); openSearch(); }
    });
    input.addEventListener("input", render);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowDown") { ev.preventDefault(); select(sel + 1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); select(sel - 1); }
      else if (ev.key === "Enter") { const el = $$(".search__hit", out)[sel]; if (el) { ev.preventDefault(); el.click(); } }
    });
    out.addEventListener("mousemove", (ev) => { const a = ev.target.closest(".search__hit"); if (a && +a.dataset.i !== sel) select(+a.dataset.i); });
  }

  /* ---- 3 · List filters (library, projects) -------------------------- */
  $$("[data-filter-root]").forEach((box) => {
    const list = $("[data-filter-list]", box);
    if (!list) return;
    const items = Array.from(list.children);
    const q = $("[data-filter-q]", box);
    const sortSel = $("[data-filter-sort]", box);
    const count = $("[data-filter-count]", box);
    const empty = $("[data-filter-empty]", box);
    const noun = list.classList.contains("grid") ? "projects" : "items";
    const state = { type: "", domain: "", tag: "", q: "" };
    const keys = ["type", "domain", "tag"];

    const fromURL = () => {
      const p = new URLSearchParams(location.search);
      keys.forEach((k) => (state[k] = (p.get(k) || "").toLowerCase()));
      state.q = p.get("q") || "";
      if (q) q.value = state.q;
      if (sortSel && p.get("sort")) sortSel.value = p.get("sort");
    };
    const toURL = () => {
      const p = new URLSearchParams();
      keys.forEach((k) => state[k] && p.set(k, state[k]));
      if (state.q) p.set("q", state.q);
      if (sortSel && sortSel.selectedIndex > 0) p.set("sort", sortSel.value);
      const s = p.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
    };

    const apply = () => {
      const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      items.forEach((li) => {
        const d = li.dataset;
        const ok =
          (!state.type || d.type === state.type) &&
          (!state.domain || d.domain === state.domain) &&
          (!state.tag || (" " + d.tags + " ").includes(" " + state.tag + " ")) &&
          words.every((w) => (d.q || d.title + " " + d.tags).includes(w));
        li.hidden = !ok;
        if (ok) shown++;
      });
      $$("[data-filter]", box).forEach((b) => b.setAttribute("aria-pressed", String((state[b.dataset.filter] || "") === b.dataset.value)));
      if (count) count.textContent = shown === items.length ? `${items.length} ${noun}` : `${shown} of ${items.length} ${noun}`;
      if (empty) empty.hidden = shown !== 0;
      list.hidden = shown === 0;
    };

    const sort = () => {
      if (!sortSel) return;
      const by = sortSel.value;
      const cmp = {
        recent: (a, b) => (b.dataset.date || "").localeCompare(a.dataset.date || "") || a.dataset.title.localeCompare(b.dataset.title),
        az: (a, b) => a.dataset.title.localeCompare(b.dataset.title),
        stars: (a, b) => (+b.dataset.stars || 0) - (+a.dataset.stars || 0) || a.dataset.title.localeCompare(b.dataset.title),
      }[by];
      items.slice().sort(cmp).forEach((li) => list.appendChild(li));
    };

    box.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-filter]");
      if (b && box.contains(b)) {
        const k = b.dataset.filter, v = b.dataset.value;
        state[k] = state[k] === v ? "" : v;
        apply(); toURL();
      } else if (ev.target.closest("[data-filter-reset]")) {
        keys.forEach((k) => (state[k] = "")); state.q = ""; if (q) q.value = "";
        apply(); toURL();
      }
    });
    q && q.addEventListener("input", () => { state.q = q.value.trim(); apply(); toURL(); });
    sortSel && sortSel.addEventListener("change", () => { sort(); toURL(); });

    fromURL(); sort(); apply();
  });

  /* ---- 4 · Copy buttons ---------------------------------------------- */
  document.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("[data-copy]");
    if (!btn) return;
    const pre = $("pre", btn.closest(".codeblock"));
    if (!pre) return;
    const label = $("span", btn);
    try {
      await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ""));
      btn.dataset.state = "done"; label.textContent = "Copied";
    } catch (_) { label.textContent = "Press ⌘C"; }
    setTimeout(() => { delete btn.dataset.state; label.textContent = "Copy"; }, 1600);
  });

  /* ---- 5 · "On this page" scroll-spy --------------------------------- */
  const tocLinks = $$(".article-aside .toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    tocLinks.forEach((a) => { const h = document.getElementById(decodeURIComponent(a.hash.slice(1))); if (h) map.set(h, a); });
    const setActive = (a) => { tocLinks.forEach((x) => x.removeAttribute("aria-current")); a && a.setAttribute("aria-current", "true"); };
    const seen = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      const first = Array.from(map.keys()).find((h) => seen.has(h));
      if (first) setActive(map.get(first));
    }, { rootMargin: "-72px 0px -65% 0px" });
    map.forEach((_, h) => io.observe(h));
  }

  /* ---- 6 · Mermaid (loaded only on pages that contain diagrams) -------- */
  const diagrams = $$("pre.mermaid");
  if (diagrams.length) {
    diagrams.forEach((d) => (d.dataset.src = d.textContent));
    import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs").then(({ default: mermaid }) => {
      const draw = async () => {
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: isDark() ? "dark" : "neutral", fontFamily: "inherit" });
        diagrams.forEach((d) => { d.removeAttribute("data-processed"); d.textContent = d.dataset.src; });
        try { await mermaid.run({ nodes: diagrams }); diagrams.forEach((d) => d.setAttribute("data-processed", "true")); } catch (_) {}
      };
      draw();
      window.addEventListener("themechange", draw);
    }).catch(() => {});
  }

  /* ---- 7 · <details> that are open on desktop, folded on phones ------- */
  const fold = () => $$("details[data-close-narrow]").forEach((d) => { d.open = wide.matches; });
  fold();
  wide.addEventListener?.("change", fold);
})();
