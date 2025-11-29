'use client'

import { useMemo, useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Bell,
  Settings,
  X,
  Target
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { 
  selectReportCurrency,
  selectBudgetSettings,
  updateSetting
} from '@/store/slices/settingsSlice'
import { SUPPORTED_CURRENCIES, formatAmount, convertCurrency } from '@/utils/currency'
import type { Expense } from '@/store/slices/expensesSlice'

interface BudgetAlert {
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  percentage: number
  icon: React.ReactNode
}

export default function BudgetAlertsWidget() {
  const dispatch = useAppDispatch()
  const expenses = useAppSelector((state) => state.expenses?.expenses || []) as Expense[]
  const reportCurrency = useAppSelector(selectReportCurrency)
  const budgetSettings = useAppSelector(selectBudgetSettings)
  const displayCurrency = SUPPORTED_CURRENCIES.find(c => c.code === reportCurrency) || SUPPORTED_CURRENCIES[0]
  
  const [showSettings, setShowSettings] = useState(false)
  const [tempBudget, setTempBudget] = useState(budgetSettings.monthlyBudget.toString())
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  // Get current month's expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    }).map(expense => ({
      ...expense,
      convertedAmount: convertCurrency(expense.amount, expense.currency, reportCurrency)
    }))
  }, [expenses, reportCurrency])

  // Calculate spending totals
  const monthlySpent = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.convertedAmount, 0)
  }, [currentMonthExpenses])

  // Calculate daily average and projected spending
  const projections = useMemo(() => {
    const now = new Date()
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const remainingDays = daysInMonth - dayOfMonth
    
    const dailyAverage = dayOfMonth > 0 ? monthlySpent / dayOfMonth : 0
    const projectedTotal = monthlySpent + (dailyAverage * remainingDays)
    
    return {
      dailyAverage,
      projectedTotal,
      remainingDays,
      daysElapsed: dayOfMonth,
      daysInMonth
    }
  }, [monthlySpent])

  // Generate alerts based on budget
  const alerts = useMemo((): BudgetAlert[] => {
    const alertsList: BudgetAlert[] = []
    const budget = budgetSettings.monthlyBudget

    if (budget <= 0) {
      alertsList.push({
        type: 'info',
        title: 'Set Your Budget',
        message: 'Set a monthly budget to receive spending alerts and track your progress.',
        percentage: 0,
        icon: <Target className="h-5 w-5" />
      })
      return alertsList
    }

    const percentUsed = (monthlySpent / budget) * 100
    const projectedPercent = (projections.projectedTotal / budget) * 100

    // Current spending alerts
    if (percentUsed >= 100) {
      alertsList.push({
        type: 'danger',
        title: 'Budget Exceeded! 🚨',
        message: `You've spent ${formatAmount(monthlySpent, displayCurrency)} of your ${formatAmount(budget, displayCurrency)} budget.`,
        percentage: percentUsed,
        icon: <AlertTriangle className="h-5 w-5" />
      })
    } else if (percentUsed >= 80) {
      alertsList.push({
        type: 'warning',
        title: 'Approaching Budget Limit',
        message: `You've used ${percentUsed.toFixed(0)}% of your monthly budget. ${formatAmount(budget - monthlySpent, displayCurrency)} remaining.`,
        percentage: percentUsed,
        icon: <AlertTriangle className="h-5 w-5" />
      })
    } else if (percentUsed >= 50) {
      alertsList.push({
        type: 'info',
        title: 'Halfway Through Budget',
        message: `You've used ${percentUsed.toFixed(0)}% of your budget. Stay on track!`,
        percentage: percentUsed,
        icon: <TrendingUp className="h-5 w-5" />
      })
    } else {
      alertsList.push({
        type: 'success',
        title: 'On Track! ✨',
        message: `Great job! You're within budget with ${formatAmount(budget - monthlySpent, displayCurrency)} remaining.`,
        percentage: percentUsed,
        icon: <CheckCircle className="h-5 w-5" />
      })
    }

    // Projection warning
    if (projectedPercent > 100 && percentUsed < 100 && projections.remainingDays > 3) {
      alertsList.push({
        type: 'warning',
        title: 'Projected Overspend',
        message: `At your current pace, you'll spend ~${formatAmount(projections.projectedTotal, displayCurrency)} this month, exceeding your budget by ${formatAmount(projections.projectedTotal - budget, displayCurrency)}.`,
        percentage: projectedPercent,
        icon: <TrendingUp className="h-5 w-5" />
      })
    }

    return alertsList.filter(alert => !dismissedAlerts.includes(alert.title))
  }, [budgetSettings.monthlyBudget, monthlySpent, projections, displayCurrency, dismissedAlerts])

  const handleSaveBudget = () => {
    const newBudget = parseFloat(tempBudget) || 0
    dispatch(updateSetting({ key: 'monthlyBudget', value: newBudget }))
    setShowSettings(false)
  }

  const dismissAlert = (title: string) => {
    setDismissedAlerts(prev => [...prev, title])
  }

  // Reset dismissed alerts at the start of each month
  useEffect(() => {
    const now = new Date()
    const key = `budget-alerts-dismissed-${now.getFullYear()}-${now.getMonth()}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      setDismissedAlerts(JSON.parse(stored))
    } else {
      setDismissedAlerts([])
      // Clear old months
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith('budget-alerts-dismissed-') && k !== key) {
          localStorage.removeItem(k)
        }
      }
    }
  }, [])

  // Save dismissed alerts
  useEffect(() => {
    const now = new Date()
    const key = `budget-alerts-dismissed-${now.getFullYear()}-${now.getMonth()}`
    localStorage.setItem(key, JSON.stringify(dismissedAlerts))
  }, [dismissedAlerts])

  const budget = budgetSettings.monthlyBudget
  const percentUsed = budget > 0 ? Math.min((monthlySpent / budget) * 100, 100) : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Budget Alerts</h3>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Budget Settings"
        >
          <Settings className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Budget Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Monthly Budget</h4>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {displayCurrency.symbol}
              </span>
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                placeholder="Enter budget"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleSaveBudget}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Set your monthly spending limit in {displayCurrency.code}
          </p>
        </div>
      )}

      {/* Budget Progress Bar */}
      {budget > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">
              Spent: <span className="font-semibold">{formatAmount(monthlySpent, displayCurrency)}</span>
            </span>
            <span className="text-gray-600">
              Budget: <span className="font-semibold">{formatAmount(budget, displayCurrency)}</span>
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed >= 100 ? 'bg-red-500' :
                percentUsed >= 80 ? 'bg-amber-500' :
                percentUsed >= 50 ? 'bg-blue-500' :
                'bg-green-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{percentUsed.toFixed(0)}% used</span>
            <span>{(100 - percentUsed).toFixed(0)}% remaining</span>
          </div>
        </div>
      )}

      {/* Daily Stats */}
      {budget > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Daily Avg</p>
            <p className="font-semibold text-gray-900">
              {formatAmount(projections.dailyAverage, displayCurrency)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Days Left</p>
            <p className="font-semibold text-gray-900">{projections.remainingDays}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Daily Budget</p>
            <p className="font-semibold text-gray-900">
              {formatAmount(
                Math.max(0, budget - monthlySpent) / Math.max(1, projections.remainingDays),
                displayCurrency
              )}
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              alert.type === 'danger' ? 'bg-red-50 border-red-200' :
              alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              alert.type === 'success' ? 'bg-green-50 border-green-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className={`flex-shrink-0 ${
              alert.type === 'danger' ? 'text-red-500' :
              alert.type === 'warning' ? 'text-amber-500' :
              alert.type === 'success' ? 'text-green-500' :
              'text-blue-500'
            }`}>
              {alert.icon}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${
                alert.type === 'danger' ? 'text-red-800' :
                alert.type === 'warning' ? 'text-amber-800' :
                alert.type === 'success' ? 'text-green-800' :
                'text-blue-800'
              }`}>
                {alert.title}
              </h4>
              <p className={`text-sm mt-1 ${
                alert.type === 'danger' ? 'text-red-600' :
                alert.type === 'warning' ? 'text-amber-600' :
                alert.type === 'success' ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {alert.message}
              </p>
            </div>
            {alert.type !== 'info' && (
              <button 
                onClick={() => dismissAlert(alert.title)}
                className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Quick Tip */}
      {budget > 0 && projections.remainingDays > 0 && monthlySpent < budget && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-700">
            💡 <span className="font-medium">Tip:</span> To stay on budget, try to spend no more than{' '}
            <span className="font-semibold">
              {formatAmount((budget - monthlySpent) / projections.remainingDays, displayCurrency)}
            </span>{' '}
            per day for the rest of the month.
          </p>
        </div>
      )}
    </div>
  )
}
