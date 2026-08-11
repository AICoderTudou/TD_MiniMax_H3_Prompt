import re
from functools import lru_cache
from pathlib import Path


MODE_LABELS = (
    "文生视频（T2VA）",
    "首帧生视频（I2VA）",
    "首尾帧生视频（FL2VA）",
    "尾帧生视频（L2VA）",
    "全能参考（Ref2VA）",
)

MODE_CODES = {
    "文生视频（T2VA）": "T2VA",
    "首帧生视频（I2VA）": "I2VA",
    "首尾帧生视频（FL2VA）": "FL2VA",
    "尾帧生视频（L2VA）": "L2VA",
    "全能参考（Ref2VA）": "Ref2VA",
}

GUIDE_DIRECTORY = Path(__file__).resolve().parent / "guides"
BASE_GUIDE_PATH = GUIDE_DIRECTORY / "VIDEO_PROMPT_WRITING_GUIDE_base_en.md"
REF_GUIDE_PATH = GUIDE_DIRECTORY / "VIDEO_PROMPT_WRITING_GUIDE_ref_en.md"


def mode_code(mode_label):
    try:
        return MODE_CODES[mode_label]
    except KeyError as exc:
        raise ValueError(f"未知任务类型：{mode_label}") from exc


@lru_cache(maxsize=2)
def _read_guide(path):
    try:
        return Path(path).read_text(encoding="utf-8").lstrip("\ufeff")
    except OSError as exc:
        raise RuntimeError(f"无法读取内置 H3 规则：{path}") from exc


def infer_duration_seconds(user_request, default=6.0):
    text = str(user_request or "")
    patterns = (
        r"(?:时长|总时长|duration)\s*[:：为是]?\s*(\d+(?:\.\d+)?)\s*(?:秒|s|seconds?)",
        r"(?:生成|制作|创建)(?:一个|一段|一条)?\s*(\d+(?:\.\d+)?)\s*秒",
        r"(\d+(?:\.\d+)?)\s*秒(?:钟)?(?:的)?(?:视频|短片|动画|镜头)",
    )
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return min(30.0, max(0.2, float(match.group(1))))
    return float(default)


def build_system_prompt(mode_label):
    code = mode_code(mode_label)
    guide_path = REF_GUIDE_PATH if code == "Ref2VA" else BASE_GUIDE_PATH
    expected = (
        "subject_definitions, summary, retention_analysis, detailed_description, "
        "overall_soundscape, non_diegetic_music"
        if code == "Ref2VA"
        else "integrated_multimodal_description, overall_soundscape, non_diegetic_music"
    )
    return (
        "You are TD's MiniMax H3 prompt writer.\n"
        f"The active task type is {code}.\n"
        "Follow the complete TD H3 rule document below exactly. Preserve its exact field names, "
        "field order, reference labels, shot notation, timing notation, dialogue tags, and language rules.\n"
        f"The final answer must contain the required fields in this order: {expected}.\n"
        "Return only one finished H3 prompt. Do not return analysis, explanations, titles, alternatives, "
        "Markdown fences, validation reports, or introductory text.\n\n"
        "=== TD H3 RULE DOCUMENT ===\n"
        + _read_guide(guide_path)
    )


def normalize_reference_mentions(mode_label, user_request):
    code = mode_code(mode_label)
    text = str(user_request or "")
    special = {
        "I2VA": ((r"@首帧图片", "<Picture 1>"),),
        "FL2VA": ((r"@首帧图片", "<Picture 1>"), (r"@尾帧图片", "<Picture 2>")),
        "L2VA": ((r"@尾帧图片", "<Picture 1>"),),
    }
    for pattern, replacement in special.get(code, ()):
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    generic = (
        (r"@(?:图片|picture)\s*(\d+)", "Picture"),
        (r"@(?:视频|video)\s*(\d+)", "Video"),
        (r"@(?:音频|audio)\s*(\d+)", "Audio"),
    )
    for pattern, label in generic:
        text = re.sub(pattern, lambda match: f"<{label} {int(match.group(1))}>", text, flags=re.IGNORECASE)
    return text


def build_user_message(mode_label, user_request, duration_seconds=None):
    code = mode_code(mode_label)
    duration = (
        infer_duration_seconds(user_request)
        if duration_seconds is None
        else min(30.0, max(0.2, float(duration_seconds)))
    )
    normalized_request = normalize_reference_mentions(mode_label, user_request)
    reference_note = {
        "T2VA": "No reference asset tag is required.",
        "I2VA": "The downstream H3 workflow supplies one first-frame image as <Picture 1>.",
        "FL2VA": "The downstream H3 workflow supplies first and last frames as <Picture 1> and <Picture 2>.",
        "L2VA": "The downstream H3 workflow supplies one last-frame image as <Picture 1>.",
        "Ref2VA": "Reference assets are connected separately downstream. Preserve every explicit <Picture N>, <Video N>, <Audio N>, and <Subject N> relationship requested by the user; do not invent unavailable asset content.",
    }[code]
    return (
        "Generate exactly one final MiniMax H3 prompt from the following request.\n"
        f"Task type: {code}\n"
        f"Target duration: {duration:.2f} seconds\n"
        f"Reference handling: {reference_note}\n"
        "If the request contains dialogue, lyrics, or visible text, preserve its original wording and language exactly.\n\n"
        "User requirement:\n"
        + normalized_request.strip()
    )


def clean_model_output(text):
    value = str(text or "").strip().lstrip("\ufeff")
    fenced = re.fullmatch(r"```(?:text|markdown)?\s*(.*?)\s*```", value, flags=re.DOTALL | re.IGNORECASE)
    return fenced.group(1).strip() if fenced else value


def missing_required_fields(mode_label, prompt):
    code = mode_code(mode_label)
    fields = (
        (
            "subject_definitions",
            "summary",
            "retention_analysis",
            "detailed_description",
            "overall_soundscape",
            "non_diegetic_music",
        )
        if code == "Ref2VA"
        else ("integrated_multimodal_description", "overall_soundscape", "non_diegetic_music")
    )
    text = str(prompt or "")
    return [field for field in fields if not re.search(rf"(?mi)^\s*{re.escape(field)}\s*:", text)]
