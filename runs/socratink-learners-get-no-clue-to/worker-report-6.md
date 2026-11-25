# Build-6 report

## Situation

Implemented build-6 in commit `86398c7e1824cc75a4cfcbb938d18a0bb640c097`. All checks below passed. Live tutor effects remain untested.

## Background

Read the approved brief, build-6 step contract, stage-3 context, checkout instructions, and run seed inputs. The change follows only the build-6 findings. Pre-existing changes to `AGENTS.md`, `brief.md`, and run records were left unchanged and were not staged.

## Assessment

- Removed the displayed-position sentence from `src/learning/chat-policy.ts` and its entry from `src/learning/behaviour-rules.ts`.
- Kept card letters and displayed order in `src/learning/tools.ts` unchanged.
- Kept the `no-choice-position` scenario and check. Added its name directly to `CheckName` and used that type for expected eval failures.
- Kept the bad-tutor proof. Its incorrect displayed-letter answer still fails the check.
- Added a test that the position check has no prompt rule. It failed before the removal with `true !== false`, then passed after the removal.

Checks run with `TMPDIR` inside the checkout:

- `pnpm test:tutor-eval`: 17 passed, 0 failed.
- `pnpm check`: passed, including types, card shuffle regression, tutor eval, build, and static checks.
- `pnpm smoke`: passed, including card help, reveal correction, learning exchange, and restart persistence.
- `git diff --check`: passed.

Local logs are in `.cache/build-6-red.log`, `.cache/build-6-tutor-eval.log`, `.cache/build-6-check.log`, and `.cache/build-6-smoke.log`. They are ignored local files, not committed evidence. No unexpected check failures remain. The baseline failure was expected.

Skills used:

- `principle-build-the-lever`: added the repeatable eval test instead of relying only on manual prompt inspection.
- `unslop`: kept this report and the commit message direct and limited claims to observed results.

## Recommendation

Run independent verification on the committed code. Do not infer better one-question results from these synthetic checks. No paid live eval, production request, release, or model change was made. Local test servers stopped when the test commands ended. No server or background process was started separately.
