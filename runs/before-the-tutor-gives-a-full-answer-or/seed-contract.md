status: confirmed for intake
# Seed: Before the tutor gives a full answer or a worked example, it asks the learner first.
revision: r1
Confirmed by: "tinkery seed step confirm 70f9d52d79b6951163e79f0551852cdb492de37cbad32c9a2df01f80d24c6eba; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity" (revision r1, 2026-11-21). Not approved for implementation.
date: 2026-11-20

## You are confirming
Goal: Before the tutor gives a full answer or a worked example, it asks the learner first.
Built: A one-line preview and learner choice using the existing question card buttons.
Not built: Added chrome, pills, borders or badges, or other changes to how the tutor teaches.
Proposed first slice: Inspect the worktree, then cover one full-answer consent path with a regression.
Unknowns: Enforcement design, installed toolchain state and unexecuted verification.

## Problem statement
Socratink records supplied assistance, but recording a reveal is not asking permission before it. The current tutor bindings direct explanations or worked examples after “I don't know”; the reveal tool records assistance without ending the turn. An answer you read cannot be unread.

## Proposed outcome
Before a full answer or a worked example, the tutor gives a one-line description of what it is about to give and waits for the learner’s choice. Choosing to see it permits that reveal; choosing to try once more returns to an attempt without showing it. Hints stay instant.

## Acceptance criteria

before a full answer or a worked example, the tutor says in one line what it is about to give, and gives it only after the learner chooses to see it or to try once more.
not yet runnable: scripts/ask-before-reveal.test.mjs does not exist in the inspected script listing. Add behavior-specific integration assertions for full\_answer and worked\_example, both learner choices, instant hints, intermediate visible states and restored pending choices. The intended red assertion is that protected content is absent before permission; no red run has been observed.

Existing reveal provenance and teaching-policy assertions remain intact.
check: `pnpm install --frozen-lockfile && node --test scripts/reveal.test.mjs scripts/reveal-ui.test.mjs src/learning/policy.test.ts`

Repository check and deterministic smoke suites pass after the change.
check: `pnpm install --frozen-lockfile && pnpm check && pnpm smoke`

The consent interaction keeps the yohaku look and uses the existing question card buttons.
you judge: Taste inspects the implemented pending-reveal interaction on narrow and desktop layouts, including keyboard focus and both themes. Does the one-line preview remain clear without added chrome, pills, borders or badges, using the existing question card buttons? The answer can require copy, spacing or existing-control presentation repairs, not acceptance of unverified consent behavior.

## Affected users and systems
Learners in Socratink’s persistent conversation. The likely change surface is the teaching bindings in src/learning/chat-policy.ts, the existing question-card flow, reveal handling, durable turn boundaries and live reply display. Relevant regression surfaces include policy, reveal provenance, question-card submission, streaming and recovery.

## Constraints and boundaries
Keep the yohaku look: no added chrome, pills, borders or badges. Use the existing question card buttons. Do not change how the tutor teaches otherwise. Claude Duet supplies the stated inspiration for waiting before an irreversible reveal, not a requirement to copy its interface.

## Decisions (from the ledger)
- goal [delegated] Before the tutor gives a full answer or a worked example, it asks the learner first. Why: an answer you read cannot be unread. Claude Duet shows exactly what it is about to do and waits for approval before an act that cannot be undone. In Socratink that act is a reveal. Done when: before a full answer or a worked example, the tutor says in one line what it is about to give, and gives it only after the learner chooses to see it or to try once more. Must: Hints stay instant. Keep the yohaku look: no added chrome, pills, borders or badges. Use the existing question card buttons. Must not: Change how the tutor teaches otherwise. (source: Goal saved by the command `tinkery seed new` from /private/tmp/claude-501/-Users-jondev-dev-active-tinkery/78b257cf-f804-43ae-8643-ca0c75d840a6/scratchpad/TEST-ask-before-answer.3B7r/goal.txt, launched with --operator agent (a declaration, not verified identity). No goal was displayed and nobody typed confirm. Goal only, not seed or implementation approval.)
  Delegation (caller-declared, not authenticated): {"agent": "agent"}
- probe-real-sample [user] find something that improves the UX of socratink. ground it on agentic UX research like claude duet. i want socratink to be more in the spirt of duet do this. i love it (source: The operator's own words, relayed by the agent from Claude project thread \"tinkery\" (claude.ai), 2026-11-21; origin unverified.)
- probe-pre-mortem [delegated] TEST skip (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- shape-reveal-observation-01 [evidence] The bindings direct explanations or worked examples after low footing or “I don't know”. Full answers and worked examples are recognized reveal kinds. present_question ends its turn; mark_reveal records supplied assistance and does not end its turn. (source: read-only investigation in Tinkery Shape)
- shape-reveal-observation-02 [evidence] present_question accepts two to eight choices with optional reasoning. The UI renders existing questionnaire buttons and submits selected answers; Hint and “I don't know” are always offered on cards. (source: read-only investigation in Tinkery Shape)
- shape-reveal-observation-03 [evidence] Durable hooks terminate successful question turns and correct missing assistance marks. Live display releases marked text without consulting a consent state. Card help can automatically record partial or hint assistance. (source: read-only investigation in Tinkery Shape)
- shape-reveal-observation-04 [evidence] Read assertions cover reveal parsing, provenance in active and historical turns, live versus settled text, question termination and preservation of the vendored teaching policy. These assertions do not test a learner consent gate. (source: read-only investigation in Tinkery Shape)
- shape-reveal-observation-05 [evidence] Guidance requires the smallest complete change, existing UI patterns, preserved reveal provenance, and check plus smoke before delivery unless prevented or narrowed. README specifies frozen-lockfile installation. Tests use Node's test runner; package scripts include targeted reveal checks and a durable suite. Browser smoke requires separate browser availability. (source: read-only investigation in Tinkery Shape)
- shape-reveal-blast-radius-06 [evidence] The change crosses teaching bindings and the reveal/question turn boundary. Existing card rendering should be reused. Durable hooks and live display need review so permission is enforced before text reaches the learner. Likely regression risks include provenance loss, changed teaching policy, repeated consent prompts, hint delays and restored pending content. (source: read-only investigation in Tinkery Shape)
- shape-reveal-counterexample-07 [evidence] Hints already have their own reveal kind and immediate help action. Applying the new waiting step to every mark_reveal call would also delay hints, contrary to the confirmed goal. (source: read-only investigation in Tinkery Shape)
- shape-reveal-outside-view-08 [evidence] A consent card alone is insufficient evidence of protection: marked text can currently become visible during streaming. Verification should inspect every visible intermediate state and restored state, rather than only the final card. (source: read-only investigation in Tinkery Shape)
- shape-reveal-unknown-09 [evidence] This investigation has not established installed dependency or browser availability, an executable consent regression, live model compliance, or correctness across reload and recovery. (source: read-only investigation in Tinkery Shape)

## Assumed (not confirmed by you)
- Proposed choice labels are “See it” and “Try once more”. (why: Equivalent short labels leave the behavior, scope, risk and reversibility unchanged.)
- Place new regression coverage in scripts/ask-before-reveal.test.mjs. (why: An adjacent behavior-named test has the same cost and behavior as another suitable test location.)

## Knowledge map
What we know, with proof: src/learning/chat-policy.ts:16-32 directs assistance and structured choices; src/learning/tools.ts:17-23 ends a question turn but not a reveal turn; src/ui/live-reply.ts:16-56 gates text on provenance, not learner permission. Observed in this investigation, recorded 2026-11-21; re-check when these files change or before implementation. What we know we don't know: the delivery agent must establish the smallest reliable enforcement design and the installed toolchain state through further inspection. What we have not read: the full vendored teaching skill, complete browser smoke harness, durable recovery tests, CI setup and installed Pi Durable types. What could surprise us: an “I don't know” path can currently provide new material immediately, and a live reveal mark can release text before consent. A pending reveal appearing after “Try once more” or after reload would show the protection is wrong. Where we did not look: live model behavior, the running browser, deployed services and the original Claude Duet research.

## Evidence and uncertainty
Grounded in:
- AGENTS.md
- DESIGN.md
- README.md
- package.json
- scripts/live-reply.test.mjs
- scripts/reveal-ui.test.mjs
- scripts/reveal.test.mjs
- src/learning/chat-policy.ts
- src/learning/mark-reveal.ts
- src/learning/policy.test.ts
- src/learning/tools.ts
- src/questionnaire.ts
- src/reveal.ts
- src/server/durable/extension.ts
- src/ui/live-reply.ts
- src/ui/questionnaire.ts

Provenance unavailable: reported reads do not verify filesystem origins or unrecorded reads. Some recorded findings have no attributable read path.

Checked:
- Relayed operator words, origin unverified: relay file sha256 281cc487135e762d2bd98b7ee8046d06c57975c2f9bd14a86ecd7966f5b11874; typed at Claude project thread "tinkery" (claude.ai), 2026-11-21; relayed by declared: agent; typed confirm at this terminal; declaration is not verified identity (observed 2026-11-21)
- Caller-declared authorization, not authenticated identity: declared: agent; typed confirm at this terminal; declaration is not verified identity (observed 2026-11-21)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/dogfood-ask-before-answer:
- src/learning/chat-policy.ts:16-32; src/learning/tools.ts:17-23; src/reveal.ts:9-22: The bindings direct explanations or worked examples after low footing or “I don't know”. Full answers and worked examples are recognized reveal kinds. present_question ends its turn; mark_reveal records supplied assistance and does not end its turn. (observation; scope: Current teaching bindings and learning-tool execution) (observed 2026-11-21)
- src/questionnaire.ts:54-59,76-102,129-132; src/ui/questionnaire.ts:29-78: present_question accepts two to eight choices with optional reasoning. The UI renders existing questionnaire buttons and submits selected answers; Hint and “I don't know” are always offered on cards. (observation; scope: Existing question-card representation and actions) (observed 2026-11-21)
- src/server/durable/extension.ts:33-77; src/ui/live-reply.ts:16-56; src/learning/mark-reveal.ts:16-29,35-44: Durable hooks terminate successful question turns and correct missing assistance marks. Live display releases marked text without consulting a consent state. Card help can automatically record partial or hint assistance. (observation; scope: Durable turn termination and live text display) (observed 2026-11-21)
- scripts/reveal.test.mjs:9-28; scripts/reveal-ui.test.mjs:15-45,79-84; scripts/live-reply.test.mjs:26-62; src/learning/policy.test.ts:11-38: Read assertions cover reveal parsing, provenance in active and historical turns, live versus settled text, question termination and preservation of the vendored teaching policy. These assertions do not test a learner consent gate. (observation; scope: Relevant existing tests) (observed 2026-11-21)
- AGENTS.md:3-5,17-29,33-39; DESIGN.md:9-20,30-40,48-51; README.md:11-18,71-89; package.json:6-9,16-19,31-33,44: Guidance requires the smallest complete change, existing UI patterns, preserved reveal provenance, and check plus smoke before delivery unless prevented or narrowed. README specifies frozen-lockfile installation. Tests use Node's test runner; package scripts include targeted reveal checks and a durable suite. Browser smoke requires separate browser availability. (observation; scope: Repository conventions and check setup) (observed 2026-11-21)
- Policy, tool execution, question-card actions, durable hooks, streaming and existing tests cited in observations 01-05: The change crosses teaching bindings and the reveal/question turn boundary. Existing card rendering should be reused. Durable hooks and live display need review so permission is enforced before text reaches the learner. Likely regression risks include provenance loss, changed teaching policy, repeated consent prompts, hint delays and restored pending content. (inference; scope: Likely implementation and regression blast radius; limits: This identifies candidate owners and failure modes, not a settled design or a requirement to edit every named file.; supported by: shape-reveal-observation-01, shape-reveal-observation-02, shape-reveal-observation-03, shape-reveal-observation-04, shape-reveal-observation-05) (observed 2026-11-21)
- src/reveal.ts:9-12; src/learning/chat-policy.ts:26,32; src/ui/questionnaire.ts:46-50: Hints already have their own reveal kind and immediate help action. Applying the new waiting step to every mark_reveal call would also delay hints, contrary to the confirmed goal. (inference; scope: Counter-example: an ordinary hint must not acquire this gate; limits: The source distinguishes hint metadata; it does not prove correct classification of every natural-language response.; supported by: shape-reveal-observation-01, shape-reveal-observation-02) (observed 2026-11-21)
- src/ui/live-reply.ts:16-56; src/server/durable/extension.ts:63-77; scripts/live-reply.test.mjs:26-62: A consent card alone is insufficient evidence of protection: marked text can currently become visible during streaming. Verification should inspect every visible intermediate state and restored state, rather than only the final card. (inference; scope: Outside view: enforce the boundary before irreversible streaming; limits: No leakage was reproduced, and the complete recovery path was not inspected.; supported by: shape-reveal-observation-03, shape-reveal-observation-04) (observed 2026-11-21)
- README.md:11-24,71-89; package.json:6-9,23-44; scripts/reveal.test.mjs:1-28; scripts/live-reply.test.mjs:1-85; scripts file discovery for reveal names: This investigation has not established installed dependency or browser availability, an executable consent regression, live model compliance, or correctness across reload and recovery. (unknown; scope: Execution prerequisites and behavior-specific consent coverage) (observed 2026-11-21)

## Suggested first slice
Proposal only: from repository root, first run `git status --short` to inspect unrelated work, as AGENTS.md requires before editing. Then draft the smallest consent boundary around one full-answer path and its regression, using the existing question-card flow. This does not authorize execution or implementation.

## Risks and verification
The main risks are revealing content during streaming before the choice, treating a retry choice as permission, repeatedly asking after permission, or slowing hints. Assistance provenance and the existing teaching rules must survive the change. Proposed regression coverage should exercise both protected reveal kinds, an immediate hint, both learner choices and restored conversations. Existing provenance and streaming checks are useful regression guards but do not prove consent. No checks were run. Where we did not look: live provider responses, deployed behavior and a running browser.

## Open questions and deferrals
No unresolved operator-only blocker was identified. Exact wording, enforcement design and test implementation remain delivery work. Installed dependency and browser availability remain unverified; the delivery agent must establish them before execution.

## Owners and next steps
Known repository behavior is settled evidence, not completed implementation. The delivery agent owns reading the remaining teaching, browser and recovery material, proposing a minimal design, and setup and execution only when explicitly authorized. Streaming leakage is a risk with a regression guardrail: assert that protected content remains absent before permission, including after recovery. Learner-facing judgment remains with Taste.

## Downstream handoff
The session folder is the handoff: <session>/seed-contract.md together with ledger.json, seed-confirmation.json and seed-checks.json. A consumer checks `tinkery seed status --json <session>`; handoff.verified is true only while the seed, decisions and check records match what was confirmed. It proves content, not who confirmed it. The viewer page is not required. This is discovery input, not an implementation plan, approved specification or review receipt. Preserve accepted constraints in downstream work, follow the selected workflow’s active contract and surface conflicts. Seed confirmation does not authorize execution or accept a built result.

