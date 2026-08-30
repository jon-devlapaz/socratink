---
name: socratink-brain
description: >
  Interface safely with the Socratink Brain from the Socratink application repo:
  orient ontology to the live codebase, retrieve task-scoped canon, trace
  provenance, mine conversation/experiment histories into Learning Events,
  reconcile new evidence, and validate the vault. Use when implementing
  product/learning behavior, learner evidence, Teaching Skills, experiments,
  archaeology of transcripts, or any task that depends on Socratink doctrine
  rather than software-maintenance docs alone.
version: 1.1.0
---

# Socratink Brain Interface

Use this skill when a task depends on Socratink's product doctrine, learning science,
learner-agent architecture, current experiments, founder decisions, or historical
rationale.

The Brain is a **governed knowledge system**, not a folder of interchangeable notes.

## Core rule

> Read by authority, write by permission, and never strengthen a claim beyond its evidence.

The default mode is **read + propose**. Do not mutate governing doctrine merely because
a task would be easier if the doctrine changed.

## Coding-agent default

For product or learning work in the Socratink application repository:

1. Run `python .agents/skills/socratink-brain/scripts/brain.py orient`.
2. Read every existing `read_now` path from `brain_root`.
3. If `tandem` is `mismatch`, say so; do not assume `CURRENT STATE.md` describes this checkout. To catch Brain live-state to product HEAD, use `.agents/skills/catch-brain-to-product`.
4. Run `context "<task>"`, then `show` only the linked IDs required to decide.
5. Fill a Brain Contract before writing code.
6. Do not ingest the whole vault. Do not reconstruct doctrine from this repo's software docs.

Helper commands:

```bash
python .agents/skills/socratink-brain/scripts/brain.py orient
python .agents/skills/socratink-brain/scripts/brain.py context "learner evidence"
python .agents/skills/socratink-brain/scripts/brain.py show EVD-0004
python .agents/skills/socratink-brain/scripts/brain.py validate
```

The helper is lexical discovery only. It does not determine truth or authority.

## Find the Brain

Resolve `BRAIN_ROOT` in this order:

1. explicit path from the user/task;
2. `SOCRATINK_BRAIN_PATH` (local environment only; never commit a machine-specific path);
3. current directory if it contains `CONSTITUTION.md`, `NORTH-STAR.md`, and `CURRENT STATE.md`;
4. a nearby sibling checkout named `socratink-brain`, discovered from the working
   directory, this skill's location, or the Socratink git toplevel.

If the Brain cannot be located, report that clearly. Do not reconstruct doctrine from
memory or old app docs.

The bundled helper is optional:

```bash
python .agents/skills/socratink-brain/scripts/brain.py locate
```

Pass `--brain` with a local path when discovery is ambiguous. Do not commit that path.

## Authority stack

Always interpret the Brain in this order:

1. `CONSTITUTION.md` — invariants.
2. `NORTH-STAR.md` — slowly changing strategic direction.
3. `20 Canon/` — atomic current beliefs, policies, constructs, decisions, outcomes.
4. `CURRENT STATE.md` — what is actually implemented, validated, and active now.
5. `50 Active/` — current milestone, bets, experiments, risks, open questions.
6. `40 Views/` — derived synthesis for humans and agents.
7. `30 Procedures/` — safe operating/change/evaluation procedures.
8. `10 Sources/` — provenance and history; never current truth by default.
9. `90 Archive/` — superseded/rejected canonical material.

When two items conflict, the higher authority governs unless a later accepted canonical
decision explicitly supersedes it.

A polished historical document does not outrank current Canon.

## Default context algorithm

Do **not** ingest the whole vault.

For every task:

1. Read `CONSTITUTION.md`.
2. Read `NORTH-STAR.md`.
3. Read `CURRENT STATE.md`.
4. Identify the task's:
   - outcome;
   - authority;
   - constraints;
   - proof/acceptance boundary.
5. Read only relevant `50 Active/` notes.
6. Read the smallest relevant `40 Views/`.
7. Follow wikilinks/IDs into only the `20 Canon/` objects required to decide or implement.
8. Read the relevant `30 Procedures/`.
9. Open `10 Sources/` only when provenance, contradiction, rationale, or source validation
   is material to the task.

Use `orient` first, then `context` / `show` for the task-specific remainder.

## Canonical object vocabulary

| Prefix | Meaning |
|---|---|
| `SRC-` | source / provenance record |
| `EVT-` | learning event — archaeological capture of an experience before evidence or claims |
| `CLM-` | atomic empirical or conceptual claim |
| `MEC-` | causal/explanatory mechanism — why an effect may occur |
| `EVD-` | evidence definition or evidence rule |
| `LST-` | learner-state construct |
| `INT-` | pedagogical intervention / Teaching Skill |
| `POL-` | policy governing eligibility, sequencing, fading, or scheduling |
| `CAP-` | product/software capability |
| `OUT-` | outcome / success criterion |
| `BET-` | product, market, or business hypothesis worth investing in |
| `EXP-` | experiment |
| `DEC-` | accepted decision / governing principle |
| `PROC-` | repeatable operating/change procedure |

Do not invent a new type because a new noun appears. Prefer a property or link unless
the concept needs independent authority and lifecycle.

`EVT` is the only new type in this skill. It does **not** replace `SRC` or `EVD`.
Do not add further types for “pattern”, “lesson”, “insight”, or “memory”.

`EVT` is also not the product's learner-runtime evidence envelope (`EVD-0003`,
`CAP-0002`). Those preserve what a learner did in the app. `EVT` preserves what
happened in company archaeology (chats, trajectories, logs).

## Learning Event (`EVT`)

Purpose: capture a meaningful experience **before** it becomes evidence or a claim.

`EVT` is an archaeological bridge, not canonical truth. It preserves the context
behind later `EVD-*` / `CLM-*` objects. It does not license product behavior.

Suggested fields:

```text
id:
type: learning_event
status:
confidence:

source:
trigger:
context:

attempt:

feedback:

correction:

outcome:

candidate_observation:
candidate_evidence:
candidate_claims:

derived_from:
```

Constraints:

- `EVT` is not Canon. Do not place it in `20 Canon/`.
- `EVT` does not replace `EVD`. Candidate lessons inside an event are not evidence rules.
- `EVT` must keep provenance to at least one `SRC-*` via `source` / `derived_from`.
- An `accepted` EVT status means only that the event record is a faithful capture of
  what happened, not that its candidate lesson is true or governing.
- Keep `status` separate from `confidence`.
- AI-generated summaries of a transcript are not `EVT` truth; the original source
  artifact remains authoritative.

Lifecycle ownership:

| Stage | Owner |
|---|---|
| Preserve original artifact | `SRC-*` in `10 Sources/` |
| Capture what happened | `EVT-*` in `10 Sources/` (Learning Events), append-only |
| Define what observation counts | candidate `EVD-*` |
| State what may be true | candidate `CLM-*` |
| Govern what we do | `DEC-*` then `CAP-*` / `PROC-*` / `POL-*` after authorization |

## Derivation lineage

Every **newly generated** Brain object must support `derived_from:` listing the
immediate parent objects that justify it. Keep existing `sources:` / `SRC-*` links;
do not replace them.

Examples:

```text
Claim:
derived_from:
  - SRC-001
  - EVT-004
  - EVD-009

Decision:
derived_from:
  - CLM-002
  - EXP-003

Intervention:
derived_from:
  - DEC-004
  - MEC-001
```

Prevent unsupported jumps: conversation → opinion → Canon.

Valid archaeological chain:

```text
source
    →
learning event
    →
evidence
    →
claim
    →
decision
    →
intervention / procedure / policy / capability
```

This chain is required for knowledge mined from experience, transcripts, agent
trajectories, experiments, or development logs.

Research ingestion may still go `SRC → EVD/CLM` when no experiential event exists.
Do not invent an `EVT` to decorate a paper. Do not skip `EVT` when the input is a
conversation, trajectory, log, or trial.

Existing Canon is not retroactively invalid if `derived_from` is absent. New writes
must not omit it.

## Promotion into operational behavior

A validated pattern may become:

```text
Claim
    ↓
Decision
    ↓
Capability / Procedure / Policy
```

Use existing types. Do not create a new type unless independent authority and
lifecycle are required.

| Type | Promote when |
|---|---|
| `CAP-*` | the knowledge becomes a product/system capability |
| `PROC-*` | the knowledge becomes a repeatable operating behavior |
| `POL-*` | the knowledge governs eligibility, sequencing, permissions, or constraints |

Promotion is never automatic. `candidate` remains the default. Changing status to
`accepted` still requires the Canon-change authority in mode F.

## Truth boundaries

Never collapse these:

```text
source support
    ≠
learning event
    ≠
domain model
    ≠
learner evidence
    ≠
learner-state inference
    ≠
product claim
```

Also:

```text
EVT (what happened) ≠ EVD (what observation counts)
observation ≠ pattern
pattern ≠ claim
claim ≠ decision
AI summary ≠ source truth
```

Also preserve:

```text
AI output quality ≠ learning quality
assisted success ≠ independent capability
exposure ≠ learner evidence
immediate performance ≠ durable learning
engagement ≠ learning
```

For learning research:

- `CLM-*` = what evidence supports;
- `MEC-*` = why an effect might occur;
- `INT-*` = what Socratink does;
- `POL-*` = when/how the intervention is used;
- `OUT-*` = what learner change is measured.

Do not use `MEC` as a synonym for a named learning effect.

## Operating modes

### A. Orient

Use when the agent needs to understand Socratink before planning.

Output:

- current North Star;
- current implementation boundary;
- active milestone/experiment;
- relevant governing Canon;
- material uncertainty.

Do not propose architecture until orientation is complete.

### B. Answer / explain

Use the smallest context that supports the answer.

Distinguish:

- **accepted doctrine**;
- **candidate hypothesis**;
- **historical rationale**;
- **current implementation**;
- **your inference**.

If the answer depends on historical evidence, cite the relevant `SRC-*` or source path.

### C. Plan or implement product work

Before code, create an internal **Brain Contract**:

```text
North-star fit:
Current-state boundary:
Canon relied on:
Active bet/experiment:
Procedure:
Evidence/proof obligation:
Claims this work must NOT make:
```

A feature that conflicts with Canon is not an ordinary implementation task.

If the feature is intended to test a contrary hypothesis, keep the variance inside an
explicit `EXP-*` rather than silently rewriting Canon.

### D. Ingest / reconcile new knowledge

Follow `PROC-0001 Rolling knowledge consolidation`.

At minimum:

1. preserve provenance;
2. inventory the blob;
3. extract atomic candidate items;
4. compare each item with existing Canon;
5. classify it as:
   - new;
   - reinforces;
   - refines;
   - contradicts;
   - supersedes;
   - historical only;
6. before creating new canonical knowledge, ask:
   - Does an existing claim disagree?
   - Does this refine an existing object?
   - Does this supersede an older decision?
   - Is this merely a historical observation?
7. do not bulk-promote;
8. preserve conflicts and negative evidence;
9. never resolve contradictions by averaging;
10. update affected views only after Canon reconciliation;
11. append a consolidation receipt / ledger entry.

Do not skip Learning Events when the blob is experiential (conversation, trajectory,
transcript, experiment log, development log). Preserve `SRC` first, then `EVT`, then
candidate `EVD` / `CLM`.

### E. Maintain current execution state

Direct updates to `CURRENT STATE.md` or `50 Active/` are allowed only when:

- the task explicitly changes current implementation/experiment state;
- the change is supported by observable repo or experiment evidence;
- the update does not silently change North Star or Canon.

State what evidence changed the current-state view.

To pin CURRENT STATE to sibling `product/socratink` HEAD, follow
`.agents/skills/catch-brain-to-product` (inventory first; Brain writes only).

### F. Change Canon

Default: **propose, do not silently accept**.

A Canon mutation must:

1. name the object(s) affected;
2. show supporting evidence/source;
3. state whether the change creates, refines, contests, supersedes, or rejects;
4. preserve the old object's history;
5. state what the new object does **not** establish;
6. update affected links/views;
7. run validation;
8. show the diff.

Agents may create `candidate` objects when explicitly asked to curate the Brain.

Changing an item to `accepted`, `contested`, `superseded`, or `rejected` requires either:

- explicit user/founder authorization in the task; or
- a previously accepted governance procedure that clearly delegates that authority.

When uncertain, leave the proposal as `candidate`.

### G. Change `NORTH-STAR.md` or `CONSTITUTION.md`

These are founder-governed.

Do not edit them as part of normal feature work, research ingestion, refactoring, or
cleanup.

If evidence suggests a change:

1. explain the conflict;
2. propose the exact strategic diff;
3. identify downstream Canon/experiment implications;
4. wait for explicit authorization before applying it.

### H. Archaeology / Mining

Use when analyzing conversation histories, agent trajectories, experiments,
transcripts, or development logs.

This mode extracts experience. It does not mint Canon.

Workflow:

1. Preserve the original source artifact as `SRC-*`. Do not overwrite it with a summary.
2. Extract `EVT-*` Learning Events from the source.
3. Identify recurring patterns **across events**. A pattern is not yet a claim.
4. Generate candidate `EVD-*` objects from event observations that should count as evidence.
5. Generate candidate `CLM-*` objects from patterns that may be true.
6. Reconcile against existing Canon using the same classes as mode D.
7. Do not promote automatically.

Keep these layers distinct:

| Layer | Question | Object |
|---|---|---|
| Observation | What happened? | `EVT-*` (and the `SRC-*` it derives from) |
| Pattern | What repeats? | named in reconciliation notes / receipts; not a new type |
| Claim | What may be true? | candidate `CLM-*` |
| Decision | What should we do? | `DEC-*` only after Canon-change authority |

Proactive contradiction check before any canonical write:

- Does an existing claim disagree?
- Does this refine an existing object?
- Does this supersede an older decision?
- Is this merely a historical observation?

If a claim disagrees with accepted Canon, mark `contested` or leave the new item
`candidate` and record the conflict in `60 Ledger/`. Do not average the documents.
Do not treat an AI-generated summary as the source of truth.

## Write permissions

Use this matrix unless the user explicitly grants broader authority.

| Area | Default agent authority |
|---|---|
| `10 Sources/` | append provenance and `EVT-*` learning events; do not rewrite source meaning |
| `20 Canon/` | read; propose; create `candidate` only when asked |
| `30 Procedures/` | propose; update after a repeated/proven operating pattern |
| `40 Views/` | update derived synthesis when underlying authority is unchanged |
| `50 Active/` | update when current execution evidence changed |
| `60 Ledger/` | append reconciliation/change receipts |
| `90 Archive/` | do not move items here without explicit supersession/rejection |
| `CURRENT STATE.md` | update from current evidence |
| `NORTH-STAR.md` | founder approval required |
| `CONSTITUTION.md` | founder approval required |

## Canon write rules

When creating or modifying a canonical object:

- preserve a stable `id`;
- never reuse an old ID for a different idea;
- use allowed `status` values:
  - `candidate`
  - `accepted`
  - `contested`
  - `superseded`
  - `rejected`;
- keep `status` separate from `confidence`;
- include `derived_from` for newly generated objects;
- link to sources and related Canon where possible;
- keep one atomic governing idea per object;
- add boundary conditions where applicable;
- add a **What this does not establish** section for consequential claims;
- preserve supersession explicitly;
- prefer links over copied explanations.

Do not silently convert a source summary into an accepted claim.

## Learner-agent-specific invariants

When touching learner-state, evidence, policy, or Teaching Skills:

1. learner-authored work remains distinguishable from model-authored work;
2. assistance/reveal provenance survives evidence-bearing attempts;
3. Evidence Contracts define what observations license which inferences;
4. policy may select an intervention but may not rewrite evidence;
5. learner-state updates link back to licensing evidence;
6. UI language may not strengthen the inference;
7. delayed-verification obligations are not equivalent to completed verification;
8. model/provider/persona changes may not erase evidence semantics;
9. persisted learner-visible state must support correction/deletion as required by product doctrine.

Read `40 Views/Agent/Learner Agent Contract.md` before material changes to these surfaces.

## Research ingestion rules

For research claims:

- prefer primary research and systematic/meta-analytic evidence where available;
- preserve contradictory findings and boundary conditions;
- distinguish empirical effect from proposed mechanism;
- do not turn one study into a universal policy;
- do not infer product superiority from mechanism evidence;
- do not infer durable learning from immediate task performance;
- label time-sensitive market evidence separately from learning science.

## Experiments

An experiment may test a hypothesis that is not Canon.

It must not use the experiment itself as proof before results exist.

Before execution, freeze material acceptance criteria where feasible:

- target;
- evidence contract;
- evaluator/rubric;
- treatment/intervention;
- comparison/baseline when causal claims are intended;
- failure cases;
- kill/stop conditions;
- claims the experiment cannot establish.

After execution, preserve adverse/inconclusive evidence.

## Validation before completion

When writing to the Brain:

```bash
python scripts/validate_brain.py
```

Also inspect the diff:

```bash
git diff --check
git status --short
git diff
```

If the vault is a Git repo and the task authorizes commits, make one atomic commit whose
message describes the knowledge change.

Never claim validation succeeded unless it actually ran.

## Required response contract

When the Brain materially informs a task, end the work with a compact report:

```text
Brain context used:
Authority:
Decision / change:
Evidence:
Uncertainty / non-claims:
Validation:
```

For implementation tasks, also include:

```text
Canon affected:
Experiment affected:
Brain update needed after code proof:
```

## Stop conditions

Stop and surface the conflict instead of improvising when:

- `CONSTITUTION` and requested behavior conflict;
- `NORTH-STAR` and requested product direction conflict;
- two accepted canonical objects materially contradict each other;
- a task requires a learner claim unsupported by the Evidence Contract;
- current implementation cannot be established;
- source provenance is missing for a consequential research claim;
- a newly generated object lacks `derived_from` and would jump conversation → opinion → Canon;
- the requested Canon mutation exceeds delegated authority.

Do not resolve governance conflicts by averaging documents.

## Examples

### “Add voice learning”

Do not assume voice is canonical.

Read the current bet/experiment and determine whether voice improves observation,
intervention, verification, accessibility, continuity, or user value enough to justify
complexity. Treat it as a capability/experiment unless Canon says otherwise.

### “Mark this learner as mastered”

Do not create a universal mastery score by convenience.

Find the target's Evidence Contract and learner evidence. Produce only the bounded
state inference licensed by those conditions.

### “A new paper says retrieval is bad”

Do not rewrite retrieval policy from the abstract.

Add provenance, extract the atomic claim, inspect design/population/outcome/boundary
conditions, reconcile it against current retrieval claims, and mark conflict where
warranted.

### “Mine this chat history for lessons”

Do not promote a summary into Canon.

Preserve the transcript as `SRC-*`, extract `EVT-*` events, name repeating patterns
without a new type, emit candidate `EVD-*` / `CLM-*`, and reconcile. Stop at
`candidate` unless the task grants Canon-change authority.

### “Change the live Chat agent”

Read:

- `CONSTITUTION.md`
- `NORTH-STAR.md`
- `CURRENT STATE.md`
- `40 Views/Agent/Learner Agent Contract.md`
- relevant agent/change procedures

Implement only the smallest complete slice on the existing Chat surface. Do not add a parallel learner-evidence product.
