/* Soft-skills content. There are no right or wrong answers: every option is a reasonable approach,
   and the option a player picks awards XP to the skills it shows (option.xp is { skillId: points }). */
window.DEVQUEST_CONTENT = {
  reels: [
    { id: "trace", title: "Trace before you trust", tag: "CODE READING", icon: "🔎", hook: "AI says this returns 12. Can you spot the tiny twist?", lesson: "Follow the values line by line. Here, the loop adds each price multiplied by its quantity. A test can pass while your mental model is still off.", question: "For items [{price: 2, qty: 3}, {price: 4, qty: 1}], what is the total?", options: ["9", "10", "14"], answer: 1 },
    { id: "spec", title: "The ticket is the map", tag: "SPEC CHECK", icon: "🧾", hook: "The demo passed. The ticket still says one coupon per customer.", lesson: "Turn each sentence in a ticket into a check. Then point to the code or test that proves it. If you cannot point to evidence, mark it unknown instead of assuming.", question: "Which review comment is most useful?", options: ["Looks good to me!", "Where do we reject a second use by the same customer?", "The code could be cleaner."], answer: 1 },
    { id: "scope", title: "Keep the change on a leash", tag: "SCOPE CONTROL", icon: "🪁", hook: "A coupon fix also renames six helpers and changes the checkout colors.", lesson: "Extra changes make reviews harder and can hide bugs. Ask for the ticket-sized fix first. Follow-up ideas can become separate work with their own acceptance checks.", question: "What should you do with unrelated refactors?", options: ["Approve everything because tests are green.", "Ask to split them into a separate change.", "Delete the whole branch."], answer: 1 },
    { id: "sort", title: "Sort needs a comparator", tag: "JAVASCRIPT TRAPS", icon: "🔢", hook: "Your AI sorted the prices. The list looks exactly the same.", lesson: "Without a compare function, sort() compares values as text, so \"100\" comes before \"25\", which comes before \"3\". Pass (a, b) => a - b to sort numbers.", question: "What does [100, 25, 3].sort() return?", options: ["[3, 25, 100]", "[100, 25, 3]", "[25, 3, 100]"], answer: 1 },
    { id: "offbyone", title: "One step too far", tag: "OFF-BY-ONE", icon: "📏", hook: "The loop runs one time more than there are items.", lesson: "Arrays start at index 0, so the last index is length - 1. A condition of i <= items.length reads one slot past the end, which gives undefined rather than an error.", question: "For items = [5, 6, 7] and a loop with i <= items.length, what does the final pass read?", options: ["7", "undefined", "An error is thrown"], answer: 1 },
    { id: "await", title: "Don’t forget to await", tag: "ASYNC", icon: "⏳", hook: "const user = fetchUser(id); and then user.name is undefined.", lesson: "An async function returns a Promise straight away. Without await, you are holding the promise, not the data it will produce.", question: "What is the value of user right after const user = fetchUser(id) when fetchUser is async?", options: ["The user object", "A Promise", "undefined"], answer: 1 }
  ],
  story: {
    id: "coupon-review", title: "Choose Your Move",
    scenes: [
    { speaker: "Maya · Manager", text: "Two of your tasks are both marked urgent, and you can only finish one by Friday. What do you do?", options: ["Tell Maya both are at risk and ask which one matters most.", "Quietly work late and hope you finish both.", "Pick one yourself and don’t mention the other."], points: [2, 0, 1], feedback: ["Great call. You made the trade-off visible and let the priority owner decide.", "Hoping to do everything leads to burnout and surprises.", "Choosing alone can miss what matters most to others. Tell people about the trade-off."] },
    { speaker: "Leo · Teammate", text: "In the meeting, Leo presents your idea as his own. Afterwards he looks a bit awkward. How do you respond?", options: ["Talk to Leo privately: “I noticed the idea was mine. Can we credit it properly next time?”", "Say nothing and stay annoyed.", "Correct him loudly in front of the team."], points: [2, 0, 1], feedback: ["Nice. You were direct, kind, and focused on the next step.", "Silent resentment tends to grow and hurts the working relationship.", "Being direct is good, but a public correction can make people defensive. Try it privately first."] },
    { speaker: "Pip 🦊 · Client call", text: "A client is upset about a missed deadline and starts raising their voice. What happens first?", options: ["Stay calm, acknowledge their frustration, and say what you’ll do next.", "Explain all the reasons it wasn’t your fault.", "End the call until they calm down."], points: [2, 1, 0], feedback: ["Yes. Acknowledging feelings first lowers the temperature, and a clear next step rebuilds trust.", "Explanations can sound like excuses before the person feels heard.", "Ending the call can make a bad moment worse. Stay steady and keep it constructive."] }
    ]
  },
  skills: [
    { id: "leadership", name: "Leadership", desc: "Guide people, create direction and drive outcomes." },
    { id: "communication", name: "Communication", desc: "Express ideas clearly and navigate difficult conversations." },
    { id: "problem-solving", name: "Problem Solving", desc: "Break complex problems into actionable solutions." },
    { id: "collaboration", name: "Collaboration", desc: "Work effectively across teams and perspectives." },
    { id: "time-management", name: "Time Management", desc: "Prioritize work and manage competing demands." },
    { id: "decision-making", name: "Decision Making", desc: "Evaluate trade-offs and make sound decisions." }
  ],
  scenarios: [
    {
      id: "stalled-project", skill: "leadership", title: "The Stalled Project",
      situation: "You are leading a small team on a project that has stalled for two weeks. Energy is low, deadlines are slipping, and nobody is saying why.",
      question: "What do you do first?",
      options: [
        { text: "Call a short reset meeting: restate the goal, ask everyone for one blocker, and assign an owner to each.", xp: { leadership: 35, communication: 10 }, insight: "You create direction fast and make ownership explicit. Watch that quieter people still get space to speak." },
        { text: "Take the hardest tasks yourself so the team can breathe and regain momentum.", xp: { leadership: 15, "problem-solving": 25 }, insight: "You lead from the front and remove pressure. Watch that it doesn’t become a habit that leaves you stretched." },
        { text: "Ask the team what would make the work feel worthwhile, then let them reshape the plan with you.", xp: { leadership: 25, collaboration: 25 }, insight: "You build commitment by sharing the plan. Watch that the team still ends with a clear next step." }
      ]
    },
    {
      id: "new-joiner", skill: "leadership", title: "The New Joiner",
      situation: "A new teammate is struggling in their first month. They rarely ask questions, and their first deliverable is late.",
      question: "How do you support them?",
      options: [
        { text: "Pair with them for a week and work through the next task side by side.", xp: { leadership: 30, collaboration: 15 }, insight: "You invest your own time to build their confidence. Watch your own workload while you do it." },
        { text: "Give them a clear checklist of expectations and agree on a short check-in every Friday.", xp: { leadership: 30, "time-management": 10, communication: 10 }, insight: "You set a clear structure they can follow alone. Watch that it still leaves room for them to ask for help." },
        { text: "Let them work it out with light guidance. Learning by doing is how most people grow.", xp: { leadership: 10, "problem-solving": 20 }, insight: "You give room to grow through experience. Watch that quiet struggles don’t go unnoticed." }
      ]
    },
    {
      id: "bad-news", skill: "communication", title: "Bad News for a Client",
      situation: "A delivery your client is counting on will be a week late. They have not heard anything yet, and they are known to react strongly.",
      question: "How do you tell them?",
      options: [
        { text: "Call them today, lead with the impact on their plans, and bring a revised timeline.", xp: { communication: 35, "decision-making": 10 }, insight: "You are direct and prepared. Watch that you leave space for their reaction before you move to solutions." },
        { text: "Send a detailed email with the full timeline and reasons so they can read it in their own time.", xp: { communication: 25, "time-management": 10 }, insight: "You give them a clear record to refer to. Watch that important news can feel cold in writing." },
        { text: "Ask your account manager to deliver the news, since they have the relationship.", xp: { collaboration: 20, communication: 5 }, insight: "You lean on the person with the strongest trust. Watch that you stay involved so you can answer detail questions." }
      ]
    },
    {
      id: "vague-request", skill: "communication", title: "The Vague Request",
      situation: "A stakeholder sends you a one-line message: “Can we make the dashboard better by next week?” No details.",
      question: "What is your reply?",
      options: [
        { text: "Reply with three short clarifying questions about the goal, the audience, and what “better” means.", xp: { communication: 30, "problem-solving": 15 }, insight: "You get shared clarity before spending effort. Watch that it doesn’t feel like extra work for a busy sender." },
        { text: "Draft your best guess quickly and share it so they can react to something real.", xp: { "problem-solving": 25, "decision-making": 15, communication: 10 }, insight: "You make progress and learn from feedback. Watch the risk of building the wrong thing." },
        { text: "Book a fifteen-minute call to talk it through together.", xp: { communication: 30, collaboration: 10 }, insight: "You use conversation to get depth fast. Watch that you capture what was agreed afterwards." }
      ]
    },
    {
      id: "recurring-error", skill: "problem-solving", title: "The Recurring Error",
      situation: "The same issue has now appeared three times in the last month. Each time it was patched quickly, and each time it came back.",
      question: "What is your approach?",
      options: [
        { text: "Set aside a day to trace the root cause properly, even though it delays other work.", xp: { "problem-solving": 35, "decision-making": 5 }, insight: "You aim for a lasting fix. Watch that the time you spend is agreed with the people waiting on you." },
        { text: "Put in a quick workaround now, and log a ticket to fix the cause properly later.", xp: { "decision-making": 25, "time-management": 15, "problem-solving": 10 }, insight: "You protect today’s delivery and still note the issue. Watch that the ticket doesn’t get lost." },
        { text: "Gather the people who have hit it and compare what each of them noticed.", xp: { collaboration: 25, "problem-solving": 20 }, insight: "You pool different views to see the pattern. Watch that the conversation ends with an owner." }
      ]
    },
    {
      id: "tight-budget", skill: "problem-solving", title: "The Tight Budget",
      situation: "Your project has just lost 30% of its budget, but the launch date and the main goal have not changed.",
      question: "Where do you start?",
      options: [
        { text: "List the must-haves and the nice-to-haves, then cut the nice-to-haves.", xp: { "decision-making": 30, "problem-solving": 20 }, insight: "You simplify by priority. Watch that you check with stakeholders before you cut things they care about." },
        { text: "Look for a creative alternative that reaches the same outcome with fewer resources.", xp: { "problem-solving": 35, leadership: 10 }, insight: "You reframe the problem instead of shrinking it. Watch that the idea is tested before you rely on it." },
        { text: "Ask your stakeholders which outcomes they would trade, and agree the new scope together.", xp: { communication: 20, collaboration: 20, "decision-making": 10 }, insight: "You share the trade-off with the people it affects. Watch that you bring a recommendation to the conversation." }
      ]
    },
    {
      id: "slow-handoff", skill: "collaboration", title: "The Slow Handoff",
      situation: "Another team owns a piece your work depends on. They are slower than planned and not replying quickly.",
      question: "What do you do?",
      options: [
        { text: "Join their stand-up, ask what is blocking them, and offer a hand where you can.", xp: { collaboration: 35, communication: 10 }, insight: "You build the relationship while you unblock the work. Watch that you also protect your own time." },
        { text: "Write down the dependency and the date you need it, and escalate if it slips again.", xp: { communication: 20, "decision-making": 15, "time-management": 5 }, insight: "You make the risk visible and keep a record. Watch that the tone stays supportive." },
        { text: "Re-plan your work so it no longer depends on them.", xp: { "problem-solving": 25, "time-management": 15 }, insight: "You stay in control of your own delivery. Watch that you still tell them how it affects them." }
      ]
    },
    {
      id: "two-approaches", skill: "collaboration", title: "Two Approaches",
      situation: "A teammate you respect wants to solve a problem a different way than you do. You both think your way is better.",
      question: "How do you move forward?",
      options: [
        { text: "Suggest a small experiment to test both approaches and compare the results.", xp: { collaboration: 25, "problem-solving": 25 }, insight: "You turn a debate into evidence. Watch that the experiment is small enough not to become a project of its own." },
        { text: "Go with their approach this time to keep the relationship strong, and raise yours later.", xp: { collaboration: 25, leadership: 5 }, insight: "You value the team’s harmony. Watch that your own view still gets heard." },
        { text: "Make your case with the facts you have, and ask your manager to decide if you stay split.", xp: { "decision-making": 25, communication: 15 }, insight: "You get a clear decision without a long stand-off. Watch that it doesn’t feel like you went over their head." }
      ]
    },
    {
      id: "overloaded-monday", skill: "time-management", title: "Overloaded Monday",
      situation: "It is Monday morning and you have five urgent tasks. Each person who asked says theirs is the most important.",
      question: "How do you plan your week?",
      options: [
        { text: "Rank them by impact and deadline, start on the top two, and renegotiate dates for the rest.", xp: { "time-management": 35, "decision-making": 15 }, insight: "You choose deliberately and tell people early. Watch that you explain your reasoning kindly." },
        { text: "Time-box each task to an hour and rotate through them, so each one moves forward.", xp: { "time-management": 25, "problem-solving": 10 }, insight: "You keep everything moving. Watch that switching tasks doesn’t eat your focus." },
        { text: "Ask your manager and teammates which tasks to hand off or drop.", xp: { communication: 15, collaboration: 15, "time-management": 10 }, insight: "You bring the trade-off to the people who own it. Watch that you arrive with a suggestion too." }
      ]
    },
    {
      id: "constant-interruptions", skill: "time-management", title: "Constant Interruptions",
      situation: "You have a report due Friday, but your chat and inbox keep pulling you away, and you are not getting deep work done.",
      question: "What changes do you make?",
      options: [
        { text: "Block two focus sessions each day, put them on the shared calendar, and say when you will reply.", xp: { "time-management": 30, communication: 10 }, insight: "You protect time and set expectations openly. Watch that urgent matters still have a way to reach you." },
        { text: "Check messages only at set times, in batches, and silence notifications in between.", xp: { "time-management": 30, "decision-making": 5 }, insight: "You build a personal system that you control. Watch that teammates know it so they don’t feel ignored." },
        { text: "Stay available. Helping people when they ask is part of the job, so you will catch up in the evening.", xp: { collaboration: 25, "time-management": 5 }, insight: "You put the team’s needs first. Watch for the cost to your own work and your energy." }
      ]
    },
    {
      id: "quick-fix-or-rebuild", skill: "decision-making", title: "Quick Fix or Rebuild",
      situation: "A tool your team relies on keeps breaking. You can patch it in an afternoon, or spend two weeks rebuilding it properly.",
      question: "What do you decide?",
      options: [
        { text: "Patch it now so the team is unblocked, and schedule the rebuild for next quarter.", xp: { "decision-making": 30, "time-management": 15 }, insight: "You balance today’s needs with the longer view. Watch that the rebuild really gets scheduled." },
        { text: "Commit to the rebuild. It costs more now, but it ends the repeat problems.", xp: { "decision-making": 25, "problem-solving": 20 }, insight: "You invest for the long run. Watch that you tell people what they will wait for in the meantime." },
        { text: "Share both options with the team, hear their views, and decide by the end of the day.", xp: { collaboration: 20, "decision-making": 20, leadership: 5 }, insight: "You decide with context and keep people involved. Watch that you do make the call on time." }
      ]
    },
    {
      id: "incomplete-information", skill: "decision-making", title: "Incomplete Information",
      situation: "You need to choose a vendor today. You have about 60% of the information you would like, and waiting a week would cost you the discount.",
      question: "How do you proceed?",
      options: [
        { text: "Decide today, write down your assumptions, and set a date to review how it is going.", xp: { "decision-making": 35, communication: 10 }, insight: "You act with confidence and stay open to change. Watch that the review date is honoured." },
        { text: "Run a quick small test with each vendor to fill in the biggest gaps, then decide.", xp: { "problem-solving": 25, "decision-making": 15 }, insight: "You reduce the biggest risk first. Watch that the test doesn’t cost the discount you were trying to keep." },
        { text: "Ask a colleague who has used these vendors before and weigh their experience.", xp: { collaboration: 20, "decision-making": 10 }, insight: "You borrow experience you don’t have. Watch that the final decision is still clearly yours." }
      ]
    }
  ],
  /* Technical skills: game-style challenges with a correct answer. xp is the maximum a challenge can award to its skill. */
  techSkills: [
    { id: "html", name: "HTML", desc: "Structure pages with meaningful, accessible markup." },
    { id: "css", name: "CSS", desc: "Style and lay out pages that adapt to any screen." },
    { id: "javascript", name: "JavaScript", desc: "Add behaviour and logic to make pages interactive." }
  ],
  challenges: [
    { id: "html-hunt-bug", skill: "html", kind: "tapLine", title: "Hunt the Accessibility Bugs", xp: 40, emoji: "🔎",
      prompt: "This sign-up form has two accessibility problems. Tap each line that causes one.",
      code: ["<form action=\"/subscribe\">", "  <label>Email</label>", "  <input type=\"email\" name=\"email\">", "  <img src=\"logo.png\">", "  <button>Join</button>", "</form>"], bad: [1, 3],
      explain: "The label isn't linked to the input (use for and id, or wrap the input), and the image has no alt text for screen readers." },
    { id: "html-build-page", skill: "html", kind: "arrange", title: "Build the Page", xp: 40, emoji: "🧱",
      prompt: "Tap the pieces in the order they appear in a valid HTML document.",
      items: ["<body> … </body>", "<!DOCTYPE html>", "</html>", "<head> … </head>", "<html lang=\"en\">"], answer: [1, 4, 3, 0, 2],
      explain: "The doctype comes first, then the html element, with head before body, and the closing html tag last." },
    { id: "html-match-tags", skill: "html", kind: "match", title: "Match the Tags", xp: 40, emoji: "🧩",
      prompt: "Tap a tag, then tap what it is for. Pair all four.",
      pairs: [["<nav>", "Holds the main navigation links"], ["<label>", "Names a form field for screen readers"], ["<button>", "A clickable action"], ["<ul>", "A bulleted list"]], rightOrder: [1, 3, 0, 2],
      explain: "Choosing tags for their meaning, not their looks, makes pages easier to use, search and navigate with assistive tech." },
    { id: "html-complete-link", skill: "html", kind: "fill", title: "Complete the Link", xp: 40, emoji: "✍️",
      prompt: "Type the missing attribute names to make a link that opens in a new tab safely.",
      code: ["<a ___=\"https://example.com\" target=\"_blank\" ___=\"noopener\">Visit</a>"], blanks: [["href"], ["rel"]],
      explain: "href holds the destination, and rel=\"noopener\" stops the new tab from controlling the page that opened it." },
    { id: "css-centre", skill: "css", kind: "live", title: "Dead Centre", xp: 50, emoji: "🎯",
      prompt: "Centre the blue box inside the grey container. Edit the CSS and watch the preview.",
      html: "<div class=\"container\"><div class=\"box\"></div></div>",
      base: ".container { width: 240px; height: 160px; background: #e5e7eb; } .box { width: 60px; height: 60px; background: #2f5fd0; }",
      starter: ".container {\n  /* your CSS here */\n}", check: "center",
      explain: "Flexbox does it in three lines on the container: display: flex; justify-content: center; align-items: center. Grid with place-items: center works too." },
    { id: "css-row-gap", skill: "css", kind: "live", title: "Cards in a Row", xp: 50, emoji: "🃏",
      prompt: "Lay the three cards out side by side with a 16px gap between them.",
      html: "<div class=\"cards\"><div class=\"card\">1</div><div class=\"card\">2</div><div class=\"card\">3</div></div>",
      base: ".card { width: 56px; height: 56px; background: #2f5fd0; color: #fff; display: grid; place-items: center; font: 700 16px sans-serif; }",
      starter: ".cards {\n  /* your CSS here */\n}", check: "row-gap",
      explain: "display: flex puts the children in a row, and gap: 16px adds space between them without extra margins." },
    { id: "css-hunt-bug", skill: "css", kind: "tapLine", title: "Hunt the CSS Bugs", xp: 40, emoji: "🐛",
      prompt: "Two lines in this rule will not work. Tap them.",
      code: [".card {", "  display: flex", "  padding: 16px;", "  background: #fff;", "  colour: #333;", "}"], bad: [1, 4],
      explain: "The first declaration is missing its semicolon, and colour is not a CSS property (it should be color)." },
    { id: "css-box-model", skill: "css", kind: "arrange", title: "Stack the Box Model", xp: 40, emoji: "📦",
      prompt: "Tap the layers of the box model from the outside in.",
      items: ["Padding", "Margin", "Content", "Border"], answer: [1, 3, 0, 2],
      explain: "From the outside in: margin, border, padding, then the content itself." },
    { id: "js-fix-function", skill: "javascript", kind: "run", title: "Fix the Function", xp: 50, emoji: "🛠️",
      prompt: "This function should add up the prices, but it breaks. Fix it so every test passes.",
      fn: "total", starter: "function total(prices) {\n  let sum = 0;\n  for (let i = 0; i <= prices.length; i++) {\n    sum += prices[i];\n  }\n  return sum;\n}",
      tests: [{ args: [[1, 2, 3]], expected: 6 }, { args: [[]], expected: 0 }, { args: [[5]], expected: 5 }],
      explain: "i <= prices.length runs one step too far, so prices[i] is undefined on the last pass. Use i < prices.length." },
    { id: "js-write-function", skill: "javascript", kind: "run", title: "Write It Yourself", xp: 50, emoji: "⌨️",
      prompt: "Write isEven(n) so it returns true for even numbers and false for odd ones.",
      fn: "isEven", starter: "function isEven(n) {\n  // your code here\n}",
      tests: [{ args: [2], expected: true }, { args: [7], expected: false }, { args: [0], expected: true }, { args: [-4], expected: true }],
      explain: "n % 2 === 0 is true for every even number, including 0 and negatives." },
    { id: "js-run-order", skill: "javascript", kind: "arrange", title: "Run Order", xp: 40, emoji: "⏱️",
      prompt: "Tap the lines in the order they are printed.",
      code: ["console.log(\"A\");", "setTimeout(() => console.log(\"B\"), 0);", "Promise.resolve().then(() => console.log(\"C\"));", "console.log(\"D\");"],
      items: ["B", "D", "A", "C"], answer: [2, 1, 3, 0],
      explain: "Synchronous code runs first (A, D). Promise callbacks run next (C), and timers run after that (B)." },
    { id: "js-predict-type", skill: "javascript", kind: "fill", title: "Predict and Type", xp: 40, emoji: "🔮",
      prompt: "Work out what this prints, then type it exactly (separate values with a space).",
      code: ["const nums = [1, 2, 3];", "const out = nums.map(n => n * 2);", "console.log(out.length, out[2]);"], ask: "It prints:", blanks: [["3 6"]],
      explain: "map builds [2, 4, 6]. Its length is 3 and the item at index 2 is 6." },
    { id: "html-landmarks", skill: "html", kind: "arrange", title: "Landmark order", xp: 45, emoji: "🧭",
      prompt: "Tap the page landmarks in the order they usually appear from top to bottom.",
      items: ["<footer>", "<header>", "<main>"], answer: [1, 2, 0],
      explain: "Readers and assistive tech expect header first, then main content, then footer." },
    { id: "html-input-types", skill: "html", kind: "match", title: "Input types", xp: 45, emoji: "⌨️",
      prompt: "Match each input type to what it is best for.",
      pairs: [["type=\"email\"", "Email addresses"], ["type=\"checkbox\"", "On/off choices"], ["type=\"number\"", "Numeric values"], ["type=\"search\"", "Search fields"]], rightOrder: [0, 1, 2, 3],
      explain: "Picking the right type gives better keyboards on mobile and clearer validation." },
    { id: "html-viewport-meta", skill: "html", kind: "fill", title: "Mobile viewport", xp: 45, emoji: "📱",
      prompt: "Type the missing attribute name so the page scales correctly on phones.",
      code: ["<meta name=\"viewport\" ___=\"width=device-width, initial-scale=1\">"], blanks: [["content"]],
      explain: "The viewport meta tag tells mobile browsers to use the device width instead of pretending to be a desktop page." },
    { id: "html-fake-control", skill: "html", kind: "tapLine", title: "Real controls only", xp: 45, emoji: "♿",
      prompt: "Tap the line that is not a proper interactive control for keyboard and screen-reader users.",
      code: ["<button type=\"submit\">Send</button>", "<div class=\"btn\" onclick=\"send()\">Send</div>", "<a href=\"/help\">Help</a>"], bad: [1],
      explain: "A div with onclick is not focusable or announced as a button unless you rebuild what native elements give you for free." },
    { id: "css-stack-column", skill: "css", kind: "live", title: "Stack the cards", xp: 50, emoji: "📱",
      prompt: "Stack the two cards vertically with a 12px gap between them.",
      html: "<div class=\"stack\"><div class=\"card\">A</div><div class=\"card\">B</div></div>",
      base: ".stack { width: 100px; background: #f3f4f6; padding: 8px; } .card { height: 36px; background: #705ce8; color: #fff; display: grid; place-items: center; font: 700 14px sans-serif; border-radius: 8px; }",
      starter: ".stack {\n  /* flex column + gap */\n}", check: "column-stack",
      explain: "display: flex; flex-direction: column; gap: 12px; stacks children top to bottom with even spacing." },
    { id: "css-hero-style", skill: "css", kind: "live", title: "Style the hero", xp: 50, emoji: "🅰️",
      prompt: "Make the heading bold and coral (#f47b67).",
      html: "<h1 class=\"hero\">Welcome to XPedition</h1>",
      base: ".hero { font-size: 22px; margin: 0; font-weight: 400; color: #333; }",
      starter: ".hero {\n  /* bold + coral */\n}", check: "bold-heading",
      explain: "font-weight: 700 (or bold) and color: #f47b67 match the XPedition accent palette." },
    { id: "css-display-match", skill: "css", kind: "match", title: "Display modes", xp: 45, emoji: "🧩",
      prompt: "Match each display value to what it does in layout.",
      pairs: [["display: flex", "One-dimensional row or column layout"], ["display: grid", "Two-dimensional rows and columns"], ["display: block", "Stack elements vertically"], ["display: inline", "Flow with text, no width break"]], rightOrder: [0, 1, 2, 3],
      explain: "Flex handles one axis at a time; grid handles both; block and inline are the classic flow modes." },
    { id: "css-units-fill", skill: "css", kind: "fill", title: "Relative units", xp: 45, emoji: "📐",
      prompt: "Fill in the unit that sizes text relative to the root font size.",
      code: [".title { font-size: 1.5___; }"], blanks: [["rem"]],
      explain: "rem scales with the root element, so it stays consistent across the page unlike px alone." },
    { id: "js-cap-values", skill: "javascript", kind: "run", title: "Cap the values", xp: 50, emoji: "📊",
      prompt: "Implement capAt(nums, max) so every number above max becomes max.",
      fn: "capAt", starter: "function capAt(nums, max) {\n  // your code here\n}",
      tests: [{ args: [[1, 9, 3], 5], expected: [1, 5, 3] }, { args: [[10, 20], 15], expected: [10, 15] }, { args: [[], 5], expected: [] }],
      explain: "map lets you transform each item: n > max ? max : n keeps the rest unchanged." },
    { id: "js-count-truthy", skill: "javascript", kind: "run", title: "Count the active flags", xp: 50, emoji: "🚦",
      prompt: "Write countActive(flags) to return how many values are truthy.",
      fn: "countActive", starter: "function countActive(flags) {\n  // your code here\n}",
      tests: [{ args: [[true, false, true]], expected: 2 }, { args: [[0, "", null]], expected: 0 }, { args: [[1, "yes", {}]], expected: 3 }],
      explain: "filter(Boolean) removes falsy values; return the new array's length." },
    { id: "js-spread-copy", skill: "javascript", kind: "fill", title: "Spread into a copy", xp: 45, emoji: "📋",
      prompt: "Type the operator that copies all items from arr into a new array literal.",
      code: ["const clone = [___arr];"], blanks: [["..."]],
      explain: "...arr in an array literal spreads each element into the new array without mutating the original." },
    { id: "js-destructure", skill: "javascript", kind: "arrange", title: "Destructuring order", xp: 45, emoji: "🎁",
      prompt: "Tap the lines in the order you would write them to pull first and rest from an array.",
      items: ["const [first, ...rest] = items;", "const items = [10, 20, 30];", "console.log(first, rest.length);"], answer: [1, 0, 2],
      explain: "Create the array, destructure first and gather the rest with ...rest, then use the values." }
  ],
  /* Interactive lessons, keyed by the challenge they prepare you for.
     "compare" lessons let the learner switch between versions and see code + result; "steps" lessons walk through code one step at a time. */
  lessons: {
    "html-hunt-bug": { title: "Labels and alt text", kind: "compare", intro: "Screen readers announce what your HTML says. Switch between three versions and see what changes.",
      base: "input { padding: 6px; width: 180px; } label { display: block; margin-bottom: 4px; font-weight: 600; } img { display: block; width: 56px; height: 56px; }",
      html: "<label>Email</label><input type=\"email\">",
      variants: [
        { label: "No label link", code: "<label>Email</label>\n<input type=\"email\">", page: "<label>Email</label><input type=\"email\">", say: "“Edit text.”", caption: "Try clicking the word Email. Nothing happens, because the label isn't connected, and a screen reader can't name the field." },
        { label: "Linked label", code: "<label for=\"email\">Email</label>\n<input id=\"email\" type=\"email\">", page: "<label for=\"email\">Email</label><input id=\"email\" type=\"email\">", say: "“Email, edit text.”", caption: "for and id connect the two. Click the word Email and the field gets focus. Screen readers read the name out." },
        { label: "Image alt text", code: "<img src=\"logo.png\"\n     alt=\"XPedition logo\">", page: "<img alt=\"XPedition logo\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23705ce8'/%3E%3Ctext x='32' y='41' font-family='Arial' font-weight='800' font-size='24' text-anchor='middle' fill='white'%3EXP%2B%3C/text%3E%3C/svg%3E\">", say: "“Image, XPedition logo.”", caption: "alt describes an image to people who can't see it. Without it, a screen reader may read out the file name instead." }
      ], key: "Every input needs a linked label, and every meaningful image needs alt text." },
    "html-build-page": { title: "Anatomy of an HTML page", kind: "steps", intro: "Step through a tiny page and see what each part is for.",
      code: ["<!DOCTYPE html>", "<html lang=\"en\">", "  <head>", "    <title>My page</title>", "  </head>", "  <body>", "    <h1>Hello!</h1>", "  </body>", "</html>"],
      steps: [
        { focus: [0], state: [["Browser mode", "Modern standards"]], say: "The doctype tells the browser to use modern HTML rules. It always comes first." },
        { focus: [1], state: [["Language", "English"]], say: "<html> wraps the whole page. lang helps screen readers and translation tools." },
        { focus: [2, 3, 4], state: [["Tab title", "My page"], ["Shown on page?", "No"]], say: "<head> holds information about the page, like its title. It is not drawn on the page." },
        { focus: [5, 6, 7], state: [["On screen", "Hello!"]], say: "<body> holds everything people actually see." },
        { focus: [8], state: [["Document", "Complete"]], say: "The closing </html> ends the document." }
      ], key: "The order is: doctype, html, head, body, then close html." },
    "html-match-tags": { title: "Tags that carry meaning", kind: "compare", intro: "Different tags can look the same but mean very different things. Switch between them.",
      base: "nav, .fake { background: #eef2ff; padding: 8px; } a { margin-right: 10px; } ul { margin: 0; }",
      html: "<div class=\"fake\"><a href=\"#\">Home</a><a href=\"#\">About</a></div>",
      variants: [
        { label: "Just a div", code: "<div class=\"menu\">\n  <a href=\"#\">Home</a>\n  <a href=\"#\">About</a>\n</div>", page: "<div class=\"fake\"><a href=\"#\">Home</a><a href=\"#\">About</a></div>", say: "“Home, link. About, link.”", caption: "It looks fine, but nothing tells the browser this is the site menu." },
        { label: "<nav>", code: "<nav>\n  <a href=\"#\">Home</a>\n  <a href=\"#\">About</a>\n</nav>", page: "<nav><a href=\"#\">Home</a><a href=\"#\">About</a></nav>", say: "“Navigation. Home, link. About, link.”", caption: "<nav> is a landmark. Screen reader users can jump straight to it." },
        { label: "<button>", code: "<button>Save</button>", page: "<button>Save</button>", say: "“Save, button.”", caption: "Try pressing Tab, then Enter. A button is focusable and works with the keyboard for free. A clickable div does not." },
        { label: "<ul>", code: "<ul>\n  <li>One</li>\n  <li>Two</li>\n</ul>", page: "<ul><li>One</li><li>Two</li></ul>", say: "“List, 2 items.”", caption: "Lists tell assistive tech how many items there are and where each one starts." }
      ], key: "Choose tags for what things mean, not for how they look." },
    "html-complete-link": { title: "Links and their attributes", kind: "compare", intro: "A link is just <a> plus attributes. See what each attribute adds.",
      base: "a { font-size: 16px; } p { color: #555; font-size: 13px; margin-top: 12px; }",
      html: "<a href=\"#\">Visit</a>",
      variants: [
        { label: "href", code: "<a href=\"https://example.com\">Visit</a>", page: "<a href=\"#\">Visit</a><p>Goes to the address in href.</p>", say: "“Visit, link.”", caption: "href holds the destination. Without it, <a> is just text and not a link." },
        { label: "target", code: "<a href=\"https://example.com\"\n   target=\"_blank\">Visit</a>", page: "<a href=\"#\">Visit ↗</a><p>Opens in a new tab.</p>", say: "“Visit, link.”", caption: "target=\"_blank\" opens the link in a new tab. On its own, the new page can reach back to yours." },
        { label: "rel", code: "<a href=\"https://example.com\"\n   target=\"_blank\"\n   rel=\"noopener\">Visit</a>", page: "<a href=\"#\">Visit ↗</a><p>New tab, safely cut off from this page.</p>", say: "“Visit, link.”", caption: "rel=\"noopener\" cuts that connection, so the new page can't control yours." }
      ], key: "href is the address, target controls where it opens, and rel=\"noopener\" keeps new tabs safe." },
    "css-centre": { title: "Centring with flexbox", kind: "compare", intro: "Flexbox lines items up along two directions. Switch between rules and watch the blue box move.",
      base: ".container { width: 240px; height: 130px; background: #e5e7eb; } .box { width: 50px; height: 50px; background: #2f5fd0; }",
      html: "<div class=\"container\"><div class=\"box\"></div></div>",
      variants: [
        { label: "Normal flow", code: ".container {\n}", css: "", caption: "With no rules, the box sits in the top-left corner like any block." },
        { label: "justify-content", code: ".container {\n  display: flex;\n  justify-content: center;\n}", css: ".container { display: flex; justify-content: center; }", caption: "display: flex turns on flexbox. justify-content centres along the main axis, left to right." },
        { label: "+ align-items", code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}", css: ".container { display: flex; justify-content: center; align-items: center; }", caption: "align-items centres across it, top to bottom. Together they centre the box perfectly." }
      ], key: "justify-content works left to right, align-items works top to bottom." },
    "css-row-gap": { title: "Rows and gaps", kind: "compare", intro: "See how three cards go from a stack to a spaced-out row.",
      base: ".card { width: 48px; height: 48px; background: #2f5fd0; color: #fff; display: grid; place-items: center; font: 700 16px sans-serif; } .cards { background: #f3f4f6; padding: 8px; }",
      html: "<div class=\"cards\"><div class=\"card\">1</div><div class=\"card\">2</div><div class=\"card\">3</div></div>",
      variants: [
        { label: "Stacked", code: ".cards {\n}", css: "", caption: "Block elements stack top to bottom by default." },
        { label: "display: flex", code: ".cards {\n  display: flex;\n}", css: ".cards { display: flex; }", caption: "display: flex puts the children side by side. They touch because there is no space yet." },
        { label: "+ gap", code: ".cards {\n  display: flex;\n  gap: 16px;\n}", css: ".cards { display: flex; gap: 16px; }", caption: "gap adds space between children only. No extra margins to clean up at the ends." }
      ], key: "display: flex makes a row, and gap spaces the items evenly." },
    "css-hunt-bug": { title: "How CSS reads your rules", kind: "compare", intro: "Browsers quietly ignore CSS they can't understand. Compare these three rules.",
      base: ".card { display: inline-block; border: 1px solid #bbb; } ",
      html: "<div class=\"card\">Hello</div>",
      variants: [
        { label: "Correct", code: ".card {\n  padding: 16px;\n  color: #c0262d;\n}", css: ".card { padding: 16px; color: #c0262d; }", caption: "Padding and the red text both apply." },
        { label: "Missing semicolon", code: ".card {\n  padding: 16px\n  color: #c0262d;\n}", css: ".card { padding: 16px\n  color: #c0262d; }", caption: "Without the semicolon the browser reads one broken line and drops both declarations. Nothing is styled." },
        { label: "Misspelled property", code: ".card {\n  padding: 16px;\n  colour: #c0262d;\n}", css: ".card { padding: 16px; colour: #c0262d; }", caption: "The padding works, but colour isn't a real property, so the text stays black. CSS spells it color." }
      ], key: "End every declaration with a semicolon and check property spelling. CSS fails silently." },
    "css-box-model": { title: "The box model", kind: "compare", intro: "Every element is a box with layers. Add them one by one.",
      base: ".wrap { display: inline-block; background: #e5e7eb; } .b { width: 100px; height: 44px; background: #bcd0ff; display: grid; place-items: center; font-size: 12px; }",
      html: "<div class=\"wrap\"><div class=\"b\">content</div></div>",
      variants: [
        { label: "Content", code: ".b {\n  width: 100px;\n  height: 44px;\n}", css: "", caption: "The content is the innermost layer." },
        { label: "+ padding", code: ".b {\n  padding: 16px;\n}", css: ".b { padding: 16px; }", caption: "Padding adds space inside the box, around the content." },
        { label: "+ border", code: ".b {\n  padding: 16px;\n  border: 6px solid #2f5fd0;\n}", css: ".b { padding: 16px; border: 6px solid #2f5fd0; }", caption: "The border wraps the padding." },
        { label: "+ margin", code: ".b {\n  padding: 16px;\n  border: 6px solid #2f5fd0;\n  margin: 20px;\n}", css: ".b { padding: 16px; border: 6px solid #2f5fd0; margin: 20px; }", caption: "Margin is space outside the border, pushing other things away. The grey area shows it." }
      ], key: "From the outside in: margin, border, padding, content." },
    "js-fix-function": { title: "Loops and off-by-one bugs", kind: "steps", intro: "Watch a loop add up three prices, and see where it goes wrong.",
      code: ["const prices = [4, 7, 2];", "let sum = 0;", "for (let i = 0; i <= prices.length; i++) {", "  sum += prices[i];", "}"],
      steps: [
        { focus: [0, 1], state: [["prices", "[4, 7, 2]"], ["length", "3"], ["sum", "0"]], say: "There are 3 prices. The valid positions are 0, 1 and 2." },
        { focus: [2, 3], state: [["i", "0"], ["prices[i]", "4"], ["sum", "4"]], say: "i is 0, so it adds 4." },
        { focus: [2, 3], state: [["i", "1"], ["prices[i]", "7"], ["sum", "11"]], say: "i is 1, so it adds 7." },
        { focus: [2, 3], state: [["i", "2"], ["prices[i]", "2"], ["sum", "13"]], say: "i is 2, so it adds 2. That is every item." },
        { focus: [2, 3], state: [["i", "3"], ["prices[i]", "undefined"], ["sum", "NaN"]], say: "With <=, the loop runs once more with i = 3. There is no item there, so the sum becomes NaN." },
        { focus: [2], state: [["i <= 3", "true (bug)"], ["i < 3", "false (fix)"]], say: "Use i < prices.length so the loop stops right after the last item." }
      ], key: "Positions start at 0, so the last one is length − 1. Loop with < length." },
    "js-write-function": { title: "Functions and the remainder operator", kind: "steps", intro: "See how isEven decides, one call at a time.",
      code: ["function isEven(n) {", "  return n % 2 === 0;", "}", "isEven(7);  isEven(6);"],
      steps: [
        { focus: [3], state: [["n", "7"]], say: "Call isEven with 7." },
        { focus: [1], state: [["7 % 2", "1"]], say: "% gives the remainder after dividing. 7 ÷ 2 leaves 1." },
        { focus: [1], state: [["1 === 0", "false"], ["returns", "false"]], say: "A remainder of 0 means even. Here it is 1, so the answer is false." },
        { focus: [3, 1], state: [["n", "6"], ["6 % 2", "0"], ["returns", "true"]], say: "6 ÷ 2 leaves 0, so 6 is even and the function returns true." },
        { focus: [1], state: [["0 % 2", "0"], ["-4 % 2", "-0 (equals 0)"], ["returns", "true"]], say: "Zero and negative even numbers work too." }
      ], key: "n % 2 === 0 is true for every even number. Functions send their answer back with return." },
    "js-run-order": { title: "The event loop", kind: "steps", intro: "JavaScript runs one thing at a time. Step through to see who goes first.",
      code: ["console.log(\"A\");", "setTimeout(() => console.log(\"B\"), 0);", "Promise.resolve().then(() => console.log(\"C\"));", "console.log(\"D\");"],
      steps: [
        { focus: [0], state: [["Now running", "log A"], ["Microtasks", "empty"], ["Timers", "empty"], ["Console", "A"]], say: "Normal code runs straight away, so A prints." },
        { focus: [1], state: [["Now running", "setTimeout"], ["Microtasks", "empty"], ["Timers", "log B (waiting)"], ["Console", "A"]], say: "setTimeout hands its callback to the timers. It will run later." },
        { focus: [2], state: [["Now running", "Promise.then"], ["Microtasks", "log C"], ["Timers", "log B (waiting)"], ["Console", "A"]], say: "The promise callback joins the microtask queue, which is served before timers." },
        { focus: [3], state: [["Now running", "log D"], ["Microtasks", "log C"], ["Timers", "log B (waiting)"], ["Console", "A D"]], say: "The last normal line prints D." },
        { focus: [2], state: [["Now running", "log C"], ["Microtasks", "empty"], ["Timers", "log B (waiting)"], ["Console", "A D C"]], say: "Now the main code is finished, so microtasks run first: C." },
        { focus: [1], state: [["Now running", "log B"], ["Microtasks", "empty"], ["Timers", "empty"], ["Console", "A D C B"]], say: "Finally the timer callback runs: B." }
      ], key: "Order: normal code, then promise callbacks, then timers." },
    "js-predict-type": { title: "How map builds a new array", kind: "steps", intro: "Watch map visit each number and collect the results.",
      code: ["const nums = [1, 2, 3];", "const out = nums.map(n => n * 2);", "console.log(out.length, out[2]);"],
      steps: [
        { focus: [0], state: [["nums", "[1, 2, 3]"]], say: "We start with three numbers." },
        { focus: [1], state: [["n", "1"], ["out so far", "[2]"]], say: "map calls the function on each item and collects the results. 1 becomes 2." },
        { focus: [1], state: [["n", "2"], ["out so far", "[2, 4]"]], say: "2 becomes 4." },
        { focus: [1], state: [["n", "3"], ["out so far", "[2, 4, 6]"]], say: "3 becomes 6. nums itself is unchanged." },
        { focus: [2], state: [["out.length", "3"], ["out[2]", "6"], ["prints", "3 6"]], say: "Positions start at 0, so out[2] is the third item: 6. console.log prints both values." }
      ], key: "map returns a new array the same length as the original." },
    "html-landmarks": { title: "Landmarks on a page", kind: "steps", intro: "Landmarks help everyone skim a long page.",
      code: ["<header>Site chrome</header>", "<main>Primary content</main>", "<footer>Copyright</footer>"],
      steps: [
        { focus: [0], state: [["Role", "Banner / top"]], say: "<header> usually holds the logo and top navigation." },
        { focus: [1], state: [["Role", "Main content"]], say: "<main> wraps the one thing this page is about." },
        { focus: [2], state: [["Role", "Footer"]], say: "<footer> closes the page with links and legal text." }
      ], key: "Typical top-to-bottom order: header, main, footer." },
    "html-input-types": { title: "Input types", kind: "compare", intro: "The type attribute changes keyboard and validation behaviour.",
      base: "input { padding: 6px; width: 200px; } label { display: block; font-weight: 600; margin-bottom: 4px; }",
      html: "<label>Field</label><input>",
      variants: [
        { label: "email", code: "<input type=\"email\">", page: "<label>Email</label><input type=\"email\" placeholder=\"you@co.com\">", say: "Email keyboard", caption: "Mobile shows the @ key and can validate the shape of an address." },
        { label: "number", code: "<input type=\"number\">", page: "<label>Qty</label><input type=\"number\" value=\"2\">", say: "Numeric steppers", caption: "Browsers may show stepper controls and reject non-numbers." },
        { label: "checkbox", code: "<input type=\"checkbox\">", page: "<label><input type=\"checkbox\"> Remember me</label>", say: "Toggle", caption: "Checkboxes represent on/off choices, not typed text." }
      ], key: "Match the input type to the kind of data you are collecting." },
    "html-viewport-meta": { title: "Viewport on mobile", kind: "compare", intro: "Without viewport meta, phones shrink a desktop layout.",
      base: "body { font-family: sans-serif; padding: 12px; } h1 { font-size: 20px; }",
      html: "<h1>Hello</h1><p>Readable text?</p>",
      variants: [
        { label: "Missing", code: "<!-- no viewport meta -->", page: "<h1>Hello</h1><p>Tiny text on phones.</p>", say: "Zoomed out", caption: "The browser assumes a wide desktop width unless you say otherwise." },
        { label: "With viewport", code: "<meta name=\"viewport\"\n      content=\"width=device-width,\n               initial-scale=1\">", page: "<h1>Hello</h1><p>Text matches the device width.</p>", say: "Device width", caption: "content=\"width=device-width\" makes CSS pixels match the phone screen." }
      ], key: "Always include a viewport meta tag for responsive pages." },
    "html-fake-control": { title: "Buttons vs divs", kind: "compare", intro: "Native controls work with keyboard and assistive tech out of the box.",
      base: ".btn { padding: 8px 12px; background: #705ce8; color: #fff; border-radius: 8px; display: inline-block; cursor: pointer; } button { padding: 8px 12px; background: #705ce8; color: #fff; border: 0; border-radius: 8px; }",
      html: "<button>Send</button>",
      variants: [
        { label: "<button>", code: "<button type=\"submit\">Send</button>", page: "<button>Send</button>", say: "“Send, button.”", caption: "Focusable with Tab, activatable with Enter/Space, announced as a button." },
        { label: "<div onclick>", code: "<div class=\"btn\" onclick=\"send()\">Send</div>", page: "<div class=\"btn\">Send</div>", say: "“Send.” (not a button)", caption: "Looks similar but is not in the tab order unless you add tabindex and keyboard handlers." }
      ], key: "Use <button> for actions unless you have a strong reason not to." },
    "css-stack-column": { title: "Flex column stack", kind: "compare", intro: "Flex direction changes which way children flow.",
      base: ".stack { width: 100px; background: #f3f4f6; padding: 8px; } .card { height: 36px; background: #705ce8; color: #fff; display: grid; place-items: center; font: 700 14px sans-serif; border-radius: 8px; }",
      html: "<div class=\"stack\"><div class=\"card\">A</div><div class=\"card\">B</div></div>",
      variants: [
        { label: "Row (default)", code: ".stack {\n  display: flex;\n}", css: ".stack { display: flex; }", caption: "Children sit side by side." },
        { label: "Column + gap", code: ".stack {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}", css: ".stack { display: flex; flex-direction: column; gap: 12px; }", caption: "column stacks top to bottom; gap adds space between." }
      ], key: "flex-direction: column stacks; gap spaces items without margin hacks." },
    "css-hero-style": { title: "Typography accents", kind: "compare", intro: "Weight and color draw attention to headings.",
      base: ".hero { font-size: 22px; margin: 0; }",
      html: "<h1 class=\"hero\">Welcome</h1>",
      variants: [
        { label: "Normal", code: ".hero {\n  font-weight: 400;\n  color: #333;\n}", css: "", caption: "Default body-like weight." },
        { label: "Bold coral", code: ".hero {\n  font-weight: 700;\n  color: #f47b67;\n}", css: ".hero { font-weight: 700; color: #f47b67; }", caption: "Bold weight plus the XPedition coral accent." }
      ], key: "font-weight and color are the fastest way to style a hero line." },
    "css-display-match": { title: "Display modes", kind: "steps", intro: "display changes how an element participates in layout.",
      code: [".row { display: flex; }", ".grid { display: grid; }", ".box { display: block; }", "span { display: inline; }"],
      steps: [
        { focus: [0], state: [["Axis", "One at a time"]], say: "Flex lays children out along a row or column." },
        { focus: [1], state: [["Axis", "Rows and columns"]], say: "Grid controls both dimensions together." },
        { focus: [2], state: [["Flow", "New line"]], say: "Block elements start on a new line and stretch wide." },
        { focus: [3], state: [["Flow", "With text"]], say: "Inline elements sit in the text line without breaking it." }
      ], key: "Pick flex, grid, block, or inline based on the layout job." },
    "css-units-fill": { title: "rem vs px", kind: "compare", intro: "Relative units scale with user settings.",
      base: "html { font-size: 16px; } .title { margin: 0; }",
      html: "<p class=\"title\">Hello</p>",
      variants: [
        { label: "px", code: ".title { font-size: 24px; }", css: ".title { font-size: 24px; }", caption: "Fixed pixels ignore root font-size changes." },
        { label: "rem", code: ".title { font-size: 1.5rem; }", css: ".title { font-size: 1.5rem; }", caption: "1.5rem equals 1.5 × the root font size (24px when root is 16px)." }
      ], key: "rem ties sizing to the root element so type scales consistently." },
    "js-cap-values": { title: "map with a cap", kind: "steps", intro: "Transform each number without a manual loop if you prefer map.",
      code: ["function capAt(nums, max) {", "  return nums.map(n => n > max ? max : n);", "}", "capAt([1, 9, 3], 5);"],
      steps: [
        { focus: [0], state: [["Input", "[1, 9, 3]"], ["max", "5"]], say: "We need a new array with nothing above 5." },
        { focus: [1], state: [["n = 9", "becomes 5"]], say: "For each n, compare to max and keep the smaller effective value." },
        { focus: [3], state: [["Result", "[1, 5, 3]"]], say: "9 becomes 5; the others stay the same." }
      ], key: "map returns a new array; use a ternary inside to clamp values." },
    "js-count-truthy": { title: "Truthy counts", kind: "steps", intro: "filter builds a subset; length counts it.",
      code: ["function countActive(flags) {", "  return flags.filter(Boolean).length;", "}", "countActive([true, false, true]);"],
      steps: [
        { focus: [3], state: [["Input", "[true, false, true]"]], say: "We only want to count the active flags." },
        { focus: [1], state: [["Keeps", "true values"]], say: "Boolean removes false, 0, \"\", null, and undefined." },
        { focus: [3], state: [["Answer", "2"]], say: "Two values remain, so the count is 2." }
      ], key: "filter(Boolean) then .length is a compact active-count pattern." },
    "js-spread-copy": { title: "Spread syntax", kind: "steps", intro: "Spread copies elements into a new array literal.",
      code: ["const arr = [1, 2, 3];", "const clone = [...arr];", "clone.push(4);"],
      steps: [
        { focus: [0], state: [["arr", "[1, 2, 3]"]], say: "Start with an array we do not want to mutate." },
        { focus: [1], state: [["clone", "[1, 2, 3]"]], say: "...arr expands each item into the new array." },
        { focus: [2], state: [["arr", "unchanged"]], say: "Pushing to clone does not mutate arr." }
      ], key: "[...arr] is a shallow copy of the array." },
    "js-destructure": { title: "Array destructuring", kind: "steps", intro: "Pull the head and tail from an array in one line.",
      code: ["const items = [10, 20, 30];", "const [first, ...rest] = items;", "console.log(first, rest);"],
      steps: [
        { focus: [0], state: [["items", "[10, 20, 30]"]], say: "Start with an array of values." },
        { focus: [1], state: [["first", "10"], ["rest", "[20, 30]"]], say: "first takes index 0; ...rest gathers the remaining items." },
        { focus: [2], state: [["prints", "10 [20,30]"]], say: "rest is still an array containing the tail." }
      ], key: "Order matters: define the array, destructure, then use the values." }
  }
};
