# 📄 LeafLens AI — Mini-Project Academic Report

**Project Title:** LeafLens AI: Real-Time Crop Pathology Classification & Agronomic Decision Support System  
**Architecture:** MobileNetV2 (`google/mobilenet_v2_1.0_224` backbone)  
**Pretrained Checkpoint:** `neghani/plantvillage-mobilenetv2` (IIIT Hyderabad, Group 4)  
**Domain:** Agricultural Computer Vision / Deep Learning / Full-Stack Machine Learning  

---

## 1. Abstract
Plant foliar diseases pose severe threats to global food security and crop yield stability. Traditional plant disease diagnosis relies heavily on expert human visual scouting, which is labor-intensive, geographically constrained, and prone to subjective error. This project implements **LeafLens AI**, a production-oriented machine learning web application capable of performing real-time inference on leaf photographs across 38 distinct crop-disease classes spanning 14 agricultural crops. Powered by a fine-tuned MobileNetV2 architecture, the application delivers sub-30ms inference, displays candidate probability distributions, implements an explicit safety threshold alert (< 50% confidence warning), and provides actionable agronomic management guidance.

---

## 2. Problem Statement & Motivation
1. **Late Detection Losses**: Fungal, bacterial, and viral blights can wipe out entire harvests within days if not diagnosed during initial foliar lesion stages.
2. **Access Disparity**: Smallholder farmers frequently lack timely access to certified plant pathologists or extension officers.
3. **The "Domain Gap" Trap**: Many consumer-facing plant diagnostic apps present laboratory-trained neural networks as foolproof solutions without communicating the steep drop in accuracy when exposed to unconstrained field lighting and messy backgrounds.
4. **Objective**: Build an end-to-end, reproducible, lightweight screening system that couples rapid edge-ready classification with transparent academic attribution and realistic performance boundaries.

---

## 3. Pretrained Model & Upstream Attribution
- **Model Identifier**: [`neghani/plantvillage-mobilenetv2`](https://huggingface.co/neghani/plantvillage-mobilenetv2)
- **Base Checkpoint**: `google/mobilenet_v2_1.0_224`
- **Authors**: Group 4 (Capstone Project: *AI-Powered Plant Disease Detection and Farmer Assistance*), International Institute of Information Technology Hyderabad (IIIT-H).
- **License**: Apache 2.0
- **Training Dataset**: PlantVillage dataset (43,445 train / 5,430 validation / 5,430 held-out test color images).
- **Target Classes**: 38 classes across 14 crops (Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Bell Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato).

---

## 4. System Architecture & Methodology

```
┌────────────────────────────────────────────────────────────────┐
│                      Client Tier (Browser)                     │
│  - React 19 + TypeScript + Tailwind CSS v4                     │
│  - Recharts Top-3 Probability Distribution Visualization      │
│  - Session History in LocalStorage & JSON Export               │
│  - Quick-Test Sample Presets with Real Specimen Thumbnails     │
└───────────────────────────────┬────────────────────────────────┘
                                │ HTTP Multipart / JSON
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                     Vite Reverse Proxy Tier                    │
│  - Port 5173 -> Proxies /api requests to 127.0.0.1:8000       │
└───────────────────────────────┬────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                    API Service Tier (FastAPI)                  │
│  - GET  /api/health   -> Model status, device (CPU/CUDA)       │
│  - POST /api/predict  -> Validates format, runs inference      │
│  - GET  /api/metrics  -> Upstream model card attribution       │
│  - GET  /api/classes  -> 38 classes & agronomic metadata       │
└───────────────────────────────┬────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                   Inference Tier (PyTorch Engine)              │
│  - DiseaseClassifier Singleton (lifespan pre-loading)          │
│  - PIL RGB Image Normalization (224x224, ImageNet tensors)     │
│  - MobileNetV2 Forward Pass + Softmax Activation               │
│  - Top-3 TopK Extraction + 50.0% Confidence Threshold Gate     │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Experimental Evaluation & Upstream Benchmarks

The upstream model card documents two complementary evaluation splits that clearly highlight the difference between controlled laboratory conditions and natural field environments:

| Evaluation Split | Images | Top-1 Accuracy | Top-3 Accuracy | Macro F1 / Pass Rate |
| :--- | :--- | :--- | :--- | :--- |
| **PlantVillage Held-out Test Split** | 5,430 | **99.17%** | **99.98%** | **98.51%** |
| **Cropped-PlantDoc Real-World Set** | 25 | **16.0%** (95% CI: 6.4–34.7%) | **32.0%** | **16.0%** |

### Key Agronomic Takeaways:
1. **Laboratory Upper Bound**: On uniform grey/black card backgrounds, MobileNetV2 achieves near-perfect classification (> 99%).
2. **Field Domain Gap**: When leaves are photographed in natural daylight with shadows, soil, or complex vegetation, performance drops drastically to 16.0%.
3. **Threshold Gate Necessity**: Setting a confidence threshold of **0.50 (50.0%)** allows the system to filter ambiguous inputs and notify users to retake the photo with better lighting or seek professional consultation.

---

## 6. Software Engineering & Verification Results

### Backend Automated Test Suite (`pytest`):
All 6 integration tests in `backend/tests/test_api.py` passed with 100% success:
- `test_health_endpoint`: Verified system health, model presence, and 38 supported classes.
- `test_metrics_endpoint`: Verified upstream attribution and benchmark values.
- `test_classes_endpoint`: Verified taxonomy mapping across all 14 crops.
- `test_predict_empty_file`: Verified 400 Bad Request error handling for empty uploads.
- `test_predict_invalid_content_type`: Verified 400 Bad Request error handling for non-image files.
- `test_predict_valid_image`: Verified real forward-pass execution, top-3 candidates, and sub-30ms latency.

### Frontend Compilation (`npm run build`):
- `tsc -b && vite build` compiled 2,512 modules into optimized bundles in **729ms** with zero TypeScript errors.

---

## 7. Documented Limitations
1. **Closed-Set Assumption**: Any non-leaf image or disease from an unsupported crop is mathematically mapped to one of the 38 known classes.
2. **Single-Leaf Requirement**: Multi-leaf foliage or whole-canopy photos degrade spatial feature extraction.
3. **Softmax Overconfidence**: Highly out-of-distribution images can sometimes produce high softmax probabilities despite unfamiliar features.
4. **Advisory Scope**: Chemical spray recommendations are informational decision-support aids; they do not replace licensed agronomic inspection.

---

## 8. Future Scope
1. **Grad-CAM Saliency Maps**: Visualize attention heatmaps to verify that the neural network focuses on lesion patches rather than background paper.
2. **Out-of-Distribution (OOD) Detector**: Train a lightweight binary gate or Mahalanobis distance metric to reject non-leaf images before running MobileNetV2.
3. **Edge Optimization**: Export the checkpoint to ONNX / TensorFlow Lite / CoreML for zero-latency offline inference directly on mobile hardware.
4. **Multi-Pathogen Support**: Transition to multi-label classification for leaves suffering from concurrent fungal and nutritional deficiencies.
