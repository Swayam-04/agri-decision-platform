"""
FastAPI REST server for crop disease inference.

Endpoints:
    POST /predict   — Upload a leaf image → get disease prediction + confidence
    GET  /health    — Health check (model status, device info)
    GET  /classes   — List all supported disease class labels
"""

import os
import sys
import io
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from inference.predict import Predictor
from api.schemas import (
    PredictionResponse,
    PredictionResult,
    BatchPredictionResponse,
    DiseaseDetectionResponse,
    HealthResponse,
    ClassesResponse,
    ErrorResponse,
)

# ─── Global predictor instance ───────────────────────────────────────────────
predictor: Predictor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, release on shutdown."""
    global predictor
    try:
        predictor = Predictor()
        print("[API] Model loaded successfully.")
    except FileNotFoundError as e:
        print(f"[API] ⚠ Model not loaded: {e}")
        print("[API]   The /predict endpoint will return 503 until a model is available.")
    yield
    # Cleanup
    predictor = None


# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Crop Disease Detection API",
    description=(
        "Deep learning API for classifying plant leaf images into disease categories. "
        "Upload a leaf image to get the predicted disease label and confidence score."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.post(
    "/predict",
    response_model=PredictionResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid image"},
        503: {"model": ErrorResponse, "description": "Model not loaded"},
    },
    summary="Predict crop disease from leaf image",
    description="Upload a plant leaf image (JPG, PNG) and receive the predicted disease label with confidence scores.",
)
async def predict(
    file: UploadFile = File(..., description="Plant leaf image (JPG, PNG, BMP, WebP)"),
):
    """Classify an uploaded leaf image."""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Train a model first using: python -m training.train",
        )

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/bmp", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: {allowed_types}",
        )

    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Run prediction
        start_time = time.time()
        result = predictor.predict(image)
        latency_ms = (time.time() - start_time) * 1000

        # Log prediction result
        predictor.logger.log_prediction(result, latency_ms)

        return PredictionResponse(
            success=True,
            predicted_disease=result["predicted_disease"],
            confidence=result["confidence"],
            severity=result["severity"],
            infected_area_pct=result["infected_area_pct"],
            recommended_action=result["recommended_action"],
            top_predictions=[
                PredictionResult(**pred) for pred in result["top_predictions"]
            ],
            low_confidence_flag=result.get("low_confidence_flag", False)
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing image: {str(e)}",
        )


@app.post(
    "/detect-disease",
    response_model=DiseaseDetectionResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid image"},
        503: {"model": ErrorResponse, "description": "Model not loaded"},
    },
    summary="Detect disease with severity and recommendation",
    description="Upload a leaf image and get the disease, confidence, severity, and recommended action.",
)
async def detect_disease(
    file: UploadFile = File(..., description="Leaf image (JPG, PNG)"),
):
    """Detect disease with full severity and recommendation details."""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Train a model first.",
        )

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/bmp", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: {allowed_types}",
        )

    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Run prediction
        result = predictor.predict(image)

        # Map to legacy key for Aliased JSON response
        return DiseaseDetectionResponse(
            disease=result["predicted_disease"],
            confidence=result["confidence"],
            severity=result["severity"],
            recommended_action=result["recommended_action"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing image: {str(e)}",
        )


@app.post(
    "/predict-batch",
    response_model=BatchPredictionResponse,
    summary="Batch crop disease prediction",
    description="Upload multiple leaf images and receive a list of predictions.",
)
async def predict_batch(
    files: List[UploadFile] = File(..., description="Multiple leaf images"),
):
    """Efficient batch classification for multiple images."""
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    try:
        start_batch_time = time.time()
        
        # Load all images
        images = []
        for file in files:
            contents = await file.read()
            images.append(Image.open(io.BytesIO(contents)).convert("RGB"))
        
        # Run optimized batch prediction
        results = predictor.predict_batch(images)
        total_latency_ms = (time.time() - start_batch_time) * 1000
        
        # Convert results to response objects
        predictions = [
            PredictionResponse(
                success=True,
                predicted_disease=res["predicted_disease"],
                confidence=res["confidence"],
                severity=res["severity"],
                infected_area_pct=res["infected_area_pct"],
                recommended_action=res["recommended_action"],
                top_predictions=[
                    PredictionResult(**pred) for pred in res["top_predictions"]
                ],
                low_confidence_flag=res.get("low_confidence_flag", False)
            )
            for res in results
        ]
        
        return BatchPredictionResponse(
            success=True,
            batch_size=len(files),
            predictions=predictions,
            total_latency_ms=total_latency_ms
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing batch: {str(e)}",
        )


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check API status and model information.",
)
async def health():
    """Return API health status."""
    model_loaded = predictor is not None
    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        model_loaded=model_loaded,
        model_name=config.MODEL_NAME,
        num_classes=config.NUM_CLASSES,
        device=config.DEVICE,
    )


@app.get(
    "/classes",
    response_model=ClassesResponse,
    summary="List disease classes",
    description="Get the full list of disease class labels the model can predict.",
)
async def classes():
    """Return supported disease class labels."""
    class_names = predictor.class_names if predictor else config.CLASS_NAMES
    return ClassesResponse(
        num_classes=len(class_names),
        classes=class_names,
    )


# ─── Run directly ────────────────────────────────────────────────────────────

def main():
    """Start the API server."""
    import uvicorn
    uvicorn.run(
        "api.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    main()
