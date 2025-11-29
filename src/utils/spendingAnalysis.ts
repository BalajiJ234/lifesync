/**
 * Spending Analysis & Pattern Detection Utilities
 * Provides AI-powered insights into spending behavior
 */

import { Expense } from '@/store/slices/expensesSlice'

export interface SpendingPattern {
  type: 'weekday' | 'weekend' | 'category' | 'time' | 'amount'
  insight: string
  confidence: number // 0-1
  data?: Record<string, number>
}

export interface AnomalyDetection {
  expense: Expense
  reason: string
  severity: 'low' | 'medium' | 'high'
  comparisonValue: number
}

export interface PredictiveBudget {
  month: string
  predictedAmount: number
  confidence: number
  basedOnMonths: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface SavingsOpportunity {
  category: string
  currentSpending: number
  potentialSaving: number
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

export interface CashflowForecast {
  date: string
  predictedBalance: number
  income: number
  expenses: number
  warning?: string
}

/**
 * Detect spending patterns in expense data
 */
export function detectSpendingPatterns(expenses: Expense[]): SpendingPattern[] {
  if (expenses.length < 10) return [] // Need minimum data for patterns
  
  const patterns: SpendingPattern[] = []
  
  // Pattern 1: Weekday vs Weekend Spending
  const weekdaySpending = expenses.filter(e => {
    const day = new Date(e.date).getDay()
    return day >= 1 && day <= 5
  }).reduce((sum, e) => sum + e.amount, 0)
  
  const weekendSpending = expenses.filter(e => {
    const day = new Date(e.date).getDay()
    return day === 0 || day === 6
  }).reduce((sum, e) => sum + e.amount, 0)
  
  const weekdayCount = expenses.filter(e => {
    const day = new Date(e.date).getDay()
    return day >= 1 && day <= 5
  }).length
  
  const weekendCount = expenses.filter(e => {
    const day = new Date(e.date).getDay()
    return day === 0 || day === 6
  }).length
  
  const avgWeekday = weekdayCount > 0 ? weekdaySpending / weekdayCount : 0
  const avgWeekend = weekendCount > 0 ? weekendSpending / weekendCount : 0
  
  if (avgWeekend > avgWeekday * 1.5) {
    patterns.push({
      type: 'weekend',
      insight: `You spend ${((avgWeekend / avgWeekday) * 100 - 100).toFixed(0)}% more on weekends. Consider planning weekend activities on a budget.`,
      confidence: 0.85,
      data: { weekday: avgWeekday, weekend: avgWeekend }
    })
  } else if (avgWeekday > avgWeekend * 1.5) {
    patterns.push({
      type: 'weekday',
      insight: `You spend ${((avgWeekday / avgWeekend) * 100 - 100).toFixed(0)}% more on weekdays. Review your daily routine expenses.`,
      confidence: 0.85,
      data: { weekday: avgWeekday, weekend: avgWeekend }
    })
  }
  
  // Pattern 2: Category Concentration
  const categorySpending = new Map<string, number>()
  expenses.forEach(e => {
    categorySpending.set(e.category, (categorySpending.get(e.category) || 0) + e.amount)
  })
  
  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0)
  const topCategory = Array.from(categorySpending.entries())
    .sort((a, b) => b[1] - a[1])[0]
  
  if (topCategory && topCategory[1] > totalSpending * 0.4) {
    patterns.push({
      type: 'category',
      insight: `${((topCategory[1] / totalSpending) * 100).toFixed(0)}% of your spending is on ${topCategory[0]}. Diversifying could improve your budget balance.`,
      confidence: 0.9,
      data: Object.fromEntries(categorySpending)
    })
  }
  
  // Pattern 3: Time-of-Month Spending
  const firstHalfSpending = expenses.filter(e => {
    const day = new Date(e.date).getDate()
    return day <= 15
  }).reduce((sum, e) => sum + e.amount, 0)
  
  const secondHalfSpending = expenses.filter(e => {
    const day = new Date(e.date).getDate()
    return day > 15
  }).reduce((sum, e) => sum + e.amount, 0)
  
  if (firstHalfSpending > secondHalfSpending * 1.6) {
    patterns.push({
      type: 'time',
      insight: 'You spend significantly more in the first half of the month. Consider spreading expenses more evenly.',
      confidence: 0.8,
      data: { firstHalf: firstHalfSpending, secondHalf: secondHalfSpending }
    })
  }
  
  // Pattern 4: Large Transaction Frequency
  const avgAmount = totalSpending / expenses.length
  const largeTransactions = expenses.filter(e => e.amount > avgAmount * 3)
  
  if (largeTransactions.length > expenses.length * 0.1) {
    patterns.push({
      type: 'amount',
      insight: `${largeTransactions.length} large transactions (>${(avgAmount * 3).toFixed(0)}) detected. Planning these better could smooth your cashflow.`,
      confidence: 0.75
    })
  }
  
  return patterns
}

/**
 * Detect anomalies (unusual expenses)
 */
export function detectAnomalies(expenses: Expense[]): AnomalyDetection[] {
  if (expenses.length < 20) return [] // Need sufficient history
  
  const anomalies: AnomalyDetection[] = []
  
  // Group by category
  const categoryExpenses = new Map<string, Expense[]>()
  expenses.forEach(e => {
    if (!categoryExpenses.has(e.category)) {
      categoryExpenses.set(e.category, [])
    }
    categoryExpenses.get(e.category)!.push(e)
  })
  
  // Check each expense against category average
  categoryExpenses.forEach((categoryList, category) => {
    if (categoryList.length < 5) return // Need at least 5 transactions
    
    const amounts = categoryList.map(e => e.amount)
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const stdDev = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length
    )
    
    // Recent expenses (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    categoryList
      .filter(e => new Date(e.date) >= thirtyDaysAgo)
      .forEach(expense => {
        // Anomaly if expense > 2 standard deviations above mean
        if (expense.amount > avg + 2 * stdDev) {
          anomalies.push({
            expense,
            reason: `This ${category} expense is ${((expense.amount / avg) * 100 - 100).toFixed(0)}% higher than your typical ${category} spending.`,
            severity: expense.amount > avg + 3 * stdDev ? 'high' : 'medium',
            comparisonValue: avg
          })
        }
      })
  })
  
  return anomalies.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

/**
 * Predict next month's spending based on historical trends
 */
export function predictMonthlyBudget(expenses: Expense[]): PredictiveBudget | null {
  if (expenses.length < 30) return null // Need at least 1 month of data
  
  // Group expenses by month
  const monthlyTotals = new Map<string, number>()
  expenses.forEach(e => {
    const date = new Date(e.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + e.amount)
  })
  
  const months = Array.from(monthlyTotals.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  
  if (months.length < 2) return null
  
  // Calculate trend using simple linear regression
  const amounts = months.map(m => m[1])
  const n = amounts.length
  const avg = amounts.reduce((a, b) => a + b, 0) / n
  
  // Simple moving average for prediction
  const recentMonths = amounts.slice(-3) // Last 3 months
  const predicted = recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length
  
  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (amounts.length >= 3) {
    const firstThird = amounts.slice(0, Math.floor(n / 3)).reduce((a, b) => a + b, 0) / Math.floor(n / 3)
    const lastThird = amounts.slice(-Math.floor(n / 3)).reduce((a, b) => a + b, 0) / Math.floor(n / 3)
    
    if (lastThird > firstThird * 1.1) trend = 'increasing'
    else if (lastThird < firstThird * 0.9) trend = 'decreasing'
  }
  
  // Calculate confidence based on consistency
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / n
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = stdDev / avg
  const confidence = Math.max(0.5, Math.min(0.95, 1 - coefficientOfVariation))
  
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  
  return {
    month: nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
    predictedAmount: Math.round(predicted),
    confidence,
    basedOnMonths: n,
    trend
  }
}

/**
 * Find savings opportunities
 */
export function findSavingsOpportunities(expenses: Expense[]): SavingsOpportunity[] {
  if (expenses.length < 20) return []
  
  const opportunities: SavingsOpportunity[] = []
  
  // Group by category and analyze
  const categorySpending = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  
  expenses.forEach(e => {
    categorySpending.set(e.category, (categorySpending.get(e.category) || 0) + e.amount)
    categoryCounts.set(e.category, (categoryCounts.get(e.category) || 0) + 1)
  })
  
  const totalSpending = Array.from(categorySpending.values()).reduce((a, b) => a + b, 0)
  
  // Find categories with high spending and frequent transactions
  Array.from(categorySpending.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5 categories
    .forEach(([category, amount]) => {
      const percentage = (amount / totalSpending) * 100
      const count = categoryCounts.get(category) || 0
      const avgTransaction = amount / count
      
      // Opportunity 1: High spending category
      if (percentage > 20) {
        opportunities.push({
          category,
          currentSpending: amount,
          potentialSaving: amount * 0.15, // 15% reduction target
          recommendation: `${category} is ${percentage.toFixed(0)}% of your spending. Try reducing by 15% for ${Math.round(amount * 0.15)} in savings.`,
          priority: 'high'
        })
      }
      
      // Opportunity 2: Frequent small transactions (potential subscription waste)
      if (count > 15 && avgTransaction < totalSpending / expenses.length) {
        opportunities.push({
          category,
          currentSpending: amount,
          potentialSaving: amount * 0.2,
          recommendation: `You have ${count} ${category} transactions. Consider consolidating or reviewing subscriptions to save ${Math.round(amount * 0.2)}.`,
          priority: 'medium'
        })
      }
    })
  
  // Opportunity 3: Identify potential subscription duplicates
  const subscriptionCategories = ['Entertainment', 'Subscriptions', 'Software', 'Streaming']
  subscriptionCategories.forEach(cat => {
    const spending = categorySpending.get(cat) || 0
    if (spending > 0) {
      opportunities.push({
        category: cat,
        currentSpending: spending,
        potentialSaving: spending * 0.25,
        recommendation: `Review your ${cat} subscriptions. You might have duplicates or unused services. Potential saving: ${Math.round(spending * 0.25)}.`,
        priority: 'medium'
      })
    }
  })
  
  return opportunities.slice(0, 5) // Return top 5
}

/**
 * Forecast cashflow for next 30 days
 */
export function forecastCashflow(
  expenses: Expense[],
  currentBalance: number,
  expectedIncome: number
): CashflowForecast[] {
  if (expenses.length < 30) return []
  
  const forecast: CashflowForecast[] = []
  
  // Calculate average daily spending from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo)
  const avgDailySpending = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / 30
  
  // Predict next 30 days
  let runningBalance = currentBalance
  const today = new Date()
  
  for (let i = 1; i <= 30; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(today.getDate() + i)
    
    // Assume income at start of month
    const dayOfMonth = forecastDate.getDate()
    const income = dayOfMonth === 1 ? expectedIncome : 0
    
    // Use historical average for expenses
    const expenses = avgDailySpending
    
    runningBalance = runningBalance + income - expenses
    
    const entry: CashflowForecast = {
      date: forecastDate.toISOString().split('T')[0],
      predictedBalance: Math.round(runningBalance),
      income,
      expenses: Math.round(expenses)
    }
    
    // Add warnings
    if (runningBalance < 0) {
      entry.warning = '⚠️ Predicted deficit - consider reducing spending'
    } else if (runningBalance < avgDailySpending * 7) {
      entry.warning = '⚡ Low balance warning - less than 1 week of expenses'
    }
    
    forecast.push(entry)
  }
  
  return forecast
}
