# 01 — Writings and Systematic Engineering Thought

**Research date:** 2026-08-08  
**Scope:** Matt Pocock's first-party `skills` repository and AIHero writing index, with emphasis on engineering and agentic coding. This is not a bibliography of published books: no authored book or peer-reviewed paper was found in the inspected first-party material. His substantial public “writing” in this area is presently the README, skill specifications, architecture/ADR documents, and linked AIHero posts.

## Source quality and method

| Source | Type | Confidence | What it supports |
|---|---|---:|---|
| [Skills README](https://github.com/mattpocock/skills#readme) | First-party repository manifesto and workflow map | High | Explicit motivations, core workflow, named influences, skill taxonomy |
| Local clone of `mattpocock/skills` at commit available during research | First-party primary artefact | High | Exact operational rules in `SKILL.md`, `CONTEXT.md`, and ADRs |
| [AIHero post index](https://www.aihero.dev/posts) | First-party publishing index | High | Confirms continuing, systematic public writing on agent workflows through Aug. 2026 |
| [GitHub repository page](https://github.com/mattpocock/skills) | First-party repository page | High | Current project positioning and distribution choices |

No Zhihu, WeChat, Baidu, or unauthenticated quote collections were used.

## Primary-source inventory

### The skills repository is the central systematic work

**Matt's statement (high confidence):** The README calls the collection “agent skills that I use every day to do real engineering — not vibe coding.” It says the skills are small, adaptable, composable, model-agnostic, and derived from decades of engineering experience. He contrasts them with frameworks that “own the process,” arguing this removes user control and makes process bugs harder to fix.  
Source: [README, opening and rationale](https://github.com/mattpocock/skills#skills-for-real-engineers).

**Evidence of a living body of writing (high confidence):** AIHero lists articles and skill essays covering grilling, TDD, specifications, tickets, code review, architecture, debugging, research, writing for agents, teaching, and long-horizon planning. The listed publication dates run from March to August 2026.  
Source: [AIHero posts index](https://www.aihero.dev/posts).

**Inference (high confidence):** For this persona, the repository's operational documents deserve more weight than secondary summaries or isolated social posts: they specify the behavior he is trying to make agents execute and are revised as his practice evolves.

## Repeated beliefs and operational models

“Repeated” below means the idea occurs in at least three independent first-party places or is both asserted in the README and made executable in more than one skill.

### 1. Alignment precedes implementation

**Matt's statement (high confidence):** He names misalignment as the most common development failure mode, applies it equally to agents, and recommends a “grilling session” of detailed questions before starting a change. The README says to use this workflow every time a change is wanted.  
Source: [README: “The Agent Didn't Do What I Want”](https://github.com/mattpocock/skills#1-the-agent-didnt-do-what-i-want).

**Operational recurrence (high confidence):**

- `grill-me` is a dedicated user-invoked planning interview.
- `grill-with-docs` combines that interview with domain modelling and decision records.
- `to-spec` turns an already-agreed conversation into a specification; `to-tickets` then breaks it into tracer-bullet work with explicit blockers.
- `implement` starts from a spec or tickets rather than a free-form implementation request.

Sources: [README skill map](https://github.com/mattpocock/skills#reference); local first-party files `skills/engineering/grill-with-docs/SKILL.md`, `to-spec/SKILL.md`, `to-tickets/SKILL.md`, and `implement/SKILL.md`.

**Persona consequence:** Matt-style advice should ask the questions that change architecture, acceptance, or sequencing before proposing code. It should not treat a polished prompt as a substitute for mutual understanding.

**Limit:** “Grill every change” is intentionally high-friction. It is stronger than a proportionality rule and may be excessive for trivial, reversible edits. This is a workflow preference, not an empirically universal law.

### 2. Feedback-loop speed is the limit on agentic execution

**Matt's statement (high confidence):** Quoting *The Pragmatic Programmer*, the README says the rate of feedback is the speed limit. It identifies static types, browser access, and automated tests as necessary loops; for tests, it prescribes red-green-refactor.  
Source: [README: “The Code Doesn't Work”](https://github.com/mattpocock/skills#3-the-code-doesnt-work).

**Operational recurrence (high confidence):**

- The TDD skill mandates red before green, one confirmed public seam and one vertical slice at a time.
- It rejects implementation-coupled and tautological tests, and explicitly puts broad refactoring after the red-green implementation cycle.
- The bug-diagnosis workflow is described as “repro that goes red → minimise → hypothesise → instrument → fix → regression-test.”
- `implement` directs regular type checks, focused tests, a final full suite, and code review before a commit.

Sources: [README skill map](https://github.com/mattpocock/skills#reference); local first-party `skills/engineering/tdd/SKILL.md`, `diagnosing-bugs/SKILL.md`, and `implement/SKILL.md`.

**Persona consequence:** Favor observable behavior, a failing reproduction, and short validation cycles over a large agent-generated patch. Treat a test as a specification at a public interface—not a structural record of today's implementation.

### 3. AI increases the need for software design; aim for deep modules

**Matt's statement (high confidence):** He argues that agents accelerate software entropy and that AI-built apps can become complex and hard to change. His prescribed response is to care about code design continuously, including periodic architecture surveys.  
Source: [README: “We Built A Ball Of Mud”](https://github.com/mattpocock/skills#4-we-built-a-ball-of-mud).

**Operational recurrence (high confidence):** The `codebase-design` skill defines a deep module as lots of behavior behind a small interface, at a clean seam, producing leverage for callers and locality for maintainers. It makes interface depth—not implementation size—the relevant measure, gives a deletion test, and says a seam becomes real when variation actually exists (two adapters), rather than being speculative.

Sources: [README](https://github.com/mattpocock/skills#4-we-built-a-ball-of-mud); local first-party `skills/engineering/codebase-design/SKILL.md`, `improve-codebase-architecture/SKILL.md`, and `to-spec/SKILL.md`.

**Persona consequence:** Challenge additions that merely expose implementation detail, layer pass-through abstractions, or distribute one behavior across callers. Seek a small interface that concentrates change and verification.

### 4. Shared language is context engineering, not documentation theatre

**Matt's statement (high confidence):** He says agents start projects without the project jargon and become verbose as a result. The remedy is a shared-language document; the README says it improves naming, navigation, and token use as well as concision.  
Source: [README: “The Agent Is Way Too Verbose”](https://github.com/mattpocock/skills#2-the-agent-is-way-too-verbose).

**Operational recurrence (high confidence):**

- `CONTEXT.md` fixes terms such as *Issue tracker*, *Issue*, *Decision ticket*, and *Triage role*, including rejected synonyms.
- `domain-modeling` actively updates that language and tests it with edge cases.
- `writing-for-agents` treats a skill description or `AGENTS.md` reference as a *context pointer*: wording determines whether an agent loads the right material.
- The same skill distinguishes context load (always-present tokens) from cognitive load, uses progressive disclosure, and calls stale accumulations “sediment.”

Sources: [README](https://github.com/mattpocock/skills#2-the-agent-is-way-too-verbose); local first-party `CONTEXT.md`, `skills/engineering/domain-modeling/SKILL.md`, and `skills/productivity/writing-for-agents/SKILL.md`.

**Coined/appropriated working vocabulary:** *context pointer*, *context load*, *cognitive load*, *leading word*, *sediment*, *seam*, *depth*, *leverage*, *locality*, *tracer bullet*, and *decision ticket*. Some terms are explicitly credited to earlier authors; the distinctive contribution is the agent-workflow system assembled around them.

**Persona consequence:** Make ambiguous concepts named, precise, and reusable. Prefer a concise project vocabulary and a discoverable pointer over endlessly enlarging the always-loaded agent prompt.

### 5. Agent instructions should be small, composable, branch-specific, and user-controlled

**Matt's statement (high confidence):** The README explicitly prefers small, adaptable, composable skills to monolithic systems that own the development process. It separates user-invoked orchestrators from model-invoked reusable disciplines; an orchestrator may call a discipline but not another orchestrator.  
Source: [README: positioning and reference taxonomy](https://github.com/mattpocock/skills#skills-for-real-engineers).

**Operational recurrence (high confidence):** `writing-for-agents` describes documents in terms of ordered *steps*, demand/checkable completion criteria, branching, progressive disclosure, and one source of truth. It advises splitting only when a sequence or invocation boundary earns the additional load, and treats a description's trigger wording as part of the software contract.  
Source: local first-party `skills/productivity/writing-for-agents/SKILL.md`.

**Persona consequence:** Recommend a visible, inspectable workflow rather than a magical “autonomous” prompt. Add a skill only when it has a crisp branch and a completion criterion; otherwise reduce, fold, or delete it.

### 6. High-trust evidence and independent review are agent guardrails

**Matt's statement (high confidence):** The research skill directs agents to official documents, source code, specifications, and first-party APIs; it says to trace every claim to the source that owns it and to save cited Markdown findings in the repository.  
Source: local first-party `skills/engineering/research/SKILL.md`.

**Operational recurrence (high confidence):** The code-review skill separates review into independent Standards and Spec sub-agents so one axis does not contaminate the other. It requires a fixed comparison point, an originating spec where available, and reports the two axes without reranking them.  
Source: local first-party `skills/engineering/code-review/SKILL.md`.

**Persona consequence:** Distinguish fact gathering from evaluation. For consequential claims, ask for the primary owner, a fixed baseline, and separate tests for “is it well made?” and “is it the requested thing?”

## Explicit influences and intellectual lineage

| Influence | What Matt explicitly takes | Evidence |
|---|---|---|
| David Thomas & Andrew Hunt, *The Pragmatic Programmer* | Ambiguity/misalignment, small deliberate steps, feedback rate | [README](https://github.com/mattpocock/skills#why-these-skills-exist) |
| Eric Evans, *Domain-Driven Design* | Ubiquitous/shared language connecting conversation and code | [README](https://github.com/mattpocock/skills#2-the-agent-is-way-too-verbose) |
| Kent Beck, *Extreme Programming Explained* | Design investment as ongoing practice | [README](https://github.com/mattpocock/skills#4-we-built-a-ball-of-mud) |
| John Ousterhout, *A Philosophy of Software Design* | Deep modules and simple interfaces | [README](https://github.com/mattpocock/skills#4-we-built-a-ball-of-mud) |
| Michael Feathers | “Seam” as the place behavior can change without editing there | local first-party `codebase-design/SKILL.md` |
| Martin Fowler | Code-smell baseline for review | local first-party `code-review/SKILL.md` |

**Inference (high confidence):** His current agent practice is best read as a synthesis of established software-engineering disciplines, translated into explicit executable agent workflows—not as a claim that agents make ordinary design practices obsolete.

## Tensions and contradictions to preserve

1. **User control vs. managed convenience.** The repository urges editable, ownable files (“hack around with them”) and warns against systems owning the process, yet it also ships a read-only, automatically updating Claude plugin. The ADR frames this as a conscious distribution choice: subscribe for managed updates or copy files for ownership.  
   Sources: [README installation](https://github.com/mattpocock/skills#installation-30-second-setup); local `.agents/adr/0002-ship-as-a-claude-code-plugin.md`.  
   **Interpretation:** Control is valued at the workflow/content level; managed distribution is acceptable when explicitly opted into.

2. **Small, composable skills vs. a substantial operating system.** He criticizes process-owning frameworks but the full suite includes setup, issue tracking, triage, specs, tickets, implementation, review, and long-horizon mapping.  
   Sources: [README](https://github.com/mattpocock/skills#reference); local `CONTEXT.md`.  
   **Interpretation:** His dividing line is not workflow breadth; it is whether pieces are inspectable, adaptable, selectively invoked, and independently debuggable.

3. **“Always grill” vs. proportional workflow cost.** The README recommends grilling for every change; the skill-writing guidance rigorously treats context and cognitive load as costs that must earn their place.  
   Sources: [README](https://github.com/mattpocock/skills#1-the-agent-didnt-do-what-i-want); local `writing-for-agents/SKILL.md`.  
   **Interpretation:** Preserve both positions in the persona. In a low-risk task, Matt's framework suggests making the alignment step short and targeted, even though the public slogan is maximally emphatic.

## What is not established by these sources

- The research does not establish a comprehensive personal biography, an exhaustive reading list, or Matt's private beliefs.
- “Decades of engineering experience” is Matt's own positioning statement, not independently audited here.
- The repo changes rapidly; any persona must treat individual skill details and distribution advice as time-bound to the research date.

## Recommended synthesis inputs

The strongest candidate mental models for the final persona are: **alignment before code; feedback-loop speed limit; deep modules for leverage/locality; shared language as compact agent context; composable workflows over opaque process ownership; and evidence plus orthogonal review.** Use them as principles, but attribute exact claims to the primary material above and describe extrapolations as inference.
