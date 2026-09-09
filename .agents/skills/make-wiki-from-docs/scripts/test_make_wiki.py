import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

from make_wiki import (
    SimpleHtmlToMarkdown,
    SourceDoc,
    detect_source_type,
    extract_title_from_markdown,
    render_skill,
    render_vault,
)


class TestMakeWiki(unittest.TestCase):
    def test_detect_source_type(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            self.assertEqual(detect_source_type(td), "local")
        self.assertEqual(
            detect_source_type("https://github.com/withastro/flue"),
            "github",
        )
        self.assertEqual(
            detect_source_type("https://docs.transluce.org/llms.txt"),
            "llms-txt",
        )

    def test_html_to_markdown_converter(self) -> None:
        html = """
        <html>
        <body>
            <h1>Getting Started</h1>
            <p>Welcome to the <strong>documentation</strong>.</p>
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
            </ul>
            <pre class="language-python"><code>def hello():
    return "world"</code></pre>
            <p>Visit <a href="https://example.com/guide">our guide</a> for more.</p>
        </body>
        </html>
        """
        parser = SimpleHtmlToMarkdown(base_url="https://example.com")
        parser.feed(html)
        md = parser.get_markdown()

        self.assertIn("# Getting Started", md)
        self.assertIn("**documentation**", md)
        self.assertIn("* Item 1", md)
        self.assertIn("```python", md)
        self.assertIn('def hello():', md)
        self.assertIn("[our guide](https://example.com/guide)", md)

    def test_extract_title_from_markdown(self) -> None:
        md_with_h1 = "# Core Architecture\nSome text"
        self.assertEqual(extract_title_from_markdown(md_with_h1, "Fallback"), "Core Architecture")

        md_with_fm = "---\ntitle: 'Quick Guide'\n---\nBody"
        self.assertEqual(extract_title_from_markdown(md_with_fm, "Fallback"), "Quick Guide")

        md_plain = "Just plain text without header."
        self.assertEqual(extract_title_from_markdown(md_plain, "Fallback"), "Fallback")

    def test_render_vault_and_skill_end_to_end(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            vault_dir = root / "sample-obsidian-wiki"
            skill_dir = root / "sample-wiki"

            sample_docs = [
                SourceDoc(
                    title="Intro",
                    relative_path=Path("Docs/Introduction.md"),
                    url="https://example.com/intro.md",
                    content="# Intro\nWelcome.",
                    description="Introduction page",
                ),
                SourceDoc(
                    title="API Reference",
                    relative_path=Path("Docs/API/Reference.md"),
                    url="https://example.com/api.md",
                    content="# API Reference\nDetails.",
                    description="API details",
                ),
            ]

            # 1. Render Vault
            render_vault(
                name="sample",
                title="Sample Library",
                source_url="https://example.com/docs",
                docs=sample_docs,
                vault_dir=vault_dir,
            )

            # Assert Vault files exist
            self.assertTrue((vault_dir / "Home.md").is_file())
            self.assertTrue((vault_dir / "README.md").is_file())
            self.assertTrue((vault_dir / "AGENTS.md").is_file())
            self.assertTrue((vault_dir / "pyproject.toml").is_file())
            self.assertTrue((vault_dir / "scripts/sync_sample_docs.py").is_file())
            self.assertTrue((vault_dir / ".github/workflows/sync-sample.yml").is_file())
            self.assertTrue((vault_dir / "Docs/Introduction.md").is_file())
            self.assertTrue((vault_dir / "Docs/API/Reference.md").is_file())
            self.assertTrue((vault_dir / "_meta/upstream-state.json").is_file())
            self.assertTrue((vault_dir / "_meta/Source Map.md").is_file())
            self.assertTrue((vault_dir / "_meta/Validation Report.md").is_file())

            # 2. Render Skill
            render_skill(
                name="sample",
                title="Sample Library",
                docs=sample_docs,
                skill_dir=skill_dir,
                vault_name="sample-obsidian-wiki",
            )

            # Assert Skill files exist
            self.assertTrue((skill_dir / "SKILL.md").is_file())
            self.assertTrue((skill_dir / "scripts/sample_wiki.py").is_file())
            self.assertTrue((skill_dir / "scripts/test_sample_wiki.py").is_file())

            # 3. Test running the generated skill unit tests
            test_res = subprocess.run(
                [sys.executable, str(skill_dir / "scripts/test_sample_wiki.py")],
                capture_output=True,
                text=True,
            )
            self.assertEqual(test_res.returncode, 0, f"Generated test failed: {test_res.stderr}")

            # 4. Test orient on generated skill
            orient_res = subprocess.run(
                [sys.executable, str(skill_dir / "scripts/sample_wiki.py"), "--wiki", str(vault_dir), "orient"],
                capture_output=True,
                text=True,
            )
            self.assertEqual(orient_res.returncode, 0, f"Orient failed: {orient_res.stderr}")
            payload = json.loads(orient_res.stdout)
            self.assertEqual(payload["available_pages"], 2)

            # 5. Test context search on generated skill
            ctx_res = subprocess.run(
                [sys.executable, str(skill_dir / "scripts/sample_wiki.py"), "--wiki", str(vault_dir), "context", "intro"],
                capture_output=True,
                text=True,
            )
            self.assertEqual(ctx_res.returncode, 0)
            ctx_data = json.loads(ctx_res.stdout)
            self.assertTrue(len(ctx_data["task_scoped_candidates"]) >= 1)

            # 6. Test show on generated skill
            show_res = subprocess.run(
                [sys.executable, str(skill_dir / "scripts/sample_wiki.py"), "--wiki", str(vault_dir), "show", "Docs/Introduction.md"],
                capture_output=True,
                text=True,
            )
            self.assertEqual(show_res.returncode, 0)
            show_data = json.loads(show_res.stdout)
            self.assertIn("Welcome", show_data["content"])


if __name__ == "__main__":
    unittest.main()
