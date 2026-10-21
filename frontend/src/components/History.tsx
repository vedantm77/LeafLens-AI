import React, { useState, useEffect } from 'react';
import {
  FileText,
  Trash2,
  Download,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  ArrowRight,
  Clock
} from 'lucide-react';
import type { ScanRecord } from '../types';

interface HistoryProps {
  onSelectScan?: (record: ScanRecord) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectScan }) => {
  const [history, setHistory] = useState<ScanRecord[]>([]);

  const loadHistory = () => {
    try {
      const data = localStorage.getItem('leaflens_scan_history');
      if (data) {
        setHistory(JSON.parse(data));
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.warn('Failed to parse scan history:', e);
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = () => {
    if (window.confirm('Purge all historical botanical records from local ledger?')) {
      localStorage.removeItem('leaflens_scan_history');
      setHistory([]);
    }
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaflens_field_ledger_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: string, isHealthy: boolean) => {
    if (isHealthy) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-tight text-[#173827] bg-[#eef4ee] border border-[#c4dcbe]">
          <ShieldCheck className="w-3 h-3 text-[#245934]" />
          HEALTHY
        </span>
      );
    }
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-tight text-[#841919] bg-[#faebeb] border border-[#e8b5b5]">
            <AlertOctagon className="w-3 h-3 text-[#9e1c1c]" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-tight text-[#8c3214] bg-[#faeee8] border border-[#e8c0b2]">
            <AlertTriangle className="w-3 h-3 text-[#ad3813]" />
            HIGH
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-tight text-[#735114] bg-[#fbf6e8] border border-[#e8d7ad]">
            <AlertTriangle className="w-3 h-3 text-[#916719]" />
            MODERATE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-tight text-[#1a4a6e] bg-[#ecf4fa] border border-[#b8d6ec]">
            <Info className="w-3 h-3 text-[#1b5884]" />
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="pt-2 pb-6 border-b border-[#e5dfd2]">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#5a665d] mb-3">
              <span>SECTION 04 · SPECIMEN OBSERVATION LOGBOOK</span>
              <span>•</span>
              <span>FIELD LEDGER</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#19221a]">
              Diagnostic Archive & <span className="italic font-light">Historical Ledger</span>
            </h1>

            <p className="text-[#49544c] text-sm leading-relaxed max-w-2xl font-light mt-2">
              Chronological register of foliar pathology screenings and automated MobileNetV2 inferences
              persisted privately in your local browser session cache.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {history.length > 0 && (
              <>
                <button
                  onClick={exportHistory}
                  className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[#173827] border border-[#173827] hover:bg-[#173827] hover:text-[#fbf9f4] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={clearHistory}
                  className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[#8b261e] border border-[#e5b3b3] bg-[#faf2f1] hover:bg-[#8b261e] hover:text-[#fbf9f4] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Ledger</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Ledger Metadata Strip */}
        <div className="mt-4 pt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] font-mono text-[#616c63] border-t border-[#ece6da]">
          <span>RECORDED SPECIMENS: {history.length}</span>
          <span className="opacity-40">•</span>
          <span>STORAGE MODE: LOCALSTORAGE</span>
          <span className="opacity-40">•</span>
          <span>MAX CACHE: 50 ENTRIES</span>
        </div>
      </section>

      {/* History Ledger List */}
      {history.length === 0 ? (
        <div className="bg-white border border-[#ded8cb] p-12 text-center text-[#546057] space-y-3">
          <div className="w-10 h-10 mx-auto bg-[#f3eee2] border border-[#ded8cb] text-[#556157] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#4a584c]" />
          </div>
          <h3 className="font-serif text-lg text-[#19221a]">
            Ledger Vacant · No Historical Specimens Logged
          </h3>
          <p className="text-xs text-[#6b756d] max-w-md mx-auto font-light leading-relaxed">
            Execute a foliar pathology scan in the Diagnostic Studio to record diagnostic observations,
            confidence scores, and recommended agronomic actions automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record, idx) => (
            <div
              key={record.id}
              className="bg-white border border-[#ded8cb] hover:border-[#173827] transition-all p-5 shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#eee8dc]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#f4efe4] border border-[#ded8cb] text-[#4f5c51]">
                    ENTRY № {String(history.length - idx).padStart(3, '0')}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#173827] font-semibold">
                    {record.crop}
                  </span>
                  {getSeverityBadge(record.severity, record.is_healthy)}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#5b665e]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7a857d]" />
                    <span>{new Date(record.timestamp).toLocaleString()}</span>
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="font-serif text-base text-[#173827] font-medium">
                    {record.confidence_percentage}% <span className="text-[10px] font-mono text-[#616c63]">CONF</span>
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {record.thumbnail && (
                    <div className="w-16 h-16 bg-[#f0ebd9] border border-[#ded8cb] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      <img
                        src={record.thumbnail}
                        alt="Specimen thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-serif text-lg text-[#19221a] tracking-tight truncate">
                      {record.disease}
                    </h3>
                    <p className="text-xs text-[#525e54] font-light line-clamp-2 leading-relaxed">
                      {record.treatment}
                    </p>
                  </div>
                </div>

                {onSelectScan && (
                  <div className="shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => onSelectScan(record)}
                      className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#173827] border border-[#173827] hover:bg-[#173827] hover:text-[#fbf9f4] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Inspect in Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

