'use client'

import { useAppSelector } from '@/store/hooks'
import { selectExpenses } from '@/store/slices/expensesSlice'
import { selectSettings } from '@/store/slices/settingsSlice'
import { getCurrencyByCode, formatAmount } from '@/utils/currency'

export function FamilyRemittanceWidget() {
  const settings = useAppSelector(selectSettings)
  const expenses = useAppSelector(selectExpenses)
  
  if (!settings.familyRemittanceEnabled) return null
  
  const currency = getCurrencyByCode(settings.familyRemittanceCurrency)
  
  // Check if remittance paid this month
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const remittanceThisMonth = expenses.some(e => {
    const cat = e.category.toLowerCase()
    const date = new Date(e.date)
    return (cat.includes('family') || cat.includes('remittance')) && date >= firstDay
  })
  
  const dueDate = new Date(now.getFullYear(), now.getMonth(), settings.familyRemittanceDay)
  const isPastDue = now > dueDate && !remittanceThisMonth
  
  return (
    <div className={`rounded-lg shadow-md p-4 mb-6 ${
      isPastDue 
        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' 
        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">👨‍👩‍👧 Family Remittance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Due: Day {settings.familyRemittanceDay} of each month
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(settings.familyRemittanceAmount, currency)}
          </p>
          <p className="text-sm">
            {remittanceThisMonth ? (
              <span className="text-green-600 dark:text-green-400">✅ Paid this month</span>
            ) : isPastDue ? (
              <span className="text-red-600 dark:text-red-400">⚠️ Overdue</span>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
