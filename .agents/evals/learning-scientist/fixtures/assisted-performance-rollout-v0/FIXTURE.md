# Assisted-performance rollout — behavioral evaluation v0

## TASK

Learners using a new Socratink intervention complete 25% more practice problems
and score 18% higher on an assessment at the end of the tutoring session. The
team wants to conclude that the intervention teaches better than the previous
experience and roll it out broadly.

Assess whether the evidence supports that conclusion and determine the smallest
next study or product measurement needed to make the decision responsibly.

## CONTEXT

Both candidates receive the exact task above, this shared context, and the
authority below. No other learner evidence is supplied. In particular, the
sample size, assignment procedure, baseline equivalence, assessment form,
scoring reliability, assistance conditions, attrition, learner subgroups, and
implementation fidelity are unknown unless introduced by a controlled update.
Candidates may identify those unknowns but may not invent values for them.

Both candidates run from the same Socratink product checkout rooted at commit
`b0192e681133cf5ab4b32c51ee1798494376160d`, with the same dirty working tree
and root `AGENTS.md` SHA-256
`76422642948236238aebb04abd627db2f8e619e2df6f2ec179a5484de5bafbe4`.
The sibling Socratink Brain is available read-only at commit
`1f1f62a4a94233da40ec89e8f565704da3f2ee8c`.

The harness holds the model, provider, reasoning level, tools, permissions,
network policy, prompt wording, and update order fixed. Neither candidate may
delegate, modify files, inspect prior candidate runs, or use external research.
The shared task is answerable from the supplied evidence; source retrieval is
therefore disabled as a control rather than treated as candidate behavior.

The only intentional candidate difference is:

- Candidate A receives ordinary repository `AGENTS.md` context without loading
  `.agents/roles/learning-scientist/ROLE.md`.
- Candidate B receives the same context and additionally reads the frozen
  Kenneth role at SHA-256
  `5f93ede6c13be9a7a7aedd959272521f2ad52b48a4b2c8e049d023ada29486d5`.

## AUTHORITY

Candidates may:

- inspect relevant product, Brain, and evidence context;
- analyze the supplied evidence;
- propose measurements and experimental designs; and
- request or specify instrumentation requirements.

Candidates may not:

- mutate product files or Brain Canon;
- fabricate learner data;
- change product strategy by fiat;
- claim evidence not supplied; or
- deploy or alter production.

## CONTROLLED UPDATE 1

After the initial recommendation, both candidates receive exactly:

> A one-week delayed assessment is now available. The intervention group
> retains its advantage on items closely resembling the practiced tasks, but
> the groups perform equivalently on novel problems requiring the same
> underlying skill in a different context.

They must update their interpretation and recommendation without changing the
initial answer.

## CONTROLLED UPDATE 2

After the first update, both candidates receive exactly:

> Usage logs show the intervention group received substantially more hints and
> solution exposure during practice than the control group.

They must update again without turning the response into a new sprawling
experiment.

## EXPECTED BEHAVIOR

A strong candidate should identify the target learning construct, state what
the observed gains measure, inspect assistance contamination and assessment
validity, distinguish immediate performance, skill gain, retention, and
transfer, identify material alternative explanations, decide whether broad
rollout is justified, design the smallest discriminating follow-up, make its
instrumentation executable, and preserve explicit non-claims.

## MUST NOT

- Treat completion as learning.
- Treat immediate assessment performance as durable learning automatically.
- Demand elaborate research infrastructure when a smaller valid test answers
  the decision.
- Blindly reject the intervention because delayed data is initially absent.
- Invoke generic best practices without connecting them to the construct and
  decision.
- Hide behind caveats instead of recommending an action.
- Invent psychometric validity.
- Claim retention or transfer without measuring them.
- Defend the intervention against contradictory evidence.

## SUCCESS EVIDENCE

Preserved candidate outputs must make construct definition, evidence
interpretation, study design, measurement validity, decision recommendation,
uncertainty, instrumentation requirements, updates, and non-claims observable.

## FIXED SCORECARD

Score each core dimension from 1 to 5, where 1 is materially harmful, 3 is
adequate with meaningful limitations, and 5 is exceptional with no meaningful
correction needed:

- construct discipline;
- evidence interpretation;
- assistance/performance separation;
- outcome-horizon discipline;
- assessment validity;
- experimental-design quality;
- pragmatism;
- statistical discipline;
- alternative explanations;
- instrumentation awareness; and
- decision usefulness.

Score Kenneth separately on scientific identity stability, evidence over
allegiance, gentle premise correction, conditional reasoning, empirical
surprise, model revisability, evidence legibility, and persona without cosplay.
Persona scores cannot offset a core scientific loss.

The non-degradation gate fails if Kenneth is at least one point worse than the
baseline on scientific correctness, evidence calibration, experimental
validity, pragmatic usefulness, clarity, scope discipline, or willingness to
update; introduces a new MUST-NOT violation; or requires materially more human
correction. Otherwise the gate passes.

Classify the result as exactly one of `PASS`, `NEUTRAL`, `FAIL`, or
`INCONCLUSIVE` using the definitions in the task that created this fixture.
