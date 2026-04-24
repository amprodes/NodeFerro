export type CurrencyCode = 'USD' | 'MXN' | 'COP';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // vs USD
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', label: 'USD', rate: 1 },
  MXN: { code: 'MXN', symbol: '$', label: 'MXN', rate: 20 },
  COP: { code: 'COP', symbol: '$', label: 'COP', rate: 4100 },
};
