import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  BookmarkCheck,
  Download,
  Info,
  ShieldCheck,
  ShieldAlert,
  SunMedium,
  Crosshair,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { PredictionResponse, ScanRecord } from '../types';

interface ScannerProps {
  onScanSaved?: (record: ScanRecord) => void;
  loadedRecord?: ScanRecord | null;
}

const SPECIMEN_PRESETS = [
  {
    id: '№ 01',
    name: 'Capsicum annuum',
    common: 'Healthy Bell Pepper',
    diagnosis: 'Healthy Foliage',
    filename: '/specimens/healthy_specimen.jpg',
    badge: '93.8% Conf',
    badgeStyle: 'text-[#1e4620] bg-[#eef5ed] border-[#cce3cb]',
  },
  {
    id: '№ 02',
    name: 'Solanum lycopersicum',
    common: 'Tomato Early Blight',
    diagnosis: 'Alternaria Target Spots',
    filename: '/specimens/blighted_specimen.jpg',
    badge: '86.8% Conf',
    badgeStyle: 'text-[#7d3f1b] bg-[#fbf0e8] border-[#eed1be]',
  },
  {
    id: '№ 03',
    name: 'Zea mays',
    common: 'Corn Common Blight',
    diagnosis: 'Foliar Blight',
    filename: '/specimens/rust_specimen.jpg',
    badge: '56.0% Conf',
    badgeStyle: 'text-[#634918] bg-[#fbf5e6] border-[#ecdeb9]',
  },
  {
    id: '№ 04',
    name: 'Phaseolus vulgaris',
    common: 'Field Specimen (Anomaly)',
    diagnosis: 'Atypical Lesions',
    filename: '/specimens/field_specimen.jpg',
    badge: '38.9% Conf (Alert)',
    badgeStyle: 'text-[#8b261e] bg-[#fdf0ef] border-[#f4c8c4]',
  },
];

export const Scanner: React.FC<ScannerProps> = ({ onScanSaved, loadedRecord }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKb: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if a record is loaded from History
  useEffect(() => {
    if (loadedRecord) {
      setPreviewUrl(loadedRecord.thumbnail || null);
      setSelectedFile(null);
      setImageMeta(null);
      setResult({
        crop: loadedRecord.crop,
        disease: loadedRecord.disease,
        raw_label: loadedRecord.top_3[0]?.raw_label || '',
        is_healthy: loadedRecord.is_healthy,
        severity: (loadedRecord.severity as any) || 'moderate',
        confidence: loadedRecord.confidence_percentage / 100,
        confidence_percentage: loadedRecord.confidence_percentage,
        confidence_warning: loadedRecord.confidence_percentage < 50
          ? `Confidence warning: Predicted with ${loadedRecord.confidence_percentage}% certainty (< 50% threshold). Ambiguous field lighting or atypical symptoms detected. Please verify with a pathologist.`
          : null,
        top_3: loadedRecord.top_3,
        description: `Archived session scan for ${loadedRecord.crop} (${loadedRecord.disease}).`,
        treatment: loadedRecord.treatment,
        prevention: [
          'Rotate crop families every 2 seasons',
          'Avoid overhead sprinkler watering to reduce canopy humidity',
          'Sanitize pruning tools between cuts'
        ],
        inference_time_ms: loadedRecord.inference_time_ms,
        model_name: 'neghani/plantvillage-mobilenetv2'
      });
    }
  }, [loadedRecord]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (file: File) => {
    setError(null);
    setResult(null);
    setSavedSuccess(false);

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image file exceeds the 15MB size limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    img.src = objectUrl;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const loadPreset = async (preset: typeof SPECIMEN_PRESETS[0]) => {
    setError(null);
    setResult(null);
    setSavedSuccess(false);
    try {
      const response = await fetch(preset.filename);
      const blob = await response.blob();
      const file = new File([blob], `${preset.name.toLowerCase().replace(/\s+/g, '_')}.jpg`, {
        type: 'image/jpeg',
      });
      handleFileChange(file);
    } catch (err) {
      setError(`Could not load preset sample: ${err}`);
    }
  };

  const runInference = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setSavedSuccess(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error status ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      setResult(data);
      saveToHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete diagnosis. Check backend connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = (scanResult: PredictionResponse) => {
    try {
      const existingStr = localStorage.getItem('leaflens_scan_history');
      const existing: ScanRecord[] = existingStr ? JSON.parse(existingStr) : [];

      const record: ScanRecord = {
        id: `scan_${Date.now()}`,
        timestamp: new Date().toISOString(),
        crop: scanResult.crop,
        disease: scanResult.disease,
        is_healthy: scanResult.is_healthy,
        confidence_percentage: scanResult.confidence_percentage,
        severity: scanResult.severity,
        thumbnail: previewUrl || '',
        inference_time_ms: scanResult.inference_time_ms,
        top_3: scanResult.top_3,
        treatment: scanResult.treatment,
      };

      const updated = [record, ...existing.slice(0, 49)];
      localStorage.setItem('leaflens_scan_history', JSON.stringify(updated));
      setSavedSuccess(true);
      if (onScanSaved) {
        onScanSaved(record);
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const downloadJsonReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `specimen_report_${result.crop.toLowerCase()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setImageMeta(null);
    setSavedSuccess(false);
  };

  const getSeverityBadge = (severity: string, isHealthy: boolean) => {
    if (isHealthy) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono tracking-tight text-[#173827] bg-[#eef4ee] border border-[#c4dcbe]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#245934]" />
          HEALTHY SPECIMEN
        </span>
      );
    }
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono tracking-tight text-[#841919] bg-[#faebeb] border border-[#e8b5b5]">
            <AlertOctagon className="w-3.5 h-3.5 text-[#9e1c1c]" />
            CRITICAL PATHOLOGY
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono tracking-tight text-[#8c3214] bg-[#faeee8] border border-[#e8c0b2]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ad3813]" />
            HIGH SEVERITY
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono tracking-tight text-[#735114] bg-[#fbf6e8] border border-[#e8d7ad]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#916719]" />
            MODERATE SEVERITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono tracking-tight text-[#1a4a6e] bg-[#ecf4fa] border border-[#b8d6ec]">
            <Info className="w-3.5 h-3.5 text-[#1b5884]" />
            LOW SEVERITY
          </span>
        );
    }
  };

  const chartData = result?.top_3.map((item, idx) => ({
    name: `${item.crop} - ${item.disease}`,
    shortName: item.disease.length > 22 ? item.disease.slice(0, 20) + '…' : item.disease,
    percentage: item.percentage,
    isPrimary: idx === 0,
  })) || [];

  return (
    <div className="space-y-12">
      {/* 1. Open Editorial Masthead on Warm Ivory Background */}
      <section className="pt-2 pb-8 border-b border-[#e5dfd2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Editorial Title & Lead */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#526356]">
              <span>FOLIO IV · BOTANICAL PATHOLOGY ARCHIVE</span>
              <span>•</span>
              <span>MONOGRAPH № 038</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#19221a] leading-[1.12]">
              Visual Diagnostics for <span className="italic font-light">Crop Foliar Pathology</span>
            </h1>

            <p className="text-[#4a544c] text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              An automated botanical screening system powered by MobileNetV2. Upload a single leaf specimen
              to compute 38-class PlantVillage posterior probabilities, differential top-three candidates,
              and curated agronomic management guidance.
            </p>

            {/* Scientific Citation Metadata Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] font-mono text-[#616c63] border-t border-[#ece6da]">
              <span>CHECKPOINT: neghani/plantvillage-mobilenetv2</span>
              <span className="opacity-40">•</span>
              <span>INPUT: 224 × 224 RGB</span>
              <span className="opacity-40">•</span>
              <span>SAFETY THRESHOLD: 0.50 (50.0%)</span>
            </div>
          </div>

          {/* Authentic Botanical Herbarium Crop */}
          <div className="lg:col-span-5">
            <div className="bg-[#f3eee2] p-2.5 border border-[#dfd8ca] shadow-xs">
              <div className="relative aspect-4/3 overflow-hidden border border-[#d6cebf] bg-[#e8e2d4]">
                <img
                  src="/specimens/botanical_hero.jpg"
                  alt="Archival botanical herbarium specimen"
                  className="w-full h-full object-cover saturate-[0.92]"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#5b645d] px-0.5">
                <span>SPECIMEN REF. SL-2023-014</span>
                <span className="italic font-serif text-[11px]">Solanum lycopersicum L.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Compact Specimen Reference Strip (Calibrated Real Samples) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#5a665d]">
            CALIBRATED REFERENCE SPECIMENS (TEST REPOSITORY)
          </span>
          <span className="text-[11px] text-[#717c73] font-light">
            Select a verified leaf to populate workbench
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SPECIMEN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset)}
              className="text-left p-3 bg-white hover:bg-[#faf7f0] border border-[#dfd8ca] hover:border-[#173827] transition-all cursor-pointer group flex items-start gap-3"
            >
              <div className="w-14 h-14 rounded-xs overflow-hidden bg-[#e8e3d6] shrink-0 border border-[#d8d0c0]">
                <img
                  src={preset.filename}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-[#7a857d]">{preset.id}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 border ${preset.badgeStyle}`}>
                    {preset.badge}
                  </span>
                </div>
                <div className="font-serif italic text-xs text-[#1a231b] truncate mt-0.5 font-medium">
                  {preset.name}
                </div>
                <div className="text-[11px] text-[#4f5951] truncate">
                  {preset.common}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Main Specimen Workspace (Intake vs. Scientific Field Report) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Specimen Intake Workbench */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#ded8cb] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee8dc]">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
                  STAGE 01
                </span>
                <h2 className="font-serif text-lg text-[#19221a]">
                  Specimen Intake & Preparation
                </h2>
              </div>
              {previewUrl && (
                <button
                  onClick={resetAll}
                  className="text-xs text-[#6b756e] hover:text-[#173827] flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RefreshCw className="w-3 h-3" /> RESET
                </button>
              )}
            </div>

            {/* Dropzone Container */}
            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#173827] bg-[#f2eee3]'
                    : 'border-[#cfc7b6] hover:border-[#173827] bg-[#faf8f3]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
                <div className="w-10 h-10 mx-auto bg-[#eae4d5] text-[#173827] flex items-center justify-center mb-3">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="font-serif text-base text-[#1c241d] mb-1">
                  Place leaf photograph here
                </p>
                <p className="text-xs text-[#636c64] font-light mb-4">
                  or select an uncompressed specimen from local disk (JPG, PNG, WEBP)
                </p>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase bg-[#173827] text-[#fbf9f4] hover:bg-[#1f4a34] transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> Select Local File
                </span>
              </div>
            ) : (
              /* Specimen Photograph Preview with Archival Border */
              <div className="space-y-4">
                <div className="relative border border-[#d6cebf] bg-[#1a1e1b] aspect-square flex items-center justify-center p-1">
                  <img
                    src={previewUrl}
                    alt="Active specimen preview"
                    className="max-h-full max-w-full object-contain"
                  />

                  {/* Clean Loading State */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#161a17]/85 backdrop-blur-xs flex flex-col items-center justify-center text-[#fbf9f4] p-4 text-center">
                      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent animate-spin mb-3"></div>
                      <p className="font-serif text-base italic">Evaluating Specimen...</p>
                      <p className="text-[11px] font-mono text-emerald-300 mt-1">MobileNetV2 38-Class Forward Pass</p>
                    </div>
                  )}

                  {/* Scientific Overlay Specifications */}
                  <div className="absolute bottom-2 left-2 bg-[#171a18]/90 px-2 py-0.5 text-[10px] font-mono text-[#ded6c8] border border-[#3b433d] flex items-center gap-2">
                    <span>{imageMeta ? `${imageMeta.width}×${imageMeta.height} PX` : 'SPECIMEN'}</span>
                    <span>•</span>
                    <span>{imageMeta ? `${imageMeta.sizeKb} KB` : 'LOCAL FILE'}</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={runInference}
                  disabled={isAnalyzing}
                  className={`w-full py-3 px-4 text-xs font-mono uppercase tracking-wider text-[#fbf9f4] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAnalyzing
                      ? 'bg-[#293d31] cursor-wait'
                      : 'bg-[#173827] hover:bg-[#204934] active:scale-[0.99]'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Computing Logits...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Diagnostic Forward Pass</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div className="p-3 bg-[#faeeee] border border-[#e5b3b3] text-[#841919] text-xs flex items-start gap-2.5">
                <AlertOctagon className="w-4 h-4 text-[#9e1c1c] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px]">Ingestion Error</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scientific Field Report */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !isAnalyzing && (
            <div className="bg-white border border-[#ded8cb] p-8 text-[#546057] space-y-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
                  STAGE 02
                </span>
                <h3 className="font-serif text-xl text-[#19221a]">
                  Specimen Pathology Report
                </h3>
                <p className="text-xs text-[#6b756d] mt-1 font-light leading-relaxed">
                  Awaiting image execution. Load an accession from the reference strip or upload an original leaf to inspect pathology metrics.
                </p>
              </div>

              {/* Botanical Inspection Standard Checklist */}
              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd2] space-y-3">
                <h4 className="text-[11px] font-mono tracking-widest uppercase text-[#424e45]">
                  Standard Botanical Acquisition Protocol
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#525f56]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#19231a]">
                      <Crosshair className="w-3.5 h-3.5 text-[#173827]" />
                      <span>Single Leaf Frame</span>
                    </div>
                    <p className="text-[11px] text-[#6b756d] font-light">Centred single blade without background foliage.</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#19231a]">
                      <SunMedium className="w-3.5 h-3.5 text-[#173827]" />
                      <span>Indirect Daylight</span>
                    </div>
                    <p className="text-[11px] text-[#6b756d] font-light">Diffuse lighting minimizes harsh specular flash.</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#19231a]">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#173827]" />
                      <span>Safety Gate</span>
                    </div>
                    <p className="text-[11px] text-[#6b756d] font-light">Scores &lt;50% trigger an uncertain warning.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white border border-[#ded8cb] p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#173827] border-t-transparent animate-spin mx-auto mb-4"></div>
              <h3 className="font-serif text-xl text-[#19221a] italic">
                Analyzing Foliar Pathology...
              </h3>
              <p className="text-xs text-[#6b756e] max-w-sm mx-auto mt-1 font-light">
                Preprocessing ImageNet tensor, extracting MobileNetV2 inverted residual features, and looking up agronomic treatment literature...
              </p>
            </div>
          )}

          {result && (
            <div className="bg-white border border-[#ded8cb] p-6 sm:p-8 space-y-6">
              {/* Report Header */}
              <div className="border-b border-[#eee8dc] pb-5 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#5b665e]">
                  <span>DIAGNOSTIC REPORT · ACCESSION № LL-{Date.now().toString().slice(-6)}</span>
                  <span>TIME: {result.inference_time_ms} MS</span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#173827] font-semibold">
                        {result.crop}
                      </span>
                      {getSeverityBadge(result.severity, result.is_healthy)}
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#19221a] tracking-tight">
                      {result.disease}
                    </h2>
                    <p className="text-xs font-mono text-[#768078] mt-0.5">
                      TAXONOMIC LABEL: {result.raw_label}
                    </p>
                  </div>

                  {/* Primary Confidence Reading */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-[#616c63] block">POSTERIOR PROBABILITY</span>
                    <span className="font-serif text-3xl sm:text-4xl text-[#173827] font-normal">
                      {result.confidence_percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Low-Confidence Archival Warning Banner (<50%) */}
              {result.confidence_warning && (
                <div className="p-4 bg-[#fcf5e8] border border-[#e8ce9e] text-[#6d4d12] text-xs flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-[#916719] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider block text-[#845b14]">
                      THRESHOLD MEMORANDUM · LOW CONFIDENCE (&lt; 0.50)
                    </span>
                    <p className="mt-1 leading-relaxed text-[#5c4214] font-light">
                      {result.confidence_warning}
                    </p>
                  </div>
                </div>
              )}

              {/* Top-3 Candidates Table & Bar Distribution */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#5a665d]">
                    TOP-THREE CANDIDATE DISTRIBUTION (SOFTMAX)
                  </span>
                  <span className="text-[10px] font-mono text-[#7b857d]">NORMALIZED PROBABILITY</span>
                </div>

                <div className="border border-[#ebe5d8] divide-y divide-[#ebe5d8]">
                  {result.top_3.map((cand, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-[#7d8780] w-5">0{idx + 1}</span>
                        <span className={`${idx === 0 ? 'font-serif font-medium text-[#19221a] text-sm' : 'text-[#4e5750]'}`}>
                          {cand.crop} — {cand.disease}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-36 h-1.5 bg-[#eee8dc] overflow-hidden">
                          <div
                            className={`h-full ${idx === 0 ? 'bg-[#173827]' : 'bg-[#6b8273]'}`}
                            style={{ width: `${cand.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-[#19221a] font-medium w-12 text-right">
                          {cand.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Minimalist Recharts Container */}
                <div className="h-32 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 25, left: 10, bottom: 0 }}>
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: '#6c776f' }} />
                      <YAxis type="category" dataKey="shortName" tick={{ fontSize: 11, fill: '#374139' }} width={110} />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Posterior Probability']}
                        contentStyle={{
                          backgroundColor: '#1b221d',
                          border: 'none',
                          color: '#fbf9f4',
                          fontSize: '11px',
                          borderRadius: '2px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Bar dataKey="percentage" radius={[0, 2, 2, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isPrimary ? '#173827' : index === 1 ? '#496d56' : '#99a39a'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Clinical Pathology Summary & Management Guidance */}
              <div className="pt-4 border-t border-[#eee8dc] space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
                    PATHOLOGY PROFILE
                  </span>
                  <p className="text-xs text-[#3b443d] leading-relaxed font-light">
                    {result.description}
                  </p>
                </div>

                <div className="p-3.5 bg-[#f6f4ee] border border-[#e3ded2] space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#173827] font-semibold block">
                    RECOMMENDED AGRONOMIC MANAGEMENT
                  </span>
                  <p className="text-xs text-[#2c362e] leading-relaxed">
                    {result.treatment}
                  </p>
                </div>

                {result.prevention && result.prevention.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
                      PREVENTATIVE CULTURAL MEASURES
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#424c44]">
                      {result.prevention.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#245934] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Agricultural Advisory Disclaimer */}
                <div className="p-2.5 bg-[#faf8f4] border border-[#e3dfd5] text-[10px] font-mono text-[#616c63] leading-relaxed">
                  ADVISORY NOTICE: Diagnostic outputs represent automated probabilistic inferences for screening support only.
                  Confirm disease pathology with a licensed agricultural extension officer prior to purchasing or spraying chemical treatments.
                </div>

                {/* Scientific Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#eee8dc]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={downloadJsonReport}
                      className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#173827] border border-[#173827] hover:bg-[#173827] hover:text-[#fbf9f4] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download JSON</span>
                    </button>

                    {savedSuccess && (
                      <span className="text-xs font-mono text-[#245934] flex items-center gap-1">
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>ARCHIVED IN LOGBOOK</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={resetAll}
                    className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#5f6b62] hover:text-[#173827] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>ANALYZE NEXT SPECIMEN</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
