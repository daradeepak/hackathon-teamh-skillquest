(function() {
  "use strict";
  /* Reverse String Lab: step through an in-place two-pointer reversal, forwards and backwards.
     XPReverseString.mount(hostElement, { alreadyDone, onComplete }); XPReverseString.unmount() */
  var CODE = [
    "function reverse(s) {",
    "  let l = 0, r = s.length - 1;",
    "  while (l < r) {",
    "    let tmp = s[l];",
    "    s[l] = s[r];",
    "    s[r] = tmp;",
    "    l++; r--;",
    "  }",
    "}"
  ];
  var WORDS = ["algorithm", "pointer", "reverse", "visualize", "interview", "sandwich", "racecar", "stack overflow"];
  var TEMPLATE =
    '<div class="rsv">' +
      '<div class="rsv-card">' +
        '<header class="rsv-header"><h2 class="rsv-title">REVERSE A STRING</h2><p class="rsv-sub">Two pointers walk inward from both ends and swap characters until they meet.</p>' +
        '<div class="rsv-pills"><span class="rsv-pill rsv-pill-t"><b>TIME</b>O(n)</span><span class="rsv-pill rsv-pill-s"><b>SPACE</b>O(1)</span></div></header>' +
        '<form class="rsv-row-controls rsv-input-row" data-role="form" novalidate>' +
          '<label class="rsv-label" for="rsv-input">String</label>' +
          '<input id="rsv-input" class="rsv-input" data-role="inp" type="text" value="hello world" maxlength="20" spellcheck="false" autocomplete="off" aria-describedby="rsv-error">' +
          '<button type="submit" class="secondary-button">Load</button>' +
          '<button type="button" class="secondary-button" data-role="random">🎲 Random word</button>' +
        '</form>' +
        '<p class="rsv-error" id="rsv-error" data-role="error" role="alert"></p>' +
        '<div class="rsv-stage"><div class="rsv-cells" data-role="cells" role="img" aria-label="Characters of the string"></div></div>' +
        '<p class="rsv-result" data-role="result" aria-live="polite"></p>' +
        '<div class="rsv-bar" aria-hidden="true"><i data-role="prog"></i></div>' +
        '<div class="rsv-msg" data-role="msg" aria-live="polite"></div>' +
        '<div class="rsv-state" data-role="state"></div>' +
        '<pre class="rsv-code" data-role="code" aria-label="JavaScript source with the running line highlighted"></pre>' +
      '</div>' +
      '<div class="rsv-controls">' +
        '<div class="rsv-row-controls">' +
          '<button type="button" class="secondary-button" data-role="first" aria-label="Restart">⏮</button>' +
          '<button type="button" class="secondary-button" data-role="prev">◀ Step</button>' +
          '<button type="button" class="primary-button rsv-play" data-role="play">▶ Play</button>' +
          '<button type="button" class="secondary-button" data-role="next">Step ▶</button>' +
          '<button type="button" class="secondary-button" data-role="last" aria-label="Jump to end">⏭</button>' +
          '<label class="rsv-visually-hidden" for="rsv-speed">Speed</label>' +
          '<select id="rsv-speed" class="rsv-select" data-role="speed"><option value="1500">Slow</option><option value="900" selected>Normal</option><option value="400">Fast</option></select>' +
        '</div>' +
        '<p class="rsv-hint">Space = play/pause · ← → = step. Reach the end once to earn the Pointer Pro badge.</p>' +
        '<p class="rsv-reward" data-role="reward" role="status"></p>' +
      '</div>' +
    '</div>';

  var active = null;
  function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function disp(c) { return c === " " ? "␣" : c; }

  /* Every step is an immutable snapshot, so stepping backwards is just moving an index. */
  function build(str) {
    var a = Array.from(str), n = a.length, out = [], done = [], l = 0, r = n - 1, tmp = null;
    function snap(line, msg, extra) {
      out.push(Object.assign({ arr: a.slice(), line: line, msg: msg, l: null, r: null, tmp: null, swap: false, cmp: false, done: done.slice() }, extra));
    }
    snap(0, "Start with \"" + escHtml(str) + "\" (" + n + " characters).", {});
    if (n < 2) {
      snap(1, n ? "Only one character, so it is already reversed." : "Nothing to do.", { done: a.map(function(_, i) { return i; }) });
      return out;
    }
    snap(1, "Place l at index 0 and r at index " + r + ".", { l: l, r: r });
    while (l < r) {
      snap(2, "Is l (" + l + ") < r (" + r + ")? Yes, keep going.", { l: l, r: r, cmp: true });
      tmp = a[l];
      snap(3, "Save s[" + l + "] = \"" + escHtml(disp(tmp)) + "\" in tmp.", { l: l, r: r, tmp: tmp });
      a[l] = a[r];
      snap(4, "Copy s[" + r + "] = \"" + escHtml(disp(a[r])) + "\" into position " + l + ".", { l: l, r: r, tmp: tmp, swap: true });
      a[r] = tmp;
      snap(5, "Write tmp \"" + escHtml(disp(tmp)) + "\" into position " + r + ". Swap complete.", { l: l, r: r, tmp: tmp, swap: true });
      done.push(l, r);
      snap(6, "Move the pointers inward: l → " + (l + 1) + ", r → " + (r - 1) + ".", { l: l + 1, r: r - 1, tmp: tmp });
      l += 1; r -= 1;
    }
    if (l === r) done.push(l);
    snap(2, "Is l (" + l + ") < r (" + r + ")? No, the pointers have met. The loop ends.", { l: l, r: r, cmp: true });
    snap(8, "Done! The string is now \"" + escHtml(a.join("")) + "\".", { done: a.map(function(_, i) { return i; }) });
    return out;
  }

  function create(host, opts) {
    host.innerHTML = TEMPLATE;
    var root = host.firstChild, el = {};
    root.querySelectorAll("[data-role]").forEach(function(node) { el[node.dataset.role] = node; });
    var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var steps = [], chars = [], pos = 0, timer = null, completed = false;
    var speedMs = function() { return Number(el.speed.value); };
    var setDur = function() { root.style.setProperty("--dur", reduceMotion ? "0ms" : Math.min(300, speedMs() / 3) + "ms"); };
    el.code.innerHTML = CODE.map(function(t, i) { return '<span class="rsv-ln"><b>' + (i + 1) + '</b>' + escHtml(t) + '</span>'; }).join("");

    function load(str) {
      stop(); chars = Array.from(str); steps = build(str); pos = 0;
      el.cells.innerHTML = chars.map(function(_, i) {
        return '<div class="rsv-cell"><div class="rsv-ptr l">l</div><div class="rsv-ptr r">r</div><div class="rsv-box"></div><div class="rsv-idx">' + i + '</div></div>';
      }).join("");
      render();
    }

    function render() {
      var s = steps[pos], cells = el.cells.children, last = pos === steps.length - 1;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i], involved = s.l === i || s.r === i, cls = "rsv-cell";
        if (s.l === i) cls += " L";
        if (s.r === i) cls += " R";
        if (s.cmp && involved) cls += " cmp";
        if (s.swap && involved) cls += " swap";
        else if (s.done.indexOf(i) >= 0) cls += " done";
        c.className = cls;
        c.querySelector(".rsv-box").textContent = disp(s.arr[i]);
      }
      el.cells.setAttribute("aria-label", "Characters: " + s.arr.join(""));
      Array.prototype.forEach.call(el.code.children, function(ln, i) { ln.classList.toggle("on", i === s.line); });
      el.msg.innerHTML = s.msg;
      el.state.innerHTML = '<div><span>l</span><b>' + (s.l === null ? "–" : s.l) + '</b></div><div><span>r</span><b>' + (s.r === null ? "–" : s.r) + '</b></div>' +
        '<div><span>tmp</span><b>' + (s.tmp === null ? "–" : '"' + escHtml(disp(s.tmp)) + '"') + '</b></div><div><span>step</span><b>' + (pos + 1) + ' / ' + steps.length + '</b></div>';
      el.prog.style.width = (steps.length > 1 ? pos / (steps.length - 1) * 100 : 100) + "%";
      el.result.textContent = last ? s.arr.join("") : "";
      el.first.disabled = el.prev.disabled = pos === 0;
      el.next.disabled = el.last.disabled = last;
      el.play.textContent = timer ? "⏸ Pause" : (last ? "↺ Replay" : "▶ Play");
      if (last) finish();
    }

    function finish() {
      if (completed) return;
      completed = true;
      var result = opts.onComplete ? opts.onComplete({ length: chars.length, steps: steps.length }) : null;
      if (result && result.message) { el.reward.textContent = result.message; el.reward.classList.add("rsv-reward-on"); }
    }

    function tick() {
      if (pos < steps.length - 1) { pos += 1; render(); }
      if (pos >= steps.length - 1) stop(); else timer = setTimeout(tick, speedMs());
    }
    function stop() { if (timer) { clearTimeout(timer); timer = null; } if (steps.length) render(); }
    function play() {
      if (timer) { stop(); return; }
      if (pos === steps.length - 1) pos = 0;
      timer = setTimeout(tick, speedMs());
      render();
    }
    function go(to) { stop(); pos = Math.max(0, Math.min(steps.length - 1, to)); render(); }
    function submit() {
      var v = el.inp.value;
      if (!v.length) { el.error.textContent = "Enter at least one character."; el.inp.setAttribute("aria-invalid", "true"); return; }
      el.error.textContent = ""; el.inp.setAttribute("aria-invalid", "false"); load(v);
    }

    el.form.addEventListener("submit", function(e) { e.preventDefault(); submit(); });
    el.random.addEventListener("click", function() { el.inp.value = WORDS[Math.floor(Math.random() * WORDS.length)]; submit(); });
    el.play.addEventListener("click", play);
    el.next.addEventListener("click", function() { go(pos + 1); });
    el.prev.addEventListener("click", function() { go(pos - 1); });
    el.first.addEventListener("click", function() { go(0); });
    el.last.addEventListener("click", function() { go(steps.length - 1); });
    el.speed.addEventListener("change", setDur);
    function onKey(e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      var modal = document.getElementById("account-modal-root");
      if (modal && modal.firstChild) return;
      var tag = e.target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Space" && tag !== "BUTTON") { e.preventDefault(); play(); }
      else if (e.code === "ArrowRight" && tag !== "BUTTON") { e.preventDefault(); go(pos + 1); }
      else if (e.code === "ArrowLeft" && tag !== "BUTTON") { e.preventDefault(); go(pos - 1); }
    }
    document.addEventListener("keydown", onKey);

    if (opts.alreadyDone) { el.reward.textContent = "✓ Pointer Pro badge earned — replay any time for practice."; el.reward.classList.add("rsv-reward-on"); }
    setDur(); load(el.inp.value);

    return function destroy() { stop(); document.removeEventListener("keydown", onKey); host.innerHTML = ""; };
  }

  window.XPReverseString = {
    mount: function(host, opts) { this.unmount(); if (host) active = create(host, opts || {}); },
    unmount: function() { if (active) { active(); active = null; } }
  };
})();
