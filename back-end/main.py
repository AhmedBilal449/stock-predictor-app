"""
StockSight API — application entry point.

Design decisions:
- lifespan context manager (recommended over @app.on_event since FastAPI 0.95)
  gives us clean startup / shutdown hooks without deprecation warnings.
- CORS origins are loaded from Settings, not hardcoded, so deployments only
  need an env var change.
- Domain exceptions (StockNotFoundError, etc.) are mapped to HTTP responses
  here, not inside services — keeps the service layer HTTP-agnostic.
- X-Process-Time header on every response aids performance observability
  without needing a separate APM tool during development.
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config.settings import get_settings
from core.exceptions import InvalidDateRangeError, PredictionError, StockNotFoundError
from routers import health, historical, predict

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Run startup logic before yield, teardown logic after."""
    logger.info(
        "StockSight API starting — version=%s model=%s",
        settings.app_version,
        settings.model_version,
    )
    yield
    logger.info("StockSight API shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    description=(
        "**AI-powered stock trend prediction API.**\n\n"
        "Predictions are currently mocked. Swap `PredictionService.predict()` "
        "with a real ML model and `HistoricalService.get_historical()` with a "
        "live data provider — no router or schema changes required."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Health", "description": "Liveness / readiness checks"},
        {"name": "Predictions", "description": "AI-generated price and trend forecasts"},
        {"name": "Historical Data", "description": "OHLC price history for charts"},
    ],
    lifespan=lifespan,
)


# ── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Attach X-Process-Time (ms) to every response for latency tracking."""
    t0 = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - t0) * 1000
    response.headers["X-Process-Time"] = f"{elapsed_ms:.2f}ms"
    return response


# ── Exception handlers ────────────────────────────────────────────────────────

@app.exception_handler(StockNotFoundError)
async def stock_not_found_handler(request: Request, exc: StockNotFoundError) -> JSONResponse:
    logger.warning("StockNotFound: symbol=%s path=%s", exc.symbol, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


@app.exception_handler(InvalidDateRangeError)
async def invalid_date_range_handler(request: Request, exc: InvalidDateRangeError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )


@app.exception_handler(PredictionError)
async def prediction_error_handler(request: Request, exc: PredictionError) -> JSONResponse:
    logger.error("PredictionError: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
# Each router owns its own path prefix to keep main.py free of endpoint details.

app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, tags=["Predictions"])
app.include_router(historical.router, prefix="/historical", tags=["Historical Data"])
