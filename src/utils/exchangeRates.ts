/**
 * Exchange Rate Service
 * 
 * Uses frankfurter.app - a free, open-source currency exchange API
 * - No API key required
 * - Historical rates available
 * - Supports 30+ currencies
 * 
 * Caches rates in localStorage for offline use and performance
 */

// Cache keys
const LATEST_RATES_KEY = 'wealthpulse-exchange-rates-latest'
const HISTORICAL_RATES_KEY = 'wealthpulse-exchange-rates-historical'
const RATES_CACHE_DURATION = 1000 * 60 * 60 // 1 hour for latest rates

export interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
}

export interface ConvertedExpense {
  id: string
  originalAmount: number
  convertedAmount: number
  rate: number
  date: string
}

export interface CachedRates {
  data: ExchangeRates
  timestamp: number
}

export interface HistoricalRatesCache {
  [date: string]: ExchangeRates
}

// Fallback rates when API is unavailable (approximate rates)
const FALLBACK_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.0,
  'CNY': 7.24,
  'INR': 83.5,
  'CAD': 1.36,
  'AUD': 1.53,
  'CHF': 0.88,
  'SGD': 1.34,
  'HKD': 7.82,
  'KRW': 1320.0,
  'AED': 3.67,
  'SAR': 3.75,
}

/**
 * Get fallback exchange rate when API is unavailable
 */
function getFallbackRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1
  
  const fromRate = FALLBACK_RATES[fromCurrency] || 1
  const toRate = FALLBACK_RATES[toCurrency] || 1
  
  // Convert through USD
  return toRate / fromRate
}

// Frankfurter API base URL
const API_BASE = 'https://api.frankfurter.app'

/**
 * Fetch latest exchange rates
 * Uses EUR as base (frankfurter default), then converts
 */
export async function fetchLatestRates(baseCurrency: string = 'USD'): Promise<ExchangeRates | null> {
  try {
    // Check cache first
    const cached = getCachedLatestRates()
    if (cached && Date.now() - cached.timestamp < RATES_CACHE_DURATION) {
      // If cached base matches, return directly
      if (cached.data.base === baseCurrency) {
        return cached.data
      }
      // Otherwise, we'll convert from cached EUR rates
    }

    // Fetch from API
    const response = await fetch(`${API_BASE}/latest?from=${baseCurrency}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const rates: ExchangeRates = {
      base: baseCurrency,
      date: data.date,
      rates: { [baseCurrency]: 1, ...data.rates }
    }

    // Cache the result
    cacheLatestRates(rates)

    return rates
  } catch (error) {
    console.error('Failed to fetch latest exchange rates:', error)
    // Return cached data if available (even if stale)
    const cached = getCachedLatestRates()
    return cached?.data || null
  }
}

/**
 * Fetch historical exchange rates for a specific date
 * Used for accurate expense conversion based on transaction date
 */
export async function fetchHistoricalRates(
  date: string, // Format: YYYY-MM-DD
  baseCurrency: string = 'USD'
): Promise<ExchangeRates | null> {
  try {
    // Check cache first
    const cached = getCachedHistoricalRates()
    const cacheKey = `${date}-${baseCurrency}`
    if (cached[cacheKey]) {
      return cached[cacheKey]
    }

    // Fetch from API
    const response = await fetch(`${API_BASE}/${date}?from=${baseCurrency}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const rates: ExchangeRates = {
      base: baseCurrency,
      date: data.date,
      rates: { [baseCurrency]: 1, ...data.rates }
    }

    // Cache the result
    cacheHistoricalRates(cacheKey, rates)

    return rates
  } catch (error) {
    console.error(`Failed to fetch historical rates for ${date}:`, error)
    // Fall back to latest rates if historical not available
    return fetchLatestRates(baseCurrency)
  }
}

/**
 * Convert amount using live rates
 */
export async function convertWithLiveRate(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date?: string // Optional: use historical rate for this date
): Promise<{ convertedAmount: number; rate: number; date: string }> {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, rate: 1, date: date || new Date().toISOString().split('T')[0] }
  }

  // Fetch rates (historical if date provided, otherwise latest)
  const rates = date 
    ? await fetchHistoricalRates(date, fromCurrency)
    : await fetchLatestRates(fromCurrency)

  if (!rates || !rates.rates[toCurrency]) {
    // Fallback to mock rates if API fails
    const { convertCurrency, getExchangeRate } = await import('./currency')
    return {
      convertedAmount: convertCurrency(amount, fromCurrency, toCurrency),
      rate: getExchangeRate(fromCurrency, toCurrency),
      date: date || new Date().toISOString().split('T')[0]
    }
  }

  const rate = rates.rates[toCurrency]
  return {
    convertedAmount: amount * rate,
    rate,
    date: rates.date
  }
}

/**
 * Batch convert multiple expenses with their transaction dates
 * Optimized for report generation
 */
export async function batchConvertExpenses(
  expenses: Array<{ id: string; amount: number; currency: string; date: string }>,
  targetCurrency: string
): Promise<ConvertedExpense[]> {
  // Group expenses by date and currency to minimize API calls
  const dateGroups = new Map<string, Set<string>>()
  
  for (const expense of expenses) {
    const dateKey = expense.date.split('T')[0]
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, new Set())
    }
    dateGroups.get(dateKey)!.add(expense.currency)
  }

  // Prefetch all needed rates
  const ratesCache = new Map<string, ExchangeRates>()
  
  for (const [date, currencies] of dateGroups) {
    for (const currency of currencies) {
      if (currency !== targetCurrency) {
        const cacheKey = `${date}-${currency}`
        if (!ratesCache.has(cacheKey)) {
          const rates = await fetchHistoricalRates(date, currency)
          if (rates) {
            ratesCache.set(cacheKey, rates)
          }
        }
      }
    }
  }

  // Convert all expenses
  return expenses.map(expense => {
    if (expense.currency === targetCurrency) {
      return {
        id: expense.id,
        originalAmount: expense.amount,
        convertedAmount: expense.amount,
        rate: 1,
        date: expense.date
      }
    }

    const dateKey = expense.date.split('T')[0]
    const cacheKey = `${dateKey}-${expense.currency}`
    const rates = ratesCache.get(cacheKey)

    if (rates && rates.rates[targetCurrency]) {
      const rate = rates.rates[targetCurrency]
      return {
        id: expense.id,
        originalAmount: expense.amount,
        convertedAmount: expense.amount * rate,
        rate,
        date: expense.date
      }
    }

    // Fallback to static conversion if historical rate not available
    const fallbackRate = getFallbackRate(expense.currency, targetCurrency)
    return {
      id: expense.id,
      originalAmount: expense.amount,
      convertedAmount: expense.amount * fallbackRate,
      rate: fallbackRate,
      date: expense.date
    }
  })
}

// Cache helpers
function getCachedLatestRates(): CachedRates | null {
  try {
    const cached = localStorage.getItem(LATEST_RATES_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

function cacheLatestRates(rates: ExchangeRates): void {
  try {
    const cached: CachedRates = {
      data: rates,
      timestamp: Date.now()
    }
    localStorage.setItem(LATEST_RATES_KEY, JSON.stringify(cached))
  } catch (error) {
    console.error('Failed to cache rates:', error)
  }
}

function getCachedHistoricalRates(): HistoricalRatesCache {
  try {
    const cached = localStorage.getItem(HISTORICAL_RATES_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

function cacheHistoricalRates(key: string, rates: ExchangeRates): void {
  try {
    const cached = getCachedHistoricalRates()
    cached[key] = rates
    
    // Limit cache size to last 100 dates
    const keys = Object.keys(cached)
    if (keys.length > 100) {
      const sortedKeys = keys.sort()
      for (let i = 0; i < keys.length - 100; i++) {
        delete cached[sortedKeys[i]]
      }
    }
    
    localStorage.setItem(HISTORICAL_RATES_KEY, JSON.stringify(cached))
  } catch (error) {
    console.error('Failed to cache historical rates:', error)
  }
}

/**
 * Clear all cached rates
 */
export function clearRatesCache(): void {
  localStorage.removeItem(LATEST_RATES_KEY)
  localStorage.removeItem(HISTORICAL_RATES_KEY)
}

/**
 * Get supported currencies from frankfurter API
 */
export async function getSupportedCurrencies(): Promise<Record<string, string> | null> {
  try {
    const response = await fetch(`${API_BASE}/currencies`)
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}
