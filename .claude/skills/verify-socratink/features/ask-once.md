# Ask once

A tutor reply with a question card asks one question: the card's. When the tutor's text ends on a question and the same message calls `present_question`, the learner sees the text's feedback and the card, not the question twice. This holds after the reply settles and after a reload.

## Sub-features

- `ask-once-settled`: the settled reply keeps `Each check halves the list.`, shows the card prompt, and does not show the text question.
- `ask-once-reloaded`: the same after a reload, from the server's history.

## How to get to it (user POV)

- Open Socratink, send a message, and get a reply with a question card. A real model does this only some of the time, so the journey uses the scripted model.

## Driving it with learner.mjs

Preconditions:

- Scripted provider. A message containing `ASKTWICE` gets text ending on `Which half do you search after checking the middle?` and a real `present_question` card in the same message.

- **Send.** Run `model.hold()` then `send(tab, 'ASKTWICE Teach me binary search.')`. Live text appears in `.turn.pending .turn-markdown`.
- **Settle.** Run `model.release()` and `waitForReply(tab)`, then wait for the card prompt.
- **Reload.** Reload the tab and wait for the card prompt again.
- **Run it all.** `node .claude/skills/verify-socratink/journeys/ask-once.mjs` saves `<size>-streaming.png`, `<size>-settled.png`, `<size>-reloaded.png` at 1440x1080 and 390x844.

## Gotchas

- On main before #163's fix the journey fails at `settled: the text does not ask the card's question again`, which proves it can fail.
- The hold pauses after four words, before the text question arrives, so the streaming shot shows the opening words only. The live view drops the question when the card's tool input arrives; `scripts/live-reply.test.mjs` covers that step.
