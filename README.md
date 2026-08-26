# Socratink

Socratink is a minimal, model-backed conversation surface built with
[Flue](https://github.com/withastro/flue).

This baseline intentionally does one thing: it connects the Socratink web
interface to one model-backed chat agent. Learning behavior comes later, after
the foundation works reliably.

## Run the current app

Requirements: Node.js 22.18+, pnpm 11, and an OpenAI-compatible model endpoint.

```sh
pnpm install
pnpm dev
```

The app reads these local environment settings without committing their values:

- `JON_LOCAL_BASE_URL` — the model endpoint; defaults to
  `http://127.0.0.1:3001/v1`
- `JON_LOCAL_API_KEY` — the endpoint's API key when required

On Vercel (`VERCEL=1`), Chat always uses AI Gateway. Local `JON_LOCAL_*`
settings do not override that.

## Verify the app

```sh
pnpm install --frozen-lockfile
pnpm check:types
pnpm test:braintrust
pnpm test:chat-model
pnpm build
pnpm smoke
pnpm audit --prod
```

The product source lives in `src/`. The default Vite build generates the
Node application in `dist/`, and the UI build writes its static assets to
`dist/client/`. The smoke test starts only local processes and uses a fake
OpenAI-compatible provider; it never requires external credentials.

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
