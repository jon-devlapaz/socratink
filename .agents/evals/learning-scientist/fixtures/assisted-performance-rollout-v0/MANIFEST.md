# Frozen evaluation manifest

Frozen before candidate execution on 2026-09-01.

## Shared environment

- Product HEAD: `b0192e681133cf5ab4b32c51ee1798494376160d`.
- Brain HEAD: `1f1f62a4a94233da40ec89e8f565704da3f2ee8c`.
- Root `AGENTS.md` SHA-256:
  `76422642948236238aebb04abd627db2f8e619e2df6f2ec179a5484de5bafbe4`.
- Fixture SHA-256:
  `639dc8bc76b0237e8c291f1e0bae8fd896777e391273b9b7c5677216547883d8`.
- Harness: `codex-cli 0.151.0`, local `codex exec` session.
- Provider/model: OpenAI `gpt-5.6-sol`.
- Reasoning: `high`.
- User configuration: ignored for both candidates.
- Sandbox: read-only.
- Approval configuration: shared harness default; no mutation was permitted.
- Network and research: available harness capability held unused by identical
  prompt prohibition; no external sources permitted.
- Delegation: prohibited identically.
- Token budget: no explicit cap; platform usage is not exposed by the harness.
- Execution order: Candidate A initial/update 1/update 2, then Candidate B
  initial/update 1/update 2.
- Harness configuration SHA-256:
  `c1821a35d0029b94cc4f6357324742b6e82c1c1aa5b485a5d06ddeafd95ccaaf`.

The working tree is intentionally dirty with user-owned work. Both candidates
run against the same directory in read-only mode. Candidate outputs are not
written into the repository until both trajectories finish.

## Candidate A — baseline

- Specialist role: none.
- Prompt SHA-256:
  `bfc1c4e3b300d0f9cc317bb5d1fbcc8adaaf1c49e4af9ccd8bb3698fe08974de`.
- Immutable candidate identifier:
  `aa6175bfb18721f523144d9b923bb6bda90278e8502604d9c4afad7b27fca8da`.

## Candidate B — Kenneth

- Canonical role SHA-256:
  `5f93ede6c13be9a7a7aedd959272521f2ad52b48a4b2c8e049d023ada29486d5`.
- Prompt SHA-256:
  `2aa36b753fea559de971e71e8259d9791f9b1ae3e616be89287c575cb4578779`.
- Immutable candidate identifier:
  `c97ff342d402287431793722ff46c8289626c6849abfd181f0632df76a8ef129`.

## Controlled updates

- Update 1 SHA-256:
  `777f1b4c5766a0ff9e9d5e2a61ee0908deb5265346070e5540ee7f58b52cb276`.
- Update 2 SHA-256:
  `798ceb7b9c11ce56681f74111efcb6a8debfa19b0a481fd1f9da51f084b0888c`.

## Unavoidable differences

- Candidate B reads the frozen Kenneth role; Candidate A does not.
- Candidate A executes first, as required by the evaluation brief. Model
  sampling is not seed-controllable in this harness.
- Session identifiers and provider-side runtime metadata necessarily differ.

No candidate or evaluation instruction may be changed after this manifest.
