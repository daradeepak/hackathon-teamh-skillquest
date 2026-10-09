"use strict";
/* Checks every AI Code Check question variant: required fields for its engine, valid indexes, and (where the code can run) correct answers. */
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sandbox = { window: {} };
vm.createContext(sandbox);
["aicheck-games.js", "aicheck-pools.js"].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", f), "utf8"), sandbox));
const games = sandbox.window.XP_AICHECK.games, pools = sandbox.window.XP_AICHECK_POOLS;
const core = sandbox.window.XP_AICHECK.coreLevels.flatMap(l => l.games.concat([l.boss]));
const all = [];
for (const [id, list] of Object.entries(pools.variants)) for (const v of list) all.push({ id, v, g: Object.assign({}, games[id], v) });

test("every core game has a base difficulty and at least one variant", () => {
  for (const id of core) {
    assert.ok([1, 2, 3].includes(pools.base[id]), "base difficulty for " + id);
    assert.ok((pools.variants[id] || []).length >= 1, "variants for " + id);
  }
});

test("variant ids are unique and difficulties are 1 to 3", () => {
  const seen = new Set(Object.keys(games));
  for (const { id, v } of all) {
    assert.ok(games[id], "unknown base game " + id);
    assert.ok(v.vid && !seen.has(v.vid), "duplicate or missing vid " + v.vid);
    seen.add(v.vid);
    assert.ok([1, 2, 3].includes(v.difficulty), v.vid);
    assert.strictEqual(v.id, undefined, v.vid + " must not override id");
    assert.strictEqual(v.kind, undefined, v.vid + " must not change the engine");
  }
});

test("each variant has the fields its engine needs, with valid indexes", () => {
  for (const { g, v } of all) {
    const n = v.vid;
    assert.ok(g.intro && g.concept, n);
    if (g.kind === "choice") { assert.ok(g.question && g.options.length >= 2 && g.explanation, n); assert.ok(Number.isInteger(g.answer) && g.answer >= 0 && g.answer < g.options.length, n); }
    if (g.kind === "tapLine") { assert.ok(g.code.length && g.badLines.length && g.explanation, n); g.badLines.forEach(i => assert.ok(i >= 0 && i < g.code.length, n + " badLine " + i)); }
    if (g.kind === "multiSelect") { const ids = g.items.map(x => x.id); assert.strictEqual(new Set(ids).size, ids.length, n); assert.ok(g.answers.length && g.answers.every(a => ids.includes(a)), n); }
    if (g.kind === "specCheck") { assert.ok(g.ticketText && g.requirements.length && (g.scopeCreep || g.scopeNote), n); g.requirements.forEach(r => assert.ok(typeof r.met === "boolean" && r.line >= 0 && r.line < g.code.length, n)); }
    if (g.kind === "prReview") { assert.ok(g.ticket && g.issues.length && g.issues.some(x => x.shouldFlag) && g.issues.every(x => x.reply), n); }
    if (g.kind === "codeFix") { assert.ok(g.functionName && g.starterCode && g.tests.every(t => Array.isArray(t.args)), n); assert.ok(new RegExp("function\\s+" + g.functionName + "\\b").test(g.starterCode), n); }
  }
});

test("Code Fix variants start failing", () => {
  for (const { g, v } of all.filter(x => x.g.kind === "codeFix")) {
    const fn = new Function(g.starterCode + ";return " + g.functionName + ";")();
    assert.ok(g.tests.some(t => JSON.stringify(fn(...t.args)) !== JSON.stringify(t.expected)), v.vid + " starter should fail a test");
  }
});

test("predict-the-output answers match what the code really returns", () => {
  for (const { g, v } of all.filter(x => x.id === "predict-output" && !x.g.code.some(l => /setTimeout|Promise/.test(l)))) {
    const actual = vm.runInNewContext(g.code.join("\n"));
    assert.strictEqual(String(actual), g.options[g.answer], v.vid);
  }
});
