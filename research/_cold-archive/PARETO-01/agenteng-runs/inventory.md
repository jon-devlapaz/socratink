# FM-AGENTENG-01 — Harness & corpus inventory (Researchy)

**As-of:** 2026-09-15 CT  
**Labels:** Verified unless marked Assumption / Inference / Unknown.

## Question
What coding-agent surfaces, sizes, and skill sprawl exist for Socratink agentic engineering?

## Verified facts

### Cursor home-live (Mac Jondev.local)
- Cursor projects under capture: **~403** total / **~19** name-match `*socratink*` (halfway inventory ping).
- Socratink-related jsonl: **~200** (≈**132** parent / **≈68** subagent).
- Capture stamp referenced by Loops: `home-live-20260915-1952`.
- **Session↔PR gap (Verified):** newest socratink-related parent jsonl mtimes in `current-home-live` top out around **2026-09-10**; only **2** parents with mtime on 2026-08-28 (incl. `b06e3da7`); **0** on 2026-09-15/16. Phase PRs `#8–#15` (2026-09-15/16) are **not** reconstructable from IDE home-live parents — primary fingerprint is **cloud agent** (`cursor/*` branches, `CURSOR_AGENT_PR_BODY`, `bc-…` footers). Pack time-join only hit `#5`/`#6` via `b06e3da7`.

### Harness `du` (Mac, verified earlier this ticket)
| Path | Size |
| --- | ---: |
| `~/.codex` | **1.6G** |
| `~/.cursor` | **233M** |
| `~/.pi` | **199M** |
| `~/.claude` | **764K** |
| `~/.agents` | **1.3M** |
| `~/.dsh` | **1.4M** |

### Box skill scan (Nole annex)
- **264** `SKILL.md` files (~2.3 MB text) across plugins cache (130), workspace (73), managed-skills (32), workflows (22), grok-ship pack (7).
- **Diverged** workflows ↔ grok-ship pack twins: adversarial-review, ahoy, lavish-session, project-management (different md5).
- Product `.agents/skills` ~29 (prior inventory); learnings thin (1 postmortem class).
- Box agents: **9** profiles; placeholders **New Bot** / **New Agent** → Cut candidates (Nole).

### Keep / merge / cut (skills — compact)
See Nole annex + `harness-skills-tranche.md`. Headline:
- **Keep:** product `socratink-brain`, `typesafe-ai`, outer-loop / adversarial-review (single-source), CTXSMELL playbooks as doctrine not paste.
- **Merge/Fix:** workflows ↔ grok-ship diverged twins; deprecate `firstmate/pack` vs `grok-ship/pack`.
- **Cut / load-on-demand:** steve-jobs always-on; sal-khan (0 refs); workflow orphans (engram, strip-ai-isms, …); New Bot/New Agent; hot-box QC clones (~3.2 GB).

### Jev strata (Cursor-biased, n=59)
Path: `agenteng-runs/strata-scores.json`. Gap counts: thrash **41**, scope_sub **5**, missing_verify **4**, governance **3**. Bands: slow_thrash **37**, fast_good **8**, careful_good **8**, fast_wrong **6**. Mean plate_quality **~1.29/3**. **Assumption:** smell-biased sample — do not generalize to all sessions.

## Assumptions
- Codex 1.6G is mostly session/history residue, not “active skill quality.”
- Cloud-agent transcripts under `/workspace/cloud-agent-transcripts` (18 `bc-*.jsonl`) are a better join surface for Sep 15 phase PRs than home-live IDE.

## Could not check / open
- Full Mac re-scan of `~/.agents` / `~/.cursor` skills in some executor lanes (Nole Mac note).
- Exhaustive Codex long-horizon Jev sample (package 2 — pending sibling lane).
- Live Claude/omp capture under home-live (earlier: absent).

## Sources
- FM-AGENTENG-01 halfway Firstmate ping; Nole annex; Loops v1.1; Mac `du` + mtime join script 2026-09-15 CT.
