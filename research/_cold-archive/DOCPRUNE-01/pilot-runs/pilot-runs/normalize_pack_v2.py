
#!/usr/bin/env python3
"""FM-CHATSIG-PILOT normalize v2 — better cwd + timestamp window."""
from __future__ import annotations
import json, os, re, subprocess
from pathlib import Path
from datetime import datetime, timezone, timedelta

CORPUS = Path("/Users/jondev/dev/active/socratink/chat-histories/captures/current-home-live")
OUT = Path("/Users/jondev/dev/active/socratink/product/socratink/research/chat-signal/pilot-runs/sessions-pack.json")

WRITE_TOOLS = re.compile(r"(write|edit|apply_patch|search_replace|StrReplace|Write|MultiEdit|delete_file|create_file|ApplyPatch)", re.I)
SECRET_RE = re.compile(
    r"(?i)(sk-[a-z0-9]{10,}|api[_-]?key\s*[:=]\s*\S+|bearer\s+[a-z0-9._\-]+|"
    r"TYPESAFE_API_KEY\s*[:=]\s*\S+|-----BEGIN [A-Z ]+PRIVATE KEY-----|"
    r"password\s*[:=]\s*\S+|ghp_[a-z0-9]+|xox[baprs]-[a-z0-9-]+)"
)
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b")
TS_TAG = re.compile(r"<timestamp>([^<]+)</timestamp>", re.I)
ISO_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?")

KNOWN = [
    "/Users/jondev/dev/active/socratink/product/socratink",
    "/Users/jondev/dev/active/socratink/product/socratink-brain",
    "/Users/jondev/dev/active/socratink/product",
    "/Users/jondev/dev/active/socratink/landing",
    "/Users/jondev/dev/active/socratink-landing",
    "/Users/jondev/dev/active/socratink",
    "/Users/jondev/dev/socratink/prod/socratink-app",
    "/Users/jondev/dev/socratink/prod/socratink-landing",
    "/Users/jondev/dev/socratink/prod/socratink-tui-agent",
    "/Users/jondev/dev/socratink/research/socratink-research-vault",
    "/Users/jondev/dev/sandbox/socratink-io",
]

def slug_to_cwd(slug: str) -> str | None:
    # Exact known mappings from slug fragments
    mapping = {
        "Users-jondev-dev-active-socratink-product-socratink": "/Users/jondev/dev/active/socratink/product/socratink",
        "Users-jondev-dev-active-socratink-product-socratink-brain": "/Users/jondev/dev/active/socratink/product/socratink-brain",
        "Users-jondev-dev-active-socratink-product": "/Users/jondev/dev/active/socratink/product",
        "Users-jondev-dev-active-socratink": "/Users/jondev/dev/active/socratink",
        "Users-jondev-dev-active-socratink-landing": "/Users/jondev/dev/active/socratink-landing",
        "Users-jondev-dev-active-socratink-prod-socratink-landing": "/Users/jondev/dev/active/socratink/prod/socratink-landing",
        "Users-jondev-dev-active-socratink-prod-socratink": "/Users/jondev/dev/active/socratink/prod/socratink",
        "Users-jondev-dev-socratink-prod-socratink-app": "/Users/jondev/dev/socratink/prod/socratink-app",
        "Users-jondev-dev-socratink-prod-socratink-landing": "/Users/jondev/dev/socratink/prod/socratink-landing",
        "Users-jondev-dev-socratink-prod-socratink-tui-agent": "/Users/jondev/dev/socratink/prod/socratink-tui-agent",
        "Users-jondev-dev-socratink-research-socratink-research-vault": "/Users/jondev/dev/socratink/research/socratink-research-vault",
        "Users-jondev-dev-sandbox-socratink-io": "/Users/jondev/dev/sandbox/socratink-io",
        "Users-jondev-dev-active-socratink-product-flue-obsidian-wiki": "/Users/jondev/dev/active/socratink/product/flue-obsidian-wiki",
    }
    # worktree-style: Users-jondev-dev-socratink-prod-socratink-app-<branch>
    for k, v in mapping.items():
        if slug == k or slug.startswith(k + "-"):
            # for branch worktrees try path with suffix
            if slug != k and Path(f"{v}-{slug[len(k)+1:]}").is_dir():
                return f"{v}-{slug[len(k)+1:]}"
            if Path(v).is_dir():
                return v
    # longest existing known
    for k in sorted(KNOWN, key=len, reverse=True):
        enc = k.replace("/", "-").lstrip("-")
        # Users-jondev-...
        if slug.startswith("Users-jondev-") and enc.endswith(slug[len("Users-jondev-"):].replace("-", "/").replace("/", "-")):
            pass
    # reconstruct: try Path.exists on progressive hyphen joins
    if not slug.startswith("Users-jondev-"):
        return None
    segs = slug[len("Users-jondev-"):].split("-")
    def rec(i, cur: Path):
        if i >= len(segs):
            return cur if cur.exists() else None
        best = None
        for j in range(i+1, len(segs)+1):
            name = "-".join(segs[i:j])
            nxt = cur / name
            if nxt.exists():
                if j == len(segs):
                    return nxt
                got = rec(j, nxt)
                if got is not None:
                    # prefer deepest with .git
                    if best is None or len(str(got)) > len(str(best)):
                        best = got
        return best
    found = rec(0, Path("/Users/jondev"))
    if found:
        # prefer git root if parent of found
        p = found
        for _ in range(8):
            if (p / ".git").exists():
                return str(p)
            if p == Path("/Users/jondev"):
                break
            p = p.parent
        return str(found)
    return None

def redact(text: str) -> str:
    return PHONE_RE.sub("[PHONE]", EMAIL_RE.sub("[EMAIL]", SECRET_RE.sub("[REDACTED]", text)))

def parse_loose_ts(s: str):
    s = s.strip()
    # "Tuesday, Sep 1, 2026, 4:51 PM (UTC-5)"
    m = re.search(r"([A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4},\s+\d{1,2}:\d{2}\s*[AP]M)\s*\(([^)]+)\)", s)
    if m:
        try:
            dt = datetime.strptime(m.group(1), "%A, %b %d, %Y, %I:%M %p")
            tz = m.group(2).strip()
            # map UTC-5 / UTC-6
            off = re.match(r"UTC([+-])(\d{1,2})", tz)
            if off:
                sign = 1 if off.group(1) == "+" else -1
                hours = int(off.group(2)) * sign
                dt = dt.replace(tzinfo=timezone(timedelta(hours=hours)))
                return dt.astimezone(timezone.utc)
            return dt.replace(tzinfo=timezone.utc)
        except Exception:
            pass
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except Exception:
        return None

def extract(path: Path, project_slug: str) -> dict | None:
    try:
        raw = path.read_text(errors="replace")
    except Exception:
        return None
    lines = [ln for ln in raw.splitlines() if ln.strip()]
    if not lines:
        return None
    texts, tool_names, paths_touched, models = [], [], [], []
    timestamps = []
    for m in TS_TAG.finditer(raw):
        dt = parse_loose_ts(m.group(1))
        if dt:
            timestamps.append(dt)
    for m in ISO_RE.finditer(raw[:80000]):
        dt = parse_loose_ts(m.group(0))
        if dt:
            timestamps.append(dt)
    for ln in lines[:1000]:
        try:
            obj = json.loads(ln)
        except Exception:
            continue
        msg = obj.get("message") or obj
        role = (msg.get("role") if isinstance(msg, dict) else None) or obj.get("role") or obj.get("type")
        content = msg.get("content") if isinstance(msg, dict) else None
        if isinstance(content, str):
            texts.append(f"{role or '?'}: {content[:1500]}")
            for tm in TS_TAG.finditer(content):
                dt = parse_loose_ts(tm.group(1))
                if dt:
                    timestamps.append(dt)
        elif isinstance(content, list):
            for part in content:
                if not isinstance(part, dict):
                    continue
                if part.get("type") == "text" and part.get("text"):
                    t = str(part["text"])
                    texts.append(f"{role or '?'}: {t[:1500]}")
                    for tm in TS_TAG.finditer(t):
                        dt = parse_loose_ts(tm.group(1))
                        if dt:
                            timestamps.append(dt)
                name = part.get("name") or ""
                if name:
                    tool_names.append(name)
                inp = part.get("input") or {}
                if isinstance(inp, dict):
                    for pk in ("path", "file_path", "filePath", "target_file"):
                        if isinstance(inp.get(pk), str):
                            paths_touched.append(inp[pk])
        for mk in ("model", "modelName"):
            if isinstance(obj.get(mk), str):
                models.append(obj[mk])

    mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    if timestamps:
        started, ended = min(timestamps), max(timestamps)
    else:
        started = ended = mtime
    # widen collapsed windows
    if ended - started < timedelta(minutes=5):
        started = started - timedelta(hours=6)
        ended = ended + timedelta(hours=6)
    # also pad a bit for git
    git_start = started - timedelta(hours=2)
    git_end = ended + timedelta(hours=2)

    excerpt_parts = texts[:8] + (["…"] + texts[-6:] if len(texts) > 14 else [])
    excerpt = redact("\n".join(excerpt_parts))[:6000]
    has_write = any(WRITE_TOOLS.search(n) for n in tool_names)
    sid = path.parent.name if path.parent.name.count("-") >= 4 else path.stem
    cwd = slug_to_cwd(project_slug)
    return {
        "harness": "cursor",
        "session_id": sid,
        "source_path": str(path),
        "project_slug": project_slug,
        "project_cwd": cwd,
        "started_at": started.isoformat(),
        "ended_at": ended.isoformat(),
        "git_since": git_start.isoformat(),
        "git_until": git_end.isoformat(),
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

def git_root(cwd: str | None) -> str | None:
    if not cwd:
        return None
    p = Path(cwd)
    for _ in range(8):
        if (p / ".git").exists():
            return str(p)
        if p.parent == p:
            break
        p = p.parent
    return None

def git_commits(cwd: str | None, since: str, until: str) -> list[str]:
    root = git_root(cwd)
    if not root:
        return []
    cmd = ["git", "-C", root, "log", "--oneline", "--no-decorate",
           f"--since={since}", f"--until={until}", "-n", "40"]
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL, text=True, timeout=20)
    except Exception:
        return []
    return [ln.strip() for ln in out.splitlines() if ln.strip()]

def main():
    projects = sorted(
        [d for d in (CORPUS / "cursor" / "projects").iterdir()
         if d.is_dir() and "socratink" in d.name.lower()]
    )
    sessions = []
    for proj in projects:
        at = proj / "agent-transcripts"
        if not at.is_dir():
            continue
        for f in at.rglob("*.jsonl"):
            if f.stat().st_size < 200:
                continue
            s = extract(f, proj.name)
            if s:
                sessions.append(s)
    print(f"extracted {len(sessions)}")
    for s in sessions:
        commits = git_commits(s.get("project_cwd"), s["git_since"], s["git_until"])
        root = git_root(s.get("project_cwd"))
        s["lifecycle_features"] = {
            "commits_in_window": len(commits),
            "commit_lines": commits[:10],
            "git_root": root,
            "repo_is_socratink": True,
            "paths_touched_sample": (s.get("paths_touched") or [])[:12],
            "pr_urls": [],
            "has_write_tools": s.get("has_write_tools", False),
        }
    with_c = [s for s in sessions if s["lifecycle_features"]["commits_in_window"] > 0]
    without = [s for s in sessions if s["lifecycle_features"]["commits_in_window"] == 0]
    def rk(s):
        return (s.get("file_size", 0), s.get("mtime", ""))
    with_c.sort(key=rk, reverse=True)
    without.sort(key=rk, reverse=True)
    selected = with_c[:25] + without[:25]
    if len(selected) < 50:
        rest = [s for s in sessions if s not in selected]
        rest.sort(key=rk, reverse=True)
        selected.extend(rest[:50 - len(selected)])
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
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(pack, indent=2))
    print(json.dumps({
        "out": str(OUT),
        "n_selected": pack["n_selected"],
        "n_with": pack["n_selected_with_commits"],
        "n_without": pack["n_selected"] - pack["n_selected_with_commits"],
        "pool_with": pack["n_with_commits_pool"],
        "cwd_ok": sum(1 for s in selected if s.get("project_cwd") and s["project_cwd"] != "/Users/jondev/dev"),
    }))

if __name__ == "__main__":
    main()
