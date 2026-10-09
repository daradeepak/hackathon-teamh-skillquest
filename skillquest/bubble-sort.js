(function() {
  "use strict";
  /* Bubble Sort Lab — an interactive, step-by-step visualizer.
     buildSteps() turns the algorithm into frames; the UI only renders frame N,
     so play, pause, step back and scrubbing all share one code path.
     Usage: SkillQuestBubbleSort.mount(hostElement, { alreadyDone, onComplete }); .unmount() */
  var STEP = 44, BAR_W = 34, MIN_N = 3, MAX_N = 12, DEFAULT_CARD_W = 420, DEFAULT_VALUES = [3, 2, 7, 8, 5, 4, 1, 6];
  var CODE = [
    '<span class="bs-k">def</span> <span class="bs-f">bubble_sort</span>(a):',
    '    n = <span class="bs-f">len</span>(a)',
    '    <span class="bs-k">for</span> p <span class="bs-k">in</span> <span class="bs-f">range</span>(n - <span class="bs-n">1</span>):',
    '        swapped = <span class="bs-b">False</span>',
    '        <span class="bs-k">for</span> i <span class="bs-k">in</span> <span class="bs-f">range</span>(n - <span class="bs-n">1</span> - p):',
    '            <span class="bs-k">if</span> a[i] &gt; a[i + <span class="bs-n">1</span>]:',
    '                a[i], a[i + <span class="bs-n">1</span>] = a[i + <span class="bs-n">1</span>], a[i]',
    '                swapped = <span class="bs-b">True</span>',
    '        <span class="bs-k">if not</span> swapped:',
    '            <span class="bs-k">break</span>'
  ];
  var MASCOT = '<svg width="60" height="92" viewBox="0 0 60 92" aria-hidden="true" focusable="false">' +
    '<circle cx="30" cy="2" r="3" fill="#ddd"/><rect x="22" y="3" width="6" height="14" rx="3" fill="#c9d3e8"/><rect x="32" y="3" width="6" height="14" rx="3" fill="#c9d3e8"/>' +
    '<path d="M6 22 L14 26 M54 22 L46 26" stroke="#ff7a45" stroke-width="6" stroke-linecap="round"/><path d="M14 26 L6 42 M46 26 L54 42" stroke="#ff7a45" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="6" cy="44" r="4.5" fill="#ffd166"/><circle cx="54" cy="44" r="4.5" fill="#ffd166"/><rect x="14" y="16" width="32" height="30" rx="10" fill="#ff7a45"/>' +
    '<circle cx="30" cy="31" r="5.5" fill="#ffd166"/><rect x="26" y="45" width="8" height="6" fill="#9aa7c4"/><rect x="14" y="50" width="32" height="28" rx="13" fill="#e8eefc"/>' +
    '<rect x="18" y="57" width="24" height="12" rx="6" fill="#10162a"/><circle cx="25" cy="63" r="2.6" fill="#35d0ff"/><circle cx="35" cy="63" r="2.6" fill="#35d0ff"/>' +
    '<line x1="30" y1="78" x2="30" y2="85" stroke="#9aa7c4" stroke-width="2"/><circle cx="30" cy="87" r="3.2" fill="#ffd166"/></svg>';
  var TEMPLATE =
    '<div class="bs">' +
      '<div class="bs-fit" data-role="fit"><div class="bs-card">' +
        '<header class="bs-header"><h2 class="bs-title">BUBBLE SORT</h2>' +
        '<p class="bs-sub">Repeatedly swaps adjacent out-of-order pairs, letting larger values bubble toward the end.</p>' +
        '<div class="bs-pills"><span class="bs-pill bs-pill-t"><b>TIME</b>O(n²)</span><span class="bs-pill bs-pill-s"><b>SPACE</b>O(1)</span></div></header>' +
        '<div class="bs-stage" data-role="stage">' +
          '<div class="bs-mascot" data-role="mascot">' + MASCOT + '</div>' +
          '<div class="bs-persp"><div class="bs-scene" data-role="scene" role="img" aria-label="Bars to sort">' +
            '<div class="bs-box bs-platform"><i class="bs-fr"></i><i class="bs-tp"></i><i class="bs-rt"></i></div>' +
            '<div class="bs-bars" data-role="bars"></div><div class="bs-slots" data-role="slots"></div>' +
          '</div></div>' +
        '</div>' +
        '<div class="bs-narr"><span class="bs-dot"></span><span data-role="msg" aria-live="polite"></span></div>' +
        '<div class="bs-stats"><span>COMPARISONS <b data-role="cmp">0</b></span><span>SWAPS <b data-role="swp">0</b></span><span>STEP <b data-role="stp">0</b>/<b data-role="tot">0</b></span></div>' +
        '<div class="bs-code" data-role="code" aria-label="Python source with the running line highlighted"></div>' +
      '</div></div>' +
      '<div class="bs-controls" data-role="controls">' +
        '<label class="bs-visually-hidden" for="bs-seek">Scrub through steps</label><input id="bs-seek" class="bs-seek" data-role="seek" type="range" min="0" value="0">' +
        '<div class="bs-row">' +
          '<button type="button" class="secondary-button" data-role="reset" aria-label="Back to the start">⏮</button>' +
          '<button type="button" class="secondary-button" data-role="prev" aria-label="Previous step">◀</button>' +
          '<button type="button" class="primary-button bs-play" data-role="play">▶ Play</button>' +
          '<button type="button" class="secondary-button" data-role="next" aria-label="Next step">▶|</button>' +
          '<label class="bs-visually-hidden" for="bs-speed">Speed</label>' +
          '<select id="bs-speed" class="bs-select" data-role="speed"><option value="1.6">0.5×</option><option value="1" selected>1×</option><option value="0.55">2×</option><option value="0.3">4×</option></select>' +
        '</div>' +
        '<form class="bs-row bs-custom" data-role="form" novalidate>' +
          '<label class="bs-visually-hidden" for="bs-values">Numbers to sort, comma separated (' + MIN_N + "-" + MAX_N + ' values)</label>' +
          '<input id="bs-values" class="bs-input" data-role="values" value="' + DEFAULT_VALUES.join(",") + '" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="e.g. 3,2,7,8,5">' +
          '<button type="submit" class="secondary-button">Load</button><button type="button" class="secondary-button" data-role="shuffle">Shuffle</button>' +
        '</form>' +
        '<p class="bs-error" data-role="error" role="alert"></p>' +
        '<p class="bs-hint">Space = play/pause · ← → = step · Watch every step to earn the Sort Sprinter badge.</p>' +
        '<p class="bs-reward" data-role="reward" role="status"></p>' +
      '</div>' +
    '</div>';

  var active = null;

  /* ---------- algorithm -> frames ---------- */
  function buildSteps(v) {
    var n = v.length, order = v.map(function(_, i) { return i; }), out = [], cmp = 0, swp = 0, sorted = 0;
    function push(o) { out.push(Object.assign({ order: order.slice(), active: [], sorted: sorted, lines: [], msg: "", cmp: cmp, swp: swp, hop: null, kind: "", done: false }, o)); }
    push({ msg: "Start with " + n + " bars. Press ▶ Play and watch the largest values bubble to the right." });
    for (var p = 0; p < n - 1; p++) {
      push({ lines: [3], msg: "Pass " + (p + 1) + ": bubble the largest unsorted value to the end." });
      push({ lines: [4], msg: "Reset swapped = False for this pass." });
      var swapped = false;
      for (var i = 0; i < n - 1 - p; i++) {
        cmp++;
        var a = v[order[i]], b = v[order[i + 1]];
        push({ lines: [5, 6], active: [i, i + 1], kind: "cmp", msg: a > b ? "Compare " + a + " and " + b + ": " + a + " > " + b + ", so they are out of order." : "Compare " + a + " and " + b + ": " + a + " ≤ " + b + ", already in order — no swap." });
        if (a > b) {
          var ia = order[i], ib = order[i + 1], tmp = order[i];
          order[i] = order[i + 1]; order[i + 1] = tmp;
          swp++; swapped = true;
          push({ lines: [7, 8], active: [i, i + 1], kind: "swap", hop: [ia, ib], msg: "Swap! " + a + " moves right, " + b + " moves left. swapped = True." });
        }
      }
      sorted = p + 1;
      if (!swapped) {
        push({ lines: [9], msg: "No swaps happened in this pass, so the array is already sorted." });
        push({ lines: [10], msg: "break — we can stop early." });
        sorted = n; break;
      }
      push({ lines: [9], msg: v[order[n - 1 - p]] + " is now locked in its final place. Swaps happened, so go again." });
    }
    sorted = n;
    push({ done: true, msg: "Sorted in " + cmp + " comparisons and " + swp + " swaps. 🎉" });
    return out;
  }

  /* ---------- one mounted instance ---------- */
  function create(host, opts) {
    host.innerHTML = TEMPLATE;
    var root = host.firstChild;
    var el = {};
    root.querySelectorAll("[data-role]").forEach(function(node) { el[node.dataset.role] = node; });
    var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var vals = DEFAULT_VALUES.slice(), steps = [], cur = 0, reached = 0, timer = null, scale = 1, completed = false, resizeObs = null, cardW = DEFAULT_CARD_W;

    function speedMs() { return 900 * parseFloat(el.speed.value); }
    function setDur() { root.style.setProperty("--dur", (reduceMotion ? 0 : Math.min(450, speedMs() * 0.5)) + "ms"); }

    function layoutWidth(n) {
      return Math.max(DEFAULT_CARD_W, n * STEP + 96);
    }

    function barHeight(v, maxV) {
      var cap = Math.max(maxV, 1);
      return Math.round(28 + (v / cap) * 88);
    }

    function applyCardWidth(w) {
      cardW = w;
      el.fit.style.width = cardW + "px";
      el.scene.style.width = cardW + "px";
      el.bars.style.width = cardW + "px";
      el.slots.style.width = cardW + "px";
      var platform = el.scene.querySelector(".bs-platform");
      if (platform) platform.style.setProperty("--w", Math.max(120, vals.length * STEP + 48) + "px");
    }

    function buildScene() {
      el.bars.innerHTML = ""; el.slots.innerHTML = "";
      var n = vals.length, maxV = Math.max.apply(null, vals);
      applyCardWidth(layoutWidth(n));
      var firstSlot = cardW / 2 - ((n - 1) * STEP) / 2;
      var baseLeft = firstSlot - BAR_W / 2;
      vals.forEach(function(v, id) {
        var h = barHeight(v, maxV), bar = document.createElement("div");
        bar.className = "bs-box bs-bar"; bar.dataset.id = id;
        bar.style.cssText = "--h:" + h + "px;left:" + baseLeft + "px;top:" + (-h) + "px";
        bar.innerHTML = '<div class="bs-cube bs-box" style="--w:' + BAR_W + 'px;--h:' + h + 'px;--d:34px;left:0;top:0"><i class="bs-fr">' + v + '</i><i class="bs-tp"></i><i class="bs-rt"></i></div>';
        el.bars.appendChild(bar);
      });
      for (var i = 0; i < n; i++) {
        var slot = document.createElement("div"); slot.className = "bs-slot";
        slot.style.left = (firstSlot + i * STEP) + "px"; el.slots.appendChild(slot);
      }
      el.code.innerHTML = CODE.map(function(line, i) { return '<span class="bs-ln" data-l="' + (i + 1) + '"><i>' + (i + 1) + '</i>' + line + '</span>'; }).join("");
    }

    function init(newVals) {
      stop(); vals = newVals; steps = buildSteps(vals); cur = 0; reached = 0;
      buildScene(); el.seek.max = steps.length - 1; el.tot.textContent = steps.length - 1;
      render(0, false);
      fit();
    }

    function render(idx, animate) {
      cur = idx;
      var s = steps[idx], n = vals.length, slotOf = {};
      s.order.forEach(function(id, slot) { slotOf[id] = slot; });
      Array.prototype.forEach.call(el.bars.children, function(bar) {
        var id = +bar.dataset.id, slot = slotOf[id];
        bar.style.transform = "translateX(" + slot * STEP + "px)";
        bar.classList.toggle("sorted", slot >= n - s.sorted);
        bar.classList.toggle("active", s.kind === "cmp" && s.active.indexOf(slot) >= 0);
        bar.classList.toggle("swap", s.kind === "swap" && s.active.indexOf(slot) >= 0);
        bar.classList.remove("hopA", "hopB");
        if (animate && !reduceMotion && s.hop && s.hop.indexOf(id) >= 0) { void bar.offsetWidth; bar.classList.add(id === s.hop[0] ? "hopA" : "hopB"); }
      });
      Array.prototype.forEach.call(el.code.children, function(line) { line.classList.toggle("hl", s.lines.indexOf(+line.dataset.l) >= 0); });
      el.msg.textContent = s.msg; el.cmp.textContent = s.cmp; el.swp.textContent = s.swp;
      el.stp.textContent = idx; el.seek.value = idx;
      el.scene.setAttribute("aria-label", "Bars from left to right: " + s.order.map(function(id) { return vals[id]; }).join(", "));
      placeMascot(s);
    }

    /* sequential moves (play / next) count toward completion; scrubbing straight to the end does not */
    function advanceTo(idx) {
      render(idx, true);
      if (idx === reached + 1) reached = idx;
      if (reached >= steps.length - 1 && !completed) {
        completed = true;
        var result = opts.onComplete ? opts.onComplete({ comparisons: steps[idx].cmp, swaps: steps[idx].swp }) : null;
        showReward(result);
      }
    }

    function showReward(result) {
      if (!result) return;
      el.reward.textContent = result.message || "";
      el.reward.classList.toggle("bs-reward-on", !!result.message);
    }

    function placeMascot(s) {
      var sr = el.stage.getBoundingClientRect(), n = vals.length, mascot = el.mascot;
      var slotIdx = s.active.length ? (s.active[0] + s.active[1]) / 2 : (s.done ? (n - 1) / 2 : (mascot.dataset.i ? +mascot.dataset.i : (n - 1) / 2));
      mascot.dataset.i = slotIdx;
      var a = el.slots.children[Math.floor(slotIdx)].getBoundingClientRect(), b = el.slots.children[Math.ceil(slotIdx)].getBoundingClientRect();
      var x = ((a.left + b.left) / 2 - sr.left) / scale;
      var ids = s.active.length ? s.active.map(function(i) { return s.order[i]; }) : s.order;
      var maxV = Math.max.apply(null, vals);
      var hMax = Math.max.apply(null, ids.map(function(id) { return barHeight(vals[id], maxV); }));
      var hover = s.kind === "swap" ? 14 : (s.kind === "cmp" ? 26 : 50);
      var y = (a.top - sr.top) / scale - hMax * 0.8 - 92 - hover;
      mascot.style.left = x + "px";
      mascot.style.top = Math.max(8, y) + "px";
      mascot.classList.toggle("dance", s.done && !reduceMotion);
    }

    /* ---------- playback ---------- */
    function play() {
      if (cur >= steps.length - 1) { render(0, false); reached = 0; }
      el.play.textContent = "⏸ Pause";
      function tick() {
        if (cur >= steps.length - 1) { stop(); return; }
        advanceTo(cur + 1);
        timer = setTimeout(tick, steps[cur].kind === "swap" ? speedMs() * 1.15 : speedMs());
      }
      timer = setTimeout(tick, 250);
    }
    function stop() { clearTimeout(timer); timer = null; if (el.play) el.play.textContent = "▶ Play"; }
    function toggle() { if (timer) stop(); else play(); }

    function parseValues(text) {
      var parts = text.split(",").map(function(x) { return x.trim(); }).filter(function(x) { return x.length; });
      if (parts.length < MIN_N || parts.length > MAX_N) return null;
      var nums = parts.map(function(x) { return /^\d+$/.test(x) ? parseInt(x, 10) : NaN; });
      if (nums.some(function(x) { return !(x >= 1 && x <= 999); })) return null;
      return nums;
    }
    function setError(text) { el.error.textContent = text || ""; el.values.setAttribute("aria-invalid", text ? "true" : "false"); }

    el.play.addEventListener("click", toggle);
    el.next.addEventListener("click", function() { stop(); if (cur < steps.length - 1) advanceTo(cur + 1); });
    el.prev.addEventListener("click", function() { stop(); if (cur > 0) render(cur - 1, false); });
    el.reset.addEventListener("click", function() { stop(); render(0, false); });
    el.seek.addEventListener("input", function(e) { stop(); render(+e.target.value, false); });
    el.speed.addEventListener("change", setDur);
    el.shuffle.addEventListener("click", function() {
      var n = MIN_N + Math.floor(Math.random() * (MAX_N - MIN_N + 1));
      var a = [];
      for (var k = 0; k < n; k++) a.push(1 + Math.floor(Math.random() * Math.max(n * 2, 12)));
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
      el.values.value = a.join(","); setError(""); init(a);
    });
    el.form.addEventListener("submit", function(e) {
      e.preventDefault();
      var nums = parseValues(el.values.value);
      if (!nums) { setError("Enter " + MIN_N + "–" + MAX_N + " whole numbers (1–999), separated by commas."); return; }
      setError(""); init(nums);
    });
    function onKey(e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.getElementById("account-modal-root").firstChild) return;
      var tag = e.target.tagName, isRange = tag === "INPUT" && e.target.type === "range";
      if ((tag === "INPUT" && !isRange) || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Space" && tag !== "BUTTON") { e.preventDefault(); toggle(); }
      else if (e.code === "ArrowRight" && !isRange) { e.preventDefault(); el.next.click(); }
      else if (e.code === "ArrowLeft" && !isRange) { e.preventDefault(); el.prev.click(); }
    }
    document.addEventListener("keydown", onKey);

    function fit() {
      var width = host.clientWidth || cardW;
      scale = Math.min(1, width / cardW);
      el.fit.style.transform = "scale(" + scale + ")";
      el.fit.style.marginBottom = (-(1 - scale) * el.fit.offsetHeight) + "px";
      el.controls.style.width = Math.min(cardW, width) + "px";
      if (steps.length) placeMascot(steps[cur]);
    }
    if (window.ResizeObserver) { resizeObs = new ResizeObserver(fit); resizeObs.observe(host); }
    else window.addEventListener("resize", fit);

    if (opts.alreadyDone) showReward({ message: "✓ Sort Sprinter badge earned — replay any time for practice." });
    setDur(); fit(); init(vals); fit();

    return function destroy() {
      stop();
      document.removeEventListener("keydown", onKey);
      if (resizeObs) resizeObs.disconnect(); else window.removeEventListener("resize", fit);
      host.innerHTML = "";
    };
  }

  window.SkillQuestBubbleSort = {
    mount: function(host, opts) { this.unmount(); if (host) active = create(host, opts || {}); },
    unmount: function() { if (active) { active(); active = null; } }
  };
})();
