import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  AlertTriangle,
  FileText,
  Info,
  ShieldAlert,
  GitBranch
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { MetricsResponse } from '../types';

export const ModelMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metrics')
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load model metrics:', err);
        setLoading(false);
      });
  }, []);

  const benchmarkComparisonData = [
    {
      metric: 'Top-1 Accuracy',
      'PlantVillage (Upstream Lab Split)': 99.17,
      'Cropped-PlantDoc (Upstream Field Set)': 16.0,
    },
    {
      metric: 'Top-3 Accuracy',
      'PlantVillage (Upstream Lab Split)': 99.98,
      'Cropped-PlantDoc (Upstream Field Set)': 32.0,
    },
    {
      metric: 'Macro F1 / Pass Rate',
      'PlantVillage (Upstream Lab Split)': 98.51,
      'Cropped-PlantDoc (Upstream Field Set)': 16.0,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white border border-[#ded8cb] p-12 text-center text-[#556157]">
        <div className="w-8 h-8 border-2 border-[#173827] border-t-transparent animate-spin mx-auto mb-3"></div>
        <p className="font-serif italic text-sm">Retrieving upstream model card metrics and benchmark records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Editorial Monograph Masthead */}
      <section className="pt-2 pb-6 border-b border-[#e5dfd2]">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#5a665d] mb-3">
          <span>SECTION 02 · RESEARCH MONOGRAPH & BENCHMARK VALIDATION</span>
          <span>•</span>
          <span>FOLIO IV</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#19221a]">
          Pretrained Model Specification & <span className="italic font-light">Empirical Evaluation</span>
        </h1>

        <p className="text-[#49544c] text-sm leading-relaxed max-w-3xl font-light mt-2">
          Technical specifications, upstream author attribution, and laboratory vs. real-world field evaluations
          for the fine-tuned MobileNetV2 architecture on the 38-class PlantVillage benchmark.
        </p>

        {/* Academic Attribution Citation Callout */}
        <div className="mt-5 p-4 bg-[#f6f3eb] border border-[#ded8cb] text-xs text-[#39433b] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#173827] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Academic Citation & Primary Attribution Notice:</strong> The pretrained weights and evaluation scores
            cited in this monograph originate from the published model card for <code className="font-mono bg-[#ece6d9] px-1.5 py-0.5 text-[#19221a]">neghani/plantvillage-mobilenetv2</code>,
            developed by <strong>IIIT Hyderabad (Group 4)</strong> for their capstone project.
            LeafLens AI provides a full-stack screening and diagnostic interface around this artifact and does not claim
            independent authoring or training of the neural network weights.
          </div>
        </div>
      </section>

      {/* Upstream Checkpoint Specifications Table */}
      <section className="bg-white border border-[#ded8cb] p-6 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#eee8dc] pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
              ARCHITECTURE SPECIFICATION
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#19221a]">
              MobileNetV2 Inverted Residual Backbone
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href={metrics?.huggingface_url || 'https://huggingface.co/neghani/plantvillage-mobilenetv2'}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#173827] border border-[#173827] hover:bg-[#173827] hover:text-[#fbf9f4] transition-colors flex items-center gap-1.5"
            >
              <span>Hugging Face Model Card</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={metrics?.upstream_repository || 'https://github.com/neghani/iiith-group4-capstone-plat-leaf-decease-detection'}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#49544c] border border-[#ded8cb] hover:border-[#173827] transition-colors flex items-center gap-1.5"
            >
              <GitBranch className="w-3 h-3 text-[#173827]" />
              <span>Upstream Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <span className="px-2.5 py-1.5 text-[11px] font-mono bg-[#f4efe4] border border-[#dfd8cb] text-[#475249]">
              <FileText className="w-3 h-3 inline mr-1" />
              LICENSE: {metrics?.license || 'Apache 2.0'}
            </span>
          </div>
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd2]">
            <span className="text-[10px] text-[#69746b] uppercase block">Base Model</span>
            <span className="text-[#19221a] font-semibold text-xs mt-0.5 block truncate">
              google/mobilenet_v2_1.0_224
            </span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd2]">
            <span className="text-[10px] text-[#69746b] uppercase block">Output Classes</span>
            <span className="text-[#19221a] font-semibold text-xs mt-0.5 block">
              38 Softmax Classes (14 Crops)
            </span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd2]">
            <span className="text-[10px] text-[#69746b] uppercase block">Input Dimensions</span>
            <span className="text-[#19221a] font-semibold text-xs mt-0.5 block">
              224 × 224 × 3 RGB
            </span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd2]">
            <span className="text-[10px] text-[#69746b] uppercase block">Safety Gate</span>
            <span className="text-[#19221a] font-semibold text-xs mt-0.5 block">
              &gt;= 0.50 Probability
            </span>
          </div>
        </div>
      </section>

      {/* Comparative Evaluation Section (Laboratory vs. Real-World Field Set) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#5a665d]">
            EMPIRICAL EVALUATION MATRIX: LABORATORY VS. FIELD DOMAIN GAP
          </span>
          <span className="text-[10px] font-mono text-[#7b857d]">UPSTREAM AUTHOR DATA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Laboratory Split */}
          <div className="bg-white border border-[#ded8cb] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#eee8dc] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#173827] uppercase font-bold tracking-wider block">
                  CONTROLLED LABORATORY SPLIT
                </span>
                <h3 className="font-serif text-lg text-[#19221a]">
                  PlantVillage Held-out Test Set
                </h3>
                <p className="text-[11px] text-[#6b756d] font-light mt-0.5">5,430 images · Excised leaves on uniform plain backdrop</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[#c4dcbe] bg-[#eef4ee] text-[#173827]">
                LAB UPPER BOUND
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd2] text-center">
                <span className="text-[10px] text-[#69746b] uppercase block">ACCURACY</span>
                <span className="text-lg font-serif text-[#173827]">99.17%</span>
              </div>
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd2] text-center">
                <span className="text-[10px] text-[#69746b] uppercase block">MACRO F1</span>
                <span className="text-lg font-serif text-[#173827]">98.51%</span>
              </div>
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd2] text-center">
                <span className="text-[10px] text-[#69746b] uppercase block">PRECISION</span>
                <span className="text-lg font-serif text-[#173827]">98.79%</span>
              </div>
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd2] text-center">
                <span className="text-[10px] text-[#69746b] uppercase block">TOP-3 ACC</span>
                <span className="text-lg font-serif text-[#173827]">99.98%</span>
              </div>
            </div>

            <p className="text-xs text-[#525f56] font-light leading-relaxed">
              Achieves near-perfect discrimination on standardized laboratory test splits where leaves are flat,
              isolated, and illuminated with constant artificial light.
            </p>
          </div>

          {/* Real-World Field Split */}
          <div className="bg-white border border-[#ded8cb] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#eee8dc] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#8c3214] uppercase font-bold tracking-wider block">
                  NATURAL FIELD ENVIRONMENT
                </span>
                <h3 className="font-serif text-lg text-[#19221a]">
                  Cropped-PlantDoc Field Test Set
                </h3>
                <p className="text-[11px] text-[#6b756d] font-light mt-0.5">25 real field smartphone photos · Shadows, sun glare, soil background</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[#eed1be] bg-[#fbf0e8] text-[#7d3f1b]">
                FIELD REALITY
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono">
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd2] text-center">
                <span className="text-[10px] text-[#69746b] uppercase block">TOP-1 ACC</span>
                <span className="text-lg font-serif text-[#7d3f1b]">16.0%</span>
              </div>
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd2] text-center">
                <span className="text-[10px] text-[#69746b] uppercase block">TOP-3 ACC</span>
                <span className="text-lg font-serif text-[#7d3f1b]">32.0%</span>
              </div>
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd2] text-center">
                <span className="text-[10px] text-[#69746b] uppercase block">PASS RATE</span>
                <span className="text-lg font-serif text-[#7d3f1b]">16.0%</span>
              </div>
            </div>

            <p className="text-xs text-[#525f56] font-light leading-relaxed">
              Exposes the substantial domain gap: complex backgrounds, irregular leaf curl, and sun glare
              reduce top-1 accuracy to 16.0%, proving why safety thresholding (&lt;50%) is mandatory.
            </p>
          </div>
        </div>
      </section>

      {/* Domain Gap Recharts Visualization */}
      <section className="bg-white border border-[#ded8cb] p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
              BENCHMARK VISUALIZATION
            </span>
            <h3 className="font-serif text-lg text-[#19221a]">
              Quantified Accuracy Disparity: Laboratory Upper Bound vs. Field Test Split
            </h3>
          </div>
          <span className="text-xs font-mono text-[#6c776f]">UNITS: %</span>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarkComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#e8e2d4" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#4a544c' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6c776f' }} unit="%" />
              <Tooltip
                formatter={(val: any) => [`${val}%`, '']}
                contentStyle={{
                  backgroundColor: '#1b221d',
                  border: 'none',
                  color: '#fbf9f4',
                  fontSize: '11px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }} />
              <Bar dataKey="PlantVillage (Upstream Lab Split)" fill="#173827" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Cropped-PlantDoc (Upstream Field Set)" fill="#94532b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Documented Limitations & Agricultural Advisory */}
      <section className="bg-[#f6f4ee] border border-[#ded8cb] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#8a5b17]" />
          <h3 className="font-serif text-lg text-[#19221a]">
            Documented Scientific Limitations & Operating Boundaries
          </h3>
        </div>

        <div className="space-y-2 text-xs text-[#414b43]">
          {metrics?.limitations.map((lim, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-[#e5dfd2]">
              <span className="font-mono text-[10px] text-[#69746b] w-6 shrink-0 mt-0.5">[{idx + 1}]</span>
              <span className="leading-relaxed font-light">{lim}</span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#faeee8] border border-[#e8c0b2] text-[#8c3214] text-xs leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#ad3813] shrink-0 mt-0.5" />
          <div>
            <strong>Agronomic Safety Warning:</strong> Machine learning classifications must not serve as sole justification
            for chemical pesticide or fungicide dispersal. Agricultural decisions must be validated with local certified agronomists.
          </div>
        </div>
      </section>
    </div>
  );
};
