---
name: socratink-brain
description: >
  Safely interfaces agents with Socratink Brain: locates the Brain, retrieves
  task-scoped Canon and derived context, traces provenance, recognizes
  uncertainty and conflict, proposes epistemic changes under Governance, and
  validates the repository. Use for Socratink product implementation,
  learning/evidence work, research reconciliation, founder/product reasoning,
  provenance inspection, or conversation/history archaeology.
version: 2.0.0
---

# Socratink Brain Interface

Use this skill to read or propose changes to Socratink's durable epistemic state.
It is an interface to the Brain, not an alternate Brain specification.

> Read by authority, write by permission, and never strengthen a claim beyond its evidence.

Default authority is **read + propose**. Read the live Brain documents for their
current meaning rather than reconstructing doctrine from this skill.

## Jurisdiction

```text
Brain       epistemic truth
codebase    executable/current implementation truth
Praxist     experimental execution truth
harness     process/orchestration truth
```

Never use Brain to infer current implementation, current experiment execution,
or current project state. Inspect the application repository, Praxist, or the
harness respectively.

Brain epistemic authority is:

```text
CONSTITUTION → NORTH-STAR → Canon
```

`GOVERNANCE.md` defines how authority is read, reconciled, and mutated; it is not
another epistemic authority. Sources provide provenance, Views are derived
synthesis, `OPEN QUESTIONS.md` records unresolved uncertainty,
`60 Ledger/Conflicts.md` records known unresolved contradictions, Templates are
authoring references, and Archive is historical preservation without current
authority by itself.

## Locate and orient

Run from the Socratink application repository:

```bash
python .agents/skills/socratink-brain/scripts/brain.py orient
python .agents/skills/socratink-brain/scripts/brain.py context "<task>"
python .agents/skills/socratink-brain/scripts/brain.py show <ID>
```

The helper resolves the Brain from an explicit `--brain` path, local
`SOCRATINK_BRAIN_PATH`, a qualifying current directory, then a nearby checkout
named `socratink-brain`. A root must contain Constitution, North Star, and Governance.

Do not commit a machine-specific path. Search ranking is discovery only; it does
not determine truth or authority.

## Read the smallest useful context

1. Use `README.md` and `00 HOME.md` for orientation/navigation when needed.
2. Read `CONSTITUTION.md`.
3. Read `NORTH-STAR.md`.
4. Read `GOVERNANCE.md` when reconciliation or mutation is possible.
5. Read the smallest relevant surviving View.
6. Follow links or stable IDs into the smallest relevant Canon set.
7. Check `OPEN QUESTIONS.md` and `60 Ledger/Conflicts.md` when the topic touches
   unresolved boundaries.
8. Open Sources when provenance or evidence is material.
9. Open Archive only for explicitly historical rationale or provenance.

Do not ingest the whole Brain. Distinguish accepted doctrine, candidate
hypothesis, historical rationale, unresolved uncertainty, and your own inference.

For implementation work, orient to Brain, retrieve relevant Canon and derived
context, independently inspect the application repository, fill the Brain
Contract, then implement against both epistemic constraints and observed code.

## Brain Contract

Before consequential product, learning, evidence, or experiment work, fill:

```text
North-star fit:
Canon relied on:
Derived context used:
Open question / conflict:
Evidence / provenance needed:
Codebase facts that must be verified externally:
Claims this work must NOT make:
Brain mutation proposed:
```

`Brain belief ≠ current code reality`. Implementation proof also does not
automatically mutate Brain.

## Reconcile or mutate

Before proposing a Brain change, read `GOVERNANCE.md` and the relevant file in
`80 Templates/`. Preserve stable IDs, source meaning, contradictions, negative
evidence, uncertainty, and consequential non-claims.

Use the reconciliation vocabulary from Governance: `new`, `reinforces`,
`refines`, `contradicts`, `supersedes`, or `historical-only`. Do not silently
resolve contradictions or treat ingestion as promotion.

Preserve the provenance path without overclaiming:

```text
SRC → EVT when experiential → candidate evidence/claim → decision
```

For conversations, trajectories, logs, or trials, preserve the original source
and use an experiential `EVT-*` where appropriate. Research may derive directly
from a source. An AI summary is not source truth.

Validated knowledge may motivate a candidate Canon change and, with explicit
authority, a Decision, Claim, Policy, Capability, or another existing live type.
Do not invent object types or promote automatically.

### Live areas and permissions

| Area | Meaning and default |
|---|---|
| `10 Sources/` | Provenance; append or curate only when authorized. |
| `20 Canon/` | Read + propose; create or modify candidates only when authorized. |
| `40 Views/` | Derived synthesis; never independent doctrine. |
| `OPEN QUESTIONS.md` | Unresolved epistemic uncertainty. |
| `60 Ledger/Conflicts.md` | Genuine unresolved contradictions only. |
| `80 Templates/` | Authoring references, not doctrine. |
| `90 Archive/` | History; do not rewrite or treat as current authority. |
| `NORTH-STAR.md` | Founder authority. |
| `CONSTITUTION.md` | Founder authority. |

Changing accepted doctrine or an object's governing status requires explicit
governance authority. When authority is unclear, leave a proposal as `candidate`.

Live stable-ID prefixes include `SRC`, `EVT`, `CLM`, `MEC`, `EVD`, `LST`, `INT`,
`POL`, `CAP`, `OUT`, `BET`, `EXP`, and `DEC`. `PROC-*` IDs may appear in Archive
or provenance, but the live Procedure layer is retired: never create a new Brain
Procedure. Do not create a new prefix because a new noun appears.

Brain `EXP-*` objects preserve durable hypotheses and evidence contracts, not run
state. Praxist owns evaluator execution, budgets, runs, and execution artifacts:

```text
experiment hypothesis/contract ≠ experiment execution/result state
```

## Validate authorized writes

```bash
python .agents/skills/socratink-brain/scripts/brain.py validate
git -C <brain-root> diff --check
git -C <brain-root> status --short
git -C <brain-root> diff
```

The helper delegates to the Brain's validator; it does not recreate validation.
Show the proposed diff and never claim validation succeeded unless it ran.

## Examples

- **Implement product behavior:** read relevant Canon/View, inspect actual modules
  and tests, then implement consistently with both. Brain does not say what UI or
  API currently exists.
- **Work from `EXP-0001`:** treat it as a candidate epistemic contract; inspect the
  application and Praxist independently. Its body is not a live run report.
- **Reconcile research/history:** preserve provenance, compare under Governance,
  and default to a candidate or contested proposal. Record only genuine unresolved
  contradictions; do not follow archived workflows or append receipts.
- **Inspect a retired ID:** `show PROC-0001` must label it historical and
  non-authoritative.

## Closure report

```text
Brain context used:
Authority:
Epistemic conclusion / constraint:
Evidence / provenance:
Open uncertainty / conflicts:
External truth verified:
Brain mutation:
Validation:
```

Stop rather than improvising when authority is missing, accepted doctrine
materially conflicts, provenance is insufficient for a consequential claim, or
the requested mutation exceeds Governance.
