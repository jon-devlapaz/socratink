# FM-DOCPRUNE-01-EXECUTE

**As of:** 2026-09-16 ~00:05 CDT (Jondev.local)  
**Authority:** Captain chose **B** via Firstmate — cold-delete/archive + thins.  
**Mode:** Executed. Brain Canon/Constitution/authority and product `src/` **not** touched.

---

## Thins applied

| Path | Action |
| --- | --- |
| `research/chat-signal/AGENTS.md` | Replaced from `AGENTS.md.DRAFT-FM-DOCPRUNE-01` (Docs-only vault; ban preload runs/noisy wiki; distilled fallback) |

Root `AGENTS.md` optional snippet **not** applied (scout listed as optional; B focused on listed deletes + chat-signal thin).

---

## Cold-archived (moved, git-recoverable)

Destination: `research/_cold-archive/DOCPRUNE-01/` (~**4.5M**)

| From | To under cold archive |
| --- | --- |
| `research/chat-signal/wiki-source/agenteng/` | `wiki-source-agenteng/agenteng/` |
| `doc-vault/agenteng-obsidian-wiki/` | `doc-vault-agenteng-obsidian-wiki/agenteng-obsidian-wiki/` |
| `research/chat-signal/agenteng-runs/*.json` (8 files) | `agenteng-runs-json/` |
| `research/chat-signal/smell-runs/` | `smell-runs/smell-runs/` |
| `research/chat-signal/pilot-runs/` | `pilot-runs/pilot-runs/` |
| `research/2026-09-15-agenteng-socratink-30-60-90-primary.md` | `duplicates/…` (cmp-identical to agenteng-runs copy) |

Manifest: `research/_cold-archive/DOCPRUNE-01/MANIFEST.txt`

**Left hot:** `agenteng-runs/*.md` (45 warehouse notes, never-preload per AGENTS), `wiki-source/agenteng-distilled/` (12), FM-*.md masters/briefs.

---

## Vault restore

| Check | Result |
| --- | --- |
| Target | `/Users/jondev/dev/doc-vault/agenteng-obsidian-wiki` |
| Source | `research/chat-signal/wiki-source/agenteng-distilled` |
| Generator | `make-wiki-from-docs` / `make_wiki.py` `--no-git` |
| Indexed pages | **12** |
| Docs notes | 12 under `Docs/` (captain/evidence/moc/ops) |
| sync `--check` | 0 changes |
| unit tests | 5/5 OK |
| orient | `wiki_root` absolute path OK |
| Validation | **PASS**, broken wikilinks **0** |
| Home title | Normalized to “Agentic Engineering” |

Skill refreshed at `.agents/skills/agenteng-wiki`.

---

## Not touched

- `socratink-brain` CONSTITUTION / NORTH-STAR / GOVERNANCE / Canon / Views / Archive  
- Product `src/**`, lockfiles, CI  
- Other `/Users/jondev/dev/doc-vault/*` wikis  
- `agenteng-runs` markdown warehouse (cold JSON only)

---

## Verify leftovers (hot tree)

- `wiki-source/`: `agenteng-distilled` + COPYFROMBOX manifest only  
- No `smell-runs/`, `pilot-runs/`, product `doc-vault/agenteng-obsidian-wiki`  
- No `agenteng-runs/*.json`

---

*Researchy · EXECUTE complete*
