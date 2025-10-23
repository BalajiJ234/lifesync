'use client'

import { useState } from 'react'

interface CategoryResult {
  category: string
  confidence: number
  reasoning: string
  suggestions?: string[]
}

interface Suggestion {
  type: string
  title: string
  message: string
  action: string
  priority: string
}

export function useAIIntegration() {
  const [isProcessing, setIsProcessing] = useState(false)

  const categorizeExpense = async (description: string, amount: number): Promise<CategoryResult | null> => {
    if (!description.trim() || !amount) return null

    try {
      setIsProcessing(true)
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount })
      })

      if (!response.ok) {
        throw new Error('Failed to categorize expense')
      }

      const data = await response.json()
      return data.success ? data : null
    } catch (error) {
      console.error('AI categorization error:', error)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  const getSuggestions = async (type: string = 'general'): Promise<Suggestion[]> => {
    try {
      setIsProcessing(true)
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions')
      }

      const data = await response.json()
      return data.suggestions || []
    } catch (error) {
      console.error('AI suggestions error:', error)
      return []
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    categorizeExpense,
    getSuggestions,
    isProcessing
  }
}

// AI-powered category suggestion component
interface CategorySuggestionProps {
  description: string
  amount: number
  onCategorySelect: (category: string) => void
}

export function CategorySuggestion({ description, amount, onCategorySelect }: CategorySuggestionProps) {
  const [suggestion, setSuggestion] = useState<CategoryResult | null>(null)
  const { categorizeExpense, isProcessing } = useAIIntegration()

  const handleGetSuggestion = async () => {
    const result = await categorizeExpense(description, amount)
    if (result) {
      setSuggestion(result)
    }
  }

  if (!description.trim() || !amount) {
    return null
  }

  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-blue-900">🤖 AI Category Suggestion</h4>
        <button
          onClick={handleGetSuggestion}
          disabled={isProcessing}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isProcessing ? 'Analyzing...' : 'Get Suggestion'}
        </button>
      </div>

      {suggestion && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{suggestion.category}</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">
                {Math.round(suggestion.confidence * 100)}% confident
              </span>
              <button
                onClick={() => onCategorySelect(suggestion.category)}
                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Use This
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
          {suggestion.suggestions && suggestion.suggestions.length > 0 && (
            <div className="text-xs text-gray-500">
              <p>💡 Suggestions:</p>
              <ul className="list-disc list-inside ml-2">
                {suggestion.suggestions.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// AI insights widget for dashboard
export function AIInsights() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const { getSuggestions, isProcessing } = useAIIntegration()

  const loadSuggestions = async () => {
    const insights = await getSuggestions('dashboard')
    setSuggestions(insights)
  }

  const handleSuggestionAction = (action: string) => {
    // This would implement the actual actions
    console.log('AI suggestion action:', action)
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-purple-900 flex items-center">
          🧠 AI Insights
        </h3>
        <button
          onClick={() => {
            setIsExpanded(!isExpanded)
            if (!isExpanded && suggestions.length === 0) {
              loadSuggestions()
            }
          }}
          className="text-sm px-3 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600"
        >
          {isExpanded ? 'Hide' : 'Show Insights'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {isProcessing ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <p className="mt-2 text-sm text-purple-600">Analyzing your data...</p>
            </div>
          ) : (
            <>
              {suggestions.length > 0 ? (
                suggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      suggestion.priority === 'high'
                        ? 'bg-red-50 border-red-400'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-green-50 border-green-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.message}</p>
                      </div>
                      <button
                        onClick={() => handleSuggestionAction(suggestion.action)}
                        className="ml-3 text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Act
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No insights available yet.</p>
                  <p className="text-xs mt-1">Add some expenses and todos to get personalized suggestions!</p>
                </div>
              )}

              <button
                onClick={loadSuggestions}
                className="w-full text-sm py-2 text-purple-600 hover:text-purple-800"
              >
                🔄 Refresh Insights
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}