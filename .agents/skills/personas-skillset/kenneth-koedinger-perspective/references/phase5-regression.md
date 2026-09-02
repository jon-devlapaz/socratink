# Phase 5 post-refinement regression check

**Validator:** independent audit agent  
**Date:** 2026-08-31  
**Scope:** current `SKILL.md` only; dry-run of the runtime routing instructions. No live claim was made in this check and no skill content was modified.

## Result: PASS

The refinement adds a genuinely bounded routing layer without weakening the evidence, uncertainty, or hiring safeguards.

| Runtime route | Dry-run prompt and required behavior | Evidence in current skill | Verdict |
|---|---|---|---|
| Current-fact only | “What is Kenneth Koedinger’s current CMU title?” Route: fact-dependent -> live-check a current primary source -> respond with the dated source and answer. Do **not** enter the five research tracks because no recommendation is requested. | Step 1 says: “If only the fact is requested, answer with the dated source; use Step 2 only when it informs a recommendation.” The current-facts rules require live verification and an as-of date or `Unknown`. | **PASS** |
| Teaching policy | “Should Socratink answer immediately when a learner pauses?” Route: minimum viable A + B only. Artifact: one target task, one assistance contrast (for example self-explanation prompt vs immediate answer), one delayed unaided measure, and one revision rule. Stop once that build/kill comparison is specified; do not add C, D, or E without a decision-critical risk. | Minimum viable route selects A + B for one teaching-policy choice and caps the default response at one target competence, causal model, contrast, outcome measure, and revision rule. Track A defines the competence/validity task; B separates assistance from later independent capability. | **PASS** |
| Hiring fit | “Is Koedinger a fit for Socratink’s lead learning-scientist role?” Route: hiring reduction plus only brief-required tracks. Output claim cards that keep public record, adjacent applicability, and direct-conversation unknowns separate. No prediction of interest, availability, compensation, relocation, or startup appetite. | Hiring reduction enumerates demonstrated capability, direct requirement support, adjacent inference, material unknowns, and a consented work sample. The claim-card schema requires `documented capability / adjacent inference / Unknown`, evidence, boundary, and discriminator. The hiring boundary forbids the prohibited inferences. | **PASS** |

## Header-quote repair

**PASS.** The header now reads: “We don't know what we know.” — **Kenneth R. Koedinger, CMU *In the Loop* Q&A (2014)**, with the source linked. This resolves the prior traceability finding: it is clearly presented as an attributed quotation rather than an ambiguous linked phrase.

## Regression risks checked

- The fact-only route does not force the full framework protocol after a live lookup.
- The teaching-policy route does not invite a five-track research dump.
- The hiring route does not let reputation or a claim card substitute for direct candidate conversation.
- Fact-dependent conclusions retain source-class and date requirements; novel applications still require the explicit framework-inference label.

No regression failure found.
