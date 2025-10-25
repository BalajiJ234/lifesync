export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  decimalPlaces: number
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimalPlaces: 0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', decimalPlaces: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimalPlaces: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', decimalPlaces: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimalPlaces: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', decimalPlaces: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', decimalPlaces: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', decimalPlaces: 2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', decimalPlaces: 0 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', decimalPlaces: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', decimalPlaces: 2 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', decimalPlaces: 2 },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', decimalPlaces: 2 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', decimalPlaces: 2 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', decimalPlaces: 0 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', decimalPlaces: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', decimalPlaces: 2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', decimalPlaces: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'Dh.', flag: '🇦🇪', decimalPlaces: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', decimalPlaces: 2 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦', decimalPlaces: 2 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', decimalPlaces: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', decimalPlaces: 2 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬', decimalPlaces: 2 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', decimalPlaces: 2 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', decimalPlaces: 2 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', decimalPlaces: 0 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', decimalPlaces: 2 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', decimalPlaces: 0 },
]

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0] // USD

export function getCurrencyByCode(code: string): Currency {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || DEFAULT_CURRENCY
}

export function formatAmount(amount: number, currency: Currency): string {
  const formatted = amount.toFixed(currency.decimalPlaces)
  
  // Handle different currency symbol positions
  switch (currency.code) {
    case 'EUR':
      return `${formatted}${currency.symbol}`
    case 'JPY':
    case 'CNY':
    case 'KRW':
    case 'VND':
    case 'IDR':
      return `${currency.symbol}${Math.round(amount)}`
    default:
      return `${currency.symbol}${formatted}`
  }
}

// Simple currency conversion (in a real app, you'd use live exchange rates)
export const MOCK_EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110.0,
  'CNY': 6.5,
  'INR': 74.0,
  'CAD': 1.25,
  'AUD': 1.35,
  'CHF': 0.92,
  'SGD': 1.35,
  'HKD': 7.8,
  'KRW': 1180.0,
  'SEK': 8.5,
  'NOK': 8.8,
  'DKK': 6.3,
  'PLN': 3.9,
  'CZK': 21.5,
  'HUF': 295.0,
  'RUB': 75.0,
  'BRL': 5.2,
  'MXN': 20.0,
  'AED': 3.67,
  'SAR': 3.75,
  'QAR': 3.64,
  'TRY': 8.5,
  'ZAR': 14.5,
  'EGP': 15.7,
  'THB': 33.0,
  'MYR': 4.2,
  'IDR': 14300.0,
  'PHP': 50.0,
  'VND': 23000.0,
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount
  
  const fromRate = MOCK_EXCHANGE_RATES[fromCurrency] || 1
  const toRate = MOCK_EXCHANGE_RATES[toCurrency] || 1
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1
  
  const fromRate = MOCK_EXCHANGE_RATES[fromCurrency] || 1
  const toRate = MOCK_EXCHANGE_RATES[toCurrency] || 1
  
  return toRate / fromRate
}