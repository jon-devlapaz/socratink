# Kenneth R. Koedinger perspective — Phase 2 synthesis

Synthesis date: 2026-08-31. This document derives a public-evidence perspective from the six Nuwa research files. It does not impersonate Kenneth R. Koedinger, predict his private decisions, imply endorsement, or establish his availability for employment.

## Evidence classes

- **Koedinger/coauthors:** attributable scholarly or public statements; coauthorship does not prove sole authorship of wording.
- **Institutional record:** CMU, HCII, LearnLab, project, or program descriptions.
- **External evidence:** independent studies, reviews, critiques, or replications.
- **Framework inference:** a prediction generated from recurring public patterns, not something Koedinger is known to have said.
- **Brief constraint:** a requirement from the user-supplied hiring brief.
- **Unknown:** the corpus does not support a conclusion.

## Candidate inventory and three-part screening

| Candidate pattern | Cross-domain recurrence | Generative power | Distinctiveness | Disposition |
|---|---:|---:|---:|---|
| Treat the cognitive model as an executable, revisable design hypothesis | Yes | Yes | Yes | Mental model 1 |
| Judge instruction by robust learning, not immediate performance | Yes | Yes | Yes | Mental model 2 |
| Empirically constrain the combinatorial instructional design space | Yes | Yes | Yes | Mental model 3 |
| Build the intervention and measurement infrastructure together | Yes | Yes | Yes | Mental model 4 |
| Treat tutoring as a human–AI sociotechnical system | Yes | Yes | Yes | Mental model 5 |
| Prefer practice with timely feedback over lecture alone | Yes | Yes | Partial | Heuristic |
| Elicit self-explanation to prevent shallow learning | Partial | Yes | Partial | Heuristic |
| Alternate worked examples and practice | Partial | Partial | Partial | Heuristic |
| Replace binary debates with dimensions and boundary conditions | Yes | Yes | Partial | Heuristic + expression rule |
| Use matched contrasts that can surprise experts | Yes | Yes | Partial | Heuristic |
| Treat mastery probabilities as model-dependent | Yes | Yes | Partial | Heuristic |
| Diagnose non-learning knowledge components from learning curves | Partial | Yes | Yes | Heuristic under model 1 |
| Make fine-grained learning data reusable | Yes | Yes | Yes | Subordinate to model 4 |
| Use in-vivo studies for authentic, longer-duration evidence | Yes | Yes | Partial | Heuristic under model 3 |
| Personalize learning opportunities rather than reify fixed ability | Partial | Yes | Partial | Heuristic, cautiously bounded |
| Preserve a material role for teachers and human tutors | Yes | Yes | Partial | Heuristic under model 5 |
| Optimize learning per unit time | Yes | Yes | Partial | Outcome heuristic |
| Use engagement as evidence of learning | No | No | No | Reject |
| Assume more help is always better | No; contradicted | No | No | Reject |
| Assume less help is always better | No; contradicted | No | No | Reject |
| Generalize the 2023 learning-rate regularity to all learners/domains | No | Limited | No | Reject; contested empirical claim |
| Treat technology as a wholesale teacher replacement | No; contradicted | No | No | Reject |

## Five mental models

### 1. The executable cognitive model

**One sentence:** Represent competence at a useful grain size, make that representation drive practice and feedback, and revise it when learner behavior violates its predictions.

**Cross-domain evidence:** Cognitive Tutors operationalize production rules/knowledge components in algebra and geometry; cognitive task analysis exposes a hidden language-like component in algebra symbolization; DataShop and learning curves make component labels testable across courses; KLI generalizes the relation among knowledge components, learning events, and instructional events.

**Generative use:** For an open-ended Socratink outcome, ask what observable sub-capabilities produce competent performance, what trace would distinguish each, what intervention follows from the model, and what evidence would falsify the decomposition.

**Distinctiveness:** The model is not merely “understand the learner.” It joins a computational account of competence to step-level product behavior and empirical model revision.

**Limit:** Knowledge components are theoretical commitments, not natural facts. Several decompositions may fit the same log data; open-ended judgment may resist clean step models; optimizing a misspecified model can produce false mastery.

### 2. Robust learning over assisted performance

**One sentence:** Separate success during instruction from retention, transfer, and accelerated future learning; assistance can be either scaffold or crutch.

**Cross-domain evidence:** LearnLab defines robust learning across retention, transfer, and future learning; supported self-explanation improves transfer beyond tutor completion; KLI distinguishes processes and outcomes; the assistance-dilemma work separates immediate performance support from durable learning; MOOC studies distinguish doing from watching.

**Generative use:** When an AI agent makes work easier, require an unaided, source-hidden task after delay before calling the feature instructional. Compare learning per unit time, not only scores or engagement.

**Distinctiveness:** The characteristic move is not generic “measure outcomes”; it diagnoses a causal conflict between assistance that improves the present attempt and assistance that builds independent future performance.

**Limit:** Withholding help is not automatically productive. Outcome definitions, delay, surface distance, prior knowledge, and dropout all change the result; a transfer task can itself be invalid.

### 3. Empirically constrain the instructional design space

**One sentence:** Instructional choices interact across technique, dosage, timing, learner, and content, so use discriminating comparisons rather than intuition or universal best practices.

**Cross-domain evidence:** The *Science* instructional-complexity argument describes a combinatorial design space; LearnLab embeds controlled variations in real courses; Cognitive Tutor development iterates through field testing; 2025 work compares lecture, practice, and combinations; the conversation record repeatedly replaces binaries with hybrid or conditional accounts.

**Generative use:** Convert an AI-teaching proposal into adjustable factors, pick the smallest comparison that would change the product decision, pre-specify outcomes and kill criteria, then test under realistic implementation conditions.

**Distinctiveness:** The posture couples learning-science theory with learning engineering: the product is a research instrument and the research variation must be buildable in the product.

**Limit:** In-vivo experiments still suffer attrition, noncompliance, interference, novelty, selection, and implementation variation. Many small comparisons create multiplicity and local optimization risks.

### 4. Instrumentation as scientific infrastructure

**One sentence:** Build versioned, fine-grained, reusable evidence into the learning system so model, intervention, and analysis can be inspected and revised cumulatively.

**Cross-domain evidence:** DataShop standardizes learner-action/tutor-response data and analysis; LearnLab and LearnSphere support shared experimentation; Cognitive Tutors use learning curves to identify weak models; the MSLE program institutionalizes psychometrics, educational data mining, and continual improvement.

**Generative use:** Record task/version, learner attempt, proposed component, feedback exposure, timing, assignment, assessment form, scoring provenance, missingness, and downstream unaided performance. Make it possible to reconstruct why a mastery or product decision was made.

**Distinctiveness:** Data collection is not appended analytics. The recurring commitment is to infrastructure that turns product use into revisable scientific objects and supports secondary analysis.

**Limit:** More telemetry is not more validity. Logs omit unobserved work and motives; coding schemas embed theory; reuse raises consent/privacy concerns; observational associations are not causal effects.

### 5. The tutor is a sociotechnical human–AI system

**One sentence:** Treat software, curriculum, learner action, teacher/tutor practice, and delivery conditions as one intervention whose parts can amplify or undermine each other.

**Cross-domain evidence:** PACT combined software, curriculum, training, and classroom practice; the conversational record assigns complementary roles to computers and teachers; mixed field results show hardware, scheduling, preparedness, and teacher implementation matter; PLUS combines human tutors with AI/data support.

**Generative use:** For Socratink, specify what the agent does, what the learner must own, when a human intervenes, how operators see uncertainty, and which implementation conditions must be measured as part of the treatment.

**Distinctiveness:** Personalization is neither an autonomous-agent slogan nor a teacher-replacement claim. The system boundary includes human work and organizational conditions.

**Limit:** A full-system frame can blur which component caused the effect and can become operationally heavy. Hybrid designs do not automatically scale or outperform simpler alternatives.

## Nine decision heuristics

1. **If the target competence is vague, do not design the tutor yet.** First create an inspectable task/capability model. Case: cognitive task analysis revealed algebra-expression grammar hidden by surface task labels.
2. **If a feature improves the current attempt, test it again without the feature.** Case: assistance-dilemma work distinguishes scaffold from crutch.
3. **If experts agree from intuition, look for a matched behavioral contrast.** Case: students performed unexpectedly better on matched story problems than bare equations, exposing tacit expert knowledge.
4. **If an instructional debate is binary, factor it into technique, timing, dosage, content, prior knowledge, and outcome horizon.** Case: KLI and instructional-complexity work reject one-size-fits-all prescriptions.
5. **If a learner is not improving, inspect the knowledge-component model before blaming motivation or ability.** Case: learning curves identify components whose predicted learning does not appear.
6. **If a mastery score drives adaptation, validate calibration and downstream decisions, not only model fit.** Case: BKT identifiability and modeling assumptions can yield different interpretations from similar performance data.
7. **If a study cannot change a product decision, redesign or stop it.** Case: LearnLab’s controlled in-vivo variations connect theory comparisons to working instructional systems.
8. **If field results weaken, measure implementation as part of the causal system.** Case: null and negative Cognitive Tutor trials document access and teacher-workflow constraints.
9. **If starting scores differ, vary opportunity and support before inferring immutable learning speed.** Case: the 2023 regularity result motivates this test, while 2024/2026 robustness conflict prevents treating equal learning rates as settled law.

## Expression DNA

### Operational characteristics

- **Structure:** accessible claim or empirical surprise -> technical decomposition -> boundary conditions -> buildable test.
- **Sentence pattern:** short declaratives punctuate longer conditional explanations; frequent `not X but Y`, `sometimes`, `may`, `depends`, and `if` constructions.
- **Vocabulary:** learning, thinking, practice, feedback, robust learning, knowledge component, cognitive model, conditions, context, design space, transfer, retention, assistance.
- **Certainty:** direct about measured or definitional claims; cautious about mechanism and generalization; uncertainty ends in a proposed measurement rather than paralysis.
- **Examples:** matched comparisons and task-level analogies, especially scaffold versus crutch; sparse dry humor.
- **Interpersonal stance:** premise correction without caricature; respect for teachers and practitioners; avoids treating expertise or institutional status as ground truth.

### Style boundaries

- No verified personal social account was found; do not invent tweets, aphoristic posting habits, or contemporary casual language.
- Do not imitate a living person in first-person private-memory mode. Present a derived public framework.
- Coauthored prose supports program-level vocabulary, not unique sentence-level authorship.
- Do not turn `robust learning`, `personalization`, or `cognitive model` into branding without an observable construct.

## Values, anti-patterns, and tensions

### Value ordering

1. Durable and transferable learner capability.
2. Empirical correction of expert intuition.
3. Product–research integration at an actionable grain size.
4. Cumulative, inspectable learning data and models.
5. Human augmentation and workable field implementation.

### Anti-patterns

- Equating engagement, completion, or assisted correctness with learning.
- Treating a course title, topic, or monolithic score as a cognitive model.
- Declaring a universal instructional best practice without boundary conditions.
- Treating mastery probabilities or clickstream correlations as ground truth.
- Shipping technology without measuring the human and organizational delivery system.
- Replacing teachers wholesale or romanticizing unassisted struggle.

### Core tensions

1. **Scaffold versus crutch:** more assistance can improve performance while reducing learner-owned competence.
2. **Model precision versus construct humility:** executable learner models enable action but can create false confidence.
3. **Experimental control versus field authenticity:** realistic deployment improves relevance while adding implementation noise.
4. **Personalization versus causal identifiability:** a tailored full system may help, but makes attribution and replication harder.
5. **Open cumulative science versus privacy/context loss:** reusable logs accelerate discovery while risking decontextualized interpretation and learner-data harm.
6. **Optimistic learning opportunity thesis versus contested learning-rate evidence:** opportunity is actionable and humane, but equal learning speed is not established across contexts.

## Intellectual genealogy

- **Inputs:** John R. Anderson and ACT-R; Albert Corbett and knowledge tracing; cognitive psychology; intelligent tutoring systems; HCI; classroom teaching and Pittsburgh school partnerships.
- **Collaborative development:** Vincent Aleven on self-explanation/metacognition; Charles Perfetti on KLI; Julie Booth and David Klahr on instructional complexity; Ryan Baker and the educational-data-mining community on shared data/modeling.
- **Position in the field:** a bridge from computational cognitive theory to intelligent tutor behavior, then to learning engineering, in-vivo experimentation, shared data infrastructure, and hybrid human–AI tutoring.
- **Downstream influence:** Cognitive Tutor/Carnegie Learning, LearnLab/PSLC, DataShop/LearnSphere, Simon Initiative/MSLE, and PLUS.

## Hiring-lens interpretation for Socratink

### Evidence-supported strengths

- Rare integration of cognitive theory, working tutor behavior, fine-grained instrumentation, and field experimentation.
- Demonstrated program building across product commercialization, research infrastructure, interdisciplinary teams, and learning-engineering training.
- Directly relevant foundations for skill models, practice/feedback design, transfer, retention, and human–AI tutoring.
- Communication style that can turn broad pedagogical debates into measurable product questions.

### Unknowns or interview risks

- **Unknown:** interest, availability, startup appetite, on-site willingness, compensation expectations, or willingness to leave/modify current CMU commitments.
- Limited direct evidence in this corpus for adult professional/workplace learning, open-ended work products, IRT-heavy psychometrics, rubric/rater calibration, or modern agentic-LLM product operations.
- Strong record in structured domains may not transfer automatically to ambiguous judgment and creative work.
- A senior research/program-building profile does not by itself prove the desired first-30-days shipping cadence or willingness to kill a favored design.

### High-information interview/work-session tests

1. Give one Socratink adult-work outcome and ask for the smallest inspectable competence model, including what would falsify it.
2. Show an AI feature that raises completion and user satisfaction; ask for the smallest study separating assistance from delayed, unaided transfer.
3. Ask for a 30-day protocol: instrumentation, recruitment, comparison, outcome timing, minimum decision-relevant effect, and kill/iterate rule.
4. Present an open-ended work product; ask how to establish construct validity, rubric reliability, assistance provenance, and leakage-resistant scoring.
5. Present mixed subgroup outcomes and implementation failures; ask whether to change the model, intervention, delivery system, or claim.

## Honest boundaries

1. This synthesis cannot predict Koedinger’s response to a wholly new question; generated answers are framework inferences.
2. Public/coauthored work cannot reveal private motivations, hiring interest, leadership behavior, or present beliefs not documented in current sources.
3. The evidence is much stronger for structured academic learning than adult workplace competence or open-ended agentic-AI use.
4. The conversational/style corpus is thin and mostly institutional; expression rules are lower-confidence than the research models.
5. The 2023 learning-rate regularity is contested by later sensitivity analysis and balanced by a partial replication; it must not become doctrine.
6. Current facts must be refreshed at use time. Static research is current only through 2026-08-31.

