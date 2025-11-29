import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CategoryBreakdown {
  category: string
  spent: number
  recommended: number
}

export interface MonthlyAdvice {
  monthlyIncome: number
  fixedExpenses: number
  variableExpenses: number
  familyRemittance: number
  potentialSavings: number
  savingsRate: number
  recommendations: string[]
  categoryBreakdown: CategoryBreakdown[]
}

interface AdvisorState {
  currentAdvice: MonthlyAdvice | null
  lastCalculated: string | null
}

const initialState: AdvisorState = {
  currentAdvice: null,
  lastCalculated: null,
}

export const advisorSlice = createSlice({
  name: 'advisor',
  initialState,
  reducers: {
    setAdvice: (state, action: PayloadAction<MonthlyAdvice>) => {
      state.currentAdvice = action.payload
      state.lastCalculated = new Date().toISOString()
    },
    clearAdvice: (state) => {
      state.currentAdvice = null
      state.lastCalculated = null
    },
  },
})

export const { setAdvice, clearAdvice } = advisorSlice.actions

// Selectors
export const selectCurrentAdvice = (state: { advisor: AdvisorState }) => state.advisor.currentAdvice
export const selectLastCalculated = (state: { advisor: AdvisorState }) => state.advisor.lastCalculated

export default advisorSlice.reducer
