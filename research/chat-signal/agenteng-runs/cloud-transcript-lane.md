# cloud-transcript-lane — design note (FM-AGENTENG-01)

**As-of:** 2026-09-15 21:05 CT  
**Mode:** research-only · no factory done · no SendToUser  
**Companion:** `cloud-pr-join.md` · `cloud-pr-join-transcript-mine.md`

## (a) How CloudAgent dump harvests

1. Cloud / background agents are identified by **`bcId`** (UUID-shaped id).
2. PR bodies already carry a footer `cursor.com/background-agent?bcId=…` (**Verified** for #8–#15).
3. **CloudAgent dump** materializes the agent conversation as  
   `/workspace/cloud-agent-transcripts/bc-<bcId>.jsonl`  
   (role/text/thinking/tool lines; this tranche: 7 phase files mtime ~2026-09-16 01:58 UTC).
4. Research join pack then sets:
   - `cloud_transcript_path` = absolute dump path  
   - `cloud_transcript_status` = **hard**  
   - `size_bytes` / `n_lines`  
   while keeping `bcId` hard and **IDE session = none** unless a real join exists.

## (b) Inventory — all `bc-*.jsonl` on box

**Dir:** `/workspace/cloud-agent-transcripts/` · **n=** 25  
**Phase #8–#15 overlap:** **7/7** unique bcIds (**Verified**). Older Sep 8–10 dumps retained (no force-join).

| bcId | phase_8_15 | bytes | lines | mtime |
| --- | --- | ---: | ---: | --- |
| `bc-0434af0d-5e17-4470-acc3-8ef872be5e18` | no | 278227 | 223 | 2026-09-08 05:50 UTC |
| `bc-1a785b3c-2ca3-4380-969d-263fda8bfc19` | no | 269100 | 189 | 2026-09-10 03:22 UTC |
| `bc-25e34d3b-830f-4a9a-af70-f3ed7fc2f40e` | no | 295558 | 198 | 2026-09-09 17:17 UTC |
| `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` | yes | 1065870 | 736 | 2026-09-16 01:58 UTC |
| `bc-2b7e9b88-b662-4ac5-97b3-b589caf46d52` | no | 256043 | 236 | 2026-09-08 18:12 UTC |
| `bc-33236116-5644-4106-85f8-066dc6788c00` | no | 208798 | 162 | 2026-09-09 17:03 UTC |
| `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` | yes | 268821 | 262 | 2026-09-16 01:58 UTC |
| `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` | yes | 596339 | 431 | 2026-09-16 01:58 UTC |
| `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` | yes | 687314 | 360 | 2026-09-16 01:58 UTC |
| `bc-52db0e05-2f90-4c5a-b76e-d8e1db107495` | no | 196932 | 144 | 2026-09-10 04:10 UTC |
| `bc-5986b168-ea85-435b-b08c-06793b770804` | no | 269052 | 186 | 2026-09-08 15:23 UTC |
| `bc-70ff69df-95af-40b9-8c20-8ff244a42694` | no | 229435 | 185 | 2026-09-08 15:58 UTC |
| `bc-76952c84-1f77-4254-b6e4-387e9e45ca4b` | no | 251514 | 245 | 2026-09-08 05:50 UTC |
| `bc-77ff37db-1a39-474c-ad04-4f753161707e` | no | 130413 | 141 | 2026-09-09 17:55 UTC |
| `bc-783e89f6-8456-4df6-b358-c1a7a0ed74de` | no | 548618 | 340 | 2026-09-08 18:46 UTC |
| `bc-7e033374-fdc4-4f8a-9fb1-c0548803e8a3` | no | 14204 | 12 | 2026-09-08 17:22 UTC |
| `bc-8b941f28-fa52-43fe-a3b1-002f70187b39` | no | 150473 | 129 | 2026-09-09 17:41 UTC |
| `bc-9d45a370-2511-4582-8246-f2da17f805a6` | no | 213608 | 153 | 2026-09-10 04:18 UTC |
| `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` | yes | 746640 | 570 | 2026-09-16 01:58 UTC |
| `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` | yes | 1395536 | 965 | 2026-09-16 01:58 UTC |
| `bc-b0d26aa8-1cb0-4888-8fe1-64fda17ff12a` | no | 224498 | 223 | 2026-09-08 17:53 UTC |
| `bc-b64a9488-2d46-5979-95e6-49c567df0721` | yes | 312181 | 212 | 2026-09-16 01:58 UTC |
| `bc-b9f56a8f-5bcd-44e4-a2ac-dac263a7b0ab` | no | 192367 | 145 | 2026-09-09 18:10 UTC |
| `bc-c97138cc-0973-42f4-b937-62df52ccb106` | no | 802873 | 237 | 2026-09-08 17:15 UTC |
| `bc-f53c8214-f6ed-4ffd-972a-65fd7a4e5533` | no | 141034 | 106 | 2026-09-09 17:28 UTC |

## (c) Recommendation — stop future join-blind phases

| # | Practice |
| ---: | --- |
| 1 | **Always** keep `bcId` in PR footer (existing Cursor agent footer). |
| 2 | **On PR merge** (or when draft becomes durable): run CloudAgent dump for that bcId into `/workspace/cloud-agent-transcripts/`. |
| 3 | **Same day:** patch `cloud-pr-join` row → path + status=hard + size/lines. |
| 4 | Prefer dump over waiting for Mac `~/.cursor` paths (Mac sync parent-owned / often blocked). |
| 5 | Do **not** invent IDE session IDs; transcript hard ≠ IDE join. |
| 6 | Shared-agent multi-PR (#10+#11) → one dump file; both PR rows point at same path. |

## (d) IDE session join still open

- **Transcript soft gap:** **CLOSED** (this tranche).
- **IDE session∩PR:** still **none** for #8–#15 (Verified gap in happy-paths / join pack).
- Dump harvest does **not** create home-live parent session ids. Separate lane / future Mac or product research required — without inventing IDs.

## Related packs

- `cloud-pr-join.md` / `.json` — join rows now transcript **hard**
- `cloud-pr-join-transcript-mine.md` / `.json` — transferable happy/smell from dumps
- Master INTERIM: `FM-AGENTENG-01.md` KEEP BURNING table

---
*Researchy burn-tranche · FM-AGENTENG-01 · cloud-transcript-lane*
