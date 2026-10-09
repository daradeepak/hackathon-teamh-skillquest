(function () {
  "use strict";

  function removeReelReferences() {
    document.querySelectorAll(
      'a[href*="instagram.com/reel/Dc0uPlaTDsT"], .dev-inline-reel'
    ).forEach(function (item) {
      item.remove();
    });
  }

  removeReelReferences();
  new MutationObserver(removeReelReferences).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
