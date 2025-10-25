import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type GoalIntent = 'future-expense' | 'savings' | 'investment'

export interface Goal {
  id: string
  title: string
  description?: string
  category: 'emergency-fund' | 'debt-reduction' | 'travel' | 'purchase' | 'investment' | 'education' | 'health' | 'other'
  targetAmount: number
  currentAmount: number
  currency: string
  targetDate?: string
  createdAt: string
  updatedAt: string
  intent?: GoalIntent
  linkedIncomeIds?: string[]
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  aiAnalysis?: {
    feasibility: string
    suggestions: string[]
    monthlyRequired: number
    timeframe: string
    confidence: number
  }
  milestones?: {
    id: string
    title: string
    amount: number
    completed: boolean
    completedAt?: string
  }[]
}

export interface GoalsState {
  goals: Goal[]
  loading: boolean
  error: string | null
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
}

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    addGoal: (state, action: PayloadAction<Goal>) => {
      const goal: Goal = {
        ...action.payload,
        intent: action.payload.intent ?? 'future-expense',
        linkedIncomeIds: action.payload.linkedIncomeIds ?? [],
      }
      state.goals.unshift(goal)
    },
    updateGoal: (state, action: PayloadAction<{ id: string; updates: Partial<Goal> }>) => {
      const { id, updates } = action.payload
      const goalIndex = state.goals.findIndex(goal => goal.id === id)
      
      if (goalIndex !== -1) {
        state.goals[goalIndex] = { 
          ...state.goals[goalIndex], 
          ...updates,
          intent: updates.intent ?? state.goals[goalIndex].intent ?? 'future-expense',
          linkedIncomeIds: updates.linkedIncomeIds ?? state.goals[goalIndex].linkedIncomeIds ?? [],
          updatedAt: new Date().toISOString()
        }
      }
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter(goal => goal.id !== action.payload)
    },
    addProgress: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const { id, amount } = action.payload
      const goal = state.goals.find(goal => goal.id === id)
      
      if (goal) {
        goal.currentAmount += amount
        goal.updatedAt = new Date().toISOString()
        
        // Auto-complete if target reached
        if (goal.currentAmount >= goal.targetAmount) {
          goal.status = 'completed'
        }
      }
    },
    setGoalStatus: (state, action: PayloadAction<{ id: string; status: Goal['status'] }>) => {
      const { id, status } = action.payload
      const goal = state.goals.find(goal => goal.id === id)
      
      if (goal) {
        goal.status = status
        goal.updatedAt = new Date().toISOString()
      }
    },
    updateAiAnalysis: (state, action: PayloadAction<{ id: string; analysis: Goal['aiAnalysis'] }>) => {
      const { id, analysis } = action.payload
      const goal = state.goals.find(goal => goal.id === id)
      
      if (goal) {
        goal.aiAnalysis = analysis
        goal.updatedAt = new Date().toISOString()
      }
    },
    addMilestone: (state, action: PayloadAction<{ goalId: string; milestone: { id: string; title: string; amount: number; completed: boolean; completedAt?: string } }>) => {
      const { goalId, milestone } = action.payload
      const goal = state.goals.find(goal => goal.id === goalId)
      
      if (goal) {
        if (!goal.milestones) goal.milestones = []
        goal.milestones.push(milestone)
        goal.updatedAt = new Date().toISOString()
      }
    },
    completeMilestone: (state, action: PayloadAction<{ goalId: string; milestoneId: string }>) => {
      const { goalId, milestoneId } = action.payload
      const goal = state.goals.find(goal => goal.id === goalId)
      
      if (goal && goal.milestones) {
        const milestone = goal.milestones.find(m => m.id === milestoneId)
        if (milestone) {
          milestone.completed = true
          milestone.completedAt = new Date().toISOString()
          goal.updatedAt = new Date().toISOString()
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearGoals: (state) => {
      state.goals = []
    },
  },
})

export const {
  addGoal,
  updateGoal,
  deleteGoal,
  addProgress,
  setGoalStatus,
  updateAiAnalysis,
  addMilestone,
  completeMilestone,
  setLoading,
  setError,
  clearGoals,
} = goalsSlice.actions

// Selectors
export const selectGoals = (state: { goals: GoalsState }) => state.goals.goals
export const selectGoalsLoading = (state: { goals: GoalsState }) => state.goals.loading
export const selectGoalsError = (state: { goals: GoalsState }) => state.goals.error

// Advanced selectors
export const selectActiveGoals = (state: { goals: GoalsState }) => {
  return state.goals.goals.filter(goal => goal.status === 'active')
}

export const selectCompletedGoals = (state: { goals: GoalsState }) => {
  return state.goals.goals.filter(goal => goal.status === 'completed')
}

export const selectGoalsByCategory = (state: { goals: GoalsState }, category: Goal['category']) => {
  return state.goals.goals.filter(goal => goal.category === category)
}

export const selectGoalsProgress = (state: { goals: GoalsState }) => {
  const goals = state.goals.goals
  const totalProgress = goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount), 0)
  const averageProgress = goals.length > 0 ? totalProgress / goals.length : 0
  
  return {
    totalGoals: goals.length,
    activeGoals: goals.filter(g => g.status === 'active').length,
    completedGoals: goals.filter(g => g.status === 'completed').length,
    averageProgress: Math.round(averageProgress * 100),
    totalSaved: goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
    totalTarget: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
  }
}

export default goalsSlice.reducer