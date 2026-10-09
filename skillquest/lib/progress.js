"use strict";
/* Validates saved progress against the game content, so a player can't store unknown data or impossible XP. */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadContent(root) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  ["developer-games.js", "developer-js-lessons.js", "aicheck-games.js"].forEach(file => {
    try { vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { timeout: 1000 }); } catch { /* optional file */ }
  });
  return sandbox.window;
}

const content = loadContent(path.join(__dirname, ".."));
const game = content.DEVQUEST_CONTENT || {};
const trailLessons = (content.DEVQUEST_JS_LESSONS && content.DEVQUEST_JS_LESSONS.lessons) || [];
const aiGames = (content.XP_AICHECK && content.XP_AICHECK.games) || {};
const aiGameIds = new Set(Object.keys(aiGames));
const skillIds = [].concat(game.skills || [], game.techSkills || []).map(skill => skill.id);
const scenarioById = Object.fromEntries((game.scenarios || []).map(item => [item.id, item]));
const challengeById = Object.fromEntries((game.challenges || []).map(item => [item.id, item]));
const lessonIds = new Set(Object.keys(game.lessons || {}).concat(trailLessons.map(lesson => lesson.id)));
const scenarioXp = (game.scenarios || []).reduce((sum, item) => sum + Math.max(0, ...item.options.map(option => Object.values(option.xp).reduce((a, b) => a + b, 0))), 0);
const challengeXp = (game.challenges || []).reduce((sum, item) => sum + item.xp, 0);
/* AI Code Check: each game's XP, a chest bonus (25) per game and the most combo bonus a player can bank (10 + 20 + ...); JavaScript Trail: 20 per lesson */
const aiXp = Object.values(aiGames).reduce((sum, game) => sum + (game.xp || 50), 0) + aiGameIds.size * 25 + 5 * aiGameIds.size * aiGameIds.size + trailLessons.length * 20;
/* every scenario, challenge and lesson, both algorithm labs, AI Code Check, plus an allowance for the daily quest, reels and story */
const MAX_XP = scenarioXp + challengeXp + lessonIds.size * 10 + aiXp + 80 + 400;

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
  const ids = (list, valid) => Array.isArray(list) ? [...new Set(list.filter(id => typeof id === "string" && valid(id)))] : [];
  const ai = p.aicheck && typeof p.aicheck === "object" && !Array.isArray(p.aicheck) ? p.aicheck : {};
  const aicheck = { played: ids(ai.played, id => aiGameIds.has(id)), bosses: ids(ai.bosses, id => aiGameIds.has(id)), chests: ids(ai.chests, id => aiGameIds.has(id)), best: {}, rematchAt: {}, combo: clampInt(ai.combo, 1000), bestCombo: clampInt(ai.bestCombo, 1000) };
  if (ai.best && typeof ai.best === "object") Object.keys(ai.best).forEach(id => { if (aiGameIds.has(id)) aicheck.best[id] = clampInt(ai.best[id], 100); });
  if (ai.rematchAt && typeof ai.rematchAt === "object") Object.keys(ai.rematchAt).forEach(id => { const v = Number(ai.rematchAt[id]); if (aiGameIds.has(id) && Number.isFinite(v) && v > 0) aicheck.rematchAt[id] = Math.floor(v); });
  const jsLessons = ids(p.jsLessons, id => trailLessons.some(lesson => lesson.id === id));
  const lab = value => ({ done: !!(value && value.done) });
  const sim = p.simulator && typeof p.simulator === "object" ? p.simulator : {};
  return {
    name: String(p.name || "").slice(0, 40), xp: clampInt(p.xp, MAX_XP), sound: !!p.sound, skills, scenarios, tech, lessons, aicheck, jsLessons,
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
