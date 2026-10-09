window.DEVQUEST_CONTENT = {
  "coreLevels": [
    {
      "id": 1,
      "name": "Say It Clearly",
      "subtitle": "Communicate so people understand and act.",
      "icon": "💬",
      "color": "lavender",
      "skill": "Communication",
      "games": [
        "status-update",
        "active-listening"
      ],
      "boss": "escalation-note"
    },
    {
      "id": 2,
      "name": "Work Together",
      "subtitle": "Give feedback, disagree well, resolve friction.",
      "icon": "🤝",
      "color": "mint",
      "skill": "Collaboration",
      "games": [
        "kind-feedback",
        "disagree-well"
      ],
      "boss": "team-clash"
    },
    {
      "id": 3,
      "name": "Own It",
      "subtitle": "Take responsibility and protect your energy.",
      "icon": "🧭",
      "color": "peach",
      "skill": "Ownership and resilience",
      "games": [
        "own-the-mistake",
        "say-no-kindly"
      ],
      "boss": "crunch-week"
    }
  ],
  "games": {
    "status-update": {
      "id": "status-update",
      "title": "The One-Minute Update",
      "engine": "CHOICE",
      "level": 1,
      "kind": "choice",
      "skill": "Clear communication",
      "intro": "Your teammate Priya asks how the login fix is going. It is late, and you are blocked on API keys.",
      "question": "Which reply gives Priya what she needs?",
      "options": [
        "Still working on it. There’s a lot going on right now.",
        "Login fix is about 80% done. I’m blocked on the API keys, so I’ll finish by Thursday 3pm if I get them today. Can you help me get them?",
        "It’s complicated. I’ll explain later when I have time."
      ],
      "answer": 1,
      "explanation": "The second reply states progress, the blocker, a date, and a clear ask. Priya can plan around it or help right away.",
      "concept": "Lead with status, name the blocker, give a date, and make one clear ask.",
      "xp": 50
    },
    "active-listening": {
      "id": "active-listening",
      "title": "Listen First",
      "engine": "CHOICE",
      "level": 1,
      "kind": "choice",
      "skill": "Active listening",
      "intro": "A colleague, Sam, is frustrated: “Nobody ever tells me what the requirements are, and then I get blamed.”",
      "question": "What is the best first response?",
      "options": [
        "Which part of the requirements was unclear on your last task? I’d like to understand before I suggest anything.",
        "That’s just how this team works. You’ll get used to it.",
        "You should have asked your manager sooner."
      ],
      "answer": 0,
      "explanation": "A curious question shows you heard Sam and helps you find the real problem. Advice or excuses too early make people feel dismissed.",
      "concept": "Understand first. Ask an open question before you offer a fix.",
      "xp": 50
    },
    "escalation-note": {
      "id": "escalation-note",
      "title": "Write the Escalation",
      "engine": "PICK ALL",
      "level": 1,
      "kind": "multiSelect",
      "skill": "Clear communication",
      "intro": "A vendor delay might push your project back two weeks. You need to tell your manager today. Tap everything a good message includes.",
      "items": [
        {
          "id": "blame",
          "title": "Who is to blame",
          "detail": "The vendor never listens and it’s their fault again."
        },
        {
          "id": "what",
          "title": "What happened",
          "detail": "The vendor delivery slipped from the 10th to the 24th."
        },
        {
          "id": "ask",
          "title": "What you need and by when",
          "detail": "Please approve the backup supplier by Friday."
        },
        {
          "id": "history",
          "title": "A long backstory",
          "detail": "A full timeline of every email since last year."
        },
        {
          "id": "impact",
          "title": "The impact",
          "detail": "Our launch could move by two weeks."
        },
        {
          "id": "tried",
          "title": "What you already tried",
          "detail": "I asked for a partial delivery and checked another supplier."
        }
      ],
      "answers": [
        "what",
        "impact",
        "tried",
        "ask"
      ],
      "explanation": "A good escalation covers what happened, the impact, what you tried, and the decision you need. Blame and long backstories hide the point.",
      "concept": "Make it easy to act: facts, impact, effort so far, and one clear request.",
      "xp": 70
    },
    "kind-feedback": {
      "id": "kind-feedback",
      "title": "Feedback That Lands",
      "engine": "CHOICE",
      "level": 2,
      "kind": "choice",
      "skill": "Giving feedback",
      "intro": "A teammate’s slide deck is hard to follow: too much text, no clear point. You want to help.",
      "question": "Which feedback is most useful?",
      "options": [
        "This deck is a mess.",
        "Maybe ask someone else to review it, I’m not a design person.",
        "I got lost around slide 4 because it has a lot of text. Could you cut it to one key point per slide?"
      ],
      "answer": 2,
      "explanation": "It names a specific moment, explains the effect, and suggests a next step, without attacking the person.",
      "concept": "Be specific: what you saw, what it caused, and what could help.",
      "xp": 55
    },
    "disagree-well": {
      "id": "disagree-well",
      "title": "Disagree Well",
      "engine": "CHOICE",
      "level": 2,
      "kind": "choice",
      "skill": "Respectful disagreement",
      "intro": "In a meeting, a senior colleague proposes a plan you think is risky. Others are nodding.",
      "question": "What do you do?",
      "options": [
        "Say “I see it differently, can I share the risk I’m worried about?” and then explain it with an example.",
        "Stay quiet now and complain to teammates afterwards.",
        "Interrupt and say the plan is wrong."
      ],
      "answer": 0,
      "explanation": "Asking to share your view keeps the conversation open, and a concrete example gives people something to weigh instead of something to defend against.",
      "concept": "Disagree in the room, about the idea, and bring a reason.",
      "xp": 55
    },
    "team-clash": {
      "id": "team-clash",
      "title": "Calm the Clash",
      "engine": "PICK ALL",
      "level": 2,
      "kind": "multiSelect",
      "skill": "Conflict resolution",
      "intro": "Two teammates keep arguing over who owns a task, and the team is getting tense. You are asked to help. Tap every helpful move.",
      "items": [
        {
          "id": "side",
          "title": "Quietly take one person’s side",
          "detail": "Back whoever you like more."
        },
        {
          "id": "separate",
          "title": "Talk to each person separately first",
          "detail": "Let each one explain how they see it."
        },
        {
          "id": "public",
          "title": "Call them out in the team chat",
          "detail": "Let everyone see who is wrong."
        },
        {
          "id": "goal",
          "title": "Find the shared goal",
          "detail": "Both want the release to go out on time."
        },
        {
          "id": "ignore",
          "title": "Hope it blows over",
          "detail": "Avoid the topic and carry on."
        },
        {
          "id": "roles",
          "title": "Agree who owns what",
          "detail": "Write the ownership down so it’s clear."
        }
      ],
      "answers": [
        "separate",
        "goal",
        "roles"
      ],
      "explanation": "Listening to both sides, finding the shared goal, and making ownership explicit solves the cause. Taking sides, ignoring it, or shaming people makes it worse.",
      "concept": "Listen to both sides, anchor on the shared goal, and make agreements explicit.",
      "xp": 75
    },
    "own-the-mistake": {
      "id": "own-the-mistake",
      "title": "Own the Mistake",
      "engine": "CHOICE",
      "level": 3,
      "kind": "choice",
      "skill": "Accountability",
      "intro": "You sent the wrong file to a client by mistake. Nobody has noticed yet.",
      "question": "What is the best next step?",
      "options": [
        "Wait and see. Maybe the client won’t open it.",
        "Quietly send the right file and say nothing.",
        "Tell your manager and the client now, send the correct file, and say what you’ll do to prevent it."
      ],
      "answer": 2,
      "explanation": "Telling people quickly, fixing it, and sharing how you will prevent a repeat protects trust. Hiding it risks a bigger problem later.",
      "concept": "Speak up fast, fix it, and say how you’ll stop it happening again.",
      "xp": 60
    },
    "say-no-kindly": {
      "id": "say-no-kindly",
      "title": "Say No, Kindly",
      "engine": "CHOICE",
      "level": 3,
      "kind": "choice",
      "skill": "Setting boundaries",
      "intro": "You are already at capacity this week when your manager asks you to take on one more urgent task.",
      "question": "Which response works best?",
      "options": [
        "Sure, no problem.",
        "I’m full this week with the report and the client demo. If this is the priority, which should I move, or can it start Monday?",
        "No. I’m too busy."
      ],
      "answer": 1,
      "explanation": "It is honest about your workload and offers options, so your manager can make the trade-off instead of being surprised later.",
      "concept": "Show your current load and offer a trade-off instead of a flat yes or no.",
      "xp": 60
    },
    "crunch-week": {
      "id": "crunch-week",
      "title": "Survive Crunch Week",
      "engine": "PICK ALL",
      "level": 3,
      "kind": "multiSelect",
      "skill": "Resilience",
      "intro": "A big deadline is coming and you feel stressed and tired. Tap every move that helps you stay effective.",
      "items": [
        {
          "id": "alone",
          "title": "Hide the stress and push through alone",
          "detail": "Don’t tell anyone you’re struggling."
        },
        {
          "id": "prioritize",
          "title": "Pick the top three priorities",
          "detail": "Decide what truly must be done."
        },
        {
          "id": "all",
          "title": "Try to do everything at once",
          "detail": "Work on every task in parallel."
        },
        {
          "id": "help",
          "title": "Ask for help early",
          "detail": "Tell someone before you are stuck."
        },
        {
          "id": "skip",
          "title": "Skip meals and sleep",
          "detail": "Work through the night."
        },
        {
          "id": "breaks",
          "title": "Take short breaks and sleep",
          "detail": "Protect your energy."
        }
      ],
      "answers": [
        "prioritize",
        "help",
        "breaks"
      ],
      "explanation": "Focus, early help, and rest keep your judgement sharp. Hiding stress and burning out slows you down.",
      "concept": "Focus on what matters, ask early, and protect your energy.",
      "xp": 80
    }
  }
};
