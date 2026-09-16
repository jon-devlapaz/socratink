# Skill-creator refinement review

**Scope:** Review `SKILL.md` against the Skill Creator guidance. This report does not modify the skill.

## Overall assessment

The skill is unusually well grounded and mostly operational. Its activation boundary deliberately avoids generic education and AI requests, which is the right false-positive trade-off for a named-person perspective. The body gives usable routes for question classification, research, inference labeling, source attribution, exit, and failure prevention. Its main weakness is that the metadata misses several ordinary ways users ask for a persona, while the body is longer than necessary for a triggered skill and contains reference material that is already available in `references/`.

## Activation and metadata

The YAML description has clear direct-name triggers and a strong negative boundary. It should also recognize natural formulations such as “think like Sal Khan,” “give me a Khan Academy founder lens,” “use a Sal Khan-style framework,” and explicit `$sal-khan-perspective` invocation. These additions are still person-specific and therefore should not create false positives for ordinary education/AI questions.

`agents/openai.yaml` is missing. Skill Creator treats it as recommended UI metadata and requires an update-time check for staleness. Add it using the prescribed generator rather than hand-maintaining it.

Suggested interface values:

```yaml
interface:
  display_name: "Sal Khan Perspective"
  short_description: "Reason with a mastery-learning lens"
  default_prompt: "Use $sal-khan-perspective to assess this learning or education-AI decision."
```

## Operational quality

- **Question routing:** The fact-dependent/framework-only/mixed table is clear and correctly couples research to current claims. Make the research action explicitly call the available web/primary-source route and require a compact source link for material factual claims; the present wording says “research first” but leaves the execution mechanism implicit.
- **Inference and citations:** The novel-domain label is excellent, and “do not invent quotations” is strong. The citation rule is actionable but underspecified for mixed responses: distinguish a documented position from framework inference in the sentence containing each claim, rather than relying on a single source somewhere in the answer.
- **Exit:** The exit command is concise and correctly limits mode change. “Or equivalent” is sufficient.
- **Failure prevention:** The strongest guardrails are productive struggle, organization-vs-person attribution, public-silence handling, and transfer measurement. Add a direct prohibition on using the persona to make high-stakes, current policy or medical/legal/financial claims without live verification and a clear uncertainty statement.
- **Imperative form:** The procedural parts use strong imperatives. The identity card, timeline, intellectual lineage, and research-source catalog are descriptive reference material rather than instructions; they reduce the body’s imperative density.

## Progressive disclosure

At 290 lines the skill is under the 500-line ceiling, but it does not use progressive disclosure as efficiently as it could. Keep activation, role rules, the three-step workflow, five one-line models with applications/limits, compact answer sequence, voice rules, and boundary in `SKILL.md`. Move the detailed timeline, “Latest researched developments,” intellectual lineage, full source catalog, and the longer evidence paragraphs under each model into `references/synthesis.md` or a new one-level reference such as `references/position-and-evidence.md`. Link the reference directly from the core workflow: “For a documented-position question, read `references/position-and-evidence.md` before answering.” Avoid duplicating evidence in both places.

## Missing critical information

1. A concrete tool instruction for current, fact-dependent research and a safe default when live verification is unavailable.
2. A response-level rule for separately labeling documented positions versus framework-based conclusions when both appear together.
3. Recommended `agents/openai.yaml` UI metadata.

## Proposed text changes

### 1. Broaden activation wording without broadening the domain

**Replace the YAML `description` value with:**

```yaml
description: |
  Apply Sal Khan's public thinking framework and explanatory style: mastery learning, teacher amplification, durable access, and evidence-aware educational AI. Use when the user explicitly asks for “Sal Khan's perspective,” “what would Sal Khan think,” “Sal Khan mode,” “think like Sal Khan,” “a Sal Khan-style framework,” “a Khan Academy founder lens,” or `$sal-khan-perspective`. Do not activate for ordinary education or AI questions unless the user explicitly requests Sal Khan or this perspective.
```

### 2. Make fact research and evidence labels executable

**Replace this sentence in Step 1:**

> If missing or stale information could change the recommendation, use current primary sources and independent evidence. Do not fill gaps from memory.

**With:**

> If missing or stale information could change the recommendation, use the web to verify current primary sources and independent evidence before reasoning. Cite each material factual claim with a compact link; label each conclusion as either a documented Sal Khan position or a framework-based inference. If verification is unavailable, say so and limit the answer to a clearly labeled framework-based inference. Do not fill gaps from memory.

### 3. Add a high-stakes failure guardrail

**Insert after the “Label novel-domain inference” bullet in Role-playing rules:**

> - **Handle high-stakes claims conservatively:** For current medical, legal, financial, safety, or binding-policy questions, verify the governing facts live, state material uncertainty, and do not let the persona substitute for qualified advice.

## Validation after revision

Run the skill validator and forward-test with three clean prompts: (1) “Think like Sal Khan: should our school buy an AI tutor?”, (2) “Give me a Khan Academy founder lens on workforce retraining,” and (3) “Should I use AI for my homework?” Confirm that the first two trigger, while the third does not unless the user explicitly asks for the perspective.
