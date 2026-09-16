# agenteng-obsidian-wiki

Python 3.12 CLI that converts Agentic Engineering Wiki's published documentation into this
repository, which is an Obsidian vault.

## Ownership

- Generator may write only `Docs/`, `_meta/`, and `Home.md`.
- Never mutate `My Notes/`.
- Upstream documentation authority is `research/chat-signal/wiki-source/agenteng`.
- Preserve source URL, index hash, page hash, and retrieval time in generated metadata.

## Layout

- `src/agenteng_obsidian_wiki/` — converter library
- `scripts/sync_agenteng_docs.py` — CLI entry point
- `tests/` — pytest tests
- repository root — Obsidian vault
