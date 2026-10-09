/* AI Code Check content (Developer Core levels + AI Engineer teaser). Ported from Deepak's version on main. */
window.XP_AICHECK = {
  coreLevels: [
    { id: 1, name: "Read It", subtitle: "Understand code you didn’t write.", icon: "📖", color: "lavender", skill: "Code comprehension", games: ["predict-output", "explain-code", "spot-bug"], boss: "code-fix" },
    { id: 2, name: "Check It", subtitle: "Does it match the ticket, and nothing else?", icon: "🔍", color: "mint", skill: "Spec verification", games: ["spec-check", "ai-code-audit", "tests-that-lie"], boss: "review-pr" },
    { id: 3, name: "Direct It & Own It", subtitle: "Ask for the right thing. Own what ships.", icon: "🧭", color: "peach", skill: "Requirements, security and ownership", games: ["spec-builder", "security-spot", "debug-detective"], boss: "incident" }
  ],
  aiTrack: { name: "AI Engineer", subtitle: "Same game engines, new AI-specific challenges.", games: ["hallucination-hunter", "prompt-fix"] },
  games: {
    "predict-output": {
      id: "predict-output", title: "Predict the Output", engine: "CHOICE", level: 1, kind: "choice", skill: "Comprehension",
      intro: "Read the AI-written helper. What number comes back?",
      code: ["function total(items) {", "  let sum = 0;", "  for (const item of items) {", "    sum += item.price * item.qty;", "  }", "  return sum;", "}", "total([{price: 3, qty: 2}, {price: 4, qty: 1}])"],
      question: "What does the final line return?", options: ["7", "10", "14", "24"], answer: 1,
      explanation: "The first item adds 3 × 2 = 6. The second adds 4 × 1 = 4. The total is 10.",
      concept: "Trace the values through each loop. Don’t guess from the last line alone.", xp: 50
    },
    "explain-code": {
      id: "explain-code", title: "Explain This Code", engine: "CHOICE", level: 1, kind: "choice", skill: "Code comprehension",
      intro: "A teammate asks what this helper does. Pick the most accurate explanation.",
      code: ["function uniqueEmails(users) {", "  const seen = new Set();", "  return users.filter(user => {", "    if (seen.has(user.email)) return false;", "    seen.add(user.email);", "    return true;", "  });", "}"],
      question: "What does it return?",
      options: ["The first user for each exact email string; later duplicates are skipped.", "Every user, sorted alphabetically by email.", "One user per email, ignoring uppercase and lowercase differences."], answer: 0,
      explanation: "The Set remembers exact email strings. filter keeps the first matching user and skips later duplicates. The comparison is case-sensitive.",
      concept: "Describe what the code actually does, including the small details it does not handle.", xp: 50
    },
    "spot-bug": {
      id: "spot-bug", title: "Spot the Bug", engine: "TAP THE LINE", level: 1, kind: "tapLine", skill: "Debugging",
      intro: "The cart total is too low whenever someone adds more than one of an item. Tap the line that causes it.",
      code: ["function addItem(cart, item) {", "  cart.items.push(item);", "  cart.total += item.price;", "  return cart;", "}"], badLines: [2],
      explanation: "The total adds the price once, even when item.qty is greater than one. It should add item.price multiplied by item.qty.",
      concept: "Compare every calculation with the quantity and edge cases in the ticket.", xp: 60
    },
    "spec-check": {
      id: "spec-check", title: "Spec Check", engine: "TICKET + DIFF", level: 2, kind: "specCheck", skill: "Spec verification",
      intro: "The ticket says: apply an active coupon, allow it once per customer, reject expired coupons, and never let the total fall below ₹0. Mark each criterion, then tap the best evidence line.",
      requirements: [
        { text: "The coupon discount is applied to the cart total.", met: true, line: 2 },
        { text: "A customer can use this coupon only once.", met: false, line: 0 },
        { text: "Expired coupons are rejected.", met: true, line: 1 },
        { text: "The final total cannot be below ₹0.", met: false, line: 2 }
      ],
      code: ["if (!coupon.active) return { error: \"Invalid coupon\" };", "if (coupon.expiresAt < Date.now()) return { error: \"Expired\" };", "const total = cart.total - coupon.amount;", "return { total, code: coupon.code };"],
      scopeCreep: "The PR also renames formatPrice across six files. The ticket never asked for that change.",
      explanation: "Criteria 1 and 3 are met. The code never records that a customer used the coupon (criterion 2), and a large coupon can push the total below ₹0 (criterion 4). The formatPrice rename is scope creep.",
      concept: "Tests passing ≠ requirement met. Check every acceptance criterion and flag work nobody asked for.", xp: 120
    },
    "ai-code-audit": {
      id: "ai-code-audit", title: "AI Code Audit", engine: "TAP THE LINE", level: 2, kind: "tapLine", skill: "Security and review",
      intro: "Before this login route ships, tap every line that needs a closer look.",
      code: ["app.post(\"/login\", async (req, res) => {", "  const user = await db.findByEmail(req.body.email);", "  if (user.password === req.body.password) {", "    res.json({ token: user.apiKey });", "  }", "});"],
      badLines: [2, 3],
      explanation: "The route compares a submitted password directly instead of using a password verification function, then returns an internal API key to the client.",
      concept: "A green build does not make a security-sensitive code path safe.", xp: 80
    },
    "tests-that-lie": {
      id: "tests-that-lie", title: "Tests That Lie", engine: "TAP THE TEST", level: 2, kind: "multiSelect", skill: "Test quality",
      intro: "The ticket requires one coupon use per customer and rejects expired coupons. Tap the tests that look green but don’t prove those requirements.",
      items: [
        { id: "t1", title: "Applies a valid coupon", detail: "Checks that the total changes for a valid code." },
        { id: "t2", title: "Rejects an expired coupon", detail: "Checks one expired-code example." },
        { id: "t3", title: "Prevents reuse by the same customer", detail: "Applies the same coupon twice to the same user and expects the second try to fail." },
        { id: "t4", title: "Works for two different customers", detail: "Uses two users and checks each can apply the coupon once." }
      ],
      answers: ["t1", "t2"],
      explanation: "The first two tests can pass while the single-use rule is still missing. The other tests actually exercise same-user reuse and separate users.",
      concept: "A test proves only the behavior it checks. Green tests can still miss the ticket.", xp: 70
    },
    "spec-builder": {
      id: "spec-builder", title: "Spec Builder", engine: "SORT THE CRITERIA", level: 3, kind: "multiSelect", skill: "Requirement writing",
      intro: "A product manager says, “Add a coupon feature.” Pick the acceptance criteria you’d give the AI before asking it to build.",
      items: [
        { id: "c1", title: "A coupon can be used once per customer.", detail: "State the reuse rule." },
        { id: "c2", title: "Expired or unknown coupon codes are rejected.", detail: "Define invalid and expired behavior." },
        { id: "c3", title: "The order total never drops below ₹0.", detail: "Define the lower bound." },
        { id: "c4", title: "Rename the pricing helpers across the project.", detail: "A broad refactor that was not requested." },
        { id: "c5", title: "Add a sparkle animation to the checkout button.", detail: "A visual extra with no product requirement." }
      ],
      answers: ["c1", "c2", "c3"],
      explanation: "The first three criteria make expected behavior testable. The refactor and animation are extra scope, not acceptance criteria for the request.",
      concept: "A clear requirement gives the AI a boundary: what to build, what not to change, and how to verify it.", xp: 70
    },
    "security-spot": {
      id: "security-spot", title: "Security Spot", engine: "TAP THE LINE", level: 3, kind: "tapLine", skill: "Security",
      intro: "This route searches for an email address. Tap every line that could create a security problem.",
      code: ["app.get(\"/users\", async (req, res) => {", "  const email = req.query.email;", "  const sql = \"SELECT * FROM users WHERE email = '\" + email + \"'\";", "  const rows = await db.query(sql);", "  res.json(rows);", "});"],
      badLines: [2, 3],
      explanation: "Putting untrusted input into a SQL string can allow injection. Use a parameterized query, and check that the caller is allowed to see the returned users.",
      concept: "Treat user input as data, not as part of a command.", xp: 80
    },
    "debug-detective": {
      id: "debug-detective", title: "Debug Detective", engine: "CLUE CARDS", level: 3, kind: "choice", skill: "Debugging",
      intro: "The checkout total is sometimes negative. The new coupon branch is the only code path that changes the total.",
      code: ["const total = cart.total - coupon.amount;", "return { total, code: coupon.code };"],
      question: "What is the best first debugging step?",
      options: ["Clamp every number in the app to zero.", "Reproduce the issue with a cart smaller than the coupon, then trace the expected behavior.", "Rewrite the checkout service before looking at the input."], answer: 1,
      explanation: "A small reproducible case confirms the trigger and gives you evidence before you change code.",
      concept: "Reproduce → trace → isolate → fix. Start with the smallest failing case.", xp: 60
    },
    "code-fix": {
      id: "code-fix", title: "Code Fix Challenge", engine: "CODE RUNNER BOSS", level: 1, kind: "codeFix", skill: "Code comprehension and testing",
      intro: "The AI wrote this helper. The ticket says a coupon may reduce the total, but the total must never be negative. Fix the function and run the tests.",
      starterCode: "function applyCoupon(total, discount) {\n  return total - discount;\n}",
      tests: [{ total: 100, discount: 20, expected: 80 }, { total: 50, discount: 80, expected: 0 }, { total: 0, discount: 10, expected: 0 }],
      concept: "Read the requirement, add the missing boundary, and prove it with a small edge-case test.", xp: 220
    },
    "review-pr": {
      id: "review-pr", title: "Review the AI’s Pull Request", engine: "AI REVIEW BOSS", level: 2, kind: "prReview", skill: "Spec verification and review communication",
      intro: "DevBot opened a PR for SHOP-214. Review the changes against the ticket. Some changes are good. Flag real gaps without rejecting the good parts.",
      ticket: "Add a coupon at checkout. It can be used once per customer, and the final total cannot be negative.",
      explanation: "Three changes needed flagging: the missing once-per-customer check, the missing ₹0 floor, and the unrequested rename. The expiry check was correct, so it should be approved.",
      issues: [
        { id: "reuse", title: "No record that this customer already used the coupon.", shouldFlag: true, reply: "Fair point. I check that the coupon is active, but I never check whether this customer used it before." },
        { id: "floor", title: "A large discount can make the final total negative.", shouldFlag: true, reply: "Good catch. I subtract the discount but don’t clamp the result at zero." },
        { id: "rename", title: "formatPrice was renamed across six files.", shouldFlag: true, reply: "You’re right, that refactor wasn’t in the ticket. I’ll keep this PR focused." },
        { id: "expiry", title: "Expired coupons are rejected.", shouldFlag: false, reply: "That part is covered. The expiry check matches the existing coupon rule." }
      ],
      concept: "Review what the change does against the ticket. Flag missing behavior and scope creep; approve the parts that are correct.", xp: 260
    },
    "incident": {
      id: "incident", title: "The 2 AM Incident", engine: "ON-CALL BOSS", level: 3, kind: "choice", skill: "Incident response",
      intro: "Checkout is down after an AI-written coupon change. You’re on call. The logs show totals below zero; the change passed its tests.",
      code: ["02:14  checkout error rate: 38%", "02:15  coupon patch deployed", "02:16  negative total seen for order #demo-104"],
      question: "What’s your safest first move?",
      options: ["Post that the cause is definitely the AI, then wait for a customer report.", "Stabilize checkout by rolling back or disabling the coupon path, then verify recovery and share a factual update.", "Hot-edit the production database until the error disappears."], answer: 1,
      explanation: "Reduce impact first, verify service recovery, then communicate what is confirmed. You can investigate the exact cause once customers are safe.",
      concept: "Stabilize → verify → communicate → investigate → prevent.", xp: 300
    },
    "hallucination-hunter": {
      id: "hallucination-hunter", title: "Hallucination Hunter", engine: "TAP THE CLAIM", level: 0, track: "ai", kind: "multiSelect", skill: "AI output verification",
      intro: "The assistant explains a new library feature. Tap the claims that are not supported by the code or docs shown.",
      items: [
        { id: "h1", title: "The function accepts an array of records.", detail: "The displayed type signature shows Record[]." },
        { id: "h2", title: "It retries failed requests three times by default.", detail: "No retry option or documentation is shown." },
        { id: "h3", title: "The result is a promise.", detail: "The displayed signature includes Promise<Result>." }
      ],
      answers: ["h2"],
      explanation: "The retry claim may sound plausible, but the evidence shown does not support it. Verify unfamiliar behavior in the actual docs or implementation.",
      concept: "Plausible is not the same as verified.", xp: 50
    },
    "prompt-fix": {
      id: "prompt-fix", title: "Prompt Fix", engine: "CHOICE", level: 0, track: "ai", kind: "choice", skill: "Requirement writing",
      intro: "Your prompt says, “Make coupons work better.” The AI added a large refactor but missed the single-use rule.",
      question: "Which revision is most likely to get a reviewable change?",
      options: ["Make the checkout code cleaner and fix coupon issues.", "Allow each customer to use a coupon once. Reject expired codes. Keep the final total at or above ₹0. Do not rename unrelated helpers. Add tests for each rule.", "Rewrite the entire checkout service and use your best judgement."], answer: 1,
      explanation: "The revised request states concrete behavior, tests and a boundary around unrelated work.",
      concept: "Good prompts include outcomes, checks and scope limits.", xp: 50
    }
  }
};
