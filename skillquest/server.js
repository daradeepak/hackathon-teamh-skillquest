"use strict";
/* XPedition server: serves the app and a JSON API backed by PostgreSQL.
   Configure with environment variables or a .env file (see .env.example):
   DATABASE_URL (required), PORT, HOST, COOKIE_SECURE=1 (behind HTTPS), TRUST_PROXY=1 (behind a reverse proxy), DATABASE_SSL. */
require("./lib/env")();
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { createPool, migrate } = require("./lib/db");
const { sanitizeProgress, MAX_XP, clampInt } = require("./lib/progress");

const root = path.resolve(__dirname);
const port = process.env.PORT === undefined ? 8000 : Number(process.env.PORT);
const host = process.env.HOST || "127.0.0.1"; /* use 0.0.0.0 in a container or to share on your network */
const cookieSecure = process.env.COOKIE_SECURE === "1";
const trustProxy = process.env.TRUST_PROXY === "1";
const SESSION_COOKIE = "xpedition_session";
const SESSION_TTL = 12 * 60 * 60 * 1000;
const MAX_BODY = 300 * 1024;
const MAX_AVATAR = 60 * 1024; /* characters of a small data URL; the browser shrinks photos before sending */
const AVATAR_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/]+={0,2}$/;
const contentTypes = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".webp": "image/webp"
};
/* Only these top-level files are never served, even though they have a public extension. */
const PRIVATE_FILES = new Set(["server.js"]);

const pool = createPool(process.env.DATABASE_URL);

/* ---------- security headers ---------- */
const PAGE_CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com", "img-src 'self' data:", "connect-src 'self'", "worker-src 'self'",
  "frame-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"
].join("; ");
/* The code-runner worker needs eval, so it gets its own policy: eval allowed, but no network access at all. */
const WORKER_CSP = "default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'";
function securityHeaders(extra) {
  return Object.assign({
    "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()", "Cross-Origin-Opener-Policy": "same-origin"
  }, cookieSecure ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" } : {}, extra);
}

/* ---------- http helpers ---------- */
function sendJson(response, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, securityHeaders(Object.assign({ "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store" }, headers)));
  response.end(body);
}
function fail(status, message, headers) { return Object.assign(new Error(message), { status, headers }); }
function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0, tooLarge = false;
    request.on("data", chunk => { size += chunk.length; if (size > MAX_BODY) tooLarge = true; else if (!tooLarge) chunks.push(chunk); });
    request.on("end", () => {
      if (tooLarge) return reject(fail(413, "Request is too large."));
      const raw = Buffer.concat(chunks).toString("utf8");
      try { const value = raw ? JSON.parse(raw) : {}; resolve(value && typeof value === "object" && !Array.isArray(value) ? value : {}); } catch { reject(fail(400, "Send valid JSON.")); }
    });
    request.on("error", reject);
  });
}
function cookieValue(request, name) {
  for (const item of String(request.headers.cookie || "").split(";")) {
    const part = item.trim(), split = part.indexOf("=");
    if (split >= 0 && part.slice(0, split) === name) { try { return decodeURIComponent(part.slice(split + 1)); } catch { return ""; } }
  }
  return "";
}
function clientIp(request) {
  const forwarded = trustProxy && String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || request.socket.remoteAddress || "unknown";
}
function cookieFlags() { return "; HttpOnly; SameSite=Lax; Path=/" + (cookieSecure ? "; Secure" : ""); }
function clearSessionCookie() { return SESSION_COOKIE + "=" + cookieFlags() + "; Max-Age=0"; }
function hashToken(token) { return crypto.createHash("sha256").update(token).digest("hex"); }
function passwordKey(password, salt) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key.toString("hex"))));
}
function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, avatar: row.avatar || "", createdAt: row.created_at, progress: row.progress || null };
}

/* ---------- sessions (stored hashed, so a database leak doesn't leak live sessions) ---------- */
async function issueSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))", [hashToken(token), userId, SESSION_TTL / 1000]);
  return { "Set-Cookie": SESSION_COOKIE + "=" + encodeURIComponent(token) + cookieFlags() + "; Max-Age=" + (SESSION_TTL / 1000) };
}
async function currentUser(request) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const { rows } = await pool.query("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()", [hashToken(token)]);
  return rows[0] || null;
}

/* ---------- rate limiting (per instance, in memory) ---------- */
const attempts = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now(), entry = attempts.get(key);
  if (!entry || entry.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + windowMs }); return; }
  entry.count += 1;
  if (entry.count > limit) throw fail(429, "Too many attempts. Please wait a few minutes and try again.", { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) });
}

/* ---------- API ---------- */
const DUMMY_SALT = crypto.randomBytes(16).toString("hex");
const NOT_SIGNED_IN = "Please sign in to continue.";

async function handleApi(request, response, route) {
  const method = request.method;

  if (route === "/api/health" && method === "GET") {
    try { await pool.query("SELECT 1"); return sendJson(response, 200, { ok: true }); }
    catch { return sendJson(response, 503, { ok: false, error: "Database unavailable." }); }
  }

  if (route === "/api/register" && method === "POST") {
    rateLimit("register:" + clientIp(request), 10, 60 * 60 * 1000);
    const body = await readJson(request);
    const name = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (name.length < 2) return sendJson(response, 400, { error: "Use a name with at least 2 characters." });
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(response, 400, { error: "Enter a valid email address." });
    if (password.length < 8 || password.length > 128) return sendJson(response, 400, { error: "Choose a password between 8 and 128 characters." });
    const salt = crypto.randomBytes(16).toString("hex"), passwordHash = await passwordKey(password, salt);
    const { rows } = await pool.query(
      "INSERT INTO users (id, name, email, salt, password_hash) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING RETURNING *",
      [crypto.randomUUID(), name, email, salt, passwordHash]);
    if (!rows[0]) return sendJson(response, 409, { error: "That email already has an XPedition account. Try signing in." });
    return sendJson(response, 201, { user: publicUser(rows[0]) }, await issueSession(rows[0].id));
  }

  if (route === "/api/login" && method === "POST") {
    rateLimit("login:" + clientIp(request), 20, 15 * 60 * 1000);
    const body = await readJson(request);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 254), password = String(body.password || "").slice(0, 128);
    rateLimit("login-email:" + email, 8, 15 * 60 * 1000);
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    /* hash either way, so response time doesn't reveal which emails have accounts */
    const candidate = await passwordKey(password, user ? user.salt : DUMMY_SALT);
    const expected = user ? Buffer.from(user.password_hash, "hex") : null, actual = Buffer.from(candidate, "hex");
    if (!expected || expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return sendJson(response, 401, { error: "Email or password is incorrect." });
    return sendJson(response, 200, { user: publicUser(user) }, await issueSession(user.id));
  }

  if (route === "/api/logout" && method === "POST") {
    const token = cookieValue(request, SESSION_COOKIE);
    if (token) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
    return sendJson(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  /* everything below needs a signed-in player */
  const user = await currentUser(request);
  if (!user && route.startsWith("/api/") && ["/api/me", "/api/progress", "/api/profile", "/api/leaderboard"].includes(route)) {
    return sendJson(response, 401, { error: NOT_SIGNED_IN }, { "Set-Cookie": clearSessionCookie() });
  }

  if (route === "/api/me" && method === "GET") return sendJson(response, 200, { user: publicUser(user) });

  if (route === "/api/progress" && method === "POST") {
    const body = await readJson(request);
    if (!body.progress || typeof body.progress !== "object" || Array.isArray(body.progress)) return sendJson(response, 400, { error: "Progress data is missing." });
    const progress = sanitizeProgress(body.progress);
    await pool.query("UPDATE users SET progress = $2, xp = $3, updated_at = now() WHERE id = $1", [user.id, progress, progress.xp]);
    return sendJson(response, 200, { ok: true });
  }

  if (route === "/api/profile" && method === "POST") {
    const body = await readJson(request);
    let name = user.name, avatar = user.avatar || "";
    if (body.name !== undefined) {
      name = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
      if (name.length < 2) return sendJson(response, 400, { error: "Use a name with at least 2 characters." });
    }
    if (body.avatar !== undefined) {
      avatar = String(body.avatar || "");
      if (avatar && (avatar.length > MAX_AVATAR || !AVATAR_PATTERN.test(avatar))) return sendJson(response, 400, { error: "Use a PNG, JPEG or WebP photo." });
    }
    const { rows } = await pool.query("UPDATE users SET name = $2, avatar = $3, updated_at = now() WHERE id = $1 RETURNING *", [user.id, name, avatar]);
    return sendJson(response, 200, { user: publicUser(rows[0]) });
  }

  if (route === "/api/leaderboard" && method === "GET") {
    const top = await pool.query("SELECT id, name, avatar, LEAST(xp, $1) AS xp FROM users ORDER BY xp DESC, created_at ASC LIMIT 50", [MAX_XP]);
    const total = await pool.query("SELECT count(*)::int AS n FROM users");
    const players = top.rows.map((row, index) => ({ rank: index + 1, name: row.name, avatar: row.avatar, xp: row.xp, me: row.id === user.id }));
    if (!players.some(player => player.me)) {
      const rank = await pool.query("SELECT count(*)::int + 1 AS rank FROM users WHERE xp > $1 OR (xp = $1 AND created_at < $2)", [user.xp, user.created_at]);
      players.push({ rank: rank.rows[0].rank, name: user.name, avatar: user.avatar, xp: clampInt(user.xp, MAX_XP), me: true });
    }
    return sendJson(response, 200, { players, total: total.rows[0].n });
  }

  if (route.startsWith("/api/")) return sendJson(response, 404, { error: "API route not found." });
  return null;
}

/* ---------- static files: only top-level app files are public ---------- */
function serveFile(request, response, requestedPath) {
  if (requestedPath === "/") requestedPath = "/index.html";
  const name = requestedPath.slice(1), type = contentTypes[path.extname(name).toLowerCase()];
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name) || !type || PRIVATE_FILES.has(name)) {
    response.writeHead(404, securityHeaders({ "Content-Type": "text/plain; charset=utf-8" })); response.end("Not found"); return;
  }
  const filePath = path.join(root, name);
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) { response.writeHead(404, securityHeaders({ "Content-Type": "text/plain; charset=utf-8" })); response.end("Not found"); return; }
    const etag = '"' + stats.size.toString(16) + "-" + Math.floor(stats.mtimeMs).toString(16) + '"';
    const headers = securityHeaders({ "Content-Type": type, "Cache-Control": "no-cache", "ETag": etag });
    if (name === "index.html") headers["Content-Security-Policy"] = PAGE_CSP;
    if (name === "runner-worker.js") headers["Content-Security-Policy"] = WORKER_CSP;
    if (request.headers["if-none-match"] === etag) { response.writeHead(304, headers); response.end(); return; }
    response.writeHead(200, Object.assign(headers, { "Content-Length": stats.size }));
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  let requestedPath;
  try { requestedPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400, securityHeaders({ "Content-Type": "text/plain; charset=utf-8" })); response.end("Bad request"); return; }

  if (requestedPath.startsWith("/api/")) {
    Promise.resolve(handleApi(request, response, requestedPath)).then(result => {
      if (result === null && !response.writableEnded) sendJson(response, 405, { error: "Method not allowed." }, { Allow: "GET, POST" });
    }).catch(error => {
      if (!error.status) console.error(new Date().toISOString(), request.method, requestedPath, error);
      if (!response.headersSent) sendJson(response, error.status || 500, { error: error.status ? error.message : "Something went wrong on our side. Please try again." }, error.headers || {});
      else response.destroy();
    });
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, securityHeaders({ "Content-Type": "text/plain; charset=utf-8", "Allow": "GET, HEAD" })); response.end("Method not allowed"); return;
  }
  serveFile(request, response, requestedPath);
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;

/* tidy up expired sessions and old rate-limit entries */
const sweeper = setInterval(() => {
  pool.query("DELETE FROM sessions WHERE expires_at < now()").catch(error => console.error("session cleanup failed:", error.message));
  const now = Date.now();
  attempts.forEach((entry, key) => { if (entry.resetAt < now) attempts.delete(key); });
}, 10 * 60 * 1000);
sweeper.unref();

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  console.log("Shutting down…");
  server.close(() => pool.end().finally(() => process.exit(0)));
  setTimeout(() => process.exit(0), 8000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

migrate(pool).then(() => {
  server.listen(port, host, () => {
    const address = server.address();
    console.log("XPedition is running at http://" + (host === "0.0.0.0" ? "localhost" : host) + ":" + address.port + (host === "0.0.0.0" ? " (listening on all network interfaces)" : ""));
    console.log("Press Ctrl+C to stop.");
  });
}).catch(error => {
  console.error("Could not connect to the database: " + error.message);
  console.error("Check DATABASE_URL in your environment or .env file.");
  process.exit(1);
});
