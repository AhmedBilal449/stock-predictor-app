"""
PredictionService — currently mocked; swap predict() with a real model call.

Design decision: the service accepts plain Python types (str, date) and returns
a Pydantic schema. This keeps it independently testable with no FastAPI dependency.

Determinism: seeding random.Random with (symbol + dates) means the same request
always returns the same result, which makes manual testing and demos predictable.
"""

import hashlib
import math
import random
from datetime import date, datetime, timezone

from config.settings import Settings
from core.constants import DEFAULT_SEED_PRICE, SEED_PRICES
from schemas.predict import PredictResponse, Trend


def _request_seed(symbol: str, start_date: date, end_date: date) -> int:
    """Derive a reproducible integer seed from request parameters."""
    key = f"{symbol}:{start_date}:{end_date}"
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % (2**31)


class PredictionService:
    """
    Wraps all prediction logic behind a clean interface.

    Swap out `predict()` with a real ML model (scikit-learn, PyTorch, etc.)
    without touching the router or schemas.
    """

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def predict(
        self,
        symbol: str,
        start_date: date,
        end_date: date,
    ) -> PredictResponse:
        """
        Generate a price prediction for `symbol` over the given window.

        Current implementation: deterministic random walk seeded on the request
        parameters so the same inputs always produce the same output.
        """
        rng = random.Random(_request_seed(symbol, start_date, end_date))

        # ── Baseline price ────────────────────────────────────────────────────
        base = SEED_PRICES.get(symbol, DEFAULT_SEED_PRICE)
        # Add a small symbol-specific jitter so unknown tickers feel realistic
        current_price = round(base * (1 + rng.uniform(-0.04, 0.04)), 2)

        # ── Simulate directional drift ────────────────────────────────────────
        # Longer analysis windows produce larger expected moves (log-scaled).
        days = (end_date - start_date).days
        drift = rng.uniform(-0.08, 0.12) * math.log1p(days / 30)

        predicted_price = round(current_price * (1 + drift), 2)
        change_percent = round(((predicted_price - current_price) / current_price) * 100, 2)

        # ── Map drift magnitude to trend ──────────────────────────────────────
        if change_percent > 2.0:
            trend = Trend.bullish
        elif change_percent < -2.0:
            trend = Trend.bearish
        else:
            trend = Trend.neutral

        # ── Confidence is stronger when the signal is more decisive ──────────
        signal_strength = min(abs(change_percent) / 15.0, 0.35)
        confidence = round(
            max(0.0, min(1.0, 0.55 + signal_strength + rng.uniform(-0.04, 0.04))),
            4,
        )

        return PredictResponse(
            symbol=symbol,
            predicted_price=predicted_price,
            confidence=confidence,
            trend=trend,
            current_price=current_price,
            change_percent=change_percent,
            model_version=self.settings.model_version,
            generated_at=datetime.now(timezone.utc),
        )
