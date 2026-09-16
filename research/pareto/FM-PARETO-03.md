# FM-PARETO-03 — Purity re-scout after #22

**As of:** 2026-09-16 ~01:10 CDT  
**Mode:** Scout only. No deletes.  
**Baseline:** `origin/main` @ `33865fb7` — `chore: FM-PARETO-CUT-02 — product-pure compact` (#22)  
**Method:** Detached worktree `socratink-pareto03-wt` (avoid dirty local `main`).

**Done bar:** hot path = Chat knee + product doctrine docs + `socratink-brain` + thin `AGENTS` maps; warehouses / skills junk / tooling artifacts not default-loadable / not bloating the clone.

**Protected:** Chat knee, living-ink (if present), Brain Canon (sibling), `agenteng-distilled`, kept skills (`socratink-brain`, `flue-wiki`, `agenteng-wiki`, `catch-brain-to-product`, + current thin set).

---

## Clean-enough?

### **Yes**

`#22` evacuated `research/_cold-archive/` from git (~12M+), removed hot AGENTENG annexes/drafts, dieted meta skills, dropped `praxist_task`, and landed `research/pareto/`. Remaining `research/` is **~260K** with thin AGENTS maps. Default clone is product-pure enough for clean agentic Chat work.

Caveat: root `AGENTS.md` still **mentions in-repo** `_cold-archive/PARETO-01/...` paths that no longer exist (host recovery is documented). That is pointer hygiene, not clone bloat.

---

## Scorecard @ `33865fb`

| Check | Result |
| --- | --- |
| `research/_cold-archive/` in tree | **Gone** (gitignore + host `/Users/jondev/dev/archives/socratink-cold-archive/`) |
| Mega skills in `.agents/skills/` | **Gone** |
| Hot `agenteng-runs` / annex dumps | **Gone** |
| `praxist_task/` | **Gone** |
| `research/` size | **~260K** / 34 files |
| Skills remaining | 10 packages: brain / flue / agenteng / catch / working-loop / typesafe-ai / braintrust* / docent* / karpathy-guidelines |
| Thin AGENTS maps | root + `chat-signal` + `pareto` + `typesafe` + `pr-reviews` |
| Chat knee `src/agents/chat.ts` | Present |
| `wiki-source/agenteng-distilled/` (12 pages) | Present — **KEEP** |
| `ZEN.md` | Present |
| `PRODUCT.md` / living-ink on this tip | **Not in `origin/main` tree** (likely local WIP elsewhere; `#22` did not delete them from main because they were not tracked here) |

---

## Residual CUT list (optional polish — not blocking clean-enough)

| Priority | Item | Size | Action | Risk |
| --- | --- | --- | --- | --- |
| P1 | Root `AGENTS.md` stale `_cold-archive/PARETO-01/...` links | — | **THIN rewrite** → host archive + `research/README.md` only | Low |
| P2 | `research/pareto/AGENTS.md` still lists only 01/02 | — | Add `FM-PARETO-03.md` line when landed | Low |
| P3 | `research/chat-signal/FM-DOCPRUNE-01*.md`, `CAPTURE-home-live.md` | ~15K | Optional cold/host; keep if process audit trail wanted | Low |
| P4 | `research/architect/`, `dogfood/` | ~20K | Keep with AGENTS or host-archive later | Low |
| P5 | `.agents/evals/` (~132K) + `.agents/roles/` | ~164K | Keep if eval harness active; else load-on-demand note | Med if wrongly deleted |
| P6 | `karpathy-guidelines` skill (4K) | Tiny | Optional drop | Low |
| P7 | Extra WebGL helpers still in `src/ui/effects/` (`organic-sphere*`, `icon-cloud`, …) | Code | **FREEZE expansion** (PARETO-01); do not delete without UI ticket | Med |

**Do not cut:** Chat/`present_question`/`reveal`, distilled wiki source, `socratink-brain` / `flue-wiki` / `agenteng-wiki` / `catch-brain-to-product`, host cold archive.

---

## Standing order

Purity bar for **clone bloat / default-loadable warehouses** is met → **clean-enough=yes**. Further cuts are optional hygiene (P1 recommended next) or separate product tickets (WebGL freeze, PRODUCT/living-ink land if Captain wants them on main).

---

## Assumptions

- Done bar prioritizes agentic product purity over deleting every process scout markdown.  
- Host archive path from CUT-02 commit message / `research/README.md` is authoritative for recovery.

## What could not be checked

- Completeness of host `/Users/jondev/dev/archives/socratink-cold-archive/` vs pre-cut tree (listed; not byte-diffed).  
- Whether local dirty `main` still carries untracked living-ink/PRODUCT that should be a separate PR.

---

*Researchy · FM-PARETO-03 · scout only*
