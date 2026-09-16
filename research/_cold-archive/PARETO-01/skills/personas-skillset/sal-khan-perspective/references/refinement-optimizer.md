# Sal Khan Perspective — Phase 5 Optimizer Review

**Review date:** 2026-08-08  
**Scope:** `SKILL.md` and `references/validation.md` only. This is a dry-run and refinement proposal; it does not edit the skill.

## Executive finding

The skill is unusually strong on reasoning integrity: it reliably turns an education/AI prompt into a learner-centered, mastery-and-transfer analysis without overstating a simulated person's authority. Its two weakest dimensions are **activation-to-first-action behavior** and **context/token efficiency**. Neither requires changing the reasoning core. The first needs a short operational bridge from classification to response; the second needs removal of duplicated historical context that the workflow does not consume.

## Dimension review

| Dimension | Rating | Evidence and optimizer judgment |
|---|---:|---|
| Workflow clarity | Strong | The three-step protocol has a usable order: classify, research if facts matter, then answer through a seven-part structure. The compact recommendation sequence is especially executable. |
| Activation-to-first-action behavior | Needs refinement | Activation, first-turn disclosure, inference labeling, and exit are explicit. But a live responder must infer how much research is necessary and what to do when the prompt is underspecified; this delays the first useful move or yields inconsistent clarification. |
| Instruction specificity | Strong | “Use I,” source rules, conditional reasoning, five research maps, response sequence, vocabulary, and explicit anti-patterns leave little room for generic persona output. |
| Routing | Strong | The frontmatter gives clear positive triggers and an important negative trigger for ordinary education/AI questions. Step 1 then routes fact-dependent, framework-only, and mixed questions correctly. |
| Boundary conditions | Strong | The skill distinguishes public reasoning from private belief, documented positions from framework inferences, organization copy from personal authorship, and product activity from learning. The validation edge case demonstrates this in practice. |
| Evidence discipline | Strong | It requires current primary and independent evidence when facts can change, separates verified/disputed/missing evidence internally, demands source support for important claims, and prohibits invented quotation. The validation report confirms known-position fidelity. |
| Anti-drift behavior | Strong | The dated 2025–26 calibration, “research first” rule, disconfirming-evidence requirement, and explicit unresolved tensions make stale optimism and unsupported certainty difficult. |
| Context/token efficiency | Needs refinement | The same background is expressed in the Identity card, Timeline, Latest researched developments, models, heuristics, and values. The timeline and latest-development material are useful reference notes but are not required to execute the answer workflow, so they consume context and raise salience of dated product claims. |

## Dry-runs

### 1. “Use Sal Khan's perspective to redesign our employee onboarding course”

**Route:** Mixed / novel domain. It is a concrete intervention but lacks current organization facts; the answer should label it as a framework-based inference, then make a small, reversible diagnostic proposal rather than pretend to know the company.

**Likely skill-conformant opening and direction:**

> I’ll use a Sal Khan perspective based on public work and interviews—not claim to speak for him. This is a framework-based inference, not a documented Sal Khan position. I would start with the new hire who completes every module but cannot independently perform the first real task. The redesign question is not how to make onboarding more engaging; it is which prerequisite, decision, or workflow they need to master.
>
> Map the first job-critical task into dependencies, let explanation and practice vary while keeping an unaided performance standard fixed, and use reusable material for routine context. Then deliberately reinvest manager or peer time in observation, feedback, belonging, and the exceptions a module cannot teach. Pilot one role, compare it with the simplest adequate alternative, and measure whether a new hire can complete the task unaided after a delay—not completion rate or satisfaction alone.

**Assessment:** The skill produces a high-quality intervention frame. The missing behavior is an explicit first action for unknown context: it should ask for or state the minimum needed facts (role, first independent task, current baseline) before implying a full redesign.

### 2. “What would Sal Khan think about banning AI in high school?”

**Route:** Fact-dependent policy question. Current high-school policies, tool capability, and evidence could materially change the recommendation, so the skill requires research before applying the framework. It should not claim a documented position unless a direct source supports it.

**Likely skill-conformant answer direction:**

> I’ll use a Sal Khan perspective based on public work and interviews—not claim to speak for him. I would begin with the student who can now obtain a polished answer without doing the thinking that makes the answer meaningful. The concern is real. But a blanket ban risks treating the tool as the whole problem and may give up opportunities for guided practice and feedback.
>
> The question is whether the school can preserve productive struggle and make the learning process visible. Set clear limits on permitted assistance, design tasks that require explanation, revision, application, or live defense, keep teachers in the loop, and include a short unaided transfer check. A ban may be justified for particular assessments or age contexts if guardrails cannot protect learning, privacy, or equity. The test is not whether students used AI; it is whether they can reason and perform independently without it.

**Assessment:** The framework is well-suited and naturally avoids the false binary. Its first sentence must be paired with fresh sources because “high school” policy/evidence is not abstract. The source-at-least-once rule is adequate, though the answer should cite the factual evidence rather than decorate a framework inference with an unrelated link.

### 3. “Sal Khan mode: our tutoring chatbot has lots of sessions but test scores are flat.”

**Route:** Mixed. The reported result is a concrete product claim, requiring an evidence map; the diagnosis uses documented models and does not need a claim that Khan has addressed this exact chatbot.

**Likely skill-conformant answer direction:**

> I’ll use a Sal Khan perspective based on public work and interviews—not claim to speak for him. Lots of sessions with flat scores is a signal that activity is not yet a learning loop. I would start with a learner who has a long conversation with the bot, feels supported, and then still cannot solve the next problem alone.
>
> Trace one representative path: explanation, attempt, feedback, correction, and unaided transfer. Check whether the chatbot is supplying answers too quickly, missing prerequisite gaps, failing to fit the assignment workflow, or leaving teachers with no visibility and no time to act. Segment results by learner and use case; averages can hide benefit for one group and harm or non-use for another. Run a small redesign that makes the bot ask for an attempt, surface a misconception, and hand a useful signal to a human tutor. Its North Star should be delayed unaided performance, with a revision trigger if that does not improve.

**Assessment:** This is the skill at its best. It converts a vanity metric into mechanism, subgroup analysis, a human-support design, and a transfer metric. It also fits the validation report’s evidence-aware warning against confusing conversations with learning.

## Weakest dimensions and exact improvements

### 1. Activation-to-first-action behavior

**Why it is weakest:** The classification table says when to research, but not the minimum response behavior when a request is materially underspecified. A model can either over-ask (“tell me everything”) or jump directly to a generic redesign. This is most visible in dry-run 1.

**Exact addition:** Insert the following after the **Decision rule** paragraph in Step 1.

> **Minimum viable start:** If the request is underspecified, do not stall for a full brief. State the learner or user outcome you will optimize, name the 2–3 missing facts that could change the recommendation, and give a provisional smallest next experiment. Ask one targeted follow-up only when it would materially change that experiment.

**Length justification:** 43 words. This prevents repeated clarification loops and makes the existing protocol operational on first contact; it is worth the small addition.

### 2. Context/token efficiency

**Why it is weakest:** The skill has both a detailed Timeline and a separate “Latest researched developments” list, while Models 2, 3, and 5 already state the active historical implications. The separate lists add dated assertions without changing route, research, or answer behavior.

**Exact replacement:** Replace the complete `## Timeline: key turning points` section, including its table and the `### Latest researched developments (2025–26)` subsection, with:

> ## Historical calibration
>
> The perspective developed from remote tutoring and reusable explanations into mastery practice, teacher tools, nonprofit access, and guarded AI/peer support. Use this history only to interpret the models above: the later public position treats AI as part of a teacher- and peer-supported learning system, and recent adoption or transfer evidence should narrow claims rather than be rationalized away. For current developments, research before answering.

**Length justification:** This is a net reduction of roughly 340 words while preserving the only execution-relevant calibration: evolution from explanation to system, conditional AI stance, and current-fact research requirement. It removes reference material that is duplicated elsewhere rather than weakening source fidelity.

## Guardrail for implementation

Do not remove the dated evidence entirely from the underlying research files. The proposed compression applies only to the execution skill: detailed chronology belongs in references, where it can be consulted when a question needs it. Retain the existing models, limitations, research maps, and honest-boundary sections unchanged.
