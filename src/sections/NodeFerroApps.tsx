import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Layers, Brain, MessageSquare, Code2, Gauge, Boxes,
  CheckCircle2, Sparkles, Download, CloudOff, GitBranch,
} from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

gsap.registerPlugin(ScrollTrigger);

const STACKS = [
  {
    id: 'coding',
    name: 'Code Forge',
    icon: <Code2 size={20} />,
    description: 'Pre-tuned for software engineering teams. Multi-file refactoring, code review, architecture design.',
    models: ['Kimi K2.6', 'GLM-5.1', 'DeepSeek Coder V2', 'Qwen 3.5-27B'],
    tags: ['IDE integration', '92 languages', 'Git-aware'],
    color: '#c9a96e',
  },
  {
    id: 'reasoning',
    name: 'Think Tank',
    icon: <Brain size={20} />,
    description: 'Chain-of-thought reasoning for research, analysis, and complex problem solving.',
    models: ['DeepSeek R1', 'QwQ 32B', 'DeepSeek V3', 'Mistral Large 2'],
    tags: ['Math & logic', 'Research', 'Multi-step reasoning'],
    color: '#7cb87c',
  },
  {
    id: 'chat',
    name: 'Converse',
    icon: <MessageSquare size={20} />,
    description: 'General-purpose conversational AI with multilingual support and long context windows.',
    models: ['Llama 3.3 70B', 'Qwen 2.5 72B', 'Command R+ 104B', 'Mixtral 8x22B'],
    tags: ['128K context', 'Multilingual', 'Enterprise RAG'],
    color: '#c9a96e',
  },
];

const SOFTWARE = [
  { name: 'Ollama', desc: 'Local model runtime', status: 'Pre-installed' },
  { name: 'vLLM', desc: 'High-throughput inference', status: 'Pre-installed' },
  { name: 'TensorFlow Metal', desc: 'GPU-accelerated ML', status: 'Pre-installed' },
  { name: 'PyTorch MPS', desc: 'Apple Silicon backend', status: 'Pre-installed' },
  { name: 'Hugging Face Hub', desc: 'Model download & sync', status: 'Pre-installed' },
  { name: 'LangChain', desc: 'Agent orchestration', status: 'Pre-installed' },
  { name: 'NodeFerro Dashboard', desc: 'Cluster monitoring UI', status: 'Pre-installed' },
  { name: 'Open WebUI', desc: 'Chat interface for all models', status: 'Pre-installed' },
];

export default function NodeFerroApps() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStack, setActiveStack] = useState('coding');
  const { t } = useAppContext();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.apps-panel',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' }
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const active = STACKS.find((s) => s.id === activeStack)!;

  return (
    <section id="software" ref={sectionRef} style={{ background: '#0c0a09', padding: '140px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, #2a2522)' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Layers size={16} color="#c9a96e" />
            <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b7355', margin: 0 }}>{t('nav.software')}</p>
          </div>
          <h2 style={{ fontSize: '56px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#e8e2d9', margin: '0 0 12px 0' }}>
            {t('software.title')}
          </h2>
          <p style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.6, color: '#9c948a', maxWidth: '600px', margin: '0 auto' }}>
            {t('software.subtitle')}
          </p>
        </div>

        {/* AI Stack Selector */}
        <div className="apps-panel" style={{
          background: '#161412', border: '1px solid #2a2522', borderRadius: '8px',
          padding: '32px', marginBottom: '24px',
        }}>
          <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px 0', fontWeight: 500 }}>
            {t('software.selectProfile')}
          </p>

          {/* Stack tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
            {STACKS.map((stack) => (
              <button
                key={stack.id}
                onClick={() => setActiveStack(stack.id)}
                style={{
                  flex: 1, padding: '16px 20px',
                  background: activeStack === stack.id ? (stack.id === 'reasoning' ? '#1a2f1a' : '#1c1810') : '#0c0a09',
                  border: `2px solid ${activeStack === stack.id ? stack.color : '#2a2522'}`,
                  borderRadius: '6px',
                  color: activeStack === stack.id ? '#e8e2d9' : '#8b7355',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ color: stack.color }}>{stack.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>{stack.name}</span>
                </div>
                <p style={{ fontSize: '12px', color: activeStack === stack.id ? '#9c948a' : '#8b7355', margin: 0, lineHeight: 1.4 }}>
                  {stack.description}
                </p>
              </button>
            ))}
          </div>

          {/* Active stack detail */}
          <div style={{
            padding: '24px',
            background: '#0c0a09',
            borderRadius: '6px',
            border: `1px solid ${activeStack === 'reasoning' ? '#2a4a2a' : '#2a2522'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              {/* Models included */}
              <div>
                <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>{t('software.modelsIncluded')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {active.models.map((m) => (
                    <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} color={active.color} />
                      <span style={{ fontSize: '14px', color: '#e8e2d9', fontWeight: 500 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>{t('software.capabilities')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {active.tags.map((t) => (
                    <span key={t} style={{
                      fontSize: '12px', padding: '4px 12px', background: activeStack === 'reasoning' ? '#1a2f1a' : '#1c1a17',
                      color: active.color, borderRadius: '2px', border: `1px solid ${activeStack === 'reasoning' ? '#2a4a2a' : '#2a2522'}`,
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  padding: '16px 24px', background: activeStack === 'reasoning' ? '#1a2f1a' : '#1c1810',
                  borderRadius: '6px', border: `1px solid ${activeStack === 'reasoning' ? '#2a4a2a' : '#3d3020'}`,
                }}>
                  <p style={{ fontSize: '12px', color: '#8b7355', margin: '0 0 4px 0' }}>{t('software.deployTime')}</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: active.color, margin: 0 }}>5 min</p>
                  <p style={{ fontSize: '11px', color: '#8b7355', margin: '4px 0 0 0' }}>{t('software.deployFrom')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-installed Software Grid */}
        <div className="apps-panel" style={{
          background: '#161412', border: '1px solid #2a2522', borderRadius: '8px',
          padding: '32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Boxes size={18} color="#c9a96e" />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>{t('software.preinstalled')}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CloudOff size={14} color="#7cb87c" />
              <span style={{ fontSize: '12px', color: '#7cb87c', fontWeight: 500 }}>{t('software.runsLocal')}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {SOFTWARE.map((s) => (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: '#0c0a09', borderRadius: '4px',
                border: '1px solid #1c1a17', transition: 'border-color 0.2s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2a2522'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1c1a17'; }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#e8e2d9', margin: '0 0 2px 0' }}>{s.name}</p>
                  <p style={{ fontSize: '11px', color: '#8b7355', margin: 0 }}>{s.desc}</p>
                </div>
                <span style={{
                  fontSize: '10px', padding: '3px 10px', background: '#1a2f1a', color: '#7cb87c',
                  borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, flexShrink: 0,
                }}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            marginTop: '24px', padding: '20px', background: '#0c0a09', borderRadius: '6px',
            border: '1px solid #2a2522', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(201,169,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#c9a96e" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>{t('software.ready')}</p>
                <p style={{ fontSize: '12px', color: '#8b7355', margin: '2px 0 0 0' }}>{t('software.shipsWith')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { icon: <Download size={14} />, label: 'OTA Updates' },
                { icon: <GitBranch size={14} />, label: 'Git Integration' },
                { icon: <Gauge size={14} />, label: 'Monitoring' },
              ].map((item) => (
                <span key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                  background: '#161412', border: '1px solid #2a2522', borderRadius: '4px',
                  fontSize: '11px', color: '#9c948a', fontWeight: 500,
                }}>
                  <span style={{ color: '#c9a96e' }}>{item.icon}</span> {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
