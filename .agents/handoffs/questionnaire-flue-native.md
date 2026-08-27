# Handoff: mount the in-card questionnaire on Flue data parts

This is a **Socratink product handoff**, not Canon and not Flue docs. It tells the implementing agent how to replace the current prompt-and-parse questionnaire transport with the Flue-documented structured-UI channel, without inventing APIs or expanding product scope.

Do not treat this file as authority over `AGENTS.md`, pinned `@flue/*` types, or Brain. If this note and the published packages disagree, **the packages win**. If this note and Brain disagree on claims the learner may see, **Brain wins**.

## One-sentence outcome

After a Chat reply, the card shows the in-card form from a Flue `data-questionnaire` part on the assistant message; submit still sends one ordinary user turn whose body starts with `Questionnaire answers:`.

Stop when that is proven on live send **and** history restore. Do not add a new route, persistence model, evidence engine, reviewer workflow, or React client.

## Why this work exists

The learner should answer **in the current beat**, as a form, not as a numbered list in assistant prose. That intention is already implemented as a Socratink convention. It is **not** how Flue documents custom client UI.

Review finding (this conversation): the widget, fail-closed parser, and user-message return path are careful. The **outbound** path smuggles JSON in assistant text. That is the piece to change.

## Authority

| Source | Use for |
| --- | --- |
| This repo `AGENTS.md` + `ZEN.md` | What Socratink may do; smallest complete change |
| `.agents/skills/socratink-brain` | What the product may become or claim |
| `.agents/skills/flue-wiki` + sibling vault | How Flue hooks and the wire work |
| Pinned `@flue/runtime` / `@flue/sdk` **2.0.3** | API truth |

Brain `CURRENT STATE.md` was pinned to app commit `3a838eac` when this handoff was written. Live checkout at writing was `df1a3721` and **dirty**. Treat Brain live-implementation claims as possibly stale (`tandem: mismatch`). Re-run `python .agents/skills/socratink-brain/scripts/brain.py orient` before coding.

Flue wiki at writing: vault `/Users/jondev/dev/doc-vault/flue-obsidian-wiki`, generated from Flue `bf86b872`. Runtime 2.0.3 **does** export `useDataWriter`, `useTool`, and `defineTool`. Confirm against `node_modules/@flue/runtime/dist/index.d.mts` if anything here looks stale.

Before coding Flue, run:

```sh
python .agents/skills/flue-wiki/scripts/flue_wiki.py orient
python .agents/skills/flue-wiki/scripts/flue_wiki.py context "useDataWriter useTool data parts custom client UI"
```

Read, do not ingest the vault: `Docs/Guide/Agent Hooks.md` (Streaming data to the client), `Docs/Guide/Tools.md`, `Docs/Reference/Agent Hooks API.md` (`useDataWriter`, `useTool`), `Docs/SDK/Flue Client.md` (`FlueConversationPart`, `readSubmissionReply`), `Docs/Reference/Streaming Protocol.md`.

## What is already in the tree

Uncommitted (or recently added) Socratink overlay — keep the widget, change the transport:

| Piece | Path | Keep? |
| --- | --- | --- |
| Form widget + answer formatter | `src/ui/questionnaire.ts` | Yes. `createQuestionnaire`, `formatQuestionnaireAnswers`, types. |
| Styles | `src/ui/questionnaire.css` | Yes. |
| Opening-path form (client-only) | `src/ui/chat-surface.ts` `addStartingChoices` | Yes. Does not go through Flue. Submit sends `path.message` directly, not `Questionnaire answers:`. |
| Tag parser | `parseQuestionnaireResponse` + `<socratink-questionnaire>` | Replace as live transport. Optional short fallback for old transcripts, then delete. |
| Agent prompt protocol | `src/agents/chat.ts` | Rewrite. Today it forbids tools and requires tagged JSON at the end of the assistant string. |
| History + live paint | `src/ui/chat-surface.ts` | Must read data parts. Today `visibleTurnsFromHistory` concatenates `part.type === 'text'` only; `sendMessage` stores `reply.text` only. |
| User send | `src/ui/client/conversation.ts` `send({ message: { kind: 'user', body } })` | Keep. This **is** Flue-correct. |
| Tests | `scripts/questionnaire-ui.test.mjs` | Rewrite the “do not call tools” assertion. Keep fail-closed + answer-format coverage. |

`Chat()` currently only calls `useModel`. It is mounted at `/api/agents/chat` via `createAgentRouter(Chat)` in `src/app.ts`. Do not add another agent or route.

The working tree also contains unrelated card/scroll/pending-wait UI in the same files. Do not revert that. Do not expand it. If you commit, ask first; this questionnaire change and the card work are entangled in `chat-surface.ts`.

## Flue model (do not reconstruct)

Flue has **no** questionnaire widget. `@flue/react` is optional and **must not** be added; Socratink’s learner UI is vanilla TypeScript/CSS.

Three different channels, do not mix them up:

1. **Assistant text** (`part.type === 'text'`, `reply.text`) — model-visible prose. Current transport dumps JSON here. Stop doing that.
2. **Tools** (`useTool` / `defineTool`) — the model calls your code. Valibot `input` is validated **before** `run`. `run`’s `output` goes **back to the model**, not onto the card. A throw becomes a tool error the model can retry. Reserved names you must not take: `task`, `activate_skill`, `read_skill_resource`. Chat has no sandbox, so file/shell tools are not in the set — do not add a sandbox for this.
3. **Client data parts** (`useDataWriter`) — named, schema-checked payloads on the conversation as `{ type: 'data-<name>', data }`. **The model never sees them.** Writes never re-run the agent. The writer **throws if called during render**; call it from a tool `run` (or another callback while a tracked submission is running). Declare `useDataWriter` **unconditionally**, same name every render; a conditional mount throws.

Wire and SDK (2.0.3, confirmed in package types):

- Snapshot / history parts: `FlueConversationPart` includes `{ type: \`data-${string}\`; data: unknown }`.
- Live updates chunk: `data-part` with `name` + `data` (append / update a `data-<name>` part).
- `conversation.read(admission)` / `AgentReply` / `AgentSubmissionReply`: `{ text, data: Record<string, unknown[]>, metadata?, submissionId }`. `data` is keyed by writer name, **array of writes in emit order**.
- Learner input on the wire is only `{ kind: 'user'; body: string }` or `{ kind: 'signal'; ... }`. There is no form-submit primitive. Answers stay a user message.

Package vs wiki nit: the streaming-protocol note says “one part per write, in emit order”; the hooks API and `@flue/runtime` JSDoc say the first write places the part and later writes **update it in place**. `reply.data[name]` is still an array. For this feature, **write once** per turn. On the client, take the last write of `questionnaire` (or the `data-questionnaire` part’s `data`). Prefer package types if you have to choose.

`dynamic-tool` parts will appear once a tool exists. The learner card must **not** render them. Keep ignoring non-text, non-`data-questionnaire` parts.

## Target design

Mount one presentation tool whose **input schema is the questionnaire definition**. In `run`, write that payload through `useDataWriter`. Keep the existing vanilla widget.

Suggested names (change only if they collide; keep them boring):

- Writer channel: `questionnaire` → part type `data-questionnaire`
- Tool name: `present_question`

Shape of the payload: reuse `QuestionnaireDefinition` from `src/ui/questionnaire.ts` (`kind`, `submitLabel`, `items` with the existing bounds: 1–5 items, unique `name`, unique choice `value`, etc.). Encode those bounds in Valibot so the model cannot ship an unbounded blob. The writer schema and the tool `input` schema should be the **same object**.

Agent sketch (illustrative — verify against 2.0.3 types, do not copy blindly):

```ts
'use agent';
import { useModel, useTool, useDataWriter } from '@flue/runtime';
import * as v from 'valibot';

export function Chat() {
  useModel(`${chatModel.providerId}/${chatModel.modelId}`);
  const writeQuestionnaire = useDataWriter('questionnaire', { schema: QuestionnaireSchema });
  useTool({
    name: 'present_question',
    description:
      'Present one in-card question form to the learner. Call this whenever you ask them a question. Do not put the question in a JSON tag in your text.',
    input: QuestionnaireSchema,
    async run({ data }) {
      writeQuestionnaire(data);
      return 'Question presented on the learner card.';
    },
  });
  return `...instructions...`;
}
```

`run` return is for the **model**. Keep it a short ack. Do not return the JSON as tool output hoping the UI will parse it; the UI reads the data part.

`valibot` is a dependency of `@flue/runtime` 2.0.3 (`^1.1.0`) but not a direct Socratink dependency today. If product `src/` imports it, add `valibot` as a **direct** dependency. Do not bump `@flue/*`.

### Prompt changes

Replace the tagged-JSON protocol. Teach the model:

- Whenever you ask the learner a question, call `present_question` once and stop. Do not repeat the question as a numbered list in prose (a short lead-in is fine).
- Do not emit `<socratink-questionnaire>` or fenced JSON.
- Do not put the correct answer, a score, or feedback inside the tool input.
- After a user message that starts with `Questionnaire answers:`, treat the lines as the learner’s answer and respond normally.
- Keep existing R1 path / trace protocol and the “do not score, claim mastery, or imply durable learning” close.

The current test that asserts `Do not call tools, tasks, subagents` is a **local lock on the overlay**, not Flue doctrine. Invert it: the prompt must tell the model to call `present_question`, and must not forbid tools in general. Still do not mount `task`/skills/subagents for this change.

### Client changes

Live send (`sendMessage`): `sendChatTurn` already returns the SDK reply. Read `reply.data.questionnaire` (last write) in addition to `reply.text`. Store enough on `DisplayedTurn` to paint the form without re-parsing tags from `text`. Empty text with a questionnaire is allowed (hide the `<p>` as today).

History restore (`visibleTurnsFromHistory`): for each visible assistant message, join text parts as today **and** look for `part.type === 'data-questionnaire'`. Do not require text to be non-empty if a questionnaire part exists (today `if (!text) continue` would drop a form-only turn).

Paint paths already call `createQuestionnaire` on the live Assistant turn and `createQuestionnaireSummary` on trail items. Keep that. Feed them the definition from the data part.

Optional migration: if no data part is present, `parseQuestionnaireResponse(text)` can still recover old tagged turns. Delete the parser once you do not need that, or keep it only if you must restore in-flight conversations that used the tag. Do not keep both as live agent output.

Opening `addStartingChoices` stays client-only.

### What not to do

- Do not vendor Flue source or add `@flue/react`.
- Do not invent a second HTTP endpoint, signal kind, or “form submit” API. Answers are `{ kind: 'user', body }`.
- Do not write the questionnaire from `Chat()` render, `useAgentStart`, or anywhere except `run` / a legal callback.
- Do not mount the writer only when you think a question is coming.
- Do not render tool-call parts on the learner card.
- Do not add a sandbox, skills, subagents, or MCP to make this work.
- Do not turn this into R1 evidence storage, scoring, or a new learner mode.
- Do not claim the Flue-native path is already done; it is not.

## Product tension (Brain, not Flue)

Constitution: do not manufacture mastery, progress, persistence, diagnosis, or scoring language.

The existing widget uses `kind: 'quiz' | 'question'` and visible copy `Question N of M`. The agent prompt already says not to put answers/scores in the block. **Do not add scoring.** If you touch copy, prefer “Question N of M” as step position in a short form, not as learning progress. Do not expand `kind: 'quiz'` into an assessment engine. Fill a Brain Contract before changing learner-facing claims.

## Proof

Smallest proof:

1. `pnpm check` (includes `pnpm test:questionnaire`).
2. A unit test that the agent source **mounts** `useDataWriter` / `present_question` (or equivalent) and no longer requires the XML tags.
3. A unit test that the client extracts a definition from `reply.data.questionnaire` and from a history part `{ type: 'data-questionnaire', data }`, and still formats answers as `Questionnaire answers:\n- {prompt}: {labels}`.
4. Fail-closed: malformed / oversized definitions never become a form (Valibot + existing parse bounds).
5. Live: send a Chat turn that should ask a question; the card shows the widget; submit produces a You turn with `Questionnaire answers:`; the next Assistant reply arrives. Reload: the prior form is a summary in the trail, not a live tagged blob.
6. Opening path still starts with the client “How would you like to start?” widget and sends the path message.

`pnpm smoke` as usual. `pnpm smoke:braintrust-live` only if you are proving Observability; it is not required to prove the form channel.

UI is not HMR: `pnpm build:ui` then reload `http://localhost:5173/`.

## Brain Contract (fill before coding)

- **North-star fit:** In-card learner move in the current Chat beat; not a new product surface.
- **Current-state boundary:** Attach to existing Chat agent + vanilla card. No new routes.
- **Canon relied on:** Product claims must be earned; do not score or claim mastery. Learner Agent Contract: learner performance stays on the learner.
- **Active bet/experiment:** Do not implement EXP-0001 / evidence engine here.
- **Procedure:** Flue wiki for hooks; reuse the existing widget.
- **Evidence/proof obligation:** Live send + restore as above.
- **Claims this work must NOT make:** Durable learning, mastery, interoperability with a Flue-native questionnaire widget (Flue has none), or “tools are forbidden.”

## Suggested file split

Keep it small:

- `src/ui/questionnaire.ts` — widget + shared types; drop or gate the tag parser.
- New `src/agents/questionnaire-schema.ts` (or similar) — Valibot schema imported by `Chat` only if that avoids pulling agent code into the UI bundle. Do not share agent modules into `src/ui/` if the Vite UI build would then pull `@flue/runtime`.
- `src/agents/chat.ts` — mount writer + tool; rewrite instructions.
- `src/ui/chat-surface.ts` — read `reply.data` and history data parts.
- `scripts/questionnaire-ui.test.mjs` — transport tests.

If the UI cannot import Valibot without bloating the client, keep a thin runtime guard in `questionnaire.ts` (the existing `parseDefinition`) and use Valibot **only** in the agent. Duplicate bounds must stay in sync; prefer one schema if the UI build allows it.

## Done looks like

The overlay tags are gone from **new** agent output. The card still asks in-form. Flue’s model-visible transcript no longer contains the questionnaire JSON. The learner’s answer is still a user string. Opening paths are unchanged. No new learner product.
