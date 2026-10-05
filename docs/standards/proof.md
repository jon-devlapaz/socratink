# Proof

A check proves only what it exercises. The reviewer names what each new test covers and what it leaves unproven.

**Production path.** A test enters through the code production runs. Fabricating the intermediate state by hand (a hand-built run fixture, a direct `runWithLearnerKey` call) proves the fixture. Drive the real entry point with a fake at the outermost seam (model provider, network, clock).

**Expensive backend runs.** The backend that costs most when wrong (hosted Postgres, live provider) has at least one test that executes its code path, even against a fake client that records the SQL. A suite that only constructs SQLite passes while Postgres is broken.

**Intended model.** Assertions state the target behavior. A test that pins today's wrong output (a `conv_*` conversation id returned as the learner id) locks in the bug.

**Observable difference.** A regression test fails when the behavior regresses. Name the one-line change that would break the behavior and confirm this test goes red. A session test that never sends a trailing-slash Chat path stays green when the missing-id gate fails open.

**Stated scope.** The PR description and README claim only what a check shows. "Boot throws without `CREDENTIALS_SECRET`" needs a boot that throws; "live Chat hotel-safety proven" needs the live intercept path.
