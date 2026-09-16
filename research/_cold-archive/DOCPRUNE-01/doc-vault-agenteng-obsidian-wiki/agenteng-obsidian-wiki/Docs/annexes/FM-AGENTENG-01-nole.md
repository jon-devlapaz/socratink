---
title: "FM-AGENTENG-01 — Nole annex (waste & tighten)"
source_url: "file:///workspace/socratink/research/chat-signal/wiki-source/agenteng/annexes/FM-AGENTENG-01-nole.md"
source_kind: "agenteng-documentation"
generated: true
synced_at: "2026-09-16T02:33:24Z"
content_hash: "d639059e414465b309458b83c42a7d2801b148c67b475f2478b839fcca621643"
---

<!-- Nole MERGE-FINAL + W0 deepen re-merged into master (Researchy 2026-09-15 ~22:00 CT). Prefer this over earlier Nole drafts. -->

# FM-AGENTENG-01 — Nole annex (waste & tighten)

**As-of:** 2026-09-15 20:53 CT (W0 reclaimable inventory deepen — **after MERGE-FINAL**; Researchy may re-merge)
**Lane:** Nole the Auditor (research-only Keep / Fix / Cut)
**Ticket:** FM-AGENTENG-01 — Captain multi-bot deep inventory
**North star:** Reduce waste and tighten the agentic stack without deleting capability Captain still uses.
**Mutation:** none (no deletes, revokes, connector changes, or agent messages).
**Doctrine:** FM-CTXSMELL-01 taxonomy T1–T12 + Captain/Agent playbooks; FM-BOTFIND-01 for loops.

## Scope & method

1. **Box inventory (verified):** `/home/box/agent-data` (= `/home/box/sand-data`) — agents, workflows, managed-skills, plugins, transcripts, settings sidebar, grok-ship + firstmate packs.
2. **Twin diffs:** md5 + unified-diff summary for 4 workflow↔grok-ship pack skill pairs (adversarial-review, ahoy, lavish-session, project-management).
3. **Mac:** machineId `3ac411d5-1001-4beb-baf5-a38080401d80` (Jondev.local). Full `~/.agents` re-scan incomplete in-executor; CTXSMELL supplies Mac path evidence (`/Users/jondev/...`). Parent CopyFromBox if Mac overwrite not available here.
4. **Judgment rule:** score 0–3 on (A) charter clarity, (B) recent outcome evidence, (C) uniqueness, (D) cost if kept. **Cut if A+B+C ≤ 3 and D ≥ 2.** **Keep if A≥2 and (B≥2 or C≥2).** Else **Fix**. Scores in Notes.
5. **EXTRACT mapping:** every Cut/Fix row tagged **Smell → Habit restored** (CTXSMELL T-ids where applicable).
6. Tools/connectors as **controls:** Keep grant / Correct narrow-gate / Lay off revoke.

### CTXSMELL smell index (used below)

| ID | Smell |
| --- | --- |
| T1 | Validation-driven scope substitution |
| T2 | Tool thrash / path thrash |
| T3 | Lost goal / plate drift |
| T4 | Ignored standing instructions |
| T5 | Wrong cwd / worktree gap |
| T6 | Context stuffing / prompt bloat |
| T7 | Missing verification |
| T8 | Hallucinated / assumed state |
| T9 | Multi-agent / handoff rot |
| T10 | Premature stop / recovery failure |
| T11 | Secret / exfil risk |
| T12 | Learning-context / information overload |
| G1 | Unnamed bots / roster governance *(ops extension)* |
| G2 | Dual-source skill drift *(ops extension)* |
| G3 | Dead capture / over-instrumentation *(ops extension)* |
| G4 | Disk sprawl without outcomes *(ops extension)* |

## Evidence inventory (what you read, sizes, counts)

| Artifact | Path | Size / count |
| --- | --- | --- |
| Agent profile dirs | `/home/box/agent-data/agents/*/` | **9** with `profile.json` |
| Sidebar | `settings.json` | socratink **5** · archived **18** · pinned **3** (2 pins missing dirs) |
| Agent transcripts | `agent-transcripts/` | **146** folders · **140.08 MB** (146 888 658 B / **0.14 GiB**) |
| `sand-subagent-*` | same | **133** folders · **65.03 MB** (68 183 776 B / **0.06 GiB**) |
| Cloud agent transcripts | `/workspace/cloud-agent-transcripts` | **4.5 MB** / 18 |
| audit-outbox | `agents/audit-outbox.json` | **2.48 MB** |
| Workflow SKILL.md | `workflows/` | **22** · ~128 KB |
| Managed skills | `managed-skills/skills/` | **32** · ~377 KB (~386 KB trees) |
| Plugin SKILL.md | `plugins/cache/cursor-public/` | **130** · ~894 KB |
| Grok-ship pack skills | `grok-ship/pack/skills/` | **7** · ~32 KB |
| Workspace SKILL.md | `/workspace/**` | **73** · ~880 KB |
| **SKILL.md total** | — | **264** · **~2.3 MB** text |
| Firstmate dir | `713074ca…` | **14.92 MB** (assets **14.57 MB** / 184 files) |
| Competitor Watch dir | `bfb86c9a…` | **24.68 MB** (assets **20.34 MB** / 279 files; conversation-blobs **3.5 MB**) |
| Researchy dir | `8a97d918…` | **4.78 MB** |
| QC/landing clones (primary 4) | see W0 inventory | **3176 MB** du-sm sum · **2 993 513 259 B** · **2.79 GiB** |
| Strata pack (peer) | `agenteng-runs/strata-pack.json` | ~900 KB · n=59 |

### Largest agent dirs (MB)

| MB | Bot | ID |
| ---: | --- | --- |
| 24.68 | Competitor Watch | bfb86c9a-eb24-4fa6-aa35-f1f0174afc4b |
| 14.92 | Firstmate | 713074ca-c8e7-46d4-97be-2760d32a65cf |
| 4.78 | Researchy | 8a97d918-7c78-409f-89bf-fbee51896ecc |
| 0.09 | Job Assist / New Bot / New Agent | (three stubs) |
| 0.08 | loops / dr eggbot / Nole | (lean profiles) |

### Firstmate / Competitor Watch asset breakdown

| Bot | Subdir | MB | Files |
| --- | --- | ---: | ---: |
| Firstmate | assets | **14.57** | 184 |
| Firstmate | attachments | 0.06 | 3 |
| Firstmate | profile.json | 0.008 | — (8040-char description) |
| Firstmate | store/blobs | ~0.25 | — |
| CW | assets | **20.34** | 279 |
| CW | conversation-blobs.db | **3.45** | — |
| CW | attachments | 0.11 | 7 |
| CW | audit.jsonl | 0.33 | — |
| CW | automations | ~0 | 2 (both `enabled=false`, `lastRunAt=null`) |

### Top 10 transcript folders (MB)

| MB | Folder |
| ---: | --- |
| **53.04** | `1643d9f1-5501-4fa9-b79a-06ecdda37627` (archived ghost crew) |
| **17.86** | `sand-subagent-80e9dd50-…` |
| **12.63** | `9138bec9-16ad-4f98-acc9-f5012e1980cd` (archived) |
| **6.52** | `sand-subagent-c307a515-…` |
| **3.00** | `9203f4b7-e469-4635-8640-2fbbc699e53c` (archived) |
| **2.57** | `sand-subagent-de6e2911-…` |
| **2.06** | `91a574c6-cdc7-4d8f-8dd4-a7eb3986e8c2` (dead pin, no profile dir) |
| **1.22** | `836da0a9-65bd-479d-89f1-1a520be235d9` (archived) |
| **1.21** | `sand-subagent-25d9ffe7-…` |
| **1.16** | `sand-subagent-197a7415-…` |

### QC / sprawl dir breakout (MB)

| MB | Dir | Outcome signal |
| ---: | --- | --- |
| **831** | `/workspace/socratink-landing-page` | Fat Next tree + repeated REPORT.md |
| **792** | `/workspace/socratink-pr2-qc` | QC dump |
| **783** | `/workspace/socratink-pr3-qc` | QC dump |
| **770** | `/workspace/socratink-pr4-qc` | QC dump |
| 9 | `socratink-app-scout` | Scout notes — keep one |
| 9 | `socratink-app-legacy-scout` | Near-duplicate |
| 3 | `scout-land-jobs` / `scout-app-handoff` / `contract-slip-gate` | Small REPORT stacks |
| 2 | `socratink-landing-qc` | Lighter QC |

**Sum hot QC/landing:** ~**3176 MB**.

### Quantified SKILL.md counts by harness

| Harness | Count | Text KB | Notes |
| --- | ---: | ---: | --- |
| plugins cache | 130 | 894 | vercel **51** + pstack **50** dominate |
| workspace copies | 73 | 880 | Mirrors of workflows/plugins |
| managed-skills | 32 | 377 | **12 site-playbooks-*** lifestyle |
| workflows | 22 | 128 | Crew recipes + perspectives |
| grok-ship pack skills | 7 | 32 | 4 names twin workflows (**diverged md5**) |
| Mac `~/.agents` | *unknown this run* | — | CTXSMELL: `subagent-sprawl` on Mac |
| **Total (box+workspace)** | **264** | **~2312** | |

### Plugin skill density

| Plugin | SKILL.md | Text KB |
| --- | ---: | ---: |
| vercel | 51 | 553.5 |
| pstack | 50 | 206.0 |
| cursor-team-kit | 18 | 47.5 |
| slack | 6 | 55.1 |
| x | 1 | 19.4 |
| pr-review-canvas / docs-canvas | 1 each | ~8 |
| github / gmail / google-drive | 0 | 0 |


## W0 reclaimable inventory (measured 2026-09-15 20:53 CT)

*Measured with `du -sm` + `du -sb`. GiB = bytes/1024³. Research-only — no deletes. Deepen **after MERGE-FINAL** lock.*

### W0 totals

| Estimate | What is included | Bytes | MB (approx) | GiB |
| --- | --- | ---: | ---: | ---: |
| **Conservative** | Primary 4 QC/landing clones only | 2 993 513 259 | 3176 (du-sm) / 2855 (bytes/MiB) | **2.79** |
| **Aggressive** | Primary QC + flagged archived transcripts + sand-subagent-* + audit-outbox + secondary ≥2 MB | **3,173,164,280** | 3026.17 | **2.96** |

**Precise aggressive sum (bytes):**
- Primary QC: **2 993 513 259**
- Flagged archived/huge transcripts (5 paths): **75 440 228** (1643d9f1+9138bec9+9203f4b7+91a574c6+836da0a9)
- sand-subagent-* (133 folders): **68 183 776**
- audit-outbox.json: **2 599 171**
- Secondary similar dirs ≥2 MB (11 paths, excl. primary): **33,427,846** B
- **Aggressive total: 3,173,164,280 B = 3026.17 MiB = 2.96 GiB**

**Conservative total: 2 993 513 259 B = 2.79 GiB** (primary QC only).

Smell → Habit for W0: **G4 disk sprawl / G3 dead capture** → **archive-before-clone** + **TTL / cold-archive dead capture**.

### Primary QC / landing clones (exact paths)

| path | size_MB (du -sm) | size_bytes | size_GiB | action | risk if cut |
| --- | ---: | ---: | ---: | --- | --- |
| `/workspace/socratink-landing-page` | 831 | 786 877 355 | **0.73** | cold-archive | Lose landing QC baseline / node_modules tree |
| `/workspace/socratink-pr2-qc` | 792 | 746 717 829 | **0.70** | cold-archive | Lose PR2 visual QC |
| `/workspace/socratink-pr3-qc` | 783 | 736 794 030 | **0.69** | cold-archive | Lose PR3 visual QC |
| `/workspace/socratink-pr4-qc` | 770 | 723 124 045 | **0.67** | cold-archive | Lose PR4 visual QC |
| **PRIMARY TOTAL** | **3176** | **2 993 513 259** | **2.79** | archive first, then drop from hot `/workspace` | Confirm no open PR still needs a live tree |

### Secondary similar dirs (≥2 MB; optional W0+)

| path | size_MB | size_bytes | size_GiB | action | risk if cut |
| --- | ---: | ---: | ---: | --- | --- |
| `/workspace/socratink-app-legacy-scout` | 9 | 7 449 275 | 0.01 | Cut one of scout pair | Pick wrong “latest” scout |
| `/workspace/socratink-app-scout` | 9 | 7 449 275 | 0.01 | Keep one | — |
| `/workspace/jobs-stranger-prod` | 4 | 4 031 052 | 0.00 | archive/index | Gate residue |
| `/workspace/scout-land-jobs` | 3 | 2 516 279 | 0.00 | archive/index | Small REPORT stack |
| `/workspace/scout-app-handoff` | 3 | 2 426 688 | 0.00 | archive/index | Small REPORT stack |
| `/workspace/contract-slip-gate` | 3 | 1 677 299 | 0.00 | archive/index | Small REPORT stack |
| `/workspace/live-sample-pr3` | 2 | 2 005 609 | 0.00 | archive | Gate residue |
| `/workspace/live-stranger-pr2` | 2 | 1 960 988 | 0.00 | archive | Gate residue |
| `/workspace/jobs-pr2-gate` | 2 | 1 489 232 | 0.00 | archive | Gate residue |
| `/workspace/socratink-landing-qc` | 2 | 1 204 376 | 0.00 | archive | Lighter QC (after fat landing archived) |
| `/workspace/ship-land-signal-pr3` | 2 | 1 217 773 | 0.00 | archive | Ship residue |
| **SECONDARY ≥2 MB TOTAL** | — | **33,427,846** | **0.03** | optional with aggressive | Low |

### Top 15 transcript folders (exact paths)

| path | size_MB | size_bytes | size_GiB | action | risk if cut |
| --- | ---: | ---: | ---: | --- | --- |
| `/home/box/agent-data/agent-transcripts/1643d9f1-5501-4fa9-b79a-06ecdda37627` | **53.04** | 55 615 311 | 0.05 | **cold-archive** (archived ghost) | Lose forensics for dead crew |
| `/home/box/agent-data/agent-transcripts/sand-subagent-80e9dd50-c911-4f67-a007-a69e69525f52` | **17.86** | 18 727 746 | 0.02 | TTL / cold-archive | Lose one thrash forensics |
| `/home/box/agent-data/agent-transcripts/9138bec9-16ad-4f98-acc9-f5012e1980cd` | **12.63** | 13 242 116 | 0.01 | cold-archive (archived) | Low |
| `/home/box/agent-data/agent-transcripts/sand-subagent-c307a515-f57a-4861-af1e-c8363229d20f` | **6.52** | 6 835 282 | 0.01 | TTL | Low |
| `/home/box/agent-data/agent-transcripts/9203f4b7-e469-4635-8640-2fbbc699e53c` | 3.00 | 3 146 351 | 0.00 | cold-archive (archived) | Low |
| `/home/box/agent-data/agent-transcripts/sand-subagent-de6e2911-b6fd-4dc9-ab6c-b1c7d3fc763c` | 2.57 | 2 695 255 | 0.00 | TTL | Low |
| `/home/box/agent-data/agent-transcripts/91a574c6-cdc7-4d8f-8dd4-a7eb3986e8c2` | 2.06 | 2 162 233 | 0.00 | cold-archive (dead pin) | Low |
| `/home/box/agent-data/agent-transcripts/836da0a9-65bd-479d-89f1-1a520be235d9` | 1.22 | 1 274 217 | 0.00 | cold-archive (archived) | Low |
| `/home/box/agent-data/agent-transcripts/sand-subagent-25d9ffe7-ffe9-4569-80c6-2f27767b5184` | 1.21 | 1 269 576 | 0.00 | TTL | Low |
| `/home/box/agent-data/agent-transcripts/sand-subagent-197a7415-4718-44af-bcb8-174fb2621ee3` | 1.16 | 1 213 069 | 0.00 | TTL | Low |
| `/home/box/agent-data/agent-transcripts/sand-subagent-34e1f69c-ba1b-44aa-99e4-55a86660828c` | 1.15 | 1 202 939 | 0.00 | TTL | Low |
| `/home/box/agent-data/agent-transcripts/sand-subagent-4c2a2b30-64f0-4509-85ff-5398ae51f7db` | 1.06 | 1 109 461 | 0.00 | TTL | Low |
| `/home/box/agent-data/agent-transcripts/8a97d918-7c78-409f-89bf-fbee51896ecc` | 1.04 | 1 094 237 | 0.00 | **Keep** (Researchy live) | Breaks live desk history |
| `/home/box/agent-data/agent-transcripts/sand-subagent-d2ff426c-dfb6-490f-9a1b-fd5919a9c4a1` | 1.03 | 1 081 615 | 0.00 | TTL | Low |
| `/home/box/agent-data/agent-transcripts/sand-subagent-0a4209f4-8988-402a-9b27-be7298154df4` | 1.02 | 1 073 263 | 0.00 | TTL | Low |

**≥5 MB only (4 folders): 94 420 455 B = 0.09 GiB.**

**sand-subagent-* aggregate:** **133** folders · **68 183 776 B** · **65.03 MB** · **0.06 GiB** → action **TTL** (retain-on-fail).

**Flagged archived/huge transcripts (5 paths, excl. live Researchy):** **75,440,228 B** · **71.95 MB** · **0.07 GiB** → **cold-archive**.

**audit-outbox:** `/home/box/agent-data/agents/audit-outbox.json` · **2 599 171 B** · **2.48 MB** → **rotate/bound**.

*Alias note:* `/home/box/agent-data/agent-transcripts` → `/home/box/sand-data/agent-transcripts` (same inode tree).


## Twin diffs — workflow ↔ grok-ship pack (4 skills)

Paths: workflow = `/home/box/agent-data/workflows/<name>/SKILL.md` · pack = `/home/box/agent-data/grok-ship/pack/skills/<name>/SKILL.md`

| Skill | Workflow md5 | Pack md5 | Lines (wf/pack) | Key delta | Fix action |
| --- | --- | --- | --- | --- | --- |
| **adversarial-review** | `6a90b7b9e256be359a014fc4da1fb18d` | `4550280a4986b1924a5e44837d647f24` | 89 / 90 | Frontmatter only: workflow quotes `description:` with single quotes; pack unquoted + trailing blank. **Body effectively identical.** | **Fix:** sync frontmatter; treat as one file. Prefer **pack** as ship canon, copy into workflows (or symlink). |
| **ahoy** | `832ffff721d45a2001bf1b1bc1bd4b10` | `466365fdc1547f26b60f740a9552c285` | 58 / 55 | Workflow uses YAML `>-` folded description (5 lines); pack collapses to one-line description. Body same intent. | **Fix:** single-source description text; pack wins for Grok Ship. |
| **lavish-session** | `3405442e813fd04fe66486645ca0c4a9` | `964f2a297947697e1a7263b72839be48` | 88 / 91 | **Material frontmatter drift:** workflow `name: Lavish session` + multi-line description; pack `name: lavish` + `license: MIT` + `metadata.author` / hermes-tags / hermes-category / argument-hint. Different packaging identity. | **Fix:** decide one identity (`lavish` vs `Lavish session`); merge metadata into pack; workflows must not fork. |
| **project-management** | `e99dbb1793731c88818d0733c1aa6e8b` | `5741da4a3d388179a134064d5da913ae` | 91 / 92 | Diff ≈ **trailing newline only** (+1 blank). | **Fix:** normalize EOF newline; trivial — still dual-path risk. |

**Smell → Habit:** **G2 dual-source drift** → **single-source skills** (pack canonical; workflows = checkout of pack).

## Skill collision table (expanded)

| Skill | Locations | Content | Decision | Smell → Habit |
| --- | --- | --- | --- | --- |
| adversarial-review | workflows + pack | Diverged md5 (frontmatter) | **Fix** single-source | G2 → single-source skills |
| ahoy | workflows + pack | Diverged (YAML fold) | **Fix** | G2 → single-source |
| lavish-session | workflows + pack | Diverged (name/metadata) | **Fix** | G2 → single-source |
| project-management | workflows + pack | Diverged (newline) | **Fix** | G2 → single-source |
| steve-jobs-perspective | workflows + workspace | Twin; **654L** | **Cut** workspace copy; on-demand only | T6/T12 → load-on-demand perspectives |
| sal-khan-perspective | workflows + workspace | Twin; **0 crew refs**; 278L | **Cut** | T6 + orphan → load-on-demand / archive |
| socratink-brain | workflows + workspace | Twin | **Keep** one; Fix pointers | G2 → single-source |
| engram | workflows + workspace | Twin; **0 refs** | **Cut** | skill sprawl → named active set only |
| karpathy-guidelines | plugins + workspace (3×) | Multi | **Fix** one pointer | G2 → single-source |
| thermo-nuclear-code-quality-review | plugins + workspace | Multi | **Fix** | G2 → single-source |
| upstream (plugin internal) | plugins ×11 | Version cache copies | **Keep** (cache) / ignore | — |

### Orphan / unused skills (refs≈0)

| Skill | Bytes | A/B/C/D | Verdict | Smell → Habit |
| --- | ---: | --- | --- | --- |
| coding-tool-router | 1222 | 0/0/0/1 | **Cut** | skill sprawl → active set only |
| connect-lenny-s-data | 2297 | 0/0/0/1 | **Cut** | skill sprawl → active set only |
| engram | 523 | 0/0/0/1 | **Cut** | skill sprawl → active set only |
| strip-ai-isms | 1456 | 0/0/0/1 | **Cut** | skill sprawl → active set only |
| firstmate-first-run | 3702 | 1/0/1/1 | **Fix→archive** | dead setup residue → archive-before-clone |
| sal-khan-perspective | 22896 | 1/0/1/2 | **Cut** default attach | T6 → load-on-demand |
| site-playbooks-* (×12) | ~236 KB | — | **Lay off** on Socratink crew | T6 → lay off lifestyle skills |

Low-ref (≤2) but role-owned: watch-list / competitor-page-diff / pricing / weekly-brief / grok-cli-research-pass → **Fix** wiring (T7 missing verification / charter gap), not Cut.

## Crew / bot roster findings

### Live socratink sidebar (5) — Keep core

| Bot | ID | Disk MB | Charter |
| --- | --- | ---: | --- |
| Firstmate | 713074ca… | 14.92 | Captain pane; **8040 chars / 51 lines** description |
| dr eggbot | 602cf413… | 0.08 | Designs bots |
| Competitor Watch | bfb86c9a… | 24.68 | Public diffs; automations **paused never-run** |
| Researchy | 8a97d918… | 4.78 | Evidence desk |
| loops | 1833464b… | 0.08 | Outer loop + pstack |

### Unnamed New Bot / New Agent — emptiness evidence

| Field | New Bot `0afca9ff-4922-4b07-98cb-aa64a0814db2` | New Agent `9b1a1ad1-a860-4554-8fdf-ff3a3e7e4eea` |
| --- | --- | --- |
| Sidebar | **Unassigned** (not in socratink/archived lists) | **archived** |
| Disk | 0.09 MB (store.db empty shell + 122B profile) | 0.09 MB (104B profile) |
| `name` | `"New Bot"` | `"New Agent"` |
| `description` / `title` | **""** / **""** | **""** / **""** |
| `namedBy` | `"app"` | *(absent)* |
| memory / automations / attachments | **none** | **none** |
| settings | only `notifyOnAgentUpdates: true` | same |
| A/B/C/D | **0/0/0/1** | **0/0/0/1** |
| Verdict | **Cut** | **Cut** |
| Smell → Habit | **G1 unnamed bots** → **named agents only** | same |

### Off-sidebar named bots

| Bot | ID | A/B/C/D | Verdict | Smell → Habit |
| --- | --- | --- | --- | --- |
| Job Assist | 59994452… | 2/0/2/1 | **Fix** (sidebar or Captain-confirmed Cut) | G1 governance → named agents in a section |
| Nole the Auditor | 7083d34f… | 3/2/2/1 | **Fix** — add to socratink/ops | G1 → named agents crewed |

### Archived / ghost roster

- **18** archived IDs; **16** lack `/agents/<id>/` (ghosts).
- Dead pins: `5cd14cd6…`, `91a574c6…` (no profile dirs). Keep pin **Firstmate** only.
- Transcript `1643d9f1…` = **53.04 MB** still on disk for archived ID.

## Context-stuffing offenders (measured)

| Offender | Bytes | Lines | Default-load risk | Smell → Habit |
| --- | ---: | ---: | --- | --- |
| steve-jobs-perspective SKILL | 33193 | **654** | High if attached | T6/T12 → load-on-demand perspectives |
| sal-khan-perspective SKILL | 22896 | **278** | High + orphan | T6 → load-on-demand / Cut |
| lavish-session SKILL (workflow) | 14226 | 88 | Medium | T6 → invoke-only |
| typesafe-ai SKILL | 9904 | 75 | Medium | T6 → invoke-only |
| firstmate-charter SKILL | 8716 | 68 | Medium (FM only) | Keep scoped |
| outer-loop SKILL | 5843 | 110 | OK for loops | Keep on loops |
| Firstmate profile description | 8040 chars | **51** | **Every turn** | T6 → shorten charter; pointers out |
| `/workspace/socratink-flue/AGENTS.md` | 12138 | **277** | High in that tree | T6/T12 → shorten; load-on-demand |
| flue variate AGENTS.md | 6555 | 122 | Nested | T6 → pointer |
| app-scout AGENTS.md (×2) | 4732 each | 85 | Dup trees | G4 → one scout |
| chat-signal AGENTS.md | **158** | **5** | Low — **model** | Keep short AGENTS habit |
| GitHub `jon-devlapaz/socratink` AGENTS.md | 12138 | ~277 | Matches flue size | T6 — Fix tripwires not more docs |

## Context smell & dead paths

| Smell | Evidence |
| --- | --- |
| T2 thrash | 133 sand-subagent folders; CTXSMELL 45/50 ≥3 identical sigs |
| T6 stuffing | 654L perspective; 8040-char FM desc; 277L AGENTS |
| T7 under-verify | CW automations never ran; assets 20 MB |
| T9 handoff rot | CTXSMELL sprawl boot.py; subagent transcript pile |
| G1 unnamed bots | New Bot / New Agent empty profiles |
| G2 dual-source | 4 pack↔workflow md5 mismatches |
| G3 dead capture | 53 MB archived transcript; audit-outbox 2.48 MB |
| G4 disk sprawl | 3176 MB QC/landing clones |

## Keep / Fix / Cut table

*A charter · B outcomes · C uniqueness · D cost. Cut if A+B+C≤3 & D≥2; Keep if A≥2&(B≥2|C≥2); else Fix. **Smell → Habit** column is EXTRACT-required.*

| Item | Verdict | Size (MB) | Risk if wrong | Notes A/B/C/D | Smell → Habit restored |
| --- | --- | ---: | --- | --- | --- |
| Socratink 5 (FM, eggbot, CW, Researchy, loops) | **Keep** | — | Breaks factory | 3/2–3/3/2 | — → keep crew happy-path |
| loops GitHub/Cursor/pstack | **Keep grant** | — | Can't verify PRs | control | T7 → verified outer-loop |
| Firstmate coding/cloud grants | **Correct narrow-gate** | — | Approval hole | control | T11/approval → narrow-gate |
| site-playbooks on coding bots | **Lay off** | ~0.2 | None for product | control | T6 → lay off lifestyle |
| **New Bot** 0afca9ff | **Cut** | 0.09 | Near-zero | **0/0/0/1** | **G1 → named agents only** |
| **New Agent** 9b1a1ad1 | **Cut** | 0.09 | Near-zero | **0/0/0/1** | **G1 → named agents only** |
| Job Assist | **Fix** | 0.09 | Lose job ontology | **2/0/2/1** | G1 → named agents in a section |
| Nole | **Fix** | 0.09 | Auditor unused | **3/2/2/1** | G1 → named agents crewed |
| Ghost archived IDs + dead pins | **Fix** | — | UI confusion | 0/0/0/2 | G1 → clean roster |
| Transcript 1643d9f1 | **Cut→cold archive** | **53.04 MB / 0.05 GiB** (55 615 311 B) | Lose forensics | 0/0/0/**3** | **G3 → TTL / archive dead capture** |
| sand-subagent transcripts | **Fix** TTL | **65.03 MB / 0.06 GiB** (68 183 776 B, 133 folders) | Lose rare handoff | 0/1/0/3 | **T2/T9/G3 → TTL transcripts** |
| audit-outbox unbounded | **Fix** rotate | **2.48** | Lose audit | 1/1/0/2 | **G3 → bound instrumentation** |
| steve-jobs-perspective default | **Cut** default | 0.03+tok | Lose taste pass | 2/1/2/**2** | **T6/T12 → load-on-demand perspectives** |
| sal-khan-perspective | **Cut** | 0.02 | Low | **1/0/1/2** | **T6 → load-on-demand / archive** |
| Workflow orphans (4 small) | **Cut** | <0.02 | Break unused ritual | **0/0/0/1** | skill sprawl → active set only |
| Twin pack↔workflow (4) | **Fix** | — | Doctrine drift | 2/1/1/2 | **G2 → single-source skills** |
| firstmate/pack vs grok-ship/pack | **Fix** | 0.01 | Stale CREWMATE | 2/1/1/2 | **G2 → single charter pack** |
| CW paused automations | **Fix** | — | Spam if blind-enable | 2/**0**/2/2 | **T7 → verify or delete routines** |
| CW assets 279 files | **Fix** prune | **~20** | Delete good briefs | 2/1/1/**3** | **G4 → prune attachments** |
| Firstmate assets 184 files | **Fix** prune | **~14.6** | Lose brand assets | 2/1/1/**3** | **G4 → prune assets** |
| QC clones pr2/3/4 + landing | **Cut→archive** | **3176 MB / 2.79 GiB** (2 993 513 259 B) | Lose QC baseline | **0/0/1/3** | **G4 → archive-before-clone** |
| legacy-scout vs app-scout | **Cut** one | **9** | Pick wrong latest | 1/1/1/2 | **G4 → one scout tree** |
| subagent-sprawl w/o outcome fields | **Fix** | Mac | Over-gate | 2/0/2/2 | **T9 → packet outcome/cwd/proof/stop** |
| Product AGENTS thrash tripwire | **Fix** | — | False stops | 2/2/2/1 | **T2/T4 → thrash stop habit** |
| chat-signal AGENTS short | **Keep** | — | — | 3/3/2/0 | model → short AGENTS |
| pstack plugin | **Keep** | ~0.2 | Weakens loops | 3/2/3/1 | T7 → pstack for outer-loop |
| vercel skill pile (51) | **Fix** attach | — | Context bloat | 1/1/1/3 | **T6 → load route skill only** |
| Workspace perspective/skill dups | **Cut** dups | <1 | Break flue offline | 1/0/1/2 | **G2/T6 → pointers not copies** |
| socratink-flue AGENTS 277L | **Fix** shorten | 0.01 | Lose local doctrine | 2/1/2/**2** | **T6/T12 → short AGENTS + pointers** |

## Consolidation plan (sequenced)

### Week 0 — Archive disks (no bot deletes yet)
1. Cold-archive primary QC paths (exact): `/workspace/socratink-landing-page` (0.73 GiB), `/workspace/socratink-pr2-qc` (0.70), `/workspace/socratink-pr3-qc` (0.69), `/workspace/socratink-pr4-qc` (0.67) — **2.79 GiB** total; copy unique REPORT lines into `grok-ship/reports/` or product research first.
2. Cold-archive transcript `/home/box/agent-data/agent-transcripts/1643d9f1-5501-4fa9-b79a-06ecdda37627` (**53.04 MB**) + other flagged archived transcripts (**0.07 GiB** set) + bound `audit-outbox.json` (2.48 MB).
3. Habit: **archive-before-clone** (G4).

### Week 1 — Cut unnamed bots + roster hygiene
1. Delete/retire **New Bot** `0afca9ff…` and **New Agent** `9b1a1ad1…` after connector/secret check (profiles empty — low risk).
2. Add **Nole** to socratink/ops sidebar; place **Job Assist** in a life/career section or Captain-confirmed Cut.
3. Purge ghost archived IDs + dead pins (`5cd14cd6…`, `91a574c6…`).
4. Habit: **named agents only** (G1).

### Week 2 — Skill single-source
1. Declare `grok-ship/pack/skills` canonical for the 4 twins; overwrite workflows from pack (or symlink); normalize lavish name/metadata.
2. Deprecate `firstmate/pack` pointers → `grok-ship/pack`.
3. Remove workspace duplicate perspectives; keep one on-demand path.
4. Cut orphan workflow skills (coding-tool-router, connect-lenny-s-data, engram, strip-ai-isms); archive sal-khan.
5. Habit: **single-source skills** + **load-on-demand perspectives** (G2/T6).

### Week 3 — Connector layoffs + verification
1. **Lay off** site-playbooks / lifestyle skills on Socratink coding/research bots.
2. **Keep grant** loops GitHub + Cursor Cloud + pstack; **narrow-gate** Firstmate (no self cloud-agent).
3. CW: enable automations only with proven delivery destination **or** delete routines; prune ~20 MB assets to latest snapshots.
4. Prune Firstmate assets (~14.6 MB) to needed avatars.
5. TTL policy for `sand-subagent-*` transcripts (retain-on-fail).
6. Product AGENTS: add thrash tripwire (≥3 identical tool sigs ⇒ stop); keep short.
7. Habit: **TTL transcripts** + **verify or delete routines** (T7/G3) + **narrow-gate controls**.

### Steady state (ongoing)
- Default attach: ahoy, crewmate-charter, outer-loop (loops), socratink-brain (product), adversarial-review (PR).
- Mac coding: short AGENTS + CTXSMELL tripwires; sprawl packets require outcome/cwd/proof/stop.
- Firstmate description: compress 8040 chars → pointers to pack docs.

## Confidence & open questions

| Claim class | Confidence |
| --- | ---: |
| Box roster / sizes / twin md5s | **0.90** |
| Smell→Habit mapping on Cut/Fix rows | **0.86** |
| Keep/Fix/Cut placeholders + QC GB | **0.90** |
| Job Assist final Cut vs Fix | **0.55** (Captain) |
| Mac ~/.agents live tree | **0.40** |
| Overall annex (this deepen) | **0.84** |
| W0 reclaimable GiB (du -sb) | **0.95** |

**Open:**
1. Mac overwrite may need parent CopyFromBox (executor catalog gap).
2. Captain: Job Assist keep?
3. Any `socratink-pr*-qc` still backing an open PR?
4. Researchy merges peer strata-pack (n=59) into master AGENTENG separately.

**Ready-for-merge-final:** **YES** (box) — post-MERGE-FINAL W0 deepen; Researchy may re-merge. Mac: parent CopyFromBox. W0 reclaimable **2.79 GiB** conservative / **2.96 GiB** aggressive.

## Paths written

1. `/home/box/agent-data/grok-ship/reports/FM-AGENTENG-01-nole.md` (box) — **overwrite this deepen**
2. `/Users/jondev/dev/active/socratink/product/socratink/research/chat-signal/FM-AGENTENG-01-nole.md` (Mac) — parent CopyFromBox if needed
3. Convenience mirrors: `/workspace/socratink/research/chat-signal/FM-AGENTENG-01-nole.md`, `/workspace/FM-AGENTENG-01-nole.md`
