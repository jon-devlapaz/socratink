# Phase 5 — Agent A: Auto-skill optimizer review

**Scope:** Read-only review of `../SKILL.md`, Phase 4 validation, synthesis, and the LearnVector evidence record. Line numbers below are local-file line numbers at review time.

## Scorecard

| Dimension | Score | Concrete evidence | Finding |
|---|---:|---|---|
| Workflow clarity | 5/5 | `SKILL.md:33-41`, `88-112` | Classification, research reduction, and answer sequence make the execution order legible. |
| Boundary conditions | 5/5 | `15-25`, `282-290` | Identity, quotation, competitive-conduct, current-fact, and pedagogy boundaries are unusually explicit. |
| Checkpoint / decision design | 5/5 | `49-62`, `103-112`, `199-207` | Requires falsifiers, baseline, guardrail, revision trigger, kill criterion, and separate learner/business scoreboards. |
| Instruction specificity | 4/5 | `47-86`, `105-112` | Five research tracks give concrete checks; “when practical” leaves evidence presentation discretionary. |
| Evidence routing | 4/5 | `37-41`, `57-62`, `90-99` | Correctly routes current facts to live research and separates facts, positions, external evidence, unknowns, and inference. It could say more specifically how to assess a newly published study. |
| Failure prevention | 5/5 | `19-25`, `74-78`, `249-259` | Directly blocks fabricated attribution, stale competitor claims, unsafe competition, answer-giving, and business/learning conflation. |
| Output consistency | 3/5 | `20`, `99`, `103-112` | The output shape is strong, but the evidence labels are conditional (“whenever mixing … could mislead”); a fact-dependent answer can therefore omit source status or cutoff. |
| Portability / self-containment | 3/5 | `16`, `22`, `294-310` | The source inventory travels with the skill, but “first activation only” assumes state that a fresh invocation may not have; live-research availability is not given a portable fallback beyond a general unknown statement. |

## Dry runs

### 1. Competitive startup strategy against LearnVector

**Expected route:** mixed question → live-verify LearnVector facts → tracks A–E → competitive-learning contract.

**Result: PASS.** The skill correctly starts with the learner’s existing alternative rather than feature-parity speculation (`37-41`, `86`, `199`, `206-207`). It forces separately reported learner and business outcomes (`57-62`, `200-205`), so funding, enrollment, distribution, and engagement cannot masquerade as proof of learning (`31`, `85`, `254`). This matches the research record: LearnVector remains announcements/plans rather than product or efficacy evidence (`research/06-timeline.md:56-69`).

### 2. Interpreting a new learning-outcomes study

**Expected route:** fact-dependent → obtain the paper/study record live → track B → distinguish study result from framework inference and brief constraints.

**Result: PASS WITH MINOR ROUTING GAP.** Track B asks for matching baseline conditions, subgroup/failure slices, independence/conflicts, duration, and representativeness (`57-62`), which should catch engagement-for-learning substitution. It does not explicitly require locating the primary paper, preregistration/protocol, sample/attrition, or comparator before summarizing a study. The current rule nevertheless prevents treating an unaudited headline as a settled result because it mandates live research (`37-41`).

### 3. Current fact-dependent LearnVector question

**Prompt:** “Has LearnVector released its first product, and does it have Coursera learner data?”

**Expected route:** live research before answer; return `Verified fact`/`Unknown`, not a static-skill answer.

**Result: PASS.** The skill marks company questions fact-dependent (`37`), requires live verification and narrowing when unavailable (`41`), prohibits static-skill use for current LearnVector facts (`22`), and prohibits inferring data rights (`23`, `67`). The documented snapshot independently confirms that no released product or data-sharing agreement was located at the cutoff (`research/06-timeline.md:63-67`); it must not be represented as current without live checking.

## Adversarial findings

- **No blocking contradiction.** “Use I” is limited by non-identity, no-endorsement, and no-commercial-name-use rules (`15-17`, `287`). It remains a roleplay hazard only if a caller strips those rules.
- **No impossible research requirement.** The instruction allows a narrow `Unknown` answer when verification is unavailable (`41`).
- **Overlong-output pressure is controlled.** The detailed research reduction is private and the user gets a judgment rather than a search log (`88-99`); Step 3 limits unpacking to two-to-four consequences (`107-112`).
- **Stale-fact risk is explicitly recognized but presentation can improve.** Snapshot claims at `238-243` are dated and `289` says to recheck; a fact-dependent response still needs a visible freshness/source cue.
- **Learning-evidence integrity holds.** The contract separates scoreboards and predeclares decision gates (`200-205`); nothing permits business metrics to establish mastery.

## Exactly two weakest dimensions and minimal patches

### 1. Output consistency — optional, non-blocking

**Issue:** A current or mixed answer can comply with research rules yet omit whether a key assertion is a verified fact, an announcement, or unknown.

**Insertion location:** Add after `SKILL.md:110` (after “Name what evidence would change the answer.”).

**Addition text:**

> - For any fact-dependent or mixed answer, prefix each decision-relevant claim with its evidence class (`Verified fact`, `Andrew said`, `External evidence`, `Framework inference`, `Brief constraint`, or `Unknown`) and give one compact source/date or state that live verification was unavailable.

### 2. Portability / self-containment — optional, non-blocking

**Issue:** “On first activation only” relies on session history that may not be available to an isolated invocation.

**Replacement location:** Replace `SKILL.md:16`.

**Replacement text:**

> - If this conversation has not already displayed the perspective disclaimer, say once: “I’ll use an Andrew Ng perspective distilled from public work—not claim to speak for him.” If prior conversation state is unavailable, include it rather than guessing; do not repeat it after it appears in the visible conversation.

## Verdict

**PASS WITH PATCHES.** No blocking flaw was found. The two optional patches make evidence status and first-activation behavior more deterministic without changing the framework or adding output bulk.
