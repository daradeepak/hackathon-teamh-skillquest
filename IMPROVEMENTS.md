# SkillQuest: Improvement Plan for an AI Coding Agent

**Who this is for:** an AI coding agent (Claude Code, Cursor or similar) working in this repository, and the Team H members supervising it.

**How to use it:** give the agent this file and say *"Work through IMPROVEMENTS.md, Phase 1 first. Do one task at a time, follow the acceptance criteria, and run the checks before moving on."* Review and commit after each phase.

**Deadline:** build freeze **Saturday 10 October 2026, 12:00 PM**.

**Branches:** all code is merged into **`master`**, the team's working branch. Just before the freeze, a human copies `master` to `main` (see T4), because the handbook requires the final version on `main`.

---

## 1. Context

### The product
SkillQuest is a browser game that trains developers in the core skill of the AI era: **reading code they didn't write and checking whether AI-written code does what the requirement asked.** Players work through short mini-games, earn XP, unlock levels and fight boss rounds.

- **Target user:** Arjun, a junior JavaScript developer 2 months into his first job. He uses AI assistants daily but hasn't been taught to verify their output.
- **Tagline:** "AI writes the code. SkillQuest trains the developer who checks it."
- **Hackathon theme:** Quality Education, upskilling through non-traditional methods.

### How it's judged (Apty Hackathon 2026 handbook)
| Criterion | Weight | What it means for the code |
|---|---|---|
| Working demo | 30% | A judge must be able to use it **unaided**. It must not break. |
| Problem clarity and evidence | 25% | Content must feel realistic and be technically correct |
| Impact and feasibility | 15% | Show it can grow (role packs, more levels) |
| How the team used everyone | 15% | Every member commits under their own name |
| Presentation and business plan | 15% | README must include the business case |

### Hard rules from the handbook
- No production data, production credentials, API keys or customer data in the repo.
- The README must cover: **project overview, business case, key features, deployment, team.**
- The judging team must be able to read the repo at freeze, with the final version on `main`.

---

## 2. Current state (read this before changing anything)

### Run it
```bash
cd skillquest
node server.js        # then open http://localhost:8000
```
Windows: double-click `skillquest/start-localhost.bat`. There are no npm dependencies. Guest mode works without the server's API, using browser `localStorage`.

### File map
| File | Role | Loaded by `index.html`? |
|---|---|---|
| `skillquest/index.html` | Page shell: sidebar nav, topbar, `#app-main` root | — |
| `skillquest/style.css` (884 lines) | All styles | ✅ |
| `skillquest/developer-games.js` | **Game content.** `window.DEVQUEST_CONTENT = { coreLevels, aiTrack, games }` | ✅ |
| `skillquest/developer-visuals.js` | 14 animated concept explainers: `window.DEVQUEST_VISUALS.items` | ✅ |
| `skillquest/developer-app.js` (562 lines) | **All app logic**, in one IIFE: state, views, engines, scoring, account UI | ✅ |
| `skillquest/server.js` | Node HTTP server: static files + `/api/register`, `/api/login`, `/api/logout`, `/api/me`, `/api/progress`. Accounts are stored in `data/accounts.json` (scrypt-hashed passwords). | — |
| `skillquest/data/accounts.json` | Local account DB. **Currently committed to git. Must not be.** | — |
| `skillquest/app.js`, `skillquest/scenarios.js` | **Old, unused** 50-level workplace version | ❌ not loaded |
| `bubble-sort-visualizer.html` | Standalone bubble-sort animation, not linked from the app | — |
| `SkillQuest_Hackathon_Blueprint.md` | Earlier planning doc (workplace soft skills, 50 levels) | — |
| `README.md` (root) | **Empty**, only the title | — |

### Architecture of `developer-app.js`
- **State:** `state` (saved to `localStorage` under key `skillquest-devcore-v1`, or `skillquest-devcore-v1:account:<id>` when signed in; also POSTed to `/api/progress` when signed in). Shape: `{ name, xp, streak, combo, bestCombo, played[], best{gameId: score}, bosses[], chests[], rematchAt{}, sound, daily{date, actions[], claimed}, reels[], simulator{stage, score, done, last, choices[], reward} }`. A guest starts from `seed()`, a demo profile "Arjun" with 840 XP and Level 1 already cleared.
- **Per-game session:** `session = fresh()`, which is `{ choice, items[], lines[], verdicts{}, evidence{}, activeCriterion, scope, scopeTouched, reviews{}, code, tests, result }`.
- **Views:** a `view` string (`home | map | stats | lab | visuals | daily | reels | sim | badges | game`) and `draw()`, which re-renders `#app-main` with `innerHTML`. A single delegated `click` listener handles all `data-*` attributes.
- **Engines** are chosen by `game.kind`:

| `kind` | Render function | Scoring in `submit()` |
|---|---|---|
| `choice` | inline in `body()` | 100 if `session.choice === g.answer`, else 0 |
| `tapLine` | `codeLines()` | hits/badLines with penalties for wrong taps and misses |
| `multiSelect` | inline in `body()` | same formula against `g.answers` |
| `specCheck` | `specBody()` | `wins / 5 * 100`. **The 5 is hardcoded.** |
| `prReview` | `prBody()` | correct flags / issues |
| `codeFix` | `codeFixBody()` + `runCode()` (Web Worker, 1.5 s timeout) | 100 when all tests pass |

- **Progression:** a level's boss opens when 3 of its games have a best score ≥ 60 (`bossOpen`). Beating a boss (score ≥ 80) opens the next level (`levelOpen`). XP is awarded only on the **first** play: `round(g.xp * score / 100)` plus a combo bonus. A score below 60 schedules a 48-hour rematch.
- **Play Lab:** Knowledge Reels (`REELS`, 3 hardcoded in `developer-app.js`), a branching story (`SIM_STEPS`, one 3-scene story hardcoded in `developer-app.js`), a daily quest and badges.

### Content today
14 games (9 core games, 3 bosses, 2 AI-track teasers). **Each game has exactly one round.**

---

## 3. Ground rules for the agent

1. **Don't rewrite the app or change frameworks.** Keep vanilla JS, keep the IIFE, keep the existing visual design and CSS class names. Make focused edits.
2. **Add no client-side dependencies.** Plain browser JS only. (The optional AI tasks in Phase 6 may add one server-side package.)
3. **Escape all content inserted into HTML** with the existing `esc()` helper. Several places currently insert content without it (e.g. `step.text`, `step.speaker`, sim options, reel `lesson` / `options`, and `r.question` in `reelsPage()`). Fix any you touch.
4. **Content must be technically correct.** Every code snippet's answer must be verified by actually running it (see task T14). The judges are developers.
5. **Don't break saved progress.** If you change the state shape, migrate old saved state inside `load()` / `normalizedProgress()` rather than changing the storage key.
6. **Never commit secrets** (API keys, `.env`, `data/accounts.json`).
7. **Don't run `git push`, rename branches or force-push.** Humans handle git remote operations. Committing locally is fine if asked.
8. **After each task, open the app and click through the affected screens.** Check the browser console for errors.

---

## 4. Tasks

**Priority:** **P0** = must be done before freeze · **P1** = should do · **P2** = only if time allows. Estimated times assume an AI agent with human review.

### Phase 1: Repo and submission hygiene (P0, ~1.5 h)

#### T1. Stop committing account data
- Create a root `.gitignore` with: `skillquest/data/accounts.json`, `skillquest/data/*.tmp`, `.DS_Store`, `node_modules/`, `.env`, `.env.*`, `.vercel/`.
- Run `git rm --cached skillquest/data/accounts.json` (keeps the local file, stops tracking it).
- Add `skillquest/data/.gitkeep` so the folder exists. `server.js` already creates the file on first write.
- **Done when:** `git status` shows the file untracked, and the app still registers a new account locally.

#### T2. Remove dead code
- Delete `skillquest/app.js` and `skillquest/scenarios.js`, or move them to `archive/` if the team wants to keep them. Nothing in `index.html` loads them.
- Remove the external Instagram link in `renderVisualPlayer()` (`a.visual-reference-link`, which points to `instagram.com/reel/...`). Replace it with nothing, or a link to our own content. A third-party personal link shouldn't be in the demo.
- **Done when:** no 404s or console errors, and the visuals page still works.

#### T3. Write the root `README.md`
Required sections, in this order:
1. **Project overview:** the problem (AI writes code; developers must verify it; nobody trains that), the solution, and what was actually built.
2. **Key features:** the 3 levels and 14 games by engine, bosses, the code runner, Pip's animated explainers, Play Lab, XP/combos/rematches/chests, and local accounts.
3. **How to run it:** Node command, the Windows `.bat`, the macOS/Linux `start.sh` (see T19), and the deployed URL (placeholder until T18).
4. **Business case:**
   - **Use case:** engineering managers assign it to developers in their first 6 months.
   - **Go-to-market, first 100 users:** a pilot with new developers at Apty and Excers → one engineering college placement cell → a free "Daily Bug" shared on LinkedIn.
   - **Business model:** ₹499 per developer per month. Mini-games run in the browser at near-zero cost; only AI features would add API cost.
   - **12-month plan:** role packs (App Dev, Backend, AI Engineer, DevOps, QA) as content on the same engines; packs generated from a company's own postmortems; possible integration with digital adoption platforms like Apty.
   - Include a short **business model canvas** as a table.
5. **Team:** Vivek, Prem, Lalitha Akhila, Margarida, Sonali, Deepak Dara. Leave a role column for humans to fill in.
6. **Credits and licenses:** list every external source used for content (see section 6).
7. **Data and safety:** all content is fictional; no production data; passwords are scrypt-hashed locally; demo only.
- Move the useful parts of `skillquest/README.md` into the root README and keep `skillquest/README.md` short.
- **Done when:** all 7 sections exist and the run steps work on a fresh clone.

#### T4. Branches (humans do this, not the agent)
- **`master` is the team's working branch.** All work is merged into `master`. The agent works on `master` (or a short-lived branch merged back into `master`).
- **Merge teammates' branches into `master` before the agent starts.** `feature/bubble-sort-lab` has commits not yet on `master`, including a Soft Skills tab, a DSA section, hiding Play Lab, and replacing Animated Concepts. If those land, re-read section 2 against the new code before doing Phase 4. `hackathon-game` has only an old bubble-sort file.
- **Before the freeze**, the remote `main` must match `master`. It's GitHub's default branch, and the handbook says the final version must be on `main`. `main` is an ancestor of `master`, so a plain fast-forward works (no force): `git push origin master:main`. That also removes the broken `hackathon-teamh-skillquest` submodule entry that's on `main` today.
- Ask every team member to commit their own work under their own name.

### Phase 2: Engine fixes (P0, ~4 h)

#### T5. Multiple rounds per game (the most important engine change)
**Why:** each game has one question, so a judge finishes a game in one click.

- **New data shape:** each game keeps its metadata (`id, title, engine, level, kind, skill, xp, track?`) plus a `rounds: [...]` array. Each round holds the kind-specific fields (see section 5 for schemas). **Backward compatibility:** if a game has no `rounds`, treat the game object as a single round.
- Add `session.round` (index) and `session.roundScores` (array). The game screen shows a **"Round 2 of 4"** indicator.
- After each round: show a short per-round result (correct/incorrect, the round's `explanation`, and its concept line) with a **"Next round →"** button. After the final round: show the existing `resultCard()` with **score = average of round scores.**
- XP, combo, rematch, chest and boss logic in `finish()` stays as it is, but runs **once per game** on the final average.
- `canSubmit()`, `body()`, `specBody()`, `prBody()` and `codeFixBody()` must read from the **current round**, not from `g`.
- **Done when:** a game with 4 rounds plays all 4 in order, the final score is the average, and XP is awarded once.

#### T6. Shuffle answer options (choice engine)
**Why:** correct answers currently sit at fixed positions (mostly index 1). In some rounds the correct option is also clearly the longest.
- When a `choice` round opens, create a random permutation `session.order` and render the options in that order. Map the clicked position back to the original index before comparing with `round.answer`.
- Keep the order stable while the round is open; re-shuffle on replay.
- Also shuffle `multiSelect` items and `prReview` issues.
- **Done when:** replaying the same round shows different option orders and scoring stays correct.

#### T7. Move hardcoded content out of the render functions
These strings are hardcoded in `developer-app.js` and must come from round data:
| Function | Hardcoded now | Move to round field |
|---|---|---|
| `specBody()` | `"🎟️ SHOP-214 · ACCEPTANCE CRITERIA"`, `"Coupon at checkout"`, the ticket summary | `ticket: { id, title, summary }` |
| `prBody()` | `"TICKET SHOP-214"`, DevBot's opening line | `ticket: { id, text }`, `botOpener` |
| `codeFixBody()` | `"TICKET · COUPON-008"`, ticket text, the "Test cases" list | `ticket: { id, text }`; test list generated from `tests` |
| `codeFixBody()` / `runCode()` | assumes `fn(t.total, t.discount)` and prints `applyCoupon(` | `functionName`, and `tests: [{ args: [...], expected }]`. Call `fn(...t.args)`; compare with deep equality (`JSON.stringify`) so arrays and objects work. |
| `draw()` (sim) | `storyVisual` chosen by stage index | `visualId` on each sim scene |
| `simulatorPage()` | person emoji by index | `avatar` on each scene |

- **Done when:** a second Spec Check round with a different ticket shows its own ticket, and a Code Fix round with a 1-argument function works.

#### T8. Generalise Spec Check scoring
- Replace `score = Math.round(wins / 5 * 100)` with `wins / (requirements.length + 1)`.
- Add a round field `scopeCreep: string | null`. When it's `null`, the correct action is **not** flagging scope creep: flagging it is wrong, and leaving it unflagged earns the point. Hide the explanatory text when it's `null`, but keep the checkbox (label: "Flag scope creep: changes nobody asked for").
- **Done when:** rounds with 3, 4 and 5 requirements score correctly, and a round with no scope creep penalises a wrong flag.

#### T9. Make the streak real
**Bug:** `state.streak` is never updated. It stays at the seed value (5) forever.
- Add `state.lastPlayedDay` (from `dayKey()`). When a mission, reel or sim is completed: if the last day was yesterday, `streak += 1`; if it was today, no change; otherwise `streak = 1`.
- Migrate old saves: a missing `lastPlayedDay` is treated as today.
- **Done when:** changing the system date by one day and playing increments the streak.

#### T10. Small UI bugs
- `levelCard()`: the locked note always says "Beat the Level 2 boss". Make it "Beat the Level {l.id − 1} boss".
- `index.html`: the sidebar nav count `<span class="nav-count">3</span>` is hardcoded. Set it from the number of open levels in `syncAccountUi()` or `draw()`.
- **Mobile overlap:** at widths ≤ 620px, `.dev-speech` (Pip's "show me the spec!" bubble) overlaps the hero text. In the `@media (max-width: 620px)` block (around `style.css` line 529), hide `.dev-speech` and `.dev-float`, or move the bubble below the mascot.
- `gameTop()`: the progress meter uses `level * 33.33`. Change it to show round progress (`(round + 1) / rounds.length`).
- **Done when:** the app is checked at 375px, 768px and 1280px widths with no overlapping text.

#### T11. Hide sign-in when there's no server
**Why:** the deployed static version (T18) has no `/api`.
- In `initAccount()`, if `/api/me` returns 404 or the fetch fails, set `apiAvailable = false` and hide `#account-toggle`. Show "Guest mode · progress saved in this browser" in the footer.
- **Done when:** with `python3 -m http.server` (no API) there's no sign-in button and no console errors. With `node server.js`, sign-in works as before.

### Phase 3: Content (P0, ~4–5 h, can run in parallel with Phase 2)

#### T12. Add rounds
Target counts. **P0 games first.**
| Game id | Kind | Rounds now | Target | Priority |
|---|---|---|---|---|
| `predict-output` | choice | 1 | 5 | P0 |
| `spot-bug` | tapLine | 1 | 5 | P0 |
| `spec-check` | specCheck | 1 | 3 | P0 |
| `ai-code-audit` | tapLine | 1 | 3 | P0 |
| `explain-code` | choice | 1 | 3 | P1 |
| `tests-that-lie` | multiSelect | 1 | 3 | P1 |
| `security-spot` | tapLine | 1 | 3 | P1 |
| `spec-builder` | multiSelect | 1 | 3 | P1 |
| `debug-detective` | choice | 1 | 3 | P1 |
| `incident` (boss) | choice | 1 | 3 (a sequence: stabilise → communicate → prevent) | P1 |
| `code-fix` (boss) | codeFix | 1 | 2 | P2 |
| `review-pr` (boss) | prReview | 1 | 1, but 5–6 issues | P2 |
| AI teaser games | — | 1 each | 2 each | P2 |

**Content rules:**
- **JavaScript only** (ES2020+, runs in Node 20+ and modern browsers). Snippets ≤ 12 lines.
- **Frame it as AI-written code:** "Your AI assistant wrote this…"
- **One concept per round.** Use the curriculum in section 5.3.
- **All names, tickets and companies are fictional.** ₹ amounts are fine.
- **Make wrong options plausible.** Keep option lengths similar; the correct answer must not stand out by being longer or more detailed.
- Explanations: at most 2 sentences. Concept line: 1 sentence.
- At least one Spec Check round and one PR-review issue must be **correct as written**, so players learn not to reject everything.
- Mix difficulty within a game: round 1 easy, the last round hardest.
- **Every answer must be verified by running the code** (T14).

#### T13. Move Reels and Sim content into the content file
- Move `REELS` and `SIM_STEPS` from `developer-app.js` into `developer-games.js` as `DEVQUEST_CONTENT.reels` and `DEVQUEST_CONTENT.stories` (see T15 for the story shape).
- Add 3 more reels (6 total).
- **Done when:** `developer-app.js` contains no learning content, only logic.

#### T14. Content verifier script
Create `tools/check-content.js`, run with `node tools/check-content.js`. It loads `skillquest/developer-games.js` with `global.window = {}`, then:
1. **Schema check** for every game and round (required fields by kind; see section 5). Line indexes (`badLines`, `requirements[].line`) must be within `code.length`. `answer` must be within `options.length`. `answers` must reference existing item ids.
2. **Runnable check** for `choice` rounds with `runnable: true`: run `code.join("\n")` in Node's `vm` (5 s timeout). The value of the **last expression** must equal `options[answer]`, compared with `String(value)`, or `JSON.stringify(value)` for objects and arrays, ignoring all whitespace on both sides. If a snippet prints, capture `console.log` output instead (use the field `runMode: "lastValue" | "stdout"`).
3. **Code Fix check:** each `codeFix` round has a `solution` field (kept in content, never shown in the UI). The solution must pass all tests, and `starterCode` must fail at least one.
4. Prints a report and exits with code 1 on any failure.
- **Done when:** the script passes on all content. **Run it after every content change.**

### Phase 4: Soft-skills section (P1, ~5 h)

**Goal:** a second map, "Team Skills", next to "Developer Core", so the product trains the whole developer: the code and the conversation.

#### T15. Multiple branching stories
- Replace the single `SIM_STEPS` with `DEVQUEST_CONTENT.stories: [{ id, title, skill, level, icon, scenes: [{ speaker, avatar, text, visualId?, options: [{ text, points (0–2), feedback }] }] }]`. Options are shuffled on render (T6).
- `state.simulator` becomes per-story: `state.stories = { [storyId]: { stage, score, done, choices[], reward } }`. Migrate the old `state.simulator` into `state.stories["coupon-review"]`.
- Reward per story: `40 + score * 15` XP, on first completion only (same as today).
- The daily quest's "story" task is satisfied by finishing any story.

#### T16. Port the soft-skill quests from the earlier SkillQuest app
- **Source:** the earlier prototype (`SkillQuest.zip` → `SkillQuest/script.js`, `const QUESTS = [...]`, 19 quests, 56 steps). **A human must first copy that file into this repo** at `tools/legacy/skillquest-v1-script.js`.
- **Legacy format:** `{ id, level, title, skill, skillKey, xp, steps: [{ prompt, options: [{ text, score (0–10), feedback, skillBonus }] }] }`. Known legacy problems: the best option is always first, and every quest is linear.
- Write `tools/convert-legacy-quests.js` to map each step to a scene: `text ← prompt`, `options[].text ← text`, `feedback ← feedback`, `points ← score ≥ 9 ? 2 : (score ≥ 3 ? 1 : 0)`, `speaker ← "Teammate"` (to be edited later). Output JSON for review.
- **Rewrite these 9 into developer settings** (keep the structure, change the wording) and add them as stories:

| Team Skills level | Legacy quest → developer version | Skill |
|---|---|---|
| 1 · First Sprint | The First Week → *Your first sprint* | Time management |
| 1 | The Unclear Request → *A vague ticket* | Communication |
| 1 | The Meeting That Wanders → *The 40-minute stand-up* | Communication |
| 2 · Working Together | The Silent Teammate → *The quiet dev in code review* | Collaboration |
| 2 | The Feedback Loop → *Feedback on your PR* | Receiving feedback |
| 2 | The Difficult Conversation → *A teammate's buggy code* | Giving feedback |
| 3 · Under Pressure | The Overloaded Sprint | Prioritisation |
| 3 | The Hidden Dependency → *Another team blocks your release* | Problem solving |
| 3 | The Client Escalation → *Production bug, angry customer* | Decision making |

- Each story: 3 scenes, 3 options each, with ❌ / ⚠️ / ✅ quality spread across positions.

#### T17. Team Skills map and Non-technical skills
- On the map page, add a third tab, **"Team Skills 🤝"**, next to "Developer Core" and "AI Engineer". It shows the 3 Team Skills levels as level cards listing their stories. Level 2 unlocks after 2 Level 1 stories are done, and so on.
- **Scoreboard (`stats()`):** split "Skills you've practiced" into two groups:
  - **Technical:** Code comprehension, Spec verification, Debugging, Security
  - **Team:** Communication, Collaboration, Giving & receiving feedback, Prioritisation, Problem solving, Decision making. Each is computed from the best scores of the stories tagged with that skill. Show "Not played yet" when empty.
- **Done when:** a new player can complete a Team Skills story, see XP awarded once, and see the Team skill meter update.

### Phase 5: Deploy (P0, ~1 h)

#### T18. Static deployment (guest mode)
- Deploy the `skillquest/` folder as a static site on **Vercel** (project root: `skillquest`, no build command, output: `.`) or **GitHub Pages**. Accounts are disabled there by T11.
- Put the URL in the README.
- **Done when:** the URL opens on a phone and a laptop, a judge can play Level 1 to the Code Fix boss without signing in, and there are no console errors.

#### T19. macOS/Linux start script
- Add `skillquest/start.sh` (`#!/usr/bin/env sh`, `cd "$(dirname "$0")"`, check for `node`, then `node server.js`). Make it executable and document it in the README.

### Phase 6: Optional AI features (P2, only if Phases 1–5 are done)

#### T20. "Ask Pip" mentor chatbot
- A small chat panel on Home and on every game screen ("Ask Pip 🦊").
- **Server side only:** a route `/api/mentor` (in `server.js`, plus a Vercel function `skillquest/api/mentor.js` for the deployed site) that calls Claude through the **official Anthropic SDK** (`@anthropic-ai/sdk`). Read the API key from the environment variable `ANTHROPIC_API_KEY`. **Never put the key in client code or the repo.** Use a key bought with the team budget, not a production key.
- **Model:** `claude-opus-5-5`. Keep responses short (a few sentences).
- **System prompt rules:**
  - During an unanswered round, give **hints, never the answer or the line number**.
  - After the round, explain the concept.
  - Stay on JavaScript, code review and teamwork topics.
- **Request body:** `{ gameId, roundIndex, answered: boolean, question }`. The server looks up the round content itself; never trust content sent by the client.
- Add a simple rate limit (e.g. 20 messages per session per hour). Disable the chat during boss rounds.
- **Fallback:** if there's no key or the call fails, answer from the round's `concept` and `explanation` fields, so the demo never breaks.

#### T21. Real AI in the "Review the AI's PR" boss
Only after T20 works. The player writes free-text review comments; Claude plays DevBot and scores the review with a JSON rubric (issues caught, false alarms, clarity). Keep the scripted version as the fallback.

### Phase 7: Polish (P2)
- **T22.** Show Levels 4–10 on the Developer Core map as locked tiles with topic names: Async & Promises, Event Loop, DOM & Events, APIs & Errors, TypeScript, Testing, Security & Performance. This shows the roadmap.
- **T23.** First-visit guided tour (4 steps: Home → Game map → a game → Scoreboard), shown once. Store a flag in `localStorage`.
- **T24.** "Exam Mode lite" on boss rounds: require fullscreen; detect tab switches (`visibilitychange`) with a warning, auto-submitting on the 3rd switch; block copy/paste/right-click inside the boss screen; show an integrity note on the result card. Label it as integrity signals, not cheat-proof.
- **T25.** Link `bubble-sort-visualizer.html` from the Play Lab as a "Bonus visualiser", or remove it.

---

## 5. Content schemas and curriculum

### 5.1 Round schemas (inside `games[id].rounds[]`)
```js
// choice  (Predict the Output, Explain This Code, Debug Detective, Incident, Prompt Fix)
{ intro?: string, code?: string[], question: string, options: string[], answer: number,
  runnable?: boolean, runMode?: "lastValue" | "stdout",
  explanation: string, concept: string }

// tapLine  (Spot the Bug, AI Code Audit, Security Spot)
{ intro: string, code: string[], badLines: number[], explanation: string, concept: string }

// multiSelect  (Tests That Lie, Spec Builder, Hallucination Hunter)
{ intro: string, items: [{ id: string, title: string, detail: string }], answers: string[],
  explanation: string, concept: string }

// specCheck
{ ticket: { id: string, title: string, summary: string },
  requirements: [{ text: string, met: boolean, line: number }],
  code: string[], scopeCreep: string | null, explanation: string, concept: string }

// prReview (boss)
{ ticket: { id: string, text: string }, botOpener: string,
  issues: [{ id: string, title: string, shouldFlag: boolean, reply: string }], concept: string }

// codeFix (boss)
{ ticket: { id: string, text: string }, functionName: string, starterCode: string,
  solution: string /* hidden; used only by tools/check-content.js */,
  tests: [{ args: any[], expected: any }], explanation: string, concept: string }
```

### 5.2 Example: a new `predict-output` round
```js
{
  intro: "Your AI assistant sorted some prices. What does the last line print?",
  code: ["const prices = [100, 25, 3];", "prices.sort();", "prices"],
  question: "What is the value of prices?",
  options: ["[3, 25, 100]", "[100, 25, 3]", "[25, 3, 100]", "TypeError"],
  answer: 1, runnable: true, runMode: "lastValue",
  explanation: "Without a compare function, sort() compares values as strings, and \"100\" < \"25\" < \"3\", so the order doesn't change.",
  concept: "Always pass a compare function when sorting numbers: sort((a, b) => a - b)."
}
```
Verified in Node: `[100, 25, 3].sort()` returns `[100, 25, 3]`. The verifier (T14) should compare values with whitespace removed, so `"[100, 25, 3]"` matches `JSON.stringify(value)` = `"[100,25,3]"`.

### 5.3 Curriculum: what each round should teach
**The 8 ways AI code goes wrong** (Spec Check, AI Code Audit, PR review, Tests That Lie):
1. Missing requirement
2. Misread requirement (e.g. `>` vs `>=`)
3. Scope creep (unrequested refactors or renames)
4. Ignored edge case (empty, `null`, 0, negative, duplicates, time zones)
5. Invented API (a function or option that doesn't exist)
6. Security hole (injection, leaked secret, missing permission check)
7. Tests that pass but don't check the requirement
8. **Actually correct.** Approve it.

**JavaScript concepts** (Predict the Output, Spot the Bug, Explain This Code): `==` vs `===` and coercion · `typeof null` · `sort()` without a comparator · `0.1 + 0.2` · closures in loops (`var` vs `let`) · mutation vs copy (spread, shallow copy) · `map` / `filter` / `reduce` · missing `await` · `forEach` with `async` · `fetch` doesn't reject on HTTP 404 · `this` lost in callbacks · Date months start at 0 · off-by-one loops · optional chaining and `??` vs `||`.

---

## 6. Content sources (credit them in the README)
| Source | Use | License |
|---|---|---|
| lydiahallie/javascript-questions | Predict the Output ideas | MIT |
| denysdovhan/wtfjs | Tricky JS behaviour | WTFPL |
| leonardomso/33-js-concepts | Concept list and order | MIT |
| ryanmcdermott/clean-code-javascript | Bad vs good code for Spot the Bug / Spec Check | MIT |
| MDN Web Docs | Concept explanations (code samples are CC0, prose is CC-BY-SA) | CC0 / CC-BY-SA |
| google/eng-practices | Code review guidance for review rounds | CC-BY 3.0 |
| OWASP Cheat Sheet Series | Security rounds (reword; share-alike) | CC-BY-SA 4.0 |
| PagerDuty Incident Response docs | Incident boss and on-call stories | Apache 2.0 |
| GitLab Handbook | Team Skills stories (reword; share-alike) | CC-BY-SA 4.0 |

**Rewrite** content in our own words and framing. Don't copy long passages. **Don't use:** You Don't Know JS (CC BY-NC-ND), or any paid course content.

---

## 7. Definition of done (demo checklist)

Run through all of these on the **deployed URL**, in a fresh private browser window:

- [ ] Home loads with no console errors, on both phone and laptop widths.
- [ ] Level 1: each game has several rounds; options are shuffled; the final score is the average; XP is awarded once.
- [ ] Code Fix boss: a correct fix passes all tests; an infinite loop times out without freezing the page.
- [ ] Level 2: Spec Check has 3 rounds with different tickets; the scope-creep flag works both ways.
- [ ] Streak increments on a new day.
- [ ] Team Skills tab: complete one story; the Team skill meter updates (P1).
- [ ] No sign-in button on the static deploy; sign-in works on `node server.js`.
- [ ] `node tools/check-content.js` passes.
- [ ] README has all 7 sections and the live URL.
- [ ] `data/accounts.json` is not in git; there are no secrets in the repo.
- [ ] All work is merged into `master`, and `main` has been updated to match it (`git push origin master:main`); every team member has commits.

## 8. Out of scope (put on the "What's next" slide, not in code)
- Levels 4–10 with full content
- Real databases or hosted accounts
- Blocking other apps
- Voice
- A mobile app
- Leaderboards across companies
- Manager analytics dashboards
- More role packs beyond the AI Engineer teaser
