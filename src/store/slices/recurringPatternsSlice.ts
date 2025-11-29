import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RecurringSuggestion } from '@/utils/recurrenceDetection'

interface RecurringPatternsState {
  suggestions: RecurringSuggestion[]
  lastDetectionRun: string | null
  migrationCompleted: boolean
}

const initialState: RecurringPatternsState = {
  suggestions: [],
  lastDetectionRun: null,
  migrationCompleted: false
}

export const recurringPatternsSlice = createSlice({
  name: 'recurringPatterns',
  initialState,
  reducers: {
    // Set detected suggestions (merge with existing, don't duplicate)
    setSuggestions: (state, action: PayloadAction<RecurringSuggestion[]>) => {
      const existingKeys = new Set(
        state.suggestions
          .filter(s => s.status !== 'suggested') // Keep accepted/ignored/migrated
          .map(s => s.normalizedKey)
      )
      
      // Keep non-suggested items and add new suggestions
      const preserved = state.suggestions.filter(s => s.status !== 'suggested')
      const newSuggestions = action.payload.filter(s => !existingKeys.has(s.normalizedKey))
      
      state.suggestions = [...preserved, ...newSuggestions]
      state.lastDetectionRun = new Date().toISOString()
    },
    
    // Accept a suggestion (user confirms it's recurring)
    acceptSuggestion: (state, action: PayloadAction<string>) => {
      const suggestion = state.suggestions.find(s => s.id === action.payload)
      if (suggestion) {
        suggestion.status = 'accepted'
      }
    },
    
    // Ignore a suggestion (user says it's not recurring)
    ignoreSuggestion: (state, action: PayloadAction<string>) => {
      const suggestion = state.suggestions.find(s => s.id === action.payload)
      if (suggestion) {
        suggestion.status = 'ignored'
      }
    },
    
    // Add migrated templates
    addMigratedSuggestions: (state, action: PayloadAction<RecurringSuggestion[]>) => {
      const existingKeys = new Set(state.suggestions.map(s => s.normalizedKey))
      const newMigrated = action.payload.filter(s => !existingKeys.has(s.normalizedKey))
      state.suggestions = [...state.suggestions, ...newMigrated]
    },
    
    // Mark migration as complete
    setMigrationCompleted: (state) => {
      state.migrationCompleted = true
    },
    
    // Update next expected date after user creates expense from pattern
    updateNextExpected: (state, action: PayloadAction<{ id: string; nextExpected: string; lastDate: string }>) => {
      const suggestion = state.suggestions.find(s => s.id === action.payload.id)
      if (suggestion) {
        suggestion.nextExpected = action.payload.nextExpected
        suggestion.lastDate = action.payload.lastDate
        suggestion.occurrences += 1
      }
    },
    
    // Remove a pattern entirely
    removeSuggestion: (state, action: PayloadAction<string>) => {
      state.suggestions = state.suggestions.filter(s => s.id !== action.payload)
    },
    
    // Clear all ignored (for fresh detection)
    clearIgnored: (state) => {
      state.suggestions = state.suggestions.filter(s => s.status !== 'ignored')
    },
    
    // Bulk import (for data restore)
    bulkImportPatterns: (state, action: PayloadAction<RecurringSuggestion[]>) => {
      state.suggestions = action.payload
    },
    
    // Clear all patterns
    clearPatterns: (state) => {
      state.suggestions = []
      state.migrationCompleted = false
    }
  }
})

export const {
  setSuggestions,
  acceptSuggestion,
  ignoreSuggestion,
  addMigratedSuggestions,
  setMigrationCompleted,
  updateNextExpected,
  removeSuggestion,
  clearIgnored,
  bulkImportPatterns,
  clearPatterns
} = recurringPatternsSlice.actions

// Selectors
export const selectAllSuggestions = (state: { recurringPatterns: RecurringPatternsState }) =>
  state.recurringPatterns.suggestions

export const selectPendingSuggestions = (state: { recurringPatterns: RecurringPatternsState }) =>
  state.recurringPatterns.suggestions.filter(s => s.status === 'suggested')

export const selectAcceptedPatterns = (state: { recurringPatterns: RecurringPatternsState }) =>
  state.recurringPatterns.suggestions.filter(s => s.status === 'accepted' || s.status === 'migrated')

export const selectIgnoredPatterns = (state: { recurringPatterns: RecurringPatternsState }) =>
  state.recurringPatterns.suggestions.filter(s => s.status === 'ignored')

export const selectMigrationCompleted = (state: { recurringPatterns: RecurringPatternsState }) =>
  state.recurringPatterns.migrationCompleted

export const selectLastDetectionRun = (state: { recurringPatterns: RecurringPatternsState }) =>
  state.recurringPatterns.lastDetectionRun

export default recurringPatternsSlice.reducer
