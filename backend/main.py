import base64
import os
from contextlib import asynccontextmanager

import uuid
from dataclasses import dataclass, field
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from groq import APIConnectionError, APIStatusError, AsyncGroq, RateLimitError
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


# ── Environment ───────────────────────────────────────────────────────────────
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set. Check your .env file.")

MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
MAX_IMAGE_SIZE_MB = 10
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


# ── Lifespan: shared async client ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create a single AsyncGroq client for the lifetime of the application."""
    app.state.groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    yield
    await app.state.groq_client.close()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Groq Vision API",
    description="High-performance image analysis powered by Llama 3.2 Vision on Groq.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic response schemas ──────────────────────────────────────────────────
class AnalysisResponse(BaseModel):
    analysis: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ErrorResponse(BaseModel):
    error: str
    detail: str


# ── Helper ────────────────────────────────────────────────────────────────────
async def read_and_encode_image(file: UploadFile) -> tuple[str, str]:
    """
    Validate, read, and Base64-encode the uploaded image.
    Returns (base64_string, media_type).
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{file.content_type}'. "
                   f"Allowed: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    image_bytes = await file.read()

    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large ({size_mb:.1f} MB). Maximum is {MAX_IMAGE_SIZE_MB} MB.",
        )

    return base64.standard_b64encode(image_bytes).decode("utf-8"), file.content_type


# ── Endpoint ──────────────────────────────────────────────────────────────────
@app.post(
    "/analyze-image",
    response_model=AnalysisResponse,
    summary="Analyze an image using Llama 3.2 Vision",
    responses={
        413: {"model": ErrorResponse, "description": "Image too large"},
        415: {"model": ErrorResponse, "description": "Unsupported image type"},
        429: {"model": ErrorResponse, "description": "Groq rate limit exceeded"},
        502: {"model": ErrorResponse, "description": "Groq API error"},
    },
)
async def analyze_image(
    image: UploadFile = File(..., description="The image to analyze (JPEG, PNG, GIF, WebP)"),
    prompt: str = Form(
        default="Describe this image in detail.",
        description="The question or instruction for the model.",
    ),
):
    """
    Upload an image and a text prompt; receive an AI-generated analysis
    from the Llama 3.2 11B Vision model running on Groq.
    """
    # 1. Validate and encode the image
    image_b64, media_type = await read_and_encode_image(image)

    # 2. Build the multimodal message payload
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{media_type};base64,{image_b64}",
                    },
                },
                {
                    "type": "text",
                    "text": prompt,
                },
            ],
        }
    ]

    # 3. Call the Groq API with specific error handling
    try:
        client: AsyncGroq = app.state.groq_client
        completion = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

    except RateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Groq rate limit exceeded. Please wait a moment and retry.",
        ) from exc

    except APIStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq API returned an error: {exc.message}",
        ) from exc

    except APIConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not connect to the Groq API. Check your network.",
        ) from exc

    # 4. Parse and return the structured response
    choice = completion.choices[0]
    usage = completion.usage

    return AnalysisResponse(
        analysis=choice.message.content,
        model=completion.model,
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens,
    )

# ── Session store ─────────────────────────────────────────────────────────────
@dataclass
class ChatSession:
    image_b64: str
    media_type: str
    history: list[dict[str, Any]] = field(default_factory=list)

sessions: dict[str, ChatSession] = {}

# ── Pydantic schemas ──────────────────────────────────────────────────────────
class StartSessionResponse(BaseModel):
    session_id: str
    message: str

class ChatRequest(BaseModel):
    session_id: str
    question: str

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    turn: int

# ── POST /chat/start ──────────────────────────────────────────────────────────
@app.post("/chat/start", response_model=StartSessionResponse)
async def chat_start(
    image: UploadFile = File(...),
):
    image_b64, media_type = await read_and_encode_image(image)
    session_id = str(uuid.uuid4())
    sessions[session_id] = ChatSession(image_b64=image_b64, media_type=media_type)
    return StartSessionResponse(
        session_id=session_id,
        message="Session started. Send questions to /chat/message.",
    )

# ── POST /chat/message ────────────────────────────────────────────────────────
@app.post("/chat/message", response_model=ChatResponse)
async def chat_message(body: ChatRequest):
    session = sessions.get(body.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{body.session_id}' not found. Start one at /chat/start.",
        )

    if not session.history:
        user_content = [
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:{session.media_type};base64,{session.image_b64}"
                },
            },
            {"type": "text", "text": body.question},
        ]
    else:
        user_content = body.question

    session.history.append({"role": "user", "content": user_content})

    try:
        client: AsyncGroq = app.state.groq_client
        completion = await client.chat.completions.create(
            model=MODEL,
            messages=session.history,
            max_tokens=1024,
            temperature=0.7,
        )
    except RateLimitError as exc:
        session.history.pop()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit hit. Please wait and retry.",
        ) from exc
    except APIStatusError as exc:
        session.history.pop()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq API error: {exc.message}",
        ) from exc

    answer = completion.choices[0].message.content
    session.history.append({"role": "assistant", "content": answer})

    return ChatResponse(
        session_id=body.session_id,
        answer=answer,
        turn=len(session.history) // 2,
    )

# ── DELETE /chat/clear ────────────────────────────────────────────────────────
@app.delete("/chat/clear/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def chat_clear(session_id: str):
    if session_id not in sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )
    del sessions[session_id]

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok", "model": MODEL}