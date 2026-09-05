#!/usr/bin/env python3
"""Validate an English or Chinese Nuwa persona skill."""
from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse

import re
import sys


def section(text: str, heading: str) -> str:
    match = re.search(
        rf"^## {re.escape(heading)}\s*$\n(.*?)(?=^## |\Z)",
        text,
        flags=re.MULTILINE | re.DOTALL,
    )
    return match.group(1) if match else ""


def unique_urls(text: str) -> set[str]:
    return set(re.findall(r"https?://[^)\s>]+", text))


if len(sys.argv) != 2:
    raise SystemExit("Usage: python quality_check.py <SKILL.md path>")

skill_path = Path(sys.argv[1]).resolve()
skill_text = skill_path.read_text(encoding="utf-8")

models_text = section(skill_text, "Mental models") or section(skill_text, "核心心智模型")
model_blocks = re.findall(
    r"^### (?:\d+\.|模型\d+[:：]?).*?$(.*?)(?=^### |\Z)",
    models_text,
    flags=re.MULTILINE | re.DOTALL,
)
model_count = len(model_blocks)
models_have_limits = bool(model_blocks) and all(
    re.search(r"\*\*(?:Limit|局限)[:：]\*\*", block) for block in model_blocks
)

expression_present = bool(
    section(skill_text, "Expression DNA") or section(skill_text, "表达DNA")
)

boundaries_text = (
    section(skill_text, "Honest boundaries")
    or section(skill_text, "Honest boundaries and evidence")
    or section(skill_text, "诚实边界")
)
boundary_count = len(re.findall(r"^- ", boundaries_text, flags=re.MULTILINE))

tensions_text = (
    section(skill_text, "Values, anti-patterns, and tensions")
    or section(skill_text, "Guardrails and tensions")
    or section(skill_text, "价值观与反模式")
)
tension_count = len(
    re.findall(r"\bvs\.|\bversus\b|矛盾|张力", tensions_text, flags=re.IGNORECASE)
)

research_dir = skill_path.parent / "references" / "research"
research_text = "\n".join(
    file.read_text(encoding="utf-8") for file in sorted(research_dir.glob("*.md"))
)
urls = unique_urls(research_text)


def is_first_party(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    path = parsed.path.lower()
    if host in {
        "www.aihero.dev",
        "aihero.dev",
        "www.mattpocock.com",
        "mattpocock.com",
        "www.totaltypescript.com",
        "totaltypescript.com",
    }:
        return True
    if host == "github.com" and path.startswith("/mattpocock/skills"):
        return "/issues/" not in path
    if host in {"www.youtube.com", "youtube.com"} and "-qfhioco-ko" in path:
        return True
    return False


primary_count = sum(is_first_party(url) for url in urls)
primary_ratio = primary_count / len(urls) if urls else 0.0

checks = [
    ("mental_models", 3 <= model_count <= 7, f"{model_count} models; expected 3-7"),
    (
        "model_limits",
        models_have_limits,
        "every model has a Limit section" if models_have_limits else "a model lacks a Limit section",
    ),
    ("expression_dna", expression_present, "section present" if expression_present else "section missing"),
    (
        "honest_boundaries",
        boundary_count >= 3,
        f"{boundary_count} boundaries; expected at least 3",
    ),
    ("core_tensions", tension_count >= 2, f"{tension_count} tensions; expected at least 2"),
    (
        "first_party_sources",
        primary_ratio > 0.5,
        f"{primary_count}/{len(urls)} unique linked research sources ({primary_ratio:.0%})",
    ),
]

for name, passed, detail in checks:
    print(f"{'PASS' if passed else 'FAIL'} {name}: {detail}")

failed = [name for name, passed, _ in checks if not passed]
print(f"SUMMARY: {len(checks) - len(failed)}/{len(checks)} checks passed")
if failed:
    raise SystemExit(1)
