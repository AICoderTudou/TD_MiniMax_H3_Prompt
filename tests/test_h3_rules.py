import pathlib
import sys
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from h3_rules import (
    MODE_LABELS,
    build_system_prompt,
    build_user_message,
    clean_model_output,
    infer_duration_seconds,
    missing_required_fields,
    normalize_reference_mentions,
)


class H3RuleTests(unittest.TestCase):
    def test_mode_labels_are_chinese_and_complete(self):
        self.assertEqual(len(MODE_LABELS), 5)
        self.assertIn("文生视频（T2VA）", MODE_LABELS)
        self.assertIn("全能参考（Ref2VA）", MODE_LABELS)

    def test_base_modes_load_td_base_rule(self):
        prompt = build_system_prompt("首尾帧生视频（FL2VA）")
        self.assertIn("Video Prompt Writing Guide", prompt)
        self.assertIn("integrated_multimodal_description", prompt)
        self.assertNotIn("subject_definitions, summary, retention_analysis", prompt)

    def test_ref_mode_loads_six_section_rule(self):
        prompt = build_system_prompt("全能参考（Ref2VA）")
        expected = (
            "subject_definitions",
            "summary",
            "retention_analysis",
            "detailed_description",
            "overall_soundscape",
            "non_diegetic_music",
        )
        positions = [prompt.index(name) for name in expected]
        self.assertEqual(positions, sorted(positions))

    def test_user_message_infers_duration_and_reference_role(self):
        message = build_user_message("尾帧生视频（L2VA）", "制作一段8秒的视频")
        self.assertIn("Target duration: 8.00 seconds", message)
        self.assertIn("last-frame image as <Picture 1>", message)
        self.assertEqual(infer_duration_seconds("10秒短片"), 10.0)

    def test_explicit_duration_and_friendly_mentions(self):
        message = build_user_message("首尾帧生视频（FL2VA）", "从@首帧图片运动到@尾帧图片", 9.5)
        self.assertIn("Target duration: 9.50 seconds", message)
        self.assertIn("<Picture 1>", message)
        self.assertIn("<Picture 2>", message)
        self.assertNotIn("@首帧图片", message)
        ref = normalize_reference_mentions("全能参考（Ref2VA）", "参考@图片1、@视频2和@音频1")
        self.assertEqual(ref, "参考<Picture 1>、<Video 2>和<Audio 1>")

    def test_clean_fenced_output(self):
        self.assertEqual(clean_model_output("褚text\nhello\n褚".replace("褚", chr(96) * 3)), "hello")

    def test_missing_fields_is_non_destructive_report(self):
        prompt = "subject_definitions:\na\nsummary:\nb"
        missing = missing_required_fields("全能参考（Ref2VA）", prompt)
        self.assertIn("detailed_description", missing)
        self.assertNotIn("summary", missing)

    def test_only_two_rule_documents_are_packaged(self):
        guides = sorted(path.name for path in (ROOT / "guides").iterdir() if path.is_file())
        self.assertEqual(
            guides,
            [
                "VIDEO_PROMPT_WRITING_GUIDE_base_en.md",
                "VIDEO_PROMPT_WRITING_GUIDE_ref_en.md",
            ],
        )


if __name__ == "__main__":
    unittest.main()
