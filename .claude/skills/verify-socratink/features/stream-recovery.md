# Stream recovery

When the learner's connection drops, or something keeps closing the reply stream while a reply is still being written, the tab keeps the turn pending and reconnects with growing pauses (250 ms doubling to 5 s). When the connection holds again, the tab shows the same reply once. The message is not sent to the model a second time.

## Sub-features

- `recover-outage`: the network is down for 6 s mid-reply; reconnects back off; the reply shows once afterwards.
- `recover-closing`: every reply stream is closed 300 ms after it opens, for 6 s; reconnects still back off instead of looping.
- `recover-no-resend`: the scripted model's call count does not change during recovery.

## How to get to it (user POV)

- Send a message and lose Wi-Fi while the reply is streaming, then reconnect.
- Use a network or proxy that closes long-running requests.

## Driving it with learner.mjs

Preconditions:

- Scripted provider (the journey holds replies mid-stream).

- **Hold a reply.** Run `model.hold()` and `send(tab, 'Why do tides happen?')`, then wait for live text. Note `model.calls()`.
- **Outage.** Run `network.drop()`, wait 6 s, run `network.restore()`. `tab.streams` shows 2 to 8 new attempts with growing gaps; the turn stays pending.
- **Recover.** Run `model.release()` and `waitForReply(tab)`. The reply's last line and the learner's message each show once; `model.calls()` is unchanged.
- **Closing streams.** Repeat with `network.closeStreamsAfter(300)` and `network.restoreStreams()`.
- **Run it all.** `node .claude/skills/verify-socratink/journeys/stream-recovery.mjs`.

## Gotchas

- Before #159 the closing-streams step fails with about 19 reconnects in 6 s (a reconnect every 300 ms). The outage step passes on both, because a refused connection always paused.
- Chromium's DevTools offline mode does not close an open stream. Use `network.drop()`, which cuts the sockets.
- `tab.streams` counts request starts, including refused ones.
