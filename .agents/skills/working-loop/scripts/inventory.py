#!/usr/bin/env python3
"""Socratink product-needle inventory. No chat bodies."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

PRODUCT = Path("/Users/jondev/dev/active/socratink/product/socratink")
HISTORIES = Path("/Users/jondev/dev/active/socratink/chat-histories")
NEEDLE_PATHS = [
    "src/ui",
    "src/agents",
    "src/app.ts",
    "src/server",
    "src/braintrust.ts",
]
SKILL_ROOT = PRODUCT / ".agents/skills"


def receipt_summary(receipt: Path) -> dict:
    data = json.loads(receipt.read_text())
    files = data.get("files") or []
    return {
        "harness": data.get("harness") or receipt.parent.name,
        "copied_file_count": data.get("copied_file_count", len(files)),
        "copied_bytes": data.get("copied_bytes"),
        "missing_sources": len(data.get("missing_sources") or []),
    }


def list_skills(root: Path) -> list[str]:
    if not root.is_dir():
        return []
    return sorted(skill_md.parent.name for skill_md in root.glob("*/SKILL.md"))


def run(cmd: list[str], cwd: Path | None = None) -> str:
    try:
        result = subprocess.run(
            cmd,
            check=False,
            capture_output=True,
            text=True,
            timeout=20,
            cwd=cwd,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        return f"(unavailable: {exc})"
    text = (result.stdout or result.stderr or "").strip()
    return text or "(empty)"


def main() -> None:
    print("## Product")
    print(PRODUCT)
    print("needle paths:", " ".join(NEEDLE_PATHS))

    print("\n## Chat history receipts (Socratink snapshots)")
    if not HISTORIES.is_dir():
        print("missing", HISTORIES)
    else:
        for receipt in sorted(HISTORIES.glob("*/receipt.json")):
            summary = receipt_summary(receipt)
            print(
                f"- {summary['harness']}: files={summary['copied_file_count']} "
                f"bytes={summary['copied_bytes']} missing_sources={summary['missing_sources']}"
            )

    print("\n## Product skills")
    names = list_skills(SKILL_ROOT)
    print(", ".join(names) if names else "(none)")

    print("\n## Needle commits (product paths only)")
    if (PRODUCT / ".git").exists():
        print(run(["git", "log", "--oneline", "-25", "--", *NEEDLE_PATHS], cwd=PRODUCT))
        if shutil.which("gh"):
            print("\n## Merged PRs (repo; filter to needle in the audit)")
            print(run(["gh", "pr", "list", "--state", "merged", "--limit", "15"], cwd=PRODUCT))
        else:
            print("\n## Merged PRs\ngh not on PATH")
    else:
        print("no git at", PRODUCT)


if __name__ == "__main__":
    main()
