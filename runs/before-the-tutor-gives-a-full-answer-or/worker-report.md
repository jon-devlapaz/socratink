# Ask-before-answer fixes

## Situation

The three requested fixes are implemented. Final local checks pass. No deployment or push was done.

## Background

The previous gate held ordinary replies until settlement. The reconnect fixture used a hint mark to avoid that delay. The policy also required a card after an explicit answer request, and card lines omitted their targets.

## Assessment

- Ordinary text streams before a protected mark. After a full_answer or worked_example mark, text is held. Settlement replaces the whole protected message, including its earlier text, with the existing consent card.
- The tutor sets `requested: true` only when the learner's own last message explicitly requests the answer, not for instructions in pasted material. The shared reveal parser accepts only an optional literal `true`. A requested reveal bypasses the card and retains its provenance.
- Card lines name the target when present. Lines without a target stay unchanged. The smoke expectation now includes the target.
- Hints and partial explanations still stream without a card. The original unmarked reconnect fixture passes again, so its hint workaround was removed. The pinned teaching skill and UI components are unchanged.

### Checks and reversion probes

- Focused suite: 24 tests passed, including 13 consent cases and all 3 original reconnect cases.
- `node scripts/reveal-consent-probes.mjs`: 9 probes passed. Each reverts one protection, requires the selected regression to fail, and restores the source in `finally`. Probes cover ordinary streaming, post-mark withholding, whole-message settlement replacement, requested bypass, parser acceptance and rejection, the policy rule, and both target lines.
- Final `pnpm check`: 317 test-runner tests passed, 0 failed, 0 skipped. The separate chat-model contract, file-size check, types, and both builds also passed.
- Final `pnpm smoke`: passed the local synthetic-provider exchange, consent, provenance, card help, correction, restart persistence, routing, session access, and 4 asset checks.
- Initial focused checks exposed timing assumptions in the test fixture. The fixture now polls for unprotected streamed text. The first smoke failed on its old target-free expectation. Both failures are resolved in the final runs.
- Local logs: `.cache/consent-focused.log`, `.cache/consent-check.log`, `.cache/consent-smoke.log`.

The checks use a synthetic provider and the real durable engine. They do not prove live-model compliance with the requested flag, browser layout, learning effectiveness, or production readiness. No live-provider or browser interaction check was run. Formal SDLC verification and operator acceptance remain separate.

`principle-build-the-lever` led to the repeatable reversion script. `unslop` kept this report short and direct.

## Recommendation

Review the committed change. Keep the existing staged `AGENTS.md`, stage, step, and authorization changes separate. They were preserved and excluded from this commit.
