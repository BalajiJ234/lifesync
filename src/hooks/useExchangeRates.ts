import { useState, useEffect, useCallback } from 'react'
import { 
  fetchLatestRates, 
  convertWithLiveRate,
  ExchangeRates 
} from '@/utils/exchangeRates'

interface UseExchangeRatesOptions {
  baseCurrency?: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface UseExchangeRatesReturn {
  rates: ExchangeRates | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
  convert: (amount: number, fromCurrency: string, toCurrency: string) => number
  convertAsync: (amount: number, fromCurrency: string, toCurrency: string, date?: string) => Promise<number>
  getRate: (fromCurrency: string, toCurrency: string) => number | null
}

export function useExchangeRates(options: UseExchangeRatesOptions = {}): UseExchangeRatesReturn {
  const { 
    baseCurrency = 'USD', 
    autoRefresh = false, 
    refreshInterval = 1000 * 60 * 60 // 1 hour
  } = options

  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchLatestRates(baseCurrency)
      if (data) {
        setRates(data)
        setLastUpdated(new Date())
      } else {
        setError('Failed to fetch exchange rates')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [baseCurrency])

  // Initial fetch
  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchRates, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchRates])

  // Synchronous convert using cached rates
  const convert = useCallback((amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount
    if (!rates) return amount // Fallback if no rates

    // If base matches fromCurrency, direct conversion
    if (rates.base === fromCurrency && rates.rates[toCurrency]) {
      return amount * rates.rates[toCurrency]
    }

    // If base matches toCurrency, inverse conversion
    if (rates.base === toCurrency && rates.rates[fromCurrency]) {
      return amount / rates.rates[fromCurrency]
    }

    // Cross conversion through base
    if (rates.rates[fromCurrency] && rates.rates[toCurrency]) {
      const inBase = amount / rates.rates[fromCurrency]
      return inBase * rates.rates[toCurrency]
    }

    return amount
  }, [rates])

  // Async convert with optional historical date
  const convertAsync = useCallback(async (
    amount: number, 
    fromCurrency: string, 
    toCurrency: string,
    date?: string
  ): Promise<number> => {
    const result = await convertWithLiveRate(amount, fromCurrency, toCurrency, date)
    return result.convertedAmount
  }, [])

  // Get exchange rate between two currencies
  const getRate = useCallback((fromCurrency: string, toCurrency: string): number | null => {
    if (fromCurrency === toCurrency) return 1
    if (!rates) return null

    if (rates.base === fromCurrency && rates.rates[toCurrency]) {
      return rates.rates[toCurrency]
    }

    if (rates.base === toCurrency && rates.rates[fromCurrency]) {
      return 1 / rates.rates[fromCurrency]
    }

    if (rates.rates[fromCurrency] && rates.rates[toCurrency]) {
      return rates.rates[toCurrency] / rates.rates[fromCurrency]
    }

    return null
  }, [rates])

  return {
    rates,
    loading,
    error,
    lastUpdated,
    refresh: fetchRates,
    convert,
    convertAsync,
    getRate
  }
}

/**
 * Hook for converting a single expense with historical rate
 */
export function useHistoricalConversion(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date: string
) {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount)
      setRate(1)
      setLoading(false)
      return
    }

    setLoading(true)
    convertWithLiveRate(amount, fromCurrency, toCurrency, date)
      .then(result => {
        setConvertedAmount(result.convertedAmount)
        setRate(result.rate)
      })
      .finally(() => setLoading(false))
  }, [amount, fromCurrency, toCurrency, date])

  return { convertedAmount, rate, loading }
}
