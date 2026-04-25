import { useState } from 'react';
import { Globe, DollarSign, Settings, X } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { CURRENCIES } from '../hooks/useCurrency';
import type { CurrencyCode } from '../hooks/useCurrency';
import type { Locale } from '../hooks/useTranslation';

function CompoundGearGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

interface GlobalControlsProps {
  inline?: boolean;
  compound?: boolean;
  mobileCompound?: boolean;
}

export default function GlobalControls({ inline = false, compound = false, mobileCompound = false }: GlobalControlsProps) {
  const { locale, changeLocale, currency, setCurrency, t } = useAppContext();
  const [flashLang, setFlashLang] = useState<Locale | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLangClick = (l: Locale) => {
    setFlashLang(l);
    changeLocale(l);
    setTimeout(() => setFlashLang(null), 300);
  };

  return (
    <div className="global-controls" style={{
      position: inline ? 'relative' : 'fixed',
      bottom: inline ? 'auto' : 'calc(14px + env(safe-area-inset-bottom, 0px))',
      right: inline ? 'auto' : '20px',
      zIndex: inline ? 2 : 9999,
      display: compound ? 'block' : 'flex',
      flexDirection: 'column',
      alignItems: compound ? 'stretch' : 'flex-end',
      gap: compound ? '0' : '8px',
      height: compound ? (mobileCompound ? '72px' : '52px') : 'auto',
    }}>
      {menuOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '12px',
          minWidth: '220px',
          background: 'rgba(12,10,9,0.97)',
          backdropFilter: 'blur(14px)',
          border: '1px solid #2a2522',
          borderRadius: '8px',
          boxShadow: '0 14px 34px rgba(0,0,0,0.35)',
          position: compound ? 'absolute' : 'relative',
          right: 0,
          bottom: compound ? 'calc(100% + 8px)' : 'auto',
          zIndex: 30,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            background: '#161412',
            border: '1px solid #2a2522',
            borderRadius: '6px',
          }}>
            <DollarSign size={14} color="#8b7355" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c9a96e',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <option key={code} value={code} style={{ background: '#0c0a09', color: '#e8e2d9' }}>
                  {t(`currency.${code.toLowerCase()}` as 'currency.usd')} ({CURRENCIES[code].symbol})
                </option>
              ))}
            </select>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            background: '#161412',
            border: '1px solid #2a2522',
            borderRadius: '6px',
          }}>
            <Globe size={14} color="#8b7355" />
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['en', 'es'] as Locale[]).map((l) => {
                const isActive = locale === l;
                const isFlashing = flashLang === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLangClick(l)}
                    style={{
                      padding: '4px 12px',
                      background: isFlashing ? 'rgba(201,169,110,0.4)' : isActive ? 'rgba(201,169,110,0.2)' : 'transparent',
                      border: `1.5px solid ${isActive ? '#c9a96e' : '#3d3630'}`,
                      borderRadius: '4px',
                      color: isActive ? '#c9a96e' : '#8b7355',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.15s ease',
                      minWidth: '36px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#8b7355';
                        e.currentTarget.style.color = '#9c948a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#3d3630';
                        e.currentTarget.style.color = '#8b7355';
                      }
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Open settings"
        style={{
          width: compound ? (mobileCompound ? '32px' : '52px') : '42px',
          height: compound ? (mobileCompound ? '72px' : '52px') : '42px',
          borderRadius: compound ? '0' : '10px',
          border: compound ? 'none' : '1px solid #3d3630',
          borderTop: compound ? 'none' : undefined,
          borderRight: compound ? 'none' : undefined,
          borderBottom: compound ? 'none' : undefined,
          borderLeft: compound ? '1px solid rgba(12,10,9,0.25)' : undefined,
          background: compound ? 'transparent' : 'rgba(12,10,9,0.95)',
          color: compound ? '#0c0a09' : '#c9a96e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: 0,
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: compound ? 'none' : '0 8px 18px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (compound) {
            e.currentTarget.style.background = 'rgba(12,10,9,0.08)';
          } else {
            e.currentTarget.style.borderColor = '#c9a96e';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (compound) {
            e.currentTarget.style.background = 'transparent';
          } else {
            e.currentTarget.style.borderColor = '#3d3630';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <span style={{
          position: 'absolute',
          top: compound && mobileCompound ? '58%' : '50%',
          left: compound && mobileCompound ? '63%' : '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          width: compound && mobileCompound ? '20px' : '18px',
          height: compound && mobileCompound ? '20px' : '18px',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}>
          {menuOpen ? (
            <X size={compound && mobileCompound ? 20 : 18} style={{ display: 'block' }} />
          ) : (
            compound ? <CompoundGearGlyph size={compound && mobileCompound ? 20 : 18} /> : <Settings size={18} style={{ display: 'block' }} />
          )}
        </span>
      </button>
    </div>
  );
}
