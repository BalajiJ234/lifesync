import type { Expense } from '@/store/slices/expensesSlice'
import type { Income } from '@/store/slices/incomeSlice'

export interface DailyBudgetData {
  dailyBudget: number
  spent: number
  remaining: number
  percentUsed: number
  currency: string
}

export const calculateDailyBudget = (
  incomes: Income[],
  expenses: Expense[],
  settings: { currency: string; savingsRate?: number }
): DailyBudgetData => {
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Calculate monthly recurring income
  const monthlyIncome = incomes
    .filter(i => i.recurrence !== 'one-time' && i.status === 'received')
    .reduce((sum, i) => sum + i.amount, 0)
  
  // Calculate fixed expenses (recurring templates)
  const fixedMonthlyExpenses = expenses
    .filter(e => e.isRecurring)
    .reduce((sum, e) => sum + e.amount, 0)
  
  // Calculate savings target (default 20%)
  const savingsTarget = monthlyIncome * (settings.savingsRate || 0.20)
  
  // Discretionary budget = Income - Fixed Expenses - Savings
  const discretionaryBudget = monthlyIncome - fixedMonthlyExpenses - savingsTarget
  
  // Daily budget
  const dailyBudget = discretionaryBudget > 0 ? discretionaryBudget / daysInMonth : 0
  
  // Today's expenses (non-recurring only)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  
  const todaySpent = expenses
    .filter(e => {
      const expenseDate = new Date(e.date)
      return expenseDate >= todayStart && expenseDate <= todayEnd && !e.isRecurring
    })
    .reduce((sum, e) => sum + e.amount, 0)
  
  const remaining = dailyBudget - todaySpent
  const percentUsed = dailyBudget > 0 ? (todaySpent / dailyBudget) * 100 : 0
  
  return {
    dailyBudget,
    spent: todaySpent,
    remaining,
    percentUsed: Math.min(percentUsed, 100),
    currency: settings.currency
  }
}
