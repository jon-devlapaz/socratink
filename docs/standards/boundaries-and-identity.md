# Boundaries and identity

Applies to `src/server/`, `src/config/session.ts`, credential and learner-key code, and Chat routing.

**Fail closed.** Authorization input that cannot be parsed denies. A Chat path with no parseable conversation id returns 403; `if (conversationId && !belongs(...))` lets it through. Compare any new `??` or optional parameter on an identity or credential path against this rule: an optional `credentialName` that defaults to `openai` mixes keys, and a missing user falling back to the operator specifier is fail-open. Require the name; make the miss loud.

**Identity owner.** Identity helpers live beside `namespacedConversationId` in `src/config/session.ts`. A feature module (the auto-model picker, a provider route) imports them and never owns them. One predicate (`isSessionUserId`) holds each invariant, such as the colon delimiter; cookie read, ownership check, and client parse all call it.

**Learner, not sniff.** The learner is `ctx.instanceId` (`userId:nonce`). `conv_*` is a Flue conversation id and identifies no learner. Pass the namespaced id into `runWithLearnerKey`; helpers that guess between two id shapes are a finding.

**Secrets end at revoke.** Revoke deletes the row and its ciphertext. A disabled flag over decryptable ciphertext is a worse secret and a second revoke. Rotation is overwrite. Operations that read-then-write a secret row run atomically.

**Typed storage.** A store takes a typed adapter per dialect (`$1` SQL for Postgres, `?` for SQLite) and the store itself only encrypts and looks up `(userId, name)`. SQL string rewriting, regex dispatch on statements, and untyped rows are a finding. Secrets stay out of Flue's adapter.

**Flue stays unwrapped.** Product code calls Flue's documented hooks. Wrappers around Flue, per-request `setProvider`, `Models.login`, and `process.env` learner keys are findings.

**Hotel-safety proof.** Two overlapping learners must never see each other's key. A test counts only when it enters through the real path (`installLearnerKeyCapture` and the HTTP `instanceId`), never by calling `runWithLearnerKey` directly.

**One truth for provider routing.** `LearnerChatRoute` is the single Chat-driver value. Specifier, auto-model skip, credential name, and every connection widget read it. A widget that claims "Chat uses your key" checks `kind` first; a stored-but-idle key gets different copy.
