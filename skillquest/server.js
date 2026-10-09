const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname);
const dataDir = path.join(root, "data");
const databaseFile = process.env.SKILLQUEST_DB_PATH || path.join(dataDir, "accounts.json");
const port = Number(process.env.PORT) || 8000;
const sessions = new Map();
const SESSION_TTL = 12 * 60 * 60 * 1000;
const MAX_BODY = 300 * 1024;
const contentTypes = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".ico": "image/x-icon"
};

function readDatabase() {
  try {
    const data = JSON.parse(fs.readFileSync(databaseFile, "utf8"));
    return data && Array.isArray(data.users) ? data : { users: [] };
  } catch (error) {
    if (error.code === "ENOENT") return { users: [] };
    throw error;
  }
}

function writeDatabase(data) {
  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  const temp = databaseFile + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temp, databaseFile);
}

function sendJson(response, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers
  });
  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let tooLarge = false;
    request.on("data", chunk => {
      if (Buffer.byteLength(raw) + chunk.length > MAX_BODY) tooLarge = true;
      else if (!tooLarge) raw += chunk.toString("utf8");
    });
    request.on("end", () => {
      if (tooLarge) return reject(Object.assign(new Error("Request is too large."), { status: 413 }));
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(Object.assign(new Error("Send valid JSON."), { status: 400 })); }
    });
    request.on("error", reject);
  });
}

function cookieValue(request, name) {
  const cookies = String(request.headers.cookie || "").split(";");
  for (const item of cookies) {
    const part = item.trim();
    const split = part.indexOf("=");
    if (split >= 0 && part.slice(0, split) === name) return decodeURIComponent(part.slice(split + 1));
  }
  return "";
}

function sessionFor(request) {
  const token = cookieValue(request, "skillquest_session");
  const session = token && sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) { sessions.delete(token); return null; }
  return { token, session };
}

function sessionCookie(token) {
  return "skillquest_session=" + encodeURIComponent(token) + "; HttpOnly; SameSite=Lax; Path=/; Max-Age=" + (SESSION_TTL / 1000);
}

function clearSessionCookie() {
  return "skillquest_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

function issueSession(response, userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL });
  return { "Set-Cookie": sessionCookie(token) };
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, progress: user.progress || null };
}

function passwordKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key.toString("hex")));
  });
}

async function handleApi(request, response, route) {
  if (route === "/api/register" && request.method === "POST") {
    const body = await readJson(request);
    const name = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (name.length < 2) return sendJson(response, 400, { error: "Use a name with at least 2 characters." });
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(response, 400, { error: "Enter a valid email address." });
    if (password.length < 8 || password.length > 128) return sendJson(response, 400, { error: "Choose a password between 8 and 128 characters." });
    const db = readDatabase();
    if (db.users.some(user => user.email === email)) return sendJson(response, 409, { error: "That email already has a SkillQuest account. Try signing in." });
    const salt = crypto.randomBytes(16).toString("hex");
    const user = { id: crypto.randomUUID(), name, email, salt, passwordHash: await passwordKey(password, salt), createdAt: new Date().toISOString(), progress: null };
    db.users.push(user);
    writeDatabase(db);
    return sendJson(response, 201, { user: publicUser(user) }, issueSession(response, user.id));
  }

  if (route === "/api/login" && request.method === "POST") {
    const body = await readJson(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const db = readDatabase();
    const user = db.users.find(entry => entry.email === email);
    if (!user || !user.salt || !user.passwordHash) return sendJson(response, 401, { error: "Email or password is incorrect." });
    const candidate = await passwordKey(password, user.salt);
    const expectedBytes = Buffer.from(user.passwordHash, "hex");
    const candidateBytes = Buffer.from(candidate, "hex");
    if (expectedBytes.length !== candidateBytes.length || !crypto.timingSafeEqual(expectedBytes, candidateBytes)) {
      return sendJson(response, 401, { error: "Email or password is incorrect." });
    }
    return sendJson(response, 200, { user: publicUser(user) }, issueSession(response, user.id));
  }

  if (route === "/api/logout" && request.method === "POST") {
    const current = sessionFor(request);
    if (current) sessions.delete(current.token);
    return sendJson(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  if (route === "/api/me" && request.method === "GET") {
    const current = sessionFor(request);
    if (!current) return sendJson(response, 401, { error: "Sign in to open your account." });
    const user = readDatabase().users.find(entry => entry.id === current.session.userId);
    if (!user) return sendJson(response, 401, { error: "This account is no longer available." }, { "Set-Cookie": clearSessionCookie() });
    return sendJson(response, 200, { user: publicUser(user) });
  }

  if (route === "/api/progress" && request.method === "POST") {
    const current = sessionFor(request);
    if (!current) return sendJson(response, 401, { error: "Sign in again to save account progress." });
    const body = await readJson(request);
    if (!body.progress || typeof body.progress !== "object" || Array.isArray(body.progress)) return sendJson(response, 400, { error: "Progress data is missing." });
    const db = readDatabase();
    const user = db.users.find(entry => entry.id === current.session.userId);
    if (!user) return sendJson(response, 401, { error: "This account is no longer available." });
    user.progress = body.progress;
    writeDatabase(db);
    return sendJson(response, 200, { ok: true });
  }

  if (route.startsWith("/api/")) return sendJson(response, 404, { error: "API route not found." });
  return null;
}

function serveFile(request, response, requestedPath) {
  if (requestedPath === "/" ) requestedPath = "/index.html";
  if (requestedPath === "/data" || requestedPath.startsWith("/data/")) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    response.end("Forbidden");
    return;
  }
  const filePath = path.resolve(root, "." + requestedPath);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Forbidden"); return;
  }
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Not found"); return; }
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": stats.size, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store"
    });
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  let requestedPath;
  try { requestedPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Bad request"); return; }

  if (requestedPath.startsWith("/api/")) {
    Promise.resolve(handleApi(request, response, requestedPath)).then(result => {
      if (result === null && !response.writableEnded) sendJson(response, 405, { error: "Method not allowed." }, { Allow: "GET, POST" });
    }).catch(error => {
      if (!response.headersSent) sendJson(response, error.status || 500, { error: error.status ? error.message : "The local account service had a problem." });
      else response.destroy();
    });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET, HEAD" }); response.end("Method not allowed"); return;
  }
  serveFile(request, response, requestedPath);
});

server.listen(port, "127.0.0.1", () => {
  console.log("SkillQuest is running at http://localhost:" + port);
  console.log("Account database: " + databaseFile);
  console.log("Press Ctrl+C to stop.");
});
