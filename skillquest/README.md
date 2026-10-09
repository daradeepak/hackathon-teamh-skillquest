# SkillQuest — soft-skills learning game

A playful, dependency-free prototype. Players practise short workplace scenarios, collect XP, and unlock a challenge at the end of each level.

## Run locally on Windows

1. Install Node.js if it is not already installed.
2. Double-click `start-localhost.bat` in this folder.
3. Open [http://localhost:8000](http://localhost:8000).
4. Keep the terminal window open while playing. Press `Ctrl+C` there to stop the server.

No npm packages are needed. Choose **Sign in / create account** to make a local player account. The demo stores accounts and game progress in `data/accounts.json`, and keeps the sign-in session in this running server. Use a made-up password for this prototype; there is no email service or password recovery. Guest progress is still saved in the browser. The reset button beside the profile resets the active player's game progress.

## What is playable

- Soft-skills missions use two engines: pick the best response, and pick every good move. A challenge unlocks after both missions in a level reach an Okay score; passing it opens the next level.

- Game map has two sections: **Soft Skills** (three levels: Say It Clearly, Work Together, Own It. Each has two missions and a challenge, plus the Choose Your Move workplace story) and **DSA** (Bubble Sort, which opens the animated visualizer).
- Animated → DSA → Bubble Sort: a 3D step-by-step visualizer with play, pause, step, scrub, speed control and custom arrays. Watching every step earns +40 XP and the Sort Sprinter badge once.
- XP, combos, rematches, the scoreboard, sound toggle, and a mystery-chest reward.
- Local account registration, sign-in, sign-out, password hashing, and server-backed progress saving.
- Play Lab (temporarily hidden; set `LAB_ENABLED = true` in `developer-app.js` and restore its sidebar button and home banner to bring it back) adds a daily three-part quest, three flip-to-reveal Knowledge Reels with quick checks, a branching workplace story, and an unlockable badge shelf.
- Complete a mission, collect a reel, and finish the story to unlock the daily +80 XP reward. Reel, story, quest, and badge progress saves in this browser.

Everything is fictional demo content. Accounts are stored in a local JSON file, not a hosted service. This is a localhost prototype and is not intended for production or real passwords.

## Project files

- `index.html` — page shell and navigation
- `style.css` — responsive styling
- `developer-games.js` — soft-skills mission data and levels
- `developer-app.js` — navigation, game rules, feedback, and local progress
- `bubble-sort.js` and `bubble-sort.css` — the Bubble Sort Lab (styles are scoped under `.bs`)
- `server.js` and `start-localhost.bat` — local web server and account API
- `data/accounts.json` — local dummy account database (created or updated when accounts are used)
