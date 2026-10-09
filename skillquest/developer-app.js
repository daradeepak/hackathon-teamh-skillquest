(function() {
  "use strict";
  var D = window.DEVQUEST_CONTENT, G = D.games, root = document.getElementById("app-main");
  var label = document.getElementById("page-label"), toast = document.getElementById("toast");
  var BASE_KEY = "skillquest-devcore-v1", KEY = BASE_KEY, view = "home", current = null, track = "core", hint = false;
  var account = null, accountMode = "login";
  var timer = null, session = fresh(), reelIndex = 0, reelRevealed = false, reelAnswer = null, reelFeedback = "";
  var REELS = [
    { id: "trace", title: "Trace before you trust", tag: "CODE READING", icon: "🔎", hook: "AI says this returns 12. Can you spot the tiny twist?", lesson: "Follow the values line by line. Here, the loop adds each price multiplied by its quantity. A test can pass while your mental model is still off.", question: "For items [{price: 2, qty: 3}, {price: 4, qty: 1}], what is the total?", options: ["9", "10", "14"], answer: 1 },
    { id: "spec", title: "The ticket is the map", tag: "SPEC CHECK", icon: "🧾", hook: "The demo passed. The ticket still says one coupon per customer.", lesson: "Turn each sentence in a ticket into a check. Then point to the code or test that proves it. If you cannot point to evidence, mark it unknown instead of assuming.", question: "Which review comment is most useful?", options: ["Looks good to me!", "Where do we reject a second use by the same customer?", "The code could be cleaner."], answer: 1 },
    { id: "scope", title: "Keep the change on a leash", tag: "SCOPE CONTROL", icon: "🪁", hook: "A coupon fix also renames six helpers and changes the checkout colors.", lesson: "Extra changes make reviews harder and can hide bugs. Ask for the ticket-sized fix first. Follow-up ideas can become separate work with their own acceptance checks.", question: "What should you do with unrelated refactors?", options: ["Approve everything because tests are green.", "Ask to split them into a separate change.", "Delete the whole branch."], answer: 1 }
  ];
  var SIM_STEPS = [
    { speaker: "Maya · Product", text: "The AI coupon patch passed its tests, but the ticket says each customer can use a coupon once. What’s your move?", options: ["Check the diff and tests for the one-use rule.", "Merge it. Green means done.", "Ask the AI if it handled that."], points: [2, 0, 1], feedback: ["Good call. You went straight to evidence for the requirement.", "Green tests only prove the cases they cover.", "A claim is not evidence. Peek at the code or add a test."] },
    { speaker: "Leo · Teammate", text: "I also renamed six pricing helpers while fixing it. Faster to leave those in, yeah?", options: ["Ask to keep this patch focused and split the refactor.", "Ignore it; unrelated changes are harmless.", "Reject the whole PR without explaining why."], points: [2, 1, 0], feedback: ["Nice. Smaller changes are easier to understand and safer to review.", "Unrelated edits can make bugs harder to spot.", "A clear, specific review helps the teammate fix the right thing."] },
    { speaker: "Pip 🦊 · On call", text: "Checkout is live and one order has a negative total. What happens first?", options: ["Disable or roll back the coupon path, then verify recovery.", "Hot-edit an order in the database.", "Wait for more reports before acting."], points: [2, 0, 0], feedback: ["You reduced impact first, then checked that checkout recovered.", "Changing production data can hide the problem and create another one.", "When users are affected, stabilize the service and share only confirmed facts."] }
  ];

  function sortLabOf(x) { return { bubble: { done: !!(x && x.bubble && x.bubble.done) } }; }
  function fresh() { return { choice: null, items: [], lines: [], verdicts: {}, evidence: {}, activeCriterion: null, scope: false, scopeTouched: false, reviews: {}, code: "", tests: null, result: null }; }
  function seed() {
    return { name: "Arjun", xp: 840, streak: 5, combo: 2, bestCombo: 4,
      played: ["predict-output", "explain-code", "spot-bug", "code-fix", "ai-code-audit"],
      best: { "predict-output": 100, "explain-code": 100, "spot-bug": 90, "code-fix": 100, "ai-code-audit": 80 },
      bosses: ["code-fix"], chests: ["predict-output", "explain-code", "spot-bug", "code-fix", "ai-code-audit"], rematchAt: {}, sound: false,
      daily: { date: dayKey(), actions: [], claimed: false }, reels: [], sortLab: sortLabOf(), simulator: { stage: 0, score: 0, done: false, last: "" } };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.played)) return Object.assign(seed(), s, { best: s.best || {}, bosses: s.bosses || [], chests: s.chests || [], rematchAt: s.rematchAt || {}, reels: s.reels || [], sortLab: sortLabOf(s.sortLab), daily: Object.assign(seed().daily, s.daily || {}), simulator: Object.assign(seed().simulator, s.simulator || {}) });
    } catch (e) {}
    return seed();
  }
  var state = load();
  function freshAccount(name) {
    var s = seed();
    s.name = name || "Learner"; s.xp = 0; s.streak = 0; s.combo = 0; s.bestCombo = 0;
    s.played = []; s.best = {}; s.bosses = []; s.chests = []; s.rematchAt = {};
    s.daily = { date: dayKey(), actions: [], claimed: false }; s.reels = []; s.sortLab = sortLabOf();
    s.simulator = { stage: 0, score: 0, done: false, last: "", choices: [], reward: 0 };
    return s;
  }
  function accountInitials(name) {
    return String(name || "Learner").trim().split(/\s+/).slice(0, 2).map(function(part) { return part.charAt(0); }).join("").toUpperCase() || "L";
  }
  function syncAccountUi() {
    var name = account ? account.name : state.name;
    var avatar = accountInitials(name);
    var profileName = document.getElementById("profile-name"), profileSubtitle = document.getElementById("profile-subtitle");
    var profileAvatar = document.getElementById("profile-avatar"), topAvatar = document.getElementById("top-avatar");
    var toggle = document.getElementById("account-toggle");
    if (profileName) profileName.textContent = name;
    if (profileSubtitle) profileSubtitle.textContent = account ? "Local account · Level " + currentLevel() : "Junior dev · Level " + currentLevel();
    if (profileAvatar) profileAvatar.textContent = avatar;
    if (topAvatar) topAvatar.textContent = avatar;
    if (toggle) { toggle.textContent = account ? "Account · " + account.name : "Sign in / create account"; toggle.setAttribute("aria-label", account ? "Manage account" : "Sign in or create an account"); }
  }
  function normalizedProgress(progress, name) {
    if (!progress || typeof progress !== "object" || !Array.isArray(progress.played)) return null;
    var base = freshAccount(name);
    return Object.assign(base, progress, {
      name: name,
      best: progress.best && typeof progress.best === "object" ? progress.best : {},
      bosses: Array.isArray(progress.bosses) ? progress.bosses : [],
      chests: Array.isArray(progress.chests) ? progress.chests : [],
      rematchAt: progress.rematchAt && typeof progress.rematchAt === "object" ? progress.rematchAt : {},
      reels: Array.isArray(progress.reels) ? progress.reels : [],
      sortLab: sortLabOf(progress.sortLab),
      daily: Object.assign(base.daily, progress.daily || {}),
      simulator: Object.assign(base.simulator, progress.simulator || {})
    });
  }
  async function activateAccount(user) {
    account = { id: user.id, name: user.name, email: user.email };
    KEY = BASE_KEY + ":account:" + account.id;
    var cached = null;
    try { cached = normalizedProgress(JSON.parse(localStorage.getItem(KEY)), account.name); } catch (e) {}
    state = cached || normalizedProgress(user.progress, account.name) || freshAccount(account.name);
    state.name = account.name;
    save(); syncAccountUi(); draw();
  }
  async function initAccount() {
    try {
      var response = await fetch("/api/me", { headers: { "Accept": "application/json" } });
      if (response.ok) { var result = await response.json(); if (result.user) await activateAccount(result.user); }
    } catch (e) {}
  }
  function closeAccountModal() {
    var modal = document.getElementById("account-modal-root");
    if (modal) modal.innerHTML = "";
  }
  function renderAccountModal(mode) {
    accountMode = mode || (account ? "account" : "login");
    var modal = document.getElementById("account-modal-root");
    if (!modal) return;
    if (account) {
      modal.innerHTML = '<div class="account-backdrop" role="presentation"><section class="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title"><button class="account-close" data-action="close-account" aria-label="Close">×</button><div class="account-mark">🦊</div><span class="account-kicker">YOUR PLAYER CARD</span><h2 id="account-title">Hey, ' + esc(account.name) + '!</h2><p class="account-intro">Your quests and XP are saved to this local SkillQuest account.</p><div class="account-profile-card"><strong>' + esc(account.name) + '</strong><span>' + esc(account.email) + '</span><small>Level ' + currentLevel() + ' · ' + state.xp + ' XP</small></div><button class="account-submit" data-action="account-logout">Sign out</button><p class="account-local-note">Demo account · saved on this computer</p></section></div>';
      return;
    }
    var signup = accountMode === "signup";
    modal.innerHTML = '<div class="account-backdrop" role="presentation"><section class="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title"><button class="account-close" data-action="close-account" aria-label="Close">×</button><div class="account-mark">🦊</div><span class="account-kicker">PLAYER LOGIN</span><h2 id="account-title">' + (signup ? "Make your player card" : "Welcome back, player!") + '</h2><p class="account-intro">' + (signup ? "Save your quests, XP and level as you play." : "Pick up your quests right where you left off.") + '</p><div class="account-tabs"><button type="button" data-account-mode="login" class="' + (!signup ? "active" : "") + '">Sign in</button><button type="button" data-account-mode="signup" class="' + (signup ? "active" : "") + '">Create account</button></div><form id="account-form" data-mode="' + (signup ? "signup" : "login") + '">' + (signup ? '<label class="account-field">Your name<input name="name" type="text" minlength="2" maxlength="40" autocomplete="name" required placeholder="e.g. Sam Rivera"></label>' : '') + '<label class="account-field">Email address<input name="email" type="email" maxlength="254" autocomplete="email" required placeholder="you@example.com"></label><label class="account-field">Password<input name="password" type="password" minlength="8" maxlength="128" autocomplete="' + (signup ? "new-password" : "current-password") + '" required placeholder="At least 8 characters"></label><p id="account-error" class="account-error" role="alert"></p><button class="account-submit" type="submit">' + (signup ? "Create my account →" : "Let's play →") + '</button></form><p class="account-local-note">Local demo only. Use a made-up password; nothing is emailed.</p></section></div>';
    var firstField = modal.querySelector("input"); if (firstField) firstField.focus();
  }
  async function submitAccount(form) {
    var button = form.querySelector("[type=submit]"), error = document.getElementById("account-error");
    var body = Object.fromEntries(new FormData(form).entries());
    button.disabled = true; button.textContent = "One sec…"; if (error) error.textContent = "";
    try {
      var response = await fetch(form.dataset.mode === "signup" ? "/api/register" : "/api/login", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body)
      });
      var result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not open that account.");
      if (form.dataset.mode === "signup") { view = "home"; current = null; hint = false; }
      await activateAccount(result.user); closeAccountModal(); say(form.dataset.mode === "signup" ? "Player card made! Your adventure starts now." : "Welcome back! Your progress is loaded.");
    } catch (problem) {
      if (error) error.textContent = problem.message || "The local account service is unavailable.";
      button.disabled = false; button.textContent = form.dataset.mode === "signup" ? "Create my account →" : "Let's play →";
    }
  }
  async function signOut() {
    try { await fetch("/api/logout", { method: "POST" }); } catch (e) {}
    account = null; KEY = BASE_KEY; state = load(); ensureDaily(); closeAccountModal(); syncAccountUi(); draw(); say("Signed out. Guest progress is still here.");
  }
  function dayKey() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function ensureDaily() { if (!state.daily || state.daily.date !== dayKey()) state.daily = { date: dayKey(), actions: [], claimed: false }; }
  ensureDaily();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { say("Could not save progress in this browser."); }
    if (account) fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ progress: state }) }).catch(function() {});
  }
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function(c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  function has(a, x) { return a.indexOf(x) >= 0; }
  function say(text) { toast.textContent = text; toast.classList.add("show"); clearTimeout(timer); timer = setTimeout(function() { toast.classList.remove("show"); }, 2300); }
  function isBoss(id) { return D.coreLevels.some(function(l) { return l.boss === id; }); }
  function bossBeat(id) { return has(state.bosses, id); }
  function currentLevel() { return bossBeat("review-pr") || bossBeat("incident") ? 3 : (bossBeat("code-fix") ? 2 : 1); }
  function levelOpen(n) { return n === 1 || (n === 2 && bossBeat("code-fix")) || (n === 3 && bossBeat("review-pr")); }
  function okayCount(n) { return D.coreLevels[n - 1].games.filter(function(id) { return (state.best[id] || 0) >= 60; }).length; }
  function bossOpen(n) { var l = D.coreLevels[n - 1]; return bossBeat(l.boss) || okayCount(n) >= 3; }
  function canOpen(id) { var g = G[id]; return !!g && (g.track === "ai" || (levelOpen(g.level) && (!isBoss(id) || bossOpen(g.level)))); }
  function nextGame() {
    var l = D.coreLevels[currentLevel() - 1];
    var id = l.games.find(function(k) { return !has(state.played, k); });
    if (id) return id;
    if (bossOpen(l.id) && !bossBeat(l.boss)) return l.boss;
    return l.games[0];
  }
  function open(id) {
    if (!canOpen(id)) { say(isBoss(id) ? "Win 3 games at Okay or better to unlock this boss." : "Beat the earlier boss to open this level."); return; }
    current = id; view = "game"; hint = false; session = fresh();
    if (G[id].kind === "codeFix") session.code = G[id].starterCode;
    draw(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  var LAB_VIEWS = ["lab", "daily", "reels", "sim", "badges"], LAB_ENABLED = false; /* Play Lab is hidden for now; flip to true (and restore the sidebar button in index.html and the home banner) to bring it back */
  function go(where) { if (!LAB_ENABLED && has(LAB_VIEWS, where)) where = "home"; view = where; current = null; hint = false; if (where === "reels") { reelRevealed = false; reelAnswer = null; reelFeedback = ""; } draw(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function draw() {
    if (view === "home") { label.textContent = "Home"; home(); if (LAB_ENABLED) root.insertAdjacentHTML("afterbegin", dailyBanner()); }
    else if (view === "map") { label.textContent = "Game map"; track === "ai" ? aiMap() : map(); }
    else if (view === "stats") { label.textContent = "Scoreboard"; stats(); }
    else if (view === "lab") { label.textContent = "Play Lab"; labHome(); }
    else if (view === "anim") { label.textContent = "Animated"; animatedPage(); }
    else if (view === "sort") { label.textContent = "Animated · DSA"; sortPage(); }
    else if (view === "daily") { label.textContent = "Daily quest"; dailyPage(); }
    else if (view === "reels") { label.textContent = "Knowledge reels"; reelsPage(); }
    else if (view === "sim") { label.textContent = "Workplace simulator"; simulatorPage(); }
    else if (view === "badges") { label.textContent = "Badge shelf"; badgesPage(); }
    else { label.textContent = G[current] ? G[current].title : "Game"; gameScreen(); }
    document.querySelectorAll(".nav-item").forEach(function(b) { b.classList.toggle("is-active", b.dataset.nav === view || (view === "game" && b.dataset.nav === "map") || (b.dataset.nav === "lab" && ["daily", "reels", "sim", "badges"].indexOf(view) >= 0) || (b.dataset.nav === "anim" && view === "sort")); });
    if (view === "sort") mountSortLab(); else if (window.SkillQuestBubbleSort) window.SkillQuestBubbleSort.unmount();
    syncAccountUi();
    var sound = document.querySelector("[data-action='sound']");
    if (sound) { sound.textContent = state.sound ? "🔊 Sound on" : "🔈 Sound off"; sound.setAttribute("aria-pressed", String(state.sound)); }
  }
  function tile(id, compact) {
    var g = G[id], done = has(state.played, id), locked = !canOpen(id), rematch = state.rematchAt[id] && state.rematchAt[id] <= Date.now();
    return '<button class="dev-game-tile ' + (compact ? "compact " : "") + (done ? "played " : "") + (locked ? "locked " : "") + (rematch ? "is-rematch " : "") + '" data-game="' + id + '"' + (locked ? " disabled" : "") + '><span class="dev-game-icon">' +
      (isBoss(id) ? "👑" : (id.indexOf("bug") >= 0 || id.indexOf("security") >= 0 ? "🐛" : (id.indexOf("spec") >= 0 ? "🧾" : (id.indexOf("test") >= 0 ? "🧪" : (id.indexOf("predict") >= 0 ? "🔢" : "🔍"))))) +
      '</span><span class="dev-game-text"><strong>' + esc(g.title) + '</strong><small>' + (rematch ? "REMATCH READY" : (isBoss(id) ? "BOSS ROUND" : g.engine)) + '</small></span><span class="dev-game-status">' + (locked ? "🔒" : (done ? ((state.best[id] || 0) >= 60 ? "✓" : "↻") : "→")) + '</span></button>';
  }
  function home() {
    var n = currentLevel(), l = D.coreLevels[n - 1], g = G[nextGame()];
    var quick = l.games.map(function(id) { return tile(id, true); }).join("");
    var due = Object.keys(state.rematchAt).find(function(id) { return state.rematchAt[id] <= Date.now(); });
    root.innerHTML =
      '<section class="dev-welcome"><div class="dev-wave">👋</div><div class="dev-welcome-copy"><span class="dev-eyebrow">DAY ' + state.streak + ' STREAK · DEVELOPER CORE</span><h1>Hey ' + esc(state.name) + '! Ready to catch an AI oops?</h1><p>AI writes the code. SkillQuest trains the developer who checks it.</p></div><div class="dev-top-stats"><span class="dev-chip xp-chip">⚡ ' + state.xp + ' XP</span><span class="dev-chip streak-chip">🔥 ' + state.streak + ' days</span><span class="dev-chip combo-chip">🎯 ×' + state.combo + ' combo</span></div></section>' +
      '<section class="dev-hero"><div class="dev-hero-copy"><span class="dev-hero-tag">' + l.icon + ' LEVEL ' + l.id + ' · ' + l.name.toUpperCase() + '</span><h2>The code looks right.<br>Does it match the ticket?</h2><p>Check one AI-written change at a time. Catch the gaps, keep the good bits, and earn XP for careful reviews.</p><button class="primary-button dev-play-button" data-action="continue">Jump back in →</button></div><div class="dev-hero-art"><div class="dev-orbit"></div><div class="dev-mascot">🦊</div><div class="dev-speech">Pip: show me the spec!</div><span class="dev-float f1">✨ review streak</span><span class="dev-float f2">+ XP</span></div></section>' +
      '<div class="dev-section-head"><div><span class="dev-eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>' + l.icon + ' ' + l.name + ' <small>' + l.games.filter(function(id) { return has(state.played, id); }).length + '/' + l.games.length + ' games played</small></h2></div><button class="dev-link" data-nav="map">Open game map →</button></div>' +
      '<section class="dev-quick-games">' + quick + '</section>' +
      (due ? '<button class="rematch-banner" data-game="' + due + '">🔁 Your rematch is ready: ' + esc(G[due].title) + ' <span>Play it →</span></button>' : "") +
      '<section class="dev-bottom-grid"><div class="dev-panel"><div class="dev-panel-head"><h3>🎮 Your three-level quest</h3><button class="dev-link" data-nav="map">See map →</button></div><div class="dev-progress-strip">' +
        D.coreLevels.map(function(level) { var locked = !levelOpen(level.id); return '<button class="dev-progress-level ' + (locked ? "locked" : "") + '" data-nav="map"><span>' + (locked ? "🔒" : (bossBeat(level.boss) ? "✅" : "▶")) + '</span><strong>' + level.name + '</strong><small>' + (locked ? "Coming up" : level.games.filter(function(id) { return has(state.played, id); }).length + "/" + level.games.length + " games") + '</small></button>'; }).join("") +
      '</div></div><div class="dev-panel teaser-panel"><span class="dev-eyebrow">BONUS TRACK PREVIEW</span><h3>🤖 AI Engineer</h3><p>Same game engines, fresh AI challenges. Take a peek at two teaser games.</p><button class="secondary-button" data-action="ai">Check out the track →</button></div></section>';
  }
  function map() {
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">YOUR DEVELOPER CORE</span><h1>Three levels. One useful superpower.</h1><p>Read the code. Check the ticket. Own what ships.</p></div><div class="dev-track-tabs"><button class="track-tab is-active" data-action="core">Developer Core</button><button class="track-tab" data-action="ai">AI Engineer ✨</button></div></section>' +
      '<section class="dev-map-intro"><span class="dev-map-mascot">🦊</span><div><strong>Hey, ' + esc(state.name) + '!</strong> Win any 3 games in a level at <b>Okay</b> or better to unlock its boss. Beat the boss to open the next level.</div></section>' +
      '<div class="dev-levels">' + D.coreLevels.map(levelCard).join("") + '</div><p class="dev-fineprint">All code and incidents are fictional demo content. Scores are for practice, not performance reviews.</p>';
  }
  function levelCard(l) {
    var locked = !levelOpen(l.id), played = l.games.filter(function(id) { return has(state.played, id); }).length, ok = okayCount(l.id), boss = bossOpen(l.id), beat = bossBeat(l.boss);
    return '<section class="dev-level-card ' + l.color + (locked ? " is-locked" : "") + '"><header class="dev-level-head"><span class="dev-level-icon">' + (locked ? "🔒" : l.icon) + '</span><div class="dev-level-info"><span class="dev-eyebrow">LEVEL ' + l.id + (beat ? " · CLEARED!" : "") + '</span><h2>' + l.name + '</h2><p>' + l.subtitle + '</p></div><div class="dev-level-count">' + (locked ? "LOCKED" : played + "/" + l.games.length + " games") + '</div></header>' +
      (locked ? '<div class="dev-locked-note">Beat the Level 2 boss to open this zone. 🔒</div>' :
        '<div class="dev-game-grid">' + l.games.map(function(id) { return tile(id, false); }).join("") + '</div><div class="dev-boss-row ' + (boss ? "boss-ready" : "") + '"><div class="boss-badge">👑</div><div class="boss-info"><strong>BOSS ROUND · ' + esc(G[l.boss].title) + '</strong><span>' + (beat ? "Boss cleared! You did the thing." : (boss ? "Unlocked. Go show what you know." : "Win 3 games at Okay or better · " + ok + "/3 so far")) + '</span></div><button class="boss-button" data-game="' + l.boss + '"' + (!boss ? " disabled" : "") + '>' + (beat ? "Replay" : (boss ? "Fight boss →" : "🔒")) + '</button></div>') + '</section>';
  }
  function aiMap() {
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">SPECIALIZATION PREVIEW</span><h1>🤖 AI Engineer</h1><p>Same game engines, fresh AI-specific challenges.</p></div><div class="dev-track-tabs"><button class="track-tab" data-action="core">Developer Core</button><button class="track-tab is-active">AI Engineer ✨</button></div></section><section class="dev-ai-banner"><span>🧪</span><div><strong>Two teaser games are ready to play.</strong><p>More role packs can be added as content, not new game engines.</p></div></section><section class="dev-ai-games">' + D.aiTrack.games.map(function(id) { return tile(id, false); }).join("") + '</section><button class="dev-link" data-action="core">← Back to Developer Core</button>';
  }
  function stats() {
    var ids = Object.keys(state.best), avg = ids.length ? Math.round(ids.reduce(function(s, id) { return s + state.best[id]; }, 0) / ids.length) : 0;
    var skillset = [
      ["Code comprehension", ["predict-output", "explain-code"]],
      ["Spec verification", ["spec-check", "tests-that-lie", "review-pr"]],
      ["Debugging", ["spot-bug", "debug-detective", "code-fix"]],
      ["Security", ["ai-code-audit", "security-spot"]]
    ];
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">YOUR SCOREBOARD</span><h1>Nice work, ' + esc(state.name) + ' ✨</h1><p>Stats track practice. They’re not a work-performance score.</p></div><button class="secondary-button" data-action="reset">Reset demo profile</button></section><section class="dev-stats-hero"><div><span class="dev-rank-pill">🏅 ' + rank() + '</span><h2>' + state.xp + ' <small>XP</small></h2><p>Keep playing, try new strategies, and build your code-review superpower.</p></div><div class="dev-stat-stack"><div><strong>🔥 ' + state.streak + '</strong><span>day streak</span></div><div><strong>🎯 ×' + state.bestCombo + '</strong><span>best combo</span></div><div><strong>📦 ' + state.chests.length + '</strong><span>chests opened</span></div></div></section><div class="dev-stats-grid"><section class="dev-panel"><div class="dev-panel-head"><h3>🧠 Skills you’ve practiced</h3><span>Best game scores</span></div>' +
      skillset.map(function(s) { var played = s[1].filter(function(id) { return state.best[id] != null; }); var val = played.length ? Math.round(played.reduce(function(sum, id) { return sum + state.best[id]; }, 0) / played.length) : 0; return '<div class="dev-skill-row"><div class="dev-skill-title"><strong>' + s[0] + '</strong><span>' + (played.length ? val + '% best score' : "Not played yet") + '</span></div><div class="dev-meter"><span style="width:' + val + '%"></span></div></div>'; }).join("") +
      '</section><section class="dev-panel"><div class="dev-panel-head"><h3>🏆 Recent game scores</h3><span>Best attempt</span></div>' + (ids.length ? ids.slice(-6).reverse().map(function(id) { return '<div class="score-row"><span>' + esc(G[id].title) + '</span><b>' + state.best[id] + '%</b></div>'; }).join("") : '<p class="dev-muted">Play a mini-game and your scores show up here.</p>') + '<div class="dev-average">Average best score <strong>' + avg + '%</strong></div></section></div><p class="dev-fineprint">All progress stays in this browser. No code is sent anywhere.</p>';
  }
  var DAILY_TASKS = [
    ["mission", "🎮", "Play a skill mission", "Any code challenge counts."],
    ["reel", "📼", "Watch a knowledge reel", "Flip a card and get its quick check right."],
    ["sim", "🎭", "Finish the workplace story", "Make three calls in the live scenario."]
  ];
  function dailyCount() { ensureDaily(); return DAILY_TASKS.filter(function(t) { return has(state.daily.actions, t[0]); }).length; }
  function trackDaily(id) { ensureDaily(); if (!has(state.daily.actions, id)) state.daily.actions.push(id); }
  function dailyBanner() {
    var n = dailyCount();
    return '<button class="dev-daily-banner" data-module="daily"><span class="daily-banner-icon">🗓️</span><span class="daily-banner-copy"><strong>Today’s tiny quest</strong><small>' + n + '/3 done · mission + reel + story</small></span><span class="daily-banner-progress"><i style="width:' + Math.round(n / 3 * 100) + '%"></i></span><b>' + (state.daily.claimed ? '🎉 Claimed' : (n === 3 ? '+80 XP' : 'Let’s go →')) + '</b></button>';
  }
  function moduleCard(id, icon, title, tag, desc, status) {
    return '<button class="lab-module-card ' + id + '-module" data-module="' + id + '"><span class="lab-module-icon">' + icon + '</span><span class="lab-module-tag">' + tag + '</span><strong>' + title + '</strong><small>' + desc + '</small><span class="lab-module-go">' + status + ' →</span></button>';
  }
  function labHome() {
    var unlocked = badgeList().filter(function(b) { return b.unlocked; }).length;
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">SIDE QUESTS & QUICK WINS</span><h1>Welcome to the Play Lab ✨</h1><p>Take a breather from the map. Learn a tiny thing, make a call, grab a badge.</p></div><span class="lab-level-pill">🦊 Pip’s lab</span></section>' +
      '<section class="lab-feature-row"><div class="lab-feature-copy"><span class="dev-eyebrow">TODAY’S CHALLENGE</span><h2>Three tiny wins. A pocketful of XP.</h2><p>' + dailyCount() + ' of 3 quests complete' + (state.daily.claimed ? ' · reward claimed!' : '') + '</p><button class="primary-button" data-module="daily">Open today’s quest →</button></div><div class="lab-feature-art">🎯<span>+80 XP</span></div></section>' +
      '<div class="lab-module-grid">' +
      moduleCard("reels", "📼", "Knowledge Reels", "60-SECOND LEARN", "Flip bite-sized lessons, then prove you caught the idea.", state.reels.length + "/3 collected") +
      moduleCard("sim", "🎭", "Choose Your Move", "BRANCHING STORY", "Three workplace moments. Your choices change the debrief.", state.simulator.done ? "Replay story" : "Continue story") +
      moduleCard("badges", "🏆", "Badge Shelf", "COLLECT THEM", "Unlock tiny trophies for skills you actually practiced.", unlocked + " unlocked") +
      moduleCard("daily", "🗓️", "Daily Quest", "FRESH EACH DAY", "A small mission, a quick reel, and one story decision.", dailyCount() + "/3 complete") +
      '</div><section class="lab-footer-tip"><span>💡</span><p><b>Little and often wins.</b> These side quests are short on purpose. Come back tomorrow for a fresh daily checklist.</p></section>';
  }
  var ANIMATED = [
    { view: "sort", icon: "🧮", name: "DSA", tag: "DATA STRUCTURES & ALGORITHMS", desc: "Step through classic algorithms with the real code beside the animation.", status: function() { return state.sortLab.bubble.done ? "Bubble Sort · Completed ✓" : "Bubble Sort · +40 XP"; } }
  ];
  function animatedPage() {
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">SEE IT MOVE</span><h1>Animated 🎞️</h1><p>Interactive walkthroughs you can play, pause, and step through at your own pace.</p></div></section>' +
      '<div class="lab-module-grid">' + ANIMATED.map(function(c) { return moduleCard(c.view, c.icon, c.name, c.tag, c.desc, c.status()); }).join("") + '</div>' +
      '<section class="lab-footer-tip"><span>💡</span><p><b>More topics are on the way.</b> Each one earns XP the first time you watch it all the way through.</p></section>';
  }
  function sortPage() {
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">ANIMATED · DSA · +40 XP</span><h1>DSA 🧮 <small>Bubble Sort</small></h1><p>Play it, pause it, step through it. Watch every step once to earn XP and the Sort Sprinter badge.</p></div><button class="dev-link" data-nav="anim">← Animated</button></section><div id="bubble-sort-host"></div>';
  }
  function mountSortLab() {
    var host = document.getElementById("bubble-sort-host");
    if (!host || !window.SkillQuestBubbleSort) { if (host) host.textContent = "The visualizer could not load. Refresh the page to try again."; return; }
    window.SkillQuestBubbleSort.mount(host, { alreadyDone: state.sortLab.bubble.done, onComplete: completeBubbleSort });
  }
  function completeBubbleSort(result) {
    if (state.sortLab.bubble.done) return { message: "✓ Sort Sprinter badge earned — replay any time for practice." };
    state.sortLab.bubble.done = true; state.xp += 40; save();
    say("Bubble Sort complete! +40 XP");
    return { message: "🎉 You watched all " + result.comparisons + " comparisons and " + result.swaps + " swaps. +40 XP and the Sort Sprinter badge!" };
  }
  function dailyPage() {
    var n = dailyCount(), done = n === DAILY_TASKS.length;
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">FRESH CHECKLIST · ' + esc(state.daily.date) + '</span><h1>Today’s tiny quest 🗓️</h1><p>Three small actions. Your streak grows one good day at a time.</p></div><button class="dev-link" data-nav="lab">← Play Lab</button></section>' +
      '<section class="daily-hero"><div class="daily-sun">🌞</div><div><span class="dev-eyebrow">PIP’S DAILY DASH</span><h2>' + n + ' / 3 little wins</h2><p>Complete all three, then open your +80 XP reward.</p><div class="daily-big-track"><i style="width:' + Math.round(n / 3 * 100) + '%"></i></div></div><div class="daily-stamp">' + (state.daily.claimed ? '🎁<small>CLAIMED</small>' : (done ? '🎁<small>READY!</small>' : '✨<small>IN PROGRESS</small>')) + '</div></section>' +
      '<div class="daily-task-list">' + DAILY_TASKS.map(function(t) { var yes = has(state.daily.actions, t[0]); return '<div class="daily-task ' + (yes ? 'task-done' : '') + '"><span class="daily-task-icon">' + t[1] + '</span><div><strong>' + t[2] + '</strong><small>' + t[3] + '</small></div><span class="daily-task-state">' + (yes ? '✓ DONE' : 'NOT YET') + '</span><button class="secondary-button" data-module="' + (t[0] === 'mission' ? 'map' : (t[0] === 'reel' ? 'reels' : 'sim')) + '">' + (yes ? 'Again' : 'Go') + ' →</button></div>'; }).join('') + '</div>' +
      '<div class="daily-reward-row"><span>🎁 Finish all 3 to claim</span><button class="primary-button" data-action="claim-daily"' + (!done || state.daily.claimed ? ' disabled' : '') + '>' + (state.daily.claimed ? 'Reward claimed ✓' : 'Claim +80 XP') + '</button></div>';
  }
  function reelsPage() {
    var r = REELS[reelIndex], completed = has(state.reels, r.id), answered = reelAnswer !== null;
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">QUICK LEARN · ' + (reelIndex + 1) + ' OF ' + REELS.length + '</span><h1>Knowledge Reels 📼</h1><p>Flip a card, catch one idea, and bank a little XP.</p></div><button class="dev-link" data-nav="lab">← Play Lab</button></section>' +
      '<div class="reel-wrap"><div class="reel-progress">' + REELS.map(function(x, i) { return '<button class="reel-dot ' + (i === reelIndex ? 'active' : '') + ' ' + (has(state.reels, x.id) ? 'done' : '') + '" data-action="reel-goto" data-index="' + i + '" aria-label="Reel ' + (i + 1) + '"></button>'; }).join('') + '</div>' +
      '<button class="reel-card ' + (reelRevealed ? 'flipped' : '') + '" data-action="reel-flip"><span class="reel-card-tag">' + r.tag + '</span><span class="reel-card-icon">' + r.icon + '</span><strong>' + (reelRevealed ? r.title : r.hook) + '</strong><small>' + (reelRevealed ? 'TAP TO FLIP BACK' : 'TAP TO REVEAL THE 20-SECOND TIP') + '</small></button>' +
      (reelRevealed ? '<section class="reel-lesson"><span>💡 PIP’S POCKET TIP</span><p>' + r.lesson + '</p><h3>' + r.question + '</h3><div class="reel-answer-list">' + r.options.map(function(x, i) { return '<button class="reel-answer ' + (reelAnswer === i ? 'picked' : '') + '" data-reel-answer="' + i + '">' + x + '</button>'; }).join('') + '</div>' + (reelFeedback ? '<p class="reel-feedback ' + (completed ? 'correct' : '') + '">' + reelFeedback + '</p>' : '') + '<button class="primary-button" data-action="reel-check"' + (!answered || completed ? ' disabled' : '') + '>' + (completed ? 'Reel collected ✓' : 'Check it · +35 XP') + '</button></section>' : '<p class="reel-swipe-hint">Tiny lesson. No long scroll. Pinky promise. 🤙</p>') +
      '<div class="reel-nav"><button class="secondary-button" data-action="reel-prev">← Previous</button><span>' + state.reels.length + ' / ' + REELS.length + ' collected</span><button class="secondary-button" data-action="reel-next">Next →</button></div></div>';
  }
  function simulatorPage() {
    var s = state.simulator;
    if (s.done) {
      root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">STORY COMPLETE · DEBRIEF TIME</span><h1>You handled the moment 🎬</h1><p>Real work is messy. Good decisions come from evidence, scope, and people.</p></div><button class="dev-link" data-nav="lab">← Play Lab</button></section><section class="sim-result"><div class="sim-result-mascot">🦊</div><div><span class="dev-eyebrow">YOUR TEAMWORK SCORE</span><h2>' + s.score + ' / 6 points</h2><p>' + (s.score >= 5 ? 'Calm, clear, and careful. Pip approves.' : 'Every choice is practice. Try another path and compare the outcome.') + '</p><strong>+ ' + (s.reward || 0) + ' XP earned</strong></div></section><div class="sim-debrief">' + (s.choices || []).map(function(c, i) { return '<div class="sim-debrief-row"><span>' + (i + 1) + '</span><div><strong>' + esc(c.option) + '</strong><small>' + esc(c.feedback) + '</small></div></div>'; }).join('') + '</div><button class="primary-button" data-action="sim-restart">Play the story again ↻</button>';
      return;
    }
    var i = Math.min(s.stage, SIM_STEPS.length - 1), step = SIM_STEPS[i];
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">WORKPLACE SIMULATOR · SCENE ' + (i + 1) + ' OF ' + SIM_STEPS.length + '</span><h1>Choose Your Move 🎭</h1><p>Your choices change the debrief. There’s no timer and no real-world risk.</p></div><button class="dev-link" data-nav="lab">← Play Lab</button></section>' +
      '<div class="sim-scene-track">' + SIM_STEPS.map(function(_, j) { return '<span class="' + (j < i ? 'complete' : (j === i ? 'active' : '')) + '"></span>'; }).join('') + '</div>' +
      (s.last ? '<div class="sim-last-feedback">💬 ' + esc(s.last) + '</div>' : '') +
      '<section class="sim-scene"><div class="sim-scene-person">' + (i === 0 ? '🧑‍💻' : (i === 1 ? '🧑‍🤝‍🧑' : '🦊')) + '</div><span class="dev-eyebrow">' + step.speaker + '</span><h2>' + step.text + '</h2><div class="sim-options">' + step.options.map(function(x, j) { return '<button class="sim-option" data-sim-choice="' + j + '"><span>' + String.fromCharCode(65 + j) + '</span>' + x + '<b>→</b></button>'; }).join('') + '</div><small class="sim-score-hint">Current team points: ' + s.score + ' · pick what you’d really do.</small></section>';
  }
  function badgeList() {
    return [
      { icon: '🪄', title: 'First Spark', desc: 'Finish your first skill mission.', unlocked: state.played.length > 0 },
      { icon: '🐛', title: 'Bug Buddy', desc: 'Score 80% or better in Spot the Bug.', unlocked: (state.best['spot-bug'] || 0) >= 80 },
      { icon: '🧾', title: 'Spec Sleuth', desc: 'Score 80% or better in Spec Check.', unlocked: (state.best['spec-check'] || 0) >= 80 },
      { icon: '📼', title: 'Pocket Professor', desc: 'Collect all three Knowledge Reels.', unlocked: state.reels.length >= REELS.length },
      { icon: '🎭', title: 'Calm in the Chaos', desc: 'Finish the workplace simulator.', unlocked: state.simulator.done },
      { icon: '🫧', title: 'Sort Sprinter', desc: 'Watch the whole Bubble Sort Lab.', unlocked: state.sortLab.bubble.done },
      { icon: '🔥', title: 'Combo Spark', desc: 'Build a combo of three.', unlocked: (state.bestCombo || 0) >= 3 },
      { icon: '🎁', title: 'Daily Dynamo', desc: 'Claim the daily quest reward.', unlocked: state.daily.claimed },
      { icon: '🏕️', title: 'Streak Camper', desc: 'Reach a five-day learning streak.', unlocked: state.streak >= 5 }
    ];
  }
  function badgesPage() {
    var list = badgeList(), unlocked = list.filter(function(b) { return b.unlocked; }).length;
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">YOUR COLLECTION</span><h1>Badge Shelf 🏆</h1><p>' + unlocked + ' of ' + list.length + ' badges collected. Every one tells a story.</p></div><button class="dev-link" data-nav="lab">← Play Lab</button></section><div class="badge-grid">' + list.map(function(b) { return '<article class="badge-card ' + (b.unlocked ? 'unlocked' : 'locked') + '"><span>' + b.icon + '</span><strong>' + b.title + '</strong><small>' + b.desc + '</small><b>' + (b.unlocked ? 'COLLECTED ✓' : 'LOCKED 🔒') + '</b></article>'; }).join('') + '</div>';
  }
  function checkReel() {
    var r = REELS[reelIndex];
    if (reelAnswer === null) { say('Pick an answer first.'); return; }
    if (reelAnswer !== r.answer) { reelFeedback = 'Not quite — take another look at Pip’s tip and try again.'; draw(); return; }
    reelFeedback = 'Yep! You caught it. +35 XP and a little brain sparkle.';
    if (!has(state.reels, r.id)) { state.reels.push(r.id); state.xp += 35; trackDaily('reel'); save(); }
    say('Reel collected! +35 XP'); draw();
  }
  function claimDaily() {
    if (state.daily.claimed) { say('You already claimed today’s reward.'); return; }
    if (dailyCount() < DAILY_TASKS.length) { say('Finish all three little wins first.'); return; }
    state.daily.claimed = true; state.xp += 80; save(); draw(); say('Daily quest complete! +80 XP');
  }
  function chooseSim(index) {
    var s = state.simulator, step = SIM_STEPS[Math.min(s.stage, SIM_STEPS.length - 1)], points = step.points[index];
    s.score += points; s.last = step.feedback[index]; s.choices = s.choices || []; s.choices.push({ option: step.options[index], feedback: step.feedback[index] }); s.stage += 1;
    if (s.stage >= SIM_STEPS.length) { s.done = true; s.reward = 40 + s.score * 15; state.xp += s.reward; trackDaily('sim'); say('Story complete! +' + s.reward + ' XP'); }
    else say(step.feedback[index]);
    save(); draw();
  }
  function rank() { return state.xp >= 2000 ? "Code Whisperer" : (state.xp >= 1200 ? "Bug Scout" : (state.xp >= 600 ? "Patch Apprentice" : "Curious Coder")); }
  function gameTop(g) {
    var l = g.level ? D.coreLevels[g.level - 1] : null;
    return '<div class="dev-game-top"><button class="back-link" data-nav="map">← Back to game map</button><div class="dev-engine-tag">' + (l ? l.icon + " Level " + g.level + " · " + l.name : "🤖 AI Engineer teaser") + '<span>' + g.engine + '</span></div><div class="dev-game-meter"><span style="width:' + (g.level ? g.level * 33.33 : 100) + '%"></span></div></div>';
  }
  function code(lines) { return '<pre class="dev-code"><code>' + esc(lines.join("\n")) + '</code></pre>'; }
  function codeLines(lines, selected, active) {
    return '<div class="dev-code-list">' + lines.map(function(line, i) { var yes = has(selected || [], i) || active === i; return '<button class="dev-code-line ' + (yes ? "selected" : "") + '" data-line="' + i + '"><span class="line-no">' + (i + 1) + '</span><code>' + esc(line) + '</code><span class="line-mark">' + (yes ? "✦" : "") + '</span></button>'; }).join("") + '</div>';
  }
  function gameScreen() {
    var g = G[current];
    if (!g) { go("map"); return; }
    root.innerHTML = '<div class="dev-game-page">' + gameTop(g) + '<section class="dev-game-card"><div class="dev-game-heading"><span class="dev-eyebrow">' + esc(g.skill) + '</span><h1>' + esc(g.title) + '</h1><p>' + esc(g.intro) + '</p></div>' +
      (session.result ? resultCard(g) : body(g)) +
      (!session.result ? '<div class="dev-game-footer"><button class="dev-hint-button" data-action="hint">' + (hint ? "🙈 Hide hint" : "💡 Need a nudge?") + '</button><button class="primary-button" data-action="submit">' + (g.kind === "codeFix" ? "Run the tests" : (g.kind === "specCheck" ? "Check this diff" : (g.kind === "prReview" ? "Send review to DevBot" : "Lock in my answer"))) + ' →</button></div>' + (hint ? '<div class="dev-hint"><b>Pip’s tiny hint:</b> ' + esc(g.concept) + '</div>' : "") : "") +
      '</section>' + '</div>';
    var submit = root.querySelector("[data-action='submit']");
    if (submit && !session.result && !canSubmit(g)) submit.disabled = true;
  }
  function body(g) {
    if (g.kind === "choice") return (g.code ? code(g.code) : "") + '<h2 class="dev-question">' + esc(g.question) + '</h2><div class="dev-choices">' + g.options.map(function(x, i) { return '<button class="dev-choice ' + (session.choice === i ? "picked" : "") + '" data-choice="' + i + '"><span class="choice-letter">' + String.fromCharCode(65 + i) + '</span><span>' + esc(x) + '</span></button>'; }).join("") + '</div>';
    if (g.kind === "tapLine") return '<div class="tap-instruction">Tap every line you want to flag.</div>' + codeLines(g.code, session.lines, null) + '<div class="dev-selected-count">🔎 ' + session.lines.length + ' selected</div>';
    if (g.kind === "multiSelect") return '<div class="tap-instruction">Tap every card that belongs in your answer.</div><div class="dev-pick-cards">' + g.items.map(function(x) { var yes = has(session.items, x.id); return '<button class="dev-pick-card ' + (yes ? "picked" : "") + '" data-item="' + esc(x.id) + '"><span class="pick-check">' + (yes ? "✓" : "+") + '</span><strong>' + esc(x.title) + '</strong><small>' + esc(x.detail) + '</small></button>'; }).join("") + '</div>';
    if (g.kind === "specCheck") return specBody(g);
    if (g.kind === "prReview") return prBody(g);
    if (g.kind === "codeFix") return codeFixBody(g);
    return "";
  }
  function specBody(g) {
    var criteria = g.requirements.map(function(r, i) {
      var v = session.verdicts[i], e = session.evidence[i], active = session.activeCriterion === i;
      return '<div class="spec-criterion ' + (active ? "active" : "") + '"><div class="spec-criterion-text"><span>' + (i + 1) + '</span><strong>' + esc(r.text) + '</strong></div><div class="spec-verdicts"><button class="' + (v === "met" ? "chosen good" : "") + '" data-verdict="' + i + '" data-value="met">✓ Met</button><button class="' + (v === "missing" ? "chosen bad" : "") + '" data-verdict="' + i + '" data-value="missing">✕ Missing</button></div><button class="evidence-pick ' + (active ? "active" : "") + '" data-action="evidence" data-index="' + i + '">' + (active ? "Now tap a code line ↓" : (typeof e === "number" ? "Evidence: line " + (e + 1) + " · change" : "Pick evidence line")) + '</button></div>';
    }).join("");
    return '<div class="ticket-card"><span>🎟️ SHOP-214 · ACCEPTANCE CRITERIA</span><strong>Coupon at checkout</strong><p>Apply an active code, allow one use per customer, reject expired coupons, and keep the total at or above ₹0.</p></div><div class="spec-layout"><div class="spec-criteria"><div class="spec-subhead">Does the diff meet it?</div>' + criteria + '</div><div class="spec-diff"><div class="spec-subhead">AI CHANGE · TAP EVIDENCE</div>' + codeLines(g.code, [], null) + '<label class="scope-flag"><input type="checkbox" data-scope ' + (session.scope ? "checked" : "") + '> <span><b>Flag scope creep</b><small>' + esc(g.scopeCreep) + '</small></span></label></div></div><p class="dev-inline-tip">' + (session.activeCriterion === null ? "Pick a criterion, choose Met or Missing, then choose its evidence line." : "Now tap the code line that best supports this answer.") + '</p>';
  }
  function prBody(g) {
    return '<div class="ticket-card"><span>🎟️ TICKET SHOP-214</span><p>' + esc(g.ticket) + '</p></div><div class="devbot-chat"><span class="devbot-face">🤖</span><div><strong>DevBot says:</strong><p>“I added the coupon logic and cleaned up a few things while I was in there. Ready to merge?”</p><small>Scripted demo chat · works offline</small></div></div><div class="pr-issue-list">' +
      g.issues.map(function(x, i) { var v = session.reviews[x.id]; return '<div class="pr-issue"><div class="pr-issue-num">0' + (i + 1) + '</div><p>' + esc(x.title) + '</p><button class="' + (v === true ? "picked" : "") + '" data-review="' + x.id + '" data-flag="true">🚩 Flag it</button><button class="' + (v === false ? "picked" : "") + '" data-review="' + x.id + '" data-flag="false">✅ Looks good</button></div>'; }).join("") + '</div>';
  }
  function codeFixBody(g) {
    var status = "";
    if (session.tests) status = '<div class="worker-test-results ' + (session.tests.all ? "all-pass" : "some-fail") + '"><strong>' + (session.tests.all ? "✅ All tests pass!" : "🧪 " + session.tests.passed + " of " + session.tests.total + " tests pass") + '</strong>' +
      session.tests.rows.map(function(r, i) { return '<span>' + (r.pass ? "✓" : "✕") + ' Test ' + (i + 1) + ': applyCoupon(' + r.total + ", " + r.discount + ") → " + esc(String(r.actual)) + (r.pass ? "" : " · expected " + r.expected) + '</span>'; }).join("") + '</div>';
    return '<div class="ticket-card"><span>🎟️ TICKET · COUPON-008</span><p>The discount may reduce the order total, but the final total must never be negative.</p></div><label class="code-editor-label" for="fix-editor">YOUR FIX <span>JavaScript · timed Web Worker</span></label><textarea id="fix-editor" class="code-editor" spellcheck="false" autocapitalize="off">' + esc(session.code || g.starterCode) + '</textarea><div class="test-expectations"><strong>Test cases</strong><span>100 − 20 → 80</span><span>50 − 80 → 0</span><span>0 − 10 → 0</span></div>' + status;
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
    var r = session.result;
    var chest = r.chestOpened ? '<div class="chest-opened">🎉 You found <b>' + esc(r.prize) + '</b> and +25 bonus XP!</div>' : (r.chest ? '<button class="mystery-chest" data-action="chest">📦 Open your mystery chest <span>tap for a bonus!</span></button>' : '<div class="chest-opened replay-note">🔁 Replay complete · best score ' + state.best[g.id] + '%</div>');
    return '<div class="dev-result ' + (r.score >= 80 ? "great" : (r.score >= 60 ? "okay" : "retry")) + '"><div class="dev-result-top"><span class="result-sticker">' + (r.score >= 80 ? "🎉" : (r.score >= 60 ? "✨" : "🧩")) + '</span><div><span class="dev-eyebrow">' + r.grade + '</span><h2>' + esc(r.headline) + '</h2></div><div class="score-donut"><strong>' + r.score + '</strong><small>POINTS</small></div></div><p>' + esc(r.explanation) + '</p><div class="concept-card"><span>💡 TAKE THIS WITH YOU</span><strong>' + esc(g.concept) + '</strong></div>' +
      (r.combo > 1 ? '<div class="combo-pop">🔥 Combo ×' + r.combo + (r.bonus ? " · +" + r.bonus + " bonus XP" : "") + '</div>' : "") + '<div class="result-xp">' + (r.xp ? "⚡ +" + r.xp + " XP" : "Practice run · no extra XP") + '</div>' + chest +
      (r.reply ? '<div class="devbot-reply"><span>🤖 DevBot:</span> ' + esc(r.reply) + '</div>' : "") + '<div class="result-actions"><button class="primary-button" data-action="continue">Keep going →</button><button class="secondary-button" data-action="replay">Play this one again</button><button class="secondary-button" data-nav="map">Back to map</button></div></div>';
  }
  function submit() {
    var g = G[current], score = 0, reply = "";
    if (!canSubmit(g)) { say("Finish the little checks first."); return; }
    if (g.kind === "codeFix") { runCode(g); return; }
    if (g.kind === "choice") score = session.choice === g.answer ? 100 : 0;
    if (g.kind === "tapLine") {
      var hits = session.lines.filter(function(n) { return has(g.badLines, n); }).length;
      score = Math.max(0, Math.round(hits / g.badLines.length * 100 - (session.lines.length - hits) * 25 - (g.badLines.length - hits) * 10));
    }
    if (g.kind === "multiSelect") {
      var target = g.answers, h = session.items.filter(function(id) { return has(target, id); }).length;
      score = Math.max(0, Math.round(h / target.length * 100 - (session.items.length - h) * 25 - (target.length - h) * 10));
    }
    if (g.kind === "specCheck") {
      var wins = 0;
      g.requirements.forEach(function(r, i) { if (session.verdicts[i] === (r.met ? "met" : "missing") && session.evidence[i] === r.line) wins += 1; });
      if (session.scope) wins += 1;
      score = Math.round(wins / 5 * 100);
    }
    if (g.kind === "prReview") {
      var correct = g.issues.filter(function(x) { return session.reviews[x.id] === x.shouldFlag; });
      score = Math.round(correct.length / g.issues.length * 100);
      var firstFlag = g.issues.find(function(x) { return session.reviews[x.id] === true; });
      reply = firstFlag ? firstFlag.reply : "That part is covered. The expiry check matches the ticket.";
    }
    finish(g, score, g.explanation, reply);
  }
  function finish(g, score, explanation, reply) {
    score = Math.max(0, Math.min(100, Math.round(score)));
    var first = !has(state.played, g.id), boss = isBoss(g.id), xp = first ? Math.round((g.xp || 50) * score / 100) : 0;
    state.combo = score >= 80 ? (state.combo || 0) + 1 : 0;
    var bonus = first && state.combo >= 2 ? (state.combo - 1) * 10 : 0;
    if (first) { state.played.push(g.id); state.xp += xp + bonus; }
    trackDaily("mission");
    state.best[g.id] = Math.max(Number(state.best[g.id]) || 0, score);
    if (boss && score >= 80 && !has(state.bosses, g.id)) state.bosses.push(g.id);
    if (score < 60) state.rematchAt[g.id] = Date.now() + 48 * 60 * 60 * 1000; else delete state.rematchAt[g.id];
    state.bestCombo = Math.max(state.bestCombo || 0, state.combo || 0);
    var chest = first && !has(state.chests, g.id);
    session.result = { score: score, grade: score >= 80 ? "Nailed it!" : (score >= 60 ? "Okay — nice progress!" : "Keep investigating!"), xp: xp + bonus, combo: state.combo, bonus: bonus, headline: boss && score < 80 ? "Boss still has a little health." : (score >= 80 ? "Clean review!" : (score >= 60 ? "You caught the main idea." : "A rematch will be waiting.")), explanation: explanation || g.explanation || "Take another look at the requirement and the evidence.", reply: reply, chest: chest, chestOpened: false };
    save();
    if (state.sound && score >= 80) beep();
    draw();
  }
  function runCode(g) {
    var editor = document.getElementById("fix-editor");
    if (editor) session.code = editor.value;
    var workerCode = [
      "self.onmessage=function(e){try{var fn=new Function('return ('+e.data.code+')')();if(typeof fn!=='function')throw new Error('Write a function to test.');var rows=e.data.tests.map(function(t){try{var actual=fn(t.total,t.discount);return{total:t.total,discount:t.discount,expected:t.expected,actual:actual,pass:actual===t.expected}}catch(x){return{total:t.total,discount:t.discount,expected:t.expected,actual:x.message,pass:false}}});self.postMessage({rows:rows})}catch(x){self.postMessage({error:x.message})}};"
    ].join("");
    try {
      var url = URL.createObjectURL(new Blob([workerCode], { type: "text/javascript" })), worker = new Worker(url);
      say("Running tests in a timed sandbox…");
      var timeout = setTimeout(function() { worker.terminate(); URL.revokeObjectURL(url); say("That took too long. Check for a loop."); }, 1500);
      worker.onmessage = function(e) {
        clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(url);
        if (e.data.error) { session.tests = { all: false, passed: 0, total: g.tests.length, rows: g.tests.map(function(t) { return { total: t.total, discount: t.discount, expected: t.expected, actual: e.data.error, pass: false }; }) }; draw(); return; }
        var rows = e.data.rows, passed = rows.filter(function(r) { return r.pass; }).length;
        session.tests = { all: passed === rows.length, passed: passed, total: rows.length, rows: rows };
        if (passed === rows.length) finish(g, 100, "Every test passes, including the edge case. Nice catch on the missing lower bound.");
        else draw();
      };
      worker.onerror = function() { clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(url); say("Couldn’t run that snippet. Check the syntax."); };
      worker.postMessage({ code: session.code, tests: g.tests });
    } catch (e) { say("This browser couldn’t start the code runner."); }
  }
  function chest() {
    if (!session.result || !session.result.chest) return;
    var prizes = ["a tiny golden bug pin 🐛", "a pixel rocket 🚀", "the Careful Coder badge 🏅", "a smug fox sticker 🦊"];
    session.result.prize = prizes[Math.floor(Math.random() * prizes.length)];
    session.result.chestOpened = true; session.result.chest = false;
    if (current && !has(state.chests, current)) state.chests.push(current);
    state.xp += 25; save(); beep(); draw();
  }
  function beep() {
    if (!state.sound) return;
    try { var C = window.AudioContext || window.webkitAudioContext; if (!C) return; var c = new C(), o = c.createOscillator(), v = c.createGain(); o.frequency.value = 740; v.gain.value = .04; o.connect(v); v.connect(c.destination); o.start(); o.stop(c.currentTime + .12); setTimeout(function() { c.close(); }, 250); } catch (e) {}
  }
  function reset() {
    state = account ? freshAccount(account.name) : seed(); save(); go("home"); say("Fresh start! Pip is cheering you on.");
  }

  document.addEventListener("click", function(e) {
    var accountModeButton = e.target.closest("[data-account-mode]");
    if (accountModeButton) { renderAccountModal(accountModeButton.dataset.accountMode); return; }
    if (e.target.id === "account-modal-root" || e.target.classList.contains("account-backdrop")) { closeAccountModal(); return; }
    var nav = e.target.closest("[data-nav]");
    if (nav) { e.preventDefault(); go(nav.dataset.nav); return; }
    var moduleButton = e.target.closest("[data-module]");
    if (moduleButton) { e.preventDefault(); go(moduleButton.dataset.module); return; }
    var reelPick = e.target.closest("[data-reel-answer]");
    if (reelPick) { reelAnswer = Number(reelPick.dataset.reelAnswer); reelFeedback = ""; draw(); return; }
    var simPick = e.target.closest("[data-sim-choice]");
    if (simPick) { chooseSim(Number(simPick.dataset.simChoice)); return; }
    var gameButton = e.target.closest("[data-game]");
    if (gameButton) { open(gameButton.dataset.game); return; }
    var actionButton = e.target.closest("[data-action]"), action = actionButton && actionButton.dataset.action;
    if (action === "account") renderAccountModal(account ? "account" : "login");
    else if (action === "close-account") closeAccountModal();
    else if (action === "account-logout") signOut();
    else if (action === "continue") open(nextGame());
    else if (action === "hint") { hint = !hint; draw(); }
    else if (action === "submit") submit();
    else if (action === "chest") chest();
    else if (action === "replay") open(current);
    else if (action === "sound") { state.sound = !state.sound; save(); draw(); say(state.sound ? "Sound on 🔊" : "Sound off 🔈"); }
    else if (action === "reset") reset();
    else if (action === "claim-daily") claimDaily();
    else if (action === "reel-flip") { reelRevealed = !reelRevealed; draw(); }
    else if (action === "reel-check") checkReel();
    else if (action === "reel-prev" || action === "reel-next" || action === "reel-goto") {
      reelIndex = action === "reel-goto" ? Number(actionButton.dataset.index) : (reelIndex + (action === "reel-next" ? 1 : REELS.length - 1)) % REELS.length;
      reelRevealed = false; reelAnswer = null; reelFeedback = ""; draw();
    }
    else if (action === "sim-restart") { state.simulator = { stage: 0, score: 0, done: false, last: "", choices: [], reward: 0 }; save(); draw(); }
    else if (action === "ai") { track = "ai"; go("map"); }
    else if (action === "core") { track = "core"; go("map"); }
    else if (action === "evidence") { session.activeCriterion = Number(actionButton.dataset.index); draw(); }
    var choice = e.target.closest("[data-choice]");
    if (choice && !session.result) { session.choice = Number(choice.dataset.choice); draw(); return; }
    var line = e.target.closest("[data-line]");
    if (line && !session.result) {
      var no = Number(line.dataset.line), g = G[current];
      if (g.kind === "specCheck" && session.activeCriterion !== null) { session.evidence[session.activeCriterion] = no; session.activeCriterion = null; }
      else session.lines = has(session.lines, no) ? session.lines.filter(function(x) { return x !== no; }) : session.lines.concat([no]);
      draw(); return;
    }
    var card = e.target.closest("[data-item]");
    if (card && !session.result) { var id = card.dataset.item; session.items = has(session.items, id) ? session.items.filter(function(x) { return x !== id; }) : session.items.concat([id]); draw(); return; }
    var verdict = e.target.closest("[data-verdict]");
    if (verdict && !session.result) { session.verdicts[verdict.dataset.verdict] = verdict.dataset.value; draw(); return; }
    var review = e.target.closest("[data-review]");
    if (review && !session.result) { session.reviews[review.dataset.review] = review.dataset.flag === "true"; draw(); return; }
  });
  document.addEventListener("change", function(e) {
    if (e.target.matches("[data-scope]")) { session.scope = e.target.checked; session.scopeTouched = true; draw(); }
  });
  document.addEventListener("input", function(e) { if (e.target.id === "fix-editor") session.code = e.target.value; });
  document.addEventListener("submit", function(e) {
    if (e.target.id === "account-form") { e.preventDefault(); submitAccount(e.target); }
  });
  draw();
  syncAccountUi();
  initAccount();
})(); 
