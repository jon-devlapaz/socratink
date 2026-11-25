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

## Findings for step build-3 (2026-11-25, operator's merge-risk review of PR #184)

1. CI is red: `scripts/question-choice-shuffle.test.mjs:124` runs `git show origin/main:...`, and CI checks out a shallow clone with no `origin/main`. Make the reversion test self-contained: build the unshuffled baseline inside the test (for example a temporary `tools.ts` that returns `questionnaireFromPresentQuestion(input)` unchanged), with no git command. It must still fail on that baseline for the distribution assertion.
2. The PR body claims a retry is covered, but an identical retry card keeps the same order by design. Make the PR body and worker report say exactly that; do not change the behaviour unless the brief later says so.
Commit first, then add a "build-3" section to worker-report-2.md's successor (worker-report-3.md is the step report), then end your turn.

## Findings for step build-4 (2026-11-25, live tutor probe)

A live probe (3 runs, local tutor route, transcripts in `runs/socratink-learners-get-no-clue-to/evidence/live-position-probe-before-fix.json`) shows the tutor naming choices by position: "It was the first one", "The top one — the first option". With the shuffle, the tutor's "first" is its own order, not what the learner saw, so this reply is now wrong. Follow socratink AGENTS.md for a tutor-behaviour bug:
1. Add rule `no-choice-position` to `src/learning/behaviour-rules.ts`, quoting a new system prompt sentence such as: "Never refer to a card's choices by position (first, second, top, bottom, A, B); name the choice by its words."
2. Add that sentence to the system prompt (`src/learning/chat-policy.ts` or where the card rules live).
3. Add scenario `no-choice-position` to `evals/tutor/scenarios.ts` (answer a card, then ask "which one was right? was it the top one?") with a check in `evals/tutor/checks.ts` that fails on position words naming a choice. Give `badTutor` in `evals/tutor/eval.test.ts` a known bug for it so `pnpm test:tutor-eval` proves the check fails.
Do not run the live eval (`--live` is paid); the operator's agent runs it after this step.
Commit first, then write the step report, then end your turn.

## Findings for step build-5 (2026-11-25, production eval + LearnHarness pattern)

Production eval (route AI Gateway, model xiaomi/mimo-v2.6-flash; `runs/socratink-learners-get-no-clue-to/evidence/prod-eval-after-build-4.json`): `no-choice-position` failed 1 of 3. The learner asked "Was it the top one?" and the tutor said "the top one was wrong… The top choice claims…", meaning its own first choice, not the top one on screen. A prompt ban is not enough. Copy LearnHarness's order handling (github.com/amosblomqvist/learnharness, `src/core/question-core.ts`: `shuffleOptions(options, seededRandom(toolCallId))`, `optionOrder`, `compactAnswerForModel`):
1. Seed the shuffle with the tool call's id, so the order is stable on replay and reload but a new call (including an identical retry) gets a new order. The durable `execute` and `afterTool` paths in `src/server/durable/extension.ts` must use the same seed for the same call. Keep "…of the above" choices last. Keep the distribution test over many call ids.
2. Tell the tutor what the learner saw: the tool result the model reads lists the choices in displayed order with letters (A, B, C…), so the tutor's words can match the screen.
3. Replace the "Never refer to a card's choices by position" sentence and rule with one that says the tutor may refer to a choice by the displayed letter or position from the tool result. Change the `no-choice-position` check so it fails only when a named position or letter does not match the displayed card (the eval has the card it showed). Keep the bad-tutor proof.
Do not run `--live` (paid); the operator's agent runs it after this step.
Commit first, then write the step report, then end your turn.
