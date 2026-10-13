export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  rateToNgn: number; // 1 unit of foreign currency = X NGN
}

export const CURRENCY_LIST: CurrencyOption[] = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rateToNgn: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToNgn: 1550 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToNgn: 2020 },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToNgn: 1720 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rateToNgn: 1140 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', rateToNgn: 422 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rateToNgn: 88 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rateToNgn: 12 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', rateToNgn: 105 },
];

/**
 * Format a base price (stored in NGN) into the user's chosen currency
 */
export function formatMoney(amountInNgn: number, targetCurrency = 'NGN'): string {
  const num = Number(amountInNgn) || 0;
  const currencyInfo = CURRENCY_LIST.find((c) => c.code === targetCurrency) || CURRENCY_LIST[0];

  const converted = targetCurrency === 'NGN' ? num : num / currencyInfo.rateToNgn;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: converted >= 1000 ? 0 : 2,
    }).format(converted);
  } catch {
    return `${currencyInfo.symbol} ${Math.round(converted).toLocaleString()}`;
  }
}
