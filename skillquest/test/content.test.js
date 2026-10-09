"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = { window: {} };
vm.createContext(sandbox);
["developer-games.js", "developer-js-lessons.js"].forEach(file => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox));
const content = sandbox.window.DEVQUEST_CONTENT;
const trail = sandbox.window.DEVQUEST_JS_LESSONS.lessons;
const skills = new Set(content.skills.concat(content.techSkills).map(s => s.id));
const isPermutation = (list, n) => list.length === n && [...list].sort((a, b) => a - b).every((v, i) => v === i);

test("ids are unique", () => {
  for (const list of [content.skills, content.techSkills, content.scenarios, content.challenges, trail]) {
    const ids = list.map(x => x.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  }
});

test("every scenario has options that award XP to real skills", () => {
  for (const s of content.scenarios) {
    assert.ok(skills.has(s.skill), s.id);
    assert.ok(s.options.length >= 2, s.id);
    for (const o of s.options) {
      assert.ok(o.text && o.insight, s.id);
      const keys = Object.keys(o.xp);
      assert.ok(keys.length > 0, s.id);
      keys.forEach(k => { assert.ok(skills.has(k), s.id + " → " + k); assert.ok(o.xp[k] > 0); });
    }
  }
});

test("every challenge is well formed and has a lesson", () => {
  for (const c of content.challenges) {
    assert.ok(skills.has(c.skill), c.id);
    assert.ok(c.xp > 0 && c.explain && c.prompt, c.id);
    assert.ok(content.lessons[c.id], "lesson for " + c.id);
    if (c.kind === "tapLine") c.bad.forEach(i => assert.ok(i >= 0 && i < c.code.length, c.id));
    else if (c.kind === "arrange") assert.ok(isPermutation(c.answer, c.items.length), c.id);
    else if (c.kind === "match") assert.ok(isPermutation(c.rightOrder, c.pairs.length), c.id);
    else if (c.kind === "fill") assert.strictEqual(c.code.join("\n").split("___").length - 1 || c.blanks.length, c.blanks.length, c.id);
    else if (c.kind === "live") assert.ok(["center", "row-gap"].includes(c.check) && c.html && c.starter, c.id);
    else if (c.kind === "run") { assert.ok(c.fn && c.starter && c.tests.length > 0, c.id); assert.ok(new RegExp("function\\s+" + c.fn + "\\b").test(c.starter), c.id); }
    else assert.fail("unknown kind " + c.kind + " in " + c.id);
  }
});

test("lessons reference real code lines", () => {
  for (const [id, L] of Object.entries(content.lessons)) {
    assert.ok(L.title && L.intro && L.key, id);
    if (L.kind === "compare") assert.ok(L.variants.length >= 2 && L.variants.every(v => v.code && v.caption), id);
    else { assert.ok(L.steps.length >= 3, id); L.steps.forEach(st => st.focus.forEach(i => assert.ok(i >= 0 && i < L.code.length, id))); }
  }
  for (const L of trail) L.steps.forEach(st => { assert.ok(st.nodes.length > 0 && st.takeaway, L.id); st.focus.forEach(i => assert.ok(i >= 0 && i < L.code.length, L.id)); });
});

test("reference solutions pass the JavaScript challenge tests", () => {
  const solutions = {
    "js-fix-function": "function total(prices) { let s = 0; for (let i = 0; i < prices.length; i++) s += prices[i]; return s; }",
    "js-write-function": "function isEven(n) { return n % 2 === 0; }"
  };
  for (const c of content.challenges.filter(x => x.kind === "run")) {
    const fn = new Function(solutions[c.id] + "\nreturn " + c.fn + ";")();
    c.tests.forEach(t => assert.strictEqual(JSON.stringify(fn(...t.args)), JSON.stringify(t.expected), c.id));
    const starter = new Function(c.starter + "\nreturn " + c.fn + ";")();
    assert.ok(c.tests.some(t => JSON.stringify(starter(...t.args)) !== JSON.stringify(t.expected)), "starter should fail " + c.id);
  }
});
