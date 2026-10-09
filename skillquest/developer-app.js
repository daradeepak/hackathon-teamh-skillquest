(function() {
  "use strict";
  var D = window.DEVQUEST_CONTENT, SKILLS = D.skills, SCEN = D.scenarios, root = document.getElementById("app-main");
  var label = document.getElementById("page-label"), toast = document.getElementById("toast");
  var BASE_KEY = "skillquest-devcore-v1", KEY = BASE_KEY, view = "home", current = null, track = "core", hint = false;
  var account = null, accountMode = "login";
  var SKILL_BY_ID = {}, SCEN_BY_ID = {};
  SKILLS.forEach(function(k) { SKILL_BY_ID[k.id] = k; }); SCEN.forEach(function(x) { SCEN_BY_ID[x.id] = x; });
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
  function fresh() { return { choice: null, result: null }; }
  function zeroSkills() { var o = {}; SKILLS.forEach(function(k) { o[k.id] = 0; }); return o; }
  function blankProgress(name) {
    return { name: name || "Learner", xp: 0, sound: false, skills: zeroSkills(), scenarios: {}, daily: { date: dayKey(), actions: [], claimed: false },
      reels: [], sortLab: sortLabOf(), simulator: { stage: 0, score: 0, done: false, last: "", choices: [], reward: 0 } };
  }
  /* Accepts saved progress from this or an older version and keeps only values that are still valid. */
  function normalize(p, name) {
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    var base = blankProgress(name || p.name), skills = zeroSkills(), chosen = {};
    SKILLS.forEach(function(k) { var v = p.skills && Number(p.skills[k.id]); if (isFinite(v) && v > 0) skills[k.id] = Math.min(Math.floor(v), 1000000); });
    if (p.scenarios && typeof p.scenarios === "object") Object.keys(p.scenarios).forEach(function(id) {
      var sc = SCEN_BY_ID[id], c = p.scenarios[id];
      if (sc && Number.isInteger(c) && c >= 0 && c < sc.options.length) chosen[id] = c;
    });
    return Object.assign(base, { xp: Math.max(0, Math.floor(Number(p.xp)) || 0), sound: !!p.sound, skills: skills, scenarios: chosen,
      reels: Array.isArray(p.reels) ? p.reels : [], sortLab: sortLabOf(p.sortLab), daily: Object.assign(base.daily, p.daily || {}), simulator: Object.assign(base.simulator, p.simulator || {}) });
  }
  function seed() { return blankProgress("Learner"); }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); var n = normalize(s, s && s.name); if (n) return n; } catch (e) {}
    return seed();
  }
  var state = load();
  function freshAccount(name) { return blankProgress(name); }
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
    if (profileSubtitle) profileSubtitle.textContent = (account ? "Local account · " : "Guest · ") + "Level " + currentLevel() + " · " + playerLevel().name;
    if (profileAvatar) profileAvatar.textContent = avatar;
    if (topAvatar) topAvatar.textContent = avatar;
    if (toggle) { toggle.textContent = account ? "Account · " + account.name : "Sign in / create account"; toggle.setAttribute("aria-label", account ? "Manage account" : "Sign in or create an account"); }
  }
  function normalizedProgress(progress, name) { return normalize(progress, name); }
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
  var PLAYER_AT = [0, 400, 1200, 2400, 4000], SKILL_AT = [0, 100, 250, 450, 700, 1000];
  var PLAYER_LEVELS = [
    ["Curious Beginner", "You are exploring how you handle everyday work situations."],
    ["Developing Learner", "You are building consistency and becoming more confident with everyday challenges."],
    ["Confident Contributor", "You handle most situations with a clear, steady approach."],
    ["Trusted Teammate", "People rely on your judgement and the way you work with others."],
    ["Team Anchor", "You help the people around you grow stronger."]
  ];
  var SKILL_ICONS = {
    "leadership": '<path d="M12 19V6M7 11l5-5 5 5M5 21h14"/>',
    "communication": '<path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1h-9l-4 3v-3H5a1 1 0 01-1-1V6a1 1 0 011-1z"/><path d="M8 9h8M8 12h5"/>',
    "problem-solving": '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
    "collaboration": '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.5 6 5"/>',
    "time-management": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "decision-making": '<path d="M12 3l9 9-9 9-9-9z"/><circle cx="12" cy="12" r="2.5"/>'
  };
  function skillIcon(id) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (SKILL_ICONS[id] || "") + '</svg>'; }
  function levelInfo(xp, at) {
    var i = 0; at.forEach(function(t, k) { if (xp >= t) i = k; });
    var next = i + 1 < at.length ? at[i + 1] : null;
    return { n: i + 1, next: next, pct: next === null ? 100 : Math.max(0, Math.min(100, Math.round((xp - at[i]) / (next - at[i]) * 100))) };
  }
  function playerLevel() { var info = levelInfo(state.xp, PLAYER_AT), row = PLAYER_LEVELS[info.n - 1]; info.name = row[0]; info.blurb = row[1]; return info; }
  function currentLevel() { return playerLevel().n; }
  function played(id) { return state.scenarios[id] !== undefined; }
  function nextScenario(skillId) {
    var pool = skillId ? SCEN.filter(function(x) { return x.skill === skillId; }) : SCEN;
    return (pool.find(function(x) { return !played(x.id); }) || pool[0]).id;
  }
  function open(id) {
    if (!SCEN_BY_ID[id]) return;
    current = id; view = "game"; session = fresh();
    draw(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  var sortBack = "anim";
  var LAB_VIEWS = ["lab", "daily", "reels", "sim", "badges"], LAB_ENABLED = false; /* Play Lab is hidden for now; flip to true (and restore the sidebar button in index.html and the home banner) to bring it back */
  function go(where) { if (where === "sort") sortBack = view === "map" ? "map" : "anim"; if (!LAB_ENABLED && has(LAB_VIEWS, where)) where = "home"; view = where; current = null; hint = false; if (where === "reels") { reelRevealed = false; reelAnswer = null; reelFeedback = ""; } draw(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function draw() {
    if (view === "home") { label.textContent = "Home"; home(); if (LAB_ENABLED) root.insertAdjacentHTML("afterbegin", dailyBanner()); }
    else if (view === "map") { label.textContent = track === "dsa" ? "Animated · DSA" : "Skills"; track === "dsa" ? dsaMap() : map(); }
    else if (view === "stats") { label.textContent = "Scoreboard"; stats(); }
    else if (view === "lab") { label.textContent = "Play Lab"; labHome(); }
    else if (view === "anim") { label.textContent = "Animated"; animatedPage(); }
    else if (view === "sort") { label.textContent = sortBack === "map" ? "Skills · DSA" : "Animated · DSA"; sortPage(); }
    else if (view === "daily") { label.textContent = "Daily quest"; dailyPage(); }
    else if (view === "reels") { label.textContent = "Knowledge reels"; reelsPage(); }
    else if (view === "sim") { label.textContent = "Workplace simulator"; simulatorPage(); }
    else if (view === "badges") { label.textContent = "Badge shelf"; badgesPage(); }
    else { label.textContent = SCEN_BY_ID[current] ? SCEN_BY_ID[current].title : "Scenario"; gameScreen(); }
    document.querySelectorAll(".nav-item").forEach(function(b) { b.classList.toggle("is-active", b.dataset.nav === view || (view === "game" && b.dataset.nav === "map") || (b.dataset.nav === "lab" && ["daily", "reels", "sim", "badges"].indexOf(view) >= 0) || (b.dataset.nav === (sortBack === "map" ? "map" : "anim") && view === "sort")); });
    if (view === "sort") mountSortLab(); else if (window.SkillQuestBubbleSort) window.SkillQuestBubbleSort.unmount();
    syncAccountUi();
    var sound = document.querySelector("[data-action='sound']");
    if (sound) { sound.textContent = state.sound ? "🔊 Sound on" : "🔈 Sound off"; sound.setAttribute("aria-pressed", String(state.sound)); }
  }
  function skillRow(k) {
    var xp = state.skills[k.id], info = levelInfo(xp, SKILL_AT);
    return '<div class="dev-skill-row"><div class="dev-skill-title"><strong>' + esc(k.name) + '</strong><span>Level ' + info.n + ' · ' + xp + ' XP</span></div><div class="dev-meter"><span style="width:' + info.pct + '%"></span></div></div>';
  }
  function home() {
    var pl = playerLevel(), next = SCEN_BY_ID[nextScenario()], total = SCEN.length, done = SCEN.filter(function(x) { return played(x.id); }).length;
    root.innerHTML =
      '<section class="dev-welcome"><div class="dev-wave">👋</div><div class="dev-welcome-copy"><span class="dev-eyebrow">SOFT SKILLS</span><h1>Hey ' + esc(state.name) + '! Ready to practice a real-life moment?</h1><p>Short scenarios that build the people skills great teams run on.</p></div><div class="dev-top-stats"><span class="dev-chip xp-chip">⚡ ' + state.xp + ' XP</span><span class="dev-chip">🏅 Level ' + pl.n + ' · ' + esc(pl.name) + '</span></div></section>' +
      '<section class="dev-hero"><div class="dev-hero-copy"><span class="dev-hero-tag">💬 NEXT UP · ' + esc(next.title.toUpperCase()) + '</span><h2>What would you do<br>in this moment?</h2><p>Read a short workplace scenario and choose the approach that feels like you. There are no wrong answers. Each choice builds different skills.</p><button class="primary-button dev-play-button" data-action="continue">Play next scenario →</button></div><div class="dev-hero-art"><div class="dev-orbit"></div><div class="dev-mascot">🦊</div><div class="dev-speech">Pip: how would that land?</div><span class="dev-float f1">✨ ' + done + '/' + total + ' played</span><span class="dev-float f2">+ XP</span></div></section>' +
      '<section class="dev-bottom-grid"><div class="dev-panel"><div class="dev-panel-head"><h3>🧠 Your skills</h3><button class="dev-link" data-nav="map">See all →</button></div>' + SKILLS.map(skillRow).join("") + '</div><div class="dev-panel teaser-panel"><span class="dev-eyebrow">ALSO ON THE MAP</span><h3>🧮 DSA</h3><p>Watch algorithms move, step by step, with the real code beside them.</p><button class="secondary-button" data-action="dsa">Open DSA →</button></div></section>';
  }
  function trackTabs(active) {
    return '<div class="dev-track-tabs"><button class="track-tab ' + (active === "core" ? "is-active" : "") + '" data-action="core">Soft Skills</button><button class="track-tab ' + (active === "dsa" ? "is-active" : "") + '" data-action="dsa">DSA</button></div>';
  }
  function skillCard(k) {
    var xp = state.skills[k.id], info = levelInfo(xp, SKILL_AT), list = SCEN.filter(function(x) { return x.skill === k.id; }), done = list.filter(function(x) { return played(x.id); }).length;
    return '<button type="button" class="sk-card" data-skill="' + k.id + '"><span class="sk-card-top"><span class="sk-icon">' + skillIcon(k.id) + '</span><span class="sk-level">LEVEL ' + info.n + '</span></span><strong>' + esc(k.name) + '</strong><span class="sk-desc">' + esc(k.desc) + '</span>' +
      '<span class="sk-card-foot"><span>' + xp + ' XP</span><span>' + (info.next === null ? "Max level" : "Next: " + info.next + " XP") + '</span></span><span class="sk-bar"><i style="width:' + info.pct + '%"></i></span><span class="sk-played">' + done + ' of ' + list.length + ' scenarios played</span></button>';
  }
  function map() {
    var pl = playerLevel(), done = SCEN.filter(function(x) { return played(x.id); }).length;
    root.innerHTML = '<div class="sk"><section class="sk-head"><div><span class="sk-eyebrow">CAPABILITY MAP</span><h1>Skills</h1><p>Your professional skills grow independently as you complete relevant scenarios.</p></div>' + trackTabs("core") + '</section>' +
      '<section class="sk-player"><div class="sk-player-level"><span class="sk-eyebrow">PLAYER LEVEL</span><strong>' + pl.n + '</strong></div><div class="sk-player-body"><div class="sk-player-row"><h2>Level ' + pl.n + ' — ' + esc(pl.name) + '</h2><span>' + state.xp + (pl.next === null ? " XP" : " / " + pl.next + " XP") + '</span></div>' +
      '<div class="sk-bar" role="progressbar" aria-label="Progress to the next player level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pl.pct + '"><i style="width:' + pl.pct + '%"></i></div><p>' + esc(pl.blurb) + '</p></div></section>' +
      '<section><div class="sk-sec-head"><div><span class="sk-eyebrow">INDIVIDUAL PROGRESSION</span><h2>Skill Levels</h2></div><button class="primary-button" data-action="continue">Play next scenario →</button></div><div class="sk-grid">' + SKILLS.map(skillCard).join("") + '</div>' +
      '<p class="sk-note">Pick a skill to practise it. There are no right or wrong answers: each choice builds the skills it shows. ' + done + ' of ' + SCEN.length + ' scenarios played.</p></section></div>';
  }
  function dsaMap() {
    var done = state.sortLab.bubble.done;
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">DATA STRUCTURES & ALGORITHMS</span><h1>See how algorithms really work.</h1><p>Step through the code, watch the data move, and earn XP for finishing.</p></div><div class="dev-track-tabs"><button class="track-tab" data-action="core">Soft Skills</button><button class="track-tab is-active" data-action="dsa">DSA</button></div></section>' +
      '<section class="dev-level-card lavender"><header class="dev-level-head"><span class="dev-level-icon">🧮</span><div class="dev-level-info"><span class="dev-eyebrow">SORTING</span><h2>DSA</h2><p>Animated walkthroughs with the real code beside them.</p></div><div class="dev-level-count">' + (done ? 1 : 0) + '/1 done</div></header>' +
      '<div class="dev-game-grid"><button class="dev-game-tile ' + (done ? "played" : "") + '" data-module="sort"><span class="dev-game-icon">🫧</span><span class="dev-game-text"><strong>Bubble Sort</strong><small>ANIMATED · O(n²)</small></span><span class="dev-game-status">' + (done ? "✓" : "→") + '</span></button></div></section>' +
      '<p class="dev-fineprint">More algorithms will be added here over time.</p>';
  }
  function stats() {
    var pl = playerLevel(), list = SCEN.filter(function(x) { return played(x.id); }), top = SKILLS.slice().sort(function(a, b) { return state.skills[b.id] - state.skills[a.id]; })[0];
    root.innerHTML = '<section class="dev-page-title"><div><span class="dev-eyebrow">YOUR SCOREBOARD</span><h1>Nice work, ' + esc(state.name) + ' ✨</h1><p>Stats track practice. They’re not a work-performance score.</p></div><button class="secondary-button" data-action="reset">Reset progress</button></section>' +
      '<section class="dev-stats-hero"><div><span class="dev-rank-pill">🏅 ' + esc(pl.name) + '</span><h2>' + state.xp + ' <small>XP</small></h2><p>Keep exploring different approaches. Every choice builds something.</p></div><div class="dev-stat-stack"><div><strong>🏅 ' + pl.n + '</strong><span>player level</span></div><div><strong>🎯 ' + list.length + '/' + SCEN.length + '</strong><span>scenarios played</span></div><div><strong>⭐ ' + (state.skills[top.id] ? esc(top.name) : "—") + '</strong><span>top skill</span></div></div></section>' +
      '<div class="dev-stats-grid"><section class="dev-panel"><div class="dev-panel-head"><h3>🧠 Skill levels</h3><span>XP by skill</span></div>' + SKILLS.map(skillRow).join("") + '</section>' +
      '<section class="dev-panel"><div class="dev-panel-head"><h3>🗒️ Recent scenarios</h3><span>Your approach</span></div>' + (list.length ? list.slice(-6).reverse().map(function(x) { return '<div class="score-row"><span>' + esc(x.title) + '</span><b>' + String.fromCharCode(65 + state.scenarios[x.id]) + '</b></div>'; }).join("") : '<p class="dev-muted">Play a scenario and your choices show up here.</p>') + '</section></div><p class="dev-fineprint">All progress stays in this browser unless you sign in to a local account.</p>';
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
    var anySkill = SKILLS.some(function(k) { return levelInfo(state.skills[k.id], SKILL_AT).n >= 2; });
    return [
      { icon: '🪄', title: 'First Spark', desc: 'Finish your first scenario.', unlocked: Object.keys(state.scenarios).length > 0 },
      { icon: '🌈', title: 'Well-Rounded', desc: 'Earn XP in all six skills.', unlocked: SKILLS.every(function(k) { return state.skills[k.id] > 0; }) },
      { icon: '🌱', title: 'Rising Skill', desc: 'Reach Level 2 in any skill.', unlocked: anySkill },
      { icon: '📼', title: 'Pocket Professor', desc: 'Collect all three Knowledge Reels.', unlocked: state.reels.length >= REELS.length },
      { icon: '🎭', title: 'Calm in the Chaos', desc: 'Finish the workplace simulator.', unlocked: state.simulator.done },
      { icon: '🫧', title: 'Sort Sprinter', desc: 'Watch the whole Bubble Sort Lab.', unlocked: state.sortLab.bubble.done },
      { icon: '🎁', title: 'Daily Dynamo', desc: 'Claim the daily quest reward.', unlocked: state.daily.claimed }
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
  function choiceCard(sc) {
    return '<div class="sk-options" role="radiogroup" aria-label="Your approach">' + sc.options.map(function(o, i) {
      var on = session.choice === i;
      return '<button type="button" class="sk-option ' + (on ? "picked" : "") + '" role="radio" aria-checked="' + on + '" data-choice="' + i + '"><span class="sk-letter">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o.text) + '</span></button>';
    }).join("") + '</div><div class="sk-actions"><button type="button" class="primary-button" data-action="submit"' + (session.choice === null ? " disabled" : "") + '>Lock in my choice →</button></div>';
  }
  function gainChips(xp) {
    return Object.keys(xp).map(function(id) { return '<span class="sk-chip">+' + xp[id] + ' ' + esc(SKILL_BY_ID[id].name) + '</span>'; }).join("");
  }
  function resultCard(sc) {
    var r = session.result, o = sc.options[r.choice];
    return '<div class="sk-result"><span class="sk-eyebrow">YOU CHOSE</span><p class="sk-chosen"><b>' + String.fromCharCode(65 + r.choice) + '</b> ' + esc(o.text) + '</p>' +
      '<div class="sk-insight"><span class="sk-eyebrow">WHAT THIS SHOWS</span><p>' + esc(o.insight) + '</p></div>' +
      '<div class="sk-gains">' + (r.first ? gainChips(r.gains) : '<span class="sk-chip sk-chip-muted">Practice run · no extra XP</span>') + '</div>' +
      (r.levelUps.length ? '<ul class="sk-levelups">' + r.levelUps.map(function(t) { return '<li>🎉 ' + esc(t) + '</li>'; }).join("") + '</ul>' : "") +
      '<details class="sk-others"><summary>See what the other approaches build</summary><ul>' + sc.options.map(function(x, i) { return '<li><b>' + String.fromCharCode(65 + i) + '</b><span>' + esc(x.text) + (i === r.choice ? ' <em>(your choice)</em>' : '') + '</span><span class="sk-gains">' + gainChips(x.xp) + '</span></li>'; }).join("") + '</ul></details>' +
      '<div class="sk-actions"><button type="button" class="primary-button" data-action="continue">Next scenario →</button><button type="button" class="secondary-button" data-action="replay">Try a different approach</button><button type="button" class="secondary-button" data-nav="map">Back to Skills</button></div></div>';
  }
  function gameScreen() {
    var sc = SCEN_BY_ID[current];
    if (!sc) { go("map"); return; }
    root.innerHTML = '<div class="sk sk-scenario"><button type="button" class="back-link" data-nav="map">← Back to Skills</button><section class="sk-scene"><span class="sk-eyebrow">' + esc(SKILL_BY_ID[sc.skill].name.toUpperCase()) + ' · SCENARIO</span><h1>' + esc(sc.title) + '</h1><p class="sk-situation">' + esc(sc.situation) + '</p><h2 class="sk-question">' + esc(sc.question) + '</h2>' + (session.result ? resultCard(sc) : choiceCard(sc)) + '</section></div>';
  }
  function submit() {
    var sc = SCEN_BY_ID[current];
    if (!sc || session.choice === null) { say("Choose an approach first."); return; }
    var o = sc.options[session.choice], first = !played(sc.id), gains = {}, levelUps = [];
    if (first) {
      var total = 0, playerBefore = playerLevel().n;
      Object.keys(o.xp).forEach(function(id) {
        var before = levelInfo(state.skills[id], SKILL_AT).n;
        state.skills[id] += o.xp[id]; total += o.xp[id]; gains[id] = o.xp[id];
        var after = levelInfo(state.skills[id], SKILL_AT).n;
        if (after > before) levelUps.push(SKILL_BY_ID[id].name + " reached Level " + after);
      });
      state.xp += total;
      if (playerLevel().n > playerBefore) levelUps.push("You reached Player Level " + playerLevel().n + " — " + playerLevel().name);
      state.scenarios[sc.id] = session.choice; trackDaily("mission");
    }
    session.result = { choice: session.choice, first: first, gains: gains, levelUps: levelUps };
    save();
    if (state.sound) beep();
    draw();
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
    var skillButton = e.target.closest("[data-skill]");
    if (skillButton) { open(nextScenario(skillButton.dataset.skill)); return; }
    var actionButton = e.target.closest("[data-action]"), action = actionButton && actionButton.dataset.action;
    if (action === "account") renderAccountModal(account ? "account" : "login");
    else if (action === "close-account") closeAccountModal();
    else if (action === "account-logout") signOut();
    else if (action === "continue") open(nextScenario());
    else if (action === "submit") submit();
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
  });
  document.addEventListener("submit", function(e) {
    if (e.target.id === "account-form") { e.preventDefault(); submitAccount(e.target); }
  });
  draw();
  syncAccountUi();
  initAccount();
})(); 
