---
name: flue-wiki
description: >
  Interface with the sibling flue-obsidian-wiki vault for Flue harness
  documentation while developing Socratink agents. Use when authoring or
  changing Flue agents, hooks, skills, tools, routing, sandboxes, sessions,
  SDK clients, CLI usage, or when the user mentions Flue docs, the Obsidian
  wiki, or withastro/flue APIs.
---

# Flue Wiki Interface

Use this skill when a Socratink task depends on **how Flue works**, not on
Socratink product doctrine.

The wiki is a **generated Obsidian vault** of `withastro/flue` docs. It is
local evidence of framework behavior at a synced commit. It is not a license
to rewrite Flue, vendor framework source, or invent APIs.

## Authority split

| Source | Use for |
| --- | --- |
| This repo `AGENTS.md` + published `@flue/*` | What Socratink may do |
| `.agents/skills/socratink-brain` | What the product may become or claim |
| Sibling `flue-obsidian-wiki` | How Flue agents, hooks, and APIs work |

Do not reconstruct Flue APIs from memory. Do not treat wiki notes as current
if they contradict the pinned `@flue/*` packages in `package.json`. Prefer
package types and runtime behavior when they disagree, and say so.

## Coding-agent default

1. Run `python .agents/skills/flue-wiki/scripts/flue_wiki.py orient`.
2. Read `read_now` notes from `wiki_root` (not the whole vault).
3. Run `context "<task>"`, then `show` only the notes required to decide.
4. Follow wikilinks in those notes; stop when the API or procedure is clear.
5. Implement the smallest complete Socratink change. Mount new agents in
   `src/app.ts` with `createAgentRouter`. Put agents in `src/agents/`.

```bash
python .agents/skills/flue-wiki/scripts/flue_wiki.py orient
python .agents/skills/flue-wiki/scripts/flue_wiki.py context "useSkill mounting"
python .agents/skills/flue-wiki/scripts/flue_wiki.py show "Docs/Guide/Skills.md"
python .agents/skills/flue-wiki/scripts/flue_wiki.py search "createAgentRouter"
```

The helper is lexical discovery only. It does not determine truth.

## Find the vault

Resolve `WIKI_ROOT` in this order:

1. explicit `--wiki` / path from the user;
2. `FLUE_WIKI_PATH` (local environment only; never commit a machine path);
3. current directory if it is a vault root (`Home.md` + `Docs/` +
   `Project Context/AGENTS.md`);
4. a nearby checkout named `flue-obsidian-wiki`, discovered from cwd, this
   skill, or the Socratink git toplevel (including `product/flue-obsidian-wiki`
   and the standard local `doc-vault/flue-obsidian-wiki` layout).

If the vault cannot be located, report that and stop inventing Flue APIs.

```bash
python .agents/skills/flue-wiki/scripts/flue_wiki.py locate
```

## Vault rules

Generator-owned (read-only for this skill):

- `Docs/`
- `Project Context/`
- `Assets/`
- `_meta/`
- `Home.md`

User-owned: `My Notes/` — write only when the user asks to capture a working
note. Never mutate the upstream Flue checkout. Never treat generated notes as
editable product docs.

MDX remnants in generated notes (fenced `CopyPrompt` / unknown JSX) are source
leftovers, not runnable UI.

## Read set

Default `orient` reads (if present):

1. `Home.md` — vault identity and synced Flue commit
2. `Project Context/AGENTS.md` — Flue terminology
3. `Docs/Guide/Building Agents.md`
4. `Docs/Guide/Project Layout.md`
5. `Docs/Guide/Routing.md`
6. Topic notes from [references/topic-map.md](references/topic-map.md)

Then add only the notes `context` ranks for the task.

## Socratink constraints (do not drop)

- Consume published `@flue/*` packages; do not vendor Flue source.
- Keep `@flue/*` names, Apache attribution, and package versions unless the
  user explicitly asks to bump.
- An agent is a capitalized export in a `'use agent'` module; the return
  value is its instruction.
- Registration comes from the `'use agent'` scan; HTTP reachability still
  requires `createAgentRouter` in `src/app.ts`.
- Do not turn product work into a framework rewrite.

## Capture (optional)

If the user asks to keep a working note, write only under
`<wiki_root>/My Notes/` as Markdown. Link generated notes with `[[wikilinks]]`.
Do not edit generator-owned paths.
