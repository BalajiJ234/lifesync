import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// ==================== Types ====================

export type Currency = string
export type BucketType = 'NEEDS' | 'WANTS' | 'SAVINGS' | 'DEBT'
export type BucketStatus = 'UNDER' | 'NEAR_LIMIT' | 'OVER'

export interface Money {
  amount: number
  currency: Currency
  baseAmount: number
  fxRate: number
  fxTimestamp: string
}

export interface CategoryBudget {
  name: string
  planned: number
  spent: number
  remaining: number
  status: BucketStatus
}

export interface SavingsAllocation {
  localEmergencyFund: number
  homeCountryInvestments: number
  globalInvestments: number
}

export interface DebtAllocation {
  baseCurrencyDebt: number
  homeCountryDebt: number
  otherDebt: number
}

export interface BudgetBucket {
  type: BucketType
  planned: Money
  spent: Money
  remaining: Money
  status: BucketStatus
  categories: Record<string, CategoryBudget>
  savingsAllocation?: SavingsAllocation
  debtAllocation?: DebtAllocation
}

export interface BudgetInsight {
  id: string
  type: 'warning' | 'alert' | 'info' | 'success'
  message: string
  bucket?: BucketType
  category?: string
  createdAt: string
}

export interface DebtSnapshot {
  debtId: string
  name: string
  outstandingPrincipal: Money
  allocatedPayment: Money
  isMinimumPayment: boolean
}

export interface GoalSnapshot {
  goalId: string
  name: string
  targetAmount: Money
  currentAmount: Money
  monthlyContribution: Money
  progressPercent: number
}

export interface MonthlyBudgetPlan {
  id: string
  userId: string
  month: string
  baseCurrency: Currency
  totalIncome: Money
  buckets: {
    NEEDS: BudgetBucket
    WANTS: BudgetBucket
    SAVINGS: BudgetBucket
    DEBT: BudgetBucket
  }
  debtsSnapshot: DebtSnapshot[]
  goalsSnapshot: GoalSnapshot[]
  insights: BudgetInsight[]
  createdAt: string
  updatedAt: string
}

export interface IncomeSource {
  id: string
  name: string
  type: 'salary' | 'freelance' | 'passive'
  amount: number
  currency: Currency
  recurrence: 'monthly' | 'weekly' | 'one-time'
  isActive: boolean
}

export interface Debt {
  id: string
  name: string
  currency: Currency
  outstandingPrincipal: number
  interestRateAnnual: number
  minMonthlyPayment: number
  country: string
  priority?: number
}

// Budget-specific goal (simplified version for budget planning)
// Full Goal management is in goalsSlice.ts
export interface BudgetGoal {
  id: string
  name: string
  type: 'emergency' | 'marriage' | 'retirement' | 'education' | 'large_purchase' | 'other'
  targetAmount: number
  currentAmount: number
  targetDate: string
  country: string
  currency: Currency
}

export interface BudgetRuleSet {
  strategyType: 'percentage' | 'zero-based' | 'custom'
  buckets: {
    needs: number
    wants: number
    savings: number
    debt: number
  }
  minSavingsPercent: number
  minDebtPercent: number
  debtStrategy: 'snowball' | 'avalanche'
}

// ==================== State ====================

interface BudgetState {
  currentPlan: MonthlyBudgetPlan | null
  allPlans: MonthlyBudgetPlan[]
  incomes: IncomeSource[]
  debts: Debt[]
  budgetGoals: BudgetGoal[]
  rules: BudgetRuleSet
  insights: BudgetInsight[]
  loading: boolean
  error: string | null
  selectedMonth: string // YYYY-MM format
}

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const initialState: BudgetState = {
  currentPlan: null,
  allPlans: [],
  incomes: [],
  debts: [],
  budgetGoals: [],
  rules: {
    strategyType: 'percentage',
    buckets: {
      needs: 50,
      wants: 20,
      savings: 15,
      debt: 15,
    },
    minSavingsPercent: 10,
    minDebtPercent: 5,
    debtStrategy: 'avalanche',
  },
  insights: [],
  loading: false,
  error: null,
  selectedMonth: getCurrentMonth(),
}

// ==================== Slice ====================

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setCurrentPlan: (state, action: PayloadAction<MonthlyBudgetPlan>) => {
      state.currentPlan = action.payload
      state.insights = action.payload.insights
      // Add to allPlans if not exists
      const existingIndex = state.allPlans.findIndex(p => p.id === action.payload.id)
      if (existingIndex === -1) {
        state.allPlans.push(action.payload)
      } else {
        state.allPlans[existingIndex] = action.payload
      }
    },
    updatePlanFromTransaction: (state, action: PayloadAction<{ plan: MonthlyBudgetPlan; insights: BudgetInsight[] }>) => {
      state.currentPlan = action.payload.plan
      state.insights = [...state.insights, ...action.payload.insights]
      // Update in allPlans
      const existingIndex = state.allPlans.findIndex(p => p.id === action.payload.plan.id)
      if (existingIndex !== -1) {
        state.allPlans[existingIndex] = action.payload.plan
      }
    },
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload
    },
    
    // Income management
    addIncome: (state, action: PayloadAction<IncomeSource>) => {
      state.incomes.push(action.payload)
    },
    updateIncome: (state, action: PayloadAction<{ id: string; updates: Partial<IncomeSource> }>) => {
      const index = state.incomes.findIndex(i => i.id === action.payload.id)
      if (index !== -1) {
        state.incomes[index] = { ...state.incomes[index], ...action.payload.updates }
      }
    },
    deleteIncome: (state, action: PayloadAction<string>) => {
      state.incomes = state.incomes.filter(i => i.id !== action.payload)
    },
    
    // Debt management
    addDebt: (state, action: PayloadAction<Debt>) => {
      state.debts.push(action.payload)
    },
    updateDebt: (state, action: PayloadAction<{ id: string; updates: Partial<Debt> }>) => {
      const index = state.debts.findIndex(d => d.id === action.payload.id)
      if (index !== -1) {
        state.debts[index] = { ...state.debts[index], ...action.payload.updates }
      }
    },
    deleteDebt: (state, action: PayloadAction<string>) => {
      state.debts = state.debts.filter(d => d.id !== action.payload)
    },
    
    // Goal management (budget-specific goals)
    addBudgetGoal: (state, action: PayloadAction<BudgetGoal>) => {
      state.budgetGoals.push(action.payload)
    },
    updateBudgetGoal: (state, action: PayloadAction<{ id: string; updates: Partial<BudgetGoal> }>) => {
      const index = state.budgetGoals.findIndex(g => g.id === action.payload.id)
      if (index !== -1) {
        state.budgetGoals[index] = { ...state.budgetGoals[index], ...action.payload.updates }
      }
    },
    deleteBudgetGoal: (state, action: PayloadAction<string>) => {
      state.budgetGoals = state.budgetGoals.filter(g => g.id !== action.payload)
    },
    
    // Rules management
    updateRules: (state, action: PayloadAction<Partial<BudgetRuleSet>>) => {
      state.rules = { ...state.rules, ...action.payload }
    },
    
    // Insights
    addInsight: (state, action: PayloadAction<BudgetInsight>) => {
      state.insights.push(action.payload)
    },
    clearInsights: (state) => {
      state.insights = []
    },
    dismissInsight: (state, action: PayloadAction<string>) => {
      state.insights = state.insights.filter(i => i.id !== action.payload)
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // Clear all budget data
    clearBudget: (state) => {
      state.currentPlan = null
      state.allPlans = []
      state.insights = []
    },
  },
})

export const {
  setCurrentPlan,
  updatePlanFromTransaction,
  setSelectedMonth,
  addIncome,
  updateIncome,
  deleteIncome,
  addDebt,
  updateDebt,
  deleteDebt,
  addBudgetGoal,
  updateBudgetGoal,
  deleteBudgetGoal,
  updateRules,
  addInsight,
  clearInsights,
  dismissInsight,
  setLoading,
  setError,
  clearBudget,
} = budgetSlice.actions

export default budgetSlice.reducer
