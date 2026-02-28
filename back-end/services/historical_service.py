"""
HistoricalService — returns mocked OHLC data for a given ticker.

Design decision: seeding only on the symbol (not dates) means the same chart
is always rendered for the same ticker, making demos stable and predictable.
Weekends are skipped so the data mirrors real market calendars.
"""

import hashlib
import random
from datetime import date, timedelta

from config.settings import Settings
from core.constants import DEFAULT_SEED_PRICE, SEED_PRICES
from schemas.historical import HistoricalResponse, OHLCBar


def _symbol_seed(symbol: str) -> int:
    """Derive a reproducible seed from the ticker symbol only."""
    return int(hashlib.md5(symbol.encode()).hexdigest(), 16) % (2**31)


class HistoricalService:
    """
    Generates realistic-looking historical OHLC bars.

    Replace `get_historical()` with calls to a real data provider
    (yfinance, Alpha Vantage, Polygon.io, etc.) without touching the router.
    """

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def get_historical(self, symbol: str) -> HistoricalResponse:
        """
        Return `history_days` calendar days of mock OHLC data for `symbol`,
        excluding weekends.
        """
        rng = random.Random(_symbol_seed(symbol))
        today = date.today()
        bars: list[OHLCBar] = []

        # Start with the known base price for realism
        price = SEED_PRICES.get(symbol, DEFAULT_SEED_PRICE) * (1 + rng.uniform(-0.08, 0.08))

        for offset in range(self.settings.history_days, -1, -1):
            day = today - timedelta(days=offset)

            # Skip weekends — real markets are closed
            if day.weekday() >= 5:
                continue

            # Gaussian daily return with slight positive drift
            daily_return = rng.gauss(mu=0.0003, sigma=0.015)
            price *= 1 + daily_return

            # Intraday spread around the day's close
            open_ = round(price * (1 + rng.uniform(-0.006, 0.006)), 2)
            close = round(price * (1 + rng.uniform(-0.006, 0.006)), 2)
            high = round(max(open_, close) * (1 + rng.uniform(0.001, 0.012)), 2)
            low = round(min(open_, close) * (1 - rng.uniform(0.001, 0.012)), 2)

            # Volume spikes on volatile days (mirrors real market behaviour)
            volatility_factor = max(0.5, abs(daily_return) / 0.01)
            volume = max(
                1_000_000,
                int(rng.gauss(mu=40_000_000, sigma=8_000_000) * volatility_factor),
            )

            bars.append(
                OHLCBar(
                    date=day.isoformat(),
                    open=open_,
                    high=high,
                    low=low,
                    close=close,
                    price=close,  # frontend chart reads `price`
                    volume=volume,
                )
            )

        return HistoricalResponse(
            symbol=symbol,
            prices=bars,
            period_days=self.settings.history_days,
        )
