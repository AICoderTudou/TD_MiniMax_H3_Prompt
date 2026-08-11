import os

from .api_client import H3APIError, chat_completion
from .h3_rules import MODE_LABELS, build_system_prompt, build_user_message, clean_model_output, missing_required_fields


API_URL = "https://api.seedance.nz/v1/chat/completions"
MODEL_NAME = "deepseek/deepseek-v4-flash"
MAX_MEDIA = 15


class TDMinimaxH3Prompt:
    @classmethod
    def INPUT_TYPES(cls):
        optional = {}
        for index in range(1, MAX_MEDIA + 1):
            optional[f"media_{index}"] = ("*", {"hidden": True})
        return {
            "required": {
                "task_type": (list(MODE_LABELS), {"default": MODE_LABELS[0]}),
                "duration": ("FLOAT", {"default": 6.0, "min": 0.2, "max": 30.0, "step": 0.1}),
                "user_request": ("STRING", {"multiline": True, "dynamicPrompts": True, "default": ""}),
                "api_key": ("STRING", {"default": "", "multiline": False, "password": True}),
            },
            "optional": optional,
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("H3提示词",)
    FUNCTION = "generate_prompt"
    CATEGORY = "TD/MiniMax H3"
    DESCRIPTION = "使用 TD H3 规则和内置 DeepSeek 接口生成官方结构提示词。"

    @classmethod
    def IS_CHANGED(cls, **_kwargs):
        return float("nan")

    def generate_prompt(self, task_type, duration, user_request, api_key, **_media):
        request = str(user_request or "").strip()
        if not request:
            raise ValueError("用户需求不能为空。")

        key = (
            str(api_key or "").strip()
            or os.getenv("SEEDANCE_API_KEY", "").strip()
            or os.getenv("TD_H3_API_KEY", "").strip()
        )
        if not key:
            raise ValueError("请填写 API Key，或设置 SEEDANCE_API_KEY 环境变量。")

        try:
            result = chat_completion(
                api_url=API_URL,
                api_key=key,
                model=MODEL_NAME,
                system_prompt=build_system_prompt(task_type),
                user_prompt=build_user_message(task_type, request, duration),
                temperature=0.2,
                max_tokens=12000,
                timeout=300,
            )
        except H3APIError as exc:
            raise RuntimeError(f"TD H3 提示词生成失败：{exc}") from exc

        prompt = clean_model_output(result)
        if not prompt:
            raise RuntimeError("TD H3 提示词生成失败：接口返回了空内容。")

        missing = missing_required_fields(task_type, prompt)
        if missing:
            print("[TD MiniMax H3 Prompt] 返回内容缺少建议字段：" + ", ".join(missing))
        return (prompt,)
