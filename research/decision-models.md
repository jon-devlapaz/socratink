# Decision models: preserved Jev experiment

Read when considering a typed decision model for Socratink. This is historical
evidence and a recovery guide, not an active integration or a learning claim.

The founder wants to retain the option of decision models. The November 8, 2026
ablation removes Jev from the live tutor while preserving its code, tests,
synthetic pilot, and findings in Git. Removing the integration does not reject
the idea or establish that the main tutor makes better decisions.

## What was tried

Jev classified a learner's reply as an attempt, a request for the answer,
inability to start, or other. The shipped integration supplied the last tutor
question as context, skipped opening messages and structured card answers,
and added a private signal only for a confident answer request or inability
to start. The learner's actual words took precedence over that signal.

The pilot also examined tutor reveal categories and whether content was
supplied before a learner attempt. Those were experimental cross-checks, not
the authority for the existing `mark_reveal` record.

## Reported evidence and limits

The [pilot report on issue #61](https://github.com/jon-devlapaz/socratink/issues/61#issuecomment-6537345604)
reports two runs, 128 Jev requests, model `jev-1.14.0`, median latency around
90 ms, and no request failures. It used synthetic examples: 32 learner turns
and 32 tutor turns, with one labeler. These results were not rerun during the
ablation; the original full table is in [PR #62](https://github.com/jon-devlapaz/socratink/pull/62).

- Learner-move classification agreed with the labels on 97% of examples in
  both runs. This is not evidence of better teaching or learning.
- Five-way reveal classification agreed on roughly 70% overall; the subset
  above a reported probability threshold of 0.8 agreed on 94–100%. Subset
  accuracy does not establish calibration or coverage on real learners.
- A compound question about content and absence of an attempt agreed on 59%.
  Combining two simpler answers in code reached 84% in that pilot.
- The standalone content-supplied question agreed on 62% and confused feedback
  on the learner's own words with new content.
- An opening goal was misread as an answer request in a later live encounter,
  leading to an early reveal. The integration consequently excluded openings.
  This failure is recorded in the historical Chat hook's comment.

## Recover the exact implementation

All paths below exist at product commit
`6b52ee8004a3cbb393ad8b8e4ad3bc66d21cd7f2`:

| Path at that commit | What it preserves |
| --- | --- |
| `src/learner-move.ts` | Typed question, confidence threshold, response validation, timeout/failure behavior, private signals |
| `src/config/jev.ts` | Opt-in configuration and hosted endpoint restriction |
| `src/agents/chat.ts` | Integration hooks, named state, and opening/card exclusions |
| `scripts/learner-move.test.mjs` | Classification, no-key, malformed-response, timeout, and failure contracts |
| `scripts/jev-pilot.mjs` | Budgeted paid pilot and scoring logic |
| `scripts/jev-pilot/turns.json` | Synthetic examples and labels |
| `scripts/smoke.mjs` | Fake-service integration and restart proof |
| `agent-tools/a2a9beaf-97bd-4395-9441-d3e9b45dc9e7.txt` | Original Jev reference article capture |

Use `git show <commit>:<path>` to inspect any file without changing the working
tree. Recover the related files together in a separate checkout if reviving
the experiment; do not copy only the HTTP call and lose its guards or tests.
The pilot makes paid network requests despite its old “Offline pilot” label.
Its historical budget is not authorization for another run. Local reports and
environment files were left untouched by this ablation.

## What would justify returning to it

Choose one teaching decision and compare the tutor with and without the
classifier on the same appropriately labeled cases. Include novice openings,
ambiguous replies, disagreement with the model, failures, latency, and cost.
Measure whether the extra signal improves that decision before attaching it
to more learner turns. A probability is not a learner fact or a mastery score.
Keep decisions reversible and preserve learner-authored evidence separately.
