# Learning-loop ingest template — `.agents/learnings` ← N*/S* (T5.5)

- **As-of:** 2026-09-16 02:14 CT
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-5 · T5.5
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac sync skipped · **product `.agents/learnings` not written**
- **Companion JSON:** `learnings-ingest-template.json`
- **Audience:** Captain / Firstmate (paste decision later); Researchy keeps drafts under `agenteng-runs/`
- **Question:** How should `.agents/learnings/` ingest N*/S* — file shape, promote gates, Brain EVT dedup?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**

---

## 0. One-liner

S* with a costly, repeatable operator fail → dated learning with **stop rules** same day (**N003**/**H62**). N* stay in Loops/AGENTS/skills unless they are the **recovery twin** of that fail. Never duplicate Brain **EVT**/PROC as learnings prose; never promote learnings into Canon.

---

## 1. Product baseline (Verified)

| Fact | Source | Label |
| --- | --- | --- |
| Read matching `.agents/learnings/` before Praxist, multi-agent research, or repeating a failed operator loop | flue `AGENTS.md` L10–11, L232–233 | **V** |
| After costly negative campaign/operator path → dated postmortem under `.agents/learnings/` | `AGENTS.md` Working method #7 | **V** |
| Learnings are **not** product doctrine, **not** Brain Canon, **not** a substitute for `AGENTS.md`/`ZEN.md` | `.agents/learnings/README.md` | **V** |
| Naming today: `<kind>-YYYY-MM-DD-<short-slug>.md`; current kind = `postmortem`; one lesson per file; YAML frontmatter | README | **V** |
| Existing exemplar: `postmortem-2026-08-30-praxist-protocol-reliability.md` (stop rules first) | flue learnings | **V** |
| Negative-result Scout → write dated learnings **same day** with stop rules | **N003** · canonical-extract-index | **V** |
| Recovery note shape: Requested / Substituted / Evidence / Stop rule / Regression | **H62** | **V**/I |
| Full N*/S* catalogs → skill/learnings, **not** root AGENTS dump | agents-paste-diff §Recommend #6 | **V** |
| EVT-0001 / SRC-0010 / PROC-0002 encode scope-sub (dogfood→product); AGENTS already carries dogfood→proof | **S001**/**N004** · loops | **V** |

---

## 2. File naming

```text
<kind>-YYYY-MM-DD-<short-slug>.md
```

| Kind (proposed) | When | Promote from | Label |
| --- | --- | --- | --- |
| **`postmortem`** | Costly negative campaign or operator path; next agent would repeat | **S*** (primary) + paired **N*** as remedy | **V** (existing) |
| **`smell-stop`** *(optional, research)* | Thin stop-card when full postmortem is overkill but tripwire must be durable | High-P0 **S*** only (e.g. S030) | **A** — captain may keep only `postmortem` |
| **`habit-note`** *(optional, research)* | Recovery-shaped **N*** that encodes “write learning / refuse / replate” — not ordinary happy habits | **N003**, **N010**-as-boot-refuse twin of S010 only | **A** — prefer Loops/AGENTS paste for most N* |

**Slug rules:** kebab-case; ≤6 words; encode fail class not session hash (`tool-thrash-no-gate`, not `b23609bb`). Canon IDs live in frontmatter, not the filename.

**Research draft path only (this tranche):** stubs stay under `agenteng-runs/examples/` conceptually inside this file — **do not** write into product `.agents/learnings/`.

---

## 3. Frontmatter template

```yaml
---
kind: postmortem          # or smell-stop | habit-note (proposed)
date: YYYY-MM-DD
slug: short-kebab-slug
read_when:                # glob/match tokens agents use before similar work
  - <trigger_1>
  - <trigger_2>
status: open | closed     # open = residual still live; closed = stop rule settled
result: negative_operator | negative_search | near_miss | habit_encode
shipped_to_product: false # true only if AGENTS/ZEN already absorbed the rule
canon_ids:                # N*/S*/H*/T* / CD-S / CR-S that justify this file
  - S030
  - N030
brain_evt_ids: []         # e.g. [EVT-0001] if related; empty if none
brain_overlap: none | pointer_only | do_not_duplicate
source_run_ids: []        # session / bcId / PR — never invent IDE ids for #8–#15
pair_ids: []              # happy↔smell pairs from canonical index
provenance: fm-agenteng-01-canonical
---
```

**Required fields (V from existing postmortem + H62):** `kind`, `date`, `slug`, `read_when`, `status`, `result`.  
**New for N*/S* ingest (I):** `canon_ids`, `brain_evt_ids`, `brain_overlap`, `pair_ids`, `provenance`.

---

## 4. Body sections (order matters)

1. **Title** — one line: fail class + surface (not a novel).
2. **Read-this-when** — 1–2 sentences mirroring `read_when` (human-facing).
3. **Stop rules for the next agent** — numbered, imperative, ≤8. Lead with STOP. (**V** existing postmortem shape; **N003**).
4. **Requested / Substituted** — what the plate asked vs what the loop did (**H62**).
5. **Evidence** — named sessions / PRs / `bcId` / commands; label **V/I/A/U**. No secrets, traces, learner text (**V** README).
6. **Canon crosswalk** — table: `canon_id | claim one-liner | role (trigger/remedy)`.
7. **Regression check** — how the next agent proves they did *not* repeat (**H62**).
8. **Brain EVT pointer (if any)** — ID + “see Brain; do not restate narrative here” (**dedup**).
9. **What worked (optional)** — only if it sharpens the stop; else omit.
10. **Out of scope** — “not AGENTS paste”, “not Brain mutation”, “not factory.db done”.

Do **not** paste full N*/S* catalogs into a learning file (agents-paste-diff).

---

## 5. When to promote N* vs S*

### Promote **S*** → learning when ALL of:

| # | Gate | Label |
| ---: | --- | --- |
| 1 | Costly negative (time burn, revert, thrash campaign, protocol fail, auth near-miss marketed closed) | **V** AGENTS #7 |
| 2 | Next agent would otherwise repeat without a stop rule | **V** README “when to add” |
| 3 | Concrete stop exists (numeric tripwire, refuse-boot, fail-closed, same-day learning) | **V** S030/S010/S033… |
| 4 | Not already covered by an existing learning with overlapping `read_when` + same stop | **I** |
| 5 | Brain EVT (if any) does **not** already give the *operator* stop — or EVT is epistemic and learnings hold the *harness* stop | **I** §6 |

**P0 S* candidates from start-tomorrow / captain-brief:** S030, S010, S040, S044, S031, S001, S033, S070 (promote selectively — one file per costly class, aliases in frontmatter).

### Promote **N*** → learning only when:

| # | Gate | Label |
| ---: | --- | --- |
| 1 | N* is the **recovery / negative-result** habit (write learning, refuse boot, replate, record CONCERN) — e.g. **N003**, **N010** as refuse twin of S010, **N044** residual honesty | **V**/I |
| 2 | N* appears as **remedy** inside a postmortem that is primarily S*-driven — cross-link in `canon_ids` / body crosswalk, do not open a second file | **I** |
| 3 | Otherwise **do not** promote ordinary happy N* (N020 contract-first, N031 Ship path, N070 bcId join) into learnings — keep in Loops one-pager / AGENTS paste / skills | **V** agents-paste-diff + README “not ordinary completed work” |

### Explicit non-promotes

- Ordinary green Ship with no costly miss → no learning (**V** README).
- Opinion without run/PR/session evidence → no learning (**V**).
- Full top-15 N*/S* tables → Firstmate pocket / Loops, not `.agents/learnings/` (**V** onepager role).
- Brain Canon promotion or PROC lift from a learning file → **forbidden** (**V** loops Brain contract; README).

---

## 6. Dedup vs Brain EVT

| Layer | Owns | Does not own |
| --- | --- | --- |
| **Brain EVT / SRC / PROC** | Epistemic/product claims; what Socratink may become; validation≠scope (**EVT-0001**) | Day-to-day operator tripwires, tool thrash numbers, Ship vs IDE routing |
| **Product AGENTS.md / ZEN.md** | Standing coding-agent contract; dogfood→proof; read learnings pointer | Exhaustive N*/S* catalog |
| **`.agents/learnings/`** | Dated stop rules from costly operator/campaign fails; `read_when` match | Brain Canon; duplicate EVT narrative; substitute for AGENTS |
| **Loops / canonical N*/S*** | Research index + Firstmate pocket | Product write; Brain mutation |

**Dedup algorithm (I — research draft):**

```text
1. Map S*/N* → brain_evt_ids (known: S001/N004/S037 ↔ EVT-0001/SRC-0010/PROC-0002).
2. If brain_overlap == do_not_duplicate AND AGENTS already states the rule
     → skip new learning; optional one-line pointer file only if operator sequence is NEW.
3. If EVT exists but operator stop is NEW (numeric thrash, refuse-boot plate fields, bcId join)
     → write learning with brain_overlap: pointer_only; cite EVT id; do not retell EVT story.
4. If no EVT
     → normal postmortem / smell-stop; brain_evt_ids: [].
5. Never: learning → Brain write; Scout merge; factory.db done from this path.
```

**Worked example:** **S001** / **EVT-0001** — AGENTS already encodes dogfood/vet → strengthen proof only. Prefer **no new learning** unless a *new* costly sequence adds a stop AGENTS lacks (pointer_only). **S030** thrash — no Brain EVT; **promote** learning/smell-stop (operator harness).

---

## 7. Ingest workflow (research → product later)

```text
canonical-extract-index (N*/S*)
        │
        ▼
Captain/Firstmate selects promote set (S* primary)
        │
        ├─ research draft stub under agenteng-runs/   ← THIS TRANCHE ONLY
        │
        └─ (later, captain) write product .agents/learnings/<kind>-DATE-slug.md
                 + optional AGENTS pocket paste (separate T)
                 + NEVER Brain mutation
```

**Same-day rule (**N003** · V):** when plate proof fails or campaign is negative, draft the learning the same calendar day (CT).

---

## 8. Example filled stubs (research draft path only)

> Not written into product `.agents/learnings/`. Illustrative only.

### 8.A — From **S030** (promote · smell → postmortem)

**Filename (if ever shipped):** `postmortem-2026-09-15-tool-thrash-no-gate.md`

```markdown
---
kind: postmortem
date: 2026-09-15
slug: tool-thrash-no-gate
read_when:
  - operator thrash
  - identical tool signature retry
  - same-file edit cycles
  - IDE session >15 min
  - merge-bound work in IDE
status: open
result: negative_operator
shipped_to_product: false
canon_ids: [S030, N030, N043, H37]
brain_evt_ids: []
brain_overlap: none
source_run_ids: [b23609bb, 357a2e9e, a09316e9]
pair_ids: [N030, N043]
provenance: fm-agenteng-01-canonical
---

# Postmortem: tool thrash without green gate

Read before any IDE session that may re-read or StrReplace the same path, or any merge-bound work started only in IDE.

## Stop rules for the next agent

1. **STOP** if ≥3 identical tool signatures **OR** ≥5 same-file edit cycles without a green gate → rewrite `/goal`+proof+stop (one variable).
2. **STOP** “just continue” after thrash — prefer Ship/cloud for merge-bound work (**S031**/**N063**).
3. Cap re-reads: ≥3 same path in a phase → summarize lack or ask; never identical retry loops.
4. Do **not** call high Axis-A + thrash “healthy” (**S065**).

## Requested / Substituted

- **Requested:** plate-bound outcome with named proof.
- **Substituted:** repeated Read/StrReplace/Shell signatures without progress (exemplars: b23609bb ~1770 tools; 357a2e9e styles.css loops).

## Evidence

- Canonical **S030** · strata-v3 thrash 42/132 · **V**
- start-tomorrow-onepager S* #1 · captain-brief top smell · **V**

## Canon crosswalk

| ID | Role | One-liner |
| --- | --- | --- |
| S030 | trigger | Tool/path thrash ≥3 sigs or ≥5 edits w/o green |
| N030 | remedy | Copy gold small closes / phased fences — not large thrash diffs |
| N043 | remedy | Repeated targeted gate in-loop (e.g. tsc) |

## Regression check

Next session logs: tripwire armed in plate; no ≥3 identical sigs; if merge-bound, Ship path named.

## Brain EVT pointer

None. Harness/operator stop only — do not invent a Brain EVT from this file.

## Out of scope

Not AGENTS wholesale paste; not Brain mutation; research stub only until Captain ships.
```

### 8.B — From **N010** (habit-note · only as refuse twin of S010)

**Filename (if ever shipped):** `habit-note-2026-09-15-refuse-boot-without-plate.md`  
**Promote rationale:** recovery/refuse habit — not a generic happy nugget. Pair with S010; prefer AGENTS boot-gate paste when Captain pastes thrash draft — this note is optional if AGENTS absorbs refuse-boot.

```markdown
---
kind: habit-note
date: 2026-09-15
slug: refuse-boot-without-plate
read_when:
  - ship brief missing /goal
  - Firstmate handoff
  - bare continue Codex/Cursor
  - trust/away without restated plate
status: open
result: habit_encode
shipped_to_product: false
canon_ids: [N010, S010, N011]
brain_evt_ids: []
brain_overlap: none
source_run_ids: []
pair_ids: [S010]
provenance: fm-agenteng-01-canonical
---

# Habit: refuse boot without plate

Read before any Ship / IDE handoff >15 min or Firstmate boot.

## Stop rules for the next agent

1. **Refuse boot** if `/goal` + repo + cwd + proof + stop + Not-in-this-PR missing (**N010**/**S010**).
2. Ban bare “continue Codex/Cursor” and “I trust you” without restated plate (**S013**/**S014**).
3. One observable Outcome sentence + Out-of-scope fences before tools (**N011**).

## Requested / Substituted

- **Requested:** plate-first partnership.
- **Substituted (smell S010):** lost goal / multi-issue opener / stacked jobs mid-thread.

## Evidence

- PR `#8–#11` bodies carry plate fields · **V** (N010 evidence)
- start-tomorrow N* #1 / S* #2 · **V**

## Canon crosswalk

| ID | Role | One-liner |
| --- | --- | --- |
| N010 | remedy | Ship brief must carry full plate; Firstmate refuses if missing |
| S010 | trigger | Lost goal / plate drift |

## Regression check

Handoff packet shows all six plate fields; Firstmate boot log shows refuse when any missing.

## Brain EVT pointer

None.

## Out of scope

If Captain pastes refuse-boot into AGENTS, mark `shipped_to_product: true` and keep this file as pointer-only or delete duplicate. Not Brain Canon.
```

---

## 9. Captain decision checklist (paste later)

1. Keep **`postmortem` only**, or allow `smell-stop` / `habit-note`? (**A** default: postmortem-only until AGENTS learnings README updated.)
2. Promote S030 (and optionally S010/S044) first — highest P0 from onepager/captain-brief.
3. Skip S001 learning if AGENTS+EVT already cover — pointer_only at most.
4. Do **not** dump top-15 tables into `.agents/learnings/`.
5. Product write = Captain action; Researchy stops at this template.

---

## Sources

- `start-tomorrow-onepager.md` (top 15 N*/S*)
- `canonical-extract-index.md/.json` (N003, N010, N030, S001, S010, S030, H62)
- `FM-AGENTENG-01-captain-brief.md`
- `agents-paste-diff.md` (learnings deferred catalog; post-failure soft overlap)
- Product `/workspace/socratink-flue/AGENTS.md` + `.agents/learnings/README.md` + Praxist postmortem exemplar
- Loops Brain/scope contract (no Canon promotion from annex)

---

**SUCCESS:** naming + frontmatter + body · N* vs S* promote gates · Brain EVT dedup · 1 N* + 1 S* filled stubs · research-only · Brain untouched · factory not done · product learnings not written.
