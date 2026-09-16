---
name: agenteng-wiki
description: Locate and read the generated Agentic Engineering Obsidian vault when work needs documented Agentic Engineering behavior, APIs, configuration, architecture, or guides. Report the snapshot and its upstream gaps; make no changes.
---

# Agentic Engineering Wiki Evidence

Use this skill to answer **how Agentic Engineering documents its platform and APIs**. It is a
read-only evidence pass: locate the generated vault, read the smallest relevant
note set, and report the result with its authority limits. It does not authorize
account changes, vault writes, or product changes.

## Authority

| Evidence | Establishes |
| --- | --- |
| Application sources and configuration | What the application actually uses or configures |
| Installed package types and observed runtime behavior | Executable integration behavior at the installed version |
| Generated `agenteng-obsidian-wiki` notes | Agentic Engineering's published documentation at the recorded sync snapshot |

Treat the vault as a snapshot. When it conflicts with installed package behavior or
an observed API response, report the conflict and defer to executable evidence.

## Procedure

1. Run `orient`.

   ```bash
   python .agents/skills/agenteng-wiki/scripts/agenteng_wiki.py orient
   ```

   Completion: record `wiki_root`, vault Git state, sync time, and page counts.

2. Read the existing `read_now` notes from `wiki_root`. They establish vault
   identity and core conceptual entrypoints.

3. Run `context "<task>"`, then `show` only the notes needed to answer the task.
   Follow wikilinks only until the relevant product behavior is clear.

   ```bash
   python .agents/skills/agenteng-wiki/scripts/agenteng_wiki.py context "<search term>"
   python .agents/skills/agenteng-wiki/scripts/agenteng_wiki.py show "Docs/Path/To/Note.md"
   ```

4. If upstream documentation updates are suspected or requested, check the vault:

   ```bash
   python .agents/skills/agenteng-wiki/scripts/agenteng_wiki.py sync --check
   ```

5. Report the evidence: vault path, sync timestamp, and relevant note paths.

## Vault discovery

`WIKI_ROOT` resolves in this order:

1. an explicit `--wiki` path;
2. `AGENTENG_WIKI_PATH` from the local environment;
3. the current directory when it contains `Home.md`, `Docs/`, and `_meta/upstream-state.json`;
4. a nearby checkout named `agenteng-obsidian-wiki`, including one in a
   sibling `doc-vault/` directory.

```bash
python .agents/skills/agenteng-wiki/scripts/agenteng_wiki.py locate
```

## Scope

Generator-owned paths are evidence only: `Docs/`, `_meta/`, and `Home.md`.
`My Notes/` is user-owned and outside this skill's read set unless explicitly named.
This skill writes nowhere in product code.
