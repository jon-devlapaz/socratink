# canonical-cd-cr-harvest — FM-AGENTENG-01 T4.3

- **As-of:** 2026-09-15 21:10 CT
- **Job:** FM-AGENTENG-01 Researchy burn-tranche-4 T4.3 — CD-H/CD-S + CR-H/CR-S → canonical extract (net-new only)
- **Mode:** research-only
- **Do-not:** mark factory done; SendToUser; PR; Brain mutation; thin densest happy-nuggets.md / smell-catalog-dense.md; Mac sync
- **Policy:** Loops N*/S* primary canon_id when near-duplicate; else H*/T*. CD-H/CD-S + CR-H/CR-S harvested net-new only; near-dupe → alias. Do not thin densest happy-nuggets.md / smell-catalog-dense.md.

## Counts (honest)

| Metric | Count |
| --- | ---: |
| Candidates (CD-H10+CD-S12+CR-H12+CR-S12) | 46 |
| **n_added** (net-new canon rows) | **20** |
| **n_aliased** (near-dupe → existing N/H/S/T) | **26** |
| **n_skipped** | **0** |
| Pre → post total | 111 → 131 |
| Added happy / smell | 12 / 8 |
| Aliased happy / smell | 10 / 16 |

### By family

| Family | added | aliased |
| --- | ---: | ---: |
| CD-H | 6 | 4 |
| CD-S | 6 | 6 |
| CR-H | 6 | 6 |
| CR-S | 2 | 10 |

## Added (net-new)

| source_id | canon_id | kind | stage | source_priority | claim |
| --- | --- | --- | --- | --- | --- |
| CD-H01 | H79 | happy | review | cloud-dump | Confirmed/rejected validation table as review return shape (verdict table, not narrative agreement). |
| CD-H03 | H80 | happy | plan | cloud-dump | Isolation FAIL→stop / PASS→draft PR branch gate: binary safety gate forbids complexity-on-failure. |
| CD-H05 | H81 | happy | verify | cloud-dump | Model id chosen from live Flue/pi-ai catalog costs — not marketing model lists. |
| CD-H08 | H82 | happy | plan | cloud-dump | Stop-and-report on unproven load-bearing assumptions (assumption checklist with stop-on-miss). |
| CD-H09 | H83 | happy | verify | cloud-dump | Smoke fixture cookie preserves Chat without Google/mail — fixture proof, not vendor login. |
| CD-H10 | H84 | happy | review | cloud-dump | Thermo review deletes dual-dialect soup into typed adapters without widening phase. |
| CR-H02 | H85 | happy | recovery | codex-recovery | High retry/error sample (≥40) still recovers when diagnose→change-one-variable (retry count ≠ fatal). |
| CR-H05 | H86 | happy | recovery | codex-recovery | User re-asks for remaining/stable scope mid-session → agent re-plates (human remaining-scope as recovery tripwire). |
| CR-H06 | H87 | happy | plan | codex-recovery | Doctrine/brief unpack before edits (AI Engineer v0-style) then architecture-as-docs. |
| CR-H07 | H88 | happy | handoff | codex-recovery | Subagent completes scoped visual/motion fix after scout diagnosis (scout→scoped subagent recovers parent thrash). |
| CR-H09 | H89 | happy | recovery | codex-recovery | Landing/prod push ask finishes with verify≈happy mid scores after thrash — recovery over abandon. |
| CR-H10 | H90 | happy | recovery | codex-recovery | Mixed/verify with would_retry≥0.50 after governance-flavored thrash still recovers when plate+proof reasserted. |
| CD-S02 | T27 | smell | impl | cloud-dump | Homemade dual-dialect SQL client before typed CredentialDb (regex SQL translators / untyped rows). |
| CD-S03 | T28 | smell | spec | cloud-dump | Production resolve vs smoke jon-local design conflict (unsigned/smoke not first-class). |
| CD-S08 | T29 | smell | impl | cloud-dump | Rate-limit double-consume + Hono route conflict risk on auth route sprawl. |
| CD-S09 | T30 | smell | impl | cloud-dump | Phase-chain agents start on stale local main/checkout (missing fetch origin/main preflight). |
| CD-S10 | T31 | smell | impl | cloud-dump | Test load failure attributed to missing TS loader — thrash path params before loader/import proof. |
| CD-S11 | T32 | smell | cross-stage | cloud-dump | Node path conflicts between exec-daemon and nvm on cloud VM. |
| CR-S01 | T33 | smell | impl | codex-recovery | Skill-path thrash: missing SKILL.md / wrong scout path, retry loops, verify never greens (skill discovery substitutes for Outcome+proof). |
| CR-S12 | T34 | smell | research | codex-recovery | Sandbox skill-scout orientation ask without Outcome fence (scout-only + high thrash). |

## Aliased (near-dupe)

| source_id | → canon_id | kind | reason |
| --- | --- | --- | --- |
| CD-H02 | N022 | happy | near-dupe of N022; prefer existing N/H/S/T canon |
| CD-H04 | N032 | happy | near-dupe of N032; prefer existing N/H/S/T canon |
| CD-H06 | H44 | happy | near-dupe of H44; prefer existing N/H/S/T canon |
| CD-H07 | H64 | happy | near-dupe of H64; prefer existing N/H/S/T canon |
| CD-S01 | S030 | smell | near-dupe of S030; prefer existing N/H/S/T canon |
| CD-S04 | S044 | smell | near-dupe of S044; prefer existing N/H/S/T canon |
| CD-S05 | S022 | smell | near-dupe of S022; prefer existing N/H/S/T canon |
| CD-S06 | S033 | smell | near-dupe of S033; prefer existing N/H/S/T canon |
| CD-S07 | S040 | smell | near-dupe of S040; prefer existing N/H/S/T canon |
| CD-S12 | S011 | smell | near-dupe of S011; prefer existing N/H/S/T canon |
| CR-H01 | H63 | happy | near-dupe of H63; prefer existing N/H/S/T canon |
| CR-H03 | N042 | happy | near-dupe of N042; prefer existing N/H/S/T canon |
| CR-H04 | H68 | happy | near-dupe of H68; prefer existing N/H/S/T canon |
| CR-H08 | H68 | happy | near-dupe of H68; prefer existing N/H/S/T canon |
| CR-H11 | H68 | happy | near-dupe of H68; prefer existing N/H/S/T canon |
| CR-H12 | H68 | happy | near-dupe of H68; prefer existing N/H/S/T canon |
| CR-S02 | S030 | smell | near-dupe of S030; prefer existing N/H/S/T canon |
| CR-S03 | T5 | smell | near-dupe of T5; prefer existing N/H/S/T canon |
| CR-S04 | S014 | smell | near-dupe of S014; prefer existing N/H/S/T canon |
| CR-S05 | S013 | smell | near-dupe of S013; prefer existing N/H/S/T canon |
| CR-S06 | S015 | smell | near-dupe of S015; prefer existing N/H/S/T canon |
| CR-S07 | S030 | smell | near-dupe of S030; prefer existing N/H/S/T canon |
| CR-S08 | S030 | smell | near-dupe of S030; prefer existing N/H/S/T canon |
| CR-S09 | S030 | smell | near-dupe of S030; prefer existing N/H/S/T canon |
| CR-S10 | S064 | smell | near-dupe of S064; prefer existing N/H/S/T canon |
| CR-S11 | S064 | smell | near-dupe of S064; prefer existing N/H/S/T canon |

## Skipped

- (none)

## Densest catalogs

- `happy-nuggets.md` / `smell-catalog-dense.md` **untouched** (append-only harvest into canonical index only).
- Integrity check sha256 match: **True**

## Mirrors

- `/home/box/agent-data/grok-ship/reports/canonical-extract-index.{md,json}`
- `/home/box/agent-data/grok-ship/reports/FM-AGENTENG-01-canonical-extract-index.{md,json}`
- `/home/box/agent-data/grok-ship/reports/canonical-cd-cr-harvest.{md,json}`
- `/workspace/socratink/research/chat-signal/agenteng-runs/canonical-extract-index.{md,json}`
- `/workspace/socratink/research/chat-signal/agenteng-runs/canonical-cd-cr-harvest.{md,json}`
- `/workspace/socratink/research/chat-signal/canonical-extract-index.{md,json}`
- `/workspace/socratink/research/chat-signal/canonical-cd-cr-harvest.{md,json}`

