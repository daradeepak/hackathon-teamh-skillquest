"use strict";
/* PostgreSQL connection pool and schema migrations. */
const { Pool } = require("pg");

const MIGRATIONS = [
  /* 1: accounts and sessions */
  `CREATE TABLE users (
     id uuid PRIMARY KEY,
     name text NOT NULL,
     email text NOT NULL UNIQUE,
     salt text NOT NULL,
     password_hash text NOT NULL,
     avatar text NOT NULL DEFAULT '',
     progress jsonb,
     xp integer NOT NULL DEFAULT 0,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   );
   CREATE INDEX users_leaderboard_idx ON users (xp DESC, created_at ASC);
   CREATE TABLE sessions (
     token_hash text PRIMARY KEY,
     user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     expires_at timestamptz NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   );
   CREATE INDEX sessions_user_idx ON sessions (user_id);
   CREATE INDEX sessions_expires_idx ON sessions (expires_at);`
];

function createPool(connectionString) {
  if (!connectionString) throw new Error("DATABASE_URL is not set. Copy .env.example to .env and point it at your PostgreSQL database.");
  const ssl = process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : (process.env.DATABASE_SSL === "no-verify" ? { rejectUnauthorized: false } : undefined);
  const pool = new Pool({ connectionString, ssl, max: Number(process.env.DATABASE_POOL_SIZE) || 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
  pool.on("error", error => console.error(new Date().toISOString(), "database pool error", error.message));
  return pool;
}

/* Applies any migrations that haven't run yet. An advisory lock stops two instances migrating at once. */
async function migrate(pool) {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(727001)");
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    const { rows } = await client.query("SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations");
    for (let version = Number(rows[0].version) + 1; version <= MIGRATIONS.length; version++) {
      await client.query("BEGIN");
      try {
        await client.query(MIGRATIONS[version - 1]);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
        await client.query("COMMIT");
        console.log("Applied database migration " + version);
      } catch (error) { await client.query("ROLLBACK"); throw error; }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(727001)").catch(() => {});
    client.release();
  }
}

module.exports = { createPool, migrate };
