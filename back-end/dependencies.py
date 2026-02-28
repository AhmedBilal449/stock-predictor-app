"""
Dependency injection factories.

Design decision: using FastAPI's Depends() instead of module-level singletons
keeps services easy to mock in tests — just override the dependency in the
test client. No monkey-patching required.

Example test override:
    app.dependency_overrides[get_prediction_service] = lambda: MockPredictionService()
"""

from fastapi import Depends

from config.settings import Settings, get_settings
from services.historical_service import HistoricalService
from services.prediction_service import PredictionService


def get_prediction_service(
    settings: Settings = Depends(get_settings),
) -> PredictionService:
    """Provide a PredictionService configured with current settings."""
    return PredictionService(settings)


def get_historical_service(
    settings: Settings = Depends(get_settings),
) -> HistoricalService:
    """Provide a HistoricalService configured with current settings."""
    return HistoricalService(settings)
