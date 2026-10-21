import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Scanner } from './components/Scanner';
import { ModelMetrics } from './components/ModelMetrics';
import { Catalog } from './components/Catalog';
import { History } from './components/History';
import { Footer } from './components/Footer';
import type { HealthResponse, ScanRecord } from './types';
import { AlertCircle } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'metrics' | 'catalog' | 'history'>('scanner');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<boolean>(false);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [loadedRecord, setLoadedRecord] = useState<ScanRecord | null>(null);

  const fetchHealth = () => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
      })
      .then((data: HealthResponse) => {
        setHealth(data);
        setHealthError(false);
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
        setHealthError(true);
      });
  };

  const updateHistoryCount = () => {
    try {
      const data = localStorage.getItem('leaflens_scan_history');
      if (data) {
        const records: ScanRecord[] = JSON.parse(data);
        setHistoryCount(records.length);
      } else {
        setHistoryCount(0);
      }
    } catch {
      setHistoryCount(0);
    }
  };

  useEffect(() => {
    fetchHealth();
    updateHistoryCount();

    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleScanSaved = () => {
    updateHistoryCount();
  };

  const handleSelectHistoricalScan = (record: ScanRecord) => {
    setLoadedRecord(record);
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4] text-[#1f2620]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        historyCount={historyCount}
      />

      {/* Backend Disconnected Alert (if backend is down) */}
      {healthError && (
        <div className="bg-[#fcf2df] border-b border-[#e8ce9e] px-4 py-2.5 text-xs text-[#735114] text-center flex items-center justify-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-[#916719] shrink-0" />
          <span>
            Connecting to FastAPI backend at <code className="font-mono bg-[#f4e2be] px-1 py-0.5">http://127.0.0.1:8000</code>...
            Ensure the Python server is running.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scanner' && (
          <Scanner onScanSaved={handleScanSaved} loadedRecord={loadedRecord} />
        )}
        {activeTab === 'metrics' && <ModelMetrics />}
        {activeTab === 'catalog' && <Catalog />}
        {activeTab === 'history' && (
          <History onSelectScan={handleSelectHistoricalScan} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
