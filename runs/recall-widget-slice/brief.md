# Change brief

The confirmed seed (`seed-contract.md`) is the definition. This brief only adds operator decisions and rules relayed after confirmation (2026-11-08); it replaces nothing in the seed.

## Operator decisions (2026-11-08, settle the seed's open questions)

- Recall mode: "recall, then reveal". As relayed: the learner recalls privately, reveals the reference answer and sees it beside their attempt, with no model call per recall.
- Term source: terms come from what is already in Socratink. No separately created term sets.

## Environment (2026-11-08, resolves the build's first stop)

The `socratink-brain` skill is restored, untracked and gitignored, at `.agents/skills/socratink-brain` (from socratink commit `9579266b^`). The brain checkout is `/Users/jondev/dev/active/product/socratink/socratink-brain` (HEAD 8471da5); `SOCRATINK_BRAIN_PATH` points at it, so `python3 .agents/skills/socratink-brain/scripts/brain.py orient` works. Read it, then implement.

## Problem and outcome

See the seed.

## Acceptance criteria

## Constraints and exclusions

- Must (non-negotiables): deepen modules and simplify interfaces: fewer and smaller public entry points that hide more behavior; no pass-throughs; no flags only one caller uses. In the report, name each public interface added or changed and say why it is narrower. Yohaku paper and ink look. `pnpm check` passes, including the file-size ratchet: add new test files and wire them into `check` rather than growing capped ones. `pnpm test:ink` passes. Commit a phone-size (390x844) recall path the operator can preview (show a term, reveal, next).
- Must not (exclusions and rejected alternatives): pills, counters, boxes or badges; breaking, crowding or animating the living ink blob as a verdict; spaced repetition; scheduling anything for later; a model call per recall; new term authoring.

## Approach

The implementation checklist lives in `checklist.json` (definitions with id/description/verify) and is marked only with `sdlc.py mark`. Give an item a `check` (argv + timeout) whenever an automated proof exists; `verify` then runs it and no mark is needed.

## Risks and verification
