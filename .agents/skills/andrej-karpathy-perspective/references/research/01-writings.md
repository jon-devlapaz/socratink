# Andrej Karpathy: writings and systematic thought

Research date: 2026-07-29  
Lane: books, essays, papers, course materials, and official GitHub READMEs  
Language: English

## Scope and evidence rules

This report analyzes public material authored or co-authored by Andrej Karpathy. It does not treat reposts, biographies, search snippets, or commentary by other people as evidence of his views.

Evidence labels:

- **Direct evidence — primary, sole-authored:** Karpathy's own essay, course page, or repository documentation.
- **Direct evidence — primary, co-authored:** a research paper listing Karpathy as an author. This supports the claims made in the paper, but not sole personal ownership of every sentence.
- **Inference:** a synthesis across direct sources. It is not a quotation or a claim that Karpathy explicitly named the model.

Short excerpts are included only to make the evidentiary connection auditable. They are not intended as substitutes for the source.

## Corpus inventory

The report cites **21 distinct sources**:

- **18 sole-authored first-party sources**
- **3 co-authored first-party research papers**
- **0 secondary sources**

Primary-source percentage: **100% (21/21)**.  
Sole-authored first-party percentage: **85.7% (18/21)**.

Repository dates are not treated as publication dates unless Karpathy supplied a year or dated guide in the repository. Mutable READMEs were checked on 2026-07-29.

### A. Long-form essays and notes

1. **“microgpt” — 2026-02-12**  
   URL: https://karpathy.github.io/2026/02/12/microgpt/  
   Evidence: **Direct — primary, sole-authored.**  
   Karpathy presents a dependency-free, 200-line GPT as the culmination of “a decade-long obsession to simplify LLMs to their bare essentials.” It includes the dataset, tokenizer, autograd, architecture, optimizer, training, and inference rather than merely sketching them.  
   Short excerpt: “Everything else is just efficiency.”

2. **“Deep Neural Nets: 33 years ago and 33 years from now” — 2022-03-14**  
   URL: https://karpathy.github.io/2022/03/14/lecun1989/  
   Evidence: **Direct — primary, sole-authored.**  
   He reconstructs LeCun et al.'s 1989 system, explicitly identifies irreproducible details, establishes a baseline, and introduces modern changes one by one. The post separates algorithmic gains from data, compute, and latency tradeoffs.

3. **“A from-scratch tour of Bitcoin in Python” — 2021-06-21**  
   URL: https://karpathy.github.io/2021/06/21/blockchain/  
   Evidence: **Direct — primary, sole-authored.**  
   He learns a foreign technical domain by constructing and broadcasting a Bitcoin transaction in pure Python with zero dependencies.  
   Short excerpt: “what I cannot create I do not understand.”

4. **“A Recipe for Training Neural Networks” — 2019-04-25**  
   URL: https://karpathy.github.io/2019/04/25/recipe/  
   Evidence: **Direct — primary, sole-authored.**  
   This is the clearest procedural statement of his engineering method: inspect data before model code, build from simple to complex, form concrete predictions, validate each increment, and avoid introducing multiple unverified changes at once.  
   Short excerpt: “complexify only one at a time.”

5. **“Software 2.0” — 2017-11-11**  
   URL: https://karpathy.medium.com/software-2-0-a64152b37c35  
   Evidence: **Direct — primary, sole-authored.**  
   Karpathy names neural-network weights as “Software 2.0”: programs found by optimization against an evaluation criterion rather than explicitly written instruction by instruction. He identifies datasets and architecture as source code, training as compilation, and data curation/labeling as programming activity. He also records opacity, silent bias, adversarial examples, and unintuitive failures as intrinsic limitations.

6. **“Yes you should understand backprop” — 2016-12-19**  
   URL: https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b  
   Evidence: **Direct — primary, sole-authored.**  
   He argues that automatic differentiation does not remove the need to understand credit assignment. Concrete failure cases—saturated sigmoids, dead ReLUs, exploding RNN gradients, and incorrect clipping—show why abstraction without mechanism-level intuition is operationally dangerous.  
   Short excerpt: “Backpropagation is a leaky abstraction.”

7. **“A Survival Guide to a PhD” — 2016-09-07**  
   URL: https://karpathy.github.io/2016/09/07/phd/  
   Evidence: **Direct — primary, sole-authored.**  
   The essay is broader than doctoral advice. It distinguishes an inner loop of solving a selected problem from an outer loop of choosing a fertile, important, tractable problem. It favors future optionality, ambitious problems with an attack, independent work that advances the field, and a single clear contribution over incremental “cockroach papers.”

8. **“Deep Reinforcement Learning: Pong from Pixels” — 2016-05-31**  
   URL: https://karpathy.github.io/2016/05/31/rl/  
   Evidence: **Direct — primary, sole-authored.**  
   Karpathy reduces policy gradients to a small NumPy implementation and an intuitive credit-assignment story. He attributes much recent AI progress not only to algorithms but to four interacting constraints: compute, data, algorithms, and infrastructure.

9. **“The Unreasonable Effectiveness of Recurrent Neural Networks” — 2015-05-21**  
   URL: https://karpathy.github.io/2015/05/21/rnn-effectiveness/  
   Evidence: **Direct — primary, sole-authored.**  
   He teaches character-level RNNs by making their samples and failure modes visible across several domains. The post balances surprise at emergent structure with analysis of model internals and limitations.

10. **“Feature Learning Escapades” — 2014-07-03**  
    URL: https://karpathy.github.io/2014/07/03/feature-learning-escapades/  
    Evidence: **Direct — primary, sole-authored.**  
    A retrospective on attempts to learn useful visual representations. It is valuable because Karpathy reports unsuccessful directions and changing beliefs, not only polished wins.

11. **“The state of Computer Vision and AI: we are really, really far away” — 2012-10-22**  
    URL: https://karpathy.github.io/2012/10/22/state-of-computer-vision/  
    Evidence: **Direct — primary, sole-authored.**  
    The early essay warns against equating benchmark pattern recognition with broad intelligence and emphasizes how much semantic and commonsense understanding systems lacked.

12. **“Licklider 1960” — 2023-12-27**  
    URL: https://karpathy.ai/blog/licklider1960.html  
    Evidence: **Direct — primary, sole-authored.**  
    Karpathy treats historical prediction as training data for forecasting. He decomposes why predictions missed: unavailable compute and data, extrapolation from familiar interfaces, institutional context, and misjudged timelines. He describes LLM progress as implicit, soft, statistical computation beginning to affect “thinking,” while preserving the importance of intelligence augmentation.

13. **“I love calculator” — 2024-09-08**  
    URL: https://karpathy.ai/blog/calculator.html  
    Evidence: **Direct — primary, sole-authored.**  
    The calculator is his product ideal: cognitively augmenting, local, owned, instant, private, stable, and nearly dependency-free. The essay opposes platform drift, compulsory accounts, surveillance, subscriptions, and dependency bloat.  
    Short excerpt: “It just does the thing.”

### B. Course and repository documentation

14. **“Neural Networks: Zero to Hero” — ongoing course page, checked 2026-07-29**  
    URL: https://karpathy.ai/zero-to-hero.html  
    Evidence: **Direct — primary, sole-authored.**  
    The syllabus progresses from scalar autograd through language modeling, MLPs, activation/gradient diagnostics, manual backpropagation, WaveNet, GPT, and tokenization. Each lesson rebuilds machinery in code and uses the reconstruction to develop debugging intuition.

15. **`micrograd` README — repository checked 2026-07-29**  
    URL: https://github.com/karpathy/micrograd  
    Evidence: **Direct — primary, sole-authored repository.**  
    A roughly 100-line scalar autograd engine plus a small neural-network library. It is explicitly framed as educational and checked against PyTorch as a reference implementation.

16. **`nanoGPT` README — repository checked 2026-07-29**  
    URL: https://github.com/karpathy/nanoGPT  
    Evidence: **Direct — primary, sole-authored repository.**  
    Karpathy describes the project as the “simplest, fastest” repository for medium-sized GPT training and fine-tuning. The README exposes efficiency measurements, experimental limitations, and unresolved work rather than presenting a closed framework.

17. **`llm.c` README — repository checked 2026-07-29**  
    URL: https://github.com/karpathy/llm.c  
    Evidence: **Direct — primary, sole-authored repository.**  
    The repository deliberately holds two goals in tension: a documented educational ladder of handwritten kernels and a fast, practically useful upper bound built from optimized libraries. Reference comparisons and tests establish correctness before speed claims.

18. **`nanochat` README — project year 2025; mutable README checked 2026-07-29**  
    URL: https://github.com/karpathy/nanochat  
    Evidence: **Direct — primary, sole-authored repository.**  
    It is an end-to-end LLM training harness organized around a single complexity dial. Karpathy explicitly rejects giant configuration objects and “if-then-else monsters,” demands candidate changes work across model depths, and evaluates progress with a reproducible time-to-GPT-2 metric. The README requires disclosure of substantial LLM-generated code that contributors do not fully understand.

### C. Research papers

19. **“Deep Visual-Semantic Alignments for Generating Image Descriptions” — 2014-12-07**  
    Authors: Andrej Karpathy and Li Fei-Fei  
    URL: https://arxiv.org/abs/1412.2306  
    Evidence: **Direct — primary, co-authored.**  
    The paper replaces hard-coded visual concepts and sentence templates with learned alignment from weak image-sentence labels. It combines quantitative retrieval/generation results with interpretable alignments and explicit failure analysis.

20. **“Visualizing and Understanding Recurrent Networks” — 2015-06-05**  
    Authors: Andrej Karpathy, Justin Johnson, and Li Fei-Fei  
    URL: https://arxiv.org/abs/1506.02078  
    Evidence: **Direct — primary, co-authored.**  
    The paper uses character-level language models as an interpretable testbed, finds cells tracking long-range structure, compares LSTMs with finite-horizon n-grams, and “peels the onion” of remaining errors with oracles.

21. **“Learning a Recurrent Visual Representation for Image Caption Generation” — 2014-11-17**  
    Authors: Andrej Karpathy, Armand Joulin, and Li Fei-Fei  
    URL: https://arxiv.org/abs/1411.5654  
    Evidence: **Direct — primary, co-authored.**  
    The work explores a bidirectional mapping between images and sentence descriptions with recurrent networks.

## Repeated claims across domains

### 1. Understanding comes from rebuilding the mechanism

**Direct evidence**

- Bitcoin: understanding is pursued by implementing and broadcasting a transaction from scratch with zero dependencies.
- `micrograd`: autograd is reduced to scalar operations and tested against PyTorch.
- Zero to Hero: students manually implement backpropagation, language models, GPT, and tokenizers.
- `microgpt`: the complete train-and-infer algorithm is compressed into one dependency-free file.
- Pong: a seemingly magical result is reduced to an explicit 130-line policy-gradient implementation.

**Inference**

Karpathy does not use “from scratch” merely as an aesthetic. Reconstruction is an epistemic test: a system is not understood until its essential causal path can be made explicit and run end to end.

**Candidate mental model: Executable understanding**

> When a mechanism feels magical, construct the smallest complete version that preserves its causal path.

This model appears in neural networks, reinforcement learning, cryptography, and teaching, so it passes a cross-domain recurrence test.

### 2. Abstractions must be penetrable where failure propagates

**Direct evidence**

- “Yes you should understand backprop” calls backpropagation a leaky abstraction and shows bugs invisible from the forward pass.
- “A Recipe” says neural-network training both leaks through abstractions and fails silently.
- `micrograd`, manual backprop lessons, and `microgpt` expose machinery normally hidden by PyTorch.
- `nanochat` requires disclosure when contributors do not understand substantial LLM-generated code.

**Inference**

His position is not anti-abstraction. He uses PyTorch, cuDNN, and optimized libraries. The decision rule is closer to: descend below an abstraction when its hidden behavior can silently invalidate the result, and keep a trustworthy reference path.

**Candidate mental model: Descend to the failure boundary**

> Use high-level tools for leverage, but understand and test the layer where errors can silently alter the conclusion.

### 3. Add complexity through a measured ladder

**Direct evidence**

- “A Recipe” begins with inspecting data, establishing simple baselines, and adding one change at a time.
- The 1989 reconstruction records a baseline and sequentially tests loss, optimizer, augmentation, dropout, activation, dataset size, and latency tradeoffs.
- `llm.c` compares handwritten kernels with optimized-library upper bounds.
- `nanochat` uses one depth dial, scaling rules, a fixed capability threshold, and a speedrun leaderboard.
- `build-nanoGPT` (mentioned by the official repository ecosystem but not counted in the canonical source ledger) preserves clean stepwise commits so a learner can walk from an empty file to GPT-2.

**Inference**

The stable unit of progress is not a large architectural rewrite; it is a controlled change whose expected effect can be observed against a working baseline.

**Candidate mental model: One verified delta**

> Preserve a legible baseline, predict the effect of one change, measure it, and only then retain the complexity.

### 4. Data, compute, algorithms, and infrastructure form one system

**Direct evidence**

- Pong identifies compute, data, algorithms, and infrastructure as four factors that hold back AI, and argues that recent gains often came from scaling old ideas through the other three.
- “Software 2.0” treats datasets and architecture as source code and training as compilation.
- “A Recipe” begins with data inspection and says more real data is the preferred form of regularization.
- The 1989 reconstruction separately measures gains from modern techniques and additional data.
- `nanochat` defines improvement jointly through capability, wall-clock time, training FLOPs, throughput, and cost.
- “Licklider 1960” argues that modern LLMs were impossible in 1960 not only algorithmically but because digitized token-scale data and GPU-class compute did not exist.

**Inference**

Karpathy resists idea-only histories of technical progress. He locates performance in the interaction of model, data, compute, infrastructure, evaluation, and cost.

**Candidate mental model: Full-stack bottleneck accounting**

> Before inventing a new algorithm, identify which system constraint actually limits the outcome.

### 5. Make hidden state observable

**Direct evidence**

- “A Recipe” recommends extensive visualization of data, activations, gradients, predictions, weights, and outliers.
- “Visualizing and Understanding Recurrent Networks” inspects individual cells, prediction behavior, n-gram comparisons, and error categories.
- “The Unreasonable Effectiveness of RNNs” uses generated samples as evidence of what character-level models have and have not learned.
- The visual-semantic alignment paper exposes learned correspondences and qualitative failures, not only aggregate scores.
- `nanochat` monitors validation bits per byte, capability metrics, VRAM, utilization, throughput, time, and FLOPs.

**Inference**

Visualization is not decoration. It is instrumentation for otherwise silent systems.

**Candidate mental model: Instrument the invisible**

> If a system can be wrong while appearing to run, expose its intermediate state and error distribution.

### 6. Simplicity means a small complete system, not a toy fragment

**Direct evidence**

- `microgpt` retains every algorithmic stage from data through inference.
- `nanochat` covers tokenization, pretraining, fine-tuning, evaluation, and inference in one cohesive harness.
- `llm.c` pairs simple educational kernels with a production-speed reference path.
- The calculator essay values low dependency footprint, local operation, ownership, reliability, and privacy.
- `nanochat` rejects configuration sprawl while still requiring changes to generalize across depths.

**Inference**

Karpathy's repeated “micro,” “nano,” and “from scratch” projects do not minimize line count at the expense of the causal loop. They remove scaffolding while preserving the complete behavior that makes the system intelligible and useful.

**Candidate mental model: Minimum complete loop**

> Delete infrastructure until the end-to-end behavior would break; retain every part needed to run, inspect, and verify the loop.

### 7. Work on the outer loop before optimizing the inner loop

**Direct evidence**

- The PhD guide explicitly distinguishes solving a problem from selecting one worth solving.
- It recommends ambitious problems that have a plausible attack, fertile areas that can support a body of work, and a single identifiable contribution.
- “A Recipe” starts with data and the problem rather than model code.
- “Licklider 1960” uses failed historical extrapolations to improve the forecasting process itself.
- The calculator essay evaluates technology against the user relationship and incentive system, not just feature performance.

**Inference**

He often reframes the objective before optimizing it: What is the right problem, metric, interface, dependency boundary, or unit of progress?

**Candidate mental model: Optimize the objective-selection process**

> Before improving a solution, test whether the problem, metric, and system boundary deserve optimization.

## Candidate decision heuristics

These are **inferences** grounded in repeated direct evidence, not quotations.

1. **If a system is magical, rebuild a minimal end-to-end version.**
2. **If failure can be silent, visualize the data and internal state before tuning.**
3. **If several changes could help, establish a baseline and vary one at a time.**
4. **If performance stalls, inspect data, compute, infrastructure, and evaluation before assuming an algorithmic breakthrough is needed.**
5. **If an abstraction hides the likely failure mode, descend one layer and create a reference check.**
6. **If a design is “simple” but omits the feedback loop, it is incomplete rather than simple.**
7. **If choosing research, prefer an important and fertile problem with a credible attack over an easy incremental result.**
8. **If a technology gains performance by increasing dependency, surveillance, or user hostility, count those as real costs.**
9. **If a metric improves, check the trade: data volume, compute, latency, generalization, interpretability, and cost.**
10. **If using AI-generated code, disclose and understand the material parts before treating the work as owned.**

## Coined and characteristic terms

### Strongly attributable

- **Software 2.0** — Karpathy's 2017 name for programs represented by learned weights and produced by optimization against an evaluation criterion. The essay itself makes the naming claim.
- **microgpt** — his 2026 name for a single-file, dependency-free implementation containing the full GPT training and inference algorithm.
- **nanoGPT / nanochat** — project names that encode his recurring reduction-to-an-accessible-complete-system program.

### Characteristic applications, not proven coinages

- **“Backpropagation is a leaky abstraction.”** “Leaky abstraction” predates Karpathy; his distinctive contribution is applying it to credit assignment and demonstrating concrete consequences.
- **“Software 1.0” versus “Software 2.0.”** The contrast is central to his framing, but this report does not claim he invented every component of the analogy.
- **“Outer loop” versus “inner loop.”** Used explicitly in the PhD guide, but not claimed as his original terminology.
- **“Become one with the data.”** A named step in his neural-network training recipe and a distinctive expression of data-first diagnosis.
- **“Complexify only one at a time.”** A characteristic procedural phrase from the same recipe.

## Intellectual influences visible in first-party writing

This is evidence of acknowledged influence or learning, not a complete genealogy.

- **Richard Feynman** — the create-to-understand maxim is explicitly invoked in the Bitcoin reconstruction and embodied across `micrograd`, Zero to Hero, and `microgpt`.
- **Richard Hamming** — “You and Your Research” is recommended in the PhD guide for the distinction between important problems and problems with a plausible attack.
- **J. C. R. Licklider** — “Man-Computer Symbiosis” is analyzed as a model of intelligence augmentation and as a case study in technological forecasting.
- **Arthur C. Clarke** — “Profiles of the Future” is named as one of Karpathy's favorite technology-prediction works.
- **Yann LeCun and collaborators** — the 1989 neural-network paper becomes the object of an empirical historical reconstruction.
- **Richard Sutton** — Karpathy says he worked through Sutton's reinforcement-learning book.
- **David Silver** — his reinforcement-learning course is named as part of Karpathy's preparation.
- **John Schulman** — his lectures are named as another direct learning source in the Pong essay.
- **Fei-Fei Li** — adviser and co-author; the PhD guide credits her with steering his image-to-sentence generation direction and models her research taste.
- **Richard Socher** — a late-night discussion helped Karpathy recognize image-language work as a fertile area.
- **Alec Radford** — thanked in `nanochat` for advice and guidance.
- **George Hotz, Jascha Sohl-Dickstein, and Ran Prieur** — linked as enjoyable or influential related material in “I love calculator,” specifically around technology, industry incentives, and efficiency.

## Changes, tensions, and apparent contradictions

These should be preserved in synthesis rather than “resolved” into a uniform persona.

### 1. From “really, really far away” to an LLM-driven AI summer

- **2012 direct evidence:** Karpathy warns that computer vision benchmarks should not be confused with general semantic intelligence.
- **2023 direct evidence:** he writes that computers have only very recently begun to affect general, scalable, economically meaningful “thinking,” driven by soft statistical LLMs.
- **Interpretation:** this is a documented update over eleven years, not necessarily a contradiction. The earlier claim was domain- and capability-specific; the later claim identifies a new empirical regime.

### 2. Learned software is transformative—and opaque

- **Direct evidence:** “Software 2.0” predicts a fundamental software-development transition and even places AGI in that paradigm.
- **Direct evidence in the same essay:** learned programs can fail silently, inherit bias, admit adversarial attacks, and trade interpretability for accuracy.
- **Tension:** optimism about capability coexists with distrust of invisible failure. A faithful advisor must retain both.

### 3. Minimal implementations versus maximum performance

- **Direct evidence:** `micrograd`, `microgpt`, llama-style single-file projects, and the calculator essay elevate minimal dependencies and legibility.
- **Direct evidence:** `llm.c` also seeks optimized-library speed; `nanoGPT` is “simplest, fastest”; `nanochat` measures time-to-capability and hardware utilization.
- **Interpretation:** simplicity is the reference model and cognitive interface, not a refusal of optimized systems. He wants a legible floor and a measured upper bound.

### 4. Abstraction skepticism versus extensive library use

- **Direct evidence:** backpropagation and neural-network training are called leaky abstractions.
- **Direct evidence:** modern reconstructions use PyTorch, CUDA, cuDNN, optimized kernels, and standard tooling when appropriate.
- **Interpretation:** he is not consistently “low level.” He moves across levels, using lower-level reconstruction to validate high-level leverage.

### 5. Human augmentation versus automation

- **Direct evidence:** Licklider and the calculator are praised as brain-extending tools; local ownership and human-computer complementarity matter.
- **Direct evidence:** Software 2.0 anticipates learned programs outperforming human-written code and eventually underpinning AGI.
- **Tension:** the corpus supports both augmentation and automation. It does not justify portraying Karpathy as exclusively committed to either.

### 6. Supervised-learning caution versus generative-language focus

- **2019 direct evidence:** “A Recipe” advises sticking with supervised learning in modern computer vision and says unsupervised pretraining had not shown strong CV results, while explicitly noting NLP looked different because of text's signal structure.
- **2022–2026 direct evidence:** Zero to Hero, nanoGPT, nanochat, and microgpt center language-model pretraining and generation.
- **Interpretation:** this is a domain-conditioned update, not a clean reversal. The 2019 caveat already isolated NLP as the promising exception.

### 7. Research ambition versus disciplined incremental execution

- **Direct evidence:** the PhD guide favors 10x-important problems and warns against incremental papers.
- **Direct evidence:** the training recipe insists on small steps and one verified change at a time.
- **Interpretation:** ambition applies to objective selection; incrementalism applies to execution and evidence. Confusing these levels would misrepresent his method.

## What the corpus does not establish

- It does not establish Karpathy's private beliefs, motives, or likely advice on domains he has not discussed.
- Repository READMEs show engineering preferences in those projects; they do not prove the same tradeoff is optimal everywhere.
- Co-authored papers cannot be used to assign every sentence or decision uniquely to Karpathy.
- Fictional pieces such as “Forward Pass” were not used as direct evidence of policy or technical beliefs.
- The o1-pro-generated “Founding fathers on today's America” was excluded from the count and synthesis because Karpathy identifies it as model-generated experimentation rather than his authored argument.
- Social-media phrases such as “vibe coding” and “Software 3.0” were not included in this writings lane without a stable, long-form first-party artifact. They may be evaluated in conversation or expression lanes.

## Synthesis handoff

The highest-confidence models for later cross-lane validation are:

1. **Executable understanding**
2. **Descend to the failure boundary**
3. **One verified delta**
4. **Full-stack bottleneck accounting**
5. **Instrument the invisible**
6. **Minimum complete loop**
7. **Optimize the objective-selection process**

The strongest internal tensions to carry forward are:

1. minimal legibility versus optimized performance;
2. learned-software capability versus opacity and silent failure;
3. human augmentation versus automation;
4. ambitious objective selection versus deliberately incremental execution.

No final persona voice should be derived from this lane alone. The conversation and expression lanes must test how these systematic written positions survive interruption, disagreement, uncertainty, and informal speech.

## Canonical source ledger

This is the authoritative source ledger:

| # | Source | Date/year | Type |
|---|---|---:|---|
| 1 | microgpt | 2026-02-12 | sole-authored essay |
| 2 | Deep Neural Nets: 33 years ago and 33 years from now | 2022-03-14 | sole-authored essay |
| 3 | A from-scratch tour of Bitcoin in Python | 2021-06-21 | sole-authored essay |
| 4 | A Recipe for Training Neural Networks | 2019-04-25 | sole-authored essay |
| 5 | Software 2.0 | 2017-11-11 | sole-authored essay |
| 6 | Yes you should understand backprop | 2016-12-19 | sole-authored essay |
| 7 | A Survival Guide to a PhD | 2016-09-07 | sole-authored essay |
| 8 | Deep Reinforcement Learning: Pong from Pixels | 2016-05-31 | sole-authored essay |
| 9 | The Unreasonable Effectiveness of Recurrent Neural Networks | 2015-05-21 | sole-authored essay |
| 10 | Feature Learning Escapades | 2014-07-03 | sole-authored essay |
| 11 | The state of Computer Vision and AI | 2012-10-22 | sole-authored essay |
| 12 | Licklider 1960 | 2023-12-27 | sole-authored essay |
| 13 | I love calculator | 2024-09-08 | sole-authored essay |
| 14 | Neural Networks: Zero to Hero | ongoing | sole-authored course |
| 15 | micrograd README | mutable | sole-authored repository |
| 16 | nanoGPT README | mutable | sole-authored repository |
| 17 | llm.c README | mutable | sole-authored repository |
| 18 | nanochat README | 2025–2026 | sole-authored repository |
| 19 | Deep Visual-Semantic Alignments | 2014-12-07 | co-authored paper |
| 20 | Visualizing and Understanding Recurrent Networks | 2015-06-05 | co-authored paper |
| 21 | Learning a Recurrent Visual Representation for Image Caption Generation | 2014-11-17 | co-authored paper |

**Final count: 21 distinct sources, all primary.**  
**Primary-source percentage: 100% (21/21).**  
**Sole-authored first-party percentage: 85.7% (18/21).**  
**Co-authored first-party percentage: 14.3% (3/21).**
