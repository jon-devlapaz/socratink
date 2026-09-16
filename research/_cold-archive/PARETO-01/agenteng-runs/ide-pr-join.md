# ide-pr-join — FM-AGENTENG-01 (IDE session ∩ PR #8–#15)

**As-of:** 2026-09-15 21:06 CT  
**Mode:** research-only · brain untouched · no factory done · no SendToUser · no PR  
**Repo:** `jon-devlapaz/socratink`  
**Tranche:** Researchy burn-tranche-3 · **T3.1 EXPAND** heuristics  
**Labels:** **Verified** / **Assumption** / **Unknown** — **never invent session IDs**

## Result

| Axis | hard | soft | none |
| --- | ---: | ---: | ---: |
| IDE parent session ↔ PR #8–#15 | **0** | **0** | **8** |

**Status:** **Verified none** — irreducible gap on box after expanded search.  
**Invented IDs:** **0**.

## Per-PR IDE join

| PR | Branch | Head SHA (12) | bcId | IDE soft join | Confidence |
| --- | --- | --- | --- | --- | --- |
| **#8** | `cursor/phase-1-session-cookie-41fb` | `d71ce9cb968a` | `bc-a4ea5a16-…8641fb` | **none** | **none** |
| **#9** | `cursor/phase-2-secret-store-dbaf` | `71cc207dcb9d` | `bc-4c71e723-…01dbaf` | **none** | **none** |
| **#10** | `cursor/phase-3-hotel-safety-a4b2` | `d3612f176e87` | `bc-a6842fef-…5ea4b2` | **none** | **none** |
| **#11** | `cursor/phase-3-byok-a4b2` | `25f168e99688` | `bc-a6842fef-…5ea4b2` | **none** | **none** |
| **#12** | `cursor/cheapest-openai-b412` | `cff22246f847` | `bc-423e80fe-…54b412` | **none** | **none** |
| **#13** | `cursor/byok-instance-id-a4a1` | `4539cab1743c` | `bc-4e0ee7c0-…9ea4a1` | **none** | **none** |
| **#14** | `cursor/identity-judo-0721` | `530093156a2d` | `bc-b64a9488-…df0721` | **none** | **none** |
| **#15** | `cursor/phase-4-openrouter-pkce-d6bf` | `1896c4bc06f7` | `bc-28d7d9fb-…84d6bf` | **none** | **none** |

All rows: `ide_session_soft_join=null` · `ide_session_status=none` · label **Verified gap (none) after T3.1 expand**.

## Method (T3.1 EXPAND)

Soft join allowed only with a **Verified evidence chain** (e.g. merge/head SHA present in an IDE parent transcript ↔ same SHA in cloud dump / PR). Heuristics applied:

1. **SHAs** — merge + head (full, 12-char, 8-char) for all #8–#15  
2. **Branches** — all `cursor/*` phase names  
3. **PR URLs** — `pull/N`, `pulls/N`, `PR #N`  
4. **bcIds** — full `bc-…` strings  
5. **cwd / IDE markers** near tool args — `/Users/jondev`, `agent-transcripts/<uuid>`, `parentSessionId`, `composerId`, `home-live`, `Jondev.local`  
6. **UUID cross-check** — dump session-like UUIDs vs **99** known IDE pack session tokens (sessions-pack + structural mines + pr_lifecycle)

### Search paths tried

| Path | Result |
| --- | --- |
| `/workspace/cloud-agent-transcripts/` 7 phase dumps | Branch/PR/SHA hits **inside cloud lineage** only; **0** Mac IDE parent IDs |
| `sessions-pack.json` (50/199 home-live) | **0** SHA/branch/bc hits; only Sep touch = `16a29d67-…` landing **2026-09-10** |
| `loops-v2-session-mine.json` structural_mines | **0** phase SHA/branch hits; pr_lifecycle #8–#15 `session_join.ids=[]` label none |
| `strata-pack.json` / v2 / v3 | **0** phase hits |
| happy-paths / inventory / evidence-chains / `*-from-mac.md` | Prior **Verified gap** reconfirmed |
| box `~/.cursor/projects` | workspace terminals/tools only — **no** Mac agent-transcripts |
| `/home/box/sand-data/agent-transcripts` | sand-subagent only — **not** Mac IDE |
| Mac `~/.cursor/projects/**/agent-transcripts` | **Not mounted**; machineId Shell no route; CopyFromBox skipped (parent) |

## Rejected false positives (do not promote)

| Token / path | Real identity | Why not IDE soft join |
| --- | --- | --- |
| `9f214c91-39ae-…` | Socratink app `userId` / session cookie in Phase 1 dump tests | Product auth fixture |
| `b8a5dac1-943b-…` | `chatConversationIdFromPath` test conversation id | Product Chat path fixture |
| `bc-a38aaed9-511b-…` | Shared cloud research store under `/cursor/stores/` | Cloud store bcId |
| `sub_b7aacfe8-c2da-…` | Cloud inbox `github_pull_request_pr` subdirectory | Agent inbox path |
| `/home/ubuntu/.cursor/projects/…` | Cloud agent VM project dir | Not Jondev.local |

**Zero** of these appear in the 99-token IDE pack session set.

## Irreducible gap

**Verified:** IDE home-live parent session IDs for #8–#15 are **unavailable** from all box-reachable corpora after T3.1 expand. Cloud axes remain **hard** (PR→bcId + dump jsonl). Unlock = parent Mac CopyFromBox / live `~/.cursor` re-scan, then re-join by SHA without inventing IDs.

## Companion updates

- `cloud-pr-join.md` / `.json` — `ide_*` fields hardened with T3.1 expand evidence (still none×8).  
- Densest catalogs **not** thinned.

## Sources

- `cloud-pr-join.json`, `loops-v2-session-mine.json`, `sessions-pack.json`, strata packs, happy-paths, inventory, phase dump jsonl

---
*Researchy burn-tranche-3 executor · FM-AGENTENG-01 · ide-pr-join (T3.1 EXPAND · Verified none)*


## Parent Mac re-scan (Researchy, 2026-09-15 21:22 CT)

**machineId** `3ac411d5-1001-4beb-baf5-a38080401d80` (Jondev.local) — Shell **succeeded** (connected).

**Searched:** all `~/.cursor/projects/Users-jondev-dev-*socratink*/agent-transcripts` (19 dirs) + product/active paths for:
- 7 phase bcIds
- merge/head SHA prefixes for #8–#15
- branch names `cursor/phase-*`, `identity-judo`, `cheapest-openai`, …
- PR URL fragments

**Result:** **0** file hits. IDE∩PR remains Verified **none×8** after Mac live re-scan — gap looks **irreducible** for cloud-only Ship phases (no IDE parent transcript carries SHA/bcId/branch). Unlock would need a different artifact (e.g. Cursor cloud↔IDE link table) not present in agent-transcripts.
