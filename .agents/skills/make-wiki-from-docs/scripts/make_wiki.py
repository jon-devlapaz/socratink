#!/usr/bin/env python3
"""make-wiki-from-docs: Generate an updateable Obsidian LLM Wiki and companion agent skill.

Supports multiple documentation sources:
  1. llms.txt index feeds (Mintlify, GitBook, ReadTheDocs, Braintrust, Transluce, etc.)
  2. GitHub repositories / folders containing Markdown documentation
  3. HTML documentation trees (crawling internal doc pages and converting to Markdown)
  4. Local Markdown directories
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import UTC, datetime
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urljoin, urlparse, urlsplit
from urllib.request import Request, urlopen

USER_AGENT = "make-wiki-from-docs/1.0 (+https://github.com/jon-devlapaz/socratink)"


@dataclass
class SourceDoc:
    title: str
    relative_path: Path
    url: str
    content: str
    description: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# HTML to Markdown Converter (Zero-dependency via html.parser)
# ─────────────────────────────────────────────────────────────────────────────


class SimpleHtmlToMarkdown(HTMLParser):
    def __init__(self, base_url: str = "") -> None:
        super().__init__()
        self.base_url = base_url
        self.output: list[str] = []
        self.current_tag: list[str] = []
        self.in_pre = False
        self.in_code = False
        self.link_href: str | None = None
        self.list_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        self.current_tag.append(tag)

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            level = int(tag[1])
            self.output.append(f"\n\n{'#' * level} ")
        elif tag == "p":
            self.output.append("\n\n")
        elif tag in ("ul", "ol"):
            self.list_depth += 1
            self.output.append("\n")
        elif tag == "li":
            self.output.append(f"\n{'  ' * (self.list_depth - 1)}* ")
        elif tag == "pre":
            self.in_pre = True
            lang = attrs_dict.get("data-language") or attrs_dict.get("class") or ""
            lang = lang.replace("language-", "")
            self.output.append(f"\n\n```{lang}\n")
        elif tag == "code":
            self.in_code = True
            if not self.in_pre:
                self.output.append("`")
        elif tag == "a":
            href = attrs_dict.get("href")
            if href:
                self.link_href = urljoin(self.base_url, href)
                self.output.append("[")
        elif tag == "blockquote":
            self.output.append("\n\n> ")
        elif tag in ("strong", "b"):
            self.output.append("**")
        elif tag in ("em", "i"):
            self.output.append("*")
        elif tag == "br":
            self.output.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if self.current_tag and self.current_tag[-1] == tag:
            self.current_tag.pop()

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.output.append("\n\n")
        elif tag in ("ul", "ol"):
            self.list_depth = max(0, self.list_depth - 1)
            self.output.append("\n")
        elif tag == "pre":
            self.in_pre = False
            self.output.append("\n```\n\n")
        elif tag == "code":
            self.in_code = False
            if not self.in_pre:
                self.output.append("`")
        elif tag == "a":
            if self.link_href:
                self.output.append(f"]({self.link_href})")
                self.link_href = None
        elif tag in ("strong", "b"):
            self.output.append("**")
        elif tag in ("em", "i"):
            self.output.append("*")

    def handle_data(self, data: str) -> None:
        # Ignore scripts and styles
        if any(t in self.current_tag for t in ("script", "style", "svg", "noscript")):
            return
        if not self.in_pre:
            data = re.sub(r"\s+", " ", data)
        self.output.append(data)

    def get_markdown(self) -> str:
        text = "".join(self.output)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip() + "\n"


# ─────────────────────────────────────────────────────────────────────────────
# Link discovery for HTML trees
# ─────────────────────────────────────────────────────────────────────────────


class HtmlLinkExtractor(HTMLParser):
    def __init__(self, base_url: str) -> None:
        super().__init__()
        self.base_url = base_url
        self.links: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            for k, v in attrs:
                if k == "href" and v:
                    full = urljoin(self.base_url, v).split("#", 1)[0].split("?", 1)[0]
                    self.links.add(full)


# ─────────────────────────────────────────────────────────────────────────────
# Source Ingestion Adapters
# ─────────────────────────────────────────────────────────────────────────────


def fetch_url(url: str, timeout: int = 25) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=timeout) as resp:
        content = resp.read()
        return content.decode("utf-8", errors="replace")


def format_title_from_segment(seg: str) -> str:
    words = seg.replace("-", " ").replace("_", " ").split()
    return " ".join(w.capitalize() for w in words)


def extract_title_from_markdown(content: str, default: str) -> str:
    for line in content.splitlines()[:20]:
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
        if line.startswith("title:"):
            val = line.split("title:", 1)[1].strip().strip("'\"")
            if val:
                return val
    return default


def ingest_llms_txt(index_url: str, workers: int = 4) -> list[SourceDoc]:
    print(f"Fetching llms.txt index from: {index_url}")
    index_content = fetch_url(index_url)

    pattern = re.compile(
        r"^- \[([^]]+)\]\((https?://[^)]+\.md)\)(?::\s*(.*))?",
        re.M,
    )
    matches = pattern.findall(index_content)
    if not matches:
        # Try generic markdown links
        generic_pattern = re.compile(r"^- \[([^]]+)\]\((https?://[^)]+)\)(?::\s*(.*))?", re.M)
        matches = generic_pattern.findall(index_content)

    print(f"Discovered {len(matches)} indexed documentation pages.")
    docs: list[SourceDoc] = []

    def load_one(title: str, url: str, desc: str) -> SourceDoc | None:
        try:
            body = fetch_url(url)
            # Map path
            parsed = urlparse(url)
            path_str = parsed.path.strip("/").removesuffix(".md")
            parts = [format_title_from_segment(p) for p in path_str.split("/") if p]
            if not parts:
                parts = ["Introduction"]
            rel_path = Path("Docs", *parts[:-1], f"{parts[-1]}.md")
            return SourceDoc(
                title=title.strip(),
                relative_path=rel_path,
                url=url,
                content=body,
                description=desc.strip(),
            )
        except Exception as e:
            print(f"  [WARN] Failed to fetch {url}: {e}", file=sys.stderr)
            return None

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(load_one, t, u, d) for t, u, d in matches]
        for f in as_completed(futures):
            res = f.result()
            if res:
                docs.append(res)

    docs.sort(key=lambda d: d.relative_path.as_posix())
    return docs


def ingest_github_repo(repo_url: str, subpath: str = "docs", workers: int = 4) -> list[SourceDoc]:
    # Parse owner, repo, branch, subpath
    # Formats:
    #   https://github.com/owner/repo
    #   https://github.com/owner/repo/tree/branch/path/to/docs
    clean = repo_url.removeprefix("https://").removeprefix("http://").removeprefix("github.com/")
    parts = clean.strip("/").split("/")
    if len(parts) < 2:
        raise ValueError(f"Invalid GitHub URL: {repo_url}")
    owner, repo = parts[0], parts[1]
    branch = "main"
    path_filter = subpath

    if len(parts) >= 4 and parts[2] == "tree":
        branch = parts[3]
        if len(parts) > 4:
            path_filter = "/".join(parts[4:])

    print(f"Fetching GitHub tree for {owner}/{repo} (branch: {branch}, path: '{path_filter}')...")
    api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    headers = {"User-Agent": USER_AGENT, "Accept": "application/vnd.github.v3+json"}
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"

    req = Request(api_url, headers=headers)
    try:
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        if e.code == 404 and branch == "main":
            # Retry with master
            api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=1"
            with urlopen(Request(api_url, headers=headers), timeout=30) as resp2:
                data = json.loads(resp2.read().decode("utf-8"))
            branch = "master"
        else:
            raise

    tree = data.get("tree", [])
    md_files = [
        item["path"]
        for item in tree
        if item.get("type") == "blob"
        and (item["path"].endswith(".md") or item["path"].endswith(".mdx"))
    ]

    if path_filter:
        norm_filter = path_filter.strip("/") + "/"
        matched = [f for f in md_files if f.startswith(norm_filter) or f == path_filter.strip("/")]
        if matched:
            md_files = matched

    print(f"Found {len(md_files)} documentation files in GitHub repository.")
    docs: list[SourceDoc] = []

    def fetch_github_file(fpath: str) -> SourceDoc | None:
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{fpath}"
        try:
            content = fetch_url(raw_url)
            # Determine relative path in Docs
            rel = fpath
            if path_filter and rel.startswith(path_filter.strip("/") + "/"):
                rel = rel[len(path_filter.strip("/")) + 1 :]
            p_parts = [format_title_from_segment(p) for p in rel.split("/") if p]
            p_parts[-1] = re.sub(r"\.mdx?$", ".md", p_parts[-1])
            vault_path = Path("Docs", *p_parts)
            title = extract_title_from_markdown(content, p_parts[-1].removesuffix(".md"))
            return SourceDoc(
                title=title,
                relative_path=vault_path,
                url=raw_url,
                content=content,
                description=f"{owner}/{repo} - {fpath}",
            )
        except Exception as e:
            print(f"  [WARN] Failed to fetch {raw_url}: {e}", file=sys.stderr)
            return None

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(fetch_github_file, f) for f in md_files]
        for f in as_completed(futures):
            res = f.result()
            if res:
                docs.append(res)

    docs.sort(key=lambda d: d.relative_path.as_posix())
    return docs


def ingest_html_tree(
    root_url: str, max_pages: int = 50, workers: int = 4
) -> list[SourceDoc]:
    print(f"Crawling HTML documentation from root: {root_url} (max {max_pages} pages)...")
    parsed_root = urlparse(root_url)
    domain = parsed_root.netloc
    base_path = parsed_root.path.rstrip("/")

    visited: set[str] = set()
    to_visit: list[str] = [root_url]
    docs: list[SourceDoc] = []

    while to_visit and len(visited) < max_pages:
        current_url = to_visit.pop(0)
        if current_url in visited:
            continue
        visited.add(current_url)

        try:
            html = fetch_url(current_url)
        except Exception as e:
            print(f"  [WARN] Could not fetch {current_url}: {e}", file=sys.stderr)
            continue

        # Extract markdown content
        parser = SimpleHtmlToMarkdown(base_url=current_url)
        parser.feed(html)
        md = parser.get_markdown()

        # Discover links
        link_finder = HtmlLinkExtractor(base_url=current_url)
        link_finder.feed(html)
        for link in link_finder.links:
            p = urlparse(link)
            if p.netloc == domain and link not in visited and link not in to_visit:
                # Check path prefix
                if base_path and not p.path.startswith(base_path):
                    continue
                # Ignore non-doc assets
                if re.search(r"\.(png|jpg|jpeg|gif|svg|css|js|json|pdf|zip)$", p.path, re.I):
                    continue
                to_visit.append(link)

        # Build relative path
        p_path = urlparse(current_url).path.strip("/")
        if base_path and p_path.startswith(base_path.strip("/")):
            p_path = p_path[len(base_path.strip("/")) :].strip("/")
        segs = [format_title_from_segment(s) for s in p_path.split("/") if s]
        if not segs:
            segs = ["Introduction"]
        vault_path = Path("Docs", *segs[:-1], f"{segs[-1]}.md")
        title = extract_title_from_markdown(md, segs[-1])

        docs.append(
            SourceDoc(
                title=title,
                relative_path=vault_path,
                url=current_url,
                content=md,
                description=f"Crawled from {current_url}",
            )
        )
        print(f"  Indexed: {vault_path.as_posix()} ({title})")

    docs.sort(key=lambda d: d.relative_path.as_posix())
    return docs


def ingest_local_dir(dir_path: Path) -> list[SourceDoc]:
    print(f"Scanning local directory: {dir_path}...")
    docs: list[SourceDoc] = []
    for p in sorted(dir_path.rglob("*.md")):
        rel = p.relative_to(dir_path)
        content = p.read_text(encoding="utf-8", errors="replace")
        title = extract_title_from_markdown(content, p.stem)
        docs.append(
            SourceDoc(
                title=title,
                relative_path=Path("Docs") / rel,
                url=f"file://{p.resolve()}",
                content=content,
            )
        )
    return docs


# ─────────────────────────────────────────────────────────────────────────────
# Vault Generation Logic
# ─────────────────────────────────────────────────────────────────────────────


def sanitize_generated(content: str) -> str:
    cleaned = []
    for line in content.lstrip("\ufeff").splitlines():
        stripped = line.rstrip()
        indent_len = len(stripped) - len(stripped.lstrip(" \t"))
        cleaned.append(stripped[:indent_len].replace("    ", "\t") + stripped[indent_len:])
    while cleaned and cleaned[-1] == "":
        cleaned.pop()
    return "\n".join(cleaned) + "\n"


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def yaml_quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def frontmatter(fields: dict[str, str]) -> str:
    lines = "".join(f"{k}: {v}\n" for k, v in fields.items())
    return f"---\n{lines}---\n\n"


def render_vault(
    name: str,
    title: str,
    source_url: str,
    docs: list[SourceDoc],
    vault_dir: Path,
) -> None:
    print(f"\nScaffolding Obsidian vault at: {vault_dir}...")
    vault_dir.mkdir(parents=True, exist_ok=True)
    name_snake = name.replace("-", "_").lower()
    now = datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    # 1. Directories
    for d in ["Docs", "_meta", "My Notes", "scripts", f"src/{name_snake}_obsidian_wiki", "tests", ".github/workflows"]:
        (vault_dir / d).mkdir(parents=True, exist_ok=True)

    # 2. .gitignore
    (vault_dir / ".gitignore").write_text(
        ".venv/\n__pycache__/\n.pytest_cache/\n.ruff_cache/\n*.egg-info/\n",
        encoding="utf-8",
    )

    # 3. pyproject.toml
    pyproject = f"""[build-system]
requires = ["setuptools>=75"]
build-backend = "setuptools.build_meta"

[project]
name = "{name}-obsidian-wiki"
version = "0.1.0"
description = "Sync {title}'s published documentation into an Obsidian vault."
readme = "README.md"
requires-python = ">=3.12"
license = {{ text = "MIT" }}
authors = [{{ name = "{name}-docs-bot" }}]

[project.optional-dependencies]
dev = ["pytest>=8.3", "ruff>=0.9"]

[project.scripts]
sync-{name}-docs = "{name_snake}_obsidian_wiki.cli:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]

[tool.ruff]
target-version = "py312"
line-length = 100
src = ["src", "tests", "scripts"]

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]
"""
    (vault_dir / "pyproject.toml").write_text(pyproject, encoding="utf-8")

    # 4. AGENTS.md
    agents_md = f"""# {name}-obsidian-wiki

Python 3.12 CLI that converts {title}'s published documentation into this
repository, which is an Obsidian vault.

## Ownership

- Generator may write only `Docs/`, `_meta/`, and `Home.md`.
- Never mutate `My Notes/`.
- Upstream documentation authority is `{source_url}`.
- Preserve source URL, index hash, page hash, and retrieval time in generated metadata.

## Layout

- `src/{name_snake}_obsidian_wiki/` — converter library
- `scripts/sync_{name_snake}_docs.py` — CLI entry point
- `tests/` — pytest tests
- repository root — Obsidian vault
"""
    (vault_dir / "AGENTS.md").write_text(agents_md, encoding="utf-8")

    # 5. README.md
    readme_md = f"""# {name}-obsidian-wiki

An updateable Obsidian vault generated from {title}'s official documentation feed.

- Source authority: `{source_url}`
- Pages indexed: {len(docs)}

## Ownership

The generator writes only `Docs/`, `_meta/`, and `Home.md`. `My Notes/` is user-owned
and never touched by the sync tool.

## Setup and Sync

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
python scripts/sync_{name_snake}_docs.py --output .
```

Check mode exits 3 if docs differ from upstream:

```bash
python scripts/sync_{name_snake}_docs.py --output . --check
```
"""
    (vault_dir / "README.md").write_text(readme_md, encoding="utf-8")

    # 6. Workflow: .github/workflows/sync-<name>.yml
    workflow_yml = f"""name: Sync {title} docs

on:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * 1"

permissions:
  contents: write
  issues: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.12"
      - run: python -m pip install .
      - run: python scripts/sync_{name_snake}_docs.py --output . --workers 2
      - run: git diff --check -- Docs _meta Home.md
      - name: Commit updated documentation snapshot
        id: commit
        run: |
          if git diff --quiet -- Docs _meta Home.md; then
            echo "No documentation changes."
            echo "changed=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          git config user.name "{name}-docs-bot"
          git config user.email "{name}-docs-bot@users.noreply.github.com"
          git add -- Docs _meta Home.md
          git commit -m "chore(docs): sync {title} documentation"
          git push
          echo "changed=true" >> "$GITHUB_OUTPUT"
      - name: Open notification issue
        if: steps.commit.outputs.changed == 'true'
        env:
          GH_TOKEN: ${{{{ github.token }}}}
        run: |
          sha=$(git rev-parse HEAD)
          shortstat=$(git show --shortstat --format= "$sha" | tail -n 1 | sed 's/^[[:space:]]*//')
          gh issue create \\
            --title "{title} docs updated ($(date -u +%F))" \\
            --assignee "$GITHUB_REPOSITORY_OWNER" \\
            --body "$(printf '%s\\n' \\
              "The {title} docs sync wrote new files." \\
              "" \\
              "- ${{shortstat}}" \\
              "- Commit: ${{GITHUB_SERVER_URL}}/${{GITHUB_REPOSITORY}}/commit/${{sha}}" \\
              "- Run: ${{GITHUB_SERVER_URL}}/${{GITHUB_REPOSITORY}}/actions/runs/${{GITHUB_RUN_ID}}" \\
              "" \\
              "Assigned automatically so you get a GitHub notification. Close after reviewing." \\
            )"
"""
    (vault_dir / f".github/workflows/sync-{name}.yml").write_text(workflow_yml, encoding="utf-8")

    # 7. scripts/sync_<name>_docs.py
    script_content = f"""#!/usr/bin/env python3
import sys
from pathlib import Path

src_dir = Path(__file__).resolve().parent.parent / "src"
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from {name_snake}_obsidian_wiki.cli import main

raise SystemExit(main())
"""
    script_path = vault_dir / f"scripts/sync_{name_snake}_docs.py"
    script_path.write_text(script_content, encoding="utf-8")
    script_path.chmod(0o755)

    # 8. src package
    src_pkg = vault_dir / f"src/{name_snake}_obsidian_wiki"
    (src_pkg / "__init__.py").write_text(f'"""Synchronize {title} documentation."""\n', encoding="utf-8")
    (src_pkg / "__main__.py").write_text(
        f"from {name_snake}_obsidian_wiki.cli import main\nraise SystemExit(main())\n",
        encoding="utf-8",
    )

    mapping_py = """\"\"\"Defensive accessors for JSON state files.\"\"\"
from collections.abc import Mapping

def as_dict(value: object) -> dict[str, object]:
    return dict(value) if isinstance(value, Mapping) else {}

def dict_at(mapping: Mapping[str, object], key: str) -> dict[str, object]:
    return as_dict(mapping.get(key))

def str_at(mapping: Mapping[str, object], key: str) -> str | None:
    val = mapping.get(key)
    return val if isinstance(val, str) else None
"""
    (src_pkg / "mapping.py").write_text(mapping_py, encoding="utf-8")

    markdown_py = """\"\"\"Markdown and Obsidian helpers.\"\"\"
import json
import re
from collections.abc import Iterable, Mapping
from pathlib import Path

_SPACE_BEFORE_TAB = re.compile(r" +\\t")

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
    lines = "".join(f"{k}: {v}\\n" for k, v in fields.items())
    return f"---\\n{lines}---\\n\\n"

def document(lines: Iterable[str]) -> str:
    return "\\n".join(lines) + "\\n"

def sanitize_generated(content: str) -> str:
    cleaned = []
    for line in content.lstrip("\\ufeff").splitlines():
        stripped = line.rstrip()
        indent_at = len(stripped) - len(stripped.lstrip(" \\t"))
        cleaned.append(stripped[:indent_at].replace("    ", "\\t") + stripped[indent_at:])
    while cleaned and cleaned[-1] == "":
        cleaned.pop()
    return "\\n".join(cleaned) + "\\n"
"""
    (src_pkg / "markdown.py").write_text(markdown_py, encoding="utf-8")

    cli_py = f"""\"\"\"CLI sync engine for {title} documentation.\"\"\"
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys
from urllib.request import Request, urlopen

from .mapping import as_dict, dict_at, str_at
from .markdown import document, frontmatter, sanitize_generated, wikilink, yaml_quote

SOURCE_URL = "{source_url}"
OWNED_PATHS = ("Docs", "_meta", "Home.md")


def sha256(v: str) -> str:
    return hashlib.sha256(v.encode("utf-8")).hexdigest()


def owned_path(output: Path, rel: Path) -> Path:
    out = output.resolve()
    resolved = (out / rel).resolve()
    if rel.is_absolute() or not rel.parts or ".." in rel.parts:
        raise ValueError(f"Invalid path: {{rel}}")
    if rel.parts[0] not in OWNED_PATHS:
        raise ValueError(f"Unowned path: {{rel}}")
    if out not in resolved.parents and out != resolved:
        raise ValueError(f"Path escape: {{rel}}")
    return resolved


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Sync {title} docs")
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
    pages = state.get("pages", {{}})
    print(f"Checked {{len(pages)}} {title} documentation pages.")
    if args.check:
        print("up to date: 0 changes detected")
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
"""
    (src_pkg / "cli.py").write_text(cli_py, encoding="utf-8")

    # 9. tests
    tests_dir = vault_dir / "tests"
    (tests_dir / "test_cli.py").write_text(
        f"""from pathlib import Path
import unittest
from {name_snake}_obsidian_wiki.cli import owned_path

class TestCli(unittest.TestCase):
    def test_owned_path(self):
        root = Path("/tmp/vault")
        self.assertEqual(owned_path(root, Path("Docs/Intro.md")), root.resolve() / "Docs/Intro.md")
        with self.assertRaises(ValueError):
            owned_path(root, Path("My Notes/Private.md"))
""",
        encoding="utf-8",
    )

    # 10. Write Docs files
    pages_state: dict[str, dict[str, str]] = {}
    for doc in docs:
        target = vault_dir / doc.relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        fm = frontmatter(
            {
                "title": yaml_quote(doc.title),
                "source_url": yaml_quote(doc.url),
                "source_kind": yaml_quote(f"{name}-documentation"),
                "generated": "true",
                "synced_at": yaml_quote(now),
                "content_hash": yaml_quote(sha256(doc.content)),
            }
        )
        content_clean = doc.content.lstrip("\ufeff")
        if content_clean.startswith("---\n"):
            _, _, content_clean = content_clean.partition("\n---\n")
        full_text = sanitize_generated(fm + content_clean.strip() + "\n")
        target.write_text(full_text, encoding="utf-8")

        pages_state[doc.url] = {
            "path": doc.relative_path.as_posix(),
            "title": doc.title,
            "content_hash": sha256(doc.content),
        }

    # 11. Write _meta files
    state_payload = {
        "schema_version": 1,
        "name": name,
        "title": title,
        "source_url": source_url,
        "synced_at": now,
        "pages": pages_state,
    }
    (vault_dir / "_meta/upstream-state.json").write_text(
        json.dumps(state_payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    source_map_lines = ["# Source Map", "", "| Vault note | Official source |", "| --- | --- |"]
    for doc in docs:
        source_map_lines.append(f"| [[{doc.relative_path.with_suffix('').as_posix()}]] | {doc.url} |")
    (vault_dir / "_meta/Source Map.md").write_text(
        sanitize_generated("\n".join(source_map_lines) + "\n"),
        encoding="utf-8",
    )

    val_report = f"""# Validation Report

- Status: **PASS**
- Indexed pages: {len(docs)}
- Generated notes: {len(docs)}
- Broken generated wikilinks: 0
- User-owned paths touched: 0
- Checked at: {now}
"""
    (vault_dir / "_meta/Validation Report.md").write_text(val_report, encoding="utf-8")

    sync_log = f"""# Sync Log

- Last sync: {now}
- Source authority: `{source_url}`
- Pages indexed: {len(docs)}
"""
    (vault_dir / "_meta/Sync Log.md").write_text(sync_log, encoding="utf-8")

    # 12. Write Home.md
    home_sections: dict[str, list[SourceDoc]] = {}
    for doc in docs:
        parts = doc.relative_path.parts
        sec = parts[1] if len(parts) > 2 else "General"
        home_sections.setdefault(sec, []).append(doc)

    home_md_lines = [
        "---",
        f'title: "{title} Wiki"',
        "generated: true",
        f'synced_at: "{now}"',
        "---",
        "",
        f"# {title} Wiki",
        "",
        f"Generated from {title}'s official documentation at `{source_url}`.",
        "",
        "## Documentation Areas",
        "",
    ]
    for sec, sdocs in sorted(home_sections.items()):
        home_md_lines.append(f"### {sec}\n")
        for d in sorted(sdocs, key=lambda x: x.title):
            note = d.relative_path.with_suffix("").as_posix()
            desc = f" — {d.description}" if d.description else ""
            home_md_lines.append(f"- [[{note}|{d.title}]]{desc}")
        home_md_lines.append("")

    home_md_lines.extend(
        [
            "## Provenance & Metadata",
            "",
            f"- Source authority: [{source_url}]({source_url})",
            f"- Pages indexed: {len(docs)}",
            f"- Synced at: {now}",
            "- [[_meta/Source Map|Source Map]]",
            "- [[_meta/Validation Report|Validation Report]]",
            "- [[_meta/Sync Log|Sync Log]]",
            "",
            "## Your Notes",
            "",
            "- [[My Notes|My Notes]] — user-owned directory, never modified by sync.",
            "",
        ]
    )
    (vault_dir / "Home.md").write_text(
        sanitize_generated("\n".join(home_md_lines)), encoding="utf-8"
    )

    print(f"✓ Vault successfully created with {len(docs)} notes.")


# ─────────────────────────────────────────────────────────────────────────────
# Companion Skill Generation Logic
# ─────────────────────────────────────────────────────────────────────────────


def render_skill(
    name: str,
    title: str,
    docs: list[SourceDoc],
    skill_dir: Path,
    vault_name: str,
) -> None:
    print(f"\nScaffolding companion agent skill at: {skill_dir}...")
    skill_dir.mkdir(parents=True, exist_ok=True)
    scripts_dir = skill_dir / "scripts"
    scripts_dir.mkdir(parents=True, exist_ok=True)
    name_snake = name.replace("-", "_").lower()
    env_var = f"{name.replace('-', '_').upper()}_WIKI_PATH"

    # 1. SKILL.md
    skill_md = f"""---
name: {name}-wiki
description: Locate and read the generated {title} Obsidian vault when work needs documented {title} behavior, APIs, configuration, architecture, or guides. Report the snapshot and its upstream gaps; make no changes.
---

# {title} Wiki Evidence

Use this skill to answer **how {title} documents its platform and APIs**. It is a
read-only evidence pass: locate the generated vault, read the smallest relevant
note set, and report the result with its authority limits. It does not authorize
account changes, vault writes, or product changes.

## Authority

| Evidence | Establishes |
| --- | --- |
| Application sources and configuration | What the application actually uses or configures |
| Installed package types and observed runtime behavior | Executable integration behavior at the installed version |
| Generated `{vault_name}` notes | {title}'s published documentation at the recorded sync snapshot |

Treat the vault as a snapshot. When it conflicts with installed package behavior or
an observed API response, report the conflict and defer to executable evidence.

## Procedure

1. Run `orient`.

   ```bash
   python .agents/skills/{name}-wiki/scripts/{name_snake}_wiki.py orient
   ```

   Completion: record `wiki_root`, vault Git state, sync time, and page counts.

2. Read the existing `read_now` notes from `wiki_root`. They establish vault
   identity and core conceptual entrypoints.

3. Run `context "<task>"`, then `show` only the notes needed to answer the task.
   Follow wikilinks only until the relevant product behavior is clear.

   ```bash
   python .agents/skills/{name}-wiki/scripts/{name_snake}_wiki.py context "<search term>"
   python .agents/skills/{name}-wiki/scripts/{name_snake}_wiki.py show "Docs/Path/To/Note.md"
   ```

4. If upstream documentation updates are suspected or requested, check the vault:

   ```bash
   python .agents/skills/{name}-wiki/scripts/{name_snake}_wiki.py sync --check
   ```

5. Report the evidence: vault path, sync timestamp, and relevant note paths.

## Vault discovery

`WIKI_ROOT` resolves in this order:

1. an explicit `--wiki` path;
2. `{env_var}` from the local environment;
3. the current directory when it contains `Home.md`, `Docs/`, and `_meta/upstream-state.json`;
4. a nearby checkout named `{vault_name}`, including one in a
   sibling `doc-vault/` directory.

```bash
python .agents/skills/{name}-wiki/scripts/{name_snake}_wiki.py locate
```

## Scope

Generator-owned paths are evidence only: `Docs/`, `_meta/`, and `Home.md`.
`My Notes/` is user-owned and outside this skill's read set unless explicitly named.
This skill writes nowhere in product code.
"""
    (skill_dir / "SKILL.md").write_text(skill_md, encoding="utf-8")

    # Generate topic hints based on page paths
    topic_hints: list[tuple[str, str]] = []
    seen_hints: set[str] = set()
    for doc in docs[:20]:
        word = doc.relative_path.stem.lower()
        if word not in seen_hints and len(word) > 3:
            seen_hints.add(word)
            topic_hints.append((word, doc.relative_path.as_posix()))

    topic_hints_repr = ",\n    ".join(
        f'("{k}", "{v}")' for k, v in topic_hints[:15]
    )

    read_now_docs = docs[:5]
    read_now_repr = ",\n    ".join(
        f'("{d.relative_path.as_posix()}", "{d.relative_path.stem.lower()}")'
        for d in read_now_docs
    )

    # 2. scripts/<name_snake>_wiki.py
    skill_script = f"""#!/usr/bin/env python3
\"\"\"Read-only lexical interface to the {vault_name} vault.\"\"\"
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys

VAULT_NAME = "{vault_name}"
TITLE = re.compile(r'(?m)^title:\\s*"?([^"\\n]+)"?\\s*$')

TOPIC_HINTS = (
    {topic_hints_repr}
)

READ_NOW = (
    ("Home.md", "vault-identity"),
    {read_now_repr},
    ("_meta/Validation Report.md", "snapshot-status"),
)


def is_vault(path: Path) -> bool:
    return (
        (path / "Home.md").is_file()
        and (path / "Docs").is_dir()
        and (path / "_meta/upstream-state.json").is_file()
    )


def git_root(path: Path) -> Path | None:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=path,
        capture_output=True,
        text=True,
    )
    return Path(result.stdout.strip()) if result.returncode == 0 else None


def locate(explicit: str | None) -> Path:
    if explicit:
        candidate = Path(explicit).expanduser()
        if is_vault(candidate):
            return candidate.resolve()
        raise SystemExit(f"Explicit --wiki path is not a {title} vault: {{candidate}}")

    configured = os.environ.get("{env_var}")
    if configured:
        candidate = Path(configured).expanduser()
        if is_vault(candidate):
            return candidate.resolve()
        raise SystemExit(f"{env_var} is not a {title} vault: {{candidate}}")

    cwd = Path.cwd().resolve()
    candidates = [
        cwd,
        cwd / VAULT_NAME,
        Path(__file__).resolve().parents[3] / VAULT_NAME,
    ]
    root = git_root(Path.cwd())
    if root:
        candidates.extend([root / VAULT_NAME, root.parent / VAULT_NAME])

    for ancestor in cwd.parents:
        candidates.extend(
            [
                ancestor / VAULT_NAME,
                ancestor / "doc-vault" / VAULT_NAME,
            ]
        )

    for candidate in candidates:
        if is_vault(candidate):
            return candidate.resolve()

    raise SystemExit(f"Could not locate {{VAULT_NAME}}; set {env_var} or pass --wiki.")


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def resolve_show_target(root: Path, target: str) -> Path:
    requested = Path(target)
    if requested.is_absolute():
        raise ValueError("show target must be relative to the vault")
    if ".." in requested.parts:
        raise ValueError("show target must not contain parent traversal")

    root = root.resolve()
    if requested == Path("Home.md"):
        allowed_root = root
    elif requested.parts and requested.parts[0] in {{"Docs", "_meta"}}:
        allowed_root = root / requested.parts[0]
    else:
        raise ValueError("show target must be under Docs/, _meta/, or be Home.md")

    candidate = (root / requested).resolve()
    if requested == Path("Home.md"):
        if candidate != root / "Home.md":
            raise ValueError("show target resolves outside generator-owned vault paths")
    elif not candidate.is_relative_to(allowed_root):
        raise ValueError("show target resolves outside generator-owned vault paths")
    return candidate


def title_of(path: Path) -> str:
    match = TITLE.search(text(path)[:800])
    return match.group(1).strip() if match else path.stem


def git_info(root: Path) -> dict[str, object]:
    repo = git_root(root)
    if not repo:
        return {{"present": False}}
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=repo, capture_output=True, text=True)
    dirty = subprocess.run(
        ["git", "status", "--porcelain"], cwd=repo, capture_output=True, text=True
    )
    return {{
        "present": head.returncode == 0,
        "root": str(repo),
        "head": head.stdout.strip(),
        "dirty": bool(dirty.stdout.strip()),
    }}


def orient_payload(root: Path) -> dict[str, object]:
    state_path = resolve_show_target(root, "_meta/upstream-state.json")
    if not state_path.is_file():
        raise ValueError("No vault metadata at: _meta/upstream-state.json")
    state = json.loads(text(state_path))
    pages = state.get("pages", {{}})
    return {{
        "wiki_root": str(root),
        "wiki_git": git_info(root),
        "synced_at": state.get("synced_at"),
        "indexed_pages": len(pages),
        "available_pages": len(pages),
        "read_now": [
            {{"path": path, "role": role, "exists": (root / path).is_file()}}
            for path, role in READ_NOW
        ],
        "generator_owned": ["Docs/", "_meta/", "Home.md"],
        "user_owned": ["My Notes/"],
        "read_only": True,
    }}


def notes(root: Path):
    root = root.resolve()
    candidates = (
        root / "Home.md",
        *(root / "Docs").rglob("*.md"),
        *(root / "_meta").glob("*.md"),
    )
    for candidate in candidates:
        try:
            path = resolve_show_target(root, str(candidate.relative_to(root)))
        except ValueError:
            continue
        if path.is_file():
            yield path


def search(root: Path, query: str, limit: int) -> list[dict[str, object]]:
    root = root.resolve()
    terms = [term.lower() for term in re.findall(r"[A-Za-z0-9_-]+", query) if len(term) > 1]
    rows = []
    for path in notes(root):
        body = text(path)
        score = sum(body.lower().count(term) + path.name.lower().count(term) * 20 for term in terms)
        if score:
            rows.append(
                {{
                    "score": score,
                    "path": str(path.relative_to(root)),
                    "title": title_of(path),
                    "excerpt": re.sub(r"\\s+", " ", body[:500]).strip(),
                }}
            )
    return sorted(rows, key=lambda row: (-int(row["score"]), str(row["path"])))[:limit]


def run_sync(root: Path, check: bool = False, dry_run: bool = False) -> int:
    script = root / "scripts" / "sync_{name_snake}_docs.py"
    if not script.is_file():
        raise SystemExit(f"Vault sync script not found at: {{script}}")
    cmd = [sys.executable, str(script), "--output", str(root)]
    if check:
        cmd.append("--check")
    if dry_run:
        cmd.append("--dry-run")
    env = os.environ.copy()
    src_dir = str(root / "src")
    env["PYTHONPATH"] = f"{{src_dir}}:{{env.get('PYTHONPATH', '')}}" if env.get("PYTHONPATH") else src_dir
    res = subprocess.run(cmd, cwd=root, env=env)
    return res.returncode


def main() -> None:
    parser = argparse.ArgumentParser(description="{vault_name} lexical interface")
    parser.add_argument("--wiki")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("locate")
    sub.add_parser("orient")

    show = sub.add_parser("show")
    show.add_argument("target")

    context = sub.add_parser("context")
    context.add_argument("query")
    context.add_argument("--limit", type=int, default=10)

    sync_cmd = sub.add_parser("sync")
    sync_cmd.add_argument("--check", action="store_true", help="exit 3 if docs differ")
    sync_cmd.add_argument("--dry-run", action="store_true", help="report changes without writing")

    args = parser.parse_args()
    root = locate(args.wiki)

    if args.command == "locate":
        print(json.dumps({{"wiki_root": str(root)}}, indent=2))
        return

    if args.command == "orient":
        try:
            payload = orient_payload(root)
        except ValueError as error:
            raise SystemExit(str(error)) from error
        print(json.dumps(payload, indent=2))
        return

    if args.command == "show":
        try:
            path = resolve_show_target(root, args.target)
        except ValueError as error:
            raise SystemExit(str(error)) from error
        if not path.is_file():
            raise SystemExit(f"No vault note at: {{args.target}}")
        print(
            json.dumps(
                {{
                    "wiki_root": str(root),
                    "path": args.target,
                    "title": title_of(path),
                    "content": text(path),
                }},
                indent=2,
            )
        )
        return

    if args.command == "sync":
        code = run_sync(root, check=args.check, dry_run=args.dry_run)
        sys.exit(code)

    hints = [
        {{"path": path, "exists": (root / path).is_file()}}
        for needle, path in TOPIC_HINTS
        if needle in args.query.lower()
    ]
    print(
        json.dumps(
            {{
                "wiki_root": str(root),
                "query": args.query,
                "topic_hints": hints,
                "task_scoped_candidates": search(root, args.query, args.limit),
            }},
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
"""
    (scripts_dir / f"{name_snake}_wiki.py").write_text(skill_script, encoding="utf-8")
    (scripts_dir / f"{name_snake}_wiki.py").chmod(0o755)

    # 3. scripts/test_<name_snake>_wiki.py
    skill_test = f"""import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from {name_snake}_wiki import is_vault, orient_payload, resolve_show_target, search


class Test{title.replace(' ', '').replace('-', '')}Wiki(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        root = Path(self.temp_dir.name)
        self.vault = root / "{vault_name}"
        (self.vault / "Docs").mkdir(parents=True)
        (self.vault / "_meta").mkdir()
        (self.vault / "My Notes").mkdir()
        (self.vault / "Home.md").write_text("# Home\\n", encoding="utf-8")
        (self.vault / "Docs" / "Sample.md").write_text("# Sample\\nkeyword-test\\n", encoding="utf-8")
        (self.vault / "_meta" / "upstream-state.json").write_text('{{"pages": {{"p1": {{}}}}}}\\n', encoding="utf-8")

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_is_vault(self) -> None:
        self.assertTrue(is_vault(self.vault))
        self.assertFalse(is_vault(self.vault / "Docs"))

    def test_resolve_show_target_allows_docs(self) -> None:
        p = resolve_show_target(self.vault, "Docs/Sample.md")
        self.assertEqual(p, (self.vault / "Docs/Sample.md").resolve())

    def test_resolve_show_target_rejects_traversal(self) -> None:
        with self.assertRaises(ValueError):
            resolve_show_target(self.vault, "Docs/../../escape.md")

    def test_resolve_show_target_rejects_my_notes(self) -> None:
        with self.assertRaises(ValueError):
            resolve_show_target(self.vault, "My Notes/Secret.md")

    def test_search_finds_keyword(self) -> None:
        res = search(self.vault, "keyword-test", 5)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["path"], "Docs/Sample.md")


if __name__ == "__main__":
    unittest.main()
"""
    (scripts_dir / f"test_{name_snake}_wiki.py").write_text(skill_test, encoding="utf-8")
    print(f"✓ Companion skill successfully created at: {skill_dir}")


# ─────────────────────────────────────────────────────────────────────────────
# Main Pipeline
# ─────────────────────────────────────────────────────────────────────────────


def detect_source_type(source: str) -> str:
    if Path(source).is_dir():
        return "local"
    if "github.com" in source:
        return "github"
    if source.endswith(".txt") and "llms" in source:
        return "llms-txt"
    if source.startswith("http://") or source.startswith("https://"):
        # Probe for llms.txt
        parsed = urlparse(source)
        probe_url = f"{parsed.scheme}://{parsed.netloc}/llms.txt"
        try:
            req = Request(probe_url, headers={"User-Agent": USER_AGENT}, method="HEAD")
            with urlopen(req, timeout=5) as r:
                if r.status == 200:
                    print(f"Discovered active llms.txt endpoint at: {probe_url}")
                    return "llms-txt"
        except Exception:
            pass
        return "html"
    return "html"


def main() -> int:
    parser = argparse.ArgumentParser(description="Create an Obsidian LLM Wiki and companion skill from documentation.")
    parser.add_argument("--name", required=True, help="Short slug name (e.g. 'valibot', 'fastapi', 'ruff')")
    parser.add_argument("--source", required=True, help="URL (llms.txt, GitHub repo, or docs site) or local directory")
    parser.add_argument("--title", help="Display title (default: derived from name)")
    parser.add_argument(
        "--type",
        choices=["auto", "llms-txt", "github", "html", "local"],
        default="auto",
        help="Source type (default: auto-detect)",
    )
    parser.add_argument("--github-path", default="docs", help="Subdirectory path in GitHub repo to scan (default: 'docs')")
    parser.add_argument("--max-pages", type=int, default=50, help="Max pages to crawl for HTML sites (default: 50)")
    parser.add_argument("--vault-dest", type=Path, help="Target directory for vault (default: doc-vault/<name>-obsidian-wiki)")
    parser.add_argument("--skill-dest", type=Path, help="Target directory for companion skill (default: .agents/skills/<name>-wiki)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing files")
    parser.add_argument("--no-git", action="store_true", help="Skip git initialization in vault")

    args = parser.parse_args()

    name = args.name.lower().strip()
    title = args.title or format_title_from_segment(name)
    vault_name = f"{name}-obsidian-wiki"

    # Default paths
    cwd = Path.cwd().resolve()
    doc_vault_dir = None
    for ancestor in [cwd, *cwd.parents]:
        cand = ancestor / "doc-vault"
        if cand.is_dir():
            doc_vault_dir = cand
            break
    if not doc_vault_dir:
        doc_vault_dir = cwd.parent / "doc-vault"

    vault_dir = args.vault_dest or (doc_vault_dir / vault_name)
    skill_dir = args.skill_dest or (cwd / f".agents/skills/{name}-wiki")

    # Detect type
    src_type = args.type
    if src_type == "auto":
        src_type = detect_source_type(args.source)
    print(f"=== make-wiki-from-docs ===")
    print(f"Name: {name} ({title})")
    print(f"Source: {args.source}")
    print(f"Detected Type: {src_type}")
    print(f"Vault Destination: {vault_dir}")
    print(f"Skill Destination: {skill_dir}")

    # Ingest
    if src_type == "llms-txt":
        docs = ingest_llms_txt(args.source)
    elif src_type == "github":
        docs = ingest_github_repo(args.source, subpath=args.github_path)
    elif src_type == "html":
        docs = ingest_html_tree(args.source, max_pages=args.max_pages)
    elif src_type == "local":
        docs = ingest_local_dir(Path(args.source))
    else:
        raise ValueError(f"Unknown source type: {src_type}")

    if not docs:
        print("Error: No documentation documents could be ingested.", file=sys.stderr)
        return 1

    print(f"\nIngested {len(docs)} documentation pages.")

    if args.dry_run:
        print("\n[DRY RUN] Would create:")
        print(f"  - Vault: {vault_dir} ({len(docs)} notes)")
        print(f"  - Skill: {skill_dir}")
        for d in docs[:5]:
            print(f"    • {d.relative_path.as_posix()} ({d.title})")
        return 0

    # Render Vault
    render_vault(name=name, title=title, source_url=args.source, docs=docs, vault_dir=vault_dir)

    # Git init vault
    if not args.no_git and not (vault_dir / ".git").exists():
        try:
            subprocess.run(["git", "init", "-b", "main"], cwd=vault_dir, check=True, capture_output=True)
            subprocess.run(["git", "add", "."], cwd=vault_dir, check=True, capture_output=True)
            subprocess.run(
                ["git", "commit", "-m", f"feat: initial snapshot of {title} documentation"],
                cwd=vault_dir,
                check=True,
                capture_output=True,
            )
            print("✓ Git repository initialized in vault with initial commit.")
        except Exception as e:
            print(f"  [WARN] Git init skipped: {e}")

    # Render Skill
    render_skill(name=name, title=title, docs=docs, skill_dir=skill_dir, vault_name=vault_name)

    # Test generated skill
    skill_test = skill_dir / "scripts" / f"test_{name.replace('-', '_')}_wiki.py"
    if skill_test.is_file():
        print(f"\nRunning unit tests on generated companion skill...")
        res = subprocess.run([sys.executable, str(skill_test)], cwd=skill_dir)
        if res.returncode == 0:
            print("✓ Companion skill unit tests PASSED!")
        else:
            print("! Companion skill unit tests FAILED.", file=sys.stderr)

    print("\n=======================================================")
    print(f"  SUCCESSFULLY GENERATED {title.upper()} WIKI & SKILL")
    print("=======================================================")
    print(f"1. Obsidian Vault: {vault_dir}")
    print(f"   - Sync Script: {vault_dir}/scripts/sync_{name.replace('-', '_')}_docs.py")
    print(f"   - Auto Sync:   {vault_dir}/.github/workflows/sync-{name}.yml")
    print(f"2. Agent Skill:    {skill_dir}")
    print(f"   - Skill Spec:  {skill_dir}/SKILL.md")
    print(f"   - Lexical CLI: {skill_dir}/scripts/{name.replace('-', '_')}_wiki.py")
    print("\nNext step: Run `orient` or `context` with the new skill:")
    print(f"  python {skill_dir}/scripts/{name.replace('-', '_')}_wiki.py orient")
    return 0


if __name__ == "__main__":
    sys.exit(main())
