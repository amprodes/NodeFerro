import { useState, useCallback } from 'react';
import './App.css';
import { AppProvider } from './hooks/useAppContext';
import FerrofluidHero from './sections/FerrofluidHero';
import ChronosGallery from './sections/ChronosGallery';
import ConfigMatrix from './sections/ConfigMatrix';
import CloudVsLocal from './sections/CloudVsLocal';
import NodeFerroApps from './sections/NodeFerroApps';
import NodeFerroCare from './sections/NodeFerroCare';
import Contact from './sections/Contact';

interface HardwareConfig {
  chipIdx: number;
  cpuUpgraded: boolean;
  memoryGB: number;
  storageGB: number;
  unitCount: number;
  totalPrice: number;
  availableVRAM: number;
}

function AppContent() {
  const [config, setConfig] = useState<HardwareConfig | null>(null);
  const [selectedCare, setSelectedCare] = useState<string | null>('pro');

  const handleConfigChange = useCallback((newConfig: HardwareConfig) => {
    setConfig(newConfig);
  }, []);

  const handleSelectCare = useCallback((id: string | null) => {
    setSelectedCare(id);
  }, []);

  return (
    <div style={{ background: '#0c0a09', minHeight: '100vh' }}>
      <FerrofluidHero />
      <ChronosGallery />
      <ConfigMatrix onConfigChange={handleConfigChange} selectedCare={selectedCare} carePrice={selectedCare ? (
        selectedCare === 'plus' ? (config?.unitCount ?? 2) * 299 :
        selectedCare === 'pro' ? (config?.unitCount ?? 2) * 599 : 0
      ) : 0} onSelectCare={handleSelectCare} />
      <CloudVsLocal config={config} />
      <NodeFerroApps />
      <NodeFerroCare unitCount={config?.unitCount ?? 2} selectedCare={selectedCare} onSelectCare={handleSelectCare} />
      <Contact />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
