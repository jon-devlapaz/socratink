# Build-3

## Situation

Committed the self-contained shuffle regression in `96189ea91c4979aac83b778cd282102793534772`. All local checks passed. The GitHub PR body still needs the wording correction below. No application behavior changed.

## Background

Read the approved brief, build-3 step contract, stage context, checkout instructions, bound seed, locked checks, prior report, tool implementation, durable caller and relevant tests. Stage 3 status reports approval against the confirmed seed. I did not run `sdlc.py step`, `stage` or `decide`, change the model or thinking level, or read secrets.

The earlier regression required `origin/main`, which a shallow CI checkout does not have. The test now writes a temporary `src/learning/tools.ts` that returns `questionnaireFromPresentQuestion(input)` without reordering. It runs the distribution test against that module and requires exit code 1 with the specific distribution assertion. It uses no Git command and does not match or edit the shuffle implementation's source text. Temporary copies are inside the checkout and are removed after the test.

## Assessment

Evidence files are beside this report.

- `build-3-baseline.log`: before the fix, the test failed with Git unavailable through an empty checkout-local `PATH`. The other three tests passed. This is the expected reproduction, not a remaining failure.
- `build-3-shuffle.log`: after the fix, all four tests passed under the same no-Git condition. The temporary unshuffled baseline failed for the required distribution assertion, which makes the removal probe pass.
- Across 4,000 distinct first cards, correct-choice counts were 1026, 975, 1018, 981. Across 4,000 distinct cards labelled retry, counts were 1028, 985, 1003, 984. These retry inputs have different prompts. Both sets meet 25% plus or minus 3 percentage points per position.
- An identical retry card keeps the same choice order by design. The replay test checks JSON-equivalent input 20 times. The distribution test does not prove a fresh order for an identical retry, and this step does not add that behavior.
- `build-3-check.log`: `pnpm check` passed, including types, unused code, card tests, synthetic tutor tests, durable tests, build and routing checks.
- `build-3-smoke.log`: `pnpm smoke` passed with its deterministic local provider, including card handling, reveal correction and restart persistence.
- `git diff --check` passed before the code commit.

The test change is the rerunnable proof required by `principle-build-the-lever`. `unslop` led to explicit wording about identical retries and the limits of the evidence.

No unresolved local check failure remains. No dependencies, prompts, model routes, schemas, public APIs or learner-data handling changed. No production or live-model request was sent. `VERCEL_ENV` was unset for checks to prevent the preview model probe. Temporary files for those checks were directed into the checkout. Smoke cleanup stopped its application and fake provider. No server or background process started by this work remains running.

The PR #184 body was not read or changed. It is not a local approved input, and remote writes conflict with the instruction to write only in this checkout. I did not infer its current text or send a GitHub request. The approved review says it overstates retry coverage. The exact correction to apply is:

> Choice order is deterministic from the card prompt and choice labels. An identical retry card keeps the same choice order by design. Distribution coverage uses distinct cards, including retry-labelled cards with different prompts. Replay coverage checks that identical cards retain their order. A retry does not guarantee a new order.

No other required local input was unreadable. Live tutor behavior, position-dependent tutor wording, browser interaction, learning effectiveness and remote CI remain unproven. No SDLC verification receipt or independent acceptance is claimed.

Existing edits to `AGENTS.md` and `brief.md`, and existing untracked stage, decision, step and authorization records were preserved and excluded from my commits. The implementation was committed before this build-3 report was written. This report and its logs are committed separately.

## Recommendation

Apply the PR body correction through an authorized remote write. Run SDLC verification against the committed candidate, then obtain independent review. Do not treat these local checks as operator acceptance or release authority.
