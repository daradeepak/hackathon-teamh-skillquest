(function () {
  "use strict";

  var selectors = [
    '[data-module="cinema"]',
    ".js-trail-teaser",
    ".js-map-hero",
    ".js-cinema-page",
    '[data-action="javascript"]',
    '[data-action^="js-"]',
    '[data-track="js"]'
  ];

  function removeJavaScriptCinemaEntries() {
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (item) {
        item.remove();
      });
    });

    document.querySelectorAll("#app-main button, #app-main a").forEach(function (item) {
      var label = (item.innerText || item.getAttribute("aria-label") || "").trim();
      if (!/JavaScript Code Cinema|JavaScript Trail|Open Code Cinema|Explore the trail/i.test(label)) return;

      var card = item.closest('[data-module="cinema"], .js-trail-teaser, .js-map-hero');
      (card || item).remove();
    });
  }

  removeJavaScriptCinemaEntries();
  new MutationObserver(removeJavaScriptCinemaEntries).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
