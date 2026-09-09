---
name: make-wiki-from-docs
description: Generate an updateable Obsidian LLM Wiki and companion agent skill from any documentation source (llms.txt, GitHub repository, HTML doc tree, or local markdown). Use when adding a new documentation wiki, creating an offline knowledge base, or scaffolding an agent interface for an external tool or library.
---

# Make Wiki from Docs

Use this skill to convert an **online or local documentation source** into an **updateable Obsidian LLM Wiki** and a **companion agent interface skill**.

Patterned after `docent-wiki`, `braintrust-wiki`, and `flue-wiki`, the generator produces:
1. **An Obsidian Vault** (`doc-vault/<name>-obsidian-wiki`):
   - Categorized Markdown notes under `Docs/`.
   - Complete `Home.md` index linking all topics.
   - Traceable provenance and metadata under `_meta/` (`Source Map.md`, `Validation Report.md`, `Sync Log.md`, `upstream-state.json`).
   - Protected user notes directory (`My Notes/`).
   - Pure Python sync engine with `--check` and `--dry-run`.
   - Automated GitHub Actions workflow (`.github/workflows/sync-<name>.yml`) on weekly cron and manual trigger.
2. **A Companion Agent Skill** (`.agents/skills/<name>-wiki/`):
   - Strict `writing-for-agents` compliant `SKILL.md`.
   - Fast lexical CLI (`locate`, `orient`, `context`, `show`, `sync`).
   - Passing security unit test suite (`test_<name_snake>_wiki.py`).

## Supported Documentation Sources

| Source Type | Flag | How It Works |
| --- | --- | --- |
| **`llms.txt` feed** | `--type llms-txt` | Fetches `llms.txt` index and concurrently downloads published Markdown files. |
| **GitHub repo** | `--type github` | Discovers `.md`/`.mdx` files via GitHub API or raw content tree. |
| **HTML doc site** | `--type html` | Crawls internal documentation paths and converts HTML elements into clean Markdown. |
| **Local directory** | `--type local` | Ingests an existing local tree of Markdown documents. |
| **Auto-detect** | `--type auto` *(default)* | Automatically determines the best adapter from the source URL. |

## Usage

All generation runs through `scripts/make_wiki.py`:

```bash
# 1. Generate from an llms.txt endpoint (e.g. Mintlify, ReadTheDocs, Braintrust, Transluce)
python .agents/skills/make-wiki-from-docs/scripts/make_wiki.py \
  --name <library_name> \
  --source https://example.com/llms.txt

# 2. Generate from a GitHub repository docs folder
python .agents/skills/make-wiki-from-docs/scripts/make_wiki.py \
  --name <library_name> \
  --source https://github.com/owner/repo \
  --github-path docs

# 3. Generate from an HTML documentation tree
python .agents/skills/make-wiki-from-docs/scripts/make_wiki.py \
  --name <library_name> \
  --source https://example.com/docs \
  --max-pages 50

# 4. Preview intended files without writing (dry run)
python .agents/skills/make-wiki-from-docs/scripts/make_wiki.py \
  --name <library_name> \
  --source <source_url> \
  --dry-run
```

## Options

- `--name <slug>` *(required)*: Machine-friendly slug (e.g. `valibot`, `hono`, `fastapi`, `ruff`).
- `--source <url_or_path>` *(required)*: The upstream URL or local directory path.
- `--title <name>`: Display title for headers and docs (defaults to capitalized name).
- `--type {auto,llms-txt,github,html,local}`: Extraction strategy (default: `auto`).
- `--github-path <subpath>`: Directory inside GitHub repo to scan (default: `docs`).
- `--max-pages <n>`: Page crawling limit for HTML documentation sites (default: `50`).
- `--vault-dest <path>`: Custom destination for the Obsidian vault (default: `doc-vault/<name>-obsidian-wiki`).
- `--skill-dest <path>`: Custom destination for the companion skill (default: `.agents/skills/<name>-wiki`).
- `--dry-run`: Previews the discovered documentation tree without writing files.
- `--no-git`: Disables running `git init` and initial commit in the created vault.

## Procedure

1. **Dry-Run Inspection**:
   Run with `--dry-run` to inspect the detected source type, discovered page count, and sample routes.
2. **Execute Generation**:
   Run `make_wiki.py` to scaffold the vault and companion skill.
3. **Verify Vault Idempotency**:
   Verify that `sync_<name>_docs.py --check` exits with code `0`.
4. **Verify Companion Skill**:
   Run the generated companion skill's test suite and execute `orient`:
   ```bash
   python .agents/skills/<name>-wiki/scripts/test_<name_snake>_wiki.py
   python .agents/skills/<name>-wiki/scripts/<name_snake>_wiki.py orient
   ```

**Completion Criterion**:
Both the Obsidian vault and the companion skill are created on disk, the vault's `--check` is verified, and the companion skill's unit tests pass cleanly.
