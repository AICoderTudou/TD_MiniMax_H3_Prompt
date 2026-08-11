import json
import urllib.error
import urllib.request


class H3APIError(RuntimeError):
    pass


def normalize_chat_url(value):
    url = str(value or "").strip().rstrip("/")
    if not url:
        raise H3APIError("API 地址不能为空。")
    if url.endswith("/chat/completions"):
        return url
    return url + "/chat/completions"


def _extract_content(payload):
    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        detail = payload.get("error") if isinstance(payload, dict) else None
        if detail:
            raise H3APIError(f"接口返回错误：{detail}") from exc
        raise H3APIError("接口响应缺少 choices[0].message.content。") from exc

    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                parts.append(item["text"])
        if parts:
            return "".join(parts)
    raise H3APIError("接口返回的 content 不是可识别的文本。")


def chat_completion(
    *,
    api_url,
    api_key,
    model,
    system_prompt,
    user_prompt,
    temperature=0.2,
    max_tokens=12000,
    timeout=300,
):
    model = str(model or "").strip()
    if not model:
        raise H3APIError("模型名称不能为空。")

    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": float(temperature),
        "max_tokens": int(max_tokens),
        "stream": False,
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "TD-MiniMax-H3-Prompt/2.0",
    }
    key = str(api_key or "").strip()
    if key:
        headers["Authorization"] = f"Bearer {key}"

    request = urllib.request.Request(
        normalize_chat_url(api_url),
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=int(timeout)) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise H3APIError(f"接口返回 HTTP {exc.code}：{detail[:800]}") from exc
    except urllib.error.URLError as exc:
        raise H3APIError(f"无法连接接口：{exc.reason}") from exc
    except TimeoutError as exc:
        raise H3APIError("接口请求超时。") from exc

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise H3APIError(f"接口没有返回有效 JSON：{raw[:500]}") from exc
    return _extract_content(payload)
