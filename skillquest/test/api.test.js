"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const path = require("node:path");
const { Client } = require("pg");

/* Needs a PostgreSQL database it may wipe. Locally: createdb xpedition_test; in CI a service container provides it. */
const TEST_DB = process.env.TEST_DATABASE_URL || "postgres://xpedition:xpedition_local_dev@localhost:5432/xpedition_test";
let child, base;
const post = (url, body, cookie) => fetch(base + url, { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, cookie ? { Cookie: cookie } : {}), body: JSON.stringify(body) });
const cookieOf = response => (response.headers.get("set-cookie") || "").split(";")[0];
async function register(name, email, password = "correct-horse-1") { const r = await post("/api/register", { name, email, password }); return { r, cookie: cookieOf(r) }; }

test.before(async () => {
  const db = new Client({ connectionString: TEST_DB });
  await db.connect();
  await db.query("DROP TABLE IF EXISTS sessions, users, schema_migrations");
  await db.end();
  child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { env: Object.assign({}, process.env, { PORT: "0", HOST: "127.0.0.1", DATABASE_URL: TEST_DB, REGISTER_LIMIT_PER_HOUR: "100" }), stdio: ["ignore", "pipe", "inherit"] });
  base = await new Promise((resolve, reject) => {
    child.stdout.on("data", chunk => { const m = /http:\/\/[\d.]+:(\d+)/.exec(String(chunk)); if (m) resolve("http://127.0.0.1:" + m[1]); });
    child.on("exit", () => reject(new Error("server exited")));
    setTimeout(() => reject(new Error("server did not start")), 8000);
  });
});
test.after(() => { child.kill(); });

test("serves the app with strict security headers", async () => {
  const r = await fetch(base + "/");
  assert.strictEqual(r.status, 200);
  assert.match(r.headers.get("content-security-policy"), /script-src 'self'/);
  assert.strictEqual(r.headers.get("x-frame-options"), "DENY");
  assert.strictEqual(r.headers.get("x-content-type-options"), "nosniff");
  const w = await fetch(base + "/runner-worker.js");
  assert.match(w.headers.get("content-security-policy"), /connect-src 'none'/);
});

test("does not expose server code, data or dotfiles", async () => {
  for (const p of ["/server.js", "/package.json", "/.env", "/.env.example", "/lib/db.js", "/scripts/import-json-accounts.js", "/node_modules/pg/package.json", "/data/accounts.json", "/.gitignore", "/../server.js", "/test/api.test.js"]) {
    const r = await fetch(base + p);
    assert.ok([403, 404].includes(r.status), p + " → " + r.status);
  }
});

test("registers, rejects bad input and duplicates, and sets a safe cookie", async () => {
  assert.strictEqual((await post("/api/register", { name: "A", email: "a@example.com", password: "correct-horse-1" })).status, 400);
  assert.strictEqual((await post("/api/register", { name: "Ann Lee", email: "nope", password: "correct-horse-1" })).status, 400);
  assert.strictEqual((await post("/api/register", { name: "Ann Lee", email: "ann@example.com", password: "short" })).status, 400);
  const first = await register("Ann Lee", "ann@example.com");
  assert.strictEqual(first.r.status, 201);
  assert.match(first.r.headers.get("set-cookie"), /HttpOnly/);
  assert.match(first.r.headers.get("set-cookie"), /SameSite=Lax/);
  assert.strictEqual((await register("Ann Again", "ANN@example.com")).r.status, 409);
});

test("login works only with the right password", async () => {
  await register("Bo Park", "bo@example.com");
  assert.strictEqual((await post("/api/login", { email: "bo@example.com", password: "wrong-password" })).status, 401);
  assert.strictEqual((await post("/api/login", { email: "nobody@example.com", password: "whatever-123" })).status, 401);
  const ok = await post("/api/login", { email: "bo@example.com", password: "correct-horse-1" });
  assert.strictEqual(ok.status, 200);
  const me = await fetch(base + "/api/me", { headers: { Cookie: cookieOf(ok) } });
  assert.strictEqual((await me.json()).user.email, "bo@example.com");
  assert.strictEqual((await fetch(base + "/api/me")).status, 401);
  /* signing out ends the session in the database */
  await post("/api/logout", {}, cookieOf(ok));
  assert.strictEqual((await fetch(base + "/api/me", { headers: { Cookie: cookieOf(ok) } })).status, 401);
});

test("saved progress is sanitised and XP is capped", async () => {
  const { cookie } = await register("Cy Ng", "cy@example.com");
  assert.strictEqual((await post("/api/progress", { progress: { xp: 1e9, skills: { html: 1e9, bogus: 5 }, tech: { "html-hunt-bug": 80, nope: 1 }, scenarios: { "stalled-project": 99 }, evil: "<script>" } })).status, 401);
  assert.strictEqual((await post("/api/progress", { progress: { xp: 1e9, skills: { html: 1e9, bogus: 5 }, tech: { "html-hunt-bug": 80, nope: 1 }, scenarios: { "stalled-project": 99, "bad-bye": 0 }, evil: "<script>" } }, cookie)).status, 200);
  const user = (await (await fetch(base + "/api/me", { headers: { Cookie: cookie } })).json()).user;
  assert.ok(user.progress.xp < 20000, "xp capped, got " + user.progress.xp);
  assert.ok(user.progress.skills.html <= user.progress.xp || user.progress.skills.html < 20000);
  assert.strictEqual(user.progress.skills.bogus, undefined);
  assert.deepStrictEqual(user.progress.tech, { "html-hunt-bug": 80 });
  assert.deepStrictEqual(user.progress.scenarios, {});
  assert.strictEqual(user.progress.evil, undefined);
});

test("profile edits validate the name and photo", async () => {
  const { cookie } = await register("Di Wu", "di@example.com");
  assert.strictEqual((await post("/api/profile", { name: "D" }, cookie)).status, 400);
  assert.strictEqual((await post("/api/profile", { avatar: "data:text/html;base64,PGI+" }, cookie)).status, 400);
  const png = "data:image/png;base64,iVBORw0KGgo=";
  const ok = await post("/api/profile", { name: "Di Wu Jr", avatar: png }, cookie);
  assert.strictEqual(ok.status, 200);
  const user = (await ok.json()).user;
  assert.strictEqual(user.name, "Di Wu Jr");
  assert.strictEqual(user.avatar, png);
  assert.strictEqual((await post("/api/profile", { name: "Nope" })).status, 401);
  assert.strictEqual((await post("/api/profile", { avatar: "preset:fox" }, cookie)).status, 200);
  assert.strictEqual((await post("/api/profile", { avatar: "preset:dragon" }, cookie)).status, 400);
});

test("leaderboard ranks by XP, flags the signed-in player and hides emails", async () => {
  const hi = await register("Top Player", "top@example.com"), lo = await register("Low Player", "low@example.com");
  await post("/api/progress", { progress: { xp: 300 } }, hi.cookie);
  await post("/api/progress", { progress: { xp: 20 } }, lo.cookie);
  const data = await (await fetch(base + "/api/leaderboard", { headers: { Cookie: lo.cookie } })).json();
  const names = data.players.map(p => p.name);
  assert.ok(names.indexOf("Top Player") < names.indexOf("Low Player"));
  assert.strictEqual(data.players.find(p => p.me).name, "Low Player");
  assert.ok(data.players.every((p, i) => p.rank === i + 1 && p.email === undefined));
});

test("game data needs a signed-in player", async () => {
  assert.strictEqual((await fetch(base + "/api/leaderboard")).status, 401);
  assert.strictEqual((await post("/api/progress", { progress: { xp: 5 } })).status, 401);
  const health = await fetch(base + "/api/health");
  assert.strictEqual(health.status, 200);
});

test("signing out on all devices ends every session", async () => {
  await register("Ed Ko", "ed@example.com");
  const a = cookieOf(await post("/api/login", { email: "ed@example.com", password: "correct-horse-1" }));
  const b = cookieOf(await post("/api/login", { email: "ed@example.com", password: "correct-horse-1" }));
  assert.strictEqual((await post("/api/logout-all", {}, a)).status, 200);
  assert.strictEqual((await fetch(base + "/api/me", { headers: { Cookie: b } })).status, 401);
});

test("logging in is rate limited", async () => {
  let last;
  for (let i = 0; i < 12; i++) last = await post("/api/login", { email: "limit@example.com", password: "wrong-password" });
  assert.strictEqual(last.status, 429);
  assert.ok(last.headers.get("retry-after"));
});
