"""
Minimal async tests for the /analyze-image endpoint.
Run with: pytest tests/ -v
"""

import base64
from io import BytesIO
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from app.main import app


# ── Helpers ──────────────────────────────────────────────────────────────────

def tiny_jpeg_bytes() -> bytes:
    """Return the smallest valid JPEG (1×1 white pixel)."""
    return (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
        b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
        b"\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\x1e"
        b"\xc2\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00"
        b"\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00"
        b"\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00"
        b"\x08\x01\x01\x00\x00?\x00\xfb\xd8\xfd\xff\xd9"
    )


def make_mock_completion(text: str = "A white pixel."):
    choice = MagicMock()
    choice.message.content = text
    choice.finish_reason = "stop"
    usage = MagicMock()
    usage.prompt_tokens = 100
    usage.completion_tokens = 20
    completion = MagicMock()
    completion.choices = [choice]
    completion.usage = usage
    completion.model = "llama-3.2-11b-vision-preview"
    return completion


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_image_success():
    mock_create = AsyncMock(return_value=make_mock_completion())

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Patch the groq client on the running app state
        app.state.groq = MagicMock()
        app.state.groq.chat = MagicMock()
        app.state.groq.chat.completions = MagicMock()
        app.state.groq.chat.completions.create = mock_create

        resp = await client.post(
            "/analyze-image",
            files={"image": ("pixel.jpg", tiny_jpeg_bytes(), "image/jpeg")},
            data={"prompt": "What is this?", "max_tokens": "256"},
        )

    assert resp.status_code == 200
    body = resp.json()
    assert "analysis" in body
    assert body["finish_reason"] == "stop"
    mock_create.assert_awaited_once()


@pytest.mark.asyncio
async def test_unsupported_file_type():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        app.state.groq = MagicMock()
        resp = await client.post(
            "/analyze-image",
            files={"image": ("file.pdf", b"%PDF-1.4", "application/pdf")},
            data={"prompt": "read this"},
        )

    assert resp.status_code == 400
    assert "Unsupported" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}