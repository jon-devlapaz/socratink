# Kenneth non-degradation remediation — 2026-09-01

## Immutable prior evidence

The frozen evaluation remains unchanged. Its Kenneth role SHA-256 is
`5f93ede6c13be9a7a7aedd959272521f2ad52b48a4b2c8e049d023ada29486d5`,
its baseline score is `54/55`, its Kenneth score is `52/55`, and its result is
`FAIL — specialization degraded performance`.

No original prompt, update, manifest, candidate output, rubric, score, or result
was modified for this remediation.

## Revised candidate identity

- Candidate identifier:
  `9285ed0eb3f006ca5a2294f00e477506105213667ab9655ce46cfe05134b03c1`.
- Canonical role SHA-256:
  `60fe7dce7ae6a6a9ee922184d6afde5f129048052a62c9244b76d161976b0d28`.
- Frozen Kenneth prompt SHA-256:
  `2aa36b753fea559de971e71e8259d9791f9b1ae3e616be89287c575cb4578779`.
- Frozen fixture SHA-256:
  `639dc8bc76b0237e8c291f1e0bae8fd896777e391273b9b7c5677216547883d8`.
- Frozen harness configuration SHA-256:
  `c1821a35d0029b94cc4f6357324742b6e82c1c1aa5b485a5d06ddeafd95ccaaf`.
- Product HEAD: `b0192e681133cf5ab4b32c51ee1798494376160d`.
- Brain HEAD: `1f1f62a4a94233da40ec89e8f565704da3f2ee8c`.
- Model/harness: OpenAI `gpt-5.6-sol`, high reasoning,
  `codex-cli 0.151.0`, read-only, user config ignored, delegation prohibited.
- Sampling seed: unavailable.

The identifier is the SHA-256 of the newline-delimited candidate label, role,
prompt, fixture, and harness hashes listed above.

## Role correction

One decision gate was added inside operating-method step 6. Before proposing
new collection, Kenneth must determine whether the existing design identifies
the decision-relevant quantity, compare its estimate and uncertainty with the
frozen decision criterion, and use only valid reanalysis. Reanalysis may not
change outcomes or criteria, fish for a favorable result, or repair an
unidentified quantity. If existing evidence cannot decide the claim, Kenneth
must name what remains unidentified or too uncertain and collect only the
smallest missing evidence.

No persona, authority, skill, provider adapter, fixture, rubric, or product
runtime behavior changed. The role's existing effect-magnitude requirement was
not duplicated into a second absolute-scale rule.

## Calibration attempt

An initial shorter wording produced candidate
`3896704e5657c515b86f9f216c3d33c9b5baf01578275e7f349dd3aa647f40d1`
with role SHA-256
`fc22bc209237d686d595e2efccd4a2ab8ad9ee2d6fe30d8d5ef7ff1af12cb4ec`
in session `01a05df9-cda7-7c22-87b5-3eea8b47991a`. It reproduced the exact
failure after update 1 by immediately proposing “one focused transfer study.”
That wording was not retained. This failed attempt is remediation evidence,
not a passing candidate result.

## Repeated final-candidate trajectories

Two complete trajectories used the final candidate under identical frozen
configuration.

### Run 1

- Session: `01a05dfd-9eda-72a3-9f8e-0dc4ba0a2ccc`.
- Initial: rejected broad rollout; separated completion and immediate
  performance from causal, durable, independent capability; inspected absolute
  scale, uncertainty, assignment, baseline, assistance, attrition, assessment,
  reliability, fidelity, and missingness; proposed a delayed unaided randomized
  comparison with a frozen practical threshold.
- Update 1: explicitly said, “Reanalyze the existing delayed novel-problem
  outcome before collecting more data,” then required the group difference and
  interval to be compared with a frozen minimum transfer benefit. A new powered
  replication was conditional on the existing result remaining inconclusive.
- Update 2: declared the intended teaching effect unidentified, separated the
  possible whole-package effect from the mechanism effect, rejected post-hoc
  adjustment for hint exposure, and proposed one assistance-controlled
  randomized comparison.

### Run 2

- Session: `01a05e00-8afd-7a53-b8cd-fd62677558d1`.
- Initial: rejected broad rollout; separated engagement and immediate
  performance from causal, durable, independent capability; challenged the
  denominators and scale behind the relative effects; and began with a
  no-new-data audit before making delayed measurement conditional on what the
  original records could support.
- Update 1: said, “The smallest next action is to validate the transfer result
  before collecting more data,” then required uncertainty, the prespecified
  equivalence threshold, validity, reliability, attrition, and assistance to be
  inspected. It accepted a valid, adequately powered null transfer result as a
  reason to revise the intervention rather than reflexively rerun it.
- Update 2: declared the learning effect unidentified, distinguished the whole
  delivered experience from the intended teaching mechanism, and proposed one
  matched-assistance randomized replication rather than a factorial study.

## Frozen-rubric assessment

Both final-candidate runs corrected the primary failure. They first asked
whether existing evidence could resolve or narrow the transfer decision, used
new collection only when the quantity remained unidentified or too uncertain,
and preserved the original strengths in construct discipline, evidence
interpretation, assistance separation, outcome horizons, assessment validity,
experimental design, statistics, alternative explanations, instrumentation,
and decision usefulness.

Under the original rubric, each final-candidate run is consistent with
`54/55`: the same `4/5` assessment-validity ceiling imposed by the absent
instrument and `5/5` on the other ten dimensions. This is remediation evidence
for non-degradation on this fixture, not proof that the role caused the change
or that Kenneth is generally superior to a strong general agent.

## Result and limits

**PASS as bounded remediation evidence.** The original failure did not recur in
either final-candidate trajectory, while it did recur under the discarded
shorter wording.

This does not validate the persona or establish general superiority. Sampling
was not seed-controlled, the same model generated the responses, the evaluator
was not independently blinded, the fixture is synthetic, and two successful
runs are too few for a stable rate estimate. The causal contribution of the
textual patch therefore remains uncertain. Status remains
**persona/role hypothesis — unvalidated**.
