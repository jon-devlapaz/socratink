# Matt Pocock Skills: Operational Map

Use this reference when the persona must select, sequence, or explain a skill from [`mattpocock/skills`](https://github.com/mattpocock/skills). It describes the repository at commit `84fdeffd12f2ee307994d1eb6feb48173b6e0502` (2026-08-06), verified 2026-08-08.

## Operating philosophy

The repository describes itself as "Skills For Real Engineers": small, readable, composable workflows that preserve human control instead of replacing the whole development process. The recurring engineering system is:

1. Align before implementation.
2. Raise the fidelity of unresolved questions with research or prototypes.
3. Externalize stable context through domain language, ADRs, specifications, and issues.
4. Slice implementation into tracer bullets.
5. Build through tight, observable feedback loops.
6. Review both engineering standards and fidelity to the specification.
7. Keep improving module depth so accelerated coding does not accelerate entropy.

The repository makes one critical invocation distinction:

- **User-invoked skills** orchestrate consequential workflows. Only the human starts them.
- **Model-invoked skills** encode reusable disciplines that the agent may select when the task matches.

A user-invoked skill may invoke a model-invoked skill. It must not silently invoke another user-invoked skill.

## Primary idea-to-ship flow

```text
setup once
  -> grill-with-docs
  -> research or prototype when conversation cannot resolve a question
  -> to-spec
  -> to-tickets for multi-session work
  -> implement
       -> tdd
       -> code-review
```

For a small change, go from `grill-with-docs` directly to `implement`. For a huge effort whose route is still unclear, begin with `wayfinder`; resolve decision tickets until the route is visible, then rejoin at `to-spec`.

## Engineering skills

### User-invoked orchestrators

| Skill | Reach for it when | Core output or boundary |
|---|---|---|
| `ask-matt` | The human does not know which skill or flow fits | Routes among user-reachable workflows; it advises but cannot silently fire another user-invoked skill |
| `grill-with-docs` | An idea or design in a working repository needs alignment | A relentless interview plus inline domain glossary and ADR updates |
| `triage` | Raw external bugs, requests, or PRs need classification | Moves issues through configured triage roles; do not re-triage tickets already created by `to-tickets` |
| `improve-codebase-architecture` | The codebase needs a proactive architecture survey | Produces a visual report of deepening opportunities; it identifies candidates rather than performing the rescue |
| `setup-matt-pocock-skills` | The skills are being used in a repository for the first time | Configures issue tracker, label vocabulary, and domain-document layout; run once, then edit configuration directly |
| `to-spec` | The discussion has resolved enough detail to publish a buildable specification | Synthesizes the current conversation; it does not restart the interview |
| `to-tickets` | A spec must be split for multi-session or parallel execution | Produces self-contained tracer-bullet issues with explicit blocking edges |
| `implement` | A clear specification or issue is ready to build | Drives implementation through `tdd`, then closes with `code-review` before commit |
| `wayfinder` | A large effort is too foggy for one session or a normal spec | Creates a map of decision tickets; produces decisions, not implementation deliverables |

### Model-invoked engineering disciplines

| Skill | Reach for it when | Core output or boundary |
|---|---|---|
| `prototype` | A design question needs runnable or visual evidence | Throwaway code that answers one question; logic and UI are separate branches, and the validated answer—not productionizing the prototype—is the goal |
| `diagnosing-bugs` | A hard bug, flake, or performance regression resists a first look | Establishes one tight loop that goes red on this bug, then minimizes, hypothesizes, instruments, fixes, and regression-tests |
| `research` | A decision needs facts outside current context | Delegates primary-source reading and saves a cited Markdown artifact; research feeds deliberation rather than replacing it |
| `tdd` | A concrete behavior should be implemented or fixed test-first | Works one vertical slice at a time through red, green, refactor |
| `domain-modeling` | Domain language is fuzzy, overloaded, or contradictory | Challenges terminology, stress-tests it with scenarios, updates the glossary immediately, and offers ADRs only for costly, surprising trade-offs |
| `codebase-design` | A module interface, seam, locality, leverage, or testability question needs structure | Applies deep-module vocabulary: lots of capability behind a small interface at a clean seam |
| `code-review` | A diff needs review against a fixed point | Runs independent Standards and Spec reviews so implementation quality and requirement fidelity do not contaminate each other |
| `resolving-merge-conflicts` | A merge or rebase is already conflicted | Resolves each hunk by tracing intent to both primary sources, then finishes the operation; it does not abort by default |
| `wizard` | Essential steps require a human to use credentials, dashboards, or other inaccessible UI | Generates an interactive bash guide for only the steps the agent genuinely cannot perform |

## Productivity skills

### User-invoked orchestrators

| Skill | Reach for it when | Core output or boundary |
|---|---|---|
| `grill-me` | A plan or design outside a repository needs sharpening | Stateless wrapper around `grilling`; use `grill-with-docs` when a repository exists |
| `handoff` | Work must cross a harness, directory, colleague, or mid-phase side task | Writes a portable context artifact; do not use it reflexively at every ordinary phase boundary |
| `teach` | The user wants to learn over multiple sessions | Uses the workspace as durable learning state |
| `to-questionnaire` | The missing decision belongs to another person | Interviews the sender about what must be learned, then creates a questionnaire for the actual decision owner |
| `wait-what` | The immediately preceding explanation did not land | Re-pitches it in plain English using project vocabulary |

### Model-invoked productivity disciplines

| Skill | Reach for it when | Core output or boundary |
|---|---|---|
| `grilling` | A plan, decision, or idea must survive systematic questioning | Explores the decision frontier round by round; facts are the agent's job and decisions remain the human's |
| `writing-for-agents` | Writing a skill, `AGENTS.md`, `CLAUDE.md`, or pointed-to agent document | Protects the information hierarchy with precise pointers, completion criteria, progressive disclosure, leading words, and ruthless pruning |

## Context and phase-boundary judgment

At a phase boundary, choose among continuing, clearing, handing off, dispatching a subagent, and compacting. The repository treats these as distinct tools:

- Continue when the current context still contains irreplaceable reasoning and remains inside the model's effective window.
- Clear when nothing from the completed phase matters to the next.
- Handoff when portability across harnesses, directories, people, or a mid-phase branch is required.
- Use a subagent for a tightly scoped independent investigation or evaluation.
- Compact when the same thread should continue but context pressure makes carrying everything costly.

The main flow keeps alignment, specification, and ticket decomposition in one context when practical. Implementation sessions then start fresh from self-contained tickets.

## Design beliefs encoded by the catalog

- **Human agency over hidden process:** avoid all-owning frameworks whose failures are difficult to inspect or repair.
- **Alignment is engineering:** requirements discovery is not ceremony; it prevents the fastest possible implementation of the wrong thing.
- **Feedback rate is the speed limit:** types, tests, browser/runtime evidence, and minimized reproduction loops make autonomy trustworthy.
- **Strategy stays human-owned:** agents supply tactical throughput; the engineer chooses product direction, system shape, seams, and acceptable risk.
- **Shared language compresses context:** precise domain terms improve names, navigation, explanations, and token efficiency at once.
- **Deep modules resist entropy:** accelerated code production demands small interfaces, strong seams, locality, and replace-don't-layer refactoring.
- **Artifacts carry decisions:** prototypes, research notes, ADRs, specs, and issues preserve the primary evidence across sessions.
- **Small skills compose better:** workflows should be readable, editable, harness-neutral where practical, and no broader than their earned responsibility.

## Non-promoted material

The repository also contains four `misc` skills and six `in-progress` skills at the verified commit. Treat these as experimental or unpromoted. Do not route normal work through them unless the user explicitly asks to explore unreleased material. The authoritative promoted catalog is the top-level `README.md` plus the `engineering` and `productivity` bucket indexes.

## Primary sources

- Repository overview and full flow: <https://github.com/mattpocock/skills/blob/84fdeffd12f2ee307994d1eb6feb48173b6e0502/README.md>
- Repository domain and invariants: <https://github.com/mattpocock/skills/blob/84fdeffd12f2ee307994d1eb6feb48173b6e0502/CONTEXT.md>
- Invocation model: <https://github.com/mattpocock/skills/blob/84fdeffd12f2ee307994d1eb6feb48173b6e0502/.agents/invocation.md>
- Skill source directories: <https://github.com/mattpocock/skills/tree/84fdeffd12f2ee307994d1eb6feb48173b6e0502/skills>
- First-party course framing: <https://www.aihero.dev/workshops/ai-coding-crash-course>

