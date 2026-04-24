import { useState, useEffect, useRef } from 'react';
import { Cpu, HardDrive, MemoryStick, ChevronDown } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

function NodeIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'inline-block' }}>
      <rect x="5" y="5" width="22" height="22" rx="1" transform="rotate(45 16 16)"
        stroke="#c9a96e" strokeWidth="1.2" fill="none" opacity="0.8" />
      <rect x="10" y="10" width="12" height="12" rx="0.5" transform="rotate(45 16 16)"
        stroke="#c9a96e" strokeWidth="0.8" fill="none" opacity="0.5" />
      <circle cx="16" cy="16" r="2" fill="#c9a96e" opacity="0.9" />
    </svg>
  );
}

export default function FerrofluidHero() {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [navFloating, setNavFloating] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { t } = useAppContext();

  // Detect when hero scrolls out of view
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavFloating(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { label: t('nav.configure'), target: 'configure' },
    { label: t('nav.whatyouget'), target: 'whatyouget' },
    { label: t('nav.software'), target: 'software' },
    { label: t('nav.support'), target: 'support' },
    { label: t('nav.contact'), target: 'contact' },
  ];

  const specPills = [
    { icon: <Cpu size={14} />, label: t('spec.chip') },
    { icon: <MemoryStick size={14} />, label: t('spec.memory') },
    { icon: <HardDrive size={14} />, label: t('spec.storage') },
  ];

  const renderNavButtons = (compact?: boolean) => (
    navItems.map((item) => (
      <button
        key={item.target}
        onClick={() => scrollToSection(item.target)}
        style={{
          display: 'flex', alignItems: 'center', gap: compact ? '4px' : '6px',
          padding: compact ? '6px 12px' : '8px 16px',
          background: 'transparent', border: '1px solid #2a2522', borderRadius: '4px',
          color: '#8b7355', fontSize: compact ? '11px' : '12px', fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all 0.2s ease', pointerEvents: 'auto',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a96e'; e.currentTarget.style.color = '#c9a96e'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2522'; e.currentTarget.style.color = '#8b7355'; }}
      >
        {item.label} <ChevronDown size={compact ? 10 : 12} style={{ transform: 'rotate(-90deg)' }} />
      </button>
    ))
  );

  return (
    <>
      {/* Floating nav — appears when hero scrolls away */}
      <div className="floating-nav" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '12px 40px',
        background: navFloating ? 'rgba(12,10,9,0.92)' : 'transparent',
        backdropFilter: navFloating ? 'blur(16px)' : 'none',
        borderBottom: navFloating ? '1px solid #2a2522' : '1px solid transparent',
        opacity: navFloating ? 1 : 0,
        transform: navFloating ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.35s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: navFloating ? 'auto' : 'none',
      }}>
        <div className="floating-nav-inner">
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <NodeIcon size={22} />
            <span className="nav-brand-text" style={{ fontSize: '16px', fontWeight: 700, color: '#e8e2d9', letterSpacing: '-0.01em' }}>NodeFerro</span>
          </div>

          {/* Nav buttons */}
          <div className="nav-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {renderNavButtons(true)}
          </div>

          {/* Spacer to balance layout */}
          <div className="nav-spacer" style={{ width: '100px', flexShrink: 0 }} />
        </div>
      </div>

      {/* Hero section */}
      <section ref={heroRef} style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0c0a09' }}>
        {/* Rack image — right half */}
        <div className="hero-image-wrap" style={{
          position: 'absolute',
          top: '5vh',
          right: '2vw',
          width: '55vw',
          height: '90vh',
          borderRadius: '16px',
          overflow: 'hidden',
          zIndex: 1,
          background: '#161412',
        }}>
          <img
            src="/nodeferro-rack.jpg"
            alt="NodeFerro:1.7T Rack"
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imgLoaded ? 0.9 : 0,
              transition: 'opacity 1.2s ease',
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '40%',
            height: '100%',
            background: 'linear-gradient(to right, rgba(12,10,9,0.7) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Content */}
        <div className="hero-content" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '8vw',
          pointerEvents: 'none',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(201, 169, 110, 0.12)',
            border: '1px solid rgba(201, 169, 110, 0.25)',
            borderRadius: '4px',
            width: 'fit-content',
            marginBottom: '28px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a96e', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#c9a96e', letterSpacing: '0.05em' }}>{t('hero.badge')}</span>
          </div>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <NodeIcon size={32} />
            <h1 style={{ fontSize: '68px', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#e8e2d9', margin: 0 }}>
              NodeFerro
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#8b7355', margin: '0 0 16px 44px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {t('hero.tagline')}
          </p>

          <p style={{ fontSize: '17px', fontWeight: 400, lineHeight: 1.6, color: '#9c948a', maxWidth: '420px', marginTop: '12px' }}>
            {t('hero.description')}
          </p>

          {/* Spec pills */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
            {specPills.map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                background: 'rgba(22,20,18,0.8)', border: '1px solid #2a2522', borderRadius: '4px',
                color: '#9c948a', fontSize: '12px', fontWeight: 500,
              }}>
                <span style={{ color: '#c9a96e' }}>{item.icon}</span>{item.label}
              </div>
            ))}
          </div>

          {/* Anchor menu — unchanged, exactly as it was */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', pointerEvents: 'auto' }}>
            {renderNavButtons()}
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop: '50px', display: 'flex', alignItems: 'center', gap: '10px', color: '#8b7355', fontSize: '12px' }}>
            <span style={{ width: '24px', height: '1px', background: '#8b7355', display: 'inline-block' }} />
            {t('scroll.explore')}
          </div>
        </div>
      </section>
    </>
  );
}
