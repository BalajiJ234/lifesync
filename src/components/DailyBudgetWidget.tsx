'use client'

import { useAppSelector } from '@/store/hooks'
import { calculateDailyBudget } from '@/utils/dailyBudget'
import { getCurrencyByCode, formatAmount } from '@/utils/currency'
import { selectExpenses } from '@/store/slices/expensesSlice'
import { selectIncomes } from '@/store/slices/incomeSlice'
import { selectSettings } from '@/store/slices/settingsSlice'

export function DailyBudgetWidget() {
  const expenses = useAppSelector(selectExpenses)
  const incomes = useAppSelector(selectIncomes)
  const settings = useAppSelector(selectSettings)
  
  const budgetData = calculateDailyBudget(incomes, expenses, {
    currency: settings.currency,
    savingsRate: 0.20 // 20% savings target
  })
  
  const currency = getCurrencyByCode(budgetData.currency)
  
  const getColorClass = (percent: number) => {
    if (percent < 50) return 'text-green-600'
    if (percent < 80) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getProgressColor = (percent: number) => {
    if (percent < 50) return 'bg-green-500'
    if (percent < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📅 Today&apos;s Budget</h2>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatAmount(budgetData.dailyBudget, currency)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Spent</p>
          <p className={`text-xl font-semibold ${getColorClass(budgetData.percentUsed)}`}>
            {formatAmount(budgetData.spent, currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {budgetData.percentUsed.toFixed(0)}% used
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
          <p className={`text-xl font-semibold ${budgetData.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(budgetData.remaining, currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {budgetData.remaining >= 0 ? 'Under budget' : 'Over budget'}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${getProgressColor(budgetData.percentUsed)}`}
          style={{ width: `${Math.min(budgetData.percentUsed, 100)}%` }}
        />
      </div>
      
      {budgetData.percentUsed >= 80 && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ You&apos;ve used {budgetData.percentUsed.toFixed(0)}% of today&apos;s budget. Consider saving for tomorrow!
          </p>
        </div>
      )}
    </div>
  )
}
