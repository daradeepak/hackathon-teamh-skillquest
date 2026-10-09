/* Apply the saved theme before the page paints so there is no flash of the wrong theme. */
(function() {
  var theme = null;
  try { theme = localStorage.getItem("xpedition-theme") || localStorage.getItem("xpaddition-theme"); } catch (e) {}
  if (theme !== "light" && theme !== "dark") theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  /* device settings chosen in Settings: text size and reduced motion */
  try {
    var settings = JSON.parse(localStorage.getItem("xpedition-settings")) || {};
    if (settings.textSize === "large" || settings.textSize === "larger") document.documentElement.classList.add("text-" + settings.textSize);
    if (settings.motion === "reduce") document.documentElement.classList.add("reduce-motion");
  } catch (e) {}
})();
