# FM-AGENTENG-01 Package 3 — Multi-agent sprawl audit

**As-of:** 2026-09-15 ~20:42 CT  
**Scope:** Cursor *socratink* transcripts via existing packs on box + box agent profiles. Live Mac transcript tree re-grep: **Unknown** (Jondev paths unreachable this pass).

## 1. Grep counts — Cursor *socratink* (from packs on box)

Corpus: union of sessions in `strata-pack.json` + `smell-pack-v2.json` + `sessions-pack.json` filtered to socratink path/excerpt. Counts = sessions with ≥1 hit in excerpt/paths (not raw line hits).

| Pattern | Session hits (pack) | Label |
| --- | --- | --- |
| `subagent-sprawl` | **18** | verified (pack text/paths) |
| `side_chat_boundary` | **10** | verified |
| `grok-spark-code-sprawl` | **6** | verified |
| `LEDGER` | **20** | verified |
| `packet` | **33** | verified (noisy — ordinary English + orch packets) |

### Example session paths (verified from packs)

**subagent-sprawl**
- `.../Users-jondev-dev-socratink-prod-socratink-app/agent-transcripts/518c2961-0693-48bb-ae35-c4a166b2116c/subagents/e8a25b04-6d00-4a10-a155-c50fc2c5cb9c.jsonl`
- `.../e8a25b04-6d00-4a10-a155-c50fc2c5cb9c/e8a25b04-6d00-4a10-a155-c50fc2c5cb9c.jsonl`
- `.../24bb1629-c72d-4efb-af00-858090458780/24bb1629-c72d-4efb-af00-858090458780.jsonl`
- `.../24bb1629-…/subagents/3667f64d-b4bd-4836-ab07-58c3a3d93bee.jsonl`
- `.../24bb1629-…/subagents/19c63579-306c-44ac-be10-1c70dc85ab6c.jsonl`

**side_chat_boundary**
- same e8a25b04 / 3667f64d / 19c63579 cluster
- `.../Users-jondev-dev-active-socratink-prod-socratink-landing/.../262573f8-…/subagents/41c8cb56-….jsonl`

**grok-spark-code-sprawl** — concentrated in e8a25b04 parent/subagent pair (skill path + discussion).

**LEDGER / packet** — appear in orch/skill workflows (e.g. close-loop LEDGER.md under `~/.codex/skills`) and multi-pane packet tables in excerpts.

### Box-local agent-transcripts (secondary)

| Pattern | jsonl files | Label |
| --- | --- | --- |
| packet | 2 | verified (box) |
| LEDGER | 2 | verified (box) |
| subagent-sprawl / side_chat_boundary / grok-spark-code-sprawl | 0 | verified (absent on box corpus) |

## 2. Box agents profile audit

Path: `/home/box/agent-data/agents/*/profile.json` — **9** agent dirs with profiles.

| id | name | title | flag |
| --- | --- | --- | --- |
| `0afca9ff-…` | **New Bot** | (empty) | **FLAG** empty charter |
| `9b1a1ad1-…` | **New Agent** | (empty) | **FLAG** empty charter |
| `1833464b-…` | loops | (empty title) | ok |
| `59994452-…` | Job Assist | Job search | ok |
| `602cf413-…` | dr eggbot | (empty title) | ok |
| `7083d34f-…` | Nole the Auditor | (empty title) | ok |
| `713074ca-…` | Firstmate | Firstmate | ok |
| `8a97d918-…` | Researchy | Evidence & fact-check desk | ok |
| `bfb86c9a-…` | Competitor Watch | (empty title) | ok |

**Flagged empty/New:** **2 / 9** (verified).

## 3. Waste vs outcome hypotheses

| # | Hypothesis | Evidence | Label |
| --- | --- | --- | --- |
| H1 | Subagent sprawl is a recurring Socratink Cursor smell, not rare | 18 pack sessions hit `subagent-sprawl`; clusters under socratink-app with nested `subagents/` paths | verified count; inference that many are skill invocations not always waste |
| H2 | `side_chat_boundary` co-travels with sprawl → parent-history inheritance bloat | 10 side_chat hits; exemplars overlap e8a25b04 / 24bb1629 subagents | verified co-occurrence in sample paths; causal waste = inference |
| H3 | Packet/LEDGER language marks orchestration ceremony that can substitute for proof | 33 packet / 20 LEDGER session hits; excerpts show pane/packet tables and skill LEDGER paths | verified term hits; “ceremony > outcome” = inference |
| H4 | Unused “New Bot/New Agent” profiles are dead weight on the box crew | 2/9 empty name/title/description | verified profiles; “never used for outcomes” = Unknown (no usage telemetry joined) |
| H5 | Cursor Package-1 Jev already shows thrash/handoff pressure consistent with sprawl | strata-scores gap: thrash 41/59, handoff_rot 1, over_trust 1; band slow_thrash 37/59 | verified scores; link to sprawl keywords = inference |

## Gaps

- Full Mac `~/.cursor/projects/**/*socratink*/agent-transcripts` re-grep: **Unknown** this pass.
- Outcome linkage (did sprawl sessions ship verified work?): **Unknown** without commit-window join on those session ids.
