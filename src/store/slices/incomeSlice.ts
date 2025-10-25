import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Income {
  id: string
  amount: number
  description: string
  category: string
  subcategory?: string
  date: string
  currency: string
  createdAt: string
  isRecurring?: boolean
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  tags?: string[]
  notes?: string
  source?: string
}

interface IncomeState {
  incomes: Income[]
  totalEarned: number
  loading: boolean
  error: string | null
}

const initialState: IncomeState = {
  incomes: [],
  totalEarned: 0,
  loading: false,
  error: null,
}

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    addIncome: (state, action: PayloadAction<Income>) => {
      state.incomes.unshift(action.payload)
      state.totalEarned += action.payload.amount
    },
    updateIncome: (state, action: PayloadAction<{ id: string; updates: Partial<Income> }>) => {
      const { id, updates } = action.payload
      const incomeIndex = state.incomes.findIndex(income => income.id === id)
      
      if (incomeIndex !== -1) {
        const oldAmount = state.incomes[incomeIndex].amount
        state.incomes[incomeIndex] = { ...state.incomes[incomeIndex], ...updates }
        
        // Update total if amount changed
        if (updates.amount !== undefined) {
          state.totalEarned = state.totalEarned - oldAmount + updates.amount
        }
      }
    },
    deleteIncome: (state, action: PayloadAction<string>) => {
      const incomeIndex = state.incomes.findIndex(income => income.id === action.payload)
      
      if (incomeIndex !== -1) {
        state.totalEarned -= state.incomes[incomeIndex].amount
        state.incomes.splice(incomeIndex, 1)
      }
    },
    bulkImportIncomes: (state, action: PayloadAction<Income[]>) => {
      const newIncomes = action.payload
      state.incomes = [...newIncomes, ...state.incomes]
      state.totalEarned = state.incomes.reduce((sum, income) => sum + income.amount, 0)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearIncomes: (state) => {
      state.incomes = []
      state.totalEarned = 0
    },
  },
})

export const {
  addIncome,
  updateIncome,
  deleteIncome,
  bulkImportIncomes,
  setLoading,
  setError,
  clearIncomes,
} = incomeSlice.actions

// Selectors - Note: RootState will be imported from store/index.ts in components
export const selectIncomes = (state: { income: IncomeState }) => state.income.incomes
export const selectTotalEarned = (state: { income: IncomeState }) => state.income.totalEarned
export const selectIncomeLoading = (state: { income: IncomeState }) => state.income.loading
export const selectIncomeError = (state: { income: IncomeState }) => state.income.error

// Advanced selectors
export const selectIncomesByCategory = (state: { income: IncomeState }) => {
  const incomes = state.income.incomes
  return incomes.reduce((acc: Record<string, number>, income: Income) => {
    acc[income.category] = (acc[income.category] || 0) + income.amount
    return acc
  }, {} as Record<string, number>)
}

export const selectIncomesByMonth = (state: { income: IncomeState }) => {
  const incomes = state.income.incomes
  return incomes.reduce((acc: Record<string, number>, income: Income) => {
    const monthKey = income.date.substring(0, 7) // YYYY-MM
    acc[monthKey] = (acc[monthKey] || 0) + income.amount
    return acc
  }, {} as Record<string, number>)
}

export const selectRecentIncomes = (state: { income: IncomeState }, limit: number = 10) => {
  return state.income.incomes.slice(0, limit)
}

export default incomeSlice.reducer
