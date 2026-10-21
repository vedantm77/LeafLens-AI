import React from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#ded8cb] bg-[#f5f1e7] py-10 text-[#4f5c51] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg text-[#19221a] tracking-tight">
              LeafLens <span className="italic font-light opacity-90">AI</span>
            </span>
            <span className="text-[#c2baa9]">•</span>
            <span className="font-mono text-[11px] text-[#637065] uppercase tracking-wider">
              Botanical Pathology & Neural Atlas (MobileNetV2)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <a
              href="https://huggingface.co/neghani/plantvillage-mobilenetv2"
              target="_blank"
              rel="noreferrer"
              className="text-[#173827] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Upstream Model Card</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#c2baa9]">•</span>
            <a
              href="https://github.com/neghani/iiith-group4-capstone-plat-leaf-decease-detection"
              target="_blank"
              rel="noreferrer"
              className="text-[#173827] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>IIIT-H Capstone Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e2dbce] flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] font-mono text-[#6c796e]">
          <p className="flex items-start sm:items-center gap-1.5 leading-relaxed">
            <ShieldAlert className="w-3.5 h-3.5 text-[#8b5a16] shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Agricultural Decision Support Notice: Probabilistic neural screening only. Confirm clinical diagnoses with local agricultural extension officers before applying fungicides or pesticides.
            </span>
          </p>
          <p className="shrink-0">
            CHECKPOINT: <code className="bg-[#eae4d5] px-1.5 py-0.5 text-[#19221a]">neghani/plantvillage-mobilenetv2</code>
          </p>
        </div>
      </div>
    </footer>
  );
};

