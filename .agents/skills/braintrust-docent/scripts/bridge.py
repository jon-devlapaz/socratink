#!/usr/bin/env python3
"""Bridge Braintrust runtime tracing logs to Docent for qualitative analysis.

Provides commands to:
  1. verify: Test connection and authentication to both Braintrust and Docent.
  2. sync: Pull Braintrust traces and ingest into a Docent collection.
  3. analyze: Cluster failure modes (runtime aborts, schema errors, provider timeouts).
  4. audit: Evaluate Socratic pedagogical adherence (present_question usage, reveals).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections import Counter, defaultdict
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

# Resolve repo root
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[3]


def _resolve_venv_python() -> Path:
    venv_py = REPO_ROOT / ".venv" / "bin" / "python"
    return venv_py if venv_py.exists() else Path(sys.executable)


def _load_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    res: dict[str, str] = {}
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            res[key.strip()] = val.strip().strip("'\"")
    except Exception:
        pass
    return res


def get_braintrust_credentials() -> tuple[str | None, str]:
    bt_env = _load_env_file(REPO_ROOT / ".env.braintrust")
    if not bt_env:
        bt_env = _load_env_file(REPO_ROOT / ".env")
    key = os.environ.get("BRAINTRUST_API_KEY") or bt_env.get("BRAINTRUST_API_KEY")
    project = (
        os.environ.get("BRAINTRUST_PROJECT_NAME")
        or bt_env.get("BRAINTRUST_PROJECT_NAME")
        or "socratink"
    )
    return key, project


def get_docent_credentials() -> tuple[str | None, str]:
    docent_env_file = Path.home() / ".docent" / "docent.env"
    docent_env = _load_env_file(docent_env_file)
    key = os.environ.get("DOCENT_API_KEY") or docent_env.get("DOCENT_API_KEY")
    url = (
        os.environ.get("DOCENT_API_URL")
        or docent_env.get("DOCENT_API_URL")
        or "https://api.docent.transluce.org/rest"
    )
    return key, url


def get_span_name(span: dict[str, Any]) -> str:
    attrs = span.get("span_attributes") or {}
    return attrs.get("name") or span.get("name") or "unknown"


def extract_text_from_content(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for b in content:
            if isinstance(b, dict):
                if b.get("type") == "text":
                    parts.append(b.get("text", ""))
                elif "content" in b:
                    parts.append(extract_text_from_content(b["content"]))
            elif isinstance(block := b, str):
                parts.append(block)
        return "\n".join(p for p in parts if p)
    if isinstance(content, dict):
        if content.get("type") == "text":
            return content.get("text", "")
        if "content" in content:
            return extract_text_from_content(content["content"])
    return str(content) if content is not None else ""


def fetch_braintrust_spans(
    api_key: str, project_name: str, limit: int = 1000, days: int | None = None
) -> list[dict[str, Any]]:
    import requests

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # Resolve project ID
    res = requests.get(
        f"https://api.braintrust.dev/v1/project?project_name={project_name}",
        headers=headers,
        timeout=15,
    )
    if res.status_code != 200:
        raise RuntimeError(f"Failed to lookup Braintrust project '{project_name}': {res.text}")

    projects = res.json().get("objects", [])
    if not projects:
        raise RuntimeError(f"No Braintrust project found with name '{project_name}'.")

    project_id = projects[0]["id"]

    query = f"select: * from: project_logs('{project_id}')"
    if days:
        cutoff = (datetime.now(UTC) - timedelta(days=days)).isoformat()
        query += f" filter: created >= '{cutoff}'"
    query += f" limit: {limit}"

    btql_res = requests.post(
        "https://api.braintrust.dev/btql",
        headers=headers,
        json={"query": query},
        timeout=30,
    )
    if btql_res.status_code != 200:
        raise RuntimeError(f"BTQL query failed: {btql_res.text}")

    data = btql_res.json().get("data", [])
    return data


def group_spans_into_conversations(
    spans: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    by_conv: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for s in spans:
        meta = s.get("metadata") or {}
        cid = meta.get("flue.conversation_id") or f"trace_{s.get('root_span_id') or s.get('id')}"
        by_conv[cid].append(s)

    for cid in by_conv:
        by_conv[cid].sort(key=lambda s: str(s.get("created", "")))
    return by_conv


def build_docent_agent_runs(by_conv: dict[str, list[dict[str, Any]]]) -> list[Any]:
    from docent.data_models import AgentRun, Transcript
    from docent.data_models.chat import (
        AssistantMessage,
        ContentReasoning,
        ContentText,
        ToolCall,
        ToolMessage,
        UserMessage,
    )

    agent_runs = []

    for cid, c_spans in by_conv.items():
        models = set()
        tools_used = set()
        errors = []
        has_error = False

        for s in c_spans:
            meta = s.get("metadata") or {}
            if meta.get("flue.model"):
                models.add(meta["flue.model"])
            if meta.get("flue.tool_name"):
                tools_used.add(meta["flue.tool_name"])
            err = s.get("error")
            if err:
                has_error = True
                errors.append({"span": get_span_name(s), "error": err})

        flue_turns = [s for s in c_spans if get_span_name(s) == "flue.turn"]
        tool_spans_by_id = {}
        for s in c_spans:
            if get_span_name(s).startswith("tool:"):
                meta = s.get("metadata") or {}
                call_id = meta.get("flue.tool_call_id") or s.get("id")
                tool_spans_by_id[call_id] = s

        messages = []

        if flue_turns:
            for i, turn in enumerate(flue_turns):
                turn_inp = turn.get("input")
                turn_out = turn.get("output")
                turn_err = turn.get("error")

                if i == 0 and isinstance(turn_inp, list):
                    for m in turn_inp:
                        if not isinstance(m, dict):
                            continue
                        m_role = m.get("role")
                        m_txt = extract_text_from_content(m.get("content", ""))
                        if m_role == "user" and m_txt:
                            messages.append(UserMessage(content=m_txt))
                        elif m_role == "assistant" and m_txt:
                            messages.append(AssistantMessage(content=[ContentText(text=m_txt)]))
                else:
                    if isinstance(turn_inp, list) and turn_inp:
                        last_m = turn_inp[-1]
                        if isinstance(last_m, dict) and last_m.get("role") == "user":
                            m_txt = extract_text_from_content(last_m.get("content", ""))
                            if m_txt and (not messages or messages[-1].content != m_txt):
                                messages.append(UserMessage(content=m_txt))

                if turn_out:
                    raw_content = (
                        turn_out.get("content") if isinstance(turn_out, dict) else turn_out
                    )
                    c_items: list[Any] = []
                    t_calls: list[ToolCall] = []

                    if isinstance(raw_content, str) and raw_content.strip():
                        c_items.append(ContentText(text=raw_content))
                    elif isinstance(raw_content, list):
                        for item in raw_content:
                            if not isinstance(item, dict):
                                continue
                            itype = item.get("type")
                            if itype == "text":
                                txt = item.get("text", "")
                                if txt:
                                    c_items.append(ContentText(text=txt))
                            elif itype in ("thinking", "reasoning"):
                                r_text = item.get("thinking") or item.get("reasoning") or ""
                                if r_text:
                                    c_items.append(ContentReasoning(reasoning=r_text))
                            elif itype == "tool_use" or "arguments" in item:
                                call_id = item.get("id") or item.get("call_id") or "call_unknown"
                                fn = item.get("name") or item.get("function") or "tool"
                                args = item.get("arguments") or item.get("input") or {}
                                if isinstance(args, str):
                                    try:
                                        args = json.loads(args)
                                    except Exception:
                                        args = {"raw": args}
                                t_calls.append(
                                    ToolCall(
                                        id=call_id,
                                        function=fn,
                                        arguments=args
                                        if isinstance(args, dict)
                                        else {"value": args},
                                        type="function",
                                    )
                                )

                    if isinstance(turn_out, dict) and "tool_calls" in turn_out:
                        for tc in turn_out["tool_calls"]:
                            fn = (
                                (tc.get("function") or {}).get("name")
                                if isinstance(tc.get("function"), dict)
                                else tc.get("function")
                            )
                            args = (
                                (tc.get("function") or {}).get("arguments")
                                if isinstance(tc.get("function"), dict)
                                else tc.get("arguments")
                            )
                            if isinstance(args, str):
                                try:
                                    args = json.loads(args)
                                except Exception:
                                    args = {"raw": args}
                            t_calls.append(
                                ToolCall(
                                    id=tc.get("id", "call_unknown"),
                                    function=fn or "tool",
                                    arguments=args or {},
                                    type="function",
                                )
                            )

                    if not c_items and not t_calls:
                        c_items = [ContentText(text=str(turn_out))]

                    messages.append(
                        AssistantMessage(
                            content=c_items if c_items else "",
                            tool_calls=t_calls if t_calls else None,
                            model=turn.get("metadata", {}).get("flue.model"),
                        )
                    )

                    for tc in t_calls:
                        t_span = tool_spans_by_id.get(tc.id)
                        tool_content = "Tool executed successfully"
                        tool_error = None
                        if t_span:
                            tool_out = t_span.get("output")
                            tool_err = t_span.get("error")
                            if tool_out is not None:
                                tool_content = (
                                    json.dumps(tool_out)
                                    if not isinstance(tool_out, str)
                                    else tool_out
                                )
                            if tool_err:
                                tool_error = {"message": str(tool_err)}
                        messages.append(
                            ToolMessage(
                                content=tool_content,
                                tool_call_id=tc.id,
                                function=tc.function,
                                error=tool_error,
                            )
                        )
                elif turn_err:
                    messages.append(
                        AssistantMessage(
                            content=[ContentText(text=f"[Error: {turn_err}]")],
                            model=turn.get("metadata", {}).get("flue.model"),
                        )
                    )
        else:
            for s in c_spans:
                sinp = s.get("input")
                sout = s.get("output")
                serr = s.get("error")
                if sinp:
                    txt = extract_text_from_content(sinp)
                    if txt:
                        messages.append(UserMessage(content=txt))
                if sout:
                    txt = extract_text_from_content(sout)
                    if txt:
                        messages.append(AssistantMessage(content=[ContentText(text=txt)]))
                if serr:
                    messages.append(
                        AssistantMessage(content=[ContentText(text=f"[Error: {serr}]")])
                    )

        if not messages:
            messages.append(UserMessage(content="[Empty conversation]"))

        run = AgentRun(
            name=cid,
            description=f"Socratink conversation {cid} with {len(c_spans)} spans",
            transcripts=[Transcript(messages=messages, metadata={"span_count": len(c_spans)})],
            metadata={
                "conversation_id": cid,
                "models": list(models),
                "tools_used": list(tools_used),
                "has_error": has_error,
                "error_count": len(errors),
                "errors": errors,
                "span_count": len(c_spans),
                "flue_turn_count": len(flue_turns),
                "created_at": c_spans[0].get("created"),
            },
        )
        agent_runs.append(run)

    return agent_runs


# ─────────────────────────────────────────────────────────────────────────────
# Subcommands
# ─────────────────────────────────────────────────────────────────────────────


def cmd_verify(args: argparse.Namespace) -> int:
    """Verify Braintrust and Docent authentication and environment health."""
    print("=== Checking Braintrust & Docent Environment ===")

    # Braintrust
    bt_key, bt_project = get_braintrust_credentials()
    print(f"Braintrust API key present: {bool(bt_key)}")
    print(f"Braintrust project: {bt_project}")

    if bt_key:
        import requests

        try:
            res = requests.get(
                f"https://api.braintrust.dev/v1/project?project_name={bt_project}",
                headers={"Authorization": f"Bearer {bt_key}"},
                timeout=10,
            )
            if res.status_code == 200:
                projects = res.json().get("objects", [])
                if projects:
                    pid = projects[0]["id"]
                    print(f"✓ Braintrust connection OK. Project ID: {pid}")
                    cnt_res = requests.post(
                        "https://api.braintrust.dev/btql",
                        headers={
                            "Authorization": f"Bearer {bt_key}",
                            "Content-Type": "application/json",
                        },
                        json={"query": f"select: count(*) from: project_logs('{pid}')"},
                        timeout=10,
                    )
                    if cnt_res.status_code == 200:
                        count = cnt_res.json().get("data", [{}])[0].get("count(*)", 0)
                        print(f"  Total logged spans in project: {count}")
                else:
                    print(f"! Project '{bt_project}' not found in Braintrust organization.")
            else:
                print(f"✗ Braintrust auth failed (HTTP {res.status_code}): {res.text[:120]}")
        except Exception as e:
            print(f"✗ Error connecting to Braintrust: {e}")
    else:
        print("✗ No BRAINTRUST_API_KEY found in environment or .env.braintrust")

    # Docent
    docent_key, docent_url = get_docent_credentials()
    print(f"\nDocent API key present: {bool(docent_key)}")
    print(f"Docent API URL: {docent_url}")

    if docent_key:
        from docent import Docent

        try:
            client = Docent(api_key=docent_key)
            collections = client.list_collections()
            print(f"✓ Docent connection OK. Active collections: {len(collections)}")
            for col in collections[:5]:
                print(f"  - {col.get('name')} ({col.get('id')})")
        except Exception as e:
            print(f"✗ Error connecting to Docent: {e}")
    else:
        print("✗ No DOCENT_API_KEY found in environment or ~/.docent/docent.env")

    return 0


def cmd_sync(args: argparse.Namespace) -> int:
    """Pull traces from Braintrust and ingest into a Docent collection."""
    bt_key, default_project = get_braintrust_credentials()
    docent_key, _ = get_docent_credentials()

    if not bt_key:
        print("Error: BRAINTRUST_API_KEY is required.", file=sys.stderr)
        return 1
    if not docent_key and not args.dry_run:
        print("Error: DOCENT_API_KEY is required.", file=sys.stderr)
        return 1

    project = args.project or default_project
    print(f"Fetching up to {args.limit} spans from Braintrust project '{project}'...")
    spans = fetch_braintrust_spans(bt_key, project, limit=args.limit, days=args.days)
    print(f"Retrieved {len(spans)} spans from Braintrust.")

    by_conv = group_spans_into_conversations(spans)
    print(f"Grouped into {len(by_conv)} conversations/sessions.")

    agent_runs = build_docent_agent_runs(by_conv)
    print(f"Constructed {len(agent_runs)} Docent AgentRun objects.")

    if args.dry_run:
        if not agent_runs:
            print("\n[DRY RUN] Ingestion skipped: No AgentRuns constructed from traces.")
            return 0
        print("\n[DRY RUN] Ingestion skipped. Sample AgentRun preview:")
        sample = agent_runs[0]
        print(f"  Name: {sample.name}")
        print(f"  Messages: {len(sample.transcripts[0].messages)}")
        print(f"  Metadata: {json.dumps(sample.metadata, default=str)}")
        return 0

    if not agent_runs:
        print("No AgentRuns to upload.")
        return 0

    from docent import Docent

    client = Docent(api_key=docent_key)

    collection_id = args.collection_id
    if not collection_id:
        name = args.collection_name or f"Socratink - {project} ({datetime.now(UTC):%Y-%m-%d})"
        desc = f"Ingested from Braintrust project '{project}'. {len(agent_runs)} conversations, {len(spans)} spans."
        print(f"Creating new Docent collection: '{name}'...")
        collection_id = client.create_collection(
            name=name,
            description=desc,
            metadata={"source": "braintrust", "project": project, "spans": len(spans)},
        )
        print(f"Created collection ID: {collection_id}")

    print(f"Uploading {len(agent_runs)} AgentRuns to collection '{collection_id}'...")
    result = client.add_agent_runs(collection_id=collection_id, agent_runs=agent_runs, wait=True)

    dash_url = client._collection_dashboard_url(collection_id)  # pyright: ignore[reportPrivateUsage]
    print("\n✓ Ingestion complete!")
    print(f"Collection Dashboard: {dash_url}")
    print(f"Upload Status: {result.get('status')}")
    return 0


def cmd_analyze(args: argparse.Namespace) -> int:
    """Analyze and cluster failure modes across Braintrust traces."""
    bt_key, default_project = get_braintrust_credentials()
    if not bt_key:
        print("Error: BRAINTRUST_API_KEY is required.", file=sys.stderr)
        return 1

    project = args.project or default_project
    print(f"Fetching traces from Braintrust project '{project}' for failure analysis...")
    spans = fetch_braintrust_spans(bt_key, project, limit=args.limit, days=args.days)
    by_conv = group_spans_into_conversations(spans)

    categories: dict[str, list[dict[str, Any]]] = defaultdict(list)
    total_turns = 0
    total_errors = 0

    for cid, c_spans in by_conv.items():
        flue_turns = [s for s in c_spans if get_span_name(s) == "flue.turn"]
        total_turns += len(flue_turns)

        errors = [s.get("error") for s in c_spans if s.get("error")]
        if errors:
            total_errors += len(errors)
            err_text = " ".join(str(e) for e in errors)
            if (
                "AbortError" in err_text
                or "Request aborted" in err_text
                or "Request was aborted" in err_text
            ):
                categories["Session/Client Abort & Preemption"].append(
                    {"cid": cid, "errors": errors, "spans": c_spans}
                )
            elif "Validation failed for tool" in err_text or "must be array" in err_text:
                categories["Tool Argument Schema Violation"].append(
                    {"cid": cid, "errors": errors, "spans": c_spans}
                )
            elif (
                "exceeds the model's context length" in err_text
                or "Requested output tokens" in err_text
            ):
                categories["Context Length / max_tokens Overflow"].append(
                    {"cid": cid, "errors": errors, "spans": c_spans}
                )
            elif (
                "out_of_credits" in err_text
                or "upstream provider errors" in err_text
                or "rate-limited" in err_text
            ):
                categories["Provider Failover Exhaustion & Rate Limits"].append(
                    {"cid": cid, "errors": errors, "spans": c_spans}
                )
            else:
                categories["Unclassified Runtime Error"].append(
                    {"cid": cid, "errors": errors, "spans": c_spans}
                )

    if not by_conv:
        print(f"\nNo conversations found in project '{project}' matching criteria.")
        return 0

    print("\n=======================================================")
    print(f"  FAILURE MODE ANALYSIS REPORT ({project})")
    print(f"  Analyzed {len(by_conv)} conversations, {len(spans)} spans, {total_turns} turns")
    print(f"  Conversations with errors: {sum(len(v) for v in categories.values())}")
    print("=======================================================")

    if not categories:
        print("\n✓ No errors found across analyzed conversations.")
        return 0

    for cat_name, items in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"\n▶ {cat_name} ({len(items)} conversations)")
        for item in items[:4]:
            cid = item["cid"]
            err_msg = str(item["errors"][0])[:120].replace("\n", " ")
            print(f"    • [{cid}] {err_msg}")
        if len(items) > 4:
            print(f"    ... and {len(items) - 4} more")

    return 0


def cmd_audit(args: argparse.Namespace) -> int:
    """Audit Socratic intervention fidelity across conversations."""
    bt_key, default_project = get_braintrust_credentials()
    if not bt_key:
        print("Error: BRAINTRUST_API_KEY is required.", file=sys.stderr)
        return 1

    project = args.project or default_project
    print(f"Fetching traces from '{project}' to audit Socratic adherence...")
    spans = fetch_braintrust_spans(bt_key, project, limit=args.limit, days=args.days)
    by_conv = group_spans_into_conversations(spans)

    conv_count = len(by_conv)
    if conv_count == 0:
        print(f"\nNo conversations found in project '{project}' matching criteria.")
        return 0

    single_turn = 0
    with_pq = 0
    with_reveal = 0
    reveal_kinds = Counter()

    for cid, c_spans in by_conv.items():
        flue_turns = [s for s in c_spans if get_span_name(s) == "flue.turn"]
        tool_spans = [s for s in c_spans if get_span_name(s).startswith("tool:")]

        if len(flue_turns) <= 1:
            single_turn += 1

        has_pq = any(get_span_name(s) == "tool:present_question" for s in tool_spans)
        if has_pq:
            with_pq += 1

        reveals = [s for s in tool_spans if get_span_name(s) == "tool:mark_reveal"]
        if reveals:
            with_reveal += 1
            for r in reveals:
                kind = (r.get("input") or {}).get("kind") or "unknown"
                reveal_kinds[kind] += 1

    print("\n=======================================================")
    print(f"  SOCRATIC INTERVENTION FIDELITY AUDIT ({project})")
    print(f"  Total conversations analyzed: {conv_count}")
    print("=======================================================")
    print(f"• Single-turn bounce rate: {single_turn} / {conv_count} ({single_turn/conv_count*100:.1f}%)")
    print(f"• Question card usage (present_question): {with_pq} / {conv_count} ({with_pq/conv_count*100:.1f}%)")
    print(f"• Answer reveal count (mark_reveal): {with_reveal} / {conv_count} ({with_reveal/conv_count*100:.1f}%)")
    if reveal_kinds:
        print("  Breakdown of reveals by kind:")
        for k, v in reveal_kinds.items():
            print(f"    - {k}: {v}")

    print("\nAuditing Heuristics:")
    if single_turn / conv_count > 0.40:
        print("  [WARN] Single-turn drop-off > 40%. Check for generic greetings without Socratic hooks.")
    if with_pq / conv_count < 0.30:
        print("  [WARN] present_question used in < 30% of conversations. Agent may be listing text options.")
    else:
        print("  [PASS] present_question adoption is active across conversations.")

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Bridge Braintrust traces to Docent")
    subparsers = parser.add_subparsers(dest="subcommand", required=True)

    # verify
    subparsers.add_parser("verify", help="Check Braintrust and Docent connections")

    # sync
    sync_parser = subparsers.add_parser("sync", help="Sync Braintrust traces into Docent")
    sync_parser.add_argument("--project", help="Braintrust project name (default: from env or socratink)")
    sync_parser.add_argument("--collection-id", help="Existing Docent collection ID to add runs to")
    sync_parser.add_argument("--collection-name", help="Custom name for a new Docent collection")
    sync_parser.add_argument("--limit", type=int, default=1000, help="Max spans to fetch from Braintrust")
    sync_parser.add_argument("--days", type=int, help="Limit fetch to traces from the past N days")
    sync_parser.add_argument("--dry-run", action="store_true", help="Transform without uploading to Docent")

    # analyze
    analyze_parser = subparsers.add_parser("analyze", help="Cluster failure modes across Braintrust traces")
    analyze_parser.add_argument("--project", help="Braintrust project name")
    analyze_parser.add_argument("--limit", type=int, default=1000, help="Max spans to analyze")
    analyze_parser.add_argument("--days", type=int, help="Limit to past N days")

    # audit
    audit_parser = subparsers.add_parser("audit", help="Audit Socratic intervention fidelity")
    audit_parser.add_argument("--project", help="Braintrust project name")
    audit_parser.add_argument("--limit", type=int, default=1000, help="Max spans to audit")
    audit_parser.add_argument("--days", type=int, help="Limit to past N days")

    args = parser.parse_args()

    if args.subcommand == "verify":
        return cmd_verify(args)
    elif args.subcommand == "sync":
        return cmd_sync(args)
    elif args.subcommand == "analyze":
        return cmd_analyze(args)
    elif args.subcommand == "audit":
        return cmd_audit(args)
    return 1


if __name__ == "__main__":
    sys.exit(main())
