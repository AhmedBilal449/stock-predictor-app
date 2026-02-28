"""
Application settings loaded from environment variables / .env file.

Design decision: pydantic-settings gives us automatic env-var parsing,
type coercion, and validation for free — no manual os.getenv() calls.
The @lru_cache wrapper ensures Settings is instantiated exactly once per
process (singleton without global state).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # silently discard unknown env vars
    )

    # ── App metadata ──────────────────────────────────────────────────────────
    app_name: str = "StockSight API"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Accepts a JSON array string or a Python list via env var
    cors_origins: list[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
    ]

    # ── ML model ──────────────────────────────────────────────────────────────
    # Surfaced in every prediction response so clients know which model ran.
    # Swap this string when you upgrade the model.
    model_version: str = "mock-v1.0"

    # ── Data ──────────────────────────────────────────────────────────────────
    history_days: int = 90


@lru_cache
def get_settings() -> Settings:
    """Return the cached Settings singleton."""
    return Settings()
