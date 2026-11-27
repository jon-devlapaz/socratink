# Socratink verification map

This directory is the maintained source for verifying what a learner sees and does in Socratink. Read this index first, then the feature file that matches the change.

## Baseline preconditions

- A run is launched with `control.mjs launch` and `control.mjs doctor` reports `"ok": true` and `"stale": false`.
- Each learner is a fresh browser context: a new guest session with no conversation. The first page shows an enabled `#message` with the placeholder `What are you working on?`.
- Drive the instance this run launched. For a post-deploy guest check, use the separate [production guest journey](./production-guest.md).

## Driving conventions

- Send by typing into `#message` and pressing the `Send message` button (`send()` in `learner.mjs`).
- `waitForReply()` waits for a settled assistant turn. Pass `{ after: learnerText }` to require a reply immediately after the learner's submitted text.
- While a reply streams, its text is in `#active-turn .turn.pending .turn-markdown`.
- Request outcomes show as `#active-turn .request-state` with the label `Not sent`, `Canceled`, `Socratink couldn’t reply` (button `Retry`) or `Outcome unknown` (button `Recheck`).
- Prefer these ids, roles and labels over CSS position. Find others in `src/ui/conversation-layout.tsx`, `src/ui/turn-view.tsx` and `src/ui/chat-request-view.tsx`.

## Proof and skip reporting

- Every feature saves a screenshot of the pending state and the settled state, plus `result.json`.
- Name the provider in the report. A journey that needs the scripted model cannot run on a real model; report it as not run on that provider, not as passed.
- Report an unreachable step with the command you ran and the precondition that was missing.

## Feature entry contract

Each feature file has an H1 title, one paragraph on the learner-visible behaviour, then four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with learner.mjs`, `Gotchas`.

## Features

- [Composer rest](./composer-rest.md): a short conversation sits just above the composer, and nothing jumps when a reply finishes (PR #158).
- [Two tabs](./two-tabs.md): one learner, two tabs on one conversation; each tab keeps its own reply (PRs #149, #159).
- [Ask once](./ask-once.md): a reply that asks its question in text and again on a card shows it once, on the card (#163).
- [Stream recovery](./stream-recovery.md): a dropped or repeatedly closed reply stream reconnects with growing pauses and shows the reply once (PR #159).
- [Production guest](./production-guest.md): Home, auto-resume, Sign in, and an answer submitted on the original card after a hint (PR #239).

Other coverage in `scripts/*-browser-smoke.mjs` includes History, reveal consent, Start over, the guest turn limit, and feedback.
