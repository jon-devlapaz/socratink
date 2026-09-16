# FM-AGENTENG-01 — Every-leaf sweep notes

- **As-of:** 2026-09-15 ~20:45 CT · Researchy · research-only
- **Mac live re-scan:** **Blocked** this executor (machineId `3ac411d5-…` Shell not routed; hostname=box). Sizes/notes from same-day verified inventory/Nole/CHATSIG + box mirrors.

## 1. Unnamed New Bot / New Agent
- Box `/home/box/agent-data/agents/`: **New Bot** `0afca9ff-…`, **New Agent** `9b1a1ad1-…` — empty name/title/description (**verified** sprawl-audit + Nole).
- Verdict carry-forward: **Cut** (A0 B0 C0 D1). 2/9 profiles flagged empty.

## 2. Sprawl packets
- Pack grep (socratink): subagent-sprawl **18**, side_chat_boundary **10**, grok-spark-code-sprawl **6**, LEDGER **20**, packet **33** (noisy).
- Clusters: `e8a25b04` / `24bb1629` subagents (`3667f64d`, `19c63579`). `~/.agents/runtime/sprawl` present on Mac inventory.

## 3. Learnings folder sizes
- Product `.agents/learnings/`: **thin** — 1 postmortem class (`postmortem-2026-08-30-praxist-…`) (**verified** Nole/harness tranche).
- Gap vs EVT-0001 importance: process maturity leaf still open.

## 4. AGENTS.md sizes (product / workspace)
| Path | Bytes / lines (prior) | Note |
| --- | --- | --- |
| product/flue-tree `AGENTS.md` | ~12138 B / ~277 lines | High — Fix tripwires not more docs |
| GitHub socratink `AGENTS.md` | ~12138 B / ~277 | Matches |
| workspace/chat-signal `AGENTS.md` | **158 B / 5 lines** | Model short habit |
| flue variate / app-scout AGENTS | 6.5k / 4.7k | Nested/dup → pointer |

## 5. factory.db task history
- SoT: `/home/box/agent-data/grok-ship/factory.db` tasks.
- Scout **done**: FM-EVALS-01, FM-BOTFIND-01, FM-PRREV-01, FM-TYPESAFE-01, FM-CHATSIG-01, FM-CHATSIG-PILOT, FM-CTXSMELL-01.
- Scout **underway**: FM-AGENTENG-01.
- Parallel firstmate factory also holds landing scout/ship rows (separate product lane).

## 6. pi / dsh / claude thin harness sizes
| Path | Size | Sessions (inventory) |
| --- | ---: | ---: |
| `~/.pi` | **199M** | 88 |
| `~/.dsh` | **1.4M** | 18 |
| `~/.claude` | **764K** | 9 |
- Contrast: `~/.codex` 1.6G, `~/.cursor` 233M. Thin harnesses = keep as optional strata, not primary pilot corpus.

## 7. App Support Cursor 19G — exclusion rationale
- **Exclude** full App Support Cursor **19G** (Cache/GPU/etc.) from chat-signal corpus (**verified** CHATSIG-01 / harness-skills-table).
- Corpus = agent-transcripts / projects jsonl (~136M transcripts subtree), not Cache trees. Also exclude auth.json, Cookies, secret paths.

## 8. chat-histories Aug dump vs live delta
- Capture stamp: `home-live-20260915-1952`; chat-histories root ~**1.6G**.
- **Verified gap:** newest socratink parent jsonl mtimes in current-home-live top out ~**2026-09-10**; **0** parents mtime 2026-09-15/16.
- Phase PRs #8–#15 reconstruct from **cloud-agent** (`/workspace/cloud-agent-transcripts` has 18 `bc-*.jsonl`) + PR bodies — not Aug IDE dump delta.
- Aug dump vs live: live delta for Sep 15–16 **cloud-only**; IDE pack soft-joins only Aug 25–29 PRs (#1–#7).

## 9. TypeSafe lane fit — one-pager revisit
- Fit **confirmed** this run: PR lifecycle Jev 15/15 ok; WM stuffed_vs_minimal 20/20 ok; prior pilot 50/50 + smell 50/50 + strata 59.
- Best use: one System One call per unit (session/PR) with Nouls+Choice; composites in code — no vanity %.
- Lane: research ranking / failure attribution / WM discipline — **not** product Chat learner path.
- See FM-TYPESAFE-01 + FM-CHATSIG-PILOT.

## 10. Pedagogical / Brain sessions — separate stratum
- **Keep separate** from product engineering thrash stratum: Brain EVT/SRC/PROC, pedagogical-v0.01 / FM-EVALS-01, landing taste scouts.
- Do not mix into Axis-A ship ranks or PR Jev without explicit stratum label.
- Evidence: FM-EVALS-01 done scout; Brain postmortems are reconstructability units, not Cursor UI thrash.

## Blockers
- Live Mac machineId Shell/Copy* unavailable to this executor — leaf sizes reused same-day verified inventory.