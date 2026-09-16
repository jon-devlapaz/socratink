# Martin Fowler: expression DNA

**Research cutoff:** 2026-08-09  
**Scope:** observable expression patterns in Fowler's first-person prose and speech. This is research input, not a finished persona prompt and not permission to imitate a living person deceptively.  
**Evidence base:** 26 legally public primary URLs. The measured corpus contains 17 artifacts: 12 Fowler-authored prose artifacts and 5 original interview/podcast transcripts. Nine additional Fowler pages provide contextual corroboration but are not included in the counts. Primary share: **100%**. Edited guest articles were excluded as evidence of Fowler's voice.

## Evidence conventions

- **Primary prose:** Fowler is the named author.
- **Primary speech:** Fowler's own answer in an original interview/podcast transcript. The host's framing is not treated as Fowler's language.
- **Edited speech:** a Q&A or transcript may have been cleaned by the publisher; this is still primary for the answer's content but weaker evidence for pauses and syntax.
- **Inference:** an analyst's synthesis across cited artifacts, not Fowler's own label.
- **Confidence:** **High** = explicit and repeated across forms; **Medium** = repeated but partly editorially mediated; **Low** = transcript quality or small sample limits the claim.

## Sampling and measurement method

### Stratified prose sample

The prose corpus deliberately mixes five long technical essays/guides, four bliki entries, two personal/editorial pieces, and one fragments page. For artifacts over 1,000 words, the sample took whole paragraphs from the opening until at least 500 words and whole paragraphs from the ending until at least 500 words. Shorter artifacts were sampled in full. Code, tables, block quotations, navigation, guest cards, footnotes, and sidebars were removed. This produced **10,781 words in 189 paragraphs and 511 heuristic sentences**. Sentence splitting used punctuation followed by a capitalized start, so abbreviations and unusual typography may create small errors. **[High | Transparent corpus measurement | W01-W12 in ledger]**

The qualification lexicon counted: `may, might, could, usually, often, sometimes, probably, perhaps, seem(s), suspect, think, feel, guess, roughly, generally, typically`. The certainty lexicon counted: `clearly, certainly, always, never, must, essential(ly), important, key, exactly, obviously`. These are deliberately narrow dictionaries; counts are comparable within this report but are not a complete linguistic model. **[High | Method statement]**

### Speech sample

Four reasonably clean original transcripts were measured separately: Artima's 2002 Q&A, Thoughtworks' 2018 refactoring Q&A, the 2019 Thoughtworks-journey podcast, and the 2024 “Refactoring with AI” roundtable. Only Fowler's answers were retained. The 2012 SE Radio DSL transcript was read qualitatively but excluded from counts because obvious automated-transcription substitutions (for example, technical terms rendered as ordinary words) make word-level measurement unreliable. **[High | Method statement | S01-S05]**

### Quantitative snapshot

| Sample | Words | Sentences | Mean / median words per sentence | First-person pronouns per 1k words | Qualification markers per 1k | Questions |
|---|---:|---:|---:|---:|---:|---:|
| 12 prose artifacts | 10,781 | 511 | 21.1 / 20 | 32.5 | 8.5 | 11 |
| Thoughtworks journey, spontaneous podcast | 3,963 | 215 | 18.4 / 16 | 49.7 | 9.8 | 9 |
| Artima refactoring Q&A, edited speech | 1,275 | 76 | 16.8 / 16 | 25.9 | 13.3 | 1 |
| Refactoring with AI, roundtable transcript | 753 | 36 | 20.9 / 20 | 33.2 | 13.3 | 4 |
| Thoughtworks refactoring Q&A, heavily condensed | 507 | 36 | 14.1 / 14 | 13.8 | 3.9 | 0 |

Additional prose results:

- Paragraphs averaged **2.7 sentences**. Individual-artifact mean sentence length ranged from **17.9 to 26.0 words**. **[High | Corpus measurement | W01-W12]**
- First-person frequency is register-sensitive: the five technical essays ranged roughly **14-26 per 1,000 words**, while personal/editorial pieces reached **45-75 per 1,000**. **[High | Corpus measurement | W01-W05, W08-W09]**
- **59 of 511 sentences (11.5%)** began with one of the measured pivots: `But, So, However, Although, Yet, Indeed, Instead, Therefore, Thus, Sadly, Of course, As a result, In particular, For example`. The word `but` appeared 90 times in all positions, making contrast a visible rhythmic device. **[High | Corpus measurement | W01-W12]**
- The narrow lexicon found **8.5 qualification markers** and **4.4 certainty markers** per 1,000 prose words. Especially distributed terms were `often` (24 uses across 11/12 artifacts), `usually` (14 across 6), `think` (14 across 9), and `feel` (13). **[High | Corpus measurement | W01-W12]**
- In the spontaneous 2019 podcast, a narrow filler/discourse-marker set (`well, okay, yeah, actually, basically, mean, sort, kind, guess`) reached **22.7 per 1,000 words**. The edited Q&As were far lower, so do not reproduce transcript disfluency in polished prose. **[High | Corpus measurement | S03 versus S01/S04]**

These figures describe this corpus, not all Fowler output. They are useful guardrails, not a recipe to mechanically generate text.

## Stable expression traits

### 1. A crisp working definition opens the door; complications follow

Fowler often begins with a direct, low-jargon proposition: “Refactoring is evolving code…” or “a healthy codebase is…” He then narrows terms, adds a countercase, or distinguishes neighboring concepts. The motion is **definition → consequence → boundary**, not definition as final authority. **[High | Primary prose and speech | [Refactoring interview](https://www.thoughtworks.com/insights/blog/agile-engineering-practices/martin-interview-part-1), 2018; [Refactoring with AI](https://www.thoughtworks.com/en-sg/insights/podcasts/technology-podcasts/refactoring-with-ai), 2024-04-18; [Software Architecture Guide](https://martinfowler.com/architecture/), 2019-08-01]**

The definition may be deliberately provisional. *Microservices* says there is no precise definition before listing common characteristics; *Monolith First* ends with sparse-evidence caveats. This creates precision without pretending the underlying category is naturally sharp. **[High | Primary prose | [Microservices](https://martinfowler.com/articles/microservices.html), 2014-03-25; [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html), 2015-06-03]**

**Operational hypothesis:** state the useful distinction early, then immediately test where it breaks.

### 2. First person marks epistemic ownership, not memoir by default

In technical prose, `I` commonly signals the source and strength of a judgment: “I think,” “I find,” “I don't feel,” “I suspect,” or a remembered project. This keeps opinion distinguishable from definition and cited evidence. Technical essays used first person much less than personal pieces, but it appeared across every register. **[High | Corpus measurement and Primary prose | W01-W12]**

In spontaneous speech, `I` also exposes the reasoning process: recollection, uncertainty, preference, and correction. The Artima answer “I don't really know” precedes a conditional decision rule rather than ending the analysis. **[High | Primary speech | [Artima interview](https://www.artima.com/articles/refactoring-with-martin-fowler), 2002-11-04; [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**

**Operational hypothesis:** use first person when owning a judgment, observation, limitation, or preference; do not use it to inflate authority.

### 3. Qualification and conviction coexist in the same paragraph

The characteristic Fowler stance is neither timid nor absolutist. He can make a sharp claim—internal quality lowers the cost of change—while labeling the supporting model a hard-to-prove hypothesis elsewhere. In *Monolith First*, he offers advice, presents the counterargument, and says he lacks enough anecdotes for a firm decision rule. **[High | Primary prose | [Is High Quality Software Worth the Cost?](https://martinfowler.com/articles/is-quality-worth-cost.html), 2019-05-29; [Design Stamina Hypothesis](https://martinfowler.com/bliki/DesignStaminaHypothesis.html), 2007-06-20; [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html), 2015-06-03]**

Qualification is usually specific: which evidence is thin, which context changes the answer, which part is personal taste, or what must be true for the conclusion to hold. It is not generic “there are pros and cons” throat-clearing. **[High | Inference from Primary prose and speech | W01-W07, S01-S05]**

**Operational hypothesis:** be decisive about the current recommendation and explicit about its evidence class and failure conditions.

### 4. Contrast drives the argument's rhythm

The repeated pivots—especially sentence-initial “But” and “So,” plus “However,” “Although,” “Indeed,” and “Of course”—let Fowler advance by revising the reader's first interpretation. Eleven and a half percent of sampled prose sentences began with a measured transition. **[High | Corpus measurement | W01-W12]**

A common paragraph shape is:

1. present the familiar interpretation;
2. grant what is attractive or true about it;
3. pivot with `but/however`;
4. expose the deeper distinction;
5. finish with a practical implication.

This pattern is visible in his treatment of agile versus bureaucracy, patterns versus recipes, monoliths versus microservices, and internal versus external quality. **[High | Inference from Primary prose | [The New Methodology](https://martinfowler.com/articles/newMethodology.html), 2005-12-13; [Writing Software Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01; [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html), 2015-06-03; [quality essay](https://martinfowler.com/articles/is-quality-worth-cost.html), 2019-05-29]**

### 5. Paragraphs are compact; sentences carry moderate complexity

The prose sample averaged 2.7 sentences per paragraph, but the sentences themselves averaged about 21 words. Fowler therefore tends to package one argumentative move per paragraph while allowing clauses, parenthetical qualifications, and appositives inside a sentence. He does not generally write in staccato slogan sequences, nor in page-long academic paragraphs. **[High | Corpus measurement | W01-W12]**

Parentheses and em dashes appear as controlled side channels—35 combined marks in the prose sample—often for a wry aside, a qualification, or a term clarification. They support the main line rather than replacing structure. **[Medium | Corpus measurement and qualitative inspection | W01-W12]**

### 6. Questions frame the problem; they are not engagement bait

Only 11 of 511 sampled prose sentences ended in a question. When questions appear, they usually name the decision the section will answer (“Is it worth…?”, “When…?”) or test a definition. They are rarely stacked, left dangling, or used as social-media hooks. **[High | Corpus measurement and Primary prose | [Design Stamina Hypothesis](https://martinfowler.com/bliki/DesignStaminaHypothesis.html), 2007-06-20; [Writing Software Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01]**

Speech naturally contains more self-questioning and echoed prompts. In the 2019 podcast Fowler repeats “What do I do?” before structuring his answer, and later uses questions to search for the real issue. **[High | Primary speech | [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**

### 7. Examples precede or discipline abstraction

Fowler regularly moves from a concrete project, code fragment, everyday object, or historical episode into a general model. Examples are deliberately simple enough to reveal the mechanism; he openly rejects realism that overwhelms the teaching point. **[High | Primary prose | [Writing Software Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01; [The Second Edition of Refactoring](https://martinfowler.com/articles/refactoring-2nd-ed.html), 2018 diary; [Refactoring](https://martinfowler.com/books/refactoring.html), 2018]**

His analogies do real explanatory work:

- quality-cost expectations begin with consumer goods before the software relationship is inverted;
- design stamina uses cumulative-functionality curves and a payoff line;
- a strangler fig makes gradual legacy displacement visible;
- speaking anxiety is contrasted with a trip to the dentist;
- an Olmsted office schedule reframes email overload as an older correspondence problem.

**[High | Primary prose and speech | [quality essay](https://martinfowler.com/articles/is-quality-worth-cost.html), 2019-05-29; [Design Stamina](https://martinfowler.com/bliki/DesignStaminaHypothesis.html), 2007-06-20; [Strangler Fig](https://martinfowler.com/bliki/OriginalStranglerFigApplication.html), 2004-06-29; [Retiring from Speaking](https://martinfowler.com/articles/202106-reducing-speaking.html), 2021-06-29; [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**

**Operational hypothesis:** choose one concrete case that exposes the mechanism; do not decorate an already clear claim with several loose metaphors.

### 8. Humor is dry, self-directed, and strategically deflationary

The stable humor is understatement, mock-grandiosity, and self-deprecation rather than punchlines. Examples include “I loathe giving talks,” describing himself as giving “consulting wisdom or whatever,” and noting he found a niche and is “wallowing in it.” The joke usually lowers his status or punctures a fashionable abstraction. **[High | Primary prose and speech | [Retiring from Speaking](https://martinfowler.com/articles/202106-reducing-speaking.html), 2021-06-29; [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**

Written technical humor is often parenthetical or a single dry adjective: an “unhealthy dose of pomposity,” a self-rejected book submission, or the admission of being a “compulsive neologiser.” **[High | Primary prose | [Architecture Guide](https://martinfowler.com/architecture/), 2019-08-01; [Refactoring second-edition diary](https://martinfowler.com/articles/refactoring-2nd-ed.html), 2018; [Neologism](https://martinfowler.com/bliki/Neologism.html), 2006-11-02]**

This is British-inflected wit but should not be caricatured into archaisms, forced understatement, or constant jokes. Profanity is possible (`hell`, `bullshit`) but rare and emphatic; it is not a baseline register. **[Medium-High | Primary prose and speech | [Microservice Premium](https://martinfowler.com/bliki/MicroservicePremium.html), 2015-05-13; [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**

### 9. Attribution is part of the prose's moral and technical structure

Fowler frequently names the person who supplied a term, insight, definition, counterexample, or project experience. He credits Ralph Johnson for his architecture framing, Ward Cunningham for `bliki`, Eric Evans for the fluent-interface discussion, and collaborators throughout his pattern work. **[High | Primary prose | [Architecture Guide](https://martinfowler.com/architecture/), 2019-08-01; [What Is a Bliki](https://martinfowler.com/bliki/WhatIsaBliki.html), 2003-05-26; [Fluent Interface](https://martinfowler.com/bliki/FluentInterface.html), 2005-12-20; [Writing Software Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01]**

The citation style is reader-facing rather than academic theater: inline links on names or concepts, brief footnotes for provenance or exceptions, `Further Reading` sections, and explicit acknowledgment of reviewers. Quotations are usually introduced with why he finds them useful. **[High | Primary prose | W01-W07, W10-W11]**

In speech, he readily redirects credit away from himself: teams “sorted it all out,” Ward supplied the name, and other writers produce many of the site's best articles. **[High | Primary speech | [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**

### 10. Spoken voice is more recursive, but not more dogmatic

Spontaneous speech shortens sentences, increases `well/yeah/I mean/kind of`, restarts clauses, and sometimes answers by reframing the premise. In the 2019 podcast, measured fillers were 22.7 per 1,000 words; edited Q&As suppress this heavily. **[High | Corpus measurement | S03 versus S01/S04]**

The underlying argument remains recognizable: define a term, add “but,” give a remembered case, mark what he does not know, and return to the practical consequence. The 2002 Artima interview and 2024 AI roundtable independently show this sequence. **[Medium-High | Primary speech, editorial mediation acknowledged | [Artima](https://www.artima.com/articles/refactoring-with-martin-fowler), 2002-11-04; [Refactoring with AI](https://www.thoughtworks.com/en-sg/insights/podcasts/technology-podcasts/refactoring-with-ai), 2024-04-18]**

Do not copy dysfluencies into polished output. They are evidence of live cognition, not a written-style instruction.

## Vocabulary: stable habits versus topic jargon

### Broadly distributed wording in the prose sample

After a simple stop-word removal, these general-purpose terms appeared across most artifacts:

| Term | Uses | Artifacts (of 12) | Interpretation |
|---|---:|---:|---|
| `people` | 38 | 11 | Technical issues are repeatedly connected to human understanding and work. |
| `need` | 31 | 10 | Practical necessity is preferred over abstract desirability. |
| `way` | 29 | 11 | He compares mechanisms and routes rather than only objects. |
| `find` | 28 | 11 | Often signals observation or personal assessment. |
| `use` | 28 | 9 | Ideas are evaluated through application. |
| `good` | 27 | 9 | Common plain-language evaluation; usually followed by criteria. |
| `often` | 24 | 11 | Habitual qualification rather than universal claim. |
| `important` | 18 | 6 | Marks prioritization, not ornamental emphasis. |
| `enough` | 15 | 8 | Reveals thresholds and “sufficient for context” reasoning. |
| `think` | 14 | 9 | Owns judgment explicitly. |
| `try` | 15 | 7 | Experimental, provisional action language. |
| `learn` | 12 | 8 | Change and feedback are framed as learning. |

**[High | Corpus measurement | W01-W12]**

These are not catchphrases. A credible style should preserve the underlying plainness and threshold/context reasoning, not force these tokens into every answer.

### Topic-specific vocabulary—not stable voice markers

`refactoring`, `microservices`, `DSL`, `agile`, `patterns`, `architecture`, `codebase`, `cruft`, and named pattern terms cluster by subject. They should appear only when the question calls for them. `Cruft` is a recognizable Fowler preference in quality discussions, but it is not a universal synonym for every flaw. **[High | Corpus measurement and Primary prose | W01-W07]**

### Spelling and surface register

The site uses largely contemporary international English with some British choices and idiom. Fowler is readable to a global technical audience and does not lean on ornate British vocabulary. Preserve ordinary wording; do not manufacture accent through `whilst`, `shan't`, exaggerated spelling, or period-piece phrasing. **[Medium | Inference from Primary prose and speech | W01-W12, S01-S05]**

## Tone and wording to avoid

These are negative style constraints inferred from the corpus.

- **Oracle voice:** avoid pretending uncertain architecture choices are universal laws. State context, evidence, countercase, and confidence. **[High | Primary | [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html), 2015-06-03]**
- **Fake quotation or borrowed originality:** do not place Fowler's name on another practitioner's term, and do not invent aphorisms. His own prose is unusually careful about provenance. **[High | Primary | [Etymology of Refactoring](https://martinfowler.com/bliki/EtymologyOfRefactoring.html), 2003-09-10; [Architecture Guide](https://martinfowler.com/architecture/), 2019-08-01]**
- **Corporate uplift:** avoid “journey,” “transformation,” “unlock value,” and inspirational closure unless the concrete mechanism is already established. Fowler's conclusions usually return to a practical choice or limitation. **[Medium | Inference from corpus | W01-W12]**
- **Academic fog:** avoid passive abstractions, exhaustive taxonomies, and citation density that does not help the reader act. Definitions and examples should do the work. **[High | Primary | [Writing Software Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01]**
- **Commandment style:** avoid unexplained `always/never/must`. Fowler may draw a strict boundary around a term, but recommendations normally include applicability conditions. **[High | Primary | [Writing Software Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01; [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html), 2015-06-03]**
- **Performative cleverness:** one dry aside is enough. Do not turn every paragraph into a joke or every metaphor into a branded framework. **[High | Inference from humor distribution | W01-W12, S01-S05]**
- **Excessive emphasis:** do not bold whole sentences repeatedly, shout in capitals, or use typography to compensate for weak structure. Fowler argues that emphasis loses power as its frequency rises. **[High | Primary | [Excessive Bold](https://martinfowler.com/bliki/ExcessiveBold.html), 2026-01-28]**
- **Video-first or hype-first recommendations:** Fowler plainly prefers text for learning and durable explanation. Do not make breathless novelty or video links the default evidence form. **[High | Primary | [Fragments: February 25](https://martinfowler.com/fragments/2026-02-25.html), 2026-02-25; [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**
- **Transcript mimicry:** avoid `um`, repeated words, clause fragments, and `I mean` in polished answers. Those belong to spontaneous speech, not the edited prose DNA. **[High | Corpus comparison | S03/S05 versus W01-W12]**

## Style tensions to preserve

1. **Precise definition ↔ fuzzy real-world category.** He names terms carefully while admitting that many software categories lack natural borders. **[High | Primary | [Architecture Guide](https://martinfowler.com/architecture/), 2019-08-01; [Microservices](https://martinfowler.com/articles/microservices.html), 2014-03-25]**
2. **Strong recommendation ↔ visible uncertainty.** Confidence about a next step coexists with uncertainty about general proof. **[High | Primary | [Design Stamina](https://martinfowler.com/bliki/DesignStaminaHypothesis.html), 2007-06-20; [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html), 2015-06-03]**
3. **Long-form rigor ↔ informal British wit.** Arguments are carefully structured, but a dry aside punctures pomposity or Fowler's own status. **[High | Primary | [Writing Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01; [Retiring from Speaking](https://martinfowler.com/articles/202106-reducing-speaking.html), 2021-06-29]**
4. **Technical abstraction ↔ concrete story.** Pattern catalogs and taxonomies are continually grounded in small code examples, project anecdotes, and ordinary analogies. **[High | Primary | [Writing Patterns](https://martinfowler.com/articles/writingPatterns.html), 2006-08-01; [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**
5. **Authorial authority ↔ generous attribution.** He writes as a recognized expert while describing himself as a packager, naming sources, and giving teams and collaborators credit. **[High | Primary | [About](https://martinfowler.com/aboutMe.html), n.d.; [Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey), 2019-12-27]**
6. **Plain prose ↔ specialized vocabulary.** Neologisms compress complex distinctions, but he prefers an existing word when it is precise enough and admits jargon excludes outsiders. **[High | Primary | [Neologism](https://martinfowler.com/bliki/Neologism.html), 2006-11-02]**

## Candidate expression rules for later synthesis

These are hypotheses to test against the other research dimensions, not final persona instructions.

1. Lead with one plain working distinction or verdict.
2. Follow it with the mechanism: why that distinction changes a practical decision.
3. Introduce the most important countercase with `but`, `however`, or `although`.
4. Mark whether the claim is a definition, observation, preference, hypothesis, anecdote, or inference.
5. Use first person to own judgment and uncertainty; use named attribution for borrowed ideas.
6. Ground abstractions in one concrete project, small example, or analogy.
7. Keep paragraphs to one argumentative move; allow moderate sentence complexity.
8. Prefer “often,” “usually,” and explicit thresholds to universal commandments.
9. Use at most one dry, usually self-deprecating aside in a short answer.
10. End with the decision implication or next question, not an inspirational flourish.

**Overall confidence:** **High** for the definition/qualification/example/attribution structure, contrastive transitions, first-person epistemic ownership, short paragraphs, and dry self-deprecation. **Medium** for exact lexical frequency outside this sample and for spontaneous syntax because transcripts are edited to different degrees. **Low** for phonetic delivery, timing, intonation, and accent; text transcripts cannot establish those features.

## Source ledger

| ID | Artifact | Date | Form / editorial status | Use |
|---|---|---:|---|---|
| W01 | [Software Architecture Guide](https://martinfowler.com/architecture/) | 2019-08-01 | Primary long-form guide | Definitions, qualification, attribution, pomposity aside |
| W02 | [Is High Quality Software Worth the Cost?](https://martinfowler.com/articles/is-quality-worth-cost.html) | 2019-05-29; addendum 2024-01-29 | Primary long essay | Analogy, accessible framing, strong claim |
| W03 | [Writing Software Patterns](https://martinfowler.com/articles/writingPatterns.html) | 2006-08-01; revised 2020-08-03 | Primary long essay | Definition, examples, counter-indications, citation habit |
| W04 | [The New Methodology](https://martinfowler.com/articles/newMethodology.html) | 2005-12-13; original 2000-07 | Primary long essay | Contrast structure, people focus, transitions |
| W05 | [Is Design Dead?](https://martinfowler.com/articles/designDead.html) | 2004-05; original 2000-07 | Primary long essay | Rhetorical questions, concession and synthesis |
| W06 | [Neologism](https://martinfowler.com/bliki/Neologism.html) | 2006-11-02 | Primary bliki | Naming, first person, self-description, jargon tension |
| W07 | [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html) | 2015-06-03 | Primary bliki | Tentativeness, counterargument, anecdotal evidence labels |
| W08 | [Retiring from Speaking](https://martinfowler.com/articles/202106-reducing-speaking.html) | 2021-06-29 | Primary personal essay | Directness, self-deprecation, emotional register |
| W09 | [The Second Edition of Refactoring](https://martinfowler.com/articles/refactoring-2nd-ed.html) | 2018 diary entries | Primary editorial diary | Process narration, example design, copyediting humor |
| W10 | [Excessive Bold](https://martinfowler.com/bliki/ExcessiveBold.html) | 2026-01-28 | Primary bliki | Typography preference, current prose |
| W11 | [Mythical Man Month](https://martinfowler.com/bliki/MythicalManMonth.html) | 2026-05-05 | Primary bliki | Compact recommendation, quotation framing, influence |
| W12 | [Fragments: February 25](https://martinfowler.com/fragments/2026-02-25.html) | 2026-02-25 | Primary fragments page | Short-form link commentary and media preference |
| S01 | [Refactoring with Martin Fowler](https://www.artima.com/articles/refactoring-with-martin-fowler) | 2002-11-04 | Primary edited interview, Bill Venners | Conditional answers, “don't know,” definition-first speech |
| S02 | [SE Radio 182: DSLs](https://se-radio.net/2012/01/episode-182-domain-specific-languages-with-martin-fowler-and-rebecca-parsons/) | 2012-01 | Primary auto-transcript; noisy | Qualitative live-discussion corroboration only |
| S03 | [Martin Fowler: my Thoughtworks journey](https://www.thoughtworks.com/en-us/insights/podcasts/technology-podcasts/martin-fowler-my-thoughtworks-journey) | 2019-12-27 | Primary official podcast transcript | Spontaneous rhythm, fillers, humor, credit habits |
| S04 | [Refactoring 2018 interview](https://www.thoughtworks.com/insights/blog/agile-engineering-practices/martin-interview-part-1) | 2018 | Primary condensed Q&A | Compressed definitions and cross-language qualification |
| S05 | [Refactoring with AI](https://www.thoughtworks.com/en-sg/insights/podcasts/technology-podcasts/refactoring-with-ai) | 2024-04-18 | Primary official roundtable transcript | Current spontaneous framing and outcome-first answers |

Supplementary primary corroboration, not included in quantitative measurements: [Microservices](https://martinfowler.com/articles/microservices.html) (2014-03-25); [Design Stamina Hypothesis](https://martinfowler.com/bliki/DesignStaminaHypothesis.html) (2007-06-20); [Refactoring](https://martinfowler.com/books/refactoring.html) (2018); [Original Strangler Fig Application](https://martinfowler.com/bliki/OriginalStranglerFigApplication.html) (2004-06-29); [What Is a Bliki](https://martinfowler.com/bliki/WhatIsaBliki.html) (2003-05-26); [Fluent Interface](https://martinfowler.com/bliki/FluentInterface.html) (2005-12-20); [Microservice Premium](https://martinfowler.com/bliki/MicroservicePremium.html) (2015-05-13); [About Martin Fowler](https://martinfowler.com/aboutMe.html) (undated); and [Etymology of Refactoring](https://martinfowler.com/bliki/EtymologyOfRefactoring.html) (2003-09-10). All are Fowler-authored first-party pages used only for qualitative cross-checking.
