/* Apply the saved theme before the page paints so there is no flash of the wrong theme. */
(function() {
  var theme = null;
  try { theme = localStorage.getItem("xpedition-theme") || localStorage.getItem("xpaddition-theme"); } catch (e) {}
  if (theme !== "light" && theme !== "dark") theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
})();
