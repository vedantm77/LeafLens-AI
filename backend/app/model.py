"""Model loading, inference, and classification logic for PlantVillage MobileNetV2."""

import io
import time
import logging
from typing import Dict, Any, List, Optional
from PIL import Image
import torch

from app.metadata import get_class_info, MODEL_ATTRIBUTION
from app.schemas import PredictionResponse, TopPrediction

logger = logging.getLogger("leaflens.model")
logging.basicConfig(level=logging.INFO)

MODEL_NAME = "neghani/plantvillage-mobilenetv2"
CONFIDENCE_THRESHOLD = 0.50

class DiseaseClassifier:
    _instance: Optional["DiseaseClassifier"] = None

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_name = MODEL_NAME
        self.model = None
        self.processor = None
        self.is_loaded = False
        self._load_model()

    @classmethod
    def get_instance(cls) -> "DiseaseClassifier":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self):
        logger.info(f"Loading {self.model_name} onto device: {self.device}...")
        try:
            from transformers import AutoImageProcessor, AutoModelForImageClassification
            self.processor = AutoImageProcessor.from_pretrained(self.model_name)
            self.model = AutoModelForImageClassification.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info(f"Successfully loaded {self.model_name} with {len(self.model.config.id2label)} classes.")

            # Warm-up pass with a synthetic dummy image
            dummy_img = Image.new("RGB", (224, 224), color=(120, 180, 80))
            dummy_inputs = self.processor(images=dummy_img, return_tensors="pt").to(self.device)
            with torch.no_grad():
                _ = self.model(**dummy_inputs)
            logger.info("Model warmup pass completed.")
        except Exception as e:
            logger.error(f"Failed to load Hugging Face model {self.model_name}: {e}", exc_info=True)
            self.is_loaded = False

    def predict(self, image_bytes: bytes) -> PredictionResponse:
        if not self.is_loaded or self.model is None or self.processor is None:
            raise RuntimeError("Model is not initialized or failed to load.")

        # Open and ensure RGB format
        try:
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != "RGB":
                image = image.convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid or corrupted image format: {e}")

        # Preprocess and infer
        start_time = time.perf_counter()
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]
        
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Extract top 3 predictions
        top_k = min(3, probs.shape[0])
        top_probs, top_indices = torch.topk(probs, k=top_k)

        top_3: List[TopPrediction] = []
        for prob_tensor, idx_tensor in zip(top_probs, top_indices):
            idx = int(idx_tensor.item())
            prob = float(prob_tensor.item())
            raw_label = self.model.config.id2label.get(idx, f"Class_{idx}")
            info = get_class_info(raw_label)
            top_3.append(TopPrediction(
                crop=info["crop"],
                disease=info["disease"],
                raw_label=raw_label,
                confidence=round(prob, 4),
                percentage=round(prob * 100, 2)
            ))

        primary = top_3[0]
        meta = get_class_info(primary.raw_label)

        # Confidence warning logic per upstream model card recommendations
        confidence_warning = None
        if primary.confidence < CONFIDENCE_THRESHOLD:
            confidence_warning = (
                f"Confidence warning: Predicted with {primary.percentage}% certainty, "
                f"which is below the recommended reliability threshold of 50.0%. "
                f"Field photos with complex backgrounds or atypical symptoms may result in ambiguous classifications. "
                f"Please take a well-lit, close-up photo of a single leaf or confirm with an agronomist."
            )

        return PredictionResponse(
            crop=meta["crop"],
            disease=meta["disease"],
            raw_label=primary.raw_label,
            is_healthy=meta["is_healthy"],
            severity=meta["severity"],
            confidence=primary.confidence,
            confidence_percentage=primary.percentage,
            confidence_warning=confidence_warning,
            top_3=top_3,
            description=meta["description"],
            treatment=meta["treatment"],
            prevention=meta["prevention"],
            inference_time_ms=inference_time_ms,
            model_name=self.model_name
        )


def get_classifier() -> DiseaseClassifier:
    return DiseaseClassifier.get_instance()
