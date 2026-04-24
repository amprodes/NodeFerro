import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Cloud, Server, Lock, Zap, DollarSign, WifiOff,
  CheckCircle2, XCircle, ExternalLink, TrendingDown,
  Cpu, Clock, ChevronDown, ChevronUp, Brain, Gauge, Layers,
} from 'lucide-react';
import {
  CHIPS, ALL_MODELS, formatMemory,
  estimateTokensPerSecond, getInferenceTiming,
  parseBandwidth, getCurrentCores,
  getModelCloudEquivalent, getClusterCloudReplacement,
  type ModelCategory,
} from '../types/config';
import { useAppContext } from '../hooks/useAppContext';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  config: { chipIdx: number; cpuUpgraded: boolean; memoryGB: number; storageGB: number; unitCount: number; totalPrice: number; availableVRAM: number } | null;
}

const CAT_TABS_EN: { key: ModelCategory; label: string }[] = [
  { key: 'all', label: 'All Models' },
  { key: 'coding', label: 'Coding' },
  { key: 'thinking', label: 'Thinking' },
  { key: 'chat', label: 'Chat' },
];

const CAT_TABS_ES: { key: ModelCategory; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'coding', label: 'Codigo' },
  { key: 'thinking', label: 'Razonamiento' },
  { key: 'chat', label: 'Chat' },
];

// Simulated intelligence index (0-100) based on params, context window, and known benchmarks
function getIntelligenceIndex(model: typeof ALL_MODELS[0]): number {
  const paramScore = Math.min(model.params / 10, 40); // up to 40 pts
  const ctxScore = Math.min(model.contextWindow / 4000, 30); // up to 30 pts
  const tagBonus = model.tags.includes('frontier') ? 20 : model.tags.includes('sota') ? 25 : model.tags.includes('reasoning') ? 10 : 0;
  return Math.min(99, Math.round(paramScore + ctxScore + tagBonus));
}

// Simulated latency in ms
function getLatencyMs(tokensPerSec: number): number {
  if (tokensPerSec >= 20) return 15;
  if (tokensPerSec >= 10) return 25;
  if (tokensPerSec >= 5) return 45;
  if (tokensPerSec >= 2) return 80;
  return 150;
}

export default function CloudVsLocal({ config }: Props) {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('all');
  const [showAll, setShowAll] = useState(false);
  const [activeSubview, setActiveSubview] = useState<'models' | 'savings'>('models');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { t, locale, formatPrice } = useAppContext();

  const chip = config ? CHIPS[config.chipIdx] : CHIPS[0];
  const bandwidth = config ? parseBandwidth(config.cpuUpgraded ? chip.memoryBandwidthUpgraded : chip.memoryBandwidth) : 410;
  const cores = config ? getCurrentCores(chip, config.cpuUpgraded) : getCurrentCores(chip, false);
  const vram = config?.availableVRAM ?? 32;
  const totalPrice = config?.totalPrice ?? 1999;
  const unitCount = config?.unitCount ?? 1;

  const clusterReplacement = getClusterCloudReplacement(vram);
  const filteredModels = ALL_MODELS.filter((m) => activeCategory === 'all' || m.category.includes(activeCategory));
  const compatibleModels = filteredModels.filter((m) => m.vramRequired <= vram);
  const frontierModels = compatibleModels.filter((m) => m.params >= 100);
  const displayedModels = showAll ? filteredModels : compatibleModels;

  const CAT_TABS = locale === 'es' ? CAT_TABS_ES : CAT_TABS_EN;

  // Tier classification
  function modelTier(m: typeof ALL_MODELS[0]): number {
    if (['kimi-k2.6', 'deepseek-v3', 'deepseek-r1', 'llama3.1-405b', 'mixtral-8x22b', 'falcon-180b', 'mistral-large-123b', 'command-r-104b'].includes(m.id)) return 3;
    if (['glm-5.1', 'deepseek-coder-v2', 'qwen2.5-coder-32b', 'qwen2.5-72b', 'llama3.3-70b', 'qwen3.5-27b', 'qwq-32b', 'codellama-70b'].includes(m.id)) return 2;
    return 1;
  }

  const sortedModels = [...displayedModels].sort((a, b) => {
    const aCompat = a.vramRequired <= vram ? 1 : 0;
    const bCompat = b.vramRequired <= vram ? 1 : 0;
    if (aCompat !== bCompat) return bCompat - aCompat;
    const tierDiff = modelTier(b) - modelTier(a);
    if (tierDiff !== 0) return tierDiff;
    return b.params - a.params;
  });

  const cloudMonthly = clusterReplacement.tier.cloudPriceMonthly * unitCount;
  const fiveYearCloud = cloudMonthly * 60;
  const fiveYearSavings = fiveYearCloud - totalPrice;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cv-panel',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' }
        }
      );
    }, section);
    return () => ctx.revert();
  }, [activeCategory, activeSubview, config]);

  const toggleExpand = (modelId: string) => {
    setExpandedModel(expandedModel === modelId ? null : modelId);
  };

  return (
    <section id="whatyouget" ref={sectionRef} style={{ background: '#0c0a09', padding: '140px 0', position: 'relative' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', marginBottom: '60px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b7355', marginBottom: '16px' }}>
          {t('nav.whatyouget')}
        </p>
        <h2 style={{ fontSize: '56px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#e8e2d9', margin: 0 }}>
          {t('whatyouget.title')}
        </h2>
        <p style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.6, color: '#9c948a', maxWidth: '700px', marginTop: '16px' }}>
          {t('whatyouget.subtitle', { vram: formatMemory(vram), count: compatibleModels.length, frontier: frontierModels.length, cloud: clusterReplacement.replaces })}
        </p>
      </div>

      {/* Cluster replacement banner */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', marginBottom: '40px' }}>
        <div className="cv-panel" style={{ padding: '24px', background: '#1a2f1a', border: '1px solid #2a4a2a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#2a4a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={24} color="#7cb87c" />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(124,184,124,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0', fontWeight: 500 }}>
                {t('whatyouget.buildReplaces', { vram: formatMemory(vram) })}
              </p>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#7cb87c', margin: 0 }}>
                {clusterReplacement.replaces}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'rgba(124,184,124,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{t('whatyouget.monthlySavings')}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#7cb87c', margin: 0 }}>
              {formatPrice(cloudMonthly)}<span style={{ fontSize: '14px', fontWeight: 400 }}>/mo</span>
            </p>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <MetricBadge icon={<Lock size={18} />} label={t('whatyouget.privacy')} value="100% Local" sub={t('whatyouget.privacySub')} />
          <MetricBadge icon={<WifiOff size={18} />} label={t('whatyouget.offline')} value="Always" sub={t('whatyouget.offlineSub')} />
          <MetricBadge icon={<Zap size={18} />} label={t('whatyouget.latency')} value="10-50ms" sub={t('whatyouget.latencySub')} />
          <MetricBadge icon={<DollarSign size={18} />} label={t('whatyouget.savings')} value={formatPrice(fiveYearSavings > 0 ? fiveYearSavings : 0)} sub={t('whatyouget.savingsSub')} highlight={fiveYearSavings > 0} />
        </div>
      </div>

      {/* Subview toggle */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '4px', background: '#161412', borderRadius: '4px', padding: '4px', width: 'fit-content', border: '1px solid #2a2522' }}>
          <button onClick={() => setActiveSubview('models')} style={{ padding: '10px 20px', background: activeSubview === 'models' ? '#2a2522' : 'transparent', border: 'none', borderRadius: '4px', color: activeSubview === 'models' ? '#e8e2d9' : '#9c948a', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={14} /> {t('whatyouget.tabModels')} ({compatibleModels.length})
          </button>
          <button onClick={() => setActiveSubview('savings')} style={{ padding: '10px 20px', background: activeSubview === 'savings' ? '#2a2522' : 'transparent', border: 'none', borderRadius: '4px', color: activeSubview === 'savings' ? '#e8e2d9' : '#9c948a', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={14} /> {t('whatyouget.tabCost')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {activeSubview === 'models' && (
          <div>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              {CAT_TABS.map((cat) => (
                <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setShowAll(false); }} style={{
                  padding: '8px 16px', background: activeCategory === cat.key ? '#2a2522' : '#0c0a09',
                  border: `1px solid ${activeCategory === cat.key ? '#3d3630' : '#2a2522'}`, borderRadius: '4px',
                  color: '#e8e2d9', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}>{cat.label}</button>
              ))}
              <span style={{ fontSize: '12px', color: '#8b7355', marginLeft: 'auto' }}>
                {vram >= 128 && frontierModels.length > 0 && (
                  <span style={{ color: '#7cb87c', fontWeight: 500 }}>{frontierModels.length} frontier-class models unlocked</span>
                )}
              </span>
            </div>

            {/* Model Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 0.7fr 0.3fr', gap: '16px', padding: '10px 20px', borderBottom: '1px solid #2a2522' }}>
                <span style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('whatyouget.model')}</span>
                <span style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('whatyouget.inferenceSpeed')}</span>
                <span style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('whatyouget.replacesCloud')}</span>
                <span style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>{t('whatyouget.savingsCol')}</span>
                <span style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}></span>
              </div>

              {sortedModels.map((model) => {
                const isCompatible = model.vramRequired <= vram;
                const tokensPerSec = estimateTokensPerSecond(model.params, bandwidth, cores.gpu);
                const timing = getInferenceTiming(tokensPerSec);
                const cloudEq = getModelCloudEquivalent(model);
                const monthlySaving = parseInt(cloudEq.price.match(/\$(\d+)/)?.[1] ?? '50');
                const tier = modelTier(model);
                const isOpusClass = tier === 3;
                const isSonnetClass = tier === 2;
                const isCodingChampion = model.id === 'qwen2.5-coder-32b';
                const isExpanded = expandedModel === model.id;
                const intelligenceIdx = getIntelligenceIndex(model);
                const latencyMs = getLatencyMs(tokensPerSec);

                return (
                  <div key={model.id}>
                    <div
                      className="cv-panel"
                      onClick={() => isCompatible && toggleExpand(model.id)}
                      style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 0.7fr 0.3fr', gap: '16px', alignItems: 'center',
                        padding: '14px 20px', background: isCompatible ? (isOpusClass ? '#1a2f1a' : isSonnetClass ? '#1c1a10' : '#161412') : '#0c0a09',
                        border: `1px solid ${isCompatible ? (isOpusClass ? '#2a4a2a' : isSonnetClass ? '#3d3020' : isCodingChampion ? '#3d3020' : '#2a2522') : '#1c1510'}`,
                        borderRadius: '4px', transition: 'all 0.2s ease', opacity: isCompatible ? 1 : 0.35,
                        cursor: isCompatible ? 'pointer' : 'default',
                      }}
                      onMouseEnter={(e) => { if (isCompatible) e.currentTarget.style.borderColor = isOpusClass ? '#3a6a3a' : isSonnetClass ? '#5a4a30' : '#3d3630'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = isCompatible ? (isOpusClass ? '#2a4a2a' : isSonnetClass ? '#3d3020' : '#2a2522') : '#1c1510'; }}
                    >
                      {/* Model Info */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#e8e2d9' }}>{model.name}</span>
                          {isOpusClass && isCompatible && (
                            <span style={{ fontSize: '9px', padding: '1px 6px', background: '#1a3a1a', color: '#7cb87c', borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('models.opusClass')}</span>
                          )}
                          {isSonnetClass && isCompatible && !isCodingChampion && (
                            <span style={{ fontSize: '9px', padding: '1px 6px', background: '#3d3020', color: '#c9a96e', borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('models.sonnetClass')}</span>
                          )}
                          {isCodingChampion && isCompatible && (
                            <span style={{ fontSize: '9px', padding: '1px 6px', background: '#3d3020', color: '#c9a96e', borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('models.codingKing')}</span>
                          )}
                          {!isCompatible && (
                            <span style={{ fontSize: '9px', padding: '1px 6px', background: '#2f1a1a', color: '#c47070', borderRadius: '2px' }}>{t('models.needsVram', { gb: model.vramRequired })}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#8b7355' }}>{model.params}B</span>
                          <span style={{ fontSize: '11px', color: '#8b7355' }}>{model.vramRequired}GB VRAM</span>
                          <span style={{ fontSize: '11px', color: '#8b7355' }}>{(model.contextWindow / 1000).toFixed(0)}K ctx</span>
                          {model.category.slice(0, 2).map((c) => (
                            <span key={c} style={{ fontSize: '10px', padding: '0 5px', background: '#1c1a17', color: '#9c948a', borderRadius: '2px', textTransform: 'capitalize' }}>{c}</span>
                          ))}
                        </div>
                      </div>

                      {/* Inference Speed */}
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: timing.color }}>{tokensPerSec} tok/s</span>
                        <p style={{ fontSize: '10px', color: '#8b7355', margin: '2px 0 0 0' }}>
                          <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />{timing.label.split(' — ')[1]}
                        </p>
                      </div>

                      {/* Cloud Equivalent */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Cloud size={12} color="#c47070" />
                          <span style={{ fontSize: '12px', color: '#c47070', fontWeight: 500 }}>{cloudEq.name}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#8b7355', margin: '2px 0 0 16px' }}>{cloudEq.provider} · {cloudEq.price}</p>
                      </div>

                      {/* Savings */}
                      <div style={{ textAlign: 'right' }}>
                        {isCompatible ? (
                          <div>
                            <p style={{ fontSize: '15px', fontWeight: 700, color: '#7cb87c', margin: 0 }}>
                              ${monthlySaving}<span style={{ fontSize: '10px', fontWeight: 400 }}>/mo</span>
                            </p>
                            <a href={model.url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '10px', color: '#8b7355', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                              onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={9} /> {model.source}
                            </a>
                          </div>
                        ) : (
                          <p style={{ fontSize: '12px', color: '#8b7355', margin: 0 }}>Need +{model.vramRequired - vram}GB</p>
                        )}
                      </div>

                      {/* Expand/collapse indicator */}
                      <div style={{ textAlign: 'center' }}>
                        {isCompatible && (
                          isExpanded ? <ChevronUp size={14} color="#8b7355" /> : <ChevronDown size={14} color="#8b7355" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Metrics Panel */}
                    {isExpanded && isCompatible && (
                      <div className="cv-panel" style={{
                        padding: '20px',
                        background: isOpusClass ? '#132413' : '#12100e',
                        border: `1px solid ${isOpusClass ? '#2a4a2a' : '#2a2522'}`,
                        borderTop: 'none',
                        borderRadius: '0 0 4px 4px',
                        marginTop: '-6px',
                        marginBottom: '6px',
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                          {/* Intelligence Index */}
                          <MetricBox
                            icon={<Brain size={14} />}
                            label={t('metrics.intelligence')}
                            value={`${intelligenceIdx}/100`}
                            color={intelligenceIdx >= 80 ? '#7cb87c' : intelligenceIdx >= 60 ? '#c9a96e' : '#8b7355'}
                          />
                          {/* Output Speed */}
                          <MetricBox
                            icon={<Gauge size={14} />}
                            label={t('metrics.speed')}
                            value={`${tokensPerSec} tok/s`}
                            color={tokensPerSec >= 10 ? '#7cb87c' : tokensPerSec >= 5 ? '#c9a96e' : '#c47070'}
                          />
                          {/* Latency */}
                          <MetricBox
                            icon={<Zap size={14} />}
                            label={t('metrics.latency')}
                            value={`${latencyMs}ms`}
                            color={latencyMs <= 25 ? '#7cb87c' : latencyMs <= 50 ? '#c9a96e' : '#c47070'}
                          />
                          {/* Context Window */}
                          <MetricBox
                            icon={<Layers size={14} />}
                            label={t('metrics.context')}
                            value={`${(model.contextWindow / 1000).toFixed(0)}K`}
                            color="#c9a96e"
                          />
                          {/* Price comparison */}
                          <MetricBox
                            icon={<DollarSign size={14} />}
                            label={t('metrics.cloudPrice')}
                            value={cloudEq.price}
                            color="#c47070"
                          />
                        </div>

                        {/* Local vs Cloud comparison bar */}
                        <div style={{
                          marginTop: '16px',
                          padding: '12px 16px',
                          background: '#0c0a09',
                          borderRadius: '4px',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '20px',
                        }}>
                          <div>
                            <p style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{t('metrics.yourSpeed')}</p>
                            <p style={{ fontSize: '18px', fontWeight: 700, color: '#7cb87c', margin: 0 }}>{tokensPerSec} <span style={{ fontSize: '11px', color: '#8b7355', fontWeight: 400 }}>tok/s</span></p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{t('metrics.yourPrice')}</p>
                            <p style={{ fontSize: '18px', fontWeight: 700, color: '#c9a96e', margin: 0 }}>$0</p>
                          </div>
                        </div>

                        <p style={{ fontSize: '10px', color: '#8b7355', margin: '8px 0 0 0', textAlign: 'center' }}>
                          {t('metrics.collapse')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {compatibleModels.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#8b7355', fontSize: '14px' }}>
                  <Cpu size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Increase memory or add cluster units to unlock models.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubview === 'savings' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div className="cv-panel" style={{ padding: '24px', background: '#161412', border: '1px solid #2a2522', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Cloud size={16} color="#c47070" />
                  <span style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('whatyouget.cloud5yr')}</span>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#c47070', margin: '0 0 4px 0' }}>{formatPrice(fiveYearCloud)}</p>
                <p style={{ fontSize: '12px', color: '#8b7355', margin: 0 }}>${clusterReplacement.tier.cloudPriceMonthly}/mo × {unitCount} unit{unitCount > 1 ? 's' : ''} × 60 months</p>
              </div>
              <div className="cv-panel" style={{ padding: '24px', background: '#161412', border: '1px solid #2a2522', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Server size={16} color="#c9a96e" />
                  <span style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('whatyouget.localOnetime')}</span>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#c9a96e', margin: '0 0 4px 0' }}>{formatPrice(totalPrice)}</p>
                <p style={{ fontSize: '12px', color: '#8b7355', margin: 0 }}>{unitCount > 1 ? `${unitCount} units · ` : ''}{formatPrice(totalPrice / unitCount)} per unit</p>
              </div>
            </div>

            {fiveYearSavings > 0 && (
              <div className="cv-panel" style={{ padding: '40px', background: '#1a2f1a', border: '1px solid #2a4a2a', borderRadius: '4px', textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ fontSize: '14px', color: '#7cb87c', margin: '0 0 8px 0', fontWeight: 500 }}>
                  <TrendingDown size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />{t('whatyouget.youSave')}
                </p>
                <p style={{ fontSize: '48px', fontWeight: 700, color: '#7cb87c', margin: 0 }}>{formatPrice(fiveYearSavings)}</p>
                <p style={{ fontSize: '13px', color: 'rgba(124,184,124,0.6)', margin: '8px 0 0 0' }}>{t('whatyouget.perMonth', { amount: formatPrice(Math.round(fiveYearSavings / 60)) })}</p>
              </div>
            )}

            <div className="cv-panel" style={{ background: '#161412', border: '1px solid #2a2522', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr', gap: '16px', padding: '14px 20px', background: '#0c0a09', borderBottom: '1px solid #2a2522' }}>
                <span style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Feature</span>
                <span style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Cloud AI</span>
                <span style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Mac Studio Local</span>
              </div>
              {[
                { feature: 'Data Privacy', cloud: 'Sent to third-party servers', local: 'Never leaves your hardware', highlight: true },
                { feature: 'Monthly Cost', cloud: '$20-2,000 / month forever', local: '$0 after purchase', highlight: true },
                { feature: 'Internet Required', cloud: 'Always', local: 'Never — fully offline', highlight: true },
                { feature: 'Inference Speed', cloud: '100-500ms network latency', local: '10-50ms local memory', highlight: false },
                { feature: 'Custom Fine-tuning', cloud: 'Restricted, extra costs', local: 'Unlimited on your data', highlight: true },
                { feature: 'Vendor Lock-in', cloud: 'High — API changes, price hikes', local: 'None — open weights', highlight: true },
                { feature: 'Compliance', cloud: 'Cross-border data issues', local: 'Data stays in your jurisdiction', highlight: true },
                { feature: 'Concurrent Users', cloud: 'Rate limited, extra fees', local: 'Hardware-limited only', highlight: false },
              ].map((row) => (
                <div key={row.feature} style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 2fr', gap: '16px', padding: '12px 20px',
                  background: row.highlight ? '#141210' : 'transparent', borderBottom: '1px solid #1c1510',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1c1a17'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = row.highlight ? '#141210' : 'transparent'; }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8e2d9' }}>{row.feature}</span>
                  <span style={{ fontSize: '13px', color: '#c47070', display: 'flex', alignItems: 'center', gap: '6px' }}><XCircle size={14} style={{ flexShrink: 0 }} />{row.cloud}</span>
                  <span style={{ fontSize: '13px', color: '#7cb87c', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} style={{ flexShrink: 0 }} />{row.local}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricBadge({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="cv-panel" style={{ padding: '18px', background: '#161412', border: '1px solid #2a2522', borderRadius: '4px', textAlign: 'center' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3d3630'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2522'; }}
    >
      <div style={{ color: highlight ? '#7cb87c' : '#c9a96e', marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: 700, color: highlight ? '#7cb87c' : '#e8e2d9', margin: '0 0 4px 0' }}>{value}</p>
      <p style={{ fontSize: '11px', color: '#8b7355', margin: 0 }}>{sub}</p>
    </div>
  );
}

function MetricBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px', background: '#0c0a09', borderRadius: '4px' }}>
      <div style={{ color, marginBottom: '4px' }}>{icon}</div>
      <p style={{ fontSize: '9px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{label}</p>
      <p style={{ fontSize: '16px', fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}
