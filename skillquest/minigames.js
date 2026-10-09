(function() {
  "use strict";

  var HTTP_STATUS_PAIRS = [
    { id: "200", code: "200", desc: "OK — request succeeded" },
    { id: "201", code: "201", desc: "Created — new resource made" },
    { id: "204", code: "204", desc: "No Content — success, empty body" },
    { id: "301", code: "301", desc: "Moved Permanently — URL changed" },
    { id: "304", code: "304", desc: "Not Modified — use cached copy" },
    { id: "400", code: "400", desc: "Bad Request — malformed request" },
    { id: "401", code: "401", desc: "Unauthorized — login required" },
    { id: "403", code: "403", desc: "Forbidden — not allowed" },
    { id: "404", code: "404", desc: "Not Found — URL or resource missing" },
    { id: "405", code: "405", desc: "Method Not Allowed — wrong verb" },
    { id: "408", code: "408", desc: "Request Timeout — client too slow" },
    { id: "409", code: "409", desc: "Conflict — state clash (e.g. duplicate)" },
    { id: "422", code: "422", desc: "Unprocessable — validation failed" },
    { id: "429", code: "429", desc: "Too Many Requests — rate limited" },
    { id: "500", code: "500", desc: "Internal Server Error — server bug" },
    { id: "502", code: "502", desc: "Bad Gateway — upstream broken" },
    { id: "503", code: "503", desc: "Service Unavailable — overloaded or down" },
    { id: "504", code: "504", desc: "Gateway Timeout — upstream too slow" }
  ];

  var activeCleanup = null;

  function stopActive() {
    if (activeCleanup) { activeCleanup(); activeCleanup = null; }
  }

  function wireMiniBack(host) {
    if (!host) return;
    host.querySelectorAll("[data-mini-back]").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.XPeditionGo === "function") window.XPeditionGo(btn.getAttribute("data-mini-back") || "minigames");
      });
    });
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var TRUTH_QUESTIONS = [
    { tag: "HTML", text: "The <title> tag is the big heading people see at the top of the page.", answer: false },
    { tag: "HTML", text: "Every <img> needs alt text when the picture carries meaning.", answer: true },
    { tag: "CSS", text: "You can spell the text colour property as colour in standard CSS.", answer: false },
    { tag: "CSS", text: "gap works in flex and grid to space children without extra margins.", answer: true },
    { tag: "JS", text: "== and === always behave the same way in JavaScript.", answer: false },
    { tag: "JS", text: "map() returns a new array and leaves the original unchanged.", answer: true },
    { tag: "Git", text: "A commit saves a snapshot of your changes with a message.", answer: true },
    { tag: "Work", text: "Saying \"I'll try to do everything\" is the safest way to handle five urgent tasks.", answer: false },
    { tag: "Work", text: "Asking two clarifying questions before starting saves rework later.", answer: true },
    { tag: "API", text: "JSON is a common format for sending data between apps and servers.", answer: true },
    { tag: "UX", text: "If users miss a button, the fix is always \"train them harder.\"", answer: false },
    { tag: "HTML", text: "<button> is keyboard-friendly by default; a plain <div> is not.", answer: true }
  ];

  /* ---------- Truth Rush (fast true / false) ---------- */
  function mountTruth(host, opts) {
    stopActive();
    opts = opts || {};
    var rounds = 10;
    var deck = shuffle(TRUTH_QUESTIONS).slice(0, rounds);
    var round = 0, score = 0, streak = 0, maxStreak = 0, xpRun = 0, raf = 0, answered = false;
    var roundSec = 14, timerId = 0;

    host.innerHTML =
      '<div class="mg-play-wrap"><div class="mg-game-head"><div><span class="dev-eyebrow">MINI GAME</span><h2>Truth Rush ⚡</h2><p>True or false before time runs out. Best: <b id="mg-truth-best">' + (opts.best || 0) + '</b></p></div><button type="button" class="secondary-button" data-mini-back="minigames">← Mini games</button></div>' +
      '<div class="mg-game-panel"><div class="mg-hud"><span>Round: <b id="mg-truth-round">1</b>/' + rounds + '</span><span>Score: <b id="mg-truth-score">0</b></span><span>Streak: <b id="mg-truth-streak">0</b>🔥</span><span>XP: <b id="mg-truth-xp">0</b></span></div>' +
      '<div class="mg-truth-timer" id="mg-truth-timer"><i style="width:100%"></i></div>' +
      '<div class="mg-truth-card"><span class="mg-truth-tag" id="mg-truth-tag">HTML</span><p class="mg-truth-q" id="mg-truth-q">…</p></div>' +
      '<div class="mg-truth-actions"><button type="button" class="mg-truth-btn true" data-answer="true">True 👍</button><button type="button" class="mg-truth-btn false" data-answer="false">False 👎</button></div>' +
      '<p class="mg-status" id="mg-truth-status" role="status">Read the statement and pick True or False.</p></div></div>';

    var roundEl = host.querySelector("#mg-truth-round");
    var scoreEl = host.querySelector("#mg-truth-score");
    var streakEl = host.querySelector("#mg-truth-streak");
    var xpEl = host.querySelector("#mg-truth-xp");
    var tagEl = host.querySelector("#mg-truth-tag");
    var qEl = host.querySelector("#mg-truth-q");
    var statusEl = host.querySelector("#mg-truth-status");
    var timerBar = host.querySelector("#mg-truth-timer");
    var timerFill = timerBar.querySelector("i");
    var bestEl = host.querySelector("#mg-truth-best");
    var buttons = host.querySelectorAll(".mg-truth-btn");

    function setButtons(on) {
      buttons.forEach(function(b) { b.disabled = !on; });
    }

    function finish() {
      cancelAnimationFrame(raf);
      clearTimeout(timerId);
      setButtons(false);
      statusEl.className = "mg-status";
      statusEl.textContent = "Run complete — score " + score + " · best streak " + maxStreak + "🔥";
      if (score > (opts.best || 0)) {
        opts.best = score;
        bestEl.textContent = String(score);
        if (opts.onBest) opts.onBest(score);
      }
      if (opts.onEnd) opts.onEnd({ score: score, xp: xpRun });
    }

    function nextRound() {
      if (round >= deck.length) { finish(); return; }
      answered = false;
      var q = deck[round];
      roundEl.textContent = String(round + 1);
      tagEl.textContent = q.tag;
      qEl.textContent = q.text;
      statusEl.className = "mg-status";
      statusEl.textContent = "Go!";
      setButtons(true);
      var start = performance.now();
      function tick(now) {
        if (answered || round >= deck.length) return;
        var elapsed = (now - start) / 1000;
        var timeLeft = Math.max(0, roundSec - elapsed);
        timerFill.style.width = Math.round(timeLeft / roundSec * 100) + "%";
        timerBar.classList.toggle("danger", timeLeft <= 4);
        if (timeLeft <= 0) {
          pick(null);
          return;
        }
        raf = requestAnimationFrame(tick);
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }

    function pick(userTrue) {
      if (answered) return;
      answered = true;
      cancelAnimationFrame(raf);
      setButtons(false);
      var q = deck[round];
      var correct = userTrue === q.answer;
      if (correct) {
        streak += 1;
        if (streak > maxStreak) maxStreak = streak;
        var gain = 10 + Math.min(streak - 1, 5) * 2;
        score += gain;
        xpRun += 8;
        statusEl.className = "mg-status mg-status--ok";
        statusEl.textContent = "Correct!";
      } else {
        streak = 0;
        statusEl.className = "mg-status mg-status--bad";
        statusEl.textContent = userTrue === null ? "Time's up." : "Not quite.";
      }
      scoreEl.textContent = String(score);
      streakEl.textContent = String(streak);
      xpEl.textContent = String(xpRun);
      round += 1;
      timerId = setTimeout(nextRound, 1100);
    }

    function onClick(e) {
      if (e.target.closest("[data-mini-back]")) return;
      var btn = e.target.closest("[data-answer]");
      if (!btn || btn.disabled) return;
      pick(btn.dataset.answer === "true");
    }
    host.addEventListener("click", onClick);
    wireMiniBack(host);
    nextRound();

    activeCleanup = function() {
      cancelAnimationFrame(raf);
      clearTimeout(timerId);
      host.removeEventListener("click", onClick);
      host.innerHTML = "";
    };
  }

  function escHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  var MEMORY_LEVELS = {
    easy: { pairs: 6, gridClass: "mg-memory-grid--easy", scoreBase: 420, label: "Easy", blurb: "6 HTTP codes · 4×3 grid" },
    medium: { pairs: 12, gridClass: "mg-memory-grid--medium", scoreBase: 900, label: "Medium", blurb: "12 codes · 6×4 grid" },
    hard: { pairs: 18, gridClass: "mg-memory-grid--hard", scoreBase: 1400, label: "Hard", blurb: "18 codes · 6×6 grid" }
  };

  /* ---------- Status Pair Hunt (HTTP code ↔ meaning) ---------- */
  function mountMemory(host, opts) {
    stopActive();
    opts = opts || {};
    var difficulty = null;
    var deck = [], pairTotal = 0, levelCfg = null;
    var flipped = [], matched = {}, moves = 0, xpRun = 0, locked = false, pairsFound = 0;
    var gridEl, movesEl, pairsEl, xpEl, statusEl, bestEl, panelEl, pickEl;

    function bestFor(diff) {
      if (opts.getBest) return opts.getBest(diff) || 0;
      return 0;
    }

    function showPicker() {
      host.innerHTML =
        '<div class="mg-play-wrap mg-play-wrap--wide"><div class="mg-game-head"><div><span class="dev-eyebrow">MINI GAME</span><h2>Status Pair Hunt 🌐</h2><p>Memory game — link each status code to what it means.</p></div><button type="button" class="secondary-button" data-mini-back="minigames">← Mini games</button></div>' +
        '<div class="mg-game-panel"><div class="mg-diff-picker" id="mg-memory-picker">' +
        ['easy', 'medium', 'hard'].map(function(d) {
          var L = MEMORY_LEVELS[d];
          return '<button type="button" class="mg-diff-btn" data-diff="' + d + '"><strong>' + L.label + '</strong><span>' + L.blurb + '</span><small>Best: ' + bestFor(d) + '</small></button>';
        }).join("") +
        '</div><p class="mg-status">Flip two cards — match a code (e.g. 404) to its description.</p></div></div>';
      wireMiniBack(host);
      host.querySelector("#mg-memory-picker").addEventListener("click", function(e) {
        var btn = e.target.closest("[data-diff]");
        if (!btn) return;
        startGame(btn.getAttribute("data-diff"));
      });
    }

    function startGame(diff) {
      difficulty = diff;
      levelCfg = MEMORY_LEVELS[diff];
      var concepts = shuffle(HTTP_STATUS_PAIRS.slice()).slice(0, levelCfg.pairs);
      deck = [];
      concepts.forEach(function(c) {
        deck.push({ uid: c.id + "-c", pair: c.id, face: c.code, kind: "code" });
        deck.push({ uid: c.id + "-d", pair: c.id, face: c.desc, kind: "desc" });
      });
      deck = shuffle(deck);
      pairTotal = concepts.length;
      flipped = []; matched = {}; moves = 0; xpRun = 0; locked = false; pairsFound = 0;

      host.innerHTML =
        '<div class="mg-play-wrap mg-play-wrap--wide"><div class="mg-game-head"><div><span class="dev-eyebrow">MINI GAME · ' + levelCfg.label.toUpperCase() + '</span><h2>Status Pair Hunt 🌐</h2><p>' + pairTotal + ' status pairs · Best: <b id="mg-memory-best">' + bestFor(diff) + '</b></p></div><button type="button" class="secondary-button" data-mini-back="minigames">← Mini games</button></div>' +
        '<div class="mg-game-panel" id="mg-memory-panel"><div class="mg-hud"><span>Moves: <b id="mg-memory-moves">0</b></span><span>Pairs: <b id="mg-memory-pairs">0</b>/' + pairTotal + '</span><span>XP: <b id="mg-memory-xp">0</b></span></div>' +
        '<div class="mg-memory-grid ' + levelCfg.gridClass + '" id="mg-memory-grid"></div>' +
        '<button type="button" class="secondary-button mg-memory-change" id="mg-memory-change">Change difficulty</button>' +
        '<p class="mg-status" id="mg-memory-status">Match each HTTP code to its meaning.</p></div></div>';

      gridEl = host.querySelector("#mg-memory-grid");
      movesEl = host.querySelector("#mg-memory-moves");
      pairsEl = host.querySelector("#mg-memory-pairs");
      xpEl = host.querySelector("#mg-memory-xp");
      statusEl = host.querySelector("#mg-memory-status");
      bestEl = host.querySelector("#mg-memory-best");
      wireMiniBack(host);
      host.querySelector("#mg-memory-change").addEventListener("click", showPicker);
      gridEl.addEventListener("click", onClick);
      render();
    }

    function render() {
      gridEl.innerHTML = deck.map(function(card, i) {
        var isMatch = matched[card.uid];
        var isUp = flipped.indexOf(i) >= 0 || isMatch;
        var kindCls = card.kind === "code" ? " mg-memory-card--code" : " mg-memory-card--desc";
        return '<button type="button" class="mg-memory-card' + kindCls + (isUp ? " is-up" : "") + (isMatch ? " is-match" : "") + '" data-i="' + i + '" ' + (isMatch ? "disabled" : "") + '>' +
          '<span class="mg-memory-back">?</span><span class="mg-memory-face">' + escHtml(card.face) + "</span></button>";
      }).join("");
    }

    function finish() {
      var score = Math.max(0, levelCfg.scoreBase - moves * (difficulty === "hard" ? 4 : difficulty === "medium" ? 5 : 6));
      statusEl.textContent = "All pairs found in " + moves + " moves.";
      var prev = bestFor(difficulty);
      if (score > prev) {
        if (opts.onBest) opts.onBest(difficulty, score);
        bestEl.textContent = String(score);
      }
      if (opts.onEnd) opts.onEnd({ score: score, xp: xpRun });
    }

    function onClick(e) {
      var btn = e.target.closest("[data-i]");
      if (!btn || locked || btn.disabled) return;
      var i = Number(btn.dataset.i);
      if (flipped.indexOf(i) >= 0 || matched[deck[i].uid]) return;
      flipped.push(i);
      render();
      if (flipped.length < 2) return;
      moves += 1;
      movesEl.textContent = String(moves);
      locked = true;
      var a = deck[flipped[0]], b = deck[flipped[1]];
      if (a.pair === b.pair && a.kind !== b.kind) {
        matched[a.uid] = matched[b.uid] = true;
        pairsFound += 1;
        xpRun += difficulty === "hard" ? 10 : difficulty === "medium" ? 8 : 6;
        pairsEl.textContent = String(pairsFound);
        xpEl.textContent = String(xpRun);
        statusEl.className = "mg-status mg-status--ok";
        statusEl.textContent = "Match!";
        flipped = [];
        locked = false;
        render();
        if (pairsFound >= pairTotal) finish();
      } else {
        statusEl.className = "mg-status mg-status--bad";
        statusEl.textContent = "No match.";
        setTimeout(function() {
          flipped = [];
          locked = false;
          render();
          statusEl.className = "mg-status";
          statusEl.textContent = "Keep hunting.";
        }, 850);
      }
    }

    showPicker();

    activeCleanup = function() {
      host.innerHTML = "";
    };
  }

  var GIT_PIPELINES = [
    { title: "First push to GitHub", steps: ["git init", "git status", "git add .", "git commit -m \"save work\"", "git push -u origin main"] },
    { title: "End-of-day save", steps: ["git status", "git pull", "git add .", "git commit -m \"today’s progress\"", "git push"] },
    { title: "Start a feature branch", steps: ["git checkout -b feature/ui", "git status", "git add .", "git commit -m \"ui scaffold\"", "git push -u origin feature/ui"] },
    { title: "Review before commit", steps: ["git status", "git diff", "git add .", "git commit -m \"focused fix\"", "git push"] },
    { title: "Sync with remote main", steps: ["git fetch", "git checkout main", "git pull", "git merge feature/ui", "git push"] },
    { title: "Ship a hotfix branch", steps: ["git checkout main", "git pull", "git checkout -b hotfix/login", "git add .", "git commit -m \"patch login\"", "git push -u origin hotfix/login"] },
    { title: "Fix bad staging", steps: ["git status", "git restore --staged .", "git restore .", "git add .", "git commit -m \"clean retry\"", "git push"] },
    { title: "Tag a release", steps: ["git pull", "git status", "git add .", "git commit -m \"release prep\"", "git tag v1.0.0", "git push --tags"] },
    { title: "Clone then first edit", steps: ["git clone <repo-url>", "cd project", "git status", "git add .", "git commit -m \"readme tweak\"", "git push"] },
    { title: "Stash, pull, continue", steps: ["git stash", "git pull", "git stash pop", "git add .", "git commit -m \"resume work\"", "git push"] },
    { title: "Revert last commit locally", steps: ["git log --oneline", "git revert HEAD", "git status", "git push"] },
    { title: "Open a pull request flow", steps: ["git checkout -b fix/typo", "git add .", "git commit -m \"fix typo\"", "git push -u origin fix/typo", "gh pr create"] },
    { title: "HTML · Document head", steps: ["<head>", "<meta charset=\"utf-8\">", "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">", "<title>My App</title>", "</head>"] },
    { title: "HTML · Semantic article", steps: ["<article>", "<header><h1>Title</h1></header>", "<p>Intro paragraph</p>", "<footer>Author name</footer>", "</article>"] },
    { title: "HTML · Accessible form", steps: ["<form>", "<label for=\"email\">Email</label>", "<input id=\"email\" name=\"email\" type=\"email\">", "<button type=\"submit\">Send</button>", "</form>"] },
    { title: "HTML · Link CSS & JS", steps: ["<head>", "<link rel=\"stylesheet\" href=\"styles.css\">", "<script src=\"app.js\" defer></script>", "</head>"] },
    { title: "HTML · Page landmarks", steps: ["<body>", "<header>…</header>", "<main>…</main>", "<footer>…</footer>", "</body>"] },
    { title: "CSS · Flex row navbar", steps: ["nav { display: flex; }", "nav { justify-content: space-between; }", "nav { align-items: center; }", "nav a { text-decoration: none; }"] },
    { title: "CSS · Center on screen", steps: ["body { min-height: 100vh; }", "body { display: flex; }", "body { justify-content: center; }", "body { align-items: center; }"] },
    { title: "CSS · Focus-visible button", steps: [".btn { padding: 0.75rem 1rem; }", ".btn { border: none; border-radius: 8px; }", ".btn:focus-visible { outline: 2px solid #705ce8; }", ".btn:focus-visible { outline-offset: 2px; }"] },
    { title: "CSS · Responsive heading", steps: [":root { font-size: 16px; }", "h1 { line-height: 1.2; }", "h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); }"] }
  ];

  /* ---------- Git Line-up (order the workflow) ---------- */
  function mountGitLine(host, opts) {
    stopActive();
    opts = opts || {};
    var pipelineQueue = shuffle(GIT_PIPELINES.slice());
    var roundIdx = 0;
    var current = pipelineQueue[0];
    var order = shuffle(current.steps.slice());
    var selected = null, swaps = 0, xpRun = 0, shipped = 0;
    var rounds = pipelineQueue.length;

    host.innerHTML =
      '<div class="mg-play-wrap"><div class="mg-game-head"><div><span class="dev-eyebrow">MINI GAME</span><h2>Git Line-up 🚂</h2><p>Order Git, HTML, and CSS steps — ' + rounds + ' scenarios per run. Best: <b id="mg-gitline-best">' + (opts.best || 0) + '</b></p></div><button type="button" class="secondary-button" data-mini-back="minigames">← Mini games</button></div>' +
      '<div class="mg-game-panel"><div class="mg-hud"><span>Round: <b id="mg-gitline-round">1</b>/' + rounds + '</span><span>Swaps: <b id="mg-gitline-swaps">0</b></span><span>Score: <b id="mg-gitline-score">0</b></span><span>XP: <b id="mg-gitline-xp">0</b></span></div>' +
      '<p class="mg-gitline-scenario" id="mg-gitline-scenario"></p>' +
      '<ol class="mg-gitline-list" id="mg-gitline-list"></ol>' +
      '<button type="button" class="primary-button mg-gitline-ship" id="mg-gitline-ship">Ship it ✓</button>' +
      '<p class="mg-status" id="mg-gitline-status">Tap two lines to swap them into the right order for this scenario.</p></div></div>';

    var listEl = host.querySelector("#mg-gitline-list");
    var swapsEl = host.querySelector("#mg-gitline-swaps");
    var scoreEl = host.querySelector("#mg-gitline-score");
    var xpEl = host.querySelector("#mg-gitline-xp");
    var roundEl = host.querySelector("#mg-gitline-round");
    var scenarioEl = host.querySelector("#mg-gitline-scenario");
    var statusEl = host.querySelector("#mg-gitline-status");
    var bestEl = host.querySelector("#mg-gitline-best");
    var shipBtn = host.querySelector("#mg-gitline-ship");
    var totalScore = 0;

    function isCorrect() {
      for (var i = 0; i < current.steps.length; i++) if (order[i] !== current.steps[i]) return false;
      return true;
    }

    function render() {
      listEl.innerHTML = order.map(function(cmd, i) {
        return '<li><button type="button" class="mg-gitline-chip' + (selected === i ? " is-pick" : "") + '" data-i="' + i + '"><span class="mg-gitline-num">' + (i + 1) + '</span><code>' + cmd + "</code></button></li>";
      }).join("");
    }

    function finishRun() {
      statusEl.textContent = "Run complete — score " + totalScore + ".";
      if (totalScore > (opts.best || 0)) {
        opts.best = totalScore;
        bestEl.textContent = String(totalScore);
        if (opts.onBest) opts.onBest(totalScore);
      }
      if (opts.onEnd) opts.onEnd({ score: totalScore, xp: xpRun });
    }

    function loadRound() {
      current = pipelineQueue[roundIdx];
      order = shuffle(current.steps.slice());
      selected = null;
      scenarioEl.textContent = current.title;
      roundEl.textContent = String(roundIdx + 1);
      render();
    }

    function nextRound() {
      shipped += 1;
      roundIdx += 1;
      if (roundIdx >= rounds) { finishRun(); return; }
      loadRound();
      statusEl.className = "mg-status";
      statusEl.textContent = "Next scenario — sort the commands.";
    }

    function onListClick(e) {
      var btn = e.target.closest("[data-i]");
      if (!btn) return;
      var i = Number(btn.dataset.i);
      if (selected === null) { selected = i; render(); return; }
      if (selected === i) { selected = null; render(); return; }
      var t = order[selected]; order[selected] = order[i]; order[i] = t;
      swaps += 1;
      swapsEl.textContent = String(swaps);
      selected = null;
      render();
    }

    function onShip() {
      if (!isCorrect()) {
        statusEl.className = "mg-status mg-status--bad";
        statusEl.textContent = "Not yet — check the scenario and try again.";
        return;
      }
      var roundScore = Math.max(40, 380 + current.steps.length * 15 - swaps * 11);
      totalScore += roundScore;
      xpRun += 25;
      scoreEl.textContent = String(totalScore);
      xpEl.textContent = String(xpRun);
      statusEl.className = "mg-status mg-status--ok";
      statusEl.textContent = "Shipped! +" + roundScore + " this round.";
      swaps = 0;
      swapsEl.textContent = "0";
      setTimeout(nextRound, 700);
    }

    listEl.addEventListener("click", onListClick);
    shipBtn.addEventListener("click", onShip);
    wireMiniBack(host);
    loadRound();

    activeCleanup = function() {
      host.innerHTML = "";
    };
  }

  var KEBAB_ROUNDS = [
    { ctx: "CSS class", word: "primary button", pick: "primary-button", wrong: ["primaryButton", "primary_button", "Primary-Button"] },
    { ctx: "HTML id", word: "main navigation", pick: "main-navigation", wrong: ["mainNavigation", "main_navigation", "MainNavigation"] },
    { ctx: "JS variable", word: "user profile count", pick: "userProfileCount", wrong: ["user-profile-count", "user_profile_count", "UserProfileCount"] },
    { ctx: "JSON key", word: "first name", pick: "firstName", wrong: ["first-name", "first_name", "FirstName"] },
    { ctx: "Git branch", word: "fix login bug", pick: "fix-login-bug", wrong: ["fixLoginBug", "fix_login_bug", "Fix-Login-Bug"] },
    { ctx: "CSS custom property", word: "brand accent", pick: "--brand-accent", wrong: ["--brandAccent", "brand-accent", "--Brand_Accent"] },
    { ctx: "npm package name", word: "my cool lib", pick: "my-cool-lib", wrong: ["myCoolLib", "my_cool_lib", "MyCoolLib"] },
    { ctx: "React component", word: "user avatar card", pick: "UserAvatarCard", wrong: ["user-avatar-card", "user_avatar_card", "userAvatarCard"] },
    { ctx: "HTML data attribute", word: "user id", pick: "data-user-id", wrong: ["dataUserId", "data_user_id", "data-UserId"] },
    { ctx: "JS constant", word: "max retry count", pick: "MAX_RETRY_COUNT", wrong: ["maxRetryCount", "max-retry-count", "MaxRetryCount"] },
    { ctx: "CSS class", word: "hero banner", pick: "hero-banner", wrong: ["heroBanner", "hero_banner", "HeroBanner"] },
    { ctx: "JS variable", word: "is loading", pick: "isLoading", wrong: ["is-loading", "is_loading", "IsLoading"] }
  ];

  /* ---------- Kebab Kanon (naming convention snap) ---------- */
  function mountKebab(host, opts) {
    stopActive();
    opts = opts || {};
    var deck = shuffle(KEBAB_ROUNDS.slice());
    var idx = 0, score = 0, streak = 0, xpRun = 0, timeLeft = 0, raf = 0, answered = false;

    host.innerHTML =
      '<div class="mg-play-wrap"><div class="mg-game-head"><div><span class="dev-eyebrow">MINI GAME</span><h2>Kebab Kanon 🎯</h2><p>Pick the name that fits the convention. Best: <b id="mg-kebab-best">' + (opts.best || 0) + '</b></p></div><button type="button" class="secondary-button" data-mini-back="minigames">← Mini games</button></div>' +
      '<div class="mg-game-panel"><div class="mg-hud"><span>Round: <b id="mg-kebab-round">1</b>/' + deck.length + '</span><span>Score: <b id="mg-kebab-score">0</b></span><span>Streak: <b id="mg-kebab-streak">0</b></span><span>XP: <b id="mg-kebab-xp">0</b></span></div>' +
      '<div class="mg-kebab-timer" id="mg-kebab-timer"><i style="width:100%"></i></div>' +
      '<div class="mg-kebab-prompt"><span class="mg-kebab-ctx" id="mg-kebab-ctx">CSS class</span><p id="mg-kebab-words">primary button</p></div>' +
      '<div class="mg-kebab-choices" id="mg-kebab-choices"></div>' +
      '<p class="mg-status" id="mg-kebab-status">Read the context, fire the right spelling.</p></div></div>';

    var roundEl = host.querySelector("#mg-kebab-round");
    var scoreEl = host.querySelector("#mg-kebab-score");
    var streakEl = host.querySelector("#mg-kebab-streak");
    var xpEl = host.querySelector("#mg-kebab-xp");
    var ctxEl = host.querySelector("#mg-kebab-ctx");
    var wordsEl = host.querySelector("#mg-kebab-words");
    var choicesEl = host.querySelector("#mg-kebab-choices");
    var statusEl = host.querySelector("#mg-kebab-status");
    var timerFill = host.querySelector("#mg-kebab-timer i");
    var bestEl = host.querySelector("#mg-kebab-best");
    var sec = 14;

    function finish() {
      cancelAnimationFrame(raf);
      statusEl.textContent = "Run complete — score " + score + ".";
      if (score > (opts.best || 0)) {
        opts.best = score;
        bestEl.textContent = String(score);
        if (opts.onBest) opts.onBest(score);
      }
      if (opts.onEnd) opts.onEnd({ score: score, xp: xpRun });
    }

    function showRound() {
      if (idx >= deck.length) { finish(); return; }
      answered = false;
      var q = deck[idx];
      roundEl.textContent = String(idx + 1);
      ctxEl.textContent = q.ctx;
      wordsEl.textContent = q.word;
      var optsList = shuffle([q.pick].concat(q.wrong));
      choicesEl.innerHTML = optsList.map(function(label) {
        return '<button type="button" class="mg-kebab-opt" data-pick="' + label + '"><code>' + label + "</code></button>";
      }).join("");
      statusEl.className = "mg-status";
      statusEl.textContent = "Go!";
      var start = performance.now();
      function tick(now) {
        if (answered) return;
        var left = Math.max(0, sec - (now - start) / 1000);
        timerFill.style.width = Math.round(left / sec * 100) + "%";
        if (left <= 0) pick(null);
        else raf = requestAnimationFrame(tick);
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }

    function pick(label) {
      if (answered) return;
      answered = true;
      cancelAnimationFrame(raf);
      var q = deck[idx];
      var ok = label === q.pick;
      if (ok) {
        streak += 1;
        var gain = 12 + Math.min(streak, 6) * 3;
        score += gain;
        xpRun += 6;
        statusEl.className = "mg-status mg-status--ok";
        statusEl.textContent = "Hit!";
      } else {
        streak = 0;
        statusEl.className = "mg-status mg-status--bad";
        statusEl.textContent = label === null ? "Too slow." : "Miss.";
      }
      scoreEl.textContent = String(score);
      streakEl.textContent = String(streak);
      xpEl.textContent = String(xpRun);
      idx += 1;
      setTimeout(showRound, 900);
    }

    function onClick(e) {
      var btn = e.target.closest(".mg-kebab-opt");
      if (!btn || answered) return;
      pick(btn.getAttribute("data-pick"));
    }
    host.addEventListener("click", onClick);
    wireMiniBack(host);
    showRound();

    activeCleanup = function() {
      cancelAnimationFrame(raf);
      host.removeEventListener("click", onClick);
      host.innerHTML = "";
    };
  }

  window.XPMiniGames = {
    stop: stopActive,
    mountTruth: mountTruth,
    mountMemory: mountMemory,
    mountGitLine: mountGitLine,
    mountKebab: mountKebab
  };
})();

