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

## Verify the app

```sh
pnpm install --frozen-lockfile
pnpm check:types
pnpm test:braintrust
pnpm build
pnpm smoke
pnpm audit --prod
```

The product source lives in `src/`. The default Vite build generates the
Node application in `dist/`, and the UI build writes its static assets to
`dist/client/`. The smoke test starts only local processes and uses a fake
OpenAI-compatible provider; it never requires external credentials.

## Braintrust observability

Braintrust tracing is opt-in. `BRAINTRUST_API_KEY` enables initialization; when
it is absent, Socratink does not initialize Braintrust or register its Flue
instrumentation. `BRAINTRUST_PROJECT_NAME` selects the destination project and
defaults to `socratink`.

For now, enable tracing only for synthetic or development fixtures. Do not send
real learner traffic until Braintrust retention and access controls, plus an
application-specific masking policy, have been reviewed and tested. Traces can
observe run hierarchy, content, errors, tokens, cost, and correlation metadata.
They cannot establish an Evidence Contract, learner-authored provenance,
learner-state validity, durable learning, or causal learning lift.

`pnpm test:braintrust` deterministically proves the local configuration
contract: tracing remains off without a key, a configured key and project are
forwarded exactly once, and the project fallback is `socratink`. It uses fakes
and makes no Braintrust network call, so it does not prove live delivery,
masking, privacy, trace shape, or evaluation quality. No evaluation suite is
implemented yet.

## Foundation and attribution

Socratink was extracted from [Flue](https://github.com/withastro/flue) v2.0.3
at source commit
[`bf86b872`](https://github.com/withastro/flue/commit/bf86b872). The standalone
product consumes the published `@flue/*` packages and keeps those names, this
provenance statement, and the original [Apache License 2.0](LICENSE) so its
upstream lineage remains explicit.
