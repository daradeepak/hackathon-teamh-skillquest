# XPedition app

The playable app and its server. See the [root README](../README.md) for the overview, features, deployment and business case.

## Run and test

```bash
cp .env.example .env   # point DATABASE_URL at PostgreSQL
npm install
npm start              # http://localhost:8000
npm test               # API, security and content tests (needs a test database)
```

## File map

| File | Purpose |
|---|---|
| `index.html` | Page shell: sidebar, top bar, content root |
| `developer-app.js` | All app logic: state, views, lesson and challenge engines, scoring, accounts, leaderboard, profile, theme |
| `developer-games.js` | Content: skills, scenarios, challenges and lessons (with the XP each option awards) |
| `developer-js-lessons.js` | The 12-lesson JavaScript learn trail |
| `bubble-sort.js` / `.css`, `binary-search.js` / `.css` | The two DSA labs under Play Lab |
| `runner-worker.js` | Runs learner JavaScript against tests in a Web Worker (no network access) |
| `theme-init.js` | Applies the saved light/dark theme before first paint |
| `style.css`, `skills.css`, `theme.css` | Styles (the labs scope theirs under `.bs` and `.bsr`) |
| `server.js` | Static files plus the API: register, login, logout, me, progress, profile, leaderboard, health |
| `lib/db.js` | PostgreSQL pool and versioned schema migrations |
| `lib/progress.js` | Validates and caps saved progress against the game content |
| `lib/env.js` | Loads settings from `.env` |
| `scripts/import-json-accounts.js` | One-time import of the old JSON accounts into PostgreSQL |
| `.env.example` | All configuration settings, with comments |
| `test/` | Node test suite (`node --test`) |
| `start-localhost.bat`, `start.sh` | One-click start for Windows and macOS/Linux |
| `data/` | Old JSON account file, only used by the import script (git-ignored) |

## Adding content

Scenarios, challenges and lessons are plain objects in `developer-games.js`. Run `npm test` after editing: it checks that ids are unique, every challenge has a lesson, XP goes to real skills, orderings are valid and the JavaScript challenges can be solved.
