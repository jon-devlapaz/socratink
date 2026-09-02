# Native in-composer dictation

- Status: Proposed; implementation begins after the browser probe in this spec passes
- Owner: `src/ui/`
- Last updated: 2026-09-01

## Outcome

A learner using a supported browser can dictate editable text into the existing
Socratink composer without losing surrounding typed text, accidentally sending
an unsettled transcript, or changing the baseline experience for everyone else.

## Product fit and evidence boundary

Dictation reduces input friction and supports learners who think more naturally
out loud. It is an input modality, not a separate learning mode, agent, or
conversation type.

The text in the composer remains reviewable and editable before Send. Once sent,
it is learner-approved message text. Socratink must not describe it as a verbatim
audio record, locally processed speech, or independently produced evidence unless
those conditions are separately established and preserved.

This feature does not establish improved learning, accessibility for every user,
transcription fidelity, durable capability, or mastery.

## Decisions

1. Use the browser's `SpeechRecognition` or `webkitSpeechRecognition` API as a
   progressive enhancement.
2. Add no backend route, persistence field, service account, dependency, or
   product mode.
3. Do not claim that recognition is private or on-device. Supporting browsers
   may use a remote platform speech service.
4. While dictation is active, the browser page reads microphone samples only to
   calculate a normalized activity level for the orb. Socratink does not record,
   upload, or store those samples. Recognized text reaches the existing backend
   only if the learner sends the message through the existing form.
5. Version one does not support simultaneous manual editing and recognition.
   A trusted manual edit ends the dictation session and preserves the textarea's
   current contents.
6. A submit gesture while recognition is active stops dictation for review. It
   does not send until recognition settles and the learner submits again.
7. A final transcript ending with the standalone phrase "Send message"
   removes that phrase, stops recognition, waits for `end`, and submits the
   remaining non-empty composer text through the existing form exactly once.
8. Version one does not automatically restart recognition after an unexpected
   `end`. The UI must make the stopped state obvious. Auto-restart may be added
   only if the browser probe demonstrates a repeatable need and a reliable,
   bounded policy on the supported matrix.
9. No browser is named as supported until its exact browser/OS row passes the
   manual acceptance matrix below. Constructor presence alone is not proof that
   the recognition service works.

## Non-goals

- Audio recording, upload, storage, playback, or a rendered waveform UI.
- Server-side transcription or a Socratink-managed speech provider.
- Voice conversations, spoken assistant replies, or wake words.
- Persisting whether a message was typed or dictated.
- Correcting recognition output with an AI model.
- Continuous background listening.
- Guaranteeing native undo behavior across programmatic transcript updates.
- Adding an experiment, analytics, evaluation, or learner-evidence schema.

## Required browser probe

Before product implementation, create a disposable dependency-free probe with
one textarea, one mic button, and an in-memory event timeline. The timeline may
record event names, state changes, error kinds, and timestamps; it must not log
audio or transcript content.

Run the probe on the current versions of:

- Chrome on macOS;
- Chrome on Android;
- Safari on macOS;
- Safari on iOS;
- installed/PWA Safari if Socratink supports that launch context; and
- Firefox to confirm clean unsupported behavior.

Exercise each applicable row with:

- permission allowed, denied, dismissed, and previously denied;
- silence for approximately 8, 30, and 70 seconds;
- stop immediately after the last spoken word;
- repeated start and stop;
- background or hidden page followed by return;
- insertion at the beginning, middle, and end of existing text;
- typing, paste, cut, and an IME/composition edit while listening;
- Cmd/Ctrl+Enter immediately after speech;
- network interruption; and
- offline use.

For each row, record the observed event sequence and whether recognition is
actually usable. Do not infer processing location from successful recognition.

### Probe gate

Product implementation may begin when at least one target browser/OS row proves:

- recognition starts from the mic click and produces interim or final results;
- stop reaches `end`, or a bounded fallback can restore idle state without
  leaving the microphone active;
- late events can be ignored after an invalidated session;
- permission denial does not trigger another start;
- existing text can be preserved around a fixed insertion anchor; and
- backgrounding does not leave Socratink showing a false listening state.

If no target row passes, stop. Do not ship a visible mic control or add a speech
provider under this specification.

## Architecture

### `src/ui/dictation.ts`

Own all browser-specific speech behavior behind one small composer-oriented
interface. This module receives the textarea, toggle, and status elements and
returns a controller used by `chat-surface.ts`.

```ts
export type DictationController = Readonly<{
	setEnabled(enabled: boolean): void;
	stopForReview(): boolean;
	cancel(): void;
	destroy(): void;
}>;

export function mountDictation(options: Readonly<{
	input: HTMLTextAreaElement;
	toggle: HTMLButtonElement;
	status: HTMLElement;
	voiceActivity?: DictationVoiceActivity;
	onSendRequested: () => void;
}>): DictationController;
```

Responsibilities:

- resolve the unprefixed or prefixed constructor using local structural types;
- keep unsupported markup hidden and inert;
- create and own one recognition instance at a time;
- call `start()` synchronously from the toggle's click handler;
- set the language from the document language, falling back to the browser
  language only when needed;
- request continuous recognition and interim results without assuming either is
  honored consistently;
- normalize result events from `event.resultIndex` without duplicating final
  segments;
- own the insertion anchor, interim rendering, and session invalidation;
- distinguish expected aborts from actionable errors;
- apply a bounded stop fallback chosen from probe evidence;
- expose discrete accessible state through the supplied elements; and
- remove its listeners and stop capture in `destroy()`.

The module must not know about Flue, conversations, request admission, model
routing, persistence, or learner-state semantics.

### Voice-reactive orb

`src/ui/voice-level-meter.ts` owns a second, local-only microphone stream while
dictation is active. It reduces time-domain samples to a normalized `0...1`
activity level and releases its stream on stop, cancel, error, or invalidation.
Analysis failure must not interrupt dictation.

`src/ui/effects/organic-sphere.ts` consumes only that normalized level. It uses
fast attack and slower release to increase displacement, distortion, and motion
while the learner speaks; it does not own microphone or recognition behavior.

### `src/ui/chat-surface.ts`

Remain the owner of composer and request-lifecycle integration.

Responsibilities:

- mount dictation with the existing `#message` textarea and dictation elements;
- call `dictation.cancel()` before Start over resets the conversation;
- disable and cancel dictation when the request coordinator locks the composer;
- intercept form submission with `dictation.stopForReview()` before reading and
  trimming `input.value`;
- when `stopForReview()` returns `true`, prevent that submission and let the
  learner review the settled text before submitting again; and
- provide an `onSendRequested` callback that re-enters the existing form submit
  path after a recognized voice command has settled; and
- preserve the existing `ChatRequestCoordinator` as the single request-lifecycle
  authority.

The integration must accommodate the existing model-routing controls in the
composer footer rather than replacing or re-querying them with broad selectors.

### `src/ui/index.html`

Render the control hidden by default so unsupported browsers never flash a mic
button:

- `#dictation-toggle`, `type="button"`, `hidden`, and disabled initially;
- `aria-pressed="false"`;
- `aria-label="Start dictation"`;
- `aria-describedby="dictation-privacy"`;
- an inline SVG microphone glyph marked `aria-hidden="true"`;
- `#dictation-status` with `role="status"` and `aria-live="polite"`; and
- `#dictation-privacy` using the existing screen-reader-only treatment and
	stating that recognition may use an online browser service, local microphone
	volume animates the orb, Socratink does not upload or store audio, and saying
	"Send message" at the end sends the recognized text.

Do not place `aria-live` on the textarea or interim transcript.

### `src/ui/dictation.css`

Place the mic control next to the existing Send control without displacing the
model picker or keyboard hint. Reuse existing button dimensions, focus treatment,
colors, and motion tokens without growing the general stylesheet.

Listening state may use a restrained ring or accent. Under
`prefers-reduced-motion: reduce`, show a static state change with no pulse.

## State model

Public UI states:

| State | Toggle | Composer behavior | Transition copy |
| --- | --- | --- | --- |
| Unsupported | Hidden and inert | Unchanged | None |
| Idle | Enabled when composer is enabled | Normal typing and Send | None |
| Starting | Unpressed, visibly busy, and disabled until start or failure | Text preserved | "Starting dictation" |
| Listening | Pressed; label is "Stop dictation" | Transcript appears at anchor | "Dictation started" |
| Stopping | Pressed and disabled | Current transcript remains visible; a recognized send command shows "Sending" | None or "Sending message" |
| Error | Unpressed | Normal typing remains available | One bounded error message |

`aria-pressed="true"` begins only when the recognition service emits `start`, not
when permission is merely requested. Starting must still have an unambiguous
visual busy state.

An unexpected `end` returns to Idle and announces "Dictation stopped." It must
never leave the UI looking active. Version one does not restart automatically.

## Text synchronization contract

### Start

Snapshot:

- `before`: text before `selectionStart`;
- `replaced`: selected text between `selectionStart` and `selectionEnd`;
- `after`: text after `selectionEnd`;
- `committed`: an empty string;
- `interim`: an empty string; and
- a new monotonically increasing session token.

The first recognized text replaces the selected range. When the selection is
collapsed, it inserts at that caret.

### Recognition result

For the active session only:

1. Read changed results beginning at `event.resultIndex`.
2. Append newly final segments to `committed` exactly once.
3. Rebuild the current interim segment from all non-final changed results.
4. Join `before`, the dictated region, and `after` with boundary-aware spacing.
5. Assign the resulting value, place the selection at the end of the dictated
   region, and dispatch one bubbling `input` event.

Spacing must not introduce a space before punctuation or duplicate existing
boundary whitespace. Exact joining examples belong in unit tests rather than a
general-purpose text-normalization abstraction.

### Manual edit

On any trusted `input` event while Starting, Listening, or Stopping:

1. invalidate the active session token;
2. abort recognition;
3. ignore all subsequent result events from that session; and
4. preserve the textarea value exactly as it exists after the edit.

Programmatic transcript updates must be distinguishable from trusted learner
edits so they do not stop their own session. `keydown` alone is not sufficient.

### Stop and submit

- Toggle click while Listening calls `stop()` and continues accepting results
  from that session until `end` or the bounded stop fallback.
- Submit or Cmd/Ctrl+Enter while Starting, Listening, or Stopping calls
  `stopForReview()`, prevents the request, and retains current text.
- After Idle is restored, the learner may submit normally.
- A final dictated region ending in "Send message" removes the command and
  arms one submission only when the resulting composer is non-empty and no
  interim recognition results remain. Submission occurs only after `end`.
- Interim commands, empty command-only transcripts, errors, cancellation, and
  the bounded stop fallback never submit.
- Start over or request locking calls `cancel()`, invalidates the session, and
  uses `abort()` so late speech cannot enter a future turn.

There is no claim that `stop()` flushes final text synchronously.

## Errors

Handle known browser error strings defensively and preserve an `unknown` case.

| Error | Behavior |
| --- | --- |
| `not-allowed`, `service-not-allowed` | Invalidate, stop, and disable dictation for the page session; explain that typing remains available. |
| `audio-capture` | Invalidate and return to Error; explain that no microphone is available. |
| `network` | Invalidate and return to Error; explain that the browser's speech service is unavailable. |
| `no-speech`, `nomatch` | Return to Idle without restarting; retain current text. |
| expected `aborted` after `cancel()` | Return to Idle without an error announcement. |
| any other error | Invalidate, return to Error, and show a generic bounded message. |

No error may trigger an automatic restart in version one. Error text must not
promise that audio stayed on-device.

## Verification

### Automated contract tests

Add `scripts/dictation.test.mjs` with a fake recognition constructor and focused
DOM seams. Add `pnpm test:dictation` and include it in `pnpm check`.

Cover at minimum:

- prefixed, unprefixed, and unsupported constructor detection;
- synchronous `start()` from toggle click;
- Starting, Listening, Stopping, Idle, and Error projections;
- final/interim result handling from non-zero `resultIndex` without duplication;
- insertion before, inside, and after existing text;
- selected-text replacement and boundary spacing;
- manual typing, paste-style input, and composition invalidating late results;
- stop-for-review blocking the first submit;
- final-only voice-command removal and exactly-once submission after `end`;
- empty, interim, canceled, errored, and non-command transcripts not submitting;
- cancel on request lock and Start over;
- permission denial never restarting;
- unexpected `end` visibly returning to Idle; and
- cleanup preventing late events from mutating the textarea.

Avoid asserting only that source strings exist. Exercise the exported controller
through fake events.

### Repository gate

Run from the repository root:

```sh
pnpm test:dictation
pnpm check:types
pnpm build:ui
pnpm check
pnpm smoke
git diff --check
```

Record the production UI JavaScript gzip size before and after implementation.
Acceptance requires no new dependency and no more than 5 KiB added gzip unless
the user explicitly approves a revised budget.

### Manual browser acceptance

Repeat the passing probe rows against the real Socratink composer. A row is
supported only when all of these pass:

- the mic starts from one click and its actual state is visible;
- spoken words appear at the chosen insertion point;
- existing surrounding text is never lost;
- a manual edit stops recognition without later overwrite;
- stopping immediately after speech retains every result the browser delivers
  before `end`;
- Cmd/Ctrl+Enter while active stops for review and does not send;
- the next submit sends exactly the visible trimmed text;
- Start over, request waiting, and request recovery leave no active recognition;
- permission denial produces no loop or repeated prompt;
- backgrounding never leaves a false listening state;
- reduced-motion mode has no pulsing animation; and
- unsupported or nonfunctional environments retain the baseline chat flow.

Silence acceptance is evidence-based: record what happens at approximately 8,
30, and 70 seconds. The row passes if the browser either remains genuinely
listening or Socratink promptly and accessibly reflects the browser's `end`.
Version one does not promise uninterrupted capture across a browser-ended
session.

## Release and stop rules

Ship only for browser/OS rows that passed both the probe and integrated manual
acceptance. Keep progressive fallback for every other environment.

Revise or stop the feature if:

- supported rows lose or duplicate learner text;
- a browser can expose the constructor while repeatedly failing to start and the
  failure cannot be made clear without browser-specific branches;
- settling after stop regularly takes long enough to make two-step Send
  confusing;
- the mic can remain active after Socratink reports Idle; or
- honest platform-processing disclosure makes the feature unacceptable for the
  intended privacy promise.

Do not respond to those failures by adding a backend speech service, audio
storage, browser-specific framework, or persistence schema under this spec.

## Brain contract

- North-star fit: reduces modality friction without supplying the learner's
  generative thinking.
- Canon relied on: `DEC-0001`, `EVD-0001`, and `EVD-0002`.
- Derived context used: Learner Agent Contract boundary between experience
  rendering and learner-evidence authority.
- Open question: whether target learners value dictation enough to justify its
  browser variability and correction burden.
- Evidence needed: browser event traces, integrated interaction proof, and later
  learner-use evidence if product value is claimed.
- External facts to verify: actual browser/OS support, permission behavior,
  silence behavior, event ordering, processing location, and stop latency.
- Claims this work must not make: private or on-device processing, verbatim
  transcription, universal accessibility, improved learning, mastery, or durable
  capability.
- Brain mutation proposed: none.

## Reference basis

- [Web Speech API specification](https://w3c.github.io/speech-api/speechapi.html)
- [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [MDN Web Speech API usage and on-device recognition](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [WebKit: speech recognition in Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/)
- [WebKit: speech recognition stops when a page becomes invisible](https://webkit.org/blog/11525/release-notes-for-safari-technology-preview-119/)
