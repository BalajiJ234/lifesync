'use client'

import { useMemo, useState } from 'react'
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectReportCurrency } from '@/store/slices/settingsSlice'
import { SUPPORTED_CURRENCIES, formatAmount, convertCurrency } from '@/utils/currency'
import type { Expense } from '@/store/slices/expensesSlice'

interface CategoryData {
  name: string
  amount: number
  percentage: number
  color: string
  icon: string
}

interface DailyData {
  date: string
  dayName: string
  amount: number
}

const CATEGORY_COLORS: Record<string, { bg: string; bar: string }> = {
  'Food & Dining': { bg: 'bg-orange-500', bar: 'bg-orange-400' },
  'Transportation': { bg: 'bg-blue-500', bar: 'bg-blue-400' },
  'Shopping': { bg: 'bg-pink-500', bar: 'bg-pink-400' },
  'Entertainment': { bg: 'bg-purple-500', bar: 'bg-purple-400' },
  'Bills & Utilities': { bg: 'bg-yellow-500', bar: 'bg-yellow-400' },
  'Healthcare': { bg: 'bg-red-500', bar: 'bg-red-400' },
  'Education': { bg: 'bg-indigo-500', bar: 'bg-indigo-400' },
  'Travel': { bg: 'bg-green-500', bar: 'bg-green-400' },
  'Personal Care': { bg: 'bg-rose-500', bar: 'bg-rose-400' },
  'Rental': { bg: 'bg-cyan-500', bar: 'bg-cyan-400' },
  'Others': { bg: 'bg-gray-500', bar: 'bg-gray-400' },
}

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Bills & Utilities': '💡',
  'Healthcare': '🏥',
  'Education': '📚',
  'Travel': '✈️',
  'Personal Care': '💄',
  'Rental': '🏠',
  'Others': '📦',
}

export default function SpendingAnalyticsWidget() {
  const expenses = useAppSelector((state) => state.expenses?.expenses || []) as Expense[]
  const reportCurrency = useAppSelector(selectReportCurrency)
  const displayCurrency = SUPPORTED_CURRENCIES.find(c => c.code === reportCurrency) || SUPPORTED_CURRENCIES[0]
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  
  const [chartView, setChartView] = useState<'category' | 'daily'>('category')

  // Parse selected month
  const [year, month] = selectedMonth.split('-').map(Number)
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  // Filter expenses for selected month and convert to report currency
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1
    }).map(expense => ({
      ...expense,
      convertedAmount: convertCurrency(expense.amount, expense.currency, reportCurrency)
    }))
  }, [expenses, year, month, reportCurrency])

  // Calculate category breakdown
  const categoryData = useMemo((): CategoryData[] => {
    const totals: Record<string, number> = {}
    
    monthlyExpenses.forEach(expense => {
      const category = expense.category || 'Others'
      totals[category] = (totals[category] || 0) + expense.convertedAmount
    })

    const total = Object.values(totals).reduce((sum, val) => sum + val, 0)
    
    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORY_COLORS[name]?.bg || 'bg-gray-500',
        icon: CATEGORY_ICONS[name] || '📦'
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [monthlyExpenses])

  // Calculate daily spending for last 7 days of the month
  const dailyData = useMemo((): DailyData[] => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyTotals: Record<string, number> = {}
    
    // Initialize all days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      dailyTotals[dateStr] = 0
    }
    
    // Sum expenses by day
    monthlyExpenses.forEach(expense => {
      const dateStr = expense.date.split('T')[0]
      if (dailyTotals[dateStr] !== undefined) {
        dailyTotals[dateStr] += expense.convertedAmount
      }
    })

    // Get last 7 days with data or recent days
    const sortedDays = Object.entries(dailyTotals)
      .map(([date, amount]) => {
        const d = new Date(date)
        return {
          date,
          dayName: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
          amount
        }
      })
      .slice(-7)

    return sortedDays
  }, [monthlyExpenses, year, month])

  // Calculate month-over-month change
  const monthComparison = useMemo(() => {
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    
    const prevMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === prevYear && expenseDate.getMonth() === prevMonth - 1
    })

    const currentTotal = monthlyExpenses.reduce((sum, e) => sum + e.convertedAmount, 0)
    const prevTotal = prevMonthExpenses.reduce((sum, e) => 
      sum + convertCurrency(e.amount, e.currency, reportCurrency), 0
    )

    const change = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0
    
    return {
      current: currentTotal,
      previous: prevTotal,
      change,
      isUp: change > 0
    }
  }, [expenses, monthlyExpenses, year, month, reportCurrency])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [y, m] = selectedMonth.split('-').map(Number)
    let newYear = y
    let newMonth = m
    
    if (direction === 'prev') {
      newMonth = m === 1 ? 12 : m - 1
      newYear = m === 1 ? y - 1 : y
    } else {
      newMonth = m === 12 ? 1 : m + 1
      newYear = m === 12 ? y + 1 : y
    }
    
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`)
  }

  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.convertedAmount, 0)
  const maxCategoryAmount = categoryData.length > 0 ? categoryData[0].amount : 0
  const maxDailyAmount = Math.max(...dailyData.map(d => d.amount), 1)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Spending Analytics</h3>
            <p className="text-sm text-gray-500">Track your spending patterns</p>
          </div>
        </div>
        
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{monthName}</span>
          </div>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-purple-900">
            {formatAmount(totalSpent, displayCurrency)}
          </p>
          <p className="text-xs text-purple-500 mt-1">
            {monthlyExpenses.length} transactions
          </p>
        </div>
        
        <div className={`p-4 rounded-lg ${monthComparison.isUp ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
          <p className={`text-sm font-medium ${monthComparison.isUp ? 'text-red-600' : 'text-green-600'}`}>
            vs Last Month
          </p>
          <div className="flex items-center gap-2">
            {monthComparison.isUp ? (
              <TrendingUp className="h-5 w-5 text-red-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-500" />
            )}
            <p className={`text-2xl font-bold ${monthComparison.isUp ? 'text-red-900' : 'text-green-900'}`}>
              {Math.abs(monthComparison.change).toFixed(1)}%
            </p>
          </div>
          <p className={`text-xs mt-1 ${monthComparison.isUp ? 'text-red-500' : 'text-green-500'}`}>
            {monthComparison.isUp ? 'More than' : 'Less than'} {formatAmount(monthComparison.previous, displayCurrency)}
          </p>
        </div>
      </div>

      {/* Chart Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setChartView('category')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chartView === 'category' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <PieChart className="h-4 w-4" />
          By Category
        </button>
        <button
          onClick={() => setChartView('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chartView === 'daily' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Daily Trend
        </button>
      </div>

      {/* Charts */}
      {chartView === 'category' ? (
        <div className="space-y-3">
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No expenses this month</p>
            </div>
          ) : (
            categoryData.map((category) => (
              <div key={category.name} className="flex items-center gap-3">
                <span className="text-xl w-8">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatAmount(category.amount, displayCurrency)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${category.color}`}
                      style={{ width: `${(category.amount / maxCategoryAmount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {dailyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No data available</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {dailyData.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-purple-500 rounded-t transition-all duration-300 hover:bg-purple-600"
                    style={{ 
                      height: `${Math.max((day.amount / maxDailyAmount) * 100, day.amount > 0 ? 5 : 0)}%`,
                      minHeight: day.amount > 0 ? '8px' : '0'
                    }}
                    title={formatAmount(day.amount, displayCurrency)}
                  />
                  <span className="text-xs text-gray-500 mt-2 text-center">{day.dayName}</span>
                </div>
              ))}
            </div>
          )}
          <div className="text-center text-sm text-gray-500 mt-4">
            Last 7 days of {monthName}
          </div>
        </div>
      )}
    </div>
  )
}
