# XPaddition

**Short, playable challenges that grow a developer's technical skills, AI code review skills and people skills.**

Team H · Apty Hackathon 2026 · Theme: *Quality Education: upskilling, the non-traditional method*

---

## 1. Project overview

### The problem
Courses and quizzes explain skills, but they rarely let people practise them. A junior developer can pass a quiz on JavaScript or on giving feedback and still freeze on the job.

AI has made this gap wider. AI assistants now write much of the code, so a developer's real job is to **read code they didn't write and check that it does what was asked.** Almost nobody trains that.

- **84%** of developers use or plan to use AI tools, but more of them distrust AI output (**46%**) than trust it (**33%**). The top frustration (**66%**) is AI code that is "almost right, but not quite." ([Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/ai))
- Developers already spend about **58%** of their time understanding code rather than writing it, and juniors spend more than seniors. ([Xia et al., IEEE TSE 2018](https://research.monash.edu/en/publications/measuring-program-comprehension-a-large-scale-field-study-with-pr/))

### Our user
Arjun, 23, a junior JavaScript developer two months into his first job. He uses an AI assistant every day, merges code he only skimmed, and has never practised a difficult conversation at work.

### What we built
A browser game with three skill areas, plus animated lessons. Every challenge gives instant feedback and XP, and players level up as they go.

| Area | What the player does |
|---|---|
| **AI Code Check** | Reads AI-written code and checks it: predicts output, spots bugs, checks a change against a ticket's acceptance criteria (**Spec Check**), audits for security problems, and fights boss rounds (fix code until tests pass, review an AI's pull request, handle a 2 AM incident) |
| **Technical Skills** | HTML, CSS and JavaScript: a short interactive lesson, then a challenge (live CSS editor, JS test runner, matching, ordering, fill-in, tap-the-bug) |
| **Soft Skills** | Workplace scenarios in six skills (Leadership, Communication, Problem Solving, Collaboration, Time Management, Decision Making). There are no wrong answers: each choice builds different skills, with an insight into its strength and its watch-out. |
| **Animated** | JavaScript Trail (12 tiny animated lessons), Pip's Code Explainers (14 concepts) and DSA labs (Bubble Sort, Binary Search) |

---

## 2. Business case

### Use case
An engineering manager or L&D team assigns XPaddition to developers in their first six months. Each developer plays about 10 minutes a day:
- AI Code Check builds the habit of verifying AI output.
- Technical Skills fills gaps in the basics.
- Soft Skills prepares them for reviews, deadlines and difficult conversations.

### Go-to-market: the first 100 users
1. **Users 1–25:** a pilot with new developers at Apty and Excers.
2. **Users 26–60:** one engineering-college placement cell; final-year students play before their first job.
3. **Users 61–100:** a free daily challenge shared on LinkedIn and developer communities, collecting sign-ups.

### Business model
- **Proposed price:** ₹499 per developer per month, sold to companies (B2B).
- **Low running cost:** the games run in the browser, so serving cost is near zero. AI features, if added, are the main variable cost.
- **Content as the moat:** new role packs are written as content on the same game engines, with no new code.

### 12-month plan
| When | Milestone |
|---|---|
| Months 1–3 | Pilot; add more rounds per game; tune content from player feedback |
| Months 4–6 | Role packs: App Developer, Backend, AI Engineer; a company admin view of team progress |
| Months 7–12 | Custom packs built from a company's own tickets and postmortems; integration with digital adoption platforms such as Apty |

**What has to be true:** pilot players return for at least three weeks, and their managers say the AI Code Check practice matches what they see in real reviews.

### Business model canvas
| Block | Summary |
|---|---|
| Customer segments | Engineering managers and L&D teams at IT services and SaaS companies; colleges preparing students for jobs |
| Value proposition | Practise real developer judgement (AI code review, fundamentals, people skills) safely, in 10 minutes a day |
| Channels | Pilots through our network, college placement cells, a free public daily challenge |
| Customer relationships | Self-serve for players; onboarding support for company admins |
| Revenue streams | Per-developer monthly subscription; custom content packs |
| Key resources | Game engines, a reviewed content library, the scoring model |
| Key activities | Writing and reviewing content, product development, pilots |
| Key partners | Companies hiring juniors, colleges, digital adoption platforms |
| Cost structure | Content writing and review, hosting, optional AI usage |

---

## 3. Key features
- **AI Code Check:** 3 levels (Read It, Check It, Direct It & Own It), 9 games + 3 boss rounds, and an AI Engineer teaser (2 games). Bosses unlock after 3 games reach "Okay". The Code Fix boss runs your JavaScript against tests in a time-limited Web Worker.
- **Technical Skills:** 12 lessons and 12 challenges across HTML, CSS and JavaScript, using six game types.
- **Soft Skills:** 12 scenarios across six skills, with XP awarded per skill.
- **Animated:** JavaScript Trail (12 lessons that unlock in order), Pip's Code Explainers (14), Bubble Sort and Binary Search labs.
- **Progress:**
  - Shared XP, player levels and per-skill levels
  - Combos, mystery chests and rematches in AI Code Check
  - A scoreboard and a leaderboard
- **Profile:** a display name and photo; light and dark themes.
- **Accounts (local server):** register and sign in, with scrypt-hashed passwords, session cookies and progress saved to the account. Guests' progress is saved in the browser.

---

## 4. Deployment and how to run it

### Run locally (full version with accounts and leaderboard)
Requires [Node.js](https://nodejs.org/). No npm packages are needed.

- **Windows:** double-click `skillquest/start-localhost.bat`.
- **macOS / Linux:**
  ```bash
  cd skillquest
  node server.js
  ```

Then open http://localhost:8000.

### Static hosting (guest mode)
The `skillquest/` folder can be served as a static site (for example Vercel or GitHub Pages). Everything is playable as a guest. Sign-in and the leaderboard need `server.js`, so they don't work in static mode.

**Deployed URL:** *not deployed yet. Add the link here.*

### Project structure
```
skillquest/
  index.html               page shell and navigation
  developer-app.js         app logic: views, Soft and Technical Skills, progress, accounts UI
  developer-games.js       Soft Skills scenarios, Technical Skills challenges and lessons
  aicheck-app.js           AI Code Check games, JavaScript Trail, Pip's explainers
  aicheck-games.js         AI Code Check content
  developer-visuals.js     Pip's animated explainers (content)
  developer-js-lessons.js  JavaScript Trail lessons (content)
  bubble-sort.js/.css      Bubble Sort lab
  binary-search.js/.css    Binary Search lab
  style.css, skills.css, theme.css, aicheck.css   styles
  server.js                local web server and account API
  data/                    local account database (created at runtime, not committed)
```

---

## 5. Team
Team H:

| Name | Role |
|---|---|
| Vivek | |
| Prem | |
| Lalitha Akhila | |
| Margarida | |
| Sonali | |
| Deepak Dara | |

> **To do before submission:** fill in the roles. The commit history also includes the GitHub account **tarun-apty**. Make sure every contributor is listed.

---

## 6. Credits and licences
- **Fonts:** [Fredoka](https://fonts.google.com/specimen/Fredoka) and [Nunito](https://fonts.google.com/specimen/Nunito) from Google Fonts (SIL Open Font License).
- **No third-party code libraries.** The app is plain HTML, CSS and JavaScript.
- **Content** (code snippets, scenarios, lessons) was written by the team for this project. If content is later adapted from outside sources, list them here with their licences.

## 7. Data and safety
- All code, tickets, people and incidents in the game are **fictional**.
- No production systems, production credentials or customer data are used.
- Local accounts store passwords as **scrypt hashes**. The account file (`skillquest/data/accounts.json`) is excluded from Git.
- XP and levels measure practice. They are **not** a work-performance score.
