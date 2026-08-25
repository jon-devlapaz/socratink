# Andrej Karpathy — decision and action record

Research date: 2026-07-29  
Coverage: education and research pivots, employer moves, education venture,
open-source project choices, and the reported 2026 Anthropic move  
Confidence: high for actions; variable for motives

## Evidence rules

This is a dated action record, not a motivational biography.

- **Action** means a publicly observable choice or completed move.
- **Stated reason** means Karpathy supplied the reason in a first-party source.
- **Reported context** means an official organization or reputable publication
  supplied context that Karpathy did not personally state.
- **Inference** means a pattern extracted across actions. It is never presented
  as a private motive.
- Silence is not evidence. Where he did not explain why he joined or left an
  organization, this report says so.

The report prioritizes Karpathy's own website, projects, and dated X posts.
Exact X text and UTC publication times were recovered from the public Open
Graph metadata on each first-party status URL. Reputable reporting is used for
job scope or statements that were truncated/inaccessible at the primary
surface.

## Chronological record

| Date | Action | What is established | Motive status |
|---|---|---|---|
| 2005-2009 | Completed a University of Toronto BSc with a double major in computer science and physics and a math minor | His site says this is where he first entered deep learning through Geoff Hinton's class and reading groups | **No stated reason** for the original degree combination |
| 2009-2011 | Completed a UBC MSc on learned controllers for physically simulated figures | A move from broad CS/physics study into machine learning for simulated robotics | **No stated reason** for choosing UBC or this project |
| 2011-2015 | Pursued a Stanford CS PhD across deep learning, vision, language, and their intersection | Rotations and internships at Google Brain/Research and DeepMind broadened scale, supervision, video, and reinforcement-learning exposure | **No single stated selection rule** for the whole sequence |
| 2015 | Designed and became primary instructor for Stanford CS231n | He later wrote that he invested more than was rational for a PhD student because inefficient learning was holding the field back | **Stated reason available** |
| 2015-12-11 | Became a founding research member of OpenAI | OpenAI's launch announcement names him among the founding scientists and engineers | OpenAI stated its nonprofit mission; **do not attribute the whole institutional rationale to him personally** |
| 2017-06 | Left OpenAI and joined Tesla as Director of AI and Autopilot Vision | Tesla role converted his vision/deep-learning background into an at-scale deployed driving system | **No first-party reason found** for selecting Tesla |
| 2022-07-13 | Announced departure from Tesla after five years | He called it a difficult decision, credited the team, and noted Autopilot's expansion from lane keeping to city streets | He did **not** disclose the cause of departure |
| 2022-07-13 onward | Returned attention to technical AI, open source, and education | In a follow-up statement, he said he had no concrete next plan but wanted more time for those long-term passions | **Stated direction**, not a detailed motive for leaving |
| 2022-12-28 | Created `nanoGPT` | Released a small, readable GPT training implementation; later deprecated it when `nanochat` became the better destination | Project rationale is explicit in the README |
| 2023-02-09 | Rejoined OpenAI | Said he was inspired by the impact and future potential and wanted to build again | **Stated reason available**, but broad |
| 2023-2024 | Built a new OpenAI team working on midtraining and synthetic data generation | First-party role summary on his site | No public decision memo found |
| 2024-02-13/14 | Left OpenAI again | Denied a triggering event, issue, or drama; said his immediate plan was personal projects | **Stated negative reason and next direction**; no more specific cause |
| 2024-04-08 | Created `llm.c` | Chose simple raw C/CUDA, an auditable CPU reference, a parallel PyTorch reference, and a narrow repository boundary | Project criteria are explicit |
| 2024-07-16 | Founded/announced Eureka Labs | Chose an AI-native school model in which teachers design materials and AI teaching assistants scale guidance | **Stated rationale available** |
| 2025-10-13 | Created/announced `nanochat` | Expanded from pretraining-only code to a minimal end-to-end ChatGPT training stack with a cost target and measurable leaderboard | Project criteria are explicit |
| 2025-11 | Deprecated `nanoGPT` in favor of `nanochat` | Preserved the old repository for posterity while routing new users to its successor | Clear action showing willingness to replace his own artifact |
| 2026-02-12 | Published `microgpt` | Reduced the algorithmic content of training and inference to a dependency-free, approximately 200-line Python file | Called it the culmination of a decade of simplification |
| 2026-03 | Released `autoresearch` | Put an AI agent in a five-minute modify/train/evaluate/keep-or-discard research loop on a small real training setup | Explicit experiment design; broader predictions are not established facts |
| 2026-05-19 | Announced that he had joined Anthropic | Said frontier LLM years would be formative and that he wanted to return to R&D; said education remained important and would resume in time | **Stated reason available** |
| 2026-05 | Joined Anthropic's pretraining group; reportedly tasked with building a team using Claude to accelerate pretraining research | Axios and Reuters attributed the pretraining scope to Anthropic; this connects directly to his recent automated-research work | Role detail is **officially attributed reporting**, not text from his own post |
| 2026-07-26 | Responded to rumors caused by removing an Anthropic reference from his X bio | His current X profile says only that he likes training large deep neural nets; his reply mocked the idea that a bio edit was a resignation announcement | No departure announcement found; see unresolved status below |

## Decision case files

### 1. Broad foundations to deep learning (2005-2011)

#### Action

Karpathy combined computer science, physics, and math at the University of
Toronto, encountered deep learning in Hinton's class and reading groups, then
did a UBC master's applying learning to physically simulated locomotion.

#### Direct evidence

His current personal page supplies the degree dates, subjects, first exposure to
deep learning, and master's research topic.

#### Supported criterion

**Inference, medium confidence:** he repeatedly selects problems where a
computational learning system can be grounded in a concrete domain. Physics
later appears in his explanations as a source of modeling intuitions, but the
record does not prove that this criterion caused his degree choices.

#### Do not infer

- that he planned an AI career from the start;
- that physics was chosen solely to improve machine-learning intuition;
- that any one professor caused the graduate-school move.

### 2. Research breadth plus a costly teaching investment (2011-2015)

#### Action

At Stanford, he worked across computer vision, natural language, and deep
learning; used rotations and internships to sample different research
environments; and designed CS231n.

#### First-party reason for teaching

In *A Survival Guide to a PhD* he says teaching CS231n consumed more effort than
was rational for a research student, but he believed the field was held back
when people could not efficiently learn the topic and enter it.

#### Supported criteria

- Spend beyond the narrow local incentive when doing so removes a field-level
  learning bottleneck.
- Teach emerging technical material by making entry more efficient.
- Use multiple research environments to acquire breadth. This final point is an
  inference from the rotations and internships; he does not publish a personal
  decision rule for them.

#### Outcome evidence

His site reports CS231n growing from 150 students in 2015 to 330 in 2016 and 750
in 2017. Growth does not by itself prove learning quality, but it does show that
the course addressed substantial demand.

### 3. Founding OpenAI, then moving to Tesla deployment (2015-2017)

#### Actions

- OpenAI's 11 December 2015 launch post names Karpathy as a founding research
  engineer/scientist.
- In June 2017 he joined Tesla as Director of AI and Autopilot Vision.
- His role eventually covered in-house labeling, neural-network training, and
  deployment on Tesla's inference hardware.

#### Reported context

TechCrunch's 20 June 2017 hiring report says the Tesla role led Autopilot
vision and reported to Elon Musk. Karpathy's own site confirms the work scope.

#### Motive boundary

No first-party statement found in this lane explains why he left OpenAI for
Tesla. The attractive story—moving from research into high-scale real-world
deployment—is consistent with the action but remains **inference**, not stated
motive.

#### Supported action pattern

The Tesla role is strong behavioral evidence that he was willing to own the
entire system around a model: data labeling, training, evaluation, hardware
deployment, telemetry, and a production fleet. That later matches his public
"data engine" framing, but it does not explain the private employment decision.

### 4. Leaving Tesla without supplying a causal story (2022)

#### Action

Karpathy's first-party X post at 2022-07-13 21:29:03 UTC announces the
departure after five years and calls it difficult. A follow-up, preserved by
contemporaneous reporting, says he had no concrete next plan and wanted to
revisit technical AI work, open source, and education.

#### What he did not say

He did not publicly identify:

- conflict with Tesla leadership;
- technical disagreement about Autopilot;
- dissatisfaction with Full Self-Driving progress;
- a competing job offer;
- the preceding sabbatical as the cause.

Contemporaneous speculation on those topics must not enter the generated
advisor as fact.

#### Supported criteria

- Credit the team and continuity rather than frame departure as personal rescue.
- Leave future space uncommitted when the next project is not yet selected.
- Return attention to durable interests rather than immediately announce
  another executive role.

Only the last two are directly supported by his follow-up statement. Their
relative importance is unknown.

### 5. Independent education and open-source period (2022-2023)

#### Actions

After Tesla, Karpathy released and expanded Zero to Hero and created `nanoGPT`.
The course teaches neural networks from basics through GPT by building from
scratch in code. `nanoGPT` concentrated medium-sized GPT training into two
plain, readable files.

#### Supported project criteria

- smallest complete implementation over framework breadth;
- executable learning over exposition alone;
- high leverage through public, forkable artifacts;
- start with a system small enough for one learner to understand end to end.

These criteria come from the artifacts themselves and their READMEs. The record
does not establish whether independence was required to produce them.

### 6. Returning to OpenAI (2023)

#### Action and stated reason

At 2023-02-09 00:19:32 UTC, Karpathy announced that he was joining OpenAI
again. He cited the organization's impact, his own benefit from its work, its
future potential, and the pleasure of returning to build.

His personal page now says he created a team focused on midtraining and
synthetic data generation.

#### Supported criteria

- Join when a platform's demonstrated impact and future technical potential are
  both compelling.
- Prefer active building to outside commentary.

The second criterion is a modest inference from his wording, not a general
career law.

#### Boundary

The statement does not identify compensation, title, manager, model target,
organizational politics, or a comparison against alternative employers.

### 7. Leaving OpenAI for personal projects (2024)

#### Action and stated boundary

Karpathy said on 14 February 2024 that he had left the prior day. He explicitly
denied that the move resulted from a particular event, issue, or drama and
described the team and roadmap positively.

He said the immediate plan was to work on personal projects and see what
happened. OpenAI separately told TechCrunch that he was departing to pursue
personal projects and that responsibilities had transferred.

#### Supported criteria

- Create an independent exploration interval without pretending the destination
  is already known.
- Correct a dramatic external narrative when it is unsupported.

#### Unresolved

"Personal projects" is a direction, not a complete cause. The public record
does not reveal what tradeoff made independence preferable at that moment.

### 8. Choosing a narrow, inspectable owner in `llm.c` (2024)

#### Action

Karpathy created `llm.c` on 8 April 2024. Its README establishes these choices:

- raw C/CUDA instead of a large Python framework;
- a simple approximately 1,000-line CPU reference implementation;
- a parallel PyTorch reference for checking behavior;
- a repository boundary limited to C and CUDA, with other-language ports kept
  in separate repositories;
- reproduction of known GPT models rather than a new opaque benchmark.

#### Supported criteria

- Strip dependency weight when it obscures a core algorithm.
- Keep a slow/clear reference beside a fast implementation.
- Localize scope so one repository has a coherent maintenance contract.
- Reproduce a known target before claiming novelty.

These are project design decisions, not necessarily criteria for employer or
life decisions.

### 9. Founding Eureka Labs (2024)

#### Action

On 16 July 2024 Karpathy announced Eureka Labs, an AI-and-education company. Its
official announcement defines an AI-native school in which:

- a human teacher designs high-quality course material;
- an AI teaching assistant supplies patient, multilingual guidance;
- the combination expands educational reach and extent;
- the first product, LLM101n, would teach learners to train a small version of
  the assistant itself;
- material would be online, with digital and physical cohorts planned.

#### Stated rationale

The company was described as the convergence of roughly two decades of
interest in AI and education. The bottleneck was scarcity of excellent
one-to-one subject guidance; generative AI made scaled guidance feel tractable.

#### Supported criteria

- Combine two durable interests when a new technical capability changes what
  is feasible.
- Keep expert-authored curriculum as the owner; use AI to scale guidance rather
  than replace subject ownership.
- Make the first course recursively demonstrate the platform's own technical
  substrate.
- Build publicly. Contemporaneous reporting quotes him saying he announced
  early so the work did not remain secret.

#### Evidence gaps and current state

- The announcement is a product thesis, not evidence that learning outcomes
  improved.
- The official site still shows only the July 2024 announcement.
- As of 2026-07-29, the linked EurekaLabsAI GitHub organization displays no
  public repositories.
- His May 2026 Anthropic announcement says he plans to resume education "in
  time", implying a pause or deprioritization, but it does not formally close
  Eureka Labs.

Treat Eureka as an announced and partially pursued direction whose delivered
school/product status is not proven in this lane.

### 10. Replacing `nanoGPT` with the more complete `nanochat` (2025)

#### Action

Karpathy created `nanochat` on 13 October 2025 and, in November, put a prominent
deprecation notice on `nanoGPT` directing users to it.

`nanochat` broadens the earlier pretraining implementation into one end-to-end
stack: tokenization, pretraining, finetuning, evaluation, inference, and a chat
UI. It uses a concrete cost target, a time-to-GPT-2 metric, and a leaderboard.

#### Supported criteria

- Replace your own successful artifact when a successor better covers the real
  workflow.
- Preserve the old artifact for history while changing the recommended path.
- Optimize both monetary accessibility and cognitive accessibility.
- Prefer a cohesive baseline and one complexity dial over an exhaustive
  framework with large configuration surfaces.
- Make progress legible through a fixed metric and reproducible run.

#### Constraint evidence

The README explicitly rejects becoming an exhaustively configurable framework.
It also requires disclosure of substantial model-generated pull-request code
that the contributor does not fully understand. This shows that using AI is not
treated as permission to obscure ownership.

### 11. `microgpt`: decade-long simplification as a terminal artifact (2026)

#### Action

On 12 February 2026 Karpathy published `microgpt`, a single dependency-free
Python file of approximately 200 lines containing the full algorithmic path
from data and tokenization through autograd, GPT architecture, optimization,
training, and inference.

#### Stated rationale

He calls it the culmination of multiple projects and a decade-long effort to
simplify language models to their essentials.

#### Supported criteria

- Keep simplifying until removing more would lose essential algorithmic
  content.
- Treat aesthetic coherence as a signal only after completeness is preserved.
- Use a working artifact, not a verbal summary, as the boundary of the claim.

### 12. `autoresearch`: turn the research loop into the programmable object (2026)

#### Action

In March 2026 Karpathy released `autoresearch`. It gives an agent a small but
real single-GPU language-model training setup. The agent modifies code, trains
for five minutes, evaluates the result, keeps or discards the change, and
repeats overnight.

The human-facing programmable surface moves from Python to `program.md`, which
specifies context and the research organization.

#### Supported criteria

- Bound experiments to a cheap, fixed interval.
- Use a real metric and retain only measured improvements.
- Keep the mutable surface narrow and the evaluation surface fixed.
- Automate iteration after the experiment contract becomes inspectable.

#### Boundary

The README's futuristic framing is humorous speculation. It does not establish
that autonomous swarms have replaced researchers or that an unattended result
is trustworthy without review.

### 13. Joining Anthropic to return to frontier R&D (2026)

#### Confirmed action

At 2026-05-19 15:05:42 UTC, Karpathy posted:

- he had joined Anthropic;
- the next few years at the LLM frontier would be especially formative;
- he was excited to return to R&D;
- education remained a deep interest that he planned to resume later.

Axios and Reuters reported that he started that week in Anthropic's pretraining
organization. Axios, attributing the detail to Anthropic, said he would help
launch a team using Claude to accelerate pretraining research.

#### Supported criteria

- Prioritize direct participation when a technical frontier enters a formative
  period.
- Temporarily sequence durable interests rather than claim to pursue all of
  them simultaneously.
- Work on tools that accelerate the research loop itself.

The first two are close paraphrases of his announcement. The third joins his
`autoresearch` action to the role Anthropic described; it is **inference**, not
a published personal selection memo.

#### Do not infer

The evidence does not establish that he chose Anthropic because of:

- its safety policies;
- disagreement with OpenAI;
- compensation or compute access;
- a preference for closed versus open models;
- political positions;
- failure of Eureka Labs.

Those explanations circulated publicly but are unsupported here.

#### July 2026 status clarification

Around 26 July, a generic edit to his X biography produced claims that he had
left Anthropic. Current first-party facts are:

1. the May joining post remains accessible;
2. his current X profile description is generic and does not name Anthropic;
3. on 26 July he replied sarcastically to a claim that a bio edit constituted
   an announcement, referring to a supposed long essay shared with the team;
4. no first-party departure announcement was found;
5. no Anthropic staff page or press release was found that independently
   settles current employment.

Reputable current secondary coverage characterizes the departure claim as a
false rumor. The safest durable state is therefore:

> **Joined Anthropic in May 2026; no substantiated departure as of
> 2026-07-29. Exact current internal status is not independently proven by an
> official staff directory.**

Do not convert the bio change into a new career decision.

## Cross-case decision criteria

The following are evidence-backed action patterns, ranked by confidence.

### High confidence

1. **Make the full loop inspectable.**  
   CS231n, Zero to Hero, `nanoGPT`, `llm.c`, `nanochat`, `microgpt`, and
   `autoresearch` repeatedly expose the end-to-end system rather than one
   isolated abstraction.

2. **Reduce both cost and cognitive complexity.**  
   Small codebases, dependency reduction, single-node targets, explicit cost
   budgets, and progressive from-scratch instruction recur across independent
   projects.

3. **Use fixed measurements to drive iteration.**  
   Reproduction targets, validation loss, time-to-GPT-2, and
   keep-or-discard experiment loops turn improvement into an observable
   decision.

4. **Treat education as technical leverage, not only communication.**  
   CS231n, public courses, Eureka, and his post-employment statements show a
   durable willingness to invest in lowering the field's learning bottleneck.

5. **Replace and deprecate your own artifacts when a clearer owner exists.**  
   The Hacker's Guide points to better materials; `nanoGPT` routes to
   `nanochat`; early project versions remain available without remaining the
   recommended path.

### Medium confidence

6. **Alternate between frontier institutions and independent artifact work.**  
   The career record demonstrates the alternation. It does not establish a
   deliberate cycle or its private triggers.

7. **Prefer decisions that join research with deployment or teaching.**  
   Tesla joined models to a production fleet; OpenAI roles joined research to
   deployed systems; Eureka joined AI and education; Anthropic reportedly joins
   AI agents to pretraining research. This is a strong pattern but still an
   inference across distinct contexts.

8. **Sequence interests when focus is required.**  
   His Anthropic announcement explicitly delays education while returning to
   R&D. Other periods are consistent with sequencing, but no universal rule is
   stated.

### Low confidence / do not operationalize as fact

- He leaves institutions whenever bureaucracy grows.
- He always prefers open source to organizational research.
- He chooses employers based primarily on ideology.
- He avoids management.
- He optimizes career moves for money, status, safety, or compute.

The public record in this lane cannot adjudicate those claims.

## Tensions and unresolved conflicts

### Open access versus frontier-lab employment

Karpathy repeatedly publishes minimal, permissively licensed implementations,
yet repeatedly works inside frontier labs whose models and training systems are
not fully open. This is a real behavioral tension. There is no first-party
statement resolving it into a single policy.

### Education versus frontier R&D

Education is described as a decades-long passion and became a company in 2024.
In 2026 he explicitly deferred it to return to frontier research. The record
supports priority changes over time, not abandonment of either value.

### Simplicity versus production scale

His public artifacts optimize for cognitive accessibility, while Tesla,
OpenAI, and Anthropic work involves large production or frontier systems. The
likely bridge is simple reference models plus scalable data/experiment engines,
but that bridge is an inference.

### Independent work versus team building

Many public artifacts are personally legible and tightly owned. His employer
record includes creating or leading teams at Tesla, OpenAI, and reportedly
Anthropic. A generated advisor should not mistake "minimal code" for "solo
work only."

### Employer departure motives

The 2017 OpenAI-to-Tesla move and the 2022 Tesla departure lack specific public
causal accounts. The 2024 OpenAI departure includes a denial of drama and a
personal-project direction, but still no full tradeoff. Preserve that
uncertainty.

## Advisor-use guardrails

When applying this record to a new decision:

1. Separate the user's observable action from the story they tell about motive.
2. Ask whether the full feedback loop can be made smaller and inspectable.
3. Choose a fixed metric or falsifiable target before automating iteration.
4. Prefer a smallest complete artifact over a broad framework.
5. Identify which durable interest is being sequenced now, and what is merely
   deferred.
6. Do not advise a job departure by analogy alone. Karpathy's own departure
   causes are mostly undisclosed.
7. Label every novel recommendation as an inference from patterns, not as what
   Karpathy "would do."

## Sources

### First-party and official

1. Andrej Karpathy, **personal site / career timeline**, current page, accessed
   2026-07-29.  
   https://karpathy.ai/
2. OpenAI, **"Introducing OpenAI"**, 2015-12-11. Names Karpathy among founding
   research engineers/scientists.  
   https://openai.com/index/introducing-openai/
3. Andrej Karpathy, **"A Survival Guide to a PhD"**, 2016-09-07.  
   https://karpathy.github.io/2016/09/07/phd/
4. Andrej Karpathy, **Tesla departure post**, 2022-07-13 21:29:03 UTC.  
   https://x.com/karpathy/status/1547332300186066944
5. Andrej Karpathy, **OpenAI return post**, 2023-02-09 00:19:32 UTC.  
   https://x.com/karpathy/status/1623476659369443328
6. Andrej Karpathy, **OpenAI departure post**, 2024-02-14 02:58:07 UTC.  
   https://x.com/karpathy/status/1757600075281547344
7. Andrej Karpathy, **Eureka Labs announcement post**, 2024-07-16 17:25:37 UTC.  
   https://x.com/karpathy/status/1813263734707790301
8. Eureka Labs, **"Introducing Eureka Labs"**, 2024-07-16.  
   https://eurekalabs.ai/
9. EurekaLabsAI, **GitHub organization**, accessed 2026-07-29; currently shows
   no public repositories.  
   https://github.com/EurekaLabsAI
10. Andrej Karpathy, **Zero to Hero**, current course page.  
    https://karpathy.ai/zero-to-hero.html
11. Andrej Karpathy, **`micrograd`**, repository created 2020-04-13, MIT.  
    https://github.com/karpathy/micrograd
12. Andrej Karpathy, **`nanoGPT`**, repository created 2022-12-28, MIT.  
    https://github.com/karpathy/nanoGPT
13. Andrej Karpathy, **`llm.c`**, repository created 2024-04-08, MIT.  
    https://github.com/karpathy/llm.c
14. Andrej Karpathy, **`nanochat`**, repository/announcement created
    2025-10-13, MIT.  
    https://github.com/karpathy/nanochat  
    https://github.com/karpathy/nanochat/discussions/1
15. Andrej Karpathy, **"microgpt"**, 2026-02-12.  
    https://karpathy.github.io/2026/02/12/microgpt/
16. Andrej Karpathy, **`autoresearch`**, March 2026, MIT.  
    https://github.com/karpathy/autoresearch
17. Andrej Karpathy, **Anthropic joining post**, 2026-05-19 15:05:42 UTC.  
    https://x.com/karpathy/status/2056753169888334312
18. Andrej Karpathy, **reply to bio-change rumor**, 2026-07-26 01:51:27 UTC.  
    https://x.com/karpathy/status/2081195664479068350
19. Andrej Karpathy, **current X profile**, accessed 2026-07-29.  
    https://x.com/karpathy

### Reputable secondary or officially attributed reporting

20. Darrell Etherington, TechCrunch, **"Tesla hires deep learning expert Andrej
    Karpathy to lead Autopilot vision"**, 2017-06-20. Used for contemporaneous
    role scope; motive remains unknown.  
    https://techcrunch.com/2017/06/20/tesla-hires-deep-learning-expert-andrej-karpathy-to-lead-autopilot-vision/
21. Reuters with additional editing, **"Electric Car Firm Tesla Loses Key AI
    Executive"**, 2022-07-14. Used for the follow-up statement and contemporary
    context; speculation excluded.  
    https://www.asiafinancial.com/key-tesla-ai-executive-leaves-electric-car-firm-without-stating-reason
22. Ivan Mehta, TechCrunch, **"Andrej Karpathy is leaving OpenAI again — but he
    says there was no drama"**, 2024-02-13. Used for the full departure post and
    OpenAI's attributed statement.  
    https://techcrunch.com/2024/02/13/andrej-karpathy-is-leaving-openai-again-but-he-says-there-was-no-drama/
23. Andrew R. Chow, TIME, **"Andrej Karpathy"**, 2024-09-05. Used for
    first-person explanation of his education focus and simplification drive.  
    https://time.com/7012851/andrej-karpathy/
24. Madison Mills, Axios, **"OpenAI co-founder Andrej Karpathy joins
    Anthropic"**, 2026-05-19. Used for role details explicitly attributed to
    Anthropic.  
    https://www.axios.com/2026/05/19/anthropic-openai-karpathy-andrej-claude
25. Zaheer Kachwala, Reuters via UOL, **"Karpathy ... joins Anthropic"**,
    2026-05-19. Used as independent confirmation of start week and pretraining
    group.  
    https://economia.uol.com.br/noticias/reuters/2026/05/19/karpathy-cofundador-da-openai-e-ex-executivo-de-ia-da-tesla-junta-se-a-anthropic.amp.htm

## Source accounting

- First-party/official sources: 19
- Reputable secondary reports: 6
- Total source entries: 25
- First-party/official share by source entry: **76%**
- Career actions with a first-party or official anchor: **all major actions in
  the timeline**

The secondary reports supply contemporaneous role detail or recover longer text;
they do not supply private motives.

## Bottom line

The strongest evidence-based decision pattern is not "copy Karpathy's career."
It is:

> **Choose a consequential technical loop, make the whole loop visible, reduce
> its cost and cognitive surface, measure improvement, teach what you uncover,
> and replace your own artifact when a clearer one becomes possible.**

Career-move causes remain too private and underdocumented to turn into
prescriptive job-switching heuristics.
