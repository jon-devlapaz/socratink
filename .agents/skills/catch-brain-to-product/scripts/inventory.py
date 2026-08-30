#!/usr/bin/env python3
"""Inventory a Brain ← product catch. No Brain writes. No chat bodies."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

NEEDLE_PATHS = [
    "src/ui",
    "src/agents",
    "src/app.ts",
    "src/server",
    "src/braintrust.ts",
    "src/questionnaire.ts",
    "src/config/r1-learning.ts",
]

PRESENCE = {
    "src/r1": "r1_dir",
    "src/questionnaire.ts": "questionnaire_module",
    "src/ui/questionnaire.ts": "questionnaire_ui",
    "src/config/r1-learning.ts": "r1_learning_config",
    "scripts/r1-review.mjs": "r1_reviewer_cli",
}

BATCH_RE = re.compile(r"^B(\d{3})\b")

SKILL_ROOT = Path(__file__).resolve().parents[1]
PRODUCT_SKILLS = SKILL_ROOT.parent
BRAIN_SCRIPTS = PRODUCT_SKILLS / "socratink-brain" / "scripts"
sys.path.insert(0, str(BRAIN_SCRIPTS))

import brain as brain_helper  # noqa: E402


def run_git(app: Path, *args: str) -> str:
    proc = subprocess.run(
        ["git", *args],
        cwd=app,
        capture_output=True,
        text=True,
        check=False,
    )
    return (proc.stdout or "").strip()


def next_id(root: Path, prefix: str, width: int) -> str:
    found: list[int] = []
    for path in root.rglob("*.md"):
        if ".git" in path.parts or ".obsidian" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")[:400]
        if prefix == "SRC":
            m = re.search(r"(?m)^id:\s*(SRC-\d{4})\s*$", text)
            if m:
                found.append(int(m.group(1).split("-")[1]))
        else:
            m = re.search(r"(?m)^batch:\s*(B\d{3})\s*$", text)
            if m:
                found.append(int(m.group(1)[1:]))
            else:
                stem_m = BATCH_RE.match(path.stem)
                if stem_m:
                    found.append(int(stem_m.group(1)))
    n = (max(found) + 1) if found else 1
    return f"{prefix}-{n:0{width}d}" if prefix == "SRC" else f"B{n:03d}"


def presence(app: Path) -> dict[str, bool]:
    flags = {label: (app / rel).exists() for rel, label in PRESENCE.items()}
    app_ts = app / "src" / "app.ts"
    text = app_ts.read_text(encoding="utf-8") if app_ts.is_file() else ""
    flags["api_r1_in_app"] = "/api/r1" in text or "r1/routes" in text
    return flags


def mentions(brain: Path, pin: str | None) -> list[str]:
    if not pin:
        return []
    needles = {pin.lower(), pin[:8].lower()}
    hits: list[str] = []
    for path in sorted(brain.rglob("*.md")):
        if ".git" in path.parts or ".obsidian" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        low = text.lower()
        if any(n in low for n in needles if len(n) >= 7):
            hits.append(str(path.relative_to(brain)))
    return hits


def main() -> None:
    brain = brain_helper.locate_brain(None)
    app = brain_helper.find_app_root(brain)
    if app is None:
        raise SystemExit("Could not locate product socratink next to Brain.")
    brain_git = brain_helper.git_info(brain)
    app_git = brain_helper.git_info(app)
    named = brain_helper.live_repo_commit(brain)
    app_head = app_git.get("head") if isinstance(app_git.get("head"), str) else None
    tandem = brain_helper.tandem_status(app_head, named)

    print("## Tandem")
    print(f"brain: {brain}")
    print(f"product: {app}")
    print(f"tandem: {tandem}")
    print(f"pin: {named}")
    print(f"product_head: {app_head}")
    print(f"product_dirty: {app_git.get('dirty')}")
    print(f"brain_dirty: {brain_git.get('dirty')}")

    print("\n## Next ids")
    print("SRC:", next_id(brain, "SRC", 4))
    print("batch:", next_id(brain, "B", 3))

    print("\n## Presence (product HEAD tree)")
    for key, value in sorted(presence(app).items()):
        print(f"- {key}: {value}")

    print("\n## Commits since pin (needle paths)")
    if not named or not app_head:
        print("(cannot range: missing pin or HEAD)")
    elif tandem == "match":
        print("(none — already matched)")
    else:
        spec = f"{named}..HEAD"
        log = run_git(app, "log", "--oneline", spec, "--", *NEEDLE_PATHS)
        print(log or "(empty range — pin missing from this clone?)")
        print("\n## HEAD subject")
        print(run_git(app, "log", "-1", "--format=%h %s"))

    print("\n## Product dirty (not in pin)")
    porcelain = run_git(app, "status", "--porcelain")
    print(porcelain or "(clean)")

    print("\n## Brain files naming the pin")
    for rel in mentions(brain, named):
        print(f"- {rel}")

    if tandem == "match":
        print("\n## Stop")
        print("CURRENT STATE already names this product HEAD.")


if __name__ == "__main__":
    main()
