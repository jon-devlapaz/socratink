from pathlib import Path
import unittest
from agenteng_obsidian_wiki.cli import owned_path

class TestCli(unittest.TestCase):
    def test_owned_path(self):
        root = Path("/tmp/vault")
        self.assertEqual(owned_path(root, Path("Docs/Intro.md")), root.resolve() / "Docs/Intro.md")
        with self.assertRaises(ValueError):
            owned_path(root, Path("My Notes/Private.md"))
