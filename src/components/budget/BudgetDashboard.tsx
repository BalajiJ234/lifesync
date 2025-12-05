'use client'

import { useState, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { 
  setSelectedMonth,
  createLocalBudgetPlan,
  logLocalTransaction,
  BucketType
} from '@/store/slices/budgetSlice'
import { addExpense } from '@/store/slices/expensesSlice'
import { selectIncomes } from '@/store/slices/incomeSlice'
import BudgetBucketCard from './BudgetBucketCard'
import TransactionForm from './TransactionForm'
import BudgetInsightsPanel from './BudgetInsightsPanel'

export default function BudgetDashboard() {
  const dispatch = useAppDispatch()
  const { selectedMonth, currentPlan, allPlans, rules, insights, loading } = useAppSelector((state) => state.budget)
  const { settings } = useAppSelector((state) => state.settings)
  const incomeEntries = useAppSelector(selectIncomes)
  
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [selectedBucket, setSelectedBucket] = useState<BucketType>('NEEDS')
  const [isCreating, setIsCreating] = useState(false)

  // Get currency from settings
  const baseCurrency = settings?.currency || 'USD'

  // Calculate total monthly income from income entries for the SELECTED month
  const totalMonthlyIncome = useMemo(() => {
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)
    
    return incomeEntries
      .filter(income => {
        const incomeDate = new Date(income.eventDate)
        return incomeDate.getMonth() === selectedMonthNum - 1 && incomeDate.getFullYear() === selectedYear
      })
      .reduce((sum, income) => sum + income.amount, 0)
  }, [incomeEntries, selectedMonth])

  // Find plan for selected month from allPlans
  const activePlan = useMemo(() => {
    return allPlans.find(p => p.month === selectedMonth) || currentPlan
  }, [allPlans, selectedMonth, currentPlan])

  // Calculate month navigation
  const { prevMonth, nextMonth, displayMonth } = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const current = new Date(year, month - 1)
    
    const prev = new Date(year, month - 2)
    const next = new Date(year, month)
    
    return {
      prevMonth: `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`,
      nextMonth: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`,
      displayMonth: current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }, [selectedMonth])

  const handleCreatePlan = () => {
    setIsCreating(true)
    
    // Use total monthly income, or a default if no income entries
    const incomeToUse = totalMonthlyIncome > 0 ? totalMonthlyIncome : 5000
    
    dispatch(createLocalBudgetPlan({
      month: selectedMonth,
      baseCurrency,
      totalIncome: incomeToUse,
    }))
    
    setIsCreating(false)
  }

  const handleLogTransaction = (transaction: {
    bucket: BucketType
    category: string
    amount: number
    currency: string
    description?: string
  }) => {
    // Log to budget
    dispatch(logLocalTransaction(transaction))

    // Sync with Expenses slice (only for NEEDS and WANTS - actual spending)
    if (transaction.bucket === 'NEEDS' || transaction.bucket === 'WANTS') {
      const newExpense = {
        id: `budget-${Date.now()}`,
        amount: transaction.amount,
        description: transaction.description || transaction.category,
        category: transaction.category,
        date: new Date().toISOString(),
        currency: transaction.currency,
        isRecurring: false,
        source: 'budget' as const,
      }
      dispatch(addExpense(newExpense))
    }

    setShowTransactionForm(false)
  }

  const handleMonthChange = (month: string) => {
    dispatch(setSelectedMonth(month))
  }

  const handleBucketClick = (bucket: BucketType) => {
    setSelectedBucket(bucket)
    setShowTransactionForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleMonthChange(prevMonth)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {displayMonth}
          </h2>
          <button
            onClick={() => handleMonthChange(nextMonth)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {!activePlan && (
            <button
              onClick={handleCreatePlan}
              disabled={isCreating}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Budget Plan
                </>
              )}
            </button>
          )}
          {activePlan && (
            <button
              onClick={() => setShowTransactionForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Log Transaction
            </button>
          )}
        </div>
      </div>

      {/* No Plan State */}
      {!activePlan && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Budget Plan for {displayMonth}</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Create a budget plan to start tracking your spending with the {rules.buckets.needs}/{rules.buckets.wants}/{rules.buckets.savings}/{rules.buckets.debt} rule.
          </p>
          {totalMonthlyIncome > 0 ? (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Based on your income entries: {baseCurrency} {totalMonthlyIncome.toLocaleString()}
            </p>
          ) : (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              No income entries found. Add income first or we&apos;ll use a default of {baseCurrency} 5,000.
            </p>
          )}
          <button
            onClick={handleCreatePlan}
            disabled={isCreating}
            className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Budget Buckets Grid */}
      {activePlan && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BudgetBucketCard 
              bucket={activePlan.buckets.NEEDS} 
              onClick={() => handleBucketClick('NEEDS')}
            />
            <BudgetBucketCard 
              bucket={activePlan.buckets.WANTS} 
              onClick={() => handleBucketClick('WANTS')}
            />
            <BudgetBucketCard 
              bucket={activePlan.buckets.SAVINGS} 
              onClick={() => handleBucketClick('SAVINGS')}
            />
            <BudgetBucketCard 
              bucket={activePlan.buckets.DEBT} 
              onClick={() => handleBucketClick('DEBT')}
            />
          </div>

          {/* Income Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income Summary</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Monthly Income</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activePlan.baseCurrency} {activePlan.totalIncome.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Insights Panel */}
          {insights.length > 0 && (
            <BudgetInsightsPanel insights={insights} />
          )}
        </>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          bucket={selectedBucket}
          plan={activePlan}
          onSubmit={handleLogTransaction}
          onClose={() => setShowTransactionForm(false)}
          isLoading={false}
        />
      )}
    </div>
  )
}
