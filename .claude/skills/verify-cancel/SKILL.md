---
name: verify-cancel
description: Model-check that Cancel stops only the reply its own tab meant to stop (TLA+). Use before merging any change to Cancel, abort, recovery or submission admission in the chat client or server.
---

# Verify Cancel targeting

**Property:** Cancel stops a tutor reply only when that reply's own tab meant to stop it.

**Harm if broken:** a learner's reply in one tab is killed by a late Cancel from another tab, or from an earlier attempt in the same tab (#119).

The model is `formal/CancelTarget.tla`. TLC checks every order of these steps:
- two tabs send, cancel and recover
- abort requests arrive late
- the server settles submissions

## When to run

Run this check if your change touches any of the code below:

| Model step | Code |
|---|---|
| `Send` (admit one pending submission, 409 otherwise) | `src/server/durable/browser-bridge.ts` POST route |
| `LearnId`, `LoseAdmission` (the 202 arrives, late, or the send is cut off) | `run()` and `pending.admission` in `src/ui/client/conversation.ts` |
| `Cancel`, `Recheck`, `StartOver` (what the tab sends, and when) | `cancel()`, `recheck()`, `abortAdmitted()` in `conversation.ts`; `abort()` in `src/ui/client/conversation-stream.ts` |
| `DeliverAbort` (what the server cancels) | the `/abort` route in `browser-bridge.ts`; `abort()` in `src/server/durable/engine.ts`; `cancel()` in `storage-postgres.ts` / `storage-sqlite.ts` |
| `Settle` (abort at or under the watermark) | `checkCancellation` in `engine.ts` (`cancelThrough() >= submissionId`) |

## Run it

```
pnpm verify:formal
```

This needs Java 11+ and network access the first time. It downloads `tla2tools.jar` 1.7.4 into `.cache/tla/` and checks it against a pinned SHA-256. CI runs the same command.

There are three cases, and each one must give its expected result:

| Config | Expected result | Meaning |
|---|---|---|
| `CancelTarget.cfg` | pass | Current design: Cancel names its submission and never aborts without an id. |
| `CancelTarget-before-119.cfg` | `CancelStopsOnlyIntendedReply` violated | The conversation-wide abort from before #119 is still caught. |
| `CancelTarget-cancel-works.cfg` | `NoReplyEverAborted` violated | Cancel can still stop a reply, so the model is not vacuous. |

## Reading a failure

- **`CancelTarget.cfg` fails.** The script prints TLC's counterexample, which is a short list of states. Read the action names (`Send`, `Cancel`, `DeliverAbort`, `Settle`) and the `subs`, `abortThrough` and `intended` values. Retell it in code terms, for example: "tab a lost its 202, sent Cancel with no id, tab b's submission 2 was aborted".
  - If the code does what the trace shows, that is a real bug. Report it, and do not weaken the invariant.
  - If the code cannot do a step the trace shows, the model is wrong. Fix the model so it matches the code, and say which code line proves it.
- **The before-119 or cancel-works case passes.** The model has lost its ability to fail. Fix the model before you trust a pass.

## Changing the model with an intended change

1. Change the step in the table above that your code change alters.
2. Keep each model step as one atomic step in the code. An `await` or an HTTP round trip is a separate step.
3. Run `pnpm verify:formal`, then break your change on purpose and confirm the check fails.
4. Update the coverage record below.

## Scope and bounds

- Two tabs, at most three submissions, any order of steps, and abort requests delayed arbitrarily.
- Not covered: the SSE event stream, reply content, page reloads that lose the tab's state, more than one server instance claiming the same conversation, and timeouts (a timeout is modeled as the 202 being lost).

## Coverage record

- **Covered:** the files and functions in the "When to run" table.
- **Last confirmed against:** the before-119 config matches main at `1df2f9ea`. `CancelTarget.cfg` matches the #119 fix merged as `ec6362d0` (#149): `/abort` requires `submissionId` (400 otherwise), `engine.abort(id, submissionId)` cancels only a still-pending named submission, `cancel()` sends nothing without an id, and `recheck()` aborts by id once the late 202 arrives.
- Move this commit forward only after you have read the covered code at the new commit and confirmed that the model still describes it.
