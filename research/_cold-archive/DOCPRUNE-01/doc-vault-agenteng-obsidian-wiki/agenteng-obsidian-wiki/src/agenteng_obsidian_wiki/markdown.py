"""Markdown and Obsidian helpers."""
import json
import re
from collections.abc import Iterable, Mapping
from pathlib import Path

_SPACE_BEFORE_TAB = re.compile(r" +\t")

def yaml_quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)

def note_name(path: Path) -> str:
    return path.with_suffix("").as_posix()

def wikilink(target: str | Path, label: str | None = None, anchor: str = "") -> str:
    note = note_name(target) if isinstance(target, Path) else target
    suffix = f"#{anchor}" if anchor else ""
    alias = f"|{label}" if label is not None else ""
    return f"[[{note}{suffix}{alias}]]"

def frontmatter(fields: Mapping[str, str]) -> str:
    lines = "".join(f"{k}: {v}\n" for k, v in fields.items())
    return f"---\n{lines}---\n\n"

def document(lines: Iterable[str]) -> str:
    return "\n".join(lines) + "\n"

def sanitize_generated(content: str) -> str:
    cleaned = []
    for line in content.lstrip("\ufeff").splitlines():
        stripped = line.rstrip()
        indent_at = len(stripped) - len(stripped.lstrip(" \t"))
        cleaned.append(stripped[:indent_at].replace("    ", "\t") + stripped[indent_at:])
    while cleaned and cleaned[-1] == "":
        cleaned.pop()
    return "\n".join(cleaned) + "\n"
