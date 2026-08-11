import ast
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]


class PackageTests(unittest.TestCase):
    def test_package_is_one_td_node(self):
        init_source = (ROOT / "__init__.py").read_text(encoding="utf-8")
        self.assertIn('"TD_MiniMax_H3_Prompt": TDMinimaxH3Prompt', init_source)
        self.assertEqual(init_source.count('": TDMinimaxH3Prompt'), 1)

    def test_runtime_python_parses(self):
        for relative in ("__init__.py", "api_client.py", "h3_rules.py", "nodes.py"):
            ast.parse((ROOT / relative).read_text(encoding="utf-8"), filename=relative)

    def test_td_editor_contains_material_and_dialogue_shortcuts(self):
        source = (ROOT / "web/td_minimax_h3_prompt.js").read_text(encoding="utf-8")
        self.assertIn('triggerRange(editor, "@")', source)
        self.assertIn('triggerRange(editor, "#")', source)
        self.assertIn('"@首帧图片"', source)
        self.assertIn('"@尾帧图片"', source)
        self.assertIn('"@" + chinese + number', source)
        self.assertIn('T2VA: []', source)
        self.assertIn('className = "td-h3-mention', source)
        self.assertIn('chip.dataset.token = resource.token', source)
        self.assertIn('className = "td-h3-dialogue"', source)
        self.assertIn('className = "td-h3-dialogue-text"', source)
        self.assertIn('className = "td-h3-chip-remove"', source)
        self.assertIn('handleDialogueKeydown(event, chip, editable)', source)
        self.assertIn('removeStructuredChip(chip)', source)
        self.assertIn('event.key === "Enter"', source)
        self.assertIn('event.key === "Escape" || event.key === "Tab"', source)
        self.assertIn('event.key === "ArrowRight" && offset === length', source)
        self.assertIn('event.key === "ArrowLeft" && offset === 0', source)
        self.assertIn('event.key === "Backspace" || event.key === "Delete"', source)
        self.assertIn('handleEditorStructuredDelete(event, editor)', source)
        self.assertIn('adjacentStructuredChip(editor, direction)', source)
        self.assertIn('deleteSelectedStructuredContent(editor)', source)
        self.assertIn('range.intersectsNode(chip)', source)
        self.assertIn('node.querySelector(".td-h3-dialogue-text")?.textContent', source)
        self.assertIn('output += "<d>[" + language', source)
        self.assertIn('height:190px;min-height:190px;max-height:190px', source)
        self.assertIn('promptWidget.hidden = true', source)
        self.assertIn('node.setSize([Math.max(node.size?.[0] || 0, 430), 335])', source)
        self.assertIn("syncMediaInputs", source)
        self.assertNotIn("SETTINGS_ENDPOINT", source)
        self.assertNotIn("MiniMaxH3Easy", source)

    def test_no_unneeded_workflow_nodes_or_guides(self):
        self.assertFalse((ROOT / "workflow").exists())
        self.assertFalse((ROOT / "prompt_guides").exists())
        self.assertFalse((ROOT / "UPSTREAM_README_CN.md").exists())
        self.assertEqual(
            sorted(path.name for path in (ROOT / "guides").iterdir()),
            [
                "VIDEO_PROMPT_WRITING_GUIDE_base_en.md",
                "VIDEO_PROMPT_WRITING_GUIDE_ref_en.md",
            ],
        )


if __name__ == "__main__":
    unittest.main()
