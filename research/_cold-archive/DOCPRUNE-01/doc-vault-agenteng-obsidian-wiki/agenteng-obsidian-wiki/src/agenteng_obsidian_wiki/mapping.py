"""Defensive accessors for JSON state files."""
from collections.abc import Mapping

def as_dict(value: object) -> dict[str, object]:
    return dict(value) if isinstance(value, Mapping) else {}

def dict_at(mapping: Mapping[str, object], key: str) -> dict[str, object]:
    return as_dict(mapping.get(key))

def str_at(mapping: Mapping[str, object], key: str) -> str | None:
    val = mapping.get(key)
    return val if isinstance(val, str) else None
