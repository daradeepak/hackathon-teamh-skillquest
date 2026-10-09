# XPaddition app

See the [main README](../README.md) for the project overview, business case and team.

## Run it
- **Windows:** double-click `start-localhost.bat`.
- **macOS / Linux:** run `node server.js` in this folder.

Then open http://localhost:8000. Node.js is required; no npm packages are needed.

**Accounts and progress:**
- Choose **Sign in / create account** to make a local player account. Accounts and progress are stored in `data/accounts.json`, which is created on first use and not committed. The sign-in session lasts while the server runs.
- Use a made-up password. There is no email or password recovery.
- Guest progress is saved in the browser.

## What is playable
- **Game Map, Soft Skills:** six skills, 12 scenarios. No wrong answers; each choice awards XP to the skills it shows. The first choice per scenario counts.
- **Game Map, Technical Skills:** HTML, CSS and JavaScript. Each challenge has a short interactive lesson first (+10 XP once), then the challenge: live CSS editor, JS test runner, fill-in, matching, ordering, tap-the-bug. Score 60% to clear; improving your best score earns the rest of its XP.
- **Game Map, AI Code Check:** three levels (Read It, Check It, Direct It & Own It) with 9 games and 3 bosses, plus an AI Engineer teaser.
  - Win 3 games at "Okay" (60%+) to unlock a level's boss; beat the boss to open the next level.
  - Combos, mystery chests and 48-hour rematches.
- **Animated:**
  - JavaScript Trail: 12 lessons, unlocked in order, +20 XP each
  - Pip's Code Explainers: 14 concepts
  - DSA: Bubble Sort and Binary Search, +40 XP each
- **Leaderboard** (needs the server and sign-in), **Scoreboard**, **Profile** (name and photo), light/dark theme, sound toggle.
- The older Play Lab (daily quest, reels, story, badges) is hidden. To bring it back, set `LAB_ENABLED = true` in `developer-app.js` and restore its sidebar button.

## Files
| File | Purpose |
|---|---|
| `index.html` | Page shell and navigation |
| `developer-app.js` | Main app: views, Soft and Technical Skills, progress, accounts UI, leaderboard, profile, theme |
| `developer-games.js` | Soft Skills scenarios, Technical Skills challenges and lessons |
| `aicheck-app.js` | AI Code Check games, JavaScript Trail and Pip's explainers (plugs into `developer-app.js`) |
| `aicheck-games.js` | AI Code Check content |
| `developer-visuals.js` | Pip's animated explainers |
| `developer-js-lessons.js` | JavaScript Trail lessons |
| `bubble-sort.js` / `.css` | Bubble Sort lab (styles scoped under `.bs`) |
| `binary-search.js` / `.css` | Binary Search lab (styles scoped under `.bsr`) |
| `style.css`, `skills.css`, `theme.css`, `aicheck.css` | Styles |
| `server.js`, `start-localhost.bat` | Local web server and account API |
| `data/` | Local account database (runtime only) |

All content is fictional. This is a local prototype and is not intended for production use or real passwords.
