"use strict";
/* Loads KEY=VALUE pairs from a .env file next to server.js. Real environment variables always win. */
const fs = require("node:fs");
const path = require("node:path");

module.exports = function loadEnv(file = path.join(__dirname, "..", ".env")) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
};
