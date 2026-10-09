/* AI Code Check + Animated (Pip's explainers, JavaScript Trail).
   Ported from Deepak's version on main and plugged into the XPaddition app (developer-app.js).
   The host app calls XPAICheck.attach(ctx) once, then XPAICheck.render(view) for the views listed in VIEWS.
   All markup here uses data-ai-* attributes so it never collides with the host's click handler. */
(function() {
  "use strict";
  var C = window.XP_AICHECK, G = C.games, LEVELS = C.coreLevels;
  var VISUALS = window.DEVQUEST_VISUALS.items, JS_LESSONS = window.DEVQUEST_JS_LESSONS.lessons, ALL_VISUALS = VISUALS.concat(JS_LESSONS);
  var VIEWS = ["aimap", "aigame", "jstrail", "jscinema", "visuals"], VISUAL_VIEWS = ["aigame", "jscinema", "visuals"];
  var ctx = null, aiTrack = "core", current = null, hint = false, session = fresh();
  var visualId = VISUALS[0].id, visualStep = 0, visualPlaying = false, visualTimer = null;

  function fresh() { return { choice: null, items: [], lines: [], verdicts: {}, evidence: {}, activeCriterion: null, scope: false, scopeTouched: false, reviews: {}, code: "", tests: null, result: null }; }
  function blank() { return { played: [], best: {}, bosses: [], chests: [], rematchAt: {}, combo: 0, bestCombo: 0 }; }
  /* Keeps only valid saved values (old saves, other versions, or hand-edited data). */
  function normalize(x) {
    var out = blank();
    if (!x || typeof x !== "object" || Array.isArray(x)) return out;
    var isGame = function(id) { return Object.prototype.hasOwnProperty.call(G, id); };
    if (Array.isArray(x.played)) out.played = x.played.filter(isGame);
    if (Array.isArray(x.bosses)) out.bosses = x.bosses.filter(isGame);
    if (Array.isArray(x.chests)) out.chests = x.chests.filter(isGame);
    if (x.best && typeof x.best === "object") Object.keys(x.best).forEach(function(id) { var v = Number(x.best[id]); if (isGame(id) && isFinite(v)) out.best[id] = Math.max(0, Math.min(100, Math.round(v))); });
    if (x.rematchAt && typeof x.rematchAt === "object") Object.keys(x.rematchAt).forEach(function(id) { var v = Number(x.rematchAt[id]); if (isGame(id) && isFinite(v)) out.rematchAt[id] = v; });
    out.combo = Math.max(0, Math.floor(Number(x.combo)) || 0); out.bestCombo = Math.max(0, Math.floor(Number(x.bestCombo)) || 0);
    return out;
  }
  function normalizeLessons(list) { return Array.isArray(list) ? list.filter(function(id) { return JS_LESSONS.some(function(l) { return l.id === id; }); }) : []; }

  function st() { return ctx.state(); }
  function A() { var s = st(); if (!s.aicheck) s.aicheck = blank(); return s.aicheck; }
  function jsDone() { var s = st(); if (!Array.isArray(s.jsLessons)) s.jsLessons = []; return s.jsLessons; }
  function esc(x) { return ctx.esc(x); }
  function has(a, x) { return a.indexOf(x) >= 0; }
  function root() { return ctx.root; }

  /* ---------- progression ---------- */
  function isBoss(id) { return LEVELS.some(function(l) { return l.boss === id; }); }
  function bossBeat(id) { return has(A().bosses, id); }
  function levelOpen(n) { return n === 1 || bossBeat(LEVELS[n - 2].boss); }
  function okayCount(n) { return LEVELS[n - 1].games.filter(function(id) { return (A().best[id] || 0) >= 60; }).length; }
  function bossOpen(n) { var l = LEVELS[n - 1]; return bossBeat(l.boss) || okayCount(n) >= 3; }
  function canOpen(id) { var g = G[id]; return !!g && (g.track === "ai" || (levelOpen(g.level) && (!isBoss(id) || bossOpen(g.level)))); }
  function currentLevel() { var n = 1; LEVELS.forEach(function(l) { if (levelOpen(l.id)) n = l.id; }); return n; }
  function nextGame() {
    var l = LEVELS[currentLevel() - 1], id = l.games.find(function(k) { return !has(A().played, k); });
    if (id) return id;
    if (bossOpen(l.id) && !bossBeat(l.boss)) return l.boss;
    return l.games[0];
  }

  /* ---------- navigation ---------- */
  function openView(name) {
    stopVisualPlayback();
    if (name === "map") { aiTrack = "core"; ctx.go("aimap"); }
    else if (name === "ai-track") { aiTrack = "ai"; ctx.go("aimap"); }
    else if (name === "jstrail") ctx.go("jstrail");
    else if (name === "cinema") ctx.go("jscinema");
    else if (name === "visuals") ctx.go("visuals");
  }
  function openGame(id) {
    if (!G[id]) return;
    if (!canOpen(id)) { ctx.say(isBoss(id) ? "Win 3 games at Okay or better to unlock this boss." : "Beat the earlier boss to open this level."); return; }
    stopVisualPlayback();
    var v = visualForGame(id); if (v) { visualId = v.id; visualStep = 0; }
    current = id; hint = false; session = fresh();
    if (G[id].kind === "codeFix") session.code = G[id].starterCode;
    ctx.go("aigame");
  }
  function redraw() { ctx.redraw(); }

  /* ---------- AI Code Check map ---------- */
  function tile(id) {
    var g = G[id], a = A(), done = has(a.played, id), locked = !canOpen(id), rematch = a.rematchAt[id] && a.rematchAt[id] <= Date.now();
    var icon = isBoss(id) ? "👑" : (id.indexOf("bug") >= 0 || id.indexOf("security") >= 0 ? "🐛" : (id.indexOf("spec") >= 0 ? "🧾" : (id.indexOf("test") >= 0 ? "🧪" : (id.indexOf("predict") >= 0 ? "🔢" : "🔍"))));
    return '<button class="dev-game-tile ' + (done ? "played " : "") + (locked ? "locked " : "") + (rematch ? "is-rematch " : "") + '" data-ai-game="' + id + '"' + (locked ? " disabled" : "") + '><span class="dev-game-icon">' + icon +
      '</span><span class="dev-game-text"><strong>' + esc(g.title) + '</strong><small>' + (rematch ? "REMATCH READY" : (isBoss(id) ? "BOSS ROUND" : esc(g.engine))) + '</small></span><span class="dev-game-status">' + (locked ? "🔒" : (done ? ((a.best[id] || 0) >= 60 ? "✓" : "↻") : "→")) + '</span></button>';
  }
  function levelCard(l) {
    var locked = !levelOpen(l.id), played = l.games.filter(function(id) { return has(A().played, id); }).length, ok = okayCount(l.id), boss = bossOpen(l.id), beat = bossBeat(l.boss);
    return '<section class="dev-level-card ' + l.color + (locked ? " is-locked" : "") + '"><header class="dev-level-head"><span class="dev-level-icon">' + (locked ? "🔒" : l.icon) + '</span><div class="dev-level-info"><span class="dev-eyebrow">LEVEL ' + l.id + (beat ? " · CLEARED!" : "") + '</span><h2>' + esc(l.name) + '</h2><p>' + esc(l.subtitle) + '</p></div><div class="dev-level-count">' + (locked ? "LOCKED" : played + "/" + l.games.length + " games") + '</div></header>' +
      (locked ? '<div class="dev-locked-note">Beat the Level ' + (l.id - 1) + ' boss to open this zone. 🔒</div>' :
        '<div class="dev-game-grid">' + l.games.map(tile).join("") + '</div><div class="dev-boss-row ' + (boss ? "boss-ready" : "") + '"><div class="boss-badge">👑</div><div class="boss-info"><strong>BOSS ROUND · ' + esc(G[l.boss].title) + '</strong><span>' + (beat ? "Boss cleared! You did the thing." : (boss ? "Unlocked. Go show what you know." : "Win 3 games at Okay or better · " + ok + "/3 so far")) + '</span></div><button class="boss-button" data-ai-game="' + l.boss + '"' + (!boss ? " disabled" : "") + '>' + (beat ? "Replay" : (boss ? "Fight boss →" : "🔒")) + '</button></div>') + '</section>';
  }
  function mapPage() {
    var subtabs = '<div class="dev-track-tabs"><button class="track-tab ' + (aiTrack === "core" ? "is-active" : "") + '" data-ai-open="map">Developer Core</button><button class="track-tab ' + (aiTrack === "ai" ? "is-active" : "") + '" data-ai-open="ai-track">AI Engineer ✨</button></div>';
    var body = aiTrack === "ai"
      ? '<section class="dev-ai-banner"><span>🧪</span><div><strong>Two teaser games are ready to play.</strong><p>More role packs can be added as content, not new game engines.</p></div></section><section class="dev-ai-games">' + C.aiTrack.games.map(tile).join("") + '</section>'
      : '<section class="dev-map-intro"><span class="dev-map-mascot">🦊</span><div><strong>Hey, ' + esc(st().name) + '!</strong> Win any 3 games in a level at <b>Okay</b> or better to unlock its boss. Beat the boss to open the next level.</div></section><div class="dev-levels">' + LEVELS.map(levelCard).join("") + '</div>';
    root().innerHTML = '<div class="sk ai-scope"><section class="sk-head"><div><span class="sk-eyebrow">CAPABILITY MAP</span><h1>Game Map</h1><p>AI writes the code. Check that it does what the ticket asked, and nothing else.</p></div>' + ctx.trackTabs("ai") + '</section>' +
      '<section class="sk-sec-head"><div><span class="sk-eyebrow">AI CODE CHECK</span><h2>' + (aiTrack === "ai" ? "🤖 AI Engineer teaser" : "Read it · Check it · Own it") + '</h2></div>' + subtabs + '</section>' + body +
      '<p class="dev-fineprint">All code and incidents are fictional demo content. Scores are for practice, not performance reviews.</p></div>';
  }

  /* ---------- game screen ---------- */
  function gameTop(g) {
    var l = g.level ? LEVELS[g.level - 1] : null;
    return '<div class="dev-game-top"><button class="back-link" data-ai-open="' + (g.track === "ai" ? "ai-track" : "map") + '">← Back to AI Code Check</button><div class="dev-engine-tag">' + (l ? l.icon + " Level " + g.level + " · " + esc(l.name) : "🤖 AI Engineer teaser") + '<span>' + esc(g.engine) + '</span></div><div class="dev-game-meter"><span style="width:' + (g.level ? g.level * 33.33 : 100) + '%"></span></div></div>';
  }
  function code(lines) { return '<pre class="dev-code"><code>' + esc(lines.join("\n")) + '</code></pre>'; }
  function codeLines(lines, selected) {
    return '<div class="dev-code-list">' + lines.map(function(line, i) { var yes = has(selected || [], i); return '<button class="dev-code-line ' + (yes ? "selected" : "") + '" data-ai-line="' + i + '"><span class="line-no">' + (i + 1) + '</span><code>' + esc(line) + '</code><span class="line-mark">' + (yes ? "✦" : "") + '</span></button>'; }).join("") + '</div>';
  }
  function gameScreen() {
    var g = G[current];
    if (!g) { openView("map"); return; }
    root().innerHTML = '<div class="dev-game-page ai-scope">' + gameTop(g) + '<section class="dev-game-card"><div class="dev-game-heading"><span class="dev-eyebrow">' + esc(g.skill) + '</span><h1>' + esc(g.title) + '</h1><p>' + esc(g.intro) + '</p></div>' +
      (session.result ? resultCard(g) : body(g)) +
      (!session.result ? '<div class="dev-game-footer"><button class="dev-hint-button" data-ai-act="hint">' + (hint ? "🙈 Hide hint" : "💡 Need a nudge?") + '</button><button class="primary-button" data-ai-act="submit">' + (g.kind === "codeFix" ? "Run the tests" : (g.kind === "specCheck" ? "Check this diff" : (g.kind === "prReview" ? "Send review to DevBot" : "Lock in my answer"))) + ' →</button></div>' + (hint ? '<div class="dev-hint"><b>Pip’s tiny hint:</b> ' + esc(g.concept) + '</div>' : "") : "") +
      '</section>' + renderVisualPlayer((visualForGame(g.id) || VISUALS[0]).id, true) + '</div>';
    var submitButton = root().querySelector("[data-ai-act='submit']");
    if (submitButton && !session.result && !canSubmit(g)) submitButton.disabled = true;
  }
  function body(g) {
    if (g.kind === "choice") return (g.code ? code(g.code) : "") + '<h2 class="dev-question">' + esc(g.question) + '</h2><div class="dev-choices">' + g.options.map(function(x, i) { return '<button class="dev-choice ' + (session.choice === i ? "picked" : "") + '" data-ai-choice="' + i + '"><span class="choice-letter">' + String.fromCharCode(65 + i) + '</span><span>' + esc(x) + '</span></button>'; }).join("") + '</div>';
    if (g.kind === "tapLine") return '<div class="tap-instruction">Tap every line you want to flag.</div>' + codeLines(g.code, session.lines) + '<div class="dev-selected-count">🔎 ' + session.lines.length + ' selected</div>';
    if (g.kind === "multiSelect") return '<div class="tap-instruction">Tap every card that belongs in your answer.</div><div class="dev-pick-cards">' + g.items.map(function(x) { var yes = has(session.items, x.id); return '<button class="dev-pick-card ' + (yes ? "picked" : "") + '" data-ai-item="' + esc(x.id) + '"><span class="pick-check">' + (yes ? "✓" : "+") + '</span><strong>' + esc(x.title) + '</strong><small>' + esc(x.detail) + '</small></button>'; }).join("") + '</div>';
    if (g.kind === "specCheck") return specBody(g);
    if (g.kind === "prReview") return prBody(g);
    if (g.kind === "codeFix") return codeFixBody(g);
    return "";
  }
  function specBody(g) {
    var criteria = g.requirements.map(function(r, i) {
      var v = session.verdicts[i], e = session.evidence[i], active = session.activeCriterion === i;
      return '<div class="spec-criterion ' + (active ? "active" : "") + '"><div class="spec-criterion-text"><span>' + (i + 1) + '</span><strong>' + esc(r.text) + '</strong></div><div class="spec-verdicts"><button class="' + (v === "met" ? "chosen good" : "") + '" data-ai-verdict="' + i + '" data-ai-value="met">✓ Met</button><button class="' + (v === "missing" ? "chosen bad" : "") + '" data-ai-verdict="' + i + '" data-ai-value="missing">✕ Missing</button></div><button class="evidence-pick ' + (active ? "active" : "") + '" data-ai-evidence="' + i + '">' + (active ? "Now tap a code line ↓" : (typeof e === "number" ? "Evidence: line " + (e + 1) + " · change" : "Pick evidence line")) + '</button></div>';
    }).join("");
    return '<div class="ticket-card"><span>🎟️ SHOP-214 · ACCEPTANCE CRITERIA</span><strong>Coupon at checkout</strong><p>Apply an active code, allow one use per customer, reject expired coupons, and keep the total at or above ₹0.</p></div><div class="spec-layout"><div class="spec-criteria"><div class="spec-subhead">Does the diff meet it?</div>' + criteria + '</div><div class="spec-diff"><div class="spec-subhead">AI CHANGE · TAP EVIDENCE</div>' + codeLines(g.code, []) + '<label class="scope-flag"><input type="checkbox" data-ai-scope ' + (session.scope ? "checked" : "") + '> <span><b>Flag scope creep</b><small>' + esc(g.scopeCreep) + '</small></span></label></div></div><p class="dev-inline-tip">' + (session.activeCriterion === null ? "Pick a criterion, choose Met or Missing, then choose its evidence line." : "Now tap the code line that best supports this answer.") + '</p>';
  }
  function prBody(g) {
    return '<div class="ticket-card"><span>🎟️ TICKET SHOP-214</span><p>' + esc(g.ticket) + '</p></div><div class="devbot-chat"><span class="devbot-face">🤖</span><div><strong>DevBot says:</strong><p>“I added the coupon logic and cleaned up a few things while I was in there. Ready to merge?”</p><small>Scripted demo chat · works offline</small></div></div><div class="pr-issue-list">' +
      g.issues.map(function(x, i) { var v = session.reviews[x.id]; return '<div class="pr-issue"><div class="pr-issue-num">0' + (i + 1) + '</div><p>' + esc(x.title) + '</p><button class="' + (v === true ? "picked" : "") + '" data-ai-review="' + esc(x.id) + '" data-ai-flag="true">🚩 Flag it</button><button class="' + (v === false ? "picked" : "") + '" data-ai-review="' + esc(x.id) + '" data-ai-flag="false">✅ Looks good</button></div>'; }).join("") + '</div>';
  }
  function testArgs(t) { return Array.isArray(t.args) ? t.args : [t.total, t.discount]; }
  function codeFixBody(g) {
    var status = "";
    if (session.tests) status = '<div class="worker-test-results ' + (session.tests.all ? "all-pass" : "some-fail") + '"><strong>' + (session.tests.all ? "✅ All tests pass!" : "🧪 " + session.tests.passed + " of " + session.tests.total + " tests pass") + '</strong>' +
      session.tests.rows.map(function(r, i) { return '<span>' + (r.pass ? "✓" : "✕") + ' Test ' + (i + 1) + ': ' + esc((g.functionName || "applyCoupon") + "(" + r.args.join(", ") + ") → " + String(r.actual)) + (r.pass ? "" : " · expected " + esc(r.expected)) + '</span>'; }).join("") + '</div>';
    return '<div class="ticket-card"><span>🎟️ TICKET · COUPON-008</span><p>The discount may reduce the order total, but the final total must never be negative.</p></div><label class="code-editor-label" for="ai-fix-editor">YOUR FIX <span>JavaScript · timed Web Worker</span></label><textarea id="ai-fix-editor" class="code-editor" spellcheck="false" autocapitalize="off">' + esc(session.code || g.starterCode) + '</textarea><div class="test-expectations"><strong>Test cases</strong>' + g.tests.map(function(t) { var a = testArgs(t); return '<span>' + esc(a.join(" − ") + " → " + t.expected) + '</span>'; }).join("") + '</div>' + status;
  }
  function canSubmit(g) {
    if (g.kind === "choice") return session.choice !== null;
    if (g.kind === "tapLine" || g.kind === "multiSelect") return session.lines.length > 0 || session.items.length > 0;
    if (g.kind === "specCheck") return g.requirements.every(function(_, i) { return !!session.verdicts[i] && typeof session.evidence[i] === "number"; }) && session.scopeTouched;
    if (g.kind === "prReview") return g.issues.every(function(x) { return typeof session.reviews[x.id] === "boolean"; });
    if (g.kind === "codeFix") return true;
    return false;
  }
  function resultCard(g) {
    var r = session.result, best = A().best[g.id] || 0;
    var chest = r.chestOpened ? '<div class="chest-opened">🎉 You found <b>' + esc(r.prize) + '</b> and +25 bonus XP!</div>' : (r.chest ? '<button class="mystery-chest" data-ai-act="chest">📦 Open your mystery chest <span>tap for a bonus!</span></button>' : '<div class="chest-opened replay-note">🔁 Replay complete · best score ' + best + '%</div>');
    return '<div class="dev-result ' + (r.score >= 80 ? "great" : (r.score >= 60 ? "okay" : "retry")) + '"><div class="dev-result-top"><span class="result-sticker">' + (r.score >= 80 ? "🎉" : (r.score >= 60 ? "✨" : "🧩")) + '</span><div><span class="dev-eyebrow">' + r.grade + '</span><h2>' + esc(r.headline) + '</h2></div><div class="score-donut"><strong>' + r.score + '</strong><small>POINTS</small></div></div><p>' + esc(r.explanation) + '</p><div class="concept-card"><span>💡 TAKE THIS WITH YOU</span><strong>' + esc(g.concept) + '</strong></div>' +
      (r.combo > 1 ? '<div class="combo-pop">🔥 Combo ×' + r.combo + (r.bonus ? " · +" + r.bonus + " bonus XP" : "") + '</div>' : "") + '<div class="result-xp">' + (r.xp ? "⚡ +" + r.xp + " XP" : "Practice run · no extra XP") + '</div>' + chest +
      (r.reply ? '<div class="devbot-reply"><span>🤖 DevBot:</span> ' + esc(r.reply) + '</div>' : "") + '<div class="result-actions"><button class="primary-button" data-ai-act="continue">Keep going →</button><button class="secondary-button" data-ai-act="replay">Play this one again</button><button class="secondary-button" data-ai-open="' + (g.track === "ai" ? "ai-track" : "map") + '">Back to AI Code Check</button></div></div>';
  }
  function submit() {
    var g = G[current], score = 0, reply = "";
    if (!canSubmit(g)) { ctx.say("Finish the little checks first."); return; }
    if (g.kind === "codeFix") { runCode(g); return; }
    if (g.kind === "choice") score = session.choice === g.answer ? 100 : 0;
    if (g.kind === "tapLine") {
      var hits = session.lines.filter(function(n) { return has(g.badLines, n); }).length;
      score = Math.round(hits / g.badLines.length * 100 - (session.lines.length - hits) * 25 - (g.badLines.length - hits) * 10);
    }
    if (g.kind === "multiSelect") {
      var h = session.items.filter(function(id) { return has(g.answers, id); }).length;
      score = Math.round(h / g.answers.length * 100 - (session.items.length - h) * 25 - (g.answers.length - h) * 10);
    }
    if (g.kind === "specCheck") {
      var wins = 0;
      g.requirements.forEach(function(r, i) { if (session.verdicts[i] === (r.met ? "met" : "missing") && session.evidence[i] === r.line) wins += 1; });
      if (session.scope === !!g.scopeCreep) wins += 1;
      score = wins / (g.requirements.length + 1) * 100;
    }
    if (g.kind === "prReview") {
      var correct = g.issues.filter(function(x) { return session.reviews[x.id] === x.shouldFlag; });
      score = correct.length / g.issues.length * 100;
      var firstFlag = g.issues.find(function(x) { return session.reviews[x.id] === true; });
      reply = firstFlag ? firstFlag.reply : "That part is covered. The expiry check matches the ticket.";
    }
    finish(g, score, g.explanation, reply);
  }
  function finish(g, score, explanation, reply) {
    score = Math.max(0, Math.min(100, Math.round(score)));
    var a = A(), first = !has(a.played, g.id), boss = isBoss(g.id), xp = first ? Math.round((g.xp || 50) * score / 100) : 0;
    a.combo = score >= 80 ? (a.combo || 0) + 1 : 0;
    var bonus = first && a.combo >= 2 ? (a.combo - 1) * 10 : 0;
    if (first) a.played.push(g.id);
    a.best[g.id] = Math.max(Number(a.best[g.id]) || 0, score);
    if (boss && score >= 80 && !has(a.bosses, g.id)) a.bosses.push(g.id);
    if (score < 60) a.rematchAt[g.id] = Date.now() + 48 * 60 * 60 * 1000; else delete a.rematchAt[g.id];
    a.bestCombo = Math.max(a.bestCombo || 0, a.combo || 0);
    var chest = first && !has(a.chests, g.id);
    var text = explanation || (score >= 80 ? "Every check lined up with the evidence. Nice careful review." : "Take another look at the requirement and the evidence.");
    session.result = { score: score, grade: score >= 80 ? "Nailed it!" : (score >= 60 ? "Okay — nice progress!" : "Keep investigating!"), xp: xp + bonus, combo: a.combo, bonus: bonus, headline: boss && score < 80 ? "Boss still has a little health." : (score >= 80 ? "Clean review!" : (score >= 60 ? "You caught the main idea." : "A rematch will be waiting.")), explanation: text, reply: reply, chest: chest, chestOpened: false };
    if (xp + bonus > 0) ctx.addXp(xp + bonus, "javascript"); else ctx.save();
    if (score >= 80) ctx.beep();
    redraw();
  }
  function runCode(g) {
    var editor = document.getElementById("ai-fix-editor");
    if (editor) session.code = editor.value;
    var tests = g.tests.map(function(t) { return { args: testArgs(t), expected: t.expected }; });
    var workerCode = "self.onmessage=function(e){try{var fn=new Function('return ('+e.data.code+')')();if(typeof fn!=='function')throw new Error('Write a function to test.');var rows=e.data.tests.map(function(t){try{var actual=fn.apply(null,t.args);return{args:t.args,expected:t.expected,actual:actual,pass:JSON.stringify(actual)===JSON.stringify(t.expected)}}catch(x){return{args:t.args,expected:t.expected,actual:x.message,pass:false}}});self.postMessage({rows:rows})}catch(x){self.postMessage({error:x.message})}};";
    try {
      var url = URL.createObjectURL(new Blob([workerCode], { type: "text/javascript" })), worker = new Worker(url);
      ctx.say("Running tests in a timed sandbox…");
      var timeout = setTimeout(function() { worker.terminate(); URL.revokeObjectURL(url); ctx.say("That took too long. Check for a loop."); }, 1500);
      worker.onmessage = function(e) {
        clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(url);
        if (e.data.error) { session.tests = { all: false, passed: 0, total: tests.length, rows: tests.map(function(t) { return { args: t.args, expected: t.expected, actual: e.data.error, pass: false }; }) }; redraw(); return; }
        var rows = e.data.rows, passed = rows.filter(function(r) { return r.pass; }).length;
        session.tests = { all: passed === rows.length, passed: passed, total: rows.length, rows: rows };
        if (passed === rows.length) finish(g, 100, "Every test passes, including the edge case. Nice catch on the missing lower bound.");
        else redraw();
      };
      worker.onerror = function() { clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(url); ctx.say("Couldn’t run that snippet. Check the syntax."); };
      worker.postMessage({ code: session.code, tests: tests });
    } catch (e) { ctx.say("This browser couldn’t start the code runner."); }
  }
  function openChest() {
    if (!session.result || !session.result.chest) return;
    var prizes = ["a tiny golden bug pin 🐛", "a pixel rocket 🚀", "the Careful Coder badge 🏅", "a smug fox sticker 🦊"];
    session.result.prize = prizes[Math.floor(Math.random() * prizes.length)];
    session.result.chestOpened = true; session.result.chest = false;
    if (current && !has(A().chests, current)) A().chests.push(current);
    ctx.addXp(25); ctx.beep(); redraw();
  }

  /* ---------- Pip's animated explainers + JavaScript Trail ---------- */
  function getVisual(id) { return ALL_VISUALS.find(function(item) { return item.id === id; }) || VISUALS[0]; }
  function visualForGame(gameId) { return VISUALS.find(function(item) { return item.game === gameId; }); }
  function isJsLesson(id) { return JS_LESSONS.some(function(item) { return item.id === id; }); }
  function jsLessonUnlocked(id) {
    var index = JS_LESSONS.findIndex(function(item) { return item.id === id; });
    return index === 0 || (index > 0 && has(jsDone(), JS_LESSONS[index - 1].id));
  }
  function completeJsLesson(id) {
    if (!isJsLesson(id) || has(jsDone(), id)) return;
    jsDone().push(id); ctx.addXp(20, "javascript");
    ctx.say("Lesson complete! +20 XP. Next stop unlocked!");
  }
  function openJsLesson(id) {
    if (!jsLessonUnlocked(id)) { ctx.say("Finish the previous animation to unlock this stop."); return; }
    stopVisualPlayback(); visualId = getVisual(id).id; visualStep = 0; ctx.go("jscinema");
    var player = document.getElementById("visual-player"); if (player) player.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderVisualPlayer(id, inline) {
    var visual = getVisual(id), step = visual.steps[Math.min(visualStep, visual.steps.length - 1)];
    var codeRows = visual.code.map(function(line, i) { var focused = step.focus.indexOf(i) >= 0; return '<div class="visual-code-row ' + (focused ? "focused" : "") + '"><span>' + (i + 1) + '</span><code>' + esc(line) + '</code>' + (focused ? '<b>← Pip is here</b>' : '') + '</div>'; }).join("");
    var nodes = step.nodes.map(function(node, i) { return (i ? '<span class="visual-arrow" aria-hidden="true">➜</span>' : '') + '<article class="visual-node" style="--node-delay:' + (i * 100) + 'ms"><span>' + node.icon + '</span><strong>' + esc(node.title) + '</strong><small>' + esc(node.value) + '</small></article>'; }).join("");
    var side = inline ? '<button class="visual-library-link" data-ai-open="visuals">Open all animated concepts →</button>' : (isJsLesson(visual.id) ? '<span class="js-mini-movie-tag">JAVASCRIPT MINI MOVIE · SCENE ' + (visualStep + 1) + ' / ' + visual.steps.length + '</span>' : '');
    return '<section id="visual-player" class="visual-player ai-scope ' + (inline ? 'visual-player-inline' : '') + '" aria-labelledby="visual-player-title"><header class="visual-player-header"><div><span class="visual-kicker">' + (inline ? 'PIP’S ANIMATED EXPLAINER' : esc(visual.category.toUpperCase()) + ' · PIP’S PLAYBACK') + '</span><h2 id="visual-player-title">' + esc(visual.title) + '</h2><p>' + esc(visual.intro) + '</p></div>' + side + '</header><div class="visual-workbench"><div class="visual-code-window"><div class="visual-window-top"><span></span><span></span><span></span><b>Watch the code</b></div><div class="visual-code-list">' + codeRows + '</div></div><div class="visual-stage" data-visual-scene="' + esc(visual.id) + '"><div class="visual-stage-title"><span class="visual-stage-icon">' + visual.icon + '</span><div><small>SCENE ' + (visualStep + 1) + ' / ' + visual.steps.length + '</small><strong>' + esc(step.label) + '</strong></div><span class="visual-spark">✦</span></div><div class="visual-flow" aria-live="polite">' + nodes + '</div><div class="visual-takeaway"><span>WHAT JUST HAPPENED</span><strong>' + esc(step.takeaway) + '</strong></div><p class="visual-caption">' + esc(step.caption) + '</p></div></div><div class="visual-scrubber" aria-label="Explanation steps">' + visual.steps.map(function(x, i) { return '<button data-ai-act="visual-step" data-ai-step="' + i + '" class="' + (i === visualStep ? 'active ' : '') + (i < visualStep ? 'done' : '') + '" aria-label="Step ' + (i + 1) + ': ' + esc(x.label) + '" aria-current="' + (i === visualStep ? 'step' : 'false') + '"><span>' + (i < visualStep ? '✓' : i + 1) + '</span>' + esc(x.label) + '</button>'; }).join('') + '</div><div class="visual-controls"><button class="visual-control-secondary" data-ai-act="visual-reset">↺ Start over</button><div><button class="visual-control-primary" data-ai-act="visual-toggle">' + (visualPlaying ? 'Ⅱ Pause' : '▶ Play animation') + '</button><button class="visual-control-next" data-ai-act="visual-next">Next beat →</button></div><span class="visual-step-count">' + (visualStep + 1) + ' of ' + visual.steps.length + '</span></div></section>';
  }
  function visualsPage() {
    if (isJsLesson(visualId)) { visualId = VISUALS[0].id; visualStep = 0; }
    var currentVisual = getVisual(visualId);
    root().innerHTML = '<div class="ai-scope"><section class="dev-page-title"><div><span class="dev-eyebrow">LITTLE STORIES FOR BIG IDEAS</span><h1>Pip’s Code Explainers 🦊</h1><p>Press play, pause, or tap any beat. Each one explains the idea behind an AI Code Check game.</p></div><button class="dev-link" data-nav="anim">← Animated</button></section><div class="visual-library">' + VISUALS.map(function(item) { return '<button class="visual-concept-card ' + (item.id === currentVisual.id ? 'selected' : '') + '" data-ai-act="visual-select" data-ai-visual="' + esc(item.id) + '"><span>' + item.icon + '</span><div><small>' + esc(item.category) + '</small><strong>' + esc(item.title) + '</strong></div><b>↗</b></button>'; }).join('') + '</div>' + renderVisualPlayer(currentVisual.id, false) + '</div>';
  }
  function jsTrailPage() {
    var done = jsDone(), count = done.length;
    var worldNames = ["First Steps", "Logic Land", "Web Workshop"];
    var worldIcons = { "First Steps": "🌱", "Logic Land": "🧠", "Web Workshop": "🪄" };
    var worldNotes = { "First Steps": "Values, variables, and the tiny rules JavaScript follows.", "Logic Land": "Make choices, repeat work, and build reusable moves.", "Web Workshop": "Bring your code to life in a real browser page." };
    var worlds = worldNames.map(function(world, worldIndex) {
      var lessons = JS_LESSONS.filter(function(item) { return item.world === world; });
      var worldDone = lessons.filter(function(item) { return has(done, item.id); }).length;
      return '<section class="js-world-card world-' + (worldIndex + 1) + '"><header class="js-world-heading"><span>' + worldIcons[world] + '</span><div><small>ZONE 0' + (worldIndex + 1) + ' · ' + worldDone + '/' + lessons.length + ' STOPS</small><h2>' + world + '</h2><p>' + worldNotes[world] + '</p></div><b>' + (worldDone === lessons.length ? '🏆' : '✨') + '</b></header><div class="js-world-track">' + lessons.map(function(item) {
        var isDone = has(done, item.id), open = jsLessonUnlocked(item.id), next = !isDone && open;
        return '<button class="js-lesson-node ' + (isDone ? 'complete ' : '') + (next ? 'next-up ' : '') + (open ? '' : 'locked') + '" data-ai-js="' + esc(item.id) + '"' + (open ? '' : ' disabled') + '><span class="js-node-number">' + (isDone ? '✓' : (open ? String(JS_LESSONS.indexOf(item) + 1).padStart(2, '0') : '🔒')) + '</span><span class="js-node-icon">' + item.icon + '</span><strong>' + esc(item.title) + '</strong><small>' + (isDone ? 'WATCHED · +20 XP' : (open ? 'PLAY 1-MIN MOVIE' : 'FINISH THE LAST STOP')) + '</small></button>';
      }).join('') + '</div></section>';
    }).join('');
    var next = JS_LESSONS.find(function(item) { return !has(done, item.id); });
    root().innerHTML = '<div class="ai-scope"><section class="dev-page-title"><div><span class="dev-eyebrow">ANIMATED · 12 TINY MOVIES</span><h1>JavaScript Trail 🌈</h1><p>Follow Pip through code, one animated idea at a time. No setup and no scary walls of text.</p></div><button class="dev-link" data-nav="anim">← Animated</button></section><section class="js-map-hero"><div class="js-map-copy"><span>YOUR CODE-CREATOR JOURNEY</span><h2>' + (next ? 'Next stop: ' + esc(next.title) : 'You finished the whole trail!') + '</h2><p>' + count + ' of ' + JS_LESSONS.length + ' animated lessons watched. Each stop shows the code, then lets you step through what it does.</p><div class="js-big-progress"><i style="width:' + Math.round(count / JS_LESSONS.length * 100) + '%"></i></div><div class="js-map-meta"><strong>' + count + ' / ' + JS_LESSONS.length + ' stops</strong><span>' + st().xp + ' XP · next lesson +20 XP</span></div><button class="js-teaser-play" data-ai-act="js-continue">' + (next ? 'Continue learning →' : 'Replay the trail →') + '</button></div><div class="js-map-art"><div class="js-art-orbit orbit-one"></div><div class="js-art-orbit orbit-two"></div><div class="js-art-logo">JS</div><span class="js-art-mascot">🦊</span><span class="js-art-float float-code">let’s go!</span><span class="js-art-float float-xp">+20 XP</span></div></section><div class="js-map-worlds">' + worlds + '</div><div class="js-map-footer"><span>💡</span><p>Replay any lesson you’ve watched. Finish each glowing stop to light up the next.</p><button class="js-teaser-link" data-ai-open="cinema">Open Code Cinema 🎬</button></div></div>';
  }
  function jsCinemaPage() {
    var done = jsDone(), already = isJsLesson(visualId);
    var selected = already ? getVisual(visualId) : (JS_LESSONS.find(function(item) { return !has(done, item.id); }) || JS_LESSONS[0]);
    if (!already) visualStep = 0;
    visualId = selected.id;
    var tiles = JS_LESSONS.map(function(item, index) {
      var isDone = has(done, item.id), open = jsLessonUnlocked(item.id), active = item.id === selected.id;
      return '<button class="js-cinema-tile ' + (isDone ? 'done ' : '') + (active ? 'active ' : '') + (open ? '' : 'locked') + '" data-ai-js="' + esc(item.id) + '"' + (open ? '' : ' disabled') + '><span>' + (isDone ? '✓' : (open ? item.icon : '🔒')) + '</span><div><small>' + esc(item.world) + ' · LESSON ' + String(index + 1).padStart(2, '0') + '</small><strong>' + esc(item.title) + '</strong></div><b>' + (isDone ? 'REPLAY' : (open ? 'WATCH' : 'LOCKED')) + '</b></button>';
    }).join('');
    root().innerHTML = '<div class="ai-scope"><section class="dev-page-title"><div><span class="dev-eyebrow">ANIMATED · INTERACTIVE · ALL JAVASCRIPT</span><h1>JavaScript Code Cinema 🎬</h1><p>Watch a tiny movie, then tap through the code yourself. Finish a movie to bank +20 XP and unlock the next one.</p></div><button class="dev-link" data-ai-open="jstrail">← Back to JavaScript Trail</button></section><div class="js-cinema-progress"><div><strong>' + done.length + ' / ' + JS_LESSONS.length + ' movies watched</strong><span>One scene at a time. You control the pace.</span></div><div class="js-big-progress"><i style="width:' + Math.round(done.length / JS_LESSONS.length * 100) + '%"></i></div></div><div class="js-cinema-library">' + tiles + '</div>' + renderVisualPlayer(selected.id, false) + '</div>';
  }
  function stopVisualPlayback() { if (visualTimer) clearInterval(visualTimer); visualTimer = null; visualPlaying = false; }
  function setVisualStep(n) {
    var visual = getVisual(visualId);
    visualStep = Math.max(0, Math.min(visual.steps.length - 1, n));
    if (visualStep >= visual.steps.length - 1) { stopVisualPlayback(); completeJsLesson(visual.id); }
    redraw();
  }
  function toggleVisualPlayback() {
    if (visualPlaying) { stopVisualPlayback(); redraw(); return; }
    var visual = getVisual(visualId);
    if (visualStep >= visual.steps.length - 1) visualStep = 0;
    visualPlaying = true;
    visualTimer = setInterval(function() {
      if (VISUAL_VIEWS.indexOf(ctx.view()) < 0) { stopVisualPlayback(); return; }
      if (visualStep >= visual.steps.length - 1) { stopVisualPlayback(); redraw(); return; }
      visualStep += 1;
      if (visualStep >= visual.steps.length - 1) { stopVisualPlayback(); completeJsLesson(visual.id); }
      redraw();
    }, 1900);
    redraw();
  }
  function selectVisual(id) {
    stopVisualPlayback(); visualId = getVisual(id).id; visualStep = 0;
    if (ctx.view() === "visuals") redraw(); else ctx.go("visuals");
    var player = document.getElementById("visual-player"); if (player) player.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- events (only data-ai-* attributes) ---------- */
  document.addEventListener("click", function(e) {
    if (!ctx) return;
    var t = e.target;
    var openButton = t.closest("[data-ai-open]");
    if (openButton) { e.preventDefault(); openView(openButton.dataset.aiOpen); return; }
    var gameButton = t.closest("[data-ai-game]");
    if (gameButton) { openGame(gameButton.dataset.aiGame); return; }
    if (!t.closest(".ai-scope")) return;
    var jsButton = t.closest("[data-ai-js]");
    if (jsButton) { openJsLesson(jsButton.dataset.aiJs); return; }
    var actButton = t.closest("[data-ai-act]"), act = actButton && actButton.dataset.aiAct;
    if (act === "hint") { hint = !hint; redraw(); return; }
    if (act === "submit") { submit(); return; }
    if (act === "chest") { openChest(); return; }
    if (act === "replay") { openGame(current); return; }
    if (act === "continue") { openGame(nextGame()); return; }
    if (act === "visual-select") { selectVisual(actButton.dataset.aiVisual); return; }
    if (act === "visual-step") { stopVisualPlayback(); setVisualStep(Number(actButton.dataset.aiStep)); return; }
    if (act === "visual-next") { stopVisualPlayback(); setVisualStep(visualStep + 1); return; }
    if (act === "visual-reset") { stopVisualPlayback(); setVisualStep(0); return; }
    if (act === "visual-toggle") { toggleVisualPlayback(); return; }
    if (act === "js-continue") { var nextJs = JS_LESSONS.find(function(item) { return !has(jsDone(), item.id); }) || JS_LESSONS[0]; openJsLesson(nextJs.id); return; }
    if (session.result || ctx.view() !== "aigame") return;
    var g = G[current];
    var evidence = t.closest("[data-ai-evidence]");
    if (evidence) { session.activeCriterion = Number(evidence.dataset.aiEvidence); redraw(); return; }
    var choice = t.closest("[data-ai-choice]");
    if (choice) { session.choice = Number(choice.dataset.aiChoice); redraw(); return; }
    var line = t.closest("[data-ai-line]");
    if (line && g) {
      var no = Number(line.dataset.aiLine);
      if (g.kind === "specCheck") { if (session.activeCriterion !== null) { session.evidence[session.activeCriterion] = no; session.activeCriterion = null; } }
      else session.lines = has(session.lines, no) ? session.lines.filter(function(x) { return x !== no; }) : session.lines.concat([no]);
      redraw(); return;
    }
    var card = t.closest("[data-ai-item]");
    if (card) { var id = card.dataset.aiItem; session.items = has(session.items, id) ? session.items.filter(function(x) { return x !== id; }) : session.items.concat([id]); redraw(); return; }
    var verdict = t.closest("[data-ai-verdict]");
    if (verdict) { session.verdicts[verdict.dataset.aiVerdict] = verdict.dataset.aiValue; redraw(); return; }
    var review = t.closest("[data-ai-review]");
    if (review) { session.reviews[review.dataset.aiReview] = review.dataset.aiFlag === "true"; redraw(); return; }
  });
  document.addEventListener("change", function(e) {
    if (ctx && e.target.matches && e.target.matches("[data-ai-scope]")) { session.scope = e.target.checked; session.scopeTouched = true; redraw(); }
  });
  document.addEventListener("input", function(e) { if (e.target.id === "ai-fix-editor") session.code = e.target.value; });

  window.XPAICheck = {
    VIEWS: VIEWS,
    MAP_VIEWS: ["aimap", "aigame"],
    ANIM_VIEWS: ["jstrail", "jscinema", "visuals"],
    blank: blank,
    normalize: normalize,
    normalizeLessons: normalizeLessons,
    lessonCount: function() { return JS_LESSONS.length; },
    explainerCount: function() { return VISUALS.length; },
    gameCount: function() { return Object.keys(G).length; },
    attach: function(hostContext) { ctx = hostContext; },
    label: function(v) {
      if (v === "aimap") return "Game Map · AI Code Check";
      if (v === "aigame") return G[current] ? G[current].title : "AI Code Check";
      if (v === "jstrail") return "Animated · JavaScript Trail";
      if (v === "jscinema") return "Animated · JS Code Cinema";
      return "Animated · Pip’s Code Explainers";
    },
    render: function(v) {
      if (VISUAL_VIEWS.indexOf(v) < 0) stopVisualPlayback();
      if (v === "aimap") mapPage();
      else if (v === "aigame") gameScreen();
      else if (v === "jstrail") jsTrailPage();
      else if (v === "jscinema") jsCinemaPage();
      else if (v === "visuals") visualsPage();
    },
    stop: stopVisualPlayback
  };
})();
