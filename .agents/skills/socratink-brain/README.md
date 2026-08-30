# Socratink Brain Agent Skill

A portable, project-local skill for coding/research/founder agents that need to
read from or safely update the Socratink Brain.

## Contents

- `SKILL.md` — the governing agent protocol.
- `scripts/brain.py` — optional lexical locator/search/lookup/validation helper.

## Layout

Keep Brain as a **sibling private repository** named `socratink-brain`. Install
this skill in the agent-agnostic project skill root:

```text
<parent>/
├── socratink/                         # application repository
│   └── .agents/skills/socratink-brain/
└── socratink-brain/                   # sibling Brain repository
```

The helper locates that sibling by directory name from the working directory,
this skill's path, or the application git toplevel. It does not embed another
developer's absolute path.

## Optional local override

If the Brain is not a sibling named `socratink-brain`, set a local environment
variable. Do not commit the value.

```bash
export SOCRATINK_BRAIN_PATH="$HOME/path/to/socratink-brain"
```

Or pass:

```bash
python .agents/skills/socratink-brain/scripts/brain.py --brain "$HOME/path/to/socratink-brain" locate
```

## Coding-agent default

```bash
python .agents/skills/socratink-brain/scripts/brain.py orient
python .agents/skills/socratink-brain/scripts/brain.py context "<task>"
python .agents/skills/socratink-brain/scripts/brain.py show EVD-0004
```

`orient` reports whether Brain `CURRENT STATE.md` names this Socratink checkout.
`show` prints one object so lookup is not a dead end.

## Smoke test

From the Socratink application repository:

```bash
python .agents/skills/socratink-brain/scripts/brain.py locate
python .agents/skills/socratink-brain/scripts/brain.py orient
python .agents/skills/socratink-brain/scripts/brain.py context "learner evidence contract"
python .agents/skills/socratink-brain/scripts/brain.py show EVD-0004
python .agents/skills/socratink-brain/scripts/brain.py validate
```

The helper is deliberately small. It does not create embeddings, a database, or a
second source of truth. The Markdown vault remains authoritative.
