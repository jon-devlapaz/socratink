# FM-TYPESAFE-01 — How to use TypeSafe System One / Jev for Socratink

**As-of:** 2026-09-15 (America/Chicago)  
**Task:** Research spike only. No PR. No multi-quarter roadmap.  
**Grounding:** pedagogical-v0.01 axioms + loops; product AI surface (OpenAI-compatible chat + Braintrust; no `@typesafe-ai/sdk` yet).

---

## Sources (dated)

| Source | URL | As-of |
| --- | --- | --- |
| Docs index | https://docs.typesafe.ai/llms.txt | Fetched **2026-09-15** |
| System One | https://docs.typesafe.ai/concepts/system-one.md | Fetched **2026-09-15** |
| How to build with System One | https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md | Fetched **2026-09-15** |
| Primitives | https://docs.typesafe.ai/primitives.md | Fetched **2026-09-15** |
| Use-case map | https://docs.typesafe.ai/concepts/use-case-map.md | Fetched **2026-09-15** |
| JS SDK quickstart | https://docs.typesafe.ai/sdk/javascript.md | Fetched **2026-09-15** |
| Shared skill | `/home/box/agent-data/workflows/typesafe-ai/SKILL.md` | Read **2026-09-15** |
| Seed | `/workspace/socratink/FM-TYPESAFE-01-seed.md` | **2026-09-15** |
| Pedagogical package | `/workspace/socratink/pedagogical-v0.01/{AGENTS,ROUTER}.md` (+ prior FM-EVALS knowledge of phases) | **2026-09-15** |
| Product AI touchpoints | `product/socratink` `provider.ts`, `package.json` (`braintrust`, no typesafe sdk) | Read on captain machine **2026-09-15** |

---

## 1. What Jev / System One is (and is not)

### Is (plain product terms)

**System One** models make **fast, structured decisions** for software: they take a **state** + typed **questions** and return **typed answers + probabilities** your code can `if`/threshold/compose ([system-one.md](https://docs.typesafe.ai/concepts/system-one.md), 2026-09-15).

**Jev** is TypeSafe’s flagship / first System One model (`jev-latest` default in SDKs). It understands natural language but is trained for **calibrated decisions**, not chat ([system-one.md](https://docs.typesafe.ai/concepts/system-one.md)).

Three primitives ([primitives.md](https://docs.typesafe.ai/primitives.md)):

| Primitive | Returns | Use when |
| --- | --- | --- |
| **Choice** | selected option + distribution + confidence | one of a closed set |
| **Score** | position on ordered descriptive levels + distribution + confidence | degree / severity / relevance spectrum |
| **Noul** | P(yes) in [0,1] (no separate confidence field) | single yes/no presence |

Design rule from TypeSafe: **code owns the workflow**; insert System One only where semantic judgment is needed; keep deterministic rules in code; ask many narrow parallel questions; escalate on uncertainty ([how-to-build](https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md)).

Docs claim ~100 ms class latency and parallel batching of questions over one state — suitable for request paths when validated ([how-to-build](https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md)). Treat cookbook latency/cost numbers as examples to measure, not guarantees.

### Is not

- Not a tutoring LLM: **does not write learner-facing explanations, cold prompts, or reasoning narratives** ([system-one.md](https://docs.typesafe.ai/concepts/system-one.md)).
- Not an agent loop that chooses its own next action ([how-to-build](https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md)).
- Not a replacement for SM-2 math, DAG topology, or schema validation (those stay Tier-1 deterministic per `AGENTS.md`).
- Not a vanity “mastery %” engine — but **you can misuse Score that way**; Socratink code must refuse flattering percent UX (axiom 5).

### Lane vs AGENTS.md Tier1 / Tier2

| Lane | Role for Socratink |
| --- | --- |
| **Tier1** | Deterministic: SM-2, fringe topology, schema, fixture gates |
| **Tier2** | Frontier generation + deep open-ended pedagogical prose when needed (cold prompt authoring, rich gap narratives if still LLM) |
| **Jev (third lane)** | **Typed semantic judgments** with probabilities: presence of misconceptions, component held?, HELD vs GAP decision gate, grounding/citation checks, optional model-routing — **not** free-text tutoring |

**Inference:** Jev complements Tier1/Tier2; it does not compete with either for their core jobs.

---

## 2. Fit map vs outer / inner phases

| Phase | Fit | Why (one line) | Axiom watch |
| --- | --- | --- | --- |
| **01 Source ingestion** | **Partial** | Good for *selecting/classifying* among extracted candidates or “is topic grounded in block?”; poor as sole free-form mechanism author | Invented topics if Choice options omit coverage |
| **02 Contract negotiation** | **Partial** | Can help classify evidence requirement type / bloom-ish labels; contract synthesis still generative/Tier2 + human edit | Do not auto-write contract prose via Jev |
| **03 Prerequisite routing** | **Poor → Partial** | Spec requires **deterministic** fringe; Jev must not replace graph sort. Optional: Noul “is remediation still warranted?” after evidence | Breaking determinism violates router invariants |
| **04 State mutation** | **Fit (gates)** | Noul/Choice to *confirm* mutation eligibility (unaided? gaps empty?) — **code** still applies transitions | Assisted→HELD is the core hazard |
| **05 Durability / SM-2** | **Poor** | Interval math is deterministic; only Partial if judging “was retest truly cold?” from session metadata | Same-session durability |
| **06 Cold prompting** | **Poor** | Needs **generation** of mechanistic prompts; Jev doesn’t generate. Optional: Noul lint “is this prompt MCQ-shaped?” | Prompt leakage of benchmark |
| **07 Evidence capture** | **Partial** | Noul on paste/hint signals if metadata incomplete; provenance fields themselves are code | Do not invent assistanceLevel |
| **08 Gap inspection** | **Fit (strong)** | Atomic Nouls per critical causal component + Choice HELD/GAP + grounding checks; confidence → escalate Tier2 | Vanity %; soft HELD; ungrounded gaps |
| **09 Benchmark reveal** | **Partial** | Can score honesty of framing / next-step specificity; UI copy still app code / Tier2 | Flattering reveal language |

**Closest TypeSafe patterns for Socratink:** Universal verification / citation checks, composite scoring, confidence-gated routing, intent/model routing ([use-case-map](https://docs.typesafe.ai/concepts/use-case-map.md), cookbooks `citation_check`, `consistency_noul`, `classifying_rag_passages`).

---

## 3. Primitive mapping (prototype-ready sketches)

Shared **state** sketch for Phase 08:

```json
{
  "objective": { "id": "obj-selection-bias", "name": "Explain Selection Bias Mechanism" },
  "referenceMechanism": "…authoritative causal text…",
  "attempt": {
    "rawText": "…learner words…",
    "assistanceLevel": "UNAIDED",
    "durationSeconds": 420
  },
  "criticalComponents": [
    { "id": "nonrandom-selection", "mustArticulate": "participant selection is non-random" },
    { "id": "bias-vs-variance", "mustArticulate": "sample size cannot fix systematic bias" }
  ]
}
```

| Candidate ID | Primitive | Instructions (intent) | Criteria sketch |
| --- | --- | --- | --- |
| `component_held_nonrandom` | **Noul** | Does `attempt.rawText` demonstrate `criticalComponents[0].mustArticulate` given `referenceMechanism`? | true: articulates non-random selection; false: omits or contradicts |
| `component_held_bias_vs_variance` | **Noul** | Same for sample-size vs systematic bias | true/false as above |
| `misconception_lln_fixes_bias` | **Noul** | Does the attempt claim larger N removes selection bias? | true: LLN/sample-size “smooths bias”; false: no such claim |
| `alignment_decision` | **Choice** | Given held components vs gaps, which decision? | `HELD` / `GAP_IDENTIFIED` (contrastive what/not_for/examples) |
| `grounded_in_reference` | **Noul** | Are gap/held claims supportable from `referenceMechanism` only? | true: grounded; false: extraneous requirements |
| `unaided_eligible` | **Noul** | Is `attempt.assistanceLevel` compatible with cold HELD promotion? | true: `UNAIDED` (or stuck-disclosed policy); false: hint/notes |
| `fringe_pick` *(optional, not for 03 core)* | **Choice** | Among listed fringe objective IDs, which is pedagogically urgent? | options = fringe IDs + `none` — **advisory only**; code must still obey DAG |

**Composition in code (axiom-safe):**

- Promote toward `HELD` only if `unaided_eligible` high **and** all critical `component_held_*` high **and** `alignment_decision == HELD` **and** no critical misconception Nouls high.
- Else `GAP_IDENTIFIED`; never emit a percent mastery Score to the learner UI.
- If `alignment_decision.confidence` low → escalate to Tier2 LLM structured eval or human (confidence-gated routing).

---

## 4. SDK / integration sketch (high level)

**Stack today:** Node ≥22, Hono server, OpenAI-completions chat via `@earendil-works/pi-ai`, **Braintrust** project `socratink` (`package.json` / `provider.ts`, 2026-09-15).

**Add (when authorized):**

```sh
pnpm add @typesafe-ai/sdk
# TYPESAFE_API_KEY server-side only (env); never client bundle
```

```ts
import { TypeSafeClient, choice, noul, score } from "@typesafe-ai/sdk";

const client = new TypeSafeClient(); // reads TYPESAFE_API_KEY
const result = await client.systemOne({
  state: { /* Phase 08 state */ },
  questions: {
    /* noul(...) / choice(...) */
  },
});
// compose result.answers.* in mutation code
```

([javascript.md](https://docs.typesafe.ai/sdk/javascript.md), 2026-09-15)

**Braintrust coexistence:** Keep Braintrust for LLM chat/trace eval of Tier2 generation. Log Jev requests/answers as structured spans (question IDs, noul/choice/confidence, thresholds) — do not treat Braintrust scores as learner mastery. **Assumption:** no `@typesafe-ai/sdk` ↔ Braintrust first-party bridge required for a spike.

**Where to call:** server modules beside future Phase 08/04 services — **not** inside the learner chat agent that generates tutoring prose.

---

## 5. First 3 judgments to try (if Captain authorizes a tiny spike)

1. **`component_held_bias_vs_variance` (Noul) — Phase 08**  
   Why: Fixture already encodes the classic LLN misconception; single yes/no is the smallest axiom-aligned judgment.

2. **`alignment_decision` (Choice: HELD | GAP_IDENTIFIED) — Phase 08**  
   Why: Binary boundary required by spec; confidence gate → Tier2 when uncertain (anti soft-HELD).

3. **`unaided_eligible` (Noul) — Phase 04 gate**  
   Why: Encodes axioms 1 & 3 before any state mutation toward HELD.

*(Do not start with Score “mastery” levels — too easy to violate axiom 5 in UX.)*

---

## 6. Open questions for Captain

1. Should Phase 08 **replace** Tier2 free-text diagnostics with Jev+code composition, or **gate** Tier2 with Jev first?
2. What is the policy for `STUCK_DISCLOSED` — eligible for partial credit path or never HELD?
3. Calibration: who labels gold held/gap on Socratink domain items before trusting thresholds?
4. Is advisory Jev ranking of fringe nodes allowed, or is 03 strictly graph-only forever?
5. Product chat agent vs pedagogical engine: keep Jev out of `src/agents/chat.ts` entirely?

---

## Outcome summary

Jev is a **third lane**: programmable Choice/Noul/Score judgments with probabilities — excellent for **Phase 08/04 semantic gates**, poor for prompt generation and SM-2/DAG. First spike: three judgments above. Code retains axioms; never ship vanity % Scores to learners.
