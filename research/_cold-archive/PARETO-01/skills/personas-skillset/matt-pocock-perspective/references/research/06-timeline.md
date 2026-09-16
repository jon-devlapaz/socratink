# Public Career and Engineering Timeline

**Subject:** Matt Pocock  
**Research date / current-state cutoff:** 2026-08-08  
**Method:** First-party pages and GitHub records take precedence. A small amount of career sequencing comes from a dated third-party case study that includes Pocock's own account; it is labelled as such. Dates not supported by a source are intentionally omitted.

## Source register

| Source | Type | Best use | Confidence |
|---|---|---|---|
| [Matt Pocock's site](https://www.mattpocock.com/) | First party | Current self-description: educator, content creator, engineer; now teaching AI engineering full-time | High for current wording; no start date given |
| [Total TypeScript "About" page](https://www.totaltypescript.com/) | First party | Prior roles and present teaching identity | High |
| [GitHub profile](https://github.com/mattpocock) | First party/platform record | Current profile bio: Total TypeScript, ex-Vercel and Stately | High |
| [`mattpocock/skills` repository](https://github.com/mattpocock/skills) and linked commits/releases | First party/platform record | Dated evolution of his AI-engineering practice | High |
| [No Starch Press book page](https://www.penguinrandomhouse.com/books/781323/total-typescript-by-matt-pocock/) | Publisher record | Publication date and description of the book | High |
| [Badass Developers case study](https://badass.dev/partners/total-typescript) (published 2024-02) | Secondary, interview/case-study source | Earlier career sequence and 2022 move into TypeScript education | Medium; cross-check with first-party profile |

## Timeline

| Date | Public milestone | What changed in practice or emphasis | Evidence / confidence |
|---|---|---|---|
| **2015–2018** | Worked as a voice/public-speaking coach, according to a later case study. | This is relevant to his later teaching delivery, but it is background rather than evidence about engineering philosophy. | [Case study](https://badass.dev/partners/total-typescript), secondary. **Medium**. |
| **2018–2021** | The same case study places him in front-end/full-stack engineering roles, including agency work, then work associated with XState/Stately. His own Total TypeScript bio confirms that he was on the XState core team before Vercel. | Plausible foundation for his recurring interests in TypeScript, developer experience, documentation, and complex application architecture. The causal link is an inference, not a stated claim. | [Total TypeScript](https://www.totaltypescript.com/) first party; [case study](https://badass.dev/partners/total-typescript) secondary. **High** for the broad sequence, **medium** for role dates/details. |
| **Early 2022** | Began publishing TypeScript tips, per the case study. | Public focus shifts from XState-centric material to TypeScript education. | [Case study](https://badass.dev/partners/total-typescript). **Medium**. |
| **April 2022** | Announced intent to build Total TypeScript while working at Stately; the case study says he then took a part-time Vercel contract to create time for the course. | A deliberate move from employed developer advocacy/open-source work to an independent educational product. | [Case study](https://badass.dev/partners/total-typescript). **Medium**. His current first-party profile independently confirms the sequence “XState core team → Vercel → Total TypeScript.” |
| **July 2022 onward** | A public career profile lists Total TypeScript as his independent-educator role from July 2022; first-party materials describe him as a full-time TypeScript educator. | Teaching becomes the central public role. His instructional stance emphasizes solving type errors with editor feedback and exercises rather than memorizing rules. | [Total TypeScript](https://www.totaltypescript.com/), [learn TypeScript page](https://www.totaltypescript.com/learn-typescript). **High** for current identity; **medium** for exact start month (profile mirror). |
| **2024-11-18** | Appeared on the ConTejas Code podcast discussing TypeScript fundamentals, error feedback loops, complex types, and career. | The available episode page still frames his public intellectual center of gravity as TypeScript and learning/feedback, not AI-agent orchestration. | [Acast episode](https://shows.acast.com/contejas-code/episodes/matt-pocock-total-typescript). **Medium-high**. |
| **2026-02-03** | Created [`mattpocock/skills`](https://github.com/mattpocock/skills), whose first commit is [“Initial commit”](https://github.com/mattpocock/skills/commit/985d8fce764dae479e7b77b632429abe38891ee8). | Earliest traceable public milestone in the move from teaching TypeScript concepts to encoding engineering process for agents. Do not infer that this is the first time he used AI coding privately. | GitHub commit and repository metadata. **High**. |
| **2026-02 to 2026-04** | Early repository history adds TDD guidance about horizontal slices (2026-02-04), then domain-modeling and triage/issue-workflow materials in April. | The emerging workflow joins classic engineering practices—domain language, ticket shaping, TDD, and codebase design—to agent use. This is an inference from the commit history, not a declared manifesto. | [2026-02-04 commit](https://github.com/mattpocock/skills/commit/b2039ab896), [2026-04-17 rename/workflow commit](https://github.com/mattpocock/skills/commit/8868f54212). **High** for changes, **medium** for interpretation. |
| **2026-04-14** | *Total TypeScript*, with Taylor Bell, was published by No Starch Press. | The TypeScript education work remains active alongside the AI-engineering turn; it was not simply abandoned. | [Publisher page](https://www.penguinrandomhouse.com/books/781323/total-typescript-by-matt-pocock/). **High**. |
| **2026-04-24** | Delivered the 96-minute AI Engineer workshop, [“AI Coding For Real Engineers”](https://www.youtube.com/watch?v=-QFHIoCo-Ko). | Publicly articulates the agentic-engineering thesis: agents can implement work, but humans should spend more attention on alignment, vertical slices, feedback, architecture, QA, and review. This is the clearest dated spoken artifact connecting his established software-engineering views to AI coding. | Primary video; searchable [independent recap](https://www.alcreon.com/podcast-digest/full-workshop-ai-coding-for-real-engineers-matt-pocock-ai-hero-mattpocockuk). **High** that workshop occurred; **medium-high** for fine-grained recap details without an official transcript. |
| **2026-06-17** | Repository cut its first public releases, [v1.0.0](https://github.com/mattpocock/skills/releases/tag/v1.0.0) and v1.0.1; the release commit added GitHub releases on version bump. | The skills move from an evolving directory of prompts to a versioned, distributable engineering artifact. | [Release v1.0.0](https://github.com/mattpocock/skills/releases/tag/v1.0.0), [commit](https://github.com/mattpocock/skills/commit/bddb833cbaa322ff89d07e490530860aa73a4293). **High**. |
| **2026-07-03** | Added a confirmation gate to `grilling`. | Indicates a preference for explicit agreement before acting, not merely a relentless interview. | [Commit](https://github.com/mattpocock/skills/commit/0e9a0727924c39cc2a0c7e04d04526a73bef7ac4). **High**. |
| **2026-07-08** | Released [v1.1.0](https://github.com/mattpocock/skills/releases/tag/v1.1.0). | Confirms rapid iteration of the public workflow after v1.0. | GitHub release. **High**. |
| **2026-07-16** | Introduced a round-by-round, frontier-based grilling interview. | The planning primitive becomes more explicitly stateful: settle prerequisite decisions, recompute the next answerable frontier, and avoid silently guessing downstream decisions. | [Commit](https://github.com/mattpocock/skills/commit/a4b2009a1a3ac9575506c10b4c84f08f9bba7a38). **High** for the change; **medium-high** for the conceptual reading. |
| **2026-07-23** | Renamed and restructured `writing-great-skills` as `writing-for-agents`. | Broadens the focus from making skills themselves to writing any document an agent reaches through instructions. This is a move toward context/harness design as an engineering surface. | [Commit](https://github.com/mattpocock/skills/commit/1fc6573e0e300118ce342fb9365521c9c34eefd4). **High**. |
| **2026-08-05** | Released [v1.2.0](https://github.com/mattpocock/skills/releases/tag/v1.2.0) and v1.2.2, following a large refactor of docs, installation story, skill boundaries, and user/model invocation roles. | Practice shifts toward more explicit routing and smaller, clearer skill descriptions. The changes are consistent with the stated preference for composability and avoiding stale/overgrown instructions. | [v1.2.0 release](https://github.com/mattpocock/skills/releases/tag/v1.2.0), [release commit](https://github.com/mattpocock/skills/commit/2ffb184ffbb752faa664c0b204f3c9241b1428e9). **High**. |
| **2026-08-06** | Released [v1.2.3](https://github.com/mattpocock/skills/releases/tag/v1.2.3). Recent commits make subagent language more harness-neutral, add secret redaction to bug diagnosis, and remove unnecessary time estimates/prose. | Current refinement direction: portability across coding-agent hosts, safety hygiene, and concise instructions. This is an inference from specific commits, not proof of a durable settled philosophy. | [v1.2.3 release](https://github.com/mattpocock/skills/releases/tag/v1.2.3), [release commit](https://github.com/mattpocock/skills/commit/6acc160e4e0cd062dbbbd7a1b26ae92855edf07e). **High**. |
| **2026-08-08** | Current public site says he now teaches AI engineering full-time and is building AI Hero; GitHub profile still foregrounds Total TypeScript and lists him as ex-Vercel/Stately. The skills repo is active and public. | Current identity is not a replacement of “TypeScript educator” with “AI person,” but a combination: engineering education now focused on how experienced web developers can use agents without abandoning software-engineering discipline. The last sentence is a synthesis/inference. | [MattPocock.com](https://www.mattpocock.com/), [GitHub profile](https://github.com/mattpocock), [skills repo](https://github.com/mattpocock/skills). **High** for current self-description/repo state; **medium** for synthesis. |

## Last-12-month detail: the visible AI-engineering shift

The available public record does **not** support an exact date for when Pocock first began working with coding agents. What it does show is a sharp, traceable public acceleration in 2026:

```text
TypeScript educator and engineer
        ↓ (public workflow artifact begins 2026-02)
Agent skills that encode planning, TDD, review, and architecture
        ↓ (public workshop 2026-04)
“AI Coding For Real Engineers” framing
        ↓ (releases 2026-06 onward)
Versioned, rapidly iterated, harness-aware skill collection
```

The intellectual continuity is stronger than the apparent subject change. His TypeScript education has long emphasized feedback from the editor and deliberate practice; the AI-engineering work reframes those ideas as feedback loops for agents: explicit requirements, small vertical slices, executable checks, review, and deep module boundaries. That continuity is an interpretation supported by his public materials, not a claim that he has stated verbatim.

## Current-state snapshot — 2026-08-08

### Public roles and outputs

- **Self-described role:** educator, content creator, and engineer; currently teaches AI engineering full-time and is building AI Hero. [MattPocock.com](https://www.mattpocock.com/)
- **Continuing TypeScript role:** creator of Total TypeScript; his first-party profile still says “TypeScript wizard,” “Ex-Vercel, Stately,” and describes the course as production-grade. [GitHub profile](https://github.com/mattpocock), [Total TypeScript](https://www.totaltypescript.com/)
- **Public AI-engineering artifact:** `mattpocock/skills`, a versioned repository of composable agent skills for problem framing, tickets, implementation, TDD, diagnostics, code review, domain modeling, and codebase design. [README](https://github.com/mattpocock/skills)

### Current engineering posture (inference from the latest repository and workshop)

1. **Keep humans at intent and acceptance boundaries.** Use agent autonomy for scoped implementation, not for deciding what success means.
2. **Make work small and observable.** Prefer vertical tracer bullets, tests, browser/runtime feedback, and review gates over large speculative plans.
3. **Treat agent context and instructions as designable infrastructure.** Current work on writing-for-agents, router boundaries, and harness-neutral language suggests the surrounding system matters as much as the model.
4. **Prefer adaptable, composable skills over a black-box process framework.** This increases user agency but leaves an honest limitation: prompt-level multi-step workflows can be skipped or behave differently across hosts/models.

## Gaps and cautions

- There is no verified public date for his transition from primarily TypeScript education to AI engineering; only the 2026 public artifacts provide a lower bound for the latter's visible focus.
- Exact employment dates prior to Total TypeScript rely partly on a secondary career/profile source; the final persona should state roles broadly unless precise dates are necessary.
- Repo commits show changes to artifacts, not all of Pocock's private practice or beliefs. Treat them as evidence of current experimentation and maintenance priorities.
- The public record does not justify claiming that he invented agent skills, that his workflow is universally effective, or that it supersedes conventional software engineering. His own public materials frame the work as engineering discipline applied to AI coding.
