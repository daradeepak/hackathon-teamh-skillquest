(function() {
  "use strict";
  /* Binary Search Lab: step through a binary search on a sorted list.
     XPBinarySearch.mount(hostElement, { alreadyDone, onComplete }); XPBinarySearch.unmount() */
  var DATA = [2, 4, 5, 7, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23];
  var MAX_STEPS = Math.ceil(Math.log2(DATA.length + 1));
  var CODE = [
    "def binary_search(a, target):",
    "    lo, hi = 0, len(a) - 1",
    "    while lo <= hi:",
    "        mid = (lo + hi) // 2",
    "        if a[mid] == target:",
    "            return mid",
    "        if a[mid] < target:",
    "            lo = mid + 1",
    "        else:",
    "            hi = mid - 1",
    "    return -1"
  ];
  var TEMPLATE =
    '<div class="bsr">' +
      '<div class="bsr-card">' +
        '<header class="bsr-header"><h2 class="bsr-title">BINARY SEARCH</h2><p class="bsr-sub">Finds a value in a sorted list by halving the search range every step.</p>' +
        '<div class="bsr-pills"><span class="bsr-pill bsr-pill-t"><b>TIME</b>O(log n)</span><span class="bsr-pill bsr-pill-s"><b>SPACE</b>O(1)</span></div></header>' +
        '<p class="bsr-target" data-role="target"></p>' +
        '<div class="bsr-row" data-role="row" role="img" aria-label="Sorted list"></div>' +
        '<div class="bsr-legend" aria-hidden="true"><span><i class="lo"></i>lo</span><span><i class="mid"></i>mid</span><span><i class="hi"></i>hi</span><span><i class="out"></i>ruled out</span></div>' +
        '<div class="bsr-msg" data-role="msg" aria-live="polite"></div>' +
        '<pre class="bsr-code" data-role="code" aria-label="Python source with the running lines highlighted"></pre>' +
      '</div>' +
      '<div class="bsr-controls">' +
        '<form class="bsr-row-controls" data-role="form" novalidate>' +
          '<label class="bsr-label" for="bsr-target-input">Target</label>' +
          '<input id="bsr-target-input" class="bsr-input" data-role="tin" type="text" inputmode="numeric" value="14" autocomplete="off" aria-describedby="bsr-error">' +
          '<button type="submit" class="secondary-button">Set</button>' +
          '<button type="button" class="secondary-button" data-role="random">🎲 Random</button>' +
        '</form>' +
        '<div class="bsr-row-controls">' +
          '<button type="button" class="secondary-button" data-role="reset">⏮ Reset</button>' +
          '<button type="button" class="secondary-button" data-role="step">Step ▶|</button>' +
          '<button type="button" class="primary-button bsr-play" data-role="play">▶ Play</button>' +
          '<label class="bsr-visually-hidden" for="bsr-speed">Speed</label>' +
          '<select id="bsr-speed" class="bsr-select" data-role="speed"><option value="1500">Slow</option><option value="900" selected>Normal</option><option value="400">Fast</option></select>' +
        '</div>' +
        '<p class="bsr-error" id="bsr-error" data-role="error" role="alert"></p>' +
        '<p class="bsr-hint">Space = play/pause · → = step. Finish one search to earn the Search Savant badge.</p>' +
        '<p class="bsr-reward" data-role="reward" role="status"></p>' +
      '</div>' +
    '</div>';

  var active = null;

  function create(host, opts) {
    host.innerHTML = TEMPLATE;
    var root = host.firstChild, el = {};
    root.querySelectorAll("[data-role]").forEach(function(node) { el[node.dataset.role] = node; });
    var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var s = null, timer = null, completed = false;
    var speedMs = function() { return Number(el.speed.value); };
    var setDur = function() { root.style.setProperty("--dur", reduceMotion ? "0ms" : Math.min(250, speedMs() / 3) + "ms"); };

    function init(target) {
      stop();
      s = { lo: 0, hi: DATA.length - 1, mid: null, phase: "check", t: target, step: 0, done: false, found: -1 };
      render("Press Step or Play to begin the search for " + target + ".", []);
    }

    function render(message, lines) {
      el.target.textContent = "Target: " + s.t + " · Step " + s.step + " of at most " + MAX_STEPS;
      el.row.innerHTML = DATA.map(function(v, i) {
        var out = s.done ? s.found !== i : (i < s.lo || i > s.hi);
        var cls = "bsr-cell" + (out ? " out" : "") + (i === s.mid ? " mid" : "") + (s.done && s.found === i ? " found" : "");
        var tags = (!s.done && i === s.lo ? '<span class="bsr-tag lo">lo</span>' : "") + (!s.done && i === s.hi ? '<span class="bsr-tag hi">hi</span>' : "");
        return '<div class="' + cls + '"><div class="bsr-tags">' + tags + '</div><div class="bsr-box">' + v + '</div><div class="bsr-idx">' + i + '</div></div>';
      }).join("");
      el.row.setAttribute("aria-label", "Sorted list: " + DATA.join(", ") + (s.mid !== null && !s.done ? ". Checking index " + s.mid + "." : ""));
      el.msg.textContent = message;
      el.code.innerHTML = CODE.map(function(line, i) {
        return '<span class="bsr-ln' + (lines.indexOf(i) >= 0 ? " on" : "") + '"><b>' + (i + 1) + '</b>' + line.replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</span>';
      }).join("");
    }

    function finish(found) {
      stop();
      if (!completed) {
        completed = true;
        var result = opts.onComplete ? opts.onComplete({ steps: s.step, found: found }) : null;
        if (result && result.message) { el.reward.textContent = result.message; el.reward.classList.add("bsr-reward-on"); }
      }
    }

    function step() {
      if (s.done) return;
      if (s.lo > s.hi) { s.done = true; render("The range is empty, so " + s.t + " is not in the list → return -1", [2, 10]); finish(false); return; }
      if (s.phase === "check") {
        s.mid = Math.floor((s.lo + s.hi) / 2); s.step += 1; s.phase = "compare";
        render("mid = (" + s.lo + " + " + s.hi + ") // 2 = " + s.mid + ". Look at a[" + s.mid + "] = " + DATA[s.mid] + ".", [2, 3]);
        return;
      }
      var v = DATA[s.mid];
      s.phase = "check";
      if (v === s.t) { s.done = true; s.found = s.mid; render("a[" + s.mid + "] = " + v + " equals the target → return " + s.mid, [4, 5]); finish(true); }
      else if (v < s.t) { s.lo = s.mid + 1; render(v + " < " + s.t + ", so the target must be to the right. lo = " + s.lo, [6, 7]); }
      else { s.hi = s.mid - 1; render(v + " > " + s.t + ", so the target must be to the left. hi = " + s.hi, [8, 9]); }
    }

    function play() {
      if (s.done) init(s.t);
      el.play.textContent = "⏸ Pause";
      step();
      if (!s.done) timer = setInterval(step, speedMs());
    }
    function stop() { if (timer) clearInterval(timer); timer = null; if (el.play) el.play.textContent = "▶ Play"; }

    function parseTarget(text) {
      var t = String(text).trim();
      if (!/^-?\d{1,3}$/.test(t)) return null;
      return parseInt(t, 10);
    }
    function setError(text) { el.error.textContent = text || ""; el.tin.setAttribute("aria-invalid", text ? "true" : "false"); }

    el.play.addEventListener("click", function() { if (timer) stop(); else play(); });
    el.step.addEventListener("click", function() { stop(); if (s.done) init(s.t); step(); });
    el.reset.addEventListener("click", function() { init(s.t); });
    el.speed.addEventListener("change", function() { setDur(); if (timer) { clearInterval(timer); timer = setInterval(step, speedMs()); } });
    el.form.addEventListener("submit", function(e) {
      e.preventDefault();
      var t = parseTarget(el.tin.value);
      if (t === null) { setError("Enter a whole number, like 14 or 6."); return; }
      setError(""); init(t);
    });
    el.random.addEventListener("click", function() {
      var t = Math.random() < 0.75 ? DATA[Math.floor(Math.random() * DATA.length)] : Math.floor(Math.random() * 25) + 1;
      el.tin.value = t; setError(""); init(t);
    });
    function onKey(e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      var modal = document.getElementById("account-modal-root");
      if (modal && modal.firstChild) return;
      var tag = e.target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Space" && tag !== "BUTTON") { e.preventDefault(); if (timer) stop(); else play(); }
      else if (e.code === "ArrowRight" && tag !== "BUTTON") { e.preventDefault(); el.step.click(); }
    }
    document.addEventListener("keydown", onKey);

    if (opts.alreadyDone) { el.reward.textContent = "✓ Search Savant badge earned — replay any time for practice."; el.reward.classList.add("bsr-reward-on"); }
    setDur(); init(14);

    return function destroy() { stop(); document.removeEventListener("keydown", onKey); host.innerHTML = ""; };
  }

  window.XPBinarySearch = {
    mount: function(host, opts) { this.unmount(); if (host) active = create(host, opts || {}); },
    unmount: function() { if (active) { active(); active = null; } }
  };
})();
