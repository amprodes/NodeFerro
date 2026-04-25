import { useState } from 'react';
import { Globe, DollarSign, Settings, X } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { CURRENCIES } from '../hooks/useCurrency';
import type { CurrencyCode } from '../hooks/useCurrency';
import type { Locale } from '../hooks/useTranslation';

interface GlobalControlsProps {
  inline?: boolean;
  compound?: boolean;
}

export default function GlobalControls({ inline = false, compound = false }: GlobalControlsProps) {
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
      height: compound ? '52px' : 'auto',
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
          width: compound ? '48px' : '42px',
          height: compound ? '52px' : '42px',
          borderRadius: compound ? '0' : '10px',
          border: compound ? 'none' : '1px solid #3d3630',
          borderLeft: compound ? '1px solid rgba(12,10,9,0.25)' : 'none',
          background: compound ? 'transparent' : 'rgba(12,10,9,0.95)',
          color: compound ? '#0c0a09' : '#c9a96e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        {menuOpen ? <X size={18} /> : <Settings size={18} />}
      </button>
    </div>
  );
}
