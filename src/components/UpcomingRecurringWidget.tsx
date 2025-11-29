'use client'

import { useAppSelector } from '@/store/hooks'
import { selectAcceptedPatterns } from '@/store/slices/recurringPatternsSlice'
import { formatAmount, getCurrencyByCode } from '@/utils/currency'
import { getFrequencyLabel, getDaysUntilNext, isSuggestionOverdue } from '@/utils/recurrenceDetection'
import { selectSettings } from '@/store/slices/settingsSlice'
import { Calendar, AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function UpcomingRecurringWidget() {
  const acceptedPatterns = useAppSelector(selectAcceptedPatterns)
  const settings = useAppSelector(selectSettings)
  
  // Sort by next expected date
  const sortedPatterns = [...acceptedPatterns]
    .map(p => ({
      ...p,
      daysUntil: getDaysUntilNext(p),
      isOverdue: isSuggestionOverdue(p)
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
  
  // Get upcoming (next 14 days) and overdue
  const upcoming = sortedPatterns.filter(p => !p.isOverdue && p.daysUntil <= 14)
  const overdue = sortedPatterns.filter(p => p.isOverdue)
  
  if (acceptedPatterns.length === 0) {
    return null
  }
  
  const totalUpcoming = upcoming.reduce((sum, p) => sum + p.avgAmount, 0)
  const totalOverdue = overdue.reduce((sum, p) => sum + p.avgAmount, 0)
  
  const currency = getCurrencyByCode(settings.currency)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Fixed Expenses
          </h3>
        </div>
        <Link 
          href="/expenses"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Manage →
        </Link>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Next 14 days</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatAmount(totalUpcoming, currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {upcoming.length} expense{upcoming.length !== 1 ? 's' : ''}
          </p>
        </div>
        {overdue.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              {formatAmount(totalOverdue, currency)}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400">
              {overdue.length} expense{overdue.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
      
      {/* List */}
      <div className="space-y-2">
        {/* Overdue first */}
        {overdue.slice(0, 3).map(pattern => (
          <div 
            key={pattern.id}
            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {pattern.description}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getFrequencyLabel(pattern.frequency)} • {Math.abs(pattern.daysUntil)}d overdue
                </p>
              </div>
            </div>
            <p className="font-medium text-red-700 dark:text-red-300">
              {formatAmount(pattern.avgAmount, getCurrencyByCode(pattern.currency))}
            </p>
          </div>
        ))}
        
        {/* Upcoming */}
        {upcoming.slice(0, 5).map(pattern => (
          <div 
            key={pattern.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {pattern.description}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getFrequencyLabel(pattern.frequency)} • {pattern.daysUntil === 0 ? 'Today' : `${pattern.daysUntil}d`}
                </p>
              </div>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatAmount(pattern.avgAmount, getCurrencyByCode(pattern.currency))}
            </p>
          </div>
        ))}
        
        {sortedPatterns.length > 8 && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 pt-2">
            +{sortedPatterns.length - 8} more recurring expenses
          </p>
        )}
      </div>
    </div>
  )
}
