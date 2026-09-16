---
title: "FM-CHATSIG-01 — TypeSafe Jev pipeline design for coding-agent chat signal"
source_url: "file:///workspace/socratink/research/chat-signal/wiki-source/agenteng/related/FM-CHATSIG-01.md"
source_kind: "agenteng-documentation"
generated: true
synced_at: "2026-09-16T02:33:24Z"
content_hash: "72a9a27d56704a026d6be8f6978ebd4950a5851f4b4cd2f39bc9e76217811ebe"
---

# FM-CHATSIG-01 — TypeSafe Jev pipeline design for coding-agent chat signal

**As-of:** 2026-09-15 (America/Chicago)
**Task:** Research-only design. **No full scoring run.** No PR.
**Scope (binding Captain override):** **all coding-agent sessions on Jondev.local**, not only `chat-histories`.
**Axes:**
- **A — Product needle (coding lifecycle):** sessions that most moved shipping reality.
- **B — High-signal productization / profitability:** durable strategic signal for Brain/product.

---

## Sources (dated)

| Source | As-of |
| --- | --- |
| Seed `/workspace/socratink/FM-CHATSIG-01-seed.md` | 2026-09-15 |
| Scope override from Firstmate (all Jondev coding-agent sessions) | 2026-09-15 |
| Live inventory Jondev.local (`machineId` 3ac411d5-…) → `/workspace/socratink/research/fm-chatsig-inventory.{md,json}` | **2026-09-15 ~19:50 CT** |
| FM-TYPESAFE-01 + https://docs.typesafe.ai/llms.txt / composite-scoring / use-case-map | 2026-09-15 |
| Shared skill `typesafe-ai` | 2026-09-15 |

---

## 1. Session unit + normalize sketch

### Working definition

One **NormalizedSession** = one continuous agent conversation with a stable ID, bounded time window, and extractable turns/tool events — **not** a nightly log line and **not** an Electron cache blob.

| Harness | Unit | Primary path (prefer live) | Count (live 2026-09-15) |
| --- | --- | --- | --- |
| **Cursor agent** | 1 `*.jsonl` under `agent-transcripts/<uuid>/` | `~/.cursor/projects/**/agent-transcripts` | **941** |
| Cursor UI chats | 1 thread dir (`meta.json` + `store.db`) | `~/.cursor/chats` | ~5 threads / 10 files |
| **Codex** | 1 `rollout-*.jsonl` | `~/.codex/sessions` + `archived_sessions` (+ dump for older) | **138** live rollouts; dump **562** files |
| **Claude Code** | 1 project `*.jsonl` | `~/.claude/projects/**` | **9** (dump stale) |
| **pi** | 1 session `*.jsonl` | `~/.pi/agent/sessions/**` | **88** |
| **omp** | 1 session `*.jsonl` | Prefer **dump/omp** (178); live almost empty | dump **178** |
| **dsh** | 1 `session.jsonl.zstd` | `~/.dsh/sessions/**` | **18** |
| **jcode** | project memory JSON (weaker chat unit) | dump/jcode | **744** files — normalize carefully |
| **prime** | session-artifact dir | dump only | **30** files |
| coworker / copilot / chatgpt-local | export-specific | dump (+ thin live copilot) | tiny |
| multiharness_60m_export | **not a session** | chat-histories root | **28** logs — use as **index hints** only |
| App Support Cursor **19G** | **exclude** Cache/GPU/etc. | — | not corpus |

**Absent on machine:** aider, continue, windsurf, amp, goose, live `~/.prime`, live coworker home.

### Normalize fields (code extracts; no secrets)

```text
harness, session_id, source_path, started_at, ended_at,
project_cwd_or_slug, message_count, tool_call_count,
models[], urls_pr_issue[], paths_touched[], commit_shas[],
text_excerpt_redacted (≤N chars, after privacy filter),
lifecycle_features{}  # deterministic joins
```

**Dedup:** hash `(harness, session_id)` and for Codex/Cursor also filename UUID; prefer **newer mtime / live path** over dump duplicate.

**Socratink filter (optional pilot slice):** Cursor project slug contains `socratink` (~200+ transcripts among the 941).

---

## 2. Deterministic lifecycle features (code) vs Jev judgments

### Join in **code** (Tier-1) — Axis A backbone

| Feature | How |
| --- | --- |
| `commits_in_window` | `git log --since/--until` on `project_cwd` overlapping session timestamps |
| `files_changed_overlap` | intersect `paths_touched` from tools with `git diff --name-only` in window |
| `pr_urls` / `issue_urls` | regex extract from transcript; resolve via `gh` if authorized later |
| `test_green_mentions` | deterministic string/tool-exit signals (`pnpm check`, CI green) — **signal only**, not truth |
| `repo_is_socratink` | cwd/slug match |
| `duration_min`, `tool_density` | from timestamps / tool events |
| `has_write_tools` | tool names that edit files |

These become **state fields** for Jev and **hard boosts/gates** in ranking code (composite scoring pattern: weights owned by code — [composite-scoring.md](https://docs.typesafe.ai/patterns/composite-scoring.md), 2026-09-15).

### Semantic judgments for **Jev** (System One)

Use when text meaning matters: “did this session actually decide architecture?”, “is this ICP/pricing signal durable?” — not for counting commits.

Patterns: composite scoring, map-reduce over corpus, ranking ([use-case-map](https://docs.typesafe.ai/concepts/use-case-map.md)).

---

## 3. Proposed Noul / Choice / Score questions

### Shared state sketch

```json
{
  "session": {
	"harness": "cursor",
	"id": "dc77ee62-…",
	"cwd": "/Users/jondev/dev/active/socratink/product/socratink",
	"started_at": "…",
	"ended_at": "…",
	"excerpt": "…redacted turns…"
  },
  "lifecycle": {
	"commits_in_window": 3,
	"paths_touched_sample": ["src/server/provider.ts"],
	"pr_urls": [],
	"has_write_tools": true,
	"repo_is_socratink": true
  }
}
```

### Axis A — shipping needle

| ID | Prim | Instructions (intent) | Criteria sketch |
| --- | --- | --- | --- |
| `shipped_code_change` | Noul | Did this session drive concrete code that landed (given `lifecycle` + transcript)? | true: edits tied to commits/PRs; false: talk-only / aborted |
| `unblocked_milestone` | Noul | Did it clear a named blocker (CI fail, design fork, missing dep)? | true/false |
| `architecture_decision_landed` | Noul | Was a durable architecture choice made and reflected in code/docs paths? | true/false |
| `needle_band` | Score | How much did this move shipping reality? | 0 talk-only · 1 exploratory patch · 2 meaningful mergeable work · 3 unblocked milestone / landed decision |
| `session_kind_a` | Choice | Primary nature? | `implementation` / `debug` / `design` / `chore` / `noise` |

### Axis B — productization / profitability signal

| ID | Prim | Instructions (intent) | Criteria sketch |
| --- | --- | --- | --- |
| `mentions_icp_or_buyer` | Noul | Durable ICP / buyer / wedge talk (not one-off)? | true/false |
| `pricing_or_packaging` | Noul | Pricing, packaging, willingness-to-pay? | true/false |
| `pedagogical_differentiation` | Noul | Learning-science / eval / axiom-level product moat? | true/false |
| `gtm_or_retention` | Noul | GTM, retention, activation loops? | true/false |
| `brain_worthy` | Noul | Worth saturating into Socratink Brain (durable, non-ephemeral)? | true/false |
| `strategy_band` | Score | Strategic signal density | 0 none · 1 fleeting aside · 2 actionable product insight · 3 doctrine-grade |
| `session_kind_b` | Choice | Dominant strategic theme? | `icp` / `pricing` / `pedagogy` / `gtm` / `moat` / `none` |

Ask Axis A + B questions **in one System One call** per session (parallel fan-out). Keep excerpts short; map-reduce: score many sessions, rank in code.

---

## 4. Composition (ranked lists, no vanity % UX)

```text
axis_a = 0.35 * norm(needle_band)
		+ 0.25 * shipped_code_change
		+ 0.20 * unblocked_milestone
		+ 0.20 * architecture_decision_landed
		+ code_boost(commits_in_window, pr_urls)   # deterministic

axis_b = 0.25 * norm(strategy_band)
		+ 0.20 * brain_worthy
		+ 0.15 * pedagogical_differentiation
		+ 0.15 * mentions_icp_or_buyer
		+ 0.15 * pricing_or_packaging
		+ 0.10 * gtm_or_retention

# Outputs for Captain: ordered lists + top reasons (which Nouls fired)
# NEVER show "73% strategic genius" — show rank, band label, and evidence bullets
```

Weights are Captain-tunable in code ([composite-scoring](https://docs.typesafe.ai/patterns/composite-scoring.md)). Low Choice confidence → downrank or hold for human skim.

**Lifecycle join plan:**
1) Normalize sessions → 2) extract paths/times → 3) git/gh features → 4) privacy filter → 5) Jev batch → 6) compose → 7) two ranked tables (A / B) + optional intersection “shipped AND strategic”.

---

## 5. Privacy / filter rules

**Before any Jev state or report artifact:**

1. Drop lines matching API keys, `sk-`, bearer tokens, `TYPESAFE_API_KEY`, `.env` dumps, private keys, cookies.
2. Redact emails, phone numbers, home addresses.
3. Exclude paths: `**/auth.json`, `**/*secret*`, Browser `Cookies`, full App Support Cache trees.
4. Do **not** send raw tool outputs that include file contents of credential stores.
5. Cap `excerpt` length; prefer user+assistant text + tool **names**, not full diffs with secrets.
6. Reports store **session_id + harness + scores + short rationale** — not full transcripts.
7. Personal non-work projects: optional allowlist (`socratink`, `tink`, job folder) for pilot.

**Assumption:** Captain owns the corpus; still minimize exfiltration surface to TypeSafe API.

---

## 6. Pilot recommendation (first authorized run)

| Choice | Why |
| --- | --- |
| **Primary:** live Cursor `agent-transcripts` filtered to `*socratink*` project slugs (~200 sessions) | Freshest shipping corpus; clear unit; overlaps product work |
| **Secondary:** live Codex `rollout-*.jsonl` (138) **or** dump/omp (178) if Captain wants multi-harness | Codex has strong lifecycle events; omp dump is large legacy |

**Sample size:** start **n=40–60** sessions (stratified: half with `commits_in_window>0`, half without) — calibrate weights before map-reducing hundreds.

**Do not pilot on:** App Support Cursor 19G, jcode dump (weak session unit), prime dill blobs, multiharness logs alone.

---

## 7. Open questions for Captain

1. Allowlist: only Socratink paths, or all Jondev coding sessions in v1 ranking?
2. Axis priority: optimize for A (ship), B (Brain), or intersection first?
3. May an authorized run call TypeSafe API with redacted excerpts off-machine?
4. Is `gh` join allowed for PR enrichment, or git-only?
5. jcode/prime: include as second-class units or defer?
6. ChatGPT desktop (`com.openai.chat` 44M): in-scope as coding-adjacent or exclude?

---

## Outcome summary

Scope expanded to **all harnesses on Jondev**; live inventory written. Design: normalize → deterministic git/lifecycle joins → Jev composite Axis A/B → ranked lists without vanity %. Pilot: **Cursor socratink transcripts + optional Codex/omp**, n≈40–60, **no scoring until Captain authorizes**.
