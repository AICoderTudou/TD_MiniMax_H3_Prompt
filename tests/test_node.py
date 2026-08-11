import pathlib
import sys
import unittest
from unittest import mock


PACKAGE_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PACKAGE_ROOT.parent))

from TD_MiniMax_H3_Prompt import nodes


class NodeTests(unittest.TestCase):
    def test_fixed_endpoint_and_model(self):
        self.assertEqual(nodes.API_URL, "https://api.seedance.nz/v1/chat/completions")
        self.assertEqual(nodes.MODEL_NAME, "deepseek/deepseek-v4-flash")

    def test_user_inputs_and_hidden_dynamic_media(self):
        spec = nodes.TDMinimaxH3Prompt.INPUT_TYPES()
        self.assertEqual(list(spec["required"]), ["task_type", "duration", "user_request", "api_key"])
        self.assertEqual(len(spec["optional"]), 15)
        self.assertEqual(spec["optional"]["media_1"], ("*", {"hidden": True}))
        self.assertEqual(spec["optional"]["media_15"], ("*", {"hidden": True}))

    def test_output_is_prompt_string_only(self):
        self.assertEqual(nodes.TDMinimaxH3Prompt.RETURN_TYPES, ("STRING",))
        self.assertEqual(nodes.TDMinimaxH3Prompt.RETURN_NAMES, ("H3提示词",))

    def test_generation_uses_fixed_api_and_ignores_media_payload(self):
        generated = "\n\n".join(
            [
                "subject_definitions:\n<Subject 1> is defined by <Picture 1>.",
                "summary:\n[reference generation] A six-second video.",
                "retention_analysis:\n<Subject 1>: fully_preserved - retained.",
                "detailed_description:\n[Shot 1] <Subject 1> moves through the scene.",
                "overall_soundscape:\nQuiet room tone.",
                "non_diegetic_music:\nN/A",
            ]
        )
        with mock.patch.object(nodes, "chat_completion", return_value=generated) as call:
            result = nodes.TDMinimaxH3Prompt().generate_prompt(
                "全能参考（Ref2VA）",
                6.0,
                "使用 <Picture 1> 生成6秒视频",
                "test-key",
                media_1=object(),
            )
        self.assertEqual(result, (generated,))
        self.assertEqual(call.call_args.kwargs["api_url"], nodes.API_URL)
        self.assertEqual(call.call_args.kwargs["model"], nodes.MODEL_NAME)
        self.assertEqual(call.call_args.kwargs["api_key"], "test-key")
        self.assertNotIn("media", call.call_args.kwargs)


if __name__ == "__main__":
    unittest.main()
