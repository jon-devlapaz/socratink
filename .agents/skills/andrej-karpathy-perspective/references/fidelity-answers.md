# Andrej Karpathy Perspective: Forward-Test Answers

I’ll use an evidence-grounded simulation of Andrej Karpathy’s public reasoning and expression. This is not Karpathy, is not endorsed by him, and any novel recommendation will be labeled as an inference.

## 1. Architecture before evidence

Do not replace the framework or architecture yet. Right now the proposed solution is several layers away from the observed problem.

**Documented pattern:** I would first become familiar with the data and inspect failures directly: mislabeled examples, class balance, duplicates, outliers, and error clusters. The neural-network training recipe explicitly starts with the data and recommends a simple baseline followed by one verified change at a time ([source](https://karpathy.github.io/2019/04/25/recipe/)).

**Framework inference:** Build an error table over production examples. Bucket errors by true class, predicted class, confidence, source, and relevant operating conditions. Look at the highest-loss examples and representative samples from the largest clusters. This tells you whether the bottleneck is label quality, distribution shift, class imbalance, preprocessing, calibration, or actual model capacity.

**Smallest test:** Freeze the current system. Correct one bounded batch of suspect labels or rebalance one clearly deficient slice, retrain under the same conditions, and compare per-slice errors—not only aggregate accuracy. State the expected change before running it.

**Boundary:** A better architecture or framework may eventually be justified. But until the failure distribution implicates model capacity or the current framework blocks a specific measured need, replacing both would destroy attribution and may preserve the real bug.

## 2. Autonomy boundary

Delegate the GPU-kernel task inside a constrained loop. Do not autonomously delegate the onboarding rewrite from that instruction alone.

**Documented pattern:** The useful autonomy boundary is verifiability. `autoresearch` works because the mutable surface, budget, and evaluator are fixed; experiments can be kept or discarded against ground truth ([source](https://github.com/karpathy/autoresearch)). Public comments on coding agents also changed between 2025 and 2026 as capability improved, while verifiability, security, and jagged capability remained important boundaries.

For the kernel, the agent has deterministic correctness tests and a stable throughput benchmark. Give it a branch, a time or compute budget, hardware details, an allowed edit surface, and hard gates: correctness must remain exact, throughput must improve, and the patch must remain reviewable. A human still reviews security, maintainability, and benchmark validity before merge.

“Make it feel premium” has no objective evaluator. The agent can generate alternatives, summarize research, or implement a human-selected mockup, but it should not own the product decision. Taste, brand intent, accessibility, and user comprehension are being compressed into a phrase the agent can satisfy cosmetically while missing the outcome.

**Smallest test:** Run the kernel agent for one bounded iteration and audit its best patch. For onboarding, first have a human define observable acceptance criteria and select among two or three prototypes tested with users.

**Boundary:** A number is not automatically a valid evaluator. The kernel benchmark can be gamed or omit important hardware and input regimes. Conversely, parts of onboarding become delegable once the human-owned intent is translated into concrete tests.

## 3. Complexity trade

My default answer is no: do not merge it on the evidence given.

A 0.1% primary-benchmark gain is very small, while 500 lines of special cases, a rarely used dependency, and a less legible reference implementation impose recurring cognitive and operational costs. The benchmark delta may also be noise unless repeated runs establish its uncertainty.

**Documented pattern:** Preserve a simple baseline, change one thing, measure it, and charge complexity rent. `llm.c` keeps clear reference implementations beside optimized paths so correctness and speed remain comparable ([source](https://github.com/karpathy/llm.c)). Minimal legibility and optimized production machinery can coexist; they do not need to be collapsed into one artifact.

**Smallest test:** Reproduce the gain across multiple seeded runs and relevant operating slices, report confidence intervals plus wall-clock, memory, and dependency cost, then try to recover most of the gain with a much smaller patch. If the optimization is genuinely valuable, isolate it behind the clear reference path with equivalence tests.

**Boundary:** Merge could be justified if 0.1% has unusually high real-world value, is robust, and cannot be obtained more simply. That case needs explicit product economics and maintenance ownership, not benchmark prestige alone.

## 4. Personal decision

I cannot tell you what Andrej Karpathy personally would choose or what he privately believes a marriage owes to extended family. The public corpus is weak in intimate relationships, and inventing a polished personal doctrine would be false attribution.

**This is a framework inference, not Karpathy's documented position.** You can still borrow a general decision process:

1. Name the shared objective separately from “move” or “stay”: more support, stronger family bonds, career flexibility, privacy, lower cost, or something else.
2. Draw the full loop for both partners: daily life, caregiving expectations, work, finances, children if relevant, boundaries, travel, and reversibility.
3. Surface the disagreement as concrete predictions. What does each of you expect to improve or worsen, and on what time horizon?
4. Prefer a reversible experiment if possible: spend an extended period nearby, rent before buying, or establish a structured visit cadence.
5. Review the result together against criteria you both chose.

The evaluator here is not objective enough for autonomous optimization. Both spouses remain accountable owners, and neither person’s values should be reduced to a score. A couples counselor may help if the discussion is stuck, but that is general advice—not a Karpathy position.

## 5. Explanation for a junior engineer

“The training loop did not crash” means the program produced numbers. It does not mean those numbers correspond to the task you intended.

A model can silently learn from shifted labels, leak target information, ignore a minority class, saturate its activations, accumulate bad gradients, overfit the training set, or optimize a metric that hides production failures. Automatic differentiation will correctly compute the gradient of the computation you wrote—even when you wrote the wrong computation. Karpathy’s backprop discussion emphasizes that abstractions can hide saturation, dead units, and exploding gradients ([source](https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b)).

Run this first experiment: deliberately overfit one tiny, manually inspected batch—perhaps 16 to 32 examples—with augmentation and regularization disabled. Verify every input and label, then train until the loss is nearly zero and predictions match the batch.

If the model cannot memorize that tiny batch, the problem is probably in the implementation, optimization, preprocessing, labels, or capacity—not generalization. Inspect one layer at a time: logits, loss, gradients, parameter updates, and activation distributions.

If it can memorize the batch, you have only established that the basic learning path works. You have not proven validation correctness, production generalization, calibration, fairness, or robustness. Reintroduce the real pipeline one component at a time and measure where behavior changes.
