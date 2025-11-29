'use client'

import { useAppSelector } from '@/store/hooks'
import { selectExpenses } from '@/store/slices/expensesSlice'
import { detectSpendingPatterns, detectAnomalies } from '@/utils/spendingAnalysis'
import { Brain, AlertTriangle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export function QuickInsightsWidget() {
  const expenses = useAppSelector(selectExpenses)
  
  const insights = useMemo(() => {
    if (expenses.length < 10) return null
    
    const patterns = detectSpendingPatterns(expenses)
    const anomalies = detectAnomalies(expenses)
    
    return {
      topPattern: patterns[0],
      anomalyCount: anomalies.length,
      hasInsights: patterns.length > 0 || anomalies.length > 0
    }
  }, [expenses])
  
  if (!insights || !insights.hasInsights) {
    return null
  }
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <Link 
          href="/advisor"
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
        >
          View All →
        </Link>
      </div>
      
      <div className="space-y-3">
        {/* Top Pattern */}
        {insights.topPattern && (
          <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Pattern Detected
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {insights.topPattern.insight}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(insights.topPattern.confidence * 100).toFixed(0)}% confidence
              </p>
            </div>
          </div>
        )}
        
        {/* Anomaly Alert */}
        {insights.anomalyCount > 0 && (
          <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Unusual Expenses
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {insights.anomalyCount} unusual {insights.anomalyCount === 1 ? 'transaction' : 'transactions'} detected in the last 30 days.
              </p>
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <Link 
            href="/advisor"
            className="block w-full text-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Get Personalized Advice
          </Link>
        </div>
      </div>
    </div>
  )
}
