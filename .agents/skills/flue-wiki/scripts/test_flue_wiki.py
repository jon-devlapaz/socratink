"""Regression tests for the read-only Flue wiki discovery helper."""

from __future__ import annotations

import os
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent))
from flue_wiki import locate_wiki


def make_vault(root: Path) -> Path:
    vault = root / "doc-vault" / "flue-obsidian-wiki"
    (vault / "Docs").mkdir(parents=True)
    (vault / "Project Context").mkdir()
    (vault / "Home.md").write_text("# Flue", encoding="utf-8")
    (vault / "Project Context" / "AGENTS.md").write_text("# Context", encoding="utf-8")
    return vault


class LocateWikiTests(unittest.TestCase):
    def test_discovers_doc_vault_sibling_without_environment_variable(self) -> None:
        with TemporaryDirectory() as temporary:
            root = Path(temporary)
            expected = make_vault(root)
            app = root / "active" / "socratink" / "product" / "socratink"
            app.mkdir(parents=True)
            with patch.dict(os.environ, {}, clear=True), patch("flue_wiki.git_toplevel", return_value=None):
                with patch("flue_wiki.Path.cwd", return_value=app):
                    self.assertEqual(locate_wiki(), expected.resolve())


if __name__ == "__main__":
    unittest.main()
