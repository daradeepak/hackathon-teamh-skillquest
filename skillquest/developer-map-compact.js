(function () {
  "use strict";

  var styleId = "developer-map-compact-style";

  function addStyles() {
    if (document.getElementById(styleId)) return;
    var style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      #app-main .dev-map-intro { padding: 12px 16px; margin: 10px 0 14px; }
      #app-main .js-trail-teaser { display: none !important; }
      #app-main .js-map-hero { min-height: 0; padding: 18px 22px; margin: 12px 0 14px; grid-template-columns: minmax(0,1fr) 170px; gap: 16px; }
      #app-main .js-map-art { min-height: 138px; }
      #app-main .js-map-copy h2 { margin: 5px 0 8px; font-size: clamp(22px, 2.4vw, 30px); }
      #app-main .js-map-copy p { margin: 0 0 10px; }
      #app-main .js-map-worlds { gap: 10px; }
      #app-main .js-world-card { padding: 13px 17px; }
      #app-main .js-world-heading { cursor: pointer; border-radius: 14px; outline-offset: 4px; }
      #app-main .js-world-heading:focus-visible, #app-main .dev-level-head:focus-visible { outline: 3px solid #8461ea; }
      #app-main .js-world-heading p { display: none; }
      #app-main .js-world-card.is-map-collapsed .js-world-track { display: none; }
      #app-main .js-world-card.is-map-collapsed { padding-bottom: 13px; }
      #app-main .js-world-heading::after { content: "−"; margin-left: auto; color: #7554d8; font-size: 22px; font-weight: 900; }
      #app-main .js-world-card.is-map-collapsed .js-world-heading::after { content: "+"; }
      #app-main .dev-level-head { cursor: pointer; border-radius: 14px; outline-offset: 4px; }
      #app-main .dev-level-card.is-map-collapsed { padding-bottom: 12px; }
      #app-main .dev-level-card.is-map-collapsed .dev-game-grid,
      #app-main .dev-level-card.is-map-collapsed .dev-boss-row,
      #app-main .dev-level-card.is-map-collapsed .dev-locked-note { display: none; }
      #app-main .dev-level-head::after { content: "−"; margin-left: auto; color: #7554d8; font-size: 22px; font-weight: 900; }
      #app-main .dev-level-card.is-map-collapsed .dev-level-head::after { content: "+"; }
      #app-main .js-map-footer button[data-module="cinema"] { display: none !important; }
      @media (max-width: 700px) {
        #app-main .js-map-hero { grid-template-columns: 1fr; }
        #app-main .js-map-art { display: none; }
        #app-main .js-world-card { padding: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  function bindAccordion(header, group, item, collapsedClass, controlled) {
    if (!header || header.dataset.compactMapBound) return;
    header.dataset.compactMapBound = "true";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-controls", controlled.id);

    function toggle() {
      var shouldOpen = item.classList.contains(collapsedClass);
      group.forEach(function (other) {
        other.classList.toggle(collapsedClass, other !== item || !shouldOpen);
        var otherHeader = other.querySelector(header.matches(".js-world-heading") ? ".js-world-heading" : ".dev-level-head");
        if (otherHeader) otherHeader.setAttribute("aria-expanded", String(!other.classList.contains(collapsedClass)));
      });
    }

    header.addEventListener("click", toggle);
    header.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  }

  function setupWorlds() {
    var worlds = Array.from(document.querySelectorAll("#app-main .js-world-card"));
    if (!worlds.length) return;
    var active = worlds.find(function (world) { return world.querySelector(".js-lesson-node.next-up"); }) || worlds[0];
    worlds.forEach(function (world) {
      var header = world.querySelector(".js-world-heading");
      var track = world.querySelector(".js-world-track");
      if (!track) return;
      if (!track.id) track.id = "js-world-track-" + (world.className.match(/world-(\d+)/) || ["", worlds.indexOf(world) + 1])[1];
      world.classList.toggle("is-map-collapsed", world !== active);
      track.hidden = world !== active;
      if (header) header.setAttribute("aria-expanded", String(world === active));
      bindAccordion(header, worlds, world, "is-map-collapsed", track);
    });
  }

  function setupLevels() {
    var levels = Array.from(document.querySelectorAll("#app-main .dev-level-card"));
    if (!levels.length) return;
    var active = levels.find(function (level) { return !level.classList.contains("is-locked"); }) || levels[0];
    levels.forEach(function (level, index) {
      var header = level.querySelector(".dev-level-head");
      var controlled = level.querySelector(".dev-game-grid, .dev-locked-note") || level;
      if (!controlled.id) controlled.id = "dev-level-content-" + (index + 1);
      level.classList.toggle("is-map-collapsed", level !== active);
      if (header) header.setAttribute("aria-expanded", String(level === active));
      bindAccordion(header, levels, level, "is-map-collapsed", controlled);
    });
  }

  function compactMap() {
    addStyles();
    var appMain = document.getElementById("app-main");
    if (appMain && appMain.querySelector(".dev-levels")) {
      var teaser = appMain.querySelector(".js-trail-teaser");
      if (teaser) teaser.remove();
    }
    setupWorlds();
    setupLevels();
  }

  compactMap();
  new MutationObserver(compactMap).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
