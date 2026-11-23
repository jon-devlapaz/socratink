# Socratink product agent guide

Make the smallest complete change for the requested outcome. Prefer deletion.
Inspect the owning module, its callers, and relevant tests before editing.

## Read first

- Direction: [North Star](NORTH-STAR.md). Code and checks establish what is built,
  not the North Star. Report missing authority rather than inventing doctrine.
- Current app: [PRODUCT.md](PRODUCT.md). Setup and checks: [README.md](README.md).
- Code: [CODING_STANDARDS.md](CODING_STANDARDS.md). UI: [DESIGN.md](DESIGN.md).
- Pi Durable engine, tools, or model routing: inspect the installed
  `@earendil-works/pi-durable` version and published types. Do not invent APIs
  or rely on missing helpers.

## Stay within scope

Prefer existing flows and vanilla TypeScript/CSS. Keep environment access
behind `src/config/` or the server boundary.
Ask before adding or upgrading dependencies, changing schemas or learner-data
handling, public APIs, authentication, authorization, rate limits, deployment
or external services, or deleting user work, tests, data, or substantial behavior.
New capabilities need an explicit request.
Keep learner work distinct from AI help. Use `present_question` for defined
choices or diagnostics. Preserve reveal provenance. The tutor rates subskills
and mastery within a conversation by the policy in `src/learning/`.
A tutor-behaviour bug gets a scenario in `evals/tutor/` that fails on the live
model before the fix; a new rule goes in `src/learning/behaviour-rules.ts`.
Prompt or model changes report a `pnpm eval:tutor --live --runs 3` summary.
`--live` calls a paid model: ask first.
Tests and synthetic runs do not establish retention, transfer, mastery,
learning effectiveness, or production readiness.
Keep secrets and learner data out of source and logs. Use synthetic data for
external-service checks.

## Prove and finish

Run `pnpm check` and `pnpm smoke` before handoff unless the user narrows the
checks or the environment prevents them. Report what ran and what is unproven.
Do not weaken tests to make them pass. Use browser or live checks when needed
and authorized.
If knip (`pnpm check:unused`) flags code, delete it or remove the `export`.
Add a `knip.json` ignore entry only with a reason in the PR.
Inspect `git status --short` before editing and handoff. Preserve unrelated work.
Stage, commit, amend, push, create branches, or open PRs only when asked.
For **git golden**, run `scripts/git-golden.sh`. Stop on failure and report every
`FAIL` line. Do not delete branches, worktrees, stashes, or dirty files unless asked.

## Response style

Only respond to the user using ASD-STE100 Simplified Technical English and the Bottom Line Up Front (BLUF) approach. Use SBAR for handovers and status updates. These do not apply to code or when the user asks otherwise


<!-- AI-Native SDLC Router -->
## SDLC Workspace
- Read `_system/SDLC.md` for setup, evidence boundaries, and recovery.
- Inspect `python3 _system/scripts/sdlc.py status` before creating a run.
- Read `stages/<stage-name>/CONTEXT.md` before processing a stage.
- Keep factory references in `_shared/` unchanged during feature runs.
- Use separate worktrees or clones for code-writing runs.
- Stage skills: see the Skills section of the current stage's CONTEXT.md.
- Need a specialised skill mid-task? `tink-route --receipt runs/<slug>/skills.jsonl "<what you need>"` prints it on stdout; exit 1 means none fits, so continue without one.
<!-- End AI-Native SDLC Router -->
