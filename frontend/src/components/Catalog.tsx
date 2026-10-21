import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertOctagon,
  Info,
  ArrowRight
} from 'lucide-react';
import type { CatalogResponse, ClassCatalogItem } from '../types';

interface FlattenedClassItem extends ClassCatalogItem {
  crop: string;
}

export const Catalog: React.FC = () => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [filterHealth, setFilterHealth] = useState<'all' | 'healthy' | 'diseased'>('all');
  const [activeModalItem, setActiveModalItem] = useState<FlattenedClassItem | null>(null);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        setCatalog(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load class catalog:', err);
        setLoading(false);
      });
  }, []);

  const flattenedClasses = useMemo(() => {
    if (!catalog) return [];
    const items: FlattenedClassItem[] = [];

    Object.entries(catalog.crops).forEach(([crop, list]) => {
      list.forEach((item) => {
        items.push({
          crop,
          ...item,
        });
      });
    });

    return items;
  }, [catalog]);

  const cropsList = useMemo(() => {
    if (!catalog) return [];
    return ['All', ...Object.keys(catalog.crops).sort()];
  }, [catalog]);

  const filteredItems = useMemo(() => {
    return flattenedClasses.filter((item) => {
      const matchCrop = selectedCrop === 'All' || item.crop === selectedCrop;
      const matchHealth =
        filterHealth === 'all'
          ? true
          : filterHealth === 'healthy'
          ? item.is_healthy
          : !item.is_healthy;
      const q = search.toLowerCase();
      const matchSearch =
        q === '' ||
        item.crop.toLowerCase().includes(q) ||
        item.disease.toLowerCase().includes(q) ||
        item.raw_label.toLowerCase().includes(q);

      return matchCrop && matchHealth && matchSearch;
    });
  }, [flattenedClasses, selectedCrop, filterHealth, search]);

  if (loading) {
    return (
      <div className="bg-white border border-[#ded8cb] p-12 text-center text-[#556157]">
        <div className="w-8 h-8 border-2 border-[#173827] border-t-transparent animate-spin mx-auto mb-3"></div>
        <p className="font-serif italic text-sm">Indexing 38-class PlantVillage taxonomy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="pt-2 pb-6 border-b border-[#e5dfd2]">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#5a665d] mb-3">
              <span>SECTION 03 · HERBARIUM INDEX & TAXONOMY</span>
              <span>•</span>
              <span>38 PATHOLOGY CLASSES</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#19221a]">
              Botanical Species & <span className="italic font-light">Pathology Index</span>
            </h1>

            <p className="text-[#49544c] text-sm leading-relaxed max-w-2xl font-light mt-1">
              Curated repository of the 38 output classes recognized by MobileNetV2 across 14 crops.
              Click any accession card to inspect clinical foliar lesions and agronomic management protocols.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-white px-3.5 py-2 border border-[#ded8cb]">
            <span className="text-[#173827] font-semibold">{catalog?.total_classes} Output Classes</span>
            <span className="opacity-30">•</span>
            <span className="text-[#515c53]">{catalog?.total_crops} Crop Families</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-6">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#7b857d] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by crop, pathogen, or label..."
              className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-none border border-[#cfc8b8] focus:outline-none focus:border-[#173827] bg-white text-[#19221a]"
            />
          </div>

          {/* Crop Selector */}
          <div className="sm:col-span-4">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-none border border-[#cfc8b8] focus:outline-none focus:border-[#173827] bg-white text-[#19221a] cursor-pointer"
            >
              {cropsList.map((crop) => (
                <option key={crop} value={crop}>
                  {crop === 'All' ? 'All Crop Genera (14 Families)' : crop}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 flex items-center border border-[#cfc8b8] bg-[#f8f6f0] p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilterHealth('all')}
              className={`flex-1 py-1.5 text-center transition-all cursor-pointer ${
                filterHealth === 'all' ? 'bg-[#173827] text-[#fbf9f4] font-medium' : 'text-[#5a665d] hover:text-[#19221a]'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterHealth('healthy')}
              className={`flex-1 py-1.5 text-center transition-all cursor-pointer ${
                filterHealth === 'healthy' ? 'bg-[#173827] text-[#fbf9f4] font-medium' : 'text-[#5a665d] hover:text-[#19221a]'
              }`}
            >
              HEALTHY
            </button>
            <button
              onClick={() => setFilterHealth('diseased')}
              className={`flex-1 py-1.5 text-center transition-all cursor-pointer ${
                filterHealth === 'diseased' ? 'bg-[#173827] text-[#fbf9f4] font-medium' : 'text-[#5a665d] hover:text-[#19221a]'
              }`}
            >
              PATHOLOGY
            </button>
          </div>
        </div>
      </section>

      {/* Grid of Specimen Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveModalItem(item)}
            className="bg-white border border-[#ded8cb] hover:border-[#173827] p-4 flex flex-col justify-between cursor-pointer transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] tracking-wider uppercase text-[#173827] font-semibold">
                  {item.crop}
                </span>
                {item.is_healthy ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.2 bg-[#eef4ee] text-[#173827] border border-[#c4dcbe]">
                    <ShieldCheck className="w-3 h-3" />
                    HEALTHY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.2 bg-[#faeee8] text-[#8c3214] border border-[#e8c0b2] uppercase">
                    <AlertTriangle className="w-3 h-3" />
                    {item.severity}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-base text-[#19221a] group-hover:text-[#173827] transition-colors">
                {item.disease}
              </h3>
            </div>

            <div className="pt-2 mt-3 border-t border-[#eee8dc] flex items-center justify-between text-[10px] font-mono text-[#7b857d]">
              <span className="truncate max-w-[210px]">{item.raw_label}</span>
              <span className="text-[#173827] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>VIEW</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        ))}
      </section>

      {filteredItems.length === 0 && (
        <div className="bg-white border border-dashed border-[#cfc8b8] p-12 text-center text-[#556157]">
          <p className="font-serif text-base text-[#19221a]">No specimens matched your taxonomy filter.</p>
          <p className="text-xs text-[#6b756d] font-light mt-1">Try resetting the search query or crop family selector.</p>
        </div>
      )}

      {/* Disease Detail Inspection Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-[#161a17]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fbf9f4] border border-[#ded8cb] max-w-lg w-full p-6 shadow-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#eee8dc]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#173827] font-semibold">
                    {activeModalItem.crop}
                  </span>
                  {activeModalItem.is_healthy ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.2 bg-[#eef4ee] text-[#173827] border border-[#c4dcbe]">
                      <ShieldCheck className="w-3 h-3" /> HEALTHY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.2 bg-[#faeee8] text-[#8c3214] border border-[#e8c0b2] uppercase">
                      <AlertOctagon className="w-3 h-3" /> {activeModalItem.severity} SEVERITY
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-normal text-[#19221a]">
                  {activeModalItem.disease}
                </h2>
                <p className="text-[11px] font-mono text-[#768078] mt-0.5">
                  TAXONOMIC LABEL: {activeModalItem.raw_label}
                </p>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="w-7 h-7 border border-[#ded8cb] bg-white text-[#525f56] hover:text-[#173827] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
                CLINICAL SYMPTOM PROFILE
              </span>
              <p className="text-xs text-[#39433b] leading-relaxed font-light">
                {activeModalItem.description || 'Clinical pathology profile on file.'}
              </p>
            </div>

            {/* Treatment */}
            <div className="p-3.5 bg-white border border-[#ded8cb] space-y-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#173827] font-semibold block">
                AGRONOMIC MANAGEMENT GUIDANCE
              </span>
              <p className="text-xs text-[#2c362e] leading-relaxed">
                {activeModalItem.treatment || 'Consult agricultural extension service for tailored recommendations.'}
              </p>
            </div>

            {/* Prevention */}
            {activeModalItem.prevention && activeModalItem.prevention.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#5a665d] block">
                  PREVENTATIVE CULTURAL MEASURES
                </span>
                <ul className="space-y-1.5 text-xs text-[#414c43]">
                  {activeModalItem.prevention.map((prev, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#245934] shrink-0 mt-0.5" />
                      <span>{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-[#eee8dc] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6c776f]">
                <Info className="w-3 h-3 text-[#173827]" />
                <span>PLANTVILLAGE CATEGORY {activeModalItem.raw_label}</span>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider bg-[#173827] text-[#fbf9f4] hover:bg-[#204934] transition-colors cursor-pointer"
              >
                Close Specimen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
