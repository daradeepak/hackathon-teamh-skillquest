"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { sanitizeProgress, MAX_XP } = require("../lib/progress");

const sandbox = { window: {} };
vm.createContext(sandbox);
["aicheck-games.js", "developer-js-lessons.js"].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", f), "utf8"), sandbox));
const games = sandbox.window.XP_AICHECK.games;

test("every AI Code Check game has the fields its engine needs", () => {
  for (const [id, g] of Object.entries(games)) {
    assert.strictEqual(g.id, id);
    assert.ok(g.title && g.kind && g.xp > 0, id);
    if (g.kind === "codeFix") assert.ok(g.starterCode && g.tests.length > 0, id);
  }
});

test("the Code Fix boss starts failing and can be fixed", () => {
  const g = Object.values(games).find(x => x.kind === "codeFix");
  const name = g.functionName || "applyCoupon";
  const args = t => Array.isArray(t.args) ? t.args : [t.total, t.discount];
  const starter = new Function(g.starterCode + ";return " + name + ";")();
  assert.ok(g.tests.some(t => JSON.stringify(starter(...args(t))) !== JSON.stringify(t.expected)), "starter should fail a test");
});

test("saved AI Code Check progress is validated", () => {
  const id = Object.keys(games)[0];
  const p = sanitizeProgress({ aicheck: { played: [id, "bogus", id], best: { [id]: 900, bogus: 5 }, combo: 1e9 }, jsLessons: ["bogus"] });
  assert.deepStrictEqual(p.aicheck.played, [id]);
  assert.strictEqual(p.aicheck.best[id], 100);
  assert.strictEqual(p.aicheck.best.bogus, undefined);
  assert.ok(p.aicheck.combo <= 1000);
  assert.deepStrictEqual(p.jsLessons, []);
});

test("Merge Defender wave stars are validated", () => {
  const p = sanitizeProgress({ aicheck: { waves: { 1: 3, 2: 99, 3: -1, 9: 3 } } });
  assert.deepStrictEqual(p.aicheck.waves, { 1: 3, 2: 3 });
});

test("completing every AI Code Check game fits under the XP cap", () => {
  const total = Object.values(games).reduce((sum, g) => sum + g.xp, 0);
  assert.ok(MAX_XP > total);
});
