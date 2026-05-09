"""
Groq async client factory.

Keeping this in its own module makes it easy to swap out the client
(e.g. with a mock) during unit tests without touching app/main.py.
"""

from groq import AsyncGroq
from app.config import settings

_client: AsyncGroq | None = None


def get_groq_client() -> AsyncGroq:
    """Return the module-level AsyncGroq singleton (lazy-initialised)."""
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.groq_api_key)
    return _client