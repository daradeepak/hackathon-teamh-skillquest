"use strict";
/* One-time import of accounts from the old JSON file into PostgreSQL.
   Usage: node scripts/import-json-accounts.js [path/to/accounts.json]   (defaults to data/accounts.json)
   Existing emails are skipped, so it is safe to run more than once. Password hashes are copied as-is. */
require("../lib/env")();
const fs = require("node:fs");
const path = require("node:path");
const { createPool, migrate } = require("../lib/db");
const { sanitizeProgress } = require("../lib/progress");

(async () => {
  const file = process.argv[2] || path.join(__dirname, "..", "data", "accounts.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const pool = createPool(process.env.DATABASE_URL);
  await migrate(pool);
  let imported = 0, skipped = 0;
  for (const u of data.users || []) {
    if (!u.id || !u.email || !u.salt || !u.passwordHash) { skipped++; continue; }
    const progress = u.progress ? sanitizeProgress(u.progress) : null;
    const result = await pool.query(
      `INSERT INTO users (id, name, email, salt, password_hash, avatar, progress, xp, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::timestamptz, now())) ON CONFLICT DO NOTHING`,
      [u.id, String(u.name || "Player").slice(0, 40), String(u.email).toLowerCase(), u.salt, u.passwordHash, u.avatar || "", progress, progress ? progress.xp : 0, u.createdAt || null]);
    if (result.rowCount) imported++; else skipped++;
  }
  console.log("Imported " + imported + " account(s), skipped " + skipped + ".");
  await pool.end();
})().catch(error => { console.error(error.message); process.exit(1); });
