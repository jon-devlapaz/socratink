# DRAFT — AGENTS.md thrash tripwire (paste-ready)

> **Research-only draft** for FM-AGENTENG-01 T3.4 · Captain paste into product `AGENTS.md` when ready.  
> **Do not** treat this file as already landed in the product repo.  
> Grounded in: `start-tomorrow-onepager` (15 S* / 15 N*), CR-S01–CR-S12, loops §5/§8 P0.

---

## Thrash tripwires, stop rules, and verify gates

### When this section applies

- Every **Ship** brief and any **IDE / Codex / Cursor** session expected to run **>15 min**.
- Merge-bound work prefers **Grok Ship** (scout→ship→adversarial→captain). IDE thrash is a **non-merge** path unless captain explicitly re-plates for Ship (`N031`/`N063`/`S031`).

### Boot gate (refuse without plate) — `S010` / `N010`

Before any tools:

1. Paste a one-sentence **`/goal`** (observable Outcome).
2. Name **repo** + **cwd/worktree** (never guess).
3. Name **proof** (commands a stranger can run) or honest **`Unverified:`**.
4. Name **stop** (when proof green for `/goal` — no adjacent polish).
5. Name **Not-in-this-PR** / out-of-scope fences.

**STOP boot** if Outcome / Goal Prompt is missing (`S010`). Firstmate refuses handoff without the plate.

**Ban openers:** bare “continue Codex/Cursor” (`S013`); “I trust you” / away without restated plate+proof (`S014`); multi-issue “validate these two…” without one Outcome.

### Thrash tripwires — `S030` / CR-S01–CR-S02 / CR-S08 / CR-S10

**STOP and replate** (one variable only; do not widen scope) when any of:

| # | Tripwire | Action |
| ---: | --- | --- |
| 1 | **≥3 identical tool signatures** (same tool + same path/args pattern) without a green gate | Diagnose → change **one** variable → retry once; else rewrite `/goal` |
| 2 | **≥5 same-file edit cycles** (Read/StrReplace on one file) without a green gate | **STOP.** Rewrite plate. Do not “one more polish.” (`S030`, loops §5) |
| 3 | Skill-path / scout-path hunt substituting for Outcome+proof (missing `SKILL.md`, wrong scout path, retry loops) | **STOP.** Plate first; skill discovery is not the job (`CR-S01`, `CR-S12`) |
| 4 | Retry/error sample campaign without plate rewrite (path-fix thrash, identical path retries) | **STOP.** New `/goal` from current repo truth (`CR-S08`, `CR-S10`) |
| 5 | Extreme thrash with no recovery (high thrash ∩ low happy ∩ low verify) | Treat as **fatal thrash** — park; do not ship (`CR-S02`, `CR-S07`, `CR-S11`) |

**Do not** call high Axis-A / “shipped” scores a healthy loop when thrash tripwires fire (`S065`). Score loop health separately from ship needle.

### Verify gates — `S040` / `S022` / `N040` / `N044`

- Proof = **named commands you ran** (`pnpm test:<slice> && pnpm check && pnpm smoke`) or honest **`Unverified:`** for live paths.
- **STOP** treating an unchecked UI checklist as verify (`S040`).
- **STOP** proof theater (unit path ≠ instrument path) — label Unverified live paths explicitly (`S022`).
- Auth/BYOK / hotel-safety: independent **FM-PRREV** before treating proof closed (`N050`). Record **CONCERN + residual**; do **not** market CONCERN as closed hotel-safety (`S044`/`N044`).

### Scope / phase stop rules — `S011` / `S012` / `N032` / `N062`

- **STOP** missing Not-in-this-PR / scope creep in-diff — cut or open a follow-up PR (`S011`).
- **STOP** skipping phase order (wire before prove) — isolation/proof PR first (`S012`/`N032`).
- Outcome proven → **STOP**. Next phase = **new `/goal`**, never silent widen (`N062`).
- After isolation proof, open a **NEW plate** for wire — never widen the proof PR (`N032`).

### Governance / identity — `S033` / `S034` / `N033` / `N001`

- **STOP** identity sniff / fail-open to operator key — parse `instanceId` only; fail closed (`S033`/`N033`).
- **STOP** Brain≠code≠harness crossed / Scout merge / Brain mutation mid coding — captain merges; Scout is **report-only** (`S034`/`N001`).
- **STOP** inventing fake IDE session IDs for cloud phases — join via `bcId`/PR footer only (`S070`/`N070`).
- **STOP** turning dogfood/vet/trace/scientific language into adjacent product build — strengthen proof only (`S001`).

### Merge-bound vs IDE thrash — `S031` / `N031` / `N063`

| Path | Allowed | Not allowed |
| --- | --- | --- |
| **Ship / cloud** | Merge-bound impl; push branch; adversarial-review; captain PR/merge | Opening PR before adversarial-review; silent scope |
| **IDE / Codex / Cursor** | Plate-bound hotfix with tripwires live; research; local proof | Merge-bound work that only lives in IDE thrash (`S031`) |

Resume / model-switch / “continue where X left off” ⇒ **rewrite `/goal`+proof+stop from current repo truth** (`S013`, `CR-S05`) — continuity ≠ plate.

### Minimal stop checklist (pocket)

1. Plate present? else refuse boot.  
2. Thrash tripwire fired? → replate (one variable).  
3. Proof = named commands or Unverified?  
4. Auth/BYOK → FM-PRREV; CONCERN ≠ closed.  
5. Green for `/goal` → stop; new `/goal` next phase.  
6. Merge-bound → Ship; IDE thrash ≠ merge path.

---

**Sources:** `start-tomorrow-onepager.md` S*/N*; `codex-recovery-cards` CR-S01–12; `FM-AGENTENG-01-loops.md` §5, §8 P0, §16 pocket.  
**Status:** research draft under `agenteng-runs/` only — product `AGENTS.md` untouched.
