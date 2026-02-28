"""
Predict router — POST /predict

Thin layer: validate input (delegated to Pydantic), call the service,
return the response. No business logic lives here.
"""

from fastapi import APIRouter, Depends

from dependencies import get_prediction_service
from schemas.predict import PredictRequest, PredictResponse
from services.prediction_service import PredictionService

router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Generate a stock price prediction",
    description=(
        "Accepts a ticker symbol and date range, runs the prediction model, "
        "and returns a predicted price, trend direction, and confidence score. "
        "The model is currently mocked — replace `PredictionService.predict()` "
        "with a real implementation without touching this router."
    ),
    responses={
        200: {"description": "Prediction generated successfully"},
        422: {"description": "Validation error — check symbol format or date range"},
    },
)
async def predict(
    body: PredictRequest,
    service: PredictionService = Depends(get_prediction_service),
) -> PredictResponse:
    return service.predict(
        symbol=body.symbol,
        start_date=body.start_date,
        end_date=body.end_date,
    )
