import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Locale, detectLocale, TRANSLATIONS } from './useTranslation';
import { type CurrencyCode, CURRENCIES } from './useCurrency';

interface AppContextType {
  locale: Locale;
  changeLocale: (l: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (usdAmount: number) => string;
  currencyInfo: typeof CURRENCIES[CurrencyCode];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS['en'] || {};
    let text = dict[key] ?? TRANSLATIONS['en']?.[key] ?? key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  const formatPrice = (usdAmount: number): string => {
    const converted = Math.round(usdAmount * CURRENCIES[currency].rate);
    return `${CURRENCIES[currency].symbol}${converted.toLocaleString('en-US')}`;
  };

  const value: AppContextType = {
    locale,
    changeLocale: setLocale,
    t,
    currency,
    setCurrency,
    formatPrice,
    currencyInfo: CURRENCIES[currency],
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
