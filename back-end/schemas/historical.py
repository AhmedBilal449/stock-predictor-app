"""
Request / response schemas for the /historical/{symbol} endpoint.

OHLCBar includes a `price` field (alias for `close`) so the React frontend
can consume this endpoint without any transformation.
"""

from pydantic import BaseModel, Field


class OHLCBar(BaseModel):
    date: str = Field(..., description="ISO date string (YYYY-MM-DD)")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="Intraday high")
    low: float = Field(..., description="Intraday low")
    close: float = Field(..., description="Closing price")
    price: float = Field(
        ...,
        description="Alias for `close` — included for frontend chart compatibility",
    )
    volume: int = Field(..., description="Number of shares traded")


class HistoricalResponse(BaseModel):
    symbol: str = Field(..., description="Normalised ticker symbol")
    prices: list[OHLCBar] = Field(..., description="Chronological list of OHLC bars")
    period_days: int = Field(..., description="Requested history window in calendar days")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "symbol": "AAPL",
                    "period_days": 90,
                    "prices": [
                        {
                            "date": "2024-01-15",
                            "open": 183.50,
                            "high": 186.20,
                            "low": 182.10,
                            "close": 185.40,
                            "price": 185.40,
                            "volume": 54832000,
                        }
                    ],
                }
            ]
        }
    }
