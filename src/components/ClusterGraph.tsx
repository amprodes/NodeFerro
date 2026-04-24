import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Server, Cpu } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

gsap.registerPlugin(ScrollTrigger);

interface ClusterGraphProps {
  unitCount?: number;
}

const BASE_DATA = [
  { labelKey: 'graph.hpl', label: 'HPL Linpack', single: 1.3, cluster4: 3.7, unit: 'TFLOPS' },
  { labelKey: 'graph.qwen', label: 'Qwen3 235B', single: 8.5, cluster4: 32, unit: 'tok/s' },
  { labelKey: 'graph.kimi', label: 'Kimi K2 1T', single: 10, cluster4: 30, unit: 'tok/s' },
  { labelKey: 'graph.deepseek', label: 'DeepSeek V3', single: 6, cluster4: 22, unit: 'tok/s' },
];

export default function ClusterGraph({ unitCount = 2 }: ClusterGraphProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useAppContext();

  // Scale cluster values based on unit count (linear scaling approximation)
  const clusterMultiplier = unitCount / 4; // Base data is for 4-node cluster
  const DATA = BASE_DATA.map((d) => ({
    ...d,
    cluster: Math.round(d.cluster4 * clusterMultiplier * 10) / 10,
  }));
  const MAX_VAL = Math.max(...DATA.map((d) => d.cluster));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      DATA.forEach((_, i) => {
        const singleBar = barsRef.current[i * 2];
        const clusterBar = barsRef.current[i * 2 + 1];
        if (singleBar) {
          gsap.fromTo(singleBar,
            { scaleX: 0 },
            { scaleX: 1, duration: 1, delay: i * 0.15, ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none none' },
            }
          );
        }
        if (clusterBar) {
          gsap.fromTo(clusterBar,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, delay: i * 0.15 + 0.1, ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none none' },
            }
          );
        }
      });
    }, section);
    return () => ctx.revert();
  }, [unitCount]);

  const totalVram = unitCount * 512;
  const vramDisplay = totalVram >= 1024
    ? `${(totalVram / 1024).toFixed(1)}TB`
    : `${totalVram}GB`;
  const clusterPrice = unitCount * 3999;

  return (
    <div className="config-panel" ref={sectionRef} style={{
      padding: '32px', background: '#161412', borderRadius: '4px', border: '1px solid #2a2522', marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <TrendingUp size={16} color="#c9a96e" />
        <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontWeight: 500 }}>
          {t('graph.title')}
        </p>
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#8b7355' }}>
          <Server size={10} style={{ display: 'inline', marginRight: '4px' }} />{unitCount}x Mac Studio M3 Ultra
        </span>
      </div>

      {DATA.map((d, i) => {
        const speedup = d.single > 0 ? (d.cluster / d.single).toFixed(1) : '0';
        return (
          <div key={d.labelKey} style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e8e2d9' }}>{t(d.labelKey as 'graph.hpl')}</span>
              <span style={{ fontSize: '11px', color: '#7cb87c', fontWeight: 500 }}>
                {t('graph.speedup', { x: speedup })}
              </span>
            </div>

            {/* Single bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: '#8b7355', width: '50px', textAlign: 'right', flexShrink: 0 }}>{t('graph.single')}</span>
              <div style={{ flex: 1, height: '18px', background: '#1c1a17', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  ref={(el) => { barsRef.current[i * 2] = el; }}
                  style={{
                    width: `${(d.single / MAX_VAL) * 100}%`,
                    height: '100%',
                    background: '#8b7355',
                    borderRadius: '2px',
                    transformOrigin: 'left',
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: '#8b7355', width: '60px', flexShrink: 0 }}>{d.single} {d.unit}</span>
            </div>

            {/* Cluster bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#c9a96e', width: '50px', textAlign: 'right', flexShrink: 0 }}>{t('graph.cluster')}</span>
              <div style={{ flex: 1, height: '18px', background: '#1c1a17', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  ref={(el) => { barsRef.current[i * 2 + 1] = el; }}
                  style={{
                    width: `${(d.cluster / MAX_VAL) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #c9a96e, #e8c78a)',
                    borderRadius: '2px',
                    transformOrigin: 'left',
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: '#c9a96e', fontWeight: 600, width: '60px', flexShrink: 0 }}>{d.cluster} {d.unit}</span>
            </div>
          </div>
        );
      })}

      {/* Bottom stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
        marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #2a2522',
      }}>
        <Stat icon={<Server size={14} />} label={t('graph.vram')} value={vramDisplay} />
        <Stat icon={<Cpu size={14} />} label={t('graph.price')} value={`$${(clusterPrice / 1000).toFixed(0)}K`} />
        <Stat icon={<TrendingUp size={14} />} label="vs DGX" value={t('graph.compare')} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#c9a96e', marginBottom: '4px' }}>{icon}</div>
      <p style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>{value}</p>
    </div>
  );
}
