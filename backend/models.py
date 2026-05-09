"""Pydantic response and error models."""

from pydantic import BaseModel, Field


class AnalysisResponse(BaseModel):
    analysis: str = Field(..., description="Model-generated text analysis")
    model: str = Field(..., description="Groq model ID that produced the response")
    prompt_tokens: int = Field(..., description="Tokens consumed by the prompt")
    completion_tokens: int = Field(..., description="Tokens in the model's reply")
    latency_ms: int = Field(..., description="End-to-end Groq call latency in ms")
    finish_reason: str = Field(..., description="Why the model stopped generating")

    model_config = {"json_schema_extra": {
        "example": {
            "analysis": "The image shows a tabby cat sitting on a wooden windowsill...",
            "model": "llama-3.2-11b-vision-preview",
            "prompt_tokens": 1280,
            "completion_tokens": 142,
            "latency_ms": 430,
            "finish_reason": "stop",
        }
    }}


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Human-readable error description")