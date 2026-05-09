"""
App configuration — reads from environment variables or a .env file.

Set GROQ_API_KEY in your shell or in a .env file (never commit it).
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Required ──────────────────────────────────────────────────────────────
    groq_api_key: str

    # Optional — sensible defaults ──────────────────────────────────────────
    groq_model: str = "llama-3.2-11b-vision-preview"
    cors_origins: List[str] = ["*"]          # tighten this in production
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings singleton (reads .env once at startup)."""
    return Settings()   # type: ignore[call-arg]


# Module-level convenience alias
settings: Settings = get_settings()