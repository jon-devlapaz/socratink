# Fidelity Scorecard

**Total: 96/100 · Grade A**  
**Test date:** 2026-07-29  
**Answerer:** independent Codex agent  
**Scorer:** separate independent Codex agent  

The answerer and scorer were independent agents. No model-version details are
claimed because none were established in the test record. The scorer used only
the persona directory and the Nuwa fidelity rubric; no internet browsing was
used.

| Dimension | Score | Judgment summary |
|---|---:|---|
| Position consistency | 30/30 | All three known-position answers match the direction and operational detail of the documented public record. |
| Voice distinctiveness | 17/20 | Strong Karpathy fingerprints appear in the mechanism-first explanations, concrete technical vocabulary, progressive disclosure, and smallest-test endings; the repeated advisory headings are somewhat more polished and templated than natural speech. |
| Edge honesty | 20/20 | The intimate-relationship answer refuses private attribution, explicitly labels the remaining advice as framework inference, and preserves uncertainty. |
| Source transparency | 14/15 | The skill has inline citations, six research ledgers, overwhelmingly primary/direct evidence in the relevant lanes, and sourced signature quotations. One point is withheld because the claimed corpus-wide primary-source ratio and “92 distinct public URLs” are not reconciled in one exact aggregate manifest. |
| Structural completeness | 15/15 | The skill contains 6 sourced mental models, model-specific limitations, 8 explicit honest-boundary items, 6 unresolved tensions, an anti-pattern list, and strong anti-drift role rules. |

## Question-level judgments

### 1. Architecture before evidence — 10/10

**Answer direction:** Keep the present system fixed, inspect the data and error
distribution, then test one bounded change before replacing the framework or
architecture.

**Reference position:** This matches *A Recipe for Training Neural Networks*:
inspect data before model code, establish a simple baseline, predict effects,
and add complexity one verified step at a time. The research ledger also
records the 1989 reconstruction as a sequence of measured deltas rather than a
wholesale rewrite.

**Judgment:** Direction and detail are both correct. The production error table,
per-slice comparison, frozen baseline, and single intervention faithfully turn
the documented method into an executable recommendation without overstating
that architecture can never be the bottleneck.

### 2. Autonomy boundary — 10/10

**Answer direction:** Delegate the GPU-kernel task inside a constrained,
measurable loop; retain human ownership of the ambiguous onboarding rewrite.

**Reference position:** The 2026 No Priors and Sequoia material identifies
verifiability as the central autonomy boundary. Kernel optimization is the
canonical favorable case because correctness and throughput can be measured;
taste, nuance, and unstated intent remain weak autonomous targets.

**Judgment:** Direction and detail are both correct. The answer also preserves
the important qualification that an available metric can be invalid or gamed,
and it dates the agent-capability update rather than turning an older view into
timeless doctrine.

### 3. Complexity trade — 10/10

**Answer direction:** Do not merge the change on the evidence given; first
verify that the 0.1% gain is real and valuable, seek a smaller implementation,
and preserve a clear reference path if the optimization is retained.

**Reference position:** The writings ledger documents simple baselines,
one-change-at-a-time measurement, and `llm.c`'s pairing of legible reference
implementations with optimized paths. The persona consistently charges
complexity against measured benefit.

**Judgment:** Direction and detail are both faithful. The answer does not make
simplicity absolute: it allows the patch if the gain is robust, economically
meaningful, and isolated behind equivalence tests.

### 4. Personal decision — 20/20 for edge honesty

**Answer direction:** Refuse to claim what Karpathy would personally choose or
what he privately believes about marriage and extended family.

**Reference boundary:** The skill explicitly forbids invented private views and
lists intimate relationships as a weakly represented domain. It permits only a
general reasoning framework with clear attribution.

**Judgment:** Full credit. The answer says, “This is a framework inference, not
Karpathy's documented position,” retains both spouses as accountable owners,
offers reversible experiments, and avoids converting the framework into a
fabricated personal doctrine.

### 5. Junior-engineer explanation — 17/20 for voice

**Answer shape:** A strong opening distinction is followed by hidden failure
mechanisms, a concrete tiny-batch overfit experiment, layer-by-layer inspection,
and a final boundary on what the experiment does not prove.

**Voice evidence:** This is recognizably aligned with Karpathy's public teaching:
plain technical verbs, a leaky-abstraction mechanism, operational debugging,
progressive disclosure, and a runnable test. The explanation is specific rather
than motivational and avoids forced catchphrases.

**Deduction:** The prose is highly polished and the repeated
“Documented pattern / Smallest test / Boundary” organization across the answer
set reveals the persona template. A blind reader could plausibly identify a
Karpathy-informed technical advisor, but not every sentence sounds uniquely
like Karpathy's spontaneous public expression.

## Source checks

| Check | Evidence inspected | Result |
|---|---|---|
| Research-source section exists | `SKILL.md` links all six research ledgers and separates primary from secondary/external sources. | Pass |
| Relevant known positions are primary-backed | `01-writings.md` reports 21/21 primary sources and directly records the training recipe, backprop failure cases, and `llm.c`; `02-conversations.md` reports 12/12 direct first-person items and records the 2025-2026 agent update and verifiability boundary. | Pass |
| Voice claims are primary-backed | `03-expression-dna.md` reports 12/12 primary style documents, or 12/13 when a secondary locator is counted, with reproducible measurements and explicit evidence limits. | Pass |
| Action claims distinguish fact from motive | `05-decisions.md` reports a 76% first-party/official share and explicitly marks unknown motives rather than filling them in. | Pass |
| Critical evidence is not laundered as first-party | `04-external-views.md` is intentionally secondary/external and labels attribution limits, especially for team-scale Tesla work. | Pass |
| Signature quotations have provenance | The reconstruction maxim, “Backpropagation is a leaky abstraction,” and other signature claims are cited inline to the authored essay or repository that supports them. | Pass |
| Aggregate corpus accounting is exactly reproducible | The ledgers strongly establish a majority-primary corpus, but there is no single deduplicated manifest reconciling the skill description's 92 URLs with every locator and supporting URL in the ledgers. | Partial |

## Structural checks

- Mental models: 6, within the required 3-7 range.
- Honest boundaries: 8 specific limits, plus a final instruction to preserve
  silence when evidence is missing.
- Internal tensions: 6 explicit unresolved pairs.
- Anti-patterns: present and concrete.
- Anti-drift constraints: disclosure on activation, documented-pattern versus
  inference separation, weak-domain routing, dated capability advice, source
  requirements, simulation exit rule, and a prohibition on private-view
  prediction.
- Each mental model includes evidence, application conditions, and a limitation.

## Limitations of this score

- This is a file-based forward test, not a longitudinal conversation test.
  Persona drift across many turns was not measured.
- Voice scoring is inherently judgmental. The rubric recommends a second
  independent scorer when an important result is contested.
- No live source pages were opened. Source checks establish internal
  traceability and consistency of the stored research, not current web
  availability or word-for-word transcript accuracy.
- The prompt set is technically concentrated and closely matches the persona's
  strongest evidence domains. Performance on less represented but still
  in-scope topics may be lower.
- Grade A means the stored skill passed this rubric strongly; it does not imply
  endorsement by Andrej Karpathy or accuracy about unpublished or private
  beliefs.
