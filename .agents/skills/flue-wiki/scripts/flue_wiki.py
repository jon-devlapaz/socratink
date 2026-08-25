#!/usr/bin/env python3
"""Lexical interface to the flue-obsidian-wiki vault.

Discovers the vault, ranks notes, and prints JSON maps. It does not decide
truth, mutate generator-owned files, or substitute for reading notes.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from typing import Iterable

VAULT_MARKERS = ("Home.md", "Docs", "Project Context")
VAULT_DIR_NAMES = ("flue-obsidian-wiki",)
VAULT_PARENT_DIR_NAMES = ("product", "doc-vault")
SEARCH_DIRS = ("Docs", "Project Context", "My Notes", "_meta")
SKIP_PARTS = {".git", ".obsidian", "src", "tests", "scripts", "node_modules"}
FRONTMATTER_TITLE = re.compile(r'(?m)^title:\s*"?([^"\n]+)"?\s*$')
SYNC_COMMIT = re.compile(r"withastro/flue` at `([0-9a-f]{7,40})`")
PKG_FLUE = re.compile(r'"@flue/runtime"\s*:\s*"([^"]+)"')

ORIENT_READS = (
    ("Home.md", "vault-identity"),
    ("Project Context/AGENTS.md", "flue-terminology"),
    ("Docs/Guide/Building Agents.md", "agent-authoring"),
    ("Docs/Guide/Project Layout.md", "layout"),
    ("Docs/Guide/Routing.md", "routing"),
)

TOPIC_HINTS = (
    ("skill", "Docs/Guide/Skills.md"),
    ("useSkill", "Docs/Guide/Skills.md"),
    ("tool", "Docs/Guide/Tools.md"),
    ("useTool", "Docs/Guide/Tools.md"),
    ("mcp", "Docs/Guide/MCP.md"),
    ("model", "Docs/Guide/Models.md"),
    ("useModel", "Docs/Guide/Models.md"),
    ("sandbox", "Docs/Guide/Sandboxes.md"),
    ("subagent", "Docs/Guide/Subagents.md"),
    ("hook", "Docs/Guide/Agent Hooks.md"),
    ("router", "Docs/Guide/Routing.md"),
    ("createAgentRouter", "Docs/Guide/Routing.md"),
    ("sdk", "Docs/SDK.md"),
    ("client", "Docs/SDK/Flue Client.md"),
    ("cli", "Docs/CLI.md"),
    ("durable", "Docs/Guide/Durability.md"),
    ("channel", "Docs/Guide/Channels.md"),
    ("database", "Docs/Guide/Database.md"),
    ("deploy", "Docs/Guide/Deploy.md"),
)


def is_vault_root(path: Path) -> bool:
    if not path.is_dir():
        return False
    home = path / "Home.md"
    docs = path / "Docs"
    agents = path / "Project Context" / "AGENTS.md"
    return home.is_file() and docs.is_dir() and agents.is_file()


def git_toplevel(start: Path) -> Path | None:
    try:
        proc = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=start,
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return None
    if proc.returncode != 0:
        return None
    top = proc.stdout.strip()
    return Path(top) if top else None


def add_discovery_roots(candidates: list[Path], start: Path) -> None:
    candidates.append(start)
    for name in VAULT_DIR_NAMES:
        candidates.append(start / name)
        for parent_dir in VAULT_PARENT_DIR_NAMES:
            candidates.append(start / parent_dir / name)
    for parent in [start, *start.parents]:
        for name in VAULT_DIR_NAMES:
            candidates.append(parent / name)
            for parent_dir in VAULT_PARENT_DIR_NAMES:
                candidates.append(parent / parent_dir / name)


def locate_wiki(explicit: str | None = None) -> Path:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit).expanduser())
    env = os.environ.get("FLUE_WIKI_PATH")
    if env:
        candidates.append(Path(env).expanduser())

    add_discovery_roots(candidates, Path.cwd())
    add_discovery_roots(candidates, Path(__file__).resolve().parent)
    top = git_toplevel(Path.cwd())
    if top is not None:
        add_discovery_roots(candidates, top)
        add_discovery_roots(candidates, top.parent)

    seen: set[Path] = set()
    for candidate in candidates:
        try:
            resolved = candidate.resolve()
        except FileNotFoundError:
            continue
        if resolved in seen:
            continue
        seen.add(resolved)
        if is_vault_root(resolved):
            return resolved

    raise SystemExit(
        "Could not locate flue-obsidian-wiki. Clone it as a sibling named "
        "flue-obsidian-wiki (or product/flue-obsidian-wiki or "
        "doc-vault/flue-obsidian-wiki), set "
        "FLUE_WIKI_PATH locally, or pass --wiki."
    )


def git_info(repo: Path | None) -> dict[str, object]:
    if repo is None:
        return {"present": False}
    top = git_toplevel(repo)
    if top is None:
        return {"present": False, "root": str(repo)}
    head = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=top, capture_output=True, text=True
    )
    short = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        cwd=top,
        capture_output=True,
        text=True,
    )
    dirty = subprocess.run(
        ["git", "status", "--porcelain"], cwd=top, capture_output=True, text=True
    )
    return {
        "present": head.returncode == 0,
        "root": str(top),
        "head": head.stdout.strip() if head.returncode == 0 else None,
        "head_short": short.stdout.strip() if short.returncode == 0 else None,
        "dirty": bool(dirty.stdout.strip()) if dirty.returncode == 0 else None,
    }


def find_app_root(wiki: Path) -> Path | None:
    seen: set[Path] = set()
    ordered: list[Path] = []
    for cand in (
        wiki.parent / "socratink",
        wiki.parent.parent / "socratink" if wiki.parent.name == "product" else None,
        git_toplevel(Path.cwd()),
        git_toplevel(Path(__file__).resolve().parent),
    ):
        if cand is None:
            continue
        try:
            resolved = cand.resolve()
        except FileNotFoundError:
            continue
        if resolved in seen:
            continue
        seen.add(resolved)
        ordered.append(resolved)
    wiki_resolved = wiki.resolve()
    for cand in ordered:
        if cand == wiki_resolved:
            continue
        if (cand / "src" / "agents").is_dir() and (cand / "package.json").is_file():
            return cand
    return None


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def wiki_commit(wiki: Path) -> str | None:
    home = wiki / "Home.md"
    if not home.is_file():
        return None
    match = SYNC_COMMIT.search(read_text(home)[:2000])
    return match.group(1) if match else None


def flue_package_version(app: Path | None) -> str | None:
    if app is None:
        return None
    pkg = app / "package.json"
    if not pkg.is_file():
        return None
    match = PKG_FLUE.search(read_text(pkg))
    return match.group(1) if match else None


def markdown_files(root: Path, include_my_notes: bool) -> Iterable[Path]:
    dirs = list(SEARCH_DIRS)
    if not include_my_notes:
        dirs = [d for d in dirs if d != "My Notes"]
    yield root / "Home.md"
    for area in dirs:
        base = root / area
        if not base.exists():
            continue
        if base.is_file():
            yield base
            continue
        for path in base.rglob("*.md"):
            if SKIP_PARTS.intersection(path.parts):
                continue
            yield path


def note_title(path: Path, text: str) -> str:
    match = FRONTMATTER_TITLE.search(text[:800])
    if match:
        return match.group(1).strip()
    return path.stem


def score(query: str, rel: Path, text: str) -> int:
    terms = [t.lower() for t in re.findall(r"[A-Za-z0-9_/-]+", query) if len(t) > 1]
    if not terms:
        return 0
    name = rel.name.lower()
    body = text.lower()
    s = 0
    for term in terms:
        s += name.count(term) * 25
        s += str(rel).lower().count(term) * 8
        s += body[:8000].count(term) * 3
        s += body[8000:].count(term)
    parts = rel.parts
    if parts[:2] == ("Docs", "Guide"):
        s += 14
    elif parts[:2] == ("Docs", "Reference"):
        s += 10
    elif parts[:1] == ("Docs",) and len(parts) > 1 and parts[1] == "SDK":
        s += 8
    elif parts[:1] == ("Project Context",):
        s += 7
    elif parts[:2] == ("Docs", "CLI"):
        s += 6
    elif parts[:2] == ("Docs", "Ecosystem"):
        s += 3
    elif parts[:1] == ("My Notes",):
        s -= 1
    return s


def excerpt(text: str, query: str, limit: int = 420) -> str:
    terms = [t.lower() for t in re.findall(r"[A-Za-z0-9_/-]+", query) if len(t) > 1]
    low = text.lower()
    positions = [low.find(t) for t in terms if low.find(t) >= 0]
    pos = min(positions) if positions else 0
    start = max(0, pos - 120)
    end = min(len(text), start + limit)
    return re.sub(r"\s+", " ", text[start:end]).strip()


def topic_reads(query: str) -> list[str]:
    q = query.lower()
    hits: list[str] = []
    for needle, path in TOPIC_HINTS:
        if needle.lower() in q and path not in hits:
            hits.append(path)
    return hits


def normalize_target(token: str) -> str:
    cleaned = token.strip().strip("[]").split("|", 1)[0].strip()
    cleaned = cleaned.replace("\\", "/")
    if cleaned.endswith(".md"):
        return cleaned
    return cleaned


def resolve_note(root: Path, token: str) -> list[Path]:
    cleaned = normalize_target(token)
    as_path = root / cleaned
    if as_path.is_file():
        return [as_path]
    with_md = root / f"{cleaned}.md"
    if with_md.is_file():
        return [with_md]

    needle = Path(cleaned).stem.lower()
    hits: list[Path] = []
    for path in markdown_files(root, include_my_notes=True):
        if path.stem.lower() == needle:
            hits.append(path)
    return hits


def search_results(
    root: Path, query: str, include_my_notes: bool, limit: int
) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for path in markdown_files(root, include_my_notes=include_my_notes):
        if not path.is_file():
            continue
        text = read_text(path)
        rel = path.relative_to(root)
        s = score(query, rel, text)
        if s <= 0:
            continue
        rows.append(
            {
                "score": s,
                "path": str(rel),
                "title": note_title(path, text),
                "excerpt": excerpt(text, query),
            }
        )
    rows.sort(key=lambda r: (-int(r["score"]), str(r["path"])))
    return rows[:limit]


def cmd_locate(args: argparse.Namespace) -> None:
    root = locate_wiki(args.wiki)
    print(json.dumps({"wiki_root": str(root)}, indent=2))


def cmd_orient(args: argparse.Namespace) -> None:
    root = locate_wiki(args.wiki)
    app = find_app_root(root)
    read_now = []
    for rel, role in ORIENT_READS:
        path = root / rel
        read_now.append({"path": rel, "role": role, "exists": path.is_file()})
    print(
        json.dumps(
            {
                "wiki_root": str(root),
                "app_root": str(app) if app else None,
                "wiki_git": git_info(root),
                "app_git": git_info(app),
                "generated_from_flue_commit": wiki_commit(root),
                "socratink_flue_runtime": flue_package_version(app),
                "read_now": read_now,
                "generator_owned": [
                    "Docs/",
                    "Project Context/",
                    "Assets/",
                    "_meta/",
                    "Home.md",
                ],
                "user_owned": ["My Notes/"],
                "next": [
                    "Read every existing read_now path from wiki_root.",
                    'Then run: python .agents/skills/flue-wiki/scripts/flue_wiki.py context "<task>"',
                    'Then run: python .agents/skills/flue-wiki/scripts/flue_wiki.py show "<note>"',
                    "Implement the smallest Socratink change against published @flue/*.",
                ],
                "note": (
                    "orient is a map, not API truth. Prefer pinned @flue/* "
                    "package behavior if it disagrees with a generated note."
                ),
            },
            indent=2,
        )
    )


def cmd_show(args: argparse.Namespace) -> None:
    root = locate_wiki(args.wiki)
    token = args.target.strip()
    paths = resolve_note(root, token)
    if not paths:
        print(
            json.dumps(
                {"wiki_root": str(root), "target": token, "matches": []},
                indent=2,
            )
        )
        raise SystemExit(2)
    if len(paths) > 1:
        print(
            json.dumps(
                {
                    "wiki_root": str(root),
                    "target": token,
                    "matches": [str(p.relative_to(root)) for p in paths],
                    "note": "Multiple matches. Pass a vault-relative path to show.",
                },
                indent=2,
            )
        )
        raise SystemExit(2)
    path = paths[0]
    text = read_text(path)
    print(
        json.dumps(
            {
                "wiki_root": str(root),
                "path": str(path.relative_to(root)),
                "title": note_title(path, text),
                "content": text,
            },
            indent=2,
        )
    )


def cmd_search(args: argparse.Namespace) -> None:
    root = locate_wiki(args.wiki)
    rows = search_results(root, args.query, args.include_my_notes, args.limit)
    print(
        json.dumps(
            {"wiki_root": str(root), "query": args.query, "results": rows},
            indent=2,
        )
    )


def cmd_context(args: argparse.Namespace) -> None:
    root = locate_wiki(args.wiki)
    hinted = []
    for rel in topic_reads(args.query):
        hinted.append({"path": rel, "exists": (root / rel).is_file()})
    rows = search_results(root, args.query, args.include_my_notes, args.limit)
    print(
        json.dumps(
            {
                "wiki_root": str(root),
                "query": args.query,
                "topic_hints": hinted,
                "task_scoped_candidates": rows,
                "next": (
                    "Read topic_hints from wiki_root, then show only the "
                    "notes required to decide. Follow wikilinks; do not ingest "
                    "the whole vault."
                ),
            },
            indent=2,
        )
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="flue-obsidian-wiki lexical interface",
        epilog=(
            'Coding-agent default: orient → read read_now → context "<task>" '
            "→ show <note> → smallest Socratink change."
        ),
    )
    parser.add_argument("--wiki", help="Path to flue-obsidian-wiki vault root")
    sub = parser.add_subparsers(dest="command", required=True)

    s = sub.add_parser("locate", help="Print the vault root path")
    s.set_defaults(func=cmd_locate)

    s = sub.add_parser("orient", help="Vault identity plus the default read set")
    s.set_defaults(func=cmd_orient)

    s = sub.add_parser("show", help="Print one note by path, stem, or wikilink")
    s.add_argument("target", help='Vault-relative path, e.g. Docs/Guide/Skills.md')
    s.set_defaults(func=cmd_show)

    s = sub.add_parser("search", help="Rank notes by keyword")
    s.add_argument("query")
    s.add_argument("--include-my-notes", action="store_true")
    s.add_argument("--limit", type=int, default=10)
    s.set_defaults(func=cmd_search)

    s = sub.add_parser("context", help="Topic hints plus ranked notes for a task")
    s.add_argument("query")
    s.add_argument("--include-my-notes", action="store_true")
    s.add_argument("--limit", type=int, default=10)
    s.set_defaults(func=cmd_context)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
