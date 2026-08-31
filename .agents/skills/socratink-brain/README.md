# Socratink Brain Agent Skill

A portable, project-local interface for agents that need task-scoped epistemic
context from Socratink Brain or need to propose a governed Brain change.

Brain provides epistemic truth. The application repository provides current
implementation truth, Praxist provides experiment-execution truth, and the
engineering harness provides process/project truth.

## Contents

- `SKILL.md` — the compact interface and safety contract.
- `scripts/brain.py` — filesystem-based location, search, lookup, orientation,
  and validation helper.

## Location

The normal portable layout is:

```text
<parent>/
├── socratink/
│   └── .agents/skills/socratink-brain/
└── socratink-brain/
```

The helper recognizes a Brain root by `CONSTITUTION.md`, `NORTH-STAR.md`, and
`GOVERNANCE.md`. Resolution order is explicit `--brain`, local
`SOCRATINK_BRAIN_PATH`, the current directory, then a nearby checkout named
`socratink-brain`.

For a nonstandard local location:

```bash
export SOCRATINK_BRAIN_PATH="/local/path/to/socratink-brain"
python .agents/skills/socratink-brain/scripts/brain.py locate
```

Do not commit the local path.

## Usage

```bash
python .agents/skills/socratink-brain/scripts/brain.py orient
python .agents/skills/socratink-brain/scripts/brain.py context "learner evidence"
python .agents/skills/socratink-brain/scripts/brain.py context --include-sources "learner evidence"
python .agents/skills/socratink-brain/scripts/brain.py show EVD-0004
python .agents/skills/socratink-brain/scripts/brain.py show PROC-0001
python .agents/skills/socratink-brain/scripts/brain.py validate
```

`orient` may locate both repositories and report their Git state, but it does not
compare them or infer implementation state from Brain. Context search uses live
Canon, Views, Open Questions, and Conflicts by default. Sources are opt-in.
Archive is excluded unless `--include-archive` is given.

Every search or lookup result is labeled from its path. Archived results are
explicitly `historical: true` and `current_authority: false`.

The helper is lexical discovery only. It creates no database, embeddings,
synchronization registry, status file, or duplicate validator. Read the returned
Brain documents to determine meaning and inspect the application repository,
Praxist, or harness for their respective external truth.

## Smoke test

From the Socratink application repository:

```bash
python .agents/skills/socratink-brain/scripts/brain.py locate
python .agents/skills/socratink-brain/scripts/brain.py orient
python .agents/skills/socratink-brain/scripts/brain.py context "learner evidence"
python .agents/skills/socratink-brain/scripts/brain.py show EVD-0004
python .agents/skills/socratink-brain/scripts/brain.py show PROC-0001
python .agents/skills/socratink-brain/scripts/brain.py validate
```
