'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectExpenses } from '@/store/slices/expensesSlice'
import {
  selectPendingSuggestions,
  selectAcceptedPatterns,
  setSuggestions,
  acceptSuggestion,
  ignoreSuggestion
} from '@/store/slices/recurringPatternsSlice'
import {
  detectRecurringPatterns,
  getFrequencyLabel,
  getDaysUntilNext,
  isSuggestionOverdue,
  RecurringSuggestion
} from '@/utils/recurrenceDetection'
import { formatAmount, getCurrencyByCode } from '@/utils/currency'
import { 
  Sparkles, 
  Check, 
  X, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

export function RecurringSuggestionsPanel() {
  const dispatch = useAppDispatch()
  const expenses = useAppSelector(selectExpenses)
  const pendingSuggestions = useAppSelector(selectPendingSuggestions)
  const acceptedPatterns = useAppSelector(selectAcceptedPatterns)
  
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAccepted, setShowAccepted] = useState(false)
  
  // Run detection when expenses change (debounced effect)
  useEffect(() => {
    if (expenses.length < 5) return
    
    const timer = setTimeout(() => {
      const detected = detectRecurringPatterns(expenses, acceptedPatterns)
      if (detected.length > 0) {
        dispatch(setSuggestions(detected))
      }
    }, 1000) // Debounce 1 second
    
    return () => clearTimeout(timer)
  }, [expenses, acceptedPatterns, dispatch])
  
  const handleAccept = (id: string) => {
    dispatch(acceptSuggestion(id))
  }
  
  const handleIgnore = (id: string) => {
    dispatch(ignoreSuggestion(id))
  }
  
  // Don't show if no suggestions
  if (pendingSuggestions.length === 0 && acceptedPatterns.length === 0) {
    return null
  }
  
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Detected Recurring Expenses
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pendingSuggestions.length > 0 
                ? `${pendingSuggestions.length} new pattern${pendingSuggestions.length > 1 ? 's' : ''} detected`
                : `${acceptedPatterns.length} active recurring expense${acceptedPatterns.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Pending Suggestions */}
          {pendingSuggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>New Patterns Detected</span>
              </h4>
              {pendingSuggestions.slice(0, 5).map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={handleAccept}
                  onIgnore={handleIgnore}
                  isPending
                />
              ))}
              {pendingSuggestions.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  +{pendingSuggestions.length - 5} more patterns detected
                </p>
              )}
            </div>
          )}
          
          {/* Accepted Patterns Toggle */}
          {acceptedPatterns.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setShowAccepted(!showAccepted)}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center space-x-2 hover:underline"
              >
                <TrendingUp className="h-4 w-4" />
                <span>
                  {showAccepted ? 'Hide' : 'Show'} {acceptedPatterns.length} Active Recurring Expense{acceptedPatterns.length > 1 ? 's' : ''}
                </span>
              </button>
              
              {showAccepted && (
                <div className="space-y-2">
                  {acceptedPatterns.map(pattern => (
                    <AcceptedPatternCard key={pattern.id} pattern={pattern} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SuggestionCard({
  suggestion,
  onAccept,
  onIgnore,
  isPending
}: {
  suggestion: RecurringSuggestion
  onAccept: (id: string) => void
  onIgnore: (id: string) => void
  isPending: boolean
}) {
  const currency = getCurrencyByCode(suggestion.currency)
  const daysUntil = getDaysUntilNext(suggestion)
  const isOverdue = isSuggestionOverdue(suggestion)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className="font-medium text-gray-900 dark:text-white truncate">
              {suggestion.description}
            </h5>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              {getFrequencyLabel(suggestion.frequency)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-white">
              {formatAmount(suggestion.avgAmount, currency)}
            </span>
            <span>•</span>
            <span>{suggestion.category}</span>
            <span>•</span>
            <span>{suggestion.occurrences} occurrences</span>
          </div>
          
          <div className="flex items-center space-x-2 mt-2 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
              suggestion.confidence >= 0.8 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : suggestion.confidence >= 0.6
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
            
            <span className={`inline-flex items-center space-x-1 ${
              isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>
                {isOverdue 
                  ? `Overdue by ${Math.abs(daysUntil)} days`
                  : daysUntil === 0 
                    ? 'Due today'
                    : `Due in ${daysUntil} days`
                }
              </span>
            </span>
          </div>
        </div>
        
        {isPending && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onAccept(suggestion.id)}
              className="p-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              title="Accept as recurring"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => onIgnore(suggestion.id)}
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Ignore this pattern"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AcceptedPatternCard({ pattern }: { pattern: RecurringSuggestion }) {
  const currency = getCurrencyByCode(pattern.currency)
  const daysUntil = getDaysUntilNext(pattern)
  const isOverdue = isSuggestionOverdue(pattern)
  
  return (
    <div className={`rounded-lg p-3 border ${
      isOverdue 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isOverdue ? (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {pattern.description}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {getFrequencyLabel(pattern.frequency)} • {formatAmount(pattern.avgAmount, currency)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${
            isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
          }`}>
            {isOverdue 
              ? `${Math.abs(daysUntil)}d overdue`
              : daysUntil === 0 
                ? 'Today'
                : `${daysUntil}d`
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pattern.status === 'migrated' ? 'Migrated' : 'Confirmed'}
          </p>
        </div>
      </div>
    </div>
  )
}
