(() => {
  const STORAGE_KEY = "skillquest.theme.v1";
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  const thumb = toggle.querySelector(".theme-switch-thumb");

  const readSavedTheme = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  };

  const applyTheme = (theme, save = false) => {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    if (thumb) thumb.textContent = isDark ? "☾" : "☀";
    toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    toggle.setAttribute("aria-checked", String(isDark));

    if (save) {
      try {
        localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
      } catch {
        // The toggle still works for this page if storage is unavailable.
      }
    }
  };

  applyTheme(readSavedTheme());
  toggle.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });
})();
