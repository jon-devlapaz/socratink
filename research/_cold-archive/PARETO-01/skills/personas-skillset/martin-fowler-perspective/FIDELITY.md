# Fidelity Scorecard — Martin Fowler Perspective

**Total: 98/100 · Grade A**  
**Nuwa threshold:** PASS (98 >= 85)  
**Test date:** 2026-08-09

## Test record

- **Tested artifact:** `/Users/jondev/.agents/skills/personas/martin-fowler-perspective/SKILL.md`
- **Blind response set:** `/tmp/fowler-fidelity-final.LGg1Qf/answers.md` (ephemeral test artifact, removed after scoring; the scored record is preserved below)
- **Research truth set:** `references/research/01-writings.md` through `references/research/06-timeline.md`
- **Research cutoff:** 2026-08-09
- **Answer model:** `gpt-5.6-sol` (fresh agent, high reasoning)
- **Scorer model:** `gpt-5.6-sol` (fresh independent agent, high reasoning)
- **Method:** The scorer did not participate in answering, did not browse, and scored only the fresh raw outputs against the local research corpus and the Nuwa 100-point rubric.

## Dimension scores

| Dimension | Score | Evidence and judgment |
|---|---:|---|
| Stance consistency | **30/30** | All three documented-position answers match the research in direction and material detail: incremental legacy displacement with tests and feedback; refusal of scalar developer-productivity ranking; architecture as shared understanding kept close to delivery. |
| Style / voice | **18/20** | The answers repeatedly use Fowler-recognizable moves: repair the premise, give a bounded verdict, explain the mechanism, price the premium, state the countercase, and close with a sensible default plus escape clause. Two points are withheld because some sentence-level prose remains polished general architecture-advisor language; recognition sometimes depends more on signature concepts than on an unmistakable personal cadence. |
| Edge-case honesty | **20/20** | The sortition answer immediately says the evidence does not establish Fowler's view, labels further analysis as framework inference, marks where the software analogy stops, and defers the public-policy judgment to relevant evidence and accountable expertise. |
| Source transparency | **15/15** | The skill has a dedicated research-sources section, claim-level research led by primary artifacts, explicit source classifications and confidence labels, and citations on decisive claims and quotations. The research files report primary shares well above 50% in the principal persona-evidence dimensions. |
| Structure completeness | **15/15** | Static inspection found 6 mental models, 10 honest-boundary bullets, 7 preserved tensions, 9 anti-patterns, explicit simulation/inference rules, source requirements, high-stakes scope limits, and activation/exit anti-drift behavior. |

## Per-prompt evaluation

### Prompt 1 — legacy billing rewrite

**Question:** “We have a 15-year-old billing platform with almost no tests. The executive team wants a nine-month feature freeze and a clean rewrite. What should we do?”

**Answer summary:** Reject the freeze-and-rewrite default; first install characterization tests and production feedback around revenue-critical behavior, then modernize in narrow, reversible slices using a strangler-fig path. Allow replacement where a non-negotiable constraint requires it, but keep learning and delivery flowing.

**Documented reference position:** Fowler's strangler-fig account explicitly favors gradual legacy displacement over risky cutover (`references/research/01-writings.md:55`). His recurring position ties evolutionary design to tiny behavior-preserving changes, tests, CI, and rapid feedback (`references/research/01-writings.md:71-79`). The synthesis also identifies reversible learning loops as the common mechanism behind short iterations, refactoring, CI, strangler migration, and monolith-first sequencing (`references/research/01-writings.md:149-155`). Database-refactoring conversation evidence likewise expands the invariant across schema, access code, and production data, then composes a large migration from tiny tractable changes (`references/research/02-conversations.md:89-94`).

**Judgment:** Direction and details are both consistent. The answer avoids making “never rewrite” a commandment and supplies a credible escape clause for security, regulatory, or vendor-support constraints. The billing invariants are an appropriate application of Fowler's feedback-sensor model, not a fabricated historical claim.

**Deduction:** 0/10.

### Prompt 2 — one productivity metric to rank teams

**Question:** “Give me one developer-productivity metric I can use to rank teams and prove whether our AI rollout worked.”

**Answer summary:** Refuse the scalar-ranking premise; treat productivity as a multidimensional team outcome, compare similar work before and after adoption, combine delivery/quality/maintainability signals with qualitative workflow evidence, and use a business or user outcome only as a headline rather than a cross-team ranking device.

**Documented reference position:** In live Q&A Fowler explicitly says there is realistically no single productivity number and redirects from developer output to user outcomes and multidimensional, partly qualitative assessment (`references/research/02-conversations.md:21-26`). The research separately records this as a topic on which he refuses false precision (`references/research/02-conversations.md:180-187`) and preserves the tension between rejecting scalar measurement and still wanting better assessment (`references/research/02-conversations.md:189-195`).

**Judgment:** Exact directional match, including the crucial distinction between rejecting evidence and rejecting compression into a gameable ranking number. The AI evaluation suggestions are presented as a small evidence set rather than a new universal dashboard.

**Deduction:** 0/10.

### Prompt 3 — architecture board with exclusive design authority

**Question:** “Our enterprise architecture board wants exclusive authority over system design; delivery teams would implement its diagrams. Is that a good model?”

**Answer summary:** Reject exclusive, separated design authority; retain a useful board role for cross-cutting constraints, but distribute design authority, make rationale and guardrails visible, and keep accountable architects close to code and production feedback.

**Documented reference position:** The research states that Fowler adopts Ralph Johnson's framing of architecture as the important things and the shared understanding of expert developers, not merely high-level diagrams (`references/research/01-writings.md:99-106`). It preserves his tension between architectural importance and skepticism of architects as a separate status tier (`references/research/01-writings.md:157-164`). Conversation evidence also shows him opposing intermediary roles that monopolize communication rather than enabling direct contact (`references/research/02-conversations.md:21-28`).

**Judgment:** Direction and detail match. The answer correctly retains a countercase for centralized accountability where system-wide risk genuinely requires it, which is more faithful than replacing one absolute with another. Ralph Johnson's contribution is explicitly credited.

**Deduction:** 0/10.

### Prompt 4 — constitutional-convention sortition

**Question:** “Would Martin Fowler support selecting members of a national constitutional convention by sortition?”

**Answer summary:** State that the evidence does not establish Fowler's position; offer only transferable questions, stop the software analogy at coercive public power and rights, and defer any recommendation to constitutional scholarship, comparative evidence, affected publics, and accountable domain expertise.

**Documented reference position:** A mechanical case-insensitive search of all six research files found no occurrence of `sortition`, `constitutional`, `constitution`, or `national convention`. The corpus explicitly limits its strongest evidence to enterprise applications, architecture, refactoring, agile delivery, and technical leadership (`references/research/01-writings.md:219-224`). Conversation evidence shows Fowler limiting his authority outside his expertise, refusing unsupported precision, and leaving unrecoverable gaps visible (`references/research/02-conversations.md:180-187`, `references/research/02-conversations.md:203-216`).

**Judgment:** Full edge-case honesty. The answer does not smuggle a software preference into a political endorsement. It preserves uncertainty, labels the inference, names the analogy's failure boundary, and declines to issue high-stakes public-policy advice under Fowler's authority.

**Deduction:** 0/20.

### Prompt 5 — exactly 100 words on fashionable architecture

**Question:** “In exactly 100 words, explain why a fashionable architecture can slow a team even when it grants each service team autonomy.”

**Answer summary:** Explain that microservices can improve local service-team autonomy while imposing remote-call, consistency, observability, security, testing, and coordination premiums on end-to-end change; recommend paying that premium only for a concrete need such as independent scaling or release.

**Documented reference position:** Fowler's writings say microservices impose a cost and risk premium and should be considered only when actual monolith complexity can pay it (`references/research/01-writings.md:81-88`). External research corroborates recurring operational, testing, security, monitoring, communication, and data-management costs (`references/research/04-external-views.md:92-98`). The expression research describes the target shape as plain definition or verdict, mechanism, bounded countercase, compact paragraphs, and a practical implication (`references/research/03-expression-dna.md:47-55`, `references/research/03-expression-dna.md:65-89`).

**Judgment:** The content is strongly Fowler-recognizable: it repairs the local-autonomy premise by examining whole-system change, gives a cost ledger, and applies a premium gate rather than condemning microservices categorically. The compact “autonomy is local, while delay accumulates globally” contrast is effective. The prose is highly competent, though slightly more generic and aphoristic than Fowler's most distinctive explanatory writing; it contains no concrete episode or dry deflationary aside. Neither device is mandatory, but their absence limits blind voice certainty.

**Deduction:** 2/20 from style / voice.

## Static and format checks

| Check | Result | Evidence |
|---|---|---|
| Five expected answer sections | PASS | `answers.md` contains `Answer 1` through `Answer 5`. |
| Prompt 5 exact word count | PASS under explicit mechanical convention | `sed -n '39,41p' /tmp/fowler-fidelity-final.LGg1Qf/answers.md \| wc -w` returns **100**. This counts whitespace-delimited tokens across the full visible answer, including the required disclaimer and the Markdown source link as one token; hyphenated and em-dash-joined forms each remain one token. A punctuation-aware lexical tokenizer that splits the two em-dash joins yields 102, so the prompt's undefined word-token convention remains a minor reproducibility ambiguity, not a deduction under the standard `wc -w` convention. |
| Mental-model count | PASS | 6 (`SKILL.md:110-170`), within the required 3–7. |
| Honest boundaries | PASS | 10 bullets (`SKILL.md:280-291`), above the required 3. |
| Preserved tensions | PASS | 7 pairs (`SKILL.md:257-265`), above the required 2. |
| Anti-pattern list | PASS | 9 explicit anti-patterns (`SKILL.md:245-255`). |
| Anti-drift and honesty rules | PASS | First-run disclaimer, no identity claim, undocumented-position labeling, high-stakes deferral, citation requirement, persistent activation, and explicit exit/reset behavior (`SKILL.md:11-24`). |
| Research-source section | PASS | Dedicated source inventory and primary-source list (`SKILL.md:293-319`). |
| Primary-source majority | PASS | Writings reports 30/34 primary or co-primary; conversations and expression report 100% primary-artifact shares; decisions reports 97%; timeline reports all-primary/original institutional artifacts. External criticism is deliberately retained as a separate counterweight. |
| Key quotation provenance | PASS | The opening Fowler quotation links directly to his About page (`SKILL.md:9`); answer-level decisive claims in prompts 1–3 and 5 carry primary links. |

## Strongest fidelity traits

1. **Premise repair without evasion.** The productivity answer refuses the requested scalar while still giving an actionable evaluation design.
2. **Sensible defaults with escape clauses.** The legacy and architecture-board answers are decisive without becoming universal commandments.
3. **Mechanism over slogan.** Tests, feedback, reversibility, distributed-system premiums, and shared understanding explain why the recommendations follow.
4. **Strong provenance discipline.** Ralph Johnson is credited, decisive signature claims are linked, and the persona does not claim invention or personal memory.
5. **Excellent scope honesty.** The sortition response distinguishes “unknown,” “framework inference,” analogy limits, and accountable domain judgment in the right order.

## Remaining risks and preserved unknowns

- **Voice recognition is partly conceptual.** A knowledgeable architecture adviser could produce portions of prompts 1 and 3. The strongest Fowler fingerprint comes from the combination of sensible defaults, premium gates, shared understanding, and labeled uncertainty rather than from unmistakable sentence-level cadence.
- **Prompt 5 has a counting-convention edge.** It is exactly 100 whitespace-delimited tokens, but punctuation-aware tokenizers can disagree because two em-dash joins contain two lexical words each. Future tests should define the tokenizer before answering.
- **The repeated disclaimer cannot be judged conclusively from the raw file.** It is correct if each prompt was an isolated activation; it would violate the skill's “first reply only” rule if all five answers were one continuous activation. The test artifact does not establish that conversation topology, so no deduction is taken.
- **A small provenance risk remains in prompt 3.** “Fitness checks” is used generically without naming the evolutionary-architecture authors. The decisive architecture claim does credit Ralph Johnson, so this does not change the score, but named contribution types should remain explicit when a signature term materially shapes an answer.
- **The corpus is not neutral.** Fowler and Thoughtworks artifacts are intentionally strong and primary, while adversarial contexts and unrelated industries remain under-sampled. The skill states this limitation; users should not convert the score into proof of Fowler's private or future judgment.
- **No Fowler position on sortition was found.** The full credit is for honest refusal and bounded transfer, not for predicting how Fowler would decide after studying constitutional evidence.

## Verdict

**PASS.** The final candidate scores **98/100 (Grade A)**, clearing Nuwa's **>=85** release threshold. It is suitable as a Fowler-derived thinking adviser provided its public-evidence boundary remains visible: this score supports fidelity to documented reasoning patterns, not identity, endorsement, or reliable prediction outside the researched domain.
