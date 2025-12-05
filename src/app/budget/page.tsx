'use client'

import { BudgetDashboard } from '@/components/budget'

export default function BudgetPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Budget Planner
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your monthly budget with the 50/30/20 rule. Track spending across Needs, Wants, Savings, and Debt.
        </p>
      </div>

      {/* Budget Dashboard */}
      <BudgetDashboard />
    </div>
  )
}
