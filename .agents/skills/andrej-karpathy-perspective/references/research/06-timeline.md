# Andrej Karpathy: chronology and documented belief updates

Research cutoff: **2026-08-01**
Lane: dated biography, work phases, and changes in publicly documented technical emphasis  
Language: English

## Evidence policy

This is a chronology, not a psychological biography. Each entry separates:

- **Work/biography:** a dated institutional or professional fact.
- **Documented intellectual update:** what Karpathy published, taught, built, or explicitly said at that time.

“Update” means a change in emphasis visible in the dated record. It does **not**
mean that an earlier view was repudiated unless he says so. Sources are ordered
by preference: Karpathy's own dated material, official institutional records,
then reputable contemporaneous reporting. Mutable homepages and GitHub READMEs
are useful for self-description but are not reliable clocks by themselves.

Confidence labels:

- **High:** first-party dated source or official institutional record.
- **Medium:** contemporaneous reputable reporting, often quoting a first-party
  announcement that is difficult to retrieve directly.
- **Uncertain:** the year or boundary is approximate, or public sources do not
  establish the stronger interpretation.

## Chronological map

### 2005-2009 — physics, computer science, and first exposure to deep learning

**Work/biography (high).** Karpathy's current biography records a BSc at the
University of Toronto: double major in computer science and physics, with a
minor in mathematics. He says this is where he first encountered deep learning,
through Geoffrey Hinton's class and reading groups.

**Documented intellectual update.** This phase establishes a recurring
orientation rather than a public doctrine: combine mechanism-level physical
intuition with executable computer science. Later “from scratch” work repeatedly
returns to this combination, but attributing that later style entirely to his
undergraduate education would be inference.

Source: [Karpathy's current biography](https://karpathy.ai/) (mutable page,
checked 2026-07-29).

### 2009-2011 — learning controllers in simulation

**Work/biography (high).** MSc at the University of British Columbia with
Michiel van de Panne, working on learned controllers for physically simulated
figures.

**Documented intellectual update.** The earliest clearly stated problem family
in his own chronology is learning behavior rather than hand-authoring it. This
prefigures his later interest in reinforcement learning and learned software,
but “prefigures” is a retrospective synthesis, not his stated view at the time.

Source: [Karpathy's current biography](https://karpathy.ai/) (mutable page,
checked 2026-07-29).

### 2011-2012 — Stanford vision research; explicit skepticism about near-term AI

**Work/biography (high).** Karpathy began his Stanford PhD period in 2011 under
Fei-Fei Li. His biography also records a 2011 Google Brain internship on
large-scale unsupervised learning from video.

**Documented intellectual update (high).** In April 2011 he manually measured a
human baseline on CIFAR-10 rather than treating benchmark scores as
self-explanatory. On 2012-10-22 he published “The state of Computer Vision and
AI: we are really, really far away,” explicitly arguing against claims that
then-current computer vision implied nearby general intelligence. The important
early stance is empirical skepticism: inspect failure modes and compare systems
with what humans actually do, not only with the previous leaderboard.

Sources:

- [“Lessons learned from manually classifying CIFAR-10,” 2011-04-27](https://karpathy.github.io/2011/04/27/manually-classifying-cifar10/)
- [“The state of Computer Vision and AI,” 2012-10-22](https://karpathy.github.io/2012/10/22/state-of-computer-vision/)
- [Karpathy's biography](https://karpathy.ai/)

### 2013-2014 — scaling feature learning; evidence begins to outrun prior skepticism

**Work/biography (high).** The Stanford period broadened across vision and
language. His biography records a 2013 Google Research internship on
large-scale supervised learning from YouTube video. His 2013-2014 publications
include grounded image-language semantics, video classification, and learned
image-sentence embeddings.

**Documented intellectual update (high).** By 2014 his writing focuses less on
whether deep learning works and more on what representations it discovers,
where supervised learning has an advantage, and how to interrogate models. In
the ImageNet human-comparison experiment, he built custom tooling and did the
classification task himself. This is a meaningful shift from broad 2012
skepticism to accepting rapid narrow progress while continuing to demand
human-referenced, failure-sensitive evaluation.

Sources:

- [“What I learned from competing against a ConvNet on ImageNet,” 2014-09-02](https://karpathy.github.io/2014/09/02/what-i-learned-from-competing-against-a-convnet-on-imagenet/)
- [Karpathy's academic publication record](https://cs.stanford.edu/people/karpathy/)

### 2015-2016 — vision-language PhD, CS231n, RNNs, and executable explanation

**Work/biography (high).** Karpathy designed and was the primary instructor for
Stanford's first deep-learning course, CS231n, initially offered in 2015. His
PhD work joined convolutional and recurrent neural networks across vision and
natural language; the Stanford record dates the thesis “Connecting Images and
Natural Language” to 2016. He also interned with DeepMind's deep reinforcement
learning team in 2015.

**Documented intellectual update (high).**

- On 2015-05-21, the RNN essay showed surprisingly coherent character-level
  language generation from small, inspectable models. The emphasis moved from
  “are neural nets real?” toward examining what internal cells learn and where
  further gains might come from.
- In the 2016 Pong tutorial, he reduced policy gradients to a short NumPy
  implementation and identified **compute, data, algorithms, and
  infrastructure** as interacting drivers of recent AI progress.
- In “Yes you should understand backprop,” he called backpropagation a “leaky
  abstraction.” Automatic differentiation is useful, but it does not remove the
  need to understand saturation, dead units, exploding gradients, and credit
  assignment.
- His PhD guide separated the inner loop of solving a problem from the outer
  loop of choosing a problem, and emphasized important, tractable work with a
  clear contribution.

This period is the clearest origin of the later “build the whole thing, then
teach the mechanism” style.

Sources:

- [Stanford academic page and thesis record](https://cs.stanford.edu/people/karpathy/)
- [“The Unreasonable Effectiveness of Recurrent Neural Networks,” 2015-05-21](https://karpathy.github.io/2015/05/21/rnn-effectiveness/)
- [“Deep Reinforcement Learning: Pong from Pixels,” 2016-05-31](https://karpathy.github.io/2016/05/31/rl/)
- [“A Survival Guide to a PhD,” 2016-09-07](https://karpathy.github.io/2016/09/07/phd/)
- [“Yes you should understand backprop,” 2016-12-19](https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b)

### 2015-2017 — founding OpenAI: from narrow models toward general learning systems

**Work/biography (high).** OpenAI's 2015-12-11 founding announcement names
Karpathy among its founding research engineers and scientists. His own
chronology describes him as a research scientist and founding member from 2015
to 2017, working across deep learning, computer vision, generative modeling, and
reinforcement learning.

**Documented intellectual update.** The work scope broadens from academic
vision-language systems to generative models, reinforcement learning, and
web-based agents. The official founding thesis is that deep learning replaces
task-specific hand-coded algorithms with architectures that learn algorithms
from data, while still having narrow capabilities and uncertain progress toward
human-level intelligence. That statement is co-authored institutional context;
it should not be treated as Karpathy's sole-authored creed.

Sources:

- [OpenAI, “Introducing OpenAI,” 2015-12-11](https://openai.com/index/introducing-openai/)
- [Karpathy's current biography](https://karpathy.ai/)
- [“World of Bits,” ICML 2017](https://proceedings.mlr.press/v70/shi17a.html)

### June 2017-July 2022 — Tesla: data engines and fleet-scale embodied perception

**Work/biography (high for year range; medium for exact start day).** Karpathy
joined Tesla in June 2017 in a senior computer-vision role and later served as
Director/Senior Director of AI. His own biography says he led the Autopilot
computer-vision team and the in-house loop spanning data labeling, neural
network training, and deployment to Tesla's custom inference hardware.
Contemporaneous reporting dates the hire to June 2017. On 2022-07-13, after a
several-month sabbatical, he announced that he was leaving Tesla after five
years.

**Documented intellectual update.**

- “Software 2.0” (2017-11-11) names neural-network weights as programs found by
  optimization rather than written instruction by instruction. Datasets and
  labeling become source code; training becomes compilation. The essay also
  records the liabilities: opacity, silent bias, adversarial inputs, and
  unintuitive failures.
- Tesla talks make the operating system around a model central: data
  acquisition, labeling, training, evaluation, deployment, and telemetry form a
  recurring loop. By 2022 he sharpened this in public notes: advantage comes not
  merely from possessing data, but from having a **data engine** that repeatedly
  acquires, retrains, evaluates, deploys, and collects telemetry.
- “A Recipe for Training Neural Networks” (2019-04-25) turns model training into
  a disciplined debugging process: inspect the data, begin with simple
  baselines, predict the effect of each change, and complexify one verified
  increment at a time.
- The 2022 LeCun reconstruction updates the story of progress: much improvement
  comes from interacting changes in data, compute, optimization, and
  implementation, not a single magical algorithm.

This is a shift from research prototypes to a production learning system whose
primary artifact is the closed data-and-deployment loop.

Sources:

- [Karpathy's Tesla self-description](https://karpathy.ai/)
- [Axios on the June 2017 hire](https://www.axios.com/2017/12/15/teslas-head-of-autopilot-software-is-leaving-after-just-six-months-1513303134)
- [Reuters on the 2022-07-13 departure](https://www.investing.com/news/stock-market-news/teslas-ai-director-leaving-company-after-4month-sabbatical-2846987)
- [“Software 2.0,” 2017-11-11](https://karpathy.medium.com/software-2-0-a64152b37c35)
- [“A Recipe for Training Neural Networks,” 2019-04-25](https://karpathy.github.io/2019/04/25/recipe/)
- [“Deep Neural Nets: 33 years ago and 33 years from now,” 2022-03-14](https://karpathy.github.io/2022/03/14/lecun1989/)
- [Karpathy's dated tweet archive](https://karpathy.ai/tweets.html)

### July 2022-February 2023 — independent building and the “from scratch” LLM curriculum

**Work/biography (high).** Between leaving Tesla and returning to OpenAI,
Karpathy worked publicly on personal and educational projects. “Neural Networks:
Zero to Hero” teaches neural networks by implementing them from scratch in code;
micrograd, makemore, and nanoGPT form a progression from scalar automatic
differentiation to a GPT.

**Documented intellectual update (high).** The educational method becomes a
primary output rather than a side effect of research. The course starts below
framework abstractions and reconstructs the stack upward. This does not indicate
a retreat from frontier work; it reflects a belief that durable understanding
comes from building the mechanism in minimal code.

Sources:

- [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)
- [nanoGPT](https://github.com/karpathy/nanoGPT)
- [micrograd](https://github.com/karpathy/micrograd)

### February 2023-February 2024 — return to OpenAI: LLMs as an emerging computing stack

**Work/biography (high for the year range; medium for exact rejoin date).**
Karpathy publicly announced his return on 2023-02-09. His current biography says
he built a new team working on mid-training and synthetic-data generation.
OpenAI lists him among contributors to GPT-4o. On 2024-02-13 he confirmed that
he had left the prior day; OpenAI told TechCrunch that his responsibilities had
been transferred to another researcher. He said there was no precipitating
event, issue, or drama.

**Documented intellectual update.**

- “State of GPT” (May 2023) explains the LLM pipeline as a stack:
  pretraining, supervised fine-tuning, preference/reward modeling, and
  reinforcement learning. The relevant update is that language models are no
  longer merely sequence models; post-training, interfaces, and tool use make
  them a general computing substrate.
- In the 2023 Licklider essay, Karpathy revives “intelligence augmentation” as
  a neglected design branch. The implied alternative to full automation is a
  tight human-computer partnership with better interaction surfaces.
- Near his departure, his self-description used JARVIS as shorthand for a
  helpful, conversational, empowering assistant—an aid to human agency rather
  than a statement that autonomy is already solved.

Sources:

- [Karpathy's current biography](https://karpathy.ai/)
- [“State of GPT” slides, 2023](https://karpathy.ai/stateofgpt.pdf)
- [“Licklider 1960,” 2023-12-27](https://karpathy.ai/blog/licklider1960.html)
- [TechCrunch on the 2024-02-13 departure](https://techcrunch.com/2024/02/13/andrej-karpathy-is-leaving-openai-again-but-he-says-there-was-no-drama/)
- [OpenAI GPT-4o contributions](https://openai.com/gpt-4o-contributions/)

Exact-day caveat: the rejoin day is preserved from his dated public
announcement as reported and linked by contemporaneous coverage; his own
homepage gives only “2023-2024.”

### February-July 2024 — personal projects, minimal training stacks, and local tools

**Work/biography (high).** After leaving OpenAI, Karpathy returned to public
building. `llm.c` implemented GPT-2 training in raw C/CUDA; its stated purpose
was a direct, readable implementation, later extended into a fast reproduction.

**Documented intellectual update (high).** Minimal implementations are now used
not only for teaching inference but for understanding and optimizing real
training systems. In “I love calculator” (2024-09-08, written shortly after the
Eureka launch), he also articulates a product preference: compact, local,
instant, dependency-free, privacy-preserving tools with no account or recurring
service requirement. This is not anti-cloud dogma; it is a concrete counterweight
to needlessly mediated software.

Sources:

- [llm.c](https://github.com/karpathy/llm.c)
- [“I love calculator,” 2024-09-08](https://karpathy.ai/blog/calculator.html)

### 2024-07-16-May 2026 — Eureka Labs and AI-native education

**Work/biography (high for launch date; uncertain for formal end date).**
Karpathy announced Eureka Labs on 2024-07-16 as an AI-native school: human
teachers would design course materials, while AI teaching assistants would
support and scale them. TIME's 2024 profile confirms a July 2024 founding and
describes the first intended product as an undergraduate-level AI course.

His public work during this period includes educational videos, repositories,
talks, and `nanochat`, a full-stack, single-node ChatGPT implementation. On
2026-02-12 he published `microgpt`, a 200-line, dependency-free implementation
that includes tokenizer, autograd, model, optimizer, training, and inference.

**Documented intellectual update.**

- Education becomes a system-design problem: preserve human authorship and
  judgment in the course while using AI for individual support and scale.
- `nanochat` expands “from scratch” from a model implementation to the entire
  chat-model pipeline; `microgpt` then compresses the essential algorithmic
  core. These are complementary moves: expose the whole production stack, then
  isolate the irreducible mechanism.
- The `microgpt` conclusion—“Everything else is just efficiency”—marks the
  strongest version of his simplification program. It is a claim about the
  conceptual GPT core, not a claim that production engineering is unimportant.

Sources:

- [Bloomberg Law on the 2024-07-16 announcement](https://news.bloomberglaw.com/artificial-intelligence/former-openai-researcher-to-launch-ai-education-company)
- [TIME profile, 2024-09-05](https://time.com/7012851/andrej-karpathy/)
- [nanochat](https://github.com/karpathy/nanochat)
- [“microgpt,” 2026-02-12](https://karpathy.github.io/2026/02/12/microgpt/)
- [Karpathy's homepage education section](https://karpathy.ai/)

The end boundary is intentionally **not** stated as “Eureka Labs closed.”
Public evidence reviewed here does not establish a dissolution, acquisition,
or transfer. May 2026 establishes a new operating role and a planned pause in
education work, not the legal status of the company.

### 2025-early 2026 — software becomes conversational, but autonomy remains uneven

**Work/biography.** During the Eureka/public-building period, Karpathy's 2025
talks and projects concentrated on LLM application layers, coding agents, and
small reproducible training stacks.

**Documented intellectual update (medium-to-high).** The emphasis progresses
from Software 2.0's learned weights to a new programmable surface: natural
language, tool-using LLMs, and partially autonomous agents. At the same time,
his public discussion repeatedly distinguishes demos from reliable long-horizon
agents. Human oversight, task decomposition, evaluation, and verification
remain necessary because agent competence is jagged. This is an extension—not a
reversal—of the old “leaky abstraction” and disciplined debugging views.

Primary anchors:

- [Karpathy's homepage list of 2025 talks](https://karpathy.ai/)
- [nanochat](https://github.com/karpathy/nanochat)
- [“microgpt,” 2026-02-12](https://karpathy.github.io/2026/02/12/microgpt/)

Date caveat: this entry summarizes a cluster of talks and builds rather than a
single conversion event. Terms such as “Software 3.0” or “vibe coding” should
not be used to imply that he endorsed unsupervised production deployment.

### 2026-05-19-present — Anthropic pre-training R&D

**Work/biography (high for the join; high for reported role).** On 2026-05-19,
Karpathy announced: “I've joined Anthropic.” He said the next few years at the
frontier of LLMs would be especially formative and that he was excited to
return to R&D. TechCrunch reported that he started that week on Anthropic's
pre-training organization under Nick Joseph. An Anthropic spokesperson said he
would start a team focused on using Claude to accelerate pre-training research.
Axios independently reported the same start week and pre-training role.

**Documented intellectual update (high).** The move is an explicit shift in
time allocation back toward frontier LLM R&D, specifically pre-training and
AI-assisted research. It does not erase his education thesis: in the same
announcement he said he remained deeply passionate about education and planned
to resume that work “in time.” The warranted reading is **R&D now, education
later**, not “education abandoned.”

Sources:

- [TechCrunch, 2026-05-19, quoting Karpathy and an Anthropic spokesperson](https://techcrunch.com/2026/05/19/openai-co-founder-andrej-karpathy-joins-anthropics-pre-training-team/)
- [Axios, 2026-05-19](https://www.axios.com/2026/05/19/anthropic-openai-karpathy-andrej-claude)
- [TechRadar, 2026-05-22, quoting pre-training lead Nick Joseph](https://www.techradar.com/pro/a-founding-member-of-openai-has-joined-anthropic-to-boost-claudes-research-capabilities)

### 2026-08-01 — long-horizon generation makes hyper-custom worlds economical

**Documented intellectual update (high for the supplied text; original-link
verification pending).** In a newly published X post, Karpathy described giving
Opus 5 the opening paragraph of *The Lord of the Rings*, a one-million-token
budget of roughly $10, and a request to render it in Three.js. He reported that
the model worked for roughly two hours and produced about 5,500 lines of code
for a procedural, animated story world.

The post makes two linked claims. First, model stamina changes the economics of
bespoke software: work that no person would rationally spend the time to create
can move from “no one would ever do this” to “sure, why not,” enabling ephemeral
interactive worlds tailored to a story or player. Second, games and worlds
expose a current capability boundary: an LLM cannot efficiently audit an
interactive artifact when it cannot natively perceive video or play the game.
Slow screenshot inspection left visible defects in the result.

This is a capability update, not evidence that generated worlds are already
production-quality. It extends the verifiability boundary from objectively
scored code into multimodal, temporal, and interactive evaluation: generation
may be nearly free while trustworthy auditing remains expensive.

Source: [user-supplied first-party transcript and provenance note](07-recent-posts.md).
The original X URL was not supplied and was not yet discoverable through search
on 2026-08-01; add it when available.

## Current-status resolution as of 2026-08-01

The apparently conflicting public records have different timestamps and answer
different questions:

| Evidence | Source date / state | What it supports | What it does not support |
|---|---|---|---|
| Karpathy homepage | Mutable; checked 2026-07-29. Its current top phase is still labeled **“2024 -”** and foregrounds AI education videos. A crawlable alternate page also says “founder at Eureka Labs.” | His self-presented educator/founder identity and ongoing public archive. | It is not a dated denial of the later Anthropic move. The open-ended 2024 label is visibly stale as an employment timeline. |
| Karpathy announcement quoted by TechCrunch | **2026-05-19** | “I've joined Anthropic”; a return to R&D; education intended to resume later. | It does not say Eureka Labs was dissolved or that he ceased to be its founder. |
| Anthropic spokesperson quoted by TechCrunch | **2026-05-19** | Start that week in pre-training; he would build a team using Claude to accelerate pre-training research. | It does not establish the corporate status of Eureka Labs. |
| Axios independent report | **2026-05-19** | Corroborates Anthropic, start week, and pre-training. | It does not resolve Eureka Labs' legal status. |
| Nick Joseph welcome reported by TechRadar | **2026-05-22** | Corroborates the pre-training team and its AI-assisted-research mandate. | It is not a general Anthropic staff directory. |

**Resolved current statement:** As of the 2026-08-01 research cutoff, the most
recent dated evidence places Andrej Karpathy at **Anthropic**, working in
pre-training R&D and expected to form a team using Claude to accelerate that
research. He is also the **founder of Eureka Labs** in the historical and
possibly continuing corporate sense, but public evidence reviewed here does not
establish whether Eureka Labs is active, paused, dormant, or formally wound
down. His own May announcement most directly supports that his education work
is paused or deprioritized while he returns to R&D.

This resolution uses source dates, not a guess that one identity must cancel the
other. A mutable homepage last structured around “2024 -” is weaker current-role
evidence than a first-person announcement and institutional confirmation dated
2026-05-19.

## Belief trajectory in one view

| Period | Dominant documented question | Durable update |
|---|---|---|
| 2011-2012 | Are benchmark gains being mistaken for intelligence? | Measure human baselines and inspect qualitative failure; AI remained far away. |
| 2013-2016 | What do learned representations actually capture? | Deep nets showed real narrow power; understand their internals by building and visualizing them. |
| 2015-2017 | Can learning systems generalize across modalities and tasks? | Generative models, RL, and agents broadened the target beyond classification. |
| 2017-2022 | How do neural nets become dependable deployed systems? | Treat data, training, evaluation, deployment, and telemetry as one data engine; debug incrementally. |
| 2022-2024 | How can LLMs be understood and controlled as a stack? | Reconstruct the stack from scalar autograd through GPT; post-training and tools turn models into a computing substrate. |
| 2024-2026 | How should AI augment learning and software creation? | Pair human judgment with AI assistance; prefer inspectable minimal cores while acknowledging jagged agent reliability. |
| From 2026-05-19 | Can AI accelerate frontier AI research itself? | Return to pre-training R&D and build an AI-assisted research team, while explicitly deferring—not disowning—education. |
| 2026-08 | What becomes worth making when generation is patient and cheap? | Hyper-custom interactive artifacts become newly economical, but native video and gameplay evaluation constrain quality. |

## Uncertainties that must survive persona synthesis

1. **Do not state that Eureka Labs ended in May 2026.** No reviewed source
   establishes that.
2. **Do not treat the homepage's open-ended “2024 -” phase as current employment
   evidence.** It is useful first-party biography but is stale relative to the
   dated Anthropic announcement.
3. **Do not imply that every OpenAI institutional belief was Karpathy's personal
   belief.** The founding announcement is a co-authored organizational source.
4. **Do not convert a sequence into inevitability.** The continuity from physics
   to “from scratch” teaching, or from simulated control to Tesla, is a useful
   synthesis but not proof of a long-planned path.
5. **Do not equate minimal explanatory code with production minimalism.** His
   Tesla and training-recipe record strongly values infrastructure, telemetry,
   verification, and operational detail.
6. **Do not equate enthusiasm for coding agents with trust in full autonomy.**
   His record consistently foregrounds failure modes, evaluation, and human
   understanding of leaky abstractions.
