# XPaddition (SkillQuest): Improvement Plan for an AI Coding Agent

**Version 2, updated 9 October 2026, evening.** Checked against `main` at commit `10f974c` and `master` at commit `453c7e8`.

**Who this is for:** an AI coding agent (Claude Code, Cursor or similar) working in this repository, and the Team H members supervising it.

**How to use it:** give the agent this file and say *"Work through IMPROVEMENTS.md in order, starting with Phase 0. Do one task at a time, follow the acceptance criteria, and run the checks before moving on."* Review and commit after each phase.

**Deadline:** build freeze **Saturday 10 October 2026, 12:00 PM**.

**Branch rule:** `main` is the team's branch (GitHub default; the handbook requires the final version there). Do each task on a short branch and merge it into `main` with a pull request. **Stop pushing to `master`** once Phase 0 is done.

---

## 0. What changed since version 1 of this file

Version 1 described the earlier "Developer Core" app. Since then, two teammates have built two different directions on two branches:

| | **`main`** (Dara Deepak, PR #4 "post-push XPaddition updates") | **`master`** (tarun-apty) |
|---|---|---|
| Brand | XPaddition | XPaddition |
| Learning content | **AI Code Check games** (the original Developer Core): 3 levels, 9 games + 3 bosses, AI Engineer teaser (2 games). **JavaScript Trail**: 12 animated JS lessons. Pip's 14 animated explainers. | **Soft Skills**: 6 skills, 12 scenarios with "no wrong answer" XP. **Technical Skills**: HTML/CSS/JS, 12 challenges across 6 game types, with a visual lesson before each. **Animated → DSA**: Bubble Sort and Binary Search labs. |
| Platform | Leaderboard, theme toggle, profile editor, all added as **separate scripts that patch the page after it renders** (`MutationObserver`) | Leaderboard, theme switch, profile with photo (`/api/profile`), player levels. All built into `developer-app.js`. |
| Play Lab | Hidden by a patch script | Hidden by a flag (`LAB_ENABLED = false`) |
| Missing | Soft Skills, Technical Skills, DSA labs | AI Code Check games (removed in commit `ea6b2a7`), JavaScript Trail |

**Each branch is missing the other's work.** `main` has 2 commits that `master` lacks; `master` has 4 that `main` lacks. Commit `c1a164a` on `main` replaced `master`'s Soft and Technical Skills content. Nothing is lost, since both versions are in Git history, but they must be combined before anything else (Phase 0).

### Status of version 1 tasks
Only the `main` branch fix was done. Everything else is still open and is carried into this version, rewritten for the current code: `.gitignore`, README, rounds, shuffling, hardcoded tickets, Spec Check scoring, streak, UI bugs, guest mode, content checker, deploy, start script, and the optional AI features.

---

## 1. Context

### The product
XPaddition is a browser game that helps developers grow **technical skills and soft skills** through short, playable challenges, with XP, levels, a leaderboard and animated lessons.

**Its differentiator** (what no free tool does): the **AI Code Check** section, which trains the core skill of the AI era. That skill is **reading code you didn't write and checking whether AI-written code does what the requirement asked.**

- **Target user:** Arjun, a junior JavaScript developer 2 months into his first job. He uses AI assistants daily but was never taught to verify their output, and he's never practised workplace situations.
- **Pitch line:** "Learn the code, check the AI, and grow the people skills, one short game at a time."
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
- The final version must be on `main` at freeze, readable by the judges.

---

## 2. Current code (read before changing anything)

### Run it
```bash
cd skillquest
node server.js        # then open http://localhost:8000
```
Windows: `skillquest/start-localhost.bat`. There are no npm dependencies.

### Files on `main`
| File | Role | Loaded by `index.html`? |
|---|---|---|
| `developer-games.js` (147 lines) | `window.DEVQUEST_CONTENT = { coreLevels, aiTrack, games }`: the 14 AI Code Check games, **1 round each** | ✅ |
| `developer-visuals.js` | `window.DEVQUEST_VISUALS.items`: 14 animated explainers | ✅ |
| `developer-js-lessons.js` | `window.DEVQUEST_JS_LESSONS.lessons`: 12 JS Trail lessons in 3 worlds (First Steps, Logic Land, Web Workshop) | ✅ |
| `developer-app.js` (631 lines) | All game logic: state, views (`home, map, stats, lab, visuals, daily, reels, sim, badges, game, leaderboard, cinema`), engines (`choice, tapLine, multiSelect, specCheck, prReview, codeFix`), scoring, accounts | ✅ |
| `developer-profile-editor.js` (332 lines) | Profile name/avatar editor; saves to `localStorage` key `skillquest.profile.v1` (**not** to the account) | ✅ |
| `developer-leaderboard.js` | Renders the leaderboard from `/api/leaderboard` (sign-in required) | ✅ |
| `developer-theme-toggle.js` | Light/dark switch; `localStorage` key `skillquest.theme.v1` | ✅ |
| `developer-map-compact.js` | Injects CSS and turns map levels into accordions, via `MutationObserver` | ✅ |
| `developer-remove-play-lab.js` | **Deletes Play Lab buttons from the page after rendering**, via `MutationObserver` | ✅ |
| `developer-reel-embed.js` | **Deletes the Instagram reel link after rendering**, via `MutationObserver` | ✅ |
| `developer-remove-cinema.js` | Deletes JS Cinema entries via `MutationObserver` | ❌ **not loaded** (dead file) |
| `app.js`, `scenarios.js` | Old 50-level workplace version | ❌ **not loaded** (dead files) |
| `server.js` | Static files + `/api/register, /login, /logout, /me, /progress, /leaderboard`; scrypt-hashed passwords in `data/accounts.json` | — |
| `data/accounts.json` | Local account DB. **Still tracked in Git.** | — |

### Files on `master` (that differ)
| File | Role |
|---|---|
| `developer-games.js` | `window.DEVQUEST_CONTENT = { skills[6], scenarios[12], techSkills[3], challenges[12], lessons{12} }` |
| `developer-app.js` (855 lines) | Views: `home, map, techskill, anim, dsa, sort, search, leaderboard, stats, game` (+ hidden Play Lab views). Player levels (`PLAYER_LEV…`), profile with photo, theme, leaderboard, and challenge engines `tapLine, arrange, match, fill, live (CSS editor), run (JS tests in a Worker)`, each with a lesson first (`lesson-play/next/prev/done`). Soft-skill scenarios award XP to skills through `option.xp = { skillId: points }`. |
| `bubble-sort.js/.css`, `binary-search.js/.css` | DSA labs mounted in Animated → DSA |
| `skills.css`, `theme.css` | Styles for skills pages and dark theme |
| `server.js` | Same as `main`, plus `/api/profile` (photo) |
| Root `bubble-sort-visualizer.html`, `binary-search-visualizer.html` | Standalone copies of the labs |

### Known problems in the current code (verified)
1. **All learning content is single-round.** Each AI game, tech challenge and soft scenario is one question.
2. **No answer shuffling anywhere** (no `Math.random`/shuffle in game logic). In the AI games the correct option is usually index 1. In some rounds it's also visibly the longest option.
3. **AI games have hardcoded text** in `developer-app.js` (`main`): `"SHOP-214"`, `"COUPON-008"`, DevBot's opening line, and the Code Fix runner calls `fn(t.total, t.discount)`.
4. **Spec Check scoring** divides by a fixed 5 (`wins / 5`).
5. **Streak never changes** (`main`: fixed at the seed value of 5; `master`: not tracked).
6. **`main` patches its own UI after rendering** with 4 `MutationObserver` scripts that delete or rewrite elements. This is fragile: it can cause flicker and endless re-checks, and it hides bugs instead of fixing them.
7. **Leaderboard and profile photo need the Node server and a signed-in account.** On a static deployment they will show errors.
8. **Root `README.md` is empty.** `skillquest/README.md` describes only `main`'s features.
9. **No `.gitignore`.** `data/accounts.json` is committed with test accounts.
10. `index.html` on `main` has a hardcoded nav count (`<span class="nav-count">3</span>`). The mobile speech bubble (`.dev-speech`) overlaps the hero text at widths ≤ 620px.

---

## 3. Ground rules for the agent
1. **Don't rewrite from scratch or change frameworks.** Vanilla JS, no build step, keep the XPaddition look (Fredoka/Nunito fonts, existing CSS classes).
2. **Add no client-side dependencies.** (Optional AI tasks may add one server-side package.)
3. **Fix the render code instead of patching the DOM afterwards.** Don't add new `MutationObserver` "remove/rename" scripts.
4. **Escape all content inserted into HTML** with the app's `esc()` helper.
5. **Content must be technically correct.** Verify every code answer by running it (T13).
6. **Don't break saved progress.** When the state shape changes, migrate it inside the existing `normalize()`/`normalizedProgress()` function. Don't silently change storage keys.
7. **Never commit secrets** (API keys, `.env`, `data/accounts.json`).
8. **Don't push, force-push, delete branches or merge pull requests.** Humans do that. Committing locally on a task branch is fine.
9. **After each task, open the app and click through the affected screens** at 375px and 1280px widths. Check the browser console for errors.

---

## 4. Tasks
**Priority:** **P0** = must be done before freeze · **P1** = should do · **P2** = only if time allows. Times assume an AI agent with human review.

### Phase 0: Combine the two versions into one app (P0, blocking, ~4–6 h)

#### T0. One app, three skill areas
**The team must agree on this before the agent starts.** Recommended target structure:

| Sidebar / Game Map section | Content | Comes from |
|---|---|---|
| **Technical Skills** | HTML / CSS / JavaScript challenges with lessons | `master` |
| **AI Code Check** (the differentiator) | 3 levels (Read It, Check It, Direct It & Own It) + bosses, AI Engineer teaser | `main` |
| **Soft Skills** | 6 skills, scenarios | `master` |
| **Animated** | JavaScript Trail (12 lessons) + DSA (Bubble Sort, Binary Search) + Pip's explainers | both |
| Leaderboard, Scoreboard, Profile, Theme | — | `master` (built in, no patch scripts) |

**Recommended approach: use `master` as the base and port `main`'s unique parts into it.** `master` already has the full platform (sections, player levels, profile with photo, leaderboard, theme, lessons, DSA) without patch scripts. `main`'s unique parts are mostly content plus the AI-game engines.

Steps:
1. Create branch `combine-versions` from `origin/master`.
2. **Data:** add `main`'s AI games under a new global so they don't clash with `master`'s `DEVQUEST_CONTENT`. Put `window.DEVQUEST_AICHECK = { levels: <main coreLevels>, aiTrack, games }` in a new file `aicheck-games.js`. Copy `developer-visuals.js` and `developer-js-lessons.js` from `main` unchanged.
3. **Engines:** port from `main`'s `developer-app.js` the render and scoring for `specCheck`, `prReview`, `codeFix`, `multiSelect`, the AI-game `choice`, and `main`'s `tapLine` variant (multiple bad lines), plus the level/boss rules (`levelOpen`, `bossOpen`, `okayCount`, `nextGame`), the result card, the mystery chest and rematch. Where `master` already has an equivalent engine (`tapLine`, `run` for code tests), reuse it rather than duplicating, as long as scoring stays the same. Prefix ported functions or put them in an `aiCheck` namespace to avoid name clashes.
4. **Map:** add an "AI Code Check" tab next to Technical Skills and Soft Skills in `trackTabs()`, rendering the 3 level cards with games and bosses.
5. **Animated page:** add "JavaScript Trail" (12 lessons, sequential unlock, +20 XP each, from `main`) and "Pip's explainers" alongside DSA.
6. **State:** add `aicheck: { played[], best{}, bosses[], chests[], rematchAt{} }` and `jsLessons[]` to `master`'s `blankProgress()`, and migrate them in `normalize()`. **XP is shared** across all sections. Skills: AI-game skills map onto `master`'s technical skills (`javascript`), or add one skill, `ai-review` ("AI Code Review"), to `TECH`.
7. **Don't port** `main`'s patch scripts (`developer-remove-play-lab.js`, `developer-reel-embed.js`, `developer-remove-cinema.js`, `developer-map-compact.js`), its separate `developer-profile-editor.js`, `developer-leaderboard.js` or `developer-theme-toggle.js`. `master` already has these features built in. If the team likes the accordion map from `developer-map-compact.js`, add it to `map()` directly.
8. **Don't port** the Instagram reel link.
9. Open a pull request `combine-versions → main`. A human reviews it, merges it, and tells everyone to use `main` only.

**Done when:**
- All three sections plus Animated are playable from the Game Map.
- XP from any section updates the same total and leaderboard.
- An old `main` save and an old `master` save both load without errors.
- No `MutationObserver` patch scripts are loaded.
- No console errors.

> If the team instead decides to drop one direction, do only steps 1 and 9 for the chosen branch, and record the decision in the README. But keep the AI Code Check games if at all possible: they're the main differentiator in the pitch.

### Phase 1: Repo and submission hygiene (P0, ~1.5 h)

#### T1. Stop committing account data
- Add a root `.gitignore`: `skillquest/data/accounts.json`, `skillquest/data/*.tmp`, `.DS_Store`, `node_modules/`, `.env`, `.env.*`, `.vercel/`.
- `git rm --cached skillquest/data/accounts.json`, and add `skillquest/data/.gitkeep`. `server.js` creates the file on first write.
- **Done when:** the file is untracked and registering a new account still works locally.

#### T2. Remove dead and duplicate files
- Delete `skillquest/app.js`, `skillquest/scenarios.js` and `skillquest/developer-remove-cinema.js`, plus any patch scripts made unnecessary by T0.
- Root `bubble-sort-visualizer.html` and `binary-search-visualizer.html` duplicate the in-app labs. Move them to `archive/` or delete them.
- **Done when:** no 404s in the network tab and no console errors.

#### T3. Write the root `README.md`
Sections, in this order:
1. **Project overview:** the problem (courses and quizzes don't build practical skill; AI now writes code that developers must verify), the solution, and **what was actually built**.
2. **Key features:** Technical Skills (game types), AI Code Check (levels, bosses, code runner), Soft Skills, Animated (JS Trail, DSA labs), XP/levels/leaderboard/profile/theme, local accounts.
3. **How to run it:** Node command, Windows `.bat`, macOS/Linux `start.sh` (T15), and the deployed URL (T14).
4. **Business case:**
   - **Use case:** engineering managers or L&D assign it to developers in their first 6 months.
   - **First 100 users:** a pilot with new developers at Apty and Excers → one engineering college placement cell → a free "Daily Bug" challenge shared on LinkedIn.
   - **Business model:** ₹499 per developer per month. Games run in the browser at near-zero cost.
   - **12-month plan:** role packs (App Dev, Backend, AI Engineer, DevOps, QA) as content on the same engines; packs built from a company's own postmortems; possible integration with digital adoption platforms like Apty.
   - A short **business model canvas** as a table.
5. **Team:** Vivek, Prem, Lalitha Akhila, Margarida, Sonali, Deepak Dara (leave a role column for humans to fill in).
6. **Credits and licenses** (section 6).
7. **Data and safety:** fictional content; no production data; passwords scrypt-hashed locally; demo only.
- Shorten `skillquest/README.md` to run instructions and a file list that match the combined app.

#### T4. Branches (humans only)
After T0 is merged: everyone uses `main`. Old branches (`master`, `feature/*`, `add-*`, `hackathon-game`) can stay for history. Each team member should commit their own work under their own name.

### Phase 2: Engine fixes (P0, ~4 h)

#### T5. Multiple rounds per challenge
**Why:** every challenge is one question, so a judge finishes it in one click.
- **Data:** each AI game, tech challenge and soft scenario can have `rounds: [...]`. Each round holds the kind-specific fields from section 5. **Backward compatible:** with no `rounds`, treat the object itself as a single round.
- **UI:** a "Round 2 of 4" indicator. After each round, show a short result (correct or not, explanation) and a "Next round →" button. After the last round, show the existing result card. **Score = average of round scores.**
- XP, combo, rematch, chest, boss unlocks and skill XP are applied **once per challenge**, on the final result.
- **Soft scenarios** (no wrong answers) keep their model: each round's chosen option adds its `xp` map, and the totals are applied at the end.
- **Done when:** a 4-round challenge in each section plays through, scores the average, and awards XP once.

#### T6. Shuffle options
- `choice`, `multiSelect`, `prReview` issues, `match` columns, `arrange` items (start order must never equal the answer), and **soft-scenario options** (no wrong answer, but position still biases choices).
- Use a per-round `session.order` permutation, and map clicks back to original indexes before scoring. Keep the order stable within the round; re-shuffle on replay.
- **Done when:** replaying a challenge shows a different order and scoring is unchanged.

#### T7. Move hardcoded AI-game text into data
| Where (ported AI-game code) | Hardcoded now | Move to round field |
|---|---|---|
| Spec Check render | `"🎟️ SHOP-214 · ACCEPTANCE CRITERIA"`, `"Coupon at checkout"`, ticket summary | `ticket: { id, title, summary }` |
| PR review render | `"TICKET SHOP-214"`, DevBot opener | `ticket: { id, text }`, `botOpener` |
| Code Fix render/runner | `"TICKET · COUPON-008"`, test list text, `fn(t.total, t.discount)`, `"applyCoupon("` | `ticket`, `functionName`, `tests: [{ args: [...], expected }]`. Call `fn(...t.args)`; compare with `JSON.stringify` |

If `master`'s `run` engine replaces Code Fix during T0, make sure it accepts `args` arrays the same way.

#### T8. Spec Check scoring
- Use `wins / (requirements.length + 1)` instead of `/ 5`.
- Add `scopeCreep: string | null`. When it's `null`, **not** flagging is correct and flagging is wrong.

#### T9. Real streak
Add `state.lastPlayedDay`. On any completed challenge, lesson or scenario: if the last day was yesterday, `streak + 1`; if today, unchanged; otherwise `1`. Show the streak on Home. Remove the hardcoded seed streak. Migrate old saves (missing value = today).

#### T10. Small UI bugs
- Locked-level note: "Beat the Level {n − 1} boss" (it currently always says Level 2).
- The nav count must come from data, not the hardcoded `3`.
- Mobile ≤ 620px: no overlapping hero text (hide or move `.dev-speech` and `.dev-float`).
- Check every page at 375px, 768px and 1280px in both light and dark themes.

#### T11. Guest mode without a server
- In `initAccount()`, if `/api/me` returns 404 or the network call fails, set `apiAvailable = false`.
- With no API: hide **Sign in**; the **Leaderboard** shows "Sign-in and leaderboard work when the app runs with its server" (no error); the profile photo upload is hidden; progress saves to `localStorage`.
- **Done when:** `python3 -m http.server` from `skillquest/` shows no errors on any page, and `node server.js` works fully.

### Phase 3: Content (P0/P1, ~4–5 h, can run in parallel with Phase 2)

#### T12. Add rounds and make content developer-specific
| Section | Item | Now | Target | Priority |
|---|---|---|---|---|
| AI Code Check | `predict-output`, `spot-bug` | 1 round | 5 | P0 |
| AI Code Check | `spec-check`, `ai-code-audit` | 1 | 3 | P0 |
| AI Code Check | other games and bosses | 1 | 2–3 | P1 |
| Technical Skills | each of the 12 challenges | 1 | 3 | P1 (P0 for the JS ones) |
| Soft Skills | scenarios | 12 (2 per skill), office-generic | **18 (3 per skill)**, at least half **developer situations** | P1 |

**Developer soft-skill situations to add or rewrite** (keep the no-wrong-answer model; every option shows a different strength):
- A senior leaves a harsh comment on your PR
- You broke the build and nobody has noticed
- Your 2-day estimate is turning into 5 days
- The product manager asks for "one small change" at 6 PM before release
- A teammate's code has a bug: how do you raise it?
- Production is down at 2 AM and you're on call
- A new junior keeps asking you for help
- The ticket is vague and the product manager is busy

**Content rules:**
- JavaScript (ES2020+), snippets ≤ 12 lines.
- AI Code Check rounds are framed as "your AI assistant wrote this…".
- One concept per round (section 5.3). Fictional names and tickets only.
- Plausible distractors of similar length.
- Explanations ≤ 2 sentences.
- At least one AI Code Check round where the AI's code is **correct** (players learn to approve as well as reject).

#### T13. Content verifier
Create `tools/check-content.js` (`node tools/check-content.js`). It loads every content file with `global.window = {}` and:
1. **Validates schemas** per kind (section 5): indexes in range, ids referenced correctly, every soft option has an `xp` map with valid skill ids.
2. **Runs** `choice` rounds marked `runnable: true` in Node's `vm` (5 s timeout) and compares the last expression's value (or captured `console.log` output when `runMode: "stdout"`) with `options[answer]`, ignoring whitespace.
3. For code-test rounds (`codeFix` / `run`): a hidden `solution` must pass all tests, and the starter code must fail at least one.
4. Exits with code 1 on any failure. **Run it after every content change.**

### Phase 4: Deploy (P0, ~1 h)

#### T14. Static deployment in guest mode
Deploy `skillquest/` to **Vercel** (project root `skillquest`, no build, output `.`) or **GitHub Pages**. T11 must be done first. Put the URL in the README. **Done when:** the URL works on a phone and a laptop in a private window, a judge can play every section without signing in, and there are no console errors.

#### T15. macOS/Linux start script
`skillquest/start.sh` (`#!/usr/bin/env sh`, `cd "$(dirname "$0")"`, check for `node`, `node server.js`), made executable and documented in the README.

### Phase 5: Optional AI (P2, only after Phases 0–4)

#### T16. "Ask Pip" mentor chatbot
- A chat panel on Home and on challenge screens.
- Server route `/api/mentor` (plus a Vercel function for the hosted site) using the **official Anthropic SDK** (`@anthropic-ai/sdk`) and model `claude-opus-5-5`.
- The key comes from env var `ANTHROPIC_API_KEY`, bought with the team budget, **never in client code or the repo**.
- **Behaviour:** hints only while a round is unanswered; explanations after. The server looks up round content by id, so it never trusts content sent by the client.
- A rate limit, and the chat is disabled during bosses.
- **Fallback:** if there's no key or the call fails, answer from the round's `explanation` and `concept` fields.

#### T17. Real AI in the "Review the AI's PR" boss
Free-text review comments; Claude plays DevBot and returns a JSON rubric score. The scripted version stays as the fallback.

### Phase 6: Polish (P2)
- **T18.** Show future AI Code Check levels 4–10 as locked tiles with topics (Async, Event Loop, DOM, APIs, TypeScript, Testing, Security & Performance), plus locked future tracks (App Dev, Backend, DevOps). This shows the roadmap.
- **T19.** First-visit guided tour (4 steps), shown once (flag in `localStorage`).
- **T20.** "Exam Mode lite" on boss rounds: fullscreen; `visibilitychange` warnings with auto-submit on the 3rd switch; copy/paste/right-click blocked inside the boss screen; an integrity note on the result. Label it as integrity signals, not cheat-proof.
- **T21.** Decide on Play Lab (daily quest, reels, story, badges): either re-enable it as a working feature or delete its code. Don't leave hidden code.

---

## 5. Content schemas and curriculum

### 5.1 AI Code Check rounds (`window.DEVQUEST_AICHECK.games[id].rounds[]`)
```js
// choice  (Predict the Output, Explain This Code, Debug Detective, Incident, Prompt Fix)
{ intro?, code?: string[], question, options: string[], answer: number,
  runnable?: boolean, runMode?: "lastValue" | "stdout", explanation, concept }
// tapLine  (Spot the Bug, AI Code Audit, Security Spot)
{ intro, code: string[], badLines: number[], explanation, concept }
// multiSelect  (Tests That Lie, Spec Builder, Hallucination Hunter)
{ intro, items: [{ id, title, detail }], answers: string[], explanation, concept }
// specCheck
{ ticket: { id, title, summary }, requirements: [{ text, met: boolean, line: number }],
  code: string[], scopeCreep: string | null, explanation, concept }
// prReview (boss)
{ ticket: { id, text }, botOpener, issues: [{ id, title, shouldFlag: boolean, reply }], concept }
// codeFix (boss)
{ ticket: { id, text }, functionName, starterCode, solution /* hidden */,
  tests: [{ args: any[], expected }], explanation, concept }
```

### 5.2 Technical Skills challenges (`DEVQUEST_CONTENT.challenges[]`, from `master`)
Common fields: `{ id, skill: "html"|"css"|"javascript", kind, title, xp, emoji, prompt, explain }` plus a lesson in `DEVQUEST_CONTENT.lessons[id]`. Kind-specific fields as they exist today: `tapLine` (`code`, `bad`), `arrange` (`items`, `answer`, optional `code`), `match` (`pairs`, `rightOrder`), `fill` (`code`, `blanks`), `live` (CSS editor target), `run` (`tests`). With T5, these move into `rounds[]`.

### 5.3 Soft Skills scenarios (`DEVQUEST_CONTENT.scenarios[]`, from `master`)
`{ id, skill, title, situation, question, options: [{ text, xp: { skillId: points }, insight }] }`. There are no wrong answers: each option rewards different skills, and `insight` names the strength and the watch-out. Skill ids: `leadership, communication, problem-solving, collaboration, time-management, decision-making`.

### 5.4 Example: a verified `predict-output` round
```js
{
  intro: "Your AI assistant sorted some prices. What is the value of prices now?",
  code: ["const prices = [100, 25, 3];", "prices.sort();", "prices"],
  question: "What is the value of prices?",
  options: ["[3, 25, 100]", "[100, 25, 3]", "[25, 3, 100]", "TypeError"],
  answer: 1, runnable: true, runMode: "lastValue",
  explanation: "Without a compare function, sort() compares values as strings, and \"100\" < \"25\" < \"3\", so the order doesn't change.",
  concept: "Always pass a compare function when sorting numbers: sort((a, b) => a - b)."
}
```
Verified in Node: `[100, 25, 3].sort()` returns `[100, 25, 3]`.

### 5.5 Curriculum
**The 8 ways AI code goes wrong** (AI Code Check):
1. Missing requirement
2. Misread requirement (`>` vs `>=`)
3. Scope creep
4. Ignored edge case (empty, `null`, 0, negative, duplicates, time zones)
5. Invented API
6. Security hole (injection, leaked secret, missing permission check)
7. Tests that pass but don't check the requirement
8. **Actually correct.** Approve it.

**JavaScript concepts:** `==` vs `===` · `typeof null` · `sort()` without a comparator · `0.1 + 0.2` · closures in loops · mutation vs copy · `map` / `filter` / `reduce` · missing `await` · `forEach` with `async` · `fetch` doesn't reject on 404 · lost `this` · Date months start at 0 · off-by-one loops · `??` vs `||`.

---

## 6. Content sources (credit them in the README)
| Source | Use | License |
|---|---|---|
| lydiahallie/javascript-questions | Predict the Output ideas | MIT |
| denysdovhan/wtfjs | Tricky JS behaviour | WTFPL |
| leonardomso/33-js-concepts | Concept order | MIT |
| ryanmcdermott/clean-code-javascript | Bad vs good code | MIT |
| MDN Web Docs | Explanations (code CC0, prose CC-BY-SA) | CC0 / CC-BY-SA |
| google/eng-practices | Code review guidance | CC-BY 3.0 |
| OWASP Cheat Sheet Series | Security rounds (reword) | CC-BY-SA 4.0 |
| PagerDuty Incident Response docs | Incident boss, on-call scenarios | Apache 2.0 |
| GitLab Handbook | Soft-skill scenarios (reword) | CC-BY-SA 4.0 |

Rewrite in our own words. **Don't use** You Don't Know JS (CC BY-NC-ND) or any paid course content.

---

## 7. Definition of done (demo checklist on the deployed URL, private window)
- [ ] One combined app on `main`: Technical Skills, AI Code Check, Soft Skills and Animated all reachable from the Game Map (T0).
- [ ] Each P0 challenge has several rounds; options are shuffled; the score is the average; XP is awarded once.
- [ ] The Code Fix / run tests pass with a correct fix; an infinite loop times out without freezing the page.
- [ ] Spec Check has 3 rounds with different tickets; scope-creep scoring works both ways.
- [ ] The streak increments on a new day.
- [ ] No sign-in button, leaderboard errors or photo upload on the static deploy; all of them work with `node server.js`.
- [ ] No console errors at 375px and 1280px, in light and dark themes.
- [ ] `node tools/check-content.js` passes.
- [ ] The README has all 7 sections and the live URL.
- [ ] `data/accounts.json` is not in Git; there are no secrets in the repo.
- [ ] Every team member has commits on `main`.

## 8. Out of scope (for the "What's next" slide, not code)
- Levels 4–10 with full content
- Hosted database or real accounts at scale
- Blocking other apps
- Voice
- A mobile app
- Cross-company leaderboards
- Manager analytics dashboards
- Role packs beyond one teaser
