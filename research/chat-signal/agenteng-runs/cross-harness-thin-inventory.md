# cross-harness-thin-inventory — pi / claude / dsh (T5.3)

- **As-of:** 2026-09-15 21:14 CT
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-5 · T5.3
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac CopyFromBox **skipped**
- **Companion JSON:** `cross-harness-thin-inventory.json`
- **Question:** Any transferable smells from thin harnesses **pi / claude / dsh**, or declare barren?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**

---

## 0. Verdict (one-liner)

**Smell-mine barren** for native **pi / claude / dsh** session smells this tranche — keep as optional size/count strata only; do **not** invent sessions. Incidental Cursor `paths_touched` into `~/.pi` / `~/.claude` skills are **not** thin-harness session mines (**V** pack audit · **I** on transfer).

---

## 1. Access this run

| Surface | Result | Label |
| --- | --- | --- |
| Box `~/.pi` / `~/.claude` / `~/.dsh` | **Absent** (no dirs on box hostname) | **V** |
| Shell `machineId` `3ac411d5-1001-4beb-baf5-a38080401d80` → Mac home | **Not routed** to this executor (same blocker as `every-leaf.md`) | **V** |
| Existing packs (inventory / harness-skills / every-leaf / strata) | **Used** — sizes, session counts, skill collisions, incidental paths | **V** |
| Mac CopyFromBox | **Skipped** (goal) | — |

**Do not invent** pi/claude/dsh session IDs or transcript excerpts. Counts below are prior same-day live inventory only.

---

## 2. Thin inventory table

| Harness | Home path | Size | Sessions (inventory) | Native session smell cards in packs? | Notes |
| --- | --- | ---: | ---: | --- | --- |
| **pi** | `~/.pi` | **199M** | **88** | **None** | Optional strata; 199M ≫ claude/dsh but ≪ codex 1.6G |
| **dsh** | `~/.dsh` | **1.4M** | **18** | **None** | Size+count only in inventory |
| **claude** | `~/.claude` | **764K** | **9** | **None** | Live Claude/omp home-live capture earlier noted **absent** (`inventory.md`) |
| Contrast | `~/.codex` | **1.6G** | 138 rollouts | Mined (codex-* packs) | Primary non-Cursor corpus |
| Contrast | `~/.cursor` | **233M** | 941 transcripts | Mined (strata/loops) | Primary pilot corpus |

**Sources (V):** `inventory.md` / `inventory.json` · `harness-skills-tranche.md` · `harness-skills-table.md` · `every-leaf.md` §6 · `FM-AGENTENG-01.md` corpus table.

---

## 3. What packs *do* mention (not session mines)

| Finding | Evidence | Transferable smell? | Label |
| --- | --- | --- | --- |
| Skill name collision `socratink-path-to-customer` | `research-vault/.agents/skills` + `~/.claude/skills` — harness-skills-table **merge** | **Hygiene only** (SoT merge) — not a loop thrash smell | **V** |
| Cursor session `paths_touched` → `/Users/jondev/.pi`, `~/.pi/agent`, `router-status.ts`, `models.json` | strata-pack / v2 excerpts | **No** — Cursor agent touching pi config; not a pi-native transcript | **V** |
| Cursor `paths_touched` → `~/.claude/skills/socratink-path-to-customer/SKILL.md` | strata-pack | **No** — skill path attach, not Claude Code session | **V** |
| Repo `.claude/` harness shim alongside `.codex/` / `.cursor/` | strata dirty-worktree text | **No** — product shim note | **V** |
| Cloud dump “pi-ai catalog costs” (CD-H05 / PR #12) | cloud-dump-cd-extract | **Different object** — Flue/`pi-ai` model catalog, **not** `~/.pi` sessions | **V** |
| strata harness field | strata-pack n=59 all `cursor`; v3 n=132 all `cursor` | Confirms thin harnesses **unsampled** in Jev strata | **V** |

---

## 4. Transferable-smell declaration

| Harness | Declaration | Why |
| --- | --- | --- |
| **pi** | **BARREN** (session-smell mine) | 88 sessions counted; **0** mined cards / harness=`pi` rows; only incidental Cursor paths |
| **claude** | **BARREN** (session-smell mine) | 9 sessions; home-live Claude capture absent; only skill SoT collision + path attach |
| **dsh** | **BARREN** (session-smell mine) | 18 sessions; **no** paths_touched / cards / harness rows beyond size |

**Inference:** Thin harnesses remain **optional disk strata** for Nole keep/cut sizing — not a second smell corpus until a future Mac live walk extracts real session jsonl (without inventing IDs).

**Assumption:** Same-day inventory counts (88/9/18) still accurate at 21:14 CT; no live `du` this executor.

---

## 5. Could not check / open

- Live Mac tree walk of `~/.pi/**`, Claude logs, `~/.dsh/**` (machineId Shell blocked).
- Whether any of the 88/9/18 sessions are product-Socratink vs personal noise (**U**).
- Claude Code `/goal` Stop-hook fidelity vs Cursor (**U** — noted in 30-60-90 primary).

---

## 6. Related packs

- `inventory.md` / `.json` · `every-leaf.md` · `harness-skills-table.md` · `harness-skills-tranche.md`
- `strata-pack*.json` (cursor-only harness) · `cloud-dump-cd-extract.md` (pi-ai ≠ ~/.pi)

---
*Researchy burn-tranche-5 · FM-AGENTENG-01 · T5.3 · cross-harness-thin-inventory*


## Parent Mac verify (Researchy, 2026-09-15 ~21:50 CT)

**Correction to "box homes absent / machineId not routed":** Jondev.local Shell **OK**.

| Home | Size | Sessions |
| --- | ---: | --- |
| `~/.pi` | **199M** | **Verified** `agent/sessions/**/*.jsonl` (skill-eval, engram, socratink doctrine/product, blackhole, …) |
| `~/.claude` | **764K** | **Verified** `projects/**/*.jsonl` (incl. skill-eval-loop, Nimbalyst) |
| `~/.dsh` | **1.4M** | home exists (session layout not fully enumerated this pass) |

**Smell-mine for FM-AGENTENG transfer:** still **not extracted** into agenteng packs this tranche — treat T5.3 "BARREN" as **barren-in-pack / not-yet-mined**, not "no sessions on disk". Optional T6: thin pi/claude smell sample (existing IDs only).
