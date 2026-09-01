# Socratink

Socratink is a focused, model-backed learning conversation built with
[Flue](https://github.com/withastro/flue). The current interaction helps a
learner reason about agentic engineering through open dialogue and validated
in-card questionnaires.

This remains a narrow development product. It does not yet provide production
authentication, durable multi-instance hosting, or evidence for broad claims
about learning effectiveness.

## Run the current app

Requirements: Node.js 22.19+, pnpm 11, and an OpenAI-compatible model endpoint.

```sh
pnpm install
pnpm dev
```

The app reads these local environment settings without committing their values:

- `JON_LOCAL_BASE_URL` — the model endpoint; defaults to
  `http://127.0.0.1:3001/v1`
- `JON_LOCAL_API_KEY` — the endpoint's API key when required

On Vercel (`VERCEL=1`) and Northflank, Chat uses `JON_LOCAL_BASE_URL` and
`JON_LOCAL_API_KEY` when both are set to a public `https` OpenAI-compatible
endpoint. Private or loopback `JON_LOCAL_*` URLs do not override hosted
routing. Otherwise Chat uses AI Gateway. Northflank still requires
`AI_GATEWAY_API_KEY` when that fallback is used.

Hosted Node deployments require `DATABASE_URL`; the process refuses to start
without durable conversation storage. Local development uses file-backed
SQLite at `.cache/flue/local.db`.

## Verify the app

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm smoke
pnpm audit --prod
```

The product source lives in `src/`. The default Vite build generates the
Node application in `dist/`, and the UI build writes its static assets to
`dist/client/`. The smoke test starts only local processes and uses a fake
OpenAI-compatible provider; it never requires external credentials.

## Demonstrate the current interaction

Use a fresh conversation and choose one of the three agentic-engineering
starters, or enter a concrete question about an agent loop, tool boundary,
state, memory, evaluation, observability, or recovery. Socratink asks the
learner to explain or attempt the problem before substantive correction, then
uses a structured card when a question has defined choices.

For an operator walkthrough:

1. Complete at least one conversational turn and one questionnaire turn.
2. Inspect the earlier-step trail, then reload to verify that the conversation
   is restored.
3. With synthetic inputs and Braintrust configured, inspect the request, model
   spans, `present_question` tool calls, timing, token use, and errors.

This demonstrates a persisted, observable interaction and its software
reliability boundaries. It does not establish agentic-engineering mastery,
durable learning, transfer, learning effectiveness, or production readiness.
The hosted surface still requires authentication, conversation authorization,
and rate limiting before public exposure.

## Northflank staging

The root `Dockerfile` packages the built Flue Node server as a non-root
container listening on port `3000`. Configure one service replica with:

- private HTTP port `3000`, reached for staging verification through a
  Northflank CLI port-forward;
- readiness check `GET /healthz`;
- a private PostgreSQL addon;
- `DATABASE_URL` mapped from the addon's `POSTGRES_URI` secret;
- `AI_GATEWAY_API_KEY` stored as a Northflank runtime secret.

Use Northflank's `recreate` rollout strategy. Do not use rolling or canary
rollouts, autoscaling, or more than one replica: Flue currently requires one
live owner for a conversation, including during replacement.

Keep the PostgreSQL addon private. The current Northflank deployment is a
private staging target. Do not expose its port or attach the production domain
until authentication, conversation authorization, and rate limiting are
implemented and verified.

## Braintrust observability

Braintrust tracing is optional. Save the key once in the Git-ignored
`.env.braintrust` file:

```dotenv
BRAINTRUST_API_KEY=your-api-key
```

After that, `pnpm dev` automatically traces normal Socratink chat runs to the
`socratink` project. Open that project in Braintrust to inspect the request,
nested model calls, output, timing, token usage, and errors. Without an exported
key or a `.env.braintrust` file, Socratink runs normally and sends no traces.

Treat traces as development logs: they may contain prompts and responses. Use
synthetic inputs until access, retention, and masking are configured for real
learner data.

`pnpm test:braintrust` verifies the opt-in configuration locally without making
a network call. `pnpm smoke:braintrust-live` verifies live delivery and requires
an explicit API key. Traces go to the same `socratink` project as Chat.

## Foundation and attribution

Socratink was extracted from [Flue](https://github.com/withastro/flue) v2.0.3
at source commit
[`bf86b872`](https://github.com/withastro/flue/commit/bf86b872). The standalone
product consumes the published `@flue/*` packages and keeps those names, this
provenance statement, and the original [Apache License 2.0](LICENSE) so its
upstream lineage remains explicit.
