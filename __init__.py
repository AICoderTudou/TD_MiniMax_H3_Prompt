from .nodes import TDMinimaxH3Prompt


NODE_CLASS_MAPPINGS = {
    "TD_MiniMax_H3_Prompt": TDMinimaxH3Prompt,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "TD_MiniMax_H3_Prompt": "TD MiniMax H3 提示词",
}

WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
