"""
Pydantic schemas for API request/response validation.
"""

from typing import List
from pydantic import BaseModel, Field


class PredictionResult(BaseModel):
    """Single prediction entry."""
    label: str = Field(..., description="Disease class label")
    confidence: float = Field(..., description="Prediction confidence (0-1)", ge=0, le=1)
    probability_pct: float = Field(..., description="Probability percentage (0-100)", ge=0, le=100)


class PredictionResponse(BaseModel):
    """Response for the /predict endpoint."""
    success: bool = True
    predicted_disease: str = Field(..., description="Top predicted disease label")
    confidence: float = Field(..., description="Top prediction confidence")
    severity: str = Field(..., description="Estimated severity (Low, Medium, High, None)")
    infected_area_pct: float = Field(..., description="Percentage of leaf area infected")
    recommended_action: str = Field(..., description="Treatment recommendation")
    top_predictions: List[PredictionResult] = Field(
        ..., description="Top-k probability distribution ranked by confidence"
    )
    low_confidence_flag: bool = Field(False, description="True if prediction confidence is below threshold")


class BatchPredictionResponse(BaseModel):
    """Response for the /predict-batch endpoint."""
    success: bool = True
    batch_size: int
    predictions: List[PredictionResponse]
    total_latency_ms: float


class HealthResponse(BaseModel):
    """Response for the /health endpoint."""
    status: str = "healthy"
    model_loaded: bool
    model_name: str
    num_classes: int
    device: str


class ClassesResponse(BaseModel):
    """Response for the /classes endpoint."""
    num_classes: int
    classes: List[str]


class DiseaseDetectionResponse(BaseModel):
    """Specific response for the /detect-disease endpoint."""
    disease: str = Field(..., description="Predicted disease label")
    confidence: float = Field(..., description="Prediction confidence (0-1)")
    severity: str = Field(..., description="Infection severity")
    recommended_action: str = Field(..., alias="recommended action", description="Treatment recommendation")

    model_config = {
        "populate_by_name": True
    }


class ErrorResponse(BaseModel):
    """Error response."""
    success: bool = False
    error: str
    detail: str = ""
