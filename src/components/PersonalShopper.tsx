/* Personal Shopper v3 - one-line form with post-selling */
import { useState } from 'react';
import { Sparkles, X, ArrowRight, Compass } from 'lucide-react';

interface PersonalShopperProps {
  onAction: (action: string, value?: string) => void;
  onClose: () => void;
}

interface QAStep {
  q: string;
  type: 'choice' | 'confirm' | 'scroll' | 'done';
  choices?: { label: string; value: string }[];
  scrollTo?: string;
}

const CONFIG_STEPS: QAStep[] = [
  { q: 'What are you building?', type: 'choice', choices: [
    { label: 'AI coding assistant', value: 'ai_coding' },
    { label: 'Chatbot for team', value: 'chatbot' },
    { label: 'Research lab', value: 'research' },
    { label: 'Enterprise cluster', value: 'enterprise' },
  ]},
  { q: 'How many people on the team?', type: 'choice', choices: [
    { label: 'Just me', value: 'solo' },
    { label: '2-5 devs', value: 'small' },
    { label: '10+ people', value: 'mid' },
    { label: 'Company-wide', value: 'large' },
  ]},
  { q: 'Which models matter most?', type: 'choice', choices: [
    { label: 'Kimi / DeepSeek', value: 'frontier' },
    { label: 'Llama / Qwen', value: 'standard' },
    { label: 'Coder models', value: 'coder' },
    { label: 'All of them', value: 'all' },
  ]},
  { q: 'Need 24/7 support with your cluster?', type: 'confirm' },
];

const POST_STEPS: QAStep[] = [
  { q: 'Want to see what cloud models your config replaces locally?', type: 'scroll', scrollTo: 'whatyouget' },
  { q: 'Curious about the software stack that comes pre-installed?', type: 'scroll', scrollTo: 'software' },
  { q: 'Check out our Care plans for ongoing support.', type: 'scroll', scrollTo: 'support' },
  { q: 'All set! Ready to forge your NodeFerro?', type: 'scroll', scrollTo: 'contact' },
];

export default function PersonalShopper({ onAction, onClose }: PersonalShopperProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [mode, setMode] = useState<'question' | 'answer'>('question');
  const [phase, setPhase] = useState<'config' | 'post'>('config');

  const steps = phase === 'config' ? CONFIG_STEPS : POST_STEPS;
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleChoice = (value: string) => {
    setMode('question');

    // Execute config changes during config phase
    if (phase === 'config') {
      if (stepIdx === 0) {
        if (value === 'research' || value === 'enterprise') onAction('set', 'max_config');
      }
      if (stepIdx === 1) {
        if (value === 'solo') onAction('set', 'solo_config');
        else if (value === 'small') onAction('set', 'small_team');
        else if (value === 'mid') onAction('set', 'mid_team');
        else if (value === 'large') onAction('set', 'enterprise');
      }
      if (stepIdx === 2) {
        if (value === 'frontier' || value === 'all') onAction('set', 'frontier_3unit');
        else if (value === 'coder') onAction('set', 'coder_config');
      }
      if (stepIdx === 3) {
        onAction('set', 'pro_care');
      }
    }

    // Advance
    if (stepIdx < steps.length - 1) {
      setTimeout(() => setStepIdx((i) => i + 1), 300);
    } else if (phase === 'config') {
      // Switch to post-selling phase
      setTimeout(() => {
        setPhase('post');
        setStepIdx(0);
      }, 400);
    }
  };

  return (
    <div className="shopper-footer" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flex: 1,
      minWidth: 0,
    }}>
      {/* AI Avatar */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(201,169,110,0.15)',
        border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Sparkles size={14} color="#c9a96e" />
      </div>

      {/* Single line: question OR answer */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {mode === 'question' ? (
          /* Question line */
          <button
            type="button"
            onClick={() => setMode('answer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
              width: '100%',
              minWidth: 0,
            }}
          >
            <span style={{
              fontSize: '12px', color: '#c9a96e', fontWeight: 600,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>Shopper</span>
            <span style={{
              fontSize: '12px', color: '#e8e2d9',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'left',
            }}>{step.q}</span>
            <span style={{
              fontSize: '10px', color: '#8b7355',
              border: '1px solid #2a2522', borderRadius: '3px',
              padding: '1px 6px', flexShrink: 0,
            }}>tap to answer</span>
          </button>
        ) : (
          /* Answer line */
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0,
          }}>
            <Compass size={12} color="#8b7355" style={{ flexShrink: 0 }} />
            {step.type === 'choice' && step.choices ? (
              <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                {step.choices.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleChoice(c.value)}
                    style={{
                      padding: '3px 10px',
                      background: phase === 'post' ? 'rgba(201,169,110,0.1)' : 'rgba(124,184,124,0.1)',
                      border: phase === 'post' ? '1px solid #3d3020' : '1px solid #2a4a2a',
                      borderRadius: '4px',
                      color: phase === 'post' ? '#c9a96e' : '#7cb87c',
                      fontSize: '11px', fontWeight: 500,
                      fontFamily: 'inherit', cursor: 'pointer',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', gap: '3px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = phase === 'post' ? 'rgba(201,169,110,0.2)' : 'rgba(124,184,124,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = phase === 'post' ? 'rgba(201,169,110,0.1)' : 'rgba(124,184,124,0.1)';
                    }}
                  >
                    {phase === 'post' && <ArrowRight size={10} />}
                    {c.label}
                  </button>
                ))}
              </div>
            ) : step.type === 'scroll' && step.scrollTo ? (
              <button
                type="button"
                onClick={() => { scrollTo(step.scrollTo!); handleChoice('scroll'); }}
                style={{
                  padding: '4px 14px',
                  background: 'rgba(201,169,110,0.15)',
                  border: '1px solid #c9a96e',
                  borderRadius: '4px',
                  color: '#c9a96e',
                  fontSize: '11px', fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.15)'; }}
              >
                <ArrowRight size={10} /> Take me there
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onAction('set', 'pro_care'); handleChoice('confirm'); }}
                style={{
                  padding: '4px 14px',
                  background: 'rgba(124,184,124,0.1)',
                  border: '1px solid #2a4a2a',
                  borderRadius: '4px',
                  color: '#7cb87c',
                  fontSize: '11px', fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,184,124,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,184,124,0.1)'; }}
              >
                <Sparkles size={10} /> Activate Care Pro
              </button>
            )}
          </div>
        )}
      </div>

      {/* X close */}
      <button
        type="button"
        onClick={onClose}
        style={{
          width: '26px', height: '26px', borderRadius: '4px',
          background: 'rgba(139,115,85,0.15)', border: '1px solid rgba(139,115,85,0.25)',
          color: '#8b7355', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a96e'; e.currentTarget.style.borderColor = '#c9a96e'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#8b7355'; e.currentTarget.style.borderColor = 'rgba(139,115,85,0.25)'; }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
