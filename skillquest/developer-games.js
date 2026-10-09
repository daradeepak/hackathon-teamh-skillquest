/* Soft-skills content. There are no right or wrong answers: every option is a reasonable approach,
   and the option a player picks awards XP to the skills it shows (option.xp is { skillId: points }). */
window.DEVQUEST_CONTENT = {
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
      explain: "map builds [2, 4, 6]. Its length is 3 and the item at index 2 is 6." }
  ]
};
