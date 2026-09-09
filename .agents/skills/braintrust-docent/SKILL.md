---
name: braintrust-docent
description: Bridge Braintrust runtime tracing logs to Docent collections for qualitative inspection, failure mode clustering, and Socratic fidelity auditing. Use when analyzing agent failure modes, syncing traces to Docent, or auditing pedagogical interventions.
---

# Braintrust to Docent Qualitative Bridge

Use this skill to connect **Braintrust runtime tracing** with **Docent qualitative analysis**. Braintrust acts as the production flight recorder capturing raw spans, metadata, and tool executions. Docent provides transcript-level multi-run inspection, interactive semantic clustering, and error taxonomy visualization.

This skill operates strictly as an offline operator tool. It does not introduce runtime dependencies into the Socratink TypeScript engine and does not make claims of learner mastery or learning effectiveness.

## Authority & Boundaries

| Tool | Role & Authority |
| --- | --- |
| **Braintrust** | Ground-truth flight recorder: captures every span, turn, tool call, error, and latency measurement from live or smoke runs. |
| **Docent** | Offline qualitative workbench: groups spans into conversational sessions, renders human-readable transcripts, and clusters failure modes. |
| **Socratink Core** (`src/`) | Standalone TypeScript application runtime. Never import Python or Docent packages into `src/`. |

Neither Braintrust traces nor Docent semantic clusters constitute scientific proof of learner mastery. Evaluations assess agent behavioral compliance, not learner cognitive state.

## Prerequisites

1. **Braintrust API key**: Located in `.env.braintrust` or exported as `BRAINTRUST_API_KEY`.
2. **Docent API key**: Located in `~/.docent/docent.env` or exported as `DOCENT_API_KEY`.
3. **Python Environment**: Local virtual environment containing `docent` (`>=0.1.84`) and `requests` (located at `.venv/bin/python`).

## Workflows

All operations run via `.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py`.

### 1. Verify Connectivity

Test authentication and API connectivity to both Braintrust and Docent before performing synchronization or analysis:

```bash
.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py verify
```

**Completion criterion**: Both Braintrust and Docent report `✓ Connection OK` with active project ID and collection counts.

### 2. Ingest / Sync Traces to Docent

Pull recorded spans from a Braintrust project, reconstruct multi-turn conversation sessions (`AgentRun` with `Transcript`, `UserMessage`, `AssistantMessage`, `ToolMessage`, and reasoning blocks), and upload them to Docent:

```bash
# Dry run preview (transforms without uploading)
.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py sync --limit 50 --dry-run

# Upload to a new dated collection
.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py sync --project socratink --limit 500

# Append to an existing Docent collection
.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py sync --collection-id <collection_uuid>
```

**Completion criterion**: Terminal outputs the Docent dashboard URL (`https://docent.transluce.org/dashboard/<collection_id>`) and confirms upload status.

### 3. Analyze Failure Modes

Fetch recent traces from Braintrust and cluster them by root cause (client aborts, tool schema validation errors, token limits, provider cascade timeouts):

```bash
# Analyze recent failure modes across the last 1000 spans
.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py analyze --limit 1000

# Analyze failures within the last 7 days
.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py analyze --days 7
```

**Common Prevalent Clusters**:
- **Session/Client Abort & Preemption**: Flue `AbortError` caused by turn preemption when users re-submit during high model latency.
- **Tool Argument Schema Violation**: Model emitting JSON strings instead of arrays or invalid enum values.
- **Context Length Overflow**: `max_tokens` parameter exceeding provider token context limits.
- **Provider Failover Exhaustion**: Rate limits or expired credentials cascading through fallback providers.

**Completion criterion**: Terminal outputs a structured breakdown of failure categories with impacted conversation IDs and root-cause error messages.

### 4. Audit Socratic Pedagogical Fidelity

Evaluate whether agent runs adhere to Socratink's pedagogical guidelines (avoiding premature reveals, using interactive question cards instead of raw text, and minimizing single-turn bounce rates):

```bash
.venv/bin/python .agents/skills/braintrust-docent/scripts/bridge.py audit --limit 1000
```

**Tracked Metrics**:
- **Single-turn bounce rate**: Target < 40%. High rates indicate generic greetings lacking Socratic hooks.
- **Question card adoption (`present_question`)**: Target > 30% of multi-turn sessions. Low rates indicate the agent is listing text options directly.
- **Answer reveal tracking (`mark_reveal`)**: Breakdown of reveals by kind (`answer`, `hint`, `summary`) to detect capitulation under learner pushback.

**Completion criterion**: Terminal displays audit metrics and PASS/WARN heuristic assessments.
