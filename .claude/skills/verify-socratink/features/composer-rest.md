# Composer rest

A short conversation rests just above the composer, with the empty space above it. The reply grows upward as it streams, and the last turn does not move when the reply settles. After the first message the composer placeholder reads `Your reply`.

## Sub-features

- `rest-gap`: the last turn ends at most 64 px above `.composer-shell`, at 1440x1080 and at 390x844.
- `rest-no-jump`: the last turn's bottom edge moves at most 4 px between the last streaming frame and the first settled frame.
- `rest-placeholder`: `What are you working on?` before the first message, `Your reply` after.

## How to get to it (user POV)

- Open Socratink, type a question in the composer, press Send.
- On a phone-sized window, the same.

## Driving it with learner.mjs

Preconditions:

- Any provider. Each viewport uses a fresh learner, so the conversation is short.

- **Empty state.** Open a tab. Run `newLearner({ viewport })` then `learner.newTab()`. `#message` has the placeholder `What are you working on?`.
- **Send.** Type and press Send while recording the last turn's position. Run `trackLastTurn(tab)` then `send(tab, 'Why do tides happen?')`. Live text appears in `.turn.pending .turn-markdown`.
- **Settle.** Wait for the reply. Run `waitForReply(tab)` and stop the recorder. The frames show no jump at the pending-to-settled change.
- **Measure.** Run `composerGap(tab)`. It is between 0 and 64.
- **Run it all.** `node .claude/skills/verify-socratink/journeys/composer-rest.mjs` saves `<size>-empty.png`, `<size>-streaming.png`, `<size>-settled.png`.

## Gotchas

- Before #158 the gap was 661 px at 1440x1080; the journey fails there, which proves it can fail.
- The first streaming frames drift up about 10 px while the turn's entry animation plays. Compare the last pending frame with the first settled one, not the first frame.
- A `LONG` message makes the transcript scroll; the gap check is for short conversations.
