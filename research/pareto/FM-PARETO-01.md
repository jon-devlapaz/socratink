# FM-PARETO-01 — Product Pareto scout (no deletes)

**As of:** 2026-09-16 ~00:40 CDT (Jondev.local)  
**Mode:** READ + SYNTHESIZE only. No deletes. No Brain Canon/Constitution mutations. No product `src/` edits.  
**Ask:** Prune Socratink *product* noise that is not needed for the long-horizon goal; name the Pareto knee (~20% that drives ~80% of long-horizon value).

---

## Question

Against Brain’s long-horizon goal, which product surfaces are **CORE**, which are **SUPPORTING**, which are **EXPERIMENT**, and which are **NOISE / FREEZE / DEFER** — so Captain can cut context and scope without killing the Learner Agent wedge?

---

## Long-horizon goal (Brain = epistemic truth)

**Sources (orient + context, Brain head `bbc5ad0`):** `NORTH-STAR.md`, `CONSTITUTION.md`, accepted Canon `DEC-0001`, `DEC-0005`, `DEC-0007`, `CAP-0001`; Views: Learner Agent Contract, Evaluation Architecture; candidate `BET-0001`, `EXP-0001`, `CAP-0002`.

**North-star (verbatim intent):** Socratink helps a learner become **durably more capable**, and earns claims from **evidence of the learner’s own work**. Outcome optimized: **independently demonstrated durable capability** (DEC-0007 / OUT-0003).

**Product thesis (NORTH-STAR):** Become a **persistent Learner Agent** that (1) understands goal/target, (2) elicits evidence-bearing work, (3) preserves artifacts + conditions, (4) forms bounded learner-state hypotheses, (5) chooses eligible intervention, (6) helps without replacing generative thinking (DEC-0001), (7) obtains new learner work, (8) verifies later, (9) carries continuity across model/UI changes (DEC-0005 / CAP-0001).

**Core loop (NORTH-STAR):** Learning Target → Evidence Contract → learner-authored work → evidence+conditions → Learner Model → Learning Policy → Teaching Skill → new work → bounded update → delayed/transfer verification ↺.

**Constitution invariants that bound the product:** learner-authored work is first-class evidence; assistance/reveal provenance must survive; exposure ≠ learning; do not manufacture mastery; continuity > any particular model/persona/runtime.

**Jurisdiction reminder:** Brain constrains semantics; **codebase** is executable truth. This scout does **not** claim the live app already implements the full Learner Agent.

---

## Executable truth (product today) — inventory snapshot

| Surface | What exists | Size / notes |
| --- | --- | --- |
| Mounted API | `GET /healthz`, `POST /api/agents/chat/*` only; static UI; `/login` → demo login | `src/app.ts` |
| Agent | Single Flue agent `Chat` | `src/agents/chat.ts` (~147 LOC) |
| Tools | `present_question`, `mark_reveal`, `ink_express` | questionnaire / reveal / ink-cue |
| UI | Chat surface, turns, tool cards, questionnaire, dictation, steering, menu, living-ink / WebGL | `src/ui/**` ~36 files |
| Model | OpenAI-compatible Chat model + optional Vercel AI Gateway; route capture | `src/config/chat-model.ts`, `server/provider.ts` |
| Persistence | Flue sqlite (default) or postgres | `src/db.ts` |
| Auth | Demo localStorage gate — **not** real auth | `src/ui/auth/README.md` |
| Observability | Optional Braintrust spans | `CONTEXT.md`: not learning proof |
| Docs | `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `ZEN.md` | Product + agent contracts |
| Skills | ~25+ under `.agents/skills/` | **~23M+** dominated by impeccable / personas / common-skills / variate |
| Research | `research/` ~5.7M (4.5M already `_cold-archive`) | Agenteng warehouse still hot as md |
| Praxist | **No live `praxist_task/` tree**; referenced in AGENTS + postmortem learnings | Operator/experiment history |
| Deps | 12 runtime (Flue, Hono, Braintrust, pg, three/raymarcher, valibot) | Lean app graph |

**Gap (explicit):** Live product is a **focused Socratic Chat foundation** (PRODUCT.md / CONTEXT.md language: “Chat”, not “Learner Agent”). Longitudinal continuity, evidence-event substrate (CAP-0002 candidate), learning policy, delayed verification, and real auth are **not** the current executable core — they are the long-horizon build, not today’s delete targets.

---

## Classification vs long-horizon goal

### CORE (Pareto knee — keep building / always load for product work)

Ranked by leverage on NORTH-STAR loop + DEC-0001/0005/0007:

| Rank | Path / surface | Why CORE | Risk if cut |
| --- | --- | --- | --- |
| 1 | `src/agents/chat.ts` + Flue mount in `src/app.ts` | Only learner-facing teaching loop that exists | Product dies |
| 2 | `present_question` (+ `src/questionnaire.ts`, UI questionnaire/tool-card) | Forces boxed choices → structured learner evidence | Loses DEC-0001 evidence shape |
| 3 | `mark_reveal` / `src/reveal.ts` | Assistance/reveal provenance survival (Constitution) | Capability attribution rot |
| 4 | Chat transcript UI (`chat-surface`, `chat-turns`, `turn-view`, markdown) | Stage where learner-authored work appears | No product experience |
| 5 | Model stack (`chat-model`, `server/provider`, model-route) | Executable dialogue | No conversation |
| 6 | `PRODUCT.md` + `ZEN.md` + root `AGENTS.md` Brain/scope tripwires | Prevents scope thrash into fake Learner-Agent OS | Repeat Wayfinder-class expansion |
| 7 | `.agents/skills/socratink-brain` + sibling Brain repo | Epistemic authority for consequential changes | Doctrine drift |
| 8 | Proof gate `pnpm check` / `pnpm smoke` (+ focused contract tests) | Keeps foundation shippable while growing loop | Silent regressions |

*(Items 1–5 are the ~20% executable knee; 6–8 are the governance/proof knee.)*

### SUPPORTING (keep; load on demand)

| Surface | Role | Note |
| --- | --- | --- |
| Dictation / voice reactivity | PRODUCT positioning (“voice-first”) | Not required by NORTH-STAR loop text; brand+UX |
| Living ink / `.alive-core` | Experience rendering (Yohaku) | Separate from evidence authority (DEC-0004) |
| Demo auth / login | Soft gate for dogfood | Not CAP-0001 continuity |
| Braintrust / `src/braintrust.ts` | Dev observability | CONTEXT: not learning proof |
| Flue DB (sqlite/postgres) | Conversation persistence substrate | Necessary plumbing; not yet evidence-event product |
| `DESIGN.md` | Operate-mode visual system | Load when UI work |
| `.agents/skills/flue-wiki` | Harness truth | Load when changing Flue agents |
| `.agents/learnings/*` | Operator postmortems | Load before Praxist / failed loops |
| `catch-brain-to-product` | Mode E sync | Load when tandem mismatch |

### EXPERIMENT (freeze scope; do not expand without Captain)

| Surface | Why | Risk |
| --- | --- | --- |
| Praxist campaigns / operator frontier | Explicitly non-product wins (`working-loop`); postmortem 2026-08-30 | Burns quota; fake progress |
| `EXP-0001` R1 evidence-bearing loop (Canon **candidate**) | Right experiment class — not yet product surface | Premature productization |
| Variate / triangulate / persona skillsets | Agent creative tooling | Context bloat if always-on |
| Extra WebGL paths (`organic-sphere`, `icon-cloud`, heavy cursor) | Beyond living-ink brand core | Perf/complexity without loop gain |
| Real auth / multi-route product surfaces | Not mounted today | Scope tripwire in AGENTS |

### NOISE (agent-context / tree pollution — freeze or cold-archive candidates; **propose only**)

| Surface | Why NOISE vs long-horizon | Risk if deleted blindly |
| --- | --- | --- |
| `research/_cold-archive/DOCPRUNE-01/` (~4.5M) | Already cold; still inside product repo | Low if stay cold + never preload |
| `research/chat-signal/agenteng-runs/*.md` (~45 files) | Harness archaeology warehouse | Medium — recoverable research |
| Mega skill packs: `impeccable` (~14M), `personas-skillset`, `common-skills-skillset`, `variate` | Not runtime product; dominate `.agents/skills` | Medium — agents may call by name |
| Empty `doc-vault/` after DOCPRUNE | Residual product-facing wiki slot | Low |
| `.venv` (~313M), `.cache` (~22M) | Toolchain artifacts | Do not commit; ignore |
| Duplicate editor shims `.claude` / `.codex` / `.cursor` stubs | AGENTS forbids doctrine duplication | Low |
| Research scouts that look “product” (`FM-AGENTENG-*`, chat-signal masters) | Process truth, not learner product | Low if AGENTS load-on-demand holds |

### UNKNOWN (needs Captain / implementation check)

| Item | Uncertainty |
| --- | --- |
| How much of Flue conversation state already counts toward CAP-0001 | Need product+Brain catch; do not invent |
| Whether voice dictation is wedge-critical for ICP | PRODUCT says yes; NORTH-STAR loop text does not |
| `CAP-0002` evidence-event substrate vs current reveal/questionnaire events | Candidate Canon — map before building |
| Steering UI / chat-auto model picker | Convenience vs evidence conditions |

---

## Explicit Pareto knee

**Keep saturating (80% of long-horizon value):**

1. Deepen **Chat** as the only teaching skill surface: stronger refusal-to-autocomplete, better `present_question` discipline, intact reveal provenance.  
2. Preserve **learner-authored turns** as the evidence object (no parallel “evidence product” UI).  
3. Keep **Brain + AGENTS scope tripwires** so agents do not rebuild Learner-Agent OS beside Chat.  
4. Grow toward CAP-0001/EXP-0001 **inside** Chat continuity — not new route families — when Captain opens that bet.  
5. Maintain **narrow proof** (`check`/`smoke`) so the foundation stays trustworthy.

**Cut / freeze / defer (the long tail):**

| Card | Class | Action | Risk |
| --- | --- | --- | --- |
| Praxist / operator campaigns as “product progress” | FREEZE | Do not launch for product motion; read learnings if ever resumed | Low–med (process) |
| Always-on mega skillsets in agent context | NOISE | Load-on-demand only; consider Tink trim later | Low |
| `agenteng-runs` + research warehouses in product prompts | NOISE | Already gated by chat-signal AGENTS; keep out of default context | Low |
| New modes/routes/schemas/eval frameworks | DEFER | AGENTS scope tripwire; Captain must ask | High if ignored |
| Full Learner Model + Learning Policy + delayed verification productization | DEFER | Canon goal; not today’s delete; build when EXP/BET accept | High if faked early |
| Extra WebGL / non-ink effects expansion | FREEZE | Polish after loop strength | Low |
| Demo→real auth platformization | DEFER | Needed eventually for continuity claims; not knee today | Med |

---

## What NOT to touch (this scout)

- Brain **CONSTITUTION / NORTH-STAR / GOVERNANCE / Canon** content  
- Product `src/agents/chat.ts`, questionnaire/reveal/ink tools, chat UI transcript path, model provider — without an explicit product outcome  
- Flue `@flue/*` published packages / attribution  
- Live secrets (`.env*`)  
- Sibling Brain repo structure beyond read  
- Executing deletes from the NOISE table without a follow-on Captain B-style EXECUTE ticket  

---

## Proposed load-on-demand (thin)

Added: `research/pareto/AGENTS.md` (this folder).  
Root `AGENTS.md` already points at Brain + learnings; **no root rewrite** in this scout (avoid dirty-tree thrash). Chat-signal AGENTS already bans warehouse preload (FM-DOCPRUNE-01).

---

## Assumptions

- “Product noise” includes agent-facing skills/research that inflate context while sitting in the product repo — not only `src/`.  
- Pareto is vs **long-horizon Learner Agent**, not vs “make the demo prettier.”  
- Implementation claims about missing CAP-0001/0002 features are from inventory + CONTEXT/PRODUCT language, not a full runtime audit of Flue state contents.

## Open questions

- Captain priority: strengthen Chat evidence loop **or** start CAP-0001 continuity persistence next?  
- Should mega skillsets move out of the product repo into a home Tink library?  
- Is living-ink CORE brand (keep) or SUPPORTING (freeze further WebGL)?

## What could not be checked

- Full Flue conversation DB schema contents / whether artifacts already store reveal provenance durably.  
- Production Vercel config beyond `vercel.json` presence.  
- Whether any Praxist tree exists outside this checkout.

---

## Top 5 CORE (headline)

1. `Chat` agent + `/api/agents/chat` mount  
2. `present_question` (+ questionnaire UI)  
3. `mark_reveal` provenance  
4. Chat transcript UI surface  
5. Model provider / route stack  

## Top 5 NOISE (headline)

1. Mega always-on skill packs (`impeccable`, personas, common-skills, variate) as default context  
2. `research/chat-signal/agenteng-runs/` markdown warehouse  
3. `research/_cold-archive/` (keep cold; never preload)  
4. Praxist-as-product-progress (freeze)  
5. Extra WebGL / non-ink effect expansion beyond living-ink  

---

*Researchy · FM-PARETO-01 · scout only*
