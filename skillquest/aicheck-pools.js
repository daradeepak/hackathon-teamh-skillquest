/* Extra versions ("variants") of each AI Code Check game, so replays and Merge Defender waves show new code.
   A variant overrides fields of its base game in aicheck-games.js and never changes its id: progress stays keyed by the base game.
   difficulty: 1 = easy, 2 = medium, 3 = hard. badLines, answer and requirement lines are 0-based. All code is fictional. */
window.XP_AICHECK_POOLS = {
  base: {
    "predict-output": 1, "explain-code": 2, "spot-bug": 1, "spec-check": 2, "ai-code-audit": 2, "tests-that-lie": 2,
    "spec-builder": 2, "security-spot": 2, "debug-detective": 1, "code-fix": 2, "review-pr": 2, "incident": 2
  },
  variants: {
    "predict-output": [
      {
        vid: "po-count", difficulty: 1, intro: "The AI wrote a word counter. What number comes back?",
        code: ["function countLong(words) {", "  let n = 0;", "  for (const w of words) {", "    if (w.length > 3) n++;", "  }", "  return n;", "}", "countLong([\"map\", \"fold\", \"zip\", \"reduce\"])"],
        question: "What does the final line return?", options: ["1", "2", "3", "4"], answer: 1,
        explanation: "Only words longer than 3 characters count: \"fold\" (4) and \"reduce\" (6). \"map\" and \"zip\" have exactly 3, and 3 > 3 is false.",
        concept: "Check the boundary: > and >= give different answers at the edge."
      },
      {
        vid: "po-chain", difficulty: 2, intro: "The AI chained three array methods. What is result?",
        code: ["const prices = [120, 80, 45];", "const result = prices", "  .filter(p => p >= 50)", "  .map(p => p - 10)", "  .reduce((a, b) => a + b, 0);", "result"],
        question: "What is the value of result?", options: ["180", "200", "215", "245"], answer: 0,
        explanation: "filter keeps 120 and 80 (45 is below 50). map subtracts 10: 110 and 70. reduce adds them: 180.",
        concept: "Trace a chain one step at a time and write down the array after each step."
      },
      {
        vid: "po-async", difficulty: 3, intro: "The AI mixed a timer and a promise. In what order are the letters logged?",
        code: ["const log = [];", "log.push(\"A\");", "setTimeout(() => log.push(\"B\"), 0);", "Promise.resolve().then(() => log.push(\"C\"));", "log.push(\"D\");", "// later, after everything has run:", "log.join(\"\")"],
        question: "What does log.join(\"\") give once everything has run?", options: ["ABCD", "ADCB", "ACDB", "ADBC"], answer: 1,
        explanation: "Synchronous code runs first (A, D). Then promise callbacks (microtasks) run: C. Timers run last, even with 0 ms: B. So ADCB.",
        concept: "Order: synchronous code → promise callbacks → timers. setTimeout(…, 0) is never \"right now\"."
      }
    ],
    "explain-code": [
      {
        vid: "ec-initials", difficulty: 1, intro: "A teammate asks what this helper does. Pick the most accurate explanation.",
        code: ["function initials(name) {", "  return name", "    .split(\" \")", "    .map(part => part[0].toUpperCase())", "    .join(\"\");", "}"],
        question: "What does it return?",
        options: ["The capital first letter of each space-separated word, for example \"AL\" for \"ada lovelace\".", "The name with each word capitalised, for example \"Ada Lovelace\".", "Only the first letter of the whole name."], answer: 0,
        explanation: "split makes a list of words, map keeps each word’s first letter in uppercase, and join glues them together. Watch out: a double space creates an empty word, and part[0] is then undefined, so it crashes.",
        concept: "Describe what the code does, then ask what input would break it."
      },
      {
        vid: "ec-latest", difficulty: 2, intro: "This runs on the activity feed. What does it return?",
        code: ["function latestByUser(events) {", "  const latest = {};", "  for (const e of events) {", "    const prev = latest[e.userId];", "    if (!prev || e.at > prev.at) latest[e.userId] = e;", "  }", "  return Object.values(latest);", "}"],
        question: "What does it return?",
        options: ["One event per user: the one with the largest at value.", "Every event, sorted newest first.", "The single newest event across all users."], answer: 0,
        explanation: "latest maps each userId to the newest event seen so far. Object.values returns one event per user. It does not sort the result.",
        concept: "Name the data structure (here, a map from user to event) and the job becomes clear."
      },
      {
        vid: "ec-await-loop", difficulty: 3, intro: "The AI says this loads users “efficiently”. Is that accurate?",
        code: ["async function loadAll(ids) {", "  const results = [];", "  for (const id of ids) {", "    results.push(await fetchUser(id));", "  }", "  return results;", "}"],
        question: "Which description is accurate?",
        options: ["It fetches users one at a time, in order, and returns them in the same order as ids.", "It fetches all users in parallel, so it takes as long as the slowest single request.", "It returns an array of pending promises that the caller must await."], answer: 0,
        explanation: "await inside the loop waits for each request before starting the next, so the requests run one after another. Promise.all(ids.map(fetchUser)) would run them in parallel.",
        concept: "await in a loop means one at a time. That can be correct, but it isn’t “efficient” for independent requests."
      }
    ],
    "spot-bug": [
      {
        vid: "sb-slice", difficulty: 1, intro: "The page should show the last 3 orders, but it shows only 2. Tap the line that causes it.",
        code: ["function lastThree(orders) {", "  const start = orders.length - 3;", "  return orders.slice(start, orders.length - 1);", "}"], badLines: [2],
        explanation: "slice stops before its end index, so orders.length - 1 drops the last order. Use orders.slice(-3).",
        concept: "Know whether an end index is included or excluded."
      },
      {
        vid: "sb-new-user", difficulty: 2, intro: "isNewUser should be true for accounts younger than 7 days. It does the opposite. Tap the bug.",
        code: ["function isNewUser(user, now) {", "  const DAY = 24 * 60 * 60 * 1000;", "  const age = now - user.createdAt;", "  return age > 7 * DAY;", "}"], badLines: [3],
        explanation: "The comparison is flipped: age > 7 days means an old account. It should be age < 7 * DAY.",
        concept: "Read a condition out loud in plain words and compare it with the ticket."
      },
      {
        vid: "sb-sale", difficulty: 3, intro: "This sale helper crashes at the end of the list and discounts out-of-stock products. Tap every buggy line.",
        code: ["function applySale(products, pct) {", "  let changed = 0;", "  for (let i = 0; i <= products.length; i++) {", "    const p = products[i];", "    if (p.stock = 0) continue;", "    p.price = p.price * (1 - pct / 100);", "    changed++;", "  }", "  return changed;", "}"], badLines: [2, 4],
        explanation: "i <= products.length runs one step too far, so products[i] is undefined and p.stock crashes. p.stock = 0 assigns instead of compares: it sets every stock to 0 and is always false, so out-of-stock items are never skipped.",
        concept: "Off-by-one loops and = versus === are classic AI slips. Check loop bounds and comparisons first."
      }
    ],
    "spec-check": [
      {
        vid: "sc-username", difficulty: 1, ticketId: "PROFILE-31", ticketTitle: "Username rules",
        ticketText: "Usernames are 3–20 characters, use only letters, numbers and _, and must be unique.",
        intro: "Check the AI’s username change against PROFILE-31. Mark each criterion, then tap the best evidence line.",
        requirements: [
          { text: "Usernames must be 3–20 characters.", met: true, line: 0 },
          { text: "Only letters, numbers and _ are allowed.", met: true, line: 1 },
          { text: "Usernames must be unique.", met: false, line: 2 }
        ],
        code: ["if (name.length < 3 || name.length > 20) return \"Use 3–20 characters\";", "if (!/^[a-zA-Z0-9_]+$/.test(name)) return \"Letters, numbers and _ only\";", "await db.users.update(userId, { name });", "return \"Saved\";"],
        scopeCreep: "", scopeNote: "The PR also adds one unit test for each rule.",
        explanation: "Length and characters are checked (lines 1 and 2). Nothing checks whether another user already has the name before saving (line 3). Adding tests for the rules is part of the job, not scope creep.",
        concept: "Not every extra is scope creep. Tests for the ticket’s own rules belong in the PR."
      },
      {
        vid: "sc-search", difficulty: 2, ticketId: "SEARCH-12", ticketTitle: "Product search",
        ticketText: "Match product names ignoring uppercase and lowercase, return at most 20 results, and return nothing for an empty search.",
        intro: "Check the AI’s search function against SEARCH-12. Mark each criterion, then tap the best evidence line.",
        requirements: [
          { text: "Matching ignores uppercase and lowercase.", met: false, line: 3 },
          { text: "At most 20 results are returned.", met: true, line: 5 },
          { text: "An empty search returns no results.", met: true, line: 1 }
        ],
        code: ["function search(products, q) {", "  if (!q) return [];", "  const term = q.toLowerCase();", "  const hits = products.filter(p => p.name.includes(term));", "  trackEvent(\"search\", { q, user: currentUser.email });", "  return hits.slice(0, 20);", "}"],
        scopeCreep: "The PR also sends every search, with the user’s email, to analytics. The ticket never asked for tracking.",
        explanation: "The search term is lowercased but the product name isn’t, so \"lamp\" won’t match \"Lamp\" (line 4). The 20-result limit and the empty-search rule are met. Sending emails to analytics is unrequested and a privacy risk.",
        concept: "Half a fix is still a bug: both sides of a case-insensitive comparison must be lowercased."
      },
      {
        vid: "sc-reset", difficulty: 3, ticketId: "AUTH-88", ticketTitle: "Password reset link",
        ticketText: "Reset links expire after 30 minutes, work only once, and the response never reveals whether an email has an account.",
        intro: "Check the AI’s password-reset request handler against AUTH-88. Mark each criterion, then tap the best evidence line.",
        requirements: [
          { text: "Links expire after 30 minutes.", met: true, line: 3 },
          { text: "A link works only once.", met: false, line: 3 },
          { text: "The response never reveals whether an email has an account.", met: false, line: 1 }
        ],
        code: ["const user = await db.users.findByEmail(email);", "if (!user) return res.status(404).json({ error: \"No account with that email\" });", "const token = crypto.randomBytes(32).toString(\"hex\");", "await db.resets.insert({ userId: user.id, token, expiresAt: Date.now() + 30 * 60 * 1000 });", "await mailer.send(user.email, resetLink(token));", "return res.json({ ok: true });"],
        scopeCreep: "", scopeNote: "The PR creates the token with crypto.randomBytes(32).",
        explanation: "Expiry is stored (line 4). Nothing records that a token was used, so it works repeatedly (line 4 has no used flag). Line 2 tells attackers which emails have accounts. A strong random token is good practice, not scope creep.",
        concept: "Security rules hide in error messages. Compare what the response says for each case."
      }
    ],
    "ai-code-audit": [
      {
        vid: "aa-upload", difficulty: 1, intro: "Before this avatar upload ships, tap the line that needs a closer look.",
        code: ["app.post(\"/avatar\", upload.single(\"file\"), async (req, res) => {", "  const name = req.file.originalname;", "  await fs.writeFile(\"public/uploads/\" + name, req.file.buffer);", "  res.json({ url: \"/uploads/\" + name });", "});"], badLines: [2],
        explanation: "The file is saved under the name the user chose, with no type or size check. A name like \"../index.html\" can overwrite other files, and anyone can upload a script.",
        concept: "Never trust a file name, type or size that comes from the user."
      },
      {
        vid: "aa-delete", difficulty: 2, intro: "This delete route passed its tests. Tap every line that needs a closer look.",
        code: ["app.delete(\"/api/posts/:id\", requireLogin, async (req, res) => {", "  const post = await db.posts.find(req.params.id);", "  await db.posts.delete(req.params.id);", "  console.log(\"deleted\", post, req.headers.authorization);", "  res.json({ ok: true });", "});"], badLines: [2, 3],
        explanation: "Any logged-in user can delete anyone’s post, because nothing checks that post.authorId is the current user. The log line also writes the user’s authorization token into the logs.",
        concept: "Logged in is not the same as allowed. Check ownership, and never log secrets."
      },
      {
        vid: "aa-export", difficulty: 3, intro: "The AI added an orders export. Tap every line that needs a closer look.",
        code: ["app.get(\"/api/export\", requireLogin, async (req, res) => {", "  const rows = await db.orders.all();", "  const csv = rows.map(r => [r.id, r.email, r.cardNumber, r.total].join(\",\")).join(\"\\n\");", "  res.setHeader(\"Content-Type\", \"text/csv\");", "  res.send(csv);", "});"], badLines: [1, 2],
        explanation: "It exports every customer’s orders instead of only the current user’s (line 2), and it includes full card numbers (line 3). Setting the CSV content type is fine.",
        concept: "Ask two questions of any export: whose data is it, and which fields should leave the system?"
      }
    ],
    "tests-that-lie": [
      {
        vid: "tl-username", difficulty: 1, intro: "The ticket says usernames must be 3–20 characters. Tap the tests that look green but don’t prove that rule.",
        items: [
          { id: "t1", title: "Accepts \"sam_99\"", detail: "Checks one normal, valid name." },
          { id: "t2", title: "Rejects \"ab\"", detail: "Checks a 2-character name is refused." },
          { id: "t3", title: "Rejects a 21-character name", detail: "Checks the upper limit is refused." },
          { id: "t4", title: "validateName returns a string", detail: "Checks only the return type." }
        ],
        answers: ["t1", "t4"],
        explanation: "A valid name and a return-type check pass even with no length limits at all. Only the 2-character and 21-character tests prove the boundaries.",
        concept: "A good test fails when the rule is missing. Ask: would this test still pass without the feature?"
      },
      {
        vid: "tl-search", difficulty: 2, intro: "The ticket says search ignores case and returns at most 20 results. Tap the tests that don’t prove it.",
        items: [
          { id: "t1", title: "\"lamp\" finds \"Lamp\"", detail: "Different case in the query and the product name." },
          { id: "t2", title: "\"lamp\" finds \"lamp\"", detail: "Same case in both." },
          { id: "t3", title: "100 matches return 20 results", detail: "More matches than the limit." },
          { id: "t4", title: "5 matches return 5 results", detail: "Fewer matches than the limit." }
        ],
        answers: ["t2", "t4"],
        explanation: "Same-case matching works even if case is ignored nowhere, and 5 results never reach the limit. Only different-case input and more than 20 matches exercise the rules.",
        concept: "Test the edge the rule is about, not the easy middle."
      },
      {
        vid: "tl-reset", difficulty: 3, intro: "The ticket says reset links expire after 30 minutes and work only once. Tap the tests that don’t prove it.",
        items: [
          { id: "t1", title: "A link used at 29 minutes works", detail: "Only the valid side of the time limit." },
          { id: "t2", title: "A link used at 31 minutes is rejected", detail: "Moves the clock past the limit." },
          { id: "t3", title: "Resets a password with checkToken mocked to return true", detail: "The token check is replaced by a fake." },
          { id: "t4", title: "Using the same link twice fails the second time", detail: "Real token, used twice." }
        ],
        answers: ["t1", "t3"],
        explanation: "The 29-minute test passes even if links never expire. Mocking checkToken to always succeed means the real expiry and single-use logic never runs.",
        concept: "A test that mocks away the logic under test proves nothing about that logic."
      }
    ],
    "spec-builder": [
      {
        vid: "sbd-reset", difficulty: 1, intro: "A product manager says, “Add forgot password.” Pick the acceptance criteria you’d give the AI.",
        items: [
          { id: "c1", title: "Reset links expire after 30 minutes.", detail: "A clear time limit." },
          { id: "c2", title: "The response is the same whether or not the email has an account.", detail: "Doesn’t leak who has an account." },
          { id: "c3", title: "Make the login page look more modern.", detail: "A visual wish, not part of the request." },
          { id: "c4", title: "A reset link works only once.", detail: "Prevents reuse." }
        ],
        answers: ["c1", "c2", "c4"],
        explanation: "Expiry, no account leaks and single use are testable rules for the feature. A redesign is a separate request.",
        concept: "Each criterion should be something a test can pass or fail."
      },
      {
        vid: "sbd-search", difficulty: 2, intro: "The request is “Add search to the products page.” Pick the acceptance criteria you’d give the AI.",
        items: [
          { id: "c1", title: "Matching ignores uppercase and lowercase.", detail: "Defines how matching works." },
          { id: "c2", title: "Show at most 20 results, newest first.", detail: "Defines the limit and order." },
          { id: "c3", title: "Search should be fast and smart.", detail: "Sounds good, but can’t be tested." },
          { id: "c4", title: "An empty search shows no results and no error.", detail: "Defines the edge case." },
          { id: "c5", title: "Switch to the newest search library.", detail: "A technical choice nobody asked for." }
        ],
        answers: ["c1", "c2", "c4"],
        explanation: "Case rules, limit and order, and the empty case are specific and testable. “Fast and smart” is vague, and swapping libraries is scope creep.",
        concept: "Vague words like fast, smart or better aren’t criteria until they have a number or an example."
      },
      {
        vid: "sbd-export", difficulty: 3, intro: "The request is “Let users export their order history.” Pick the acceptance criteria you’d give the AI.",
        items: [
          { id: "c1", title: "A user can export only their own orders.", detail: "Defines access." },
          { id: "c2", title: "Card numbers are masked to the last 4 digits.", detail: "Defines sensitive fields." },
          { id: "c3", title: "The file is a CSV with date, items and total columns.", detail: "Defines the format." },
          { id: "c4", title: "Make it work for everyone.", detail: "Vague." },
          { id: "c5", title: "Also add PDF, Excel and JSON exports.", detail: "Three extra formats." },
          { id: "c6", title: "1,000 orders export in under 10 seconds.", detail: "A measurable speed target." }
        ],
        answers: ["c1", "c2", "c3", "c6"],
        explanation: "Access, masking, format and a measurable speed target are all testable. “Work for everyone” is vague, and three extra formats are scope creep.",
        concept: "Strong specs cover who can do it, what data is included, the format and a measurable limit."
      }
    ],
    "security-spot": [
      {
        vid: "ss-xss", difficulty: 1, intro: "This shows user comments on a page. Tap the line that could create a security problem.",
        code: ["function renderComment(comment) {", "  const div = document.createElement(\"div\");", "  div.innerHTML = \"<b>\" + comment.author + \"</b>: \" + comment.text;", "  list.appendChild(div);", "}"], badLines: [2],
        explanation: "innerHTML turns user text into real HTML, so a comment containing a script or an image with an onerror handler runs in every reader’s browser (XSS). Use textContent for user text.",
        concept: "User text goes in with textContent, never innerHTML."
      },
      {
        vid: "ss-redirect", difficulty: 2, intro: "The AI added a redirect helper. Tap every line that could create a security problem.",
        code: ["const PAYMENT_SECRET = \"demo-secret-123\";", "app.get(\"/go\", (req, res) => {", "  const next = req.query.next;", "  res.redirect(next);", "});"], badLines: [0, 3],
        explanation: "The secret is hard-coded in the source, so anyone with the code has it. It belongs in an environment variable. The redirect sends users to any address in the link, which phishing emails can abuse (an open redirect). Only allow known paths.",
        concept: "Secrets live outside the code, and redirects only go to places you allow."
      },
      {
        vid: "ss-exec", difficulty: 3, intro: "This route runs a named report. Tap every line that could create a security problem.",
        code: ["app.post(\"/api/run-report\", requireLogin, async (req, res) => {", "  const { reportName } = req.body;", "  exec(\"node reports/\" + reportName + \".js\", (err, out) => {", "    if (err) return res.status(500).send(err.stack);", "    res.send(out);", "  });", "});"], badLines: [2, 3],
        explanation: "reportName goes straight into a shell command, so \"x; rm -rf ~\" runs whatever an attacker types (command injection). Check it against a list of known reports. Sending err.stack also reveals file paths and internals.",
        concept: "User input never builds a shell command, and errors shown to users stay generic."
      }
    ],
    "debug-detective": [
      {
        vid: "dd-trim", difficulty: 1, intro: "Users say Save sometimes does nothing. It started after yesterday’s deploy.",
        code: ["11:02  POST /api/profile 500", "11:02  TypeError: Cannot read properties of undefined (reading 'trim')", "11:03  POST /api/profile 200"],
        question: "What is the best first debugging step?",
        options: ["Wrap the whole save handler in try/catch so the error goes away.", "Find which field is undefined in the failing requests, reproduce with that input, then fix it.", "Roll back every deploy from the last month."], answer: 1,
        explanation: "The error tells you a value is missing before .trim(). Reproducing with the failing input finds the cause. Hiding the error leaves Save broken.",
        concept: "Read the error message first. It usually names the line and the missing value."
      },
      {
        vid: "dd-timezone", difficulty: 2, intro: "A test passes on your laptop but fails in CI, only for runs between 00:00 and 05:30 IST.",
        code: ["expect(getTodayLabel(order.date)).toBe(\"Today\");", "// CI runs in UTC; your laptop runs in IST (UTC+5:30)"],
        question: "What is the most likely cause?",
        options: ["The CI machine is slower than your laptop.", "The test depends on the time zone and the clock, so the date differs between IST and UTC in that window.", "The test framework has a random bug."], answer: 1,
        explanation: "Between 00:00 and 05:30 IST it is still the previous day in UTC, so \"today\" differs. Fix the clock and time zone in the test.",
        concept: "Failures at certain times of day point at time zones or clocks. Control them in tests."
      },
      {
        vid: "dd-nplus1", difficulty: 3, intro: "After an AI refactor that “only tidied the code”, the dashboard takes 30 seconds to load.",
        code: ["for (const user of users) {", "  user.orders = await db.orders.findByUser(user.id);", "}", "// users.length ≈ 2,000"],
        question: "What is the most useful first move?",
        options: ["Ask the AI to “make it faster” and merge whatever it returns.", "Measure: count the database queries per page load and compare with the version before the refactor.", "Move to a bigger server."], answer: 1,
        explanation: "The loop makes one query per user: about 2,000 queries, one after another. Measuring confirms it. Then fetch all orders in one query.",
        concept: "Measure before you optimise. One query per item in a loop (N+1) is a common hidden cost."
      }
    ],
    "code-fix": [
      {
        vid: "cf-qty", difficulty: 1, functionName: "clampQty", ticketId: "CART-17",
        ticketText: "Quantity must be a whole number from 1 to 10. Round decimals down.",
        intro: "The AI’s quantity helper returns whatever it’s given. Fix it so every test passes.",
        starterCode: "function clampQty(qty) {\n  return qty;\n}",
        tests: [{ args: [5], expected: 5 }, { args: [0], expected: 1 }, { args: [14], expected: 10 }, { args: [3.7], expected: 3 }],
        successText: "Every test passes. The quantity is rounded down and kept between 1 and 10.",
        concept: "Turn each rule in the ticket into a test, including both limits."
      },
      {
        vid: "cf-slug", difficulty: 3, functionName: "slugify", ticketId: "BLOG-9",
        ticketText: "Turn a title into a URL slug: lowercase, words joined by single hyphens, no symbols, and no hyphen at the start or end.",
        intro: "The AI’s slugify works for one simple title. Fix it so every test passes.",
        starterCode: "function slugify(title) {\n  return title.toLowerCase().replace(\" \", \"-\");\n}",
        tests: [{ args: ["Hello World"], expected: "hello-world" }, { args: ["  Merge  Defender  "], expected: "merge-defender" }, { args: ["AI writes, you verify!"], expected: "ai-writes-you-verify" }],
        successText: "Every test passes, including extra spaces and punctuation.",
        concept: "One passing example proves little. Test spacing, symbols and the edges."
      }
    ],
    "review-pr": [
      {
        vid: "rp-reset", difficulty: 3, ticketId: "AUTH-88",
        ticket: "Reset links expire after 30 minutes, work only once, and never reveal whether an email has an account.",
        botSays: "I built password reset and improved the error messages, so users know exactly what went wrong. Ready to merge?",
        intro: "DevBot opened a PR for AUTH-88. Review it against the ticket. Flag the real gaps and approve the good parts.",
        issues: [
          { id: "reveal", title: "Unknown emails now get “No account with that email”.", shouldFlag: true, reply: "You’re right, that tells attackers which emails have accounts. I’ll return the same message either way." },
          { id: "once", title: "Tokens are never marked as used after a reset.", shouldFlag: true, reply: "Good catch. A link can be reused until it expires. I’ll mark it used." },
          { id: "expiry", title: "Links expire 30 minutes after they are created.", shouldFlag: false, reply: "That part matches the ticket." },
          { id: "token", title: "Tokens come from crypto.randomBytes(32).", shouldFlag: false, reply: "Thanks, a strong random token is the right choice." }
        ],
        explanation: "Two gaps: the error message reveals which emails exist, and tokens can be reused. The 30-minute expiry and the random token are correct, so approve them.",
        concept: "“Friendlier” error messages can break a security rule. Review messages against the ticket too."
      }
    ],
    "incident": [
      {
        vid: "in-cache", difficulty: 3, intro: "Customers report seeing other people’s order history after an AI change to caching. You’re on call.",
        code: ["09:40  cache key changed: \"orders\" (was \"orders:\" + userId)", "09:41  deploy complete", "09:52  support: 3 customers see someone else’s orders"],
        question: "What’s your safest first move?",
        options: ["Wait for more reports to be sure it’s real.", "Roll back the cache change, clear the cache, confirm with a test account, and tell the privacy or security owner.", "Quietly fix the key and redeploy without telling anyone."], answer: 1,
        explanation: "This is a data leak, so stop it first: roll back and clear the cache. Then verify, and involve the people responsible for privacy. Hiding it makes things worse.",
        concept: "With a data leak: stop it, verify, then escalate and communicate honestly."
      }
    ]
  }
};
