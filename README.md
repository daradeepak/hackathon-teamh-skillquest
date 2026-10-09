# XPedition

**Build soft skills and technical skills by playing.** Players sign in and then practise through short, interactive challenges: workplace scenarios with no wrong answers, hands-on HTML, CSS and JavaScript lessons you can see, touch and then prove you understood, quick mini games, and animated algorithm labs. Every action earns XP, levels up a skill, unlocks achievements and moves you up the leaderboard.

Team H · Apty Hackathon 2026 · Theme: *Quality Education: upskilling, the non-traditional method*

## 1. Project overview

**The problem.** Most upskilling is passive: slide decks, long videos, quizzes that reward memorising. Soft skills are even harder, because there is rarely one right answer, so they are skipped or taught as lectures. New hires end up with technical know-how but little practice at the moments that decide how they work with people.

**The solution.** XPedition teaches by doing. Two skill tracks share one XP system, with mini games and labs around them:

- **Soft Skills** — 12 short workplace scenarios across six skills (Leadership, Communication, Problem Solving, Collaboration, Time Management, Decision Making). There are no right or wrong answers. The approach you choose awards XP to the skills it shows, and a short note explains what that approach is good at and what to watch for.
- **Technical Skills** — HTML, CSS and JavaScript, with 8 challenges each. Every challenge has a *learn, then play* path: a short interactive visual lesson (compare versions side by side, or step through code and watch its state), then the challenge. JavaScript also has a 12-lesson learn trail from your first line to async code.
- **Mini games and Play Lab** — four fast arcade games (true/false, HTTP status pairs, Git step ordering, naming conventions) and three animated algorithm labs (Bubble Sort, Binary Search, Reverse a String).

**What was built:** a complete playable app (vanilla JavaScript, no framework or build step), a Node server backed by PostgreSQL for accounts, sessions, profile, progress and the leaderboard, an automated test suite, and CI.

## 2. Key features

| Area | What you get |
|---|---|
| Game Map | Skill cards with levels, XP and progress bars. A player level that grows with total XP. |
| Soft-skill scenarios | 12 branching-choice scenarios. Each option awards XP to one to three skills. First choice counts, replays are practice. |
| Interactive lessons | 24 lessons (one before each challenge) plus the 12-lesson JavaScript learn trail: compare-and-explore, step-through code with state, and storyboard flows. +10 XP once each. |
| Interactive challenges | 24 challenges (8 each for HTML, CSS and JavaScript) in six formats: live CSS editor with preview and goal checklist, JavaScript editor that runs tests, type-in blanks, match pairs, put in order, tap the buggy lines. Partial credit, and improving your best score earns the rest of the XP. |
| Mini games | **Truth Rush** (true or false on a timer, with streaks), **Status Pair Hunt** (match HTTP status codes to their meanings; easy, medium or hard grid), **Git Line-up** (put Git, HTML and CSS steps in order, then ship), **Kebab Kanon** (pick the naming style that belongs in CSS, JS, JSON or Git). |
| Play Lab | DSA labs: **Bubble Sort** (3D, custom arrays), **Binary Search** (lo/mid/hi markers, choose your target) and **Reverse a String** (two pointers swapping from both ends, with the code lit up). Each earns XP and a badge once. |
| Daily tasks | A daily bar with three goals: complete a task, finish a lesson, clear a challenge. |
| Achievements | 15 badges for milestones such as your first task, levelling up, a well-rounded skill set and finishing the algorithm labs. |
| Leaderboard | Registered players ranked by XP, with photos, your row highlighted. |
| Profile | Click your avatar to change your name, pick a default avatar or upload a photo (resized in the browser). |
| Settings | Theme (light or dark), text size, reduce motion, sound effects, lesson autoplay speed, which Game Map tab opens first, and reset progress. |
| Accounts | A themed login page opens first; nothing in the app works until you sign in. Passwords are scrypt-hashed, sessions are stored hashed in PostgreSQL. |
| Progress | Your personal stats: player level, XP per skill and recent scenarios. |
| Accessibility | Keyboard-friendly controls, labelled inputs and live regions, reduced-motion support. |

## 3. How to run it

You need [Node.js](https://nodejs.org) 18 or newer and [PostgreSQL](https://www.postgresql.org) 14 or newer.

```bash
# 1. Create a database (one time)
createuser -P xpedition            # choose a password
createdb -O xpedition xpedition

# 2. Configure and install (one time)
cd skillquest
cp .env.example .env               # set DATABASE_URL to your database
npm install

# 3. Run
npm start                          # then open http://localhost:8000
```

- The server creates its tables on first start (versioned migrations, safe to run on every start).
- **Windows:** double-click `skillquest/start-localhost.bat`. **macOS / Linux:** `./skillquest/start.sh`.
- **Share on your network:** set `HOST=0.0.0.0`, then open `http://<your-ip>:8000` from another device.
- **Moving old accounts:** `node scripts/import-json-accounts.js` copies users from the earlier `data/accounts.json` into PostgreSQL (existing emails are skipped).
- **Tests:** `createdb -O xpedition xpedition_test`, then `npm test`. Set `TEST_DATABASE_URL` if your test database lives elsewhere. The test database is wiped on every run. On Node 24, run `node --test test/*.test.js` instead (CI uses Node 20).

## 4. Deployment

**Deployed URL:** not publicly deployed. The app runs locally with the steps in section 3 (Node.js and PostgreSQL); no external services or API keys are needed.

To deploy it, run `node server.js` behind an HTTPS reverse proxy (nginx, Caddy, a cloud load balancer) with a managed PostgreSQL database. Configuration is by environment variable or a `.env` file:

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | *(required)* | PostgreSQL connection string. |
| `DATABASE_SSL` | off | `require` for TLS with certificate checks (managed databases), `no-verify` for TLS without checks. |
| `DATABASE_POOL_SIZE` | `10` | Maximum database connections. |
| `PORT` | `8000` | Port to listen on (`0` picks a free port). |
| `HOST` | `127.0.0.1` | Use `0.0.0.0` in a container or to share on a network. |
| `COOKIE_SECURE` | off | Set to `1` behind HTTPS: cookies become `Secure` and HSTS is sent. |
| `TRUST_PROXY` | off | Set to `1` behind a proxy so rate limits use the client address from `X-Forwarded-For`. |

A health check at `GET /api/health` reports whether the database is reachable. The server sets a strict Content-Security-Policy, `X-Frame-Options`, `nosniff` and related headers; serves only the app's own top-level files; runs learner code in a worker that cannot reach the network; rate-limits sign-in and registration; stores session tokens hashed with expiry; and validates and caps all saved progress against the game content.

**Known limits:**

- Rate limits are kept in memory, so with several server instances each one counts separately. Use a shared store (or the proxy's rate limiting) when you scale out.
- XP is calculated in the browser. The server rejects impossible values (it caps XP at what the content can award), but a determined player could still claim up to the cap. A fully trusted leaderboard needs server-side scoring.
- There is no password reset or email verification yet.
- Mini-game best scores aren’t saved by the server yet, so they can be lost when you sign in again or switch devices.
- Fonts load from Google Fonts; self-host them for a fully offline deployment.
- Back up the database regularly (for example with `pg_dump`).

## 5. Business case

*This section is the team's proposal and should be reviewed by the whole team.*

- **Use case.** Learning and development teams assign XPedition to new hires and early-career staff, so people practise real workplace moments and core technical skills in short daily sessions instead of one long course.
- **First 100 users.** A pilot with new developers at Apty and Excers, then one engineering-college placement cell, then a free "challenge of the day" shared on LinkedIn.
- **Business model.** ₹499 per learner per month. The challenges run in the browser at near-zero marginal cost.
- **12-month plan.** Role packs (App Dev, Backend, QA, DevOps, Customer Success) as new content on the same engines; scenarios written from a company's own situations; manager dashboards for skill growth; integration with digital adoption platforms such as Apty.

| Business model canvas | |
|---|---|
| Customers | L&D teams, engineering managers, colleges and bootcamps |
| Problem | Passive training, no practice of soft skills, hard to see skill growth |
| Value | Short interactive practice with visible XP and skill levels |
| Channels | Pilot partners, placement cells, social challenges |
| Revenue | Per-learner subscription, team and campus plans |
| Costs | Content authoring, hosting (low), support |
| Key activities | Writing scenarios and lessons, product development |
| Advantage | One XP system across soft and technical skills, zero-install |

## 6. Team

Vivek, Prem, Lalitha Akhila, Margarida, Sonali, Deepak Dara. *(Add each person's role.)*

## 7. Credits and licences

- All scenarios, lessons, challenges and code are original to this project.
- Fonts: **Fredoka** and **Nunito** from Google Fonts, licensed under the SIL Open Font License.
- No third-party libraries, images or audio are used.

## 8. Data and safety

All scenarios and characters are fictional. No production databases, production credentials, API keys or customer data are used, as the hackathon rules require; each installation creates its own empty local database. Passwords are hashed with scrypt and never returned by the API. Accounts live in PostgreSQL. `.env` (database credentials) and the old `skillquest/data/accounts.json` are git-ignored; never commit them.

## Repository layout

- `skillquest/` — the app and server. See `skillquest/README.md` for the file map.
- `IMPROVEMENTS.md`, `SkillQuest_Hackathon_Blueprint.md` — the team's earlier planning documents.
- `bubble-sort-visualizer.html`, `binary-search-visualizer.html`, `reverse-string-visualizer.html` — the original standalone prototypes; the app has built-in versions.
