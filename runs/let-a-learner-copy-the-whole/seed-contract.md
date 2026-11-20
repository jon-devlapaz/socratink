status: confirmed for intake
# Seed: Let a learner copy the whole conversation as Markdown.
revision: r1
Confirmed by: "tinkery seed step confirm 6a40035e8e0043a024cf05161e99b1fc5b3da08a39829d8744e97eb664db21f4; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity" (revision r1, 2026-11-20). Not approved for implementation.
date: 2026-11-19

## You are confirming
Let a learner copy the whole conversation as Markdown.
Build one quiet text control that copies every turn in order.
Do not change how the tutor teaches or add chrome, pills, borders or badges.
Proposed first slice: protect unrelated work, then draft the ordered Markdown regression.
Unknowns: browser clipboard behavior, live-request handling and trusted handoff paths.

## Problem statement
Learners want to keep or share what they worked through. The inspected UI has code and single-turn copy actions, but this investigation has not established a whole-conversation copy action.

## Proposed outcome
Let a learner copy the whole conversation as Markdown. One quiet text control copies the conversation, and pasting it shows every turn in order.

## Acceptance criteria

one quiet text control copies the conversation, and pasting it shows every turn in order.
not yet runnable: Add scripts/copy-conversation.test.mjs using node:test and Playwright. It must own deterministic browser/server setup, clipboard paste coverage, restored and live-request cases, and assertions for denied writes and card-only turns. The browser invocation and new assertions are not yet implemented.

Existing learner-facing turn projection remains unchanged.
check: `pnpm install --frozen-lockfile && pnpm test:chat-turns`

The repository quality gate and deterministic smoke checks pass.
check: `pnpm install --frozen-lockfile && pnpm check && pnpm smoke`

The control keeps the yohaku look: no added chrome, pills, borders or badges.
you judge: Taste inspects the built conversation at narrow and desktop widths, in light and dark themes, including focus and copied feedback states. Does one quiet text control fit the existing interface without added chrome, pills, borders or badges? The answer can require visual or wording repairs; it does not accept teaching changes.

## Affected users and systems
Socratink learners and the conversation UI. The likely change surface is chat-surface.ts, index.html, adjacent styles, a conversation Markdown serializer, and targeted tests. chat-turns.ts supplies ordered learner-facing turns; turn-view.ts shows how card-only turns and learner answers appear.

## Constraints and boundaries
Keep the yohaku look: no added chrome, pills, borders or badges. Do not change how the tutor teaches. Follow the existing paper/ink palette, Paper Mono, keyboard focus and narrow-screen conventions. Preserve the distinction between learner work and AI help.

## Decisions (from the ledger)
- goal [delegated] Let a learner copy the whole conversation as Markdown. Why: learners want to keep or share what they worked through. Done when: one quiet text control copies the conversation, and pasting it shows every turn in order. Must: Keep the yohaku look: no added chrome, pills, borders or badges. Must not: Change how the tutor teaches. (source: Goal saved by the command `tinkery seed new` from /private/tmp/claude-501/-Users-jondev-dev-active-tinkery/00a9ff61-4380-4ef5-bc0d-4dfff296a7ef/scratchpad/TEST-dogfood-932-resume.0pBs/goal.txt, launched with --operator agent (a declaration, not verified identity). No goal was displayed and nobody typed confirm. Goal only, not seed or implementation approval.)
  Delegation (caller-declared, not authenticated): {"agent": "agent"}
- probe-real-sample [delegated] TEST eval: no sample (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- probe-pre-mortem [delegated] TEST skip (source: The agent answered with these words in Tinkery Shape.; caller-declared declared: agent; typed confirm at this terminal; declaration is not verified identity)
- shape932-ui-owner-01 [evidence] The surface owns ordered DisplayedTurn state, splits earlier and current turns for rendering, appends completed assistant replies, and restores projected history. Earlier messages can be hidden. (source: read-only investigation in Tinkery Shape)
- shape932-projection-02 [evidence] Turns carry text, shownText, questionnaires, reveal metadata and tools. Learner card answers and steering have displayed wording distinct from sent text. Card-only turns can retain their question through questionnaire data. (source: read-only investigation in Tinkery Shape)
- shape932-copy-03 [evidence] Existing handlers copy code or a turn snippet through navigator.clipboard.writeText. Their success labels follow a successful clipboard write. (source: read-only investigation in Tinkery Shape)
- shape932-design-04 [evidence] The UI uses an active step, hidden earlier-step list and a menu. Design guidance requires existing colors and Paper Mono, accessible names and focus, narrow-screen checks, and feature detection with constrained fallback. Styles define the shared theme tokens. (source: read-only investigation in Tinkery Shape)
- shape932-test-basis-05 [evidence] The repository uses Node >=22.19.0, pnpm 11 and node --test for UI contract tests. CI installs locked dependencies before checks and Chromium before browser smoke. Existing turn tests assert ordered projection, card-only turns, and learner-facing answers. README documents pnpm check and deterministic pnpm smoke. (source: read-only investigation in Tinkery Shape)
- shape932-boundary-06 [evidence] Guidance requires the smallest complete change, inspection before editing, preservation of learner work versus AI help, and permission for learner-data handling changes. Teaching belongs to learning and durable modules. Regression guards must be challenged by reversion. Workflow records do not authorize release or authenticate identity. (source: read-only investigation in Tinkery Shape)
- shape932-blast-radius-07 [evidence] Likely edits include chat-surface.ts, index.html, adjacent styles, a focused serializer and targeted scripts tests. Risks include omitted collapsed turns, lost card-only content, protocol leakage, duplicate retries and false clipboard success. Teaching modules need not change for a UI copy feature. (source: read-only investigation in Tinkery Shape)
- shape932-counterexample-08 [evidence] A tutor turn containing a question card but no text would disappear from a text-only export. This contradicts the intended whole-conversation result, so a targeted regression must retain that turn and its question. (source: read-only investigation in Tinkery Shape)
- shape932-outside-view-09 [evidence] An experienced reviewer would ask whether denied clipboard access reports success and whether copying during a live reply silently loses content. Those cases need targeted tests and request-state inspection rather than a claim that serialization alone proves the feature. (source: read-only investigation in Tinkery Shape)
- shape932-verification-gap-10 [evidence] This investigation has not established an existing whole-conversation copy action or targeted copy-conversation regression. The proposed scripts/copy-conversation.test.mjs must be added before its check can run. (source: read-only investigation in Tinkery Shape)

## Assumed (not confirmed by you)
- Use “Copy conversation” as the control label. (why: Equivalent clear wording has the same scope, cost and behavior.)
- Use Markdown role headings with the existing names “You” and “Socratink”. (why: Other clear role separators preserve the same conversation and are easy to change.)

## Knowledge map
What we know, with proof: chat-turns.ts:48–109 keeps learner-facing words separate from sent protocol text and projects history in order; chat-surface.ts:382–401 appends completed replies; turn-view.ts:338–348 retains question text for card-only history. Observed 2026-11-20; re-check if these projections or request states change. DESIGN.md:9–25 supplies appearance, accessibility and browser rules, observed 2026-11-20; re-check if those rules change.
What we know we do not know: the delivery agent must establish clipboard behavior in supported browsers, including denied access, and inspect the live-copy interaction before implementation. Find out through the targeted browser regression and request-state review. The session path and trusted Tinkery executable path were not supplied; the handoff consumer must obtain them.
What we have not read: the full conversation client, browser smoke implementation, questionnaire renderer, tool-card renderer and all stage contracts. The delivery agent reads relevant parts before choosing an approach.
What could surprise us: a card-only tutor turn can disappear from a text-only export; pending streamed text is separate from completed turns. Missing questions or a misleading success state would show that the approach is wrong. Where we did not look: deployed browser permissions, real learner conversations and external clipboard destinations.

## Evidence and uncertainty
Grounded in:
- AGENTS.md
- CODING_STANDARDS.md
- DESIGN.md
- PRODUCT.md
- _system/SDLC.md
- src/ui/chat-markdown.ts
- src/ui/chat-surface.ts
- src/ui/index.html
- src/ui/steering.ts
- src/ui/styles.css

Provenance unavailable: reported reads do not verify filesystem origins or unrecorded reads. Some recorded findings have no attributable read path.

Checked:
- Caller-declared authorization, not authenticated identity: declared: agent; typed confirm at this terminal; declaration is not verified identity (observed 2026-11-20)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/dogfood-932:
- src/ui/chat-surface.ts:114–139, 211–225, 382–401, 444–490: The surface owns ordered DisplayedTurn state, splits earlier and current turns for rendering, appends completed assistant replies, and restores projected history. Earlier messages can be hidden. (observation; scope: Conversation state and rendering ownership) (observed 2026-11-20)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/dogfood-932; citation not found: src/ui/turn-view.ts has 346 lines, not 348:
- src/ui/chat-turns.ts:17–26, 48–109; src/ui/turn-view.ts:77–103, 310–348: Turns carry text, shownText, questionnaires, reveal metadata and tools. Learner card answers and steering have displayed wording distinct from sent text. Card-only turns can retain their question through questionnaire data. (observation; scope: Learner-facing turn content) (observed 2026-11-20)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/dogfood-932:
- src/ui/chat-markdown.ts:149–166; src/ui/steering.ts:170–190: Existing handlers copy code or a turn snippet through navigator.clipboard.writeText. Their success labels follow a successful clipboard write. (observation; scope: Existing inspected clipboard handlers) (observed 2026-11-20)
- DESIGN.md:9–25, 29–38; src/ui/index.html:63–99, 168–195, 235–264; src/ui/styles.css:1–18, 50–53: The UI uses an active step, hidden earlier-step list and a menu. Design guidance requires existing colors and Paper Mono, accessible names and focus, narrow-screen checks, and feature detection with constrained fallback. Styles define the shared theme tokens. (observation; scope: UI constraints and likely markup/style edit sites) (observed 2026-11-20)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/dogfood-932; citation not found: package.json has 69 lines, not 74:
- package.json:6–18, 33–40, 68–74; scripts/chat-turns.test.mjs:1–58, 136–169; .github/workflows/ci.yml:22–50; README.md:11–18, 67–89: The repository uses Node >=22.19.0, pnpm 11 and node --test for UI contract tests. CI installs locked dependencies before checks and Chromium before browser smoke. Existing turn tests assert ordered projection, card-only turns, and learner-facing answers. README documents pnpm check and deterministic pnpm smoke. (observation; scope: Runner, setup and relevant existing assertions) (observed 2026-11-20)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/dogfood-932:
- AGENTS.md:3–5, 17–34; PRODUCT.md:9–29; CODING_STANDARDS.md:41–51; _system/SDLC.md:5–7, 60–66: Guidance requires the smallest complete change, inspection before editing, preservation of learner work versus AI help, and permission for learner-data handling changes. Teaching belongs to learning and durable modules. Regression guards must be challenged by reversion. Workflow records do not authorize release or authenticate identity. (observation; scope: Teaching boundary and delivery permissions) (observed 2026-11-20)
- Mapped surface state, projections, markup, styling, clipboard handlers and test conventions: Likely edits include chat-surface.ts, index.html, adjacent styles, a focused serializer and targeted scripts tests. Risks include omitted collapsed turns, lost card-only content, protocol leakage, duplicate retries and false clipboard success. Teaching modules need not change for a UI copy feature. (inference; scope: Likely implementation and regression surface; limits: This is a change map, not a selected implementation or proof that no other file needs changes.; supported by: shape932-ui-owner-01, shape932-projection-02, shape932-copy-03, shape932-design-04, shape932-test-basis-05, shape932-boundary-06) (observed 2026-11-20)
- Compared turn projection, card rendering and existing card-only assertions: A tutor turn containing a question card but no text would disappear from a text-only export. This contradicts the intended whole-conversation result, so a targeted regression must retain that turn and its question. (inference; scope: Counter-example to exporting only turn.text; limits: Does not decide a final Markdown representation for structured content.; supported by: shape932-projection-02, shape932-test-basis-05) (observed 2026-11-20)
- Compared clipboard success handling with pending and completed conversation state: An experienced reviewer would ask whether denied clipboard access reports success and whether copying during a live reply silently loses content. Those cases need targeted tests and request-state inspection rather than a claim that serialization alone proves the feature. (inference; scope: Outside-view review of clipboard and streaming risks; limits: Does not establish actual browser permissions or select a live-request UI policy.; supported by: shape932-copy-03, shape932-ui-owner-01) (observed 2026-11-20)
Checked by read-only file tools in /Users/jondev/dev/worktrees/socratink/dogfood-932; citation not found: src/ui/chat-surface.ts has 535 lines, not 536:
- src/ui/chat-surface.ts:1–240, 260–536; src/ui/index.html:1–283; inspected copy handlers; scripts filename search for *copy*: This investigation has not established an existing whole-conversation copy action or targeted copy-conversation regression. The proposed scripts/copy-conversation.test.mjs must be added before its check can run. (unknown; scope: Whole-conversation implementation and executable regression) (observed 2026-11-20)

## Suggested first slice
Proposal only: from repository root, first run `git status --short` to protect unrelated work. Then draft the smallest behavior-specific regression for ordered conversation Markdown, including a card-only tutor turn. This is a starting point for Stage 01 approach drafting, not permission to run commands or implement.

## Risks and verification
Copying only the active DOM can omit collapsed earlier steps. Exporting raw sent text can expose protocol instructions as learner words. Serializing only text can drop card-only questions or assistance context. Live text and restored history need explicit regression coverage so copying does not silently omit a turn or duplicate a retry. Clipboard refusal must not report success. Proposed automated checks cover serialization and clipboard interaction; Taste judges whether the control remains quiet and keeps the yohaku look. No checks were run. Where we did not look: deployed browser permissions, real learner conversations and external clipboard destinations.

## Open questions and deferrals
No operator-only blocker was found. Browser permission handling and the precise live-request interaction remain implementation investigations, not settled behavior claims. Revisit if the smallest approach would omit learner-facing conversation content or require a change to learner-data handling.

## Owners and next steps
Known constraints are settled by the goal and repository evidence. The explicitly authorized delivery agent owns the remaining code reading, approach proposal, setup and test execution. Pending-stream behavior and clipboard refusal are risks: guard them with targeted regressions. Taste owns judgment of the built control. Seed confirmation does not authorize implementation, execution or release.

## Downstream handoff
The session folder is the handoff: <session>/seed-contract.md together with ledger.json, seed-confirmation.json and seed-checks.json. The consumer checks `tinkery seed status --json <session>` using a trusted executable. handoff.verified is true only while the seed, decisions and check records match the confirmed content; it does not authenticate who confirmed it. Preserve the recorded agent declaration rather than claiming human confirmation. The viewer page is not required. This is discovery input, not an implementation plan, approved specification or review receipt. Preserve accepted constraints in downstream work, follow the selected workflow's active contract and surface conflicts. No downstream profile or stage approval is selected here.

