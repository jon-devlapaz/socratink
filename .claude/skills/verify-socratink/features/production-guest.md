# Production guest

A new guest starts on Home. A second tab resumes the active lesson. The guest can open Sign in from the menu. After a hint, the original card stays available and the learner can answer on it.

## Sub-features

- The guest menu shows Sign in before a lesson and after auto-resume.
- After “I don't know” gets a hint, the original prompt and choice order survive reload.
- The tutor gives a new, settled reply to the choice and reasoning submitted on the card.

## How to get to it (user POV)

Open Socratink in a fresh browser profile. Start the seasons quiz. Open a second tab and check the resumed lesson and Sign in. Back in the first tab, select **I don't know**. When the hint appears, reload, select a choice, add reasoning, and submit.

## Driving it with learner.mjs

Run from the repository root after the production deploy succeeds.

```sh
node .claude/skills/verify-socratink/journeys/production-guest.mjs
```

Use the printed `result.json` path to find the observations and screenshots. A pass requires a settled reply immediately after the submitted reasoning.

## Gotchas

- A live tutor can offer an answer or example instead of giving a hint. In that case the journey fails with a missing hint, and the card behavior is still unverified.
- Run `node --test .claude/skills/verify-socratink/production-reply.test.mjs` to check the reply wait without a model call. It rejects the earlier hint both before and during **Thinking**, then accepts the new reply.
