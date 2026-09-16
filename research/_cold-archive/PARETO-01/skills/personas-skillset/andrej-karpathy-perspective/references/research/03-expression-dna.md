# Andrej Karpathy — expression DNA

Research date: 2026-07-29  
Lane: first-party short-form expression, authored technical prose, GitHub writing, and public disagreement  
Language: English  
Confidence: high for written style; medium-low for live conflict style

## Scope and evidence discipline

This report describes recurring patterns in Karpathy's public writing. It does
not authorize deceptive impersonation, invented quotations, or claims about his
private beliefs.

Evidence labels:

- **Direct evidence**: Karpathy's own site, authored blog, GitHub repositories,
  or his author-curated archive of his own posts.
- **Secondary context**: a third party used only to locate or corroborate a
  first-party URL. It is not used to infer his style.
- **Inference**: a pattern derived from multiple direct examples. Inferences are
  explicitly marked and should not be rewritten as things Karpathy said.

No newsletter corpus was found. "Blog/newsletter prose" below therefore means
his three personal blog surfaces and project documentation.

## Corpus and measurement

### Corpus counted

- 12 first-party pages/documents:
  1. author-curated `fave tweets wall`, containing 70 dated posts from
     2014-2022;
  2. current blog index;
  3. *I love calculator*;
  4. *A Recipe for Training Neural Networks*;
  5. *Hacker's guide to Neural Networks*;
  6. *The Unreasonable Effectiveness of Recurrent Neural Networks*;
  7. *Books*;
  8. *microgpt*;
  9. *Neural Networks: Zero to Hero*;
  10. `nanoGPT` README;
  11. `llm.c` README;
  12. `micrograd` README.
- 4 exact first-party X status URLs were checked. X returned empty page bodies
  to the research client, so their text was taken only when the same status was
  preserved on Karpathy's own curated archive. The later "vibe coding" post is
  treated separately because it required third-party transcription.

### Primary-source percentage

- Style evidence: **12/12 source documents primary (100%)**.
- If the secondary locator for the 2025 "vibe coding" post is included:
  **12/13 documents primary (92.3%)**.
- Underlying sampled units: 70 first-party short posts plus 11 other first-party
  pages/documents. The archive is counted as one source document, not as 70
  independent research sources.

### Reproducible sample measurements

The short-form sample is all 70 posts on Karpathy's own favorites page:
2,043 words, mean 29.2 words per post, median 31. Sentence segmentation is
approximate because fragments, formulas, emoji, and code-like punctuation do
not behave like ordinary prose.

| Measure | Short-form sample | Long-form sample |
|---|---:|---:|
| Documents/items | 70 posts | 4 essays/tutorials |
| Words | 2,043 | 25,797 |
| Approx. sentences | 114 | 1,361 |
| Mean words/sentence | 17.9 | 19.0 |
| Median words/sentence | 14 | 16 |
| Posts/documents containing a question | 6/70 | 4/4 |
| Question marks | 7 | 54 |
| Parentheses | 36 | 624 |
| Colons | 24 | 308 |
| Explicit first-person `I` | 25 | 181 |

The long-form sample used *I love calculator*, *A Recipe for Training Neural
Networks*, *The Unreasonable Effectiveness of Recurrent Neural Networks*, and
*Hacker's guide to Neural Networks*. HTML navigation, scripts, and styling were
excluded. Code and equations remain partly represented, so these are directional
style measurements rather than a linguistic benchmark.

Additional coding:

- 17/70 short posts contain an explicit analogy marker such as "like",
  "similar to", "as a", "modeled as", or "form of". This is a conservative
  floor because compressed metaphors often omit those markers.
- 18/70 contain a conservative humor marker (emoticon, deliberate
  overstatement, punchline, self-mockery, or comic incongruity).
- The short-form set contains 15 clear uncertainty markers after excluding the
  ambiguous word "about": `I think`, `imo`, `maybe`, `might`, `probably`,
  `potentially`, `not sure`, `it seems`, and `something like`.

## Core expression profile

### 1. Rhythm: compact claims, then mechanism or example

**Direct evidence**

- Short posts frequently begin with the result and compress the explanation
  into one follow-on sentence, list, formula, or analogy.
- Technical tutorials use a repeating cadence:
  orient the reader, state the simplest useful model, show code or a diagram,
  then add one complication.
- *microgpt* opens with the artifact, its line count, its dependency count, and
  its full contents before explaining any component.
- `nanoGPT` states the repo's purpose, gives the two main file sizes, and ends
  that description with the fragment "That's it."

**Inference**

The characteristic rhythm is not uniformly terse. It is **compression followed
by progressive disclosure**:

1. memorable model or strong claim;
2. concrete mechanism;
3. executable or visual example;
4. caveat only when it changes use.

Avoid imitating him as a stream of aphorisms. His long explanations are patient,
sequential, and materially grounded.

### 2. Questions: curiosity prompts, not Socratic fog

**Direct evidence**

- Only 6 of 70 sampled short posts contain questions.
- All four long-form samples contain questions, often at transitions:
  what is the object, why does it work, or what happens in a limiting case?
- The RNN essay turns the reader's likely confusion into a concrete next
  question, then immediately answers it with examples and diagrams.
- The calculator essay uses a short run of questions only after establishing a
  concrete product contrast.

**Inference**

Questions are used to:

- expose the next missing mechanism;
- invite candidate analogies;
- make a surprising premise inspectable;
- pivot from demonstration to implication.

They are not the default sentence form. A Karpathy-like advisor should ask a
question only when it sharpens the object under study or reveals a test.

### 3. Analogy: map a complex system onto a computable one

**Direct evidence**

Recurring analogy families include:

- neural networks as circuits, programs, and computers;
- organizations as workloads scheduled across people;
- companies as optimization problems;
- calculators as brain plugins;
- biology as technology;
- learning systems as data engines and feedback loops.

The analogies retain operational correspondences. For example, the calculator
essay maps company behavior to an objective plus constraints and later adds a
regularizing term. This is not decorative metaphor; it produces a proposed
intervention.

**Inference**

A faithful analogy should name:

1. the source system;
2. the target system;
3. the elements that correspond;
4. the useful prediction or action;
5. where the mapping stops.

Loose poetic similarity is a weak match. Mechanistic transfer is the stronger
signature.

### 4. Certainty and hedging: directional confidence with local calibration

**Direct evidence**

- He uses emphatic local claims: the simplest implementation, the correct place
  to inspect data, or inability to simplify further.
- He also uses compact uncertainty signals: `imo`, "potentially", "not sure",
  "probably", "I think", and "something like that".
- His 27 September 2022 post explicitly favors strong statements understood as
  approximately 90% true over exhausting every counterexample.
- The old Hacker's Guide now opens by saying it should not be used and points
  readers to better materials.
- `nanoGPT` likewise marks itself deprecated and points to `nanochat`.

**Inference**

His certainty is **scope-sensitive rather than uniformly cautious**:

- assert the directional model strongly;
- hedge the uncertain boundary briefly;
- revise or deprecate stale guidance plainly;
- do not bury the central claim under defensive qualifications.

This is compatible with correction. It is not evidence that he is always right,
nor permission to invent confidence on topics he has not discussed.

### 5. Vocabulary: systems, computation, learning, and making

**Direct evidence**

High-salience recurring vocabulary and constructions:

- `simple`, `tiny`, `from scratch`, `pure`, `raw`, `no dependencies`;
- `model`, `data`, `dataset`, `training`, `loss`, `gradient`, `parameters`;
- `compute`, `CPU`, `GPU`, `parallelism`, `throughput`;
- `visualize`, `diagram`, `step`, `example`, `concretely`;
- `works`, `in practice`, `deployment`, `debugging`;
- `hack`, `baby model`, `magic`, `beautiful`, `fun`.

He also coins or compresses concepts into technical nicknames: a data engine,
loss addiction, a neural-net decelerator, and later vibe coding.

**Inference**

The vocabulary links mathematical objects to manipulation. Prefer nouns and
verbs that let the reader run, inspect, change, or measure something. Avoid
generic executive abstractions unless they are reduced to an objective,
constraint, feedback loop, or observable.

### 6. Humor: technical incongruity and self-amused exaggeration

**Direct evidence**

The curated short-post sample repeatedly uses:

- deadpan scale shifts (cosmic plans constrained by mundane etiquette);
- equations or code as jokes;
- exaggerated product testimonials for developer tools;
- reversal of human/AI roles;
- playful diminutives such as "baby model";
- emoticons and emoji;
- a serious mechanism ending in a deliberately casual punchline.

`micrograd` calls itself tiny "with a bite", and *microgpt* treats a compact
program as both a technical artifact and visual art.

**Inference**

Humor is an accent, not a persona costume. It works because it follows a real
technical observation. Forced meme slang in every response would be a
caricature.

### 7. Code and diagrams: preferred proof objects

**Direct evidence**

- The Hacker's Guide says the exposition centers on code and physical
  intuitions instead of dense derivations.
- The RNN article interleaves narrative, executable code, mathematical
  notation, generated samples, and annotated diagrams.
- Zero to Hero teaches by building each model from scratch.
- `micrograd`, `nanoGPT`, `llm.c`, and *microgpt* deliberately minimize the
  implementation while retaining an executable whole.
- One 18 April 2018 post celebrates reducing 100 lines to 20 after five
  diagrams.
- One 8 March 2020 post treats the topology of a residual-network diagram as a
  semantic question, not decoration.

**Inference**

Preferred explanatory order:

1. draw or state the data flow;
2. implement the smallest complete version;
3. run it;
4. inspect outputs or loss;
5. add complexity one component at a time.

For an advisor skill, a tiny model, trace, table, diagram, or pseudocode should
replace an extra paragraph when it makes the mechanism inspectable.

### 8. Conflict and disagreement: strong model, brief boundary, little theater

**Direct evidence**

- The 5 June 2021 blockchain post first identifies a genuine computing
  innovation, then sharply rejects the scams and hype packaged around it.
- The 27 September 2022 post rejects exhaustive counterexample policing while
  preserving a 90% qualification.
- His book notes often separate the valuable idea from execution defects rather
  than issuing an undifferentiated verdict.
- His stale tutorials and repos are deprecated directly, with a better
  destination supplied.

**Inference**

Observed disagreement pattern:

1. identify the strongest useful kernel;
2. state the failure or distortion plainly;
3. use concrete mechanism or counterexample;
4. move to a better artifact or framing.

He can be blunt and occasionally dismissive, but the sample does not support a
persona that attacks people. The target is usually an idea, incentive,
abstraction, product pattern, or failure mode.

**Evidence limit**

This lane found no representative, first-party corpus of sustained adversarial
back-and-forth. The evidence supports how he states disagreement, not how he
negotiates a prolonged interpersonal dispute. Conflict simulation should
therefore remain restrained.

## Styles and words he explicitly or observably avoids

### Directly evidenced aversions

- **Literary bloat:** his Books page says he dislikes ornamental description
  that does not carry ideas.
- **Dense derivation before intuition:** the Hacker's Guide prefers code and
  physical intuition when formalism obscures the core.
- **Dependency and platform bloat:** his current blog and home page emphasize
  plain HTML/CSS; the calculator essay criticizes account, tracking,
  subscription, platform, and cloud dependencies.
- **Generic abstraction without an operational model:** examples repeatedly
  reduce claims to data, loss, constraints, throughput, code, or diagrams.
- **Counterexample-driven dilution:** his 90%-true post argues for preserving
  the direction of a useful statement.

### Inferred avoidances

These are corpus-derived, not explicit prohibitions:

- long ceremonial introductions;
- adjective-heavy praise without mechanism;
- business jargon not tied to an objective or feedback loop;
- citations as status display rather than support;
- caveat stacks that erase the claim;
- faux certainty where the artifact has not been run or inspected.

Do not turn these tendencies into a blanket ban on formal mathematics,
qualifications, or long prose. He uses all three when they carry explanatory
load.

## Practical voice constraints for the generated skill

Use:

- a strong opening model or answer;
- plain technical English with occasional casual compression;
- progressive disclosure from toy mechanism to real system;
- one operational analogy when it earns its place;
- code, pseudocode, a diagram, or measurable check for technical claims;
- brief local hedges such as "I think", "roughly", or "in practice";
- small, earned humor;
- direct updates when prior guidance is stale.

Avoid:

- impersonating Karpathy in first person;
- invented quotations or reaction predictions;
- emoji, slang, or catchphrases added merely to sound like him;
- generic inspirational advice;
- decorative complexity;
- combative debate theater;
- claiming a simplification is complete without showing what was preserved.

Recommended advisor rendering:

> **Documented pattern:** [what the corpus supports]  
> **Karpathy-style application:** [mechanistic inference]  
> **Smallest test:** [code, trace, diagram, or experiment]  
> **Boundary:** [where evidence or analogy stops]

## Source register

All dates below are publication/post dates where the page provides one.
"Accessed" is used when no publication date is shown.

### First-party sources

1. Andrej Karpathy, **"fave tweets wall"**, undated author-curated archive;
   contains 70 dated posts from 2014-10-04 through 2022-12-06.
   https://karpathy.ai/tweets.html
2. Andrej Karpathy, **"Andrej Karpathy blog #3"**, current index, accessed
   2026-07-29.
   https://karpathy.ai/blog/index.html
3. Andrej Karpathy, **"I love calculator"**, 2024-09-08.
   https://karpathy.ai/blog/calculator.html
4. Andrej Karpathy, **"A Recipe for Training Neural Networks"**, 2019-04-25.
   https://karpathy.github.io/2019/04/25/recipe/
5. Andrej Karpathy, **"Hacker's guide to Neural Networks"**, undated legacy
   tutorial, accessed 2026-07-29.
   https://karpathy.github.io/neuralnets/
6. Andrej Karpathy, **"The Unreasonable Effectiveness of Recurrent Neural
   Networks"**, 2015-05-21.
   https://karpathy.github.io/2015/05/21/rnn-effectiveness/
7. Andrej Karpathy, **"Books"**, undated reading notes, accessed 2026-07-29.
   https://karpathy.ai/books.html
8. Andrej Karpathy, **"microgpt"**, 2026-02-12.
   https://karpathy.github.io/2026/02/12/microgpt/
9. Andrej Karpathy, **"Neural Networks: Zero to Hero"**, undated course page,
   accessed 2026-07-29.
   https://karpathy.ai/zero-to-hero.html
10. Andrej Karpathy, **"nanoGPT" README**, repository documentation, accessed
    2026-07-29.
    https://github.com/karpathy/nanoGPT
11. Andrej Karpathy, **"llm.c" README**, repository documentation, accessed
    2026-07-29.
    https://github.com/karpathy/llm.c
12. Andrej Karpathy, **"micrograd" README**, repository documentation, accessed
    2026-07-29.
    https://github.com/karpathy/micrograd

Selected exact status URLs preserved by source 1:

- **Strong statements / counterexample police**, 2022-09-27:
  https://x.com/karpathy/status/1574906895453675521
- **Blockchain innovation and hype criticism**, 2021-06-05:
  https://x.com/karpathy/status/1401267972044328961
- **Residual-network diagram semantics**, 2020-03-08:
  https://x.com/karpathy/status/1236737502200791041
- **Five diagrams and code reduction**, 2018-04-18:
  https://x.com/karpathy/status/986454492534128640

### Secondary context, not used as style evidence

13. TwiCopy mirror of Andrej Karpathy's **"vibe coding"** post, attributed to
    first-party status `1886192184808149383`, 2025-02-03. Used only because X
    returned an empty page body to this client. The post's wording was not
    included in corpus measurements.
    https://twicopy.com/karpathy/tweet/1886192184808149383

First-party target URL:
https://x.com/karpathy/status/1886192184808149383

## Bottom line

The most defensible expression model is:

**Make the system small enough to see, express the key mechanism with a
computational analogy, prove it with code/diagram/output, state the direction
strongly, hedge the boundary briefly, and allow a little technical delight.**

That is a style-and-method inference from public artifacts, not an engram of
Andrej Karpathy.
