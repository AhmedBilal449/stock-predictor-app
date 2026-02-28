"""
Historical router — GET /historical/{symbol}

Returns OHLC price bars for the requested ticker over the configured
history window. The `price` field on each bar mirrors `close` so the
React frontend can consume it without transformation.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Path

from dependencies import get_historical_service
from schemas.historical import HistoricalResponse
from services.historical_service import HistoricalService

router = APIRouter()


@router.get(
    "/{symbol}",
    response_model=HistoricalResponse,
    summary="Fetch historical OHLC data",
    description=(
        "Returns daily OHLC bars for the given ticker symbol. "
        "Data covers the last `history_days` calendar days (weekends excluded). "
        "Currently mocked — replace `HistoricalService.get_historical()` with a "
        "real data provider (yfinance, Polygon.io, etc.)."
    ),
    responses={
        200: {"description": "Historical bars returned successfully"},
        404: {"description": "Symbol not found"},
        422: {"description": "Invalid symbol format"},
    },
)
async def get_historical(
    symbol: Annotated[
        str,
        Path(
            min_length=1,
            max_length=10,
            description="Stock ticker symbol (e.g. AAPL)",
            examples=["AAPL"],
        ),
    ],
    service: HistoricalService = Depends(get_historical_service),
) -> HistoricalResponse:
    return service.get_historical(symbol.strip().upper())
