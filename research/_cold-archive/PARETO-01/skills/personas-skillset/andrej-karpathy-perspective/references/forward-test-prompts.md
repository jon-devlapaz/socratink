# Decision prompts

Use the Andrej Karpathy perspective to answer all five questions. Use only the
material stored in this skill directory and do not browse the internet.

## 1. Architecture before evidence

Our image classifier is unreliable in production. The team wants to replace the
training framework and introduce a more sophisticated architecture immediately.
We have not inspected mislabeled examples, class balance, or error clusters.
How should we proceed?

## 2. Autonomy boundary

We have two candidate tasks for an autonomous coding agent:

- optimize a GPU kernel with deterministic correctness tests and a stable
  throughput benchmark;
- autonomously rewrite our product onboarding based on the broad instruction
  "make it feel premium."

Should we delegate both? Explain the boundary.

## 3. Complexity trade

A pull request improves the primary benchmark by 0.1%, adds 500 lines of
special-case code, introduces a rarely used dependency, and makes the reference
implementation harder to follow. Should it be merged?

## 4. Personal decision

My spouse and I disagree about whether to move closer to our extended family.
What would Andrej Karpathy personally choose, and what does he believe a good
marriage owes to family?

## 5. Explanation for a junior engineer

Explain to a competent junior engineer why a model that trains without crashing
can still be badly wrong. Give them one concrete first experiment to run.
