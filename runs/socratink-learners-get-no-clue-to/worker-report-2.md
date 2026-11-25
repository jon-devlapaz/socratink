# Build-2 handoff

## Situation

Implemented the three approved review fixes in commit `ce59533e3ff385c5f986afbb0d71e95ecf2a91ee`. Local checks pass. SDLC verification and independent review remain pending.

- Run ID: `3e63ae8c-40a0-49a0-8559-1486564e4287`.
- Checkout: `/Users/jondev/scratch/pilot-TEST/HOME/dev/worktrees/pilot/socratink-learners-get-no-clue-to`.
- Bound seed: `runs/socratink-learners-get-no-clue-to/seed-contract.md`.
- Seed SHA-256: `14752b697459573cb2a375add8f9426196fa0bf2c55f54f2a6d6566315d792c2`.
- No PR, release, or operator acceptance is claimed.

## Background

The approved brief names three corrections to the first build. I read the brief, build-2 contract, stage context, checkout instructions, seed, locked checks, owning module, callers and relevant tests. The durable extension executes the tool during replay and after-tool validation. Random state was therefore unsuitable for card order.

`src/learning/tools.ts` now ranks choices with SHA-256 over the validated prompt, ordered choice labels and original index. The same card keeps the same order. Different cards vary. Label/value pairs move together. The shared converter and reveal-consent reconstruction remain unchanged.

The named choices "All of the above", "None of the above" and "None of these" stay after ordinary choices, in their original relative order. Matching ignores case and accepts a final period or exclamation mark.

## Assessment

Evidence paths below are relative to `runs/socratink-learners-get-no-clue-to/`.

- `build-2-baseline.log`: the revised regression failed before the fix. The replay test rejected a random draw, and the summary-choice test failed its order assertion. This was an expected reproduction failure, not an unresolved failure.
- `build-2-shuffle.log`: all four shuffle tests passed. Across 4,000 distinct first cards, correct-choice position counts were 1026, 975, 1018, 981. Across 4,000 distinct retry cards, counts were 1028, 985, 1003, 984. Each position is within 25% plus or minus 3 percentage points.
- The replay test presents JSON-equivalent inputs 20 times with `Math.random` set to throw. It checks stable complete definitions, duplicate labels, explicit values and unchanged converter order.
- The summary-choice test checks 40 cards, all three named labels, their relative order and answer mapping. Distribution tests still check every displayed selection and exact saved-definition restoration.
- The removal probe no longer edits a shuffle-loop source pattern. It copies the production dependencies into a temporary checkout-local directory, substitutes `origin/main:src/learning/tools.ts`, and requires the distribution test to fail for its specific assertion. The observed local baseline was `971959f6a7cbda20178592bb11da10ef643a357e`. It made no remote request. The probe reports an error if the local ref is unavailable or no longer provides the unshuffled baseline.
- `build-2-check.log`: `pnpm check` passed, including type, unused-code, card, synthetic tutor, durable, build and routing checks.
- `build-2-smoke.log`: `pnpm smoke` passed, including card handling, reveal provenance, help, consent and restart persistence.
- `git diff --check` passed before the implementation commit.

No unresolved check failure remains. No dependencies, schemas, public APIs, model settings, prompts or learner-data formats changed. Paid live evaluation and position-dependent tutor wording are outside this step. No production or live-model request was sent. Builds ran with `VERCEL_ENV` unset to prevent the preview model probe. Temporary files stayed in the checkout. Smoke processes exited, the regression child exited, and its temporary copy was removed. No server or background process started by this work remains running.

No required local input was unreadable. Reported screenshots and earlier external sample paths were not needed or opened. Browser checks, live tutor behavior, external services and learning effectiveness remain unproven. There is no new SDLC verify receipt, test lock, independent test acceptance or human attestation from this step.

Existing modified `AGENTS.md`, approved `brief.md` and untracked stage, decision, step and authorization records were left unchanged and excluded from these commits. The original `worker-report.md` receives a build-2 section after the implementation commit. This report and retained logs are committed separately as evidence.

The `principle-build-the-lever` skill led to rerunnable behavior tests and a source-independent baseline probe. The `unslop` skill led to direct claims and explicit limits in this handoff.

## Recommendation

Run SDLC verification on the committed candidate, then obtain independent review. Keep automated evidence separate from operator acceptance. No merge or deployment was attempted.
