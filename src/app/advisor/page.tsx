'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setAdvice } from '@/store/slices/advisorSlice'
import { selectExpenses } from '@/store/slices/expensesSlice'
import { selectIncomes } from '@/store/slices/incomeSlice'
import { selectSettings } from '@/store/slices/settingsSlice'
import { getCurrencyByCode, formatAmount } from '@/utils/currency'
import { DailyBudgetWidget } from '@/components/DailyBudgetWidget'
import { AIAdvancedInsights } from '@/components/ai/AIAdvancedInsights'
import { UpcomingRecurringWidget } from '@/components/UpcomingRecurringWidget'

export default function AdvisorPage() {
  const dispatch = useAppDispatch()
  const expenses = useAppSelector(selectExpenses)
  const incomes = useAppSelector(selectIncomes)
  const advice = useAppSelector(state => state.advisor.currentAdvice)
  const settings = useAppSelector(selectSettings)
  
  const currency = getCurrencyByCode(settings.currency)
  
  useEffect(() => {
    // Calculate monthly advice
    const calculateAdvice = () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      // Monthly income (recurring + one-time received this month)
      const monthlyIncome = incomes
        .filter(i => {
          if (i.recurrence !== 'one-time' && i.status === 'received') return true
          const eventDate = new Date(i.eventDate)
          return i.status === 'received' && eventDate >= firstDay && eventDate <= lastDay
        })
        .reduce((sum, i) => sum + i.amount, 0)
      
      // Fixed expenses (recurring)
      const fixedExpenses = expenses
        .filter(e => e.isRecurring)
        .reduce((sum, e) => sum + e.amount, 0)
      
      // Variable expenses (this month, non-recurring)
      const variableExpenses = expenses
        .filter(e => {
          const date = new Date(e.date)
          return !e.isRecurring && date >= firstDay && date <= lastDay
        })
        .reduce((sum, e) => sum + e.amount, 0)
      
      // Family remittance (category-based)
      const familyRemittance = expenses
        .filter(e => {
          const cat = e.category.toLowerCase()
          return cat.includes('family') || cat.includes('remittance')
        })
        .reduce((sum, e) => sum + e.amount, 0)
      
      // Calculate savings
      const totalExpenses = fixedExpenses + variableExpenses
      const potentialSavings = monthlyIncome - totalExpenses
      const savingsRate = monthlyIncome > 0 ? (potentialSavings / monthlyIncome) * 100 : 0
      
      // Category breakdown
      const categoryMap = new Map<string, number>()
      expenses.filter(e => {
        const date = new Date(e.date)
        return date >= firstDay && date <= lastDay
      }).forEach(e => {
        categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount)
      })
      
      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, spent]) => ({
          category,
          spent,
          recommended: spent * 0.8, // Suggest 20% reduction
        }))
        .sort((a, b) => b.spent - a.spent)
      
      // Generate recommendations
      const recommendations: string[] = []
      
      if (savingsRate < 20) {
        recommendations.push(`Your savings rate is ${savingsRate.toFixed(0)}%. Aim for at least 20%.`)
      } else {
        recommendations.push(`Great job! You're saving ${savingsRate.toFixed(0)}% of your income.`)
      }
      
      const topCategory = categoryBreakdown[0]
      if (topCategory && topCategory.spent > monthlyIncome * 0.3) {
        recommendations.push(`You're spending ${((topCategory.spent / monthlyIncome) * 100).toFixed(0)}% on ${topCategory.category}. Consider reducing by 10%.`)
      }
      
      if (potentialSavings < 0) {
        recommendations.push(`⚠️ You're spending more than you earn this month. Review your expenses immediately.`)
      }
      
      if (familyRemittance > 0) {
        recommendations.push(`Family remittance: ${formatAmount(familyRemittance, currency)}. This is reserved from your budget.`)
      }
      
      if (monthlyIncome === 0) {
        recommendations.push(`💡 Add your income sources to get personalized financial advice.`)
      }
      
      dispatch(setAdvice({
        monthlyIncome,
        fixedExpenses,
        variableExpenses,
        familyRemittance,
        potentialSavings,
        savingsRate,
        recommendations,
        categoryBreakdown: categoryBreakdown.slice(0, 5), // Top 5 categories
      }))
    }
    
    calculateAdvice()
  }, [expenses, incomes, dispatch, currency])
  
  if (!advice) {
    return <div className="p-4">Calculating your financial advice...</div>
  }
  
  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">💰 Financial Advisor</h1>
      
      <DailyBudgetWidget />
      
      {/* Upcoming Fixed Expenses */}
      <UpcomingRecurringWidget />
      
      {/* Monthly Summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">This Month&apos;s Summary</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm opacity-90">Income</p>
            <p className="text-2xl font-bold">{formatAmount(advice.monthlyIncome, currency)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Total Expenses</p>
            <p className="text-2xl font-bold">
              {formatAmount(advice.fixedExpenses + advice.variableExpenses, currency)}
            </p>
          </div>
        </div>
        <div className="border-t border-white/20 pt-4">
          <p className="text-sm opacity-90">You can save</p>
          <p className="text-3xl font-bold">
            {formatAmount(advice.potentialSavings, currency)}
          </p>
          <p className="text-sm mt-1">
            Savings rate: {advice.savingsRate.toFixed(1)}%
            {advice.savingsRate >= 20 ? ' ✅' : ' ⚠️'}
          </p>
        </div>
      </div>
      
      {/* AI Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">💡 AI Recommendations</h3>
        <ul className="space-y-3">
          {advice.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-gray-700 dark:text-gray-300">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Category Breakdown */}
      {advice.categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📊 Spending by Category</h3>
          <div className="space-y-4">
            {advice.categoryBreakdown.map((cat) => {
              const percent = advice.monthlyIncome > 0 ? (cat.spent / advice.monthlyIncome) * 100 : 0
              return (
                <div key={cat.category}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{cat.category}</span>
                    <span className="text-gray-700 dark:text-gray-300">{formatAmount(cat.spent, currency)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {percent.toFixed(1)}% of income
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* AI Advanced Insights */}
      <AIAdvancedInsights />
    </main>
  )
}
