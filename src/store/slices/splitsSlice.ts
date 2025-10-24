import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Split {
  id: string
  title: string
  totalAmount: number
  currency: string
  date: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'partially-paid' | 'completed' | 'cancelled'
  participants: {
    id: string
    name: string
    email?: string
    amount: number
    paid: boolean
    paidAt?: string
    notes?: string
  }[]
  expenses: {
    id: string
    description: string
    amount: number
    paidBy: string // participant id
    category?: string
    receipt?: string
  }[]
  notes?: string
  splitMethod: 'equal' | 'custom' | 'percentage'
}

interface SplitsState {
  splits: Split[]
  loading: boolean
  error: string | null
}

const initialState: SplitsState = {
  splits: [],
  loading: false,
  error: null,
}

const splitsSlice = createSlice({
  name: 'splits',
  initialState,
  reducers: {
    addSplit: (state, action: PayloadAction<Split>) => {
      state.splits.unshift(action.payload)
    },
    updateSplit: (state, action: PayloadAction<{ id: string; updates: Partial<Split> }>) => {
      const { id, updates } = action.payload
      const splitIndex = state.splits.findIndex(split => split.id === id)
      
      if (splitIndex !== -1) {
        state.splits[splitIndex] = { 
          ...state.splits[splitIndex], 
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    },
    deleteSplit: (state, action: PayloadAction<string>) => {
      state.splits = state.splits.filter(split => split.id !== action.payload)
    },
    addParticipant: (state, action: PayloadAction<{ splitId: string; participant: Split['participants'][0] }>) => {
      const { splitId, participant } = action.payload
      const split = state.splits.find(split => split.id === splitId)
      
      if (split) {
        split.participants.push(participant)
        split.updatedAt = new Date().toISOString()
      }
    },
    updateParticipant: (state, action: PayloadAction<{ splitId: string; participantId: string; updates: Partial<Split['participants'][0]> }>) => {
      const { splitId, participantId, updates } = action.payload
      const split = state.splits.find(split => split.id === splitId)
      
      if (split) {
        const participantIndex = split.participants.findIndex(p => p.id === participantId)
        if (participantIndex !== -1) {
          split.participants[participantIndex] = { ...split.participants[participantIndex], ...updates }
          split.updatedAt = new Date().toISOString()
          
          // Update split status based on payments
          const allPaid = split.participants.every(p => p.paid)
          const somePaid = split.participants.some(p => p.paid)
          
          if (allPaid) {
            split.status = 'completed'
          } else if (somePaid) {
            split.status = 'partially-paid'
          } else {
            split.status = 'pending'
          }
        }
      }
    },
    markParticipantPaid: (state, action: PayloadAction<{ splitId: string; participantId: string }>) => {
      const { splitId, participantId } = action.payload
      const split = state.splits.find(split => split.id === splitId)
      
      if (split) {
        const participant = split.participants.find(p => p.id === participantId)
        if (participant) {
          participant.paid = true
          participant.paidAt = new Date().toISOString()
          split.updatedAt = new Date().toISOString()
          
          // Update split status
          const allPaid = split.participants.every(p => p.paid)
          split.status = allPaid ? 'completed' : 'partially-paid'
        }
      }
    },
    addExpenseToSplit: (state, action: PayloadAction<{ splitId: string; expense: Split['expenses'][0] }>) => {
      const { splitId, expense } = action.payload
      const split = state.splits.find(split => split.id === splitId)
      
      if (split) {
        split.expenses.push(expense)
        split.totalAmount = split.expenses.reduce((sum, exp) => sum + exp.amount, 0)
        split.updatedAt = new Date().toISOString()
      }
    },
    setSplitStatus: (state, action: PayloadAction<{ id: string; status: Split['status'] }>) => {
      const { id, status } = action.payload
      const split = state.splits.find(split => split.id === id)
      
      if (split) {
        split.status = status
        split.updatedAt = new Date().toISOString()
      }
    },
    bulkImportSplits: (state, action: PayloadAction<Split[]>) => {
      const newSplits = action.payload
      state.splits = [...newSplits, ...state.splits]
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearSplits: (state) => {
      state.splits = []
    },
  },
})

export const {
  addSplit,
  updateSplit,
  deleteSplit,
  addParticipant,
  updateParticipant,
  markParticipantPaid,
  addExpenseToSplit,
  setSplitStatus,
  bulkImportSplits,
  setLoading,
  setError,
  clearSplits,
} = splitsSlice.actions

// Selectors
export const selectSplits = (state: { splits: SplitsState }) => state.splits.splits
export const selectSplitsLoading = (state: { splits: SplitsState }) => state.splits.loading
export const selectSplitsError = (state: { splits: SplitsState }) => state.splits.error

// Advanced selectors
export const selectActiveSplits = (state: { splits: SplitsState }) => {
  return state.splits.splits.filter(split => split.status === 'pending' || split.status === 'partially-paid')
}

export const selectCompletedSplits = (state: { splits: SplitsState }) => {
  return state.splits.splits.filter(split => split.status === 'completed')
}

export const selectSplitsStats = (state: { splits: SplitsState }) => {
  const splits = state.splits.splits
  return {
    total: splits.length,
    pending: splits.filter(s => s.status === 'pending').length,
    partiallyPaid: splits.filter(s => s.status === 'partially-paid').length,
    completed: splits.filter(s => s.status === 'completed').length,
    totalAmount: splits.reduce((sum, split) => sum + split.totalAmount, 0),
    totalOwed: splits
      .filter(s => s.status !== 'completed')
      .reduce((sum, split) => sum + split.totalAmount, 0),
  }
}

export default splitsSlice.reducer