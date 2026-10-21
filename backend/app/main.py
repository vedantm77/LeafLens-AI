"""FastAPI application for LeafLens AI crop disease classification."""

import logging
from typing import List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import PredictionResponse, HealthResponse, MetricsResponse
from app.metadata import MODEL_ATTRIBUTION, DISEASE_METADATA
from app.model import get_classifier

logger = logging.getLogger("leaflens.api")
logging.basicConfig(level=logging.INFO)

classifier = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global classifier
    logger.info("Initializing LeafLens AI Backend and pre-loading classifier...")
    try:
        classifier = get_classifier()
    except Exception as e:
        logger.error(f"Error initializing classifier: {e}")
    yield
    logger.info("LeafLens AI Backend shutting down.")

app = FastAPI(
    title="LeafLens AI API",
    description="Production-grade Crop Disease Classification API powered by MobileNetV2 on the PlantVillage benchmark.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for local React Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """System health check and model status."""
    global classifier
    if classifier is None:
        try:
            classifier = get_classifier()
        except Exception:
            pass

    loaded = classifier is not None and classifier.is_loaded
    device = str(classifier.device) if classifier else "cpu"
    name = classifier.model_name if classifier else MODEL_ATTRIBUTION["model_name"]

    return HealthResponse(
        status="healthy" if loaded else "initializing",
        model_loaded=loaded,
        device=device,
        model_name=name,
        supported_classes_count=MODEL_ATTRIBUTION["classes_count"],
        version="1.0.0"
    )


@app.get("/api/metrics", response_model=MetricsResponse, tags=["Model"])
async def get_model_metrics():
    """Retrieve upstream model card metrics, evaluation results, and attribution."""
    return MODEL_ATTRIBUTION


@app.get("/api/classes", tags=["Catalog"])
async def get_supported_classes():
    """Retrieve all 38 supported disease and health classes across 14 crops."""
    crops_summary: Dict[str, List[Dict[str, Any]]] = {}
    for raw_label, data in DISEASE_METADATA.items():
        crop = data["crop"]
        if crop not in crops_summary:
            crops_summary[crop] = []
        crops_summary[crop].append({
            "raw_label": raw_label,
            "disease": data["disease"],
            "is_healthy": data["is_healthy"],
            "severity": data["severity"],
            "description": data.get("description", ""),
            "treatment": data.get("treatment", ""),
            "prevention": data.get("prevention", [])
        })

    return {
        "total_classes": len(DISEASE_METADATA),
        "total_crops": len(crops_summary),
        "crops": crops_summary
    }


@app.post("/api/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict_crop_disease(file: UploadFile = File(...)):
    """
    Run real-time neural network inference on an uploaded leaf photograph.
    Returns predicted crop, disease status, top-3 scores, and treatment recommendations.
    """
    global classifier
    if classifier is None:
        classifier = get_classifier()

    if not classifier.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Neural network model is still initializing. Please retry in a few seconds."
        )

    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        filename_lower = (file.filename or "").lower()
        if not any(filename_lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file.content_type}'. Please upload a valid JPG, PNG, or WEBP leaf image."
            )

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        if len(image_bytes) > 15 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image file size exceeds the 15MB limit."
            )

        prediction = classifier.predict(image_bytes)
        return prediction

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Inference error during request: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(e)}"
        )
