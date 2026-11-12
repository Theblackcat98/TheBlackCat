(() => {
  const STORAGE_KEY = "bc-theme";
  const VALID = new Set(["dark", "light"]);

  const isEmbedded = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("embed") === "1") return true;
    } catch {}
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const getUrlTheme = () => {
    try {
      const q = new URLSearchParams(window.location.search).get("theme");
      return VALID.has(q) ? q : null;
    } catch {
      return null;
    }
  };

  const getSavedTheme = () => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return VALID.has(saved) ? saved : null;
    } catch {
      return null;
    }
  };

  const getSystemTheme = () => {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  };

  const resolveTheme = () => getUrlTheme() || getSavedTheme() || getSystemTheme();

  const syncButtons = (theme) => {
    document.querySelectorAll("[data-set-theme]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.setTheme === theme));
    });
  };

  const applyEmbedState = () => {
    if (isEmbedded()) {
      document.documentElement.classList.add("anatomy-embedded");
    }
  };

  const applyTheme = (theme, { persist = false, updateUrl = false, emit = false } = {}) => {
    if (!VALID.has(theme)) return;

    const root = document.documentElement;
    root.setAttribute("data-anatomy-theme", theme);
    root.style.colorScheme = theme;

    if (document.body) {
      document.body.setAttribute("data-theme", theme);
    }

    syncButtons(theme);

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } catch {}
    }

    if (updateUrl) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("theme", theme);
        window.history.replaceState(null, "", url);
      } catch {}
    }

    if (emit) {
      const ev = new CustomEvent("themechange", {
        bubbles: true,
        detail: { theme },
      });
      document.dispatchEvent(ev);
    }
  };

  const bindControls = () => {
    const initial = resolveTheme();
    applyEmbedState();
    applyTheme(initial, { persist: false, updateUrl: false, emit: false });

    document.addEventListener("click", (event) => {
      const btn = event.target && event.target.closest
        ? event.target.closest("[data-set-theme]")
        : null;
      if (!btn) return;
      const next = btn.dataset.setTheme;
      if (!VALID.has(next)) return;
      applyTheme(next, { persist: true, updateUrl: true, emit: true });
    });
  };

  // Run immediately for synchronous loads (e.g., <head> or end-of-body).
  applyEmbedState();
  applyTheme(resolveTheme(), { persist: false, updateUrl: false, emit: false });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControls, { once: true });
  } else {
    bindControls();
  }

  // Keep in sync if parent site or another tab updates bc-theme.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !VALID.has(event.newValue)) return;
    applyTheme(event.newValue, { persist: false, updateUrl: false, emit: true });
  });

  // Follow OS theme changes only when no explicit URL or saved override exists.
  try {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = () => {
      if (getUrlTheme() || getSavedTheme()) return;
      applyTheme(getSystemTheme(), { persist: false, updateUrl: false, emit: true });
    };
    if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  } catch {}

  window.AnatomyChrome = {
    getTheme: () => document.documentElement.getAttribute("data-anatomy-theme") || resolveTheme(),
    setTheme: (theme, opts) => applyTheme(theme, { persist: true, updateUrl: true, emit: true, ...opts }),
    isEmbedded,
  };
})();
