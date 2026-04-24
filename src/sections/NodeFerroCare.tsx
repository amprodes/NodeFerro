import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield, Zap, Headphones, Cpu, Wrench, Truck, Check, Clock, UserCog, Radio, AlertTriangle, Sparkles, Minus,
} from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

gsap.registerPlugin(ScrollTrigger);

interface NodeFerroCareProps {
  unitCount: number;
  selectedCare: string | null;
  onSelectCare: (id: string | null) => void;
}

const CARE_PLANS = [
  {
    id: 'basic',
    name: 'NodeFerro Care',
    subtitleKey: 'support.included',
    pricePerUnit: 0,
    color: '#8b7355',
    borderColor: '#2a2522',
    bgColor: '#161412',
    features: [
      { icon: <Shield size={14} />, text: '1-year hardware warranty', included: true },
      { icon: <Headphones size={14} />, text: 'Email support (48h response)', included: true },
      { icon: <Cpu size={14} />, text: 'Software updates via OTA', included: true },
      { icon: <Wrench size={14} />, text: 'Remote diagnostics', included: true },
      { icon: <Truck size={14} />, text: 'Return-to-depot repair', included: true },
      { icon: <Clock size={14} />, text: 'Business hours only', included: true },
      { icon: <UserCog size={14} />, text: 'No dedicated engineer', included: false },
      { icon: <Radio size={14} />, text: 'No proactive monitoring', included: false },
      { icon: <AlertTriangle size={14} />, text: 'No accidental damage cover', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'NodeFerro Care+',
    subtitleKey: 'support.recommended',
    pricePerUnit: 299,
    color: '#c9a96e',
    borderColor: '#c9a96e',
    bgColor: '#1c1810',
    features: [
      { icon: <Shield size={14} />, text: '3-year extended hardware warranty', included: true },
      { icon: <Headphones size={14} />, text: 'Priority support (4h response)', included: true },
      { icon: <Cpu size={14} />, text: 'Software updates + beta access', included: true },
      { icon: <Wrench size={14} />, text: 'Remote + on-site diagnostics', included: true },
      { icon: <Truck size={14} />, text: 'Express replacement unit', included: true },
      { icon: <Clock size={14} />, text: '24/7 support line', included: true },
      { icon: <AlertTriangle size={14} />, text: 'Accidental damage coverage (2x/yr)', included: true },
      { icon: <Zap size={14} />, text: 'Same-day swap for critical failures', included: true },
      { icon: <UserCog size={14} />, text: 'Quarterly health check', included: true },
      { icon: <Sparkles size={14} />, text: 'Priority model releases', included: true },
      { icon: <Radio size={14} />, text: 'Basic uptime monitoring', included: true },
    ],
  },
  {
    id: 'pro',
    name: 'NodeFerro Care Pro',
    subtitleKey: 'support.enterprise',
    pricePerUnit: 599,
    color: '#7cb87c',
    borderColor: '#7cb87c',
    bgColor: '#1a2f1a',
    features: [
      { icon: <Shield size={14} />, text: 'Lifetime hardware coverage', included: true },
      { icon: <Headphones size={14} />, text: 'Dedicated AI engineer (Slack)', included: true },
      { icon: <Cpu size={14} />, text: 'Everything in Care+', included: true },
      { icon: <UserCog size={14} />, text: 'Monthly on-site health check', included: true },
      { icon: <Wrench size={14} />, text: 'Custom model fine-tuning support', included: true },
      { icon: <Sparkles size={14} />, text: 'Early access to frontier models', included: true },
      { icon: <Radio size={14} />, text: '24/7 proactive cluster monitoring', included: true },
      { icon: <AlertTriangle size={14} />, text: 'Unlimited accidental damage', included: true },
      { icon: <Truck size={14} />, text: 'Hot-swap spare units on standby', included: true },
      { icon: <Zap size={14} />, text: 'Performance optimization audits', included: true },
    ],
  },
];

export default function NodeFerroCare({ unitCount, selectedCare, onSelectCare }: NodeFerroCareProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t, formatPrice } = useAppContext();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.care-panel',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none none' }
        }
      );
    }, section);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section id="support" ref={sectionRef} style={{ background: '#0c0a09', padding: '140px 0', position: 'relative' }}>
      {/* Decorative top line */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, #2a2522)' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b7355', marginBottom: '16px' }}>{t('nav.support')}</p>
          <h2 style={{ fontSize: '56px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#e8e2d9', margin: 0 }}>{t('support.title')}</h2>
          <p style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.6, color: '#9c948a', maxWidth: '560px', margin: '16px auto 0' }}>
            {t('support.subtitle')}
          </p>
        </div>

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {CARE_PLANS.map((plan) => {
            const isSelected = selectedCare === plan.id;
            const yearlyPrice = plan.pricePerUnit * unitCount;
            const monthlyPrice = Math.round(yearlyPrice / 12);

            return (
              <div
                key={plan.id}
                className="care-panel"
                onClick={() => onSelectCare(isSelected ? null : plan.id)}

                style={{
                  padding: '28px',
                  background: isSelected ? plan.bgColor : '#161412',
                  border: `2px solid ${isSelected ? plan.borderColor : '#2a2522'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Recommended badge */}
                {plan.id === 'plus' && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    padding: '3px 10px', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)',
                    borderRadius: '2px', fontSize: '10px', color: '#c9a96e', textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontWeight: 600,
                  }}>
                    {t('support.recommended')}
                  </div>
                )}

                {/* Plan header */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>{t(plan.subtitleKey as 'support.included')}</p>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: plan.id === 'pro' ? '#7cb87c' : plan.id === 'plus' ? '#c9a96e' : '#e8e2d9', margin: '0 0 8px 0' }}>
                    {plan.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    {yearlyPrice > 0 ? (
                      <>
                        <span style={{ fontSize: '28px', fontWeight: 700, color: '#e8e2d9' }}>{formatPrice(yearlyPrice)}</span>
                        <span style={{ fontSize: '13px', color: '#8b7355' }}>{t('support.perYear')}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '28px', fontWeight: 700, color: '#7cb87c' }}>{t('support.included')}</span>
                    )}
                  </div>
                  {yearlyPrice > 0 && (
                    <p style={{ fontSize: '12px', color: '#8b7355', margin: '4px 0 0 0' }}>
                      {formatPrice(monthlyPrice)}{t('support.perMonth')} · {unitCount} {t('support.units')}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#2a2522', margin: '16px 0' }} />

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{
                        color: f.included ? (plan.id === 'pro' ? '#7cb87c' : plan.id === 'plus' ? '#c9a96e' : '#8b7355') : 'rgba(139,115,85,0.3)',
                        marginTop: '2px', flexShrink: 0,
                      }}>
                        {f.included ? <Check size={14} /> : <Minus size={14} />}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: f.included ? '#9c948a' : 'rgba(156,148,138,0.35)',
                        lineHeight: 1.4,
                      }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Select button */}
                <div style={{
                  marginTop: '24px',
                  padding: '12px',
                  background: isSelected ? (plan.id === 'pro' ? '#2a4a2a' : plan.id === 'plus' ? '#3d3020' : '#2a2522') : '#0c0a09',
                  borderRadius: '4px',
                  border: `1px solid ${isSelected ? plan.borderColor : '#2a2522'}`,
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 600,
                    color: isSelected ? plan.color : '#8b7355',
                  }}>
                    {isSelected ? t('support.selected') : t('support.select')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
