# Socratink positioning

**Status: working hypothesis.** This is a draft for testing the message, not a decision about the target market or a description of everything the product does. See [NORTH-STAR.md](NORTH-STAR.md) for product direction and [PRODUCT.md](PRODUCT.md) for what is built.

## Mission

Help people use AI to strengthen their own judgment, not hand it over.

## Customer problem

When I use AI to learn something hard, the explanation makes sense while I read it. But when someone asks why, or changes one detail, I realize I can't explain it on my own.

That is proposed customer language, not an interview quote. The problem is not finding an explanation. It is finding out whether you can use it before a real conversation puts you on the spot.

## First audience to test

Start with early-career developers who use AI to learn an unfamiliar library or piece of code before a code review or interview. They have a concrete moment when understanding matters: someone asks why the code behaves that way, what would break, or what they'd do if a constraint changed.

**Positioning:** For developers who need to explain code they learned with AI, Socratink is a practice conversation. Explain the idea before seeing the answer, get feedback on the part you missed, and try again. Rereading notes is the simplest alternative; a peer can give realistic pushback. [ChatGPT Study Mode](https://help.openai.com/en/articles/11780217-study-mode) already asks open-ended questions and gives feedback. Socratink has to earn the switch by making it easier to see what the learner did without help. That advantage is a hypothesis, not a claim.

## Landing-page message to test

**It made sense. Can you explain it?**

Bring something you're learning. Explain it in your own words, get feedback on what you missed, and try again.

**CTA:** Try one question

## Evidence and next test

- [Casey Simpson's video](https://www.youtube.com/watch?v=03Kvst84Oxo) is inspiration and qualitative language, not proof of what caused the problem or of demand. Do not use generational decline, health, or mastery claims in marketing.
- [Anthropic's randomized Python Trio exercise](https://www.anthropic.com/research/AI-assistance-coding-skills) reported 50% versus 67% on an immediate quiz for chat-assisted versus hand-coding participants. It motivates a narrow test, not a claim about long-term learning or Socratink effectiveness.
- Ask: “Tell me about the last time someone asked you to explain code you'd learned with AI. What happened?” “How did you prepare, and what did that cost you?” “When did your usual method work well enough that you wouldn't change it?”
- Compare one short code-review exercise against Study Mode using the same materials and time. After practice, give both learners the same new case without hints or notes. Score whether they explain the mechanism and predict the result under a changed condition. Keep assisted work separate. If the problem rarely comes up or the usual method works as well, revise the audience or message.
- [Socratink #112](https://github.com/jon-devlapaz/socratink/issues/112) tests the study loop, not buyer demand. A later-day retention check is not built; present it as a test protocol, not a shipped feature.

No homepage change is proposed here.
