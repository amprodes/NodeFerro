import { useState } from 'react';
import { Globe, DollarSign } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { CURRENCIES } from '../hooks/useCurrency';
import type { CurrencyCode } from '../hooks/useCurrency';
import type { Locale } from '../hooks/useTranslation';

export default function GlobalControls() {
  const { locale, changeLocale, currency, setCurrency, t } = useAppContext();
  const [flashLang, setFlashLang] = useState<Locale | null>(null);

  const handleLangClick = (l: Locale) => {
    setFlashLang(l);
    changeLocale(l);
    setTimeout(() => setFlashLang(null), 300);
  };

  return (
    <div className="global-controls" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    }}>
      {/* Currency Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(12,10,9,0.95)',
        backdropFilter: 'blur(12px)',
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
          }}
        >
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
            <option key={code} value={code} style={{ background: '#0c0a09', color: '#e8e2d9' }}>
              {t(`currency.${code.toLowerCase()}` as 'currency.usd')} ({CURRENCIES[code].symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Language Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(12,10,9,0.95)',
        backdropFilter: 'blur(12px)',
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
  );
}
