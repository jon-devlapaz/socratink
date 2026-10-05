# Coding standards

Read during review. A reviewer applies every rule to the diff and reports each violation with file and line. Mechanical rules live in CI, not here (`pnpm check`).

Disclosed standards, read when the diff touches the named area:

- Session, identity, credentials, learner keys, provider routing: [`docs/standards/boundaries-and-identity.md`](docs/standards/boundaries-and-identity.md)
- Any new or changed test, smoke, or "proof" claim: [`docs/standards/proof.md`](docs/standards/proof.md)

## Structure

**One owner.** Every act and every fact has one owning module. Count the edit sites for a plausible behavior change; more than one is a finding. Typical shapes: two routes that clear the same cookie, two error constants with one payload, a default declared at two layers, a status endpoint and a router that each decide who drives Chat. Derive every view (UI copy, specifier, resolver name) from the owner's value.

**Real size.** An imported or copied module carries only what a caller here uses. A stub that always returns `null`, an options bag no caller passes, and shader branches no uniform selects are a fake contract. Delete them and restore the narrow signature.

**Typed discriminant.** Control flow reads a typed field (`body: 'orb' | 'glyph'`, `kind: 'openrouter' | 'openai'`), never a name prefix, a `Record<string, unknown>` row, or a pair of mutually exclusive booleans. One origin enum replaces two flags.

**One verb per intent.** A second way to do one thing (disable beside delete, DELETE beside GET logout) is a finding. Keep the verb the spec names; leave the extra for the day a caller needs it.

**Earned layer.** Add a helper, wrapper, or "safe fields" projection when a second consumer exists. `{ credentialRef }` at the call site is the contract until something logs more.

**Boot ownership.** Module-scope and `app.ts` side effects belong to the module that uses them. A resolved-and-discarded env check mimics ownership and rots. Construct a real singleton, or leave `app.ts` alone.

**Whole rename.** A rename lands in one change: module names, exported APIs, user strings, docs. Two vocabularies for one thing (`archive` / `stash`) block approval.

**Honest copy.** UI text, README, SKILL.md, and comments describe what the code does. After a contract change, search the repo for each restatement of it (mode lists, flag names, "Chat uses your key") and fix every one.

**Recoverable midpoint.** A failure partway through leaves state the next run can recover. Unifying write paths keeps backup and rollback. Output written after a completed mutation is best-effort and cannot turn success into failure.

## Judgement over the diff

Prefer deleting a layer to rearranging it. The question for each finding: "what is the smallest change that makes this concept disappear?"
