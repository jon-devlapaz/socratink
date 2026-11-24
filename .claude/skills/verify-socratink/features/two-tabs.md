# Two tabs

A learner can have the same conversation open in two tabs. Only one reply can be pending at a time. A tab that sends while the other tab's reply runs is told `Not sent` and can press `Retry` once that reply finishes. Each tab shows only the reply it asked for, even when its stream reconnects into a snapshot that already holds the other tab's next turn.

## Sub-features

- `tabs-share`: a second tab opens on the same conversation.
- `tabs-one-pending`: a send from tab 2 during tab 1's reply gets HTTP 409 and a `Not sent` notice; tab 1 never shows tab 2's message.
- `tabs-retry`: `Retry` in tab 2 sends its message after tab 1's reply settles.
- `tabs-replay`: tab 1 loses its stream, its reply finishes, tab 2 starts the next turn; when streams return, tab 1 settles on its own reply while tab 2's turn still runs.

## How to get to it (user POV)

- Open Socratink, send a message, then open a second tab of the same site.
- Send from one tab while the other is still waiting for its reply.

## Driving it with learner.mjs

Preconditions:

- Scripted provider (the journey holds replies mid-stream).
- One learner with two tabs: `learner.newTab()` twice. Both tabs share the guest cookie and `localStorage`.

- **Share.** Send in tab 1 and wait for the reply, then open tab 2. Tab 2's `#active-turn` shows the first message.
- **One pending.** Run `model.hold()`, send in tab 1, then send `A question from tab 2` in tab 2. The POST returns 409 and tab 2 shows `.request-state` labelled `Not sent`. Tab 1 is still pending and does not show tab 2's message.
- **Retry.** Run `model.release()` and wait for tab 1. Press `Retry` in tab 2. Tab 2 shows its message and a reply; the notice is gone.
- **Replay.** Reload tab 1. Run `model.hold()`, send in tab 1, wait for live text, run `network.dropStreams()` and `model.release()`. Run `model.hold()` and send in tab 2 (202). Run `network.restoreStreams()` and wait 4 s. Tab 1 is not pending, shows `Tab one follow up`, and does not show `Tab two follow up`.
- **Second view.** Release, reload tab 1. It shows tab 2's turn from the server.
- **Run it all.** `node .claude/skills/verify-socratink/journeys/two-tabs.mjs`.

## Gotchas

- An idle tab shows the other tab's turn once that turn settles (#177), not word by word while it streams. A tab that is busy or shows `Not sent` keeps its own state. `scripts/cross-tab.test.mjs` covers this.
- Before #159, the replay step fails: tab 1 stays `Thinking` under its own message while tab 2's reply text streams into it.
- Each learner has a guest allowance of 10 turns (`src/config/guest-turns.ts`). This journey uses 5. Use `newLearner()` for more.
- The scripted model can be called more than once per turn, so assert on settled text, not on which canned reply came back.
