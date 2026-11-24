# Change brief

## Problem and outcome

## Acceptance criteria

## Constraints and exclusions

- Must (non-negotiables):
- Must not (exclusions and rejected alternatives):

## Approach

The implementation checklist lives in `checklist.json` (definitions with id/description/verify) and is marked only with `sdlc.py mark`. Give an item a `check` (argv + timeout) whenever an automated proof exists; `verify` then runs it and no mark is needed.

## Risks and verification

## Taste finding (agent preview, 2026-11-24)

Screenshots: `runs/the-learner-sees-what-they-can-do-and/taste-findings/`.
- At 390 px the storage notice is drawn on top of the welcome heading ("your own.") and, after a send, on top of the tutor's reply text. At 1280 px the heading descender touches it.
- Fix: the notice must take its own space in the layout above the composer and never overlap other content, at 390 px and 1280 px, before and after a reply. Keep the settled wording.
- Add a browser assertion that the notice box does not intersect the heading or the last reply at 390 px. Commit, update your report, then end your turn.
