# Build handoff

## Situation

Implemented the saved, default-off Sound menu control and one short Web Audio tick for a fresh, unmarked tutor reply. The implementation has no chime or audio asset. Operator acceptance is pending.

Run ID: `b9a2bbf3-4113-4102-b227-2d5910d2f81c`.
Checkout: `/Users/jondev/dev/worktrees/tink-sdlc-setup/learners-who-turn-sound-on-hear-a-soft`.
Seed: `runs/learners-who-turn-sound-on-hear-a-soft/seed-contract.md`.
Seed SHA-256: `6c13c78aa871837a78b9257851168fc5d1daf873585d5e3bccfdf0ea0f878edb`.
Verified code candidate: `ba20a4d925503aea3ee63608a5c0239acf288b4a`. The later handoff commit adds only run evidence and this report update. No PR or result revision exists.

## Background

The brief is an empty template. The confirmed seed, stage-3 approval shown by status, build contract, and user instruction define this work. No model or thinking setting changed. The pre-existing AGENTS.md change and untracked launcher records were left unchanged and excluded from the implementation commit.

Changed production files: `src/ui/sound-cues.ts`, `src/ui/chat-surface.ts`, `src/ui/index.html`, and `src/config/app.config.ts`. Changed checks: `scripts/sound-cues.test.mjs`, `scripts/sound-cues-faults.mjs`, and package scripts.

Added only an activation object to seed-1. Its command and cwd match the original confirmed proposal. The proposal remains intact. Activation is not verification evidence by itself.

## Assessment

Passed before commit:

- `pnpm install --frozen-lockfile`.
- Eight production-UI browser tests in `node --test scripts/sound-cues.test.mjs`, also run by `pnpm check`. They cover default-off, saved choice, gesture gating, fresh completion, all four assistance marks, settled history, recovery after reload, Sound off, reduced motion, and duplicate completion.
- `node scripts/sound-cues-faults.mjs`. All six planted faults caused the required sound-count assertion to fail. This includes removal of the duplicate-consumption guard. The driver exits zero only when each selected test rejects its fault.
- `pnpm check`, including types, all configured tests, production builds, and static routing.
- `pnpm smoke`, using the local deterministic fake provider.
- The exact seed-2 scope command and `git diff --check`. Diff review also found no package dependency declaration or top-level server change.

The initial test failed because the sound implementation did not exist. An initial browser run failed because Chromium was absent. Chromium was then installed only under `.cache/ms-playwright`. A test click blocked by the existing composer layout was replaced with a keyboard gesture. A fault probe first failed to inject the reduced-motion fault after Vite changed quote syntax. The fault plugin now runs before transformation; all fault probes pass. These failures are resolved.

Browser tests use real production UI, conversation coordination, wire parsing, and reveal consumers. Only HTTP and Web Audio are fake boundaries. A supplementary duplicate-call check uses a reply parsed from the synthetic HTTP history. Numeric gain and duration assertions do not prove audible quality on a phone.

For checks in this checkout, export `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"` and `TMPDIR="$PWD/.cache/tmp"`. This keeps browser tooling and temporary files inside the checkout. CI already installs Chromium. No production or preview request was sent. All test-owned local servers and browsers closed before handoff.

The build-the-lever skill led to the committed, repeatable fault driver instead of manual source edits for each fault. The unslop skill kept this report and UI wording direct.

## Recommendation

Committed-work verification ran with `python3 _system/scripts/sdlc.py verify learners-who-turn-sound-on-hear-a-soft`. It exited 1 with `Checklist incomplete: seed-4, seed-5`. The receipt at `04-test/output/verification.json` records `awaiting-attestation`, seed-1 through seed-3 proven, and `seed-1 red at base, green at candidate`. All automated checks passed. The verification log is `04-test/output/test-log.md`. This is not a completed verification or operator acceptance.

Seed-4 needs the operator's phone review on the PR's Vercel preview before merge. Seed-5 needs the operator's independent scope review. No manual acceptance record was created. No PR or preview URL was supplied or established. Audible quality, real device audio behavior, and operator acceptance remain unproven. The trusted Tinkery executable path was not supplied; intake was not repeated or replaced with another tool.
