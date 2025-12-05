'use client'

import { BudgetDashboard } from '@/components/budget'
import Navigation from '@/components/Navigation'
import MobileNavigation from '@/components/MobileNavigation'

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Mobile Bottom Padding */}
        <div className="h-20 lg:hidden" />
      </main>

      <MobileNavigation />
    </div>
  )
}
