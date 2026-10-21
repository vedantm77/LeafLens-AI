"""Pydantic response and request models for LeafLens AI API."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TopPrediction(BaseModel):
    crop: str
    disease: str
    raw_label: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    percentage: float = Field(..., ge=0.0, le=100.0)


class PredictionResponse(BaseModel):
    crop: str
    disease: str
    raw_label: str
    is_healthy: bool
    severity: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_percentage: float = Field(..., ge=0.0, le=100.0)
    confidence_warning: Optional[str] = None
    top_3: List[TopPrediction]
    description: str
    treatment: str
    prevention: List[str]
    inference_time_ms: float
    model_name: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    model_name: str
    supported_classes_count: int
    version: str


class MetricsResponse(BaseModel):
    model_name: str
    base_architecture: str
    project: str
    institution: str
    training_date: str
    license: str
    upstream_repository: str
    huggingface_url: str
    classes_count: int
    crops_count: int
    recommended_threshold: float
    held_out_metrics: Dict[str, Any]
    real_world_metrics: Dict[str, Any]
    limitations: List[str]
