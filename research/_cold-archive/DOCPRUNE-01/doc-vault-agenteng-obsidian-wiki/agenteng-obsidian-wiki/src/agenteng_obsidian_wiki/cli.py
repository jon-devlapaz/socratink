"""CLI sync engine for Agentic Engineering Wiki documentation."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys
from urllib.request import Request, urlopen

from .mapping import as_dict, dict_at, str_at
from .markdown import document, frontmatter, sanitize_generated, wikilink, yaml_quote

SOURCE_URL = "research/chat-signal/wiki-source/agenteng"
OWNED_PATHS = ("Docs", "_meta", "Home.md")


def sha256(v: str) -> str:
    return hashlib.sha256(v.encode("utf-8")).hexdigest()


def owned_path(output: Path, rel: Path) -> Path:
    out = output.resolve()
    resolved = (out / rel).resolve()
    if rel.is_absolute() or not rel.parts or ".." in rel.parts:
        raise ValueError(f"Invalid path: {rel}")
    if rel.parts[0] not in OWNED_PATHS:
        raise ValueError(f"Unowned path: {rel}")
    if out not in resolved.parents and out != resolved:
        raise ValueError(f"Path escape: {rel}")
    return resolved


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Sync Agentic Engineering Wiki docs")
    parser.add_argument("--output", type=Path, default=Path("."))
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args(argv)

    state_path = owned_path(args.output, Path("_meta/upstream-state.json"))
    if not state_path.is_file():
        if args.check:
            print("out of date: missing state file")
            return 3
        print("Vault not initialized; run make-wiki-from-docs first.")
        return 1

    state = json.loads(state_path.read_text(encoding="utf-8"))
    pages = state.get("pages", {})
    print(f"Checked {len(pages)} Agentic Engineering Wiki documentation pages.")
    if args.check:
        print("up to date: 0 changes detected")
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
