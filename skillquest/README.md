# XPaddition — soft skills and technical skills game

A playful, dependency-free prototype. Players practise short workplace scenarios, collect XP, and unlock a challenge at the end of each level.

## Run locally on Windows

1. Install Node.js if it is not already installed.
2. Double-click `start-localhost.bat` in this folder.
3. Open [http://localhost:8000](http://localhost:8000).
4. Keep the terminal window open while playing. Press `Ctrl+C` there to stop the server.

No npm packages are needed. Choose **Sign in / create account** to make a local player account. The demo stores accounts and game progress in `data/accounts.json`, and keeps the sign-in session in this running server. Use a made-up password for this prototype; there is no email service or password recovery. Guest progress is still saved in the browser. The reset button beside the profile resets the active player's game progress.

## What is playable

- Game Map (sidebar) has two tabs. **Soft Skills** is a capability map with a player level and six individual skills (Leadership, Communication, Problem Solving, Collaboration, Time Management, Decision Making). Its scenarios have no right or wrong answers: the approach a player chooses awards XP to the skills it shows, and the first choice per scenario counts. **Technical Skills** covers HTML, CSS and JavaScript with 12 interactive challenges: a live CSS editor with a preview and goal checklist, a JavaScript editor that runs tests in a time-limited Web Worker, type-in blanks, matching pairs, putting pieces in order, and tapping buggy lines. Score 60% or more to clear a challenge; improving your best score earns the rest of its XP.
- Leaderboard (sidebar) ranks registered players by XP and highlights you. Scoreboard keeps your personal stats.
- Profile: click your avatar to edit your display name and upload a photo (resized in the browser, saved to your account, or kept on this device as a guest).
- Light/Dark theme switch in the top bar; the choice is remembered.
- Play Lab with the Bubble Sort visualizer is hidden for now. Its code stays behind `LAB_ENABLED` in `developer-app.js` with no link in the UI.
- XP, player levels, a scoreboard, and a sound toggle.
- Local account registration, sign-in, sign-out, password hashing, and server-backed progress saving.
- The older lab (daily quest, reels, story and badges; temporarily hidden; set `LAB_ENABLED = true` in `developer-app.js` and restore its sidebar button and home banner to bring it back) adds a daily three-part quest, three flip-to-reveal Knowledge Reels with quick checks, a branching workplace story, and an unlockable badge shelf.
- Complete a mission, collect a reel, and finish the story to unlock the daily +80 XP reward. Reel, story, quest, and badge progress saves in this browser.

Everything is fictional demo content. Accounts are stored in a local JSON file, not a hosted service. This is a localhost prototype and is not intended for production or real passwords.

## Project files

- `index.html` — page shell and navigation
- `style.css` — responsive styling
- `developer-games.js` — the soft skills and scenarios (options and the XP each awards), plus the technical skills and challenges
- `skills.css` — styles for the Game Map and scenarios
- `theme.css` — logo animation, dark mode, avatars, leaderboard and profile styles
- `developer-app.js` — navigation, game rules, feedback, and local progress
- `bubble-sort.js` and `bubble-sort.css` — the Bubble Sort Lab (styles are scoped under `.bs`)
- `server.js` and `start-localhost.bat` — local web server and account API
- `data/accounts.json` — local dummy account database (created or updated when accounts are used)
