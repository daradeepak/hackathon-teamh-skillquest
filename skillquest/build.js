"use strict";

/* Copy only the top-level files the app's static server exposes. */
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const output = path.join(root, "dist");
const publicExtensions = new Set([".html", ".css", ".js", ".svg", ".png", ".jpg", ".jpeg", ".ico", ".webp"]);
const privateFiles = new Set(["server.js", "build.js"]);

fs.mkdirSync(output, { recursive: true });
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isFile() || privateFiles.has(entry.name) || !publicExtensions.has(path.extname(entry.name).toLowerCase())) continue;
  fs.copyFileSync(path.join(root, entry.name), path.join(output, entry.name));
}
