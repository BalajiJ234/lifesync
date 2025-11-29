/**
 * AI-Powered Recurring Expense Detection
 * Automatically detects recurring patterns from transaction history
 * Replaces manual template creation with smart suggestions
 */

import { Expense } from '@/store/slices/expensesSlice'

export type DetectedFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringSuggestion {
  id: string
  description: string
  normalizedKey: string // For deduplication
  category: string
  currency: string
  avgAmount: number
  minAmount: number
  maxAmount: number
  frequency: DetectedFrequency
  occurrences: number
  confidence: number // 0-1
  lastDate: string
  nextExpected: string
  dayOfMonth?: number // For monthly patterns
  dayOfWeek?: number // For weekly patterns
  amountVariancePct: number
  status: 'suggested' | 'accepted' | 'ignored' | 'migrated'
  matchingExpenseIds: string[]
  createdAt: string
}

// Frequency detection thresholds (in days)
const FREQUENCY_RANGES: Record<DetectedFrequency, { min: number; max: number; label: string }> = {
  weekly: { min: 5, max: 9, label: 'Weekly' },
  biweekly: { min: 12, max: 17, label: 'Bi-weekly' },
  monthly: { min: 26, max: 35, label: 'Monthly' },
  quarterly: { min: 80, max: 100, label: 'Quarterly' },
  yearly: { min: 350, max: 400, label: 'Yearly' }
}

// Minimum occurrences required for each frequency
const MIN_OCCURRENCES: Record<DetectedFrequency, number> = {
  weekly: 4,
  biweekly: 3,
  monthly: 3,
  quarterly: 2,
  yearly: 2
}

/**
 * Normalize description for grouping similar expenses
 */
function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
    .slice(0, 50) // Limit length for grouping
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

/**
 * Calculate mean and standard deviation
 */
function calculateStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0 }
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  return { mean, stdDev }
}

/**
 * Classify frequency based on average days between occurrences
 */
function classifyFrequency(avgDays: number): DetectedFrequency | null {
  for (const [freq, range] of Object.entries(FREQUENCY_RANGES)) {
    if (avgDays >= range.min && avgDays <= range.max) {
      return freq as DetectedFrequency
    }
  }
  return null
}

/**
 * Calculate next expected date based on frequency and last occurrence
 */
function calculateNextExpected(
  lastDate: string,
  frequency: DetectedFrequency,
  avgDays: number,
  dayOfMonth?: number
): string {
  const last = new Date(lastDate)
  const next = new Date(last)
  
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      if (dayOfMonth) {
        // Adjust to specific day, handling month-end overflow
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
        next.setDate(Math.min(dayOfMonth, maxDay))
      }
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
    default:
      next.setDate(next.getDate() + Math.round(avgDays))
  }
  
  return next.toISOString().split('T')[0]
}

/**
 * Generate unique ID for suggestion
 */
function generateSuggestionId(key: string, frequency: DetectedFrequency): string {
  return `rec_${key.replace(/\s+/g, '_').slice(0, 20)}_${frequency}_${Date.now()}`
}

/**
 * Main detection function: Analyze expenses and detect recurring patterns
 */
export function detectRecurringPatterns(
  expenses: Expense[],
  existingAccepted: RecurringSuggestion[] = []
): RecurringSuggestion[] {
  if (expenses.length < 5) return [] // Need minimum data
  
  const suggestions: RecurringSuggestion[] = []
  const existingKeys = new Set(existingAccepted.map(s => s.normalizedKey))
  
  // Group expenses by normalized description + category + currency
  const groups = new Map<string, Expense[]>()
  
  for (const expense of expenses) {
    const normalizedDesc = normalizeDescription(expense.description)
    const key = `${normalizedDesc}|${expense.category}|${expense.currency}`
    
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(expense)
  }
  
  // Analyze each group for recurring patterns
  for (const [key, groupExpenses] of groups.entries()) {
    // Skip if already accepted
    if (existingKeys.has(key)) continue
    
    // Sort by date
    const sorted = [...groupExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    if (sorted.length < 2) continue
    
    // Calculate amount statistics
    const amounts = sorted.map(e => e.amount)
    const { mean: avgAmount, stdDev: amountStdDev } = calculateStats(amounts)
    const minAmount = Math.min(...amounts)
    const maxAmount = Math.max(...amounts)
    const amountVariancePct = avgAmount > 0 ? (amountStdDev / avgAmount) * 100 : 0
    
    // Skip if amount variance is too high (>15%)
    if (amountVariancePct > 15) continue
    
    // Calculate day intervals between consecutive expenses
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(daysBetween(sorted[i - 1].date, sorted[i].date))
    }
    
    if (intervals.length === 0) continue
    
    // Calculate interval statistics
    const { mean: avgDays, stdDev: daysStdDev } = calculateStats(intervals)
    
    // Classify frequency
    const frequency = classifyFrequency(avgDays)
    if (!frequency) continue
    
    // Check minimum occurrences
    if (sorted.length < MIN_OCCURRENCES[frequency]) continue
    
    // Calculate confidence score
    // Higher confidence when intervals are consistent
    const consistencyFactor = avgDays > 0 ? Math.max(0, 1 - (daysStdDev / avgDays)) : 0
    const occurrenceFactor = Math.min(1, sorted.length / (MIN_OCCURRENCES[frequency] * 2))
    const amountConsistency = Math.max(0, 1 - amountVariancePct / 100)
    
    const confidence = (consistencyFactor * 0.5 + occurrenceFactor * 0.3 + amountConsistency * 0.2)
    
    // Skip low confidence patterns
    if (confidence < 0.5) continue
    
    // Check if pattern is still active (last occurrence within 2x expected interval)
    const lastExpense = sorted[sorted.length - 1]
    const daysSinceLast = daysBetween(lastExpense.date, new Date().toISOString().split('T')[0])
    const maxInactiveDays = avgDays * 2.5
    
    if (daysSinceLast > maxInactiveDays) continue // Pattern may have stopped
    
    // Calculate day of month/week for monthly/weekly patterns
    let dayOfMonth: number | undefined
    let dayOfWeek: number | undefined
    
    if (frequency === 'monthly') {
      const days = sorted.map(e => new Date(e.date).getDate())
      dayOfMonth = Math.round(calculateStats(days).mean)
    } else if (frequency === 'weekly') {
      const days = sorted.map(e => new Date(e.date).getDay())
      // Mode of days
      const dayCount = new Map<number, number>()
      days.forEach(d => dayCount.set(d, (dayCount.get(d) || 0) + 1))
      dayOfWeek = [...dayCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    }
    
    // Calculate next expected date
    const nextExpected = calculateNextExpected(
      lastExpense.date,
      frequency,
      avgDays,
      dayOfMonth
    )
    
    const [normalizedDesc, category, currency] = key.split('|')
    
    suggestions.push({
      id: generateSuggestionId(normalizedDesc, frequency),
      description: lastExpense.description, // Use original description
      normalizedKey: key,
      category,
      currency,
      avgAmount: Math.round(avgAmount * 100) / 100,
      minAmount,
      maxAmount,
      frequency,
      occurrences: sorted.length,
      confidence: Math.round(confidence * 100) / 100,
      lastDate: lastExpense.date,
      nextExpected,
      dayOfMonth,
      dayOfWeek,
      amountVariancePct: Math.round(amountVariancePct * 10) / 10,
      status: 'suggested',
      matchingExpenseIds: sorted.map(e => e.id),
      createdAt: new Date().toISOString()
    })
  }
  
  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Get frequency label for display
 */
export function getFrequencyLabel(frequency: DetectedFrequency): string {
  return FREQUENCY_RANGES[frequency]?.label || frequency
}

/**
 * Check if a suggestion is overdue (past expected date)
 */
export function isSuggestionOverdue(suggestion: RecurringSuggestion): boolean {
  const today = new Date().toISOString().split('T')[0]
  return suggestion.nextExpected < today
}

/**
 * Get days until next expected occurrence
 */
export function getDaysUntilNext(suggestion: RecurringSuggestion): number {
  const today = new Date()
  const next = new Date(suggestion.nextExpected)
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Migrate a legacy RecurringTemplate to a RecurringSuggestion
 */
export function migrateFromTemplate(template: {
  id: string
  name: string
  amount: number
  currency: string
  category: string
  frequency: string
  dayOfMonth?: number
  dayOfWeek?: number
  notes?: string
  startDate: string
  lastGenerated?: string
}): RecurringSuggestion {
  const freq = template.frequency as DetectedFrequency
  const lastDate = template.lastGenerated || template.startDate
  
  return {
    id: `migrated_${template.id}`,
    description: template.name,
    normalizedKey: `${normalizeDescription(template.name)}|${template.category}|${template.currency}`,
    category: template.category,
    currency: template.currency,
    avgAmount: template.amount,
    minAmount: template.amount,
    maxAmount: template.amount,
    frequency: freq,
    occurrences: 0, // Unknown from template
    confidence: 0.95, // High confidence since manually created
    lastDate,
    nextExpected: calculateNextExpected(lastDate, freq, 30, template.dayOfMonth),
    dayOfMonth: template.dayOfMonth,
    dayOfWeek: template.dayOfWeek,
    amountVariancePct: 0,
    status: 'migrated',
    matchingExpenseIds: [],
    createdAt: new Date().toISOString()
  }
}
