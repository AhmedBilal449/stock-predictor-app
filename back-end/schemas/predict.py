"""
Request / response schemas for the /predict endpoint.

Design decision: Pydantic models act as the contract between client and service.
Validation (symbol normalisation, date ordering) lives here — routers and services
stay thin and focused on routing / business logic respectively.
"""

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator


class Trend(str, Enum):
    bullish = "bullish"
    bearish = "bearish"
    neutral = "neutral"


class PredictRequest(BaseModel):
    symbol: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Stock ticker symbol",
        examples=["AAPL"],
    )
    start_date: date = Field(
        ...,
        description="Start of the analysis window (YYYY-MM-DD)",
        examples=["2023-01-01"],
    )
    end_date: date = Field(
        ...,
        description="End of the analysis window (YYYY-MM-DD)",
        examples=["2024-01-01"],
    )

    @field_validator("symbol")
    @classmethod
    def normalise_symbol(cls, v: str) -> str:
        """Strip whitespace and uppercase so callers can be sloppy."""
        return v.strip().upper()

    @model_validator(mode="after")
    def validate_date_range(self) -> "PredictRequest":
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be strictly after start_date.")
        if (self.end_date - self.start_date).days > 3650:
            raise ValueError("Date range cannot exceed 10 years.")
        return self


class PredictResponse(BaseModel):
    symbol: str = Field(..., description="Normalised ticker symbol")
    predicted_price: float = Field(..., description="AI-predicted closing price", examples=[195.50])
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score (0–1)")
    trend: Trend = Field(..., description="Predicted market direction")
    current_price: float = Field(..., description="Latest known price used as baseline")
    change_percent: float = Field(..., description="Expected % change from current to predicted price")
    model_version: str = Field(..., description="Identifier of the prediction model that ran")
    generated_at: datetime = Field(..., description="UTC timestamp when this prediction was generated")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "symbol": "AAPL",
                    "predicted_price": 195.50,
                    "confidence": 0.84,
                    "trend": "bullish",
                    "current_price": 188.20,
                    "change_percent": 3.88,
                    "model_version": "mock-v1.0",
                    "generated_at": "2024-03-15T10:30:00Z",
                }
            ]
        }
    }
