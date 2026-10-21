# 🎓 LeafLens AI — Viva Voce Questions & Answers

This document provides 10 key technical and academic viva questions with in-depth answers, tailored for project examiners, university defense panels, and technical interviews.

---

### Q1: Why was MobileNetV2 chosen as the base architecture instead of ResNet-50 or a Vision Transformer (ViT)?
**Answer:**  
MobileNetV2 was engineered specifically for resource-constrained edge computing environments. It replaces standard heavy convolutions with **depthwise separable convolutions** (a depthwise spatial convolution followed by a $1\times1$ pointwise projection), reducing computational multiply-accumulate (MAC) operations by nearly an order of magnitude (typically an 8× to 9× reduction) with minimal drop in top-1 accuracy. Furthermore, its **inverted residual blocks with linear bottlenecks** allow high-dimensional feature expansion internally while keeping memory footprints small. For agricultural apps meant to serve farmers in rural locations with low compute and bandwidth, a 9MB MobileNetV2 model executing in ~20ms on CPU is vastly more practical than a 100MB+ ResNet or compute-heavy ViT.

---

### Q2: What is the "domain gap" between the PlantVillage dataset and real-world field photography?
**Answer:**  
The **PlantVillage dataset** was collected primarily under controlled laboratory settings: individual leaves were excised, laid flat, and photographed under uniform illumination against uniform grey or black cardboard backdrops. As a consequence, models trained purely on PlantVillage achieve >99% accuracy on held-out laboratory splits because they do not have to contend with natural background foliage, soil, shadows, sunlight specularities, motion blur, or insect damage. When the upstream authors evaluated this checkpoint against the real-world **Cropped-PlantDoc** dataset (actual field smartphone photos), top-1 accuracy dropped from 99.17% to 16.0%. This highlights the classic domain adaptation problem in machine learning.

---

### Q3: Why is a confidence threshold of 50.0% implemented in LeafLens AI?
**Answer:**  
Standard classification networks utilize a **Softmax activation function** ($\sigma(\mathbf{z})_i = \frac{e^{z_i}}{\sum_j e^{z_j}}$) in the final layer. Softmax enforces that all class probabilities sum to 1.0, which means the model is mathematically forced to assign probability even when presented with ambiguous, blurry, or out-of-distribution inputs. The upstream authors performed a **confidence threshold sweep** on validation data and discovered that a cutoff of **0.50 (50%)** retains 99.91% coverage of valid laboratory test images while providing an effective safety trigger to flag uncertain, low-confidence predictions on ambiguous field photos.

---

### Q4: What is the "closed-world assumption" in multi-class classification, and how does it affect this application?
**Answer:**  
The closed-world assumption assumes that all possible inputs belong to one of the predetermined $K$ classes (here, $K = 38$). If a farmer takes a photograph of an unsupported crop (e.g., wheat, rice, or mango), a weed, a human hand, or a plant suffering from nitrogen deficiency, the network cannot output "Not in training set". Instead, it will project the features onto the nearest hyperplane in its 38-class embedding space. To mitigate this in practice, systems must implement confidence thresholding, out-of-distribution detection, and explicit disclaimers alerting users that only the 38 catalogued classes can be classified.

---

### Q5: How does the backend prevent cold-start latency when handling the first incoming prediction request?
**Answer:**  
In FastAPI, using the modern **`lifespan` async context manager** (`@asynccontextmanager async def lifespan(app: FastAPI)`), the `DiseaseClassifier` singleton is instantiated during server initialization prior to accepting network traffic. During this startup hook, the model weights are loaded into memory, placed in `.eval()` mode, and a **synthetic warmup pass** (a dummy $224\times224$ RGB tensor) is passed through `model(**dummy_inputs)`. This compiles internal PyTorch computation graphs and memory allocations ahead of time, ensuring that the first real user request experiences identical sub-30ms latency.

---

### Q6: How does LeafLens AI ensure data privacy and session persistence without requiring a central database?
**Answer:**  
The application persists diagnostic history entirely client-side using the browser's **`localStorage` API** (`leaflens_scan_history`). Each successful inference payload generates a lightweight timestamped `ScanRecord` containing the predicted diagnosis, top-3 candidates, confidence score, treatment summary, and thumbnail. No user photos, farm location data, or private scans are retained on the backend server, ensuring complete data ownership and zero GDPR/data-retention compliance overhead. Users can also export their full scan trajectory as a portable JSON file.

---

### Q7: Why did we configure a Vite reverse proxy (`server.proxy`) instead of relying solely on backend CORS headers?
**Answer:**  
While FastAPI includes `CORSMiddleware`, in a modern decoupled architecture, having the Vite dev server proxy `/api` requests to `http://127.0.0.1:8000` accomplishes two vital goals:
1. **Seamless Same-Origin Policy**: Requests from the browser originate from `http://localhost:5173/api/*`, eliminating CORS pre-flight `OPTIONS` overhead.
2. **Production Mirroring**: In production (e.g., behind NGINX or Caddy), the frontend and API are served under the same domain, with the reverse proxy handling path routing. Configuring Vite's proxy mirrors this production topology during local development.

---

### Q8: What is the difference between Top-1 Accuracy and Top-3 Accuracy, and why are both reported?
**Answer:**  
- **Top-1 Accuracy** requires the model's highest-scoring class ($\text{argmax}_i \, p_i$) to match the true ground-truth label exactly.
- **Top-3 Accuracy** considers the prediction correct if the ground-truth label appears anywhere within the top three predicted classes with the highest softmax probabilities.
In plant pathology, many foliar fungal diseases (e.g., Early Blight vs. Late Blight vs. Septoria Leaf Spot on tomato) present visually similar necrotic rings in their early stages. Reporting Top-3 accuracy (99.98% on PlantVillage, 32.0% on field photos) reflects realistic differential diagnosis in clinical biology, giving agronomists visibility into plausible candidate pathogens.

---

### Q9: Why is Macro F1 score preferred over simple accuracy for evaluating the PlantVillage dataset?
**Answer:**  
The PlantVillage dataset suffers from notable **class imbalance** across its 38 classes (for example, Orange Citrus Greening has over 5,500 training samples, whereas Apple Cedar Rust has fewer than 300 samples). In an imbalanced dataset, a naive model could achieve high overall accuracy simply by over-predicting the majority classes. **Macro F1** calculates the unweighted mean of F1-scores across all 38 classes independently:
$$\text{Macro F1} = \frac{1}{K} \sum_{k=1}^K \text{F1}_k$$
This guarantees that small-support classes (like Cedar Apple Rust or Raspberry Healthy) are evaluated with equal importance as dominant classes.

---

### Q10: How can Explainable AI (XAI) such as Grad-CAM be integrated to improve trust in this diagnostic tool?
**Answer:**  
**Grad-CAM (Gradient-weighted Class Activation Mapping)** calculates the gradients of the target class score with respect to the feature activation maps of the final convolutional layer of MobileNetV2 (`features.18` or `Conv_1`). By performing global average pooling over the gradients and computing a rectified linear combination of the feature maps:
$$L^c_{\text{Grad-CAM}} = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$
Grad-CAM generates a coarse 2D spatial heatmap. Overlaying this heatmap on the input leaf reveals whether the neural network made its decision based on necrotic spots on the leaf blade or erroneously latched onto background artifacts, shadows, or water droplets. This provides crucial visual verification for agronomists before accepting an automated diagnosis.
