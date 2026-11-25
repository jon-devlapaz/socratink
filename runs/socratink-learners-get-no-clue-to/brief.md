# Change brief

## Problem and outcome

## Acceptance criteria

## Constraints and exclusions

- Must (non-negotiables):
- Must not (exclusions and rejected alternatives):

## Approach

The implementation checklist lives in `checklist.json` (definitions with id/description/verify) and is marked only with `sdlc.py mark`. Give an item a `check` (argv + timeout) whenever an automated proof exists; `verify` then runs it and no mark is needed.

## Risks and verification

## Review findings for step build-2 (2026-11-25, /ship review checked by the agent operator)

Fix these three on top of the committed shuffle. Keep the change small.
1. The shuffle must be stable for the same card. `executeLearningTool` runs again on durable replay (`replay: 'safe'` in `src/server/durable/extension.ts:26`) and in `afterTool` (line 60), so `Math.random` can give a different order for the same card. Derive the order from a hash of the card's prompt and choice labels instead, so the same card always shows the same order and different cards still vary. Keep the distribution test (each position 25% ± 3 points over many distinct cards).
2. Choices such as "All of the above", "None of the above" or "None of these" must stay last (in their original relative order). Add a test.
3. The shuffle-removal probe must not depend on the loop's exact source text (`scripts/question-choice-shuffle.test.mjs:119`). Prove the regression through behavior, for example by checking that the test fails against `origin/main`'s `src/learning/tools.ts`.
Not in this step: tutor wording such as "the first option" (needs a paid live eval; the operator decides separately).
Commit first, then update worker-report.md (a "build-2" section), then end your turn.
