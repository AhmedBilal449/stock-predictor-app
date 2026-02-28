"""
Domain-specific exceptions.

Design decision: keep HTTP concerns out of the service layer.
Services raise these typed exceptions; the FastAPI exception handlers
in main.py map them to appropriate HTTP status codes.
This means services remain fully testable without a running HTTP server.
"""


class StockSightError(Exception):
    """Base class for all StockSight domain errors."""


class StockNotFoundError(StockSightError):
    """Raised when a ticker symbol cannot be resolved."""

    def __init__(self, symbol: str) -> None:
        self.symbol = symbol
        super().__init__(f"Stock symbol '{symbol}' was not found or is not supported.")


class InvalidDateRangeError(StockSightError):
    """Raised by service-layer business-logic checks that Pydantic can't catch."""

    def __init__(self, message: str) -> None:
        super().__init__(message)


class PredictionError(StockSightError):
    """Raised when the prediction model encounters an unrecoverable error."""

    def __init__(self, symbol: str, reason: str) -> None:
        self.symbol = symbol
        super().__init__(f"Prediction failed for '{symbol}': {reason}")
