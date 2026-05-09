"""
Groq Vision API — FastAPI application
Endpoint: POST /analyze-image
"""

import base64
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from groq import AsyncGroq, RateLimitError, APIStatusError

from app.config import settings
from app.models import AnalysisResponse, ErrorResponse
from app.groq_client import get_groq_client

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan: create / close the shared AsyncGroq client once
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting up — initialising Groq async client")
    app.state.groq = AsyncGroq(api_key=settings.groq_api_key)
    yield
    log.info("Shutting down — closing Groq client")
    await app.state.groq.close()


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Groq Vision API",
    description="High-performance image analysis powered by Llama 3.2 Vision on Groq LPU hardware.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_BYTES = 20 * 1024 * 1024  # 20 MB


@app.post(
    "/analyze-image",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
    tags=["vision"],
    summary="Analyse an uploaded image with a text prompt",
)
async def analyze_image(
    image: UploadFile = File(..., description="JPEG, PNG, WEBP, or GIF — max 20 MB"),
    prompt: str = Form(
        default="Describe this image in detail.",
        description="Text instruction sent alongside the image",
    ),
    max_tokens: int = Form(
        default=1024,
        ge=64,
        le=4096,
        description="Maximum tokens in the model response",
    ),
):
    # ── 1. Validate content type ──────────────────────────────────────────
    if image.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{image.content_type}'. Allowed: {ALLOWED_MIME}",
        )

    # ── 2. Read & size-check ──────────────────────────────────────────────
    raw = await image.read()
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {MAX_FILE_BYTES // (1024**2)} MB limit.",
        )

    # ── 3. Base64-encode (Groq vision API requirement) ────────────────────
    b64_image = base64.standard_b64encode(raw).decode("utf-8")
    image_url = f"data:{image.content_type};base64,{b64_image}"

    # ── 4. Build multimodal payload ───────────────────────────────────────
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                },
                {
                    "type": "text",
                    "text": prompt,
                },
            ],
        }
    ]

    # ── 5. Call Groq ──────────────────────────────────────────────────────
    t0 = time.perf_counter()
    try:
        client: AsyncGroq = app.state.groq
        completion = await client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.2,     # lower = more deterministic / faster decode
        )
    except RateLimitError as exc:
        log.warning("Groq rate limit hit: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Groq rate limit reached. Retry after a moment.",
        )
    except APIStatusError as exc:
        log.error("Groq API error %s: %s", exc.status_code, exc.message)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq API returned an error: {exc.message}",
        )

    latency_ms = round((time.perf_counter() - t0) * 1000)
    log.info(
        "Groq responded in %d ms  |  tokens: %d in / %d out",
        latency_ms,
        completion.usage.prompt_tokens,
        completion.usage.completion_tokens,
    )

    # ── 6. Build response ─────────────────────────────────────────────────
    choice = completion.choices[0]
    return AnalysisResponse(
        analysis=choice.message.content,
        model=completion.model,
        prompt_tokens=completion.usage.prompt_tokens,
        completion_tokens=completion.usage.completion_tokens,
        latency_ms=latency_ms,
        finish_reason=choice.finish_reason,
    )