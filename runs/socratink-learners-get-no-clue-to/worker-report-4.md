# Build-4 handoff

## Situation

Implemented and committed the approved build-4 changes in `065851a960e491e45383c7a3084a576feb4e1c2b`. All required local checks pass. Live behavior after the prompt change remains untested.

## Background

Read the checkout instructions, stage-3 context, build-4 contract, approved brief, seed contract and checks, product guidance, owning modules, callers, and tests. No named input was unavailable. Used the supplied live probe as before-fix evidence. Made no live model or production requests. Kept the model and thinking level unchanged.

## Assessment

- Added `no-choice-position` to `src/learning/behaviour-rules.ts` and its exact sentence to `src/learning/chat-policy.ts`.
- Added a scenario that requests a question card, submits its displayed choice with reasoning, then asks which choice was right and whether it was the top one. The check skips rather than claims a pass if the card or final reply is absent.
- Added a text check for ordinal, top/bottom, lettered and numbered choice references. Tests cover the saved failure wording, formatted positions, empty replies, and unrelated uses of position words. This is a text heuristic, not a complete language check.
- Added a known position-wording bug to `badTutor`. The provider-stub suite proves that the check rejects the buggy tutor and accepts a tutor that names the choice by its words.
- Existing choice shuffling is unchanged. An identical retry card keeps the same order by design.

Checks and local logs, relative to `runs/socratink-learners-get-no-clue-to/`:

- `pnpm test:tutor-eval` passed, 16 tests. Log: `build-4-eval.log`. The final aggregate check also ran this suite after the last edit.
- `pnpm check` passed, including types, unused-code checks, tutor eval tests, policy tests, shuffle regression, and build. Log: `build-4-check.log`.
- `pnpm smoke` passed with the deterministic fake provider. Log: `build-4-smoke.log`.
- `git diff --check` passed.
- Before adding the prompt sentence, the policy quote test failed on the missing `no-choice-position` sentence. It passed in the final aggregate check. Expected failure log: `build-4-policy-red.log`.
- Applied the new check to the supplied `evidence/live-position-probe-before-fix.json` before changing the prompt. Three saved replies failed for choice-position wording, in runs 2 and 3. Two other replies failed for empty answer text, not position wording. Log: `build-4-before-fix.log`. No new live run took place.

There are no unresolved local check failures. The saved probe used different learner text from the new scenario. It establishes the prior wording bug, not a before/after live result for the exact new scenario. Local logs are ignored checkout artifacts, not verification receipts.

Skills used: `principle-build-the-lever` led to a repeatable scenario and check in the existing eval runner, rather than a manual wording review. `unslop` led to a short, factual handoff with explicit evidence limits.

## Recommendation

The operator should run `pnpm eval:tutor --live --only no-choice-position --runs 3` and review the transcripts. The requested `pnpm eval:tutor --live --runs 3` summary is unavailable because this step explicitly forbids paid live evals. Local tests do not establish live compliance, learning effectiveness, or production readiness.

No local server or background process remains from this work. Test providers and smoke processes closed when their commands ended. Preserved all pre-existing changes, including `AGENTS.md`, the brief, and run records. Did not run `sdlc.py step`, `stage`, `decide`, or `verify`, change dependencies or routing, or push. The launcher owns the next verification step.
