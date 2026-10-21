import React from 'react';
import type { HealthResponse } from '../types';

interface NavbarProps {
  activeTab: 'scanner' | 'metrics' | 'catalog' | 'history';
  setActiveTab: (tab: 'scanner' | 'metrics' | 'catalog' | 'history') => void;
  health: HealthResponse | null;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  historyCount,
}) => {
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="bg-[#173827] text-[#f7f5ef] border-b border-[#234d37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Masthead Branding */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('scanner')}
          >
            {/* Botanical Lens Emblem (Leaf + Aperture) */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#9eb394] transition-colors duration-200"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Outer Lens Bezel */}
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="#0f2619"
                  stroke="#29543a"
                  strokeWidth="1.2"
                />

                {/* Lens Calibration Index Ticks */}
                <line x1="16" y1="2" x2="16" y2="4.5" stroke="#3b694b" strokeWidth="1" strokeLinecap="round" />
                <line x1="16" y1="27.5" x2="16" y2="30" stroke="#3b694b" strokeWidth="1" strokeLinecap="round" />
                <line x1="2" y1="16" x2="4.5" y2="16" stroke="#3b694b" strokeWidth="1" strokeLinecap="round" />
                <line x1="27.5" y1="16" x2="30" y2="16" stroke="#3b694b" strokeWidth="1" strokeLinecap="round" />

                {/* Aperture Iris Ring */}
                <circle
                  cx="16"
                  cy="16"
                  r="10.5"
                  stroke="#1e442f"
                  strokeWidth="0.75"
                  strokeDasharray="1.5 2.5"
                />

                {/* Aperture Diaphragm Blades */}
                <path
                  d="M16 5.5 C20.5 7.5 23.5 11 24.5 15.5"
                  stroke="#386447"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                />
                <path
                  d="M26.5 16 C25 20.5 21.5 23.5 17 25"
                  stroke="#386447"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                />
                <path
                  d="M16 26.5 C11.5 24.5 8.5 21 7.5 16.5"
                  stroke="#386447"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                />
                <path
                  d="M5.5 16 C7 11.5 10.5 8.5 15 7"
                  stroke="#386447"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                />

                {/* Central Botanical Leaf (Aperture Iris Center) */}
                <path
                  d="M16 7 C21 11.5 20.5 18.5 16 23.5 C11.5 18.5 11 11.5 16 7 Z"
                  fill="#173b28"
                  stroke="#9eb394"
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                  className="group-hover:stroke-[#b5ccac] transition-colors"
                />

                {/* Leaf Stem & Venation (Focus Reticle) */}
                <line
                  x1="16"
                  y1="9.5"
                  x2="16"
                  y2="21.5"
                  stroke="#9eb394"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  className="group-hover:stroke-[#b5ccac] transition-colors"
                />
                <path
                  d="M16 13 L18.8 14.8"
                  stroke="#7a9675"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                <path
                  d="M16 16 L13.2 17.8"
                  stroke="#7a9675"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                <path
                  d="M16 18.5 L18.2 19.8"
                  stroke="#7a9675"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Wordmark: LeafLens AI on one horizontal line */}
            <div className="flex items-baseline whitespace-nowrap">
              <span className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#fbf9f4] group-hover:text-[#e4eee0] transition-colors">
                LeafLens
              </span>
              <span className="font-sans text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#9eb394] ml-1.5 align-baseline">
                AI
              </span>
            </div>

            {/* Subtle, secondary descriptor (desktop only) */}
            <span className="hidden xl:inline-block text-[10px] font-mono text-[#718b74] border-l border-[#244c36] pl-3 leading-none select-none">
              Botanical Pathology
            </span>
          </div>

          {/* Editorial Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'text-[#fbf9f4] border-b-2 border-emerald-400 font-semibold'
                  : 'text-emerald-200/70 hover:text-[#fbf9f4]'
              }`}
            >
              01. Diagnostic Studio
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === 'metrics'
                  ? 'text-[#fbf9f4] border-b-2 border-emerald-400 font-semibold'
                  : 'text-emerald-200/70 hover:text-[#fbf9f4]'
              }`}
            >
              02. Model Monograph
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'text-[#fbf9f4] border-b-2 border-emerald-400 font-semibold'
                  : 'text-emerald-200/70 hover:text-[#fbf9f4]'
              }`}
            >
              03. Species Taxonomy
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'text-[#fbf9f4] border-b-2 border-emerald-400 font-semibold'
                  : 'text-emerald-200/70 hover:text-[#fbf9f4]'
              }`}
            >
              <span>04. Logbook</span>
              {historyCount > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-emerald-900 text-emerald-200 rounded-xs border border-emerald-700/60">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Minimalist System Status */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-emerald-800/60 font-mono text-[11px] text-emerald-300/80">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{isHealthy ? 'ONLINE' : 'CONNECTING'}</span>
            </span>
            <span className="opacity-40">•</span>
            <span>{health ? `${health.device.toUpperCase()}` : 'CPU'}</span>
            <span className="opacity-40">•</span>
            <span>38 CLS</span>
          </div>
        </div>
      </div>
    </header>
  );
};
