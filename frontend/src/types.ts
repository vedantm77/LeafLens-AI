export interface TopPrediction {
  crop: string;
  disease: string;
  raw_label: string;
  confidence: number;
  percentage: number;
}

export interface PredictionResponse {
  crop: string;
  disease: string;
  raw_label: string;
  is_healthy: boolean;
  severity: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  confidence_percentage: number;
  confidence_warning?: string | null;
  top_3: TopPrediction[];
  description: string;
  treatment: string;
  prevention: string[];
  inference_time_ms: number;
  model_name: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  device: string;
  model_name: string;
  supported_classes_count: number;
  version: string;
}

export interface MetricsResponse {
  model_name: string;
  base_architecture: string;
  project: string;
  institution: string;
  training_date: string;
  license: string;
  upstream_repository: string;
  huggingface_url: string;
  classes_count: number;
  crops_count: number;
  recommended_threshold: number;
  held_out_metrics: {
    dataset: string;
    accuracy: number;
    macro_precision: number;
    macro_recall: number;
    macro_f1: number;
    top3_accuracy: number;
  };
  real_world_metrics: {
    dataset: string;
    top1_accuracy: number;
    top3_accuracy: number;
    pass_rate_end_to_end: number;
    notes: string;
  };
  limitations: string[];
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  crop: string;
  disease: string;
  is_healthy: boolean;
  confidence_percentage: number;
  severity: string;
  thumbnail: string;
  inference_time_ms: number;
  top_3: TopPrediction[];
  treatment: string;
}

export interface ClassCatalogItem {
  raw_label: string;
  disease: string;
  is_healthy: boolean;
  severity: string;
  description?: string;
  treatment?: string;
  prevention?: string[];
}

export interface CatalogResponse {
  total_classes: number;
  total_crops: number;
  crops: Record<string, ClassCatalogItem[]>;
}
