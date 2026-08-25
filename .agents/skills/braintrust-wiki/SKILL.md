---
name: braintrust-wiki
description: Locate and read the generated Braintrust Obsidian vault when work needs documented Braintrust behavior for tracing, observation, annotation, evaluations, deployment, SDKs, or administration. Report the snapshot and its upstream gaps; make no changes.
---

# Braintrust Wiki Evidence

Use this skill to answer **how Braintrust documents its platform**. It is a
read-only evidence pass: locate the generated vault, read the smallest relevant
note set, and report the result with its authority limits. It does not authorize
Braintrust account changes, instrumentation changes, vault writes, or product changes.

## Authority

| Evidence | Establishes |
| --- | --- |
| Application sources and configuration | What the application actually sends to or receives from Braintrust |
| Installed Braintrust SDK types and observed API behavior | Executable integration behavior at the installed version |
| Generated `braintrust-obsidian-wiki` notes | Braintrust's published documentation at the recorded sync snapshot |

Treat the vault as a snapshot. When it conflicts with installed SDK behavior or
an observed API response, report the conflict and defer to executable evidence.
The snapshot currently records any pages listed by the official index but absent
from the published Markdown feed; do not reconstruct those pages from memory.

## Procedure

1. Run `orient`.

   ```bash
   python .agents/skills/braintrust-wiki/scripts/braintrust_wiki.py orient
   ```

   Completion: record `wiki_root`, vault Git state, sync time, indexed-page count,
   and unavailable-page count.

2. Read the existing `read_now` notes from `wiki_root`. They establish vault
   identity, the Braintrust workflow, tracing, evaluation, and source provenance.

3. Run `context "<task>"`, then `show` only the notes needed to answer the task.
   Follow wikilinks only until the relevant product behavior is clear.

   ```bash
   python .agents/skills/braintrust-wiki/scripts/braintrust_wiki.py context "trace an OpenAI agent and evaluate it"
   python .agents/skills/braintrust-wiki/scripts/braintrust_wiki.py show "Docs/Instrument/Trace Llm Calls.md"
   ```

4. Report the evidence: vault path, sync timestamp, relevant note paths, and any
   recorded unavailable source pages. State any SDK/runtime verification gap.

Completion: the documentation question is answered or the missing evidence is
named. Stop after reporting; a later, separately authorized task may make changes.

## Vault discovery

`WIKI_ROOT` resolves in this order:

1. an explicit `--wiki` path;
2. `BRAINTRUST_WIKI_PATH` from the local environment;
3. the current directory when it contains `Home.md`, `Docs/`, and `_meta/upstream-state.json`;
4. a nearby checkout named `braintrust-obsidian-wiki`, including one in a
   sibling `doc-vault/` directory.

```bash
python .agents/skills/braintrust-wiki/scripts/braintrust_wiki.py locate
python .agents/skills/braintrust-wiki/scripts/braintrust_wiki.py --wiki /path/to/braintrust-obsidian-wiki orient
```

If discovery fails, report the helper's diagnostic and stop. A vault-only context
is valid: report that SDK and runtime comparison was unavailable.

## Scope

Generator-owned paths are evidence only: `Docs/`, `_meta/`, and `Home.md`.
`My Notes/` is user-owned and outside this skill's read set unless explicitly named.
This skill writes nowhere.
