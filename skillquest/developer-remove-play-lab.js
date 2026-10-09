(function () {
  "use strict";

  var selectors = [
    '[data-nav="lab"]',
    '[data-route="lab"]',
    '[data-view="lab"]',
    '[data-action="lab"]',
    ".dev-daily-banner",
    '#app-main [data-module="daily"]'
  ];

  function removePlayLab() {
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (item) {
        item.remove();
      });
    });

    document.querySelectorAll("#app-main button, #app-main a").forEach(function (item) {
      var label = (item.innerText || item.getAttribute("aria-label") || "").trim();
      if (/Play Lab/i.test(label)) item.remove();
    });

    document.querySelectorAll("#app-main .track-tab").forEach(function (item) {
      if (/JavaScript Trail/i.test(item.innerText || "")) item.textContent = "JavaScript Learn ✨";
    });
    document.querySelectorAll("#app-main h1").forEach(function (item) {
      if (/JavaScript Trail/i.test(item.innerText || "")) item.textContent = "JavaScript Learn 🌈";
    });
    document.querySelectorAll("#app-main button").forEach(function (item) {
      if (/Explore the trail/i.test(item.innerText || "")) item.textContent = "Learn JavaScript →";
    });

    var main = document.getElementById("app-main");
    if (main && /Welcome to the Play Lab|SIDE QUESTS & QUICK WINS/.test(main.innerText || "")) {
      var homeButton = document.querySelector('[data-nav="home"]');
      if (homeButton && !homeButton.dataset.removingLab) {
        homeButton.dataset.removingLab = "true";
        homeButton.click();
      }
    }
  }

  removePlayLab();
  new MutationObserver(removePlayLab).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
