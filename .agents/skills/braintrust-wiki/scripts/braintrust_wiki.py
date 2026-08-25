#!/usr/bin/env python3
"""Read-only lexical interface to the braintrust-obsidian-wiki vault."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys


VAULT_NAME = "braintrust-obsidian-wiki"
TITLE = re.compile(r'(?m)^title:\s*"?([^"\n]+)"?\s*$')
TOPIC_HINTS = (
    ("trace", "Docs/Instrument/Trace Llm Calls.md"),
    ("instrument", "Docs/Instrument/Home.md"),
    ("observe", "Docs/Observe/Home.md"),
    ("annotate", "Docs/Annotate/Home.md"),
    ("eval", "Docs/Evaluate/Home.md"),
    ("score", "Docs/Evaluate/Write Scorers.md"),
    ("deploy", "Docs/Deploy/Home.md"),
    ("gateway", "Docs/Deploy/Gateway.md"),
    ("sdk", "Docs/Sdks/Home.md"),
    ("api", "Docs/Api Reference/Home.md"),
)
READ_NOW = (
    ("Home.md", "vault-identity"),
    ("Docs/Workflow.md", "product-workflow"),
    ("Docs/Instrument/Home.md", "tracing"),
    ("Docs/Evaluate/Home.md", "evaluation"),
    ("_meta/Validation Report.md", "snapshot-status"),
)


def is_vault(path: Path) -> bool:
    return (path / "Home.md").is_file() and (path / "Docs").is_dir() and (
        path / "_meta/upstream-state.json"
    ).is_file()


def git_root(path: Path) -> Path | None:
    result = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=path, capture_output=True, text=True)
    return Path(result.stdout.strip()) if result.returncode == 0 else None


def locate(explicit: str | None) -> Path:
    if explicit:
        candidate = Path(explicit).expanduser()
        if is_vault(candidate):
            return candidate.resolve()
        raise SystemExit(f"Explicit --wiki path is not a Braintrust vault: {candidate}")
    configured = os.environ.get("BRAINTRUST_WIKI_PATH")
    if configured:
        candidate = Path(configured).expanduser()
        if is_vault(candidate):
            return candidate.resolve()
        raise SystemExit(f"BRAINTRUST_WIKI_PATH is not a Braintrust vault: {candidate}")
    cwd = Path.cwd().resolve()
    candidates = [cwd, cwd / VAULT_NAME, Path(__file__).resolve().parents[3] / VAULT_NAME]
    root = git_root(Path.cwd())
    if root:
        candidates.extend([root / VAULT_NAME, root.parent / VAULT_NAME])
    # A documentation vault commonly lives beside active repositories in a
    # shared ``doc-vault`` directory. Walk the working-directory ancestry so
    # discovery remains portable rather than embedding a machine-specific path.
    for ancestor in cwd.parents:
        candidates.extend([ancestor / VAULT_NAME, ancestor / "doc-vault" / VAULT_NAME])
    for candidate in candidates:
        if is_vault(candidate):
            return candidate.resolve()
    raise SystemExit(f"Could not locate {VAULT_NAME}; set BRAINTRUST_WIKI_PATH or pass --wiki.")


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def resolve_show_target(root: Path, target: str) -> Path:
    requested = Path(target)
    if requested.is_absolute():
        raise ValueError("show target must be relative to the vault")
    if ".." in requested.parts:
        raise ValueError("show target must not contain parent traversal")

    root = root.resolve()
    if requested == Path("Home.md"):
        allowed_root = root
    elif requested.parts and requested.parts[0] in {"Docs", "_meta"}:
        allowed_root = root / requested.parts[0]
    else:
        raise ValueError("show target must be under Docs/, _meta/, or be Home.md")

    candidate = (root / requested).resolve()
    if requested == Path("Home.md"):
        if candidate != root / "Home.md":
            raise ValueError("show target resolves outside generator-owned vault paths")
    elif not candidate.is_relative_to(allowed_root):
        raise ValueError("show target resolves outside generator-owned vault paths")
    return candidate


def title(path: Path) -> str:
    match = TITLE.search(text(path)[:800])
    return match.group(1).strip() if match else path.stem


def git_info(root: Path) -> dict[str, object]:
    repo = git_root(root)
    if not repo:
        return {"present": False}
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=repo, capture_output=True, text=True)
    dirty = subprocess.run(["git", "status", "--porcelain"], cwd=repo, capture_output=True, text=True)
    return {"present": head.returncode == 0, "root": str(repo), "head": head.stdout.strip(), "dirty": bool(dirty.stdout.strip())}


def orient_payload(root: Path) -> dict[str, object]:
    state_path = resolve_show_target(root, "_meta/upstream-state.json")
    if not state_path.is_file():
        raise ValueError("No vault metadata at: _meta/upstream-state.json")
    state = json.loads(text(state_path))
    return {"wiki_root": str(root), "wiki_git": git_info(root), "synced_at": state.get("synced_at"), "indexed_pages": len(state.get("pages", {})) + len(state.get("unavailable_pages", [])), "available_pages": len(state.get("pages", {})), "unavailable_pages": state.get("unavailable_pages", []), "read_now": [{"path": path, "role": role, "exists": (root / path).is_file()} for path, role in READ_NOW], "generator_owned": ["Docs/", "_meta/", "Home.md"], "user_owned": ["My Notes/"], "read_only": True}


def notes(root: Path):
    root = root.resolve()
    candidates = (
        root / "Home.md",
        *(root / "Docs").rglob("*.md"),
        *(root / "_meta").glob("*.md"),
    )
    for candidate in candidates:
        try:
            path = resolve_show_target(root, str(candidate.relative_to(root)))
        except ValueError:
            continue
        if path.is_file():
            yield path


def search(root: Path, query: str, limit: int) -> list[dict[str, object]]:
    root = root.resolve()
    terms = [term.lower() for term in re.findall(r"[A-Za-z0-9_-]+", query) if len(term) > 1]
    rows = []
    for path in notes(root):
        body = text(path)
        score = sum(body.lower().count(term) + path.name.lower().count(term) * 20 for term in terms)
        if score:
            rows.append({"score": score, "path": str(path.relative_to(root)), "title": title(path), "excerpt": re.sub(r"\s+", " ", body[:500]).strip()})
    return sorted(rows, key=lambda row: (-int(row["score"]), str(row["path"])))[:limit]


def main() -> None:
    parser = argparse.ArgumentParser(description="braintrust-obsidian-wiki lexical interface")
    parser.add_argument("--wiki")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("locate")
    sub.add_parser("orient")
    show = sub.add_parser("show")
    show.add_argument("target")
    context = sub.add_parser("context")
    context.add_argument("query")
    context.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()
    root = locate(args.wiki)
    if args.command == "locate":
        print(json.dumps({"wiki_root": str(root)}, indent=2)); return
    if args.command == "orient":
        try:
            payload = orient_payload(root)
        except ValueError as error:
            raise SystemExit(str(error)) from error
        print(json.dumps(payload, indent=2)); return
    if args.command == "show":
        try:
            path = resolve_show_target(root, args.target)
        except ValueError as error:
            raise SystemExit(str(error)) from error
        if not path.is_file():
            raise SystemExit(f"No vault note at: {args.target}")
        print(json.dumps({"wiki_root": str(root), "path": args.target, "title": title(path), "content": text(path)}, indent=2)); return
    hints = [{"path": path, "exists": (root / path).is_file()} for needle, path in TOPIC_HINTS if needle in args.query.lower()]
    print(json.dumps({"wiki_root": str(root), "query": args.query, "topic_hints": hints, "task_scoped_candidates": search(root, args.query, args.limit)}, indent=2))


if __name__ == "__main__": main()
