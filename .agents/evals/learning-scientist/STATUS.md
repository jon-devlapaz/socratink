# Kenneth v0 status

Kenneth v0 is a **frozen role hypothesis** at canonical role SHA-256
`60fe7dce7ae6a6a9ee922184d6afde5f129048052a62c9244b76d161976b0d28`.

## Current epistemic status

| Claim | Status |
| --- | --- |
| Role architecture | Stable |
| Persona | Stable |
| Original identified degradation | Remediated on the frozen failure fixture |
| Out-of-fixture behavior | Encouraging but not repository-frozen evidence |
| General specialist advantage | Unvalidated |
| Cross-model or provider generalization | Unvalidated |

Kenneth is not validated, superior to a strong general agent,
production-proven, or established as scientifically better than the baseline.
The role remains a provider-neutral execution option, not an automatic router
or authority to mutate Brain doctrine.

## Evidence ledger

- **ROLE — intended behavior:**
  [`../../roles/learning-scientist/ROLE.md`](../../roles/learning-scientist/ROLE.md).
- **FIXTURE — frozen challenge:**
  [`fixtures/assisted-performance-rollout-v0/FIXTURE.md`](fixtures/assisted-performance-rollout-v0/FIXTURE.md).
- **TRAJECTORIES — observed candidate behavior:**
  [`BASELINE.md`](fixtures/assisted-performance-rollout-v0/BASELINE.md) and
  [`KENNETH.md`](fixtures/assisted-performance-rollout-v0/KENNETH.md).
- **SCORE / RESULT — frozen evaluation:**
  [`RESULTS.md`](fixtures/assisted-performance-rollout-v0/RESULTS.md). The
  baseline scored `54/55`, the original Kenneth scored `52/55`, and the
  non-degradation gate **failed** because Kenneth proposed new collection before
  checking whether existing valid evidence could resolve the decision.
- **REMEDIATION — role change and reruns:**
  [`REMEDIATION.md`](fixtures/assisted-performance-rollout-v0/REMEDIATION.md).
  The single evidence-acquisition gate corrected the observed failure in two
  repeated runs without observed loss on the fixture's previously strong
  dimensions. Sampling was not seed-controlled and scoring was not independently
  blinded, so this is correction evidence rather than proof of causal prompt
  improvement or general superiority.
- **CURRENT STATUS — claim boundary:** this file.

The original fixture, role hash, manifest, prompts, trajectories, scores, and
failed result are immutable historical evidence. Remediation does not rewrite
the failure as a success.

## Generalization boundary

No repository-frozen fixture, trajectory, configuration, or result currently
formalizes the later “new evidence genuinely required” check. Its informal
behavior must not be treated as a controlled paired evaluation. Formalization
remains optional future work only if the exact input, output, configuration,
and decision boundary can be preserved without reconstructing them from
conversation history.

## Freeze rule

Do not tune this role further without new discriminating failure evidence. A
future role change requires:

```text
new failure evidence
→ identify mechanism
→ minimal role delta
→ rerun frozen failure
→ test for opposite or generalization failure
```
