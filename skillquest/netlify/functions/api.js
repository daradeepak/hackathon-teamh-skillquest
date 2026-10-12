"use strict";

const crypto = require("node:crypto");
const { createPool, migrate } = require("../../lib/db");
const { sanitizeProgress, MAX_XP, clampInt } = require("../../lib/progress");

const SESSION_COOKIE = "xpedition_session";
const SESSION_TTL = 12 * 60 * 60 * 1000;
const MAX_BODY = 300 * 1024;
const MAX_AVATAR = 60 * 1024;
const AVATAR_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/]+={0,2}$/;
const AVATAR_PRESETS = new Set(["fox", "owl", "panda", "cat", "robot", "rocket", "koala", "octopus"]);
const PROTECTED_ROUTES = new Set(["/api/me", "/api/progress", "/api/profile", "/api/leaderboard", "/api/logout-all"]);
const ALLOWED_METHODS = new Set([
  "GET /api/health", "POST /api/register", "POST /api/login", "POST /api/logout",
  "GET /api/me", "POST /api/logout-all", "POST /api/progress", "POST /api/profile", "GET /api/leaderboard"
]);

const attempts = new Map();
const REGISTER_LIMIT = Number(process.env.REGISTER_LIMIT_PER_HOUR) || 10;
const DUMMY_SALT = crypto.randomBytes(16).toString("hex");
let pool;
let migration;

function getPool() {
  if (!pool) pool = createPool();
  return pool;
}

async function ensureDatabase() {
  if (!migration) {
    migration = migrate(getPool()).catch(error => {
      migration = null;
      throw error;
    });
  }
  await migration;
}

function makeError(status, message) {
  return Object.assign(new Error(message), { status });
}

function response(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: Object.assign({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    }, extraHeaders),
    body: JSON.stringify(payload)
  };
}

function cookieValue(headers, name) {
  for (const item of String(headers.cookie || "").split(";")) {
    const part = item.trim(), split = part.indexOf("=");
    if (split >= 0 && part.slice(0, split) === name) {
      try { return decodeURIComponent(part.slice(split + 1)); } catch { return ""; }
    }
  }
  return "";
}

function cookieFlags() { return "; HttpOnly; SameSite=Lax; Path=/; Secure"; }
function clearSessionCookie() { return SESSION_COOKIE + "=" + cookieFlags() + "; Max-Age=0"; }
function hashToken(token) { return crypto.createHash("sha256").update(token).digest("hex"); }
function validAvatar(value) {
  const preset = /^preset:([a-z]+)$/.exec(value);
  return preset ? AVATAR_PRESETS.has(preset[1]) : value.length <= MAX_AVATAR && AVATAR_PATTERN.test(value);
}

function passwordKey(password, salt) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key.toString("hex"))));
}

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, avatar: row.avatar || "", createdAt: row.created_at, progress: row.progress || null };
}

async function issueSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await getPool().query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))", [hashToken(token), userId, SESSION_TTL / 1000]);
  return { "Set-Cookie": SESSION_COOKIE + "=" + encodeURIComponent(token) + cookieFlags() + "; Max-Age=" + (SESSION_TTL / 1000) };
}

async function currentUser(headers) {
  const token = cookieValue(headers, SESSION_COOKIE);
  if (!token) return null;
  const { rows } = await getPool().query("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()", [hashToken(token)]);
  return rows[0] || null;
}

function rateLimit(key, limit, windowMs) {
  const now = Date.now(), entry = attempts.get(key);
  if (!entry || entry.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + windowMs }); return; }
  entry.count += 1;
  if (entry.count > limit) throw Object.assign(makeError(429, "Too many attempts. Please wait a few minutes and try again."), { headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } });
}

function clientIp(headers) {
  const netlifyIp = headers["x-nf-client-connection-ip"];
  if (netlifyIp) return netlifyIp;
  return String(headers["x-forwarded-for"] || "unknown").split(",")[0].trim() || "unknown";
}

function requestRoute(event) {
  const rawUrl = event.rawUrl || event.path || "/";
  const pathname = new URL(rawUrl, "https://xpedition.invalid").pathname;
  const functionPrefix = "/.netlify/functions/api";
  if (pathname === functionPrefix) return "/api";
  if (pathname.startsWith(functionPrefix + "/")) return "/api" + pathname.slice(functionPrefix.length);
  return pathname;
}

function requestBody(event) {
  const value = event.body || "";
  if (value.length > Math.ceil(MAX_BODY * 4 / 3) + 8) throw makeError(413, "Request is too large.");
  const raw = event.isBase64Encoded ? Buffer.from(value, "base64").toString("utf8") : value;
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY) throw makeError(413, "Request is too large.");
  try {
    const body = raw ? JSON.parse(raw) : {};
    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
  } catch {
    throw makeError(400, "Send valid JSON.");
  }
}

function requestHeaders(event) {
  const headers = {};
  for (const [key, value] of Object.entries(event.headers || {})) headers[key.toLowerCase()] = String(value);
  return headers;
}

async function handleKnownRoute(method, route, headers, event) {
  const database = getPool();
  const ip = clientIp(headers);

  if (route === "/api/health") {
    try {
      await database.query("SELECT 1");
      return response(200, { ok: true });
    } catch {
      return response(503, { ok: false, error: "Database unavailable." });
    }
  }

  if (route === "/api/register") {
    rateLimit("register:" + ip, REGISTER_LIMIT, 60 * 60 * 1000);
    const body = requestBody(event);
    const name = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (name.length < 2) return response(400, { error: "Use a name with at least 2 characters." });
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response(400, { error: "Enter a valid email address." });
    if (password.length < 8 || password.length > 128) return response(400, { error: "Choose a password between 8 and 128 characters." });
    const salt = crypto.randomBytes(16).toString("hex"), passwordHash = await passwordKey(password, salt);
    const { rows } = await database.query(
      "INSERT INTO users (id, name, email, salt, password_hash) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING RETURNING *",
      [crypto.randomUUID(), name, email, salt, passwordHash]);
    if (!rows[0]) return response(409, { error: "That email already has an XPedition account. Try signing in." });
    return response(201, { user: publicUser(rows[0]) }, await issueSession(rows[0].id));
  }

  if (route === "/api/login") {
    rateLimit("login:" + ip, 20, 15 * 60 * 1000);
    const body = requestBody(event);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 254), password = String(body.password || "").slice(0, 128);
    rateLimit("login-email:" + email, 8, 15 * 60 * 1000);
    const { rows } = await database.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    const candidate = await passwordKey(password, user ? user.salt : DUMMY_SALT);
    const expected = user ? Buffer.from(user.password_hash, "hex") : null, actual = Buffer.from(candidate, "hex");
    if (!expected || expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return response(401, { error: "Email or password is incorrect." });
    return response(200, { user: publicUser(user) }, await issueSession(user.id));
  }

  if (route === "/api/logout") {
    const token = cookieValue(headers, SESSION_COOKIE);
    if (token) await database.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
    return response(200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  const user = await currentUser(headers);
  if (!user && PROTECTED_ROUTES.has(route)) return response(401, { error: "Please sign in to continue." }, { "Set-Cookie": clearSessionCookie() });

  if (route === "/api/me") return response(200, { user: publicUser(user) });

  if (route === "/api/logout-all") {
    await database.query("DELETE FROM sessions WHERE user_id = $1", [user.id]);
    return response(200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  if (route === "/api/progress") {
    const body = requestBody(event);
    if (!body.progress || typeof body.progress !== "object" || Array.isArray(body.progress)) return response(400, { error: "Progress data is missing." });
    const progress = sanitizeProgress(body.progress);
    await database.query("UPDATE users SET progress = $2, xp = $3, updated_at = now() WHERE id = $1", [user.id, progress, progress.xp]);
    return response(200, { ok: true });
  }

  if (route === "/api/profile") {
    const body = requestBody(event);
    let name = user.name, avatar = user.avatar || "";
    if (body.name !== undefined) {
      name = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
      if (name.length < 2) return response(400, { error: "Use a name with at least 2 characters." });
    }
    if (body.avatar !== undefined) {
      avatar = String(body.avatar || "");
      if (avatar && !validAvatar(avatar)) return response(400, { error: "Use a PNG, JPEG or WebP photo, or one of the preset avatars." });
    }
    const { rows } = await database.query("UPDATE users SET name = $2, avatar = $3, updated_at = now() WHERE id = $1 RETURNING *", [user.id, name, avatar]);
    return response(200, { user: publicUser(rows[0]) });
  }

  if (route === "/api/leaderboard") {
    const top = await database.query("SELECT id, name, avatar, LEAST(xp, $1) AS xp FROM users ORDER BY xp DESC, created_at ASC LIMIT 50", [MAX_XP]);
    const total = await database.query("SELECT count(*)::int AS n FROM users");
    const players = top.rows.map((row, index) => ({ rank: index + 1, name: row.name, avatar: row.avatar, xp: row.xp, me: row.id === user.id }));
    if (!players.some(player => player.me)) {
      const rank = await database.query("SELECT count(*)::int + 1 AS rank FROM users WHERE xp > $1 OR (xp = $1 AND created_at < $2)", [user.xp, user.created_at]);
      players.push({ rank: rank.rows[0].rank, name: user.name, avatar: user.avatar, xp: clampInt(user.xp, MAX_XP), me: true });
    }
    return response(200, { players, total: total.rows[0].n });
  }

  return response(404, { error: "API route not found." });
}

exports.handler = async function(event) {
  let route, headers;
  try {
    route = requestRoute(event);
    headers = requestHeaders(event);
  } catch {
    return response(400, { error: "Bad request." });
  }

  const method = String(event.httpMethod || event.requestContext?.http?.method || "GET").toUpperCase();
  if (!route.startsWith("/api/")) return response(404, { error: "API route not found." });
  if (!ALLOWED_METHODS.has(method + " " + route)) return response(404, { error: "API route not found." });

  if (!process.env.DATABASE_URL && !process.env.NETLIFY_DB_URL && !process.env.NETLIFY_DATABASE_URL) {
    return response(503, { error: "Account storage is not configured. Set DATABASE_URL or connect a Netlify PostgreSQL database." });
  }

  try {
    await ensureDatabase();
    return await handleKnownRoute(method, route, headers, event);
  } catch (error) {
    if (error.status) return response(error.status, { error: error.message }, error.headers || {});
    console.error(new Date().toISOString(), method, route, error.message);
    return response(500, { error: "Something went wrong on our side. Please try again." });
  }
};
