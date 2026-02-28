"""
Health router — GET /health

Used by load balancers, uptime monitors, and CI smoke tests to verify
the API process is alive and correctly configured.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from config.settings import Settings, get_settings

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    model_version: str
    timestamp: datetime


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness check",
    description=(
        "Returns `status: ok` when the API is running. "
        "Also surfaces the active model version for observability."
    ),
)
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        model_version=settings.model_version,
        timestamp=datetime.now(timezone.utc),
    )
