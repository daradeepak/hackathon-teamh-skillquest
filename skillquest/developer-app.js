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
    { speaker: "Maya · Manager", text: "Two of your tasks are both marked urgent, and you can only finish one by Friday. What do you do?", options: ["Tell Maya both are at risk and ask which one matters most.", "Quietly work late and hope you finish both.", "Pick one yourself and don’t mention the other."], points: [2, 0, 1], feedback: ["Great call. You made the trade-off visible and let the priority owner decide.", "Hoping to do everything leads to burnout and surprises.", "Choosing alone can miss what matters most to others. Tell people about the trade-off."] },
    { speaker: "Leo · Teammate", text: "In the meeting, Leo presents your idea as his own. Afterwards he looks a bit awkward. How do you respond?", options: ["Talk to Leo privately: “I noticed the idea was mine. Can we credit it properly next time?”", "Say nothing and stay annoyed.", "Correct him loudly in front of the team."], points: [2, 0, 1], feedback: ["Nice. You were direct, kind, and focused on the next step.", "Silent resentment tends to grow and hurts the working relationship.", "Being direct is good, but a public correction can make people defensive. Try it privately first."] },
    { speaker: "Pip 🦊 · Client call", text: "A client is upset about a missed deadline and starts raising their voice. What happens first?", options: ["Stay calm, acknowledge their frustration, and say what you’ll do next.", "Explain all the reasons it wasn’t your fault.", "End the call until they calm down."], points: [2, 1, 0], feedback: ["Yes. Acknowledging feelings first lowers the temperature, and a clear next step rebuilds trust.", "Explanations can sound like excuses before the person feels heard.", "Ending the call can make a bad moment worse. Stay steady and keep it constructive."] }
  ];
  function sortLabOf(x) { return { bubble: { done: !!(x && x.bubble && x.bubble.done) } }; }
  function fresh() { return { choice: null, items: [], result: null }; }
  function seed() {
    return { name: "Arjun", xp: 840, streak: 5, combo: 2, bestCombo: 4,
      played: ["status-update", "active-listening", "escalation-note"],
      best: { "status-update": 100, "active-listening": 100, "escalation-note": 90 },
      bosses: ["escalation-note"], chests: ["status-update", "active-listening", "escalation-note"], rematchAt: {}, sound: false,
      daily: { date: dayKey(), actions: [], claimed: false }, reels: [], sortLab: sortLabOf(), simulator: { stage: 0, score: 0, done: false, last: "" } };
  }
  function known(id) { return Object.prototype.hasOwnProperty.call(G, id); }
  function cleanProgress(p) {
    p.played = p.played.filter(known); p.bosses = (p.bosses || []).filter(known); p.chests = (p.chests || []).filter(known);
    p.best = Object.keys(p.best || {}).reduce(function(o, id) { if (known(id)) o[id] = p.best[id]; return o; }, {});
    p.rematchAt = Object.keys(p.rematchAt || {}).reduce(function(o, id) { if (known(id)) o[id] = p.rematchAt[id]; return o; }, {});
    return p;
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.played)) return cleanProgress(Object.assign(seed(), s, { best: s.best || {}, bosses: s.bosses || [], chests: s.chests || [], rematchAt: s.rematchAt || {}, reels: s.reels || [], sortLab: sortLabOf(s.sortLab), daily: Object.assign(seed().daily, s.daily || {}), simulator: Object.assign(seed().simulator, s.simulator || {}) }));
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
    return cleanProgress(Object.assign(base, progress, {
      name: name,
      best: progress.best && typeof progress.best === "object" ? progress.best : {},
      bosses: Array.isArray(progress.bosses) ? progress.bosses : [],
      chests: Array.isArray(progress.chests) ? progress.chests : [],
      rematchAt: progress.rematchAt && typeof progress.rematchAt === "object" ? progress.rematchAt : {},
      reels: Array.isArray(progress.reels) ? progress.reels : [],
      sortLab: sortLabOf(progress.sortLab),
      daily: Object.assign(base.daily, progress.daily || {}),
      simulator: Object.assign(base.simulator, progress.simulator || {})
    }));
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
  function currentLevel() { var n = 1; D.coreLevels.forEach(function(l, i) { if (bossBeat(l.boss) && i + 1 < D.coreLevels.length) n = i + 2; }); return n; }
  function levelOpen(n) { return n === 1 || bossBeat(D.coreLevels[n - 2].boss); }
  function okayCount(n) { return D.coreLevels[n - 1].games.filter(function(id) { return (state.best[id] || 0) >= 60; }).length; }
  function bossOpen(n) { var l = D.coreLevels[n - 1]; return bossBeat(l.boss) || okayCount(n) >= l.games.length; }
  function canOpen(id) { var g = G[id]; return !!g && levelOpen(g.level) && (!isBoss(id) || bossOpen(g.level)); }
  function nextGame() {
    var l = D.coreLevels[currentLevel() - 1];
    var id = l.games.find(function(k) { return !has(state.played, k); });
    if (id) return id;
    if (bossOpen(l.id) && !bossBeat(l.boss)) return l.boss;
    return l.games[0];
  }
  function open(id) {
    if (!canOpen(id)) { say(isBoss(id) ? "Finish the missions in this level at Okay or better to unlock the challenge." : "Beat the earlier challenge to open this level."); return; }
    current = id; view = "game"; hint = false; session = fresh();
    draw(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  var sortBack = "anim";
  var LAB_VIEWS = ["lab", "daily", "reels", "badges"], LAB_ENABLED = false; /* Play Lab is hidden for now; flip to true (and restore the sidebar button in index.html and the home banner) to bring it back */
  function go(where) { if (where === "sort") sortBack = view === "map" ? "map" : "anim"; if (!LAB_ENABLED && has(LAB_VIEWS, where)) where = "home"; view = where; current = null; hint = false; if (where === "reels") { reelRevealed = false; reelAnswer = null; reelFeedback = ""; } draw(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function draw() {
    if (view === "home") { label.textContent = "Home"; home(); if (LAB_ENABLED) root.insertAdjacentHTML("afterbegin", dailyBanner()); }
    else if (view === "map") { label.textContent = "Game map"; track === "dsa" ? dsaMap() : map(); }
    else if (view === "stats") { label.textContent = "Scoreboard"; stats(); }
    else if (view === "lab") { label.textContent = "Play Lab"; labHome(); }
    else if (view === "anim") { label.textContent = "Animated"; animatedPage(); }
    else if (view === "sort") { label.textContent = sortBack === "map" ? "Game map · DSA" : "Animated · DSA"; sortPage(); }
    else if (view === "daily") { label.textContent = "Daily quest"; dailyPage(); }
    else if (view === "reels") { label.textContent = "Knowledge reels"; reelsPage(); }
    else if (view === "sim") { label.textContent = "Workplace simulator"; simulatorPage(); }
    else if (view === "badges") { label.textContent = "Badge shelf"; badgesPage(); }
    else { label.textContent = G[current] ? G[current].title : "Game"; gameScreen(); }
    document.querySelectorAll(".nav-item").forEach(function(b) { b.classList.toggle("is-active", b.dataset.nav === view || (view === "game" && b.dataset.nav === "map") || (view === "sim" && b.dataset.nav === "map") || (b.dataset.nav === "lab" && ["daily", "reels", "sim", "badges"].indexOf(view) >= 0) || (b.dataset.nav === (sortBack === "map" ? "map" : "anim") && view === "sort")); });
    if (view === "sort") mountSortLab(); else if (window.SkillQuestBubbleSort) window.SkillQuestBubbleSort.unmount();
    syncAccountUi();
    var sound = document.querySelector("[data-action='sound']");
    if (sound) { sound.textContent = state.sound ? "🔊 Sound on" : "🔈 Sound off"; sound.setAttribute("aria-pressed", String(state.sound)); }
  }
  function tile(id, compact) {
    var g = G[id], done = has(state.played, id), locked = !canOpen(id), rematch = state.rematchAt[id] && state.rematchAt[id] <= Date.now();
    return '<button class="dev-game-tile ' + (compact ? "compact " : "") + (done ? "played " : "") + (locked ? "locked " : "") + (rematch ? "is-rematch " : "") + '" data-game="' + id + '"' + (locked ? " disabled" : "") + '><span class="dev-game-icon">' +
      (isBoss(id) ? "👑" : D.coreLevels[g.level - 1].icon) +
      '</span><span class="dev-game-text"><strong>' + esc(g.title) + '</strong><small>' + (rematch ? "REMATCH READY" : (isBoss(id) ? "BOSS ROUND" : g.engine)) + '</small></span><span class="dev-game-status">' + (locked ? "🔒" : (done ? ((state.best[id] || 0) >= 60 ? "✓" : "↻") : "→")) + '</span></button>';
  }
  function home() {
    var n = currentLevel(), l = D.coreLevels[n - 1], g = G[nextGame()];
    var quick = l.games.map(function(id) { return tile(id, true); }).join("");
    var due = Object.keys(state.rematchAt).find(function(id) { return state.rematchAt[id] <= Date.now(); });
    root.innerHTML =
      '<section class="dev-welcome"><div class="dev-wave">👋</div><div class="dev-welcome-copy"><span class="dev-eyebrow">DAY ' + state.streak + ' STREAK · SOFT SKILLS</span><h1>Hey ' + esc(state.name) + '! Ready to practice a real-life moment?</h1><p>Short missions that build the people skills great teams run on.</p></div><div class="dev-top-stats"><span class="dev-chip xp-chip">⚡ ' + state.xp + ' XP</span><span class="dev-chip streak-chip">🔥 ' + state.streak + ' days</span><span class="dev-chip combo-chip">🎯 ×' + state.combo + ' combo</span></div></section>' +
      '<section class="dev-hero"><div class="dev-hero-copy"><span class="dev-hero-tag">' + l.icon + ' LEVEL ' + l.id + ' · ' + l.name.toUpperCase() + '</span><h2>What would you say<br>in this moment?</h2><p>Read a short workplace scenario, pick your best move, and see why it works. Earn XP for every mission.</p><button class="primary-button dev-play-button" data-action="continue">Jump back in →</button></div><div class="dev-hero-art"><div class="dev-orbit"></div><div class="dev-mascot">🦊</div><div class="dev-speech">Pip: how would that land?</div><span class="dev-float f1">✨ skill streak</span><span class="dev-float f2">+ XP</span></div></section>' +
      '<div class="dev-section-head"><div><span class="dev-eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>' + l.icon + ' ' + l.name + ' <small>' + l.games.filter(function(id) { return has(state.played, id); }).length + '/' + l.games.length + ' missions played</small></h2></div><button class="dev-link" data-nav="map">Open game map →</button></div>' +
      '<section class="dev-quick-games">' + quick + '</section>' +
      (due ? '<button class="rematch-banner" data-game="' + due + '">🔁 Your rematch is ready: ' + esc(G[due].title) + ' <span>Play it →</span></button>' : "") +
      '<section class="dev-bottom-grid"><div class="dev-panel"><div class="dev-panel-head"><h3>🎮 Your three-level journey</h3><button class="dev-link" data-nav="map">See map →</button></div><div class="dev-progress-strip">' +
        D.coreLevels.map(function(level) { var locked = !levelOpen(level.id); return '<button class="dev-progress-level ' + (locked ? "locked" : "") + '" data-nav="map"><span>' + (locked ? "🔒" : (bossBeat(level.boss) ? "✅" : "▶")) + '</span><strong>' + level.name + '</strong><small>' + (locked ? "Coming up" : level.games.filter(function(id) { return has(state.played, id); }).length + "/" + level.games.length + " missions") + '</small></button>'; }).join("") +
      '</div></div><div class="dev-panel teaser-panel"><span class="dev-eyebrow">ALSO ON THE MAP</span><h3>🧮 DSA</h3><p>Watch algorithms move, step by step, with the real code beside them.</p><button class="secondary-button" data-action="dsa">Open DSA →</button></div></section>';
  }
  function map() {
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">SOFT SKILLS</span><h1>Three levels. One useful superpower.</h1><p>Say it clearly. Work together. Own it.</p></div><div class="dev-track-tabs"><button class="track-tab is-active" data-action="core">Soft Skills</button><button class="track-tab" data-action="dsa">DSA</button></div></section>' +
      '<section class="dev-map-intro"><span class="dev-map-mascot">🦊</span><div><strong>Hey, ' + esc(state.name) + '!</strong> Finish both missions in a level at <b>Okay</b> or better to unlock its challenge. Pass the challenge to open the next level.</div></section>' +
      '<div class="dev-levels">' + D.coreLevels.map(levelCard).join("") + '</div><div class="lab-module-grid">' + moduleCard("sim", "🎭", "Choose Your Move", "BRANCHING STORY", "Three workplace moments. Your choices change the debrief.", state.simulator.done ? "Replay story" : "Continue story") + '</div><p class="dev-fineprint">All scenarios are fictional demo content. Scores are for practice, not performance reviews.</p>';
  }
  function dsaMap() {
    var done = state.sortLab.bubble.done;
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">DATA STRUCTURES & ALGORITHMS</span><h1>See how algorithms really work.</h1><p>Step through the code, watch the data move, and earn XP for finishing.</p></div><div class="dev-track-tabs"><button class="track-tab" data-action="core">Soft Skills</button><button class="track-tab is-active" data-action="dsa">DSA</button></div></section>' +
      '<section class="dev-level-card lavender"><header class="dev-level-head"><span class="dev-level-icon">🧮</span><div class="dev-level-info"><span class="dev-eyebrow">SORTING</span><h2>DSA</h2><p>Animated walkthroughs with the real code beside them.</p></div><div class="dev-level-count">' + (done ? 1 : 0) + '/1 done</div></header>' +
      '<div class="dev-game-grid"><button class="dev-game-tile ' + (done ? "played" : "") + '" data-module="sort"><span class="dev-game-icon">🫧</span><span class="dev-game-text"><strong>Bubble Sort</strong><small>ANIMATED · O(n²)</small></span><span class="dev-game-status">' + (done ? "✓" : "→") + '</span></button></div></section>' +
      '<p class="dev-fineprint">More algorithms will be added here over time.</p>';
  }
  function levelCard(l) {
    var locked = !levelOpen(l.id), played = l.games.filter(function(id) { return has(state.played, id); }).length, ok = okayCount(l.id), boss = bossOpen(l.id), beat = bossBeat(l.boss);
    return '<section class="dev-level-card ' + l.color + (locked ? " is-locked" : "") + '"><header class="dev-level-head"><span class="dev-level-icon">' + (locked ? "🔒" : l.icon) + '</span><div class="dev-level-info"><span class="dev-eyebrow">LEVEL ' + l.id + (beat ? " · CLEARED!" : "") + '</span><h2>' + l.name + '</h2><p>' + l.subtitle + '</p></div><div class="dev-level-count">' + (locked ? "LOCKED" : played + "/" + l.games.length + " games") + '</div></header>' +
      (locked ? '<div class="dev-locked-note">Beat the Level 2 boss to open this zone. 🔒</div>' :
        '<div class="dev-game-grid">' + l.games.map(function(id) { return tile(id, false); }).join("") + '</div><div class="dev-boss-row ' + (boss ? "boss-ready" : "") + '"><div class="boss-badge">👑</div><div class="boss-info"><strong>BOSS ROUND · ' + esc(G[l.boss].title) + '</strong><span>' + (beat ? "Boss cleared! You did the thing." : (boss ? "Unlocked. Go show what you know." : "Win 3 games at Okay or better · " + ok + "/3 so far")) + '</span></div><button class="boss-button" data-game="' + l.boss + '"' + (!boss ? " disabled" : "") + '>' + (beat ? "Replay" : (boss ? "Fight boss →" : "🔒")) + '</button></div>') + '</section>';
  }
  function stats() {
    var ids = Object.keys(state.best), avg = ids.length ? Math.round(ids.reduce(function(s, id) { return s + state.best[id]; }, 0) / ids.length) : 0;
    var skillset = D.coreLevels.map(function(l) { return [l.skill, l.games.concat([l.boss])]; });
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">YOUR SCOREBOARD</span><h1>Nice work, ' + esc(state.name) + ' ✨</h1><p>Stats track practice. They’re not a work-performance score.</p></div><button class="secondary-button" data-action="reset">Reset demo profile</button></section><section class="dev-stats-hero"><div><span class="dev-rank-pill">🏅 ' + rank() + '</span><h2>' + state.xp + ' <small>XP</small></h2><p>Keep playing, try new strategies, and build your people-skills superpower.</p></div><div class="dev-stat-stack"><div><strong>🔥 ' + state.streak + '</strong><span>day streak</span></div><div><strong>🎯 ×' + state.bestCombo + '</strong><span>best combo</span></div><div><strong>📦 ' + state.chests.length + '</strong><span>chests opened</span></div></div></section><div class="dev-stats-grid"><section class="dev-panel"><div class="dev-panel-head"><h3>🧠 Skills you’ve practiced</h3><span>Best game scores</span></div>' +
      skillset.map(function(s) { var played = s[1].filter(function(id) { return state.best[id] != null; }); var val = played.length ? Math.round(played.reduce(function(sum, id) { return sum + state.best[id]; }, 0) / played.length) : 0; return '<div class="dev-skill-row"><div class="dev-skill-title"><strong>' + s[0] + '</strong><span>' + (played.length ? val + '% best score' : "Not played yet") + '</span></div><div class="dev-meter"><span style="width:' + val + '%"></span></div></div>'; }).join("") +
      '</section><section class="dev-panel"><div class="dev-panel-head"><h3>🏆 Recent game scores</h3><span>Best attempt</span></div>' + (ids.length ? ids.slice(-6).reverse().map(function(id) { return '<div class="score-row"><span>' + esc(G[id].title) + '</span><b>' + state.best[id] + '%</b></div>'; }).join("") : '<p class="dev-muted">Play a mini-game and your scores show up here.</p>') + '<div class="dev-average">Average best score <strong>' + avg + '%</strong></div></section></div><p class="dev-fineprint">All progress stays in this browser. Nothing leaves your device unless you sign in to a local account.</p>';
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
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">ANIMATED · DSA · +40 XP</span><h1>DSA 🧮 <small>Bubble Sort</small></h1><p>Play it, pause it, step through it. Watch every step once to earn XP and the Sort Sprinter badge.</p></div><button class="dev-link" data-nav="' + sortBack + '">← ' + (sortBack === "map" ? "Game map" : "Animated") + '</button></section><div id="bubble-sort-host"></div>';
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
      root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">STORY COMPLETE · DEBRIEF TIME</span><h1>You handled the moment 🎬</h1><p>Real work is messy. Good decisions come from evidence, scope, and people.</p></div><button class="dev-link" data-nav="map">← Game map</button></section><section class="sim-result"><div class="sim-result-mascot">🦊</div><div><span class="dev-eyebrow">YOUR TEAMWORK SCORE</span><h2>' + s.score + ' / 6 points</h2><p>' + (s.score >= 5 ? 'Calm, clear, and careful. Pip approves.' : 'Every choice is practice. Try another path and compare the outcome.') + '</p><strong>+ ' + (s.reward || 0) + ' XP earned</strong></div></section><div class="sim-debrief">' + (s.choices || []).map(function(c, i) { return '<div class="sim-debrief-row"><span>' + (i + 1) + '</span><div><strong>' + esc(c.option) + '</strong><small>' + esc(c.feedback) + '</small></div></div>'; }).join('') + '</div><button class="primary-button" data-action="sim-restart">Play the story again ↻</button>';
      return;
    }
    var i = Math.min(s.stage, SIM_STEPS.length - 1), step = SIM_STEPS[i];
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">WORKPLACE SIMULATOR · SCENE ' + (i + 1) + ' OF ' + SIM_STEPS.length + '</span><h1>Choose Your Move 🎭</h1><p>Your choices change the debrief. There’s no timer and no real-world risk.</p></div><button class="dev-link" data-nav="map">← Game map</button></section>' +
      '<div class="sim-scene-track">' + SIM_STEPS.map(function(_, j) { return '<span class="' + (j < i ? 'complete' : (j === i ? 'active' : '')) + '"></span>'; }).join('') + '</div>' +
      (s.last ? '<div class="sim-last-feedback">💬 ' + esc(s.last) + '</div>' : '') +
      '<section class="sim-scene"><div class="sim-scene-person">' + (i === 0 ? '🧑‍💻' : (i === 1 ? '🧑‍🤝‍🧑' : '🦊')) + '</div><span class="dev-eyebrow">' + step.speaker + '</span><h2>' + step.text + '</h2><div class="sim-options">' + step.options.map(function(x, j) { return '<button class="sim-option" data-sim-choice="' + j + '"><span>' + String.fromCharCode(65 + j) + '</span>' + x + '<b>→</b></button>'; }).join('') + '</div><small class="sim-score-hint">Current team points: ' + s.score + ' · pick what you’d really do.</small></section>';
  }
  function badgeList() {
    return [
      { icon: '🪄', title: 'First Spark', desc: 'Finish your first skill mission.', unlocked: state.played.length > 0 },
      { icon: '💬', title: 'Clear Communicator', desc: 'Pass the Level 1 challenge.', unlocked: bossBeat('escalation-note') },
      { icon: '🤝', title: 'Team Player', desc: 'Pass the Level 2 challenge.', unlocked: bossBeat('team-clash') },
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
  function rank() { return state.xp >= 2000 ? "Team Anchor" : (state.xp >= 1200 ? "Trusted Teammate" : (state.xp >= 600 ? "Rising Collaborator" : "Curious Communicator")); }
  function gameTop(g) {
    var l = D.coreLevels[g.level - 1];
    return '<div class="dev-game-top"><button class="back-link" data-nav="map">← Back to game map</button><div class="dev-engine-tag">' + (l.icon + " Level " + g.level + " · " + l.name) + '<span>' + g.engine + '</span></div><div class="dev-game-meter"><span style="width:' + (g.level * 33.33) + '%"></span></div></div>';
  }
  function gameScreen() {
    var g = G[current];
    if (!g) { go("map"); return; }
    root.innerHTML = '<div class="dev-game-page">' + gameTop(g) + '<section class="dev-game-card"><div class="dev-game-heading"><span class="dev-eyebrow">' + esc(g.skill) + '</span><h1>' + esc(g.title) + '</h1><p>' + esc(g.intro) + '</p></div>' +
      (session.result ? resultCard(g) : body(g)) +
      (!session.result ? '<div class="dev-game-footer"><button class="dev-hint-button" data-action="hint">' + (hint ? "🙈 Hide hint" : "💡 Need a nudge?") + '</button><button class="primary-button" data-action="submit">' + "Lock in my answer" + ' →</button></div>' + (hint ? '<div class="dev-hint"><b>Pip’s tiny hint:</b> ' + esc(g.concept) + '</div>' : "") : "") +
      '</section>' + '</div>';
    var submit = root.querySelector("[data-action='submit']");
    if (submit && !session.result && !canSubmit(g)) submit.disabled = true;
  }
  function body(g) {
    if (g.kind === "choice") return '<h2 class="dev-question">' + esc(g.question) + '</h2><div class="dev-choices">' + g.options.map(function(x, i) { return '<button class="dev-choice ' + (session.choice === i ? "picked" : "") + '" data-choice="' + i + '"><span class="choice-letter">' + String.fromCharCode(65 + i) + '</span><span>' + esc(x) + '</span></button>'; }).join("") + '</div>';
    if (g.kind === "multiSelect") return '<div class="tap-instruction">Tap every card that belongs in a good answer.</div><div class="dev-pick-cards">' + g.items.map(function(x) { var yes = has(session.items, x.id); return '<button class="dev-pick-card ' + (yes ? "picked" : "") + '" data-item="' + esc(x.id) + '"><span class="pick-check">' + (yes ? "✓" : "+") + '</span><strong>' + esc(x.title) + '</strong><small>' + esc(x.detail) + '</small></button>'; }).join("") + '</div>';
    return "";
  }
  function canSubmit(g) {
    if (g.kind === "choice") return session.choice !== null;
    if (g.kind === "multiSelect") return session.items.length > 0;
    return false;
  }
  function resultCard(g) {
    var r = session.result;
    var chest = r.chestOpened ? '<div class="chest-opened">🎉 You found <b>' + esc(r.prize) + '</b> and +25 bonus XP!</div>' : (r.chest ? '<button class="mystery-chest" data-action="chest">📦 Open your mystery chest <span>tap for a bonus!</span></button>' : '<div class="chest-opened replay-note">🔁 Replay complete · best score ' + state.best[g.id] + '%</div>');
    return '<div class="dev-result ' + (r.score >= 80 ? "great" : (r.score >= 60 ? "okay" : "retry")) + '"><div class="dev-result-top"><span class="result-sticker">' + (r.score >= 80 ? "🎉" : (r.score >= 60 ? "✨" : "🧩")) + '</span><div><span class="dev-eyebrow">' + r.grade + '</span><h2>' + esc(r.headline) + '</h2></div><div class="score-donut"><strong>' + r.score + '</strong><small>POINTS</small></div></div><p>' + esc(r.explanation) + '</p><div class="concept-card"><span>💡 TAKE THIS WITH YOU</span><strong>' + esc(g.concept) + '</strong></div>' +
      (r.combo > 1 ? '<div class="combo-pop">🔥 Combo ×' + r.combo + (r.bonus ? " · +" + r.bonus + " bonus XP" : "") + '</div>' : "") + '<div class="result-xp">' + (r.xp ? "⚡ +" + r.xp + " XP" : "Practice run · no extra XP") + '</div>' + chest +
      '<div class="result-actions"><button class="primary-button" data-action="continue">Keep going →</button><button class="secondary-button" data-action="replay">Play this one again</button><button class="secondary-button" data-nav="map">Back to map</button></div></div>';
  }
  function submit() {
    var g = G[current], score = 0;
    if (!canSubmit(g)) { say("Pick an answer first."); return; }
    if (g.kind === "choice") score = session.choice === g.answer ? 100 : 0;
    if (g.kind === "multiSelect") {
      var target = g.answers, h = session.items.filter(function(id) { return has(target, id); }).length;
      score = Math.max(0, Math.round(h / target.length * 100 - (session.items.length - h) * 25 - (target.length - h) * 10));
    }
    finish(g, score, g.explanation);
  }
  function finish(g, score, explanation) {
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
    session.result = { score: score, grade: score >= 80 ? "Nailed it!" : (score >= 60 ? "Okay — nice progress!" : "Keep practicing!"), xp: xp + bonus, combo: state.combo, bonus: bonus, headline: boss && score < 80 ? "Almost there. Give the challenge another go." : (score >= 80 ? "Great judgement!" : (score >= 60 ? "You got the main idea." : "A rematch will be waiting.")), explanation: explanation || g.explanation || "Take another look at the requirement and the evidence.", chest: chest, chestOpened: false };
    save();
    if (state.sound && score >= 80) beep();
    draw();
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
    else if (action === "core") { track = "core"; go("map"); }
    else if (action === "dsa") { track = "dsa"; go("map"); }
    var choice = e.target.closest("[data-choice]");
    if (choice && !session.result) { session.choice = Number(choice.dataset.choice); draw(); return; }
    var card = e.target.closest("[data-item]");
    if (card && !session.result) { var id = card.dataset.item; session.items = has(session.items, id) ? session.items.filter(function(x) { return x !== id; }) : session.items.concat([id]); draw(); return; }
  });
  document.addEventListener("submit", function(e) {
    if (e.target.id === "account-form") { e.preventDefault(); submitAccount(e.target); }
  });
  draw();
  syncAccountUi();
  initAccount();
})(); 
