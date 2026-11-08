status: confirmed for intake
# Seed: Learn and memorize terms with a perfect software widget for socraTink, using recall inside one session, for Learners. When work lands and merged.
revision: r1
Confirmed by: "confirm; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity" (revision r1, 2026-11-08). Not approved for implementation.
date: 2026-11-07

## You are confirming
Goal: Learn and memorize terms with a perfect software widget for socraTink, using recall inside one session, for Learners; when work lands and merged.
What gets built: A term is shown, the learner recalls it, and immediate feedback follows, using a yohaku paper and ink look.
What does not: Spaced repetition, scheduling anything for later, pills, counters, boxes, or breaking or crowding Socratink's living ink blob.
Proposed first slice: One recall interaction and its behavior-specific regression, with ink-space protection, without selecting the deferred choices.
Unknowns: Term sourcing, real sample, recall/feedback interaction, recall-specific regression and actual browser clearance.

## Problem statement
Learners need a socraTink widget for learning and memorizing terms through recall inside one session. Existing question and answer plumbing offers integration points, but this investigation has not established the requested complete recall experience.

## Proposed outcome
A term is shown, the learner recalls it, and immediate feedback follows. The widget uses a yohaku paper and ink look without pills, counters or boxes, and never breaks or crowds Socratink's living ink blob. The goal targets work landed and merged; neither implementation nor merge has been observed.

## Acceptance criteria

A term is shown, the learner recalls it, and immediate feedback follows.
not yet runnable: scripts/recall-session.test.mjs is not present in the inspected scripts listing. Add the regression after the operator's open interaction choice supplies its concrete assertions. Intended red: removing the feedback transition must fail the assertion that feedback follows recall; a missing named file must fail rather than count as coverage. Requires the repository Node/pnpm versions.

The widget excludes spaced repetition and scheduling anything for later.
not yet runnable: The widget and its state boundaries have not been selected or implemented; identify those boundaries and add explicit no-scheduling assertions. No separate runnable invocation is established yet.

Existing ink cue boundaries remain bounded and cosmetic.
check: `pnpm install --frozen-lockfile && pnpm test:ink`

The widget uses a yohaku paper and ink look without pills, counters or boxes, and never breaks or crowds Socratink's living ink blob.
you judge: Proposed, not performed: inspect the implemented recall interaction and immediate-feedback states at desktop and mobile sizes, with keyboard interaction, reduced motion and WebGL fallback. Inspect paper/ink appearance and absence of pills, counters and boxes. Confirm the ink remains usable and uncrowded throughout. Browser tooling availability and actual rendering remain unverified.

## Affected users and systems
Learners using socraTink. Candidate touchpoints include src/ui/turn-view.ts, a recall-specific TypeScript/CSS surface, and behavior-specific tests in scripts. Questionnaire activation, history rendering, dock layout and living ink integration are neighboring systems whose behavior could be affected.

## Constraints and boundaries
Use a yohaku paper and ink look. Do not include spaced repetition, schedule anything for later, include pills, counters or boxes, or break or crowd Socratink's living ink blob. Repository guidance favors the smallest complete observable change and vanilla TypeScript/CSS. This seed does not authorize implementation.

## Decisions (from the ledger)
- goal [delegated] Learn and memorize terms with a perfect software widget for socraTink, using recall inside one session, for Learners. When work lands and merged. Done when: A term is shown, the learner recalls it, and immediate feedback follows. Must: Use a yohaku paper and ink look. Must not: Include spaced repetition. Must not: Schedule anything for later. Must not: Include pills. Must not: Include counters. Must not: Include boxes. Must not: Break Socratink's living ink blob. Must not: Crowd Socratink's living ink blob. (source: Goal confirmed in Tinkery with typed confirm and Enter; caller-declared attribution: declared: agent; typed confirm at this terminal; declaration is not verified identity; goal only, not seed or implementation approval.)
  Delegation (caller-declared, not authenticated): {"agent": "agent"}
- probe-real-sample [delegated] not decided; keep it open (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- probe-pre-mortem [delegated] It must never break or crowd Socratink's living ink blob. (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- rw-inspect-01 [evidence] The repository requires the smallest complete observable change, explicit authority and proof boundaries, and vanilla TypeScript/CSS rather than introducing a frontend framework. (source: read-only investigation in Tinkery Shape)
- rw-inspect-02 [evidence] Question definitions support choices and freeform input. The questionnaire renderer adds a progress row and progress element. mark_reveal records supplied hints or answers and explicitly is not for ordinary feedback. (source: read-only investigation in Tinkery Shape)
- rw-inspect-03 [evidence] The stage contains the living ink learning-tools button and an active-turn surface. Active turns can mount questionnaires and submit answers through a handler. Historical steps render a numeric mark. (source: read-only investigation in Tinkery Shape)
- rw-inspect-04 [evidence] main.ts mounts the ink poster, asynchronously loads WebGL, and connects voice and expression updates. Questionnaire presence scales the ink cluster. The integration documentation requires usable dock/poster fallback and describes ink cues as presentation, not scores or proof of learning. (source: read-only investigation in Tinkery Shape)
- rw-inspect-05 [evidence] The repository has Node contract tests, a full check script and smoke script. Read assertions cover reveal annotations and bounded cosmetic ink cues. Documentation describes optional browser smoke covering mobile layout, keyboard controls, reduced motion and graphics recovery; it does not establish that those checks have run in this investigation. (source: read-only investigation in Tinkery Shape)
- rw-inspect-06 [evidence] The design guide specifies paper and ink, horizontal breathing room and living ink as the visual anchor. It also describes rectangular question sheets and status pills in existing components. (source: read-only investigation in Tinkery Shape)
- rw-radius-07 [evidence] Likely touchpoints are active-turn integration, a recall-specific TypeScript/CSS surface, and behavior-specific tests. Reusing questionnaire or history rendering unchanged risks importing progress chrome or numeric marks. Changing questionnaire activation or dock geometry could alter the protected ink blob's size or space. Ink cue and reveal tests are neighboring safeguards, not proof of the requested recall loop. (source: read-only investigation in Tinkery Shape)
- rw-counterexample-08 [evidence] A term exercise implemented by directly reusing the questionnaire could appear functionally suitable while bringing progress chrome and shrinking the ink cluster. A supplied reference answer also is not the same result as assessing the learner's answer. (source: read-only investigation in Tinkery Shape)
- rw-outsideview-09 [evidence] An experienced implementer would distinguish private recall with reference reveal, submitted recall with assessment, and availability of both. Each can meet the stated sequence without spaced repetition or scheduling, but learners would tell them apart. The existence of answer and reveal plumbing does not select one or prove immediate assessment. (source: read-only investigation in Tinkery Shape)
- rw-unknown-10 [evidence] This investigation has not established an existing term-recall widget satisfying the complete goal, a recall-specific regression, live assessment behavior, or actual browser clearance around the living ink blob. No checks were executed. (source: read-only investigation in Tinkery Shape)
- recall-feedback-contract [delegated] not decided; keep it open (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- rw-seed-evidence-11 [evidence] The repository specifies Node >=22.19.0 and pnpm 11. CI sets up pnpm and Node, installs with pnpm install --frozen-lockfile, then runs pnpm check and pnpm smoke. Individual UI and ink tests use node --test. (source: read-only investigation in Tinkery Shape)
- rw-seed-evidence-12 [evidence] The opened ink test asserts accepted expressions, malformed-value rejection, cue precedence and hidden cosmetic tool cards. The README additionally describes geometry and poster assertions not present in this 41-line test. Documentation alone does not establish those assertions or browser verification. (source: read-only investigation in Tinkery Shape)
- rw-seed-evidence-13 [evidence] History renders an index-based numeric mark; active turns mount interactive questionnaires through a submission handler. Encounter state changes orb size and questionnaire presence scales the ink cluster. The ink documentation requires a usable dock and poster fallback and treats ink expressions as presentation rather than scores or proof of learning. (source: read-only investigation in Tinkery Shape)
- rw-seed-evidence-14 [evidence] Reveal tests assert supplied-answer metadata, accessible annotations and isolation from ordinary feedback. The scripts listing contains no recall-session.test.mjs; the filename search returned no recall-named files. These inspections do not establish absence of recall behavior under other names. (source: read-only investigation in Tinkery Shape)
- rw-seed-radius-15 [evidence] Candidate changes touch active-turn integration, a recall-specific TypeScript/CSS surface and a new behavior-specific test. Questionnaire and history reuse could violate the widget's chrome constraints; changes to activation or layout could affect ink space and fallback usability. Existing reveal and ink tests are neighboring safeguards, not a recall regression. (source: read-only investigation in Tinkery Shape)
- rw-seed-counterexample-16 [evidence] A term-recall-feedback loop could function yet fail the goal by importing a numeric history mark or altering the protected ink through questionnaire activation. Functional sequence alone is insufficient evidence of compliance. (source: read-only investigation in Tinkery Shape)
- rw-seed-outsideview-17 [evidence] Private recall followed by reference comparison, submitted recall with assessment, and availability of both remain distinguishable outcome families. An experienced implementer would ask whether feedback is suitable for the selected terms and whether its provenance remains clear. The ledger explicitly keeps that interaction open, so this draft selects none. (source: read-only investigation in Tinkery Shape)
- rw-seed-unknown-18 [evidence] This investigation has not established a complete recall-specific regression, actual browser clearance around the ink, physical-phone behavior or live feedback quality. No proposed check was run. (source: read-only investigation in Tinkery Shape)

## Assumed (not confirmed by you)
- none

## Knowledge map
What we know, with proof: active-turn question mounting and numbered history appear in src/ui/turn-view.ts:41-49,72-104; questionnaire presence scales the ink cluster in src/ui/dock.css:22-25; the fallback and cosmetic-only ink boundaries appear in src/ui/effects/living-ink/README.md:14-40. Observed 2026-11-08; re-check when these files or their integration change. Node test scripts and installation setup appear in package.json:6-9,34-48 and .github/workflows/ci.yml:22-35, observed 2026-11-08; re-check if runner configuration changes.
What we know we don't know: term sourcing, a real sample, and the learner's recall/feedback interaction remain open under the recorded answers; the operator owns those choices. The implementation agent must establish recall-specific assertions and browser clearance before claiming verification. The name socraTink is supplied; no Tinkery executable location has been established.
What we have not read: the full browser-smoke implementation, complete application orchestration, term-storage ownership and any downstream workflow contract.
What could surprise us: questionnaire reuse can introduce ink scaling and existing history can introduce numeric marks. The ink integration README describes broader test coverage than the opened ink-cue test contains. A browser overlap, imported progress chrome, or an assertion missing from its named test would show the proposed safeguards are insufficient.

## Evidence and uncertainty
Grounded in:
- .github/workflows/ci.yml
- AGENTS.md
- DESIGN.md
- ZEN.md
- package.json
- scripts/reveal-ui.test.mjs
- src/questionnaire.ts
- src/reveal.ts
- src/ui/dock.css
- src/ui/effects/living-ink/README.md
- src/ui/index.html
- src/ui/main.ts
- src/ui/questionnaire.ts
- src/ui/turn-view.ts

Provenance unavailable: reported reads do not verify filesystem origins or unrecorded reads. Some recorded findings have no attributable read path.

Checked:
- Caller-declared authorization, not authenticated identity: declared: agent; typed confirm at this terminal; declaration is not verified identity (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget:
- ZEN.md:11-38; AGENTS.md:127-151: The repository requires the smallest complete observable change, explicit authority and proof boundaries, and vanilla TypeScript/CSS rather than introducing a frontend framework. (observation; scope: Repository working agreements) (observed 2026-11-08)
- src/questionnaire.ts:17-45; src/ui/questionnaire.ts:35-49,80-94; src/reveal.ts:6-22: Question definitions support choices and freeform input. The questionnaire renderer adds a progress row and progress element. mark_reveal records supplied hints or answers and explicitly is not for ordinary feedback. (observation; scope: Existing question and answer contracts) (observed 2026-11-08)
- src/ui/index.html:63-99; src/ui/turn-view.ts:41-49,72-104: The stage contains the living ink learning-tools button and an active-turn surface. Active turns can mount questionnaires and submit answers through a handler. Historical steps render a numeric mark. (observation; scope: Current learner interaction surface) (observed 2026-11-08)
- src/ui/main.ts:33-62; src/ui/dock.css:1-25; src/ui/effects/living-ink/README.md:14-18,28-40: main.ts mounts the ink poster, asynchronously loads WebGL, and connects voice and expression updates. Questionnaire presence scales the ink cluster. The integration documentation requires usable dock/poster fallback and describes ink cues as presentation, not scores or proof of learning. (observation; scope: Living ink ownership and layout coupling) (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget; citation not found: scripts/ink-cue.test.mjs has 41 lines, not 47:
- package.json:17-20,36-48; scripts/reveal-ui.test.mjs:15-41; scripts/ink-cue.test.mjs:9-47; src/ui/effects/living-ink/README.md:56-76: The repository has Node contract tests, a full check script and smoke script. Read assertions cover reveal annotations and bounded cosmetic ink cues. Documentation describes optional browser smoke covering mobile layout, keyboard controls, reduced motion and graphics recovery; it does not establish that those checks have run in this investigation. (observation; scope: Existing verification surfaces) (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget:
- DESIGN.md:77-89,124-155: The design guide specifies paper and ink, horizontal breathing room and living ink as the visual anchor. It also describes rectangular question sheets and status pills in existing components. (observation; scope: Existing visual guidance) (observed 2026-11-08)
- Interaction, rendering, layout and test ownership inspection: Likely touchpoints are active-turn integration, a recall-specific TypeScript/CSS surface, and behavior-specific tests. Reusing questionnaire or history rendering unchanged risks importing progress chrome or numeric marks. Changing questionnaire activation or dock geometry could alter the protected ink blob's size or space. Ink cue and reveal tests are neighboring safeguards, not proof of the requested recall loop. (inference; scope: Likely widget implementation blast radius; limits: These are candidate owners, not a selected design or authorization to modify them; feedback and term sourcing could require additional owners.; supported by: rw-inspect-02, rw-inspect-03, rw-inspect-04, rw-inspect-05) (observed 2026-11-08)
- Existing question chrome and supplied-answer semantics: A term exercise implemented by directly reusing the questionnaire could appear functionally suitable while bringing progress chrome and shrinking the ink cluster. A supplied reference answer also is not the same result as assessing the learner's answer. (inference; scope: Counter-example reading; limits: Does not establish the operator's preferred feedback experience or interpret the exclusions as a mandate to redesign unrelated existing screens.; supported by: rw-inspect-02, rw-inspect-04) (observed 2026-11-08)
- Existing freeform answer, reveal and presentation contracts: An experienced implementer would distinguish private recall with reference reveal, submitted recall with assessment, and availability of both. Each can meet the stated sequence without spaced repetition or scheduling, but learners would tell them apart. The existence of answer and reveal plumbing does not select one or prove immediate assessment. (inference; scope: Outside-view reading and feasible outcome families; limits: Does not establish assessment reliability, latency, reference-answer provenance, or undo costs; those depend on the unselected experience and deferred term source.; supported by: rw-inspect-02, rw-inspect-03, rw-inspect-04) (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget; citation not found: scripts/ink-cue.test.mjs has 41 lines, not 47:
- src/questionnaire.ts:17-45; src/reveal.ts:6-22; scripts/reveal-ui.test.mjs:15-41; scripts/ink-cue.test.mjs:9-47: This investigation has not established an existing term-recall widget satisfying the complete goal, a recall-specific regression, live assessment behavior, or actual browser clearance around the living ink blob. No checks were executed. (unknown; scope: Recall-specific behavior and runtime verification) (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget:
- package.json:6-9,34-48; .github/workflows/ci.yml:22-38: The repository specifies Node >=22.19.0 and pnpm 11. CI sets up pnpm and Node, installs with pnpm install --frozen-lockfile, then runs pnpm check and pnpm smoke. Individual UI and ink tests use node --test. (observation; scope: Test runner and installation setup) (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget; citation not found: src/ui/effects/living-ink/README.md has 73 lines, not 76:
- scripts/ink-cue.test.mjs:1-41; src/ui/effects/living-ink/README.md:56-76: The opened ink test asserts accepted expressions, malformed-value rejection, cue precedence and hidden cosmetic tool cards. The README additionally describes geometry and poster assertions not present in this 41-line test. Documentation alone does not establish those assertions or browser verification. (observation; scope: Current ink contract test coverage) (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget:
- src/ui/turn-view.ts:41-49,72-104; src/ui/dock.css:18-25; src/ui/effects/living-ink/README.md:14-40: History renders an index-based numeric mark; active turns mount interactive questionnaires through a submission handler. Encounter state changes orb size and questionnaire presence scales the ink cluster. The ink documentation requires a usable dock and poster fallback and treats ink expressions as presentation rather than scores or proof of learning. (observation; scope: UI integration and layout coupling) (observed 2026-11-08)
- scripts/reveal-ui.test.mjs:1-52; scripts directory listing; repository filename search for *recall*: Reveal tests assert supplied-answer metadata, accessible annotations and isolation from ordinary feedback. The scripts listing contains no recall-session.test.mjs; the filename search returned no recall-named files. These inspections do not establish absence of recall behavior under other names. (observation; scope: Neighboring reveal tests and test-file inventory) (observed 2026-11-08)
- Active-turn, history, dock and neighboring-test ownership review: Candidate changes touch active-turn integration, a recall-specific TypeScript/CSS surface and a new behavior-specific test. Questionnaire and history reuse could violate the widget's chrome constraints; changes to activation or layout could affect ink space and fallback usability. Existing reveal and ink tests are neighboring safeguards, not a recall regression. (inference; scope: Candidate change blast radius; limits: Not a selected architecture or permission to edit; deferred term and feedback choices may add owners.; supported by: rw-seed-evidence-13, rw-seed-evidence-14) (observed 2026-11-08)
- History marks and questionnaire-triggered ink scaling: A term-recall-feedback loop could function yet fail the goal by importing a numeric history mark or altering the protected ink through questionnaire activation. Functional sequence alone is insufficient evidence of compliance. (inference; scope: Counter-example reading; limits: Does not establish actual overlap or require changing unrelated screens.; supported by: rw-seed-evidence-13) (observed 2026-11-08)
- Existing answer/reveal contracts and settled open feedback decision: Private recall followed by reference comparison, submitted recall with assessment, and availability of both remain distinguishable outcome families. An experienced implementer would ask whether feedback is suitable for the selected terms and whether its provenance remains clear. The ledger explicitly keeps that interaction open, so this draft selects none. (inference; scope: Outside-view reading and available outcome families; limits: Does not choose an interaction, establish feedback reliability or enumerate implementation details dependent on deferred choices.; supported by: rw-inspect-02, rw-seed-evidence-14) (observed 2026-11-08)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/recall-widget; citation not found: src/ui/effects/living-ink/README.md has 73 lines, not 76:
- scripts directory listing; scripts/reveal-ui.test.mjs:1-52; scripts/ink-cue.test.mjs:1-41; src/ui/effects/living-ink/README.md:56-76: This investigation has not established a complete recall-specific regression, actual browser clearance around the ink, physical-phone behavior or live feedback quality. No proposed check was run. (unknown; scope: Recall regression and runtime evidence) (observed 2026-11-08)

## Suggested first slice
Proposal only: from repository root, first run `sed -n '1,110p' src/ui/turn-view.ts` to ground Stage 01 approach drafting in the existing interaction boundary. The smallest candidate implementation slice is one term-to-recall-to-feedback interaction with a behavior-specific regression and protected ink space. Its concrete term source and feedback interaction remain unchosen; this proposal does not select them.

## Risks and verification
Questionnaire reuse could import progress chrome or shrink the ink; history reuse could import numeric marks. Keep these risks explicit when designing the widget rather than treating existing rendering as automatically compatible. The counter-example is a functioning recall loop that nevertheless crowds or alters the living ink. The outside-view concern is feedback whose reference or assessment is unsuitable for the eventual term source. Proposed checks below are not completed verification; the recall regression is provisional, and the existing ink contract test does not establish visual clearance. Where we did not look: live browser behavior, physical-phone graphics and microphone hardware, real learner examples, and live feedback quality.

## Open questions and deferrals
Term sourcing remains open as requested in Think. The real sample and recall/feedback interaction also remain open under their settled ledger answers. These are not draft blockers and no alternative is selected here. The operator must revisit choices needed by the proposed slice before that implementation depends on them. Browser prerequisites and the missing recall-specific regression remain investigation work for the implementation agent.

## Owners and next steps
Known repository boundaries are settled evidence, not completed widget work. The operator owns the parked term-source, sample and feedback choices. The implementation agent should read the remaining orchestration and browser-smoke material, identify any additional owners after those choices, and add a failing behavior-specific regression. Ink crowding and imported chrome remain risks with regression and browser-inspection guardrails. No unresolved operator blocker prevents this draft; confirmation is not implementation approval.

## Downstream handoff
The session folder is the handoff: <session>/seed-contract.md together with ledger.json, seed-confirmation.json and seed-checks.json. A consumer checks `tinkery seed status --json <session>`; handoff.verified is true only while the seed, decisions and check records exactly match what was confirmed. This proves content, not who confirmed it. The viewer page is not required. This artifact is discovery input, not an implementation plan, approved specification or review receipt. Preserve accepted constraints in downstream plans and specifications, follow the selected workflow's active contract, and surface conflicts rather than replacing decisions. No downstream profile or stage approval is selected here.

