'use client'

import { useAppSelector } from '@/store/hooks'
import { selectExpenses } from '@/store/slices/expensesSlice'
import { selectIncomes } from '@/store/slices/incomeSlice'
import { selectSettings } from '@/store/slices/settingsSlice'
import {
  detectSpendingPatterns,
  detectAnomalies,
  predictMonthlyBudget,
  findSavingsOpportunities,
  forecastCashflow,
  SpendingPattern,
  AnomalyDetection,
  SavingsOpportunity,
  CashflowForecast
} from '@/utils/spendingAnalysis'
import { formatAmount, getCurrencyByCode, Currency } from '@/utils/currency'
import { TrendingUp, AlertTriangle, Lightbulb, DollarSign, Calendar, Brain } from 'lucide-react'
import { useMemo } from 'react'

export function AIAdvancedInsights() {
  const expenses = useAppSelector(selectExpenses)
  const incomes = useAppSelector(selectIncomes)
  const settings = useAppSelector(selectSettings)
  const currency = getCurrencyByCode(settings.currency)
  
  // Calculate insights
  const insights = useMemo(() => {
    const patterns = detectSpendingPatterns(expenses)
    const anomalies = detectAnomalies(expenses)
    const prediction = predictMonthlyBudget(expenses)
    const opportunities = findSavingsOpportunities(expenses)
    
    // Calculate current balance (simplified - would need actual balance tracking)
    const totalIncome = incomes
      .filter(i => i.status === 'received')
      .reduce((sum, i) => sum + i.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const currentBalance = totalIncome - totalExpenses
    
    // Expected monthly income
    const monthlyIncome = incomes
      .filter(i => i.recurrence !== 'one-time')
      .reduce((sum, i) => sum + i.amount, 0)
    
    const forecast = forecastCashflow(expenses, currentBalance, monthlyIncome)
    
    return { patterns, anomalies, prediction, opportunities, forecast }
  }, [expenses, incomes])
  
  if (expenses.length < 10) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3 mb-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Add more expenses to unlock AI-powered insights. We need at least 10 transactions to detect patterns.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Spending Patterns */}
      {insights.patterns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending Patterns Detected</h3>
          </div>
          <div className="space-y-3">
            {insights.patterns.map((pattern, index) => (
              <PatternCard key={index} pattern={pattern} />
            ))}
          </div>
        </div>
      )}
      
      {/* Anomalies */}
      {insights.anomalies.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unusual Expenses Detected</h3>
          </div>
          <div className="space-y-3">
            {insights.anomalies.slice(0, 3).map((anomaly, index) => (
              <AnomalyCard key={index} anomaly={anomaly} currency={currency} />
            ))}
          </div>
        </div>
      )}
      
      {/* Predictive Budget */}
      {insights.prediction && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Predictive Budget</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">
              {formatAmount(insights.prediction.predictedAmount, currency)}
            </p>
            <p className="text-sm opacity-90">
              Predicted spending for {insights.prediction.month}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span>Confidence: {(insights.prediction.confidence * 100).toFixed(0)}%</span>
              <span>•</span>
              <span>Trend: {insights.prediction.trend === 'increasing' ? '📈' : insights.prediction.trend === 'decreasing' ? '📉' : '➡️'} {insights.prediction.trend}</span>
            </div>
            <p className="text-xs opacity-80 mt-2">
              Based on {insights.prediction.basedOnMonths} months of data
            </p>
          </div>
        </div>
      )}
      
      {/* Savings Opportunities */}
      {insights.opportunities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Opportunities</h3>
          </div>
          <div className="space-y-3">
            {insights.opportunities.map((opportunity, index) => (
              <OpportunityCard key={index} opportunity={opportunity} currency={currency} />
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              💰 Total Potential Savings: {formatAmount(
                insights.opportunities.reduce((sum, o) => sum + o.potentialSaving, 0),
                currency
              )} per month
            </p>
          </div>
        </div>
      )}
      
      {/* Cashflow Forecast */}
      {insights.forecast.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">30-Day Cashflow Forecast</h3>
          </div>
          <CashflowForecastChart forecast={insights.forecast} currency={currency} />
        </div>
      )}
    </div>
  )
}

function PatternCard({ pattern }: { pattern: SpendingPattern }) {
  return (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {pattern.type === 'weekend' ? '📅 Weekend Spending' :
             pattern.type === 'weekday' ? '📅 Weekday Spending' :
             pattern.type === 'category' ? '📊 Category Concentration' :
             pattern.type === 'time' ? '⏰ Time Pattern' :
             '💵 Transaction Size'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{pattern.insight}</p>
        </div>
        <div className="ml-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            {(pattern.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>
    </div>
  )
}

function AnomalyCard({ anomaly, currency }: { anomaly: AnomalyDetection; currency: Currency }) {
  const severityColor = {
    low: 'yellow',
    medium: 'orange',
    high: 'red'
  }[anomaly.severity]
  
  return (
    <div className={`p-4 bg-${severityColor}-50 dark:bg-${severityColor}-900/20 border border-${severityColor}-200 dark:border-${severityColor}-700 rounded-lg`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className={`h-5 w-5 text-${severityColor}-600 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {anomaly.expense.description}
            </p>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatAmount(anomaly.expense.amount, currency)}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{anomaly.reason}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Typical spending: {formatAmount(anomaly.comparisonValue, currency)}
          </p>
        </div>
      </div>
    </div>
  )
}

function OpportunityCard({ opportunity, currency }: { opportunity: SavingsOpportunity; currency: Currency }) {
  const priorityColor = {
    high: 'red',
    medium: 'yellow',
    low: 'green'
  }[opportunity.priority]
  
  return (
    <div className={`p-4 bg-${priorityColor}-50 dark:bg-${priorityColor}-900/20 border border-${priorityColor}-200 dark:border-${priorityColor}-700 rounded-lg`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <DollarSign className={`h-5 w-5 text-${priorityColor}-600`} />
          <p className="text-sm font-medium text-gray-900 dark:text-white">{opportunity.category}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${priorityColor}-100 dark:bg-${priorityColor}-900 text-${priorityColor}-800 dark:text-${priorityColor}-200`}>
          {opportunity.priority} priority
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{opportunity.recommendation}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">
          Current: {formatAmount(opportunity.currentSpending, currency)}
        </span>
        <span className="font-medium text-green-600 dark:text-green-400">
          Save: {formatAmount(opportunity.potentialSaving, currency)}
        </span>
      </div>
    </div>
  )
}

function CashflowForecastChart({ forecast, currency }: { forecast: CashflowForecast[]; currency: Currency }) {
  // Show key dates with warnings
  const criticalDates = forecast.filter(f => f.warning)
  
  if (criticalDates.length === 0) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
        <p className="text-sm text-green-800 dark:text-green-200">
          ✅ Your cashflow looks healthy for the next 30 days!
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
          ⚠️ {criticalDates.length} potential cashflow issues detected
        </p>
        <div className="space-y-2">
          {criticalDates.slice(0, 3).map((forecast, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(forecast.date).toLocaleDateString()}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(forecast.predictedBalance, currency)}
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">{forecast.warning}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>💡 Tip: Build an emergency fund of at least 3-6 months of expenses to avoid cashflow issues.</p>
      </div>
    </div>
  )
}
