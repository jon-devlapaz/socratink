#!/usr/bin/env python3
"""Build stratified NormalizedSession pack for FM-CHATSIG-PILOT."""
from __future__ import annotations
import json, os, re, subprocess, hashlib
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict

CORPUS = Path("/Users/jondev/dev/active/socratink/chat-histories/captures/current-home-live")
OUT_MAC = Path("/Users/jondev/dev/active/socratink/product/socratink/research/chat-signal/pilot-runs")
OUT_LOCAL = Path("/tmp/chatsig-sessions-pack.json")  # always writable on Mac

WRITE_TOOLS = re.compile(
    r"(write|edit|apply_patch|search_replace|StrReplace|Write|EditNotebook|delete_file|create_file|ApplyPatch|MultiEdit)",
    re.I,
)
SECRET_RE = re.compile(
    r"(?i)(sk-[a-z0-9]{10,}|api[_-]?key\s*[:=]\s*\S+|bearer\s+[a-z0-9._\-]+|"
    r"TYPESAFE_API_KEY\s*[:=]\s*\S+|-----BEGIN [A-Z ]+PRIVATE KEY-----|"
    r"password\s*[:=]\s*\S+|ghp_[a-z0-9]+|xox[baprs]-[a-z0-9-]+)",
)
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b")
ISO_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?")

def slug_to_cwd(slug: str) -> str | None:
    # Users-jondev-dev-active-socratink-product-socratink -> /Users/jondev/dev/active/...
    if not slug.startswith("Users-"):
        return None
    parts = slug.split("-")
    # Reconstruct carefully: Users, jondev, then path segments that may contain hyphens
    # Known roots under /Users/jondev/
    candidates = []
    # Try decoding: replace Users-jondev- with /Users/jondev/ then swap remaining - for /
    # but project names have hyphens. Prefer longest existing path by walking.
    rest = slug[len("Users-jondev-"):]
    # greedy: try joining with / and check which prefixes exist
    segs = rest.split("-")
    # Heuristic: common path prefixes
    for n in range(len(segs), 0, -1):
        path = Path("/Users/jondev") / "/".join(segs[:n])
        # also try with hyphens preserved in last segments
        if path.is_dir() and (path / ".git").exists():
            return str(path)
        if path.is_dir():
            candidates.append(str(path))
    # Try hyphenated folder names by binary-ish search of path existence
    def find_path(segs):
        # recursive reconstruction
        def rec(i, cur: Path):
            if i >= len(segs):
                return cur if cur.exists() else None
            # try taking remaining as one hyphenated name
            for j in range(len(segs), i, -1):
                name = "-".join(segs[i:j])
                nxt = cur / name
                if nxt.exists():
                    if j == len(segs):
                        return nxt
                    found = rec(j, nxt)
                    if found:
                        return found
            return None
        return rec(0, Path("/Users/jondev"))
    found = find_path(segs)
    if found:
        return str(found)
    return candidates[0] if candidates else None

def redact(text: str) -> str:
    text = SECRET_RE.sub("[REDACTED]", text)
    text = EMAIL_RE.sub("[EMAIL]", text)
    text = PHONE_RE.sub("[PHONE]", text)
    return text

def parse_ts(s: str | None):
    if not s:
        return None
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except Exception:
        return None

def extract_cursor_session(path: Path, project_slug: str) -> dict | None:
    try:
        raw = path.read_text(errors="replace")
    except Exception:
        return None
    lines = [ln for ln in raw.splitlines() if ln.strip()]
    if not lines:
        return None
    texts = []
    tool_names = []
    paths_touched = []
    timestamps = []
    models = []
    for ln in lines[:800]:
        try:
            obj = json.loads(ln)
        except Exception:
            continue
        # timestamps
        for k in ("timestamp", "createdAt", "created_at", "time"):
            if k in obj and isinstance(obj[k], str):
                timestamps.append(obj[k])
        # nest message
        msg = obj.get("message") or obj.get("msg") or obj
        role = msg.get("role") or obj.get("role") or obj.get("type")
        content = msg.get("content") if isinstance(msg, dict) else None
        if isinstance(content, str):
            texts.append(f"{role or '?'}: {content[:1500]}")
        elif isinstance(content, list):
            for part in content:
                if isinstance(part, dict):
                    if part.get("type") == "text" and part.get("text"):
                        texts.append(f"{role or '?'}: {str(part['text'])[:1500]}")
                    if part.get("type") in ("tool_use", "tool_call") or "name" in part:
                        name = part.get("name") or part.get("toolName") or ""
                        if name:
                            tool_names.append(name)
                        inp = part.get("input") or part.get("arguments") or {}
                        if isinstance(inp, dict):
                            for pk in ("path", "file_path", "filePath", "target_file"):
                                if pk in inp and isinstance(inp[pk], str):
                                    paths_touched.append(inp[pk])
        # toolCall / tool_calls fields
        for tk in ("tool_calls", "toolCalls", "tools"):
            tc = obj.get(tk) or (msg.get(tk) if isinstance(msg, dict) else None)
            if isinstance(tc, list):
                for t in tc:
                    if isinstance(t, dict):
                        name = t.get("name") or t.get("toolName") or ""
                        if name:
                            tool_names.append(name)
        # model
        for mk in ("model", "modelName"):
            if mk in obj and isinstance(obj[mk], str):
                models.append(obj[mk])
        # also scan stringified for paths
    # ISO from raw
    for m in ISO_RE.findall(raw[:50000]):
        timestamps.append(m)

    mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    started = None
    ended = None
    parsed = [parse_ts(t) for t in timestamps]
    parsed = [p for p in parsed if p]
    if parsed:
        started = min(parsed)
        ended = max(parsed)
    else:
        started = ended = mtime

    # excerpt: first+last chunks
    excerpt_parts = texts[:8] + (["…"] + texts[-6:] if len(texts) > 14 else [])
    excerpt = redact("\n".join(excerpt_parts))[:6000]
    has_write = any(WRITE_TOOLS.search(n) for n in tool_names) or bool(
        WRITE_TOOLS.search(" ".join(tool_names))
    )
    # session id from parent dir or filename
    sid = path.parent.name if path.parent.name.count("-") >= 4 else path.stem
    cwd = slug_to_cwd(project_slug)
    return {
        "harness": "cursor",
        "session_id": sid,
        "source_path": str(path),
        "project_slug": project_slug,
        "project_cwd": cwd,
        "started_at": started.isoformat() if started else None,
        "ended_at": ended.isoformat() if ended else None,
        "message_count": len(texts) or len(lines),
        "tool_call_count": len(tool_names),
        "models": sorted(set(models))[:5],
        "paths_touched": sorted(set(paths_touched))[:40],
        "has_write_tools": has_write,
        "text_excerpt_redacted": excerpt,
        "file_size": path.stat().st_size,
        "mtime": mtime.isoformat(),
        "lifecycle_features": {},
    }

def git_commits(cwd: str | None, start: str | None, end: str | None) -> list[str]:
    if not cwd or not Path(cwd).is_dir():
        return []
    if not (Path(cwd) / ".git").exists():
        # walk up for .git
        p = Path(cwd)
        found = None
        for _ in range(6):
            if (p / ".git").exists():
                found = p
                break
            if p.parent == p:
                break
            p = p.parent
        if not found:
            return []
        cwd = str(found)
    cmd = ["git", "-C", cwd, "log", "--oneline", "--no-decorate"]
    if start:
        cmd.append(f"--since={start}")
    if end:
        cmd.append(f"--until={end}")
    cmd.append("-n")
    cmd.append("30")
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL, text=True, timeout=15)
    except Exception:
        return []
    return [ln.strip() for ln in out.splitlines() if ln.strip()]

def main():
    projects = sorted(
        [d for d in (CORPUS / "cursor" / "projects").iterdir() if d.is_dir() and "socratink" in d.name.lower()]
    )
    sessions = []
    for proj in projects:
        at = proj / "agent-transcripts"
        if not at.is_dir():
            continue
        # transcripts may be at/uuid/*.jsonl or at/*.jsonl
        files = list(at.rglob("*.jsonl"))
        for f in files:
            if f.stat().st_size < 200:
                continue
            s = extract_cursor_session(f, proj.name)
            if s:
                sessions.append(s)
    print(f"extracted {len(sessions)} cursor socratink sessions")

    # git join
    for s in sessions:
        commits = git_commits(s.get("project_cwd"), s.get("started_at"), s.get("ended_at"))
        s["lifecycle_features"] = {
            "commits_in_window": len(commits),
            "commit_lines": commits[:10],
            "repo_is_socratink": True,
            "paths_touched_sample": (s.get("paths_touched") or [])[:12],
            "pr_urls": [],
            "has_write_tools": s.get("has_write_tools", False),
        }

    with_c = [s for s in sessions if s["lifecycle_features"]["commits_in_window"] > 0]
    without = [s for s in sessions if s["lifecycle_features"]["commits_in_window"] == 0]
    # prefer larger / more recent
    def rank_key(s):
        return (s.get("file_size", 0), s.get("mtime", ""))
    with_c.sort(key=rank_key, reverse=True)
    without.sort(key=rank_key, reverse=True)

    n_each = 25
    selected = with_c[:n_each] + without[:n_each]
    # if shortfall on with_c, fill from without
    if len(with_c) < n_each:
        need = 50 - len(selected)
        extra = [s for s in without[n_each:] if s not in selected][:need]
        selected.extend(extra)
    if len(selected) < 40:
        # fill from remaining
        rest = [s for s in sessions if s not in selected]
        rest.sort(key=rank_key, reverse=True)
        selected.extend(rest[: 50 - len(selected)])
    selected = selected[:55]

    pack = {
        "as_of": datetime.now(timezone.utc).astimezone().isoformat(),
        "corpus": str(CORPUS),
        "n_extracted": len(sessions),
        "n_with_commits_pool": len(with_c),
        "n_without_pool": len(without),
        "n_selected": len(selected),
        "n_selected_with_commits": sum(1 for s in selected if s["lifecycle_features"]["commits_in_window"] > 0),
        "sessions": selected,
    }
    OUT_MAC.mkdir(parents=True, exist_ok=True)
    out1 = OUT_MAC / "sessions-pack.json"
    out1.write_text(json.dumps(pack, indent=2))
    OUT_LOCAL.write_text(json.dumps(pack, indent=2))
    print(json.dumps({
        "out_mac": str(out1),
        "out_tmp": str(OUT_LOCAL),
        "n_selected": pack["n_selected"],
        "n_with_commits": pack["n_selected_with_commits"],
        "n_without": pack["n_selected"] - pack["n_selected_with_commits"],
        "n_extracted": pack["n_extracted"],
        "pool_with": pack["n_with_commits_pool"],
    }))

if __name__ == "__main__":
    main()
