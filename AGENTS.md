# Socratink product

This repository owns the standalone Socratink product. It uses published Flue
packages as its agent harness.

## Ownership

- `src/` owns the Socratink application and learner-facing interface.
- Flue framework behavior comes from exact published `@flue/*` dependencies;
  framework source is not vendored here.
- Keep Flue attribution, Apache licensing, and `@flue/*` package names intact.

Do not turn product work into a framework rewrite. Make the smallest complete
change that produces observable Socratink behavior.

## Scope control

Start every change by writing the smallest observable outcome in one sentence.
Stop when that outcome is proven. If the request is to trace normal Socratink
runs, success is one normal synthetic run visible in Braintrust; it is not a new
learner workflow.

Words such as "dogfood," "vet," "scientific," "grounded," or "production
quality" strengthen the required validation. They do not authorize additional
product scope.

Do not add a new user-facing mode, route family, persistence model, schema,
reviewer workflow, evaluation system, or experiment framework unless the user
explicitly asks for that product capability. When the requested capability can
be attached to the existing product, attach it there and preserve the existing
user flow.

Treat any such addition as a scope tripwire: stop before implementation,
compare it to the one-sentence outcome, and remove it from the plan unless it is
strictly required. A large diff is also a tripwire when a narrow integration is
available; lockfiles and generated output do not justify expanding behavior.

Failure precedent: a request to trace existing Socratink runs was incorrectly
expanded into a separate R1 learner-evidence product with new UI, routes,
storage, schemas, and review machinery. The expansion was reverted. Never use
that approach as precedent; the correct solution was startup instrumentation
plus one live trace verification.

## Harness terminology

An agent is a capitalized exported function in a module beginning with
`'use agent'`. Flue hooks attach its model, tools, skills, state, and other
capabilities. The function's return value is its instruction.

Routing is explicit in `app.ts`: mount an HTTP-reachable agent with
`createAgentRouter`. Registration comes from the `'use agent'` scan, not from
mounting.

The model layer uses Pi's provider protocol through the published Flue runtime.

When implementing or changing Flue agents, hooks, skills, tools, routing, or
harness behavior, use `.agents/skills/flue-wiki` and read generated notes from
the sibling `flue-obsidian-wiki` vault. Do not invent Flue APIs from memory.

## Coding-agent portability

This file is the project contract for coding agents. It is not owned by a
particular editor, CLI, or model. Prefer the [AGENTS.md](https://agents.md/)
open format and Agent Skills under `.agents/skills/`.

Do not add or duplicate project instructions in harness-specific files such as
`CLAUDE.md`, `.cursor/rules/`, `.cursorrules`,
`.github/copilot-instructions.md`, `.cursor/skills/`, or `.claude/skills/`.
Put specialized workflows in `.agents/skills/` as `SKILL.md` packages with
scripts any agent can run.

A thin compatibility shim that only points at this file is allowed when a tool
cannot read `AGENTS.md` natively. Do not put doctrine, skills, or workflow in
the shim.

This constraint applies to coding-agent configuration. It does not change the
product's Flue agent runtime, which remains a published-package dependency.

## Project structure

- `src/agents/` — Socratink agents
- `src/server/` — runtime provider configuration
- `src/ui/` — learner-facing web UI
- `src/app.ts` — HTTP routes and static UI delivery

## Verification

```sh
pnpm check:types
pnpm build
```

## Maintainability

Follow the maintainability principles in [ZEN.md](ZEN.md).

## Product and learning doctrine

[ZEN.md](ZEN.md) governs how to change this software. The sibling private
repository `socratink-brain` governs what the product may become or claim.

Before consequential product, learning, learner-agent, or experiment work,
use `.agents/skills/socratink-brain` and run:

```sh
python .agents/skills/socratink-brain/scripts/brain.py orient
```

Then read the listed Brain files. Do not reconstruct doctrine from memory or
from this repository's software-maintenance documents.
