#!/usr/bin/env python3
"""Filesystem discovery for Socratink Brain; never a truth or sync engine."""
from __future__ import annotations

import argparse
from collections.abc import Iterable
import json
import os
from pathlib import Path
import re
import subprocess
import sys


ROOT_FILES = ("CONSTITUTION.md", "NORTH-STAR.md", "GOVERNANCE.md")
CANON = "20 Canon"
SOURCES = "10 Sources"
VIEWS = "40 Views"
CONFLICTS = "60 Ledger/Conflicts.md"
ARCHIVE = "90 Archive"
ID_RE = re.compile(r"(?mi)^id:\s*([A-Z]+-\d+)\s*$")
STATUS_RE = re.compile(r"(?mi)^status:\s*([^\n#]+?)\s*$")
ID_TOKEN_RE = re.compile(r"^[A-Z]+-\d+$")

READ_NOW = (
    ("README.md", "orientation"),
    ("00 HOME.md", "navigation"),
    ("CONSTITUTION.md", "epistemic-invariants"),
    ("NORTH-STAR.md", "strategic-direction"),
    ("GOVERNANCE.md", "mutation-and-reconciliation-rules"),
)
CONTRACT = (
    "North-star fit",
    "Canon relied on",
    "Derived context used",
    "Open question / conflict",
    "Evidence / provenance needed",
    "Codebase facts that must be verified externally",
    "Claims this work must NOT make",
    "Brain mutation proposed",
)
JURISDICTION = {
    "brain": "epistemic truth",
    "application": "executable truth",
    "praxist": "experimental execution truth",
    "harness": "operational/process truth",
}


def emit(value: object) -> None:
    print(json.dumps(value, indent=2))


def git_root(start: Path) -> Path | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"], cwd=start,
            capture_output=True, text=True, check=False,
        )
    except OSError:
        return None
    return Path(result.stdout.strip()) if result.returncode == 0 else None


def git_value(root: Path, *args: str) -> str | None:
    result = subprocess.run(
        ["git", *args], cwd=root, capture_output=True, text=True, check=False
    )
    return result.stdout.strip() if result.returncode == 0 else None


def git_info(repo: Path | None) -> dict[str, object]:
    root = git_root(repo) if repo else None
    if root is None:
        return {"present": False, **({"root": str(repo)} if repo else {})}
    head = git_value(root, "rev-parse", "HEAD")
    return {
        "present": head is not None,
        "root": str(root),
        "head": head,
        "head_short": git_value(root, "rev-parse", "--short", "HEAD"),
        "dirty": bool(git_value(root, "status", "--porcelain")),
    }


def is_brain(path: Path) -> bool:
    return path.is_dir() and all((path / name).is_file() for name in ROOT_FILES)


def nearby(candidates: list[Path], start: Path) -> None:
    candidates.extend((start, start / "socratink-brain"))
    candidates.extend(parent / "socratink-brain" for parent in (start, *start.parents))
    if root := git_root(start):
        candidates.extend((root, root / "socratink-brain", root.parent / "socratink-brain"))


def locate(explicit: str | None) -> Path:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit).expanduser())
    if configured := os.environ.get("SOCRATINK_BRAIN_PATH"):
        candidates.append(Path(configured).expanduser())
    nearby(candidates, Path.cwd())
    nearby(candidates, Path(__file__).resolve().parent)

    seen: set[Path] = set()
    for candidate in candidates:
        candidate = candidate.resolve()
        if candidate not in seen and is_brain(candidate):
            return candidate
        seen.add(candidate)
    raise SystemExit(
        "Could not locate Socratink Brain. Use a nearby socratink-brain checkout, "
        "SOCRATINK_BRAIN_PATH, or --brain."
    )


def app_root(brain: Path) -> Path | None:
    seen: set[Path] = set()
    for candidate in (
        git_root(Path.cwd()), brain.parent / "socratink",
        git_root(Path(__file__).resolve().parent),
    ):
        if candidate is None:
            continue
        candidate = candidate.resolve()
        if candidate == brain.resolve() or candidate in seen:
            continue
        seen.add(candidate)
        if (candidate / ".agents/skills/socratink-brain").is_dir():
            return candidate
    return None


def text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def match_value(pattern: re.Pattern[str], content: str) -> str | None:
    match = pattern.search(content[:4000])
    return match.group(1).strip().strip('"').strip("'") if match else None


def role(root: Path, path: Path) -> tuple[str, bool]:
    relative = path.relative_to(root)
    first = relative.parts[0]
    historical = first == ARCHIVE
    if historical:
        name = "archive-history"
    elif first == CANON:
        name = "canon"
    elif first == SOURCES:
        name = "source"
    elif first == VIEWS:
        name = "derived-view"
    elif relative.as_posix() == "OPEN QUESTIONS.md":
        name = "open-question"
    elif relative.as_posix() == CONFLICTS:
        name = "conflict"
    elif first == "80 Templates":
        name = "authoring-reference"
    else:
        name = dict(READ_NOW).get(relative.as_posix(), "supporting")
    return name, historical


def describe(root: Path, path: Path, content: str | None = None) -> dict[str, object]:
    content = text(path) if content is None else content
    name, historical = role(root, path)
    status = match_value(STATUS_RE, content)
    authoritative = name in {"epistemic-invariants", "strategic-direction"} or (
        name == "canon" and status == "accepted"
    )
    return {
        "id": match_value(ID_RE, content),
        "status": status,
        "path": str(path.relative_to(root)),
        "role": name,
        "historical": historical,
        "current_authority": authoritative,
    }


def markdown(root: Path, area: str) -> Iterable[Path]:
    base = root / area
    if base.is_dir():
        yield from sorted(path for path in base.rglob("*.md") if ".git" not in path.parts)


def search_files(root: Path, sources: bool, archive: bool) -> Iterable[Path]:
    yield from markdown(root, CANON)
    yield from markdown(root, VIEWS)
    for name in ("OPEN QUESTIONS.md", CONFLICTS):
        if (path := root / name).is_file():
            yield path
    if sources:
        yield from markdown(root, SOURCES)
    if archive:
        yield from markdown(root, ARCHIVE)


def all_files(root: Path) -> Iterable[Path]:
    yield from sorted(
        path for path in root.rglob("*.md")
        if ".git" not in path.parts and ".obsidian" not in path.parts
    )


def by_id(root: Path, needle: str) -> list[Path]:
    return [path for path in all_files(root) if match_value(ID_RE, text(path)) == needle]


def query_terms(query: str) -> list[str]:
    return [term.lower() for term in re.findall(r"[A-Za-z0-9_-]+", query) if len(term) > 1]


def relevance(query: str, path: Path, content: str, kind: str) -> int:
    terms = query_terms(query)
    name, body = path.name.lower(), content.lower()
    lexical = sum(
        name.count(term) * 25 + body[:6000].count(term) * 3 + body[6000:].count(term)
        for term in terms
    )
    if lexical == 0:
        return 0
    return lexical + {
        "canon": 12, "derived-view": 9, "open-question": 6,
        "conflict": 6, "source": 2, "archive-history": -5,
    }.get(kind, 0)


def excerpt(content: str, query: str, limit: int = 500) -> str:
    lowered = content.lower()
    positions = [lowered.find(term) for term in query_terms(query) if lowered.find(term) >= 0]
    start = max(0, (min(positions) if positions else 0) - 160)
    return re.sub(r"\s+", " ", content[start:start + limit]).strip()


def results(root: Path, args: argparse.Namespace) -> list[dict[str, object]]:
    rows = []
    for path in search_files(root, args.include_sources, args.include_archive):
        content = text(path)
        item = describe(root, path, content)
        score = relevance(args.query, path.relative_to(root), content, str(item["role"]))
        if score:
            rows.append({"score": score, **item, "excerpt": excerpt(content, args.query)})
    rows.sort(key=lambda item: (-int(item["score"]), str(item["path"])))
    return rows[:args.limit]


def read_set(root: Path) -> list[dict[str, object]]:
    return [
        {"path": path, "role": role_name, "exists": (root / path).is_file()}
        for path, role_name in READ_NOW
    ]


def cmd_locate(args: argparse.Namespace) -> None:
    emit({"brain_root": str(locate(args.brain))})


def cmd_orient(args: argparse.Namespace) -> None:
    brain = locate(args.brain)
    app = app_root(brain)
    emit({
        "brain_root": str(brain),
        "app_root": str(app) if app else None,
        "brain_git": git_info(brain),
        "app_git": git_info(app),
        "read_now": read_set(brain),
        "jurisdiction": JURISDICTION,
        "brain_contract_fields": list(CONTRACT),
        "next": [
            "Read the relevant read_now files from brain_root.",
            'Run context "<task>" and show only the IDs needed to decide.',
            "Inspect the application repository directly for current implementation.",
            "Fill a Brain Contract before consequential product work.",
        ],
        "note": (
            "orient is discovery, not authority. Brain constrains semantics; "
            "establish current implementation from the application repository."
        ),
    })


def cmd_lookup(args: argparse.Namespace) -> None:
    brain, needle = locate(args.brain), args.id.upper()
    matches = [describe(brain, path) for path in by_id(brain, needle)]
    emit({
        "brain_root": str(brain), "matches": matches,
        "next": f"python .agents/skills/socratink-brain/scripts/brain.py show {needle}",
    })
    if not matches:
        raise SystemExit(2)


def cmd_show(args: argparse.Namespace) -> None:
    brain, target = locate(args.brain), args.target.strip()
    candidate = (brain / target).resolve()
    if not candidate.is_relative_to(brain):
        raise SystemExit("Target must be inside Socratink Brain.")
    paths = [candidate] if candidate.is_file() else (
        by_id(brain, target.upper()) if ID_TOKEN_RE.match(target.upper()) else []
    )
    if len(paths) != 1:
        emit({
            "brain_root": str(brain), "target": target,
            "matches": [describe(brain, path) for path in paths],
            **({"note": "Pass a Brain-relative path when multiple IDs match."} if paths else {}),
        })
        raise SystemExit(2)
    path, content = paths[0], text(paths[0])
    emit({"brain_root": str(brain), **describe(brain, path, content), "content": content})


def cmd_search(args: argparse.Namespace) -> None:
    brain = locate(args.brain)
    emit({"brain_root": str(brain), "query": args.query, "results": results(brain, args)})


def cmd_context(args: argparse.Namespace) -> None:
    brain = locate(args.brain)
    emit({
        "brain_root": str(brain),
        "query": args.query,
        "read_first": read_set(brain),
        "task_scoped_candidates": results(brain, args),
        "next": "Read only the returned context and follow required Canon links.",
        "note": (
            "Ranking is discovery only, not truth. Establish current implementation "
            "directly from the application repository."
        ),
    })


def cmd_validate(args: argparse.Namespace) -> None:
    brain = locate(args.brain)
    validator = brain / "scripts/validate_brain.py"
    if not validator.is_file():
        raise SystemExit(f"Validator not found: {validator}")
    raise SystemExit(subprocess.run([sys.executable, str(validator)], cwd=brain).returncode)


def search_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("query")
    parser.add_argument("--include-sources", action="store_true")
    parser.add_argument("--include-archive", action="store_true")
    parser.add_argument("--limit", type=int, default=10)


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description="Socratink Brain lexical interface")
    root.add_argument("--brain", help="Path to Socratink Brain root")
    commands = root.add_subparsers(dest="command", required=True)
    for name, help_text, function in (
        ("locate", "Print the Brain root", cmd_locate),
        ("orient", "Print jurisdiction and orientation reads", cmd_orient),
        ("validate", "Delegate to the Brain validator", cmd_validate),
    ):
        command = commands.add_parser(name, help=help_text)
        command.set_defaults(func=function)
    command = commands.add_parser("lookup", help="Find and label a stable ID")
    command.add_argument("id")
    command.set_defaults(func=cmd_lookup)
    command = commands.add_parser("show", help="Print an object by ID or relative path")
    command.add_argument("target")
    command.set_defaults(func=cmd_show)
    for name, function in (("search", cmd_search), ("context", cmd_context)):
        command = commands.add_parser(name, help="Search task-relevant Brain surfaces")
        search_args(command)
        command.set_defaults(func=function)
    return root


def main() -> None:
    args = parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
