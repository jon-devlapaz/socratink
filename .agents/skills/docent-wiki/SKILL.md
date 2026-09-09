---
name: docent-wiki
description: Locate and read the generated Docent Obsidian vault when work needs documented Docent behavior for analysis plans, DQL queries, data models, SDK usage, ingestion, rubrics, or clustering. Report the snapshot and its upstream gaps; make no changes.
---

# Docent Wiki Evidence

Use this skill to answer **how Docent documents its platform**. It is a
read-only evidence pass: locate the generated vault, read the smallest relevant
note set, and report the result with its authority limits. It does not authorize
Docent account changes, instrumentation changes, vault writes, or product changes.

## Authority

| Evidence | Establishes |
| --- | --- |
| Application sources and configuration | What the application actually sends to or receives from Docent |
| Installed Docent SDK types and observed API behavior | Executable integration behavior at the installed version |
| Generated `docent-obsidian-wiki` notes | Docent's published documentation at the recorded sync snapshot |

Treat the vault as a snapshot. When it conflicts with installed SDK behavior or
an observed API response, report the conflict and defer to executable evidence.
The snapshot records any pages listed by the official index but absent from the
published Markdown feed; do not reconstruct those pages from memory.

## Procedure

1. Run `orient`.

   ```bash
   python .agents/skills/docent-wiki/scripts/docent_wiki.py orient
   ```

   Completion: record `wiki_root`, vault Git state, sync time, indexed-page count,
   and unavailable-page count.

2. Read the existing `read_now` notes from `wiki_root`. They establish vault
   identity, the Docent workflow, data models, Analysis Plans, and SDK usage.

3. Run `context "<task>"`, then `show` only the notes needed to answer the task.
   Follow wikilinks only until the relevant product behavior is clear.

   ```bash
   python .agents/skills/docent-wiki/scripts/docent_wiki.py context "analysis plans and DQL queries"
   python .agents/skills/docent-wiki/scripts/docent_wiki.py show "Docs/Analysis/Analysis Plans.md"
   ```

4. If upstream documentation updates are suspected or requested, check or sync the vault:

   ```bash
   # Check if docs are up to date (exits 3 if changed)
   python .agents/skills/docent-wiki/scripts/docent_wiki.py sync --check

   # Sync latest published docs into the vault
   python .agents/skills/docent-wiki/scripts/docent_wiki.py sync
   ```

5. Report the evidence: vault path, sync timestamp, relevant note paths, and any
   recorded unavailable source pages. State any SDK/runtime verification gap.

Completion: the documentation question is answered or the missing evidence is
named. Stop after reporting; a later, separately authorized task may make changes.

## Vault discovery

`WIKI_ROOT` resolves in this order:

1. an explicit `--wiki` path;
2. `DOCENT_WIKI_PATH` from the local environment;
3. the current directory when it contains `Home.md`, `Docs/`, and `_meta/upstream-state.json`;
4. a nearby checkout named `docent-obsidian-wiki`, including one in a
   sibling `doc-vault/` directory.

```bash
python .agents/skills/docent-wiki/scripts/docent_wiki.py locate
python .agents/skills/docent-wiki/scripts/docent_wiki.py --wiki /path/to/docent-obsidian-wiki orient
```

If discovery fails, report the helper's diagnostic and stop. A vault-only context
is valid: report that SDK and runtime comparison was unavailable.

## Scope

Generator-owned paths are evidence only: `Docs/`, `_meta/`, and `Home.md`.
`My Notes/` is user-owned and outside this skill's read set unless explicitly named.
This skill writes nowhere in product code.
