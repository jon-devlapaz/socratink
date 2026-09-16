# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: adults facing consequential performance demands in difficult technical or academic material — "stakes learners" preparing for exams, certifications, systems architecture, or professional performance where guessing fails.

Subtypes:
- Self-directed technical learners mastering complex formal domains (systems programming, mathematics, ML).
- Certification and professional candidates (medical boards, legal outlines, cloud/security certifications).
- Practicing engineers and scientists acquiring hard, unfamiliar bodies of knowledge.

Job to be done: Build and verify durable mental models through unassisted cognitive effort. The learner needs a partner that refuses to autocomplete the answer, forces effortful retrieval, and diagnoses the exact conceptual gap.

## Product Purpose

Socratink is a model-backed Socratic dialogue application that refuses to do the thinking for the learner. It makes the learner do the cognitive synthesis, diagnoses misconceptions, and preserves assistance provenance.

Epistemic Invariants:
- Exposure is not evidence.
- Immediate performance is not durable learning.
- Learner-authored work is the sole evidence of understanding.

## Positioning

The learning engine that refuses to autocomplete your thinking:
- **Refusal to autocomplete:** Asks the learner to formulate axioms, trace steps, and defend solutions before revealing content.
- **Voice-first deliberation:** Low-latency conversational dialogue tuned to listen for genuine understanding vs. regurgitated jargon.
- **Desirable difficulty:** Grounded in cognitive science (Bjork framework); difficulty during retrieval cements long-term consolidation.
- **Privacy & Sovereignty:** Zero tracking cookies, sovereign session records, and zero model training on learner sessions.

Tagline: "The learning engine that refuses to do the thinking for you."
Cadence: "You think · One teacher · It stays."

## Operating Context

The dialogue workflow:
1. **Target Formulation:** The learner states the problem, proof, or question they are working through.
2. **Unaided Synthesis:** The engine requires an initial attempt or self-explanation before providing hints.
3. **Targeted Repair:** When confusion arises, the engine repairs the smallest missing distinction rather than dumping the full solution.
4. **Interactive Diagnostics:** Uses structured `present_question` cards for decisive branch points and self-reflection.

## Capabilities and Constraints

Confirmed capabilities:
- Real-time streaming conversational dialogue powered by Hono and Flue agent runtime.
- Interactive questionnaire cards (`present_question`) mounted in-stream.
- Voice dictation with real-time audio analysis and visual reactivity.
- Living ink fluid droplet (`.alive-core`) reflecting conversational states (`question`, `thinking`, `speaking`).
- Sovereign privacy architecture: cookieless, no analytics tracking, portable export.

Durable constraints:
- Language must never exceed available evidence (DEC-0003); no manufactured mastery scores or fake progress bars.
- No unsolicited answer dumps: assistance must match learner footing.
- WebGL living ink loop must throttle to idle when the learner is reading or inactive.

## Brand Commitments
- Name: Socratink. Pronunciation: "so-cre-tink" (`soʊ krə tɪŋk`).
- Tagline: "The learning engine that refuses to do the thinking for you."
- Aesthetic Direction: **Socratink Yohaku (余白)** — washi paper, sumi carbon ink, solitary jade accent (#1f7a72 / #3aa99f), generous whitespace, scholarly restraint.
