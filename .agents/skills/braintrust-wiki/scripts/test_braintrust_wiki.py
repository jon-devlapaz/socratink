import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from braintrust_wiki import orient_payload, resolve_show_target, search


class ResolveShowTargetTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        temporary_root = Path(self.temporary_directory.name)
        self.vault = temporary_root / "braintrust-obsidian-wiki"
        (self.vault / "Docs").mkdir(parents=True)
        (self.vault / "_meta").mkdir()
        (self.vault / "My Notes").mkdir()
        (self.vault / "Home.md").write_text("# Home\n", encoding="utf-8")
        (self.vault / "Docs" / "Valid.md").write_text("# Valid\nsearchable-docs-note\n", encoding="utf-8")
        (self.vault / "_meta" / "upstream-state.json").write_text("{}\n", encoding="utf-8")
        (self.vault / "_meta" / "Valid.md").write_text("# Valid metadata\nsearchable-meta-note\n", encoding="utf-8")
        (self.vault / "My Notes" / "Private.md").write_text("# Private\n", encoding="utf-8")
        self.outside_note = temporary_root / "outside.md"
        self.outside_note.write_text("# Outside\n", encoding="utf-8")

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_allows_generator_owned_note(self) -> None:
        resolved = resolve_show_target(self.vault, "Docs/Valid.md")

        self.assertEqual(resolved, (self.vault / "Docs" / "Valid.md").resolve())

    def test_rejects_absolute_path(self) -> None:
        with self.assertRaisesRegex(ValueError, "relative"):
            resolve_show_target(self.vault, str(self.outside_note.resolve()))

    def test_rejects_parent_traversal(self) -> None:
        with self.assertRaisesRegex(ValueError, "parent traversal"):
            resolve_show_target(self.vault, "Docs/../../outside.md")

    def test_rejects_symlink_escape(self) -> None:
        (self.vault / "Docs" / "Escape.md").symlink_to(self.outside_note)

        with self.assertRaisesRegex(ValueError, "outside generator-owned"):
            resolve_show_target(self.vault, "Docs/Escape.md")

    def test_rejects_user_owned_path(self) -> None:
        with self.assertRaisesRegex(ValueError, "Docs/"):
            resolve_show_target(self.vault, "My Notes/Private.md")

    def test_search_skips_external_symlink(self) -> None:
        self.outside_note.write_text("private-external-search-sentinel\n", encoding="utf-8")
        (self.vault / "Docs" / "Escape.md").symlink_to(self.outside_note)

        self.assertEqual(search(self.vault, "private-external-search-sentinel", 10), [])

    def test_search_reads_valid_docs_and_meta_notes(self) -> None:
        docs_results = search(self.vault, "searchable-docs-note", 10)
        meta_results = search(self.vault, "searchable-meta-note", 10)

        self.assertEqual([row["path"] for row in docs_results], ["Docs/Valid.md"])
        self.assertEqual([row["path"] for row in meta_results], ["_meta/Valid.md"])

    def test_orient_rejects_external_metadata_symlink_before_reading(self) -> None:
        outside_state = self.outside_note.with_suffix(".json")
        outside_state.write_text('{"synced_at":"external"}\n', encoding="utf-8")
        (self.vault / "_meta" / "upstream-state.json").unlink()
        (self.vault / "_meta" / "upstream-state.json").symlink_to(outside_state)

        with patch("braintrust_wiki.text") as read:
            with self.assertRaisesRegex(ValueError, "outside generator-owned"):
                orient_payload(self.vault)
            read.assert_not_called()

    def test_orient_reads_valid_metadata(self) -> None:
        state = {
            "synced_at": "2026-08-24T00:00:00Z",
            "pages": {"one": {}, "two": {}},
            "unavailable_pages": ["missing"],
        }
        (self.vault / "_meta" / "upstream-state.json").write_text(
            json.dumps(state),
            encoding="utf-8",
        )

        with patch("braintrust_wiki.git_info", return_value={"present": False}):
            payload = orient_payload(self.vault)

        self.assertEqual(payload["synced_at"], state["synced_at"])
        self.assertEqual(payload["available_pages"], 2)
        self.assertEqual(payload["indexed_pages"], 3)
        self.assertEqual(payload["unavailable_pages"], ["missing"])
        self.assertIs(payload["read_only"], True)


if __name__ == "__main__":
    unittest.main()
