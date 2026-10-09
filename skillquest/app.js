(function() {
  "use strict";

  var STORAGE_KEY = "skillquest-demo-v1";
  var root = document.getElementById("app-main");
  var pageLabel = document.getElementById("page-label");
  var toastNode = document.getElementById("toast");
  var view = "home";
  var activeLevelId = null;
  var selectedChoice = null;
  var answered = false;
  var replayMode = false;
  var showTip = false;
  var toastTimer = null;
  var skillquestWorlds = window.SKILLQUEST_WORLDS;
  var skillquestLevels = window.SKILLQUEST_LEVELS;
  var storageState = loadState();

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.completed)) {
        return {
          xp: Number(saved.xp) || 0,
          completed: saved.completed.filter(function(n) { return Number.isInteger(n) && n >= 1 && n <= 50; }),
          results: saved.results && typeof saved.results === "object" ? saved.results : {},
          reflections: saved.reflections && typeof saved.reflections === "object" ? saved.reflections : {}
        };
      }
    } catch (error) {
      // A fresh local session is fine when saved data is unavailable.
    }
    return { xp: 0, completed: [], results: {}, reflections: {} };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageState));
    } catch (error) {
      showToast("Progress could not be saved in this browser.");
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character];
    });
  }

  function isComplete(levelId) {
    return storageState.completed.indexOf(levelId) !== -1;
  }

  function firstIncomplete() {
    for (var n = 1; n <= 50; n += 1) if (!isComplete(n)) return n;
    return 50;
  }

  function completedCount() {
    return storageState.completed.length;
  }

  function worldCompleted(worldIndex) {
    var start = worldIndex * 10 + 1;
    var count = 0;
    for (var n = start; n < start + 10; n += 1) if (isComplete(n)) count += 1;
    return count;
  }

  function showToast(message) {
    toastNode.textContent = message;
    toastNode.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function() { toastNode.classList.remove("show"); }, 2400);
  }

  function skillValues() {
    var values = { communication: 0, collaboration: 0, problem: 0 };
    storageState.completed.forEach(function(id) {
      var level = skillquestLevels[id - 1];
      if (level.world === 0) values.communication += 1;
      else if (level.world === 1 || level.world === 3) values.collaboration += 1;
      else if (level.world === 2) values.problem += 1;
      else {
        values.communication += 0.34;
        values.collaboration += 0.33;
        values.problem += 0.33;
      }
    });
    return {
      communication: Math.min(100, Math.round(values.communication / 10 * 100)),
      collaboration: Math.min(100, Math.round(values.collaboration / 20 * 100)),
      problem: Math.min(100, Math.round(values.problem / 20 * 100))
    };
  }

  function skillRows() {
    var values = skillValues();
    var rows = [
      ["Communication", values.communication, "communication"],
      ["Collaboration", values.collaboration, "collaboration"],
      ["Problem-solving", values.problem, "problem-solving"]
    ];
    return '<div class="skill-list">' + rows.map(function(row) {
      return '<div class="skill-row"><span class="skill-name">' + row[0] +
        '</span><div class="bar ' + row[2] + '"><span style="width:' + row[1] + '%"></span></div>' +
        '<span class="skill-number">' + row[1] + '%</span></div>';
    }).join("") + '</div>';
  }

  function setView(nextView) {
    view = nextView;
    if (view !== "mission") {
      activeLevelId = null;
      selectedChoice = null;
      answered = false;
      replayMode = false;
      showTip = false;
    }
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openLevel(levelId) {
    if (levelId < 1 || levelId > 50) return;
    if (!isComplete(levelId) && levelId > firstIncomplete()) {
      showToast("Complete the earlier missions to unlock this one.");
      return;
    }
    activeLevelId = levelId;
    selectedChoice = null;
    answered = false;
    replayMode = isComplete(levelId);
    showTip = false;
    view = "mission";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continueLearning() {
    if (completedCount() === 50) {
      setView("progress");
      return;
    }
    openLevel(firstIncomplete());
  }

  function render() {
    if (view === "home") {
      pageLabel.textContent = "Home";
      renderHome();
    } else if (view === "journey") {
      pageLabel.textContent = "Game map";
      renderJourney();
    } else if (view === "mission") {
      pageLabel.textContent = "Level " + activeLevelId;
      renderMission();
    } else {
      pageLabel.textContent = "My stats";
      renderProgress();
    }
    document.querySelectorAll(".nav-item").forEach(function(button) {
      button.classList.toggle("is-active", button.getAttribute("data-nav") === view || (view === "mission" && button.getAttribute("data-nav") === "journey"));
    });
    bindChoiceControls();
  }

  function renderHome() {
    var nextId = firstIncomplete();
    var nextLevel = skillquestLevels[nextId - 1];
    var allDone = completedCount() === 50;
    var total = completedCount();
    var rank = Math.floor(storageState.xp / 250) + 1;
    root.innerHTML =
      '<section class="welcome-row">' +
        '<div><div class="eyebrow"><span class="eyebrow-dot"></span> YOUR QUEST BOARD</div>' +
          '<h1>Hey Jordan! Ready for a tiny win?</h1><p>Pick a mini-adventure, make a choice, and see what happens. You can always try again.</p></div>' +
        '<div class="stats-pills"><div class="stat-pill"><span class="pill-icon">⚡</span><span><strong>' + storageState.xp + '</strong> XP</span></div>' +
          '<div class="stat-pill"><span class="pill-icon">🏅</span><span>Rank <strong>' + rank + '</strong></span></div></div>' +
      '</section>' +
      '<section class="hero-card">' +
        '<div class="hero-copy"><div class="hero-kicker">' + (allDone ? "YOU DID IT!" : "NEXT MINI-ADVENTURE · LEVEL " + nextId) + '</div>' +
          '<h2>' + (allDone ? "You made it through all 50 levels!" : "One tiny choice can level up your day.") + '</h2>' +
          '<p>' + (allDone ? "Take another spin through your favorite missions or check out the skills you practiced." : "Step into a familiar work moment, pick a move, and collect a little XP along the way.") + '</p>' +
          '<button class="primary-button" data-action="continue">' + (allDone ? "Check my stats" : "Let’s play!") + '<span class="arrow">→</span></button></div>' +
        '<div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="planet"></div>' +
          '<div class="float-chip one">✦ Level up</div><div class="float-chip two">↗ New skills</div><div class="float-chip three">⚡ + XP</div><div class="hero-mascot-bubble">Pip says: you’ve got this!</div><div class="hero-emoji">🦊</div></div>' +
      '</section>' +
      '<div class="section-heading"><h2>Your game map</h2><button data-nav="journey">See all 50 levels <span>→</span></button></div>' +
      '<div class="world-strip">' + skillquestWorlds.map(function(world, index) {
        return '<button class="world-card" data-world="' + index + '"><span class="world-emoji">' + world.icon + '</span><strong>' + world.name + '</strong><span>' + worldCompleted(index) + ' of 10 missions</span></button>';
      }).join("") + '</div>' +
      '<div class="section-heading"><h2>Tiny wins so far</h2><span class="small-muted">' + total + ' of 50 missions complete</span></div>' +
      '<div class="dashboard-grid">' +
        '<section class="panel"><div class="panel-head"><h3>' + (allDone ? "Your last mission" : "Your next mission") + '</h3><span class="small-muted">' + (allDone ? "Replay any level" : "About 3 min") + '</span></div>' +
          '<div class="quest-row"><div class="quest-icon">' + skillquestWorlds[nextLevel.world].icon + '</div><div class="quest-copy"><strong>Level ' + nextId + ': ' + escapeHtml(nextLevel.title) + '</strong><span>' + escapeHtml(nextLevel.skill) + ' · ' + worldCompleted(nextLevel.world) + '/10 in this world</span>' +
            '<div class="mini-progress"><span style="width:' + (worldCompleted(nextLevel.world) * 10) + '%"></span></div></div><button class="round-arrow" data-action="continue" aria-label="Continue mission">→</button></div></section>' +
        '<section class="panel"><div class="panel-head"><h3>Powers you’re building</h3><span class="small-muted">From your missions</span></div>' + skillRows() + '</section>' +
      '</div>';
  }

  function renderJourney() {
    var nextId = firstIncomplete();
    root.innerHTML =
      '<section class="journey-header"><div><div class="eyebrow"><span class="eyebrow-dot"></span> YOUR MINI-ADVENTURES</div><h1>Pick a level, take a little leap</h1><p>Each mission is a quick chance to practice a work skill in a no-pressure game.</p></div>' +
        '<div class="journey-summary">✦ ' + completedCount() + ' of 50 complete · ' + storageState.xp + ' XP earned</div></section>' +
      skillquestWorlds.map(function(world, worldIndex) {
        var start = worldIndex * 10 + 1;
        return '<section class="world-section"><div class="world-title-row"><div class="world-icon">' + world.icon + '</div>' +
          '<div class="world-title-copy"><strong>World ' + (worldIndex + 1) + ' · ' + world.name + '</strong><span>' + world.theme + '</span></div>' +
          '<span class="world-progress">' + worldCompleted(worldIndex) + ' / 10</span></div><div class="level-grid">' +
          skillquestLevels.slice(start - 1, start + 9).map(function(level) {
            var done = isComplete(level.id);
            var open = !done && level.id === nextId;
            var locked = !done && !open;
            return '<button class="level-node ' + (done ? "is-complete" : (open ? "is-open" : "is-locked")) + '" data-level="' + level.id + '"' +
              (locked ? " disabled" : "") + ' title="' + escapeHtml(level.title + (locked ? " — complete earlier missions first" : "")) + '">' +
              '<strong>' + (done ? "✓" : level.id) + '</strong><span>' + (done ? "done" : (locked ? "locked" : "play")) + '</span></button>';
          }).join("") + '</div></section>';
      }).join("") +
      '<p class="small-muted" style="text-align:center;margin:20px 0 0">XP celebrates practice. It is not a measure of job performance.</p>';
  }

  function renderMission() {
    var level = skillquestLevels[activeLevelId - 1];
    var world = skillquestWorlds[level.world];
    var alreadyComplete = isComplete(level.id);
    var resultCorrect = storageState.results[level.id];
    var choicesHtml = level.choices.map(function(choice, index) {
      var classes = "choice";
      if (selectedChoice === index) classes += " is-selected";
      if (answered && index === level.correct) classes += " is-correct";
      else if (answered && index === selectedChoice) classes += " is-missed";
      return '<button type="button" class="' + classes + '" data-choice="' + index + '" aria-pressed="' + (selectedChoice === index ? "true" : "false") + '"' + (answered ? " disabled" : "") + '>' +
        '<span class="choice-letter">' + String.fromCharCode(65 + index) + '</span><span class="choice-copy">' + escapeHtml(choice) + '</span></button>';
    }).join("");

    var feedback = "";
    if (answered) {
      var correct = selectedChoice === level.correct;
      feedback = '<div class="feedback-box ' + (correct ? "" : "needs-work") + '" role="status">' +
        '<div class="feedback-top">' + (correct ? "✨ Nice move! Pip approves." : "↻ No biggie — every choice teaches you something.") + '</div>' +
        '<p>' + (correct ? escapeHtml(level.why) : escapeHtml(level.risk)) + '</p>' +
        '<p class="feedback-tip"><strong>Try this habit:</strong> ' + escapeHtml(level.tip) + '</p>' +
        '<span class="result-reward">' + (replayMode ? "✦ Replay complete" : "⚡ +" + (correct ? "50" : "30") + " XP") + '</span></div>' +
        '<div class="reflection-area"><label for="reflection-note"><strong>Take it with you</strong><span>What might you try in a real situation?</span></label>' +
          '<textarea id="reflection-note" maxlength="300" placeholder="Keep it general. Don’t include real names or sensitive details.">' + escapeHtml(storageState.reflections[level.id] || "") + '</textarea>' +
          '<button class="secondary-button" data-action="save-reflection">Save reflection</button></div>' +
        '<div class="mission-complete-actions"><button class="primary-button" data-action="next-after-mission">' + (level.id === 50 ? "Check my stats" : "Keep the adventure going") + '<span class="arrow">→</span></button>' +
          '<button class="secondary-button" data-action="replay">Try another move</button><button class="secondary-button" data-nav="journey">Back to game map</button></div>';
    }

    root.innerHTML =
      '<div class="mission-wrap"><button class="back-link" data-nav="journey">← Back to my journey</button>' +
        '<div class="mission-topline"><span class="mission-world">' + world.icon + ' ' + world.name + '</span><span class="mission-count">LEVEL ' + level.id + ' OF 50</span></div>' +
        '<div class="mission-progress"><span style="width:' + (level.id * 2) + '%"></span></div>' +
        '<article class="mission-card"><div class="mission-meta"><span class="tag">' + escapeHtml(level.skill) + '</span><span>3-min mission</span><span>·</span><span>Office mini-game</span></div>' +
          '<h1>' + escapeHtml(level.title) + '</h1><p class="mission-story">' + escapeHtml(level.story) + '</p>' +
          '<button class="hint-toggle" data-action="toggle-tip">' + (showTip ? "▾ Hide Pip’s hint" : "✦ Ask Pip for a hint") + '</button>' +
          (showTip ? '<div class="tip-box"><strong>Pip’s tiny tip · 30-second read</strong>' + escapeHtml(level.tip) + '</div>' : "") +
          '<div style="height:18px"></div><h2 class="mission-question">What do you want to try?</h2>' +
          '<div class="choice-list">' + choicesHtml + '</div>' +
          '<div class="mission-actions">' +
            '<span class="small-muted">' + (answered ? "You can replay to compare another move." : "Pick the move you’d try first.") + '</span>' +
            '<button id="submit-choice" class="primary-button submit-button" data-action="submit-choice" ' + (selectedChoice === null || answered ? "disabled" : "") + '>Make my move <span class="arrow">→</span></button>' +
          '</div>' + feedback +
        '</article></div>';
  }

  function renderProgress() {
    var total = completedCount();
    var percent = Math.round(total / 50 * 100);
    var rank = Math.floor(storageState.xp / 250) + 1;
    var values = skillValues();
    root.innerHTML =
      '<section class="journey-header"><div><div class="eyebrow"><span class="eyebrow-dot"></span> YOUR SCOREBOARD</div><h1>Look at you, leveling up!</h1><p>These stats show the missions you’ve played. XP is just for fun—it’s not a work score.</p></div>' +
        '<button class="secondary-button" data-action="reset">Reset demo progress</button></section>' +
      '<section class="progress-hero"><div><span class="tag">Rank ' + rank + ' · Curious explorer</span><h1>' + total + ' missions explored</h1>' +
        '<p>You have practiced workplace scenarios, reviewed feedback, and earned progress along the way. Keep exploring at your own pace.</p></div>' +
        '<div class="big-xp" style="--progress:' + percent * 3.6 + 'deg"><div class="big-xp-inner"><strong>' + storageState.xp + '</strong><span>XP earned</span></div></div></section>' +
      '<div class="progress-columns"><section class="panel"><div class="panel-head"><h3>Your power-ups</h3><span class="small-muted">Skills you’ve practiced</span></div>' +
        progressSkillCard("Communication", values.communication, "Clear messages, listening and asking questions") +
        progressSkillCard("Collaboration", values.collaboration, "Shared work, inclusion and leadership") +
        progressSkillCard("Problem-solving", values.problem, "Evidence, trade-offs and decisions") +
      '</section><section class="panel"><div class="panel-head"><h3>Game map progress</h3><span class="small-muted">' + percent + '% complete</span></div>' +
        '<p class="empty-state">' + (total ? "You have unlocked through Level " + Math.min(50, firstIncomplete()) + ". Review any completed mission or continue to the next one." : "Your journey is ready when you are. Start with a short Level 1 scenario and build from there.") + '</p>' +
        '<div class="mini-progress" style="max-width:none;height:8px;margin:15px 0 17px"><span style="width:' + percent + '%"></span></div>' +
        '<button class="primary-button" data-action="continue">' + (total === 50 ? "Review your progress" : "Continue learning") + '<span class="arrow">→</span></button>' +
        '<p class="small-muted" style="margin:18px 0 0;line-height:1.6">Progress stays in this browser. Avoid entering confidential workplace details in reflection notes.</p></section></div>';
  }

  function progressSkillCard(name, amount, description) {
    return '<div class="progress-skill"><div class="progress-skill-head"><strong>' + name + '</strong><span>' + amount + '% practice journey</span></div>' +
      '<div class="bar"><span style="width:' + amount + '%"></span></div><div class="small-muted" style="margin-top:6px">' + description + '</div></div>';
  }

  function bindChoiceControls() {
    root.querySelectorAll("[data-choice]").forEach(function(button) {
      button.addEventListener("click", function() {
        if (answered) return;
        selectedChoice = Number(button.getAttribute("data-choice"));
        root.querySelectorAll("[data-choice]").forEach(function(choiceButton) {
          var selected = Number(choiceButton.getAttribute("data-choice")) === selectedChoice;
          choiceButton.classList.toggle("is-selected", selected);
          choiceButton.setAttribute("aria-pressed", selected ? "true" : "false");
        });
        var submit = document.getElementById("submit-choice");
        if (submit) submit.disabled = false;
      });
    });
  }

  document.addEventListener("click", function(event) {
    var nav = event.target.closest("[data-nav]");
    if (nav) {
      event.preventDefault();
      setView(nav.getAttribute("data-nav"));
      return;
    }
    var worldButton = event.target.closest("[data-world]");
    if (worldButton) {
      setView("journey");
      return;
    }
    var levelButton = event.target.closest("[data-level]");
    if (levelButton) {
      openLevel(Number(levelButton.getAttribute("data-level")));
      return;
    }
    var actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    var action = actionButton.getAttribute("data-action");
    if (action === "continue") {
      continueLearning();
    } else if (action === "toggle-tip") {
      showTip = !showTip;
      render();
    } else if (action === "submit-choice") {
      submitChoice();
    } else if (action === "next-after-mission") {
      if (activeLevelId === 50) setView("progress");
      else openLevel(firstIncomplete());
    } else if (action === "replay") {
      selectedChoice = null;
      answered = false;
      replayMode = true;
      showTip = false;
      render();
    } else if (action === "save-reflection") {
      saveReflection();
    } else if (action === "reset") {
      resetProgress();
    }
  });

  function submitChoice() {
    if (selectedChoice === null || !activeLevelId) return;
    var level = skillquestLevels[activeLevelId - 1];
    var isFirstCompletion = !isComplete(level.id);
    var correct = selectedChoice === level.correct;
    if (isFirstCompletion) {
      storageState.completed.push(level.id);
      storageState.xp += correct ? 50 : 30;
    }
    storageState.results[level.id] = correct;
    saveState();
    answered = true;
    render();
  }

  function saveReflection() {
    var field = document.getElementById("reflection-note");
    if (!field || !activeLevelId) return;
    storageState.reflections[activeLevelId] = field.value.trim().slice(0, 300);
    saveState();
    showToast("Reflection saved in this browser.");
  }

  function resetProgress() {
    if (!window.confirm("Reset your XPaddition demo progress in this browser?")) return;
    storageState = { xp: 0, completed: [], results: {}, reflections: {} };
    saveState();
    setView("home");
    showToast("Demo progress reset.");
  }

  render();
})(); 
