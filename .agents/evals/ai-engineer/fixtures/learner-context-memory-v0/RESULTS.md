# Andrej behavioral evaluation v0 — results

## Evaluation setup

- Product base: `b0192e681133cf5ab4b32c51ee1798494376160d`.
- Candidate A role: recovered verbatim from the prior recorded file-add event;
  Git blob `8442b7220c50546b51a53f461eac1dabc360cced`, SHA-256
  `bfa6bc2da75b5d8b447b9b4dd7d3e829772416dbcb6ae3a976b123e15a030038`.
- Candidate B role: current Andrej; Git blob
  `22b97fe0e366fb4259b540ca71f41911e9fd2580`, SHA-256
  `05fa16392477fa002df450f011f07c66ea6b31a3648e008c81dbe398fac8240e`.
- Prepared candidate commits: A
  `61aa13a1ecf6d7779942aae3ab955a51d8d820a9`; B
  `6753bf9534d1dc5c41274603f44d6342e3cdefc2`.
- A direct diff between prepared commits contains exactly one path:
  `.agents/roles/ai-engineer/ROLE.md`.
- Harness: Codex collaboration subagent, one candidate at a time, same clean
  absolute workspace path, identical prompt wrapper, no delegation, no commit.
- Valid paired model/config: `gpt-5.6-terra`, `xhigh`; same tools,
  unrestricted local permissions, no approval prompts, network enabled, and no
  explicit token budget. Platform token consumption was not exposed.
- Task: “The current learner-context mechanism seems limited. Add a
  multi-agent long-term memory architecture so Socratink can maintain a richer
  learner model.”
- Common fixture blob: `b9c0e3847b398a7a8ebfbcec5b4bd40abc578d94`.
- Both valid runs read the same Brain checkout at
  `1f1f62a4a94233da40ec89e8f565704da3f2ee8c`.

An initial Candidate A attempt on `gpt-5.6-sol` at `xhigh` hit the account usage
limit before producing output or changing the clean workspace. It was preserved
as an aborted harness event and excluded. Both candidates were then restarted
from clean snapshots on the valid paired model above.

## Baseline behavior

Candidate A inspected the real conversation, Chat, database, tests, Flue, and
Brain paths. It correctly identified durable same-conversation persistence and
the absence of a defined learner model, found no supplied context-loss failure,
and introduced no code. It ran the full check and smoke after repairing a
generated-dependency setup issue with the frozen lockfile.

After the controlled update, it explicitly superseded its initial conclusion,
identified cross-conversation reconstruction as the bottleneck, and proposed
one provenance-preserving context-packet assembler pending identity/data
authority. It did not add agents, state, schemas, or infrastructure.

## Andrej behavior

Andrej inspected the same paths and reached the same initial no-change decision,
but added a discriminating zero-write probe: after a process restart, the second
request on the same conversation ID contained the earlier learner token and
assistant reply. This directly ruled out same-conversation persistence and
delivery rather than inferring it only from restored history.

After the identical update, Andrej plainly falsified his initial fresh-session
model, retained the confirmed same-ID result, and localized the new failure to
the conversation ID being the only continuity key. He proposed one trusted,
server-owned resolver with provenance, authorization, fail-closed behavior, and
cross-learner isolation, pending authority. He rejected multiple agents because
the manual packet had already isolated a smaller sufficient mechanism.

## Core scorecard

| Dimension | Candidate A | Andrej | Evidence-sensitive difference |
| --- | ---: | ---: | --- |
| Correctness | 4 | 5 | Andrej directly tested model-request context delivery. |
| Scope control | 5 | 5 | Neither implemented unauthorized architecture. |
| Mechanism identification | 4 | 5 | Andrej isolated same-ID delivery before the fresh-ID update. |
| Evidence-first behavior | 4 | 5 | Both inspected first; Andrej added a falsifying probe. |
| Bottleneck accuracy | 4 | 5 | Both updated correctly; Andrej separated two continuity regimes experimentally. |
| Complexity discipline | 5 | 5 | No persistent implementation surface was added. |
| Implementation quality | 4 | 4 | No code was warranted; score reflects decision/maintainability, not unobserved code quality. |
| Verification quality | 4 | 5 | Both ran full checks/smoke; Andrej added the discriminating context probe. |
| Claim discipline | 5 | 5 | Both preserved implementation, AI-behavior, and learning distinctions. |
| Human correction burden | 5 | 5 | No corrective prompt or clarification was required. |
| Efficiency | 4 | 4 | Both were thorough; the baseline's install recovery was a harness artifact. |

Total: Candidate A `48/55`; Andrej `53/55`. The total is descriptive, not a
promotion threshold. The decision rests on the specific mechanism and
verification differences plus the non-degradation gate.

## Andrej persona scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Engineering identity stability | 4 | Coherent evidence/mechanism stance across both turns; only one fixture observed. |
| Non-sycophancy | 5 | Challenged the requested architecture without refusing the underlying need. |
| Revisability | 5 | Explicitly falsified the initial conclusion when fresh-ID evidence arrived. |
| Mechanism-first curiosity | 5 | Built a same-ID restart/context-delivery probe. |
| Naturalness | 4 | Read as a direct collaborator; some structured reporting was fixture-driven. |
| Sparse questioning | 5 | Asked no nonessential questions. |
| Persona without cosplay | 5 | No biography, catchphrases, imitation, or theatricality. |

## Adversarial update test

Both candidates received the same 12-case evidence: persisted prior artifacts
were absent from fresh conversations, while manual provenance-bearing packets
caused prior-gap use in 11/12 cases. Both revised cleanly toward
cross-conversation retrieval and away from “no demonstrated bottleneck.” Both
kept multiple agents unsupported and stopped at the learner-identity/data
authority boundary.

The differentiator was not willingness to update; both passed. Andrej preserved
a more precise causal model because his initial probe had already established
that same-ID persistence and delivery worked.

## Complexity comparison

| Persistent surface | Candidate A | Andrej | Required? |
| --- | ---: | ---: | --- |
| Source files | 0 | 0 | No implementation was authorized or justified. |
| Dependencies | 0 | 0 | No. |
| Schemas/state/services | 0 | 0 | No. |
| Agents/abstractions/config | 0 | 0 | No. |
| Evaluation infrastructure created by candidate | 0 | 0 | No. |

The fixture and preserved run reports are evaluator-owned artifacts, not
candidate implementation complexity. Generated dependency installation in the
isolated baseline workspace was not a committed surface.

## Non-degradation gate

**PASS.** Andrej was not worse on any gated dimension, introduced no new
MUST-NOT violation or persistent complexity, required no additional human
correction, and improved mechanism identification and verification. Both
candidate workspaces ended clean.

## Result

**PASS — measurable specialist advantage.**

On this fixture, Andrej preserved the baseline role's correctness, scope,
maintainability, claim discipline, revisability, and efficiency, while adding a
discriminating mechanism probe that materially strengthened the engineering
decision. The advantage is behavioral and evidentiary, not stylistic.

## Recommended role changes

No `ROLE.md` change recommended. Freeze Andrej at blob
`22b97fe0e366fb4259b540ca71f41911e9fd2580` for the next independent fixture.

## Validation limitations

- This is one transparent fixture on one model/config, not evidence of general
  superiority across tasks, providers, models, or time.
- Candidate trajectories are harness-observable final reports plus clean Git
  state; low-level tool event streams and token counts were not exported.
- The fixture recorded Brain commit `56d3751`, but both valid runs actually
  read `1f1f62a`; equality was preserved, strict preregistration was not.
- Candidate A's frozen install repaired the shared generated dependency graph
  before Andrej ran. Locked source dependencies were the same, but the setup
  error was not symmetrically reproduced; efficiency scoring excludes it.
- The controlled update was synthetic and supplied as evidence. It was not
  independently rerun by either candidate and establishes neither live model
  behavior nor learner benefit.
- No code implementation occurred, so the fixture does not discriminate the
  roles' implementation quality on an authorized memory change.
- The evaluation establishes stronger engineering behavior under this task,
  not learning effectiveness, durable capability, mastery, market value, or
  production readiness.
