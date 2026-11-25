# Build handoff

## Situation

Implemented and committed the choice shuffle. The required local checks pass. SDLC verification and independent review remain pending.

- Run ID: `3e63ae8c-40a0-49a0-8559-1486564e4287`.
- Run: `socratink-learners-get-no-clue-to`.
- Checkout: `/Users/jondev/scratch/pilot-TEST/HOME/dev/worktrees/pilot/socratink-learners-get-no-clue-to`.
- Implementation commit: `f662953eba2fe8ab1336912f06f39cff8ee0a528`. A separate evidence-only commit adds this report.
- Bound seed: `runs/socratink-learners-get-no-clue-to/seed-contract.md`.
- Seed SHA-256: `14752b697459573cb2a375add8f9426196fa0bf2c55f54f2a6d6566315d792c2`.
- No PR or release revision was created.

## Background

The brief is an empty template. I used the bound seed, locked checks, stage-3 context, build step contract and checkout instructions. Read-only SDLC status reported stage 3 approved and the definitions matched the confirmed seed. Seed confirmation is agent-attributed, not verified human identity or release approval.

The shared converter also constructs reveal-consent cards during history projection. Shuffling there would change reconstructed cards. The shuffle instead runs in `src/learning/tools.ts`, after labels receive their values and before the tool returns the card. It uses Fisher-Yates and moves each label/value pair together. Every new `present_question` call, including a retry, takes this path. Stored definitions and the shared converter remain unchanged.

No dependencies, schemas, model settings, prompts, learner-data formats or public APIs changed.

## Assessment

Evidence files below are in `runs/socratink-learners-get-no-clue-to/`.

| Condition | Observed evidence |
| --- | --- |
| Approximately equal correct-answer positions | `seed-1.log` and `shuffle-tests.log`. The regression calls the production tool for 4,000 first/retry pairs. First-card counts were 1024, 956, 1021, 999. Retry counts were 994, 986, 1009, 1011. |
| Retry shuffling | Separate retry distribution plus fixed-random tests for new draws and a different retry order in `scripts/question-choice-shuffle.test.mjs`. |
| Selection mapping | Every displayed value is submitted to `formatQuestionnaireAnswers` and must produce its exact displayed label. Duplicate labels and explicit values have exact pair assertions. |
| Stable restoration | JSON round trips through the production reply/history parsers preserve complete definitions and use no random draws. `smoke.log` also covers application restart and exact restoration of the cards actually displayed. |
| Regression depends on shuffling | `shuffle-baseline.log` records the unfixed failure with counts 4000, 0, 0, 0. The regression also copies only its named source files into `.cache/`, removes only the shuffle loop, runs the production distribution test in a child process, requires its specific failure, and removes that copy in `finally`. The checkout source is never reverted. |
| Existing card contracts | The focused run passed all 18 tests in `shuffle-tests.log`. `pnpm check` also ran the present-question and questionnaire suites. |
| Repository checks | `check.log` records a passing `pnpm check`, including unused-code, type, contract, synthetic tutor, durable, build and routing checks. |
| Built application smoke | `smoke.log` records a passing `pnpm smoke` after the build in `pnpm check`. Reveal provenance, consent, help and restart assertions passed. |

Random control is a test-local replacement for `Math.random`. It uses a 32-bit LCG with seed `0x51a7`, multiplier 1664525 and increment 1013904223. Each of four positions must have 1000 plus or minus 120 correct answers, equivalent to 25% plus or minus 3 percentage points. The test title and named constants state the sample and tolerance. Separate fixed random values cover swap and no-swap behavior. The mock restores the original random function after each test.

The new regression is part of `pnpm test:present-question`, so it also runs in `pnpm check`. Existing policy and smoke tests now compare complete label/value sets without requiring model order. Smoke restoration still compares exact saved order. The synthetic tutor test now checks the actual first displayed choice and the complete learner reasoning instead of assuming the model's first choice remains first.

### Seed activation

Added only an `activation` object to `seed-1` in `seed-checks.json`. The original proposal is intact. The activation uses exactly:

`pnpm install --frozen-lockfile && node --test scripts/question-choice-shuffle.test.mjs`

Its cwd is `.`. Its evidence names the prerequisite test and retained passing and baseline logs. I ran that exact command successfully, as recorded in `seed-1.log`. SDLC status reports `seed-1 activated as confirmed`. This is not a verify receipt. Verify must still run the check green and establish red at base.

### Failures and limits

No unresolved check failure remains. During implementation, the nested test process first inherited Node's test context and skipped execution. The test now removes `NODE_TEST_CONTEXT` from that child environment and requires the expected nonzero exit and distribution assertion. The first full check also found a synthetic tutor assertion tied to model order. That assertion now checks the displayed choice. The later focused and full runs passed.

All model responses used by these checks were synthetic. No production or live tutor request was sent. Local builds had `VERCEL_ENV` cleared to prevent the preview probe from calling a model. Temporary directories and install caches were directed into the checkout. The smoke script stopped its app and fake provider; the regression child exited. No local server or background process from this work remains running.

Browser screenshots, the reported live sample, paid model evaluation, external databases and production behavior were not checked. No required local input was unreadable. I did not use the seed's reported screenshots or inspect credentials. Local checks do not establish learning effectiveness, operator acceptance or release readiness. No independent review or human attestation is claimed.

The initial checkout already had modified `AGENTS.md` and untracked stage snapshot, step and authorization records. I left those files unchanged and did not include them in the implementation commit.

### Skills used

- `principle-build-the-lever` led to a committed, rerunnable regression with an isolated shuffle-removal check instead of a one-time manual probe.
- `unslop` led to direct result statements and explicit limits in this report and the commit message.

## Recommendation

Complete the build step, then run SDLC verify on committed work. Review the shuffle and its regression independently. Keep verification, independent review and operator acceptance separate. No merge or deployment was attempted.
