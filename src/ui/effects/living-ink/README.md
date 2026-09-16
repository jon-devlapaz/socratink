# Socratink app ink integration

The Chat dock button is the landing-page living-ink orb: one WebGL body,
not a CSS blob plus a separate poster.

Chat owns `renderer.ts`. Rest is a twelve-volume wet sphere (`body: 'orb'`);
`ink_express` cues are glyphs (`body: 'glyph'`). Dual-SDF morphs the two. The
wet-pool look in `finish.ts` and the rest recipe come from the landing hero
(`socratink-landing/src/lib/ink`, 2026-09-16). They reuse three-raymarcher
0.4.0 (MIT) and Three.js 0.185.1. The library keeps its upstream license in the
installed package. This integration does not introduce a cross-repository
package, wrap Flue, or import landing folio APIs.

App-specific additions: bounded microphone energy, the existing dock/cursor
pause state, theme observation, and the poster fallback. WebGL is loaded after
the conversation UI; failure must leave a usable dock and static poster.
The 1120×1120 fallback poster is contained inside `.alive-core`. Physical-phone
GPU performance and real microphone hardware have not been established here.

## Model and interaction boundary

`src/ink-cue.ts` owns the strict Valibot `{expression}` contract:
`rest | question | connect | explain`. `Chat` exposes `ink_express` through
Flue's published `useTool` and `useDataWriter('ink', ...)` APIs. It emits
`data-ink` through the existing conversation protocol, without a new route or
storage model. `present_question` automatically emits `question`.

The UI reads the last validated cue from completed replies and restored history.
It ignores speculative in-flight cues. The request coordinator remains the only
owner of pending/cancel/recovery/error state; non-idle states display neutral ink.
Typing in the composer displays the notebook. A settled questionnaire displays
the question mark. Otherwise, the current assistant's explicit cue is used, with
rest as fallback. A reply without a cue cannot inherit one from an older reply.
Cosmetic tools are hidden from both live and historical tool-card chrome.

This initial app boundary allows the four expressions. Arbitrary scene recipes
and PNG capture remain available in the landing lab, not as remote app tools.
No AI-visible framebuffer or automatic recognition/evaluation loop is claimed.
The icons are presentation cues, never scores, progress, mastery, or proof of
learning. The real model may choose optional cues; the deterministic smoke
proves their transport and rendering, not real-model tool-selection reliability.

## Brain contract

- North-star fit: presentation supports orientation while the learner retains the work; no efficacy claim.
- Canon relied on: Constitution, North Star, DEC-0001 (agent-assisted thinking).
- Derived context: Learner Agent Contract's separation of experience rendering and evidence authority.
- Open question/conflict: whether these cues help users remains unmeasured; no doctrine conflict is resolved here.
- Evidence/provenance: existing learner text, questionnaire answers, and reveal records are preserved.
- Code facts verified: native Flue 2.0.3 writer/tool boundary, current request coordinator, settled replies, restored history, dock and voice meter integration.
- Claims not made: durable learning, mastery, correctness, diagnostic progress, or production readiness.
- Brain mutation: none; Brain was read-only at 63b14ac.

## Reproduction

Run `pnpm check` and `pnpm smoke`. The smoke uses a deterministic fake model,
executes the native ink tool, and checks its data after a server restart.
`pnpm test:ink` checks malformed inputs, cue precedence, quiet tool display,
the landing hero rest recipe, cue geometry budget, poster containment, and that
Chat ink has no kinematics file or landing-lab APIs.

For the optional real Chrome/WebGL boundary, provide an installed Playwright
module and Chrome executable if they are not available under the defaults:

```sh
INK_BROWSER=1 PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs pnpm smoke
```

This also exercises the actual built browser against the smoke server: restored
model cue, own-word typing, dock keyboard controls, reduced motion, mobile
layout, a real present_question tool round trip and reload, and graphics context
recovery. Synthetic screenshots are saved under `.cache/ink-browser/`. It uses
no live model credentials or real learner content.
