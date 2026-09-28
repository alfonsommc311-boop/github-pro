"""Cliente LLM opcional. Sin configuración devuelve None y el motor usa plantillas."""
import json
import os
import urllib.request


def complete(system: str, user: str, max_tokens: int = 800):
    """Devuelve texto del LLM o None si no hay proveedor configurado o falla."""
    try:
        if os.environ.get("ANTHROPIC_API_KEY"):
            return _anthropic(system, user, max_tokens)
        if os.environ.get("OPENAI_API_KEY"):
            return _openai(system, user, max_tokens)
    except Exception:
        return None
    return None


def _post(url, headers, body):
    req = urllib.request.Request(url, json.dumps(body).encode(), headers, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def _anthropic(system, user, max_tokens):
    data = _post(
        "https://api.anthropic.com/v1/messages",
        {"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01",
         "content-type": "application/json"},
        {"model": os.environ.get("SWARMCAST_MODEL", "claude-haiku-4-5-20251001"),
         "max_tokens": max_tokens, "system": system,
         "messages": [{"role": "user", "content": user}]},
    )
    return data["content"][0]["text"]


def _openai(system, user, max_tokens):
    base = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    data = _post(
        base + "/chat/completions",
        {"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"], "content-type": "application/json"},
        {"model": os.environ.get("SWARMCAST_MODEL", "gpt-4o-mini"), "max_tokens": max_tokens,
         "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]},
    )
    return data["choices"][0]["message"]["content"]
