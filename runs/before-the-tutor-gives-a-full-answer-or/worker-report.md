# Build handoff

## Situation

Implemented and committed the consent gate. The final local checks pass. Formal verification, independent review, and operator acceptance remain pending.

- Run ID: `61cdc9f8-e84c-4c46-b361-df7f64bab22e`.
- Checkout: `/Users/jondev/dev/worktrees/dogfood-ask-before-answer/before-the-tutor-gives-a-full-answer-or`.
- Code candidate: `81c3199b5e5ac7a0373b94e0ff4bcfa454bb695c`. A report-only commit follows this candidate.
- Bound input: `runs/before-the-tutor-gives-a-full-answer-or/seed-contract.md`.
- Bound seed SHA-256: `152e0851940d9b7de2ad1753f04f7645894307de7623960660f041904445e722`.
- No PR, deployment, or release was requested or created.

## Background

The brief remains a template. The approved seed and stage-3 contract supplied the scope. Status reported stage 3 approved and matching the confirmed seed.

The checkout already contained changes to `AGENTS.md` and untracked stage, step, and authorization files. I preserved these files and did not include them in my commits. I did not run `sdlc.py step`, `stage`, or `decide`, change the model, or delegate work.

## Assessment

### Changes

`src/server/durable/reveal-consent.ts` owns the gate. For new submissions, it removes protected text and tool data from the browser snapshot and supplies a one-line preview through the existing question card. Only the exact See it answer to the preceding pending card permits the next reveal of the same kind and target. Try once more does not grant permission. The pending choice is derived from durable records, so restart preserves it.

The engine stamps new input records with an internal `revealConsent` flag. Older input records without this flag retain their existing display behavior. No database migration, public wire change, dependency change, or new learner-content store was added.

Unclassified new text waits until settlement. Marked hints and partial explanations can still stream without a consent choice. This hold is necessary because a provider can send protected text before its reveal mark. It also delays ordinary unmarked replies until settlement. The tutor bindings explain the app-managed choice and instruct the tutor to ask for an attempt after Try once more. The pinned teaching skill is unchanged.

The gate uses reveal metadata. It does not independently determine whether arbitrary prose is actually a full answer. An omitted or incorrect final classification remains a model-compliance risk. After See it, the tutor generates the permitted response again; the check establishes the scripted response, not identical wording from a live model.

### Evidence

Evidence paths below are relative to `runs/before-the-tutor-gives-a-full-answer-or/03-build/output/`.

- `consent-red.log`: with the projection guard reverted, all four protected-kind/choice cases failed at the assertion that protected content must not reach the browser before permission. The hint case passed. The guard was restored.
- `consent-green.log`: all 17 selected tests passed. These include the five new integration cases and the existing reveal, reveal-UI, and teaching-policy tests.
- `check.log`: final `pnpm check` passed, including types, contract tests, the new consent suite, durable tests, builds, and static routing.
- `smoke.log`: final `pnpm smoke` passed with the deterministic local fake provider. The smoke now checks the pending choice before permission and reveal provenance after permission and restart.

The new integration suite enters the real durable engine with SQLite and a local synthetic provider. It checks both protected kinds, both learner choices, intermediate browser snapshots and live views, restarted pending cards, one-turn permission, and a hint visible before settlement without consent.

Earlier checks failed. The initial blanket hold broke two reconnect timing assertions. A narrower hold then failed the consent regression by leaking an early text fragment. The blanket hold was restored. The reconnect fixture now marks its synthetic stream as a hint first; all original reconnect assertions remain. The old smoke expected an immediate full answer and failed. It now submits consent before checking the same answer and provenance. An earlier smoke attempt also failed because the build output did not yet exist. These failures are resolved in the final local checks.

### Seed activation

Added only `activation` to `seed-1` in `seed-checks.json`. The original proposal is intact. The prerequisite test file now exists. Activation uses the confirmed command and working directory exactly:

`pnpm install --frozen-lockfile && node --test scripts/ask-before-reveal.test.mjs`

Working directory: `.`. Status reports activation as matching the confirmed seed. Activation is not verification proof. The verifier must still run the committed command green and establish red at the run base.

### Limits

- `sdlc.py verify` was not run. The local test logs are not a verification receipt.
- Seed-4 still needs operator judgment on narrow and desktop layouts, both themes, and keyboard focus. No attestation was fabricated.
- The browser smoke helper was updated for the consent step but was not run with `REVEAL_BROWSER=1`.
- Legacy history preservation follows the input flag branch but has no new dedicated integration assertion.
- No production or live model endpoint was contacted. All model requests used local synthetic providers. Test servers and engine instances were closed by their cleanup paths.
- These checks do not establish learning effectiveness, mastery, retention, or production readiness.

### Skills

`principle-build-the-lever` led to the committed, repeatable integration test rather than a manual-only check. `unslop` led to plain handoff text and commit wording.

## Recommendation

Run formal verification against the committed checkout. Complete the seed-4 visual and keyboard review, then obtain independent technical review. Do not treat the passing local checks as operator acceptance.
