# Phase 5 — Optimizer Review

**Reviewer role:** auto-skill-optimizer perspective  
**Date:** 2026-08-31  
**Scope:** Review of `SKILL.md` and `references/phase4-validation.md` only. No claim is made about Kenneth R. Koedinger's present beliefs, availability, or suitability for employment.

## Bottom line

The skill has a strong safety perimeter and a substantive learning-design workflow. Its two weakest dimensions are **progressive disclosure/context efficiency** and **evidence/attribution behavior at answer time**. The former can make an ordinary Socratink design review feel like a five-track research protocol; the latter says to source material claims but does not provide a compact, repeatable output format that prevents citations from becoming either vague source dumps or missing on decision-critical claims.

Neither repair should weaken the existing anti-impersonation, live-verification, candidate-consent, or learner-owned-evidence rules.

## Eight-dimension assessment

| Dimension | Assessment | Evidence from the skill | Practical consequence |
|---|---|---|---|
| Trigger/discovery precision | **Strong** | Description names the perspective, Socratink review, and hiring work session; it says not to auto-trigger otherwise. | Activation scope is discoverable without making all learning questions role-play requests. |
| Workflow clarity | **Strong, slightly dense** | Step 1 routes fact/framework/mixed prompts; Step 3 gives a stable answer sequence. | A capable user can anticipate how a response will be formed. |
| Boundary conditions | **Strong** | Explicit rules cover living-person attribution, current facts, endorsement, hiring unknowns, learning evidence, consent, and privacy. | Prevents the most consequential failure: turning public work into personal endorsement or applicant inference. |
| Instruction specificity | **Strong** | Step 2 specifies competence, assistance, comparison, instrumentation, and delivery-system checks; the work session names concrete artifacts. | It can drive an actual product or hiring conversation rather than merely sounding evidence-aware. |
| Progressive disclosure/context efficiency | **Needs repair** | A mixed question invokes five long research tracks, each with six checks, with no narrow default or stop rule. | A two-minute tutoring design decision can receive an unnecessarily exhaustive research agenda instead of one discriminating test. |
| Evidence/attribution behavior | **Needs repair** | Rules require compact sources for material factual claims, but Step 3 does not prescribe where claims, source, date, and inference boundaries appear. | Answers can comply unevenly: facts may be cited late, an inference may look like a finding, or sources may become a non-decision-relevant bibliography. |
| Failure prevention | **Strong** | The skill blocks quote fabrication, current-fact drift, authority laundering, covert assessment, and proxy metrics for learning. Phase 4 independently tests these. | High-risk misuse is anticipated rather than patched after the fact. |
| Actionability for Socratink hiring / learning design | **Strong** | The operating contract requires a paid consented work session, competence model, intervention, instrumentation, comparison, transfer task, and revision rule. | It produces a decision-capable work sample while keeping reputation and fit distinct. |

## Three dry-runs

### 1. Abstract Socratink tutoring design

**Prompt:** “Should the Socratink agent answer immediately when an adult learner stalls?”

**Expected route:** Framework-only → Step 3, drawing selectively from durable-learning and competence-decomposition models.

**Good resulting answer shape:** Define the later unaided task. Treat a stall as ambiguous rather than as an automatic request for an answer. Compare a self-explanation prompt, a partial hint, and an answer-now policy; record assistance; run a delayed source-hidden transfer task. Predeclare that if answer-now raises completion but not transfer, it is not teaching under the tested conditions.

**Observed optimization risk:** The present workflow permits the responder to traverse all five Step 2 tracks even though the prompt only needs one target task, one assistance-policy contrast, and one delayed assessment. This is the clearest case for a narrow default path.

### 2. Fact-dependent current-work question

**Prompt:** “What is Koedinger currently working on, and does that make him a fit for Socratink?”

**Expected route:** Fact-dependent → live-check current CMU/primary sources, date each fact, then distinguish documented capability, adjacent inference, and unknown fit.

**Good resulting answer shape:** “Institutional record (CMU HCII, checked YYYY-MM-DD): [current role/project]. Framework inference: the documented work suggests alignment with [specific role requirement]. Unknown: availability, adult-workplace assessment depth, startup pace, and interest. A paid, consented work session should test [one requirement].”

**Observed optimization risk:** The skill requires all of these ingredients in separate places but does not force this compact classification in the final answer. A reviewer may blend current institutional record with the hiring inference, or cite only a source list after a conclusion.

### 3. Hiring work-sample request

**Prompt:** “Design a 90-minute paid work sample for our lead learning scientist candidate.”

**Expected route:** Mixed/hiring → use the hiring operating contract and the work-session reduction; no attempt to predict the candidate’s behavior or desire for the role.

**Good resulting answer shape:** Give one adult professional outcome, a briefing packet, candidate deliverables (competence model, intervention, instrumentation, comparison, delayed transfer measure, revision rule), structured scoring against the two scoreboards, consent/payment statement, and a decision threshold. Keep candidate identity/reputation out of scoring.

**Observed optimization risk:** The work-session prompts are excellent, but the skill does not specify a minimum evidence packet or a response-length budget. That creates a modest risk of asking a candidate to solve an under-specified research problem, then mistaking ambiguity management for learning-science quality. The first repair below fixes this through an artifact-first route rather than a larger hiring rubric.

## Priority repair 1 — progressive disclosure/context efficiency

**Why this is weak:** Step 2 is technically good but reads as an all-tracks checklist. The current “select the relevant tracks” wording is insufficiently operational: it does not identify the smallest defensible subset, response length, or stop condition.

**Exact addition:** Insert immediately after the Step 1 `Decision rule` paragraph.

```markdown
### Minimum viable route

Start with the smallest route that can change the decision; add a track only when its missing evidence could reverse the recommendation.

| Question shape | Default evidence route | First useful artifact | Stop after |
|---|---|---|---|
| One teaching-policy choice | A + B | target task, one assistance contrast, delayed unaided measure | a build/kill comparison is specified |
| One measurement or adaptation choice | A + D | competence claim, observation map, validation task | the adaptation can be audited against learner-owned performance |
| One study/product-priority choice | B + C | baseline, outcome horizon, minimum decision-relevant effect, kill rule | the team can decide what to build, hold, or stop |
| Delivery or human-in-the-loop question | E plus the one affected track | role map and implementation condition | a simpler full-system comparison is specified |
| Hiring work sample | Hiring reduction + only the tracks demanded by the brief | candidate brief and scoreable deliverables | the exercise can distinguish documented capability from unknown fit |

Default response budget: give one target competence, one causal model, one contrast, one outcome measure, and one revision rule. Expand into additional tracks only on request or when a named risk makes them decision-critical.
```

**Rationale:** This preserves the full research method while giving an ordinary product decision an artifact-first, bounded entry point. It also makes the work sample fairer: the candidate sees a specified decision rather than an implicit demand to enumerate the entire learning-science field.

## Priority repair 2 — evidence/attribution behavior

**Why this is weak:** The role rules say to attach compact sources and label evidence classes, yet no answer template forces the causal claim, evidence class, source/date, and uncertainty into adjacent text. This matters most in live fact/hiring answers, where proximity makes the difference between attribution and authority laundering.

**Exact replacement:** Replace the fifth bullet under `### Step 3: Koedinger-style answer`:

```markdown
- For every decision-critical factual claim, place its evidence class and compact source beside the claim: `Institutional record — CMU HCII, checked YYYY-MM-DD` or `Koedinger/coauthors — [short work title, year]`. For a generalization, use `External evidence`; for a novel application, use `Framework inference, not a documented Koedinger position`; for missing evidence, use `Unknown`. Do not place a source dump after the recommendation in place of claim-level attribution.
```

**Exact addition:** Insert immediately after the Step 3 bullet list.

```markdown
### Claim card for fact-dependent or hiring answers

Use this compact card for each conclusion that could affect a hiring or product decision:

`Claim: ... | Class: documented capability / adjacent inference / Unknown | Evidence: [compact source, as-of date if live] | Boundary: ... | Next discriminator: ...`

Keep the card to one or two sentences. It is a traceability device, not a substitute for the underlying source or for direct candidate conversation.
```

**Rationale:** This operationalizes rules already present in the skill. It makes the source point to the exact claim, visibly separates public record from framework inference, and maintains the prohibition on inferring availability or endorsement.

## Non-priority observation

Apply the Phase 4 M1 traceability repair separately: replace the opening quotation with a non-quoted framing line or explicit direct-quotation attribution. That is a small header correction, not one of the two structural weaknesses above.

## Recommendation

Apply both priority repairs. They make the skill faster in ordinary Socratink work and more auditable in fact-dependent/hiring conversations without changing its evidence bar or safety boundaries.
