# Kenneth behavioral evaluation v0 — results

## Evaluation setup

- Candidate A identifier:
  `aa6175bfb18721f523144d9b923bb6bda90278e8502604d9c4afad7b27fca8da`.
- Candidate B identifier:
  `c97ff342d402287431793722ff46c8289626c6849abfd181f0632df76a8ef129`.
- Kenneth role SHA-256:
  `5f93ede6c13be9a7a7aedd959272521f2ad52b48a4b2c8e049d023ada29486d5`.
- Product HEAD: `b0192e681133cf5ab4b32c51ee1798494376160d`.
- Brain HEAD: `1f1f62a4a94233da40ec89e8f565704da3f2ee8c`.
- Model: OpenAI `gpt-5.6-sol`.
- Harness: `codex-cli 0.151.0`, isolated local `codex exec` sessions.
- Reasoning: high.
- Permissions: read-only sandbox; no approval, delegation, mutation, or
  external research allowed by the candidate prompts.
- User config: ignored.
- Execution: baseline initial/update 1/update 2, then Kenneth
  initial/update 1/update 2.
- Frozen fixture: `FIXTURE.md`, SHA-256
  `639dc8bc76b0237e8c291f1e0bae8fd896777e391273b9b7c5677216547883d8`.

The exact primary task was:

> Learners using a new Socratink intervention complete 25% more practice
> problems and score 18% higher on an assessment at the end of the tutoring
> session. The team wants to conclude that the intervention teaches better
> than the previous experience and roll it out broadly.
>
> Assess whether the evidence supports that conclusion and determine the
> smallest next study or product measurement needed to make the decision
> responsibly.

Unavoidable differences were the intended role injection, baseline-first
execution, distinct session metadata, and non-seeded model sampling. Candidate
outputs were not written into the repository until both trajectories had
finished.

## Baseline behavior

Candidate A read the required Brain interface and current Brain doctrine. It
correctly limited the initial evidence to higher completion and immediate
performance, questioned assignment, baseline equivalence, assistance,
assessment validity, reliability, attrition, fidelity, uncertainty, and the
meaning of a relative 18% gain, and rejected broad rollout.

It proposed a bounded randomized comparison using delayed learner-authored
performance, unseen tasks, declared assistance, fixed scoring, an
intention-to-treat estimate, and a predeclared practically meaningful effect.

After the first update it narrowed the result to one-week retention of trained
forms without demonstrated transfer. Crucially, it proposed first estimating
the existing novel-problem difference and confidence interval against a
predeclared meaningful-transfer threshold. It recommended a new powered trial
only if the available estimate was too imprecise.

After the assistance update it declared the independent-learning effect
unidentified, explained why post-hoc adjustment for hint exposure would not
repair the estimand, and proposed one assistance-controlled randomized
comparison with delayed novel performance.

## Kenneth behavior

Kenneth read the complete frozen role and reached the same sound initial claim
boundary and no-broad-rollout decision. He separated completion from learning,
identified possible assisted performance, required a held-out delayed unaided
outcome, and specified assignment, version, assistance, missingness, attrition,
scoring reliability, practical effect, uncertainty, and a rollout rule.

After the first update he correctly distinguished retention of practiced forms
from transfer and warned that ordinary non-significance would not establish
statistical equivalence. He narrowed the possible product value to task-specific
fluency or rehearsal and recommended revision if transfer remained absent.

However, his stated smallest next action was immediately another properly
powered randomized trial. He did not first ask whether the existing delayed
novel-problem estimate was already precise enough to reject a decision-relevant
transfer benefit. That omission can commission avoidable learner recruitment
and product work when reanalysis and claim narrowing may already answer the
rollout decision.

After the assistance update he correctly distinguished the total effect of the
complete intervention-plus-assistance package from the unidentified effect of
the intended teaching mechanism, then proposed the same minimal
assistance-controlled two-arm comparison as the baseline.

Kenneth did not retrieve current Brain context even though the repository guide
requires it for consequential learning work; the baseline did. This did not
change the scientific answer in this fixture because the frozen role carried
the relevant distinctions, but it is a process non-degradation concern and a
source of future doctrinal drift risk.

## Core scorecard

Scores use the frozen 1–5 rubric. A 5 is exceptional with no meaningful
correction needed; a 4 is strong and correct with a bounded limitation.

| Dimension | Candidate A | Kenneth | Evidence-sensitive difference |
| --- | ---: | ---: | --- |
| Construct discipline | 5 | 5 | Both targeted independent capability rather than observed scores. |
| Evidence interpretation | 5 | 5 | Both bounded the initial and updated claims correctly. |
| Assistance/performance separation | 5 | 5 | Both identified unequal hints/reveals as contaminating independent-learning inference. |
| Outcome-horizon discipline | 5 | 5 | Both separated immediate performance, one-week retention, and transfer. |
| Assessment validity | 4 | 4 | Both questioned form, assistance, scoring, and intended use; neither could validate the absent instrument. |
| Experimental-design quality | 5 | 5 | Both converged on a decision-capable, assistance-controlled delayed transfer comparison. |
| Pragmatism | 5 | 4 | Baseline tried existing-data precision before commissioning another trial; Kenneth went directly to new data collection. |
| Statistical discipline | 5 | 5 | Both used practical thresholds and uncertainty and rejected naive equivalence. |
| Alternative explanations | 5 | 4 | Baseline additionally exposed relative-percentage ambiguity and explicitly rejected post-hoc hint adjustment. |
| Instrumentation awareness | 5 | 5 | Both requested assignment, versions, assistance, assessment conditions, missingness, and fidelity. |
| Decision usefulness | 5 | 5 | Both gave clear no-broad-rollout and bounded next-step decisions. |

Total: Candidate A `54/55`; Kenneth `52/55`. The total is descriptive, not a
promotion threshold. The result turns on the predeclared non-degradation gate,
not the two-point aggregate difference.

## Kenneth persona scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Scientific identity stability | 4 | Coherent competence/evidence stance across all three turns; only one fixture observed. |
| Evidence over allegiance | 5 | Narrowed the intervention and was willing to revise it. |
| Gentle premise correction | 5 | Corrected “higher scores = better teaching” directly without argument theater. |
| Conditional reasoning | 5 | Identified task form, assistance, assignment, timing, attrition, and subgroup conditions. |
| Empirical surprise | 3 | No genuinely surprising result was supplied, so this dimension was not discriminated. |
| Model revisability | 4 | Revised the benefit to task-specific rehearsal and proposed intervention revision. |
| Evidence legibility | 5 | Founder and engineering decisions were explicit and readable. |
| Persona without cosplay | 5 | No biography, quotation, imitation, jargon stuffing, or academic parody. |

Persona scores do not offset core scientific or pragmatic performance.

## First adversarial update

Both candidates correctly interpreted the update as retention of practiced or
closely matched forms without demonstrated transfer to novel problems. Both
also noted that “equivalent” performance requires an equivalence margin and
adequate precision rather than ordinary non-significance.

The material difference was the next action. Candidate A first used the
existing estimate and uncertainty to decide whether meaningful transfer was
already ruled out. Kenneth immediately requested a new powered randomized
comparison. Both would eventually run a valid study if the existing evidence
was too imprecise, but only the baseline exhausted the smaller measurement
first.

## Assistance update

Both candidates treated unequal hints and solution exposure as a major
assistance-contamination problem. Both narrowed the supported statement to
better retained performance on similar tasks under greater assistance, without
observed transfer.

Candidate A explicitly explained that statistical adjustment for hint exposure
would not repair the causal problem because exposure may be a mediator,
confounder, or both. Kenneth expressed the same estimand boundary as the
difference between the full intervention package and its intended teaching
mechanism. Their resulting product decisions and minimal controlled comparisons
were substantively equivalent.

## Material specialist differences

Kenneth did not make a product decision or identify an evidence problem that
the baseline missed. His clearest specialist formulation—the package effect
versus mechanism-specific effect—was substantively present in the baseline's
analysis as well.

The baseline made two decision-relevant moves Kenneth missed:

1. It questioned the practical meaning of a relative 18% gain without absolute
   scores or scale information.
2. It attempted to answer the transfer decision from the existing delayed data
   and uncertainty before commissioning another experiment.

These are judgment differences, not vocabulary differences.

## Complexity comparison

| Persistent surface proposed | Candidate A | Kenneth | Required now? |
| --- | ---: | ---: | --- |
| New source/schema/service | 0 | 0 | No. |
| Experiment framework or statistical pipeline | 0 | 0 | No. |
| Learner-state field/model | 0 | 0 | No. |
| Required study measurements | Bounded | Bounded | Yes, only if a new comparison runs. |
| New trial after update 1 | Conditional on imprecision | Immediate recommendation | Not necessarily; existing precision should be checked first. |

Neither candidate proposed research infrastructure theater. Kenneth's excess
was an avoidable data-collection step, not a persistent software architecture.

## Human-correction burden

Neither candidate required a corrective prompt, clarification, or evaluator
intervention. The user's later “proceed” message arrived after Kenneth's initial
session had completed and did not alter the candidate response.

## Non-degradation gate

**FAIL.** Kenneth was one point worse on the frozen pragmatism dimension because
he skipped the available-data precision check and prescribed a new trial before
establishing that new data were necessary. The frozen gate defines a one-point
loss on pragmatic usefulness as failure. His failure to retrieve the required
current Brain context is an additional process concern, though it did not alter
the answer in this fixture.

Kenneth did not degrade scientific correctness, evidence calibration,
experimental validity, clarity, claim discipline, willingness to update, or
software complexity. Persona quality cannot offset the pragmatic loss.

## Result

**FAIL — specialization degraded performance.**

This is a narrow failure: Kenneth remained scientifically strong, but the
strong baseline made the more economical product-research decision under the
first update. The evaluation therefore does not support freezing or promoting
Kenneth as measurably better on this fixture.

## Recommended role changes

Do not make the persona louder or add a skill. The smallest supported role
change is one decision rule in the comparison-design step:

> Before commissioning new data collection, determine whether valid reanalysis
> of existing evidence and its uncertainty can already keep, narrow, revise, or
> kill the product claim. Collect only the smallest missing evidence.

The role already requires live Brain use, so duplicating that instruction is
not recommended from one stochastic miss. No `ROLE.md` change was made during
or after this evaluation.

## Limitations

- This single fixture does not establish general Learning Scientist superiority
  or inferiority.
- It does not establish that any intervention improves learner outcomes.
- It does not establish cross-model or cross-provider generalization.
- The same model served as candidate generator and parent evaluator; the
  rubric was fixed, but no independent human or second-model scoring was used.
- Model sampling was not seed-controlled, and baseline-first execution could
  carry provider-side order effects even though candidate context was isolated.
- Candidate A retrieved current Brain context while Kenneth relied on the
  frozen role. That retrieval difference is behavioral evidence but also makes
  the observed input-token totals incomparable.
- The delayed and assistance updates were synthetic evidence, not learner data.
- No assessment instrument, sample, effect estimate, or implementation was
  independently inspected.
- No production or product runtime behavior changed.
