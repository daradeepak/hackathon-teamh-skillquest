"use strict";
/* Validates saved progress against the game content, so a player can't store unknown data or impossible XP. */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadContent(root) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  ["developer-games.js", "developer-js-lessons.js"].forEach(file => {
    try { vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { timeout: 1000 }); } catch { /* optional file */ }
  });
  return sandbox.window;
}

const content = loadContent(path.join(__dirname, ".."));
const game = content.DEVQUEST_CONTENT || {};
const trailLessons = (content.DEVQUEST_JS_LESSONS && content.DEVQUEST_JS_LESSONS.lessons) || [];
const skillIds = [].concat(game.skills || [], game.techSkills || []).map(skill => skill.id);
const scenarioById = Object.fromEntries((game.scenarios || []).map(item => [item.id, item]));
const challengeById = Object.fromEntries((game.challenges || []).map(item => [item.id, item]));
const lessonIds = new Set(Object.keys(game.lessons || {}).concat(trailLessons.map(lesson => lesson.id)));
const scenarioXp = (game.scenarios || []).reduce((sum, item) => sum + Math.max(0, ...item.options.map(option => Object.values(option.xp).reduce((a, b) => a + b, 0))), 0);
const challengeXp = (game.challenges || []).reduce((sum, item) => sum + item.xp, 0);
/* every scenario, challenge and lesson, both algorithm labs, plus an allowance for the daily quest, reels and story */
const MAX_XP = scenarioXp + challengeXp + lessonIds.size * 10 + 80 + 400;

function clampInt(value, max) { const n = Math.floor(Number(value)); return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0; }
function strings(list, max = 10) { return Array.isArray(list) ? list.filter(x => typeof x === "string").map(x => x.slice(0, 40)).slice(0, max) : []; }

function sanitizeProgress(input) {
  const p = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const skills = {};
  skillIds.forEach(id => { skills[id] = clampInt(p.skills && p.skills[id], MAX_XP); });
  const scenarios = {};
  if (p.scenarios && typeof p.scenarios === "object") Object.keys(p.scenarios).forEach(id => {
    const item = scenarioById[id], choice = p.scenarios[id];
    if (item && Number.isInteger(choice) && choice >= 0 && choice < item.options.length) scenarios[id] = choice;
  });
  const tech = {};
  if (p.tech && typeof p.tech === "object") Object.keys(p.tech).forEach(id => { const v = challengeById[id] ? clampInt(p.tech[id], 100) : 0; if (v) tech[id] = v; });
  const lessons = {};
  if (p.lessons && typeof p.lessons === "object") Object.keys(p.lessons).forEach(id => { if (lessonIds.has(id) && p.lessons[id]) lessons[id] = true; });
  const lab = value => ({ done: !!(value && value.done) });
  const sim = p.simulator && typeof p.simulator === "object" ? p.simulator : {};
  return {
    name: String(p.name || "").slice(0, 40), xp: clampInt(p.xp, MAX_XP), sound: !!p.sound, skills, scenarios, tech, lessons,
    sortLab: { bubble: lab(p.sortLab && p.sortLab.bubble), binary: lab(p.sortLab && p.sortLab.binary) },
    daily: { date: String((p.daily && p.daily.date) || "").slice(0, 10), actions: strings(p.daily && p.daily.actions), claimed: !!(p.daily && p.daily.claimed) },
    reels: strings(p.reels),
    simulator: {
      stage: clampInt(sim.stage, 10), score: clampInt(sim.score, 100), done: !!sim.done, last: String(sim.last || "").slice(0, 300), reward: clampInt(sim.reward, 1000),
      choices: Array.isArray(sim.choices) ? sim.choices.slice(0, 10).map(c => ({ option: String((c && c.option) || "").slice(0, 300), feedback: String((c && c.feedback) || "").slice(0, 300) })) : []
    }
  };
}

module.exports = { sanitizeProgress, MAX_XP, clampInt };
