"""Integration and unit tests for LeafLens AI backend API."""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_test_image(color=(34, 139, 34), size=(224, 224)) -> io.BytesIO:
    """Helper to generate a realistic synthetic RGB test image in-memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def test_health_endpoint():
    """Verify health endpoint structure and availability."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data
    assert data["supported_classes_count"] == 38
    assert "neghani/plantvillage-mobilenetv2" in data["model_name"]


def test_metrics_endpoint():
    """Verify metrics endpoint returns correct upstream attribution and benchmarks."""
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "neghani/plantvillage-mobilenetv2"
    assert data["classes_count"] == 38
    assert data["crops_count"] == 14
    assert data["held_out_metrics"]["accuracy"] == 0.9917
    assert data["held_out_metrics"]["macro_f1"] == 0.9851
    assert data["real_world_metrics"]["top1_accuracy"] == 0.160
    assert "IIIT-H" in data["institution"]
    assert len(data["limitations"]) >= 3


def test_classes_endpoint():
    """Verify classes endpoint returns 38 classes across 14 crops."""
    response = client.get("/api/classes")
    assert response.status_code == 200
    data = response.json()
    assert data["total_classes"] == 38
    assert data["total_crops"] == 14
    assert "Tomato" in data["crops"]
    assert "Apple" in data["crops"]
    assert "Potato" in data["crops"]


def test_predict_empty_file():
    """Verify 400 error when uploading empty file."""
    response = client.post(
        "/api/predict",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_predict_invalid_content_type():
    """Verify 400 error when uploading invalid non-image content."""
    response = client.post(
        "/api/predict",
        files={"file": ("notes.txt", b"Hello world", "text/plain")}
    )
    assert response.status_code == 400
    assert "unsupported file type" in response.json()["detail"].lower()


def test_predict_valid_image():
    """Verify inference pipeline produces real predictions, top-3 scores, and metadata."""
    img_buf = create_test_image(color=(46, 125, 50))
    response = client.post(
        "/api/predict",
        files={"file": ("leaf_sample.png", img_buf, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "crop" in data
    assert "disease" in data
    assert "raw_label" in data
    assert isinstance(data["is_healthy"], bool)
    assert 0.0 <= data["confidence"] <= 1.0
    assert 0.0 <= data["confidence_percentage"] <= 100.0
    assert len(data["top_3"]) == 3
    assert data["inference_time_ms"] > 0
    assert len(data["treatment"]) > 0
    assert len(data["prevention"]) > 0

    # Verify top_3 structure
    top1 = data["top_3"][0]
    assert top1["crop"] == data["crop"]
    assert top1["disease"] == data["disease"]
    assert top1["confidence"] == data["confidence"]
