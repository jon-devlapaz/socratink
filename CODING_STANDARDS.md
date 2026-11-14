# Coding standards

Read during review. A reviewer applies every rule to the diff and reports each violation with file and line. Mechanical rules live in CI, not here (`pnpm check`).

## Structure

**One owner.** Every act and every fact has one owning module. Count the edit sites for a plausible behavior change; more than one is a finding. Typical shapes: two routes that clear the same cookie, two error constants with one payload, a default declared at two layers, a status endpoint and a router that each decide who drives Chat. Derive every view (UI copy, specifier, resolver name) from the owner's value.

**Real size.** An imported or copied module carries only what a caller here uses. A stub that always returns `null`, an options bag no caller passes, and shader branches no uniform selects are a fake contract. Delete them and restore the narrow signature.

**Typed discriminant.** Control flow reads a typed field (`body: 'orb' | 'glyph'`, `kind: 'operator' | 'openai'`), never a name prefix, a `Record<string, unknown>` row, or a pair of mutually exclusive booleans. One origin enum replaces two flags.

**One verb per intent.** A second way to do one thing (disable beside delete, DELETE beside GET logout) is a finding. Keep the verb the spec names; leave the extra for the day a caller needs it.

**Earned layer.** Add a helper, wrapper, or "safe fields" projection when a second consumer exists. `{ credentialRef }` at the call site is the contract until something logs more.

**Boot ownership.** Module-scope and `app.ts` side effects belong to the module that uses them. A resolved-and-discarded env check mimics ownership and rots. Construct a real singleton, or leave `app.ts` alone.

**Whole rename.** A rename lands in one change: module names, exported APIs, user strings, docs. Two vocabularies for one thing (`archive` / `stash`) block approval.

**Honest copy.** UI text, README, SKILL.md, and comments describe what the code does. After a contract change, search the repo for each restatement of it (mode lists, flag names, "Chat uses your key") and fix every one.

**Recoverable midpoint.** A failure partway through leaves state the next run can recover. Unifying write paths keeps backup and rollback. Output written after a completed mutation is best-effort and cannot turn success into failure.

## Boundaries and identity

- Deny malformed authorization input and missing conversation IDs. Require
  explicit credential names. Never use an operator key for a missing learner.
- Keep identity helpers in `src/config/session.ts`. Reuse `isSessionUserId`
  for validation. Resolve the learner from the namespaced conversation ID
  through `userIdFromConversationId` and account aliases. Do not guess ID formats.
- Revoke by deleting the secret row and ciphertext. Rotate by overwriting.
  Make secret read-then-write operations atomic.
- Use typed storage adapters for each SQL dialect. Do not rewrite SQL strings
  or use untyped rows. Credential stores encrypt and look up `(userId, name)`.
  Keep secrets out of Pi storage.
- Keep model routing and credential lookup in `src/inference/`. Do not add
  another resolver, global provider registration, or environment-based learner keys.
- Test key isolation with overlapping learners through the real HTTP
  conversation path and built server, as in `pnpm smoke:durable:postgres`.
- Use `LearnerChatRoute` for the active model route, specifier, credential name,
  and connection UI. Distinguish an active learner key from a stored but idle key.

## Proof

- State what each check covers and what remains unproven.
- Enter through production code. Use fakes only at external boundaries such
  as the model provider, network, or clock. Do not hand-build intermediate state.
- Test each costly backend path, including Postgres and live-provider code.
  A fake client can record SQL. SQLite tests do not prove Postgres behavior.
- Assert intended behavior, not an existing bug.
- Verify that each regression test fails when its guard is reverted.
- Limit PR and README claims to observed checks. A boot-failure claim needs
  a failing boot. A live-path claim needs that path exercised.

## Judgement over the diff

Prefer deleting a layer to rearranging it. The question for each finding: "what is the smallest change that makes this concept disappear?"
