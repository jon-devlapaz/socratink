---
name: verify-socratink
description: Drive the real Socratink app as a learner in a real browser (send, streamed reply, two tabs, dropped streams) and save screenshot proof. Use before merging a change to the chat UI, transcript layout, reply streaming, reconnects or multi-tab behaviour, or when asked to prove such a change works in the app, not just in tests.
---

# Verify Socratink as a learner

This skill launches a disposable copy of the app, opens it in headless Chromium the way a learner does, and runs journeys that save screenshots and a `result.json` per feature. The app, durable engine, SQLite or Postgres, SSE stream, and browser are all real. By default only the model provider is scripted, at the same boundary the app already isolates (`JON_LOCAL_BASE_URL`).

The feature map in [`features/README.md`](features/README.md) is the source for what to verify. Read it before driving the app, then the file for the feature your change touches.

Run every command from the repository root.

## Launch

```sh
node .claude/skills/verify-socratink/control.mjs launch                      # scripted model, free (default)
node .claude/skills/verify-socratink/control.mjs launch --provider local     # your JON_LOCAL_* model, from env or src/ui/.env.local
node .claude/skills/verify-socratink/control.mjs launch --provider gateway --paid   # real hosted tutor; paid
```

Launch runs `pnpm build`, copies `dist/` into `.cache/verify-socratink/runs/<run>/app/` (so the run gets its own `.cache/socratink/local.db`), starts the server on a free port bound to 127.0.0.1, and waits for `/healthz`. It ends by printing the doctor result. Ready means that result shows `"ok": true`.

Providers:

- **scripted** starts `fake-model.mjs`. It streams a short Socratic reply word by word (35 ms per word, `FAKE_MODEL_WORD_MS`). A message containing the word `LONG` gets a 12-paragraph reply. Journeys can hold a reply mid-stream.
- **local** uses the learner's own OpenAI-compatible model, as `pnpm dev` does.
- **gateway** runs in hosted mode (`VERCEL=1`) against AI Gateway with `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`. Hosted mode refuses SQLite, so launch starts a throwaway `postgres:17-alpine` container unless `DATABASE_URL` is set. **This calls a paid model: ask the user before every gateway run.** `--paid` is the record that you asked.

If launch fails, run `stop` before you try again, so the half-started run does not keep its ports.

## Doctor

```sh
node .claude/skills/verify-socratink/control.mjs doctor
```

Read-only. It checks that the processes this run started are alive, `/healthz` is ok with the expected inference route (`local` for scripted and local, `gateway` for gateway), the page serves the composer, and the scripted model answers its control port. `stale` is set when `HEAD` moved after launch: relaunch, because the running build is not your change. `builtFrom` says if the build included uncommitted changes. Run doctor first whenever a journey behaves strangely.

Doctor cannot tell whether a `local` model answers. A dead local model shows as “Socratink couldn’t reply” in the first journey.

## Drive

Journeys are executable scripts. Each one prints `PASS` or `FAIL` with the path of its `result.json`, and exits 1 on failure.

```sh
CHROME_PATH=/opt/pw-browsers/chromium node .claude/skills/verify-socratink/journeys/composer-rest.mjs
CHROME_PATH=/opt/pw-browsers/chromium node .claude/skills/verify-socratink/journeys/two-tabs.mjs
CHROME_PATH=/opt/pw-browsers/chromium node .claude/skills/verify-socratink/journeys/stream-recovery.mjs
```

`CHROME_PATH` is for a cloud container, where the pinned Playwright cannot find its own browser build. On a Mac with Playwright's browsers installed, leave it out. `two-tabs` and `stream-recovery` need the scripted provider, because they hold a reply mid-stream; `composer-rest` runs on any provider and is the one to run against a real model.

For a check no journey covers, write a short script with `learner.mjs`, following the feature file's steps:

```js
import { connect, send, waitForReply, view } from './.claude/skills/verify-socratink/learner.mjs';
const { learner, model, network, evidence, close } = await connect();
const tab = await learner.newTab();          // a tab of the same learner: same guest cookie and conversation
await model.hold();                          // scripted only: the next reply pauses after four words
await send(tab, 'Why do tides happen?');     // types into #message and presses "Send message"
network.dropStreams();                       // cut the reply stream; sending still works
network.restoreStreams(); await model.release();
console.log(await waitForReply(tab), await view(tab));
await tab.screenshot({ path: evidence('my-check', 'settled.png') });
await close();
```

`learner.mjs` also exports `journey(feature, body)`, which saves `result.json` and failure screenshots for you; the journeys show how to use it. The browser reaches the app through a loopback proxy in the driver process, so `network.drop()` / `restore()` cut the whole connection, `dropStreams()` / `restoreStreams()` cut only `GET .../events`, and `closeStreamsAfter(ms)` closes every reply stream shortly after it opens. Requests to other origins (analytics) are blocked. `learner.newTab()` records each tab's page errors in `tab.errors` and each reply-stream request time in `tab.streams`. `newLearner()` gives a second, separate learner.

## Evidence

Proof goes to `.cache/verify-socratink/evidence/<run>/<feature>/`: screenshots named for the step, and `result.json` with `passed`, the observed values, the provider, and the commit the build came from. A failing run also saves `failure-tab-N.png` per open tab.

Proof standards:

- Drive the learner's path: type into the composer, press the buttons, reload, open tabs. Do not call internal setters or API routes in place of a learner action.
- Capture the action and the state it leads to, not only the final screen. Each journey screenshots the pending state and the settled state.
- Check the side effect in a second view: reload, or open another tab, and confirm the server kept what the first view showed.
- Report what the provider was. A scripted-model pass proves the app, stream and browser, not the tutor's wording. Say which journeys ran against a real model, and that tutor behaviour belongs to `pnpm eval:tutor`.
- When you change a check, prove it can fail: run it on the commit before the fix and confirm it goes red there.

## Cleanup

```sh
node .claude/skills/verify-socratink/control.mjs stop
```

It stops the app and scripted model this run started (by saved process id, never by name), removes the Postgres container if launch created one, and deletes `.cache/verify-socratink/runs/<run>/`. It keeps `.cache/verify-socratink/evidence/<run>/` and prints its path. Pass `--run <id>` to `doctor` or `stop` to act on a run other than the latest.

## Files

| File | What it is |
|---|---|
| `control.mjs` | `launch`, `doctor`, `stop` |
| `fake-model.mjs` | Scripted OpenAI-compatible model with `/control/hold`, `/control/release`, `/control/calls` |
| `learner.mjs` | Browser driver: `connect`, `send`, `waitForReply`, `view`, `composerGap`, `trackLastTurn`, `journey` |
| `journeys/*.mjs` | One runnable journey per mapped feature |
| `features/` | The verification map |
