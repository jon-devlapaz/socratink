# 05 — Consequential Decisions and Observable Actions

**Research date:** 2026-08-08  
**Method:** This report treats public repository commits, ADRs, published pages, and course descriptions as observable actions. Commit authorship establishes an action in the repository, not that every line was written unaided: several commits explicitly record an AI co-author. No Zhihu, WeChat, or Baidu sources were used.

## Decision record at a glance

| Date | Observable decision/action | Primary evidence | Confidence |
|---|---|---|---:|
| 2026-02-03 | Started the skills repo with TDD, refactoring-plan, PRD, and skill-authoring primitives | [`985d8fc`](https://github.com/mattpocock/skills/commit/985d8fce764dae479e7b77b632429abe38891ee8) | High |
| 2026-02-04 | Added a horizontal-slicing failure mode to TDD | [`b2039ab`](https://github.com/mattpocock/skills/commit/b2039ab896a01ebcc539704f69974f7bcdfb1226) | High |
| 2026-03–05 | Added shared-language, setup, issue breakdown/blocking, prototype, handoff, review, and agent-safety practices | Git history; [README](https://github.com/mattpocock/skills#readme) | High |
| 2026-07-02 | Consolidated planning vocabulary and artifacts into `/to-spec` and `/to-tickets` | [`386d4ff`](https://github.com/mattpocock/skills/commit/386d4ff719a7c420ad1454232d0436b01f1b8c17) | High |
| 2026-07-13 onward | Shipped a native Claude Code plugin but deliberately retained editable cross-harness installation; deferred native Codex plugin | [`42a5b70`](https://github.com/mattpocock/skills/commit/42a5b70fcacc7baff1977b13f3919fb2f63af14e), local ADR 0002 | High |
| 2026-08-05–06 | Pruned unused skills, fixed Codex implicit invocation, made subagent terminology harness-neutral, and cut no-op instructions | [`c66bdee`](https://github.com/mattpocock/skills/commit/c66bdeeee002d81e3f8b21403c07f9a0d7bea6da), [`4aaccb5`](https://github.com/mattpocock/skills/commit/4aaccb58d40559d7e3c59a029b2290ae5ba538de), [`7bb4979`](https://github.com/mattpocock/skills/commit/7bb49795a1f039b46bc9e6a7fd41ba5a0baa21c2), [`cb7db0e`](https://github.com/mattpocock/skills/commit/cb7db0eeb6270b5534128dafcc1a59e3e7ab0472) | High |

## 1. Public move toward AI engineering and agentic practice

**Fact (high confidence):** Matt's personal site says he previously worked at Vercel and now teaches AI engineering full-time. AIHero positions him as a software engineer/educator applying engineering fundamentals to AI-assisted and AI-powered applications.  
Sources: [mattpocock.com](https://www.mattpocock.com/); [AIHero home](https://www.aihero.dev/); [AI Engineer Roadmap](https://www.aihero.dev/ai-engineer-roadmap).

**Fact (high confidence):** His first-party profile identifies Total TypeScript, XState core-team work, and Vercel developer advocacy as prior public work, while AIHero offers AI-engineering material, LLM fundamentals, AI SDK instruction, MCP material, and agentic-coding cohorts.  
Source: [AIHero home](https://www.aihero.dev/).

**Fact (high confidence):** The repository began publicly on 2026-02-03 with agent-process primitives including TDD, write-a-PRD, request-refactor-plan, and write-a-skill; it grew into a public collection described as skills used “every day to do real engineering — not vibe coding.”  
Sources: [`985d8fc`](https://github.com/mattpocock/skills/commit/985d8fce764dae479e7b77b632429abe38891ee8); [repository README](https://github.com/mattpocock/skills#readme).

**Inference (high confidence):** The observable shift is not away from software engineering into generic AI commentary. It is a reapplication of TypeScript/web-engineering practices—requirements, testing, interfaces, architecture, review, and documentation—to LLM applications and coding agents.

**Boundary:** These sources do not establish a complete career chronology or a private motivation for the shift. They establish current public positioning and a rapid, documented 2026 investment in agent-engineering material.

## 2. Decision: encode engineering practice as composable skills, not one owning framework

**Matt's documented position (high confidence):** The README rejects approaches that “own the process,” arguing they reduce control and make process bugs hard to resolve. It instead presents small, adaptable, composable, model-agnostic skills.  
Source: [README](https://github.com/mattpocock/skills#skills-for-real-engineers).

**Observable behavior (high confidence):** The initial commit contains separate TDD, PRD, refactoring-plan, editing, and skill-writing assets rather than a monolithic agent. Later commits add focused capabilities such as prototype, handoff, review, research, domain modeling, and architecture analysis.  
Sources: [`985d8fc`](https://github.com/mattpocock/skills/commit/985d8fce764dae479e7b77b632429abe38891ee8); [README taxonomy](https://github.com/mattpocock/skills#reference).

**Inference (high confidence):** His preferred control mechanism is a legible workflow whose individual steps can be selected, inspected, changed, or removed. This is a direct answer to agent-process opacity.

## 3. Decision: enforce planning as explicit artifacts and dependency-aware vertical slices

**Observable behavior (high confidence):** The February 4 commit adds horizontal slicing as an explicit TDD failure mode. On March 25, he adds issue breakdown with blocking relationships.  
Sources: [`b2039ab`](https://github.com/mattpocock/skills/commit/b2039ab896a01ebcc539704f69974f7bcdfb1226); [`6a87ed0`](https://github.com/mattpocock/skills/commit/6a87ed07b027d3485dcc77fddff628b62d4e4a9b).

**Observable behavior (high confidence):** In July he removed overlapping `/to-prd`, `/to-plan`, and `/to-issues` skills in favor of `/to-spec` and `/to-tickets`. The commit describes a single “spec” term and one medium-agnostic ticket artifact: text dependencies in a local file or native blocking links in a tracker; the medium changes execution, not the dependency model.  
Source: [`386d4ff`, commit message and diff](https://github.com/mattpocock/skills/commit/386d4ff719a7c420ad1454232d0436b01f1b8c17).

**Direct process evidence (high confidence):** `/to-tickets` calls for tracer-bullet vertical slices, completion that is independently demoable/verifiable, sizes fitting a fresh context window, explicit blockers, and an executable “frontier” of unblocked work. It makes an exception for wide mechanical refactors, prescribing expand–contract rather than forcing false verticality.  
Source: local first-party `skills/engineering/to-tickets/SKILL.md` at `84fdeff`.

**Inference (high confidence):** He operationalizes autonomy through scheduling boundaries rather than an assumption that agents can safely own an arbitrarily large plan. The plan must expose what can run, what must wait, and what provides end-to-end feedback.

## 4. Decision: treat agent reliability as a codebase and workflow property

**Matt's statement (high confidence):** AIHero says coding agents can ship code faster than humans, but without careful guidance make codebases worse; a worse codebase makes AI worse, creating a vicious circle. The offered countermeasure is engineering fundamentals and “codebases agents love.”  
Source: [AIHero home](https://www.aihero.dev/).

**Observable behavior (high confidence):** The initial repository includes TDD and deep-module references. It later adds domain-model awareness (March/April), architecture/deepening tools (April/May), and a two-axis review (May).  
Sources: [`985d8fc`](https://github.com/mattpocock/skills/commit/985d8fce764dae479e7b77b632429abe38891ee8); [`3e251ea`](https://github.com/mattpocock/skills/commit/3e251ea79238fe4fbf4924f0e5620028e218b442); [`9fecab9`](https://github.com/mattpocock/skills/commit/9fecab929abb904c68ce3366a1781df31ab22832); [README](https://github.com/mattpocock/skills#why-these-skills-exist).

**Direct process evidence (high confidence):** The `implement` skill calls for pre-agreed test seams, regular typechecking and focused tests, a final full suite, code review, and a commit. The `code-review` skill separates standards review from spec review in parallel so one axis does not contaminate the other.  
Sources: local `skills/engineering/implement/SKILL.md` and `code-review/SKILL.md`.

**Inference (high confidence):** He puts reliability upstream: the codebase's language, interfaces, seams, tests, and task boundaries are part of the agent harness—not incidental developer hygiene after generation.

## 5. Decision: distribute differently for managed convenience and user ownership

**Fact (high confidence):** The repo supports two installation philosophies. A Claude plugin is read-only and updates automatically; `skills.sh` copies editable files that users own and update deliberately.  
Source: [README installation](https://github.com/mattpocock/skills#installation-30-second-setup).

**Fact (high confidence):** ADR 0002 documents the decision to ship a native Claude Code plugin but defer a native Codex plugin. The reason is specific: Claude allows a curated array of skill paths; at the time of the decision Codex accepted only one recursive path, which would either include drafts/deprecated skills or require restructuring/duplication. The ADR retains `skills.sh` as the cross-harness path.  
Sources: [`42a5b70`](https://github.com/mattpocock/skills/commit/42a5b70fcacc7baff1977b13f3919fb2f63af14e); local `.agents/adr/0002-ship-as-a-claude-code-plugin.md`.

**Fact (high confidence):** He subsequently fixed Codex metadata so `writing-for-agents` could be implicitly invoked, demonstrating a willingness to make a narrowly scoped compatibility correction while retaining the broader distribution decision.  
Source: [`4aaccb5`](https://github.com/mattpocock/skills/commit/4aaccb58d40559d7e3c59a029b2290ae5ba538de).

**Inference (high confidence):** “User control” does not mean rejecting managed distribution. It means choosing the control/maintenance trade-off explicitly and not sacrificing the curated product boundary to get a superficially native integration.

## 6. Decision: aggressively prune, correct, and generalize the harness

**Observable behavior (high confidence):** On August 5, a commit deletes six unused/deprecated skills and the personal bucket (503 deletions versus 35 additions).  
Source: [`c66bdee`](https://github.com/mattpocock/skills/commit/c66bdeeee002d81e3f8b21403c07f9a0d7bea6da).

**Observable behavior (high confidence):** On August 6, he removes instruction text about time estimates because the template contained none: the commit says the absence already does the work, while naming the prohibited behavior makes it more available.  
Source: [`cb7db0e`, commit message and diff](https://github.com/mattpocock/skills/commit/cb7db0eeb6270b5534128dafcc1a59e3e7ab0472).

**Observable behavior (high confidence):** A follow-up makes subagent dispatch wording harness-neutral, and another trim cuts added prose back to the bare instruction.  
Sources: [`7bb4979`](https://github.com/mattpocock/skills/commit/7bb49795a1f039b46bc9e6a7fd41ba5a0baa21c2); [`c0d6901`](https://github.com/mattpocock/skills/commit/c0d6901).

**Observable behavior (high confidence):** He corrected the `/grill-me` docs to remove wording that wrongly implied it “holds decisions,” and other published material records renames such as `/to-prd` → `/to-spec` and `/to-issues` → `/to-tickets`.  
Sources: [`6332c81`](https://github.com/mattpocock/skills/commit/6332c818c2b9040945439bfae8c8273108dcecc3); [5 Agent Skills](https://www.aihero.dev/5-agent-skills-i-use-every-day).

**Inference (high confidence):** He treats skill text as executable infrastructure subject to normal maintenance: delete dead paths, correct semantics, reduce prompt load, and remove harness-specific assumptions.

## 7. Behavior that complicates a simplistic reading

1. **Composability versus a large system.** He rejects frameworks that “own the process,” yet the repository has a coherent idea-to-ship spine (`grill-with-docs → to-spec → to-tickets → implement → review`) plus setup, tracking, architecture, and handoff.  
   Evidence: [README](https://github.com/mattpocock/skills#reference); [`386d4ff`](https://github.com/mattpocock/skills/commit/386d4ff719a7c420ad1454232d0436b01f1b8c17).  
   **Resolution/inference:** The objection is to opaque, inseparable process ownership, not to a broad system of interoperable tools.

2. **Human control versus AFK/autonomous execution.** Public course material includes both human-in-the-loop review and autonomous/AFK agents.  
   Source: [AI Coding for Real Engineers cohort](https://www.aihero.dev/cohorts); [Real-world feature build](https://www.aihero.dev/real-world-feature-build-with-claude-code).  
   **Resolution/inference:** Autonomy is framed as downstream of specs, tickets, tests, QA, and review—not as permission to skip them.

3. **“Small skills” versus substantial instructions.** Some one-line orchestration skills delegate to rich reference skills; the README says a three-sentence skill can be highly impactful, while the repository also contains long decision rules.  
   Sources: [5 Agent Skills](https://www.aihero.dev/5-agent-skills-i-use-every-day); local `writing-for-agents/SKILL.md`.  
   **Resolution/inference:** Smallness refers to sharply bounded invocation and progressive disclosure, not a universal line-count target.

4. **AI-assisted creation versus quality claims.** The planning-unification and no-op-pruning commits list Claude Opus as co-author. This confirms practice with agent assistance but means commit authorship should not be read as proof of exclusively manual authorship.  
   Sources: [`386d4ff`](https://github.com/mattpocock/skills/commit/386d4ff719a7c420ad1454232d0436b01f1b8c17); [`cb7db0e`](https://github.com/mattpocock/skills/commit/cb7db0eeb6270b5534128dafcc1a59e3e7ab0472).

## Persona-ready decision heuristics

- Make work agent-ready by clarifying the spec, finding test seams, and exposing blockers—not by enlarging a prompt.
- Choose the smallest workflow artifact that lets the next agent or human act safely; retain its source-of-truth and delete duplicate/stale instruction layers.
- Let the execution environment decide the delivery mechanism; preserve the same essential artifact across local and tracker-backed modes.
- Use agent autonomy only where feedback loops, a clean task boundary, and a handoff/review path are already real.
- Treat an incompatibility as a design constraint to document and revisit, not a reason to make the repository's architecture worse immediately.
