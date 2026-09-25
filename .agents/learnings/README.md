# Agent learnings

Dated lessons from costly operator or campaign failures. They are not product
doctrine, not Brain Canon, and not a substitute for `AGENTS.md` or `ZEN.md`.

## When to read

Before starting or resuming a Praxist run, a multi-agent research campaign, or
any operator loop that looks like a prior failure, glob this directory and read
every file whose frontmatter `read_when` matches the task.

## When to add

Add a file after a campaign or operator path produced a costly negative result
that the next agent would otherwise repeat. Prefer a postmortem over leaving the
lesson only in chat.

Do not add a learning for ordinary completed work, passing checks, or opinions
that are not tied to a specific run, commit, or operator sequence.

## Naming

```
<kind>-YYYY-MM-DD-<short-slug>.md
```

Current kind: `postmortem`. Keep one lesson per file. Use YAML frontmatter.

## Rules for the files themselves

- State confirmed facts, inferences, and unknowns separately.
- Name the run, paths, and actor (user, Codex, Cursor, Praxist peers) that
  owned each failure.
- Give the next agent a stop rule, not a narrative recap.
- Never put secrets, API keys, `.env*` contents, learner wording, or trace
  payloads in these files.
- Never present synthetic or evaluator output as learner evidence or mastery.

## S* vs N* (operator catalogs)

- **S* costly fails** (thrash, waste campaigns, refuse-boot misses): write a
  dated `postmortem-YYYY-MM-DD-<slug>.md` **the same day**, with stop rules the
  next agent can execute.
- **N* happy / catalog notes**: leave in research or Loops paste unless they are
  the recovery twin of an S* fail.
- Never copy Brain EVT / Docent rows into learnings as prose. Pointer + stop rule
  only. Never promote learnings into Brain Canon or dump catalogs into
  `AGENTS.md`.
