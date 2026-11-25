status: confirmed for intake
# Seed: Socratink learners get no clue to correctness from where an answer sits on a question card.
revision: r1
Confirmed by: "confirm; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity" (revision r1, 2026-11-25). Not approved for implementation.
date: 2026-11-24

## You are confirming
Goal: Socratink learners get no clue to correctness from where an answer sits on a question card.
What gets built: shuffled choices on each card, including retries, with accurate answer recording and a shuffle-sensitive regression.
What does not: this seed does not authorize implementation, execution or release.
Proposed first slice: add a behavior-specific regression through the production card path.
Unknowns: implemented distribution, regression sensitivity, restoration behavior, session path and trusted Tinkery invocation.

## Problem statement
Socratink learners can use answer position instead of understanding. The original report describes five cards with the correct answer first, including a retry. The current converter preserves the model's choice order.

## Proposed outcome
Shuffle each card's choices before showing them. Across many cards, correctness should not be predictable from position. Retry cards must also be shuffled, and recorded answers must still identify the choice the learner tapped. A regression must fail if shuffling is removed.

## Acceptance criteria

Across many cards the correct choice lands in every position about equally; a retry card is shuffled too; the learner's chosen answer is still recorded as the choice they tapped; a regression test fails if shuffling is removed.
not yet runnable: scripts/question-choice-shuffle.test.mjs must be added with production-path distribution, retry, selection-mapping and restoration assertions. The random-control method, numeric tolerance and targeted-reversion procedure remain to be implemented.

Existing present-question and questionnaire contracts remain valid.
check: `pnpm install --frozen-lockfile && pnpm test:present-question && pnpm test:questionnaire`

Repository-wide checks pass after the change.
check: `pnpm install --frozen-lockfile && pnpm check`

The built application passes the repository's deterministic smoke check.
check: `pnpm install --frozen-lockfile && pnpm build && pnpm smoke`

## Affected users and systems
Socratink learners, present_question execution in src/learning/tools.ts, card construction in src/questionnaire.ts, and their tests. The UI renders choices and submits their values. The reveal-consent flow also uses the converter and needs protection from unintended changes.

## Constraints and boundaries
Keep the change focused on the confirmed goal. Preserve choice labels and their value associations, answer recording, and reveal provenance. Follow the repository's smallest-complete-change rule. Changes to dependencies, schemas or learner-data handling require the repository's separate permission. Seed confirmation does not authorize implementation or check execution.

## Decisions (from the ledger)
- goal [delegated] Socratink learners get no clue to correctness from where an answer sits on a question card. Why: A learner who always taps the top choice passes, and the tutor learns nothing. Done when: Across many cards the correct choice lands in every position about equally; a retry card is shuffled too; the learner's chosen answer is still recorded as the choice they tapped; a regression test fails if shuffling is removed. Must: shuffle each card's choices before showing them. (source: Goal confirmed in Tinkery with typed confirm and Enter; caller-declared attribution: declared: agent; typed confirm at this terminal; declaration is not verified identity; goal only, not seed or implementation approval.)
  Delegation (caller-declared, not authenticated): {"agent": "agent"}
- probe-real-sample [delegated] Real sample: simulated learner, 2026-11-25, local app with the real tutor (qwen3.8-27b). Card 1: 'Where in the chloroplast do the light-dependent reactions take place?' choices in order: Thylakoid membrane (correct), Stroma, Outer chloroplast membrane, Cytosol. Card 2 water: correct 'It is split...' first of 4. Quick check 1: 'Water (from splitting H2O at PSII)' first of 3. Quick check 2 and its retry after a wrong answer: 'It stops (or crashes)...' first. Cards come from the present_question tool (src/learning/present-question.ts, src/questionnaire.ts); no shuffle exists in src. Screenshots: ~/scratch/pilot-TEST/finding/. (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- probe-pre-mortem [delegated] Most likely wrong: the shuffle changes the order the learner sees but the answer sent back, the reveal, or the tutor's own text still refers to the original position (for example 'option A' or the first choice), so grading or the tutor's feedback breaks. Or choices like 'All of the above' or 'None of these' get moved out of last place. Or the order changes on reload, so a learner sees the card reshuffle under them. (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- shape-shuffle-observation-01 [evidence] The converter maps choices in input order, assigns unique values, and returns those choices without reordering. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-observation-02 [evidence] executeLearningTool validates present_question input and returns a questionnaire produced by questionnaireFromPresentQuestion. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-observation-03 [evidence] The UI renders choices in definition order and binds their values to controls. Submission uses formatQuestionnaireAnswers, which looks up labels by value rather than position. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-observation-04 [evidence] Reveal-consent cards use the same converter. withRevealConsent constructs consent cards while projecting messages and when interpreting a subsequent user answer. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-observation-05 [evidence] The present-question test expects an exact value sequence for duplicate labels. Questionnaire tests cover restored definitions and formatted selections. Reveal tests rely on stable semantic values for help and consent. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-observation-06 [evidence] The repository specifies Node and pnpm versions, frozen-lockfile installation, Node's test runner for card tests, and pnpm check plus pnpm smoke before handoff. Regression tests must fail when their guard is reverted. Paid live model runs require permission. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-inference-07 [evidence] The likely edit surface is card preparation and its regression tests. Tests that assert incoming order need semantic assertions instead. Rendering, answer formatting, reveal provenance and consent reconstruction are regression surfaces. Shuffling only at render time risks repeated reordering; unconditional randomization in the shared converter also affects reconstructed consent cards. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-inference-08 [evidence] A card containing 'All of the above' or 'option A' could become misleading after reordering. A reveal-consent card is also a counter-example to treating every converter call as a new scored question. These are implementation risks, not permission to exempt retry question cards from the confirmed requirement. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-inference-09 [evidence] An experienced maintainer would ask whether the same card keeps its order after restoration and whether removing the shuffle makes the regression fail. Existing restoration tests and value-based answer formatting provide starting points, but do not prove these shuffle-specific properties. (source: read-only investigation in Tinkery Shape)
- shape-shuffle-unknown-10 [evidence] This investigation has not established the implemented position distribution, retry shuffling, restoration stability or a regression failure under shuffle removal. (source: read-only investigation in Tinkery Shape)

## Assumed (not confirmed by you)
- Use scripts/question-choice-shuffle.test.mjs for the new regression. (why: The filename does not change behavior, scope, risk or cost.)

## Knowledge map
What we know, with proof: src/questionnaire.ts:86-113 preserves input order; src/learning/tools.ts:14-20 constructs the displayed tool card; src/ui/questionnaire.ts:125-143 binds labels to values; src/ui/chat-surface.ts:249-253 formats submissions through the card definition. Observed during this investigation on 2026-11-25; re-check if these paths change. What we know we don't know: the delivery agent must establish the implemented distribution, retry behavior and regression sensitivity by running the proposed checks when authorized. The session path and trusted Tinkery executable invocation also remain to be supplied or established. What we have not read: the complete durable persistence path, complete browser test harness, installed durable package types and the reported screenshots. What could surprise us: position-dependent wording can become misleading, or a shared converter can reshuffle a reconstructed consent card. A changed label/value association or a changed order for the same restored card would show that the approach is wrong.

## Evidence and uncertainty
Grounded in:
- AGENTS.md
- CODING_STANDARDS.md
- README.md
- package.json
- src/learning/tools.ts
- src/questionnaire.ts
- src/server/durable/reveal-consent.ts

Provenance unavailable: reported reads do not verify filesystem origins or unrecorded reads. Some recorded findings have no attributable read path.

Checked:
- Caller-declared authorization, not authenticated identity: declared: agent; typed confirm at this terminal; declaration is not verified identity (observed 2026-11-25)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/pilot:
- src/questionnaire.ts:86-113: The converter maps choices in input order, assigns unique values, and returns those choices without reordering. (observation; scope: Present-question conversion) (observed 2026-11-25)
- src/learning/tools.ts:14-24: executeLearningTool validates present_question input and returns a questionnaire produced by questionnaireFromPresentQuestion. (observation; scope: Production tool entry point) (observed 2026-11-25)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/pilot; citation not found: src/questionnaire.ts has 183 lines, not 199:
- src/ui/questionnaire.ts:125-143; src/ui/chat-surface.ts:249-253; src/questionnaire.ts:180-199: The UI renders choices in definition order and binds their values to controls. Submission uses formatQuestionnaireAnswers, which looks up labels by value rather than position. (observation; scope: Choice rendering and answer submission) (observed 2026-11-25)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/pilot:
- src/server/durable/reveal-consent.ts:60-85,97-103: Reveal-consent cards use the same converter. withRevealConsent constructs consent cards while projecting messages and when interpreting a subsequent user answer. (observation; scope: Shared converter caller and reconstruction) (observed 2026-11-25)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/pilot; citation not found: scripts/questionnaire-ui.test.mjs has 111 lines, not 119:
- scripts/present-question.test.mjs:10-23; scripts/questionnaire-ui.test.mjs:29-40,93-119; src/learning/mark-reveal.test.ts:10-22,51-59: The present-question test expects an exact value sequence for duplicate labels. Questionnaire tests cover restored definitions and formatted selections. Reveal tests rely on stable semantic values for help and consent. (observation; scope: Existing tests affected by ordering changes) (observed 2026-11-25)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/pilot:
- README.md:11-18,66-87; package.json:6-10,17-24,32-35; AGENTS.md:3-4,19-29,36-40; CODING_STANDARDS.md:40-49: The repository specifies Node and pnpm versions, frozen-lockfile installation, Node's test runner for card tests, and pnpm check plus pnpm smoke before handoff. Regression tests must fail when their guard is reverted. Paid live model runs require permission. (observation; scope: Runner, setup and required general checks) (observed 2026-11-25)
- Converter, production caller, UI submission, shared consent caller and card tests: The likely edit surface is card preparation and its regression tests. Tests that assert incoming order need semantic assertions instead. Rendering, answer formatting, reveal provenance and consent reconstruction are regression surfaces. Shuffling only at render time risks repeated reordering; unconditional randomization in the shared converter also affects reconstructed consent cards. (inference; scope: Blast radius and smallest proposed implementation boundary; limits: This does not establish an implementation design, persistence behavior or passing verification.; supported by: shape-shuffle-observation-01, shape-shuffle-observation-02, shape-shuffle-observation-03, shape-shuffle-observation-04, shape-shuffle-observation-05) (observed 2026-11-25)
- src/questionnaire.ts:46-63,86-113; src/server/durable/reveal-consent.ts:60-68: A card containing 'All of the above' or 'option A' could become misleading after reordering. A reveal-consent card is also a counter-example to treating every converter call as a new scored question. These are implementation risks, not permission to exempt retry question cards from the confirmed requirement. (inference; scope: Counter-example reading; limits: No inspected sample establishes that position-dependent wording is currently generated.; supported by: shape-shuffle-observation-01, shape-shuffle-observation-04) (observed 2026-11-25)
- Existing restoration, answer-mapping and regression rules: An experienced maintainer would ask whether the same card keeps its order after restoration and whether removing the shuffle makes the regression fail. Existing restoration tests and value-based answer formatting provide starting points, but do not prove these shuffle-specific properties. (inference; scope: Outside-view reading; limits: No browser, reconnect or targeted-reversion check was executed.; supported by: shape-shuffle-observation-03, shape-shuffle-observation-05, shape-shuffle-observation-06) (observed 2026-11-25)
- Read-only inspection of card construction, callers and existing tests: This investigation has not established the implemented position distribution, retry shuffling, restoration stability or a regression failure under shuffle removal. (unknown; scope: Observed behavior after a shuffle change) (observed 2026-11-25)

## Suggested first slice
Proposal only: from repository root '.', run `pnpm install --frozen-lockfile && node --test scripts/question-choice-shuffle.test.mjs` after authorization. Start by adding that behavior-specific regression through the production card-construction path. This command is not runnable as a useful regression until the proposed test exists, and it has not been run.

## Risks and verification
The main risks are mismatched displayed and recorded answers, predictable retry positions, order changes during reconstruction, and position-dependent choice wording. Keep label/value pairs together and test the production card path. Check the shared reveal-consent caller before choosing the shuffle location. Proposed verification includes a distribution regression, retry and answer-mapping assertions, a targeted shuffle-removal failure, existing card tests, pnpm check and pnpm smoke. None has been executed in this step. Where we did not look: the live tutor, reported screenshots, deployed app and complete durable persistence implementation.

## Open questions and deferrals
No operator-only blocker was identified. Implementation details and runnable regression assertions remain for the authorized delivery agent. Revisit wording risks if actual cards contain references such as 'option A' or 'All of the above'. Establish the session path and trusted Tinkery invocation at downstream intake.

## Owners and next steps
Known code behavior is evidence, not completed implementation. The authorized delivery agent owns remaining caller and persistence reading, the smallest coherent change, and execution of proposed checks. Distribution, retry handling and answer mapping remain unverified risks until tested. Guard against repeat position errors with a regression that fails under targeted shuffle removal. Taste owns judgment of the built result; the operator retains implementation and execution authority.

## Downstream handoff
The session folder is the handoff: <session>/seed-contract.md together with ledger.json, seed-confirmation.json and seed-checks.json. A consumer checks `tinkery seed status --json <session>` using an established trusted executable. handoff.verified is true only while the seed, decisions and checks match the confirmed content; it does not authenticate who confirmed it. Inspect the ledger's recorded completion and attribution rather than inferring human identity. The viewer page is not required. This is discovery input, not an implementation plan, approved specification or review receipt. Preserve accepted constraints downstream, follow the selected workflow's active contract, and surface conflicts rather than replacing decisions. No downstream profile or stage approval is selected here.

