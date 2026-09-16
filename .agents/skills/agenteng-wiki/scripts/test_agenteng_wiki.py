import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from agenteng_wiki import is_vault, orient_payload, resolve_show_target, search


class TestAgenticEngineeringWiki(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        root = Path(self.temp_dir.name)
        self.vault = root / "agenteng-obsidian-wiki"
        (self.vault / "Docs").mkdir(parents=True)
        (self.vault / "_meta").mkdir()
        (self.vault / "My Notes").mkdir()
        (self.vault / "Home.md").write_text("# Home\n", encoding="utf-8")
        (self.vault / "Docs" / "Sample.md").write_text("# Sample\nkeyword-test\n", encoding="utf-8")
        (self.vault / "_meta" / "upstream-state.json").write_text('{"pages": {"p1": {}}}\n', encoding="utf-8")

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
