import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Cpu, HardDrive, MemoryStick, Zap, Check, Lock, Server, Plus, Minus, ShoppingBag, Sparkles,
} from 'lucide-react';
import {
  CHIPS, formatMemory, formatStorage,
  calculateAvailableVRAM, parseBandwidth, getCurrentCores,
} from '../types/config';
import { useAppContext } from '../hooks/useAppContext';
import CheckoutModal from '../components/CheckoutModal';
import ClusterGraph from '../components/ClusterGraph';
import PersonalShopper from '../components/PersonalShopper';
import GlobalControls from '../components/GlobalControls';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onConfigChange?: (config: {
    chipIdx: number; cpuUpgraded: boolean; memoryGB: number;
    storageGB: number; unitCount: number; totalPrice: number; availableVRAM: number;
  }) => void;
  selectedCare?: string | null;
  carePrice?: number;
  onSelectCare?: (id: string | null) => void;
}

export default function ConfigMatrix({ onConfigChange, selectedCare, carePrice = 0, onSelectCare }: Props) {
  const [chipIdx, setChipIdx] = useState(1);
  const [cpuUpgraded, setCpuUpgraded] = useState(true);
  const [memoryIdx, setMemoryIdx] = useState(2);
  const [storageIdx, setStorageIdx] = useState(0);
  const [unitCount, setUnitCount] = useState(2);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shopperOpen, setShopperOpen] = useState(false);
  const [isCompactFooter, setIsCompactFooter] = useState(false);
  const [showCareMenu, setShowCareMenu] = useState(false);
  const [showShopperTray, setShowShopperTray] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const hasChangedChip = useRef(false);

  const { t, formatPrice } = useAppContext();

  // Personal Shopper can control the page
  const handleShopperAction = (_action: string, value?: string) => {
    switch (value) {
      // Step-based flows
      case 'solo_config':
        setChipIdx(0); setCpuUpgraded(false); setMemoryIdx(1); setStorageIdx(0); setUnitCount(1);
        break;
      case 'small_team':
        setChipIdx(0); setCpuUpgraded(true); setMemoryIdx(1); setStorageIdx(0); setUnitCount(1);
        break;
      case 'mid_team':
        setChipIdx(1); setCpuUpgraded(true); setMemoryIdx(2); setStorageIdx(0); setUnitCount(2);
        break;
      case 'enterprise':
        setChipIdx(1); setCpuUpgraded(true); setMemoryIdx(2); setStorageIdx(0); setUnitCount(4);
        break;
      case 'frontier_3unit':
        setChipIdx(1); setCpuUpgraded(true); setMemoryIdx(2); setStorageIdx(0); setUnitCount(3);
        break;
      case 'frontier_4unit':
        setChipIdx(1); setCpuUpgraded(true); setMemoryIdx(2); setStorageIdx(0); setUnitCount(4);
        break;
      case 'pro_care':
        if (onSelectCare) onSelectCare('pro');
        break;
      case 'max_config':
        setChipIdx(1); setCpuUpgraded(true); setMemoryIdx(2); setStorageIdx(0); setUnitCount(4);
        break;
      case 'coder_config':
        setChipIdx(0); setCpuUpgraded(true); setMemoryIdx(1); setStorageIdx(0); setUnitCount(1);
        break;
      // Legacy direct values
      case 'solo_m4max':
      case 'team5_m4max':
      case 'deepseek_m4max':
        setChipIdx(0); setCpuUpgraded(true); setMemoryIdx(1); setStorageIdx(0); setUnitCount(1);
        break;
      case 'chatbot_personal':
        setChipIdx(0); setCpuUpgraded(false); setMemoryIdx(0); setStorageIdx(0); setUnitCount(1);
        break;
      case 'add_unit':
      case 'kimi_3units':
        setUnitCount(3);
        break;
      case 'large_4units':
      case 'research_max':
        setChipIdx(1); setCpuUpgraded(true); setMemoryIdx(2); setStorageIdx(0); setUnitCount(4);
        break;
      case 'keep_2units':
        setUnitCount(2);
        break;
      case 'keep_current':
      case 'keep_ultra':
        break;
      default:
        break;
    }
  };

  const chip = CHIPS[chipIdx];
  const availableMemoryOptions = chip.memoryOptions.filter((mem) => {
    if (chip.id === 'm4-max') { if (!cpuUpgraded) return mem === 36; return mem >= 48; }
    if (!cpuUpgraded) return mem === 96; return true;
  });
  const selectedMemory = availableMemoryOptions[memoryIdx] ?? availableMemoryOptions[0];
  const currentMemoryGB = selectedMemory;
  const currentStorageGB = chip.storageOptions[storageIdx] ?? chip.baseStorageGB;
  const cpuUpgradeCost = cpuUpgraded ? chip.cpuUpgradePrice : 0;
  const memoryUpgradeCost = chip.memoryUpgradePrices[currentMemoryGB] ?? 0;
  const storageUpgradeCost = chip.storageUpgradePrices[currentStorageGB] ?? 0;
  const unitPrice = chip.basePrice + cpuUpgradeCost + memoryUpgradeCost + storageUpgradeCost;
  const totalPrice = unitPrice * unitCount;
  const cores = getCurrentCores(chip, cpuUpgraded);
  const bandwidth = parseBandwidth(cpuUpgraded ? chip.memoryBandwidthUpgraded : chip.memoryBandwidth);
  const vramPerUnit = calculateAvailableVRAM(currentMemoryGB);
  const totalVRAM = vramPerUnit * unitCount;

  useEffect(() => {
    onConfigChange?.({ chipIdx, cpuUpgraded, memoryGB: currentMemoryGB, storageGB: currentStorageGB, unitCount, totalPrice, availableVRAM: totalVRAM });
  }, [chipIdx, cpuUpgraded, currentMemoryGB, currentStorageGB, unitCount, totalPrice, totalVRAM, onConfigChange]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.config-panel',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' }
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!hasChangedChip.current) { hasChangedChip.current = true; return; }
    setCpuUpgraded(false); setMemoryIdx(0); setStorageIdx(0);
  }, [chipIdx]);

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth <= 1023;
      setIsCompactFooter(compact);
      if (!compact) {
        setShowCareMenu(false);
        setShowShopperTray(false);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const careTiers = [
    { id: 'basic', label: 'Care', color: '#8b7355', accentBg: 'rgba(139,115,85,0.15)' },
    { id: 'plus', label: 'Care+', color: '#c9a96e', accentBg: 'rgba(201,169,110,0.15)' },
    { id: 'pro', label: 'Care Pro', color: '#7cb87c', accentBg: 'rgba(124,184,124,0.15)' },
  ] as const;

  const getMemoryLockMessage = () => {
    if (chip.id === 'm4-max' && !cpuUpgraded) return '14-core CPU locked to 36GB. Upgrade CPU for more.';
    if (chip.id === 'm3-ultra' && !cpuUpgraded) return '28-core CPU locked to 96GB. Upgrade CPU for more.';
    return null;
  };

  return (
    <section id="configure" ref={sectionRef} style={{ background: '#0c0a09', padding: '140px 0 0 0', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', marginBottom: '80px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b7355', marginBottom: '16px' }}>{t('configure.title')}</p>
        <h2 style={{ fontSize: '56px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#e8e2d9', margin: 0 }}>Configuration Matrix</h2>
        <p style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.6, color: '#9c948a', maxWidth: '600px', marginTop: '16px' }}>
          {t('configure.subtitle')}
        </p>
      </div>

      <div className="resp-container resp-grid-2">
        <div>
          <ConfigCard title={t('configure.chip')} icon={<Cpu size={18} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CHIPS.map((c, i) => (
                <button key={c.id} onClick={() => setChipIdx(i)} style={{
                  padding: '16px', background: i === chipIdx ? '#1c1a17' : '#0c0a09',
                  border: `2px solid ${i === chipIdx ? '#c9a96e' : '#2a2522'}`, borderRadius: '4px',
                  color: '#e8e2d9', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: '#8b7355', fontSize: '13px' }}>From {formatPrice(c.basePrice)}</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8b7355' }}>
                    {c.cpuCores}-core CPU, {c.gpuCores}-core GPU, {c.neuralCores}-core Neural Engine · {c.memoryBandwidth}
                  </p>
                </button>
              ))}
            </div>
          </ConfigCard>

          {chip.cpuUpgradePrice > 0 && (
            <ConfigCard title={t('configure.cpu')} icon={<Zap size={18} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setCpuUpgraded(false)} style={{
                  padding: '14px 16px', background: !cpuUpgraded ? '#1c1a17' : '#0c0a09',
                  border: `1px solid ${!cpuUpgraded ? '#3d3630' : '#2a2522'}`, borderRadius: '4px',
                  color: '#e8e2d9', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{!cpuUpgraded && <Check size={14} style={{ marginRight: '8px', display: 'inline' }} />}{chip.cpuCores}-core CPU, {chip.gpuCores}-core GPU</span>
                  <span style={{ color: '#8b7355', fontSize: '12px' }}>Included</span>
                </button>
                <button onClick={() => setCpuUpgraded(true)} style={{
                  padding: '14px 16px', background: cpuUpgraded ? '#1c1a17' : '#0c0a09',
                  border: `1px solid ${cpuUpgraded ? '#3d3630' : '#2a2522'}`, borderRadius: '4px',
                  color: '#e8e2d9', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{cpuUpgraded && <Check size={14} style={{ marginRight: '8px', display: 'inline' }} />}{chip.cpuCoresUpgraded}-core CPU, {chip.gpuCoresUpgraded}-core GPU</span>
                  <span style={{ color: '#8b7355', fontSize: '12px' }}>+{formatPrice(chip.cpuUpgradePrice)}</span>
                </button>
              </div>
            </ConfigCard>
          )}

          <ConfigCard title={t('configure.memory')} icon={<MemoryStick size={18} />}>
            {getMemoryLockMessage() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#0c0a09', borderRadius: '4px', marginBottom: '12px' }}>
                <Lock size={12} color="#8b7355" />
                <span style={{ fontSize: '12px', color: '#8b7355' }}>{getMemoryLockMessage()}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {chip.memoryOptions.map((mem) => {
                const isAvailable = availableMemoryOptions.includes(mem);
                const isSelected = mem === selectedMemory;
                return (
                  <button key={mem} onClick={() => { if (isAvailable) { const idx = availableMemoryOptions.indexOf(mem); setMemoryIdx(idx); } }}
                    disabled={!isAvailable} style={{
                      padding: '12px 20px', background: isSelected ? '#2a2522' : isAvailable ? '#0c0a09' : '#0c0a09',
                      border: `1px solid ${isSelected ? '#c9a96e' : isAvailable ? '#2a2522' : '#1c1510'}`, borderRadius: '4px',
                      color: isAvailable ? '#e8e2d9' : 'rgba(232,226,217,0.2)', fontSize: '14px', fontWeight: 500,
                      cursor: isAvailable ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.2s ease',
                    }}>
                    {formatMemory(mem)}
                    {chip.memoryUpgradePrices[mem] > 0 && <span style={{ fontSize: '11px', color: '#8b7355', marginLeft: '6px' }}>+{formatPrice(chip.memoryUpgradePrices[mem])}</span>}
                  </button>
                );
              })}
            </div>
          </ConfigCard>

          <ConfigCard title={t('configure.storage')} icon={<HardDrive size={18} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chip.storageOptions.map((stor, i) => {
                const isSelected = i === storageIdx;
                return (
                  <button key={stor} onClick={() => setStorageIdx(i)} style={{
                    padding: '14px 16px', background: isSelected ? '#1c1a17' : '#0c0a09',
                    border: `1px solid ${isSelected ? '#3d3630' : '#2a2522'}`, borderRadius: '4px',
                    color: '#e8e2d9', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isSelected && <Check size={14} color="#c9a96e" />}{formatStorage(stor)} SSD
                    </span>
                    <span style={{ color: '#8b7355', fontSize: '12px' }}>
                      {(chip.storageUpgradePrices[stor] ?? 0) > 0 ? `+${formatPrice(chip.storageUpgradePrices[stor])}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </ConfigCard>

          <ConfigCard title={t('configure.cluster')} icon={<Server size={18} />}>
            <p style={{ fontSize: '13px', color: '#9c948a', margin: '0 0 16px 0' }}>{t('configure.clusterDesc')}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#0c0a09', borderRadius: '4px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#e8e2d9', margin: '0 0 4px 0' }}>{t('configure.units')}</p>
                <p style={{ fontSize: '12px', color: '#8b7355', margin: 0 }}>{unitCount === 1 ? t('configure.single') : `${unitCount} ${t('configure.clusterOf')}`}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setUnitCount(Math.max(1, unitCount - 1))} disabled={unitCount <= 1} style={{
                  width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #2a2522', background: '#161412',
                  color: '#e8e2d9', cursor: unitCount <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: unitCount <= 1 ? 0.3 : 1,
                }}><Minus size={16} /></button>
                <span style={{ fontSize: '22px', fontWeight: 600, color: '#e8e2d9', minWidth: '30px', textAlign: 'center' }}>{unitCount}</span>
                <button onClick={() => setUnitCount(Math.min(8, unitCount + 1))} disabled={unitCount >= 8} style={{
                  width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #2a2522', background: '#161412',
                  color: '#e8e2d9', cursor: unitCount >= 8 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: unitCount >= 8 ? 0.3 : 1,
                }}><Plus size={16} /></button>
              </div>
            </div>
            {unitCount > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <ClusterStat label="Total GPU Cores" value={`${cores.gpu * unitCount}`} />
                <ClusterStat label="Total Neural Cores" value={`${cores.neural * unitCount}`} />
                <ClusterStat label="Combined VRAM" value={formatMemory(totalVRAM)} highlight />
                <ClusterStat label="Bandwidth" value={`${(bandwidth * unitCount).toFixed(0)} GB/s`} highlight />
              </div>
            )}
          </ConfigCard>
        </div>

        <div>
          <ConfigCard title={t('configure.system')} icon={<Zap size={18} />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <StatBox label="CPU Cores" value={`${cores.cpu}`} sub={chip.id === 'm4-max' ? (cpuUpgraded ? '12P + 4E' : '10P + 4E') : (cpuUpgraded ? '24P + 8E' : '20P + 8E')} />
              <StatBox label="GPU Cores" value={`${cores.gpu}`} sub="Hardware ray tracing" />
              <StatBox label="VRAM per Unit" value={formatMemory(vramPerUnit)} sub={`${formatMemory(currentMemoryGB)} x 0.88`} />
              {unitCount > 1 && <StatBox label="Cluster VRAM" value={formatMemory(totalVRAM)} sub={`${unitCount} units combined`} highlight />}
              <StatBox label="Memory Bandwidth" value={cpuUpgraded ? chip.memoryBandwidthUpgraded : chip.memoryBandwidth} sub="Unified architecture" />
              <StatBox label="Neural Engine" value={`${cores.neural}-core`} sub="Apple Intelligence" />
              <StatBox label="Units" value={`${unitCount}`} sub={unitCount > 1 ? 'Cluster mode' : 'Single unit'} />
              <StatBox label={t('footer.pricePer')} value={formatPrice(unitPrice)} sub="Per Mac Studio" />
              <StatBox label={t('configure.devs')} value={`${Math.floor(totalVRAM / 15)}+`} sub={`${formatMemory(totalVRAM)} / ~15GB per dev`} highlight />
            </div>
            <div style={{ marginTop: '20px', padding: '16px', background: '#0c0a09', borderRadius: '4px', border: '1px solid #1c1a17' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#8b7355' }}>{unitCount > 1 ? t('configure.vramBar') : 'VRAM for AI Models'}</span>
                <span style={{ fontSize: '12px', color: '#e8e2d9', fontWeight: 500 }}>{formatMemory(totalVRAM)} {t('configure.vramAvailable')}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1c1a17', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((totalVRAM / 1000) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #c9a96e, #e8c78a)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </ConfigCard>

          {/* Cluster Benchmark Graph */}
          <ClusterGraph unitCount={unitCount} />
        </div>
      </div>

      {/* Fixed Footer — floats across entire site */}
      <div className="site-footer" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid #2a2522',
        padding: isCompactFooter
          ? '12px 12px calc(12px + env(safe-area-inset-bottom, 0px))'
          : '16px 40px',
        zIndex: 50,
        display: 'flex', justifyContent: 'center',
      }}>
        <div className="sticky-footer-inner">
          <div>
            <p style={{ fontSize: '12px', color: '#8b7355', margin: '0 0 4px 0' }}>
              {chip.name} · {cores.cpu}-core CPU · {cores.gpu}-core GPU · {formatMemory(currentMemoryGB)} · {formatStorage(currentStorageGB)}{unitCount > 1 ? ` · ${unitCount} units` : ''}
              {selectedCare && ` · ${selectedCare === 'plus' ? 'Care+' : selectedCare === 'pro' ? 'Care Pro' : 'Care'}`}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 600, color: '#e8e2d9' }}>
                {formatPrice(totalPrice)}
              </span>
              {carePrice > 0 && <span style={{ fontSize: '14px', color: '#c9a96e' }}>+ {formatPrice(carePrice)}/yr {t('footer.care')}</span>}
              {!isCompactFooter && !shopperOpen && (
                <button
                  type="button"
                  onClick={() => setShopperOpen(true)}
                  style={{
                    fontSize: '11px', color: '#c9a96e', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)',
                    cursor: 'pointer', fontFamily: 'inherit', marginLeft: '8px', borderRadius: '4px', padding: '4px 10px',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600,
                    whiteSpace: 'nowrap',
                    animation: 'shopperShake 0.6s ease-in-out 1s 3, shopperGlow 1.5s ease-in-out 1s 2',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.2)'; e.currentTarget.style.borderColor = '#c9a96e'; e.currentTarget.style.animation = 'none'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; }}
                >
                  <Sparkles size={12} /> Personal Shopper
                </button>
              )}
              {isCompactFooter && (
                <button
                  type="button"
                  onClick={() => {
                    setShowShopperTray((prev) => !prev);
                    setShowCareMenu(false);
                  }}
                  aria-label="Toggle Personal Shopper"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    border: `1px solid ${showShopperTray ? '#c9a96e' : 'rgba(201,169,110,0.3)'}`,
                    background: showShopperTray ? 'rgba(201,169,110,0.2)' : 'rgba(201,169,110,0.12)',
                    color: '#c9a96e',
                    cursor: 'pointer',
                    marginLeft: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={14} />
                </button>
              )}
            </div>
          </div>

          {isCompactFooter && showShopperTray && (
            <div style={{
              width: '100%',
              padding: '10px',
              background: '#161412',
              border: '1px solid #2a2522',
              borderRadius: '8px',
            }}>
              <PersonalShopper
                onAction={handleShopperAction}
                onClose={() => setShowShopperTray(false)}
              />
            </div>
          )}

          {isCompactFooter && showCareMenu && (
            <div style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '8px',
              padding: '10px',
              background: '#161412',
              border: '1px solid #2a2522',
              borderRadius: '8px',
            }}>
              {careTiers.map((tier) => {
                const isSelected = selectedCare === tier.id;
                const yearlyPrice = tier.id === 'basic' ? 0 : (tier.id === 'plus' ? 299 : 599) * unitCount;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      if (onSelectCare) {
                        onSelectCare(isSelected ? null : tier.id);
                      }
                      setShowCareMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '8px 10px',
                      background: isSelected ? tier.accentBg : 'transparent',
                      border: `1.5px solid ${isSelected ? tier.color : '#2a2522'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isSelected ? tier.color : '#8b7355',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {tier.label}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      color: isSelected ? (tier.id === 'basic' ? '#7cb87c' : tier.color) : '#5a5045',
                      fontWeight: 500,
                    }}>
                      {yearlyPrice === 0 ? 'Included' : `+${formatPrice(yearlyPrice)}/yr`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right side: Personal Shopper or Normal Controls */}
          {!isCompactFooter && shopperOpen ? (
            <PersonalShopper
              onAction={handleShopperAction}
              onClose={() => setShopperOpen(false)}
            />
          ) : (
            <div className="footer-right" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              {isCompactFooter ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowCareMenu((prev) => !prev);
                    setShowShopperTray(false);
                  }}
                  aria-label="Toggle care plans"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '6px',
                    background: showCareMenu ? 'rgba(124,184,124,0.2)' : 'rgba(124,184,124,0.12)',
                    border: `1px solid ${showCareMenu ? '#7cb87c' : 'rgba(124,184,124,0.3)'}`,
                    color: '#7cb87c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Lock size={15} />
                </button>
              ) : (
                <div className="care-chips" style={{ display: 'flex', gap: '6px' }}>
                  {careTiers.map((tier) => {
                    const isSelected = selectedCare === tier.id;
                    const yearlyPrice = tier.id === 'basic' ? 0 : (tier.id === 'plus' ? 299 : 599) * unitCount;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          if (onSelectCare) {
                            onSelectCare(isSelected ? null : tier.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '8px 14px',
                          background: isSelected ? tier.accentBg : 'transparent',
                          border: `1.5px solid ${isSelected ? tier.color : '#2a2522'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s ease',
                          minWidth: '72px',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#3d3630';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#2a2522';
                        }}
                      >
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isSelected ? tier.color : '#8b7355',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {tier.label}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          color: isSelected ? (tier.id === 'basic' ? '#7cb87c' : tier.color) : '#5a5045',
                          fontWeight: 500,
                        }}>
                          {yearlyPrice === 0 ? 'Included' : `+${formatPrice(yearlyPrice)}/yr`}
                        </span>
                        {isSelected && (
                          <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: tier.color,
                            border: '2px solid rgba(12,10,9,0.95)',
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Explore plans anchor */}
              {!isCompactFooter && (
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('support');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    fontSize: '11px',
                    color: '#8b7355',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    textDecorationColor: 'rgba(139,115,85,0.3)',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a96e'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8b7355'; }}
                >
                  Explore plans
                </button>
              )}

              {/* Divider */}
              {!isCompactFooter && <div style={{ width: '1px', height: '32px', background: '#2a2522', margin: '0 4px' }} />}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <GlobalControls inline />

                {/* Add to Bag */}
                <button onClick={() => setCheckoutOpen(true)} style={{
                  padding: '14px 36px', background: '#c9a96e', color: '#0c0a09', border: 'none', borderRadius: '4px',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e8c78a'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#c9a96e'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <ShoppingBag size={16} /> {t('footer.addToBag')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        config={{
          chipId: chip.id,
          chipName: chip.name,
          cpuCores: cores.cpu,
          gpuCores: cores.gpu,
          memoryGB: currentMemoryGB,
          storageGB: currentStorageGB,
          unitCount,
          totalPrice,
        }}
        selectedCare={selectedCare}
        carePrice={carePrice}
      />
    </section>
  );
}

function ConfigCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="config-panel" style={{ background: '#161412', border: '1px solid #2a2522', borderRadius: '4px', padding: '24px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ color: '#c9a96e' }}>{icon}</span>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div style={{ padding: '16px', background: highlight ? '#1a2f1a' : '#0c0a09', borderRadius: '4px', border: `1px solid ${highlight ? '#2a4a2a' : '#1c1a17'}` }}>
      <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: 600, color: highlight ? '#7cb87c' : '#e8e2d9', margin: '0 0 4px 0' }}>{value}</p>
      <p style={{ fontSize: '11px', color: '#8b7355', margin: 0 }}>{sub}</p>
    </div>
  );
}

function ClusterStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ padding: '10px 12px', background: highlight ? '#1a2f1a' : '#0c0a09', borderRadius: '4px', textAlign: 'center' }}>
      <p style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{label}</p>
      <p style={{ fontSize: '16px', fontWeight: 600, color: highlight ? '#7cb87c' : '#e8e2d9', margin: 0 }}>{value}</p>
    </div>
  );
}
