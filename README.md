# 🌿 LeafLens AI — Neural Crop Pathology & Disease Classifier

> **A polished, end-to-end machine learning system for real-time agricultural crop disease classification, transparent domain-gap benchmarking, and agronomic management guidance.**

[![Model Hub](https://img.shields.io/badge/Hugging%20Face-neghani%2Fplantvillage--mobilenetv2-yellow.svg)](https://huggingface.co/neghani/plantvillage-mobilenetv2)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20PyTorch-green.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%20%2B%20Tailwind%20v4-teal.svg)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-6%2F6%20Passed-brightgreen.svg)]()

---

## 📚 Academic & Submission Resources
- **Full Mini-Project Report**: [`docs/PROJECT_REPORT.md`](docs/PROJECT_REPORT.md)
- **10 Technical Viva Voce Questions & Answers**: [`docs/VIVA_QUESTIONS.md`](docs/VIVA_QUESTIONS.md)

---

## 📖 Project Overview

**LeafLens AI** brings agricultural computer vision from the research laboratory to practical decision support. Utilizing a fine-tuned MobileNetV2 architecture trained on the 38-class PlantVillage dataset, farmers, students, and agronomists can upload a leaf photograph to obtain:
1. **Primary Diagnosis**: Crop identification and specific disease/pathology determination.
2. **Top-3 Probability Distribution**: Softmax distribution across the 3 most likely candidate pathogens.
3. **Safety Threshold Warning**: An automated warning when top-1 confidence falls below 50.0%, indicating ambiguous field lighting, atypical lesions, or complex backgrounds.
4. **Agronomic Treatment Guidance**: Curated cultural, organic, and chemical management actions.
5. **38-Class Catalog**: Searchable pathology dictionary covering 14 key agricultural crops.
6. **Session History**: Private, zero-backend scan persistence saved to `localStorage` with JSON export.

---

## 🏛️ System Architecture

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

## 🔬 Model Card Attribution & Upstream Heritage

* **Model Checkpoint**: [`neghani/plantvillage-mobilenetv2`](https://huggingface.co/neghani/plantvillage-mobilenetv2)
* **Base Architecture**: [`google/mobilenet_v2_1.0_224`](https://huggingface.co/google/mobilenet_v2_1.0_224)
* **Capstone Project**: *AI-Powered Plant Disease Detection and Farmer Assistance*
* **Institution**: International Institute of Information Technology, Hyderabad (IIIT-H, Group 4)
* **Upstream Code Repository**: [GitHub: iiith-group4-capstone-plat-leaf-decease-detection](https://github.com/neghani/iiith-group4-capstone-plat-leaf-decease-detection)
* **License**: Apache 2.0
* **Input Specs**: 224×224 RGB image, normalized using ImageNet mean/standard deviation.
* **Target Classes**: 38 total classes spanning 14 agricultural crops:
  - Apple (4 classes)
  - Blueberry (1 class)
  - Cherry (2 classes)
  - Corn / Maize (4 classes)
  - Grape (4 classes)
  - Orange (1 class)
  - Peach (2 classes)
  - Bell Pepper (2 classes)
  - Potato (3 classes)
  - Raspberry (1 class)
  - Soybean (1 class)
  - Squash (1 class)
  - Strawberry (2 classes)
  - Tomato (10 classes)

---

## 📊 Empirical Benchmarks: Laboratory vs. Real-World Domain Gap

As documented in the author's upstream model card, laboratory leaf scans differ significantly from natural field photographs:

| Benchmark Dataset | Test Set Size | Top-1 Accuracy | Top-3 Accuracy | Macro F1 / Pass Rate |
| :--- | :--- | :--- | :--- | :--- |
| **PlantVillage (Held-out Test Split)** | 5,430 images | **99.17%** | **99.98%** | **98.51%** |
| **Cropped-PlantDoc (Real-World Field Set)** | 25 images | **16.0%** (95% CI 6.4–34.7%) | **32.0%** | **16.0%** |

### Why This Domain Gap Exists:
1. **Background Uniformity**: PlantVillage photos were captured under controlled laboratory lighting against uniform grey/black paper backdrops.
2. **Field Complexity**: Phone photos taken by farmers in real fields exhibit complex soil/canopy backgrounds, dynamic sun glare, motion blur, and variable shadowing.
3. **Safety Mitigation**: LeafLens AI implements the model author's recommended **confidence threshold of 0.50**. When the top-1 score falls below 50.0%, an explicit amber alert warns the user that the prediction is uncertain and advises capturing a closer, well-lit single-leaf photo.

---

## ⚙️ Methodology & Pipeline

1. **Preprocessing**:
   - Accepts JPG, PNG, WEBP, or BMP images (validated up to 15MB).
   - In-memory RGB conversion via PIL (`Image.convert("RGB")`).
   - Resized to shortest edge, center cropped to $224\times224$, and normalized with ImageNet channel statistics ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).
2. **Neural Forward Pass**:
   - Model initialized as an in-memory singleton via FastAPI's `lifespan` hook.
   - Evaluated under `torch.no_grad()` on CPU/CUDA.
   - Softmax activation applied to raw class logits to extract normalized probability distribution.
3. **Candidate Ranking & Threshold Check**:
   - Extracts top-3 candidate classes using `torch.topk(probs, k=3)`.
   - Compares top-1 probability against $0.50$ safety cutoff; generates contextual confidence warning if below threshold.
4. **Agronomic Mapping**:
   - Matches predicted class string to curated pathology database in `app/metadata.py`.
   - Returns structured JSON payload containing pathogen details, severity classification, and practical cultural/chemical management guidance.

---

## ⚠️ Known Limitations & Scope

1. **Closed-World Category Assumption**: The model only recognizes the 38 classes present in PlantVillage. Non-leaf objects, weeds, nutrient deficiencies, and diseases from unrepresented crops will be forced into the nearest class.
2. **Single-Leaf Input**: The model expects one roughly centered leaf. Full plant canopy shots and mixed multi-pathogen infections are out of scope.
3. **Softmax Overconfidence**: Raw softmax outputs can be overconfident on out-of-distribution inputs.
4. **Advisory Disclaimer**: All diagnosis and treatment guidance are intended for agricultural decision support only. Confirm agrochemical applications with certified local agricultural extension officers.

---

## 🔮 Future Scope

1. **Explainable AI (Grad-CAM)**: Generate gradient-weighted class activation heatmaps to visually verify that the model attends to foliar lesions rather than background artifacts.
2. **Out-of-Distribution (OOD) Gating**: Incorporate a lightweight binary classifier or energy-based OOD detector to reject non-plant or non-leaf photos before classification.
3. **Edge Deployment**: Convert the PyTorch checkpoint to ONNX Runtime and TensorFlow Lite for completely offline on-device inference on agricultural handhelds.
4. **Multi-Label Pathology**: Extend from single-label classification to multi-label prediction for plants exhibiting concurrent insect damage and fungal infection.

---

## 🧪 Verification & Test Results

The automated test suite was executed against the running backend with real inference passes:

```powershell
pytest backend/tests/test_api.py -v
```

### Actual Test Results (6 / 6 Passed):
- `tests/test_api.py::test_health_endpoint` **PASSED** (200 OK, device, model status, 38 classes)
- `tests/test_api.py::test_metrics_endpoint` **PASSED** (200 OK, upstream attribution, benchmark metrics)
- `tests/test_api.py::test_classes_endpoint` **PASSED** (200 OK, 38 classes across 14 crops)
- `tests/test_api.py::test_predict_empty_file` **PASSED** (400 Bad Request on empty upload)
- `tests/test_api.py::test_predict_invalid_content_type` **PASSED** (400 Bad Request on text file)
- `tests/test_api.py::test_predict_valid_image` **PASSED** (Real inference pass, top-3 candidates, sub-25ms inference time)

### Frontend Production Build:
```
✓ 2512 modules transformed
dist/index.html                   1.57 kB │ gzip:   0.93 kB
dist/assets/index-B7YQ2Fil.css   40.66 kB │ gzip:   7.76 kB
dist/assets/index-DNyvhY24.js   657.54 kB │ gzip: 191.16 kB
✓ built in 729ms
```

---

## 📁 Repository Structure

```
LeafLens-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI routes (/health, /predict, /metrics, /classes)
│   │   ├── model.py           # DiseaseClassifier singleton & PyTorch inference
│   │   ├── metadata.py        # 38-class descriptions, treatment guidance, attribution
│   │   └── schemas.py         # Pydantic request & response models
│   ├── tests/
│   │   └── test_api.py        # Integration test suite (6 tests)
│   ├── pytest.ini             # Pytest configuration with pythonpath
│   └── requirements.txt       # Backend dependencies
├── docs/
│   ├── PROJECT_REPORT.md      # Formal academic project report outline
│   └── VIVA_QUESTIONS.md      # 10 comprehensive viva voce questions & answers
├── frontend/
│   ├── public/
│   │   └── samples/           # Sample test images (healthy, blighted, low-confidence, rust)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx     # Navigation & live backend health badge
│   │   │   ├── Scanner.tsx    # Drag-and-drop studio, presets, Recharts top-3
│   │   │   ├── ModelMetrics.tsx# Model card attribution & domain gap benchmark chart
│   │   │   ├── Catalog.tsx    # 38-class searchable catalog browser with detail modal
│   │   │   ├── History.tsx    # LocalStorage scan records with inspection & JSON export
│   │   │   └── Footer.tsx     # Disclaimer and upstream repository links
│   │   ├── App.tsx            # Main layout and tab controller
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── index.css          # Tailwind CSS v4 design system
│   ├── package.json
│   ├── vite.config.ts         # Vite configuration with API reverse proxy (:8000)
│   └── index.html
├── .venv/                     # Python 3.12 virtual environment
└── README.md                  # System documentation
```

---

## 🚀 Run Commands

### 1. Prerequisites
- Python 3.12 (with `uv` or `pip`)
- Node.js 18+ and `npm`

### 2. Backend Setup & Launch
```bash
# From workspace root:
cd backend

# Install dependencies (if not already installed in .venv):
uv pip install -r requirements.txt

# Start FastAPI server on port 8000:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Documentation will be accessible at: `http://127.0.0.1:8000/docs`*

### 3. Frontend Setup & Launch
```bash
# In a separate terminal, from workspace root:
cd frontend

# Install dependencies:
npm install

# Start Vite development server:
npm run dev
```
*Web application will be accessible at: `http://localhost:5173/`*

### 4. Running Backend Tests
```bash
cd backend
pytest -v
```

---

## 🛡️ License & Acknowledgments

- **Model Weights & Card**: Created by **IIIT Hyderabad (Group 4)** under the **Apache 2.0** license.
- **Dataset**: PlantVillage (David P. Hughes & Marcel Salathé, 2015) and Cropped-PlantDoc (Singh et al., 2020).
