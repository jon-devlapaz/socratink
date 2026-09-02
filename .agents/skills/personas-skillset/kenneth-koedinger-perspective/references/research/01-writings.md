# Kenneth R. Koedinger — writings and research record

**Research date:** 2026-08-31. **Scope:** authored/co-authored scholarly work, CMU/LearnLab materials, and public reports; not a complete bibliography. Koedinger appears principally to be a research-paper, systems, and research-infrastructure author rather than a popular-book author. LearnLab’s current biography says he has authored 250+ peer-reviewed publications: [bio](https://learnlab.org/ken-koedinger/).

## Evidence labels

- **Primary:** a paper/report written or co-written by Koedinger, or an official CMU/LearnLab page.
- **External:** a source describing the work rather than authored by him.
- **Inference:** an application to Socratink’s lead learning-scientist role, not a statement by Koedinger.

## High-signal writing corpus

| Date | Work | Evidence and durable contribution | Source type |
|---|---|---|---|
| 1995 | Anderson, Corbett, Koedinger & Pelletier, *Cognitive Tutors: Lessons Learned*, *JLS* 4, 167–207 | Foundational Cognitive Tutor account: a cognitive model of target problem-solving drives step-level feedback, hints, and individualized task selection. Referenced in the [2002 paper](https://doi.org/10.1207/s15516709cog2602_1). | Primary/co-authored |
| 2002 | Aleven & Koedinger, [*An effective metacognitive strategy: learning by doing and explaining with a computer-based Cognitive Tutor*](https://doi.org/10.1207/s15516709cog2602_1), *Cognitive Science* 26, 147–179 | Two classroom experiments: supported self-explanation during Geometry Cognitive Tutor problem-solving produced better explanations and transfer than the no-explanation version. It explicitly warns that a tutor can yield shallow heuristic learning without this support. | Primary/co-authored |
| 2004 | Koedinger & Mathan, [*Distinctive Characteristics of an Intelligent Tutor: A Model of Human Learning*](https://pact.cs.cmu.edu/pubs/Koedinger%20%26%20Mathan%2004.pdf) | Model-tracing logs and learning curves locate knowledge components where students do not improve as expected; tutor improvement is a data/model-revision loop, not just UI refinement. | Primary/co-authored |
| 2006 | Koedinger & Corbett, [*Cognitive Tutors: Technology Bringing Learning Sciences to the Classroom*](https://files.eric.ed.gov/fulltext/ED538834.pdf), *Cambridge Handbook of the Learning Sciences* | Synthesis of model tracing, immediate contextual feedback/hints, and knowledge-tracing/mastery-based task selection. It retains teachers as necessary for integration, rather than proposing technology as a teacher replacement. | Primary/co-authored |
| 2010 | Koedinger et al., [*A Data Repository for the EDM Community: The PSLC DataShop*](https://pact.cs.cmu.edu/pubs/Koedinger%2C%20Baker%2C%20Cunningham%2C%20Skogsholm%2C%20Leber%2C%20Stamper%202010.pdf), *Handbook of Educational Data Mining* | Makes fine-grained learner actions and tutor responses reusable research objects, with tools for exploratory analysis and EDM. Instrumentation and research infrastructure are part of the science. | Primary/co-authored |
| 2010 | Koedinger & McLaughlin, [*Seeing Language Learning inside the Math: Cognitive Analysis Yields Transfer*](https://pact.cs.cmu.edu/koedinger/pubs/Koedinger%20%26%20McLauglin%202010.pdf) | Cognitive task analysis identified algebra-expression grammar as a hidden transferable component. The resulting prediction: visually dissimilar substitution practice could improve story-problem symbolization. The authors call this a compelling demonstration, **not** a conclusive account of transfer. | Primary/co-authored |
| 2012 | Koedinger, Corbett & Perfetti, [*The Knowledge–Learning–Instruction (KLI) Framework*](https://doi.org/10.1111/j.1551-6709.2012.01245.x), *Cognitive Science* 36, 757–798 | Central theoretical synthesis. It relates knowledge components (KCs), learning events, and instructional events at a design-useful grain size; distinguishes memory/fluency, induction/refinement, and understanding/sense-making processes. | Primary/co-authored |
| 2013 | Koedinger, Booth & Klahr, [*Instructional Complexity and the Science to Constrain It*](https://doi.org/10.1126/science.1238056), *Science* 342, 935–937 | Argues that combinatorial instructional-design choices make intuition unreliable; calls for school–researcher partnerships and large in-vivo experiments. [CMU open record](https://kilthub.cmu.edu/articles/journal_contribution/Education_research_Instructional_complexity_and_the_science_to_constrain_it_/6614567) dates it 2013-11-22. | Primary/co-authored |
| 2015 | Koedinger et al., [*Learning Is Not a Spectator Sport: Doing Is Better than Watching for Learning from a MOOC*](https://doi.org/10.1145/2724660.2724681), L@S ’15, 111–120 | Contrasts informational assets (video/text) with interactive learning-by-doing in a MOOC. Interaction is an empirical learning hypothesis, not a generic engagement preference. | Primary/co-authored |
| 2023 | Koedinger, Carvalho, Liu & McLaughlin, [*An astonishing regularity in student learning rate*](https://doi.org/10.1073/pnas.2221311120), *PNAS* 120(13) | Models 27 datasets, 1.3M performance observations, 6,946 learners, and 12 courses. Reports wide initial-performance differences but similar estimated learning rates under these practice conditions; estimates about seven opportunities/KC and roughly 2.5 percentage points accuracy gain per opportunity. | Primary/co-authored |

### Other primary anchors

- The [CMU-hosted publication list](https://pact.cs.cmu.edu/koedinger/publications.htm) documents continuing work on cognitive modeling, learning curves, help seeking, worked examples, and data-driven model discovery.
- [LearnLab background readings](https://learnlab.org/background-readings/) currently foreground KLI, instructional complexity, the 2023 paper, Cognitive Tutors, and adaptive learning. This is **external/curatorial** corroboration of what the lab treats as foundational, not proof that every conclusion generalizes.
- [LearnLab’s major-accomplishments page](https://learnlab.org/sustainabilty/) highlights KLI and the “assistance dilemma”: immediate success can compete with long-term learning. It is official-lab synthesis, not independent replication.

## Recurrent claims, with cross-context evidence

### 1. Decompose the task into learnable knowledge components; do not use a course or feature as the unit of learning

**Koedinger/co-authors say or demonstrate:**

1. KLI (2012) calls for an instructionally useful intermediate grain size: KCs, learning events, and instructional events.
2. The 2010 transfer paper identifies a hidden grammar component within algebra symbolization and derives a different practice design.
3. PNAS (2023) models opportunities and performance by component rather than only course-level outcomes.
4. Cognitive Tutors (1995/2006) operationalize this in skills/production rules and mastery tracking, while DataShop (2010) stores the step-level evidence.

**Specialized terms:** *knowledge component (KC)*; *cognitive task analysis*; *cognitive model*; *model tracing*; *knowledge tracing*; *learning curve*.

**Socratink implication (inference):** begin with a small, inspectable KC map for one learner outcome. Link each KC to an observable performance task, practice opportunity, feedback policy, and delayed/transfer measure. Completion, chat turns, and topical score are not sufficient evidence that “the lesson worked.”

**Limit:** KCs are analytic models, not natural kinds. Alternative decompositions can fit the same logs; a precise model can still optimize the wrong thing if the work sample does not represent real competence.

### 2. Learners need productive action and feedback, but mere activity or immediate correctness is insufficient

**Koedinger/co-authors say or demonstrate:**

1. Cognitive Tutors (2006) use doing, context-sensitive feedback/hints, and adaptive task selection rather than exposition alone.
2. Aleven & Koedinger (2002) found better explanation and transfer with scaffolded self-explanation than no explanation; it names “shallow” learning as the risk.
3. *Learning Is Not a Spectator Sport* (2015) directly compares interactive activities with video/text in a MOOC.
4. KLI (2012) differentiates instructional events appropriate for fluency, induction/refinement, and sense-making; “active learning” is not a universal recipe.

**Specialized terms:** *learning by doing*; *self-explanation*; *assistance dilemma*; *robust learning*.

**Socratink implication (inference):** have an AI tutor elicit learner construction, retrieval, decision, or critique of authentic work before help; assess the learner’s explanation, then give targeted feedback. A smooth conversation or model-rated answer is not evidence of learning.

**Tension/limit:** this work does **not** license indiscriminate help withholding. The 2002 intervention supplied feedback/hints, and KLI says support must match the knowledge/process. Productive struggle can otherwise become abandonment; test both learning and persistence.

### 3. Transfer and durable competence require an explicit theory and assessment, not a near-task post-test

**Koedinger/co-authors say or demonstrate:**

1. KLI (2012) defines instructional efficiency in terms of robust learning per instructional time and analyzes transfer constraints.
2. Aleven & Koedinger (2002) uses transfer problems, not only within-tutor correctness.
3. Koedinger & McLaughlin (2010) makes transfer depend on analyzing hidden knowledge and tests a cross-surface practice prediction.
4. The 2013 *Science* article makes in-vivo experiments necessary because design choices interact in a vast space.

**Specialized terms:** *robust learning*; *transfer*; *instructional efficiency*.

**Socratink implication (inference):** define a source-hidden, visibly dissimilar performance task and delayed retest before selecting an AI teaching move. Use direct work quality/rubric outcomes, not the model’s evaluation of its own chat.

**Limit:** transfer is not one property. The 2010 paper expressly is not conclusive; task similarity, assessment/rubric validity, and workplace opportunity/incentives can change the conclusion.

### 4. Treat instructional design as an iterative, instrumented experimental science

**Koedinger/co-authors say or demonstrate:**

1. DataShop (2010) advocates durable, fine-grained learner-action and tutor-response records plus analytic tools.
2. Koedinger & Mathan (2004) use learning curves to find weak components and revise models/tutors.
3. *Instructional Complexity* (2013) calls for large in-vivo experiments and researcher–school partnerships.
4. PNAS (2023) uses cross-course, multi-dataset modeling rather than a single study to challenge a conventional assumption about learning rates.

**Specialized terms:** *educational data mining (EDM)*; *DataShop*; *Additive Factors Model/individual AFM*; *learning-curve analysis*.

**Socratink implication (inference):** instrument versioned lesson/agent policy, learner attempt, KC hypothesis, hint/feedback exposure, assessment form, scoring provenance, and timing. Run a narrow study with a comparison condition; use results to kill or revise a teaching design, not merely tune engagement.

**Limit:** clickstream data are not causal evidence. Preserve treatment assignment, exposure, missingness, task versions, and off-agent outcomes; obtain consent and manage privacy/dataset shift.

### 5. In the studied setting, learner gaps may reflect access to good opportunities more than immutable learning-speed traits

**Koedinger/co-authors say or demonstrate:**

1. PNAS (2023) reports wide starting-accuracy variation but little estimated variation in learning rate across its online-practice datasets.
2. Its significance statement draws an equity implication: gaps may reflect unequal access to learning opportunities.
3. Cognitive Tutors (2006) and MOOC work (2015) emphasize individualized, interactive opportunities rather than mere information distribution.

**Socratink implication (inference):** do not reify a diagnostic score as fixed ability. Adapt prerequisites, practice opportunities, and feedback, then test delayed transfer across different starting levels.

**Important qualification:** PNAS is a modeling result in academic online-practice settings, not proof of identical rates across domains, motivation states, adult work, or AI-guided learning. A non-peer-reviewed 2026 preprint, [*The “Astonishing Regularity” Revisited*](https://arxiv.org/abs/2605.01690), reports sensitivity to practice-sequence length. Treat it as a robustness prompt, not a settled refutation; Socratink should not base personalization policy on the regularity claim alone.

## Intellectual lineage and collaborations

- **John R. Anderson / ACT-R:** the 2002 paper says Cognitive Tutors are grounded in ACT-R; Anderson is a 1995 co-author. Direct lineage from computational cognitive theory to tutor behavior.
- **Albert T. Corbett:** repeated partner in Cognitive Tutors (1995, 2006) and KLI (2012), connecting cognitive theory to model/knowledge tracing.
- **Charles Perfetti:** KLI co-author, extending the synthesis across math, science, and language-learning evidence.
- **Vincent Aleven:** co-author of the self-explanation experiments: a central explanation/metacognition strand.
- **Julie Booth and David Klahr:** collaborators on instructional complexity, linking learning-science theory to pragmatic field experimentation.
- **Educational Data Mining community:** DataShop with Ryan Baker and others signals a cumulative, shared-data research agenda.

## What the corpus supports for a Socratink lead learning scientist

It supports a candidate profile unusually strong at the combination in the supplied role: turn a theory of competency into tutor interaction design, instrument it at useful grain size, and test whether a version improves learning. It does **not** establish that the same methods work unchanged for adult, open-ended, generative-AI-mediated professional work.

Practical working-session questions (inference):

1. “Pick one Socratink job-to-be-done. What is the first KC map, and what would falsify it?”
2. “What is the smallest study that distinguishes smooth AI assistance from learner-owned delayed transfer, and what must we record?”
3. “Where would you deliberately avoid student modeling/adaptive hinting because the construct or measurement is not yet trustworthy?”
4. “Given an agent that can complete the task, how would you preserve valid unaided learner evidence?”

## Evidence gaps and caution

- The reviewed corpus is largely mathematics, science, language, academic courses, intelligent tutors, and MOOCs—not adult workplace learning or contemporary agentic AI.
- Its strongest evidence often concerns well-specified tasks with observable step-level performance. Open-ended judgment, collaboration, and creative work need separate construct, task, and scoring validation.
- Availability, startup-role interest, compensation, and current positions are hiring facts requiring direct conversation, not persona inference.
- Authorship establishes documented research positions, not a prediction of present-day behavior or judgment.

## Source note

All URLs were retrieved 2026-08-31. Priority was publisher pages, open primary PDFs, and CMU/LearnLab sources. No Zhihu, WeChat, or Baidu source was used; DOI URLs are the most durable locators.
