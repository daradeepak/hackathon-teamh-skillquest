# SkillQuest: Learn Workplace Skills by Playing

## Beginner-friendly hackathon project blueprint

**Purpose:** A practical guide for a beginner team to design and build a working demo of a gamified workplace-skills learning platform.

**One-line pitch:** SkillQuest turns everyday workplace moments into short, playable missions where employees make a decision, see its impact, get useful feedback, and try again safely.

**Hackathon principle:** Plan the full 50-level journey, but build a small, polished slice for the demo. The first version should prove the learning loop, not attempt to ship a complete corporate learning platform.

---

## 1. The problem and opportunity

Traditional courses and quizzes can explain ideas without giving learners much practice applying them. A learner may know a definition of active listening but still be unsure how to respond when a teammate is upset, a request is unclear, or two deadlines conflict.

SkillQuest provides low-risk practice. Each mission puts the learner into a recognizable workplace situation. They choose or write a response, see a short explanation of likely consequences, and get a chance to reflect or retry. XP, levels, quests, and optional streaks help make progress visible.

The platform is a practice aid, not a replacement for a manager, coach, or company policy. Scenarios should teach general skills and direct learners to the right human or policy when a situation is sensitive.

## 2. Three game concepts to consider

| Concept | How it plays | Best use |
|---|---|---|
| **Office Quest** | A branching story follows a new employee through a normal work week. Choices change relationships, time, and task outcomes. | Best main concept: easy to understand and demonstrate. |
| **One-Minute Decision Duel** | The learner gets a short workplace prompt and chooses a response before a gentle timer ends. Feedback explains trade-offs. | Good for quick daily practice; avoid speed as the main measure of skill. |
| **Team Raid** | A small group solves a simulated project issue by combining different roles and perspectives. | Good future feature for collaboration and leadership. |

**Recommended hackathon direction:** Build Office Quest. Add a “knowledge reel” as an optional 30–60 second tip before or after a mission. Keep Team Raid as a future direction unless the team has extra time.

Possible product names: **SkillQuest**, **WorkWise**, **Office Odyssey**, or **LevelUp at Work**. Use SkillQuest as the working name in this document.

## 3. What to learn from the CodinGame Onboarding puzzle

The linked CodinGame Onboarding challenge gives a newcomer one clear objective: identify which of two targets is closer. It presents the task inside a playful story and introduces the puzzle format with a simple comparison problem. CodinGame describes the onboarding puzzle as practice with basic comparison and a first look at how its puzzles work. [CodinGame Onboarding puzzle](https://www.codingame.com/ide/puzzle/onboarding) · [CodinGame training page](https://www.codingame.com/training)

Apply the same beginner-friendly pattern to workplace learning:

1. **Show one situation.** Keep the story short and familiar.
2. **State the goal.** Say what the learner is trying to achieve.
3. **Offer a small number of actions.** Start with two or three choices, not a long test.
4. **Show the result.** Make consequences understandable and connected to the choice.
5. **Explain the lesson.** Give a practical tip and let the learner retry.
6. **Add complexity gradually.** Later levels can introduce ambiguity, competing priorities, and several people affected by a decision.

The workplace equivalent of “Which target is closer?” might be: “Two requests arrive at once. Which one needs your attention first, and what would you tell the other person?” Keep the first challenge obvious enough to teach the interface, but make the explanation useful.

## 4. Who the first version is for

**Primary learner:** A new or early-career employee who wants to practice communication, collaboration, prioritization, problem-solving, or first-time leadership.

**Other users:** A learning-and-development facilitator who assigns a quest, and a content editor who writes or reviews scenarios.

**Hackathon assumption:** Start with individual learners using a phone or laptop browser. Do not build enterprise sign-in, HR integrations, manager analytics, or app blocking into the first demo.

## 5. The core play-and-learn loop

Every mission follows this loop:

**Story → decision → consequence → feedback → retry or continue → progress earned**

Recommended mission length: **2–5 minutes**. A mission should have one main learning objective and no more than a few decision points.

### Feedback format

After a choice, show four things:

- **What happened:** A neutral description of the immediate result.
- **Why it matters:** The effect on the task, relationship, or risk.
- **Try this next time:** One specific phrase or action the learner can use.
- **Retry:** Let the learner explore another response without losing all progress.

Feedback should be specific, actionable, and tied to the goal. Evidence reviews emphasize that feedback is most useful when it helps the learner understand performance and how to improve; effects vary with how feedback is designed and delivered. [Education Endowment Foundation: Feedback](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback)

### Scoring and progress

- Award XP for completing a mission, reflecting, and retrying—not only for choosing the single “perfect” answer.
- Show a separate skill signal such as Communication, Collaboration, or Problem-solving, based on the decision rubric.
- Treat XP as engagement progress, not proof that someone is competent at work.
- Let learners pause and continue later. Streaks should be optional and forgiving; do not punish people for shift work, leave, disability, or limited access.
- Do not rank employees against one another in the MVP.

## 6. The 50-level learning journey

Levels are grouped into five worlds of ten missions. Difficulty grows in a predictable way: **guided single decisions → two-step interactions → trade-offs and incomplete information → several stakeholders → integrated capstone stories**. Level numbers are a learning journey, not a judgement of an employee’s value.

### World 1 — First Week Foundations (Levels 1–10)

Focus: basic communication, asking questions, listening, and managing everyday tasks. Use clear language, hints, and simple choices.

| Level | Mission | Skill practiced |
|---:|---|---|
| 1 | **Choose the right channel** — A teammate needs a quick answer while a complex issue needs discussion. Decide how to respond to each. | Communication basics |
| 2 | **Clarify the request** — A manager sends a vague task. Ask a useful question before starting. | Clarifying questions |
| 3 | **Listen and summarize** — A coworker explains a problem. Choose a response that checks your understanding. | Active listening |
| 4 | **Write a clear update** — Turn a long, unclear status message into a concise update with next steps. | Clear writing |
| 5 | **Respond to feedback** — Receive a correction on your work. Choose a constructive first response. | Receiving feedback |
| 6 | **Ask for help early** — A task is blocked and the deadline is approaching. Explain the blocker and ask for support. | Help-seeking |
| 7 | **Plan your first day** — Sort three tasks by urgency and importance, then make a realistic plan. | Prioritization |
| 8 | **Protect focus time** — A non-urgent interruption arrives while you are completing a task. Set a respectful boundary. | Time management |
| 9 | **Handle a missed message** — You overlooked a message. Own the miss and agree on a next step. | Accountability |
| 10 | **First-week check-in** — Combine an update, a question, and one learning goal in a short conversation. | Self-awareness and communication |

### World 2 — Better Together (Levels 11–20)

Focus: collaboration, inclusion, conflict, and shared ownership. Introduce short conversations with more than one turn.

| Level | Mission | Skill practiced |
|---:|---|---|
| 11 | **Share the airtime** — In a team discussion, invite input from someone who has not spoken. | Inclusive communication |
| 12 | **Agree on ownership** — Two people think the other owns a task. Clarify who will do what by when. | Role clarity |
| 13 | **Give useful feedback** — Point out a specific issue while keeping the discussion respectful and focused on the work. | Constructive feedback |
| 14 | **Receive a different view** — A teammate disagrees with your idea. Ask about their reasoning before deciding. | Openness |
| 15 | **Repair a misunderstanding** — A short message was read as rude. Clarify intent and acknowledge impact. | Empathy |
| 16 | **Coordinate a handoff** — Pass work to another person with context, status, risks, and next action. | Collaboration |
| 17 | **Resolve a small conflict** — Two teammates prefer different ways to complete a task. Find a shared criterion. | Conflict resolution |
| 18 | **Work across time zones** — Plan an asynchronous handoff so colleagues in another time zone can continue. | Distributed teamwork |
| 19 | **Respond to exclusion** — Someone’s contribution is repeatedly overlooked. Choose a supportive, appropriate response. | Inclusion and allyship |
| 20 | **Team retrospective** — Identify one thing to keep, one to change, and one action with an owner. | Reflection and shared improvement |

### World 3 — Think It Through (Levels 21–30)

Focus: problem-solving, evidence, priorities, risk, and decision-making. Choices may have more than one reasonable outcome.

| Level | Mission | Skill practiced |
|---:|---|---|
| 21 | **Define the actual problem** — A team jumps to a solution. Separate the observed issue from assumptions. | Problem framing |
| 22 | **Find the missing information** — Choose which one or two questions would reduce uncertainty most. | Information gathering |
| 23 | **Sort facts from guesses** — Review a short incident report and identify what is known versus assumed. | Critical thinking |
| 24 | **Compare options** — Choose between speed, cost, and quality trade-offs using an agreed goal. | Decision-making |
| 25 | **Prioritize a changing queue** — A new urgent request arrives. Replan and communicate what moves. | Adaptability |
| 26 | **Notice a risk early** — A plan may affect a customer or deadline. Raise the risk with evidence and a mitigation idea. | Risk awareness |
| 27 | **Run a small experiment** — Choose a low-cost way to test whether an idea works before a large rollout. | Experimentation |
| 28 | **Handle incomplete data** — Make a provisional recommendation and state what could change it. | Judgement under uncertainty |
| 29 | **Learn from a mistake** — A process failed. Focus the review on causes and prevention rather than blame. | Learning mindset |
| 30 | **Make the call** — Pick a path, explain the reason, and define a review point. | Decision ownership |

### World 4 — Lead with Care (Levels 31–40)

Focus: leadership, delegation, coaching, change, and ethical choices. Scenarios include several people and competing needs.

| Level | Mission | Skill practiced |
|---:|---|---|
| 31 | **Set a shared goal** — Turn a broad request into an outcome, owner, and check-in point. | Goal setting |
| 32 | **Delegate with context** — Assign work with purpose, decision boundaries, support, and a deadline. | Delegation |
| 33 | **Coach instead of taking over** — A teammate is stuck. Ask questions that help them find a next step. | Coaching |
| 34 | **Run a focused meeting** — Set an agenda, manage time, and close with owners and actions. | Facilitation |
| 35 | **Support someone under pressure** — Respond to a colleague who says their workload is no longer manageable. | Empathy and support |
| 36 | **Communicate a change** — Explain what is changing, why, what is known, and where questions can go. | Change communication |
| 37 | **Make an ethical pause** — A fast shortcut could expose private or sensitive information. Pause and seek the right policy owner. | Ethical judgement |
| 38 | **Balance competing needs** — A customer request conflicts with team capacity. Explore options and communicate constraints. | Stakeholder management |
| 39 | **Address a performance issue** — Discuss a missed commitment privately, with facts, curiosity, and a clear next step. | Accountability with care |
| 40 | **Build a team decision** — Gather perspectives, identify the decision owner, and record the rationale. | Leadership and collaboration |

### World 5 — The Real-World Challenge (Levels 41–50)

Focus: combine skills in longer branching simulations. The outcome depends on the learner’s pattern of choices, not one isolated click.

| Level | Mission | Skill practiced |
|---:|---|---|
| 41 | **The shifting deadline** — A project deadline moves while a teammate is blocked and a stakeholder asks for an update. | Prioritization and communication |
| 42 | **The unhappy customer** — Listen, clarify the impact, set an honest expectation, and coordinate a response. | Empathy and problem-solving |
| 43 | **The cross-team launch** — Resolve unclear ownership and conflicting requirements before a launch decision. | Collaboration and decision-making |
| 44 | **The meeting that goes off track** — Bring a tense discussion back to its purpose while making space for concerns. | Facilitation and conflict resolution |
| 45 | **The data concern** — A teammate suggests using information in a way that may break policy. Pause, protect data, and escalate appropriately. | Ethics and risk awareness |
| 46 | **The sudden outage** — Coordinate roles, share verified updates, and avoid unsupported promises during an incident. | Calm communication and leadership |
| 47 | **The overloaded team** — Replan work, negotiate scope, and raise capacity concerns early. | Leadership and prioritization |
| 48 | **The difficult handoff** — Transfer a partially complete project across teams with open risks and limited overlap. | Collaboration and accountability |
| 49 | **The recovery plan** — After a failed delivery, align stakeholders on what happened, immediate actions, and prevention. | Problem-solving and learning |
| 50 | **Your first leadership challenge** — Lead a short project from kickoff through a surprise change and retrospective. | Integrated capstone |

### Difficulty ladder

| Levels | Learner experience | Game support |
|---|---|---|
| 1–10 | One goal, short prompt, usually two or three choices. | Hints, vocabulary help, immediate explanation, replay. |
| 11–20 | Two or three conversation turns; another person reacts. | Show why a response helps or hurts collaboration. |
| 21–30 | Incomplete information and competing priorities. | Ask learners to state assumptions and explain trade-offs. |
| 31–40 | More stakeholders, power dynamics, and sensitive judgement. | Include more than one acceptable path and explain the trade-offs. |
| 41–50 | Longer branching simulations with consequences across several decisions. | End with a debrief, a reflection, and suggested practice areas. |

## 7. A complete example mission for the demo

### Level 1: Choose the right channel

**Learning goal:** Choose a suitable way to handle a quick question versus a complex conversation.

**Story:** You have just joined the product team. A teammate messages, “Can you confirm whether the meeting is at 2 or 3?” At the same time, a project partner asks to discuss why a deadline may slip.

**Decision:** What is the best next move?

**A.** Reply to the time question in chat. Suggest a short call or focused meeting for the deadline discussion, and ask what information they have so far.

**B.** Schedule a meeting for both questions next week.

**C.** Ignore both until someone follows up.

**Feedback for A:** Good channel matching. A quick factual check can be resolved in chat, while a deadline risk may need a two-way conversation. Confirm the meeting time, then agree on a time to discuss the risk.

**Feedback for B:** A meeting may help with the deadline discussion, but it delays a simple question. Handle the quick item now and set up the longer conversation promptly.

**Feedback for C:** Waiting without an update can create avoidable uncertainty. If you cannot respond fully, acknowledge the message and say when you will follow up.

**Retry prompt:** Try another option and compare how it changes the teammate’s next action.

**Skill signal:** Communication. **Completion reward:** 50 XP for completing and reviewing the explanation; small bonus XP for a reflection or replay.

This mission pattern should be reused for the other beginner levels. Do not make the feedback imply that every real workplace situation has only one universally correct answer.

## 8. What to build for the hackathon demo

### MVP features

1. A simple welcome screen and learner nickname (no real employee data needed).
2. A map showing five starter missions and locked future levels.
3. Five playable beginner scenarios from Levels 1–5.
4. Two or three choices per decision, with immediate feedback.
5. XP, a progress bar, and three skill indicators.
6. A short end-of-mission reflection: “What would you try at work?”
7. One optional knowledge reel or tip card attached to a mission.
8. A simple profile page showing completed missions and skills practiced.

### Save for later

Build the other 45 scenarios as content after the core loop is validated. Defer company dashboards, manager rankings, AI-generated scoring, company single sign-on, HR integrations, notifications, multiplayer, and app blocking.

### Beginner-friendly screen sequence

**Welcome → Choose a quest → Read a short story → Make a decision → See feedback → Reflect or retry → Earn progress → Choose next quest**

Keep each screen focused on one action. Make buttons large enough for touch, use plain language, and ensure the experience works with keyboard navigation and screen readers.

## 9. How to proceed from zero

### Step 1 — Agree on the demo goal

Write one sentence that the team can use to make decisions: “A new employee can complete a 3-minute scenario and learn one practical communication habit.” Keep the first demo aimed at this outcome.

### Step 2 — Choose a narrow audience

For the first prototype, choose a new employee or early-career learner. Avoid trying to write for every job, seniority, and culture at once.

### Step 3 — Write five missions before coding

Use Levels 1–5 above. For each mission, fill in: title, learning goal, story, decision, choices, consequences, feedback, skill tag, and XP. Ask someone unfamiliar with the project to read the scenario and explain what they think to do.

### Step 4 — Sketch the screens

Draw the welcome screen, level map, scenario, choice result, and progress screen on paper or in a design tool. A simple clickable prototype is enough to discuss the flow before writing software.

### Step 5 — Build the smallest playable loop

Create one scenario end to end first. Add the remaining four only after the first scenario can start, accept a choice, show feedback, and update progress. Store scenario content separately from screen layout so new levels are easy to add.

### Step 6 — Add game progress

Add XP and level unlocks after the learning loop works. Keep skill evidence visible separately from XP. A learner might earn completion XP even when the scenario shows a skill they could practice more.

### Step 7 — Review content and usability

Have a few beginners try the prototype without coaching. Note where they hesitate, misunderstand a choice, or cannot explain the feedback. Revise those moments. Ask a workplace learning or HR subject matter expert to review sensitive scenarios before using them with employees.

### Step 8 — Prepare the demo story

Show the problem in one sentence, play one mission, point out the feedback and progress, and explain how the 50 levels expand the journey. Finish with what the team learned and the next feature to build.

## 10. Suggested technical approach

Choose tools the team already knows. A simple web application is usually easiest to share with judges.

| Part | Beginner option | Purpose |
|---|---|---|
| Front end | React with Vite, or a no-code clickable prototype | Screens, choices, feedback, progress display. |
| Styling | CSS or a small component library | Responsive layouts and buttons. |
| Scenario content | Local JSON file | Store text, choices, skill tags, feedback, and XP. |
| Progress storage | Browser local storage for demo | Save learner progress without creating accounts. |
| Optional backend | Supabase or Firebase if the team knows it | Shared data or login only if required by the demo. |

**Simple scenario data shape:**

- id and level number
- title and world
- learning goal
- story text
- choices (label, feedback, skill signal, points)
- optional hint or knowledge reel
- reflection question

Do not add generative AI to score open-ended answers in the first version. Start with reviewed choices and authored feedback so the learning message is predictable. If AI is explored later, make it optional, transparent, and reviewed for bias and privacy.

## 11. Example 48-hour hackathon plan

| Time | Work | Deliverable |
|---|---|---|
| Hours 0–2 | Agree on audience, pitch, MVP, and team roles. | One-page scope and chosen demo mission. |
| Hours 2–6 | Write five scenarios; sketch the user flow and visual style. | Scenario cards and screen plan. |
| Hours 6–14 | Build the welcome screen, level map, and one playable mission. | First end-to-end game loop. |
| Hours 14–22 | Add four missions, scoring, and progress display. | Five-level demo. |
| Hours 22–28 | Add the knowledge reel/tip card and polish mobile layout. | Cohesive learner journey. |
| Hours 28–34 | Get beginner feedback and review content for clarity and sensitivity. | Fix the largest usability issues. |
| Hours 34–40 | Prepare pitch, demo script, screenshots, and fallback recording. | Stable presentation. |
| Hours 40–48 | Rehearse, refine, and freeze features early enough to avoid last-minute breakage. | Final hackathon submission. |

### Suggested small-team roles

- **Product/story lead:** Audience, learning goals, mission writing, pitch.
- **Front-end developer:** Screens and game loop.
- **Content/UX designer:** Scenario clarity, layout, accessibility, feedback.
- **Full-stack/helper role:** Progress storage and demo setup.

One person can cover multiple roles. Keep scenario writing and interface work moving in parallel, then connect them through the content format.

## 12. How to measure whether it works

For the hackathon, measure whether people can use and understand the experience—not whether five demo levels prove long-term workplace performance.

**Demo measures:**

- Can a first-time user start a mission without help?
- Can they explain the feedback in their own words?
- Do they understand why a choice had its result?
- Can they complete a mission in a few minutes?
- Do they want to try another mission?

**Later pilot measures:**

- Scenario completion and replay rates.
- Changes in scenario rubric scores across repeated practice.
- Learner confidence before and after a mission, treated as self-report.
- Delayed recall or a follow-up reflection after a week.
- Qualitative feedback from learners and learning facilitators.

Do not use XP, streaks, or one scenario result as a hiring, promotion, or performance score. Real skill transfer needs careful evaluation in context.

## 13. Safety, inclusion, and privacy

- Use fictional names, teams, and organizations in scenarios.
- Avoid asking learners to enter real customer, employee, health, or confidential company information.
- Do not collect more personal data than the prototype needs. A nickname and local progress are sufficient for a demo.
- Show that this is practice, not an official HR evaluation or a substitute for company policy.
- Include multiple reasonable choices when the situation is ambiguous, with feedback that explains trade-offs.
- Write examples that work across different cultures, communication styles, disabilities, and job types. Avoid treating one style of assertiveness or sociability as the only correct style.
- Provide keyboard access, readable contrast, captions/transcripts for reels, and a way to pause or replay.
- **App blocking:** Do not block other apps in the hackathon MVP. It adds operating-system permissions and organizational control issues, and may reduce trust. If a future employer requests a focus feature, first explore opt-in quiet mode, reminders, or managed-device policies with transparent consent and an easy exit.

## 14. Main risks and ways to handle them

| Risk | Response |
|---|---|
| The project becomes too broad. | Demo five levels and present the 50-level curriculum as a roadmap. |
| Scenarios feel like school quizzes. | Use workplace stories, plausible consequences, retry, and reflection. |
| Feedback sounds judgemental. | Describe the action and its effect; avoid labels like “bad employee.” |
| One choice is treated as always correct. | Explain context and trade-offs; include more than one reasonable outcome where appropriate. |
| Rewards replace learning. | Give XP for practice and reflection; show skill feedback separately. |
| Employees feel monitored. | Use transparent data collection, opt-in participation, and no leaderboards or manager scoreboards in the MVP. |
| App blocking harms trust. | Keep it out of MVP; if revisited, use consent-based controls and clear organizational policy. |

## 15. Demo script (about 90 seconds)

1. **Problem:** “Courses explain skills, but employees need a safe place to practice using them in real situations.”
2. **Solution:** “SkillQuest turns workplace situations into short interactive missions with immediate feedback.”
3. **Play:** Complete Level 1 and show how a different choice leads to different feedback.
4. **Learning:** Show the practical tip and reflection question.
5. **Progress:** Show XP, skill signals, and the five-world map.
6. **Roadmap:** Explain that the 50 levels progress from everyday communication to integrated leadership simulations; this demo implements the first five.
7. **Close:** “The next step is to validate the scenarios with beginner learners and workplace learning experts.”

## 16. Short pitch for the team

**SkillQuest helps people practice workplace skills by playing through realistic decisions. Each short mission gives learners a safe chance to choose, see consequences, get practical feedback, and try again. A 50-level journey builds from everyday communication to leadership and complex team challenges. Our hackathon demo focuses on the first five levels and proves the core learning loop.**

## 17. References and inspiration

- [CodinGame Onboarding puzzle](https://www.codingame.com/ide/puzzle/onboarding) — user-provided reference for a simple first challenge wrapped in a game.
- [CodinGame Training](https://www.codingame.com/training) — shows how beginner puzzles can be arranged into a progression of topics and difficulty.
- [Education Endowment Foundation: Feedback](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback) — evidence summary describing feedback as information about performance relative to learning goals, with emphasis on specific information that can help improvement. Its evidence base is primarily school-focused, so use it as a general design principle, not proof of workplace impact.
- [Lee and Yu, Game-based learning enhances business decision-making learning for on-the-job MBA students (2025)](https://www.sciencedirect.com/science/article/abs/pii/S1472811725000102) — a workplace-oriented business simulation case study that discusses motivation, immersion, and decision-making learning. It is one study with a specific participant group, not a guarantee that gamification will work for every workforce.

---

**Working rule for the team:** Every feature must help the learner make a decision, understand its impact, or choose a next step. If it does none of those, leave it out of the first build.
