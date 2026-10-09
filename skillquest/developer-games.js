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
      ], key: "map returns a new array the same length as the original." }
  }
};
