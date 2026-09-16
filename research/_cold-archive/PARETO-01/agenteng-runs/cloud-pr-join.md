# cloud-pr-join — FM-AGENTENG-01 (PRs #8–#15 ↔ cloud agents)

**As-of:** 2026-09-15 21:05 CT  
**Mode:** research-only · no PR · no SendToUser · no factory.db  
**Repo:** `jon-devlapaz/socratink`  
**Labels:** **Verified** / **Assumption** / **Unknown** (no invented IDE session IDs)  
**UPDATE:** CloudAgent dump closed soft transcript gap — all 7 unique #8–#15 bcId jsonl now **hard** on box.

## Counts

| Axis | hard | soft | none |
| --- | ---: | ---: | ---: |
| **Primary join_confidence** (PR↔bcId identity) | **8** | 0 | 0 |
| Local cloud transcript jsonl | **8** (PR rows) / **7** (unique bc) | 0 | **0** |
| IDE home-live session soft join | 0 | 0 | **8** |

- Unique bcIds for #8–#15: **7** ( #10+#11 share one ).
- Box `/workspace/cloud-agent-transcripts`: **25** files (18 Sep 8–10 + **7** phase dumps) · **7/7** overlap with phase bcIds (**Verified**).

## Per-PR join table

| PR | Title | Branch | Merge commit | bcId | Transcript path | IDE soft join | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **#8** | Phase 1: signed HttpOnly session cookie, n… | `cursor/phase-1-session-cookie-41fb` | `654e9bc27658…` | `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` | **hard** · `/workspace/cloud-agent-transcripts/bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb.jsonl` · 746640 B / 570 lines | **none** | **hard** |
| **#9** | Phase 2: encrypted credential store, not B… | `cursor/phase-2-secret-store-dbaf` | `42d50f70344e…` | `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` | **hard** · `/workspace/cloud-agent-transcripts/bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf.jsonl` · 596339 B / 431 lines | **none** | **hard** |
| **#10** | Phase 3: prove overlapping Chat streams ca… | `cursor/phase-3-hotel-safety-a4b2` | `dd4cdab2b3a9…` | `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` | **hard** · `/workspace/cloud-agent-transcripts/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2.jsonl` · 1395536 B / 965 lines | **none** | **hard** |
| **#11** | Phase 3: wire stored OpenAI keys into Chat | `cursor/phase-3-byok-a4b2` | `102956529182…` | `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` | **hard** · `/workspace/cloud-agent-transcripts/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2.jsonl` · 1395536 B / 965 lines | **none** | **hard** |
| **#12** | Use gpt-5-nano for connected OpenAI BYOK C… | `cursor/cheapest-openai-b412` | `74d3517ad2db…` | `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` | **hard** · `/workspace/cloud-agent-transcripts/bc-423e80fe-fdab-5dce-b9a1-2514ac54b412.jsonl` · 268821 B / 262 lines | **none** | **hard** |
| **#13** | Use Flue instanceId so connected Chat sele… | `cursor/byok-instance-id-a4a1` | `bd7c06cccca2…` | `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` | **hard** · `/workspace/cloud-agent-transcripts/bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1.jsonl` · 687314 B / 360 lines | **none** | **hard** |
| **#14** | Fail closed when Chat lacks a namespaced i… | `cursor/identity-judo-0721` | `8289f0627afb…` | `bc-b64a9488-2d46-5979-95e6-49c567df0721` | **hard** · `/workspace/cloud-agent-transcripts/bc-b64a9488-2d46-5979-95e6-49c567df0721.jsonl` · 312181 B / 212 lines | **none** | **hard** |
| **#15** | Phase 4: OpenRouter PKCE for learner BYOK | `cursor/phase-4-openrouter-pkce-d6bf` | `— (open)` | `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` | **hard** · `/workspace/cloud-agent-transcripts/bc-28d7d9fb-7425-5efa-9900-afe78984d6bf.jsonl` · 1065870 B / 736 lines | **none** | **hard** |

### Detail (labels)

#### #8 — Phase 1: signed HttpOnly session cookie, not BYOK

- **State:** `merged` · merged_at **2026-09-15 00:22 CT**
- **Branch:** `cursor/phase-1-session-cookie-41fb` · head `d71ce9cb968a…`
- **Merge commit:** `654e9bc276588e17f936d41e1cdd0c4be2a62fee` · label **Verified**
- **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb.jsonl` · 746640 B / 570 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** CURSOR_AGENT_PR_BODY_* present; author trail Cursor Agent on commits; captain merge_by jon-devlapaz. Transcript dump hard (746640 B, 570 lines).
- **Diff:** +613/−98 (24 files) · https://github.com/jon-devlapaz/socratink/pull/8

#### #9 — Phase 2: encrypted credential store, not BYOK

- **State:** `merged` · merged_at **2026-09-15 10:26 CT**
- **Branch:** `cursor/phase-2-secret-store-dbaf` · head `71cc207dcb9d…`
- **Merge commit:** `42d50f70344e74bbf42045cc2399b1a396d25939` · label **Verified**
- **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf.jsonl` · 596339 B / 431 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** Distinct bcId from #8; library-first phase. Transcript dump hard (596339 B, 431 lines).
- **Diff:** +688/−7 (7 files) · https://github.com/jon-devlapaz/socratink/pull/9

#### #10 — Phase 3: prove overlapping Chat streams cannot mix learner keys

- **State:** `merged` · merged_at **2026-09-15 13:47 CT**
- **Branch:** `cursor/phase-3-hotel-safety-a4b2` · head `d3612f176e87…`
- **Merge commit:** `dd4cdab2b3a9c628f7335e7288c7de3004694b25` · label **Verified**
- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2.jsonl` · 1395536 B / 965 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** FM-PRREV CONCERN then merged. SAME bcId as #11 (Verified shared cloud agent). Transcript dump hard (1395536 B, 965 lines).
- **Diff:** +302/−2 (6 files) · https://github.com/jon-devlapaz/socratink/pull/10

#### #11 — Phase 3: wire stored OpenAI keys into Chat

- **State:** `merged` · merged_at **2026-09-15 13:50 CT**
- **Branch:** `cursor/phase-3-byok-a4b2` · head `25f168e99688…`
- **Merge commit:** `102956529182a4d5517307317e371801c664155f` · label **Verified**
- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2.jsonl` · 1395536 B / 965 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** Happy follow-up to #10; shares bcId with #10 (hard multi-PR→one agent). Transcript dump hard (1395536 B, 965 lines).
- **Diff:** +661/−22 (21 files) · https://github.com/jon-devlapaz/socratink/pull/11

#### #12 — Use gpt-5-nano for connected OpenAI BYOK Chat

- **State:** `merged` · merged_at **2026-09-15 17:05 CT**
- **Branch:** `cursor/cheapest-openai-b412` · head `cff22246f847…`
- **Merge commit:** `74d3517ad2db52d9b529148f9d31df1b44802f11` · label **Verified**
- **bcId:** `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-423e80fe-fdab-5dce-b9a1-2514ac54b412
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-423e80fe-fdab-5dce-b9a1-2514ac54b412.jsonl` · 268821 B / 262 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** Branch suffix b412 aligns with bcId fragment …b412 (Assumption: intentional fingerprint, not proof). Transcript dump hard (268821 B, 262 lines).
- **Diff:** +21/−8 (3 files) · https://github.com/jon-devlapaz/socratink/pull/12

#### #13 — Use Flue instanceId so connected Chat selects OpenAI

- **State:** `merged` · merged_at **2026-09-15 18:54 CT**
- **Branch:** `cursor/byok-instance-id-a4a1` · head `4539cab1743c…`
- **Merge commit:** `bd7c06cccca24fe8e0b53befcdaf95bcbfb96529` · label **Verified**
- **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1.jsonl` · 687314 B / 360 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** Branch suffix a4a1 aligns with bcId fragment …ea4a1 (Assumption). Transcript dump hard (687314 B, 360 lines).
- **Diff:** +67/−4 (2 files) · https://github.com/jon-devlapaz/socratink/pull/13

#### #14 — Fail closed when Chat lacks a namespaced instance id

- **State:** `merged` · merged_at **2026-09-15 19:41 CT**
- **Branch:** `cursor/identity-judo-0721` · head `530093156a2d…`
- **Merge commit:** `8289f0627afba99076f7223cd2170a968d9eedf9` · label **Verified**
- **bcId:** `bc-b64a9488-2d46-5979-95e6-49c567df0721` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-b64a9488-2d46-5979-95e6-49c567df0721
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-b64a9488-2d46-5979-95e6-49c567df0721.jsonl` · 312181 B / 212 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** Branch suffix 0721 aligns with bcId fragment …0721 (Assumption). Merge message includes (#14). Transcript dump hard (312181 B, 212 lines).
- **Diff:** +51/−68 (2 files) · https://github.com/jon-devlapaz/socratink/pull/14

#### #15 — Phase 4: OpenRouter PKCE for learner BYOK

- **State:** `open` · merged_at **—**
- **Branch:** `cursor/phase-4-openrouter-pkce-d6bf` · head `1896c4bc06f7…`
- **Merge commit:** `n/a` · label **n/a (open)**
- **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` · **Verified** via PR body footer
- **Agent URL:** https://cursor.com/agents/bc-28d7d9fb-7425-5efa-9900-afe78984d6bf
- **Cloud transcript:** **hard** · `/workspace/cloud-agent-transcripts/bc-28d7d9fb-7425-5efa-9900-afe78984d6bf.jsonl` · 1065870 B / 736 lines · label **Verified**
- **IDE session soft join:** none · label **Verified gap (none)**
- **join_confidence:** **hard** (axes: bcId=hard, transcript=hard, ide=none)
- **Notes:** Open in-flight; head revision cited in Proof as 1896c4bc. Branch suffix d6bf aligns with bcId fragment …d6bf (Assumption). Transcript dump hard (1065870 B, 736 lines).
- **Diff:** +1173/−141 (23 files) · https://github.com/jon-devlapaz/socratink/pull/15

## Method

1. **Inventory box cloud artifacts** — `/workspace/cloud-agent-transcripts/*.jsonl` (**25**): prior 18 (Sep 8–10) + CloudAgent dump of 7 phase bcIds (mtime ~2026-09-16 01:58 UTC).
2. **Inventory Mac** — skipped this tranche (CopyFromBox parent-owned); machineId Shell still not routed.
3. **PR bodies** — prior Verified GitHub MCP footers `bcId=` retained.
4. **Merge commits** — prior Verified MCP list_commits retained.
5. **Transcript hard join** — map each #8–#15 bcId → absolute dump path; set `cloud_transcript_status=hard`, size_bytes, n_lines.
6. **IDE soft join** — still **none**; do not invent session IDs.

### Confidence rubric

| Level | Meaning |
| --- | --- |
| **hard** | Verified `bcId` from PR footer URL **and/or** local dump jsonl present at absolute path. |
| **soft** | `cursor/*` + body markers / author only, or Assumption time/path join without bcId. |
| **none** | No cloud fingerprint and no IDE session id. |

## What could not be joined

| Gap | Status | Blocker |
| --- | --- | --- |
| IDE home-live parent session ids for #8–#15 | Verified none in packs; still open | Do not invent session IDs (H51). Dump closes transcript axis only. |
| Mac live re-scan of ~/.cursor | Blocked / skipped | Mac CopyFromBox parent-owned |
| gh CLI mergeCommit field | Blocked; mitigated via MCP | gh not authenticated |

## Corrections vs prior packs

- **Soft transcript gap CLOSED** via CloudAgent dump — overwrite any `missing_on_box` rows.
- Prior join said 0 local transcripts / 18-file inventory with 0 overlap — **stale**.
- IDE session∩PR still open.
- Companion mine: `cloud-pr-join-transcript-mine.md` + `.json`.
- Design lane: `cloud-transcript-lane.md` + `.json`.

## Shared-agent hard edge

- **#10 + #11 → `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2`** (**Verified** identical footer bcId + **one** dump file). Hotel-safety proof and BYOK wire are one cloud agent lineage.

## Transcript mine (dump hard)

See companion **`cloud-pr-join-transcript-mine.md`** (and `.json`). Summary: curated agenteng-transferable happy/smell per bcId; prefer plate/partnership/thrash/verify; labels Verified/Assumption/Inference/Unknown; Socratink-relevance tagged.

## Sources (prefer/extend, not thrash)

- Prior `cloud-pr-join.md`/`.json`, `pr-inventory.json`, `cloud-bc-pr-scan.json`, `loops-v2-session-mine.json`
- CloudAgent dump files under `/workspace/cloud-agent-transcripts/`
- Companion: `cloud-pr-join-transcript-mine.*`, `cloud-transcript-lane.*`

---
*Researchy burn-tranche executor · FM-AGENTENG-01 · cloud-pr-join (dump hard)*
