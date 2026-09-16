# agenteng-obsidian-wiki

An updateable Obsidian vault generated from Agentic Engineering Wiki's official documentation feed.

- Source authority: `research/chat-signal/wiki-source/agenteng`
- Pages indexed: 19

## Ownership

The generator writes only `Docs/`, `_meta/`, and `Home.md`. `My Notes/` is user-owned
and never touched by the sync tool.

## Setup and Sync

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
python scripts/sync_agenteng_docs.py --output .
```

Check mode exits 3 if docs differ from upstream:

```bash
python scripts/sync_agenteng_docs.py --output . --check
```
